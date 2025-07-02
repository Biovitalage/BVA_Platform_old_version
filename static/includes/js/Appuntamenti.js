                                          /*  -----------------------------------------------------------------------------------------------
                                                                                    GLOBAL VARIABLE
                                          --------------------------------------------------------------------------------------------------- */
// Gestione calendario
let fromCalendar = false;
let isEditing = false;
let appointmentsData = {}; // Definita globalmente per contenere i dati caricati

// gestione ricerca
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("searchResults");
const searchModal = document.getElementById("searchModal");

// gestione popup
const popup = document.getElementById("appointment-actions-popup");

// Layout
const monthLayoutBtn = document.getElementById("monthLayout");
const weekLayoutBtn = document.getElementById("weekLayout");

const headWeek = document.getElementById("week-head");
const weekLayout = document.getElementById("week-layout");

const monthWeek = document.getElementById("month-head");
const monthLayout = document.getElementById("month-layout");

/*  -----------------------------------------------------------------------------------------------
                                    DYNAMIC CALENDAR & MODAL APPEARS
--------------------------------------------------------------------------------------------------- */
// Riferimenti ai <span> e agli input nascosti
const daySpan = document.getElementById("day-appointment");
const dateSpan = document.getElementById("date-appointment");
const timeSpan = document.getElementById("time-appointment");

const editDateBtn = document.getElementById("edit-date-btn");
const editDateContainer = document.getElementById("edit-date-container");
const editDateInput = document.getElementById("editDate");
const editTimeInput = document.getElementById("editTime");
let currentDate = new Date(); // Definisci la variabile globalmente
let selectedAppointment = null;

// -----------------------------
// RIFERIMENTI ELEMENTI CALENDARIO
// -----------------------------
const dayLayoutBtn = document.getElementById("dayLayout");

const monthLayoutContainer = document.getElementById("month-layout");
const weekLayoutContainer = document.getElementById("week-layout");
const dayLayoutContainer = document.getElementById("day-layout");
// Variabili data
let selectedDayCell = null; // cella cliccata
// const dayLayoutContainer = document.getElementById("day-layout"); // se esiste

const monthHead = document.getElementById("month-head");
const weekHead = document.getElementById("week-head");
const dayHead = document.getElementById("day-head");

const btnPrev = document.querySelector(".prev");
const btnNext = document.querySelector(".next");
const btnToday = document.getElementById("currentBtn");
const datePicker = document.getElementById("date");
const currentDataLabel = document.getElementById("currentData");

// Modale
const appointmentModal = document.getElementById("appointmentModal"); // overlay
const modalContent = document.querySelector(".modal-content-appointments"); // contenuto modale
const btnCloseModal = document.getElementById("closeModalBtn");
const iconCloseModal = document.getElementById("closeModal");

// Pulsante "Appuntamento"
const btnOpenModal = document.getElementById("openModal");
/*  -----------------------------------------------------------------------------------------------
    MAPPING TIPOLOGIE
  --------------------------------------------------------------------------------------------------- */
const mappingTipologie = {
  "Fisioestetica": [
    { value: "Crioterapia", text: "Crioterapia", duration: [30] },
    {
      value: "Radiofrequenza medica",
      text: "Radiofrequenza medica",
      duration: [20, 30, 45],
    },
    {
      value: "Mesoterapia transdermica",
      text: "Mesoterapia transdermica",
      duration: [20, 30, 45],
    },
    {
      value: "Mesoterapia intramedica",
      text: "Mesoterapia intramedica",
      duration: [30],
    },
    { value: "TECAR + massaggio", text: "TECAR + massaggio", duration: [20] },
    {
      value: "Massaggio linfodrenante",
      text: "Massaggio linfodrenante",
      duration: [30],
    },
    {
      value: "Massaggio tonificante volto",
      text: "Massaggio tonificante volto",
      duration: [20],
    },
    { value: "Onde d'urto", text: "Onde d'urto", duration: [10] },
  ],
  "Fisioterapia e Riabilitazione": [
    { value: "Visita fisiatrica", text: "Visita fisiatrica", duration: [30] },
    { value: "Visita ortopedica", text: "Visita ortopedica", duration: [30] },
    {
      value: "Visita neurologica",
      text: "Visita neurologica",
      duration: [30],
    },
    {
      value: "Visita reumatologica",
      text: "Visita reumatologica",
      duration: [30],
    },
    {
      value: "Chinesiterapia manuale/strumentale",
      text: "Chinesiterapia manuale/strumentale",
      duration: [30],
    },
    {
      value: "Elettrostimolazioni - diadinamica, ionoforesi o tens",
      text: "Elettrostimolazioni - diadinamica, ionoforesi o tens",
      duration: [20],
    },
    {
      value: "Infiltrazioni",
      text: "Infiltrazioni",
      duration: ["Da definire"],
    },
    { value: "Infrarossi", text: "Infrarossi", duration: [10] },
    { value: "Laserterapia", text: "Laserterapia", duration: [20] },
    { value: "Magnetoterapia", text: "Magnetoterapia", duration: [20] },
    {
      value: "Massaggio linfodrenante",
      text: "Massaggio linfodrenante",
      duration: [30],
    },
    { value: "Massoterapia", text: "Massoterapia", duration: [20] },
    {
      value: "Mesoterapia antalgica-antinfiammatoria",
      text: "Mesoterapia antalgica-antinfiammatoria",
      duration: [30],
    },
    {
      value: "Mobilizzazioni articolari",
      text: "Mobilizzazioni articolari",
      duration: [15],
    },
    {
      value: "Rieducazione motoria/rinforzo muscolare",
      text: "Rieducazione motoria/rinforzo muscolare",
      duration: [30],
    },
    { value: "TECAR", text: "TECAR", duration: [20] },
    { value: "Ultrasuonoterapia", text: "Ultrasuonoterapia", duration: [15] },
    { value: "Onde d'urto", text: "Onde d'urto", duration: [10] },
    {
      value: "Trattamento miofasciale",
      text: "Trattamento miofasciale",
      duration: [30],
    },
    {
      value: "Valutazione + Cervical ROM",
      text: "Valutazione + Cervical ROM",
      duration: [30],
    },
  ],
  "Fisioterapia Sportiva": [
    {
      value: "Rieducazione motoria/Rinforzo muscolare",
      text: "Rieducazione motoria/Rinforzo muscolare",
      duration: [30],
    },
    {
      value: "Prevenzione infotuni sport specifico",
      text: "Prevenzione infotuni sport specifico",
      duration: [30],
    },
    {
      value: "Massaggio decontratturante",
      text: "Massaggio decontratturante",
      duration: [30],
    },
  ],
};

// Mappa dei colori per ogni gruppo
const boxColorMapping = [
  { group: "Fisioestetica", color: "#2b124c" },
  { group: "Fisioterapia e Riabilitazione", color: "#26425a" },
  { group: "Fisioterapia Sportiva", color: "#00937a" }
];












                                                        /*  -----------------------------------------------------------------------------------------------
                                                                                         GLOBAL FUNCTION
                                                        --------------------------------------------------------------------------------------------------- */

// Funzione per ottenere i giorni della settimana a partire dalla data di riferimento
function getWeekDates(baseDate) {
  let startDate = new Date(baseDate);
  let day = startDate.getDay(); // 0 = Domenica, 1 = Lunedì, ecc.
  // Per far iniziare la settimana da lunedì:
  let diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
  let monday = new Date(startDate.setDate(diff));

  let weekDates = [];
  for (let i = 0; i < 7; i++) {
    let d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]); // formato "YYYY-MM-DD"
  }
  return weekDates;
}

// Funzione per formattare la data in italiano
function formatDayLabel(dateObj) {
  const giorniItaliani = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato"
  ];
  const mesiItaliani = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
  ];
  
  const nomeGiorno = giorniItaliani[dateObj.getDay()];
  const giorno = dateObj.getDate();
  const mese = mesiItaliani[dateObj.getMonth()];
  const anno = dateObj.getFullYear();
  
  return `${nomeGiorno}, ${giorno} ${mese} ${anno}`;
}

// Funzione per aggiornare il layout della settimana
function updateWeekView(dateRiferimento) {
  const weekDates = getWeekDates(dateRiferimento);
  const appointmentsForWeek = {};

  // Filtra gli appuntamenti globali per includere solo quelli della settimana corrente
  Object.entries(appointmentsData.appointments || {}).forEach(([date, apps]) => {
    if (weekDates.includes(date)) {
      appointmentsForWeek[date] = apps;
    }
  });
  // Genera la vista settimanale usando i dati filtrati
  generateWeeklyAppointments({ appointments: appointmentsForWeek });
}

// Funzione per visualizzare i dettagli di un appuntamento
function viewAppointmentDetails(appointmentId) {
  fetch(`/get-appointment/${appointmentId}/`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const modal = document.getElementById("detailsModal");
        const content = document.getElementById("appointmentDetails");

        // Converti la data in oggetto Date
        const dateObj = new Date(data.data);
        // Estrai giorno, mese e anno e formatta come "dd/mm/yyyy"
        const day = ("0" + dateObj.getDate()).slice(-2);
        const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
        const year = dateObj.getFullYear();
        const italianDate = `${day}/${month}/${year}`;

        // Popola i dettagli nella modale
        content.innerHTML = `
          <p><strong>🧑 Paziente:</strong> ${data.nome_paziente} ${data.cognome_paziente}</p>
          <p><strong>📅 Data:</strong> ${italianDate}</p>
          <p><strong>⏰ Orario:</strong> ${data.orario.slice(0, 5)}</p>
          <p><strong>💬 Tipologia:</strong> ${data.tipologia_visita}</p>
          <p><strong>🏥 Studio:</strong> ${data.numero_studio}</p>
          <p><strong>🧾 Voce prezzario:</strong> ${data.voce_prezzario}</p>
          <p><strong>🕒 Durata:</strong> ${data.durata} minuti</p>
          <p><strong>📝 Note:</strong> ${data.note || "Nessuna"}</p>
        `;

        modal.classList.remove("hidden-details");
        document.body.style.overflow = "hidden";

        gsap.fromTo(
          ".custom-modal-content",
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }
    });
}

// Funzione per gestire le azioni del popup
function setupPopupActions() {
  const popup = document.getElementById("appointment-actions-popup");

  // Sostituisci i pulsanti per eliminare eventuali listener duplicati
  const oldEditBtn = popup.querySelector(".btn-edit");
  const newEditBtn = oldEditBtn.cloneNode(true);
  oldEditBtn.parentNode.replaceChild(newEditBtn, oldEditBtn);

  const oldViewBtn = popup.querySelector(".btn-view");
  const newViewBtn = oldViewBtn.cloneNode(true);
  oldViewBtn.parentNode.replaceChild(newViewBtn, oldViewBtn);

  // Listener pulito per ✏️ Modifica
  newEditBtn.addEventListener("click", () => {
    const id = popup.dataset.id;
    if (id) {
      openAppointmentModal(id);
      popup.classList.add("hidden-popup");
    }
  });

  // Listener pulito per 👁️ Visualizza
  newViewBtn.addEventListener("click", () => {
    const id = popup.dataset.id;
    if (id) {
      viewAppointmentDetails(id);
      popup.classList.add("hidden-popup");
    }
  });
}

