function generateChart(ctx, data, label) {
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Giorno 1", "Giorno 2", "Giorno 3"],  
            datasets: [{
                label: label,
                data: data,
                backgroundColor: "#3b255d2c",
                borderColor: "#3a255d",
                tension: 0.3,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
        },
    });
}

document.addEventListener("DOMContentLoaded", () => {

    // Chart 1: Insulina
    generateChart(
        document.getElementById("chart1").getContext("2d"),
        [2, 4, 6],
        "Insulina"
    );

    // Chart 2: Glicemia
    generateChart(
        document.getElementById("chart2").getContext("2d"),
        [110, 95, 140],
        "Glicemia"
    );

    // Chart 3: Emoglobina
    generateChart(
        document.getElementById("chart3").getContext("2d"),
        [22, 26, 28],
        "Emoglobina"
    );

    // Chart 4: Colesterolo
    generateChart(
        document.getElementById("chart4").getContext("2d"),
        [260, 280, 255],
        "Colesterolo"
    );

});
