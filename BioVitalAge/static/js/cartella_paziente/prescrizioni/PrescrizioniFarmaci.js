import showAlert from "../../components/showAlert.js";
import { renderingRisultati } from "./fetchDatiArchivioFarmaci.js";

/*  -----------------------------------------------------------------------------------------------
  Utility / reset messaggi
--------------------------------------------------------------------------------------------------- */

/*  Pulisci eventuali alert server-side e client-side precedenti */
function clearServerAlerts() {
  // 1) Messaggi Bootstrap/Django messages
  document.querySelectorAll(".alert").forEach((el) => el.remove());
  // 2) Container dedicato per showAlert (se presente)
  const sa = document.querySelector("#showAlertContainer");
  if (sa) sa.innerHTML = "";
  // 3) Card server-side del template (success / errore)
  document
    .querySelectorAll("#modal_message, .success_message, .erorre_message")
    .forEach((el) => el.remove());
}

/*  -----------------------------------------------------------------------------------------------
  Paginazione tabella coda
--------------------------------------------------------------------------------------------------- */

function updatePagination() {
  const tableContainer = document.querySelector(".table-content");
  if (!tableContainer) return;
  const rows = tableContainer.querySelectorAll(".rowModale");
  const rowsPerPage = 5;

  let currentPage = 1;

  function showPage(page) {
    rows.forEach((row, index) => {
      if (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) {
        gsap.to(row, {
          opacity: 1,
          height: "5rem",
          duration: 0.3,
          display: "flex",
          onStart: () => (row.style.display = "flex"),
        });
      } else {
        gsap.to(row, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          onComplete: () => (row.style.display = "none"),
        });
      }
    });
  }

  showPage(currentPage);
}

let arrayFoglio1 = [];

/*  -----------------------------------------------------------------------------------------------
  Popolazione menu e risultati modale farmaci
--------------------------------------------------------------------------------------------------- */

async function populateDropdown() {
  const data = await renderingRisultati();
  arrayFoglio1 = data[0].Foglio1;

  const menuTendinaModale = document.getElementById("menu_tendina_prescrizioni");
  if (!menuTendinaModale) return;
  menuTendinaModale.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Seleziona farmaco";
  placeholderOption.selected = true;
  menuTendinaModale.appendChild(placeholderOption);

  arrayFoglio1.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.NOME_FARMACO;
    option.textContent = item.NOME_FARMACO;
    menuTendinaModale.appendChild(option);
  });
}

