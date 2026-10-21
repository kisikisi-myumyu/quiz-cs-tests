namespace CardsApp.Api.Dtos
{
    public class CardDto
    {
        public int DeckId { get; set; }
        public required string Term { get; set; }
        public required string Definition { get; set; }
    }
}
