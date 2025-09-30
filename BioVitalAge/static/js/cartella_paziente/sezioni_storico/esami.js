// esami.js
import { renderingRisultati } from "../prescrizioni/fetchDatiArchivio.js";
import showAlert from "../../components/showAlert.js";
import { confirmDeleteAction } from "../../components/deleteAction.js";

let arrayFoglio1 = [];

/* =======================================================================================
   PACCHETTI PRESCRIZIONI (supporto a prezzo + lista esami; case-insensitive matching)
   ======================================================================================= */
const pacchettiPrescrizioni = {
  "PACCHETTO CHECKUP COMPLETO DONNA": {
    prezzo: null,
    esami: [
      "EMOCROMO COMPLETO","SIDEREMIA","FERRITINA","TRANSFERRINA","AZOTEMIA","CREATININA","URICEMIA",
      "COLESTEROLO TOTALE","COLESTEROLO LDL","COLESTEROLO HDL","TRIGLICERIDI","GLICEMIA","INSULINA",
      "TRANSAMINASI (GOT)","TRANSAMINASI (GPT)","GAMMA-GT","FOSFATASI ALCALINA",
      "BILIRUBINA (TOTALE)","BILIRUBINA (DIRETTA)","BILIRUBINA (INDIRETTA)",
      "PCR-Proteina C Reattiva","ELETTROFORESI DELLE SIEROPROTEINE",
      "SODIO (Na)","POTASSIO (K)","MAGNESIO (Mg)","CALCIO (Ca)","FOSFORO (F)",
      "25OH VITAMINA D","TSH","ESAME DELLE URINE"
    ]
  },
  "PACCHETTO CHECKUP COMPLETO UOMO": {
    prezzo: null,
    esami: [
      "EMOCROMO COMPLETO","SIDEREMIA","FERRITINA","TRANSFERRINA","AZOTEMIA","CREATININA","URICEMIA",
      "COLESTEROLO TOTALE","COLESTEROLO LDL","COLESTEROLO HDL","TRIGLICERIDI","GLICEMIA","INSULINA",
      "TRANSAMINASI (GOT)","TRANSAMINASI (GPT)","GAMMA-GT","FOSFATASI ALCALINA",
      "BILIRUBINA (TOTALE)","BILIRUBINA (DIRETTA)","BILIRUBINA (INDIRETTA)",
      "PCR-Proteina C Reattiva","ELETTROFORESI DELLE SIEROPROTEINE",
      "SODIO (Na)","POTASSIO (K)","MAGNESIO (Mg)","CALCIO (Ca)","FOSFORO (F)",
      "PSA III GENERAZIONE","TSH","ESAME DELLE URINE"
    ]
  },

  // 🔹 NUOVI PACCHETTI RICHIESTI
  "CHECK UP TIROIDE BASE": {
    prezzo: 25.00,
    esami: ["FT3","FT4","TSH"]
  },
  "CHECK UP TIROIDE AVANZATO": {
    prezzo: 45.00,
    esami: ["FT3","FT4","TSH","ANTICORPI ANTI TPO","ANTICORPI ANTI TIREOGLOBULINA"]
  },
  "CHECK UP COAGULAZIONE": {
    prezzo: 30.00,
    esami: [
      "EMOCROMO COMPLETO",
      // ⚠️ Verifica denominazioni nel tuo Archivio (PT/PTT)
      "TEMPO DI TROMBOPLASTINA PARZIALE (PTT)",
      "TEMPO DI PROTROMBINA (PT)",
      "ANTITROMBINA III","FIBRINOGENO","D-DIMERO"
    ]
  },
  "CHECK UP GASTROENTEROLOGICO": {
    prezzo: 56.00,
    esami: [
      "AMILASI","LIPASI","TRANSAMINASI (GOT)","TRANSAMINASI (GPT)","GAMMA-GT",
      "HELICOBACTER PYLORI FECALE",
      "RICERCA SANGUE OCCULTO FECI SU 3 CAMPIONI"
    ]
  },
  "CHECK UP MALATTIE SESSUALMENTE TRASMISSIBILI": {
    prezzo: 68.00,
    esami: [
      "TPHA","VDRL","ANTICORPI ANTI HIV","HBSAG","ANTICORPI ANTI HCV",
      "ANTICORPI ANTI HERPES SIMPLEX 1/2 IGG","ANTICORPI ANTI HERPES SIMPLEX 1/2 IGM"
    ]
  },
  "CHECK UP MENOPAUSA": {
    prezzo: 50.00,
    esami: [
      "ORMONE FOLLICOLO STIMOLANTE (FSH)","ORMONE LUTEINIZZANTE (LH)",
      "ESTRADIOLO (17-BETA ESTRADIOLO - EII)","PROGESTERONE"
    ]
  }
};

