import { get } from "../api.js";

export async function renderHome(app) {
  const data = await get("/properties/?is_featured=true", { auth: false });
  const properties = (data.results || []).slice(0, 6);

  let grid = "";
  if (properties.length === 0) {
    grid = `<div class="col-span-full text-center text-gray-500 py-8">No featured listings yet.</div>`;
  } else {
    grid = properties
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

  app.innerHTML = `
    <section class="text-center py-10">
      <h1 class="text-3xl md:text-4xl font-bold mb-3">Find your place in Siargao</h1>
      <p class="text-gray-600 mb-6">Real estate, property management, and business consultancy.</p>
      <a href="#/listings" class="inline-block bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700">Browse Listings</a>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-4">Featured Listings</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">${grid}</div>
    </section>
  `;
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatPrice(p) {
  if (p == null) return "Price on request";
  return "₱" + Number(p).toLocaleString();
}