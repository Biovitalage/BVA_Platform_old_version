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

function goToPatientsPage() {
  alert("Vai alla pagina di tutti i pazienti");
}
function goToRefertiPage() {
  alert("Vai alla pagina dei referti dei pazienti");
}

// Funzione che imposta "opacity: 0" e "z-index: -1" dopo 3 secondi
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.getElementById("loading-wrapper").style.opacity = "0";
    document.getElementById("loading-wrapper").style.zIndex = "-1";
  }, 500);
});

// Grafici
const weeklyCtx = document.getElementById("weeklyPatientsChart");
new Chart(weeklyCtx, {
  type: "line",
  data: {
    labels: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    datasets: [
      {
        label: "Pazienti Visitati",
        data: [5, 10, 8, 12, 15, 20, 5],
        borderColor: "#fff",
        backgroundColor: "rgba(255,255,255,0.3)",
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  },
});

const patientsCtx = document.getElementById("patientsChart");
new Chart(patientsCtx, {
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
        label: "Pazienti Inseriti",
        data: [30, 45, 60, 50, 41, 66, 30, 50, 70, 90, 100, 120],
        backgroundColor: "#6a2dcc",
        categoryPercentage: 2.8, // Maggior spazio tra le categorie
        barPercentage: 0.1, // Barre più sottili
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false, // Mostra tutte le etichette
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

const monthlyCtx = document.getElementById("monthlyPatientsChart");
const monthlyData = {
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
      label: "Pazienti Mensili",
      data: [40, 60, 55, 70, 80, 90, 100, 85, 75, 95, 110, 120],
      backgroundColor: "#c3b0ec",
      borderColor: "#6a2dcc",
      borderWidth: 2,
      fill: true,
    },
  ],
};

let monthlyPatientsChart = new Chart(monthlyCtx, {
  type: "line",
  data: monthlyData,
  options: {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
    onHover: (event, chartElement) => {
      const tooltip = document.getElementById("monthlyTooltip");
      if (chartElement.length > 0) {
        const index = chartElement[0].index;
        const monthLabel = monthlyData.labels[index];
        const patientCount = monthlyData.datasets[0].data[index];
        const calcCount = Math.floor(patientCount * 0.6);

        tooltip.innerHTML = `
                      <strong>${monthLabel}</strong><br>
                      Pazienti: ${patientCount}<br>
                      Con calcolo età bio: ${calcCount}
                  `;
        const canvasPos = monthlyCtx.getBoundingClientRect();
        tooltip.style.opacity = 1;
        tooltip.style.left = event.clientX - canvasPos.left + "px";
        tooltip.style.top = event.clientY - canvasPos.top + "px";
      } else {
        const tooltip = document.getElementById("monthlyTooltip");
        tooltip.style.opacity = 0;
      }
    },
  },
});

/*  -----------------------------------------------------------------------------------------------
  JS SIDEBAR
--------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelectorAll("#sidebar");
  const sidebarTitle = document.getElementById("sidebar-title");
  const sidebarContent = document.getElementById("sidebar-content");
  const closeSidebar = document.getElementById("closeSidebar");
  const bgSidebar = document.querySelector(".bg-sidebar");

  // Gestisci il click sulle icone
  document.querySelectorAll(".sidebar-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const section = trigger.getAttribute("data-section");

      // Aggiorna contenuto della sidebar in base alla sezione
      sidebarTitle.textContent = section;
      switch (section) {
        case "Notifiche":
          sidebarContent.innerHTML = `
            <div id="notification-list">
              <h3 class="title-notice">Ultime Novità</h3>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 1</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 2</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 3</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <h3 class="title-notice">Altre Novità</h3>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 1</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 2</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 3</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 1</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 2</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 3</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 1</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 2</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
              <a href="#" class="blog-link" title="View Blog">
                <div class="blog-container">
                  <div class="container_img">
                    <img
                      src="../../static/includes/images/search-patients-item.webp"
                      alt="img-blog"
                    />
                  </div>
                  <div>
                    <h3 class="blog-title">Blog 3</h3>
                    <p class="blog-text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Adipisci at veniam eum quo alias suscipit corrupti,
                      commodi eveniet porro nulla magni a ipsum voluptate, totam
                      rerum? Ducimus ipsum quibusdam quam.
                    </p>
                  </div>
                </div>
              </a>
            </div>
            `;
          break;
        case "Email":
          sidebarContent.innerHTML = "<p>Qui trovi tutte le email.</p>";
          break;
        case "Update":
          sidebarContent.innerHTML = "<p>Qui trovi gli aggiornamenti.</p>";
          break;
        default:
          sidebarContent.innerHTML = "<p>Contenuto non disponibile.</p>";
      }

      // Mostra la sidebar
      document.body.classList.add("visible");
    });
  });

  // Chiudi la sidebar
  bgSidebar.addEventListener("click", () => {
    document.body.classList.remove("visible");
  });

  closeSidebar.addEventListener("click", () => {
    document.body.classList.remove("visible");
  });
});
