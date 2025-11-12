

import showAlert from "./components/showAlert.js";

/*----------------------------------------------------
  Gestione dinamica delle modali per gli indici
-----------------------------------------------------*/

const cards    = document.querySelectorAll('.cardIndici');
const backdrop = document.getElementById('backdropIndici');

// Utility per bloccare lo scroll del body quando apro una modale
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockBodyScroll() {
  const sbWidth = getScrollbarWidth();
  document.documentElement.style.setProperty('--scrollbar-width', `${sbWidth}px`);
  document.body.classList.add('body--no-scroll');
}

function unlockBodyScroll() {
  document.body.classList.remove('body--no-scroll');
  document.documentElement.style.removeProperty('--scrollbar-width');
}

// Apertura dinamica di ogni modale in base a dict-value
cards.forEach(card => {
  card.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const titleText = card.getAttribute('card-name');   
    const imgPath   = card.getAttribute('img-card');   
    const modalId   = card.getAttribute('dict-value');  
    const modal     = document.getElementById(modalId);

    if (!modal) {
      console.error(`Modale con id="${modalId}" non trovata.`);
      return;
    }

    // Titolo e immagine dentro la modale giusta
    const dynamicTitleElem = modal.querySelector('#dynamicTitle');
    const dynamicImageElem = modal.querySelector('#dynamicImage');
    const closeBtn         = modal.querySelector('#closeModale');

    if (dynamicTitleElem) dynamicTitleElem.textContent = titleText;
    if (dynamicImageElem) dynamicImageElem.src         = imgPath;

    // Mostro modale e backdrop
    modal.style.display    = 'block';
    backdrop.style.display = 'block';
    lockBodyScroll();

    // Chiusura con il bottone “×”
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display    = 'none';
        backdrop.style.display = 'none';
        unlockBodyScroll();
      };
    }
  });
});

// Cliccando sul backdrop chiudo tutte le modali aperte
backdrop.addEventListener('click', () => {
  document.querySelectorAll('.modale-indici').forEach(m => {
    m.style.display = 'none';
  });
  backdrop.style.display = 'none';
  unlockBodyScroll();
});

// Chiusura con Esc (solo se il backdrop è visibile)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && backdrop.style.display === 'block') {
    document.querySelectorAll('.modale-indici').forEach(m => {
      m.style.display = 'none';
    });
    backdrop.style.display = 'none';
    unlockBodyScroll();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openPrescrizioniBtn");
  const closeBtn = document.querySelector("#ModaleInserimento .close");
  const backdrop = document.getElementById("backdropModale");
  const modal = document.getElementById("ModaleInserimento");

  function openModal() {
    backdrop.style.display = "block";
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    gsap.fromTo(
      modal,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }

  function closeModal() {
    gsap.to(modal, {
      opacity: 0,
      y: -50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        modal.style.display = "none";
        backdrop.style.display = "none";
        document.body.style.overflow = "auto";
      },
    });
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
});






/*  -----------------------------------------------------------------------------------------------
  Funzione modale note
  --------------------------------------------------------------------------------------------------- */
const modaleNote = document.getElementById('modale_note');
const buttonModaleNote = document.getElementById('modale-note');
const buttonCloseModaleNote = document.getElementById('close-note-btn')
const backdropModaleNote = document.getElementById('backdropModaleNote')

buttonModaleNote.addEventListener('click', ()=>{
  modaleNote.style.display = 'block';
  backdropModaleNote.style.display = 'block';
})

buttonCloseModaleNote.addEventListener('click', ()=>{
  modaleNote.style.display = 'none';
  backdropModaleNote.style.display = 'none';
})









