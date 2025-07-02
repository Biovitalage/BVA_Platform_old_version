// --- 0. ANDAMENTO INSERIMENTO PAZIENTI ---
const patientsLabels = JSON.parse(
  document.getElementById('monthly-labels').textContent
);
const patientsData = JSON.parse(
  document.getElementById('monthly-data').textContent
);

new Chart(
  document.getElementById("patientsChart").getContext("2d"),
  {
    type: "bar",
    data: {
      labels: patientsLabels,
      datasets: [{
        label: "Pazienti Inseriti",
        data: patientsData,
        backgroundColor: "#6a2dcc",
        // per maggior spazio tra le barre
        categoryPercentage: 2.8,
        // per barre più sottili
        barPercentage: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { autoSkip: false }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  }
);


// --- 1. GRAFICO MENSILE ---
// --- GRAFICO MENSILE CON TOOLTIP CUSTOM ---
const monthlyLabels = JSON.parse(
  document.getElementById('monthly-labels').textContent
);
const monthlyData   = JSON.parse(
  document.getElementById('monthly-data').textContent
);

const monthlyCtx = document
  .getElementById("monthlyPatientsChart")
  .getContext("2d");

let monthlyPatientsChart = new Chart(monthlyCtx, {
  type: "line",
  data: {
    labels: monthlyLabels,
    datasets: [{
      label: "Pazienti Mensili",
      data: monthlyData,
      backgroundColor: "rgba(195,176,236, 0.7)",
      borderColor: "#6a2dcc",
      borderWidth: 2,
      fill: true,
      pointRadius: 4,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } }
    },
    onHover: (event, chartElements) => {
      const tooltip = document.getElementById("monthlyTooltip");
      if (chartElements.length) {
        const idx = chartElements[0].index;
        const m   = monthlyLabels[idx];
        const cnt = monthlyData[idx];
        const bio = Math.floor(cnt * 0.6);

        tooltip.innerHTML = `
          <strong>${m}</strong><br>
          Pazienti: ${cnt}<br>
          Con calcolo età bio: ${bio}
        `;
        const rect = monthlyCtx.canvas.getBoundingClientRect();
        tooltip.style.opacity = 1;
        tooltip.style.left    = event.clientX - rect.left + "px";
        tooltip.style.top     = event.clientY - rect.top  + "px";
      } else {
        tooltip.style.opacity = 0;
      }
    }
  }
});


// --- 2. GRAFICO SETTIMANALE ---
const weeklyLabels = JSON.parse(document.getElementById('weekly-labels').textContent);
const weeklyData   = JSON.parse(document.getElementById('weekly-data').textContent);
new Chart(
  document.getElementById("weeklyPatientsChart").getContext("2d"),
  {
    type: "line",
    data: {
      labels: weeklyLabels,
      datasets: [{
        label: "Pazienti per Giorno",
        data: weeklyData,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  }
);

// --- 3. GRAFICO PER FASCE D’ETÀ ---
const ageLabels   = JSON.parse(document.getElementById('age-labels').textContent);
const ageDatasets = JSON.parse(document.getElementById('age-datasets').textContent);
new Chart(
  document.getElementById("patientsByAge").getContext("2d"),
  {
    type: "bar",
    data: {
      labels: ageLabels,
      datasets: ageDatasets
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  }
);

// Chart: Income by Department
const ctx3 = document.getElementById("incomeByDepartment").getContext("2d");
new Chart(ctx3, {
  type: "bar",
  data: {
    labels: [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ],

    datasets: [
      {
        label: "Neurologia",
        data: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
        backgroundColor: "#6a2dcc",
      },
      {
        label: "Cura dei denti",
        data: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        backgroundColor: "#8041e0",
      },
      {
        label: "Ginecologia",
        data: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
        backgroundColor: "#9666e4",
      },
      {
        label: "Ortopedia",
        data: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
        backgroundColor: "#ad8be8",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});