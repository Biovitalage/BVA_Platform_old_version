// FUNZIONE PER SCARICARE IL REFERTO DELLA CAPACITA' VITALE
const generaBtn = document.getElementById("pdfCapacitaVitale");

const { PDFDocument, rgb, StandardFonts } = PDFLib;

async function generatePDF() {
  try {
    const existingPdfBytes = await fetch(
      "/static/includes/pdfTemplates/RefertoCapacitaVitale.pdf"
    ).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();

    // PAGINA 1
    // Stampa Informazioni Personali
    const personalInformationPages = pages[0];

    // DATI PERSONALI
    const name = generaBtn.getAttribute("data-name");
    const surname = generaBtn.getAttribute("data-surname");
    const dob = generaBtn.getAttribute("data-dob");
    const cf = generaBtn.getAttribute("data-cf");
    const place_birth = generaBtn.getAttribute("data-place_birth");
    const chronological_age = generaBtn.getAttribute("data-chronological_age");

    const risultato_capacita = generaBtn.getAttribute("data-risultato_capacita");

  

  /*   personalInformationPages.drawText(`${dataReferto}`, {
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
    }); */

    personalInformationPages.drawText(`${name}`, {
      x: 380,
      y: 654,
      size: 12,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${surname}`, {
      x: 455,
      y: 654,
      size: 12,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${dob}`, {
      x: 340,
      y: 638,
      size: 12,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${cf}`, {
      x: 295,
      y: 622,
      size: 12,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${place_birth}`, {
      x: 280,
      y: 638,
      size: 12,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${chronological_age}`, {
      x: 480,
      y: 638,
      size: 12,
      color: rgb(0, 0, 0),
    });

    personalInformationPages.drawText(`${risultato_capacita}`, {
        x: 150,
        y: 530,
        size: 12,
        color: rgb(0, 0, 0),
    });


    // SECOND PAGE
    const secondPage = pages[1];
    const risultato_mmse = generaBtn.getAttribute("data-risultato_mmse");
 
    secondPage.drawText(`${risultato_mmse}`, {
        x: 200,
        y: 438,
        size: 12,
        color: rgb(0, 0, 0),
    });



    // THIRD PAGE
    const thirdPage = pages[2];
    const risultato_gds = generaBtn.getAttribute("data-risultato_gds");
    const risultato_loc = generaBtn.getAttribute("data-risultato_loc");

    thirdPage.drawText(`${risultato_gds}`, {
        x: 200,
        y: 684,
        size: 12,
        color: rgb(0, 0, 0),
    });

    thirdPage.drawText(`${risultato_loc}`, {
        x: 200,
        y: 253,
        size: 12,
        color: rgb(0, 0, 0),
    });


    // FOURTH PAGE
    const fourthPage = pages[3];
    const risultato_vista = generaBtn.getAttribute("data-risultato_vista");
    const risultato_udito = generaBtn.getAttribute("data-risultato_udito");

    fourthPage.drawText(`${risultato_vista}`, {
        x: 200,
        y: 596,
        size: 12,
        color: rgb(0, 0, 0),
    });

    fourthPage.drawText(`${risultato_udito}`, {
        x: 200,
        y: 237,
        size: 12,
        color: rgb(0, 0, 0),
    });


    // FIFTY PAGE
    const fiftyPage = pages[4];
    const risultato_hgs = generaBtn.getAttribute("data-risultato_hgs");

    fiftyPage.drawText(`${risultato_hgs}`, {
        x: 200,
        y: 315,
        size: 12,
        color: rgb(0, 0, 0),
    });


    // SIX PAGE
    const sixPage = pages[5];
    const risultato_pft = generaBtn.getAttribute("data-risultato_pft");
    const risultato_isq = generaBtn.getAttribute("data-risultato_isq");

    sixPage.drawText(`${risultato_pft}`, {
        x: 200,
        y: 730,
        size: 12,
        color: rgb(0, 0, 0),
    });

    sixPage.drawText(`${risultato_isq}`, {
        x: 200,
        y: 300,
        size: 12,
        color: rgb(0, 0, 0),
    });



    // SEVEN PAGE
    const sevenPage = pages[6];
    const risultato_bmi = generaBtn.getAttribute("data-risultato_bmi");
    const risultato_cdp = generaBtn.getAttribute("data-risultato_cdp");

    sevenPage.drawText(`${risultato_bmi}`, {
        x: 200,
        y: 718,
        size: 12,
        color: rgb(0, 0, 0),
    });

    sevenPage.drawText(`${risultato_cdp}`, {
        x: 200,
        y: 122,
        size: 12,
        color: rgb(0, 0, 0),
    });


     // EIGHT PAGE
    const eightPage = pages[7];
    const risultato_whr = generaBtn.getAttribute("data-risultato_whr");
   
    eightPage.drawText(`${risultato_whr}`, {
         x: 200,
         y: 176,
         size: 12,
         color: rgb(0, 0, 0),
    });
 

    // TEN PAGE
    const tenPage = pages[9];
    const risultato_whr_ratio = generaBtn.getAttribute("data-risultato_whr_ratio");
    const risultato_cst = generaBtn.getAttribute("data-risultato_cst");
    const risultato_gs = generaBtn.getAttribute("data-risultato_gs");
    
    tenPage.drawText(`${risultato_whr_ratio}`, {
          x: 200,
          y: 778,
          size: 12,
          color: rgb(0, 0, 0),
    });

    tenPage.drawText(`${risultato_cst}`, {
        x: 200,
        y: 410,
        size: 12,
        color: rgb(0, 0, 0),
    });

    tenPage.drawText(`${risultato_gs}`, {
        x: 200,
        y: 168,
        size: 12,
        color: rgb(0, 0, 0),
    });


    // ELEVEN PAGE
    const elevenPage = pages[10];
    const risultato_ppt = generaBtn.getAttribute("data-risultato_ppt");
    const risultato_sarc_f = generaBtn.getAttribute("data-risultato_sarc_f");
    
    elevenPage.drawText(`${risultato_ppt}`, {
          x: 200,
          y: 570,
          size: 12,
          color: rgb(0, 0, 0),
    });

    elevenPage.drawText(`${risultato_sarc_f}`, {
        x: 200,
        y: 123,
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
    link.download = `${nameUpperCase}-${surnameUpperCase}-CapacitaVitale.pdf`;
    link.click();
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
  }
}

generaBtn.addEventListener("click", generatePDF);