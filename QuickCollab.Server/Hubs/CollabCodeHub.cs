using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using QuickCollab.Server.Data;
using QuickCollab.Server.Data.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;
using System.Xml.Linq;

namespace QuickCollab.Server.Hubs
{
    [Authorize]
    public class CollabCodeHub : Hub
    {
        private readonly IMemoryCache _memoryCache;
        private readonly QuickCollabDbContext _dbContext;

        public CollabCodeHub(IMemoryCache memoryCache, QuickCollabDbContext dbContext) 
        {
            _dbContext = dbContext;
            _memoryCache = memoryCache;
        }

        public async Task JoinRoom(string roomId, string password)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                await Clients.Group(roomId).SendAsync("CollabCodeJoinRoom", user, roomId);
            }
        }

        public async Task LeaveRoom(string roomId, string password)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeLeaveRoom", user, roomId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            }
        }

        public async Task SetSelection(string roomId, string password, int start, int end)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeSetSelection", user, roomId, start, end);
            }
        }

        public async Task ResetSelection(string roomId, string password)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeResetSelection", user, roomId);
            }
        }

        public async Task SetCursor(string roomId, string password, int startIndex)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeSetCursor", user, roomId, startIndex);
            }
        }

        public async Task ResetCursor(string roomId, string password)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeResetCursor", user, roomId);
            }

        }

        public async Task AddContent(string roomId, string password, int startIndex, string content)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeAddContent", user, roomId, startIndex, content);
            }
        }

        public async Task RemoveContent(string roomId, string password, int startIndex, int length)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomPassword(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabCodeRemoveContent", user, roomId, startIndex, length);
            }
        }

        private bool IsValidRoomPassword(string roomId, string password)
        {
            if (!_memoryCache.TryGetValue<string>($"{Models.Cache.Keys.RoomPass}:{roomId}", out string? collabRoomPass))
            {
                var dbCollabRoom = _dbContext.CollabRooms.FirstOrDefault(room => room.RoomId == roomId);
                if (dbCollabRoom != null && dbCollabRoom.IsActive)
                {
                    collabRoomPass = dbCollabRoom.HashedPassword;
                }
            }
            if (password.GetHashedValue() == collabRoomPass)
            {
                _memoryCache.Set($"{Models.Cache.Keys.RoomActive}:{roomId}", DateTime.UtcNow);
                return true;
            }
            return false;
        }
    }
}
