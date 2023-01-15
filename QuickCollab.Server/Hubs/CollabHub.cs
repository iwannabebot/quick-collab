using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using QuickCollab.Server.Data;
using System.Diagnostics;
using System.Security.Claims;

namespace QuickCollab.Server.Hubs
{
    public abstract class CollabHub : Hub
    {
        protected readonly IMemoryCache _memoryCache;
        protected readonly QuickCollabDbContext _dbContext;

        public CollabHub(IMemoryCache memoryCache, QuickCollabDbContext dbContext)
        {
            _dbContext = dbContext;
            _memoryCache = memoryCache;
        }

        public async Task JoinRoom(string roomId)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                await Clients.Group(roomId).SendAsync("CollabHub.JoinRoom", user, roomId);
            }
        }

        public async Task LeaveRoom(string roomId)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.LeaveRoom", user, roomId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            }
        }

        protected bool IsValidRoomForUser(string roomId, string user)
        {
            if (!_memoryCache.TryGetValue<bool>($"{Models.Cache.Keys.RoomUser}:{roomId}:{user}", out bool collabRoomValid))
            {
                Clients.Caller.SendAsync("CollabHub.UnauthorizedRoom");
                return false;
            }
            else if(collabRoomValid)
            {
                _memoryCache.Set($"{Models.Cache.Keys.RoomActive}:{roomId}", DateTime.UtcNow);
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
