import showAlert from "../../components/showAlert.js";
import { renderingRisultati } from "./fetchDatiArchivioFarmaci.js";

/*  -----------------------------------------------------------------------------------------------
  Utility / reset messaggi
--------------------------------------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------------------------------------
  Helpers PDF
--------------------------------------------------------------------------------------------------*/
async function loadLogoBytes() {
  const paths = [
    "/static/includes/pdfTemplates/logo.png",
    "/static/image/logo.png",
  ];
  for (const url of paths) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}
  }
  return null;
}

function wrapTextToLines(text, font, size, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
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
      const farmacoNome = event.currentTarget.getAttribute("data-nome");
      const farmacoCodice = event.currentTarget.getAttribute("data-codice");
      const farmacoAic = event.currentTarget.getAttribute("data-aic");
      const farmacoAtc = event.currentTarget.getAttribute("data-atc");
      const farmacoDosaggio = event.currentTarget.getAttribute("data-dosaggio");
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
   Pacchetti → popolazione coda (immutato)
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
  return v;
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

  tableContainer.innerHTML = "";
  components.forEach((comp) => {
    const row = createCodaRow(comp);
    tableContainer.appendChild(row);
  });

  updatePagination();
}

document.getElementById("tendina_terapie")?.addEventListener("change", handleTerapieChange);