/* RESET FUNCTION */
function resetMonthLayout() {
  monthLayout.style.display = "grid";
  monthWeek.style.display = "flex";
  document.querySelectorAll(".cella").forEach((cella) => {
    cella.style.display = "block";
  });
}

/* SETTING WEEK LAYOUT */
weekLayoutBtn.addEventListener("click", () => {
  weekLayoutBtn.classList.add("active");
  monthLayoutBtn.classList.remove("active");

  weekHead.style.display = "block";
  weekLayoutContainer.style.display = "block";
  monthHead.style.display = "none";
  monthLayoutContainer.style.display = "none";

  // Ricarica gli appuntamenti nella vista settimanale
  loadAppointments();
});

// Funzione per generare la vista settimanale
function generateWeeklyAppointments(appointmentsByDate) {
  console.log("📢 Popolamento vista settimanale con appuntamenti:", appointmentsByDate);

  const weekCells = document.querySelectorAll(".cellaWeek");

  // Pulisce tutte le celle prima di riempirle
  weekCells.forEach(cell => cell.innerHTML = "");

  // Scorri tutti gli appuntamenti e posizionali nella vista settimanale
  Object.entries(appointmentsByDate.appointments).forEach(([date, appointments]) => {
      // Filtra solo gli appuntamenti che rientrano nella settimana visualizzata
      appointments.forEach(appointment => {
          const { orario, tipologia_visita, id } = appointment;

          // Ottieni ora e calcola la posizione nella griglia settimanale
          const hour = parseInt(orario.split(":")[0], 10);
          const rowIndex = hour - 9; // Supponendo che il calendario inizi alle 09:00

            // Domenica=0 → colonna=6, Lunedì=1 → colonna=0, ...
            const realWeekDay = new Date(date).getDay(); 
            const colIndex = (realWeekDay + 6) % 7;

            const cellIndex = rowIndex * 7 + colIndex;

          if (rowIndex >= 0 && rowIndex < weekCells.length / 7) {
              if (cellIndex >= 0 && cellIndex < weekCells.length) {
                  const cell = weekCells[cellIndex];

                  // Crea un nuovo box appuntamento
                  const appointmentBox = document.createElement("div");
                  appointmentBox.classList.add("appointment-box");
                  appointmentBox.setAttribute("draggable", "true");
                  appointmentBox.dataset.id = id;
                  appointmentBox.dataset.tipologia = tipologia_visita;
                  appointmentBox.dataset.orario = orario;
                  appointmentBox.innerHTML = `<span style="flex: 1 1 0%">${tipologia_visita}</span><button class="delete-appointment" data-id="${id}">&times;</button>`;

                  // Imposta il colore del box basato sul tipo di visita
                  const mapping = boxColorMapping.find(m => 
                    m.group.toLowerCase() === tipologia_visita.toLowerCase()
                  );
                  if (mapping) {
                    appointmentBox.style.backgroundColor = mapping.color;
                    if (mapping.text_color) {
                      appointmentBox.style.color = mapping.text_color;
                    }
                  } else {
                    console.log("Mapping non trovato per:", tipologia_visita);
                    appointmentBox.style.backgroundColor = "#3a255d"; // colore di default
                  }
  
                  // Aggiunge il box nella cella giusta
                  cell.appendChild(appointmentBox);
  
                  // Abilita il click sul pulsante di eliminazione
                  const deleteButton = appointmentBox.querySelector(
                    ".delete-appointment"
                  );
                  if (deleteButton) {
                    deleteButton.addEventListener("click", (event) => {
                      event.stopPropagation(); // evita apertura modale
                      confirmDeleteAppointment(id, appointmentBox); // usa la tua funzione esistente
                    });
                  }               
  
                  // 🔹 Listener per chiudere la modale
                  document.getElementById("closeDetailsModal").addEventListener("click", () => {
                      const modal = document.getElementById("detailsModal");
                      const content = modal.querySelector(
                        ".custom-modal-content"
                      );
                      document.body.style.overflow = "auto";
  
                      gsap.to(content, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                          modal.classList.add("hidden-details");
                          gsap.set(content, { opacity: 1, scale: 1 }); // Reset per la prossima apertura
                        },
                      });
                  });
                  // Chiudi il popup se clicchi fuori
                  document.addEventListener("click", (e) => {
                    const popup = document.getElementById(
                      "appointment-actions-popup"
                    );
                    if (!popup.contains(e.target)) {
                      popup.classList.add("hidden-popup");
                    }
                  });
  
                  // 🔹 Listener per apertura modale al click sull'appuntamento
                  appointmentBox.addEventListener("click", (e) => {
                    e.stopPropagation();
  
                    const popup = document.getElementById(
                      "appointment-actions-popup"
                    );
  
                    // Posiziona il popup vicino al box cliccato
                    const rect = appointmentBox.getBoundingClientRect();
                    popup.style.top = `${rect.top + window.scrollY + 27}px`;
                    popup.style.left = `${rect.left + window.scrollX}px`;
  
                    popup.classList.remove("hidden-popup");
  
                    // Reset opacità e scala prima dell'animazione
                    // ✅ Resetto eventuali animazioni precedenti
                    gsap.set(popup, { opacity: 0 });
  
                    // 🔥 Animazione GSAP di comparsa fluida
                    gsap.to(popup, {
                      opacity: 1,
                      duration: 0.2,
                      ease: "power2.out",
                    });
  
                    // Salva l'id dell'appuntamento selezionato
                    popup.dataset.id = id;
  
                    setupPopupActions();
                  });
  
                  // Abilita il drag & drop
                  addDragAndDropEvents(appointmentBox);
                }
            }
        });
    });
}

// Funzione per generare la vista Giorno
function generateDailyAppointments(appointmentsForDay) {
  // Ottieni tutte le righe della griglia giornaliera
  const rows = document.querySelectorAll("#day-layout .row-for-ora-day");
  if (!rows.length) {
    console.warn("Nessuna riga trovata nel layout giornaliero!");
    return;
  }
  // Pulisci tutte le celle per evitare duplicazioni
  rows.forEach(row => {
    const cells = row.querySelectorAll(".cellaDay");
    cells.forEach(cell => cell.innerHTML = "");
  });

  const totalRows = rows.length;      // ad esempio 12 (ogni riga = 5 minuti)
  const totalColumns = 11;             // 11 colonne per le ore (09:00-19:00)
  const startHour = 9;                 // Orario di partenza

  appointmentsForDay.forEach(appointment => {
    // Estrai l'orario nel formato "HH:mm"
    const [hourStr, minuteStr] = appointment.orario.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Calcola colonna e riga
    const colIndex = hour - startHour;
    const rowIndex = Math.floor(minute / 5);

    // Verifica che i valori siano nel range
    if (colIndex < 0 || colIndex >= totalColumns) {
      console.warn("Appuntamento fuori range orario:", appointment);
      return;
    }
    if (rowIndex < 0 || rowIndex >= totalRows) {
      console.warn("Appuntamento fuori range minuti:", appointment);
      return;
    }

    // Trova la cella corrispondente
    const targetRow = rows[rowIndex];
    const cellsInRow = targetRow.querySelectorAll(".cellaDay");
    if (colIndex >= cellsInRow.length) {
      console.warn("Cella non trovata per l'appuntamento:", appointment);
      return;
    }
    const targetCell = cellsInRow[colIndex];

    // Crea il box per l'appuntamento
    const appointmentBox = document.createElement("div");
    appointmentBox.classList.add("appointment-box");
    appointmentBox.setAttribute("draggable", "true");
    appointmentBox.dataset.id = appointment.id;
    appointmentBox.dataset.tipologia = appointment.tipologia_visita;
    appointmentBox.dataset.orario = appointment.orario;
    appointmentBox.innerHTML = `<span style="flex: 1;">${appointment.tipologia_visita}</span>
      <button class="delete-appointment" data-id="${appointment.id}">&times;</button>`;

    boxColorMapping.forEach((mapping) => {

      if (mapping.group === appointment.tipologia_visita) {
        appointmentBox.style.backgroundColor = mapping.color;
        if (mapping.text_color) {
          appointmentBox.style.color = mapping.text_color;
        }
      } else {
        appointmentBox.style.backgroundColor = "#3a255d";
      }
    })

    // Applica il colore basandoti sul mapping (ricerca case-insensitive)
    const mapping = boxColorMapping.find(m => 
      m.group.toLowerCase() === appointment.tipologia_visita.toLowerCase()
    );
    if (mapping) {
      appointmentBox.style.backgroundColor = mapping.color;
      if (mapping.text_color) {
        appointmentBox.style.color = mapping.text_color;
      }
    } else {
      console.log("Mapping non trovato per:", appointment.tipologia_visita);
      appointmentBox.style.backgroundColor = "#3a255d"; // colore di default
    }

    // Inserisci il box nella cella
    targetCell.appendChild(appointmentBox);

    // Abilita i listener specifici per il drag & drop in daily view
    addDragAndDropEventsDaily(appointmentBox);

    // Aggiungi il listener per aprire il popup dei dettagli
    appointmentBox.addEventListener("click", (e) => {
      e.stopPropagation();
      const popup = document.getElementById("appointment-actions-popup");
      const rect = appointmentBox.getBoundingClientRect();
      popup.style.top = `${rect.top + window.scrollY + 27}px`;
      popup.style.left = `${rect.left + window.scrollX}px`;
      popup.classList.remove("hidden-popup");
      gsap.set(popup, { opacity: 0 });
      gsap.to(popup, { opacity: 1, duration: 0.2, ease: "power2.out" });
      popup.dataset.id = appointment.id;

      // 🔹 Listener per chiudere la modale
      document
        .getElementById("closeDetailsModal")
        .addEventListener("click", () => {
          const modal = document.getElementById("detailsModal");
          const content = modal.querySelector(".custom-modal-content");
          document.body.style.overflow = "auto";

          gsap.to(content, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              modal.classList.add("hidden-details");
              gsap.set(content, { opacity: 1, scale: 1 }); // Reset per la prossima apertura
            },
          });
        });

      setupPopupActions();
    });

    // Listener per la cancellazione
    const deleteButton = appointmentBox.querySelector(".delete-appointment");
    if (deleteButton) {
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        confirmDeleteAppointment(appointment.id, appointmentBox);
      });
    }
  });
}


