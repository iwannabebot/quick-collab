using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace QuickCollab.Server.Models
{
    [DataContract]
    public class Room
    {
        [DataMember]
        [Required]
        public string RoomId { get; set; }

        [DataMember]
        [Required]
        public string ToolName { get; set; }

        [DataMember]
        [Required]
        public bool IsActive { get; set; }
    }
}
