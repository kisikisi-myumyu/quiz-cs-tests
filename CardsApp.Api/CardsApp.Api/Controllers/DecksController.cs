using CardsApp.Api.Data;
using CardsApp.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace CardsApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DecksController : ControllerBase
    {

        private readonly AppDbContext _db;

        public DecksController(AppDbContext db) {
            _db = db;
        }

        /// <summary>
        /// Получить все наборы карточек
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<List<Deck>>> GetAll()
        {
            var decks = await _db.Decks.ToListAsync();
            return Ok(decks);
        }

        /// <summary>
        /// Создать новый набор (Deck)
        /// </summary>
        /// <param name="newDeck"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateDeck([FromBody] Deck newDeck)
        {
            await _db.Decks.AddAsync(newDeck);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDeckId), new { id = newDeck.Id }, newDeck);
        }

        /// <summary>
        /// Получить набор по id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeckId(int id)
        {
            var deck = await _db.Decks.FindAsync(id);
            if (deck == null) return NotFound();
            return Ok(deck);
        }

        /// <summary>
        /// Обновить набор карточек
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateDeck"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDeck(int id, [FromBody] Deck updateDeck)
        {
            var existingDeck = await _db.Decks.FindAsync(id);
            if (existingDeck == null) return NotFound();

            existingDeck.Title = updateDeck.Title;
            if (existingDeck.Description!=null) existingDeck.Description = updateDeck.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Удаление набора по id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDeck(int id)
        {
            var deck = await _db.Decks.FindAsync(id);
            if (deck == null) return NotFound();

            _db.Decks.Remove(deck);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
