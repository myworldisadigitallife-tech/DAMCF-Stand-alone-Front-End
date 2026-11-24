import { get, patch, post } from "../api.js";
import { escapeHtml } from "./home.js";

export async function renderServices(app, user = null) {
  const data = await get("/services/", { auth: !!user });
  const services = data.results || [];
  const canManage = Boolean(user?.is_agent || user?.is_superuser);
  const canEdit = (service) =>
    Boolean(user?.is_superuser || (user?.is_agent && service.created_by === user.id));

  const cards = services.length
    ? services
        .map(
          (service) => `
            <article class="bg-white shadow overflow-hidden">
              ${service.image ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.name)}" class="thumb" loading="lazy" />` : ""}
              <div class="p-4">
                <h2 class="font-bold mb-1">${escapeHtml(service.name)}</h2>
                <p class="text-sm text-gray-600 whitespace-pre-line">${escapeHtml(service.description || "")}</p>
                ${canEdit(service) ? `<button type="button" class="service-edit mt-3 text-emerald-700 underline" data-id="${service.id}">Edit</button>` : ""}
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="col-span-full text-center text-gray-500 py-8">No services yet.</div>`;

  app.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Services</h1>
    ${canManage ? `
      <form id="service-form" class="bg-white shadow p-5 mb-6 space-y-3">
        <h2 id="service-form-title" class="text-lg font-semibold">Add a service</h2>
        <input name="name" required maxlength="120" placeholder="Service name" class="w-full border px-3 py-2" />
        <textarea name="description" rows="3" placeholder="Description" class="w-full border px-3 py-2"></textarea>
        <input name="image" type="url" placeholder="Image URL (optional)" class="w-full border px-3 py-2" />
        <label class="flex items-center gap-2 text-sm"><input name="active" type="checkbox" checked /> Published</label>
        <div id="service-feedback" role="status" class="text-sm"></div>
        <button class="bg-emerald-700 text-white px-4 py-2" type="submit">Save service</button>
        <button id="service-cancel" class="px-4 py-2 border" type="button" hidden>Cancel edit</button>
      </form>` : ""}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">${cards}</div>
  `;

  if (!canManage) return;
  const form = document.getElementById("service-form");
  const feedback = document.getElementById("service-feedback");
  const cancel = document.getElementById("service-cancel");
  let editingId = null;
  const reset = () => {
    editingId = null;
    form.reset();
    form.elements.active.checked = true;
    document.getElementById("service-form-title").textContent = "Add a service";
    cancel.hidden = true;
  };
  cancel.addEventListener("click", reset);
  app.querySelectorAll(".service-edit").forEach((button) => {
    button.addEventListener("click", async () => {
      const service = services.find((item) => String(item.id) === button.dataset.id);
      if (!service) return;
      editingId = service.id;
      form.elements.name.value = service.name;
      form.elements.description.value = service.description || "";
      form.elements.image.value = service.image || "";
      form.elements.active.checked = service.active;
      document.getElementById("service-form-title").textContent = `Edit ${service.name}`;
      cancel.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const payload = {
      name: values.get("name"),
      description: values.get("description"),
      image: values.get("image") || null,
      active: values.has("active"),
    };
    feedback.textContent = "Saving...";
    feedback.className = "text-sm text-gray-500";
    try {
      if (editingId) await patch(`/services/${editingId}/`, payload);
      else await post("/services/", payload);
      await renderServices(app, user);
    } catch (error) {
      feedback.textContent =
        (error.data && JSON.stringify(error.data)) || error.message || "Could not save service.";
      feedback.className = "text-sm text-rose-600";
    }
  });
}
