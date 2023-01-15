using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuickCollab.Server.Data.Models
{
    public class CollabRoom
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CollabRoomId { get; set; }

        public string RoomId { get; set; }
        public string ToolName { get; set; }
        public string HashedPassword { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime LastActive { get; set; }
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
