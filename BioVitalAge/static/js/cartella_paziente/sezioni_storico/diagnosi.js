import showAlert from "../../components/showAlert.js";
import { confirmDeleteAction } from "../../components/deleteAction.js";

/*  -----------------------------------------------------------------------------------------------
  GLOBAL CODE
--------------------------------------------------------------------------------------------------- */
const modal = document.getElementById("diagnosisModal");
const modalInner = modal.querySelector(".modal-content-appointments");

// Timeline GSAP (inizialmente in pausa)
const tl = gsap.timeline({ paused: true });

// Stati iniziali (per sicurezza)
gsap.set(modal, { autoAlpha: 0, backdropFilter: "blur(0px)" });
gsap.set(modalInner, { scale: 0.8, opacity: 0 });

// Animazione modale
tl.to(modal, {
  autoAlpha: 1,
  backdropFilter: "blur(6px)",
  duration: 0.3,
}).to(
  modalInner,
  {
    scale: 1,
    opacity: 1,
    duration: 0.4,
    ease: "back.out(1.5)",
  },
  "-=0.25"
);

// Funzioni utili
function getBadgeClass(value) {
  switch (parseInt(value)) {
    case 1: return "lieve";
    case 2: return "moderata";
    case 3: return "grave";
    default: return "";
  }
}

function getGravitaLabel(value) {
  switch (parseInt(value)) {
    case 1: return "Lieve";
    case 2: return "Moderata";
    case 3: return "Grave";
    default: return "";
  }
}

function formatDataItaliana(data) {
  const dateObj = new Date(data);
  return dateObj.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

/*  -----------------------------------------------------------------------------------------------
        Listener per la paginazione
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function (event) {
    const target = event.target;

    // Se hai cliccato su un <a> dentro la paginazione
    if (target.closest(".pagination_tabella a")) {
      event.preventDefault();

      const link = target.closest("a");
      const url = link.href;

      fetch(url)
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const newContent = doc.querySelector(".table-wrapper");
          document.querySelector(".table-wrapper").innerHTML =
            newContent.innerHTML;
          // ✅ Niente più bisogno di riattivare i listener manualmente!
        });
    }
  });
});

/*  -----------------------------------------------------------------------------------------------
    Range Gravità
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const range = document.getElementById("gravitaRange");
  const indicator = document.getElementById("indicator");
  const label = document.getElementById("gravitaLabel");

  const map = {
    1: { label: "Lieve", x: 40, y: 10, color: "#4CAF50" },
    2: { label: "Moderata", x: 140, y: 10, color: "#FFC107" },
    3: { label: "Grave", x: 240, y: 10, color: "#F44336" },
  };

  function updateIndicator(value, animate = true) {
    const { x: targetX, y: targetY, label: gravitaLabel, color } = map[value];

    if (animate) {
      gsap.to(indicator, {
        x: targetX,
        y: targetY,
        fill: color,
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.set(indicator, { x: targetX, y: targetY, fill: color });
    }

    label.textContent = gravitaLabel;
  }

  range.addEventListener("input", () => {
    updateIndicator(range.value);
  });

  // Inizializza
  updateIndicator(range.value, false);
});

/*  -----------------------------------------------------------------------------------------------
    Modali Diagnosi
--------------------------------------------------------------------------------------------------- */
function formatDateItalian(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function refreshDiagnosiTable() {
  const wrapper = document.querySelector('.table-wrapper');
  const resp = await fetch(window.location.href);
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const newWrap = doc.querySelector('.table-wrapper');
  wrapper.innerHTML = newWrap.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openDiagnosisBtn");
  const closeIcon = document.getElementById("closeDiagnosisModal");
  const closeFooter = document.getElementById("closeDiagnosisBtn");
  const form = document.getElementById("diagnosis-form");

  // Apri modale
  openBtn.addEventListener("click", () => {
    tl.play(0);
    modal.style.pointerEvents = "auto";
    document.body.style.overflow = "hidden";
  });

  // Chiudi modale
  function closeModal() {
    tl.reverse();
    document.body.style.overflow = "auto";
    form.reset(); // resetta il form dopo la chiusura
  }

  closeIcon.addEventListener("click", closeModal);
  closeFooter.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Intercetta il submit del form
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // blocca il comportamento di default

    const isEdit = !!form.querySelector("#id_diagnosi").value;

    const data = {
      id: form.querySelector("#id_diagnosi").value,
      descrizione: form.descrizione.value,
      data_diagnosi: form.data_diagnosi.value,
      stato: form.stato.value,
      note: form.note.value,
      gravita: form.gravita.value,
      risolta: form.risolta.checked
    };    

    try {
      const url = window.location.pathname;
      const method = isEdit ? "PATCH" : "POST";

      console.log("Metodo:", method, "URL:", url, "Data:", data);
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("[name=csrf-token]").content,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Aggiungi o aggiorna dinamicamente la riga nella tabella
        const tableBody = document.querySelector("table tbody");

        if (!isEdit) {
          // 🆕 nuova diagnosi
          const nuovaRiga = document.createElement("tr");
          nuovaRiga.setAttribute("data-id", result.id);
          nuovaRiga.innerHTML = `
            <td>${result.id}</td>
            <td class="td-descrizione">${result.descrizione}</td>
            <td class="td-gravita">
              <span class="badge ${getBadgeClass(result.gravita)}">
                ${getGravitaLabel(result.gravita)}
              </span>
            </td>
            <td class="td-data">${formatDataItaliana(result.data_diagnosi)}</td>
            <td class="td-stato">${result.stato}</td>
            <td class="td-risolta">${result.risolta ? "Si" : "No"}</td>
            <td>
              <button class="btn edit" onclick="compilaDiagnosi(${result.id})">✎</button>
              <button class="btn delete" data-id="${result.id}">✖</button>
            </td>
          `;
          tableBody.prepend(nuovaRiga);

          // riattiva il delete sul nuovo bottone
          nuovaRiga.querySelector(".btn.delete").addEventListener("click", function () {
            const row = this.closest("tr");
            confirmDeleteAction({
              url: `/CartellaPaziente/${result.id}/Diagnosi`,
              elementToRemove: row,
              successMessage: "Diagnosi eliminata con successo!",
              errorMessage: "Errore nella cancellazione della diagnosi",
              confirmMessage: "Sei sicuro di voler eliminare questa diagnosi?",
              borderColor: "#EF4444",
            });
          });
        } else {
          // ✏️ modifica: aggiorna solo la riga esistente
          const row = tableBody.querySelector(`tr[data-id="${result.id}"]`);
          if (row) {
            row.querySelector(".td-descrizione").textContent = result.descrizione;
            const badge = row.querySelector(".td-gravita .badge");
            badge.textContent = getGravitaLabel(result.gravita);
            badge.className = "badge " + getBadgeClass(result.gravita);
            row.querySelector(".td-data").textContent = formatDataItaliana(result.data_diagnosi);
            row.querySelector(".td-stato").textContent = result.stato;
            row.querySelector(".td-risolta").textContent = result.risolta ? "Si" : "No";
          }
        }

        closeModal();

        await refreshDiagnosiTable();
      } else {
        showAlert({
          message: isEdit
            ? "Errore nella modifica della diagnosi."
            : "Errore nel salvataggio della diagnosi.",
          type: "error",
          extraMessage: "",
          borderColor: "#f44336",
        });
      }

      // Aggiorna la tabella
      if (isEdit) {
        const row = document.querySelector(`tr[data-id='${data.id}']`);
        if (row) {
          row.querySelector(".td-descrizione").textContent = data.descrizione;
          row.querySelector(".td-data").textContent = formatDateItalian(
            data.data_diagnosi
          );
          row.querySelector(".td-stato").textContent = data.stato;

          const gravitaBadge = row.querySelector(".td-gravita .badge");
          gravitaBadge.textContent = getGravitaLabel(data.gravita);
          gravitaBadge.className = "badge " + getBadgeClass(data.gravita);
        }
      }
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      showAlert({
        type: "danger",
        message: "Si è verificato un errore inaspettato.",
        extraMessage: "",
        borderColor: "#EF4444",
      });
    }
  });
});

