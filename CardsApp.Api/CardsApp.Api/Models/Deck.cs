namespace CardsApp.Api.Models
{
    public class Deck
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Card> Cards { get; set; } = new();
    }
}