// Mappa sinonimi (se nell'Archivio hai varianti di nomenclatura, aggiungile qui)
const sinonimi = {
  "GOT": "TRANSAMINASI (GOT)",
  "GPT": "TRANSAMINASI (GPT)",
  "GAMMAGT": "GAMMA-GT",
  "HELICOBACTER PYLORI FECALE": "HELICOBACTER PYLORI FECALE",
  "SANGUE OCCULTO FECI SU 3 CAMPIONI": "RICERCA SANGUE OCCULTO FECI SU 3 CAMPIONI",
  "PT": "TEMPO DI PROTROMBINA (PT)",
  "PTT": "TEMPO DI TROMBOPLASTINA PARZIALE (PTT)"
};
function normalizza(str) {
  return (str || "").toString().trim().toUpperCase();
}
function alias(descr) {
  const n = normalizza(descr);
  return sinonimi[n] || descr;
}

window.datiPacchettiEsami = {};
let datiFiltratiCheckup = [];

/* =======================================================================================
   POPOLAZIONE MODALE → MENU A TENDINA + LISTA RISULTATI
   ======================================================================================= */
async function populateDropdown() {
  const data = await renderingRisultati();
  arrayFoglio1 = data[0].Foglio1;

  const menuTendinaModale = document.getElementById("menu_tendina_prescrizioni");
  if (!menuTendinaModale) return;

  menuTendinaModale.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Seleziona esame";
  placeholderOption.selected = true;
  menuTendinaModale.appendChild(placeholderOption);

  arrayFoglio1.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.DESCRIZIONE_ESAME;
    option.textContent = item.DESCRIZIONE_ESAME;
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
  if (!resultContainer) return;

  resultContainer.innerHTML = "";

  filteredData.forEach((item) => {
    const row = document.createElement("div");
    row.classList.add("rowModale");

    let rowContent = `
      <div class="colModale">${item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || ""}</div>
      <div class="colModale nomeEsame">${item.DESCRIZIONE_ESAME || ""}</div>
      <div class="colModale codici">${item.COD_ASL ? `${item.COD_ASL} <span> (cod. asl) </span>` : ""}</div>
      <div class="colModale codici">${item.COD_REG ? `${item.COD_REG}<span> (cod. reg)</span>` : ""}</div>
      <div class="colModale metodica">${item.METODICA || ""}</div>
      <div class="colModale apparato">${(item.APPARATO_or_I_SISTEMI || "").slice(0, 25)}</div>
      <div class="colModale">
        <button class="add-btn" 
          data-id="${item.id}"
          data-nome="${item.DESCRIZIONE_ESAME}" 
          data-codice="${item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || ""}"
          data-asl="${item.COD_ASL || ""}"
          data-reg="${item.COD_REG || ""}" 
          data-metodica="${item.METODICA || ""}"
          data-apparato="${item.APPARATO_or_I_SISTEMI || ""}">
          ➕
        </button>
      </div>
    `;

    row.innerHTML = rowContent;
    resultContainer.appendChild(row);
  });

  // Gestione click "➕" su risultati modale
  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!tableContainer) return;
      const esameId = event.currentTarget.getAttribute("data-id");
      const esameNome = event.currentTarget.getAttribute("data-nome");
      const esameCodice = event.currentTarget.getAttribute("data-codice");
      const esameAsl = event.currentTarget.getAttribute("data-asl");
      const esameReg = event.currentTarget.getAttribute("data-reg");
      const esameMetodica = event.currentTarget.getAttribute("data-metodica");
      const esameApparato = event.currentTarget.getAttribute("data-apparato");

      // evita duplicati
      const alreadyExists = Array.from(tableContainer.children).some(
        (row) => row.querySelector('[name="codiceEsame"]')?.textContent === esameCodice
      );
      if (alreadyExists) {
        showAlert({
          type: "warning",
          message: "L'esame è già stato aggiunto!",
          borderColor: "#f97316",
        });
        return;
      }

      // aggiunge riga alla tabella principale
      const tableRow = document.createElement("div");
      tableRow.classList.add("rowModale", "coda-item");
      tableRow.setAttribute("data-id", esameId);
      tableRow.innerHTML = `
        <div class="colModale" name="codiceEsame">${esameCodice}</div>
        <input type="hidden" id="codiceEsameInput" name="codiceEsame" value="${esameCodice}">
        <div class="colModale nomeEsame">${esameNome}</div>
        <div class="colModale codici">${esameAsl ? `${esameAsl} (cod. asl)` : ""}</div>
        <div class="colModale codici">${esameReg ? `${esameReg} (cod. reg)` : ""}</div>
        <div class="colModale metodica">${esameMetodica}</div>
        <div class="colModale apparati">${esameApparato || ""}</div>
        <div class="colModale"><button class="remove-btn">❌</button></div>
      `;
      tableContainer.appendChild(tableRow);

      tableRow.querySelector(".remove-btn").addEventListener("click", () => {
        tableRow.remove();
        updatePagination(); // aggiorna paginazione dopo rimozione
      });

      updatePagination(); // aggiorna paginazione dopo aggiunta
    });
  });

  updatePagination();
}

