import showAlert from "../../components/showAlert.js";
import { confirmDeleteAction } from "../../components/deleteAction.js";


/* ------------------------------------------------------------------
   PAGINAZIONE CON DUE TABELLE (domiciliari / studio)
------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  // Delego il click all’intero documento
  document.addEventListener("click", async (event) => {

    // Cerco un link <a> dentro una .pagination_tabella
    const link = event.target.closest(".pagination_tabella a");
    if (!link) return;                 // non era un click di paginazione

    event.preventDefault();

    /*--------------------------------------------------------------
      1) capisco *quale* blocco tabella/pagination ha generato il click
    ----------------------------------------------------------------*/
    const pagination = link.closest(".pagination_tabella");
    const tableKey   = pagination.dataset.table;                     // "domiciliari" | "studio"

    // Il wrapper della tabella con lo stesso data‑table
    const wrapper = document.querySelector(`.table-wrapper[data-table="${tableKey}"]`);

    try {
      /*------------------------------------------------------------
        2) scarico la pagina richiesta e prelevo SOLO i frammenti
           relativi a quella tabella
      ------------------------------------------------------------*/
      const response = await fetch(link.href);
      const html     = await response.text();
      const doc      = new DOMParser().parseFromString(html, "text/html");

      const newWrapper    = doc.querySelector(`.table-wrapper[data-table="${tableKey}"]`);
      const newPagination = doc.querySelector(`.pagination_tabella[data-table="${tableKey}"]`);

      /*------------------------------------------------------------
        3) sostituisco i contenuti
      ------------------------------------------------------------*/
      wrapper.innerHTML    = newWrapper.innerHTML;
      pagination.innerHTML = newPagination.innerHTML;

    } catch (err) {
      console.error("Errore nella paginazione:", err);
    }
  });

});

// Attiva la funzione per aggiungere gli orari
document.getElementById("assunzioni").addEventListener("input", function () {
  const assunzioni = parseInt(this.value);
  const grid = document.getElementById("orari-grid");

  // ✅ Seleziona SOLO la label nel form di aggiunta
  const labelAggiunta = document.querySelector('#orari-grid').previousElementSibling;

  if (assunzioni && assunzioni > 0) {
    if (labelAggiunta) labelAggiunta.style.display = "none";
  } else {
    if (labelAggiunta) labelAggiunta.style.display = "block";
  }

  grid.innerHTML = "";

  if (!assunzioni || assunzioni < 1) {
    // Default: 1 input
    const defaultInput = document.createElement("input");
    defaultInput.type = "time";
    defaultInput.name = "orario1";
    defaultInput.className = "form-control";
    defaultInput.required = true;
    grid.appendChild(defaultInput);
    return;
  }

  for (let i = 1; i <= assunzioni; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "input-container mb-3";

    const label = document.createElement("label");
    label.className = "form-label-custom d-block";
    label.textContent = `Orario ${i}`;

    const input = document.createElement("input");
    input.type = "time";
    input.name = `orario${i}`;
    input.className = "form-control";

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    grid.appendChild(wrapper);
  }
});

// Elimina o modifica terapia domiciliare
document.addEventListener("DOMContentLoaded", function () {
  // Elimina terapia domiciliare
  document.querySelector("#tabella-terapie-domiciliari").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-elimina")) {
      const row = e.target.closest("tr");
  
      confirmDeleteAction({
        url: `/elimina-terapia-domiciliare/${e.target.dataset.id}/`,
        elementToRemove: row,
        successMessage: "Terapia eliminata con successo!",
        errorMessage: "Errore durante l'eliminazione della terapia.",
        confirmMessage: "Sei sicuro di voler eliminare questa terapia?",
        borderColor: "#EF4444",
      });
  
      // Dopo 400ms, controlla se la tabella è vuota e fai reload
      setTimeout(() => {
        const righeRestanti = document.querySelectorAll("#tabella-terapie-domiciliari tr");
        if (righeRestanti.length === 0) {
          location.reload();
        }
      }, 100);
    }
  });  

  // Modifica terapia domiciliare (puoi aprire una modale o popolare i campi)
  document.querySelector("#tabella-terapie-domiciliari").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-modifica")) {
      // 👉 Verifica il tipo di modale da aprire
      const tipoModale = e.target.dataset.modale;
  
      if (tipoModale === "domiciliare") {
        const id = e.target.dataset.id;
        fetch(`/terapie/domiciliare/${id}/dettagli/`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              document.getElementById("terapia-id-modifica").value = id;
              document.getElementById("farmaco-modifica").value = data.terapia.farmaco;
              document.getElementById("assunzioni-modifica").value = data.terapia.assunzioni;
              document.getElementById("data-inizio-modifica").value = data.terapia.data_inizio;
              document.getElementById("data-fine-modifica").value = data.terapia.data_fine || "";
  
              const orariContainer = document.getElementById("orari-modifica-container");
              orariContainer.innerHTML = "";                             
            }
          });
      }
    }
  });
});

