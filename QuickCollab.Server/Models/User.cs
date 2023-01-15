using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace QuickCollab.Server.Models
{
    [DataContract]
    public class User
    {
        [Required]
        [DataMember]
        public string Name { get; set; }

        [Required]
        [DataMember]
        public string Password { get; set; }

        [Required]
        [DataMember]
        public string Email { get; set; }

        [DataMember]
        public string? Photo { get; set; }
    }
}
