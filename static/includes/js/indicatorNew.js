const ContainerIndicatori = document.querySelectorAll(".indicator-container");

ContainerIndicatori.forEach((element) => {
  try {
    // Elaborazione di ogni elemento
    const indicatorContainer = element.querySelector(".indicator-content-container");
    const indicator = element.querySelector(".indicatore");
    const valoreEsame = parseFloat(indicator?.getAttribute("data-value") || 0);

    // Recupera gli elementi con i valori di riferimento
    const containerRangePositive = indicatorContainer.querySelector(".positiveTesto");
    const rangePositiveIndicator = containerRangePositive?.querySelectorAll("p") || [];
    let minPositive = rangePositiveIndicator[0]?.textContent.trim();
    let maxPositive = rangePositiveIndicator[1]?.textContent.trim();

    // Gestione del valore ">0"
    if (minPositive === ">0") {
      minPositive = 0.1; // Sostituisci con un valore numerico appropriato
    }

    // Converti in numeri per i calcoli
    minPositive = parseFloat(minPositive);
    maxPositive = parseFloat(maxPositive);

    const rangeNegativeIndicator = parseFloat(
      element.querySelector(".negativeTesto")?.textContent.split(" ")[0] || 0
    );
    const extremeRightRangeIndicator = parseFloat(
      element.querySelector(".extremeNegativeRange")?.textContent.split(" ")[1] || 0
    );

    // Verifica se ci sono dati mancanti o non validi
    if (isNaN(valoreEsame) || isNaN(minPositive) || isNaN(maxPositive)) {
      /* console.warn("Dati mancanti o non validi:", {
        valoreEsame,
        minPositive,
        maxPositive,
        rangeNegativeIndicator,
        extremeRightRangeIndicator,
      });
      return; */
    }

    // Calcola la posizione dell'indicatore
    if (
      valoreEsame >= minPositive &&
      valoreEsame <= maxPositive
    ) {
      const percentuale = ((valoreEsame - minPositive) / (maxPositive - minPositive)) * 30 + 26;
      indicator.style.left = `${Math.round(percentuale)}%`;
    } else if (valoreEsame < minPositive) {
      const percentuale = ((valoreEsame - rangeNegativeIndicator) / (minPositive - rangeNegativeIndicator)) * 30 - 4;
      indicator.style.left = `${Math.max(Math.round(percentuale), 0)}%`;
    } else if (valoreEsame > maxPositive) {
      const percentuale = ((valoreEsame - maxPositive) / (extremeRightRangeIndicator - maxPositive)) * 30 + 66;
      indicator.style.left = `${Math.min(Math.round(percentuale), 100)}%`;
    } else {
      console.warn("Caso non gestito per valoreEsame:", valoreEsame);
    }


  } catch (error) {
    /* console.error("Errore durante l'elaborazione:", error, element); */
  }
});

