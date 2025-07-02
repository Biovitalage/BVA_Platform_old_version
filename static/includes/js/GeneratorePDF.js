/*  -----------------------------------------------------------------------------------------------
    Disclaimer PDF
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const pdfButtons = document.querySelectorAll(".generatePDFButton");
  const modal = document.getElementById("pdfDisclaimerModal");
  const closeBtn = document.getElementById("closeDisclaimerBtn");

  pdfButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      // Verifica se il pulsante cliccato è quello con id "genereReportOS"
      if (button.id === "genereReportOS") {
        // Blocca temporaneamente l'azione di generazione del PDF
        event.preventDefault();

        // Mostra il disclaimer modal
        modal.classList.remove("hidden");
      }
    });
  });

  closeBtn.addEventListener("click", () => {
    // Nascondi il disclaimer modal
    modal.classList.add("hidden");

    // Genera il PDF solo se è stato cliccato il pulsante corretto
    generatePDF();
  });
});

/*  -----------------------------------------------------------------------------------------------
    Generatore PDF
--------------------------------------------------------------------------------------------------- */
const d_roms = document.getElementById("OSI").getAttribute("data-value");
const pat = document.getElementById("d-ROMs").getAttribute("data-value");
const osi = document.getElementById("PAT").getAttribute("data-value");

const generaBtn = document.getElementById("genereReportOS");

const { PDFDocument, rgb, StandardFonts } = PDFLib;