function filterResults() {
  const searchText = document.querySelector(".barra-ricercaModale input")?.value.toLowerCase() || "";
  const selectedFilter = document.querySelector(".ModaleHeader select")?.value || "0";

  let filteredData = arrayFoglio1.filter((item) => {
    if (!searchText) return true;
    return (
      item.DESCRIZIONE_ESAME?.toLowerCase().includes(searchText) ||
      item.METODICA?.toLowerCase().includes(searchText) ||
      item.COD_ASL?.toString().toLowerCase().includes(searchText) ||
      item.COD_REG?.toString().toLowerCase().includes(searchText)
    );
  });

  switch (selectedFilter) {
    case "1":
      filteredData.sort((a, b) => a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)); break;
    case "2":
      filteredData.sort((a, b) => b.DESCRIZIONE_ESAME.localeCompare(a.DESCRIZIONE_ESAME)); break;
    case "3":
      filteredData.sort((a, b) =>
        (a.METODICA || "").localeCompare(b.METODICA || "") ||
        a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      ); break;
    case "4":
      filteredData.sort((a, b) =>
        (a.COD_ASL?.toString() || "").localeCompare(b.COD_ASL?.toString() || "") ||
        a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      ); break;
    case "5":
    case "6":
      filteredData.sort((a, b) =>
        (a.COD_REG?.toString() || "").localeCompare(b.COD_REG?.toString() || "") ||
        a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      ); break;
    default:
      break;
  }

  populateResults(filteredData);
}

function selectSingleResult() {
  const selectedValue = document.getElementById("menu_tendina_prescrizioni")?.value;
  if (selectedValue) {
    const selectedItem = arrayFoglio1.find((item) => item.DESCRIZIONE_ESAME === selectedValue);
    populateResults(selectedItem ? [selectedItem] : []);
  } else {
    populateResults();
  }
}

