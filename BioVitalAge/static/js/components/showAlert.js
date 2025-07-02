export default function showAlert(arg1, message = "", extraMessage = "", borderColor = "") {
  let type;

  // Se il primo argomento è un oggetto
  if (typeof arg1 === "object") {
    ({ type = "success", message = "Messaggio mancante", extraMessage = "", borderColor } = arg1);
  } else {
    // Se il primo argomento è una stringa semplice
    type = "danger"; // default tipo errore
    message = arg1 || "Errore generico";
    borderColor = "#ef4444";
  }

  // Rimuove eventuale alert
  const existingAlert = document.getElementById("global-alert");
  if (existingAlert) existingAlert.remove();

  // Icone e colori
  let icon = "✅";
  let title = "Success!";
  let titleColor = "#22c55e"; // verde
  if (type === "danger" || type === "error") {
    icon = "❌";
    title = "Errore";
    titleColor = "#ef4444";
    borderColor ||= "#ef4444";
  } else if (type === "warning") {
    icon = "⚠️";
    title = "Attenzione";
    titleColor = "#f97316"; // arancione
    borderColor ||= "#f97316";
  }

  // Contenitore alert
  const alertDiv = document.createElement("div");
  alertDiv.id = "global-alert";
  Object.assign(alertDiv.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "999999999999",
    maxWidth: "430px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "15px 20px",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    opacity: "0",
    borderBottom: `4px solid ${borderColor}`,
  });

  alertDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">${icon}</span>
        <span style="color: ${titleColor}; font-weight: 600; font-size: 18px;">
          ${title}
        </span>
      </div>
      <button style="background: none; border: none; font-size: 16px; cursor: pointer;" onclick="this.closest('#global-alert').remove()">✖</button>
    </div>
    <div style="color: #333;">${message}</div>
    ${extraMessage ? `<div style="color: #dc2626; font-weight: 500;">${extraMessage}</div>` : ""}
  `;

  document.body.appendChild(alertDiv);

  // Entrata animata
  gsap.to(alertDiv, { opacity: 1, duration: 0.3, ease: "power2.out" });

  // Rimozione automatica dopo 5s
  setTimeout(() => {
    gsap.to(alertDiv, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => alertDiv.remove(),
    });
  }, 5000);
}