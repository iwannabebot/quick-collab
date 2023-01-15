using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace QuickCollab.Server.Models
{
    [DataContract]
    public class RoomCreateRequest
    {
        [DataMember]
        [Required]
        public string ToolName { get; set; }

        [DataMember]
        [Required]
        public string Password { get; set; }
    }
}