// Funzione per abilitare il drag & drop sezione week
function addDragAndDropEvents(appointmentBox) {
  appointmentBox.addEventListener("dragstart", (e) => {
      selectedAppointment = e.target;
      e.dataTransfer.setData("text/plain", selectedAppointment.dataset.id);
      e.target.style.opacity = "0.5";
  });

  appointmentBox.addEventListener("dragend", () => {
      if (selectedAppointment) {
          selectedAppointment.style.opacity = "1";
      }
  });

  document.querySelectorAll(".cellaWeek").forEach(cell => {
      cell.addEventListener("dragover", (e) => {
          e.preventDefault();
          cell.classList.add("drag-over");
      });

      cell.addEventListener("dragleave", () => {
          cell.classList.remove("drag-over");
      });

      cell.addEventListener("drop", (e) => {
          e.preventDefault();
          cell.classList.remove("drag-over");

          if (!selectedAppointment) return;

          const appointmentId = selectedAppointment.dataset.id;
          const tipologia = selectedAppointment.dataset.tipologia || "Sconosciuto";

          if (!appointmentId) {
              console.error("❌ Errore: ID appuntamento mancante!");
              return;
          }

          // ✅ **Trova il primo giorno della settimana (lunedì)**
          let weekStart = new Date(currentDate);
          let dayOfWeek = weekStart.getDay(); // 0 = Domenica, ..., 6 = Sabato
          let mondayOffset = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
          weekStart.setDate(weekStart.getDate() + mondayOffset);

          // ✅ **Trova il giorno della settimana e l'orario**
          // Prendi TUTTE le celle della griglia settimanale
          const allWeekCells = [...document.querySelectorAll(".cellaWeek")];
          // Calcola l'indice globale di quella cella
          const cellIndex = allWeekCells.indexOf(cell);

          const dayOffset = cellIndex % 7;
          const hourIndex = Math.floor(cellIndex / 7);


          let newDate = new Date(weekStart);
          newDate.setDate(newDate.getDate() + dayOffset);
          newDate.setHours(0, 0, 0, 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // ✅ **Blocca i giorni passati, compresa la domenica**
          if (newDate < today) {
              showAlert("danger", "❌ Non puoi spostare un appuntamento in un giorno passato!");
              selectedAppointment.style.opacity = "1";
              return;
          }

          // ✅ **Calcola il nuovo orario basato sulla riga nella griglia**
          const newTime = `${String(9 + hourIndex).padStart(2, "0")}:00`;

          // ✅ **Sposta l'elemento senza duplicarlo**
          cell.appendChild(selectedAppointment);
          selectedAppointment.style.opacity = "1";

          // ✅ **Aggiorna il dataset con la tipologia corretta**
          selectedAppointment.dataset.tipologia = tipologia;

          // ✅ **Aggiorna visivamente il box con i dati corretti**
          selectedAppointment.querySelector("span").textContent = `${tipologia}`;

          // ✅ **Aggiorna l'appuntamento nel database**
          const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
          updateAppointmentDate(appointmentId, formattedDate, newTime);

          selectedAppointment = null;
      });
  });
}

// Funzione per abilitare il drag & drop sezione giorno
function addDragAndDropEventsDaily(appointmentBox) {
  appointmentBox.addEventListener("dragstart", (e) => {
    selectedAppointment = e.target;
    e.dataTransfer.setData("text/plain", selectedAppointment.dataset.id);
    e.target.style.opacity = "0.5";
  });

  appointmentBox.addEventListener("dragend", () => {
    if (selectedAppointment) {
      selectedAppointment.style.opacity = "1";
    }
  });

  // Aggiungi i listener per il drop alle celle del layout Giorno
  document.querySelectorAll(".cellaDay").forEach(cell => {
    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
      cell.classList.add("drag-over");
    });

    cell.addEventListener("dragleave", () => {
      cell.classList.remove("drag-over");
    });

    cell.addEventListener("drop", (e) => {
      e.preventDefault();
      cell.classList.remove("drag-over");
      if (!selectedAppointment) return;

      const appointmentId = selectedAppointment.dataset.id;
      if (!appointmentId) {
        console.error("ID appuntamento mancante!");
        return;
      }

      // Determina il nuovo orario basato sulla cella drop:
      // Recupera la cella drop e il suo indice in riga
      const row = cell.parentElement; // .row-for-ora-day
      const cells = Array.from(row.querySelectorAll(".cellaDay"));
      const colIndex = cells.indexOf(cell);
      const newHour = 9 + colIndex; // se l'orario di partenza è 09:00
      // Imposta i minuti a "00" (modifica solo l'ora)
      const newTime = `${String(newHour).padStart(2, "0")}:00`;

      // Aggiorna il testo visualizzato nel box
      const tipologia = selectedAppointment.dataset.tipologia || "Sconosciuto";
      selectedAppointment.querySelector("span").textContent = `${tipologia}`;

      // Aggiorna l'appuntamento nel backend: la data resta invariata (vista Giorno)
      const formattedDate = currentDate.toISOString().split("T")[0];
      updateAppointmentDate(appointmentId, formattedDate, newTime);

      // Sposta l'elemento nella cella drop
      cell.appendChild(selectedAppointment);
      selectedAppointment.style.opacity = "1";
      selectedAppointment = null;
    });
  });
}


/* SETTING MONTH LAYOUT */
monthLayoutBtn.addEventListener("click", () => {
  weekLayoutBtn.classList.remove("active");
  monthLayoutBtn.classList.add("active");

  headWeek.style.display = "none";
  weekLayout.style.display = "none";

  dayHead.style.display = "none";
  dayLayoutContainer.style.display = "none";

  resetMonthLayout();
});

/* LOAD APPOINTMENTS */
function loadAppointments() {
  fetch("/get-appointments/")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("📢 Appuntamenti ricevuti dal backend:", data);
  
        document.querySelectorAll(".cella").forEach((cell) => {
          const cellDay = cell.dataset.day;
          const cellMonth = cell.dataset.month;
          const cellYear = cell.dataset.year;
  
          if (!cellDay || !cellMonth || !cellYear) return;
  
          const formattedDate = `${cellYear}-${String(cellMonth).padStart(
            2,
            "0"
          )}-${String(cellDay).padStart(2, "0")}`;
  
          const appointmentsContainer = cell.querySelector(
            ".appointments-container"
          );
          appointmentsContainer.innerHTML = "";
  
          if (data.appointments[formattedDate]) {
            data.appointments[formattedDate].forEach(
              (appointment) => {
                if (!appointment.id || appointment.id === "") {
                  console.error("❌ Errore: Appuntamento senza ID!", appointment);
                } else {
                  addAppointmentToCell(
                    cell,
                    appointment.tipologia_visita,
                    appointment.orario,
                    appointment.id
                  );
                }
              }
            );
          }
        });
      }
    })
    .catch((error) =>
      console.error("❌ Errore nel caricamento appuntamenti:", error)
    );
}

/*  LOAD APPOINTMENTS FOR WEEKLY VIEW  */
function loadAppointmentsForWeeklyView() {
  fetch("/get-appointments/")
    .then((response) => response.json())
    .then((data) => {
      console.log("📢 Appuntamenti ricevuti (vista settimanale):", data);
      // Aggiorna la variabile globale
      appointmentsData = data;
      // Chiama la funzione che filtra gli appuntamenti per la settimana corrente
      updateWeekView(currentDate);
    })
    .catch((error) =>
      console.error("❌ Errore nel caricamento degli appuntamenti (settimanale):", error)
    );
}

/* LOAD APPOINTMENTS FOR DAILY VIEW */

// Funzione per formattare la data in YYYY-MM-DD
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadAppointmentsForDailyView() {
  fetch("/get-appointments/")
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        appointmentsData = data; // Aggiorna i dati globali
        const formattedDate = getLocalDateString(currentDate);
        const dayAppointments = data.appointments[formattedDate] || [];
        console.log("Appuntamenti per il giorno", formattedDate, dayAppointments);
        generateDailyAppointments(dayAppointments);
      } else {
        console.error("Errore nel caricamento degli appuntamenti:", data.error);
      }
    })
    .catch(err => console.error("Errore nella fetch degli appuntamenti per il giorno:", err));
}

// Funzione per formattare la data in YYYY-MM-DD per il backend
function formatDateForBackend(date, day) {
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mese in due cifre
  const year = date.getFullYear();
  const dayFormatted = String(day).padStart(2, "0"); // Giorno in due cifre
  return `${year}-${month}-${dayFormatted}`;
}

// Aggiorna la data di un appuntamento nel backend
function updateAppointmentDate(appointmentId, newDate, newTime) {
  if (!appointmentId || !newDate) {
      console.error("❌ Errore: appointmentId, newDate o newTime non valido!", {
          appointmentId,
          newDate,
          newTime,
      });
      return;
  }

  const csrfToken = document.querySelector("input[name='csrfmiddlewaretoken']")?.value || "";

  fetch(`/update-appointment/${appointmentId}/`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ new_date: newDate, new_time: newTime }),
  })
  .then((response) => response.json())
  .then((data) => {
      if (data.success) {
          console.log("✅ Appuntamento aggiornato con successo!");
      } else {
          showAlert("danger", `Errore nello spostamento dell'appuntamento: ${data.error}`);
      }
  })
  .catch((error) => console.error("❌ Errore nella richiesta:", error));
}

// Nascondi il popup cliccando altrove
document.addEventListener("click", (e) => {
  if (!popup.contains(e.target)) {
    popup.classList.add("hidden-popup");
    gsap.set(popup, { opacity: 0 });
  }
});

