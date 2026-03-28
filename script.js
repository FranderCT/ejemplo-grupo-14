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
    grid.innerHTML = '<p class="col-span-full text-center text-gray-500">No vehicles found.</p>';
    return;
  }

  vehicles.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow p-4 flex flex-col gap-3';

    // Lazy-loaded placeholder image
    const img = document.createElement('img');
    img.dataset.src = v.photoUrl || `https://picsum.photos/seed/${v.idVehicle || i}/400/200`;
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ELoading...%3C/text%3E%3C/svg%3E';
    img.alt = `${v.brand || 'Vehicle'} ${v.model || ''}`.trim();
    img.className = 'w-full h-36 object-cover rounded-xl opacity-0';
    observer.observe(img);   // <-- LAZY LOADING registered here

    const identifier = document.createElement('p');
    identifier.className = 'text-xs font-semibold uppercase tracking-[0.2em] text-blue-600';
    identifier.textContent = v.identifier || `Vehicle #${v.idVehicle || i + 1}`;

    const title = document.createElement('h3');
    title.className = 'font-semibold text-gray-800 text-lg';
    title.textContent = `${v.brand || 'Unknown brand'} ${v.model || ''}`.trim();

    const detail = document.createElement('p');
    detail.className = 'text-sm text-gray-500';
    detail.textContent = v.plate || 'No plate';

    card.append(img, identifier, title, detail);
    grid.appendChild(card);
  });

  lazyLog.textContent = `Lazy loading: ${vehicles.length} images registered with IntersectionObserver — images load as you scroll into view.`;
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
  debounceLog.textContent =
    `Debounce fired! Searched "${term}" → ${results.length} results. (waited 400 ms after you stopped typing)`;
}, 400);

searchInput.addEventListener('input', (e) => {
  debounceLog.textContent = 'Debounce: waiting for you to stop typing...';
  handleSearch(e.target.value);
});

// ============================================================
// THROTTLE in action — scroll inside the log box
// The scroll handler runs at most once every 300 ms.
// ============================================================
let scrollCount = 0;
const handleScroll = throttle(() => {
  scrollCount++;
  throttleLog.textContent =
    `Throttle fired! Scroll event #${scrollCount} processed. (max 1 per 300 ms, extra events ignored)`;
}, 300);

scrollBox.addEventListener('scroll', handleScroll);

// ============================================================
// INITIAL LOAD — fetch all vehicles on page ready
// ============================================================
async function init() {
  grid.innerHTML = '<p class="col-span-full text-center text-gray-400 animate-pulse">Fetching vehicles...</p>';
  try {
    allVehicles = await fetchVehicles();
    // Normalise: accept array or { data: [...] } shape
    if (!Array.isArray(allVehicles)) {
      allVehicles = allVehicles.data || allVehicles.vehicles || Object.values(allVehicles);
    }
    renderCards(allVehicles);
  } catch (err) {
    grid.innerHTML = `<p class="col-span-full text-center text-red-500">Error: ${err.message}</p>`;
  }
}

init();
