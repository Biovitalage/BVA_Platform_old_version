/*  -----------------------------------------------------------------------------------------------
   GLOBAL VARIABLES
--------------------------------------------------------------------------------------------------- */
const csrftoken = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute('content');


let notifications = [];
let appUser = window.currentUser || 'guest'; 
let previousUser = null;
const updates = [
  {
    version: "v3.15.2",
    description: "Correzione bug e miglioramenti UI Home Page",
  },
  {
    version: "v3.15.2",
    description:
      "Abilitate le notifiche nella Home Page per gli appuntamenti in arrivo e quelli del giorno stesso.",
  },
  {
    version: "v3.15.2",
    description:
      "Abilitate le notifiche nella Home Page anche per le news del mondo medico.",
  },
  {
    version: "v3.15.2",
    description:
      "Impostato un layout adatto alle news con link che porta a quella news.",
  },
  {
    version: "v3.15.2",
    description: "Debug sezione appuntamenti completato con esito positivo",
  },
  { version: "v3.15.2", description: "..." },
];

const configurations = [
  { setting: "Ruolo", value: role },
  { setting: "Lingua", value: "Italiano" },
  {
    setting: "Account",
    value: typeof currentUser !== "undefined" ? currentUser : "N/A",
  },
];

const features = [
  {
    name: "Sezione Appuntamenti",
    description:
      "Permette di pianificare e gestire appuntamenti con i pazienti e anche di aggiungere, eventualmente, l'appuntamento su Google Calendar",
  },
  {
    name: "Sezione Promemoria",
    description:
      "Permette di aggiungere dei promemoria e ti consente di visualizzare tutti gli appuntamenti in scadenza e quelli più importanti",
  },
  {
    name: "Sezione Pazienti",
    description:
      "Mostra una barra di ricerca che ti consente di ricercare il paziente per Nome, Cognome, Dottore Associato e Codice Fiscale",
  },
  {
    name: "Sezione Aggiungi Pazienti",
    description:
      "Ti consente di aggiungere dei pazienti completando i campi con i dati necessari",
  },
];


/*  -----------------------------------------------------------------------------------------------
   USER MANAGEMENT
--------------------------------------------------------------------------------------------------- */
let userCheckInProgress = false;

function checkUserChange() {
  if (userCheckInProgress) return;
  userCheckInProgress = true;
  
  const templateUser = window.currentUser || 'guest';
  const storedUser = localStorage.getItem('appUser') || 'guest';

  if (templateUser !== storedUser) {
    handleUserChange(templateUser);
  }

  localStorage.setItem('appUser', templateUser);
  appUser = templateUser;
  userCheckInProgress = false;
}

async function handleUserChange(newUser) {
  if (newUser === appUser) return;

  previousUser = appUser;
  appUser = newUser || 'guest';
  
  // Resetta solo lo stato frontend
  notifications = [];
  dismissedNotifications = [];
  
  // Carica i dati per il nuovo utente
  try {
    await Promise.all([
      initUserNotifications(),
      fetchNotifications(),
    ]);
    updateAllBadges();
  } catch (error) {
    console.error("Errore durante il cambio utente:", error);
  }
}

/*  -----------------------------------------------------------------------------------------------
   INITIALIZATION
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Verifica il cambio utente
  checkUserChange();

  // 2. Configura intervallo di aggiornamento
  setInterval(fetchNotifications, 3600000);

  // Eseguiamo subito un primo check
  pollEmailCount().then(updateAllBadges);

  // Poi impostiamo un intervallo, ad esempio ogni 30 secondi
  setInterval(async () => {
    await pollEmailCount();
    updateAllBadges();
  }, 30000);

  updateAllBadges();

  // 4. Listener per logout
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.setItem("pendingLogout", "true");
    localStorage.removeItem("appUser");
  });
});


/*  -----------------------------------------------------------------------------------------------
   SIDEBAR HANDLER
--------------------------------------------------------------------------------------------------- */
// Funzione per il fetch delle notifiche
async function fetchNotifications() {
  await fetchAppointmentNotifications();
  await fetchMedicalNewsNotifications();
  updateNotificationsBadge();
  updateAllBadges(); 
  localStorage.setItem(`notifications_${appUser}`, JSON.stringify(notifications));
}