// Funzione per aggiungere un appuntamento alla cella
function addAppointmentToCell(cella, tipologia, orario, appointmentId) {
  const appointmentsContainer = cella.querySelector(".appointments-container");

  let appointmentBox = document.createElement("div");
  appointmentBox.classList.add("appointment-box");
  appointmentBox.setAttribute("draggable", "true");

  // Assicurati che l'ID sia una stringa valida
  appointmentId = appointmentId ? String(appointmentId) : "";
  if (!appointmentId.trim()) {
    console.error("❌ Errore: appointmentId non valido durante la creazione!", {
      appointmentId,
    });
    return;
  }
  appointmentBox.dataset.id = appointmentId;

  let formattedTime = orario ? orario.slice(0, 5) : "00:00";
  let textSpan = document.createElement("span");
  textSpan.textContent = `${tipologia} - ${formattedTime}`;
  textSpan.style.flex = "1";

  let deleteButton = document.createElement("button");
  deleteButton.innerHTML = "&times;";
  deleteButton.classList.add("delete-appointment");
  deleteButton.setAttribute("data-id", appointmentId);
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    confirmDeleteAppointment(appointmentId, appointmentBox);
  });

  appointmentBox.appendChild(textSpan);
  appointmentBox.appendChild(deleteButton);
  appointmentsContainer.appendChild(appointmentBox);

  // Applica il colore basandoti sul mapping dei gruppi
  const mapping = boxColorMapping.find(m => m.group.toLowerCase() === tipologia.toLowerCase());
  if (mapping) {
    appointmentBox.style.backgroundColor = mapping.color;
    if (mapping.text_color) {
      appointmentBox.style.color = mapping.text_color;
    }
  } else {
    console.log("Mapping non trovato per:", tipologia);
    appointmentBox.style.backgroundColor = "#3a255d";
  }

  // Event listener per il drag
  appointmentBox.addEventListener("dragstart", (e) => {
    selectedAppointment = e.target;
  });

  appointmentBox.addEventListener("click", (e) => {
    e.stopPropagation();
    const appointmentId = appointmentBox.dataset.id;
  
    const popup = document.getElementById("appointment-actions-popup");
  
    // Posiziona il popup vicino all'appuntamento box (stile uniforme)
    const rect = appointmentBox.getBoundingClientRect();
    popup.style.top = `${rect.top + window.scrollY + 27}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
  
    popup.classList.remove("hidden-popup");
  
    // Reset opacità e scala per animazione GSAP
    gsap.set(popup, { opacity: 0, scale: 0.95 });
  
    // Effetto GSAP fluido
    gsap.to(popup, {
      opacity: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  
    popup.dataset.id = appointmentId; // memorizza ID per i bottoni 👁️ e ✏️

    // 🔹 Listener per chiudere la modale
    document.getElementById("closeDetailsModal").addEventListener("click", () => {
      const modal = document.getElementById("detailsModal");
      const content = modal.querySelector(
        ".custom-modal-content"
      );
      document.body.style.overflow = "auto";

      gsap.to(content, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          modal.classList.add("hidden-details");
          gsap.set(content, { opacity: 1, scale: 1 }); // Reset per la prossima apertura
        },
      });
    });

    setupPopupActions();
  });  
}

// Funzione per ottenere il giorno italiano
function getItalianDayName(dateObj) {
  const giorniItaliani = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];
  return giorniItaliani[dateObj.getDay()];
}

// Funzione per aprire la modale
function openAppointmentModal(appointmentId) {
  fromCalendar = true; // Indica che la modale è aperta da un appointment-box (quindi non modificare la data)

  fetch(`/get-appointment/${appointmentId}/`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Dati ricevuti dal backend:", data);

      if (data.success) {
        
        // **SETTAGGIO TIPOLOGIA VISITA**
        let tipologiaSelect = document.getElementById("tipologia_visita");
        tipologiaSelect.value = data.tipologia_visita || "";

        // **TRIGGER AUTOMATICO DEL CAMBIO TIPOLOGIA**
        tipologiaSelect.dispatchEvent(new Event("change"));

        setTimeout(() => {
          let voceOption = [...vocePrezzarioSelect.options].find(
            (option) =>
              option.value.trim().toLowerCase() ===
              data.voce_prezzario?.toLowerCase()
          );

          if (voceOption) {
            vocePrezzarioSelect.value = voceOption.value;
          } else if (data.voce_prezzario) {
            let newVoceOption = document.createElement("option");
            newVoceOption.value = data.voce_prezzario;
            newVoceOption.textContent = data.voce_prezzario + " (Non in elenco)";
            newVoceOption.style.color = "red";
            vocePrezzarioSelect.appendChild(newVoceOption);
            vocePrezzarioSelect.value = data.voce_prezzario;
          }

          // **TRIGGER AUTOMATICO DEL CAMBIO VOCE PREZZARIO**
          vocePrezzarioSelect.dispatchEvent(new Event("change"));
        }, 300); // Aggiunto un ritardo per aspettare la popolazione dinamica

        // **SETTAGGIO DURATA**
        setTimeout(() => {
          let durataSelect = document.getElementById("time");
          let durataOption = [...durataSelect.options].find(
            (option) =>
              option.value.trim().toLowerCase() === data.durata?.toLowerCase()
          );

          if (durataOption) {
            durataSelect.value = durataOption.value;
          } else if (data.durata) {
            let newDurataOption = document.createElement("option");
            newDurataOption.value = data.durata;
            newDurataOption.textContent = data.durata + " (Non in elenco)";
            newDurataOption.style.color = "red";
            durataSelect.appendChild(newDurataOption);
            durataSelect.value = data.durata;
          }
        }, 500); // Un leggero ritardo per assicurarsi che gli altri select siano popolati prima

        // Se il campo "giorno" è vuoto, calcola il giorno a partire dalla data (formato "YYYY-MM-DD")
        let dayText = data.giorno;
        if (!dayText || dayText.trim() === "") {
          const dateParts = data.data.split("-");
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Date è 0-indexed per i mesi
            const day = parseInt(dateParts[2]);
            const dateObj = new Date(year, month, day);
            dayText = getItalianDayName(dateObj); // Assicurati di avere questa funzione definita
          } else {
            dayText = "Giorno non definito";
          }
        }
        document.getElementById("day-appointment").textContent = dayText;
        document
          .getElementById("date-appointment-form")
          .setAttribute("data-id", appointmentId);

        // Nascondi il campo data perché l'utente può modificare solo l'orario
        editDateInput.style.display = "none";

        // Popola gli altri campi della modale
        const dateParts = data.data.split("-");
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        document.getElementById(
          "date-appointment"
        ).textContent = `, ${formattedDate}, `;
        document.getElementById("time-appointment").textContent =
          data.orario.slice(0, 5);
        document.getElementById("tipologia_visita").value =
          data.tipologia_visita || "";

        function normalizeString(str) {
          // Sostituisce spazi multipli, elimina spazi iniziali/finali e trasforma in minuscolo
          return str.replace(/\s+/g, " ").trim().toLowerCase();
        }

        let pazienteSelect = document.getElementById("paziente-select");
        let nomeCompletoBackend = normalizeString(
          `${data.nome_paziente} ${data.cognome_paziente}`
        );

        let pazienteOption = [...pazienteSelect.options].find((opt) => {
          if (!opt.value) return false;
          let [optNome] = opt.value.split("|"); // Prende solo nome e cognome, ignorando l'ID
          optNome = normalizeString(optNome);
          return optNome === nomeCompletoBackend;
        });

        if (pazienteOption) {
          pazienteSelect.value = pazienteOption.value;
        } else {
          // SOLO qui aggiungiamo "(Non in elenco)"
          let newOption = document.createElement("option");
          newOption.value = nomeCompletoBackend;
          newOption.textContent = `${data.nome_paziente} ${data.cognome_paziente} (Non in elenco)`;
          newOption.style.color = "red";
          pazienteSelect.appendChild(newOption);
          pazienteSelect.value = nomeCompletoBackend;
        }

        // Gestione delle altre selezioni (prezzario, durata, studio)
        let vocePrezzarioSelect = document.getElementById("voce-prezzario");
        let voceOption = [...vocePrezzarioSelect.options].find(
          (option) =>
            option.value.trim().toLowerCase() ===
            data.voce_prezzario?.toLowerCase()
        );
        if (voceOption) {
          vocePrezzarioSelect.value = voceOption.value;
        } else if (data.voce_prezzario) {
          let newVoceOption = document.createElement("option");
          newVoceOption.value = data.voce_prezzario;
          newVoceOption.textContent = data.voce_prezzario + " (Non in elenco)";
          newVoceOption.style.color = "red";
          vocePrezzarioSelect.appendChild(newVoceOption);
          vocePrezzarioSelect.value = data.voce_prezzario;
        }

        let durataSelect = document.getElementById("time");
        let durataOption = [...durataSelect.options].find(
          (option) =>
            option.value.trim().toLowerCase() === data.durata?.toLowerCase()
        );
        if (durataOption) {
          durataSelect.value = durataOption.value;
        } else if (data.durata) {
          let newDurataOption = document.createElement("option");
          newDurataOption.value = data.durata;
          newDurataOption.textContent = data.durata + " (Non in elenco)";
          newDurataOption.style.color = "red";
          durataSelect.appendChild(newDurataOption);
          durataSelect.value = data.durata;
        }

        let studioSelect = document.getElementById("studio");
        if (
          [...studioSelect.options].some(
            (option) => option.value === data.numero_studio
          )
        ) {
          studioSelect.value = data.numero_studio;
        } else {
          studioSelect.selectedIndex = 0;
        }

        document.getElementById("note").value = data.note || "";

        // Salva l'ID dell'appuntamento per eventuali modifiche
        document
          .getElementById("date-appointment-form")
          .setAttribute("data-id", appointmentId);

        // Apri la modale con GSAP
        document.getElementById("appointmentModal").style.display = "block";
        document.body.style.overflow = "hidden";
        gsap.fromTo(
          document.querySelector(".modal-content-appointments"),
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
      } else {
        console.error("❌ Errore nel recupero dati appuntamento:", data.error);
      }
    })
    .catch((error) => console.error("❌ Errore nella richiesta:", error));
}

// Funzione per salvare le modifiche all'appuntamento
function saveAppointmentChanges() {
  const formElement = document.getElementById("date-appointment-form");
  const appointmentId = formElement.getAttribute("data-id");
  // Recupera il token CSRF
  const csrfToken =
    document.querySelector("input[name='csrfmiddlewaretoken']")?.value || "";

  // Raccogli i dati dal form
  const updatedTipologia = document.getElementById("tipologia_visita").value;
  const updatedOrario = document
    .getElementById("time-appointment")
    .textContent.trim();
  const updatedPaziente = document.getElementById("paziente-select").value;
  const updatedVocePrezzario = document.getElementById("voce-prezzario").value;
  const updatedDurata = document.getElementById("time").value;
  const updatedStudio = document.getElementById("studio").value;
  const updatedNote = document.getElementById("note").value;

  // Separiamo nome e cognome dall'eventuale ID
  const [nameSurname, id] = updatedPaziente.split("|");
  const parts = nameSurname.trim().split(" ");
  const nomePaziente = parts.shift();
  const cognomePaziente = parts.join(" ");

  if (appointmentId) {
    // Aggiorna l'appuntamento esistente via PATCH
    fetch(`/update-appointment/${appointmentId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // Includi il token CSRF
      },
      body: JSON.stringify({
        tipologia_visita: updatedTipologia,
        orario: updatedOrario,
        nome_paziente: nomePaziente,
        cognome_paziente: cognomePaziente,
        voce_prezzario: updatedVocePrezzario,
        durata: updatedDurata,
        numero_studio: updatedStudio,
        note: updatedNote,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showAlert("success", "Appuntamento modificato con successo!");
          // Cerca il box dell'appuntamento da aggiornare nel DOM
          const appointmentBox = document.querySelector(
            `.appointment-box[data-id="${appointmentId}"]`
          );
          if (appointmentBox) {
            // Supponiamo che il testo sia contenuto in un <span> all'interno del box:
            const textSpan = appointmentBox.querySelector("span");
            if (textSpan) {
              // Aggiorna il contenuto con i nuovi dati
              // Ad esempio, se vuoi visualizzare "tipologia - orario":
              textSpan.textContent = `${updatedTipologia} - ${updatedOrario.slice(
                0,
                5
              )}`;
            }
          }
          // Puoi anche aggiornare altri elementi del box se necessario

          resetFormFields();
          closeModalWithGSAP();
        } else {
          console.error("Errore aggiornamento appuntamento:", data.error);
        }
      })
      .catch((error) => console.error("Errore nella richiesta:", error));
  }
}

