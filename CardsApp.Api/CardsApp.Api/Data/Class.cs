using Microsoft.EntityFrameworkCore;
using CardsApp.Api.Models;

namespace CardsApp.Api.Data
{
    public class  AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
        {

        }

        public DbSet<Card> Cards { get; set; }
        public DbSet<Deck> Decks { get; set; }
    }
}
