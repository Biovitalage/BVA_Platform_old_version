
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