// Funzione per eliminare un appuntamento
function deleteAppointment(appointmentId, appointmentBox, confirmAlert) {
  fetch(`/delete-appointment/${appointmentId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        // 🔹 Effetto GSAP per la rimozione fluida del box appuntamento
        gsap.to(appointmentBox, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => appointmentBox.remove(),
        });

        // 🔹 Rimuove anche l'alert di conferma
        gsap.to(confirmAlert, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => confirmAlert.remove(),
        });

        // 🔹 Mostra l'alert di successo
        showAlert("success", "Appuntamento eliminato con successo!");
      } else {
        console.error("❌ Errore nella cancellazione:", data.error);
        showAlert("danger", "Errore nella cancellazione dell'appuntamento.");
      }
    })
    .catch((error) => {
      console.error("❌ Errore nella richiesta:", error);
      showAlert("danger", "Errore nella richiesta al server.");
    });
}

// Funzione per confermare l'eliminazione di un appuntamento tramite modale bootstrap// Funzione per confermare l'eliminazione di un appuntamento tramite modale bootstrap con GSAP
function confirmDeleteAppointment(appointmentId, appointmentBox) {
  // Controllo se c'è già un alert visibile
  let existingAlert = document.getElementById("delete-alert");
  if (existingAlert) existingAlert.remove();

  // 🔹 Creazione alert Bootstrap personalizzato
  let confirmAlert = document.createElement("div");
  confirmAlert.id = "delete-alert";
  confirmAlert.classList.add("alert", "alert-danger", "fade", "show");
  confirmAlert.style.position = "fixed";
  confirmAlert.style.top = "20px";
  confirmAlert.style.left = "50%";
  confirmAlert.style.transform = "translateX(-50%)";
  confirmAlert.style.zIndex = "1050";
  confirmAlert.style.width = "auto";
  confirmAlert.style.maxWidth = "420px";
  confirmAlert.style.display = "flex";
  confirmAlert.style.justifyContent = "space-between";
  confirmAlert.style.alignItems = "center";
  confirmAlert.style.padding = "10px 15px";
  confirmAlert.style.borderRadius = "6px";
  confirmAlert.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
  confirmAlert.style.opacity = "0"; // 🔹 Opacità iniziale per GSAP

  confirmAlert.innerHTML = `
      <span>Sei sicuro di voler eliminare questo appuntamento?</span>
      <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-danger" id="confirmDelete">Elimina</button>
          <button type="button" class="btn btn-sm btn-secondary" id="cancelDelete">Annulla</button>
      </div>
  `;

  // 🔹 Aggiungo l'alert al DOM
  document.body.appendChild(confirmAlert);

  // 🔹 Effetto GSAP per far apparire l'alert con un fade-in
  gsap.to(confirmAlert, { opacity: 1, duration: 0.3, ease: "power2.out" });

  // 🔹 Eventi sui bottoni
  document.getElementById("confirmDelete").addEventListener("click", () => {
    deleteAppointment(appointmentId, appointmentBox, confirmAlert);
  });

  document.getElementById("cancelDelete").addEventListener("click", () => {
    gsap.to(confirmAlert, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => confirmAlert.remove(),
    });
  });

  // 🔹 Rimuove automaticamente l'alert dopo 10 secondi con un fade-out GSAP
  setTimeout(() => {
    gsap.to(confirmAlert, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => confirmAlert.remove(),
    });
  }, 10000);
}

function showAlert(type, message) {
  // Controllo se esiste già un alert visibile
  let existingAlert = document.getElementById("global-alert");
  if (existingAlert) existingAlert.remove();

  // Creazione del div per l'alert Bootstrap
  let alertDiv = document.createElement("div");
  alertDiv.id = "global-alert";
  alertDiv.classList.add("alert", `alert-${type}`, "fade", "show");
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "20px";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translateX(-50%)";
  alertDiv.style.zIndex = "1050";
  alertDiv.style.width = "auto";
  alertDiv.style.maxWidth = "400px";
  alertDiv.style.display = "flex";
  alertDiv.style.justifyContent = "space-between";
  alertDiv.style.alignItems = "center";
  alertDiv.style.padding = "10px 15px";
  alertDiv.style.borderRadius = "6px";
  alertDiv.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
  alertDiv.style.opacity = "0"; // Inizialmente nascosto

  // Contenuto dell'alert
  alertDiv.innerHTML = `
      <span>${message}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Aggiunge l'alert al DOM
  document.body.appendChild(alertDiv);

  // Effetto di comparsa con GSAP
  gsap.to(alertDiv, { opacity: 1, duration: 0.3, ease: "power2.out" });

  // Rimuove automaticamente l'alert dopo 5 secondi con un fade-out
  setTimeout(() => {
    gsap.to(alertDiv, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => alertDiv.remove(),
    });
  }, 5000);
}

