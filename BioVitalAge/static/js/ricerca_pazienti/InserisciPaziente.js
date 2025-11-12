/*  -----------------------------------------------------------------------------------------------
        Script per la logica dei pulsanti "Yes/No"
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const chooseButtonsContainers = document.querySelectorAll(".choose-buttons");

  chooseButtonsContainers.forEach((buttonsContainer) => {
    const yesButton = buttonsContainer.querySelector('[data-choice="yes"]');
    const noButton = buttonsContainer.querySelector('[data-choice="no"]');

    const containerCard = buttonsContainer.closest(".container-card");
    if (!containerCard) return;

    const sportingLifestyle = containerCard.querySelector('[data-lifestyle="sporting-lifestyle"]');
    const sedentaryLifestyle = containerCard.querySelector('[data-lifestyle="sedentary-lifestyle"]');

    const genericTable = buttonsContainer.nextElementSibling;

    function toggleInputs(container, enable) {
      container.querySelectorAll("input").forEach(input => {
        if (enable) {
          input.removeAttribute("disabled");
        } else {
          input.setAttribute("disabled", "true");
        }
      });
    }

    if (sportingLifestyle && sedentaryLifestyle) {
      yesButton.addEventListener("click", (e) => {
        e.preventDefault();
        sportingLifestyle.style.display = "block";
        sedentaryLifestyle.style.display = "none";
        toggleInputs(sportingLifestyle, true);
        toggleInputs(sedentaryLifestyle, false);
      });

      noButton.addEventListener("click", (e) => {
        e.preventDefault();
        sportingLifestyle.style.display = "none";
        sedentaryLifestyle.style.display = "block";
        toggleInputs(sportingLifestyle, false);
        toggleInputs(sedentaryLifestyle, true);
      });

    } else if (genericTable) {
      yesButton.addEventListener("click", (e) => {
        e.preventDefault();
        genericTable.style.display = "block";
        toggleInputs(genericTable, true);
      });

      noButton.addEventListener("click", (e) => {
        e.preventDefault();
        genericTable.style.display = "none";
        toggleInputs(genericTable, false);
      });
    }
  });
});


/*  -----------------------------------------------------------------------------------------------
  BMI CALCULATOR
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const heightInput = document.querySelector("input[name='height']");
  const weightInput = document.querySelector("input[name='weight']");
  const bmiInput = document.querySelector("input[name='bmi']");

  function calculateBMI() {
    const heightValue = parseFloat(heightInput.value);
    const weightValue = parseFloat(weightInput.value);

    if (!isNaN(heightValue) && !isNaN(weightValue) && heightValue > 0) {
      const heightInMeters = heightValue / 100; // Convert cm to meters
      const bmi = weightValue / (heightInMeters * heightInMeters);
      bmiInput.value = bmi.toFixed(2); // Set BMI with 2 decimal places
    } else {
      bmiInput.value = ""; // Clear BMI if values are invalid
    }
  }

  heightInput.addEventListener("input", calculateBMI);
  weightInput.addEventListener("input", calculateBMI);
});




document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', function () {
    const targetId = this.dataset.target;

    // Se è un radio "Altro"
    if (targetId) {
      const parentFlex = this.closest('.flex-container');

      // Nasconde tutte le opzioni della stessa sezione
      parentFlex.querySelectorAll(`#${targetId}`).forEach(el => el.style.display = 'none');

      // Mostra il container-input-comparsa relativo
      const inputContainer = parentFlex.querySelector('.container-input-comparsa');
      inputContainer.classList.add('show');

    } else {
      // Se NON è "Altro", assicurati che l'input scompaia e le opzioni tornino visibili
      const parentFlex = this.closest('.flex-container');

      const inputContainer = parentFlex.querySelector('.container-input-comparsa');
      if (inputContainer) {
        inputContainer.classList.remove('show');
        const textInput = inputContainer.querySelector('input[type="text"]');
        if (textInput) textInput.value = '';
      }

      // Mostra di nuovo le opzioni standard
      parentFlex.querySelectorAll('.opzione-cella[id]').forEach(el => el.style.display = 'flex');
    }
  });
});

// Gestione di tutti i bottoni "Indietro"
document.querySelectorAll('#torna-indietro').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault();

    const parentFlex = this.closest('.flex-container');

    // Mostra di nuovo tutte le opzioni nascoste
    parentFlex.querySelectorAll('.opzione-cella[id]').forEach(el => el.style.display = 'flex');

    // Nasconde il container-input
    const inputContainer = parentFlex.querySelector('.container-input-comparsa');
    if (inputContainer) {
      inputContainer.classList.remove('show');
      const textInput = inputContainer.querySelector('input[type="text"]');
      if (textInput) textInput.value = '';
    }

    // Deseleziona tutti i radio della sezione
    parentFlex.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
  });
});

$(document).ready(function () {
  let currentStep = 0;
  let stepIds = [];

  function updateStepIds() {
    const gender = $("#gender").val();
    stepIds = [
      "personal",
      ...(gender === "F" ? ["donna"] : []),
      "anamnesi",
      "anamnesi2",
      "datibase",
      "datibase2",
      "esameObbiettivo"
    ];
  }

  function showStep(step) {
    $(".section, .container-card, .table_data").hide();
    updateStepIds();

    const stepId = stepIds[step];
    if (!stepId) return;

    const currentSection = $(`#${stepId}`);
    currentSection.fadeIn();
    currentSection.find(".container-card").show();

    if (stepId === "datibase2") {
      currentSection.find(".choose-buttons").css("display", "flex");
      currentSection.find(".responsive-table").hide().find("input").attr("disabled", true);
    }

    updateProgressBar();
    toggleButtons();
  }

  function updateProgressBar() {
    let progress = ((currentStep + 1) / stepIds.length) * 100;
    $("#progress-bar").css("width", progress + "%");
  }

  function toggleButtons() {
    $("#prevStep").prop("disabled", currentStep === 0);
    $("#nextStep").prop("disabled", currentStep >= stepIds.length - 1);
  }

  // Prima visualizzazione
  updateStepIds();
  showStep(currentStep);

  $("#nextStep").click(function () {
    updateStepIds();
    if (currentStep < stepIds.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  $("#prevStep").click(function () {
    updateStepIds();
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  $("input, select").change(function () {
    if ($(this).attr("id") === "gender") {
      updateStepIds();
      currentStep = 0;
      showStep(currentStep);
    }

    const parentCard = $(this).closest(".section, .container-card, .table_data");
    if (parentCard.find("input, select").filter(function () {
      return $(this).val() === "";
    }).length === 0) {
      setTimeout(() => $("#nextStep").click(), 500);
    }
  });

  $(".form-container").prepend('<div class="progress-container"><div id="progress-bar"></div></div>');
  $(".progress-container").css({
    "width": "100%",
    "height": "10px",
    "background": "#ddd",
    "margin-bottom": "15px"
  });
  $("#progress-bar").css({
    "width": "0%",
    "height": "100%",
    "background": "#4caf50"
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const genderSelect = document.getElementById("gender");
  const donnaSection = document.getElementById("donna");

  function toggleDonnaSection() {
    if (genderSelect.value === "F") {
      donnaSection.classList.remove("hidden");
    } else {
      donnaSection.classList.add("hidden");
    }
  }

  // Inizializza al load
  toggleDonnaSection();

  // Reagisce ai cambiamenti
  genderSelect.addEventListener("change", toggleDonnaSection);
});


document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("age-form");

  form.addEventListener("submit", function () {
    // Per ogni input "Altro" visibile
    document.querySelectorAll(".container-input-comparsa.show").forEach(container => {
      const inputText = container.querySelector("input[type='text']");
      const selectedRadio = container.closest(".flex-container").querySelector("input[type='radio']:checked");

      if (selectedRadio && inputText && inputText.value.trim() !== "") {
        selectedRadio.value = inputText.value.trim();  // Sovrascrive il value del radio con quello dell'input
      }
    });
  });
});
