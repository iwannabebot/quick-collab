using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace QuickCollab.Server.Models
{
    [DataContract]
    public class RoomGetRequest
    {
        [DataMember]
        [Required]
        public string RoomId { get; set; }

        [DataMember]
        [Required]
        public string Password { get; set; }
    }
}
