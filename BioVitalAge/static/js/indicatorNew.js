document.querySelectorAll('.indicator-container').forEach(container => {
  try {
    const indicator = container.querySelector('.indicatore');
    const rawValue = indicator.dataset.value;
    const value = parseFloat(rawValue);
    if (!isFinite(value)) return;

    const negMin = parseFloat(
      container.querySelector('.negativeTesto').textContent.trim()
    );
    const [posMinText, posMaxText] = Array.from(
      container.querySelectorAll('.positiveTesto p')
    ).map(p => p.textContent.replace('>', '').trim());
    const posMin = parseFloat(posMinText) || negMin;
    const posMax = parseFloat(posMaxText);
    const negMax = parseFloat(
      container.querySelector('.extremeNegativeRange').textContent.trim()
    );

    if ([negMin, posMin, posMax, negMax].some(v => !isFinite(v))) return;

    // clamp valore fra negMin e negMax
    const clamped = Math.min(Math.max(value, negMin), negMax);

    // mappo su 0–100%
    let percent = (clamped - negMin) / (negMax - negMin) * 100;

    // se arriva a 100%, portalo a 90% per non farlo sbordare
    if (percent >= 100) percent = 95;

    // applico al marker (transform per centrarlo)
    indicator.style.position  = 'absolute';
    indicator.style.left      = `${percent.toFixed(1)}%`;
    indicator.style.transform = 'translateX(-50%)';

  } catch(e) {
    console.error('Errore aggiornando l’indicatore:', e, container);
  }
});
