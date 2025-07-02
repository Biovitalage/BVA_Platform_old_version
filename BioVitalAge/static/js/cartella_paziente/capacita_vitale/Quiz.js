const questionsContainer = document.getElementById("quiz-container");
const questions = questionsContainer.querySelectorAll(".question");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const pagination = document.getElementById("pagination");

let currentQuestionIndex = 0;

// 🔥 GESTIONE card_to_show dal backend
if (window.cardToShow) {
  const cardId = window.cardToShow;
  const targetIndex = Array.from(questions).findIndex(
    (q) => q.id === cardId
  );

  if (targetIndex !== -1) {
    currentQuestionIndex = targetIndex;

    questions.forEach(q => q.classList.remove("active"));
    questions[targetIndex].classList.add("active");
  }
}

// ✅ Funzione per aggiornare la domanda attiva
function updateQuestion(index) {
  questions[currentQuestionIndex].classList.remove("active");
  currentQuestionIndex = index;
  questions[currentQuestionIndex].classList.add("active");
  updatePagination();

  // (opzionale) se serve, puoi usare handleCheckboxSelection() qui
  if (currentQuestionIndex === questions.length - 1) {
    handleCheckboxSelection();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ✅ Funzione per aggiornare la paginazione
function updatePagination() {
  const paginationButtons = pagination.querySelectorAll(".pagination-btn");
  paginationButtons.forEach((btn, index) => {
    btn.classList.toggle("active", index === currentQuestionIndex);
  });
}

// ✅ Funzione per creare la paginazione dinamica con nomi
function createPagination() {
  pagination.innerHTML = "";

  questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.classList.add("pagination-btn");
    button.textContent = question.getAttribute("data-title") || `Step ${index + 1}`;
    button.type = "button";
    button.addEventListener("click", () => updateQuestion(index));
    pagination.appendChild(button);
  });
}

// ✅ Pulsanti avanti/indietro
function nextAnswer() {
  if (currentQuestionIndex < questions.length - 1) {
    updateQuestion(currentQuestionIndex + 1);
  }
}

function prevAnswer() {
  if (currentQuestionIndex > 0) {
    updateQuestion(currentQuestionIndex - 1);
  }
}

nextBtn.addEventListener("click", nextAnswer);
prevBtn.addEventListener("click", prevAnswer);

// ✅ Selezione unica delle checkbox (se serve)
function handleCheckboxSelection() {
  const checkboxes = questions[currentQuestionIndex].querySelectorAll(".answer");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      checkboxes.forEach((box) => {
        if (box !== checkbox) box.checked = false;
      });
    });
  });
}

// ✅ Inizializzazione completa
createPagination();
updatePagination();
handleCheckboxSelection();

// ⚠️ Solo se hai definito altrove `checkLastQuestion`, altrimenti questa va rimossa
if (typeof checkLastQuestion === 'function') {
  document.querySelectorAll("input[type='radio'], input[type='text']").forEach((input) => {
    input.addEventListener("input", checkLastQuestion);
  });
}