/*  -----------------------------------------------------------------------------------------------
  Funzione modale per la gestione dei farmaci
  --------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async function () {
  // ================== HELPER PDF ==================
  async function loadLogoBytes() {
    try {
      const res = await fetch(`${window.location.origin}/static/includes/pdfTemplates/logo.png`, { cache: "no-store" });
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}
    return null;
  }
  function wrapText(text, font, size, maxWidth) {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  function formatToday() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return { dd, mm, yyyy, label: `${dd}/${mm}/${yyyy}` };
  }

  // Prescrizione libera
  async function createPrescrizioneLiberaPDF(testo) {
    const { PDFDocument, StandardFonts, rgb } = (window.PDFLib || {});
    if (!PDFDocument) {
      alert("Libreria PDF non disponibile. Verifica il caricamento di pdf-lib.");
      return;
    }
    const pdf  = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const black = rgb(0, 0, 0);
    const grey  = rgb(0.75, 0.75, 0.75);

    // Logo
    try {
      const bytes = await loadLogoBytes();
      if (bytes) {
        const png  = await pdf.embedPng(bytes);
        const w = 220, h = png.height * (w / png.width);
        page.drawImage(png, { x: (width - w) / 2, y: height - 130, width: w, height: h });
      }
    } catch {}

    // Helper per testo centrato
    const center = (txt, y, f = font, s = 12, c = black) => {
      const tw = f.widthOfTextAtSize(txt, s);
      page.drawText(txt, { x: (width - tw) / 2, y, size: s, font: f, color: c });
    };

    // Dati intestazione
    let y = height - 165;
    const lh = 16;
    const { dd, mm, yyyy, label } = formatToday();

    center(`Paziente: ${window.PAZIENTE || ""}`, y); y -= lh;
    center(`Codice Fiscale Paziente: ${window.CF_PAZIENTE || ""}`, y); y -= lh;
    center(`Data di Nascita Paziente: ${window.DOB_PAZIENTE || ""}`, y); y -= lh;
    center(`Data: ${label}`, y); y -= 40;

    // Box contenuto
    const margin = 40;
    const boxH = 360;
    const boxY = y - boxH;
    const boxW = width - margin * 2;

    page.drawRectangle({
      x: margin, y: boxY, width: boxW, height: boxH,
      borderColor: grey, borderWidth: 1
    });

    const tx = margin + 12;
    let ty = y - 18;
    const maxW = boxW - 24;

    page.drawText("Prescrizione", { x: tx, y: ty, size: 12, font: bold, color: black });
    ty -= lh;

    for (const line of wrapText(testo, font, 12, maxW)) {
      if (ty < boxY + 18) break;
      page.drawText(line, { x: tx, y: ty, size: 12, font });
      ty -= lh;
    }

    // Firma
    page.drawText(`Firma: dott. ${window.DOTTORE || ""}`, { x: width - 240, y: 120, size: 12, font: bold });

    // Download
    const bytes = await pdf.save();
    const blob  = new Blob([bytes], { type: "application/pdf" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href = url;
    a.download = `Prescrizione_${(window.PAZIENTE || "paziente").replace(/\s+/g, "_")}_${yyyy}-${mm}-${dd}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Farmaco
  async function createFarmacoPDF(nomeFarmaco, posologia) {
    const { PDFDocument, StandardFonts, rgb } = (window.PDFLib || {});
    if (!PDFDocument) {
      alert("Libreria PDF non disponibile. Verifica il caricamento di pdf-lib.");
      return;
    }
    const pdf  = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const black = rgb(0, 0, 0);
    const grey  = rgb(0.75, 0.75, 0.75);

    try {
      const bytes = await loadLogoBytes();
      if (bytes) {
        const png  = await pdf.embedPng(bytes);
        const w = 220, h = png.height * (w / png.width);
        page.drawImage(png, { x: (width - w) / 2, y: height - 130, width: w, height: h });
      }
    } catch {}

    const center = (txt, y, f = font, s = 12, c = black) => {
      const tw = f.widthOfTextAtSize(txt, s);
      page.drawText(txt, { x: (width - tw) / 2, y, size: s, font: f, color: c });
    };

    let y = height - 165;
    const lh = 16;
    const { dd, mm, yyyy, label } = formatToday();

    center(`Paziente: ${window.PAZIENTE || ""}`, y); y -= lh;
    center(`Codice Fiscale Paziente: ${window.CF_PAZIENTE || ""}`, y); y -= lh;
    center(`Data di Nascita Paziente: ${window.DOB_PAZIENTE || ""}`, y); y -= lh;
    center(`Data: ${label}`, y); y -= 36;

    // Box
    const margin = 40;
    const boxH = 180;
    const boxY = y - boxH;
    const boxW = width - margin * 2;

    page.drawRectangle({
      x: margin, y: boxY, width: boxW, height: boxH,
      borderColor: grey, borderWidth: 1
    });

    const tx = margin + 12;
    let ty = y - 22;

    page.drawText(`Nome Farmaco: ${nomeFarmaco || "-"}`, { x: tx, y: ty, size: 12, font: bold }); ty -= lh;
    // Wrappa posologia se lunga
    for (const line of wrapText(`Posologia: ${posologia || "-"}`, font, 12, boxW - 24)) {
      page.drawText(line, { x: tx, y: ty, size: 12, font });
      ty -= lh;
      if (ty < boxY + 18) break;
    }

    page.drawText(`Firma: dott. ${window.DOTTORE || ""}`, { x: width - 240, y: 120, size: 12, font: bold });

    const bytes = await pdf.save();
    const blob  = new Blob([bytes], { type: "application/pdf" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href = url;
    a.download = `Farmaco_${(window.PAZIENTE || "paziente").replace(/\s+/g, "_")}_${yyyy}-${mm}-${dd}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
  // ================== /HELPER PDF ==================

  // --- Carica farmaci JSON ---
  let farmaciJSON = [];
  try {
    const response = await fetch("/static/includes/json/ArchivioFarmaci.json");
    const data = await response.json();
    if (data && Array.isArray(data.Foglio1)) farmaciJSON = data.Foglio1;
    else console.warn("Formato JSON inatteso:", data);
  } catch (error) {
    console.error("Errore nel caricamento del file ArchivioFarmaci.json:", error);
  }

  // --- MODALE DINAMICA (come tua versione) ---
  const modal = document.getElementById("dynamicModal");
  const modalBackdrop = document.getElementById("dynamicModalBackdrop");
  const modalTitle = document.getElementById("dynamicModalTitle");
  const modalBody = document.getElementById("dynamicModalBody");
  const closeBtn = document.getElementById("closeDynamicModal");

  function openDynamicModal({ title, content, onSave }) {
    modalTitle.textContent = title;
    modalBody.innerHTML = "";
    if (typeof content === "string") modalBody.innerHTML = content;
    else if (content instanceof HTMLElement) modalBody.appendChild(content);
    modal.style.display = "flex";
    modalBackdrop.style.display = "block";
    document.body.style.overflow = "hidden";
    modalBody._onSave = onSave;
  }
  function closeDynamicModal() {
    modal.style.display = "none";
    modalBackdrop.style.display = "none";
    document.body.style.overflow = "auto";
    modalBody.innerHTML = "";
    modalBody._onSave = null;
  }
  if (closeBtn) closeBtn.onclick = closeDynamicModal;
  if (modalBackdrop) modalBackdrop.onclick = closeDynamicModal;

  // --- LISTENER RIGHE ---
  document.querySelectorAll(".row-table").forEach((row) => {
    row.addEventListener("click", function (e) {
      if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;

      const type = row.dataset.type;
      if (!type) return;

      // ======== PRESCRIZIONE LIBERA ========
      if (type === "prescrizionelibera") {
        const testo = row.dataset.descrizione || row.dataset.testo || "";

        const textarea = document.createElement("textarea");
        textarea.value = testo;
        textarea.placeholder = "Modifica prescrizione libera...";
        textarea.style.marginTop = "1rem";
        textarea.readOnly = true;
        textarea.style.background = "#f8f9fa";
        textarea.style.cursor = "not-allowed";

        const abilitaBtn = document.createElement("button");
        abilitaBtn.textContent = "Abilita Modifica";
        abilitaBtn.className = "button";
        abilitaBtn.style.marginTop = "1rem";
        abilitaBtn.onclick = function () {
          textarea.readOnly = false;
          textarea.style.background = "white";
          textarea.style.cursor = "text";
          abilitaBtn.style.display = "none";
          saveBtn.style.display = "inline-block";
          annullaBtn.style.display = "inline-block";
          textarea.focus();
        };

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Salva";
        saveBtn.className = "button";
        saveBtn.style.marginTop = "1rem";
        saveBtn.style.display = "none";
        saveBtn.onclick = function () {
          fetch(`/CartellaPaziente/${window.PAZIENTE_ID}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
              type: "prescrizione_libera",
              id: row.dataset.id,
              testo: textarea.value,
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.success) {
                row.dataset.descrizione = textarea.value;
                row.querySelector(".row-cella:nth-child(3) p").textContent = textarea.value;
                closeDynamicModal();
              } else {
                alert("Errore durante il salvataggio: " + (data.error || "Errore sconosciuto"));
              }
            })
            .catch(() => alert("Errore di rete nel salvataggio."));
        };

        const annullaBtn = document.createElement("button");
        annullaBtn.textContent = "Annulla";
        annullaBtn.className = "button";
        annullaBtn.style.marginTop = "1rem";
        annullaBtn.style.display = "none";
        annullaBtn.onclick = function () {
          textarea.value = testo;
          textarea.readOnly = true;
          textarea.style.background = "#f8f9fa";
          textarea.style.cursor = "not-allowed";
          abilitaBtn.style.display = "inline-block";
          saveBtn.style.display = "none";
          annullaBtn.style.display = "none";
        };

        // >>> QUI: PDF lib (niente print)
        const pdfBtn = document.createElement("button");
        pdfBtn.textContent = "Scarica PDF";
        pdfBtn.className = "button";
        pdfBtn.style.marginTop = "1rem";
        pdfBtn.style.background = "#dc3545";
        pdfBtn.style.color = "white";
        pdfBtn.onclick = function () {
          const testoPdf = textarea.value.trim();
          if (!testoPdf) { alert("Nessun contenuto da scaricare."); return; }
          createPrescrizioneLiberaPDF(testoPdf);
        };

        const btnsDiv = document.createElement("div");
        btnsDiv.style.display = "flex";
        btnsDiv.style.gap = "10px";
        btnsDiv.appendChild(abilitaBtn);
        btnsDiv.appendChild(saveBtn);
        btnsDiv.appendChild(annullaBtn);
        btnsDiv.appendChild(pdfBtn);

        const container = document.createElement("div");
        container.appendChild(textarea);
        container.appendChild(btnsDiv);

        openDynamicModal({ title: "Prescrizione Libera", content: container });
      }

      // ======== FARMACO ========
      else if (type === "farmaco") {
        const nome = row.dataset.nome || "";
        const posologia = row.dataset.posologia || "";

        const nomeInput = document.createElement("input");
        nomeInput.value = nome;
        nomeInput.readOnly = true;
        nomeInput.style.width = "100%";
        nomeInput.style.marginBottom = "0.5rem";
        nomeInput.style.background = "#f8f9fa";
        nomeInput.style.cursor = "not-allowed";

        const posologiaInput = document.createElement("textarea");
        posologiaInput.value = posologia;
        posologiaInput.readOnly = true;
        posologiaInput.style.width = "100%";
        posologiaInput.style.background = "#f8f9fa";
        posologiaInput.style.cursor = "not-allowed";
        posologiaInput.style.minHeight = "60px";

        const select = document.createElement("select");
        select.style.display = "none";
        select.style.marginTop = "0.5rem";
        if (Array.isArray(farmaciJSON) && farmaciJSON.length > 0) {
          select.innerHTML =
            '<option value="">-- Scegli farmaco --</option>' +
            farmaciJSON.map((f, i) => `<option value="${i}">${f.NOME_FARMACO}</option>`).join("");
        } else {
          select.innerHTML = '<option value="">Nessun farmaco disponibile</option>';
        }

        const abilitaBtn = document.createElement("button");
        abilitaBtn.textContent = "Abilita Modifica";
        abilitaBtn.className = "button";
        abilitaBtn.style.marginTop = "1rem";
        abilitaBtn.onclick = function () {
          select.style.display = "inline-block";
          abilitaBtn.style.display = "none";
          saveBtn.style.display = "inline-block";
          annullaBtn.style.display = "inline-block";
        };

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Salva";
        saveBtn.className = "button";
        saveBtn.style.marginTop = "1rem";
        saveBtn.style.display = "none";
        saveBtn.onclick = function () {
          const idx = select.value;
          if (idx === "" || !farmaciJSON[idx]) return;
          const f = farmaciJSON[idx];
          fetch(`/CartellaPaziente/${window.PAZIENTE_ID}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
              type: "farmaco",
              id: row.dataset.id,
              nome_farmaco: f.NOME_FARMACO,
              dosaggio: f.DOSAGGIO,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                nomeInput.value = f.NOME_FARMACO;
                posologiaInput.value = f.DOSAGGIO;
                row.dataset.nome = f.NOME_FARMACO;
                row.dataset.posologia = f.DOSAGGIO;
                row.querySelector(".row-cella:nth-child(2) p").textContent = f.NOME_FARMACO;
                row.querySelector(".row-cella:nth-child(3) p").textContent = f.DOSAGGIO;
                closeDynamicModal();
              } else {
                alert("Errore durante il salvataggio: " + (data.error || "Errore sconosciuto"));
              }
            })
            .catch(() => {
              alert("Errore durante il salvataggio. Riprova più tardi.");
            });
        };

        const annullaBtn = document.createElement("button");
        annullaBtn.textContent = "Annulla";
        annullaBtn.className = "button";
        annullaBtn.style.marginTop = "1rem";
        annullaBtn.style.display = "none";
        annullaBtn.onclick = function () {
          select.style.display = "none";
          abilitaBtn.style.display = "inline-block";
          saveBtn.style.display = "none";
          annullaBtn.style.display = "none";
        };

        // >>> QUI: PDF lib per Farmaco
        const pdfBtn = document.createElement("button");
        pdfBtn.textContent = "Scarica PDF";
        pdfBtn.className = "button";
        pdfBtn.style.marginTop = "1rem";
        pdfBtn.style.background = "#dc3545";
        pdfBtn.style.color = "white";
        pdfBtn.onclick = function () {
          const nomeFarmaco = nomeInput.value.trim();
          const posologiaFarmaco = posologiaInput.value.trim();
          if (!nomeFarmaco && !posologiaFarmaco) {
            alert("Nessun dato da scaricare.");
            return;
          }
          createFarmacoPDF(nomeFarmaco, posologiaFarmaco);
        };

        select.onchange = function () {
          const idx = select.value;
          if (idx === "" || !farmaciJSON[idx]) return;
          const f = farmaciJSON[idx];
          nomeInput.value = f.NOME_FARMACO;
          posologiaInput.value = f.DOSAGGIO;
        };

        const btnsDiv = document.createElement("div");
        btnsDiv.style.display = "flex";
        btnsDiv.style.gap = "10px";
        btnsDiv.appendChild(abilitaBtn);
        btnsDiv.appendChild(saveBtn);
        btnsDiv.appendChild(annullaBtn);
        btnsDiv.appendChild(pdfBtn);

        const container = document.createElement("div");
        container.appendChild(nomeInput);
        container.appendChild(posologiaInput);
        container.appendChild(select);
        container.appendChild(btnsDiv);

        openDynamicModal({ title: "Farmaco Prescritto", content: container });
      }

      // ======== ALTRI TIPI (come tua versione) ========
      else if (type === "diario" || type === "accertamento" || type === "visita") {
        const data = row.dataset.data || "";
        const tipo = row.dataset.diariotipo || "";
        const descrizione = row.dataset.descrizione || "";
        const diagnosi = row.dataset.diagnosi || "";
        const nota = row.dataset.nota || "";
        const html = `<div><b>Data:</b> ${data}<br><b>Tipo:</b> ${tipo}<br><b>Descrizione:</b> ${descrizione}<br><b>Diagnosi:</b> ${diagnosi}<br><b>Nota:</b> ${nota}</div>`;
        openDynamicModal({ title: "Dettaglio Diario Clinico", content: html });
      }
    });
  });
});



















































/*  -----------------------------------------------------------------------------------------------
  Funzione fetch ICD11
  --------------------------------------------------------------------------------------------------- */