/////////////////////////////////////////////////////////////////////// FUNZIONE PRINCIPALE ////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  /***********************************************************************
   * SEZIONE 1: LOGICA DEL CALENDARIO
   ***********************************************************************/
  // -----------------------------
  // FUNZIONI UTILI CALENDARIO
  // -----------------------------
  function formatDateLabel(date) {
    const monthNames = [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  }

  // -----------------------------
  // GENERAZIONE CALENDARIO MENSILE
  // -----------------------------
  // Durante la generazione del calendario mensile, aggiungi la classe "past-day" se la data è passata
  function renderMonthCalendar() {
    monthLayoutContainer.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startIndex = firstDayOfMonth.getDay();
    if (startIndex === 0) startIndex = 7;

    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Data di oggi (senza ore, minuti, secondi)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Celle vuote prima del 1° giorno
    for (let i = 1; i < startIndex; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("cella", "empty-cell");
      monthLayoutContainer.appendChild(emptyCell);
    }

    // Genera le celle dei giorni
    // Durante la generazione delle celle nel calendario:
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const cella = document.createElement("div");
      cella.classList.add("cella");

      // Imposta i dataset per giorno, mese e anno
      cella.dataset.day = day;
      cella.dataset.month = month + 1; // Mese in base 1
      cella.dataset.year = year;

      const dayParagraph = document.createElement("p");
      dayParagraph.classList.add("data");
      dayParagraph.textContent = day;

      const appointmentsContainer = document.createElement("div");
      appointmentsContainer.classList.add("appointments-container");

      const holidays = [
        `${year}-01-01`, // Capodanno
        `${year}-12-25`, // Natale
        `${year}-12-31`  // San Silvestro (opzionale)
      ];

      // Controlla se la data della cella è passata
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);
      if (cellDate < today) {
        cella.classList.add("past-day");
      }

      // Controlla se la data della cella è oggi
      if (cellDate.getTime() === today.getTime()) {
        cella.classList.add("present-day");
      }

      // Controlla se la data della cella è una festività
      const formattedCellDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (holidays.includes(formattedCellDate)) {
          cella.classList.add("holiday-day");
      }

      // Aggiungi listener per drag & drop e per il click solo se la cella non è passata
      if (!cella.classList.contains("past-day")) {
        cella.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        cella.addEventListener("drop", (e) => {
          e.preventDefault();
          if (selectedAppointment) {
            const appointmentsContainer = cella.querySelector(
              ".appointments-container"
            );
            if (!appointmentsContainer.contains(selectedAppointment)) {
              appointmentsContainer.appendChild(selectedAppointment);

              // Recupera la nuova data dalla cella e aggiorna l'appuntamento
              const newDay = cella.dataset.day;
              const newMonth = cella.dataset.month;
              const newYear = cella.dataset.year;
              if (newDay && newMonth && newYear) {
                const newDate = `${newYear}-${String(newMonth).padStart(
                  2,
                  "0"
                )}-${String(newDay).padStart(2, "0")}`;
                updateAppointmentDate(selectedAppointment.dataset.id, newDate);
              }
              selectedAppointment = null;
            }
          }
        });

        function clearModal() {
          // Rimuove l'attributo usato per indicare che la modale è in "edit mode"
          document
            .getElementById("date-appointment-form")
            .removeAttribute("data-id");
          // Richiama la funzione che resetta i campi (assicurati che resetti tutti i campi che non vuoi mantenere)
          resetFormFields();
        }

        cella.addEventListener("click", (e) => {
          // Se il click proviene da un appointment-box, non aprire la modale per un nuovo appuntamento
          if (e.target.closest(".appointment-box")) return;

          // Pulizia: reset della modale se era aperta in modalità modifica
          clearModal();

          selectedDayCell = cella;

          // Rimuove eventuali anteprime già presenti nella cella
          removeAppointmentPreview(cella);

          // Mostra l'anteprima nella cella
          showAppointmentPreview(cella);

          // Crea l'oggetto Date basandoti sui dataset della cella
          const selectedDate = new Date(
            parseInt(cella.dataset.year),
            parseInt(cella.dataset.month) - 1,
            parseInt(cella.dataset.day)
          );

          // Specifica che la modale è aperta da una cella (quindi, ad esempio, non si modifica la data)
          fillFormForNewAppointment(selectedDate, true);

          // Apri la modale con GSAP
          openModalWithGSAP();
        });
      } else {
        // Se la cella rappresenta un giorno passato, disabilita l'interazione
        cella.style.pointerEvents = "none";
      }

      cella.appendChild(dayParagraph);
      cella.appendChild(appointmentsContainer);
      monthLayoutContainer.appendChild(cella);
    }

    // Carica gli appuntamenti dopo aver generato il calendario
    loadAppointments();
    currentDataLabel.textContent = formatDateLabel(currentDate);
  }

  // -----------------------------
  // NAVIGAZIONE CALENDARIO
  // -----------------------------
    
  // Funzione per aggiornare il testo del pulsante "Oggi"
  function updateTodayButtonText() {
    if (dayLayoutBtn && dayLayoutBtn.classList.contains("active")) {
      btnToday.textContent = "Oggi";
    } else if (weekLayoutBtn && weekLayoutBtn.classList.contains("active")) {
      btnToday.textContent = "Questa Settimana";
    } else {
      btnToday.textContent = "Questo Mese";
    }
  }

  btnPrev.addEventListener("click", () => {
    if (dayLayoutBtn && dayLayoutBtn.classList.contains("active")) {
      // Se siamo in vista "Giorno", sottrai 1 giorno
      currentDate.setDate(currentDate.getDate() - 1);
      currentDataLabel.textContent = formatDayLabel(currentDate);
      loadAppointmentsForDailyView();
    } else if (weekLayoutBtn && weekLayoutBtn.classList.contains("active")) {
      // Vista settimana: sottrai 7 giorni
      currentDate.setDate(currentDate.getDate() - 7);
      // Aggiorna il tag che mostra la data (puoi usare lo stesso formato oppure, se preferisci, mostrare il range della settimana)
      currentDataLabel.textContent = formatDateLabel(currentDate);
      // Aggiorna la vista settimanale
      updateWeekView(currentDate);
    } else {
      // Vista mensile: comportamento predefinito
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderMonthCalendar();
      loadAppointments();
    }
  });
  
  btnNext.addEventListener("click", () => {
    if (dayLayoutBtn && dayLayoutBtn.classList.contains("active")) {
      // Se siamo in vista "Giorno", aggiungi 1 giorno
      currentDate.setDate(currentDate.getDate() + 1);
      currentDataLabel.textContent = formatDayLabel(currentDate);
      loadAppointmentsForDailyView();
    } else if (weekLayoutBtn && weekLayoutBtn.classList.contains("active")) {
      // Vista settimana: aggiungi 7 giorni
      currentDate.setDate(currentDate.getDate() + 7);
      currentDataLabel.textContent = formatDateLabel(currentDate);
      updateWeekView(currentDate);
    } else {
      // Vista mensile: comportamento predefinito
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderMonthCalendar();
      loadAppointments();
    }
  });

  btnToday.addEventListener("click", () => {
    currentDate = new Date();
    datePicker.value = "";

    renderMonthCalendar(); // se usi anche la vista mensile
    if (weekLayoutBtn.classList.contains("active")) {
      updateWeekView(currentDate);
    } else if (dayLayoutBtn && dayLayoutBtn.classList.contains("active")) {
      // Aggiorna il tag con la data formattata
      if (currentDataLabel) {
        currentDataLabel.textContent = formatDayLabel(currentDate);
      }
      loadAppointmentsForDailyView();
    } else {
      loadAppointments();
    }
  });
  
  datePicker.addEventListener("change", (e) => {
    const val = e.target.value;
    
    if (val) {
      const [yyyy, mm, dd] = val.split("-");
      currentDate = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
      renderMonthCalendar();
      if (weekLayoutBtn.classList.contains("active")) {
        updateWeekView(currentDate);
      } else if (dayLayoutBtn && dayLayoutBtn.classList.contains("active")) {
        currentDataLabel.textContent = formatDayLabel(currentDate);
        loadAppointmentsForDailyView();
      } else {
        loadAppointments();
      }
    }
  });

  // -----------------------------
  // SWITCH LAYOUT
  // -----------------------------
  monthLayoutBtn.addEventListener("click", () => {
    monthLayoutBtn.classList.add("active");
    weekLayoutBtn.classList.remove("active");
    dayLayoutBtn.classList.remove("active");

    monthHead.style.display = "flex";
    monthLayoutContainer.style.display = "grid";
    weekHead.style.display = "none";
    weekLayoutContainer.style.display = "none";
    dayHead.style.display = "none";
    dayLayoutContainer.style.display = "none";

    currentDataLabel.textContent = formatDateLabel(currentDate);

    updateTodayButtonText();
    renderMonthCalendar();
    loadAppointments();
  });

  weekLayoutBtn.addEventListener("click", () => {
    weekLayoutBtn.classList.add("active");
    monthLayoutBtn.classList.remove("active");
    dayLayoutBtn.classList.remove("active");

    weekHead.style.display = "block";
    weekLayoutContainer.style.display = "block";
    monthHead.style.display = "none";
    monthLayoutContainer.style.display = "none";
    dayHead.style.display = "none";
    dayLayoutContainer.style.display = "none";

    currentDataLabel.textContent = formatDateLabel(currentDate);

    updateTodayButtonText();
    // Ricarica gli appuntamenti nella vista settimanale
    loadAppointmentsForWeeklyView();
  });

  dayLayoutBtn.addEventListener("click", () => {
    dayLayoutBtn.classList.add("active");
    monthLayoutBtn.classList.remove("active");
    weekLayoutBtn.classList.remove("active");

    // dayHead.style.display = "block";
    // dayLayoutContainer.style.display = "block";
    monthHead.style.display = "none";
    monthLayoutContainer.style.display = "none";
    weekHead.style.display = "none";
    weekLayoutContainer.style.display = "none";
    dayLayoutContainer.style.display = "block";
    dayHead.style.display = "block";

    // Aggiorna il <p> "currentDate" con la data formattata
    updateTodayButtonText();
    currentDataLabel.textContent = formatDayLabel(currentDate);

    // Carica gli appuntamenti per il giorno corrente
    loadAppointmentsForDailyView();
  });

  // -----------------------------
  // APERTURA / CHIUSURA MODALE
  // -----------------------------
  function openModalWithGSAP() {
    appointmentModal.style.display = "block"; // overlay
    document.body.style.overflow = "hidden";
    gsap.fromTo(
      modalContent,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );
  }

  function closeModalWithGSAP() {
    document.body.style.overflow = "auto";
    gsap.to(modalContent, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        appointmentModal.style.display = "none";
        if (selectedDayCell) {
          removeAppointmentPreview(selectedDayCell);
          selectedDayCell = null;
        }
        // Reset dello stato di editing e dei campi di input
        isEditing = false;
        editDateBtn.innerHTML = editHTML;
        editDateContainer.style.display = "none";
        editDateInput.style.display = "none";
        editTimeInput.style.display = "none";
      },
    });
  }

  function removeAppointmentPreview(cella) {
    const preview = cella.querySelector(".appointment-preview");
    if (preview) {
      cella.removeChild(preview);
    }
  }

  btnCloseModal.addEventListener("click", closeModalWithGSAP);
  iconCloseModal.addEventListener("click", closeModalWithGSAP);

  // Se clicco sul pulsante "Appuntamento"
  btnOpenModal.addEventListener("click", () => {
    // Resetta eventuali stati precedenti
    if (selectedDayCell) {
      removeAppointmentPreview(selectedDayCell);
      selectedDayCell = null;
    }

    // Resetta il form per un nuovo appuntamento (modalità "nuovo appuntamento")
    fillFormForNewAppointment(null, false);

    // Se necessario, resetta anche i campi del form
    document.getElementById("tipologia_visita").selectedIndex = 0;
    document.getElementById("paziente-select").selectedIndex = 0;
    document.getElementById("voce-prezzario").selectedIndex = 0;
    document.getElementById("time").selectedIndex = 0;
    document.getElementById("studio").selectedIndex = 0;
    document.getElementById("note").value = "";

    // Apri la modale
    openModalWithGSAP();
  });

  // -----------------------------
  // ANTEPRIMA APPUNTAMENTO NELLA CELLA
  // -----------------------------
  function showAppointmentPreview(cella) {
    let preview = document.createElement("div");
    preview.classList.add("appointment-box");
    preview.classList.add("appointment-preview");
    preview.textContent = "Anteprima - 00:00";
    cella.appendChild(preview);
  }
  function removeAppointmentPreview(cella) {
    let preview = cella.querySelector(".appointment-preview");
    if (preview) {
      cella.removeChild(preview);
    }
  }

  // Avvio di default sulla vista Mese
  monthLayoutBtn.click();

  /***********************************************************************
   * SEZIONE 2: LOGICA DEL FORM (autocompletamento <span>, edit, salvataggio)
   ***********************************************************************/
  // Array dei giorni in italiano
  const giorniSettimana = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];

  // Formatta data in DD/MM/YYYY
  function formatItalianDate(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  function getItalianDayName(dateObj) {
    return giorniSettimana[dateObj.getDay()];
  }

  /**
   * Se ho cliccato su "Appuntamento", metto placeholder
   */
  function fillFormForNewAppointment(selectedDate, fromCal = false) {
    // Imposta il flag in base alla provenienza:
    fromCalendar = fromCal;

    // Rimuove eventuale ID se si tratta di una modifica già salvata
    document.getElementById("date-appointment-form").removeAttribute("data-id");

    // Se è stata passata una data, la visualizza
    if (selectedDate instanceof Date) {
      daySpan.textContent = getItalianDayName(selectedDate) + ",";
      dateSpan.textContent = formatItalianDate(selectedDate) + ",";
    } else {
      daySpan.textContent = "Giorno,";
      dateSpan.textContent = "Data,";
    }
    // Imposta un orario di default
    timeSpan.textContent = "Orario";

    // Nasconde i campi per l'editing
    editDateContainer.style.display = "none";
    editDateInput.style.display = "none";
    editTimeInput.style.display = "none";

    // Resetta lo stato di editing e il bottone "modifica"
    isEditing = false;
    editDateBtn.innerHTML = editHTML;
  }

  /***********************************************************************
   * TOGGLE EDIT ↔ SALVA
   * Al primo click su "Edita" → mostro input, passo a "Salva"
   * Al secondo click → salvo, nascondo input, passo a "Edita"
   ***********************************************************************/
  // HTML da mostrare quando siamo in modalità "Edita"
  // (cioè la tua icona e testo)
  const editHTML = `
  <svg class="svg" viewBox="0 0 512 512">
    <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
  </svg>
`;

  // HTML da mostrare quando siamo in modalità "Salva" (icona a tua scelta)
  const saveHTML = ` 
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

  editDateBtn.innerHTML = editHTML; // di default è la modalità "Edita"

  // Listener sul link "Edita/Salva"
  editDateBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Evita il comportamento di default

    // Se siamo in modalità "modifica" già attiva, significa che il click serve a salvare le modifiche
    if (isEditing) {
      // Finalizza le modifiche: ad esempio, aggiorna gli span con i nuovi valori
      if (fromCalendar) {
        const newTime = editTimeInput.value;
        if (newTime) {
          timeSpan.textContent = newTime;
        }
      } else {
        const newDate = editDateInput.value;
        const newTime = editTimeInput.value;
        if (newDate) {
          const parts = newDate.split("-");
          if (parts.length === 3) {
            const y = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            const d = parseInt(parts[2]);
            const tmpDate = new Date(y, m, d);
            daySpan.textContent = getItalianDayName(tmpDate) + ",";
            dateSpan.textContent = formatItalianDate(tmpDate) + ",";
          }
        }
        if (newTime) {
          timeSpan.textContent = newTime;
        }
      }
      // Esci dalla modalità di editing
      isEditing = false;
      editDateBtn.innerHTML = editHTML;
      editDateContainer.style.display = "none";
      editDateInput.style.display = "none";
      editTimeInput.style.display = "none";
    } else {
      // Primo click: entra in modalità di modifica
      isEditing = true;
      editDateBtn.innerHTML = saveHTML;

      // Mostra i campi di input in base a come è stata aperta la modale
      editDateContainer.style.display = "block";
      if (fromCalendar) {
        // Se la modale è aperta da una cella, permetti di modificare solo l'orario
        editDateInput.style.display = "none";
        editTimeInput.style.display = "inline-block";
        if (timeSpan.textContent.includes(":")) {
          const [hh, mm] = timeSpan.textContent.split(":");
          if (hh && mm) {
            editTimeInput.value =
              hh.padStart(2, "0") + ":" + mm.padStart(2, "0");
          }
        }
      } else {
        // Se la modale è aperta dal pulsante, mostra sia la data che l'orario
        editDateInput.style.display = "inline-block";
        editTimeInput.style.display = "inline-block";

        // Imposta i valori di default per i campi di editing
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        editDateInput.value = `${yyyy}-${mm}-${dd}`;
        editTimeInput.value = "09:00";
      }
    }
  });
});

// Al caricamento della pagina, collega i listener agli elementi
document.addEventListener("DOMContentLoaded", function () {
  const tipologiaSelect = document.getElementById("tipologia_visita");
  const vocePrezzarioSelect = document.getElementById("voce-prezzario");
  const durataSelect = document.getElementById("time");

  // Quando cambia il select della tipologia, aggiorna le opzioni del select "voce prezzario"
  tipologiaSelect.addEventListener("change", function () {
    const tipologia = tipologiaSelect.value;

    // Resetta i select "voce prezzario" e "durata"
    vocePrezzarioSelect.innerHTML = "";
    durataSelect.innerHTML = "";

    // Opzione default per "voce prezzario"
    const defaultOptionVoce = document.createElement("option");
    defaultOptionVoce.value = "";
    defaultOptionVoce.textContent = "Seleziona voce prezzario";
    vocePrezzarioSelect.appendChild(defaultOptionVoce);

    // Se esiste una mappatura per la tipologia selezionata, popola il select
    if (mappingTipologie[tipologia]) {
      mappingTipologie[tipologia].forEach(function (item) {
        const opt = document.createElement("option");
        opt.value = item.value;
        opt.textContent = item.text;
        // Salviamo l'array delle durate usando dataset (convertito in stringa JSON)
        opt.dataset.duration = JSON.stringify(item.duration);
        vocePrezzarioSelect.appendChild(opt);
      });
    }
  });

  // Quando cambia il select "voce prezzario", aggiorna il select "durata"
  vocePrezzarioSelect.addEventListener("change", function () {
    const selectedOption =
      vocePrezzarioSelect.options[vocePrezzarioSelect.selectedIndex];
    durataSelect.innerHTML = "";

    // Opzione default per la durata
    const defaultOptionDurata = document.createElement("option");
    defaultOptionDurata.value = "";
    defaultOptionDurata.textContent = "Seleziona durata";
    durataSelect.appendChild(defaultOptionDurata);

    if (selectedOption && selectedOption.dataset.duration) {
      // Estrai l'array delle durate e convertilo da JSON
      const durations = JSON.parse(selectedOption.dataset.duration);
      durations.forEach(function (dur) {
        const opt = document.createElement("option");
        opt.value = dur;
        opt.textContent = dur + " minuti";
        durataSelect.appendChild(opt);
      });
    }
  });
});

/*  -----------------------------------------------------------------------------------------------
                              Saving form data
--------------------------------------------------------------------------------------------------- */

// Funzione per convertire la data da "DD/MM/YYYY" a "YYYY-MM-DD"
function convertDateFormat(dateString) {
  if (!dateString) return "";
  const parts = dateString.replace(/[^0-9\/]/g, "").split("/"); // Rimuove caratteri extra e split su "/"
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
      2,
      "0"
    )}`; // Converte DD/MM/YYYY → YYYY-MM-DD
  }
  return dateString; // Ritorna la stringa originale se il formato è già corretto
}

