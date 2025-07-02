/*  -----------------------------------------------------------------------------------------------
  GLOBAL VARIABLES
--------------------------------------------------------------------------------------------------- */
// ARRAY NOTIFICHE
let notifications = [];
let dismissedNotifications = JSON.parse(localStorage.getItem("dismissedNotifications")) || [];

let emails = [
  { subject: "Risultati laboratorio", sender: "Clinica Roma" },
  { subject: "Nuova richiesta prenotazione", sender: "Segreteria" }
];

const updates = [
  { version: "v3.15.2", description: "Correzione bug e miglioramenti UI Home Page" },
  { version: "v3.15.2", description: "Abilitate le notifiche nella Home Page per gli appuntamenti in arrivo e quelli del giorno stesso." },
  { version: "v3.15.2", description: "Abilitate le notifiche nella Home Page ache per le news del mondo medico." },
  { version: "v3.15.2", description: "Impostato un layou adatto alle news con link che porta a quella news." },
  { version: "v3.15.2", description: "Debug sezione appuntamenti completato con esito positivo" },
  { version: "v3.15.2", description: "..." }
];

const configurations = [
  { setting: "Lingua", value: "Italiano" },
  { setting: "Account", value: typeof currentUser !== 'undefined' ? currentUser : "N/A" }
];

const features = [
  { name: "Sezione Appuntamenti", description: "Permette di pianificare e gestire appuntamenti con i pazienti e anche di aggiungere, eventualmente, l'appuntamento su Google Calendar" },
  { name: "Sezione Promemoria", description: "Permette di aggiungere dei promemoria e ti consente di visualizzare tutti gli appuntamenti in scadenza e quelli più importanti" },
  { name: "Sezione Pazienti", description: "Mostra una barra di ricerca che ti consente di ricercare il paziente per Nome, Cognome, Dottore Associato e Codice Fiscale" },
  { name: "Sezione Aggiungi Pazienti", description: "Ti consente di aggiungere dei pazienti completando i campi con i dati necessari" }
];

/*  -----------------------------------------------------------------------------------------------
  SIDEBAR HANDLER
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const sidebarTitle = document.getElementById("sidebar-title");
  const sidebarContent = document.getElementById("sidebar-content");
  const closeSidebar = document.getElementById("closeSidebar");
  const bgSidebar = document.querySelector(".bg-sidebar");

  document.querySelectorAll(".sidebar-trigger").forEach((trigger) => {
    const section = trigger.getAttribute("data-section");
    if (section === "Notifiche") {
      let badge = document.createElement("span");
      badge.classList.add("badge-count");
      badge.textContent = notifications.length;
      trigger.appendChild(badge);
    } else if (section === "Email") {
      let badge = document.createElement("span");
      badge.classList.add("badge-count");
      badge.textContent = emails.length;
      trigger.appendChild(badge);
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const section = trigger.getAttribute("data-section");
      sidebarTitle.textContent = section;

      switch (section) {
        case "Notifiche":
          renderNotifications();
          break;
        case "Email":
          sidebarContent.innerHTML = emails
            .map((email) => `
              <div class="alert alert-info notification">
                  <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" style="text-decoration: none; color: inherit;">
                      ${email.subject} - ${email.sender}
                  </a>
              </div>
            `).join("");
          break;
        case "Update":
          sidebarContent.innerHTML = updates
            .map((update, index) => `
              <div class="alert alert-warning notification" data-index="${index}">
                  ${update.version} - ${update.description}
              </div>
            `).join("");
          break;
        case "Configurazione":
          sidebarContent.innerHTML = configurations
            .map((config, index) => `
              <div class="alert alert-secondary notification" data-index="${index}">
                  ${config.setting} - ${config.value}
              </div>
            `).join("");
          break;
        case "Funzionalità":
          sidebarContent.innerHTML = features
            .map((feature, index) => `
              <div class="alert alert-success notification" data-index="${index}">
                  ${feature.name} - ${feature.description}
              </div>
            `).join("");
          break;
        default:
          sidebarContent.innerHTML = "<p>Contenuto non disponibile.</p>";
      }

      document.body.classList.add("visible");

      requestAnimationFrame(() => {
        const elements = document.querySelectorAll(".notification");
        if (elements.length > 0) {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.2,
          });
        } else {
          console.warn("⚠️ Nessuna notifica trovata per GSAP.");
        }
      });
    });
  });

  bgSidebar.addEventListener("click", () => {
    document.body.classList.remove("visible");
  });
  closeSidebar.addEventListener("click", () => {
    document.body.classList.remove("visible");
  });

  const logoutBtn = document.getElementById("nav-bar-user-modal-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("dismissedNotifications");
    });
  }

  fetchAppointmentNotifications();
  fetchMedicalNewsNotifications();

  setInterval(() => {
    fetchAppointmentNotifications();
    fetchMedicalNewsNotifications();
  }, 60000);
});

/*  -----------------------------------------------------------------------------------------------
  NOTIFICATION MANAGEMENT
--------------------------------------------------------------------------------------------------- */
function removeNotification(notificationElement) {
  const index = parseInt(notificationElement.getAttribute('data-index'), 10);
  const message = notificationElement.textContent.trim();
  dismissedNotifications.push(message);
  localStorage.setItem("dismissedNotifications", JSON.stringify(dismissedNotifications));

  gsap.to(notificationElement, {
    opacity: 0,
    y: -20,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      notificationElement.remove();
      notifications.splice(index, 1);
      updateNotificationsBadge();
    }
  });
}

