export const API = "https://localhost:7155";

// --- Наборы (Decks) ---
export async function fetchDecks() {
    const response = await fetch(`${API}/api/decks`);
    if (!response.ok) throw new Error(`Ошибка загрузки наборов: ${response.status}`);
    return await response.json();
}

export async function createDeck(title) {
    return await fetch(`${API}/api/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });
}

export async function deleteDeck(deckId) {
    return await fetch(`${API}/api/decks/${deckId}`, {
        method: "DELETE"
    });
}

// --- Карточки (Cards) ---
export async function getAllCards(deckId) {
    const response = await fetch(`${API}/api/decks/${deckId}/cards`);
    if (!response.ok) throw new Error(`Ошибка загрузки карточек: ${response.status}`);
    return await response.json();
}

export async function createCard(deckId, term, definition) {
    return await fetch(`${API}/api/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            deckId,
            term,
            definition
        })
    });
}

export async function deleteCard(cardId) {
    return await fetch(`${API}/api/cards/${cardId}`, {
        method: "DELETE"
    });
}

// --- Повторение (Review) ---
export async function fetchReviewCards(deckId) {
    const response = await fetch(`${API}/api/decks/${deckId}/review`);
    if (!response.ok) throw new Error(`Ошибка загрузки карточек повторения: ${response.status}`);
    return await response.json();
}

export async function sendCardAnswer(cardId, isCorrect) {
    return await fetch(`${API}/api/cards/${cardId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect })
    });
}