// Listeners (modale ricerche)
document.querySelector(".barra-ricercaModale input")?.addEventListener("input", filterResults);
document.querySelector(".ModaleHeader select")?.addEventListener("change", filterResults);
document.getElementById("menu_tendina_prescrizioni")?.addEventListener("change", selectSingleResult);

// bootstrap iniziale modale ricerche
populateDropdown();
populateResults();

/* =======================================================================================
   RICERCA nella TAB PRINCIPALE (tabella di coda + paginazione per ricerca locale)
   ======================================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("inputRicerca");
  const filterSelect = document.getElementById("filtriTabellaResult");
  const tableContent = document.querySelector(".table-content");
  const rowsPerPage = 5;
  let currentPage = 1;

  let allRows = Array.from(tableContent?.querySelectorAll(".rowTable") || []);

  function showPage(page, filteredRows) {
    allRows.forEach((row) => {
      gsap.to(row, {
        opacity: 0,
        height: 0,
        duration: 0.3,
        onComplete: () => (row.style.display = "none"),
      });
    });

    filteredRows.forEach((row, index) => {
      if (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) {
        gsap.to(row, {
          opacity: 1,
          height: "5rem",
          duration: 0.3,
          display: "flex",
          onStart: () => (row.style.display = "flex"),
        });
      }
    });
  }

  function updatePaginationControls(filteredRows) {
    let existingControls = tableContent?.querySelector(".pagination-controls");
    if (existingControls) existingControls.remove();

    const totalPages = Math.ceil((filteredRows?.length || 0) / rowsPerPage);
    if (!tableContent || totalPages <= 1) return;

    const controls = document.createElement("div");
    controls.classList.add("pagination-controls");

    if (currentPage > 1) {
      const firstPageBtn = document.createElement("button");
      firstPageBtn.classList.add("button-style-pagination");
      firstPageBtn.textContent = "«";
      firstPageBtn.addEventListener("click", () => {
        currentPage = 1;
        showPage(currentPage, filteredRows);
        updatePaginationControls(filteredRows);
      });
      controls.appendChild(firstPageBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("button-style-pagination");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = i;
        showPage(currentPage, filteredRows);
        updatePaginationControls(filteredRows);
      });
      controls.appendChild(btn);
    }

    if (currentPage < totalPages) {
      const lastPageBtn = document.createElement("button");
      lastPageBtn.classList.add("button-style-pagination");
      lastPageBtn.textContent = "»";
      lastPageBtn.addEventListener("click", () => {
        currentPage = totalPages;
        showPage(currentPage, filteredRows);
        updatePaginationControls(filteredRows);
      });
      controls.appendChild(lastPageBtn);
    }

    tableContent.appendChild(controls);
  }

  function filterTable() {
    if (!tableContent) return;
    const searchText = (searchInput?.value || "").toLowerCase();
    const selectedFilter = filterSelect?.value || "0";

    let filteredRows = [...allRows];

    if (searchText) {
      filteredRows = filteredRows.filter((row) =>
        Array.from(row.children).some((cell) =>
          cell.textContent.toLowerCase().includes(searchText)
        )
      );
    }

    switch (selectedFilter) {
      case "1":
        filteredRows.sort((a, b) =>
          a.children[1].textContent.localeCompare(b.children[1].textContent)
        ); break;
      case "2":
        filteredRows.sort((a, b) =>
          b.children[1].textContent.localeCompare(a.children[1].textContent)
        ); break;
      case "3":
        filteredRows.sort((a, b) =>
          a.children[4].textContent.localeCompare(b.children[4].textContent)
        ); break;
      case "4":
        filteredRows.sort((a, b) =>
          a.children[2].textContent.localeCompare(b.children[2].textContent)
        ); break;
      case "5":
        filteredRows.sort((a, b) =>
          a.children[3].textContent.localeCompare(b.children[3].textContent)
        ); break;
      case "6":
        filteredRows.sort((a, b) =>
          a.children[5].textContent.localeCompare(b.children[5].textContent)
        ); break;
    }

    currentPage = 1;
    showPage(currentPage, filteredRows);
    updatePaginationControls(filteredRows);
  }

  searchInput?.addEventListener("input", filterTable);
  filterSelect?.addEventListener("change", filterTable);

  showPage(1, allRows);
  updatePaginationControls(allRows);
});

/* =======================================================================================
   PAGINAZIONE per la TABELLA PRINCIPALE (riga aggiunte dalla modale)
   ======================================================================================= */
