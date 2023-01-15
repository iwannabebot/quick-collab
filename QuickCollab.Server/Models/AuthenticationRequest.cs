using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace QuickCollab.Server.Models
{
    [DataContract]
    public class AuthenticationRequest
    {
        [Required]
        [DataMember]
        public string Email { get; set; }

        [Required]
        [DataMember]
        public string Password { get; set; }
    }
}