const access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE3NTM4NjI2NDgsImV4cCI6MTc1Mzg2NjI0OCwiaXNzIjoiaHR0cHM6Ly9pY2RhY2Nlc3NtYW5hZ2VtZW50Lndoby5pbnQiLCJhdWQiOlsiaHR0cHM6Ly9pY2RhY2Nlc3NtYW5hZ2VtZW50Lndoby5pbnQvcmVzb3VyY2VzIiwiaWNkYXBpIl0sImNsaWVudF9pZCI6ImNjZGQwY2UzLWFiNDEtNDUzNC1hNWUzLTk4MTkwYzk5M2ExYl84YmEzNTcxMS05NDU5LTQ2NGQtYThmYS02OTVmNmM0ZGFiOWQiLCJzY29wZSI6WyJpY2RhcGlfYWNjZXNzIl19.xfwNhFWvAemWEkp_vzBM2zNnHVDc4_vMKz9EqO7cO4m5o8duR-P2pnfnlCGWrv85K8pWPbs6MymqmItri5HcZF2O1jdIWc3bwX4x5l5dDlaDhxsBjNZ4yeAF5j8vxIf0oDPullyP1MlQQ3ldMa_BKGPz1tk7b2Mjm1hWkr4yr7RjCg1XJbGy1YkKqtX4TghjVsvDfgMklCDDeNgPUc4AhOx5H4GS27tVVltDzvVGud3gPTdZA1rUFHt56X67wEVpToV0S-erHIxdRnPFJL7g-0flcpTLIXubP0yyNPVzsBiSzgaJ_i8bgdrJIwVBoIqOGTJhxezw8wcj4XklQLb00w";

