using Microsoft.AspNetCore.Identity;

namespace QuickCollab.Server.Data.Models
{
    public class QuickCollabUser : IdentityUser
    {
        public string GravatarPhoto { get; set; }

        public string DisplayName { get; set; }
    }
}