function updatePagination() {
  const tableContainer = document.querySelector(".table-content");
  const paginationContainer = document.getElementById("pagination_download");
  if (!tableContainer || !paginationContainer) return;

  const rows = tableContainer.querySelectorAll(".rowModale");
  const rowsPerPage = 5;

  let currentPage = 1;
  let totalPages = Math.ceil(rows.length / rowsPerPage);

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

  function updatePaginationControls() {
    let existingControls = paginationContainer.querySelector(".pagination-controls");
    if (existingControls) existingControls.remove();

    if (rows.length > rowsPerPage) {
      const controls = document.createElement("div");
      controls.classList.add("pagination-controls");

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.classList.add("button-style-pagination");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
          currentPage = i;
          showPage(currentPage);
          updatePaginationControls();
        });
        controls.appendChild(btn);
      }
      paginationContainer.appendChild(controls);
    }
  }

  showPage(currentPage);
  updatePaginationControls();
}

/* =======================================================================================
   INVIO CODICI ESAMI ALLA VIEW (submit form)
   ======================================================================================= */
document.getElementById("btnPdfGeneralPrescrizioni")?.addEventListener("click", function (event) {
  event.preventDefault();

  const tableContainer = document.querySelector(".table-content");
  if (!tableContainer) return;

  const codiceEsami = [];
  tableContainer.querySelectorAll(".rowModale [name='codiceEsame']").forEach((cell) => {
    codiceEsami.push(cell.textContent.trim());
  });

  if (codiceEsami.length === 0) {
    showAlert({
      type: "warning",
      message: "Nessun esame presente per il salvataggio.",
      borderColor: "#f97316",
    });
    return;
  }

  document.getElementById("codiciEsamiInput").value = JSON.stringify(codiceEsami);
  document.getElementById("saveForm").submit();
});

/* =======================================================================================
   MODALE PACCHETTI — CARICAMENTO e RENDER
   ======================================================================================= */
async function caricaTuttiIPacchetti() {
  try {
    const response = await fetch("/static/includes/json/ArchivioEsami.json");
    const data = await response.json();
    const archivio = data.Foglio1;

    const container = document.getElementById("modalePacchettiContainer");
    if (!container) return;
    container.innerHTML = "";

    for (let nomePacchetto in pacchettiPrescrizioni) {
      const def = pacchettiPrescrizioni[nomePacchetto];

      // retro-compatibilità: se è array → {prezzo:null, esami:[...]}
      const esami = Array.isArray(def) ? def : def.esami;
      const prezzo = Array.isArray(def) ? null : (def.prezzo ?? null);

      const datiFiltrati = archivio.filter((item) => {
        const de = normalizza(item.DESCRIZIONE_ESAME);
        return esami.some((esame) => {
          const target = normalizza(alias(esame));
          return de === target;
        });
      });

      creaBoxPacchetto(nomePacchetto, datiFiltrati, prezzo);
    }
  } catch (error) {
    console.error("Errore nel caricamento:", error);
  }
}