// Funzione per resettare i campi del form
function resetFormFields() {
  // Reset degli <select>
  document.getElementById("tipologia_visita").selectedIndex = 0;
  document.getElementById("paziente-select").selectedIndex = 0;
  document.getElementById("voce-prezzario").selectedIndex = 0;
  document.getElementById("time").selectedIndex = 0;
  document.getElementById("studio").selectedIndex = 0;
  // Reset del campo note
  document.getElementById("note").value = "";
  // Reset degli <span> per data e orario
  document.getElementById("day-appointment").textContent = "Giorno,";
  document.getElementById("date-appointment").textContent = "Data,";
  document.getElementById("time-appointment").textContent = "Orario,";
}

// Funzione per chiudere il modal
function closeModalWithGSAP() {
  document.body.style.overflow = "auto";
  gsap.to(modalContent, {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      appointmentModal.style.display = "none";
      if (selectedDayCell) {
        removeAppointmentPreview(selectedDayCell);
        selectedDayCell = null;
      }
      // Reset dello stato di editing e dei campi di input
      isEditing = false;
      editDateBtn.innerHTML = editHTML;
      editDateContainer.style.display = "none";
      editDateInput.style.display = "none";
      editTimeInput.style.display = "none";
    },
  });
}

// Funzione per rimuovere la previsione di un appuntamento
function removeAppointmentPreview(cella) {
  const preview = cella.querySelector(".appointment-preview");
  if (preview) {
    cella.removeChild(preview);
  }
}

// Listener per il pulsante "Salva"
document.querySelector(".btn-primary").addEventListener("click", function (event) {
    event.preventDefault();

    // Recupera il form e verifica se è presente un data-id
    const formElement = document.getElementById("date-appointment-form");
    const appointmentId = formElement.getAttribute("data-id");

    if (appointmentId) {
      // Se c'è un data-id, significa che stiamo modificando un appuntamento esistente:
      saveAppointmentChanges();
      return; // Esci dal listener per evitare ulteriori esecuzioni
    }

    // Altrimenti, è un nuovo appuntamento e procede con il salvataggio via POST

    // Validazione dei campi obbligatori
    const tipologia = document.getElementById("tipologia_visita").value.trim();
    const pazienteSelect = document.getElementById("paziente-select");
    const pazienteValue =
      pazienteSelect.options[pazienteSelect.selectedIndex].value.trim();

    if (!tipologia || !pazienteValue) {
      showAlert(
        "danger",
        "Compila tutti i campi obbligatori prima di salvare."
      );
      return;
    }

    // Raccogli i dati dal form per la creazione
    const nomeCompleto = pazienteSelect.selectedOptions[0]?.text.trim() || "";
    const nomeArray = nomeCompleto.split(" ");
    const nome_paziente = nomeArray[0];
    const cognome_paziente = nomeArray.slice(1).join(" ");
    const vocePrezzarioElement = document.getElementById("voce-prezzario");
    const voce_prezzario = vocePrezzarioElement
      ? vocePrezzarioElement.options[
          vocePrezzarioElement.selectedIndex
        ].value.trim()
      : "";
    const durataElement = document.getElementById("time");
    const durata = durataElement
      ? durataElement.options[durataElement.selectedIndex].value.trim()
      : "";

    const tipologia_visita = tipologia;
    const numero_studio = document.getElementById("studio")?.value.trim() || "";
    const note = document.getElementById("note")?.value.trim() || "";

    const raw_data_appointment =
      document.getElementById("date-appointment")?.textContent.trim() || "";
    const data_appointment = convertDateFormat(raw_data_appointment);
    const time_appointment =
      document.getElementById("time-appointment")?.textContent.trim() || "";

    const appointmentData = {
      tipologia_visita,
      nome_paziente,
      cognome_paziente,
      numero_studio,
      note,
      voce_prezzario,
      durata,
      data: data_appointment,
      orario: time_appointment,
      csrfmiddlewaretoken:
        document.querySelector("input[name='csrfmiddlewaretoken']")?.value ||
        "",
    };

    console.log("📢 Dati inviati (POST):", appointmentData);

    // Invio dei dati al backend Django tramite POST
    fetch("/salva-appuntamento/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": appointmentData.csrfmiddlewaretoken,
      },
      body: JSON.stringify(appointmentData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("📢 Risposta dal server (POST):", data);
        if (data.success) {
          showAlert("success", "Appuntamento salvato con successo!");
          // Rimuove le anteprime e resetta il form
          document
            .querySelectorAll(".appointment-preview")
            .forEach((el) => el.remove());
          if (selectedDayCell) {
            removeAppointmentPreview(selectedDayCell);
            selectedDayCell = null;
          }
          resetFormFields();
          loadAppointments();
          closeModalWithGSAP();
        } else {
          showAlert(
            "danger",
            "Errore nel salvataggio dell'appuntamento: " + data.error
          );
        }
      })
      .catch((error) => {
        console.error("❌ Errore durante il salvataggio (POST):", error);
        showAlert("danger", "Si è verificato un errore inaspettato.");
      });
});

// GESTIONE SECONDA MODALE
/*  -----------------------------------------------------------------------------------------------
    evento per aprire la seconda modale
--------------------------------------------------------------------------------------------------- */
// Selezioniamo il pulsante "add-user"
document.querySelectorAll('[title="add-user"]').forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.stopPropagation(); // Evita chiusure accidentali della modale principale
    
    // 1. Mostra l'overlay subito (senza animazioni)
    let addUserModal = document.getElementById("addUserModal");
    addUserModal.classList.remove("hidden-user-modal");
    
    // 2. Anima solo il contenuto interno con GSAP
    gsap.fromTo(
      ".modal-content-user",
      { opacity: 0, y: -50 },   // stato iniziale
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" } // stato finale
    );
    
    // Disabilita la modale principale finché è aperta la "seconda" modale
    document.getElementById("appointmentModal").style.pointerEvents = "none";
  });
});


// Chiudi la seconda modale senza chiudere la principale
document.getElementById("closeAddUserModal").addEventListener("click", function () {
    // Prima animiamo il contenuto .modal-content-user con GSAP
    gsap.to(".modal-content-user", {
      opacity: 0,
      y: -50,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        // Al termine dell'animazione, aggiungi la classe che nasconde la modale
        let addUserModal = document.getElementById("addUserModal");
        addUserModal.classList.add("hidden-user-modal");
        
        // Riattiva la modale principale
        document.getElementById("appointmentModal").style.pointerEvents = "auto";

        // Facoltativo: se vuoi che, alla prossima apertura,
        // la modal parta di nuovo da opacity:0, y:-50,
        // reimposta subito questi valori:
        gsap.set(".modal-content-user", { opacity: 1, y: 0 });
      }
    });
});

// Impedisce la chiusura della modale principale quando si clicca dentro la seconda
document.getElementById("addUserModal").addEventListener("click", function (e) {
  e.stopPropagation();
});

/*  -----------------------------------------------------------------------------------------------
    evento per aggiungere un paziente
--------------------------------------------------------------------------------------------------- */
document.getElementById("addUserForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let newName = document.getElementById("newName").value.trim();
  let newSurname = document.getElementById("newSurname").value.trim();
  let newPhone = document.getElementById("newCell").value.trim();
  let newEmail = document.getElementById("newEmail").value.trim();

  // 🔹 Recupera il token CSRF
  function getCSRFToken() {
    let csrfTokenElement = document.querySelector(
      "input[name='csrfmiddlewaretoken']"
    );
    return csrfTokenElement ? csrfTokenElement.value : null;
  }

  if (!newName || !newSurname || !newPhone || !newEmail) {
    alert("Errore: Uno o più campi del form non sono stati trovati nel DOM.");
    return;
  }

  if (!newName || !newSurname) {
    showAlert("danger", "Nome e cognome sono obbligatori!");
    return;
  }

  let csrfToken = getCSRFToken();
  if (!csrfToken) {
      console.error("Errore: token CSRF non trovato nel DOM.");
      showAlert("danger", "Errore di sicurezza: impossibile procedere. Ricarica la pagina e riprova.");
      return;
  }

  fetch("/aggiungi-paziente/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      name: newName,
      surname: newSurname,
      email: newEmail,
      phone: newPhone,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("success", "Paziente aggiunto con successo!");
        // **AGGIORNAMENTO DINAMICO DEL SELECT**
        let selectPazienti = document.getElementById("paziente-select"); // Assicurati che l'ID del select sia corretto
        if (selectPazienti) {
          let newOption = document.createElement("option");
          newOption.value = `${newName} ${newSurname}`; // Puoi anche usare un ID se il backend lo restituisce
          newOption.textContent = `${newName} ${newSurname}`;
          selectPazienti.appendChild(newOption);
        }

        // **Chiudi la modale senza ricaricare la pagina**
        let addUserModal = document.getElementById("addUserModal");
        addUserModal.classList.add("hidden-user-modal");

        // Riattiva la modale principale
        document.getElementById("appointmentModal").style.pointerEvents = "auto";

        // **Svuota i campi del form**
        newName.value = "";
        newSurname.value = "";
        newPhone.value = "";
        newEmail.value = "";
      } else {
        showAlert("danger", "Errore: " + data.error);
      }
    })
    .catch((error) => showAlert("danger", "Errore:", error));
});