async function populateResults(filteredData = null) {
  if (!filteredData) {
    const data = await renderingRisultati();
    arrayFoglio1 = data[0].Foglio1;
    filteredData = arrayFoglio1;
  }

  const resultContainer = document.querySelector(".Modale-Result-content");
  const tableContainer = document.querySelector(".table-content");
  if (!resultContainer || !tableContainer) return;

  resultContainer.innerHTML = "";

  filteredData.forEach((item) => {
    const row = document.createElement("div");
    row.classList.add("rowModale");

    let rowContent = `
      <div class="colModale">${item.CODICE_UNIVOCO_FARMACO_PIATTAFORMA || ""}</div>
      <div class="colModale nomeFarmaco">${item.NOME_FARMACO || ""}</div>
      <div class="colModale codici">${item.COD_AIC ? `${item.COD_AIC} <span> (cod. AIC) </span>` : ""}</div>
      <div class="colModale codici">${item.COD_ATC ? `${item.COD_ATC}<span> (cod. ATC) </span>` : ""}</div>
      <div class="colModale dosaggio">${item.DOSAGGIO || ""}</div>
      <div class="colModale apparato">${(item.APPARATO_or_I_SISTEMI || "").slice(0, 25)}</div>
      <div class="colModale">
        <button class="add-btn" 
          data-id="${item.id}"
          data-nome="${item.NOME_FARMACO}" 
          data-codice="${item.CODICE_UNIVOCO_FARMACO_PIATTAFORMA || ""}"
          data-aic="${item.COD_AIC || ""}"
          data-atc="${item.COD_ATC || ""}" 
          data-dosaggio="${item.DOSAGGIO || ""}"
          data-principio="${item.PRINCIPIO_ATTIVO || ""}"
          data-apparato="${item.APPARATO_or_I_SISTEMI || ""}">
          ➕
        </button>
      </div>
    `;

    row.innerHTML = rowContent;
    resultContainer.appendChild(row);
  });

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const farmacoId = event.currentTarget.getAttribute("data-id");
      const farmacoNome = event.currentTarget.getAttribute("data-nome");
      const farmacoCodice = event.currentTarget.getAttribute("data-codice");
      const farmacoAic = event.currentTarget.getAttribute("data-aic");
      const farmacoAtc = event.currentTarget.getAttribute("data-atc");
      const farmacoDosaggio = event.currentTarget.getAttribute("data-dosaggio");
      const farmacoPrincipio = event.currentTarget.getAttribute("data-principio");
      const farmacoApparato = event.currentTarget.getAttribute("data-apparato");

      // Dedup: per codice, oppure (nome + dosaggio) se codice mancante
      const alreadyExists = Array.from(tableContainer.children).some((row) => {
        const codeTxt = row.querySelector('[name="codiceFarmaco"]')?.textContent?.trim() || "";
        const nameTxt = row.querySelector(".nomeFarmaco")?.textContent?.trim().toLowerCase() || "";
        const doseTxt = row.querySelector(".dosaggio")?.textContent?.trim().toLowerCase() || "";

        if (farmacoCodice && codeTxt) return codeTxt === farmacoCodice;
        return (
          nameTxt === (farmacoNome || "").toLowerCase().trim() &&
          doseTxt === (farmacoDosaggio || "").toLowerCase().trim()
        );
      });

      if (alreadyExists) {
        clearServerAlerts();
        showAlert({
          type: "warning",
          message: "Il farmaco è già stato aggiunto!",
          borderColor: "#f97316",
        });
        return;
      }

      // Aggiunta riga in coda
      const tableRow = document.createElement("div");
      tableRow.classList.add("rowModale", "coda-item");
      tableRow.setAttribute("data-id", farmacoId);
      tableRow.innerHTML = `
        <div class="colModale" name="codiceFarmaco">${farmacoCodice}</div>
        <input type="hidden" id="codiceFarmacoInput" name="codiceFarmaco" value="${farmacoCodice}">
        <div class="colModale nomeFarmaco">${farmacoNome}</div>
        <div class="colModale codici">${farmacoAic ? `${farmacoAic} (cod. AIC)` : ""}</div>
        <div class="colModale codici">${farmacoAtc ? `${farmacoAtc} (cod. ATC)` : ""}</div>
        <div class="colModale dosaggio">${farmacoDosaggio}</div>
        <div class="colModale apparati">${farmacoApparato}</div>
        <div class="colModale">
          <button class="remove-btn">❌</button>
        </div>
      `;

      tableContainer.appendChild(tableRow);

      tableRow.querySelector(".remove-btn").addEventListener("click", () => {
        tableRow.remove();
        updatePagination();
      });

      updatePagination();
    });
  });

  updatePagination();
}

/*  -----------------------------------------------------------------------------------------------
  Filtri + Select singolo
--------------------------------------------------------------------------------------------------- */

