import { get } from "../api.js";
import { escapeHtml, formatPrice } from "./home.js";

export async function renderListings(app) {
  const hash = location.hash;
  const qs = hash.includes("?") ? new URLSearchParams(hash.split("?")[1]) : new URLSearchParams();
  const page = parseInt(qs.get("page") || "1", 10);
  const municipalityFilter = qs.get("municipality") || "";

  const [props, munis] = await Promise.all([
    get(`/properties/?page=${page}${municipalityFilter ? `&municipality=${municipalityFilter}` : ""}`, { auth: false }),
    get("/municipalities/", { auth: false }),
  ]);

  const results = props.results || [];
  const municipalities = munis.results || [];

  let options = `<option value="">All municipalities</option>`;
  for (const m of municipalities) {
    options += `<option value="${m.id}" ${String(m.id) === municipalityFilter ? "selected" : ""}>${escapeHtml(m.name)}</option>`;
  }

  let grid = "";
  if (results.length === 0) {
    grid = `<div class="col-span-full text-center text-gray-500 py-8">No listings found.</div>`;
  } else {
    grid = results
      .map(
        (p) => `
      <a href="#/properties/${p.id}" class="card-hover block bg-white rounded-lg shadow overflow-hidden">
        ${
          p.primary_image
            ? `<img src="${p.primary_image}" alt="${escapeHtml(p.title)}" class="thumb" loading="lazy" />`
            : `<div class="thumb flex items-center justify-center text-gray-400">No image</div>`
        }
        <div class="p-3">
          <div class="font-semibold truncate">${escapeHtml(p.title)}</div>
          <div class="text-sm text-gray-500 truncate">${escapeHtml(p.municipality_name || p.address || "")}</div>
          <div class="text-emerald-600 font-bold mt-1">${formatPrice(p.price)}</div>
          <div class="text-xs text-gray-400 mt-1">${escapeHtml(p.status_label)}</div>
        </div>
      </a>
    `
      )
      .join("");
  }

  const hasNext = !!props.next;
  const hasPrev = !!props.previous;

  app.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
      <h1 class="text-2xl font-bold">Listings</h1>
      <div class="flex items-center gap-2">
        <label class="text-sm">Municipality:</label>
        <select id="muni-select" class="border rounded px-2 py-1 text-sm">${options}</select>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">${grid}</div>

    <div class="flex items-center justify-between mt-6">
      <button id="prev-btn" class="px-3 py-1 border rounded disabled:opacity-40" ${hasPrev ? "" : "disabled"}>← Previous</button>
      <div class="text-sm text-gray-500">Page ${page} · ${props.count} total</div>
      <button id="next-btn" class="px-3 py-1 border rounded disabled:opacity-40" ${hasNext ? "" : "disabled"}>Next →</button>
    </div>
  `;

  document.getElementById("muni-select").addEventListener("change", (e) => {
    const v = e.target.value;
    location.hash = `#/listings?page=1${v ? `&municipality=${v}` : ""}`;
  });
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (hasPrev) location.hash = `#/listings?page=${page - 1}${municipalityFilter ? `&municipality=${municipalityFilter}` : ""}`;
  });
  document.getElementById("next-btn").addEventListener("click", () => {
    if (hasNext) location.hash = `#/listings?page=${page + 1}${municipalityFilter ? `&municipality=${municipalityFilter}` : ""}`;
  });
}