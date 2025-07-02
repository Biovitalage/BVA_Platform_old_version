

/*  -----------------------------------------------------------------------------------------------
  Funzione di paginazione con controllo di tabelle con la stessa classe
  --------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const tables = document.querySelectorAll(".table-content");

  tables.forEach((table) => {
    const rows = table.querySelectorAll(".riga-container");
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
      let existingControls = table.querySelector(".pagination-controls");

      if (existingControls) existingControls.remove();

      if (rows.length > rowsPerPage) {
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
            showPage(currentPage);
            updatePaginationControls();
          });
          controls.appendChild(firstPageBtn);

          // Aggiungi i dots
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
            showPage(currentPage);
            updatePaginationControls();
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
            showPage(currentPage);
            updatePaginationControls();
          });
          controls.appendChild(lastPageBtn);
        }

        tables.appendChild(controls);
      }
    }

    showPage(currentPage);
    updatePaginationControls();
  });
});

/*  -----------------------------------------------------------------------------------------------
  Funzione di formattazione del telefono
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  function formatItalianPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, ""); // Rimuove caratteri non numerici

    if (digits.length < 10) {
      return phoneNumber; // Restituisce il numero originale se non è valido
    }

    // Se il numero inizia con 39 (senza il "+"), assume che abbia già il prefisso internazionale
    if (digits.startsWith("39") && digits.length > 10) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(
        5,
        8
      )} ${digits.slice(8)}`;
    }

    // Se il numero è lungo 10 cifre (formato italiano senza prefisso), aggiunge +39
    return `+39 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  let phoneElement = document.getElementById("phone");
  if (phoneElement) {
    let formattedPhone = formatItalianPhoneNumber(
      phoneElement.innerText.trim()
    );
    phoneElement.innerText = formattedPhone;
  }
});

/*  -----------------------------------------------------------------------------------------------
  Funzione di modifica dati
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  const editButton = document.querySelector('a[title="Modifica"]');
  if (!editButton) {
    console.error('Il pulsante "Modifica" non è stato trovato.');
    return;
  }

  const capSpan = document.getElementById("cap");
  const residenceSpan = document.getElementById("residence");
  const provinceSpan = document.getElementById("province");
  const emailSpan = document.getElementById("email");
  const phoneSpan = document.getElementById("phone");
  const associateStaffSpan = document.getElementById("associate_staff");
  const lastVisitSpan = document.getElementById("lastVisit");
  const upcomingVisitSpan = document.getElementById("upcomingVisit");
  const bloodGroupSpan = document.getElementById("blood_group");
  const successAlert = document.getElementById("successAlert");
  const errorAlert = document.getElementById("errorAlert");

  let isEditing = false; // Stato per determinare se siamo in modalità modifica

  // Funzione per mostrare una notifica
  function showAlert(alertElement, message) {
    const messageElement = alertElement.querySelector("span");
    messageElement.textContent = message;
    alertElement.style.display = "block";
    alertElement.classList.add("show");

    // Nascondi la notifica dopo 3 secondi
    setTimeout(() => {
      alertElement.classList.remove("show");
      setTimeout(() => (alertElement.style.display = "none"), 500);
    }, 3000);
  }

  // Funzione per convertire la data da "DD/MM/YYYY" a "YYYY-MM-DD" per input[type="date"]
  function formatDateForInput(dateString) {
    if (!dateString) return ""; // Se la stringa è vuota, restituisci una stringa vuota
  
    // Controlla se è già nel formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
  
    // Controlla se la data è in formato DD/MM/YYYY
    const dateParts = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dateParts) {
      return `${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`; // YYYY-MM-DD
    }
  
    // Prova a convertire una data in formato testuale
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      parsedDate.setMinutes(parsedDate.getMinutes() - parsedDate.getTimezoneOffset());
      return parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD
    }
  
    return ""; // Se il formato non è riconosciuto, restituisci stringa vuota
  }

  editButton.addEventListener("click", function (event) {
    event.preventDefault();

    if (!isEditing) {
      // Modalità modifica
      isEditing = true;

      const capInput = document.createElement("input");
      capInput.type = "text";
      capInput.value = capSpan.textContent.trim();
      capInput.id = "capInput";

      const residenceInput = document.createElement("input");
      residenceInput.type = "text";
      residenceInput.value = residenceSpan.textContent.trim();
      residenceInput.id = "residenceInput";

      const provinceInput = document.createElement("input");
      provinceInput.type = "text";
      provinceInput.value = provinceSpan.textContent.trim();
      provinceInput.id = "provinceInput";

      const emailInput = document.createElement("input");
      emailInput.type = "text";
      emailInput.value = emailSpan.textContent.trim();
      emailInput.id = "emailInput";

      const phoneInput = document.createElement("input");
      phoneInput.type = "text";
      phoneInput.value = phoneSpan.textContent.trim();
      phoneInput.id = "phoneInput";

      const associateStaffInput = document.createElement("input");
      associateStaffInput.type = "text";
      associateStaffInput.value = associateStaffSpan.textContent.trim();
      associateStaffInput.id = "associateStaffInput";

      const lastVisitInput = document.createElement("input");
      lastVisitInput.type = "date";
      lastVisitInput.value = formatDateForInput(
        lastVisitSpan.textContent.trim()
      );
      lastVisitInput.id = "lastVisitInput";

      const upcomingVisitInput = document.createElement("input");
      upcomingVisitInput.type = "date";
      upcomingVisitInput.value = formatDateForInput(
        upcomingVisitSpan.textContent.trim()
      );
      upcomingVisitInput.id = "upcomingVisitInput";

      const bloodGroupInput = document.createElement("input");
      bloodGroupInput.type = "text";
      bloodGroupInput.value = bloodGroupSpan.textContent.trim();
      bloodGroupInput.id = "bloodGroupInput";

      capSpan.textContent = "";
      capSpan.appendChild(capInput);

      residenceSpan.textContent = "";
      residenceSpan.appendChild(residenceInput);

      provinceSpan.textContent = "";
      provinceSpan.appendChild(provinceInput);

      emailSpan.textContent = "";
      emailSpan.appendChild(emailInput);

      phoneSpan.textContent = "";
      phoneSpan.appendChild(phoneInput);

      associateStaffSpan.textContent = "";
      associateStaffSpan.appendChild(associateStaffInput);

      lastVisitSpan.textContent = "";
      lastVisitSpan.appendChild(lastVisitInput);

      upcomingVisitSpan.textContent = "";
      upcomingVisitSpan.appendChild(upcomingVisitInput);

      bloodGroupSpan.textContent = "";
      bloodGroupSpan.appendChild(bloodGroupInput);

      editButton.innerHTML = `
        Salva 
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="30"
              height="30"
              class="svg save-icon"
            >
              <path
                d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"
              ></path>
            </svg>
        `;
      editButton.title = "Save";
    } else {
      // Modalità visualizzazione
      const capInput = document.getElementById("capInput");
      const residenceInput = document.getElementById("residenceInput");
      const provinceInput = document.getElementById("provinceInput");
      const emailInput = document.getElementById("emailInput");
      const phoneInput = document.getElementById("phoneInput");
      const associateStaffInput = document.getElementById(
        "associateStaffInput"
      );
      const lastVisitInput = document.getElementById("lastVisitInput");
      const upcomingVisitInput = document.getElementById("upcomingVisitInput");
      const bloodGroupInput = document.getElementById("bloodGroupInput");

      const updatedCap = capInput.value;
      const updatedResidence = residenceInput.value;
      const updatedProvince = provinceInput.value;
      const updatedEmail = emailInput.value;
      const updatedPhone = phoneInput.value;
      const updatedAssociateStaff = associateStaffInput.value;
      const updatedLastVisit = lastVisitInput.value
        ? lastVisitInput.value
        : null;
      const updatedUpcomingVisit = upcomingVisitInput.value
        ? upcomingVisitInput.value
        : null;
      const updatedBloodGroup = bloodGroupInput.value;

      const formattedPhone = formatItalianPhoneNumber(updatedPhone);

      fetch(updatePersonaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          cap: updatedCap,
          residence: updatedResidence,
          province: updatedProvince,
          email: updatedEmail,
          phone: formattedPhone,
          associate_staff: updatedAssociateStaff,
          lastVisit: updatedLastVisit,
          upcomingVisit: updatedUpcomingVisit,
          blood_group: updatedBloodGroup,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP Error ${response.status}: ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            console.log("Dati aggiornati con successo.");
            capSpan.textContent = updatedCap;
            residenceSpan.textContent = updatedResidence;
            provinceSpan.textContent = updatedProvince;
            emailSpan.textContent = updatedEmail;
            phoneSpan.textContent = formattedPhone;
            associateStaffSpan.textContent = updatedAssociateStaff;
            lastVisitSpan.textContent = updatedLastVisit;
            upcomingVisitSpan.textContent = updatedUpcomingVisit;
            bloodGroupSpan.textContent = updatedBloodGroup;

            editButton.innerHTML = `Edita
                  <svg class="svg" viewBox="0 0 512 512">
                    <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                  </svg>`;
            editButton.title = "Modifica";

            isEditing = false;

            // Mostra il messaggio di successo
            showAlert(successAlert, "Modifiche effettuate con successo!");
          } else {
            console.error("Errore dal server:", data.error);

            // Mostra il messaggio di errore
            showAlert(errorAlert, `Errore dal server: ${data.error}`);
          }
        })
        .catch((error) => {
          console.error("Errore nella richiesta:", error);

          // Mostra il messaggio di errore
          showAlert(errorAlert, `Errore nella richiesta: ${error.message}`);
        });
    }
  });

  function formatItalianPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, ""); // Rimuovi caratteri non numerici

    if (digits.length < 10) {
      return phoneNumber; // Restituisce il numero originale se non è valido
    }

    return digits.startsWith("39") && digits.length > 10
      ? `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(
          5,
          8
        )} ${digits.slice(8)}`
      : `+39 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
});










/*  -----------------------------------------------------------------------------------------------
    CLOCK
--------------------------------------------------------------------------------------------------- */
// Accesso ai colori definiti in :root
const rootStyles = getComputedStyle(document.documentElement);
const bgColorDark = rootStyles.getPropertyValue("--contrast-color").trim();

