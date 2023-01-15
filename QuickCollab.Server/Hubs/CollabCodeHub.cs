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
    public class CollabCodeHub : CollabHub
    {
        public CollabCodeHub(IMemoryCache memoryCache, QuickCollabDbContext dbContext) 
            : base(memoryCache, dbContext)
        {

        }

        public async Task SetSelection(string roomId, int start, int end)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Code.SetSelection", user, start, end);
            }
        }

        public async Task ResetSelection(string roomId)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Code.ResetSelection", user);
            }
        }

        public async Task SetCursor(string roomId, int startIndex)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Code.SetCursor", user, startIndex);
            }
        }

        public async Task ResetCursor(string roomId)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Code.ResetCursor", user);
            }

        }

        public async Task AddContent(string roomId, int startIndex, string content)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Code.AddContent", user, startIndex, content);
            }
        }

        public async Task RemoveContent(string roomId, int startIndex, int length)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, user))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Code.RemoveContent", user, startIndex, length);
            }
        }

        
    }
}
