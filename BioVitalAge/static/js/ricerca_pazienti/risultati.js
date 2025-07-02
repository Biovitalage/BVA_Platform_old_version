document.addEventListener("DOMContentLoaded", () => {
  const rows = Array.from(document.querySelectorAll(".riga-container"));
  const rowsPerPage = 5;
  let currentPage = 1;

  // Messaggio “nessun paziente trovato”
  const tableContainer = document.querySelector(".table-container");
  const noResultMessage = document.createElement("div");
  noResultMessage.className = "no-results";
  noResultMessage.textContent = "Nessun paziente trovato con questa descrizione";
  noResultMessage.style.display = "none";
  tableContainer.parentNode.insertBefore(noResultMessage, tableContainer.nextSibling);

  function showPage(page, set = rows) {
    currentPage = page;
    rows.forEach(r => r.style.display = "none");
    const start = (page - 1) * rowsPerPage;
    const end = page * rowsPerPage;
    const pageRows = set.slice(start, end);
    pageRows.forEach(r => r.style.display = "flex");
    gsap.fromTo(pageRows,
      { opacity: 0,  y: -10 },
      { opacity: 1, y:  0, duration: 0.3, stagger: 0.05 }
    );
    renderPagination(set);
  }

  function renderPagination(set) {
    const totalPages = Math.ceil(set.length / rowsPerPage);
    const maxButtons = 6;
    let container = document.querySelector(".pagination-controls");
    if (!container) {
      container = document.createElement("div");
      container.className = "pagination-controls";
      document.querySelector(".bg-white").appendChild(container);
    }
    container.innerHTML = "";

    const prev = document.createElement("button");
    prev.className = "pagination-arrow prev";
    prev.textContent = "<";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
      if (currentPage > 1) showPage(currentPage - 1, set);
    });
    container.appendChild(prev);

    const pagesToShow = Math.min(totalPages, maxButtons);
    for (let i = 1; i <= pagesToShow; i++) {
      const btn = document.createElement("button");
      btn.className = "button-style-pagination";
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => showPage(i, set));
      container.appendChild(btn);
    }

    if (totalPages > maxButtons) {
      const ell = document.createElement("span");
      ell.className = "pagination-ellipsis";
      ell.textContent = "...";
      container.appendChild(ell);
    }

    const next = document.createElement("button");
    next.className = "pagination-arrow next";
    next.textContent = ">";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => {
      if (currentPage < totalPages) showPage(currentPage + 1, set);
    });
    container.appendChild(next);
  }

  function filterRows() {
    const termRaw = document.getElementById("Email").value.toLowerCase().trim();
    const type    = document.getElementById("filter").value;
    const termParts = termRaw.split(/\s+/).filter(Boolean);

    const filtered = rows.filter(row => {
      const cells = row.querySelectorAll("p");

      // SOLO se filtro = all e due parole -> nome+congome
      if (type === "all" && termParts.length >= 2) {
        return (
          cells[0].textContent.toLowerCase().includes(termParts[0]) &&
          cells[1].textContent.toLowerCase().includes(termParts[1])
        );
      }

      // Altrimenti cerca interamente nel campo relativo
      switch (type) {
        case "all":
          return (
            cells[0].textContent.toLowerCase().includes(termRaw) ||
            cells[1].textContent.toLowerCase().includes(termRaw)
          );
        case "name":
          return cells[0].textContent.toLowerCase().includes(termRaw);
        case "surname":
          return cells[1].textContent.toLowerCase().includes(termRaw);
        case "fisc_code":
          return cells[3].textContent.toLowerCase().includes(termRaw);
        case "personal_association":
          return cells[6].textContent.toLowerCase().includes(termRaw);
        default:
          return true;
      }
    });

    if (filtered.length) {
      noResultMessage.style.display = "none";
      tableContainer.style.display = "block";
      showPage(1, filtered);
    } else {
      tableContainer.style.display = "none";
      noResultMessage.style.display = "block";
    }
    return filtered;
  }

  // SUBMIT: redirect se unico risultato
  const form = document.querySelector(".barra-ricerca form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const filtered = filterRows();
    if (filtered.length === 1) filtered[0].click();
  });

  // LIVE INPUT: mostra suggerimenti senza redirect
  const input = document.getElementById("Email");
  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      noResultMessage.style.display = "none";
      tableContainer.style.display = "block";
      showPage(1);
    } else {
      filterRows();
    }
  });

  // CAMBIO FILTRO: aggiorna subito i risultati
  document.getElementById("filter").addEventListener("change", () => {
    if (input.value.trim()) filterRows();
    else showPage(1);
  });

  // Inizio
  showPage(1);
});
