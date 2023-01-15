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
    public class CollabWhiteboardHub : CollabHub
    {
        public CollabWhiteboardHub(IMemoryCache memoryCache, QuickCollabDbContext dbContext) 
            : base(memoryCache, dbContext)
        {

        }

        public async Task Draw(string roomId, string password, int x, int y, string color)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Board.Draw", user, x, y, color);
            }
        }

        public async Task Erase(string roomId, string password, int x, int y, int radius)
        {
            string user = Context.User?.FindFirst(ClaimTypes.Email)?.Value!;
            if (IsValidRoomForUser(roomId, password))
            {
                await Clients.Group(roomId).SendAsync("CollabHub.Board.Erase", user, x, y, radius);
            }
        }
    }
}
