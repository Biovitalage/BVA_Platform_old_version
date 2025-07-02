const d_roms = document.getElementById('OSI').getAttribute('data-value');
const pat = document.getElementById('d-ROMs').getAttribute('data-value');
const osi = document.getElementById('PAT').getAttribute('data-value');

const generaBtn = document.getElementById('genereReportOS');

const { PDFDocument, rgb, StandardFonts } = PDFLib;

async function generatePDF() {

    try {
        const existingPdfBytes = await fetch('/static/includes/pdfTemplates/RefertoOSI.pdf').then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Stampa Informazioni Personali
        const personalInformationPages = pages[0]

        const name = document.getElementById('name').textContent;
        const surname = document.getElementById("surname").textContent;
        const dob = document.getElementById('dob').textContent;
        const cf = document.getElementById('codice_fiscale').textContent;
        const place_birth = document.getElementById('place_birth').textContent;
        const chronological_age = document.getElementById('chronological_age').textContent;
        const biological_age = document.getElementById('biological_age').textContent;
        
        personalInformationPages.drawText(`${name }`, { x: 380, y: 678, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${surname}`, { x: 455, y: 678, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${dob}`, { x: 360, y: 664, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${cf}`, { x: 295, y: 650, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${place_birth}`, { x: 300, y: 664, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${chronological_age}`, { x: 480, y: 664, size: 12, color: rgb(0,0,0) });
       
        // Stampa Osi Value
        const osiPageValue = pages[2];

        const d_roms = document.getElementById('d-ROMs')?.getAttribute('data-value') || "N/A";
        const pat = document.getElementById('PAT')?.getAttribute('data-value') || "N/A";
        const osi = document.getElementById('OSI')?.getAttribute('data-value') || "N/A";

      
        osiPageValue.drawText(`${d_roms}`, { x: 210, y: 570, size: 12, color: rgb(0, 0, 0) });
        osiPageValue.drawText(`${pat}`, { x: 210, y: 505, size: 12, color: rgb(0, 0, 0) });
        osiPageValue.drawText(`${osi}`, { x: 210, y: 450, size: 12, color: rgb(0, 0, 0) });


        // Salva Pdf e scarica
        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Referto_Modificato.pdf';
        link.click();

    } catch (error) {
        console.error("Errore durante la generazione del PDF:", error);
    }

}




generaBtn.addEventListener('click', generatePDF);