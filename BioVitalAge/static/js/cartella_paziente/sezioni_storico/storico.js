import { confirmDeleteAction } from "../../components/deleteAction.js";

/*  -----------------------------------------------------------------------------------------------
        Listener per la paginazione
--------------------------------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    // ⏱️ Inizializza subito i bottoni all'avvio della pagina
    inizializeButtons();

    document.addEventListener('click', function (event) {
        const target = event.target;

        // Se hai cliccato su un <a> dentro la paginazione
        if (target.closest('.pagination_tabella a')) {
            event.preventDefault();

            const link = target.closest('a');
            const url = link.href;

            fetch(url)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelector('#storico-wrapper');
                    document.querySelector('#storico-wrapper').innerHTML = newContent.innerHTML;

                    // 🔁 Reinizializza i listener dopo il nuovo contenuto
                    inizializeButtons();
                });
        }
    });
});
        

/*  -----------------------------------------------------------------------------------------------
Listener per il pulsante "Modifica"
--------------------------------------------------------------------------------------------------- */
const appuntamentiUrl = document.body.dataset.appuntamentiUrl;

document.querySelectorAll(".edit").forEach(btn => {
    btn.addEventListener("click", () => {
        const appointmentId = btn.dataset.id;
        localStorage.setItem("editAppointmentId", appointmentId);
        window.location.href = appuntamentiUrl;  // cambia se hai un path diverso
    });
});

/*  -----------------------------------------------------------------------------------------------
|   JS PER ELIMINARE UN APPUNTAMENTO
--------------------------------------------------------------------------------------------------- */
function inizializeButtons() {
    /*  -----------------------------------------------------------------------------------------------
        Gestione tabella storico appuntamenti
    --------------------------------------------------------------------------------------------------- */
    // Funzione per eliminare un appuntamento
    document.querySelectorAll(".btn.delete").forEach(btn => {
        btn.addEventListener("click", function () {
            const appointmentId = this.dataset.id;
            const row = this.closest("tr");
            confirmDeleteAction({
                url: `/delete-appointment/${appointmentId}/`,
                elementToRemove: row,
                successMessage: "Appuntamento eliminato con successo!",
                errorMessage: "Errore nella cancellazione dell'appuntamento",
                confirmMessage: "Sei sicuro di voler eliminare questo appuntamento?",
                borderColor: "#EF4444",
            })
        });
    });

    // Funzione per modificare un appuntamento
    document.querySelectorAll(".btn.edit").forEach(btn => {
        const appointmentDate = new Date(btn.dataset.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        // Disabilita il bottone se data nel passato
        if (appointmentDate < today) {
            btn.disabled = true;
        }

        btn.addEventListener("click", function () {
            const appointmentId = this.dataset.id;
            localStorage.setItem("editAppointmentId", appointmentId);
            window.location.href = appuntamentiUrl;
        });
    });
}


/*  -----------------------------------------------------------------------------------------------
    Grafico Appuntamenti
--------------------------------------------------------------------------------------------------- */
const ctx = document.getElementById('graficoDiagnosi').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        datasets: [{
            label: 'Appuntamenti Mensili',
            data: appuntamenti_per_mese_var,
            backgroundColor: 'rgba(128, 90, 213, 0.3)',
            borderColor: 'rgba(128, 90, 213, 1)',
            pointBackgroundColor: 'rgba(128, 90, 213, 1)',
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        interaction: {
            mode: 'nearest',
            intersect: false
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 30,
                ticks: {
                    stepSize: 5
                }
            }
        }
    }
});