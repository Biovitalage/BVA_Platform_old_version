
/* FUNZIONE SIDE BAR */
const buttonSideBar = document.getElementById('openSideBar');
const sideBar = document.getElementById('sidebar');

buttonSideBar.addEventListener('mouseover', ()=>{
    sideBar.style.display = "flex";
})

sideBar.addEventListener('mouseleave', () => {
    sideBar.style.display = "none";
});




/* EFFETTO RIEMPIMENTO AD ONDINA */
 document.addEventListener("DOMContentLoaded", () => {
    const wave1 = "M0,40 C150,100 350,-20 500,60 L500,100 L0,100 Z";
    const wave2 = "M0,60 C150,40 350,120 500,30 L500,100 L0,100 Z";
            
    document.querySelectorAll(".container-card-score").forEach(card => {

        const punteggio = parseFloat(card.dataset.punteggio);
        const punteggioFinale = isNaN(punteggio) ? 1 : punteggio;
                

        const percentuale = punteggioFinale > 10 
            ? Math.min(punteggioFinale, 100) 
                : Math.min((punteggioFinale / 10) * 100, 100);
                
                const backdrop = card.querySelector(".backdrop-riempimento");
                const wavePath = card.querySelector(".wavePath");
                
                if (!wavePath || !backdrop) return;

                gsap.to(wavePath, {
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    attr: { d: wave2 }
                });
                
                gsap.to(backdrop, {
                    duration: 1.8,
                    height: `${percentuale}%`,
                    ease: "power2.out"
            });
    });
});






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
