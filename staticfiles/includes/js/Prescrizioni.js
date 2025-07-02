import { renderingRisultati } from './fetchDatiArchivio.js';

let arrayFoglio1 = [];


async function populateDropdown() {
    const data = await renderingRisultati();
    arrayFoglio1 = data[0].Foglio1; 

    const menuTendinaModale = document.getElementById("menu_tendina_prescrizioni");
    menuTendinaModale.innerHTML = '';

    const placeholderOption = document.createElement("option");
    placeholderOption.value = ""; 
    placeholderOption.textContent = "Seleziona esame";
    placeholderOption.selected = true; 
    menuTendinaModale.appendChild(placeholderOption);

    arrayFoglio1.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.DESCRIZIONE_ESAME;
        option.textContent = item.DESCRIZIONE_ESAME;
        menuTendinaModale.appendChild(option);
    });
}

async function populateResults(filteredData = null) {
    if (!filteredData) {
        const data = await renderingRisultati();
        arrayFoglio1 = data[0].Foglio1; 
        filteredData = arrayFoglio1;
    }

    const resultContainer = document.querySelector(".Modale-Result-content");
    const queueContainer = document.querySelector(".conteiner-CodaPrescrizioni");

    resultContainer.innerHTML = '';

    filteredData.forEach((item) => {
        const row = document.createElement("div");
        row.classList.add("rowModale");

        let rowContent = `
            <div class="colModale">${item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || ''}</div>
            <div class="colModale nomeEsame">${item.DESCRIZIONE_ESAME || ''}</div>
            <div class="colModale">${item.COD_ASL ? `${item.COD_ASL} <span> (cod. asl) </span>` : ''}</div>
            <div class="colModale">${item.COD_REG ? `${item.COD_REG}<span> (cod. reg)</span>` : ''}</div>
            <div class="colModale metodica">${item.METODICA || ''}</div>
            <div class="colModale">
                <button class="add-btn" data-id="${item.id}" data-nome="${item.DESCRIZIONE_ESAME}" data-codice="${item.CODICE_UNIVOCO_ESAME_PIATTAFORMA || ''}" data-asl="${item.COD_ASL || ''}" data-reg="${item.COD_REG || ''}" data-metodica="${item.METODICA || ''}">➕</button>
            </div>
        `;

        row.innerHTML = rowContent;
        resultContainer.appendChild(row);
    });

    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const esameId = event.target.getAttribute("data-id");
            const esameNome = event.target.getAttribute("data-nome");
            const esameCodice = event.target.getAttribute("data-codice");
            const esameAsl = event.target.getAttribute("data-asl");
            const esameReg = event.target.getAttribute("data-reg");
            const esameMetodica = event.target.getAttribute("data-metodica");

            const codaItem = document.createElement("div");
            codaItem.classList.add("rowModale", "coda-item");
            codaItem.setAttribute("data-id", esameId);
            codaItem.innerHTML = `
                <div class="colModale" name="codiceEsame">${esameCodice}</div>
                <input type="hidden" id="codiceEsameInput" name="codiceEsame" value="${esameCodice}">
                <div class="colModale nomeEsame">${esameNome}</div>
                <div class="colModale">${esameAsl ? `${esameAsl} (cod. asl)` : ''}</div>
                <div class="colModale">${esameReg ? `${esameReg} (cod. reg)` : ''}</div>
                <div class="colModale metodica">${esameMetodica}</div>
                <div class="colModale">
                    <button class="remove-btn">❌</button>
                </div>
            `;

            queueContainer.appendChild(codaItem);

            codaItem.querySelector(".remove-btn").addEventListener("click", () => {
                codaItem.remove();
            });
        });
    });
}


function filterResults() {
    console.log("Filtraggio in corso...");

    const searchText = document.querySelector(".barra-ricercaModale input").value.toLowerCase();
    const selectedFilter = document.querySelector(".ModaleHeader select").value;

    let filteredData = arrayFoglio1.filter(item => {
        if (!searchText) return true;

        return (
            item.DESCRIZIONE_ESAME?.toLowerCase().includes(searchText) ||
            item.METODICA?.toLowerCase().includes(searchText) ||
            item.COD_ASL?.toString().toLowerCase().includes(searchText) ||
            item.COD_REG?.toString().toLowerCase().includes(searchText)
        );
    });

    switch (selectedFilter) {
        case "1": 
            filteredData.sort((a, b) => a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME));
            break;

        case "2":
            filteredData.sort((a, b) => b.DESCRIZIONE_ESAME.localeCompare(a.DESCRIZIONE_ESAME));
            break;

        case "3": 
            filteredData.sort((a, b) => (a.METODICA || "").localeCompare(b.METODICA || "") || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME));
            break;

        case "4": 
            filteredData.sort((a, b) => (a.COD_ASL?.toString() || "").localeCompare(b.COD_ASL?.toString() || "") || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME));
            break;

        case "5":
            filteredData.sort((a, b) => (a.COD_REG?.toString() || "").localeCompare(b.COD_REG?.toString() || "") || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME));
            break;

        case "6": 
            filteredData.sort((a, b) => (a.COD_REG?.toString() || "").localeCompare(b.COD_REG?.toString() || "") || a.DESCRIZIONE_ESAME.localeCompare(b.DESCRIZIONE_ESAME));
            break;

        default:
            break;
    }

    populateResults(filteredData);
}


function selectSingleResult() {
    const selectedValue = document.getElementById("menu_tendina_prescrizioni").value;

    if (selectedValue) {
        const selectedItem = arrayFoglio1.find(item => item.DESCRIZIONE_ESAME === selectedValue);
        populateResults(selectedItem ? [selectedItem] : []);
    } else {
        populateResults();
    }
}


document.querySelector(".barra-ricercaModale input").addEventListener("input", filterResults);
document.querySelector(".ModaleHeader select").addEventListener("change", filterResults);
document.getElementById("menu_tendina_prescrizioni").addEventListener("change", selectSingleResult);

// Avvio delle funzioni iniziali
populateDropdown();
populateResults();
