import showAlert from "../../components/showAlert.js";

/*  -----------------------------------------------------------------------------------------------
   FUNZIONE PER LA GESTIONE DELLA MODAL DEI COMMENTI
--------------------------------------------------------------------------------------------------- */

/*  -----------------------------------------------------------------------------------------------
    GESTIONE MODALE NOTE/COMMENTI – con CSRF
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------------------------------------------
  // CSRF HELPER
  // ------------------------------------------------------------------
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      for (const cookie of document.cookie.split(";")) {
        const c = cookie.trim();
        if (c.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(c.slice(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  const csrftoken = getCookie("csrftoken");

  // ------------------------------------------------------------------
  // ELEMENTI & VARIABILI
  // ------------------------------------------------------------------
  const btnOpen       = document.getElementById("btn_note_commenti");
  const patientId     = btnOpen.dataset.pazienteId;
  const baseUrl       = `/pazienti/${patientId}/note/`;    // <— se hai mantenuto l’URL senza /api/
  // const baseUrl    = `/api/pazienti/${patientId}/note/`; // <— usa questo se la rotta è con /api/

  const modal         = document.getElementById("notes-modal");
  const btnClose      = modal.querySelector(".modal-close");
  const titleInput    = document.getElementById("note-title");
  const contentInput  = document.getElementById("note-content");
  const saveBtn       = document.getElementById("save-note-btn");
  const listContainer = document.getElementById("notes-list");

  const viewModal     = document.getElementById("view-note-modal");
  const viewTitle     = document.getElementById("view-note-title");
  const viewContent   = document.getElementById("view-note-content");
  const viewClose     = viewModal.querySelector(".modal-close");

  let notes   = [];
  let editId  = null;

  viewModal.style.display = "none";

  // ------------------------------------------------------------------
  // ANIMAZIONI MODALE
  // ------------------------------------------------------------------
  function openModal() {
    modal.classList.remove("hidden");
    gsap.fromTo("#notes-modal .modal-content",
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3 });
  }
  function closeModal() {
    gsap.to("#notes-modal .modal-content",
      { scale: 0.8, opacity: 0, duration: 0.3,
        onComplete: () => {
          modal.classList.add("hidden");
          resetForm();
        } });
  }
  function openViewModal() {
    viewModal.style.display = "flex";
    gsap.fromTo("#view-note-modal .modal-content",
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3 });
  }
  function closeViewModal() {
    gsap.to("#view-note-modal .modal-content",
      { scale: 0.8, opacity: 0, duration: 0.3,
        onComplete: () => {
          viewModal.style.display = "none";
          viewTitle.textContent   = "";
          viewContent.textContent = "";
        } });
  }

  btnOpen.addEventListener("click", async () => { openModal(); await fetchNotes(); });
  btnClose.addEventListener("click", closeModal);
  viewClose.addEventListener("click", closeViewModal);
  viewModal.addEventListener("click", e => { if (e.target === viewModal) closeViewModal(); });


  // ------------------------------------------------------------------
  // RESET FORM & FLOAT LABELS
  // ------------------------------------------------------------------
  function resetForm() {
    titleInput.value    = "";
    contentInput.value  = "";
    saveBtn.textContent = "Aggiungi Nota";
    editId              = null;
    document.querySelectorAll(".floating-label")
            .forEach(lbl => lbl.classList.remove("active-label"));
  }
  [titleInput, contentInput].forEach(input => {
    const label = input.nextElementSibling;
    input.addEventListener("focus", () => label.classList.add("active-label"));
    input.addEventListener("blur",  () => { if (!input.value) label.classList.remove("active-label"); });
  });


  // ------------------------------------------------------------------
  // RENDER LISTA NOTE
  // ------------------------------------------------------------------
  function renderNotes() {
    listContainer.innerHTML = "";
    notes.forEach(note => {
      const div = document.createElement("div");
      div.classList.add("note-item");
      div.innerHTML = `
        <h3>${note.titolo}</h3>
        <p>${note.contenuto}</p>
        <button class="view-btn"   data-id="${note.id}" title="Visualizza">👁️</button>
        <button class="edit-btn"   data-id="${note.id}">Modifica</button>
        <button class="delete-btn" data-id="${note.id}">Elimina</button>
      `;
      listContainer.appendChild(div);
      gsap.to(div, { opacity: 1, y: 0, duration: 0.2, ease: "power1.out" });
    });
  }


  // ------------------------------------------------------------------
  // FETCH API
  // ------------------------------------------------------------------
  async function fetchNotes() {
    try {
      const res = await fetch(baseUrl, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Errore nel caricamento delle note");
      notes = await res.json();
      renderNotes();
    } catch (err) {
      showAlert({ type: "error", message: err.message, borderColor: "#EF4444" });
    }
  }

  // CREATE / UPDATE
  saveBtn.addEventListener("click", async () => {
    const patientId = btnOpen.dataset.pazienteId;
    const titolo     = titleInput.value.trim();
    const contenuto  = contentInput.value.trim();
    if (!titolo || !contenuto || !patientId) {
      return showAlert({
        type: "error",
        message: "Titolo e contenuto sono obbligatori.",
        borderColor: "#EF4444"
      });
    }

    const payload = { titolo, contenuto };
    let url       = baseUrl;
    let method    = "POST";
    if (editId !== null) {
      url    += `${editId}/`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Errore nel salvataggio della nota");
      resetForm();
      await fetchNotes();
    } catch (err) {
      showAlert({ type: "error", message: err.message, borderColor: "#EF4444" });
    }
  });


  // ------------------------------------------------------------------
  // CLICK su View / Edit / Delete
  // ------------------------------------------------------------------
  listContainer.addEventListener("click", async (e) => {
    const id = +e.target.dataset.id;

    // VIEW
    if (e.target.classList.contains("view-btn")) {
      const note = notes.find(n => n.id === id);
      viewTitle.textContent   = note.titolo;
      viewContent.textContent = note.contenuto;
      openViewModal();
    }

    // DELETE
    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("Eliminare questa nota?")) return;
      try {
        const res = await fetch(baseUrl + `${id}/`, {
          method: "DELETE",
          headers: { "X-CSRFToken": csrftoken },
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error("Errore eliminazione nota");
        await fetchNotes();
      } catch (err) {
        showAlert({ type: "error", message: err.message, borderColor: "#EF4444" });
      }
    }

    // EDIT
    if (e.target.classList.contains("edit-btn")) {
      const note = notes.find(n => n.id === id);
      titleInput.value            = note.titolo;
      contentInput.value          = note.contenuto;
      titleInput.nextElementSibling.classList.add("active-label");
      contentInput.nextElementSibling.classList.add("active-label");
      saveBtn.textContent         = "Aggiorna Nota";
      editId                      = id;
      titleInput.focus();
    }
  });

});

