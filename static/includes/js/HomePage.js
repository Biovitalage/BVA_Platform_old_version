/*  -----------------------------------------------------------------------------------------------
  GLOBAL VARIABLES
--------------------------------------------------------------------------------------------------- */
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
  Actions on appointments
--------------------------------------------------------------------------------------------------- */
function confirmDeleteAppointment(appointmentId) {
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
    deleteAppointment(appointmentId, confirmAlert);
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

function deleteAppointment(appointmentId, confirmAlert) {
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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".action-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr"); // Trova la riga
      const appointmentId = row.getAttribute("data-id"); // Ottiene l'ID dall'attributo data-id
      const action = this.classList.contains("approve") ? "approve" : "delete";

      if (action === "approve") {
        fetch(`/api/appointments/${appointmentId}/approve/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              row.style.backgroundColor = "#d4edda"; // Verde per indicare confermato
              showAlert("success", "Appuntamento confermato!");
            } else {
              showAlert("danger", "Errore: " + data.error);
            }
          });
      } else if (action === "delete") {
        confirmDeleteAppointment(appointmentId);
      }
    });
  });

  function getCSRFToken() {
    let csrfToken = null;
    document.cookie.split(";").forEach((cookie) => {
      let [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") csrfToken = value;
    });
    return csrfToken;
  }
});


/*  -----------------------------------------------------------------------------------------------
    ANIMAZIONE NUMERI
--------------------------------------------------------------------------------------------------- */
// 🔹 Anima i numeri che calolano il totale
document.addEventListener('DOMContentLoaded', function(){
  // Funzione per animare il conteggio di un elemento
  const animateNumber = (selector, duration = 2) => {
    const element = document.querySelector(selector);
    if (!element) return;
    const target = parseInt(element.textContent, 10);
    // Inizializza un oggetto con count = 0
    const obj = { count: 0 };
    gsap.to(obj, {
      duration: duration,
      count: target,
      ease: "power1.out",
      roundProps: "count",  // Arrotonda il numero durante l'animazione
      onUpdate: () => {
        element.textContent = obj.count;
      }
    });
  };
  
  // Anima i numeri
  animateNumber("#total-pazienti");
  animateNumber("#total-biological-age");
});

/*  -----------------------------------------------------------------------------------------------
    ANIMAZIONE NUMERI DELLE CARD DEI REPORT
--------------------------------------------------------------------------------------------------- */
// Registra ScrollTrigger in GSAP
gsap.registerPlugin(ScrollTrigger);

// Seleziona tutti gli elementi che hanno la classe "animate-num"
document.querySelectorAll('.animate-num').forEach(function(elem) {
  var target = parseFloat(elem.getAttribute('data-target')) || 0;
  var obj = { value: 0 };

  gsap.to(obj, {
    value: target,
    duration: 2,
    ease: "power1.out",
    scrollTrigger: {
      trigger: elem,
      start: "top 80%",
      once: true
    },
    onUpdate: function() {
      elem.textContent = Math.round(obj.value);
    }
  });
});