/*  -----------------------------------------------------------------------------------------------
    gestione input animati
--------------------------------------------------------------------------------------------------- */

// gestione input prefissi
document.addEventListener("DOMContentLoaded", function () {
  // Lista di prefissi con bandiere
  const prefissi = [
    {
      value: "+39",
      flag: "/static/includes/icone/bandiera-italiana.png",
      country: "Italia",
      code: "IT",
    },
    {
      value: "+33",
      flag: "/static/includes/icone/bandiera-francia.png",
      country: "Francia",
      code: "FR",
    },
    {
      value: "+44",
      flag: "/static/includes/icone/bandiera-inglese.png",
      country: "Regno Unito",
      code: "GB",
    },
    {
      value: "+49",
      flag: "/static/includes/icone/bandiera-germania.png",
      country: "Germania",
      code: "DE",
    },
    {
      value: "+34",
      flag: "/static/includes/icone/bandiera-spagnola.png",
      country: "Spagna",
      code: "ES",
    },
    {
      value: "+1",
      flag: "/static/includes/icone/bandiera-usa.png",
      country: "Stati Uniti",
      code: "US",
    },
  ];

  const selectContainer = document.querySelector(".custom-select");
  const selectedOption = selectContainer.querySelector(".selected-option");
  const optionsList = selectContainer.querySelector(".options-list");
  const hiddenInput = document.getElementById("hidden-prefisso");

  // **1️⃣ Rileva la posizione dell'utente e imposta il prefisso corretto**
  async function setUserCountryPrefix() {
    try {
      const response = await fetch(
        "https://ipapi.co/json/"
      );
      const data = await response.json();
      console.log("📍 Nazione rilevata:", data.country);

      // Trova il prefisso associato alla nazione
      const userPrefix = prefissi.find((p) => p.code === data.country);
      if (userPrefix) {
        updateSelectedPrefix(userPrefix);
      }
    } catch (error) {
      console.error("❌ Errore nel rilevare la posizione dell'utente:", error);
    }
  }

  // **2️⃣ Funzione per aggiornare il prefisso selezionato**
  function updateSelectedPrefix(prefisso) {
    selectedOption.innerHTML = `
          <img src="${prefisso.flag}" alt="${prefisso.country}" class="flag-icon">
          <span id="selected-prefix">${prefisso.value}</span>
      `;
    hiddenInput.value = prefisso.value; // Aggiorna il campo nascosto
  }

  // **3️⃣ Popola la lista delle opzioni dinamicamente**
  prefissi.forEach((prefisso) => {
    const li = document.createElement("li");
    li.innerHTML = `
          <img src="${prefisso.flag}" alt="${prefisso.country}" class="flag-icon">
          <span>${prefisso.value}</span>
      `;
    li.addEventListener("click", () => {
      updateSelectedPrefix(prefisso);
      optionsList.style.display = "none"; // Chiude il menu
    });
    optionsList.appendChild(li);
  });

  // **4️⃣ Mostra/Nasconde il menu delle opzioni**
  selectedOption.addEventListener("click", () => {
    optionsList.style.display =
      optionsList.style.display === "block" ? "none" : "block";
    optionsList.paddingLeft = "0px";
  });

  // **5️⃣ Chiude il menu se si clicca fuori**
  document.addEventListener("click", (e) => {
    if (!selectContainer.contains(e.target)) {
      optionsList.style.display = "none";
    }
  });

  // **6️⃣ Imposta il prefisso predefinito in base alla nazione dell'utente**
  setUserCountryPrefix();
});

// Gestione input animati form
document.querySelectorAll(".input-container input").forEach((input) => {
  input.addEventListener("focus", function () {
    this.previousElementSibling.classList.add("active-label");
  });

  input.addEventListener("blur", function () {
    if (this.value === "") {
      this.previousElementSibling.classList.remove("active-label");
    }
  });
});

/*  -----------------------------------------------------------------------------------------------
    gestione ricerca e correlati
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function() {
  // Listener sull'input con debounce
  searchInput.addEventListener("input", function () {
    const currentQuery = this.value.toLowerCase().trim();
    // Svuota immediatamente i risultati
    resultsContainer.innerHTML = "";
    
    if (currentQuery.length < 2) return; // Attendi almeno 2 caratteri

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      // Controlla se il valore corrente corrisponde al query catturato
      if (this.value.toLowerCase().trim() !== currentQuery) return;
      
      // Svuota nuovamente il contenitore per sicurezza
      resultsContainer.innerHTML = "";
      
      fetch(`/search-appointments/?q=${encodeURIComponent(currentQuery)}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            if (data.appointments.length === 0) {
              resultsContainer.innerHTML = "<p>Nessun appuntamento trovato</p>";
              return;
            }
            data.appointments.forEach(app => {
              const item = document.createElement("div");
              item.classList.add("search-result-item");
              // Crea un riepilogo dell'appuntamento
              item.innerHTML = `
                <span>${app.tipologia_visita} - ${app.orario.slice(0,5)}</span>
                <div>
                  <button class="action-btn view" title="Visualizza">👁️</button>
                  <button class="action-btn edit" title="Modifica">✏️</button>
                </div>
              `;
              // Listener per visualizzare i dettagli
              item.querySelector(".view").addEventListener("click", () => {
                viewAppointmentDetails(app.id);
                closeSearchModal();
              });
              // Listener per aprire la modale di modifica
              item.querySelector(".edit").addEventListener("click", () => {
                openAppointmentModal(app.id);
                closeSearchModal();
              });
              resultsContainer.appendChild(item);
              
              // Applica un'animazione GSAP per far apparire l'elemento
              gsap.from(item, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: "power2.out"
              });
            });
          } else {
            resultsContainer.innerHTML = "<p>Nessun appuntamento trovato</p>";
          }
        })
        .catch(err => {
          console.error("Errore durante la ricerca:", err);
          resultsContainer.innerHTML = "<p>Errore nella ricerca</p>";
        });
    }, 300);
  });

  // Funzione per resettare l'input e i risultati
  function resetSearchModal() {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
  }

  // Funzione per chiudere la modale di ricerca con effetto GSAP
  function closeSearchModal() {
    gsap.to(searchModal, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        searchModal.classList.add("hidden-modal-search");
        gsap.set(searchModal, { opacity: 1 });
        resetSearchModal();
      }
    });
  }

  // Listener per chiudere la modale cliccando fuori (se non clicchi sul pulsante di ricerca)
  document.addEventListener("click", (e) => {
    if (!searchModal.classList.contains("hidden-modal-search") &&
        !searchModal.contains(e.target) &&
        !e.target.classList.contains("search-button")) {
      closeSearchModal();
    }
  });

  // Listener per il pulsante di apertura della modale (classe "search-button")
  const searchButton = document.querySelector(".search-button");
  if (searchButton) {
    searchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      resetSearchModal(); // Pulisce eventuali risultati precedenti
      searchModal.classList.remove("hidden-modal-search");
      // Effetto GSAP per l'animazione dell'input (es. espansione in larghezza)
      gsap.fromTo(searchInput, { width: 0 }, { width: "300px", duration: 0.5, ease: "power2.out" });
      searchInput.focus();
    });
  }
});


/*  -----------------------------------------------------------------------------------------------
  GESTIONE RENDERIZZAMENTO SU GOOGLE CALENDAR
--------------------------------------------------------------------------------------------------- */
// Converte una data dal formato "DD/MM/YYYY" a "YYYY-MM-DD"
function parseLocalDate(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
}

function addToGoogleCalendar(appointment) {
  // Se la data contiene "/" assumiamo formato "DD/MM/YYYY" e convertiamola
  let formattedDate = appointment.data;
  if (appointment.data.includes("/")) {
    formattedDate = parseLocalDate(appointment.data);
  }
  
  // Combina la data e l'orario per creare un oggetto Date
  const startDateTime = new Date(`${formattedDate}T${appointment.orario}`);
  
  // Imposta una durata (default 30 minuti)
  const duration = parseInt(appointment.durata) || 30;
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
  
  // Funzione helper per formattare la data nel formato richiesto da Google Calendar: YYYYMMDDTHHmmss
  function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }
  
  const startStr = formatDateTime(startDateTime);
  const endStr = formatDateTime(endDateTime);
  
  // Costruisci il titolo (ad esempio: "Tipologia con Nome Paziente")
  const title = encodeURIComponent(`${appointment.tipologia_visita} con ${appointment.nome_paziente || ''}`);
  // Note come dettagli
  const details = encodeURIComponent(appointment.note || '');
  // Posizione forzata
  const location = encodeURIComponent("Via Nicola Tridente, 22, 70125 Bari BA, Italia");
  
  // Imposta il fuso orario (ad es. Europe/Rome)
  const ctz = encodeURIComponent("Europe/Rome");
  
  // Costruisci la URL per Google Calendar
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&ctz=${ctz}`;
  return calendarUrl;
}

// Listener per il pulsante di aggiunta a Google Calendar
document.getElementById("googleCalendarBtn").addEventListener("click", function() {
  // Raccogli i dati dall'interfaccia
  // Per la data, controlla il contenuto del <span id="date-appointment"> e rimuovi virgole/spazi
  const dateElem = document.getElementById("date-appointment");
  let rawDate = dateElem.textContent.trim(); // es. ", 27/03/2025,"
  rawDate = rawDate.replace(/,/g, "").trim();   // diventa "27/03/2025"
  
  // Raccogli gli altri dati
  const appointment = {
    // Usa il valore che hai ottenuto
    data: rawDate, // atteso in formato "DD/MM/YYYY"
    orario: document.getElementById("time-appointment").textContent.trim(), // es. "09:00"
    tipologia_visita: document.getElementById("tipologia_visita").value,
    durata: document.getElementById("time").value, // durata in minuti
    // Se il select contiene "nome|id", prendi solo il nome
    nome_paziente: document.getElementById("paziente-select").value.split("|")[0],
    note: document.getElementById("note").value,
    numero_studio: document.getElementById("studio").value
  };
  
  const calendarUrl = addToGoogleCalendar(appointment);
  window.open(calendarUrl, '_blank');
});
