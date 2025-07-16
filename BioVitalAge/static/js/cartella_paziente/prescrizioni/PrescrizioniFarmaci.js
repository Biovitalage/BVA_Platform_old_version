import { renderingRisultati } from "./fetchDatiArchivioFarmaci.js";

/*  FUNZIONE DI PAGINAZIONE DELLA TABELLA */
function updatePagination() {
  const tableContainer = document.querySelector(".table-content");
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

/* FUNZIONE DI POPOLAZIONE E RICERCA NELLA MODALE */
async function populateDropdown() {
  const data = await renderingRisultati();
  arrayFoglio1 = data[0].Foglio1;

  const menuTendinaModale = document.getElementById(
    "menu_tendina_prescrizioni"
  );
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
          const farmacoId = event.target.getAttribute("data-id");
          const farmacoNome = event.target.getAttribute("data-nome");
          const farmacoCodice = event.target.getAttribute("data-codice");
          const farmacoAic = event.target.getAttribute("data-aic");
          const farmacoAtc = event.target.getAttribute("data-atc");
          const farmacoDosaggio = event.target.getAttribute("data-dosaggio");
          const farmacoPrincipio = event.target.getAttribute("data-principio");
          const farmacoApparato = event.target.getAttribute("data-apparato");

          // Verifica se il farmaco è già stato aggiunto
          const alreadyExists = Array.from(tableContainer.children).some(row => 
              row.querySelector('[name="codiceFarmaco"]')?.textContent === farmacoCodice
          );

          if (alreadyExists) {
              alert("Il farmaco è già stato aggiunto!");
              return;
          }

          // Creazione della riga per la tabella
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

          // Aggiunge l'evento di rimozione alla riga
          tableRow.querySelector(".remove-btn").addEventListener("click", () => {
              tableRow.remove();
              updatePagination(); // Aggiorna la paginazione dopo la rimozione
          });

          updatePagination(); // Aggiorna la paginazione dopo l'aggiunta
      });
  });

  updatePagination();
}

function filterResults() {
  console.log("Filtraggio in corso...");

  const searchText = document
    .querySelector(".barra-ricercaModale input")
    .value.toLowerCase();
  const selectedFilter = document.querySelector(".ModaleHeader select").value;

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
      filteredData.sort((a, b) =>
        a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;

    case "2":
      filteredData.sort((a, b) =>
        b.NOME_FARMACO.localeCompare(a.NOME_FARMACO)
      );
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
          (a.COD_AIC?.toString() || "").localeCompare(
            b.COD_AIC?.toString() || ""
          ) || a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;

    case "5":
      filteredData.sort(
        (a, b) =>
          (a.COD_ATC?.toString() || "").localeCompare(
            b.COD_ATC?.toString() || ""
          ) || a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;

    case "6":
      filteredData.sort(
        (a, b) =>
          (a.DOSAGGIO?.toString() || "").localeCompare(
            b.DOSAGGIO?.toString() || ""
          ) || a.NOME_FARMACO.localeCompare(b.NOME_FARMACO)
      );
      break;

    default:
      break;
  }

  populateResults(filteredData);
}

function selectSingleResult() {
  const selectedValue = document.getElementById(
    "menu_tendina_prescrizioni"
  ).value;

  if (selectedValue) {
    const selectedItem = arrayFoglio1.find(
      (item) => item.NOME_FARMACO === selectedValue
    );
    populateResults(selectedItem ? [selectedItem] : []);
  } else {
    populateResults();
  }
}

document.querySelector(".barra-ricercaModale input").addEventListener("input", filterResults);
document.querySelector(".ModaleHeader select").addEventListener("change", filterResults);
document.getElementById("menu_tendina_prescrizioni").addEventListener("change", selectSingleResult);

populateDropdown();
populateResults();