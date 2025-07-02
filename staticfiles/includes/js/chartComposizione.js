const colors = {
    dark1: "#0c042c",
    dark2: "#0c214b",
    light1: "#c3ccd4",
    neutralGray: "#b0b8c1",
    contrastColor: "#3a255d",
    contrastColor2: "#6a2dcc",
    positiveColor: "#2ac670"
};

document.addEventListener('DOMContentLoaded', function () {
    const chartsData = [
        {
            elementId: 'bmiChart',
            type: 'bar',
            labels: ['Grave magrezza', 'Sottopeso', 'Normopeso', 'Sovrappeso', 'Obeso Classe 1', 'Obeso Classe 2', 'Obeso Classe 3'],
            data: [15, 17, 22, 27, 32, 37, 42],
            backgroundColor: [colors.contrastColor]
        },
        {
            elementId: 'grassoChart',
            type: 'doughnut',
            labels: ['Insufficientemente grasso', 'Sano', 'Eccessivamente grasso', 'Obeso'],
            data: [10, 25, 35, 50],
            backgroundColor: [colors.contrastColor, colors.positiveColor, colors.contrastColor2, colors.dark2]
        },
        {
            elementId: 'acquaChart',
            type: 'pie',
            labels: ['Donna', 'Uomo'],
            data: [55, 60],
            backgroundColor: [colors.contrastColor2, colors.positiveColor]
        },
        {
            elementId: 'massaChart',
            type: 'bar',
            labels: ['Massa Muscolare', 'Massa Grassa', 'Massa Ossea'],
            data: [45, 20, 5],
            backgroundColor: [colors.positiveColor, colors.contrastColor, colors.contrastColor2]
        }
    ];

    chartsData.forEach(chart => {
        const ctx = document.getElementById(chart.elementId).getContext('2d');
        new Chart(ctx, {
            type: chart.type,
            data: {
                labels: chart.labels,
                datasets: [{
                    label: chart.elementId,
                    data: chart.data,
                    backgroundColor: chart.backgroundColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: colors.dark1
                        }
                    }
                }
            }
        });
    });
});
