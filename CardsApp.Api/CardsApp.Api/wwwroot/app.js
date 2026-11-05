import { 
    fetchDecks, 
    createDeck, 
    deleteDeck, 
    getAllCards, 
    createCard, 
    deleteCard, 
    fetchReviewCards, 
    sendCardAnswer 
} from './api.js';

// DOM: Элементы наборов
const createDeckForm = document.getElementById("createDeckForm");
const inputDeckName = document.getElementById("name_deck");
const decksList = document.getElementById("decks");

// DOM: Элементы карточек набора
const deckDetailsPanel = document.getElementById("deckDetails");
const currentDeckTitle = document.getElementById("currentDeckTitle");
const closeDeckDetailsBtn = document.getElementById("closeDeckDetailsBtn");
const createCardForm = document.getElementById("createCardForm");
const inputCardTerm = document.getElementById("card_term");
const inputCardDef = document.getElementById("card_def");
const cardsContainer = document.getElementById("cardsContainer");

// DOM: Элементы повторения
const reviewSection = document.getElementById("reviewSection");
const closeReviewBtn = document.getElementById("closeReviewBtn");
const cardBox = document.getElementById("cardBox");

// Состояние (State)
let activeDeckId = null;
let reviewDeck = [];
let currentReviewIndex = 0;

// --- 1. Логика наборов ---

async function loadDecks() {
    try {
        const decks = await fetchDecks();
        decksList.innerHTML = "";

        decks.forEach(deck => {
            const li = document.createElement("li");
            li.className = "deck-item";

            const spanTitle = document.createElement("span");
            spanTitle.className = "deck-title";
            spanTitle.textContent = deck.title;
            spanTitle.addEventListener("click", () => openDeckCards(deck));

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "deck-actions";

            const btnStudy = document.createElement("button");
            btnStudy.className = "btn btn-secondary";
            btnStudy.textContent = "Учить";
            btnStudy.addEventListener("click", () => startReviewSession(deck.id));

            const btnDelete = document.createElement("button");
            btnDelete.className = "btn btn-tonal";
            btnDelete.textContent = "Удалить";
            btnDelete.addEventListener("click", () => handleDeleteDeck(deck.id, deck.title));

            actionsDiv.appendChild(btnStudy);
            actionsDiv.appendChild(btnDelete);

            li.appendChild(spanTitle);
            li.appendChild(actionsDiv);
            decksList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
}

createDeckForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = inputDeckName.value.trim();
    if (!title) return;

    try {
        const response = await createDeck(title);
        if (response.ok) {
            inputDeckName.value = "";
            loadDecks();
        } else {
            alert("Не удалось создать набор");
        }
    } catch (err) {
        console.error(err);
    }
});

async function handleDeleteDeck(id, title) {
    if (!confirm(`Удалить набор "${title}"?`)) return;
    try {
        const response = await deleteDeck(id);
        if (response.ok) {
            if (activeDeckId === id) {
                deckDetailsPanel.classList.add("hidden");
            }
            loadDecks();
        }
    } catch (err) {
        console.error(err);
    }
}

// --- 2. Логика карточек выбранного набора ---

async function openDeckCards(deck) {
    activeDeckId = deck.id;
    currentDeckTitle.textContent = `Карточки: ${deck.title}`;
    
    reviewSection.classList.add("hidden");
    deckDetailsPanel.classList.remove("hidden");
    
    await loadCardsList(activeDeckId);
}

closeDeckDetailsBtn.addEventListener("click", () => {
    deckDetailsPanel.classList.add("hidden");
    activeDeckId = null;
});

async function loadCardsList(deckId) {
    cardsContainer.innerHTML = "";
    try {
        const cards = await getAllCards(deckId);
        if (cards.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.textContent = "В наборе пока нет карточек.";
            cardsContainer.appendChild(emptyP);
            return;
        }

        cards.forEach(card => {
            const li = document.createElement("li");
            li.className = "card-item";

            const content = document.createElement("div");
            content.className = "card-item-content";

            const term = document.createElement("span");
            term.className = "card-term";
            term.textContent = card.term;

            const def = document.createElement("span");
            def.className = "card-def";
            def.textContent = card.definition;

            const badge = document.createElement("span");
            badge.className = "card-box-badge";
            badge.textContent = `Коробка Лейтнера: ${card.leitnerBox}`;

            content.appendChild(term);
            content.appendChild(def);
            content.appendChild(badge);

            const btnDel = document.createElement("button");
            btnDel.className = "btn btn-tonal";
            btnDel.textContent = "✕";
            btnDel.addEventListener("click", async () => {
                await deleteCard(card.id);
                loadCardsList(deckId);
            });

            li.appendChild(content);
            li.appendChild(btnDel);
            cardsContainer.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
}

createCardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeDeckId) return;

    const term = inputCardTerm.value.trim();
    const def = inputCardDef.value.trim();
    if (!term || !def) return;

    try {
        const response = await createCard(activeDeckId, term, def);
        if (response.ok) {
            inputCardTerm.value = "";
            inputCardDef.value = "";
            loadCardsList(activeDeckId);
        }
    } catch (err) {
        console.error(err);
    }
});

// --- 3. Логика повторения карточек ---

async function startReviewSession(deckId) {
    try {
        reviewDeck = await fetchReviewCards(deckId);
        currentReviewIndex = 0;

        if (reviewDeck.length === 0) {
            alert("Все карточки выучены либо набор пуст!");
            return;
        }

        deckDetailsPanel.classList.add("hidden");
        reviewSection.classList.remove("hidden");
        renderCurrentReviewCard();
    } catch (err) {
        console.error(err);
    }
}

closeReviewBtn.addEventListener("click", () => {
    reviewSection.classList.add("hidden");
});

function renderCurrentReviewCard() {
    cardBox.innerHTML = "";

    if (currentReviewIndex >= reviewDeck.length) {
        const finishedText = document.createElement("p");
        finishedText.className = "flashcard-term";
        finishedText.textContent = "Повторение завершено!";
        cardBox.appendChild(finishedText);
        return;
    }

    const card = reviewDeck[currentReviewIndex];

    const termElem = document.createElement("div");
    termElem.className = "flashcard-term";
    termElem.textContent = card.term;

    const btnShowDef = document.createElement("button");
    btnShowDef.className = "btn btn-secondary";
    btnShowDef.textContent = "Показать определение";

    btnShowDef.addEventListener("click", () => {
        btnShowDef.remove();

        const defElem = document.createElement("div");
        defElem.className = "flashcard-def";
        defElem.textContent = card.definition;

        const actions = document.createElement("div");
        actions.className = "flashcard-actions";

        const btnWrong = document.createElement("button");
        btnWrong.className = "btn btn-danger";
        btnWrong.textContent = "Не знаю";
        btnWrong.addEventListener("click", () => handleAnswer(card.id, false));

        const btnRight = document.createElement("button");
        btnRight.className = "btn btn-success";
        btnRight.textContent = "Знаю";
        btnRight.addEventListener("click", () => handleAnswer(card.id, true));

        actions.appendChild(btnWrong);
        actions.appendChild(btnRight);

        cardBox.appendChild(defElem);
        cardBox.appendChild(actions);
    });

    cardBox.appendChild(termElem);
    cardBox.appendChild(btnShowDef);
}

async function handleAnswer(cardId, isCorrect) {
    try {
        await sendCardAnswer(cardId, isCorrect);
        currentReviewIndex++;
        renderCurrentReviewCard();
    } catch (err) {
        console.error(err);
    }
}

// Точка входа
loadDecks();