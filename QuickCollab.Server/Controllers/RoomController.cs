using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using QuickCollab.Server.Data;
using QuickCollab.Server.Hubs;
using QuickCollab.Server.Models;
using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;

namespace QuickCollab.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RoomController : ControllerBase
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<RoomController> _logger;
        private readonly QuickCollabDbContext _collabContext;
        private readonly IHubContext<CollabCodeHub> _codeHubContext;

        public RoomController(QuickCollabDbContext collabContext, IHubContext<CollabCodeHub> codeHubContext,
            IMemoryCache memoryCache, ILogger<RoomController> logger)
        {
            _memoryCache = memoryCache;
            _logger = logger;
            _collabContext = collabContext;
            _codeHubContext = codeHubContext;
        }

        [Authorize]
        [HttpGet("{roomId}")]
        public async Task<ActionResult<Room>> GetRoom(string roomId)
        {
            var room = await _collabContext.CollabRooms.FirstOrDefaultAsync(room => room.RoomId== roomId);
            
            if (room == null)
            {
                return NotFound();
            }

            return new Room
            {
                RoomId= room.RoomId,
                IsActive= room.IsActive,
                ToolName = room.ToolName,
            };
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Room>> PostRoom([FromBody] RoomCreateRequest room)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newRoom = new Data.Models.CollabRoom
            {
                CreatedBy = User.Identity.Name,
                CreatedOn = DateTime.UtcNow,
                HashedPassword = room.Password.GetHashedValue(),
                IsActive = true,
                ToolName = room.ToolName,
                RoomId = Guid.NewGuid().ToString().Trim('{', '}').Replace("-", ""),
                LastActive = DateTime.UtcNow
            };
            
            await _collabContext.CollabRooms.AddAsync(newRoom);
            await _collabContext.SaveChangesAsync();
            _memoryCache.Set($"{Models.Cache.Keys.RoomPass}:{newRoom.RoomId}", newRoom.HashedPassword);
            _memoryCache.Set($"{Models.Cache.Keys.RoomActive}:{newRoom.RoomId}", DateTime.UtcNow);
            return Created("", new Room
            {
                IsActive= newRoom.IsActive,
                RoomId = newRoom.RoomId,
                ToolName = room.ToolName
            });
        }
    }
}
