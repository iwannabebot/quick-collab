using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickCollab.Server.Migrations
{
    public partial class AddIdentityUserModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GravatarPhoto",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GravatarPhoto",
                table: "AspNetUsers");
        }
    }
}
