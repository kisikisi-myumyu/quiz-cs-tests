using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CardsApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNextReviewAtToCard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NextReviewAt",
                table: "Cards",
                type: "TEXT",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE Cards SET NextReviewAt = datetime('now') WHERE LeitnerBox < 4;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextReviewAt",
                table: "Cards");
        }
    }
}