// Attiva la funzione per aggiungere gli orari anche nella modale
document.addEventListener("DOMContentLoaded", function () {
  const orariContainer = document.getElementById("orari-modifica-container");
  const inputAssunzioni = document.getElementById("assunzioni-modifica");

  // Variabile globale per memorizzare gli orari dal backend
  let orariBackend = [];

  // Funzione per popolare i campi orari (usata sia inizialmente che dopo update)
  function aggiornaOrari(numero) {
    const defaultLabel = document.getElementById("label-default")
    orariContainer.innerHTML = "";

    for (let i = 1; i <= numero; i++) {
      const col = document.createElement("div");
      col.className = "col-md-6 orario-wrapper position-relative";

      const label = document.createElement("label");
      label.className = "form-label-custom d-block";
      label.textContent = `Orario ${i}`;

      const input = document.createElement("input");
      input.type = "time";
      input.name = `orario${i}`;
      input.className = "form-control";

      // Se esiste già un valore per questo orario, lo metto
      if (orariBackend[i - 1]) {
        input.value = orariBackend[i - 1];
      }

      col.appendChild(label);
      col.appendChild(input);
      orariContainer.appendChild(col);
    }
  }

  // Quando cambia il numero di assunzioni
  inputAssunzioni.addEventListener("input", function () {
    const numero = parseInt(this.value);
    
    if (!numero || isNaN(numero)) {
      aggiornaOrari(orariBackend.length);
      inputAssunzioni.value = orariBackend.length; // ripristina anche il numero mostrato
      return;
    }
  
    aggiornaOrari(numero);
  });  

  // Quando apro la modale, fetch dei dati dal backend
  document.querySelector("#tabella-terapie-domiciliari").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-modifica")) {
      // Mostra la MODALE CORRETTA
      const id = e.target.dataset.id;
      fetch(`/terapie/domiciliare/${id}/dettagli/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
            const modal = new bootstrap.Modal(
              document.getElementById("modaleModificaTerapia")
            );
            modal.show();
            
            document.getElementById("terapia-id-modifica").value = id;
            document.getElementById("farmaco-modifica").value =
              data.terapia.farmaco;
            document.getElementById("assunzioni-modifica").value =
              data.terapia.assunzioni;
            document.getElementById("data-inizio-modifica").value =
              data.terapia.data_inizio;
            document.getElementById("data-fine-modifica").value =
              data.terapia.data_fine || "";

            // Salvo gli orari originali
            orariBackend = Object.values(data.terapia.orari);

            // Mostro gli orari nella modale
            aggiornaOrari(data.terapia.assunzioni);

            // Gestione chiusura via pulsante X o "Chiudi"
            modalElement
              .querySelectorAll('[data-bs-dismiss="modal"]')
              .forEach((btn) => {
                btn.addEventListener("click", () => {
                  const backdrop = document.querySelector(".modal-backdrop");
                  if (backdrop) backdrop.remove(); // rimuove il background
                  document.body.classList.remove("modal-open"); // riattiva lo scroll della pagina
                  document.body.style.overflow = ""; // reset overflow
                  modal.hide(); // chiude la modale
                });
              });
          }
        });
    }
  });
});

// Salva modifiche terapia domiciliare dalla modale
document.addEventListener("DOMContentLoaded", function () {
  const formModifica = document.getElementById("form-modifica-terapia");

  formModifica.addEventListener("submit", function (e) {
    e.preventDefault(); // evita comportamento predefinito

    const formData = new FormData(formModifica);
    const terapiaId = formData.get("terapia_id");

    fetch(`/terapie/domiciliare/${terapiaId}/modifica/`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showAlert({
            type: "success",
            message: data.message,
            borderColor: "var(--positive-color)",
          });

          // Chiudi la modale dopo successo
          const modalElement = document.getElementById("modaleModificaTerapia");
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal.hide();

          // 👉 facoltativo: aggiorna la riga nella tabella, oppure fai reload
          location.reload();
        } else {
          showAlert({
            type: "danger",
            message: data.message || "Errore nella modifica della terapia",
            borderColor: "#ef4444",
          });
        }
      })
      .catch((err) => {
        console.error("Errore durante la modifica:", err);
        showAlert({
          type: "danger",
          message: "Errore del server.",
          borderColor: "#ef4444",
        });
      });
  });
});

// Attiva la funzione per salvare le terapie domiciliari
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('terapia-domiciliare-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // ✋ evita il refresh

    const formData = new FormData(form);

    fetch(window.location.href, {
      method: 'POST',
      headers: {
        'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
      },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // ✅ Aggiungi nuova terapia alla tabella
        const tbody = document.querySelector('#tabella-terapie-domiciliari');
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.terapia.id);
        // Converti gli orari in stringa leggibile
        const orariString = Object.values(data.terapia.orari).join(" - ");

        // Rimuovi eventuale riga placeholder ("Nessuna terapia registrata")
        const noTerapieRow = document.querySelector('#tabella-terapie-domiciliari .no-terapie-row');
        if (noTerapieRow) noTerapieRow.remove();

        row.innerHTML = `
          <td>${data.terapia.farmaco}</td>
          <td>${data.terapia.assunzioni}</td>
          <td>${orariString}</td>
          <td>${data.terapia.data_inizio}</td>
          <td>${data.terapia.data_fine || '—'}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-modifica" data-id="${data.terapia.id}" data-modale="domiciliare">✎</button>
            <button class="btn btn-sm btn-outline-danger btn-elimina" data-id="${data.terapia.id}">✖</button>
          </td>
        `;
        tbody.prepend(row); // metti in cima

        // ✅ Reset form
        form.reset();

        // ✅ Reset orari dinamici a 1 solo input
        const orariGrid = document.getElementById("orari-grid");
        orariGrid.innerHTML = "";
        const defaultInput = document.createElement("input");
        defaultInput.type = "time";
        defaultInput.name = "orario1";
        defaultInput.className = "form-control";
        defaultInput.required = true;
        orariGrid.appendChild(defaultInput);

        showAlert({
          type: "success",
          message: "Terapia Domiciliare salvata con successo.",
          borderColor: "var(--positive-color)"
        })
      } else {
        showAlert({
          type: "danger",
          message: `Errore: ${data.message}`,
          borderColor: "#ef4444",
        });
      }
    })
    .catch(err => {
      console.error('Errore invio:', err);
      showAlert({
        type: "danger",
        message: 'Errore di rete o del server.',
        borderColor: "#ef4444",
      });
    });
  });
});

// Attiva la funzione per salvare le terapie in studio
document.addEventListener("DOMContentLoaded", function () {
  const terapiaStudioForm = document.getElementById("studio-terapia-form");
  const tabellaTerapie = document.getElementById("tabella-terapie-studio");
  const modalElement = document.getElementById("studioModal");
  const modal = new bootstrap.Modal(modalElement);
  let terapiaInModificaId = null;

  terapiaStudioForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(terapiaStudioForm);

    const url = terapiaInModificaId
      ? `/modifica-terapia-studio/${terapiaInModificaId}/`
      : `/CartellaPaziente/${pazienteId}/Terapie`;

    fetch(url, {
      method: "POST",
      headers: {
        "X-CSRFToken": document.querySelector("[name=csrf-token]").content,
      },
      body: new URLSearchParams({
        form_type: "studio",
        tipologia: formData.get("tipologia"),
        descrizione: formData.get("descrizione"),
        data_inizio: formData.get("data_inizio"),
        data_fine: formData.get("data_fine"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.terapia) {
          const rigaHtml = `
              <tr data-id="${data.terapia.id}">
                <td>${data.terapia.descrizione}</td>
                <td>${data.terapia.data_inizio}</td>
                <td>${data.terapia.data_fine || "—"}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary btn-modifica" data-id="${
                    data.terapia.id
                  }">✎</button>
                  <button class="btn btn-sm btn-outline-danger btn-elimina" data-id="${
                    data.terapia.id
                  }">✖</button>
                </td>
              </tr>`;

          if (terapiaInModificaId) {
            const oldRow = tabellaTerapie.querySelector(
              `tr[data-id="${terapiaInModificaId}"]`
            );
            if (oldRow) oldRow.remove();
          }

          // Rimuove la riga "Nessuna terapia in studio registrata" se presente
          const noTerapieRow =
            tabellaTerapie.querySelector("tr td.text-muted")?.parentElement;
          if (noTerapieRow) noTerapieRow.remove();

          tabellaTerapie.insertAdjacentHTML("afterbegin", rigaHtml);

          terapiaStudioForm.reset();
          modal.hide();
          terapiaInModificaId = null;
          terapiaStudioForm.querySelector('button[type="submit"]').textContent =
            "Salva";
        } else {
          showAlert({
            type: "danger",
            message:
              "Errore nel salvataggio della terapia, controlla di aver compilato tutti i campi necessari.",
            borderColor: "#ef4444",
          });
        }
      })
      .catch(() => {
        showAlert({
          type: "danger",
          message: 'Errore durante la richiesta al server.',
          borderColor: "#ef4444",
        });
      });
  });

  // Event delegation: modifica + elimina
  tabellaTerapie.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    const id = e.target.dataset.id;

    // MODIFICA
    if (e.target.classList.contains("btn-modifica")) {
      terapiaInModificaId = id;
      const descrizione = row.children[0].innerText;
      const dataInizio = row.children[1].innerText
        .split("/")
        .reverse()
        .join("-");
      const dataFine =
        row.children[2].innerText !== "—"
          ? row.children[2].innerText.split("/").reverse().join("-")
          : "";

      terapiaStudioForm.querySelector('[name="tipologia"]').value =
        "IV Therapy";
      terapiaStudioForm.querySelector('[name="descrizione"]').value =
        descrizione;
      terapiaStudioForm.querySelector('[name="data_inizio"]').value =
        dataInizio;
      terapiaStudioForm.querySelector('[name="data_fine"]').value = dataFine;
      terapiaStudioForm.querySelector('button[type="submit"]').textContent =
        "Salva Modifiche";
      modal.show();
    }

    // ELIMINA
    const btnElimina = row.querySelector(".btn-elimina");

    btnElimina.addEventListener("click", () => {
      confirmDeleteAction({
        url: `/elimina-terapia-studio/${id}/`,
        elementToRemove: row,
        successMessage: "Terapia eliminata con successo!",
        errorMessage: "Errore durante l'eliminazione della terapia.",
        confirmMessage: "Sei sicuro di voler eliminare questa terapia?",
        borderColor: "#EF4444",
      });
    });
  });
});

/*  -----------------------------------------------------------------------------------------------
    FUNZIONI PER GENERARE IL DOCX
--------------------------------------------------------------------------------------------------- */
// Funzione per caricare l'immagine e creare un paragrafo con l'immagine
async function loadImageToParagraph(url, width, height) {
  const response = await fetch(url);
  const blob = await response.blob();
  const imageData = await blob.arrayBuffer();

  return new window.docx.Paragraph({
      children: [
          new window.docx.ImageRun({
              data: imageData,
              transformation: {
                  width: width,
                  height: height,
              },
          }),
      ],
      alignment: window.docx.AlignmentType.CENTER
  });
}

// Funzione per generare il docx
async function generateDocx() {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, Media } = window.docx;

  const persona = {
      name: pazienteName,
      surname: pazienteSurname,
      pob: pazientePob,
      dob: pazienteDob
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const doc = new Document({
      creator: "Sant'Andrea Longevity",
      description: "Prescrizione Esami",
      title: "Prescrizione Esami Utente",
      sections: [{
          properties: {},
          children: [

              // LOGO PICCOLO ALTO
              await loadImageToParagraph("/static/includes/pdfTemplates/logo2.png", 200, 80),

              new Paragraph({ text: "", spacing: { after: 400 } }),

              // DATI PAZIENTE DESTRA
              new Paragraph({
                  text: `Sig.ra/Sig. ${persona.name} ${persona.surname}`,
                  alignment: AlignmentType.RIGHT,
                  spacing: { 
                      after: 200,
                      before: 400
                   }
              }),

              new Paragraph({
                  text: "Si prescrivono i seguenti esami:",
                  bold: true,
                  spacing: { after: 4000 }
              }),


              new Paragraph({
                  text: `Bari, ${formattedDate}`,
                  spacing: { after: 400 }
              }),

              new Paragraph({
                  text: "Dott. Luigi Aprile:",
                  alignment: AlignmentType.RIGHT,
              }),

              new Paragraph({ text: "", spacing: { after: 4000 } }),

              await loadImageToParagraph("/static/includes/pdfTemplates/logo.png", 250, 100),
          ]
      }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${persona.name}_${persona.surname}.docx`;
  link.click();
}

// Attiva la funzione generateDocx al caricamento della pagina
document.addEventListener('DOMContentLoaded', function () {
  const downloadButton = document.getElementById('downloadPrescrizioneVuota');

  if (downloadButton) {
      downloadButton.addEventListener('click', generateDocx);
  }
});