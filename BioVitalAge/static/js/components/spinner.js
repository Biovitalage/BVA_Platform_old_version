// static/js/components/spinner.js

(function() {
  // 1) Disabilito il "restore" della posizione
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // 2) All’avvio, impedisco lo scroll nativo e avvio il polling
  document.body.style.overflow = 'hidden';
  const scrollInterval = setInterval(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 20); // ogni 20ms, fino a clearInterval

  // 3) Appena il DOM è pronto, rilancio un ultimo scroll (sicurezza)
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
  });

  // 4) Dopo il timeout del loader, fermo il polling e ripristino tutto
  setTimeout(() => {
    const loader = document.getElementById('loading-wrapper');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.zIndex = '-1';
    }

    clearInterval(scrollInterval);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.style.overflow = 'auto';
  }, 400); // mantieni il tuo 400ms
})();
