import { get, post } from "../api.js";
import { escapeHtml } from "./home.js";

const statuses = [
  ["for_sale", "For sale"],
  ["for_lease", "For lease"],
  ["for_rent", "For rent"],
  ["sold", "Sold"],
];

export async function renderPropertyCreate(app) {
  const municipalities = await get("/municipalities/");
  const options = (municipalities.results || [])
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
    .join("");

  app.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <a href="#/dashboard" class="text-sm text-gray-500 hover:underline">← Back to dashboard</a>
      <h1 class="text-2xl font-bold my-4">Create listing</h1>
      <form id="property-create-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <label class="block text-sm font-medium">Title
          <input name="title" maxlength="120" required class="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label class="block text-sm font-medium">Municipality
          <select name="municipality" class="w-full border rounded px-3 py-2 mt-1">
            <option value="">Select municipality</option>${options}
          </select>
        </label>
        <label class="block text-sm font-medium">Address
          <input name="address" maxlength="255" class="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label class="block text-sm font-medium">Price
          <input name="price" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label class="block text-sm font-medium">Status
          <select name="status" class="w-full border rounded px-3 py-2 mt-1">
            ${statuses.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
          </select>
        </label>
        <label class="block text-sm font-medium">Description
          <textarea name="description" rows="5" class="w-full border rounded px-3 py-2 mt-1"></textarea>
        </label>
        <div id="create-feedback" role="status" class="text-sm"></div>
        <button class="bg-emerald-700 text-white px-4 py-2 rounded" type="submit">Create listing</button>
      </form>
    </div>
  `;

  const form = document.getElementById("property-create-form");
  const feedback = document.getElementById("create-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const price = data.get("price");
    const municipality = data.get("municipality");
    feedback.textContent = "Creating listing...";
    feedback.className = "text-sm text-gray-500";
    try {
      const property = await post("/properties/", {
        title: data.get("title"),
        municipality: municipality ? Number(municipality) : null,
        address: data.get("address"),
        price: price ? Number(price) : null,
        status: data.get("status"),
        description: data.get("description"),
      });
      location.hash = `#/properties/${property.id}/edit`;
    } catch (error) {
      feedback.textContent =
        (error.data && JSON.stringify(error.data)) || error.message || "Could not create listing.";
      feedback.className = "text-sm text-rose-600";
    }
  });
}