function filterResults() {
  const searchText = document.querySelector(".barra-ricercaModale input")?.value.toLowerCase() || "";
  const selectedFilter = document.querySelector(".ModaleHeader select")?.value;

  let filteredData = arrayFoglio1.filter((item) => {
    if (!searchText) return true;
    return (
      item.NOME_FARMACO?.toLowerCase().includes(searchText) ||
      item.PRINCIPIO_ATTIVO?.toLowerCase().includes(searchText) ||
      item.COD_AIC?.toString().toLowerCase().includes(searchText) ||
      item.COD_ATC?.toString().toLowerCase().includes(searchText) ||
      item.DOSAGGIO?.toLowerCase().includes(searchText)
    );
  });

  switch (selectedFilter) {
    case "1":
      filteredData.sort((a, b) => a.NOME_FARMACO.localeCompare(b.NOME_FARMACO));
      break;
    case "2":
      filteredData.sort((a, b) => b.NOME_FARMACO.localeCompare(a.NOME_FARMACO));
      break;
    case "3":
      filteredData.sort(
        (a, b) =>
          (a.PRINCIPIO_ATTIVO || "").localeCompare(b.PRINCIPIO_ATTIVO || "") ||
          a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;
    case "4":
      filteredData.sort(
        (a, b) =>
          (a.COD_AIC?.toString() || "").localeCompare(b.COD_AIC?.toString() || "") ||
          a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;
    case "5":
      filteredData.sort(
        (a, b) =>
          (a.COD_ATC?.toString() || "").localeCompare(b.COD_ATC?.toString() || "") ||
          a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;
    case "6":
      filteredData.sort(
        (a, b) =>
          (a.DOSAGGIO?.toString() || "").localeCompare(b.DOSAGGIO?.toString() || "") ||
          a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;
    default:
      break;
  }

  populateResults(filteredData);
}

function selectSingleResult() {
  const select = document.getElementById("menu_tendina_prescrizioni");
  if (!select) return;

  const selectedValue = select.value;

  if (selectedValue) {
    const selectedItem = arrayFoglio1.find((item) => item.NOME_FARMACO === selectedValue);
    populateResults(selectedItem ? [selectedItem] : []);
  } else {
    populateResults();
  }
}

document.querySelector(".barra-ricercaModale input")?.addEventListener("input", filterResults);
document.querySelector(".ModaleHeader select")?.addEventListener("change", filterResults);
document.getElementById("menu_tendina_prescrizioni")?.addEventListener("change", selectSingleResult);

populateDropdown();
populateResults();

/*  -----------------------------------------------------------------------------------------------
   Pacchetti → popolazione coda
--------------------------------------------------------------------------------------------------- */

const TERAPIE_MAP = {
  muscle: [
    { nome: "vitamina H (biotina)", dosaggio: "1 mg" },
    { nome: "taurina", dosaggio: "200 mg" },
    { nome: "L-Metionina", dosaggio: "80 mg" },
    { nome: "L-Carnitina", dosaggio: "1000 mg" },
    { nome: "alcool benzilico", dosaggio: "" },
    { nome: "acqua PPI", dosaggio: "q. b." },
  ],
  hangover: [
    { nome: "vitamina B1 (tiamina)", dosaggio: "800 mg" },
    { nome: "vitamina B2 (riboflavina)", dosaggio: "2 mg" },
    { nome: "taurina", dosaggio: "200 mg" },
    { nome: "vitamina C (acido ascorbico)", dosaggio: "1000 mg" },
    { nome: "L-arginina", dosaggio: "400 mg" },
    { nome: "alcool benzilico", dosaggio: "" },
    { nome: "acqua PPI", dosaggio: "q. b." },
  ],
  "nad+": [
    { nome: "NAD+", dosaggio: "150 / 400 / 500 / 1000 mg" },
    { nome: "sodio idrossido", dosaggio: "" },
    { nome: "acqua PPI", dosaggio: "q. b. 4 ml" },
  ],
  "detox + energy": [
    { nome: "NAD+", dosaggio: "150 / 400 / 500 / 1000 mg" },
    { nome: "sodio idrossido", dosaggio: "" },
    { nome: "acqua PPI", dosaggio: "q. b. 4 ml" },
  ],
  "detox plus": [
    { nome: "vitamina B1 (tiamina)", dosaggio: "800 mg" },
    { nome: "vitamina C (acido ascorbico)", dosaggio: "1000 mg" },
    { nome: "L-metionina", dosaggio: "80 mg" },
    { nome: "L-carnitina", dosaggio: "1000 mg" },
    { nome: "glutatione ridotto", dosaggio: "200 mg" },
    { nome: "alcool benzilico", dosaggio: "" },
    { nome: "acqua PPI", dosaggio: "q. b." },
  ],
};

function normalizePackageValue(val) {
  if (!val) return "";
  const v = val.trim().toLowerCase();
  if (v.includes("detox") && v.includes("energy")) return "detox + energy";
  return v; // muscle, nad+, detox plus, hangover
}

function createCodaRow({ nome, dosaggio }) {
  const row = document.createElement("div");
  row.classList.add("rowModale", "coda-item");

  row.innerHTML = `
    <div class="colModale" name="codiceFarmaco"></div>
    <input type="hidden" id="codiceFarmacoInput" name="codiceFarmaco" value="">
    <div class="colModale nomeFarmaco">${nome || ""}</div>
    <div class="colModale codici"></div>
    <div class="colModale codici"></div>
    <div class="colModale dosaggio">${dosaggio || ""}</div>
    <div class="colModale apparati">Pacchetto Terapie</div>
    <div class="colModale"><button class="remove-btn">❌</button></div>
  `;

  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    updatePagination();
  });

  return row;
}

function handleTerapieChange() {
  const select = document.getElementById("tendina_terapie");
  const tableContainer = document.querySelector(".table-content");
  if (!select || !tableContainer) return;

  const raw = select.options[select.selectedIndex]?.text || select.value || "";
  const key = normalizePackageValue(raw);

  // "0" = Pacchetti → svuoto la coda
  if (select.value === "0" || !key) {
    tableContainer.innerHTML = "";
    updatePagination();
    return;
  }

  const components = TERAPIE_MAP[key];
  if (!components) {
    tableContainer.innerHTML = "";
    updatePagination();
    return;
  }

  // Rimpiazzo completamente con i componenti del pacchetto
  tableContainer.innerHTML = "";
  components.forEach((comp) => {
    const row = createCodaRow(comp);
    tableContainer.appendChild(row);
  });

  updatePagination();
}

document.getElementById("tendina_terapie")?.addEventListener("change", handleTerapieChange);

/*  -----------------------------------------------------------------------------------------------
   Salvataggio massivo (singoli + pacchetti) — hardened
--------------------------------------------------------------------------------------------------- */

(function () {
  const oldBtn = document.getElementById("conferma-prescrizione-farmaci");
  if (!oldBtn) return;

  // 0) Rimuovi qualsiasi listener preesistente clonando il bottone
  const btn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(btn, oldBtn);

  // 1) Evita re-bind multipli tra ricarichi parziali
  if (window.__SAVE_PRESCRIZIONI_BOUND__) return;
  window.__SAVE_PRESCRIZIONI_BOUND__ = true;

  // 2) Assicura che il bottone non sia submit
  btn.setAttribute("type", "button");

  // 3) Blocca il submit nativo del form che contiene il bottone (evita doppio invio)
  const formEl = btn.closest("form");
  if (formEl && !formEl.dataset.boundPrevent) {
    formEl.dataset.boundPrevent = "1";
    formEl.addEventListener(
      "submit",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      },
      { capture: true }
    );
  }

  let isSavingLocal = false;

  const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ||
    document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
    "";

  btn.addEventListener(
    "click",
    async (e) => {
      // Intercetta prima di altri listener ed evita doppie esecuzioni
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ || isSavingLocal) return;
      window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = true;
      isSavingLocal = true;
      btn.disabled = true;

      const tableContainer = document.querySelector(".table-content");
      if (!tableContainer) {
        window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = false;
        isSavingLocal = false;
        btn.disabled = false;
        return;
      }

      // Raccogli tutte le righe in coda (singoli + pacchetto)
      const rows = tableContainer.querySelectorAll(".coda-item");
      const items = Array.from(rows)
        .map((row) => {
          const codice = row.querySelector('[name="codiceFarmaco"]')?.textContent?.trim() || "";
          const nome = row.querySelector(".nomeFarmaco")?.textContent?.trim() || "";
          const dosaggio = row.querySelector(".dosaggio")?.textContent?.trim() || "";
          return { codice, nome, dosaggio };
        })
        .filter((i) => i.nome || i.codice);

      if (!items.length) {
        clearServerAlerts();
        showAlert({
          type: "warning",
          message: "Nessun farmaco in coda da salvare.",
          borderColor: "#f97316",
        });
        window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = false;
        isSavingLocal = false;
        btn.disabled = false;
        return;
      }

      // Campi opzionali dalla modale (se presenti)
      const data_inizio = document.getElementById("data_inizio")?.value || "";
      const data_fine = document.getElementById("data_fine")?.value || "";
      const diagnosi = document.getElementById("diagnosi")?.value || "";
      const note_medico = document.getElementById("note_medico")?.value || "";
      const posologia_personalizzata =
        document.getElementById("posologia_personalizzata")?.value || "";

      const formData = new FormData();
      formData.append("action", "save_prescrizioni");
      formData.append("items", JSON.stringify(items));
      formData.append("data_inizio", data_inizio);
      formData.append("data_fine", data_fine);
      formData.append("diagnosi", diagnosi);
      formData.append("note_medico", note_medico);
      formData.append("posologia_personalizzata", posologia_personalizzata);

      try {
        // PULIZIA alert preesistenti (client + server-side)
        clearServerAlerts();

        const resp = await fetch(window.location.pathname, {
          method: "POST",
          headers: {
            "X-CSRFToken": getCsrfToken(),
            "X-Requested-With": "XMLHttpRequest", // forza JSON lato server
          },
          body: formData,
        });

        let data = {};
        try {
          data = await resp.json();
        } catch (_) {
          data = {};
        }

        // Errore HTTP o success false -> SOLO errore
        if (!resp.ok || data.success === false) {
          showAlert({
            type: "error",
            message: (data && data.error) || "Errore nel salvataggio prescrizioni.",
            borderColor: "#dc2626",
          });
          return;
        }

        const created = Number(data.created || 0);
        const skipped = Number(data.skipped || 0);

        // Pulizia extra prima di mostrare il risultato definitivo
        clearServerAlerts();

        if (created > 0) {
        // SOLO SUCCESSO
        showAlert({
          type: "success",
          message: `Prescrizioni salvate (${created})${skipped ? ` • Duplicati ignorati: ${skipped}` : ""}.`,
          borderColor: "#16a34a",
        });

        // pulisco la coda
        tableContainer.innerHTML = "";
        updatePagination();

        // 🔄 refresh automatico dopo 1.5s
        setTimeout(() => {
          location.reload();
        }, 1500);
      } else {
          // Nessuna nuova creazione (tutti duplicati) → SOLO WARNING
          showAlert({
            type: "warning",
            message: "Nessuna nuova prescrizione: tutti i farmaci erano già presenti.",
            borderColor: "#f97316",
          });
        }
      } catch (err) {
        clearServerAlerts();
        showAlert({
          type: "error",
          message: "Errore di rete nel salvataggio.",
          borderColor: "#dc2626",
        });
        console.error(err);
      } finally {
        window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = false;
        isSavingLocal = false;
        btn.disabled = false;
      }
    },
    { capture: true } // intercetta prima di eventuali listener terzi
  );
})();