async function searchICD11(query) {
  const url = `https://id.who.int/icd/entity/search?q=${encodeURIComponent(query)}&linearization=icd11-mms&releaseId=2024-01`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Accept-Language": "en",
      "API-Version": "v2"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore ICD-11: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// Esempio di utilizzo:
searchICD11("diabete")
  .then(data => {
    console.log("Risultati ICD-11:", data);
    // Qui puoi ciclare sui risultati e mostrarli come vuoi
  })
  .catch(err => {
    console.error(err);
  });














/*  -----------------------------------------------------------------------------------------------
  Funzione modale problemi e diagnosi (spostata dal template)
  --------------------------------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  const modaleProblemi = document.getElementById('modale_problemi');
  const buttonModaleProblemi = document.getElementById('modale-problemi');
  const buttonCloseModaleProblemi = document.getElementById('close-problemi');
  const buttonCloseXProblemi = document.getElementById('close-problemi-x');
  const backdropModaleProblemi = document.getElementById('backdropModaleProblemi');
  const textAreaProblemi = document.getElementById('text_area_problemi');
  const diagnosiSelect = document.getElementById('diagnosi_select');
  const problemiStep = document.getElementById('problemi_step');
  const nuovaDiagnosiForm = document.getElementById('nuova_diagnosi_form');
  const icd10Select = document.getElementById('icd10_select');

  // Apertura modale
  if (buttonModaleProblemi) {
    buttonModaleProblemi.addEventListener('click', function() {
      modaleProblemi.style.display = 'block';
      backdropModaleProblemi.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
  }
  // Chiusura modale (bottone "Chiudi" e X)
  function closeProblemiModal() {
    modaleProblemi.style.display = 'none';
    backdropModaleProblemi.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  if (buttonCloseModaleProblemi) {
    buttonCloseModaleProblemi.addEventListener('click', closeProblemiModal);
  }
  if (buttonCloseXProblemi) {
    buttonCloseXProblemi.addEventListener('click', closeProblemiModal);
  }
  if (backdropModaleProblemi) {
    backdropModaleProblemi.addEventListener('click', closeProblemiModal);
  }

  // Step diagnosi/problemi: mostra/nascondi form nuova diagnosi e step problemi
  if (diagnosiSelect) {
    diagnosiSelect.addEventListener('change', function() {
      if (this.value === "__new__") {
        if (nuovaDiagnosiForm) nuovaDiagnosiForm.style.display = '';
        if (problemiStep) problemiStep.style.display = '';
      } else if (this.value) {
        if (nuovaDiagnosiForm) nuovaDiagnosiForm.style.display = 'none';
        if (problemiStep) problemiStep.style.display = '';
      } else {
        if (nuovaDiagnosiForm) nuovaDiagnosiForm.style.display = 'none';
        if (problemiStep) problemiStep.style.display = 'none';
      }
    });
  }

  // Autocompletamento textarea problemi da select ICD10
  if (icd10Select && textAreaProblemi) {
    icd10Select.addEventListener('change', function() {
      var selected = this.options[this.selectedIndex];
      if (selected && selected.value) {
        textAreaProblemi.value = selected.value + " - " + selected.text.replace(selected.value + " - ", "");
      }
    });
  }

  // Click su problemi ICD10 (lista-problemi) per autocompilare la textarea
  const listaProblemiContainer = document.querySelector('.lista-problemi');
  if (listaProblemiContainer && textAreaProblemi) {
    listaProblemiContainer.addEventListener('click', function(e) {
      if (e.target && e.target.tagName === 'P') {
        if (textAreaProblemi.hasAttribute('disabled')) {
          textAreaProblemi.removeAttribute('disabled');
        }
        textAreaProblemi.value = e.target.textContent;
      }
    });
  }
});

// Gestione submit AJAX per la modale problemi/diagnosi
// (chiude la modale e aggiorna la tabella senza redirect)
document.addEventListener('DOMContentLoaded', function() {
  const formProblemi = document.querySelector('#modale_problemi form');
  const modaleProblemi = document.getElementById('modale_problemi');
  const backdropModaleProblemi = document.getElementById('backdropModaleProblemi');
  const problemiTableContainer = document.querySelector('.container-content-second');
  const saveBtn = document.getElementById('save-problemi');

  if (formProblemi) {
    formProblemi.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(formProblemi);
      const url = formProblemi.getAttribute('action');
      const csrfToken = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';
      saveBtn.disabled = true;
      fetch(url, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken
        },
        body: formData
      })
      .then(response => response.text())
      .then(html => {
        // Aggiorna la tabella problemi (container-content-second)
        if (problemiTableContainer) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const nuovaTabella = doc.querySelector('.container-content-second');
          if (nuovaTabella) {
            problemiTableContainer.innerHTML = nuovaTabella.innerHTML;
          }
        }
        // Chiudi la modale
        modaleProblemi.style.display = 'none';
        backdropModaleProblemi.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Mostra messaggio di successo
        showAlert && showAlert({
          type: 'success',
          message: 'Diagnosi/problema salvato con successo!',
          borderColor: '#10b981',
        });
      })
      .catch(() => {
        showAlert && showAlert({
          type: 'error',
          message: 'Errore nel salvataggio del problema/diagnosi.',
          borderColor: '#ef4444',
        });
      })
      .finally(() => {
        saveBtn.disabled = false;
      });
    });
  }
});




/*  -----------------------------------------------------------------------------------------------
  Funzione di paginazione con controllo di tabelle con la stessa classe
  --------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const tables = document.querySelectorAll(".table-content");

  tables.forEach((table) => {
    const rows = table.querySelectorAll(".riga-container");
    const rowsPerPage = 5;
    let currentPage = 1;
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    function showPage(page, filteredRows = rows) {
      rows.forEach((row) =>
        gsap.to(row, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          onComplete: () => (row.style.display = "none"),
        })
      );

      filteredRows.forEach((row, index) => {
        if (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) {
          gsap.to(row, {
            opacity: 1,
            height: "5rem",
            duration: 0.3,
            display: "flex",
            onStart: () => (row.style.display = "flex"),
          });
        }
      });
    }

    function updatePaginationControls() {
      let existingControls = table.querySelector(".pagination-controls");

      if (existingControls) existingControls.remove();

      if (rows.length > rowsPerPage) {
        const controls = document.createElement("div");
        controls.classList.add("pagination-controls");

        const range = 10;
        let startPage = Math.max(1, currentPage - Math.floor(range / 2));
        let endPage = Math.min(totalPages, startPage + range - 1);

        if (endPage - startPage < range - 1) {
          startPage = Math.max(1, endPage - range + 1);
        }

        if (startPage > 1) {
          const firstPageBtn = document.createElement("button");
          firstPageBtn.classList.add("button-style-pagination");
          firstPageBtn.textContent = "1";
          firstPageBtn.addEventListener("click", () => {
            currentPage = 1;
            showPage(currentPage);
            updatePaginationControls();
          });
          controls.appendChild(firstPageBtn);

          // Aggiungi i dots
          const dots = document.createElement("span");
          dots.textContent = "...";
          controls.appendChild(dots);
        }

        for (let i = startPage; i <= endPage; i++) {
          const btn = document.createElement("button");
          btn.classList.add("button-style-pagination");
          btn.textContent = i;
          if (i === currentPage) {
            btn.classList.add("active");
          }
          btn.addEventListener("click", () => {
            currentPage = i;
            showPage(currentPage);
            updatePaginationControls();
          });
          controls.appendChild(btn);
        }

        if (endPage < totalPages) {
          const dots = document.createElement("span");
          dots.textContent = "...";
          controls.appendChild(dots);

          const lastPageBtn = document.createElement("button");
          lastPageBtn.classList.add("button-style-pagination");
          lastPageBtn.textContent = totalPages;
          lastPageBtn.addEventListener("click", () => {
            currentPage = totalPages;
            showPage(currentPage);
            updatePaginationControls();
          });
          controls.appendChild(lastPageBtn);
        }

        tables.appendChild(controls);
      }
    }

    showPage(currentPage);
    updatePaginationControls();
  });
});

/*  -----------------------------------------------------------------------------------------------
  Funzione di formattazione del telefono
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  function formatItalianPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, ""); // Rimuove caratteri non numerici

    if (digits.length < 10) {
      return phoneNumber; // Restituisce il numero originale se non è valido
    }

    // Se il numero inizia con 39 (senza il "+"), assume che abbia già il prefisso internazionale
    if (digits.startsWith("39") && digits.length > 10) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(
        5,
        8
      )} ${digits.slice(8)}`;
    }

    // Se il numero è lungo 10 cifre (formato italiano senza prefisso), aggiunge +39
    return `+39 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  let phoneElement = document.getElementById("phone");
  if (phoneElement) {
    let formattedPhone = formatItalianPhoneNumber(
      phoneElement.innerText.trim()
    );
    phoneElement.innerText = formattedPhone;
  }
});










function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Cookie string starts with name=
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


// E aggiungi solo questo per confermare:
document.getElementById("conferma-prescrizione-farmaci").addEventListener("click", function() {
  // Debug: vediamo cosa trova
  console.log("Elementi .coda-item trovati:", document.querySelectorAll('.coda-item'));
  
  const codaFarmaci = Array.from(document.querySelectorAll('.coda-item')).map(row => {
      console.log("Riga trovata:", row); // Debug
      return {
          codice: row.querySelector('[name="codiceFarmaco"]').textContent,
          nome: row.querySelector('.nomeFarmaco').textContent,
          aic: row.querySelector('.codici')?.textContent || "",
          atc: row.querySelectorAll('.codici')[1]?.textContent || "",
          dosaggio: row.querySelector('.dosaggio')?.textContent || "",
          apparato: row.querySelector('.apparati')?.textContent || "",
      };
  });

  console.log("Farmaci in coda:", codaFarmaci); // Debug

  if (codaFarmaci.length === 0) {
      showAlert({
        type: "warning",
        message: "Nessun farmaco selezionato!",
        extraMessage: "Seleziona almeno un farmaco per procedere.",
        borderColor: "#f97316",
      });
      return;
  }

  // Invia tutti i farmaci della coda al backend
  fetch('/aggiungi-farmaco/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({
          paziente_id: window.pazienteId || PAZIENTE_ID,
          farmaci: codaFarmaci
      })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          showAlert({
            type: "success",
            message: "Prescrizione salvata!",
            borderColor: "#10b981",
          });
          closeModal();
          // Svuota la coda
          document.querySelectorAll('.coda-item').forEach(row => row.remove());
          // Aggiorna la tabella se sei nella sezione farmaci
          if (typeof caricaTabellaFarmaci === 'function') {
              caricaTabellaFarmaci();
          }
      } else {
          showAlert({
            type: "error",
            message: data.error || "Errore",
            borderColor: "#ef4444",
          });
      }
  });
});


/*  -----------------------------------------------------------------------------------------------
  Funzione di aggiunta farmaco
--------------------------------------------------------------------------------------------------- */
// Funzione per switchare tra le tabelle Diario Clinico e Farmaci
document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll('.container-header-diario .header-container .button');
    const tabContents = document.querySelectorAll('.container-content');

    tabButtons.forEach((btn, idx) => {
        btn.addEventListener('click', function () {
            // Rimuovi la classe active da tutti i bottoni
            tabButtons.forEach(b => b.classList.remove('active'));
            // Aggiungi la classe active al bottone cliccato
            btn.classList.add('active');
            // Nascondi tutti i contenuti
            tabContents.forEach(content => content.style.display = 'none');
            // Mostra il contenuto corrispondente al bottone cliccato
            if (tabContents[idx]) {
                tabContents[idx].style.display = 'block';
            }
        });
    });
});