async function generatePDF() {
  try {
    const existingPdfBytes = await fetch(
      "/static/includes/pdfTemplates/RefertoOSI.pdf"
    ).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    //const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Stampa Informazioni Personali
    const personalInformationPages = pages[0];

    const name = document.getElementById("name").textContent;
    const dataReferto = generaBtn.getAttribute("data-referto-date");
    const idReferto = generaBtn.getAttribute("data-referto-id");
    const surname = document.getElementById("surname").textContent;
    const dob = document.getElementById("dob").textContent;
    const cf = document.getElementById("codice_fiscale").textContent;
    const place_birth = document.getElementById("place_birth").textContent;
    const chronological_age = document.getElementById("chronological_age").textContent;

    personalInformationPages.drawText(`${dataReferto}`, {
      x: 470,
      y: 707,
      size: 10,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${idReferto}`, {
      x: 430,
      y: 693,
      size: 10,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${name}`, {
      x: 380,
      y: 678,
      size: 12,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${surname}`, {
      x: 455,
      y: 678,
      size: 12,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${dob}`, {
      x: 340,
      y: 664,
      size: 12,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${cf}`, {
      x: 295,
      y: 650,
      size: 12,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${place_birth}`, {
      x: 280,
      y: 664,
      size: 12,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${chronological_age}`, {
      x: 480,
      y: 664,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Stampa Osi Value
    const osiPageValue = pages[2];

    const d_roms =
      document.getElementById("d-ROMs")?.getAttribute("data-value") || "N/A";
    const pat =
      document.getElementById("PAT")?.getAttribute("data-value") || "N/A";
    const osi =
      document.getElementById("OSI")?.getAttribute("data-value") || "N/A";

    osiPageValue.drawText(`${d_roms}`, {
      x: 210,
      y: 570,
      size: 12,
      color: rgb(0, 0, 0),
    });
    osiPageValue.drawText(`${pat}`, {
      x: 210,
      y: 505,
      size: 12,
      color: rgb(0, 0, 0),
    });
    osiPageValue.drawText(`${osi}`, {
      x: 210,
      y: 450,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Salva Pdf e scarica
    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const nameUpperCase = name.toUpperCase();
    const surnameUpperCase = surname.toUpperCase();
    link.download = `${nameUpperCase}-${surnameUpperCase}-OXIDATIVE-S(${dataReferto}).pdf`;
    link.click();
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
  }
}

generaBtn.addEventListener("click", (event) => {
  // Blocca temporaneamente la generazione del PDF
  event.preventDefault();

  // Mostra il disclaimer modal
  modal.classList.remove("hidden");
});

/*  -----------------------------------------------------------------------------------------------
 GENERA PDF COMPLETO
--------------------------------------------------------------------------------------------------- */
const biologicalAge = document.getElementById("biological_age").getAttribute("data-value");
const chronologicalAge = document.getElementById("chronological_age").getAttribute("data-value");
const ageDifference = (parseFloat(biologicalAge) - parseFloat(chronologicalAge)).toFixed(2);

const generateBtn = document.getElementById("screenshotBtn");

async function generatePDFull() {
  try {
    // Mostra lo spinner
    document.getElementById("snipperStampa").style.display = "block";
    document.getElementById("spinnerBackdrop").style.display = "block";
    document.body.style.overflow = "hidden";

    const existingPdfBytes = await fetch(
      "/static/includes/pdfTemplates/RefertoEtaBiologica.pdf"
    ).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const personalInformationPages = pages[0];

    const name = document.getElementById("name").textContent;
    const surname = document.getElementById("surname").textContent;
    const dob = document.getElementById("dob").textContent;
    const cf = document.getElementById("codice_fiscale").textContent;
    const place_birth = document.getElementById("place_birth").textContent;
    const chronological_age =
      document.getElementById("chronological_age").textContent;
    const dataRefertoFull = generateBtn.getAttribute("data-referto-date");

    personalInformationPages.drawText(`${dataRefertoFull}`, {
      x: 470,
      y: 707,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${surname}`, {
      x: 350,
      y: 667,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${name}`, {
      x: 455,
      y: 667,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${dob}`, {
      x: 340,
      y: 653,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${cf}`, {
      x: 320,
      y: 638,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${place_birth}`, {
      x: 280,
      y: 653,
      size: 10,
      color: rgb(0, 0, 0),
    });
    personalInformationPages.drawText(`${chronological_age}`, {
      x: 480,
      y: 653,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Stampa valori età biologica
    const agePage = pages[0];
    agePage.drawText(`${ageDifference}`, {
      x: 310,
      y: 558,
      size: 10,
      color: rgb(0, 0, 0),
    });
    agePage.drawText(`${biologicalAge}`, {
      x: 310,
      y: 585,
      size: 10,
      color: rgb(0, 0, 0),
    });
    agePage.drawText(`${chronologicalAge}`, {
      x: 310,
      y: 572,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Salva PDF e scarica
    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const nameUpperCase = name.toUpperCase();
    const surnameUpperCase = surname.toUpperCase();
    link.download = `${nameUpperCase}-${surnameUpperCase}-BIOLOGICAL-AGE(${dataRefertoFull}).pdf`;
    link.click();
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
  } finally {
    // Nasconde lo spinner alla fine, indipendentemente dal successo o errore
    document.getElementById("snipperStampa").style.display = "none";
    document.getElementById("spinnerBackdrop").style.display = "none";
    document.body.style.overflow = "auto";
  }
}

generateBtn.addEventListener("click", (event) => {
  event.preventDefault();
  generatePDFull();
});










// BACK-UP BEFORE HTML2CANVAS LIBRARY METHOD

// window.onload = function () {
//   document
//     .getElementById("screenshotBtn")
//     .addEventListener("click", function () {
//       const cards = document.querySelectorAll(".stampa");
//       const { jsPDF } = window.jspdf;
//       const doc = new jsPDF();

//       document.getElementById("snipperStampa").style.display = "block";
//       document.getElementById("spinnerBackdrop").style.display = "block";
//       document.body.style.overflow = "hidden";

//       let yOffset = 10;

//       function captureCard(index) {
//         if (index >= cards.length) {
//           document.getElementById("snipperStampa").style.display = "none";
//           document.getElementById("spinnerBackdrop").style.display = "none";
//           document.body.style.overflow = "auto";
//           const dataReferto = generaBtn.getAttribute("data-referto-date");
//           doc.save(`FULL-REPORT(${dataReferto}).pdf`);
//           return;
//         }

//         html2canvas(cards[index])
//           .then(function (canvas) {
//             var img = canvas.toDataURL("image/png");
//             var pageWidth = doc.internal.pageSize.width;
//             var pageHeight = doc.internal.pageSize.height;

//             var imgWidth = pageWidth - 20;
//             var imgHeight = (canvas.height * imgWidth) / canvas.width;

//             if (yOffset + imgHeight > pageHeight) {
//               doc.addPage();
//               yOffset = 10;
//             }

//             doc.addImage(img, "PNG", 10, yOffset, imgWidth, imgHeight);

//             yOffset += imgHeight + 10;

//             captureCard(index + 1);
//           })
//           .catch(function (error) {
//             console.error("Errore nella creazione dello screenshot:", error);
//           });
//       }

//       captureCard(0);
//     });
// };
