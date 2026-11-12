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

// Состояние приложения (State)
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
            btnDelete.addEventListener("click", () => handleDeleteDeck(deck.id, deck.title, btnDelete));

            actionsDiv.appendChild(btnStudy);
            actionsDiv.appendChild(btnDelete);

            li.appendChild(spanTitle);
            li.appendChild(actionsDiv);
            decksList.appendChild(li);
        });
    } catch (err) {
        console.error("Ошибка загрузки наборов: ", err);
        alert("Не удалось загрузить список наборов");
    }
}

createDeckForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = inputDeckName.value.trim();
    if (!title) return;

    const submitBtn = createDeckForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    try {
        const response = await createDeck(title);
        if (response.ok) {
            inputDeckName.value = "";
            await loadDecks();
        } else {
            alert(`Ошибка при создании набора: статус ${response.status}`);
        }
    } catch (err) {
        console.error(err);
        alert("Сетевая ошибка при создании набора");
    } finally {
        submitBtn.disabled = false;
    }
});

// Пункт 2: Удаление набора с блокировкой кнопки и проверкой ошибок
async function handleDeleteDeck(id, title, btnElement) {
    if (!confirm(`Удалить набор "${title}" и все его карточки?`)) return;

    btnElement.disabled = true;
    try {
        const response = await deleteDeck(id);
        if (response.ok) {
            if (activeDeckId === id) {
                deckDetailsPanel.classList.add("hidden");
                activeDeckId = null;
            }
            await loadDecks();
        } else {
            alert(`Не удалось удалить набор: статус ${response.status}`);
            btnElement.disabled = false;
        }
    } catch (err) {
        console.error("Ошибка при удалении набора: ", err);
        alert("Сетевая ошибка при удалении набора");
        btnElement.disabled = false;
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

        // Пункт 3: Валидный HTML — li вместо p внутри ul
        if (cards.length === 0) {
            const emptyLi = document.createElement("li");
            emptyLi.className = "card-item";
            emptyLi.textContent = "В наборе пока нет карточек.";
            cardsContainer.appendChild(emptyLi);
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

            let nextText;
            if (card.nextReviewAt === null) {
                nextText = "выучено";
            } else {
                const next = new Date(card.nextReviewAt);
                nextText = next <= new Date()
                    ? "доступна сейчас"
                    : `повтор: ${next.toLocaleDateString("ru-RU")}`;
            }
            badge.textContent = `Коробка Лейтнера: ${card.leitnerBox} · ${nextText}`;

            content.appendChild(term);
            content.appendChild(def);
            content.appendChild(badge);

            const btnDel = document.createElement("button");
            btnDel.className = "btn btn-tonal";
            btnDel.textContent = "✕";
            btnDel.title = "Удалить карточку";

            // Пункт 2: Удаление карточки с try/catch, блокировкой кнопки и проверкой ответа
            btnDel.addEventListener("click", async () => {
                if (!confirm(`Удалить карточку "${card.term}"?`)) return;

                btnDel.disabled = true;
                try {
                    const response = await deleteCard(card.id);
                    if (response.ok) {
                        await loadCardsList(deckId);
                    } else {
                        alert(`Не удалось удалить карточку: статус ${response.status}`);
                        btnDel.disabled = false;
                    }
                } catch (err) {
                    console.error("Ошибка при удалении карточки: ", err);
                    alert("Сетевая ошибка при удалении карточки");
                    btnDel.disabled = false;
                }
            });

            li.appendChild(content);
            li.appendChild(btnDel);
            cardsContainer.appendChild(li);
        });
    } catch (err) {
        console.error("Ошибка загрузки списка карточек: ", err);
        const errorLi = document.createElement("li");
        errorLi.className = "card-item";
        errorLi.textContent = "Не удалось загрузить карточки.";
        cardsContainer.appendChild(errorLi);
    }
}

createCardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeDeckId) return;

    const term = inputCardTerm.value.trim();
    const def = inputCardDef.value.trim();
    if (!term || !def) return;

    const submitBtn = createCardForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    try {
        const response = await createCard(activeDeckId, term, def);
        if (response.ok) {
            inputCardTerm.value = "";
            inputCardDef.value = "";
            await loadCardsList(activeDeckId);
        } else {
            alert(`Не удалось создать карточку: статус ${response.status}`);
        }
    } catch (err) {
        console.error(err);
        alert("Сетевая ошибка при создании карточки");
    } finally {
        submitBtn.disabled = false;
    }
});

// --- 3. Логика повторения карточек ---

async function startReviewSession(deckId) {
    try {
        reviewDeck = await fetchReviewCards(deckId);
        currentReviewIndex = 0;

        if (reviewDeck.length === 0) {
            alert("На сегодня повторять нечего: карточки либо выучены, либо ждут следующего срока повторения.");
            return;
        }

        deckDetailsPanel.classList.add("hidden");
        reviewSection.classList.remove("hidden");
        renderCurrentReviewCard();
    } catch (err) {
        console.error(err);
        alert("Не удалось запустить повторение карточек");
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

        const btnRight = document.createElement("button");
        btnRight.className = "btn btn-success";
        btnRight.textContent = "Знаю";

        // Пункт 1: Передаем кнопки в обработчик для блокировки от повторного нажатия
        const answerButtons = [btnWrong, btnRight];

        btnWrong.addEventListener("click", () => handleAnswer(card.id, false, answerButtons));
        btnRight.addEventListener("click", () => handleAnswer(card.id, true, answerButtons));

        actions.appendChild(btnWrong);
        actions.appendChild(btnRight);

        cardBox.appendChild(defElem);
        cardBox.appendChild(actions);
    });

    cardBox.appendChild(termElem);
    cardBox.appendChild(btnShowDef);
}

// Пункт 1: handleAnswer блокирует кнопки, проверяет response.ok и обрабатывает сбои
async function handleAnswer(cardId, isCorrect, buttons) {
    // 1. Блокируем кнопки немедленно, предотвращая спам-клики
    buttons.forEach(btn => btn.disabled = true);

    try {
        const response = await sendCardAnswer(cardId, isCorrect);

        // 2. Проверяем статус ответа сервера
        if (!response.ok) {
            alert(`Ошибка сервера при сохранении ответа: статус ${response.status}`);
            buttons.forEach(btn => btn.disabled = false); // Разблокируем, чтобы можно было повторить попытку
            return;
        }

        // 3. Только если ответ успешно сохранён — идём к следующей карточке
        currentReviewIndex++;
        renderCurrentReviewCard();
    } catch (err) {
        console.error("Сетевая ошибка при отправке ответа: ", err);
        alert("Сетевая ошибка: не удалось отправить ответ на карточку");
        buttons.forEach(btn => btn.disabled = false);
    }
}

// Точка входа
loadDecks();