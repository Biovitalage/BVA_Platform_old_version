/*  -----------------------------------------------------------------------------------------------
        Modal User
        --------------------------------------------------------------------------------------------------- */
const userImg = document.getElementById("userImg");
const userModal = document.getElementById("userModal");
const userModalBtn = document.getElementById("nav-bar-user-modal-btn");

function showModal() {
  userModal.classList.add("show");
}

userImg.addEventListener("mouseover", showModal);

userModal.addEventListener("mouseout", () => {
  userModal.classList.remove("show");
});

userModalBtn.addEventListener("mouseover", showModal);
/*  -----------------------------------------------------------------------------------------------
        Script per la logica dei pulsanti "Yes/No"
      --------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Selezioniamo tutti i blocchi che contengono i pulsanti "Yes/No"
  const chooseButtonsContainers = document.querySelectorAll(".choose-buttons");

  chooseButtonsContainers.forEach((buttonsContainer) => {
    const yesButton = buttonsContainer.querySelector('[data-choice="yes"]');
    const noButton = buttonsContainer.querySelector('[data-choice="no"]');

    // Troviamo il contenitore delle tabelle per la sezione Sport (o altre)
    const containerCard = buttonsContainer.closest(".container-card");

    if (!containerCard) return;

    // Troviamo le due tabelle "sporting" e "sedentary"
    const sportingLifestyle = containerCard.querySelector(
      '[data-lifestyle="sporting-lifestyle"]'
    );
    const sedentaryLifestyle = containerCard.querySelector(
      '[data-lifestyle="sedentary-lifestyle"]'
    );

    // Se esistono entrambe, vuol dire che è la sezione "Sport"
    if (sportingLifestyle && sedentaryLifestyle) {
      // Di default rimangono entrambe nascoste, perché nel tuo HTML
      // hai messo class="hidden" su entrambe

      // Se clicco "Yes" → mostro sporting, nascondo sedentary
      yesButton.addEventListener("click", (event) => {
        event.preventDefault();
        sportingLifestyle.classList.remove("hidden");
        sedentaryLifestyle.classList.add("hidden");
      });

      // Se clicco "No" → mostro sedentary, nascondo sporting
      noButton.addEventListener("click", (event) => {
        event.preventDefault();
        sportingLifestyle.classList.add("hidden");
        sedentaryLifestyle.classList.remove("hidden");
      });
    } else {
      // Se non è la sezione "Sport", manteniamo la logica generica
      // (mostro/nascondo una sola tabella successiva)
      const hiddenTable = buttonsContainer.nextElementSibling;

      yesButton.addEventListener("click", (event) => {
        event.preventDefault();
        hiddenTable?.classList.remove("hidden");
      });
      noButton.addEventListener("click", (event) => {
        event.preventDefault();
        hiddenTable?.classList.add("hidden");
      });
    }
  });
});