/*  -----------------------------------------------------------------------------------------------
   Generatore PDF "Consenso IV Therapy" (layout identico al .docx)
--------------------------------------------------------------------------------------------------- */
async function buildConsensoPdfURL({ items }) {
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib || {};
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0, 0, 0);
  const grey = rgb(0.65, 0.65, 0.65);

  // ==== HEADER (logo + titolo con posizionamento "safe") ====
  let headerBottomY = height - 30; // iniziale, verrà regolato
  const leftMargin = 40;

  // LOGO (opzionale)
  try {
    const logoBytes = await loadLogoBytes();
    if (logoBytes) {
      const png = await pdf.embedPng(logoBytes);
      const logoW = 150;
      const logoH = png.height * (logoW / png.width);
      const logoY = height - logoH - 30; // 30px dal bordo alto
      page.drawImage(png, { x: leftMargin, y: logoY, width: logoW, height: logoH });
      headerBottomY = logoY; // il titolo deve stare SOTTO al logo
    }
  } catch (_) {}

  // TITOLO centrato, 16px sotto il bordo inferiore dell'header
  const title = "CONSENSO INFORMATO PER TERAPIA ENDOVENOSA (IV THERAPY)";
  const titleSize = 14;
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
  const titleY = Math.min(headerBottomY - 16, height - 70); // minimo 70pt dal top
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: titleY,
    size: titleSize,
    font: fontBold,
    color: black,
  });

  // spessore sotto titolo
  let y = titleY - 24; // spazio dopo titolo
  const lineH = 18;
  const fieldLabelSize = 12;

  // ==== DATI PAZIENTE ====
  const paziente = String(window.PAZIENTE || "").trim();
  const dob = String(window.DOB_PAZIENTE || "").trim();

  page.drawText("Paziente:", { x: leftMargin, y, size: fieldLabelSize, font: fontBold });
  const nameStartX = leftMargin + 70;
  const nameLineW = 240;
  page.drawLine({
    start: { x: nameStartX, y: y - 2 },
    end: { x: nameStartX + nameLineW, y: y - 2 },
    color: grey,
    thickness: 0.8,
  });
  if (paziente) {
    page.drawText(paziente, { x: nameStartX + 4, y, size: fieldLabelSize, font });
  }
  y -= lineH;

  page.drawText("Data di nascita:", { x: leftMargin, y, size: fieldLabelSize, font: fontBold });
  const dobStartX = leftMargin + 110;
  const dobLineW = 160;
  page.drawLine({
    start: { x: dobStartX, y: y - 2 },
    end: { x: dobStartX + dobLineW, y: y - 2 },
    color: grey,
    thickness: 0.8,
  });
  if (dob) {
    page.drawText(dob, { x: dobStartX + 4, y, size: fieldLabelSize, font });
  }
  y -= lineH * 1.4;

  // ==== TERAPIA INDICATA ====
  page.drawText("TERAPIA INDICATA:", { x: leftMargin, y, size: fieldLabelSize, font: fontBold });
  y -= lineH;

  const margin = leftMargin;
  const maxW = width - margin * 2;
  const bulletIndent = 12;

  if (!items || !items.length) {
    page.drawText("—", { x: margin + bulletIndent, y, size: 12, font });
    y -= 16;
  } else {
    items.forEach((it) => {
      const line = `${it.nome}${it.dosaggio ? " — " + it.dosaggio : ""}`;
      const lines = wrapTextToLines(line, font, 12, maxW - bulletIndent);
      lines.forEach((ln) => {
        page.drawText(ln, { x: margin + bulletIndent, y, size: 12, font });
        y -= 16;
      });
    });
  }

  y -= 10;

  // ==== 1. Modalità di esecuzione ====
  page.drawText("1. Modalità di esecuzione", { x: margin, y, size: 12, font: fontBold });
  y -= lineH;

  const bullets1 = [
    "L’infusione viene eseguita da personale sanitario qualificato, tramite accesso venoso periferico con materiale sterile monouso.",
    "La durata media del trattamento varia da 20 a 60 minuti, a seconda della miscela prescritta.",
    "Durante la procedura il paziente è monitorato e assistito.",
  ];
  bullets1.forEach((t) => {
    const lines = wrapTextToLines("• " + t, font, 12, maxW);
    lines.forEach((ln) => {
      page.drawText(ln, { x: margin, y, size: 12, font });
      y -= 15;
    });
  });

  y -= 6;

  // ==== 2. Dichiarazioni del paziente ====
  page.drawText("2. Dichiarazioni del paziente", { x: margin, y, size: 12, font: fontBold });
  y -= lineH;

  const bullets2Intro =
    "Dichiaro di essere stato/a informato/a in modo chiaro e comprensibile riguardo a:";
  wrapTextToLines(bullets2Intro, font, 12, maxW).forEach((ln) => {
    page.drawText(ln, { x: margin, y, size: 12, font });
    y -= 15;
  });

  const bullets2 = [
    "la natura e finalità della IV Therapy,",
    "i benefici attesi e i rischi potenziali,",
    "le possibili alternative terapeutiche,",
    "la libertà di revocare in qualsiasi momento il consenso.",
  ];
  bullets2.forEach((t) => {
    wrapTextToLines("• " + t, font, 12, maxW).forEach((ln) => {
      page.drawText(ln, { x: margin, y, size: 12, font });
      y -= 15;
    });
  });

  const confermo =
    "Confermo di aver avuto la possibilità di porre domande e di aver ricevuto risposte esaurienti.";
  wrapTextToLines(confermo, font, 12, maxW).forEach((ln) => {
    page.drawText(ln, { x: margin, y, size: 12, font });
    y -= 15;
  });

  y -= 6;

  // Checkbox consenso
  const cbSize = 10;
  function drawCheckboxLine(text) {
    page.drawRectangle({
      x: margin,
      y: y - (cbSize - 8),
      width: cbSize,
      height: cbSize,
      borderColor: black,
      borderWidth: 1,
    });
    page.drawText(text, { x: margin + cbSize + 6, y, size: 12, font });
    y -= 18;
  }
  drawCheckboxLine("Acconsento alla terapia endovenosa proposta.");
  drawCheckboxLine("Non acconsento alla terapia endovenosa.");

  y -= 6;

  // ==== 3. GDPR ====
  page.drawText("3. Trattamento dei dati personali (GDPR)", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
  });
  y -= lineH;

  const gdprTxt =
    "Autorizzo il trattamento dei miei dati personali e sanitari nel rispetto del Regolamento UE 2016/679 (GDPR) e delle normative vigenti, esclusivamente per finalità medico-assistenziali.";
  wrapTextToLines(gdprTxt, font, 12, maxW).forEach((ln) => {
    page.drawText(ln, { x: margin, y, size: 12, font });
    y -= 15;
  });

  // ==== FOOTER (ancorato in basso, mai sovrapposto) ====
  const bottomSafe = 100; // spazio riservato a firme & campi
  if (y < bottomSafe + 20) y = bottomSafe + 20; // evita collisioni

  const footerY = 85; // posizione fissa dal basso

  // Luogo e data
  page.drawText("Luogo e data:", { x: margin, y: footerY + 22, size: 12, font: fontBold });
  page.drawLine({
    start: { x: margin + 85, y: footerY + 20 },
    end: { x: margin + 300, y: footerY + 20 },
    color: grey,
    thickness: 0.8,
  });

  // Firme (righe + etichette SOTTO le righe, non sovrapposte)
  page.drawLine({
    start: { x: width - 270, y: footerY + 20 },
    end: { x: width - 60, y: footerY + 20 },
    color: grey,
    thickness: 0.8,
  });
  page.drawText("Firma del Paziente", {
    x: width - 270,
    y: footerY + 4,
    size: 11,
    font: fontBold,
  });

  page.drawLine({
    start: { x: width - 270, y: footerY - 20 },
    end: { x: width - 60, y: footerY - 20 },
    color: grey,
    thickness: 0.8,
  });
  page.drawText("Firma del Medico", {
    x: width - 270,
    y: footerY - 36,
    size: 11,
    font: fontBold,
  });

  const docName = String(window.DOTTORE || "");
  if (docName) {
    page.drawText(docName, {
      x: width - 268,
      y: footerY - 52,
      size: 10,
      font,
      color: grey,
    });
  }

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

