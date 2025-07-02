/*  -----------------------------------------------------------------------------------------------
 GENERA PDF COMPLETO
--------------------------------------------------------------------------------------------------- */
const biologicalAge = document.getElementById("biological_age").getAttribute("data-value");
const chronologicalAge = document.getElementById("chronological_age").getAttribute("data-value");
const ageDifference = (parseFloat(biologicalAge) - parseFloat(chronologicalAge)).toFixed(2);

const generateBtn = document.getElementById("screenshotBtn");

const { PDFDocument, rgb } = PDFLib;

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

    const name = document.getElementById("name").value;
    
    const surname = document.getElementById("surname").value;
    const dob = document.getElementById("dob").value;
    const cf = document.getElementById("codice_fiscale").value;
    const place_birth = document.getElementById("place_birth").value;
    const chronological_age = document.getElementById("chronological_age").value;
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


