/*  -----------------------------------------------------------------------------------------------
    ! Table
--------------------------------------------------------------------------------------------------- */
// Funzione che imposta "opacity: 0" e "z-index: -1" dopo 3 secondi
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.getElementById("loading-wrapper").style.opacity = "0";
    document.getElementById("loading-wrapper").style.zIndex = "-1";
  }, 500);
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".edit-save-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const table =
        button.parentElement.previousElementSibling.querySelector("table");
      const isEditing = button.textContent === "Save";

      // Memorizza lo stato iniziale della tabella per il rollback
      if (!isEditing) {
        table.dataset.originalState = table.innerHTML;
      }

      // Attiva/disattiva la modifica dei campi
      table.querySelectorAll("td").forEach((cell) => {
        cell.contentEditable = !isEditing;
      });

      // Cambia il testo del pulsante
      button.textContent = isEditing ? "Edit" : "Save";

      // Aggiunge pulsanti "Add Row" e "Cancel" in modalità modifica
      if (!isEditing) {
        const addRowButton = document.createElement("button");
        addRowButton.textContent = "Add Row";
        addRowButton.className = "edit-save-btn add-row-btn";
        button.parentElement.appendChild(addRowButton);

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = "edit-save-btn cancel-btn";
        button.parentElement.appendChild(cancelButton);

        // Mostra i pulsanti con transizione
        setTimeout(() => {
          addRowButton.classList.add("show");
          cancelButton.classList.add("show");
        }, 10);

        // Evento per aggiungere una riga
        addRowButton.addEventListener("click", () => {
          const newRow = document.createElement("tr");
          const columns = table.querySelectorAll("thead th").length;

          for (let i = 0; i < columns; i++) {
            const newCell = document.createElement("td");
            newCell.contentEditable = true;
            newCell.textContent = ""; // Cella vuota
            newRow.appendChild(newCell);
          }

          table.querySelector("tbody").appendChild(newRow);
        });

        // Evento per annullare le modifiche
        cancelButton.addEventListener("click", () => {
          table.innerHTML = table.dataset.originalState; // Ripristina lo stato iniziale
          button.textContent = "Edit";
          addRowButton.classList.remove("show");
          cancelButton.classList.remove("show");

          setTimeout(() => {
            addRowButton.remove();
            cancelButton.remove();
          }, 300);
        });

        // Rimuove i pulsanti "Add Row" e "Cancel" quando si salva
        button.addEventListener("click", () => {
          addRowButton.classList.remove("show");
          cancelButton.classList.remove("show");

          setTimeout(() => {
            addRowButton.remove();
            cancelButton.remove();
          }, 300);
        });
      }
    });
  });
});

/*  -----------------------------------------------------------------------------------------------
      ! Blood Data
  --------------------------------------------------------------------------------------------------- */

const btn = document.getElementById("btn_blood_group");
const bloodGroupInput = document.getElementById("blood_group");
const rhInput = document.getElementById("rh");
const bloodDataSection = document.querySelector(".blood_data");

let isEditing = false;

btn.addEventListener("click", function () {
  if (!isEditing) {
    // Abilita la modifica
    bloodGroupInput.removeAttribute("readonly");
    rhInput.removeAttribute("readonly");

    // Aggiunge la classe 'editing' per modificare il CSS
    bloodDataSection.classList.add("editing");

    // Cambia il testo del bottone
    btn.textContent = "Save";
    isEditing = true;
  } else {
    // Disabilita la modifica e salva i valori
    bloodGroupInput.setAttribute("readonly", true);
    rhInput.setAttribute("readonly", true);

    // Rimuove la classe 'editing'
    bloodDataSection.classList.remove("editing");

    // Recupera i valori modificati
    const newBloodGroup = bloodGroupInput.value;
    const newRh = rhInput.value;

    // Esegui azioni di salvataggio (ad esempio localStorage o chiamate AJAX)
    // localStorage.setItem('blood_group', newBloodGroup);
    // localStorage.setItem('rh', newRh);

    console.log("Salvataggio completato:", {
      bloodGroup: newBloodGroup,
      rh: newRh,
    });

    // Ripristina il testo del bottone
    btn.textContent = "Update";
    isEditing = false;
  }
});

/*  ----------------
            User Modal
        -------------------- */
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
