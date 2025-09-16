// /static/js/resilienza-modal.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const protocolSelect = $('#protocollo-select');
  const testPicker = $('#test-picker');
  const placeholder = $('#placeholder-msg');
  const cardsContainer = $('#cards-container');
  const kpi = $('#resilienza-kpi');
  const saveBtn = $('#save-btn');

  const cards = {
    hrv: $('[data-card="hrv"]'),
    bp: $('[data-card="bp"]'),
    holter: $('[data-card="holter"]'),
  };

  // 1) all’avvio: solo select + placeholder
  initHidden();

  function initHidden() {
    testPicker.style.display = 'none';
    cardsContainer.style.display = 'none';
    kpi.style.display = 'none';
    Object.values(cards).forEach((el) => (el.style.display = 'none'));
    $$('.test-check').forEach((c) => (c.checked = false));
    toggleSave(false);
  }

  // 2) cambio protocollo
  protocolSelect?.addEventListener('change', () => {
    const hasProtocol = !!protocolSelect.value;
    placeholder.style.display = hasProtocol ? 'none' : 'flex';
    testPicker.style.display = hasProtocol ? 'flex' : 'none';
    cardsContainer.style.display = hasProtocol ? 'grid' : 'none';
    kpi.style.display = hasProtocol ? '' : 'none';

    if (!hasProtocol) {
      Object.values(cards).forEach((el) => (el.style.display = 'none'));
      $$('.test-check').forEach((c) => (c.checked = false));
      toggleSave(false);
    } else {
      // notifica eventuale logica dei pesi
      window.onResilienzaProtocolChange?.(protocolSelect.value);
    }
    triggerRecalc();
  });

  // 3) selezione card (max 3)
  document.addEventListener('change', (ev) => {
    if (!ev.target.classList?.contains('test-check')) return;
    const selected = $$('.test-check').filter((c) => c.checked);
    if (selected.length > 3) {
      ev.target.checked = false;
      warn('Puoi selezionare al massimo 3 card.');
      return;
    }
    const key = ev.target.value; // 'hrv' | 'bp' | 'holter'
    showCard(key, ev.target.checked);
    toggleSave($$('.test-check').some((c) => c.checked));
    triggerRecalc();
  });

  // 4) input → ricalcolo
  document
    .querySelectorAll('.modale-misurazione section[data-card] input')
    .forEach((inp) =>
      inp.addEventListener('input', debounce(triggerRecalc, 120))
    );

  function showCard(key, visible) {
    const el = cards[key];
    if (!el) return;
    el.style.display = visible ? '' : 'none';
  }

  function toggleSave(enable) {
    saveBtn.disabled = !enable;
  }

  function triggerRecalc() {
    const state = getCurrentState();
    if (typeof window.updateResilienzaScores === 'function') {
      window.updateResilienzaScores(state);
    } else {
      // placeholder semplice
      const s = simpleScore(state);
      renderKPI(s);
    }
  }

  function getCurrentState() {
    const protocol = protocolSelect?.value || null;
    const activeCards = Object.entries(cards)
      .filter(([, el]) => el && el.style.display !== 'none')
      .map(([k]) => k);

    const values = {};
    $$('.modale-misurazione section[data-card] input').forEach((i) => {
      if (!i.name) return;
      values[i.name] = i.value === '' ? null : Number(i.value);
    });

    // selected_tests inviati dal form (checkbox)
    const selected = $$('.test-check')
      .filter((c) => c.checked)
      .map((c) => c.value);

    return { protocol, activeCards, selected_tests: selected, values };
  }

  // Placeholder score (lasciare finché non colleghi l’algoritmo reale)
  function simpleScore(state) {
    const n = state.activeCards.length || 1;
    // media fittizia per mostrare il wiring
    const fake = 50 + Math.round(Math.min(40, n * 15));
    return { overall: fake, perTest: {} };
  }

  function renderKPI(score) {
    if (!kpi) return;
    kpi.dataset.overall = score?.overall ?? '';
    const overall = $('#kpi-overall');
    if (overall) overall.textContent = (score?.overall ?? '-') + '%';
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, a), ms);
    };
  }

  function warn(msg) {
    // sostituisci con il tuo sistema di toast
    console.warn(msg);
  }
})();





// --- MODALE "NUOVA MISURAZIONE" ---
const openBtn = document.getElementById('open-btn');
const closeBtn = document.getElementById('close-btn');
const modale   = document.getElementById('modale');
const backdrop = document.getElementById('backdrop');

if (modale && backdrop) {
  // nascondi inizialmente
  modale.style.display = 'none';
  backdrop.style.display = 'none';

  openBtn?.addEventListener('click', () => {
    modale.style.display = 'block';
    backdrop.style.display = 'block';
  });
  closeBtn?.addEventListener('click', () => {
    modale.style.display = 'none';
    backdrop.style.display = 'none';
  });
  backdrop?.addEventListener('click', () => {
    modale.style.display = 'none';
    backdrop.style.display = 'none';
  });
}

// --- MODALE "VIEW MORE" ---
const viewModal       = document.getElementById('view-modal');
const viewBackdrop    = document.getElementById('view-backdrop');
const viewCloseBtn    = document.getElementById('view-close-btn');
const viewModalContent= document.getElementById('view-modal-content');

function openViewModal(html) {
  if (!viewModal || !viewBackdrop || !viewModalContent) return;
  viewModalContent.innerHTML = html || '';
  viewModal.style.display = 'block';
  viewBackdrop.style.display = 'block';
}
function closeViewModal() {
  if (!viewModal || !viewBackdrop) return;
  viewModal.style.display = 'none';
  viewBackdrop.style.display = 'none';
  if (viewModalContent) viewModalContent.innerHTML = '';
}

viewCloseBtn?.addEventListener('click', closeViewModal);
viewBackdrop?.addEventListener('click', closeViewModal);

// delega click sui bottoni "View more"
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.btn-view-more');
  if (!btn) return;
  const id = btn.dataset.id;
  const payload = document.getElementById(`view-data-${id}`);
  if (!payload) return;
  openViewModal(payload.innerHTML);
});
