import showAlert from "../../components/showAlert.js";

/*  -----------------------------------------------------------------------------------------------
    Funzione per la selezione del punteggio fisico
--------------------------------------------------------------------------------------------------- */

// function showConfirmModal(callback) {
//   const modal = document.getElementById("confirm-reset-modal");
//   const confirmButton = document.getElementById("confirm-reset-btn");
//   const cancelButton = document.getElementById("cancel-reset-btn");

//   modal.classList.remove("hidden-modal-custom");

//   confirmButton.onclick = function () {
//     modal.classList.add("hidden-modal-custom");
//     callback(true); // Confermato
//   };

//   cancelButton.onclick = function () {
//     modal.classList.add("hidden-modal-custom");
//     callback(false); // Annullato
//   };

//   // Chiudi la modale cliccando fuori
//   modal.onclick = function (event) {
//     if (event.target === modal) {
//       modal.classList.add("hidden-modal-custom");
//       callback(false); // Annullato
//     }
//   };
// }

// document.addEventListener("DOMContentLoaded", function () {
//   const csrfToken = document
//     .querySelector('meta[name="csrf-token"]')
//     .getAttribute("content");

//   const punteggioFisicoSelect = document.getElementById("punteggio_fisico");
//   const resetButton = document.getElementById("reset-score");

//   if (punteggioFisicoSelect) {
//     // ✅ Evento per il salvataggio automatico del punteggio fisico
//     punteggioFisicoSelect.addEventListener("change", function () {
//       const selectedValue = punteggioFisicoSelect.value;

