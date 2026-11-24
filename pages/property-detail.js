import { get, post } from "../api.js";
import { escapeHtml, formatPrice } from "./home.js";

export async function renderPropertyDetail(app, id) {
  const p = await get(`/properties/${id}/`, { auth: false });

  const images = (p.images || [])
    .map(
      (img) =>
        `<button type="button" class="property-image" aria-label="View image of ${escapeHtml(p.title)}"><img src="${img.image}" alt="${escapeHtml(p.title)}" class="thumb" loading="lazy" /></button>`
    )
    .join("");
  const agentCard = p.agent
    ? `
      <section class="mt-10 border-t border-gray-200 pt-7">
        <h2 class="text-xl font-bold mb-4">Listed by</h2>
        <div class="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow p-5">
          ${
            p.agent.photo
              ? `<img src="${escapeHtml(p.agent.photo)}" alt="${escapeHtml(p.agent.name)}" class="w-24 h-24 rounded-full object-cover" loading="lazy" />`
              : `<div class="w-24 h-24 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl font-semibold">${escapeHtml((p.agent.name || "A").slice(0, 1))}</div>`
          }
          <div class="space-y-1">
            <h3 class="font-semibold text-lg">${escapeHtml(p.agent.name)}</h3>
            ${p.agent.title ? `<p class="text-sm text-gray-600">${escapeHtml(p.agent.title)}</p>` : ""}
            ${p.agent.email ? `<a class="block text-sm text-emerald-700 hover:underline" href="mailto:${escapeHtml(p.agent.email)}">${escapeHtml(p.agent.email)}</a>` : ""}
            ${p.agent.phone ? `<a class="block text-sm text-emerald-700 hover:underline" href="tel:${escapeHtml(p.agent.phone)}">${escapeHtml(p.agent.phone)}</a>` : ""}
            ${p.agent.bio ? `<p class="text-sm text-gray-600 mt-2">${escapeHtml(p.agent.bio).replace(/\n/g, "<br/>")}</p>` : ""}
          </div>
        </div>
      </section>
    `
    : "";

  app.innerHTML = `
    <a href="#/listings" class="text-sm text-gray-500 hover:underline">← Back to listings</a>

    <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h1 class="text-2xl font-bold mb-1">${escapeHtml(p.title)}</h1>
        <div class="text-gray-500 mb-3">${escapeHtml(p.municipality_name || "")} · ${escapeHtml(p.address || "")}</div>
        <div class="text-2xl text-emerald-600 font-bold mb-2">${formatPrice(p.price)}</div>
        <div class="text-sm text-gray-500 mb-4">${escapeHtml(p.status_label)}</div>
        ${
          p.description
            ? `<div class="mb-4"><p>${escapeHtml(p.description).replace(/\n/g, "<br/>")}</p></div>`
            : ""
        }
        <div class="grid grid-cols-2 gap-2 mt-4">
          ${images || `<div class="col-span-2 text-gray-400">No images</div>`}
        </div>
      </div>

      <div>
        <div class="bg-white rounded-lg shadow p-4 sticky top-20">
          <h2 class="font-bold text-lg mb-3">Book a Viewing</h2>
          <form id="booking-form" class="space-y-3">
            <input name="name" required placeholder="Your name" class="w-full border rounded px-3 py-2" />
            <input name="email" type="email" required placeholder="Your email" class="w-full border rounded px-3 py-2" />
            <input name="requested_date" type="date" required class="w-full border rounded px-3 py-2" />
            <textarea name="message" rows="3" placeholder="Message (optional)" class="w-full border rounded px-3 py-2"></textarea>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" name="send_whatsapp" value="1" />
              Also send via WhatsApp
            </label>
            <button type="submit" class="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">Send Booking Request</button>
            <div id="booking-feedback" class="text-sm"></div>
          </form>
        </div>
      </div>
    </div>

    ${agentCard}

    <dialog id="image-viewer" class="image-viewer" aria-label="Image preview">
      <button type="button" class="image-viewer__close" aria-label="Close image viewer">&times;</button>
      <img class="image-viewer__image" alt="" />
    </dialog>
  `;

  const viewer = document.getElementById("image-viewer");
  const viewerImage = viewer.querySelector(".image-viewer__image");

  app.querySelectorAll(".property-image").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      viewerImage.src = image.src;
      viewerImage.alt = image.alt;
      viewer.showModal();
    });
  });

  viewer
    .querySelector(".image-viewer__close")
    .addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });

  const form = document.getElementById("booking-form");
  const feedback = document.getElementById("booking-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "Sending...";
    feedback.className = "text-sm text-gray-500";

    const fd = new FormData(form);
    const payload = {
      property: parseInt(id, 10),
      name: fd.get("name"),
      email: fd.get("email"),
      requested_date: fd.get("requested_date"),
      message: fd.get("message") || "",
      send_whatsapp: fd.get("send_whatsapp") === "1",
    };

    try {
      const res = await post("/bookings/", payload, { auth: false });
      let html = `<div class="text-emerald-600 font-semibold">Booking request sent!</div>`;
      if (res.wa_url) {
        html += `<a href="${res.wa_url}" target="_blank" rel="noopener" class="text-blue-600 underline block mt-1">Open WhatsApp →</a>`;
      }
      feedback.innerHTML = html;
      form.reset();
    } catch (err) {
      feedback.className = "text-sm text-rose-600";
      feedback.textContent = (err.data && JSON.stringify(err.data)) || "Something went wrong.";
    }
  });
}