// Funzione per aggiornare ogni clock con animazione
function animateClock(clockId, percentageId, targetPercentage) {
  const clock = document.getElementById(clockId);
  const percentage = document.getElementById(percentageId);

  if (!clock || !percentage) {
      console.error(`Elemento non trovato: ${clockId} o ${percentageId}`);
      return;
  }

  const radius = 60; // Nuovo raggio più grande
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (targetPercentage / 100) * circumference;

  clock.style.strokeDasharray = circumference;
  clock.style.strokeDashoffset = circumference;

  setTimeout(() => {
      clock.style.strokeDashoffset = targetOffset;
  }, 100);

  percentage.textContent = `${targetPercentage}%`;
}


// Aggiorna i vari clock con animazione
document.addEventListener("DOMContentLoaded", () => {
  animateClock("heartClock", "heartPercentage", 80);
  animateClock("kidneyClock", "kidneyPercentage", 57);
  animateClock("liverClock", "liverPercentage", 73);
  animateClock("brainClock", "brainPercentage", 65);
  animateClock("hormoneClock", "hormonePercentage", 50);
  animateClock("bloodClock", "bloodPercentage", 40);
  animateClock("immuneClock", "immunePercentage", 90);
  animateClock("muscleClock", "musclePercentage", 75);

  // Genera i grafici al caricamento della pagina
  generateChart(document.getElementById("chart1").getContext("2d"), [140, 190, 230, 210, 180], "Livello BP");
  generateChart(document.getElementById("chart2").getContext("2d"), [90, 100, 110, 120, 130], "Livello di zuccheri");
  generateChart(document.getElementById("chart3").getContext("2d"), [80, 85, 90, 95, 100], "Frequenza Cardiaca");
  generateChart(document.getElementById("chart4").getContext("2d"), [180, 220, 240, 200, 210], "Colesterolo");
});

