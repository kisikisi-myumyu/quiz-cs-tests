using CardsApp.Api.Data;
using CardsApp.Api.Dtos;
using CardsApp.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CardsApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardsController : ControllerBase
    {
        private const int DoneLearn = 4;
        private readonly AppDbContext _db;
        public CardsController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Получение карточки по id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCardId(int id)
        {
            var card = await _db.Cards.FindAsync(id);
            if (card == null)
            {
                return NotFound();
            }

            return Ok(card);
        }

        /// <summary>
        /// Получить карточки набора
        /// </summary>
        /// <param name="deckId"></param>
        /// <returns></returns>
        [HttpGet("~/api/decks/{deckId}/cards")]
        public async Task<ActionResult<List<Card>>> GetAllCard(int deckId)
        {
            var cards = await _db.Cards
                .Where(b=> b.DeckId == deckId)
                .ToListAsync();
            return Ok(cards);
        }

        /// <summary>
        /// Создание карточки
        /// </summary>
        /// <param name="newCard"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateCard([FromBody] CardDto newCard)
        {
            var isDecksExist = await _db.Decks.AnyAsync(c => c.Id == newCard.DeckId);

            if (!isDecksExist)
            {
                return BadRequest(new
                {
                    message = $"Ощибка создания: связанного обьекта с ID {newCard.DeckId} не существует"
                });
            }
            var card = new Card { DeckId = newCard.DeckId 
                ,Term = newCard.Term
                ,Definition = newCard.Definition
                
            };

            await _db.Cards.AddAsync(card);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCardId), new { id = card.Id }, card);

        }

        /// <summary>
        /// Обновление карточки по id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateCard"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCard(int id, [FromBody] CardDto updateCard)
        {
            var existingCard = await _db.Cards.FindAsync(id);
            if (existingCard == null) return NotFound();

            var isDecksExist = await _db.Decks.AnyAsync(c => c.Id == updateCard.DeckId);

            if (!isDecksExist)
            {
                return BadRequest(new
                {
                    message = $"Ощибка Обновления: связанного обьекта с ID {updateCard.DeckId} не существует"
                });
            }

            existingCard.DeckId = updateCard.DeckId;
            existingCard.Term = updateCard.Term;
            existingCard.Definition = updateCard.Definition;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Удаление карточки (по id)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCard(int id)
        {
            var card = await _db.Cards.FindAsync(id);
            if(card == null) return NotFound();

            _db.Cards.Remove(card);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Перемещение по алгоритму Лейтнера
        /// </summary>
        /// <param name="id"></param>
        /// <param name="answerDto"></param>
        /// <returns></returns>
        [HttpPost("{id}/answer")]
        public async Task<IActionResult> AnswerCard(int id, [FromBody] AnswerDto answerDto)
        {
            var existingCard = await _db.Cards.FindAsync(id);
            if (existingCard == null) return NotFound();

            if (existingCard.LeitnerBox == DoneLearn) return BadRequest(new
            { message = $"Ошибка ответа: Карточка с ID {id} уже выучена" });
        
            if (answerDto.IsCorrect)  
                existingCard.LeitnerBox++;
            else 
                existingCard.LeitnerBox = 1;

            await _db.SaveChangesAsync();
            return NoContent();
        }


        [HttpGet("~/api/decks/{deckId}/review")]
        public async Task<ActionResult<List<Card>>> GetReviewCards(int deckId)
        {
            var isDeckExist = await _db.Decks.AnyAsync(c => c.Id == deckId);
            if (!isDeckExist)
            {
                return BadRequest(new
                {
                    message = $"Ощибка Обновления: связанного набора с ID {deckId} не существует"
                });
            }

            var cards = await _db.Cards
                .Where(b => b.DeckId == deckId && b.LeitnerBox !=DoneLearn)
                .ToListAsync();
            return Ok(cards);
        }
    }
}
