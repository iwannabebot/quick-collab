using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using QuickCollab.Server.Data.Models;
using QuickCollab.Server.Models;
using QuickCollab.Server.Services;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace QuickCollab.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<QuickCollabUser> _userManager;
        private readonly JwtService _jwtService;

        public UsersController(
            UserManager<QuickCollabUser> userManager,
            JwtService jwtService
        )
        {
            _userManager = userManager;
            _jwtService = jwtService;
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<User>> GetUser(string email)
        {
            QuickCollabUser user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return NotFound();
            }

            return new User
            {
                Name = user.DisplayName,
                Email = user.Email,
                Photo = user.GravatarPhoto
            };
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userManager.CreateAsync(
                new QuickCollabUser() 
                { 
                    UserName = user.Email, 
                    DisplayName = user.Name, 
                    Email = user.Email, 
                    GravatarPhoto = HashEmailForGravatar(user.Email) 
                },
                user.Password
            );

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            user.Password = null;
            return CreatedAtAction("GetUser", new { Email = user.Email }, user);
        }

        [HttpPost("Login")]
        public async Task<ActionResult<AuthenticationResponse>> Login(AuthenticationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Bad credentials");
            }

            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return BadRequest("Bad credentials");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

            if (!isPasswordValid)
            {
                return BadRequest("Bad credentials");
            }

            var token = _jwtService.CreateToken(user);

            var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme, ClaimTypes.Name, ClaimTypes.Role);
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.UserName));
            identity.AddClaim(new Claim(ClaimTypes.Name, user.UserName));
            var principal = new ClaimsPrincipal(identity);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    AllowRefresh = true,
                    ExpiresUtc = DateTime.UtcNow.AddDays(1)
                });


            return Ok(token);
        }

        private string HashEmailForGravatar(string email)
        {
            // Create a new instance of the MD5CryptoServiceProvider object.  
            using MD5 md5Hasher = MD5.Create();

            // Convert the input string to a byte array and compute the hash.  
            byte[] data = md5Hasher.ComputeHash(Encoding.Default.GetBytes(email));

            // Create a new Stringbuilder to collect the bytes  
            // and create a string.  
            StringBuilder sBuilder = new StringBuilder();

            // Loop through each byte of the hashed data  
            // and format each one as a hexadecimal string.  
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }

            return sBuilder.ToString();  // Return the hexadecimal string. 
        }
    }
}
