using System.Runtime.Serialization;

namespace QuickCollab.Server.Models
{
    [DataContract]
    public class AuthenticationResponse
    {
        [DataMember]
        public string Token { get; set; }

        [DataMember]
        public DateTime Expiration { get; set; }
    }
}
