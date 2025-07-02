/*  -----------------------------------------------------------------------------------------------
  Indicator New function
--------------------------------------------------------------------------------------------------- */
const ContainerIndicatori = document.querySelectorAll(".indicator-container");

ContainerIndicatori.forEach((element) => {
  try { 
    const indicatorContainer = element.querySelector(".indicator-content-container");
    const indicator = element.querySelector(".indicatore");
    const valoreEsame = parseFloat(indicator?.getAttribute("data-value") || 0);

    const containerRangePositive = indicatorContainer.querySelector(".positiveTesto");
    const rangePositiveIndicator = containerRangePositive?.querySelectorAll("p") || [];
    let minPositive = rangePositiveIndicator[0]?.textContent.trim();
    let maxPositive = rangePositiveIndicator[1]?.textContent.trim();

    // Gestione del valore ">0"
    if (minPositive === ">0") {
      minPositive = 0.1; 
    }

    // Converti in numeri per i calcoli
    minPositive = parseFloat(minPositive);
    maxPositive = parseFloat(maxPositive);

    const rangeNegativeIndicator = parseFloat(
      element.querySelector(".negativeTesto")?.textContent.split(" ")[0] || 0
    );
    const extremeRightRangeIndicator = parseFloat(
      element.querySelector(".extremeNegativeRange")?.textContent.split(" ")[1] || 0
    );

    if (isNaN(valoreEsame) || isNaN(minPositive) || isNaN(maxPositive)) {
      
      return;
    }

    if (
      valoreEsame >= minPositive &&
      valoreEsame <= maxPositive
    ) {
   
      const percentuale = ((valoreEsame - minPositive) / (maxPositive - minPositive)) * 30 + 26;
      indicator.style.left = `${Math.round(percentuale)}%`;
    } else if (valoreEsame < minPositive) {
     
      const percentuale = ((valoreEsame - rangeNegativeIndicator) / (minPositive - rangeNegativeIndicator)) * 30 - 4;
      indicator.style.left = `${Math.max(Math.round(percentuale), 0)}%`;
    } else if (valoreEsame > maxPositive) {
 
      const percentuale = ((valoreEsame - maxPositive) / (extremeRightRangeIndicator - maxPositive)) * 30 + 66;
      indicator.style.left = `${Math.min(Math.round(percentuale), 100)}%`;
    } else {
      console.warn("Caso non gestito per valoreEsame:", valoreEsame);
    }

  } catch (error) {
    console.error("Errore durante l'elaborazione:", error, element);
  }
});


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

              if (index % 2 !== 0 && index > 1) { // Se è dispari (1, 3, 5...) ed esiste un precedente
                  allCards[index - 2]?.classList.add("full_width"); // Aggiunge la classe alla precedente
              }
          }
      });
  });
});






/*  -----------------------------------------------------------------------------------------------
Function for gender selection
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const genderSelect = document.getElementById("gender");

  if (!genderSelect) {
    console.error("Elemento con ID 'gender' non trovato.");
    return;
  }

  // Funzione per aggiornare la visibilità dei form-group
  function updateFormGroups(selectedGender) {
    const formGroups = document.querySelectorAll(".form-group");

    formGroups.forEach((group) => {
      const label = group.querySelector("label");
      const numberInput = group.querySelector('input[type="number"]');
      const rangeInput = group.querySelector('input[type="range"]');

      if (label && numberInput && rangeInput) {
        const isMan = label.textContent.includes("Uomo");
        const isWoman = label.textContent.includes("Donna");

        if (
          (selectedGender === "M" && isWoman) ||
          (selectedGender === "F" && isMan)
        ) {
          numberInput.disabled = true;
          rangeInput.disabled = true;
          group.classList.add("hidden-form-group");
        } else {
          numberInput.disabled = false;
          rangeInput.disabled = false;
          group.classList.remove("hidden-form-group");
        }
      }
    });
  }

  // Inizializza il comportamento basato sul valore predefinito del select
  const initialGender = genderSelect.value;
  if (initialGender) {
    updateFormGroups(initialGender);
  }

  // Aggiungi l'evento per reagire ai cambiamenti del select
  genderSelect.addEventListener("change", function () {
    updateFormGroups(this.value);
  });
});

/*  -----------------------------------------------------------------------------------------------
  Slider Range
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  // Seleziona tutti gli input di tipo "number" e "range"
  const numericInputs = document.querySelectorAll('input[type="number"]');
  const rangeInputs = document.querySelectorAll('input[type="range"]');

  numericInputs.forEach((input) => {
    const rangeInput = document.getElementById(input.id + "_range");

    if (rangeInput) {
      // Sincronizzazione tra input numerico e range
      input.addEventListener("input", function () {
        if (!isNaN(input.value) && input.value !== "") {
          rangeInput.value = input.value;
          updateRangeStyle(rangeInput);
        } else if (input.value === "") {
          rangeInput.value = 0;
          updateRangeStyle(rangeInput);
        }
      });

      rangeInput.addEventListener("input", function () {
        input.value = rangeInput.value;
        updateRangeStyle(rangeInput);
      });
    }
  });

  rangeInputs.forEach(updateRangeStyle);

  function updateRangeStyle(slider) {
    const value =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty("--value", `${value}%`);
  }
});

// AUTO PREFILL PROVINCIA FIELD
// Listener per l'autoprefill della provincia e del codice catastale
document
  .getElementById("place_of_birth")
  .addEventListener("input", function () {
    const inputCity = this.value;
    const dataList = document.getElementById("cities");
    const options = dataList.getElementsByTagName("option");
    let found = false;

    for (let option of options) {
      if (option.value.toLowerCase() === inputCity.toLowerCase()) {
        document.getElementById("province").value =
          option.getAttribute("data-province");
        const codiceCastale = option.getAttribute("data-codice-catastale");
        found = true;
        // Correzione: Chiamare direttamente la funzione generazione del codice fiscale
        generateFiscalCode(codiceCastale);
        break;
      }
    }

    if (!found) {
      document.getElementById("province").value = "";
      document.getElementById("codice_fiscale").value = "";
    }
  });
