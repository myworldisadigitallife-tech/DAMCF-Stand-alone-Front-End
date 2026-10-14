import { get } from "../api.js";
import { escapeHtml } from "./home.js";

export async function renderAgents(app) {
  const data = await get("/agents/", { auth: false });
  const agents = data.results || [];

  let cards = "";
  if (agents.length === 0) {
    cards = `<div class="col-span-full text-center text-gray-500 py-8">No agents yet.</div>`;
  } else {
    cards = agents
      .map(
        (a) => `
      <div class="bg-white rounded-lg shadow p-4 text-center">
        ${
          a.photo
            ? `<img src="${a.photo}" alt="${escapeHtml(a.name)}" class="w-24 h-24 rounded-full mx-auto object-cover mb-3" loading="lazy" />`
            : `<div class="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3"></div>`
        }
        <div class="font-bold">${escapeHtml(a.name)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(a.title || "")}</div>
        ${a.email ? `<a href="mailto:${escapeHtml(a.email)}" class="text-xs text-emerald-600 mt-2 inline-block">${escapeHtml(a.email)}</a>` : ""}
        ${a.phone ? `<div class="text-xs text-gray-500 mt-1">${escapeHtml(a.phone)}</div>` : ""}
      </div>
    `
      )
      .join("");
  }

  app.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Our Agents</h1>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">${cards}</div>
  `;
}