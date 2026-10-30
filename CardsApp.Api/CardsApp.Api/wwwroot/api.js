export const API = "https://localhost:7155/";

export async function fetchDecks() {
    const response = await fetch(API + "api/decks");
    if (!response.ok) {
        throw new Error(`Ошибка сервера при получении наборов: статус ${response.status}`);
    }
    return await response.json();
}

export async function createDeck(titleValue) {
    return await fetch(API + "api/decks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: titleValue})
    });
}

export async function deleteDeck(deckId) {
    return await fetch(`${API}api/decks/${deckId}`, {
        method: "DELETE"
    });
}

export async function fetchReviewCards(deckId) {
    const response = await fetch(`${API}api/decks/${deckId}/review`);
    if (!response.ok) {
        throw new Error(`Ошибка сервера при получении карточек: статус ${response.status}`);
    }
    return await response.json();
}

export async function sendCardAnswer(cardId, isCorrectValue) {
    return await fetch(`${API}api/cards/${cardId}/answer`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({isCorrect: isCorrectValue})
    });
}

export async function createCard(deckId,termValue, definitionValue) {
    return await fetch(`${API}api/cards`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            deckId: deckId,
            term: termValue,
            definition: definitionValue
        })
    });
}
