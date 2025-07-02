/*  -----------------------------------------------------------------------------------------------
      Funzione per paginazione
      --------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll(".riga-container");
  const rowsPerPage = 5;
  let currentPage = 1;
  const totalPages = Math.ceil(rows.length / rowsPerPage);

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
  }

  function updatePaginationControls() {
    const paginationContainer = document.querySelector(".table-content");
    const existingControls = document.querySelector(".pagination-controls");

    // Rimuovere i controlli esistenti
    if (existingControls) existingControls.remove();

    // Condizione per mostrare la paginazione solo se necessario
    if (rows.length > rowsPerPage) {
      const controls = document.createElement("div");
      controls.classList.add("pagination-controls");

      const range = 10; // Numero massimo di bottoni visibili
      let startPage = Math.max(1, currentPage - Math.floor(range / 2));
      let endPage = Math.min(totalPages, startPage + range - 1);

      // Aggiusta la visualizzazione se siamo vicini all'inizio o alla fine
      if (endPage - startPage < range - 1) {
        startPage = Math.max(1, endPage - range + 1);
      }

      // Bottone per andare alla prima pagina
      if (startPage > 1) {
        const firstPageBtn = document.createElement("button");
        firstPageBtn.classList.add("button-style-pagination");
        firstPageBtn.textContent = "1";
        firstPageBtn.addEventListener("click", () => {
          currentPage = 1;
          showPage(currentPage);
          updatePaginationControls();
        });
        controls.appendChild(firstPageBtn);

        // Aggiungi i dots
        const dots = document.createElement("span");
        dots.textContent = "...";
        controls.appendChild(dots);
      }

      // Bottoni numerati
      for (let i = startPage; i <= endPage; i++) {
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

      // Bottone per andare all'ultima pagina
      if (endPage < totalPages) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        controls.appendChild(dots);

        const lastPageBtn = document.createElement("button");
        lastPageBtn.classList.add("button-style-pagination");
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener("click", () => {
          currentPage = totalPages;
          showPage(currentPage);
          updatePaginationControls();
        });
        controls.appendChild(lastPageBtn);
      }

      paginationContainer.appendChild(controls);
    }
  }

  // Mostra la prima pagina e controlla se la paginazione è necessaria
  showPage(currentPage);
  updatePaginationControls();
});
