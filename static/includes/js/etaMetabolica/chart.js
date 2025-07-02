window.onload = function () {
  const colors = {
    dark1: "#0c042c",
    dark2: "#0c214b",
    light1: "#c3ccd4",
    neutralGray: "#b0b8c1",
    contrastColor: "#3a255d",
    contrastColor2: "#6a2dcc",
    positiveColor: "#2ac670",
  };

  const personaDataDiv = document.getElementById("userData");

  // Se non esiste, si usano valori nulli e colori neutri
  const gender = personaDataDiv?.getAttribute("data-gender") || "M";
  const acquaAttuale = parseFloat(personaDataDiv?.getAttribute("data-acqua")) || 0;
  const massaMuscolare = parseFloat(personaDataDiv?.getAttribute("data-massa-muscolare")) || 0;
  const massaOssea = parseFloat(personaDataDiv?.getAttribute("data-massa-ossea")) || 0;
  const grasso = parseFloat(personaDataDiv?.getAttribute("data-grasso")) || 0;
  const grassoViscerale = parseFloat(personaDataDiv?.getAttribute("data-grasso-viscerale")) || 0;
  let bmiAttuale = parseFloat(personaDataDiv?.getAttribute("data-bmi")) || 0;
  let punteggioAttuale = parseFloat(personaDataDiv?.getAttribute("data-punteggio-fisico")) || 1;

  if (bmiAttuale > 50) bmiAttuale = 50;
  punteggioAttuale = Math.max(1, Math.min(9, punteggioAttuale));
  const acquaNormale = gender === "M" ? 65 : 60;

  // Anche se non ci sono dati, mostra almeno una riga nello storico
  const storicoPunteggi = [{
    punteggio: punteggioAttuale,
    data: new Date().toISOString(),
  }];

  const labelsStorico = storicoPunteggi.map(entry =>
    new Date(entry.data).toLocaleDateString()
  );
  const datiStorico = storicoPunteggi.map(entry => entry.punteggio);

  const bmiRanges = [
    { label: "Sottopeso", min: 0, max: 18.5, color: colors.positiveColor },
    { label: "Normopeso", min: 18.6, max: 24.9, color: colors.contrastColor },
    { label: "Sovrappeso", min: 25, max: 29.9, color: colors.contrastColor2 },
    { label: "Obesità I", min: 30, max: 34.9, color: colors.dark2 },
    { label: "Obesità II", min: 35, max: 39.9, color: colors.neutralGray },
    { label: "Obesità III", min: 40, max: 50, color: colors.dark1 }
  ];

  const bmiLabels = bmiRanges.map(r => r.label);
  const bmiData = bmiRanges.map(r => r.max);
  const bmiBackgroundColors = bmiRanges.map(range =>
    (bmiAttuale >= range.min && bmiAttuale <= range.max) ? range.color : colors.light1
  );

  const chartsData = [
    {
      elementId: "composizioneChart",
      type: "doughnut",
      labels: ["Massa Ossea", "Massa Muscolare", "Grasso Corporeo", "Grasso Viscerale"],
      data: [massaOssea, massaMuscolare, grasso, grassoViscerale],
      backgroundColor: [
        massaOssea > 0 ? colors.contrastColor : colors.light1,
        massaMuscolare > 0 ? colors.positiveColor : colors.light1,
        grasso > 0 ? colors.contrastColor2 : colors.light1,
        grassoViscerale > 0 ? colors.dark2 : colors.light1
      ],
    },
    {
      elementId: "acquaChart",
      type: "pie",
      labels: ["Valore nella norma", "Valore attuale"],
      data: [acquaNormale, acquaAttuale],
      backgroundColor: [
        acquaNormale > 0 ? colors.positiveColor : colors.light1,
        acquaAttuale > 0 ? colors.contrastColor2 : colors.light1
      ],
    },
    {
      elementId: "bmiChart",
      type: "bar",
      labels: bmiLabels,
      data: bmiData,
      backgroundColor: bmiBackgroundColors,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, suggestedMax: 50, ticks: { stepSize: 10 } },
        },
        plugins: {
          legend: { display: false },
        },
      },
    },
  ];

  chartsData.forEach(chart => {
    const ctx = document.getElementById(chart.elementId)?.getContext("2d");
    if (!ctx) return;
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
      options: chart.options || {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 14, weight: "bold" },
              color: colors.dark1
            }
          }
        }
      }
    });
  });

  const ctxPunteggio = document.getElementById("GraficoPunteggio")?.getContext("2d");
  if (ctxPunteggio) {
    new Chart(ctxPunteggio, {
      type: "line",
      data: {
        labels: labelsStorico,
        datasets: [{
          label: "Andamento Punteggio Fisico",
          data: datiStorico,
          borderColor: punteggioAttuale > 0 ? colors.contrastColor : colors.light1,
          borderWidth: 3,
          pointBackgroundColor: punteggioAttuale > 0 ? colors.positiveColor : colors.light1,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { suggestedMin: 1, suggestedMax: 9, ticks: { stepSize: 1 } }
        }
      }
    });
  }
};