/*  -----------------------------------------------------------------------------------------------
   Salvataggio massivo con ANTEPRIMA (hardened + corretto flusso)
--------------------------------------------------------------------------------------------------- */
(function () {
  const oldBtn = document.getElementById("conferma-prescrizione-farmaci");
  if (!oldBtn) return;

  // 🔒 rimuovi qualsiasi listener preesistente clonando il bottone
  const btn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(btn, oldBtn);

  // evita submit nativo
  btn.setAttribute("type", "button");

  // blocca il submit del form contenitore (se esiste)
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

  // evita rebind multipli cross-renders
  if (window.__SAVE_PRESCRIZIONI_BOUND__) return;
  window.__SAVE_PRESCRIZIONI_BOUND__ = true;

  let isSavingLocal = false;

  const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ||
    document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
    "";

  btn.addEventListener(
    "click",
    async (e) => {
      // intercetta prima e blocca tutto
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ || isSavingLocal) return;
      window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = true;
      isSavingLocal = true;

      const tableContainer = document.querySelector(".table-content");
      if (!tableContainer) {
        window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = false;
        isSavingLocal = false;
        return;
      }

      // raccogli elementi in coda
      const rows = tableContainer.querySelectorAll(".coda-item");
      const items = Array.from(rows)
        .map((row) => {
          const codice = row.querySelector('[name="codiceFarmaco"]')?.textContent?.trim() || "";
          const nome = row.querySelector(".nomeFarmaco")?.textContent?.trim() || "";
          const dosaggio = row.querySelector(".dosaggio")?.textContent?.trim() || "";
          return { codice, nome, dosaggio };
        })
        .filter((i) => i.nome || i.codice);

      // 👉 se non ci sono elementi, mostra solo il warning e FERMATI (nessuna modale)
      if (!items.length) {
        clearServerAlerts();
        showAlert({
          type: "warning",
          message: "Nessun farmaco in coda da salvare.",
          borderColor: "#f97316",
        });
        window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = false;
        isSavingLocal = false;
        return;
      }

      // === ANTEPRIMA PDF ===
      try {
        const url = await buildConsensoPdfURL({ items });

        // apri modale
        const modal = document.getElementById("previewPrescrizioniModal");
        const backdrop = document.getElementById("previewPrescrizioniBackdrop");
        const frame = document.getElementById("previewPrescrizioniFrame");
        const closeBtn = document.getElementById("closePreviewPrescrizioni");
        const downloadBtn = document.getElementById("downloadPrescrizioniPdf");
        const confirmBtn = document.getElementById("confirmSavePrescrizioni");

        if (!modal || !backdrop || !frame || !downloadBtn || !confirmBtn || !closeBtn) {
          // se manca la modale, non bloccare il flusso: salviamo direttamente (fallback)
          await doRealSave(items);
          return;
        }

        frame.src = url;
        modal.style.display = "flex";
        backdrop.style.display = "block";
        document.body.style.overflow = "hidden";

        downloadBtn.onclick = () => {
          const a = document.createElement("a");
          a.href = url;
          a.download = "Consenso_IV_Therapy.pdf";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
          }, 0);
        };

        const closeModal = () => {
          modal.style.display = "none";
          backdrop.style.display = "none";
          document.body.style.overflow = "auto";
          try { URL.revokeObjectURL(url); } catch (_) {}
        };

        closeBtn.onclick = closeModal;
        backdrop.onclick = (ev) => {
          if (ev.target === backdrop) closeModal();
        };

        confirmBtn.onclick = async () => {
          closeModal();
          await doRealSave(items);
        };
      } catch (err) {
        // se la generazione anteprima fallisce, prova a salvare comunque
        console.error(err);
        await doRealSave(items);
      } finally {
        window.__SAVE_PRESCRIZIONI_IN_PROGRESS__ = false;
        isSavingLocal = false;
      }
    },
    { capture: true }
  );

  // === FUNZIONE di salvataggio reale (identica alla tua logica originaria, con messaggi corretti) ===
  async function doRealSave(items) {
    const tableContainer = document.querySelector(".table-content");
    const data_inizio = document.getElementById("data_inizio")?.value || "";
    const data_fine = document.getElementById("data_fine")?.value || "";
    const diagnosi = document.getElementById("diagnosi")?.value || "";
    const note_medico = document.getElementById("note_medico")?.value || "";
    const posologia_personalizzata = document.getElementById("posologia_personalizzata")?.value || "";

    const formData = new FormData();
    formData.append("action", "save_prescrizioni");
    formData.append("items", JSON.stringify(items));
    formData.append("data_inizio", data_inizio);
    formData.append("data_fine", data_fine);
    formData.append("diagnosi", diagnosi);
    formData.append("note_medico", note_medico);
    formData.append("posologia_personalizzata", posologia_personalizzata);

    try {
      clearServerAlerts();

      const resp = await fetch(window.location.pathname, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCsrfToken(),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      });

      let data = {};
      try {
        data = await resp.json();
      } catch (_) {
        data = {};
      }

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

      clearServerAlerts();

      if (created > 0) {
        // ✅ SOLO SUCCESSO se abbiamo creato qualcosa
        showAlert({
          type: "success",
          message: `Prescrizioni salvate (${created})${skipped ? ` • Duplicati ignorati: ${skipped}` : ""}.`,
          borderColor: "#16a34a",
        });

        // pulizia coda
        if (tableContainer) {
          tableContainer.innerHTML = "";
          updatePagination();
        }

        setTimeout(() => {
          location.reload();
        }, 1500);
      } else {
        // ⚠️ Nessuna nuova creazione → WARNING, non success
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
    }
  }
})();
