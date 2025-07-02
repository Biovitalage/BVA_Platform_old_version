import { confirmDeleteAction } from "../../components/deleteAction.js";

/*  -----------------------------------------------------------------------------------------------
    ELIMINA REFERTO
--------------------------------------------------------------------------------------------------- */
document.querySelectorAll(".btn.delete").forEach((btn) => {
  btn.addEventListener("click", function () {
    const allegatoId = this.dataset.id;
    const tipo = this.dataset.tipo;
    const row = this.closest(".riga-container");

    confirmDeleteAction({
      url: `/CartellaPaziente/${pazienteId}/Allegato/${tipo}/${allegatoId}/delete/`,
      elementToRemove: row,
      successMessage: "Referto eliminato con successo!",
      errorMessage: "Errore nella cancellazione del referto",
      confirmMessage: "Sei sicuro di voler eliminare questo referto?",
      borderColor: "#EF4444",
    });
  });
});







/*  -----------------------------------------------------------------------------------------------
    ABILITA PULSANTE
--------------------------------------------------------------------------------------------------- */
function abilitaPulsante(dataId, fileId, buttonId) {
  const dataInput = document.getElementById(dataId);
  const fileInput = document.getElementById(fileId);
  const button = document.getElementById(buttonId);

  function checkCompilato() {
    if (dataInput.value && fileInput.files.length > 0) {
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  }

  dataInput.addEventListener("input", checkCompilato);
  fileInput.addEventListener("change", checkCompilato);
}

// Esegui per ogni form
abilitaPulsante("data_lab", "file_lab", "carica_lab");
abilitaPulsante("data_strumentale", "file_strumentale", "carica_strumentale");