// Funzione per generare i grafici
function generateChart(ctx, data, label) {
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Giorno 1", "Giorno 2", "Giorno 3", "Giorno 4", "Giorno 5"],
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: "#3b255d2c",
          borderColor: "#3a255d",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
}





/* FILTRI TABELLA PRESCRIZIONE */
document.addEventListener("DOMContentLoaded", function () {
  const filterSelect = document.getElementById("filter");
  const tableContent = document.querySelector(".table-content.prescriptions");

  filterSelect.addEventListener("change", function () {
    let selectedFilter = filterSelect.value;
    let rows = Array.from(
      tableContent.getElementsByClassName("riga-container")
    );

    if (selectedFilter === "Tutti") {
      rows.forEach((row) => (row.style.display = "flex"));
      return;
    }

    let columnIndex = parseInt(selectedFilter, 10);
    let isAscending = columnIndex === 0;

    rows.sort((a, b) => {
      let textA = a
        .getElementsByTagName("p")
        [columnIndex].innerText.trim()
        .toLowerCase();
      let textB = b
        .getElementsByTagName("p")
        [columnIndex].innerText.trim()
        .toLowerCase();

      return isAscending
        ? textA.localeCompare(textB)
        : textB.localeCompare(textA);
    });

    rows.forEach((row) => tableContent.appendChild(row));
  });
});