function updateNotificationsBadge() {
  const trigger = document.querySelector('.sidebar-trigger[data-section="Notifiche"]');
  if (trigger) {
    const badge = trigger.querySelector('.badge-count');
    if (badge) {
      const count = notifications.length;
      badge.textContent = count;
      badge.style.display = count === 0 ? "none" : "flex";
    }
  }
}

function showAlert(type, message) {
  const existingAlert = document.getElementById("global-alert");
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement("div");
  alertDiv.id = "global-alert";
  alertDiv.classList.add("alert", `alert-${type}`, "fade", "show");
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "20px";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translateX(-50%)";
  alertDiv.style.zIndex = "9999999999999";
  alertDiv.style.width = "auto";
  alertDiv.style.maxWidth = "400px";
  alertDiv.style.display = "flex";
  alertDiv.style.justifyContent = "space-between";
  alertDiv.style.alignItems = "center";
  alertDiv.style.padding = "10px 15px";
  alertDiv.style.borderRadius = "6px";
  alertDiv.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
  alertDiv.style.opacity = "0";

  alertDiv.innerHTML = `
    <span>${message}</span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(alertDiv);

  gsap.to(alertDiv, { opacity: 1, duration: 0.3, ease: "power2.out" });

  setTimeout(() => {
    gsap.to(alertDiv, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => alertDiv.remove(),
    });
  }, 5000);
}

async function fetchAppointmentNotifications() {
  try {
    const response = await fetch('/api/appointment-notifications/');
    const data = await response.json();
    if (data.success) {
      const filtered = data.notifications.filter(n => !dismissedNotifications.includes(n.message));

      // Rimuovi precedenti notifiche appointment
      notifications = notifications.filter(n => n.origin !== 'appointments');

      // Aggiungi con origin
      filtered.forEach(n => n.origin = 'appointments');
      notifications = notifications.concat(filtered);

      updateNotificationsBadge();
    }
  } catch (error) {
    console.error("Errore nel recupero notifiche appuntamenti:", error);
  }
}

async function fetchMedicalNewsNotifications() {
  try {
    const response = await fetch('/api/medical-news-notifications/');
    const data = await response.json();

    if (data.success) {
      console.log("📥 Notizie ricevute dall'API:", data);

      const newsToShow = data.news;  // 🔥 rimosso il filtro con ignoredNews

      console.log("🧹 Notizie da mostrare:", newsToShow);

      newsToShow.forEach((news) => {
        const notifica = {
          type: news.type,
          message: `
            <div class="news-notification">
              <div class="news-date text-muted mb-1">${news.published_at}</div>
              <div class="news-title fw-bold">${news.title}</div>
              <div class="news-description text-muted text-truncate-3">${news.description}</div>
              <a href="${news.link}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">Leggi di più</a>
            </div>
          `
        };
        notifications.push(notifica);
      });

      updateNotificationsBadge();
    }
  } catch (error) {
    console.error("Errore nel recupero notizie mediche:", error);
  }
}


function renderNotifications() {
  const sidebarContent = document.getElementById("sidebar-content");
  sidebarContent.innerHTML = notifications
    .map((notifica, index) => `
      <div class="alert alert-${notifica.type} notification" data-index="${index}">
        ${notifica.message}
        <button type="button" class="btn-close" onclick="removeNotification(this.parentElement)"></button>
      </div>
    `).join("");

  requestAnimationFrame(() => {
    const elements = document.querySelectorAll(".notification");
    if (elements.length > 0) {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.2,
      });
    } else {
      console.warn("⚠️ Nessuna notifica trovata per GSAP.");
    }
  });
}















/*  -----------------------------------------------------------------------------------------------
  Graphs and Charts
--------------------------------------------------------------------------------------------------- */

// Chart: Patients by Age
const ctx1 = document.getElementById("patientsByAge").getContext("2d");
new Chart(ctx1, {
  type: "bar",
  data: {
    labels: [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "0-5",
        data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
        backgroundColor: "#6a2dcc",
      },
      {
        label: "6-15",
        data: [7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62],
        backgroundColor: "#8041e0",
      },
      {
        label: "16-25",
        data: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
        backgroundColor: "#9666e4",
      },
      {
        label: "26-45",
        data: [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
        backgroundColor: "#ad8be8",
      },
      {
        label: "46+",
        data: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
        backgroundColor: "#c3b0ec",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Chart: Patients
const ctx2 = document.getElementById("patients").getContext("2d");
new Chart(ctx2, {
  type: "line",
  data: {
    labels: [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Nuovo",
        data: [50, 60, 55, 70, 75, 80, 90, 85, 95, 100, 105, 110],
        borderColor: "#6a2dcc",
        backgroundColor: "#3b255d2c",
        fill: true,
      },
      {
        label: "Ritorno",
        data: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
        borderColor: "#9666e4",
        backgroundColor: "#c3b0ec",
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Chart: Income by Department
const ctx3 = document.getElementById("incomeByDepartment").getContext("2d");
new Chart(ctx3, {
  type: "bar",
  data: {
    labels: [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ],

    datasets: [
      {
        label: "Neurologia",
        data: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
        backgroundColor: "#6a2dcc",
      },
      {
        label: "Cura dei denti",
        data: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        backgroundColor: "#8041e0",
      },
      {
        label: "Ginecologia",
        data: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
        backgroundColor: "#9666e4",
      },
      {
        label: "Ortopedia",
        data: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
        backgroundColor: "#ad8be8",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

const weeklyCtx = document.getElementById("weeklyPatientsChart");
new Chart(weeklyCtx, {
  type: "line",
  data: {
    labels: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    datasets: [
      {
        label: "Pazienti Visitati",
        data: [5, 10, 8, 12, 15, 20, 5],
        borderColor: "#fff",
        backgroundColor: "rgba(255,255,255,0.3)",
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  },
});

const patientsCtx = document.getElementById("patientsChart");
new Chart(patientsCtx, {
  type: "bar",
  data: {
    labels: [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Pazienti Inseriti",
        data: [30, 45, 60, 50, 41, 66, 30, 50, 70, 90, 100, 120],
        backgroundColor: "#6a2dcc",
        categoryPercentage: 2.8, // Maggior spazio tra le categorie
        barPercentage: 0.1, // Barre più sottili
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false, // Mostra tutte le etichette
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

const monthlyCtx = document.getElementById("monthlyPatientsChart");
const monthlyData = {
  labels: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  datasets: [
    {
      label: "Pazienti Mensili",
      data: [40, 60, 55, 70, 80, 90, 100, 85, 75, 95, 110, 120],
      backgroundColor: "#c3b0ec",
      borderColor: "#6a2dcc",
      borderWidth: 2,
      fill: true,
    },
  ],
};

let monthlyPatientsChart = new Chart(monthlyCtx, {
  type: "line",
  data: monthlyData,
  options: {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
    onHover: (event, chartElement) => {
      const tooltip = document.getElementById("monthlyTooltip");
      if (chartElement.length > 0) {
        const index = chartElement[0].index;
        const monthLabel = monthlyData.labels[index];
        const patientCount = monthlyData.datasets[0].data[index];
        const calcCount = Math.floor(patientCount * 0.6);

        tooltip.innerHTML = `
                      <strong>${monthLabel}</strong><br>
                      Pazienti: ${patientCount}<br>
                      Con calcolo età bio: ${calcCount}
                  `;
        const canvasPos = monthlyCtx.getBoundingClientRect();
        tooltip.style.opacity = 1;
        tooltip.style.left = event.clientX - canvasPos.left + "px";
        tooltip.style.top = event.clientY - canvasPos.top + "px";
      } else {
        const tooltip = document.getElementById("monthlyTooltip");
        tooltip.style.opacity = 0;
      }
    },
  },
});
