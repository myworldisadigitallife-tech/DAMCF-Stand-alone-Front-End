import { get } from "../api.js";
import { escapeHtml } from "./home.js";

export async function renderServices(app) {
  const data = await get("/services/", { auth: false });
  const services = data.results || [];

  let cards = "";
  if (services.length === 0) {
    cards = `<div class="col-span-full text-center text-gray-500 py-8">No services yet.</div>`;
  } else {
    cards = services
      .map(
        (s) => `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        ${s.image ? `<img src="${s.image}" alt="${escapeHtml(s.name)}" class="thumb" loading="lazy" />` : ""}
        <div class="p-4">
          <div class="font-bold mb-1">${escapeHtml(s.name)}</div>
          <div class="text-sm text-gray-600 whitespace-pre-line">${escapeHtml(s.description || "")}</div>
        </div>
      </div>
    `
      )
      .join("");
  }

  app.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Services</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">${cards}</div>
  `;
}