function creaBoxPacchetto(nomePacchetto, datiEsami, prezzo = null) {
  const container = document.getElementById("modalePacchettiContainer");
  if (!container) return;
  const idPacchetto = nomePacchetto.replaceAll(" ", "_");

  // memorizza per dettagli/aggiunta massiva
  window.datiPacchettiEsami[idPacchetto] = datiEsami;

  const box = document.createElement("div");
  box.classList.add("rowModale");

  box.innerHTML = `
    <div class="colModale nomePacchetto">
      ${nomePacchetto}
      ${prezzo !== null ? `<div class="prezzoPacchetto">€${prezzo.toFixed(2)}</div>` : ""}
    </div>
    <div class="colModale button-container-pacchetti">
      <button onclick='mostraDettagliPacchetto("${idPacchetto}")'>📋 Mostra Esami</button>
      <button title="Aggiungi tutti" onclick='aggiungiTuttiGliEsami("${idPacchetto}")'>➕</button>
    </div>
  `;

  container.appendChild(box);
}

function mostraDettagliPacchetto(idPacchetto) {
  const dettagli = document.getElementById("dettagliEsamiPacchetto");
  if (!dettagli) return;
  dettagli.innerHTML = "";

  const datiEsami = window.datiPacchettiEsami[idPacchetto];
  if (!datiEsami) {
    console.error("Pacchetto non trovato:", idPacchetto);
    return;
  }

  // titolo dinamico
  const titolo = document.querySelector("#modaleDettagliPacchetto h3");
  if (titolo) titolo.textContent = `Esami del ${idPacchetto.replaceAll("_", " ")}`;

  datiEsami.forEach((item) => {
    const row = document.createElement("div");
    row.classList.add("rowModale");
    row.innerHTML = `
      <div class="colModale">${item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || ""}</div>
      <div class="colModale nomeEsame">${item.DESCRIZIONE_ESAME || ""}</div>
      <div class="colModale codici">${item.COD_ASL ? `${item.COD_ASL} <span>(cod. asl)</span>` : ""}</div>
      <div class="colModale codici">${item.COD_REG ? `${item.COD_REG}<span>(cod. reg)</span>` : ""}</div>
      <div class="colModale metodica">${item.METODICA || ""}</div>
      <div class="colModale apparato">${(item.APPARATO_or_I_SISTEMI || "").slice(0, 25)}</div>
    `;
    dettagli.appendChild(row);
  });

  const modale = document.getElementById("modaleDettagliPacchetto");
  const backdrop = document.getElementById("backdropSecondario");
  if (modale) modale.style.display = "block";
  if (backdrop) backdrop.style.display = "block";
}

function closeModalDettagli() {
  const modale = document.getElementById("modaleDettagliPacchetto");
  const backdrop = document.getElementById("backdropSecondario");
  if (modale) modale.style.display = "none";
  if (backdrop) backdrop.style.display = "none";
}

function aggiungiTuttiGliEsami(idPacchetto) {
  const datiEsami = window.datiPacchettiEsami[idPacchetto];
  if (!datiEsami) {
    console.error(`❌ Nessun esame trovato per il pacchetto: ${idPacchetto}`);
    return;
  }

  const tabella = document.querySelector(".tabella-prescrizioni .table-content");
  if (!tabella) return;

  // se almeno un esame è già presente → avvisa e non duplica
  const esisteGia = datiEsami.some((item) => {
    const codice = item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || "";
    return Array.from(tabella.children).some(
      (row) => row.querySelector('[name="codiceEsame"]')?.textContent === codice
    );
  });

  if (esisteGia) {
    showAlert({
      type: "warning",
      message: "Gli esami del pacchetto sono già presenti nella tabella.",
      borderColor: "#f97316",
    });
    return;
  }

  // aggiungi tutti
  datiEsami.forEach((item) => {
    const codice = item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || "";

    const row = document.createElement("div");
    row.classList.add("rowModale");
    row.innerHTML = `
      <div class="colModale" name="codiceEsame">${codice}</div>
      <input type="hidden" name="codiceEsame" value="${codice}">
      <div class="colModale nomeEsame">${item.DESCRIZIONE_ESAME || ""}</div>
      <div class="colModale codici">${item.COD_ASL ? `${item.COD_ASL} (cod. asl)` : ""}</div>
      <div class="colModale codici">${item.COD_REG ? `${item.COD_REG} (cod. reg)` : ""}</div>
      <div class="colModale metodica">${item.METODICA || ""}</div>
      <div class="colModale apparato">${(item.APPARATO_or_I_SISTEMI || "").slice(0, 25)}</div>
      <div class="colModale"><button class="remove-btn">❌</button></div>
    `;
    tabella.appendChild(row);

    row.querySelector(".remove-btn").addEventListener("click", () => row.remove());
  });

  updatePagination();
  closeModalDettagli();
}

