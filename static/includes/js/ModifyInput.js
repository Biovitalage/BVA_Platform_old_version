const editButton = document.getElementById("btn_blood_group");
const saveButton = document.getElementById("btn_save_changes");
const form = document.querySelector("form");

const iconModifica = document.getElementById("modifica");
const iconIndietro = document.getElementById("indietro-modifica");

let isEditing = false;

editButton.addEventListener("click", function (e) {
  e.preventDefault();
  isEditing = !isEditing;

  const inputs = form.querySelectorAll("input, select");

  inputs.forEach((input) => {
    if (isEditing) {
      input.disabled = false;
      input.classList.add("editing");

      if (input.name === "data_alcol" && !input.value) {
        const today = new Date().toISOString().split("T")[0];
        input.value = today;
      }
    } else {
      input.disabled = true;
      input.classList.remove("editing");
      input.blur();
    }
  });

  // Mostra/nasconde il bottone di salvataggio
  saveButton.style.display = isEditing ? "inline-flex" : "none";

  // Switch icone
  iconModifica.style.display = isEditing ? "none" : "inline-flex";
  iconIndietro.style.display = isEditing ? "inline-flex" : "none";

  // Cambia testo
  editButton.lastChild.textContent = isEditing ? "Indietro" : "Modifica Dati";
});

saveButton.addEventListener("click", function (e) {
  e.preventDefault();

  // Riabilita tutti i campi prima del submit
  const allInputs = form.querySelectorAll("input, select");
  allInputs.forEach((input) => input.disabled = false);

  form.submit();
});


