/*  -----------------------------------------------------------------------------------------------
      Animate Button
--------------------------------------------------------------------------------------------------- */
function animateButton() {
  gsap.to(".add-patient-btn", {
    scale: 1.1,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
  });
}
/*  -----------------------------------------------------------------------------------------------
    FUNZIONI PER PAGINAZIONE E RICERCA
--------------------------------------------------------------------------------------------------- */
const rows = document.querySelectorAll(".riga-container");
const rowsPerPage = 6;
let currentPage = 1;
let totalPages = Math.ceil(rows.length / rowsPerPage);

function showPage(page, filteredRows = rows) {
  rows.forEach((row) =>
    gsap.to(row, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => (row.style.display = "none"),
    })
  );

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

  updatePaginationControls(filteredRows);
}

function updatePaginationControls(filteredRows = rows) {
  const paginationContainer = document.querySelector(".bg-white");
  const existingControls = document.querySelector(".pagination-controls");

  // Rimuovere i controlli esistenti
  if (existingControls) existingControls.remove();

  // Se il numero di righe filtrate è inferiore a rowsPerPage, nascondi la paginazione
  if (filteredRows.length <= rowsPerPage) {
    return;
  }

  totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const controls = document.createElement("div");
  controls.classList.add("pagination-controls");

  const range = 10;
  let startPage = Math.max(1, currentPage - Math.floor(range / 2));
  let endPage = Math.min(totalPages, startPage + range - 1);

  if (endPage - startPage < range - 1) {
    startPage = Math.max(1, endPage - range + 1);
  }

  if (startPage > 1) {
    const firstPageBtn = document.createElement("button");
    firstPageBtn.classList.add("button-style-pagination");
    firstPageBtn.textContent = "1";
    firstPageBtn.addEventListener("click", () => {
      currentPage = 1;
      showPage(currentPage, filteredRows);
    });
    controls.appendChild(firstPageBtn);

    const dots = document.createElement("span");
    dots.textContent = "...";
    controls.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.classList.add("button-style-pagination");
    btn.textContent = i;
    if (i === currentPage) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      currentPage = i;
      showPage(currentPage, filteredRows);
    });
    controls.appendChild(btn);
  }

  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    controls.appendChild(dots);

    const lastPageBtn = document.createElement("button");
    lastPageBtn.classList.add("button-style-pagination");
    lastPageBtn.textContent = totalPages;
    lastPageBtn.addEventListener("click", () => {
      currentPage = totalPages;
      showPage(currentPage, filteredRows);
    });
    controls.appendChild(lastPageBtn);
  }

  paginationContainer.appendChild(controls);
}

/* Funzione di ricerca */
document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.querySelector(".barra-ricerca form");
  const searchInput = document.getElementById("Email");
  const filterSelect = document.getElementById("filter");
  const tableContainer = document.querySelector(".table-container");

  // Nasconde la tabella all'avvio
  gsap.to(".table-container", {
    opacity: 0,
    duration: 0.5,
    onComplete: function () {
      document.querySelector(".table-container").style.display =
        "none";
    },
  });

  function filterRows() {
    const filterValue = searchInput.value.toLowerCase().trim();
    const filterType = filterSelect.value;
    let matchFound = false;
    let filteredRows = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("p");
      let rowMatch = false;

      cells.forEach((cell, index) => {
        if (
          (filterType === "name" && index === 0) ||
          (filterType === "surname" && index === 1) ||
          (filterType === "fisc_code" && index === 3) ||
          (filterType === "personal_association" && index === 7)
        ) {
          if (cell.textContent.toLowerCase().includes(filterValue)) {
            rowMatch = true;
          }
        }
      });

      if (rowMatch) {
        filteredRows.push(row);
        matchFound = true;
      }
    });

    // Mostra la tabella solo se ci sono risultati
    if (matchFound) {
      tableContainer.style.display = "block";
      gsap.to(tableContainer, { opacity: 1, duration: 0.5 });
    } else {
      gsap.to(".table-container", {
        opacity: 0,
        duration: 0.5,
        onComplete: function () {
          document.querySelector(".table-container").style.display =
            "none";
        },
      });    
    }

    // Nasconde tutte le righe e mostra solo quelle filtrate
    gsap.to(rows, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => {
        rows.forEach((row) => (row.style.display = "none"));
        filteredRows.forEach((row) =>
          gsap.to(row, {
            opacity: 1,
            height: "5rem",
            duration: 0.3,
            display: "flex",
            onStart: () => (row.style.display = "flex"),
          })
        );
      },
    });

    // Mostra il messaggio se nessun risultato è trovato
    const tableContent = document.querySelector(".table-content");
    let noResultsMsg = document.querySelector(".no-results-message");

    if (!matchFound) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement("p");
        noResultsMsg.classList.add("no-results-message");
        noResultsMsg.textContent = "Paziente non trovato";
        tableContent.appendChild(noResultsMsg);
      }
    } else {
      if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }

    currentPage = 1;
    showPage(currentPage, filteredRows);
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    filterRows();
  });

  searchInput.addEventListener("input", function () {
    filterRows(); // Esegue la ricerca mentre digiti

    if (!searchInput.value.trim()) {
      currentPage = 1;
      showPage(currentPage);
      updatePaginationControls();
      tableContainer.style.display = "none"; // Nasconde la tabella se il campo di ricerca è vuoto

      const noResultsMsg = document.querySelector(".no-results-message");
      if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }
  });

});

/* Avvio della paginazione */
document.addEventListener("DOMContentLoaded", function () {
  showPage(currentPage);
});
