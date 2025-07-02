async function generatePDFReport(data) {
  console.log("Inizio generazione PDF");

  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error("jsPDF non caricato correttamente");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const images = [
    "/static/includes/images/page1.jpg",
    "/static/includes/images/page2.jpg",
    "/static/includes/images/page3.jpg",
    "/static/includes/images/page4.jpg",
    "/static/includes/images/page5.jpg",
    "/static/includes/images/page6.jpg",
    "/static/includes/images/page7.jpg",
  ];

  function loadImage(imgSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
    });
  }

  async function createPDF() {
    for (let i = 0; i < images.length; i++) {
      try {
        const img = await loadImage(images[i]);
        let imgWidth = pageWidth;
        let imgHeight = (img.height / img.width) * imgWidth;

        if (imgHeight > pageHeight) {
          const scaleFactor = pageHeight / imgHeight;
          imgHeight *= scaleFactor;
          imgWidth *= scaleFactor;
        }

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);

        const addText = (text, x, y, fontSize = 12, color = [0, 0, 0]) => {
          if (text !== undefined && text !== null) {
            pdf.setFontSize(fontSize);
            pdf.setTextColor(...color);
            pdf.text(text.toString(), x, y);
          }
        };

        // Mappatura dei dati per ogni pagina
        if (i === 0) {
          addText(data.name, 110, 58);
          addText(data.surname, 120, 58);
          addText(data.dob, 110, 65);
          addText(data.chronological_age, 50, 71);
          addText(data.codice_fiscale, 110, 71);
          addText(data.place_of_birth, 90, 80);
          addText(data.gender, 90, 90);
        }
        if (i === 1) {
          addText(data.wbc, 90, 60);
          addText(data.baso, 90, 70);
          addText(data.eosi, 90, 80);
          addText(data.lymph, 90, 90);
          addText(data.mono, 90, 100);
          addText(data.neut, 90, 110);
        }
        if (i === 2) {
          addText(data.rbc, 90, 60);
          addText(data.hct, 90, 70);
          addText(data.hgb, 90, 80);
          addText(data.mch, 90, 90);
          addText(data.mchc, 90, 100);
          addText(data.mcv, 90, 110);
        }
        if (i === 3) {
          addText(data.glucose, 90, 60);
          addText(data.creatinine, 90, 70);
          addText(data.ferritin, 90, 80);
          addText(data.albumin, 90, 90);
          addText(data.protein, 90, 100);
          addText(data.bilirubin, 90, 110);
          addText(data.uric_acid, 90, 120);
        }
        if (i === 4) {
          addText(data.obri_index, 90, 60);
          addText(data.d_roms, 90, 70);
          addText(data.aa_epa, 90, 80);
          addText(data.aa_dha, 90, 90);
          addText(data.homa_test, 90, 100);
          addText(data.cardiovascular_risk, 90, 110);
          addText(data.osi, 90, 120);
          addText(data.pat, 90, 130);
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'immagine:", error);
      }
    }

    pdf.save("report_paziente.pdf");
    console.log("PDF generato con successo");
  }

  createPDF();
}

/*  -----------------------------------------------------------------------------------------------
  User Modal log out
--------------------------------------------------------------------------------------------------- */
const userImg = document.getElementById("userImg");
const userModal = document.getElementById("userModal");
const userModalBtn = document.getElementById("nav-bar-user-modal-btn");

function showModal() {
  userModal.classList.add("show");
}

userImg.addEventListener("mouseover", showModal);

userModal.addEventListener("mouseout", () => {
  userModal.classList.remove("show");
});

userModalBtn.addEventListener("mouseover", showModal);