// Funzione per la paginazione AJAX delle tabelle Farmaci e Diagnosi
document.addEventListener("DOMContentLoaded", function () {
    // Paginazione Farmaci
    document.querySelectorAll('.pagination_tabella').forEach(function(pagination) {
        pagination.addEventListener('click', function(e) {
            const target = e.target;
            if (target.tagName === 'A' && target.closest('.container-content.farmaci')) {
                e.preventDefault();
                const url = target.getAttribute('href');
                fetch(url, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.text())
                .then(html => {
                    // Estrai solo la tabella farmaci dal response
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const nuovaTabella = doc.querySelector('.container-content.farmaci');
                    if (nuovaTabella) {
                        document.querySelector('.container-content.farmaci').innerHTML = nuovaTabella.innerHTML;
                    }
                });
            }
            // Paginazione Diagnosi (Problemi)
            if (target.tagName === 'A' && target.closest('.container-content-second')) {
                e.preventDefault();
                const url = target.getAttribute('href');
                fetch(url, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.text())
                .then(html => {
                    // Estrai solo la tabella diagnosi dal response
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const nuovaTabella = doc.querySelector('.container-content-second');
                    if (nuovaTabella) {
                        document.querySelector('.container-content-second').innerHTML = nuovaTabella.innerHTML;
                    }
                });
            }
        });
    });
});







