using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using QuickCollab.Server.Data;
using QuickCollab.Server.Data.Models;
using QuickCollab.Server.Hubs;
using System.Text;

public class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddMemoryCache();
        builder.Services.AddDbContext<QuickCollabDbContext>();
        // Add services to the container.
        builder.Services
            .AddAuthentication(options =>
            {
                // custom scheme defined in .AddPolicyScheme() below
                options.DefaultScheme = "JWT_OR_COOKIE";
                options.DefaultChallengeScheme = "JWT_OR_COOKIE";
            })
            .AddCookie(options =>
            {
                options.LoginPath = "/users/login";
                options.ExpireTimeSpan = TimeSpan.FromDays(1);
                options.Events = new CookieAuthenticationEvents
                {
                    
                };
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidAudience = "quickcollab.com",
                    ValidIssuer = "quickcollab.com",
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes("cq43vt45w#@$#cq43vt45why64yR@FFVsfdves42r-")
                    )
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.ToString().StartsWith("/hubs")))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            })
            .AddPolicyScheme("JWT_OR_COOKIE", "JWT_OR_COOKIE", options =>
            {
                // runs on each request
                options.ForwardDefaultSelector = context =>
                {
                    // filter by auth type
                    string authorization = context.Request.Headers[HeaderNames.Authorization];
                    var path = context.Request.Path;
                    if ((path.ToString().StartsWith("/hubs")) || 
                        (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer ")))
                    {
                        return JwtBearerDefaults.AuthenticationScheme;
                    }
                    // otherwise always check for cookie auth
                    return CookieAuthenticationDefaults.AuthenticationScheme;
                };
            });
        builder.Services
            .AddIdentityCore<QuickCollabUser>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.User.RequireUniqueEmail = true;
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            })
            .AddEntityFrameworkStores<QuickCollabDbContext>();
        builder.Services.AddControllers();
        builder.Services.AddScoped<QuickCollab.Server.Services.JwtService>();

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddSignalR();
        builder.Services.AddSingleton<IUserIdProvider, EmailBasedUserIdProvider>();
        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            using (var context = scope.ServiceProvider.GetService<QuickCollabDbContext>())
            {
                if (context.Database.GetPendingMigrations().Any())
                {
                    context.Database.Migrate();
                }
            }
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseCors(options =>
        {
            options
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(origin => true)
                .AllowCredentials();
        });
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapHub<CollabCodeHub>("hubs/collab-code");
        app.MapHub<CollabWhiteboardHub>("hubs/collab-board");

        app.MapControllers();

        app.Run();
    }
}