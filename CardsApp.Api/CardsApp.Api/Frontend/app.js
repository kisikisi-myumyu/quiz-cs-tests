import { 
    fetchDecks, 
    createDeck, 
    deleteDeck, 
    fetchReviewCards, 
    sendCardAnswer 
} from './api.js';

const button = document.getElementById("addCard");
const list_decks = document.getElementById("decks");
const input_name = document.getElementById("name_deck");
let cards = [];
let current = 0;

async function loadDecks() {
    try {
        const decks = await fetchDecks();
        console.log(decks);
        list_decks.innerHTML = "";
        for(const deck of decks) {
            console.log(deck);
            const li = document.createElement("li");
            
            const textSpan = document.createElement("span");
            textSpan.textContent = deck.title;           
            textSpan.style.cursor = "pointer";
            li.appendChild(textSpan);
            textSpan.addEventListener("click", function(){
                startReview(deck.id);
            });

            // Кнопка удалить набор
            const buttonDel = document.createElement("button");
            buttonDel.textContent = "Удалить набор";
            li.appendChild(buttonDel);
            buttonDel.addEventListener("click", async function(){
                buttonDel.disabled = true;
                try{
                    const notice = confirm("Вы точно хотите удалить набор? Это действие нельзя отменить")
                    if(!notice){
                        alert("Удаление набора отменено");
                        buttonDel.disabled = false;
                        return;
                    }
                    const response = await deleteDeck(deck.id);
                    if(!response.ok){
                        alert("Не удалось удалить набор")
                        buttonDel.disabled = false;
                        return;
                    }
                    alert("Набор успешно удален");
                    loadDecks();
                } catch(error){
                    console.error("Ошибка при удалении: ", error)
                    buttonDel.disabled = false;
                }
            });
            list_decks.appendChild(li)
        }
    } catch (error) {
        console.error("Ошибка при загрузке наборов: ", error);
    }
}
loadDecks();

async function startReview(deckId) {
    try {
        cards = await fetchReviewCards(deckId);
        current = 0;
        showCard();
    } catch (error) {
        console.error("Ошибка при старте повторения: ", error);
    }
}

// Начать повторение
function showCard(){
    const box = document.getElementById("card")
    box.innerHTML = "";
    if(current >= cards.length){
        box.textContent = "Повторение закончено";
        return;
    }
    const p = document.createElement("p");
    p.textContent = cards[current].term;

    const btn = document.createElement("button");
    btn.textContent = "Показать описание";
    btn.addEventListener("click", function(){
        p.textContent = cards[current].definition;
        btn.remove();
        box.appendChild(answerContainer);
    });

    box.appendChild(p);
    box.appendChild(btn);

    const answerContainer = document.createElement("div");

    //Кнопки Ответа
    function createAnswerButton(text, isCorrectValue) {
        const btn = document.createElement("button");
        btn.textContent = text;
        
        btn.addEventListener("click", async function() {
            const allButton = answerContainer.querySelectorAll("button");
            allButton.forEach(b => b.disabled = true);

            try{
                const response = await sendCardAnswer(cards[current].id, isCorrectValue);

                if(!response.ok){
                    alert("Не удалось получить ответ на карточку");
                    allButton.forEach(b => b.disabled = false);
                    return;
                }

                current++;
                showCard();
            } catch(error){
                console.error("Ошибка при отправке ответа: ", error);
                allButton.forEach(b => b.disabled = false);
            }
        });
    
        return btn;
    }
    
    const falsebtn = createAnswerButton("Не знаю", false);
    const truebtn = createAnswerButton("Знаю", true);

    answerContainer.appendChild(falsebtn);
    answerContainer.appendChild(truebtn);
}
   
// Создание набора
button.addEventListener("click", async function(){
    if(!input_name.value.trim()) {
        alert("Введите название набора");
        return;
    }
    
    try {
        const response = await createDeck(input_name.value);
        if(!response.ok){
            alert("Не удалось создать набор");
            return;
        }
        loadDecks();
        input_name.value = "";
    } catch (error) {
        console.error("Ошибка при создании набора: ", error);
    }
});