/*  -----------------------------------------------------------------------------------------------
 funzioni per il funzionamento del menu diario clinico
--------------------------------------------------------------------------------------------------- */
// Script per i tab Diario/Farmaci/Accertamenti/Visite
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.container-header-diario .header-container .button');
  const tabContents = document.querySelectorAll('.container-tabella .container-content');

  tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', function() {
          tabButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          tabContents.forEach((content, cidx) => {
              content.style.display = (cidx === idx) ? 'block' : 'none';
          });
      });
  });
});































/*  -----------------------------------------------------------------------------------------------
  Funzioni per il funzionamento della modale problemi e diagnosi
--------------------------------------------------------------------------------------------------- */


// Gestione chiusura modale con la X
document.addEventListener('DOMContentLoaded', function() {
    var closeX = document.getElementById('close-problemi-x');
    var modaleProblemi = document.getElementById('modale_problemi');
    var backdropProblemi = document.getElementById('backdropModaleProblemi');
    if (closeX) {
        closeX.addEventListener('click', function() {
            if (modaleProblemi) modaleProblemi.style.display = 'none';
            if (backdropProblemi) backdropProblemi.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
});

// Mostra la sezione problemi solo dopo selezione diagnosi o inserimento nuova
document.addEventListener('DOMContentLoaded', function() {
    var diagnosiSelect = document.getElementById('diagnosi_select');
    var problemiStep = document.getElementById('problemi_step');
    var nuovaDiagnosiForm = document.getElementById('nuova_diagnosi_form');
    if (diagnosiSelect) {
        diagnosiSelect.addEventListener('change', function() {
            if (this.value === "__new__") {
                if (nuovaDiagnosiForm) nuovaDiagnosiForm.style.display = '';
                if (problemiStep) problemiStep.style.display = '';
            } else if (this.value) {
                if (nuovaDiagnosiForm) nuovaDiagnosiForm.style.display = 'none';
                if (problemiStep) problemiStep.style.display = '';
            } else {
                if (nuovaDiagnosiForm) nuovaDiagnosiForm.style.display = 'none';
                if (problemiStep) problemiStep.style.display = 'none';
            }
        });
    }
    // Opzionale: inserisci descrizione ICD10 nella textarea al cambio select
    var icd10Select = document.getElementById('icd10_select');
    var textAreaProblemi = document.getElementById('text_area_problemi');
    if (icd10Select && textAreaProblemi) {
        icd10Select.addEventListener('change', function() {
            var selected = this.options[this.selectedIndex];
            if (selected && selected.value) {
                textAreaProblemi.value = selected.value + " - " + selected.text.replace(selected.value + " - ", "");
            }
        });
    }
});

/*  -----------------------------------------------------------------------------------------------
  Funzione per mostrare la modale privacy
--------------------------------------------------------------------------------------------------- */
document.getElementById('open-privacy-btn').onclick = function(e) {
  e.preventDefault();
  document.getElementById('privacy-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Imposta la data di oggi come default
  const oggi = new Date().toISOString().split('T')[0];
  document.getElementById('privacy-data').value = oggi;
};

/*  -----------------------------------------------------------------------------------------------
  Funzione per chiudere la modale privacy
--------------------------------------------------------------------------------------------------- */
document.getElementById('privacy-modal-close').onclick = function() {
  document.getElementById('privacy-modal').style.display = 'none';
  document.body.style.overflow = 'auto';
};

/*  -----------------------------------------------------------------------------------------------
  Gestione firma su canvas
--------------------------------------------------------------------------------------------------- */
let canvas = document.getElementById('firma-canvas');
let ctx = canvas.getContext('2d');
let drawing = false;

// Configura il canvas per una firma più pulita
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Eventi per mouse/touch
canvas.addEventListener('pointerdown', e => {
  drawing = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  ctx.moveTo(x, y);
});

canvas.addEventListener('pointermove', e => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  ctx.lineTo(x, y);
  ctx.stroke();
});

canvas.addEventListener('pointerup', e => {
  drawing = false;
});

// Previeni lo scroll su mobile quando si firma
canvas.addEventListener('touchstart', e => e.preventDefault());
canvas.addEventListener('touchmove', e => e.preventDefault());

/*  -----------------------------------------------------------------------------------------------
  Bottone cancella firma
--------------------------------------------------------------------------------------------------- */
document.getElementById('clear-firma').onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/*  -----------------------------------------------------------------------------------------------
  Funzione per gestire i radio button e restituire X nelle coordinate giuste
--------------------------------------------------------------------------------------------------- */
function drawRadioX(page, idTrue, idFalse, coordTrue, coordFalse, height) {
  const trueChecked = document.getElementById(idTrue)?.checked;
  const falseChecked = document.getElementById(idFalse)?.checked;
  
  if (trueChecked) {
    page.drawText("X", {
      x: coordTrue.x,
      y: height - coordTrue.y,
      size: 15,
      color: PDFLib.rgb(0, 0, 0)
    });
  } else if (falseChecked) {
    page.drawText("X", {
      x: coordFalse.x,
      y: height - coordFalse.y,
      size: 15,
      color: PDFLib.rgb(0, 0, 0)
    });
  }
}

/*  -----------------------------------------------------------------------------------------------
  Salva la firma e i dati nel PDF e scarica il PDF compilato
--------------------------------------------------------------------------------------------------- */
// Funzione per validare il form privacy
function validatePrivacyForm() {
  // Lista degli id degli input obbligatori
  const requiredFields = [
    'privacy-nome',
    'privacy-data-nascita',
    'privacy-codice-fiscale',
    'privacy-data',
    'privacy-email',
    'privacy-telefono',
    'privacy-place-of-birth',
    'privacy-residence',
    'privacy-province',
  ];

  // Controlla i campi di testo
  for (const id of requiredFields) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      return { valid: false, message: 'Compila tutti i campi obbligatori.' };
    }
  }

  // Controlla i radio della privacy (tutti devono avere una scelta)
  const radioGroups = [
    ['diritti-dati-personali-true', 'diritti-dati-personali-false'],
    ['materiale-biologico-true', 'materiale-biologico-false'],
    ['referti-posta-elettronica-true', 'referti-posta-elettronica-false'],
    ['trasmissione-materiale-pubblicitario-true', 'trasmissione-materiale-pubblicitario-false']
  ];
  for (const [idTrue, idFalse] of radioGroups) {
    const trueChecked = document.getElementById(idTrue)?.checked;
    const falseChecked = document.getElementById(idFalse)?.checked;
    if (!trueChecked && !falseChecked) {
      return { valid: false, message: 'Devi rispondere a tutte le domande sulla privacy.' };
    }
  }

  return { valid: true };
}

document.getElementById('save-firma').onclick = async function() {
  // Controlla se pdf-lib è caricato
  if (!window.PDFLib) {
    alert('Errore: pdf-lib non è caricato. Ricarica la pagina e riprova.');
    return;
  }

  // Prendi i dati dagli input
  const nome = document.getElementById('privacy-nome').value.trim();
  const data = document.getElementById('privacy-data').value;
  const codiceFiscale = document.getElementById('privacy-codice-fiscale').value.trim();
  const indirizzo = document.getElementById('privacy-address').value.trim();
  const cap = document.getElementById('privacy-cap').value.trim();
  const dataNascita = document.getElementById('privacy-data-nascita').value.trim();
  const luogoNascita = document.getElementById('privacy-place-of-birth').value.trim();
  const residenza = document.getElementById('privacy-residence').value.trim();
  const provincia = document.getElementById('privacy-province').value.trim();
  const email = document.getElementById('privacy-email').value.trim();
  const telefono = document.getElementById('privacy-telefono').value.trim();
  const nomeMedico = window.DOTTORE || 'Dott. Rossi';
  const documento = document.getElementById('privacy-identity-doc').value.trim();
  const numeroDocumento = document.getElementById('privacy-nr-identity').value.trim();
  const dataRilascioDocumento = document.getElementById('privacy-relased-date').value.trim();
  const luogoRilascioDocumento = document.getElementById('privacy-relased-company').value.trim();
  const familiari = document.getElementById('privacy-family').value.trim();

  // Controlla che almeno il nome sia inserito
  if (!nome) {
    showAlert({
      type: 'warning',
      message: 'Inserisci almeno il tuo nome prima di salvare.',
      borderColor: '#EF4444',
    })
    return;
  }

  // Controlla che ci sia una firma
  const canvas = document.getElementById('firma-canvas');
  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const hasSignature = canvasData.data.some(channel => channel !== 0);
  
  if (!hasSignature) {
    showAlert({
      type: 'warning',
      message: 'Inserisci una firma prima di salvare.',
      borderColor: '#EF4444',
    });
    return;
  }

  // Controlla la privacy
  const validation = validatePrivacyForm();
  if (!validation.valid) {
    showAlert({
      type: 'warning',
      message: validation.message,
      borderColor: '#EF4444',
    });
    return;
  }

  try {
    // Funzione helper per caricare il PDF come arraybuffer
    async function fetchPdfAsBytes(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Impossibile caricare il PDF');
      return await res.arrayBuffer();
    }

    // Prendi la firma come PNG base64
    const dataUrl = canvas.toDataURL('image/png');

    // Carica il PDF privacy
    const pdfBytes = await fetchPdfAsBytes('/static/includes/pdfTemplates/Privacy&Policy.pdf');

    // Usa pdf-lib per modificare il PDF
    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage = pages[1];
    const thirdPage = pages[2];
    const { width, height } = firstPage.getSize();

    // Scrivi i dati nel PDF (modifica le coordinate x, y per posizionarli dove vuoi)
    // Le coordinate y partono dal basso del PDF!
    firstPage.drawText(`${nome}`, { 
      x: 140, 
      y: height - 445, // 100px dall'alto
      size: 10,
      color: PDFLib.rgb(0, 0, 0)
    });

    // Formatta la data in italiano se presente
    let dobFormattata = '';
    if (dataNascita) {
      const dateObj = new Date(dataNascita);
      dobFormattata = dateObj.toLocaleDateString('it-IT');
    }

    if (dobFormattata) {
      firstPage.drawText(`${dobFormattata}`, { 
        x: 130, 
        y: height - 467, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (luogoNascita) {
      firstPage.drawText(`${luogoNascita}`, { 
        x: 330, 
        y: height - 467, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }
    
    if (residenza) {
      firstPage.drawText(`${residenza}`, {
        x: 130, 
        y: height - 492, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }
    if (provincia) {
      firstPage.drawText(`${provincia}`, {
        x: 260, 
        y: height - 492, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (indirizzo) {
      firstPage.drawText(`${indirizzo}`, {
        x: 320, 
        y: height - 492, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (cap) {
      firstPage.drawText(`${cap}`, {
        x: 478, 
        y: height - 492, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (codiceFiscale) {
      firstPage.drawText(`${codiceFiscale}`, {
        x: 390, 
        y: height - 540, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (documento) {
      firstPage.drawText(`${documento}`, {
        x: 190, 
        y: height - 515, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (numeroDocumento) {
      firstPage.drawText(`${numeroDocumento}`, {
        x: 380, 
        y: height - 515, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }
    if (dataRilascioDocumento) {
      const dateObj = new Date(dataRilascioDocumento);
      const dataRilascioFormattata = dateObj.toLocaleDateString('it-IT');
      firstPage.drawText(`${dataRilascioFormattata}`, {
        x: 130, 
        y: height - 540, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (data) {
      const dateObj = new Date(data);
      const giorno = dateObj.getDate();           // giorno (1-31)
      const mese = dateObj.getMonth() + 1;        // mese (1-12) - aggiungi 1 perché parte da 0
      const anno = dateObj.getFullYear();         // anno (es: 2025)
      // Se vuoi sempre due cifre:
      const giornoStr = String(giorno).padStart(2, '0');
      const meseStr = String(mese).padStart(2, '0');
      const annoStr = String(anno);

      thirdPage.drawText(`${giornoStr}`, {
        x: 123, 
        y: height - 367,
        size: 12,
        color: PDFLib.rgb(0, 0, 0)
      });
      thirdPage.drawText(`${meseStr}`, {
        x: 152, 
        y: height - 367,
        size: 12,
        color: PDFLib.rgb(0, 0, 0)
      });
      thirdPage.drawText(`${annoStr}`, {
        x: 177, 
        y: height - 367,
        size: 12,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (luogoRilascioDocumento) {
      firstPage.drawText(`${luogoRilascioDocumento}`, {
        x: 250,
        y: height - 540,
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (email) {
      firstPage.drawText(`${email}`, { 
        x: 330, 
        y: height - 563,
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
      secondPage.drawText(`${email}`, { 
        x: 130, 
        y: height - 437, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
      secondPage.drawText(`${email}`, { 
        x: 130, 
        y: height - 579, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (telefono) {
      firstPage.drawText(`${telefono}`, { 
        x: 140, 
        y: height - 563, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
      secondPage.drawText(`${telefono}`, { 
        x: 140, 
        y: height - 657, 
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (familiari) {
      thirdPage.drawText(`${familiari}`, {
        x: 93, 
        y: height - 243,
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    if (nomeMedico) {
      thirdPage.drawText(`${nomeMedico}`, {
        x: 93, 
        y: height - 272,
        size: 10,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    // *** GESTIONE RADIO BUTTON CON COORDINATE DIVERSE PER TRUE/FALSE ***
    // Modifica le coordinate secondo le tue esigenze
    drawRadioX(firstPage, 'diritti-dati-personali-true', 'diritti-dati-personali-false', 
      {x: 181, y: 740},
      {x: 342, y: 740},
      height
    );

    drawRadioX(secondPage, 'materiale-biologico-true', 'materiale-biologico-false', 
      {x: 181, y: 282},
      {x: 342, y: 282},
      height
    );

    drawRadioX(secondPage, 'referti-posta-elettronica-true', 'referti-posta-elettronica-false', 
      {x: 181, y: 398},
      {x: 342, y: 398},
      height
    );

    drawRadioX(secondPage, 'trasmissione-materiale-pubblicitario-true', 'trasmissione-materiale-pubblicitario-false', 
      {x: 181, y: 538},
      {x: 380, y: 538},
      height
    );

    drawRadioX(secondPage, 'trasmissione-materiale-pubblicitario-true', 'trasmissione-materiale-pubblicitario-false', 
      {x: 181, y: 614},
      {x: 380, y: 614},
      height
    );

    // Inserisci la firma come immagine
    const pngImage = await pdfDoc.embedPng(dataUrl);
    const signatureWidth = 150;
    const signatureHeight = 60;
    
    thirdPage.drawImage(pngImage, {
      x: 285,
      y: height - 400,
      width: signatureWidth,
      height: signatureHeight,
    });

    // Salva il nuovo PDF
    const pdfWithSignature = await pdfDoc.save();

    // Scarica il PDF firmato e compilato
    const blob = new Blob([pdfWithSignature], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Privacy_Policy_${nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    // Mostra messaggio di successo e chiudi la modale
    showAlert({
      type: 'success',
      message: 'PDF generato e scaricato con successo!',
      borderColor: '#10b981',
    });
    document.getElementById('privacy-modal').style.display = 'none';
    document.body.style.overflow = 'auto';

    // Reset solo la data e la firma
    const oggi = new Date().toISOString().split('T')[0];
    document.getElementById('privacy-data').value = oggi;
    document.getElementById('privacy-address').value = '';
    document.getElementById('privacy-identity-doc').value = '';
    document.getElementById('privacy-nr-identity').value = '';
    document.getElementById('privacy-relased-date').value = '';
    document.getElementById('privacy-relased-company').value = '';
    document.getElementById('privacy-family').value = '';
    // Reset radio button della privacy
    document.getElementById('diritti-dati-personali-true').checked = false;
    document.getElementById('diritti-dati-personali-false').checked = false;
    document.getElementById('materiale-biologico-true').checked = false;
    document.getElementById('materiale-biologico-false').checked = false;
    document.getElementById('referti-posta-elettronica-true').checked = false;
    document.getElementById('referti-posta-elettronica-false').checked = false;
    document.getElementById('trasmissione-materiale-pubblicitario-true').checked = false;
    document.getElementById('trasmissione-materiale-pubblicitario-false').checked = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('Errore durante la generazione del PDF:', error);
    showAlert({
      type: 'error',
      message: 'Si è verificato un errore durante la generazione del PDF.',
      borderColor: '#ef4444',
    });
  }
};

/*  -----------------------------------------------------------------------------------------------
  Funzione per mostrare i menù a tendina di approvazione privacy
--------------------------------------------------------------------------------------------------- */
// Gestione apertura/chiusura con GSAP
document.querySelectorAll('.consenso-header').forEach(header => {
  header.addEventListener('click', function(e) {
    // Non aprire/chiudere se clicchi sulla checkbox o label
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;

    const card = header.parentElement;
    const desc = card.querySelector('.consenso-desc');
    const arrow = header.querySelector('.arrow');
    const isOpen = card.classList.contains('open');

    if (isOpen) {
      gsap.to(desc, { height: 0, opacity: 0, marginLeft: 0, marginRight: 0, duration: 0.25, ease: "power2.in" });
      arrow.style.transform = "rotate(0deg)";
      card.classList.remove('open');
    } else {
      desc.style.height = 'auto';
      const autoHeight = desc.scrollHeight;
      desc.style.height = '0';
      gsap.to(desc, { height: autoHeight, opacity: 1, marginLeft: 10, marginRight: 10, padding: 20, duration: 0.3, ease: "power2.out" });
      arrow.style.transform = "rotate(90deg)";
      card.classList.add('open');
    }
  });
});

/*  -----------------------------------------------------------------------------------------------
  Funzione per salvare la prescrizione libera
  --------------------------------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('savePrescrizioneLibera');
    const textarea = document.getElementById('textareaPrescrizioneLibera');
    const popup = document.getElementById('popup-success-prescrizione-libera');
    if (saveBtn && textarea) {
        saveBtn.addEventListener('click', function() {
            const testo = textarea.value.trim();
            if (!testo) {
              if (popup) {
                popup.style.display = 'block';
                popup.textContent = 'Inserisci una prescrizione prima di salvare.';
                setTimeout(() => { popup.style.display = 'none'; }, 3500);
              }
              return;
            }
            fetch('/api/salva-prescrizione-libera/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': (document.querySelector('meta[name="csrf-token"]') || {}).content || ''
                },
                body: JSON.stringify({
                    persona_id: window.PAZIENTE_ID,
                    testo: testo
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    textarea.value = '';
                    if (popup) {
                        popup.style.display = 'block';
                        popup.textContent = 'Prescrizione salvata con successo!';
                        setTimeout(() => { popup.style.display = 'none'; }, 3500);
                    }
                    document.getElementById('modalePrescrizioneLibera').style.display = 'none';
                    document.body.style.overflow = 'auto';
                } else {
                    if (popup) {
                        popup.style.display = 'block';
                        popup.textContent = 'Errore nel salvataggio: ' + (data.error || 'Errore generico.');
                        setTimeout(() => { popup.style.display = 'none'; }, 3500);
                    }
                }
            })
            .catch(() => alert('Errore di rete nel salvataggio.'));
        });
    }
});



/* MODALE DIARIO CLINICO */
const titleClick = document.getElementById('open-diario-modal');
const modale = document.getElementById('diario-modal');
const backdropDiario = document.getElementById('backdrop-diario');
const closeBtnDiario = document.getElementById('close-diario-modal');

titleClick.addEventListener('click', ()=>{
  modale.style.display = 'block';
  backdropDiario.style.display = 'block';
  document.body.dataset.prevOverflow = document.body.style.overflow || '';
  document.body.style.overflow = 'hidden';
});

function closeDiario() {
  modale.style.display = 'none';
  backdropDiario.style.display = 'none';
  document.body.style.overflow = document.body.dataset.prevOverflow || '';
  delete document.body.dataset.prevOverflow;
}

closeBtnDiario.addEventListener('click', closeDiario);
backdropDiario.addEventListener('click', (e)=>{ if (e.target === backdropDiario) closeDiario(); });





/* FUNZIONE GENERA PDF PRESCRIZIONE FARMACI */







