/*  -----------------------------------------------------------------------------------------------
    Mostra di più
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.querySelector(".button");

  if (!toggleButton) return;

  const infoContainer = document.querySelector(".container_box");
  const contactContainer = document.querySelector(".Contact-Container");
  const subCardsContainer = document.querySelector(".subCard-container");

  // Seleziona tutti i campi, compresi email e telefono
  const hiddenFields = infoContainer.querySelectorAll(
    ".field, .email, .telefono"
  );

  // Nasconde tutti i campi all'inizio (compresi email e telefono)
  hiddenFields.forEach((field) => {
    gsap.set(field, { opacity: 0, display: "none" });
  });

  // Nasconde anche la sezione delle sub-card e il Contact-Container
  gsap.set(subCardsContainer, { opacity: 0, display: "none" });
  gsap.set(contactContainer, { opacity: 0, display: "none" });

  // Nasconde il contenitore principale
  infoContainer.classList.add("hidden-row-grid");

  // Aggiunge il listener al pulsante
  toggleButton.addEventListener("click", function () {
    const isHidden = hiddenFields[0].style.display === "none";

    hiddenFields.forEach((field) => {
      if (isHidden) {
        gsap.to(field, { opacity: 1, display: "flex", duration: 0.5 });
      } else {
        gsap.to(field, { opacity: 0, display: "none", duration: 0.5 });
      }
    });

    if (isHidden) {
      gsap.to(subCardsContainer, {
        opacity: 1,
        display: "flex",
        duration: 0.5,
      });
      gsap.to(contactContainer, { opacity: 1, display: "flex", duration: 0.5 });
      infoContainer.classList.remove("hidden-row-grid");
    } else {
      gsap.to(subCardsContainer, {
        opacity: 0,
        display: "none",
        duration: 0.5,
      });
      gsap.to(contactContainer, { opacity: 0, display: "none", duration: 0.5 });
      infoContainer.classList.add("hidden-row-grid");
    }

    // Cambia il testo e l'icona del pulsante
    toggleButton.innerHTML = `
      <span class="button__icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="18" class="button__icon-svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="18" class="button__icon-svg button__icon-svg--copy">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
      ${isHidden ? "Mostra di meno" : "Mostra di più"}
      `;
  });
});

/* FUNZIONE SCARICA PDF PRESCRIZIONE */
/* document.addEventListener("DOMContentLoaded", function () {
  const pdfButtons = document.querySelectorAll(".generatePDFButton");
  const modal = document.getElementById("pdfDisclaimerModal");
  const closeBtn = document.getElementById("closeDisclaimerBtn");

  pdfButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      
      const pdfUrl = button.getAttribute("data-pdf-url");
      const name = button.getAttribute("data-name") || "N/A";
      const surname = button.getAttribute("data-surname") || "N/A";
      const dob = button.getAttribute("data-dob") || "N/A";
      const cf = button.getAttribute("data-cf") || "N/A";

      if (!pdfUrl) {
        console.error("Errore: URL PDF non trovato!");
        return;
      }

      // Mostra il disclaimer modal
      modal.classList.remove("hidden");

      // Dopo che il disclaimer viene accettato, genera il PDF
      closeBtn.addEventListener("click", async () => {
        modal.classList.add("hidden");
        await generatePDF(pdfUrl, name, surname, dob, cf);
      }, { once: true }); // `{ once: true }` evita multiple generazioni
    });
  });
});
 */