//       if (selectedValue) {
//         fetch(updatePersonaComposizioneUrl, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": csrfToken,
//           },
//           body: JSON.stringify({
//             punteggio_fisico: selectedValue,
//           }),
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             if (data.success) {
//               console.log("Punteggio Fisico aggiornato con successo.");
//             } else {
//               console.error("Errore dal server:", data.error);
//             }
//           })
//           .catch((error) => {
//             console.error("Errore nella richiesta:", error);
//           });
//       }
//     });
//   }

//   // ✅ Evento per il reset dello storico dei punteggi
//   if (resetButton) {
//     resetButton.addEventListener("click", function () {
//       showConfirmModal(function (confirmed) {
//         if (!confirmed) return; // Se annulla, esce dalla funzione

//         fetch(updatePersonaComposizioneUrl, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": csrfToken,
//           },
//           body: JSON.stringify({ reset_storico_punteggi: true }),
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             if (data.success) {
//               console.log("Storico punteggi resettato con successo.");

//               // ✅ Resetta il select a "-- Seleziona il punteggio --"
//               punteggioFisicoSelect.selectedIndex = 0;

//               // ✅ Ricarica la pagina per riflettere il reset
//               location.reload();
//             } else {
//               console.error("Errore dal server:", data.error);
//             }
//           })
//           .catch((error) => {
//             console.error("Errore nella richiesta:", error);
//           });
//       });
//     });
//   }
// });

/*  -----------------------------------------------------------------------------------------------
    FUNZIONE MODIFICA DATI
--------------------------------------------------------------------------------------------------- */
// document.addEventListener("DOMContentLoaded", function () {
//   // Trova il pulsante/link con title="Modifica"
//   const editButton = document.querySelector('a[title="Modifica"]');
//   if (!editButton) {
//     console.error('Il pulsante "Modifica" non è stato trovato.');
//     return;
//   }

//   // Leggiamo il token CSRF (presente nel meta)
//   const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

//   const fields = {
//     height: "altezza",
//     weight: "peso",
//     bmi: "bmi",
//     bmi_detection_date: "bmi_detection_date",
//     girth_value: "girth_value",
//     girth_date: "girth_date",
//     girth_notes: "girth_notes",
//     sport_frequency: "sport_frequency",
//     livello_sedentarieta: "livello_sedentarieta",
//     grasso: "grasso",
//     acqua: "acqua",
//     massa_ossea: "massa_ossea",
//     massa_muscolare: "massa_muscolare",
//     bmr: "bmr",
//     eta_metabolica: "eta_metabolica",
//     grasso_viscerale: "grasso_viscerale",
//     whr: "whr",
//     whtr: "whtr",
//   };

//   let isEditing = false;

//   editButton.addEventListener("click", function (event) {
//     event.preventDefault();

//     if (!isEditing) {
//       // ---- ENTRA IN MODIFICA ----
//       isEditing = true;

//       // Per ogni campo definito in 'fields', creiamo un <input>
//       Object.keys(fields).forEach((key) => {
//         const fieldElement = document.getElementById(fields[key]);
//         if (fieldElement) {
//           const originalValue = fieldElement.dataset.value?.trim() || fieldElement.textContent.trim() || "";

//           // Crea un input
//           const input = document.createElement("input");
//           // Se l'ID contiene "date", lo mettiamo come type="date"
//           input.type = fieldElement.id.includes("date") ? "date" : "text";

//           // Se è un campo date, formatta
//           if (input.type === "date") {
//             input.value = formatDateForInput(originalValue);
//           } else {
//             input.value = originalValue;
//           }

//           // Un ID unico per l'input
//           input.id = `${key}Input`;
//           // Salviamo il valore originale
//           input.dataset.originalValue = originalValue;

//           // Svuota il testo del <p> e ci infiliamo l'input
//           fieldElement.textContent = "";
//           fieldElement.appendChild(input);
//         }
//       });

//       // Avvia il calcolo BMI automatico (se serve)
//       setupBMICalculation();

//       // Cambia il pulsante in "Salva"
//       editButton.innerHTML = `
//         Salva 
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               width="30"
//               height="30"
//               class="svg save-icon"
//             >
//               <path
//                 d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"
//               ></path>
//             </svg>
//         `;
//       editButton.title = "Salva";

//     } else {
//       // ---- SALVA MODIFICHE ----
//       let finalPayload = {};

//       Object.keys(fields).forEach((key) => {
//         const input = document.getElementById(`${key}Input`);
//         if (!input) return;

//         let newValue = input.value.trim();
//         const oldValue = input.dataset.originalValue.trim();

//         if (input.type === "date") {
//           // Se è <input type="date">, formattiamo in yyyy-mm-dd
//           newValue = formatDateForInput(newValue);
//         } else {
//           // Se è un campo testo/numerico
//           if (newValue.toLowerCase() === "inserisci valore" || newValue === "") {
//             newValue = null;
//           } else if (!isNaN(newValue)) {
//             newValue = parseFloat(newValue);
//           } 
//           // altrimenti rimane la stringa così com'è
//         }

//         // Se il valore è cambiato, lo mettiamo nel payload
//         if (String(newValue) !== String(oldValue)) {
//           finalPayload[key] = newValue;
//         }
//       });

//       console.log("Final Payload:", finalPayload);

//       // Se non è cambiato nulla, non facciamo la fetch
//       if (Object.keys(finalPayload).length === 0) {
//         console.log("Nessuna modifica rilevata. Nessuna richiesta inviata.");
//         resetEditingState();
//         return;
//       }

//       // Manda la fetch al server
//       fetch(updatePersonaComposizioneUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRFToken": csrfToken,
//         },
//         body: JSON.stringify(finalPayload),
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           if (data.success) {
//             console.log("Dati aggiornati con successo.");

//             // Aggiorna il testo di ogni campo con i nuovi valori
//             Object.keys(finalPayload).forEach((key) => {
//               const fieldElement = document.getElementById(fields[key]);
//               if (fieldElement) {
//                 const val = finalPayload[key];
//                 fieldElement.textContent = val !== null ? String(val) : "Inserisci valore";
//                 fieldElement.dataset.value = val !== null ? String(val) : "Inserisci valore";
//               }
//             });

//             resetEditingState();
//           } else {
//             console.error("Errore dal server:", data.error);
//           }
//         })
//         .catch((error) => {
//           console.error("Errore nella richiesta:", error);
//         });
//     }
//   });

//   // Funzione per il calcolo automatico del BMI (se serve)
//   function setupBMICalculation() {
//     const targetNode = document.body; // Osserviamo il documento

//     const observer = new MutationObserver(() => {
//       const altezzaInput = document.getElementById("heightInput");
//       const pesoInput = document.getElementById("weightInput");
//       const bmiInput = document.getElementById("bmiInput");

//       if (altezzaInput && pesoInput && bmiInput) {
//         observer.disconnect(); // Smetti di osservare
//         const calculateBMI = () => {
//           let altezza = parseFloat(altezzaInput.value);
//           let peso = parseFloat(pesoInput.value);

//           // Se > 10, supponiamo che sia in cm e convertiamo in metri
//           if (!isNaN(altezza) && altezza > 10) {
//             altezza = altezza / 100; 
//           }

//           if (!isNaN(altezza) && altezza > 0 && !isNaN(peso) && peso > 0) {
//             const bmi = (peso / (altezza * altezza)).toFixed(2);
//             bmiInput.value = bmi;
//           } else {
//             bmiInput.value = "";
//           }
//         };

//         altezzaInput.addEventListener("input", calculateBMI);
//         pesoInput.addEventListener("input", calculateBMI);
//       }
//     });

//     observer.observe(targetNode, { childList: true, subtree: true });
//   }

//   // Formatta la data in YYYY-MM-DD per <input type="date">
//   function formatDateForInput(dateString) {
//     if (!dateString || dateString.toLowerCase() === "inserisci valore") {
//       return "";
//     }
//     // Se già in formato YYYY-MM-DD, la lasciamo così
//     if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
//       return dateString;
//     }
//     // Altrimenti proviamo a fare il parsing
//     const parsed = new Date(dateString);
//     if (!isNaN(parsed.getTime())) {
//       parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
//       return parsed.toISOString().split("T")[0];
//     }
//     return "";
//   }

//   // Torna alla visualizzazione "normale"
//   function resetEditingState() {
//     Object.keys(fields).forEach((key) => {
//       const fieldElement = document.getElementById(fields[key]);
//       const input = document.getElementById(`${key}Input`);
//       if (fieldElement && input) {
//         // Mostra il valore finale (se l'utente aveva scritto qualcosa)
//         fieldElement.textContent = input.value.trim() || "Inserisci valore";
//         fieldElement.dataset.value = input.value.trim() || "Inserisci valore";
//       }
//     });

//     editButton.innerHTML = `Edita
//                   <svg class="svg" viewBox="0 0 512 512">
//                     <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
//                   </svg>`;
//     editButton.title = "Modifica";
//     isEditing = false;
//   }
// });

/*  -----------------------------------------------------------------------------------------------
    FUNZIONE GENERAZIONE PDF
--------------------------------------------------------------------------------------------------- */
const generaBtnAvanzato = document.getElementById("pdfAvanzato");
const generaBtnBase = document.getElementById("pdfBase");

const { PDFDocument, rgb, StandardFonts } = PDFLib;

// Funzione per generare il PDF avanzato
async function generatePDFAvanzato() {
  try {
    const existingPdfBytes = await fetch(
      "/static/includes/pdfTemplates/ETA METABOLICA AVANZATA.pdf"
    ).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();

    // Stampa Informazioni Personali
    const userData = document.getElementById("userData");
    const name = userData.getAttribute("data-name");
    const surname = userData.getAttribute("data-surname");
    const dob = userData.getAttribute("data-dob");
    const cf = userData.getAttribute("data-cf");
    const place_birth = userData.getAttribute("data-place_birth");
    const chronological_age = userData.getAttribute("data-age");

    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */
    const objUserData = {
      name: name,
      surname: surname,
      dob: dob,
      cf: cf,
      place_birth: place_birth,
      chronological_age: chronological_age,
    };

    console.log("USER-DATA: ", objUserData);
    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */

    // Stampa dati avanzati
    const dataReferto = generaBtnAvanzato.getAttribute("data-referto-date");
    const idReferto = generaBtnAvanzato.getAttribute("data-referto-id");
    const bigData = document.getElementById("datiReferto");
    const height = bigData.getAttribute("data-altezza");
    const weight = bigData.getAttribute("data-peso-corporeo");
    const bmi = bigData.getAttribute("data-bmi");
    const grasso = bigData.getAttribute("data-grasso");
    const grasso_viscerale = bigData.getAttribute("data-grasso_viscerale");
    const acqua = bigData.getAttribute("data-acqua");
    const massa_muscolare = bigData.getAttribute("data-massa_muscolare");
    const massa_ossea = bigData.getAttribute("data-massa_ossea");
    const p_fisico = bigData.getAttribute("data-p_fisico");
    const bmr = bigData.getAttribute("data-bmr");
    const glicemia = bigData.getAttribute("data-glicemia");
    const ogtt1 = bigData.getAttribute("data-ogtt1");
    const ogtt2 = bigData.getAttribute("data-ogtt2");
    const emoglobina_g = bigData.getAttribute("data-emoglobina_g");
    const insulina_d = bigData.getAttribute("data-insulina_d");
    const curva_i = bigData.getAttribute("data-curva_i");
    const homa_ir = bigData.getAttribute("data-homa_ir");
    const tyg = bigData.getAttribute("data-tyg");
    const c_tot = bigData.getAttribute("data-c_tot");
    const hdl = bigData.getAttribute("data-hdl");
    const ldl = bigData.getAttribute("data-ldl");
    const trigliceridi = bigData.getAttribute("data-trigliceridi");
    const ast = bigData.getAttribute("data-ast");
    const alt = bigData.getAttribute("data-alt");
    const ggt = bigData.getAttribute("data-ggt");
    const bili_d = bigData.getAttribute("data-bili_d");
    const bili_in = bigData.getAttribute("data-bili_in");
    const pcr = bigData.getAttribute("data-pcr");
    const hgs = bigData.getAttribute("data-hgs");
    const sii = bigData.getAttribute("data-sii");
    const c_plasmatico = bigData.getAttribute("data-c_plasmatico");

    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */
    const objBigData = {
      idReferto: idReferto,
      dataReferto: dataReferto,
      height: height,
      weight: weight,
      glicemia: glicemia,
      ogtt1: ogtt1,
      ogtt2: ogtt2,
      bmi: bmi,
      grasso: grasso,
      grasso_viscerale: grasso_viscerale,
      acqua: acqua,
      massa_muscolare: massa_muscolare,
      massa_ossea: massa_ossea,
      p_fisico: p_fisico,
      bmr: bmr,
      emoglobina_g: emoglobina_g,
      insulina_d: insulina_d,
      curva_i: curva_i,
      homa_ir: homa_ir,
      tyg: tyg,
      c_tot: c_tot,
      hdl: hdl,
      ldl: ldl,
      trigliceridi: trigliceridi,
      ast: ast,
      alt: alt,
      ggt: ggt,
      bili_d: bili_d,
      bili_in: bili_in,
      pcr: pcr,
      hgs: hgs,
      sii: sii,
      c_plasmatico: c_plasmatico,
    };
    
    console.log("BIG-DATA: ", objBigData);

    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */
    
    
    // Stampa Informazioni Personali
    const personalInformationPages = pages[0];
    personalInformationPages.drawText(`${dataReferto}`, {
      x: 440,
      y: 720,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${idReferto}`, {
      x: 440,
      y: 706,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${surname}`, {
      x: 340,
      y: 692,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${name}`, {
      x: 455,
      y: 692,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${dob}`, {
      x: 340,
      y: 678,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${cf}`, {
      x: 295,
      y: 666,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${place_birth}`, {
      x: 280,
      y: 678,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${chronological_age}`, {
      x: 480,
      y: 678,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${height}`, {
      x: 300,
      y: 422,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${weight}`, {
      x: 310,
      y: 409,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${bmi}`, {
      x: 280,
      y: 250,
      size: 10,
      color: rgb(0, 0, 0),
    });


    // Stampa Grasso
    const grassoPages = pages[1];
    grassoPages.drawText(`${grasso}`, {
      x: 275,
      y: 635,
      size: 10,
      color: rgb(0, 0, 0),
    });
    grassoPages.drawText(`${acqua}`, {
      x: 290,
      y: 155,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa Massa Muscolare e Punteggio Fisico
    const massaPages = pages[2];
    massaPages.drawText(`${massa_muscolare}`, {
      x: 325,
      y: 507,
      size: 10,
      color: rgb(0, 0, 0),
    });
    massaPages.drawText(`${p_fisico}`, {
      x: 315,
      y: 415,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa massa ossea
    const massaOsseaPages = pages[3];
    massaOsseaPages.drawText(`${massa_ossea}`, {
      x: 225,
      y: 410,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa bmr e grasso viscerale
    const bmrGrassoPages = pages[4];
    bmrGrassoPages.drawText(`${bmr}`, {
      x: 380,
      y: 493,
      size: 10,
      color: rgb(0, 0, 0),
    });
    bmrGrassoPages.drawText(`${grasso_viscerale}`, {
      x: 275,
      y: 307,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa glicemia
    const glicemiaPages = pages[5];
    glicemiaPages.drawText(`${glicemia}`, {
      x: 210,
      y: 97,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa OGTT, Emoglobina G, Insulina, Homa IR, TYG
    const ogttPages = pages[6];
    ogttPages.drawText(`${ogtt1}`, {
      x: 210,
      y: 655,
      size: 10,
      color: rgb(0, 0, 0),
    });
    ogttPages.drawText(`${ogtt2}`, {
      x: 210,
      y: 625,
      size: 10,
      color: rgb(0, 0, 0),
    });
    ogttPages.drawText(`${emoglobina_g}`, {
      x: 210,
      y: 513,
      size: 10,
      color: rgb(0, 0, 0),
    });
    ogttPages.drawText(`${insulina_d}`, {
      x: 210,
      y: 417,
      size: 10,
      color: rgb(0, 0, 0),
    });
    ogttPages.drawText(`${homa_ir}`, {
      x: 210,
      y: 300,
      size: 10,
      color: rgb(0, 0, 0),
    });
    ogttPages.drawText(`${tyg}`, {
      x: 210,
      y: 187,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa Colesterolo Totale, HDL, LDL, Trigliceridi e AST
    const colesteroloPages = pages[7];
    colesteroloPages.drawText(`${c_tot}`, {
      x: 210,
      y: 611,
      size: 10,
      color: rgb(0, 0, 0),
    });
    colesteroloPages.drawText(`${hdl}`, {
      x: 150,
      y: 506,
      size: 10,
      color: rgb(0, 0, 0),
    });
    colesteroloPages.drawText(`${ldl}`, {
      x: 202,
      y: 391,
      size: 10,
      color: rgb(0, 0, 0),
    });
    colesteroloPages.drawText(`${trigliceridi}`, {
      x: 202,
      y: 281,
      size: 10,
      color: rgb(0, 0, 0),
    });
    colesteroloPages.drawText(`${ast}`, {
      x: 150,
      y: 62,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa ALT, GGT, BILI D, BILI IN, PCR, HGS e SII
    const altGgtPages = pages[8];
    altGgtPages.drawText(`${alt}`, {
      x: 153,
      y: 666,
      size: 10,
      color: rgb(0, 0, 0),
    });
    altGgtPages.drawText(`${ggt}`, {
      x: 153,
      y: 570,
      size: 10,
      color: rgb(0, 0, 0),
    });
    altGgtPages.drawText(`${bili_d}`, {
      x: 200,
      y: 473,
      size: 10,
      color: rgb(0, 0, 0),
    });
    altGgtPages.drawText(`${bili_in}`, {
      x: 200,
      y: 458,
      size: 10,
      color: rgb(0, 0, 0),
    });
    altGgtPages.drawText(`${pcr}`, {
      x: 200,
      y: 240,
      size: 10,
      color: rgb(0, 0, 0),
    });
    altGgtPages.drawText(`${sii}`, {
      x: 200,
      y: 79,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa C Plasmatico
    const cPlasmaticoPages = pages[9];
    cPlasmaticoPages.drawText(`${c_plasmatico}`, {
      x: 230,
      y: 489,
      size: 10,
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const nameUpperCase = name.toUpperCase();
    const surnameUpperCase = surname.toUpperCase();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ETA-METABOLICA-AVANZATA-${nameUpperCase}-${surnameUpperCase}.pdf`;
    link.click();
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
  }
}

// Funzione per generare il PDF base
async function generatePDFBase() {
  try {
    const existingPdfBytes = await fetch(
      "/static/includes/pdfTemplates/ETA METABOLICA BASE.pdf"
    ).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();

    // Stampa Informazioni Personali
    const userData = document.getElementById("userData");
    const name = userData.getAttribute("data-name");
    const surname = userData.getAttribute("data-surname");
    const dob = userData.getAttribute("data-dob");
    const cf = userData.getAttribute("data-cf");
    const place_birth = userData.getAttribute("data-place_birth");
    const chronological_age = userData.getAttribute("data-age");

    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */
    const objUserData = {
      name: name,
      surname: surname,
      dob: dob,
      cf: cf,
      place_birth: place_birth,
      chronological_age: chronological_age,
    };

    console.log("USER-DATA: ", objUserData);
    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */

    // Stampa dati avanzati
    const dataReferto = generaBtnAvanzato.getAttribute("data-referto-date");
    const idReferto = generaBtnAvanzato.getAttribute("data-referto-id");
    const bigData = document.getElementById("datiReferto");
    const height = bigData.getAttribute("data-altezza");
    const weight = bigData.getAttribute("data-peso-corporeo");
    const bmi = bigData.getAttribute("data-bmi");
    const grasso = bigData.getAttribute("data-grasso");
    const grasso_viscerale = bigData.getAttribute("data-grasso_viscerale");
    const acqua = bigData.getAttribute("data-acqua");
    const massa_muscolare = bigData.getAttribute("data-massa_muscolare");
    const massa_ossea = bigData.getAttribute("data-massa_ossea");
    const p_fisico = bigData.getAttribute("data-p_fisico");
    const bmr = bigData.getAttribute("data-bmr");
    const glicemia = bigData.getAttribute("data-glicemia");
    const ogtt1 = bigData.getAttribute("data-ogtt1");
    const ogtt2 = bigData.getAttribute("data-ogtt2");
    const emoglobina_g = bigData.getAttribute("data-emoglobina_g");
    const insulina_d = bigData.getAttribute("data-insulina_d");
    const curva_i = bigData.getAttribute("data-curva_i");
    const homa_ir = bigData.getAttribute("data-homa_ir");
    const tyg = bigData.getAttribute("data-tyg");
    const c_tot = bigData.getAttribute("data-c_tot");
    const hdl = bigData.getAttribute("data-hdl");
    const ldl = bigData.getAttribute("data-ldl");
    const trigliceridi = bigData.getAttribute("data-trigliceridi");
    const ast = bigData.getAttribute("data-ast");
    const alt = bigData.getAttribute("data-alt");
    const ggt = bigData.getAttribute("data-ggt");
    const bili_d = bigData.getAttribute("data-bili_d");
    const bili_in = bigData.getAttribute("data-bili_in");
    const pcr = bigData.getAttribute("data-pcr");
    const hgs = bigData.getAttribute("data-hgs");
    const sii = bigData.getAttribute("data-sii");
    const c_plasmatico = bigData.getAttribute("data-c_plasmatico");

    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */
    const objBigData = {
      idReferto: idReferto,
      dataReferto: dataReferto,
      height: height,
      weight: weight,
      glicemia: glicemia,
      ogtt1: ogtt1,
      ogtt2: ogtt2,
      bmi: bmi,
      grasso: grasso,
      grasso_viscerale: grasso_viscerale,
      acqua: acqua,
      massa_muscolare: massa_muscolare,
      massa_ossea: massa_ossea,
      p_fisico: p_fisico,
      bmr: bmr,
      emoglobina_g: emoglobina_g,
      insulina_d: insulina_d,
      curva_i: curva_i,
      homa_ir: homa_ir,
      tyg: tyg,
      c_tot: c_tot,
      hdl: hdl,
      ldl: ldl,
      trigliceridi: trigliceridi,
      ast: ast,
      alt: alt,
      ggt: ggt,
      bili_d: bili_d,
      bili_in: bili_in,
      pcr: pcr,
      hgs: hgs,
      sii: sii,
      c_plasmatico: c_plasmatico,
    };
    
    console.log("BIG-DATA: ", objBigData);

    /*  -----------------------------------------------------------------------------------------------
      DEBUG
    --------------------------------------------------------------------------------------------------- */
    
    
    // Stampa Informazioni Personali
    const personalInformationPages = pages[0];
    personalInformationPages.drawText(`${dataReferto}`, {
      x: 440,
      y: 720,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${idReferto}`, {
      x: 440,
      y: 706,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${surname}`, {
      x: 340,
      y: 692,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${name}`, {
      x: 455,
      y: 692,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${dob}`, {
      x: 340,
      y: 678,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${cf}`, {
      x: 295,
      y: 666,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${place_birth}`, {
      x: 280,
      y: 678,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${chronological_age}`, {
      x: 480,
      y: 678,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${height}`, {
      x: 300,
      y: 422,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${weight}`, {
      x: 310,
      y: 409,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${bmi}`, {
      x: 280,
      y: 250,
      size: 10,
      color: rgb(0, 0, 0),
    });


    // Stampa Grasso
    const grassoPages = pages[1];
    grassoPages.drawText(`${grasso}`, {
      x: 275,
      y: 635,
      size: 10,
      color: rgb(0, 0, 0),
    });
    grassoPages.drawText(`${acqua}`, {
      x: 290,
      y: 155,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa Massa Muscolare e Punteggio Fisico
    const massaPages = pages[2];
    massaPages.drawText(`${massa_muscolare}`, {
      x: 325,
      y: 507,
      size: 10,
      color: rgb(0, 0, 0),
    });
    massaPages.drawText(`${p_fisico}`, {
      x: 315,
      y: 415,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa massa ossea
    const massaOsseaPages = pages[3];
    massaOsseaPages.drawText(`${massa_ossea}`, {
      x: 225,
      y: 410,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa bmr e grasso viscerale
    const bmrGrassoPages = pages[4];
    bmrGrassoPages.drawText(`${bmr}`, {
      x: 380,
      y: 493,
      size: 10,
      color: rgb(0, 0, 0),
    });
    bmrGrassoPages.drawText(`${grasso_viscerale}`, {
      x: 275,
      y: 307,
      size: 10,
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const nameUpperCase = name.toUpperCase();
    const surnameUpperCase = surname.toUpperCase();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ETA-METABOLICA-BASE-${nameUpperCase}-${surnameUpperCase}.pdf`;
    link.click();
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
  }
}

// Listener per il bottone di generazione PDF avanzato
if (generaBtnAvanzato) {
  generaBtnAvanzato.addEventListener("click", function () {
    generatePDFAvanzato();
  });
}

// Listener per il bottone di generazione PDF base
if (generaBtnBase) {
  generaBtnBase.addEventListener("click", function () {
    generatePDFBase();
  });
}