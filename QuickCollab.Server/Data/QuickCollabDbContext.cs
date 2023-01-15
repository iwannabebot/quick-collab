using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using QuickCollab.Server.Data.Models;
using System.Diagnostics.Contracts;

namespace QuickCollab.Server.Data
{
    public class QuickCollabDbContext : IdentityUserContext<QuickCollabUser>
    {
        public QuickCollabDbContext(DbContextOptions<QuickCollabDbContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var connectionStringBuilder = new SqliteConnectionStringBuilder
            {
                DataSource = "QuickCollab.db"
            };
            var connectionString = connectionStringBuilder.ToString();
            var connection = new SqliteConnection(connectionString);

            optionsBuilder.UseSqlite(connection);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public DbSet<CollabRoom> CollabRooms { get; set; }
    }
}
