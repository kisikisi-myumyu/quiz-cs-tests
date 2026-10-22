namespace CardsApp.Api.Models
{
    public class Card
    {
        public int Id { get; set; }
        public int DeckId { get; set; }
        public required string Term { get; set; }
        public required string Definition { get; set; }
        public int LeitnerBox { get; set; } = 1; // Карточка попадает в "коробка 1"
        public Deck Deck { get; set; } = null!;
    }
}