updateAllBadges();
initUserNotifications();
fetchNotifications();

// Funzione per renderizzare le notifiche
document.addEventListener("DOMContentLoaded", () => {
  const sidebarTitle = document.getElementById("sidebar-title");
  const sidebarContent = document.getElementById("sidebar-content");
  const closeSidebar = document.getElementById("closeSidebar");
  const bgSidebar = document.querySelector(".bg-sidebar");

  // Inizializza con l'utente corrente
  handleUserChange(typeof currentUser !== 'undefined' ? currentUser : 'guest');

  // Listener per le notifiche
  document.querySelectorAll(".sidebar-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const section = trigger.getAttribute("data-section");
      sidebarTitle.textContent = section;

      switch (section) {
        case "Notifiche":
          renderNotifications();
          break;
        case "Email":
          // 1) metto un loader temporaneo
          sidebarContent.innerHTML = `
          <div class="sk-cube-grid">
            <div class="sk-cube sk-cube1"></div>
            <div class="sk-cube sk-cube2"></div>
            <div class="sk-cube sk-cube3"></div>
            <div class="sk-cube sk-cube4"></div>
            <div class="sk-cube sk-cube5"></div>
            <div class="sk-cube sk-cube6"></div>
            <div class="sk-cube sk-cube7"></div>
            <div class="sk-cube sk-cube8"></div>
            <div class="sk-cube sk-cube9"></div>
          </div>`;
          
          // 2) chiamo la fetch (che *deve* restituire la Promise di un array di email)
          fetchEmailNotifications()
            .then((emails) => {
              // 3) appena arriva l'array, lo porto su sidebarContent
              if (Array.isArray(emails) && emails.length > 0) {
                sidebarContent.innerHTML = emails
                  .map(
                    (e) => `
                    <a href="${e.link}" target="_blank"
                       class="alert alert-warning notification d-block text-decoration-none"
                       data-id="${e.id}">
                      <strong>${e.subject}</strong><br>
                      <small>${e.from}</small>
                    </a>
                  `
                  )
                  .join("");
              } else {
                sidebarContent.innerHTML = `
                    <p class="default-text-notification">
                      Nessuna email disponibile.
                    </p>
                  `;
              }
            })
            .catch((err) => {
              console.error("Errore durante il recupero delle email:", err);
              sidebarContent.innerHTML = `
                  <p class="default-text-notification">
                    Errore nel caricamento delle email, collega un account prima.
                  </p>
                `;
            })
            .finally(() => {
              // 4) in ogni caso, mostro la sidebar e scateno GSAP sulle .notification
              document.body.classList.add("visible");
              requestAnimationFrame(() => {
                const elems = document.querySelectorAll(".notification");
                if (elems.length) {
                  gsap.to(elems, {
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
          break;
        case "Appuntamenti":
          break;
        case "Update":
          sidebarContent.innerHTML = updates
            .map(
              (update, index) => `
              <div class="alert alert-warning notification" data-index="${index}">
                  ${update.version} - ${update.description}
              </div>
            `
            )
            .join("");
          break;
        case "Configurazione":
          sidebarContent.innerHTML = configurations
            .map(
              (config, index) => `
              <div class="alert alert-secondary notification" data-index="${index}">
                  ${config.setting} - ${config.value}
              </div>
            `
            )
            .join("");
          break;
        case "Funzionalità":
          sidebarContent.innerHTML = features
            .map(
              (feature, index) => `
              <div class="alert alert-success notification" data-index="${index}">
                  ${feature.name} - ${feature.description}
              </div>
            `
            )
            .join("");
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

  // Listener per chiudere lo sfondo della sidebar
  bgSidebar.addEventListener("click", () => {
    document.body.classList.remove("visible");
  });

  // Listener per chiudere la sidebar
  closeSidebar.addEventListener("click", () => {
    document.body.classList.remove("visible");
  });

  // Listener per il pulsante di logout
  const logoutBtn = document.getElementById("nav-bar-user-modal-btn");

  // Listener per il pulsante di logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Al logout (esempio)
      handleUserChange('guest');
    });
  }

  // Listener per il pulsante di login
  document.getElementById('login-btn')?.addEventListener('click', () => {
    handleUserChange(currentUser); // Sostituisci con l'utente reale

  });

  // Avvia i fetch
  fetchAppointmentNotifications();
  fetchMedicalNewsNotifications();

  // 1. Verifica il cambio utente ad ogni caricamento
  checkUserChange();

  setInterval(() => {
    fetchAppointmentNotifications();
    fetchMedicalNewsNotifications();
  }, 60000);
});


/*  -----------------------------------------------------------------------------------------------
   NOTIFICATION MANAGEMENT
--------------------------------------------------------------------------------------------------- */
// Inizializzazione con pulizia
function initUserNotifications() {
  const userKey = `notifications_${appUser}`;
  const dismissedKey = `dismissedNotifications_${appUser}`;

  notifications = JSON.parse(localStorage.getItem(userKey)) || [];
  dismissedNotifications = JSON.parse(localStorage.getItem(dismissedKey)) || [];

  // Filtra ID non validi
  dismissedNotifications = dismissedNotifications.filter(id => id && id !== 'undefined');

  updateNotificationsBadge();
}

function saveUserNotifications() {
  const userKey = `notifications_${appUser}`;
  const dismissedKey = `dismissedNotifications_${appUser}`;

  localStorage.setItem(userKey, JSON.stringify(notifications));
  localStorage.setItem(dismissedKey, JSON.stringify(dismissedNotifications));
}

// Chiama all'inizio
initUserNotifications();

// Funzione di rimozione robusta
function removeNotification(notificationElement) {
  const id = notificationElement.getAttribute('data-id');
  if (!id) return;

  const dismissedKey = `dismissedNotifications_${appUser}`;

  if (!dismissedNotifications.includes(id)) {
    dismissedNotifications.push(id);
    localStorage.setItem(dismissedKey, JSON.stringify(dismissedNotifications));
  }

  notifications = notifications.filter(n => n.id !== id);
  localStorage.setItem(`notifications_${appUser}`, JSON.stringify(notifications));

  gsap.to(notificationElement, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    onComplete: () => {
      notificationElement.remove();
      updateNotificationsBadge();
    }
  });
}

// Aggiornamento badge garantito
function updateNotificationsBadge() {
  const trigger = document.querySelector('.sidebar-trigger[data-section="Notifiche"]');
  if (!trigger) return;

  let badge = trigger.querySelector(".badge-count") || document.createElement("span");
  badge.className = "badge-count";

  const activeNotifications = notifications.filter(
    (n) => n.id && !dismissedNotifications.includes(n.id)
  );

  badge.textContent = activeNotifications.length > 0 ? activeNotifications.length : "";
  badge.style.display = activeNotifications.length > 0 ? "flex" : "none";

  if (!trigger.contains(badge)) {
    trigger.appendChild(badge);
  }
}

// Aggiorna tutti i badge
function updateAllBadges() {
  // Badge Notifiche
  const notifTrigger = document.querySelector('.sidebar-trigger[data-section="Notifiche"]');
  if (notifTrigger) {
    let badge = notifTrigger.querySelector(".badge-count");
    const activeNotifications = notifications.filter(n => n.id && !dismissedNotifications.includes(n.id));
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "badge-count";
      notifTrigger.appendChild(badge);
    }
    badge.textContent = activeNotifications.length;
    badge.style.display = activeNotifications.length > 0 ? "flex" : "none";
  }

  // Badge Email
  const emailTrigger = document.querySelector('.sidebar-trigger[data-section="Email"]');
  if (emailTrigger) {
    let badge = emailTrigger.querySelector(".badge-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "badge-count";
      emailTrigger.appendChild(badge);
    }

    const emailCount = window.emailCount || 0;
    badge.textContent = emailCount;
    badge.style.display = emailCount > 0 ? "flex" : "none";
  }

}

// Modifica la funzione fetchMedicalNewsNotifications
// Funzione per generare l'HTML delle news
function generateNewsHTML(news) {
  // Crea un oggetto Date a partire dalla stringa ricevuta
  const date = new Date(news.published_at);
  // Format della data in italiano, puoi personalizzare le opzioni se necessario
  const formattedDate = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(date);

  return `
    <div class="news-notification">
      <div class="news-date text-muted mb-1">${formattedDate}</div>
      <div class="news-title fw-bold">${news.title}</div>
      <div class="news-description text-muted text-truncate-3">${news.description}</div>
      <a href="${news.link}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">Leggi di più</a>
    </div>
  `;
}

// Funzione per il fetch delle news
async function fetchMedicalNewsNotifications() {
  try {
    const response = await fetch("/api/medical-news-notifications/", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Accept": "application/json",
        "X-CSRFToken": csrftoken
      }
    });

    if (!response.ok) {
      console.warn("News-Notifications fallita:", response.status);
      return;
    }

    const data = await response.json();
    if (data.success) {
      // …gestisci le news…
    }
  } catch (err) {
    console.error("Errore fetchMedicalNewsNotifications:", err);
  }
}


// Funzione per il fetch delle notifiche di appuntamenti
async function fetchAppointmentNotifications() {

  try {
    const response = await fetch("/api/appointment-notifications/", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Accept": "application/json",
        "X-CSRFToken": csrftoken
      }
    });
    if (!response.ok) {
      console.warn("APPT-Notifications fallita:", response.status);
      return;
    }
    const data = await response.json();

    if (data.success) {
   
      const filtered = data.notifications.filter(
        (n) => !dismissedNotifications.includes(n.message)
      );
   
      notifications = notifications.filter((n) => n.origin !== "appointments");
   
      filtered.forEach((n) => {
        if (!n.id) {
          n.id = n.message;
        }
        n.origin = "appointments";
      });
      notifications = notifications.concat(filtered);
      updateNotificationsBadge();
    }
  } catch (err) {
    console.error("Errore fetchAppointmentNotifications:", err);
  }

} 

