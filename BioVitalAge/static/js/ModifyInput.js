const editButton    = document.getElementById("btn_blood_group");
const saveButton    = document.getElementById("btn_save_changes");
const form          = document.querySelector("form");

const icons         = editButton.querySelectorAll("svg.button__icon-svg");
const iconModifica  = icons[0];               
const iconIndietro  = icons[1];               

let isEditing = false;

editButton.addEventListener("click", function (e) {
  e.preventDefault();
  isEditing = !isEditing;

  form.querySelectorAll("input, select").forEach((input) => {
    if (isEditing) {
      input.disabled = false;
      input.classList.add("editing");
      if (input.name === "data_alcol" && !input.value) {
        input.value = new Date().toISOString().split("T")[0];
      }
    } else {
      input.disabled = true;
      input.classList.remove("editing");
      input.blur();
    }
  });

  saveButton.style.display = isEditing ? "inline-flex" : "none";

  // now these are never null:
  iconModifica.style.display = isEditing ? "none" : "inline-flex";
  iconIndietro.style.display = isEditing ? "inline-flex" : "none";

  editButton.lastChild.textContent = isEditing ? "Indietro" : "Modifica Dati";
});

saveButton.addEventListener("click", function (e) {
  e.preventDefault();
  form.querySelectorAll("input, select").forEach(i => i.disabled = false);
  form.submit();
});
