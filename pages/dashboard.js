import { get, del } from "../api.js";
import { escapeHtml, formatPrice } from "./home.js";

export async function renderDashboard(app, user) {
  if (!user) {
    app.innerHTML = `<div class="text-center py-20">Not logged in.</div>`;
    return;
  }

  // Fetch properties this user created
  const data = await get("/properties/");
  const all = data.results || [];

  // Filter to this user's (if agent). If superuser, show all.
  const mine = user.is_superuser
    ? all
    : all.filter((p) => p.created_by === user.id);

  let rows = "";
  if (mine.length === 0) {
    rows = `<tr><td colspan="4" class="text-center text-gray-500 py-6">No listings yet.</td></tr>`;
  } else {
    rows = mine
      .map(
        (p) => `
      <tr class="border-b">
        <td class="py-2">${escapeHtml(p.title)}</td>
        <td class="py-2">${escapeHtml(p.municipality_name || "—")}</td>
        <td class="py-2">${formatPrice(p.price)}</td>
        <td class="py-2 text-right">
          <a href="#/properties/${p.id}" class="text-emerald-600 text-sm hover:underline mr-3">View</a>
          <button data-id="${p.id}" class="delete-btn text-rose-600 text-sm hover:underline">Delete</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  app.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="text-sm text-gray-500">Signed in as ${escapeHtml(user.username)}${user.is_superuser ? " (superuser)" : ""}</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-3">Title</th>
            <th class="py-2 px-3">Municipality</th>
            <th class="py-2 px-3">Price</th>
            <th class="py-2 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="mt-4 text-sm text-gray-500">
      Creating, editing, and file uploads can be added later — this dashboard is read + delete for now.
    </div>
  `;

  // Delete handler
  app.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Delete this listing?")) return;
      try {
        await del(`/properties/${id}/`);
        await renderDashboard(app, user);
      } catch (err) {
        alert((err.data && JSON.stringify(err.data)) || "Delete failed.");
      }
    });
  });
}