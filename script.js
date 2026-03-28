// ============================================================
// API BASE URL
// ============================================================
const baseApiUrl = 'https://transportespadilla-backend-production.up.railway.app/vehicles';
const defaultLimit = 50;

// ============================================================
// FETCH LAYER — functions to call the API
// ============================================================
async function fetchVehicles() {
  const url = new URL(baseApiUrl);
  url.searchParams.set('limit', defaultLimit);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

async function fetchVehicleById(id) {
  const res = await fetch(`${baseApiUrl}/${id}`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

// ============================================================
// PERFORMANCE CONCEPT 1 — DEBOUNCE
// What: delays executing a function until the user STOPS firing
//       the event for N milliseconds.
// When to use: search inputs, resize handlers, form validation.
// ============================================================
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);          // cancel the previous pending call
    timer = setTimeout(() => {    // schedule a NEW call
      fn.apply(this, args);
    }, delay);
  };
}

// ============================================================
// PERFORMANCE CONCEPT 2 — THROTTLE
// What: ensures a function runs AT MOST once every N milliseconds,
//       no matter how many times the event fires.
// When to use: scroll events, button rapid-clicks, window resize.
// ============================================================
function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {   // only run if enough time passed
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// ============================================================
// PERFORMANCE CONCEPT 3 — LAZY LOADING
// What: loads content (images, cards) only when they enter
//       the visible area (viewport), using IntersectionObserver.
// When to use: long lists, image-heavy pages, infinite scroll.
// ============================================================
function lazyObserver() {
  return new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // swap data-src → src to trigger the real image load
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
        }
        el.classList.remove('opacity-0');
        el.classList.add('opacity-100', 'transition-opacity', 'duration-500');
        observer.unobserve(el);      // stop watching once loaded
      }
    });
  }, { threshold: 0.1 });           // trigger when 10 % visible
}

// ============================================================
// DOM helpers
// ============================================================
const grid        = document.getElementById('vehicle-grid');
const searchInput = document.getElementById('search-input');
const debounceLog = document.getElementById('debounce-log');
const throttleLog = document.getElementById('throttle-log');
const lazyLog     = document.getElementById('lazy-log');
const scrollBox   = document.getElementById('scroll-box');

let allVehicles = [];
const observer  = lazyObserver();

// Render vehicle cards into the grid
function renderCards(vehicles) {
  grid.innerHTML = '';
  if (vehicles.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-slate-400 text-sm font-medium">No se encontraron vehículos.</p>';
    return;
  }

  vehicles.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'rounded-lg overflow-hidden flex flex-col gap-3';

    // Lazy-loaded placeholder image
    const img = document.createElement('img');
    img.dataset.src = v.photoUrl || `https://picsum.photos/seed/${v.idVehicle || i}/400/200`;
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="14"%3ECargando...%3C/text%3E%3C/svg%3E';
    img.alt = `${v.brand || 'Vehicle'} ${v.model || ''}`.trim();
    img.className = 'w-full h-40 object-cover opacity-0';
    observer.observe(img);   // <-- LAZY LOADING registered here

    const identifier = document.createElement('p');
    identifier.className = 'vehicle-id px-4 pt-3';
    identifier.textContent = v.identifier || `Vehículo #${v.idVehicle || i + 1}`;

    const title = document.createElement('h3');
    title.className = 'vehicle-title px-4';
    title.textContent = `${v.brand || 'Marca desconocida'} ${v.model || ''}`.trim();

    const detail = document.createElement('p');
    detail.className = 'vehicle-detail px-4 pb-4';
    detail.textContent = v.plate || 'Sin placa';

    card.append(img, identifier, title, detail);
    grid.appendChild(card);
  });

  lazyLog.textContent = `Lazy loading: ${vehicles.length} imágenes registradas con IntersectionObserver — las imágenes se cargan mientras desplazas.`;
  lazyLog.classList.add('active-green');
}

// Filter vehicles by search term
function filterVehicles(term) {
  const lower = term.toLowerCase();
  return allVehicles.filter(v => {
    const identifier = (v.identifier || '').toLowerCase();
    const plate = (v.plate || '').toLowerCase();
    return identifier.includes(lower) || plate.includes(lower);
  });
}

// ============================================================
// DEBOUNCE in action — search input
// The API filter only runs 400 ms after the user STOPS typing.
// ============================================================
const handleSearch = debounce((term) => {
  const results = filterVehicles(term);
  renderCards(results);
  debounceLog.classList.add('active-blue');
  debounceLog.textContent =
    `¡Debounce ejecutado! Búsqueda de "${term}" → ${results.length} resultados. (esperó 400 ms después de que dejaste de escribir)`;
}, 400);

searchInput.addEventListener('input', (e) => {
  debounceLog.classList.remove('active-blue');
  debounceLog.textContent = 'Debounce: esperando a que dejes de escribir...';
  handleSearch(e.target.value);
});

// ============================================================
// THROTTLE in action — scroll inside the log box
// The scroll handler runs at most once every 300 ms.
// ============================================================
let scrollCount = 0;
const handleScroll = throttle(() => {
  scrollCount++;
  throttleLog.classList.add('active-orange');
  throttleLog.textContent =
    `¡Throttle ejecutado! Evento de scroll #${scrollCount} procesado. (máx. 1 cada 300 ms, eventos extra ignorados)`;
}, 300);

scrollBox.addEventListener('scroll', handleScroll);

// ============================================================
// INITIAL LOAD — fetch all vehicles on page ready
// ============================================================
async function init() {
  grid.innerHTML = '<p class="col-span-full text-center text-slate-400 animate-pulse text-sm font-medium">Cargando vehículos...</p>';
  try {
    allVehicles = await fetchVehicles();
    // Normalise: accept array or { data: [...] } shape
    if (!Array.isArray(allVehicles)) {
      allVehicles = allVehicles.data || allVehicles.vehicles || Object.values(allVehicles);
    }
    renderCards(allVehicles);
  } catch (err) {
    grid.innerHTML = `<p class="col-span-full text-center text-red-600 font-medium">Error: ${err.message}</p>`;
  }
}

init();