// Funzione per il fetch delle email
async function fetchEmailNotifications() {
  const res = await fetch("/api/email-notifications/", {
    credentials: "same-origin",
    headers: {
      "Accept": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "fetchNonRiuscito");
  return data.emails;  // <-- restituisco l'array direttamente
}

/* EMAIL FETCHING */
function getCookie(name) {
  let cookieValue = null;
  document.cookie.split(';').forEach(cookie => {
    const [key, val] = cookie.trim().split('=');
    if (key === name) cookieValue = decodeURIComponent(val);
  });
  return cookieValue;
}

// 1) Funzione che richiama le email e restituisce il numero di messaggi
async function pollEmailCount() {
  try {
    const emails = await fetchEmailNotifications();
    // Se fetchEmailNotifications() restituisce array di oggetti email
    window.emailCount = Array.isArray(emails) ? emails.length : 0;
  } catch (err) {
    console.error("Errore durante il polling delle email:", err);
    // In caso di errore, non mostriamo badge
    window.emailCount = 0;
  }
}

// Modifica renderNotifications per usare data-id corretti
function renderNotifications() {
  const sidebarContent = document.getElementById("sidebar-content");
  const activeNotifications = notifications.filter(
    (n) => !dismissedNotifications.includes(n.id)
  );

  sidebarContent.innerHTML = activeNotifications.length > 0 
    ? activeNotifications.map(notifica => `
        <div class="alert alert-${notifica.type} notification" data-id="${notifica.id}">
          ${notifica.message}
          <button type="button" class="btn-close" onclick="removeNotification(this.parentElement)"></button>
        </div>
      `).join("")
    : `<p class="default-text-notification">Attualmente non hai notifiche.</p>`;

  gsap.to(".notification", { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
}
