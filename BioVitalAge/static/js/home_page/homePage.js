import showAlert from "../components/showAlert.js";
import { confirmDeleteAction } from "../components/deleteAction.js";

/*---------------------------------------------------------------------------------------------------
  CONFERMA APPUNTAMENTI
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // 1) Listener globale per qualsiasi click sulla “X” di un alert
    document.body.addEventListener("click", (e) => {
      if (e.target.matches(".btn-close")) {
        window.location.reload();
      }
    });
  
    // 2) Funzione per leggere il CSRF token dal cookie
    function getCSRFToken() {
      let token = null;
      document.cookie.split(";").forEach((cookie) => {
        const [name, val] = cookie.trim().split("=");
        if (name === "csrftoken") token = decodeURIComponent(val);
      });
      return token;
    }
  
    // 3) Loop sui pulsanti azione
    document.querySelectorAll(".action-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const row = this.closest("tr");
        const appointmentId = row.dataset.id;
        const isApprove = this.classList.contains("approve");
  
        if (isApprove) {
          try {
            const response = await fetch(`/api/appointments/${appointmentId}/approve/`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
              },
            });
            const data = await response.json();
  
            if (data.success) {
              // evidenzio la riga come confermata
              row.style.backgroundColor = "#d4edda";
  
              // mostro alert di successo
              showAlert({type: "success", message: "Appuntamento confermato!", extraMessage: "", borderColor: "var(--positive-color)"})
  
              // ricarico dopo 5 secondi
              setTimeout(() => window.location.reload(), 5000);
            } else {
              showAlert({type: "danger", message: "Errore: " + (data.error || "sconosciuto"), extraMessage: "", borderColor: "#EF4444"})
            }
          } catch (err) {
            console.error("Errore di rete durante la conferma:", err);
            showAlert({type: "danger", message: "Errore di rete durante la conferma", extraMessage: "", borderColor: "#EF4444"})
          }
  
        } else {
          // delete usa già confirmDeleteAction
          confirmDeleteAction({
            url: `/delete-appointment/${appointmentId}/`,
            elementToRemove: row,
            successMessage: "Appuntamento eliminato con successo!",
            errorMessage: "Errore nella cancellazione dell'appuntamento",
            confirmMessage: "Sei sicuro di voler eliminare questo appuntamento?",
            borderColor: "#EF4444",
          });
        }
      });
    });
});
  

/*  -----------------------------------------------------------------------------------------------
    ANIMAZIONE NUMERI
--------------------------------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function(){

  const animateNumber = (selector, duration = 2) => {
    const element = document.querySelector(selector);
    if (!element) return;
    const target = parseInt(element.textContent, 10);

    const obj = { count: 0 };
    gsap.to(obj, {
      duration: duration,
      count: target,
      ease: "power1.out",
      roundProps: "count",  
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
gsap.registerPlugin(ScrollTrigger);

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


/*  -----------------------------------------------------------------------------------------------
    RIMUOVI APPUNTAMENTI PASSATI
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const rows = document.querySelectorAll("table tbody tr");

  rows.forEach((row) => {
    const dateCell = row.querySelector("td:nth-child(3)"); 

    if (dateCell) {
      const dateParts = dateCell.textContent.trim().split("/");
      const rowDate = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0])
      );

      rowDate.setHours(0, 0, 0, 0);

      if (rowDate < today) {
        row.style.display = "none";
      }
    }
  });
});

