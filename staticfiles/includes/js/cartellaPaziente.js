// Funzione che imposta "opacity: 0" e "z-index: -1" dopo 3 secondi
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.getElementById("loading-wrapper").style.opacity = "0";
    document.getElementById("loading-wrapper").style.zIndex = "-1";
  }, 500);
});

// Access to :root style css
const rootStyles = getComputedStyle(document.documentElement);

// Access to color in the :root
const bgColorDark = rootStyles.getPropertyValue("--contrast-color").trim();

function updateKidneyClock() {
  const kidneyClock = document.getElementById("kidneyClock");
  const kidneyPercentage = document.getElementById("kidneyPercentage");

  const percentage = 57;
  const angle = (percentage / 100) * 360;

  kidneyClock.style.background = `conic-gradient(${bgColorDark} ${angle}deg, #e0e0e0 ${angle}deg)`;

  kidneyPercentage.textContent = `${percentage}%`;
  kidneyPercentage.style.color = bgColorDark;
}
function updateLipidClock() {
  const lipidClock = document.getElementById("lipidClock");
  const lipidPercentage = document.getElementById("lipidPercentage");

  const percentage = 33;
  const angle = (percentage / 100) * 360;

  lipidClock.style.background = `conic-gradient(${bgColorDark} ${angle}deg, #e0e0e0 ${angle}deg)`;

  lipidPercentage.textContent = `${percentage}%`;
  lipidPercentage.style.color = bgColorDark;
}
function updateLiverClock() {
  const liverClock = document.getElementById("liverClock");
  const liverPercentage = document.getElementById("liverPercentage");

  const percentage = 73;
  const angle = (percentage / 100) * 360;

  liverClock.style.background = `conic-gradient(${bgColorDark} ${angle}deg, #e0e0e0 ${angle}deg)`;

  liverPercentage.textContent = `${percentage}%`;
  liverPercentage.style.color = bgColorDark;
}
function updateGlucoseClock() {
  const glucoseClock = document.getElementById("glucoseClock");
  const glucosePercentage = document.getElementById("glucosePercentage");

  const percentage = 15;
  const angle = (percentage / 100) * 360;

  glucoseClock.style.background = `conic-gradient(${bgColorDark} ${angle}deg, #e0e0e0 ${angle}deg)`;

  glucosePercentage.textContent = `${percentage}%`;
  glucosePercentage.style.color = bgColorDark;
}

updateKidneyClock();
updateLipidClock();
updateLiverClock();
updateGlucoseClock();

function generateChart(ctx, data, label) {
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: "rgba(58, 37, 93, 1)",
          borderColor: "#3a255d",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
}

// Generate charts for each card
document.addEventListener("DOMContentLoaded", () => {
  generateChart(
    document.getElementById("chart1").getContext("2d"),
    [140, 190, 230, 210, 180],
    "BP Levels"
  );
  generateChart(
    document.getElementById("chart2").getContext("2d"),
    [90, 100, 110, 120, 130],
    "Sugar Levels"
  );
  generateChart(
    document.getElementById("chart3").getContext("2d"),
    [80, 85, 90, 95, 100],
    "Heart Rate"
  );
  generateChart(
    document.getElementById("chart4").getContext("2d"),
    [180, 220, 240, 200, 210],
    "Cholesterol"
  );
});

const ctx1 = document.getElementById("chartDash2_1").getContext("2d");
new Chart(ctx1, {
  type: "bar",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Claims",
        data: [5, 10, 15, 7, 8, 5, 12, 10, 6, 8, 9, 15],
        backgroundColor: "rgba(58, 37, 93, 0.8)",
        borderColor: "rgba(58, 37, 93, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#666" },
      },
      y: {
        grid: { color: "#ddd" },
        ticks: { color: "#666" },
      },
    },
  },
});

const ctx2 = document.getElementById("chartDash_2").getContext("2d");
new Chart(ctx2, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Expenses",
        data: [200, 400, 600, 500, 700, 300],
        borderColor: "rgba(58, 37, 93, 0.5)",
        backgroundColor: "rgba(58, 37, 93, 1)",
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#666" },
      },
      y: {
        grid: { color: "#ddd" },
        ticks: { color: "#666" },
      },
    },
  },
});

/*  -----------------------------------------------------------------------------------------------
  User Modal log out
--------------------------------------------------------------------------------------------------- */
const userImg = document.getElementById("userImg");
const userModal = document.getElementById("userModal");
const userModalBtn = document.getElementById("nav-bar-user-modal-btn");

function showModal() {
  userModal.classList.add("show");
}

userImg.addEventListener("mouseover", showModal);

userModal.addEventListener("mouseout", () => {
  userModal.classList.remove("show");
});

userModalBtn.addEventListener("mouseover", showModal);