// Funzione per eliminare una diagnosi
document.querySelectorAll(".btn.delete").forEach((btn) => {
  btn.addEventListener("click", function () {
    const diagnosiId = this.dataset.id;
    const row = this.closest("tr");
    confirmDeleteAction({
      url: `/CartellaPaziente/${pazienteId}/Diagnosi/${diagnosiId}/delete/`,
      elementToRemove: row,
      successMessage: "Appuntamento eliminato con successo!",
      errorMessage: "Errore nella cancellazione dell'appuntamento",
      confirmMessage: "Sei sicuro di voler eliminare questo appuntamento?",
      borderColor: "#EF4444",
    });
  });
});

/*  -----------------------------------------------------------------------------------------------
  Funzione per compilare la modale
--------------------------------------------------------------------------------------------------- */
function compilaDiagnosi(diagnosiId) {
  const form = document.getElementById("diagnosis-form");

  fetch(`/diagnosi/${diagnosiId}/dettagli/`)
    .then((res) => res.json())
    .then((data) => {
      form.descrizione.value = data.descrizione;
      form.data_diagnosi.value = data.data_diagnosi;
      form.stato.value = data.stato;
      form.note.value = data.note;
      form.gravita.value = data.gravita;
      form.risolta.checked = data.risolta;
      document.getElementById("id_diagnosi").value = data.id;
      // Forza aggiornamento indicatore
      const range = document.getElementById("gravitaRange");
      range.value = data.gravita;
      range.dispatchEvent(new Event("input")); // aggiorna il range manualmente

      // Anima la modale come già fai
      tl.play(0);
      modal.style.pointerEvents = "auto";
      document.body.style.overflow = "hidden";
    })
    .catch((err) => {
      console.error("Errore nel recupero diagnosi:", err);
      alert("Errore nel caricamento della diagnosi.");
    });
}

// Aggiungi la funzione al caricamento della pagina
window.compilaDiagnosi = compilaDiagnosi;
