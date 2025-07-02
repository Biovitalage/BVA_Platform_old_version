const generaBtn = document.getElementById('genereReport');

const { PDFDocument, rgb, StandardFonts } = PDFLib;

async function generatePDF() {

    try {
        const existingPdfBytes = await fetch('/static/includes/pdfTemplates/composizione.pdf').then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        
        // Stampa Informazioni Personali
        const personalInformationPages = pages[0]

        const name = document.getElementById('name').textContent;
        const surname = document.getElementById("surname").textContent;
        const dob = document.getElementById('dob').textContent;
        const cf = document.getElementById('codice_fiscale').textContent;
        const place_birth = document.getElementById('place_birth').textContent;
        const chronological_age = document.getElementById('chronological_age').textContent;

        const peso = document.getElementById('peso').textContent;
        const altezza = document.getElementById('altezza').textContent;
        
        personalInformationPages.drawText(`${name }`, { x: 380, y: 644, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${surname}`, { x: 455, y: 644, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${dob}`, { x: 340, y: 632, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${cf}`, { x: 295, y: 618, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${place_birth}`, { x: 280, y: 632, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${chronological_age}`, { x: 480, y: 632, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${altezza}`, { x: 314, y: 488, size: 12, color: rgb(0,0,0) });
        personalInformationPages.drawText(`${peso}`, { x: 314, y: 430, size: 12, color: rgb(0,0,0) });

  
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