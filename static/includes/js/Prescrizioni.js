import { renderingRisultati } from "./fetchDatiArchivio.js";

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

  resultContainer.innerHTML = "";

  filteredData.forEach((item) => {
      const row = document.createElement("div");
      row.classList.add("rowModale");

      let rowContent = `
          <div class="colModale">${item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || ""}</div>
          <div class="colModale nomeEsame">${item.DESCRIZIONE_ESAME || ""}</div>
          <div class="colModale">${item.COD_ASL ? `${item.COD_ASL} <span> (cod. asl) </span>` : ""}</div>
          <div class="colModale">${item.COD_REG ? `${item.COD_REG}<span> (cod. reg)</span>` : ""}</div>
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

  document.querySelectorAll(".add-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
          const esameId = event.target.getAttribute("data-id");
          const esameNome = event.target.getAttribute("data-nome");
          const esameCodice = event.target.getAttribute("data-codice");
          const esameAsl = event.target.getAttribute("data-asl");
          const esameReg = event.target.getAttribute("data-reg");
          const esameMetodica = event.target.getAttribute("data-metodica");
          const esameApparato = event.target.getAttribute("data-apparato");

          // Verifica se l'esame è già stato aggiunto
          const alreadyExists = Array.from(tableContainer.children).some(row => 
              row.querySelector('[name="codiceEsame"]')?.textContent === esameCodice
          );

          if (alreadyExists) {
              alert("L'esame è già stato aggiunto!");
              return;
          }

          // Creazione della riga per la tabella
          const tableRow = document.createElement("div");
          tableRow.classList.add("rowModale", "coda-item"); // Mantiene le tue classi originali
          tableRow.setAttribute("data-id", esameId);
          tableRow.innerHTML = `
              <div class="colModale" name="codiceEsame">${esameCodice}</div>
              <input type="hidden" id="codiceEsameInput" name="codiceEsame" value="${esameCodice}">
              <div class="colModale nomeEsame">${esameNome}</div>
              <div class="colModale">${esameAsl ? `${esameAsl} (cod. asl)` : ""}</div>
              <div class="colModale">${esameReg ? `${esameReg} (cod. reg)` : ""}</div>
              <div class="colModale metodica">${esameMetodica}</div>
              <div class="colModale apparati">${esameMetodica}</div>
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
      item.DESCRIZIONE_ESAME?.toLowerCase().includes(searchText) ||
      item.METODICA?.toLowerCase().includes(searchText) ||
      item.COD_ASL?.toString().toLowerCase().includes(searchText) ||
      item.COD_REG?.toString().toLowerCase().includes(searchText)
    );
  });

  switch (selectedFilter) {
    case "1":
      filteredData.sort((a, b) =>
        a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      );
      break;

    case "2":
      filteredData.sort((a, b) =>
        b.DESCRIZIONE_ESAME.localeCompare(a.DESCRIZIONE_ESAME)
      );
      break;

    case "3":
      filteredData.sort(
        (a, b) =>
          (a.METODICA || "").localeCompare(b.METODICA || "") ||
          a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      );
      break;

    case "4":
      filteredData.sort(
        (a, b) =>
          (a.COD_ASL?.toString() || "").localeCompare(
            b.COD_ASL?.toString() || ""
          ) || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      );
      break;

    case "5":
      filteredData.sort(
        (a, b) =>
          (a.COD_REG?.toString() || "").localeCompare(
            b.COD_REG?.toString() || ""
          ) || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
      );
      break;

    case "6":
      filteredData.sort(
        (a, b) =>
          (a.COD_REG?.toString() || "").localeCompare(
            b.COD_REG?.toString() || ""
          ) || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME)
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
      (item) => item.DESCRIZIONE_ESAME === selectedValue
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



/* RICERCA PRESCRIZIONI TABELLA RISULTATI */
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("inputRicerca");
  const filterSelect = document.getElementById("filtriTabellaResult");
  const tableContent = document.querySelector(".table-content");
  const rowsPerPage = 5; 
  let currentPage = 1; 
  let allRows = Array.from(tableContent.querySelectorAll(".rowTable")); 

  function filterTable() {
    const searchText = searchInput.value.toLowerCase();
    const selectedFilter = filterSelect.value;
    
    let filteredRows = [...allRows]; 

    if (searchText) {
        filteredRows = filteredRows.filter(row => 
            Array.from(row.children).some(cell => 
                cell.textContent.toLowerCase().includes(searchText)
            )
        );
    }

    switch (selectedFilter) {
        case "1":
            filteredRows.sort((a, b) => a.children[1].textContent.localeCompare(b.children[1].textContent));
            break;
        case "2": 
            filteredRows.sort((a, b) => b.children[1].textContent.localeCompare(a.children[1].textContent));
            break;
        case "3": 
            filteredRows.sort((a, b) => a.children[4].textContent.localeCompare(b.children[4].textContent));
            break;
        case "4": 
            filteredRows.sort((a, b) => a.children[2].textContent.localeCompare(b.children[2].textContent));
            break;
        case "5": 
            filteredRows.sort((a, b) => a.children[3].textContent.localeCompare(b.children[3].textContent));
            break;
        case "6": 
            filteredRows.sort((a, b) => a.children[5].textContent.localeCompare(b.children[5].textContent));
            break;
    }

    currentPage = 1; 
    showPage(currentPage, filteredRows);
    updatePaginationControls(filteredRows);
  }

  function showPage(page, filteredRows) {
    allRows.forEach(row => {
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
    let existingControls = tableContent.querySelector(".pagination-controls");

    if (existingControls) existingControls.remove();

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    if (totalPages <= 1) return;

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
        if (i === currentPage) {
            btn.classList.add("active");
        }
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

  searchInput.addEventListener("input", filterTable);
  filterSelect.addEventListener("change", filterTable);

  showPage(1, allRows);
  updatePaginationControls(allRows);
});





/*  -----------------------------------------------------------------------------------------------
  Funzione di paginazione con controllo di tabelle con la stessa classe
--------------------------------------------------------------------------------------------------- */
function updatePagination() {
  const tableContainer = document.querySelector(".table-content");
  const paginationContainer = document.getElementById("pagination_download");
  const rows = tableContainer.querySelectorAll(".rowModale"); // Mantiene le tue classi
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

      // Rimuove solo la paginazione, senza eliminare `downloadButton-Container`
      if (existingControls) existingControls.remove();

      if (rows.length > rowsPerPage) {
          const controls = document.createElement("div");
          controls.classList.add("pagination-controls");

          for (let i = 1; i <= totalPages; i++) {
              const btn = document.createElement("button");
              btn.classList.add("button-style-pagination");
              btn.textContent = i;
              if (i === currentPage) {
                  btn.classList.add("active");
              }
              btn.addEventListener("click", () => {
                  currentPage = i;
                  showPage(currentPage);
                  updatePaginationControls();
              });
              controls.appendChild(btn);
          }

          // Aggiunge la paginazione senza toccare `downloadButton-Container`
          paginationContainer.appendChild(controls);
      }
  }

  showPage(currentPage);
  updatePaginationControls();
}



/* FUNZIONE PER INVIARE I CODICI UNIVOCHI EGLI ESAMI ALLA VIEW */
document.getElementById("btnPdfGeneralPrescrizioni").addEventListener("click", function (event) {
  event.preventDefault();

  const tableContainer = document.querySelector(".table-content");
  const codiceEsami = [];

  tableContainer.querySelectorAll(".rowModale [name='codiceEsame']").forEach((cell) => {
      codiceEsami.push(cell.textContent.trim());
  });

  if (codiceEsami.length === 0) {
      alert("Nessun esame presente per il salvataggio.");
      return;
  }

  document.getElementById("codiciEsamiInput").value = JSON.stringify(codiceEsami);
  document.getElementById("saveForm").submit();
});