// Esponi in window per onclick inline
window.caricaTuttiIPacchetti = caricaTuttiIPacchetti;
window.mostraDettagliPacchetto = mostraDettagliPacchetto;
window.aggiungiTuttiGliEsami = aggiungiTuttiGliEsami;
window.closeModalDettagli = closeModalDettagli;

/* =======================================================================================
   DELETE ALL — PULIZIA TABELLA
   ======================================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const deleteButton = document.getElementById("deleteButton");

  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      const tableContent = document.querySelector(".tabella-prescrizioni .table-content");
      const pagination = document.querySelector(".pagination-controls");

      const hasRows = tableContent && tableContent.children.length > 0;

      if (!hasRows) {
        showAlert({
          type: "warning",
          message: "Nessun esame presente da eliminare.",
          borderColor: "#f97316",
        });
      } else {
        confirmDeleteAction({
          onConfirm: () => {
            if (tableContent) tableContent.innerHTML = "";
            if (pagination) pagination.remove();
            if (typeof updatePagination === "function") updatePagination();
          },
          successMessage: "Tutte le prescrizioni sono state eliminate.",
          errorMessage: "Errore nella rimozione delle prescrizioni.",
          confirmMessage: "Sei sicuro di voler eliminare tutte le prescrizioni?",
          borderColor: "#f97316",
        });
      }

      const originalDeleteAction = window.deleteAction;
      window.deleteAction = function ({ confirmAlert, successMessage }) {
        if (tableContent) tableContent.innerHTML = "";
        if (pagination) pagination.remove();
        if (typeof updatePagination === "function") updatePagination();
        if (confirmAlert) {
          gsap.to(confirmAlert, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => confirmAlert.remove(),
          });
        }
        showAlert({
          type: "success",
          message: successMessage,
          borderColor: "#22c55e",
        });
        window.deleteAction = originalDeleteAction;
      };
    });
  }
});

/* =======================================================================================
   (OPZIONALE) SELECT INIZIALE PACCHETTI (se presente nell'HTML)
   ======================================================================================= */
function populateSelectPacchetti(selectId = "selectPacchettiIniziale") {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  sel.innerHTML = "";
  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = "Seleziona pacchetto";
  ph.selected = true;
  sel.appendChild(ph);

  Object.keys(pacchettiPrescrizioni).forEach((nome) => {
    const def = pacchettiPrescrizioni[nome];
    const prezzo = Array.isArray(def) ? null : (def.prezzo ?? null);
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = prezzo !== null ? `${nome} — €${prezzo.toFixed(2)}` : nome;
    sel.appendChild(opt);
  });

  sel.addEventListener("change", () => {
    const nome = sel.value;
    if (!nome) return;
    // Apri la modale Pacchetti e scrolla al pacchetto selezionato
    if (typeof openModalPacchetti === "function") {
      openModalPacchetti();
      setTimeout(() => {
        const id = nome.replaceAll(" ", "_");
        const boxes = Array.from(document.querySelectorAll("#modalePacchettiContainer .rowModale"));
        const box = boxes.find((row) => row.querySelector(".nomePacchetto")?.textContent?.includes(nome));
        if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Popola la select se esiste nell'HTML
  populateSelectPacchetti();
});
