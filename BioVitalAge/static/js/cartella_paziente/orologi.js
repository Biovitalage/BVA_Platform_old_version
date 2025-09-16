/*  -----------------------------------------------------------------------------------------------
  Function for section toggles
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".btn-selected").forEach(button => {
      button.addEventListener("click", function () {
          const buttonId = this.id;
          const contentId = buttonId.replace("-show", "Content");
          const content = document.getElementById(contentId);
          const card = this.closest(".card-indices");
          const allCards = document.querySelectorAll(".card-indices");

          // Chiude tutte le altre sezioni aperte
          document.querySelectorAll(".card-indices_content").forEach(section => {
              if (section !== content) {
                  section.classList.remove("open");
                  section.style.maxHeight = "0";
              }
          });

          // Rimuove la classe full_width da tutte le card
          allCards.forEach(card => card.classList.remove("full_width"));

          document.querySelectorAll(".btn-selected svg polyline").forEach(svg => {
              svg.setAttribute("points", "6 9 12 15 18 9");
          });

          if (content.classList.contains("open")) {
              content.classList.remove("open");
              content.style.maxHeight = "0";
              this.querySelector("svg polyline").setAttribute("points", "6 9 12 15 18 9");
          } else {
              content.classList.add("open");
              content.style.maxHeight = content.scrollHeight + "px";
              this.querySelector("svg polyline").setAttribute("points", "18 15 12 9 6 15");

              // Trova la posizione della card nell'elenco
              const index = Array.from(allCards).indexOf(card) + 1; // Indice 1-based

              if (index % 2 !== 0 && index > 1) { 
                // Se è dispari (1, 3, 5...) ed esiste un precedente
                  allCards[index - 2]?.classList.add("full_width"); // Aggiunge la classe alla precedente
              }
          }
      });
  });
});
