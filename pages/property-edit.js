import { del, get, patch, post } from "../api.js";
import { escapeHtml } from "./home.js";

const statuses = [
  ["for_sale", "For sale"],
  ["for_lease", "For lease"],
  ["for_rent", "For rent"],
  ["sold", "Sold"],
];

export async function renderPropertyEdit(app, id) {
  const property = await get(`/properties/${id}/`);
  const statusOptions = statuses
    .map(
      ([value, label]) =>
        `<option value="${value}" ${property.status === value ? "selected" : ""}>${label}</option>`
    )
    .join("");

  app.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <a href="#/dashboard" class="text-sm text-gray-500 hover:underline">← Back to dashboard</a>
      <h1 class="text-2xl font-bold my-4">Edit listing</h1>
      <form id="property-edit-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <label class="block text-sm font-medium">Title
          <input name="title" type="text" maxlength="120" required value="${escapeHtml(property.title)}" class="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label class="block text-sm font-medium">Address
          <input name="address" type="text" maxlength="255" value="${escapeHtml(property.address || "")}" class="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label class="block text-sm font-medium">Price
          <input name="price" type="number" min="0" step="0.01" value="${property.price ?? ""}" class="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <label class="block text-sm font-medium">Status
          <select name="status" class="w-full border rounded px-3 py-2 mt-1">${statusOptions}</select>
        </label>
        <label class="block text-sm font-medium">Description
          <textarea name="description" rows="5" class="w-full border rounded px-3 py-2 mt-1">${escapeHtml(property.description || "")}</textarea>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input name="is_featured" type="checkbox" ${property.is_featured ? "checked" : ""} />
          Featured listing
        </label>
        <div id="property-edit-feedback" class="text-sm" role="status"></div>
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Save changes</button>
      </form>

      <section class="mt-6 bg-white rounded-lg shadow p-5">
        <h2 class="text-lg font-bold mb-1">Listing photos</h2>
        <p class="text-sm text-gray-500 mb-4">Add photos or remove existing ones.</p>
        <div id="property-images" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"></div>
        <form id="image-upload-form" class="flex flex-col sm:flex-row sm:items-center gap-3">
          <label class="min-w-0 flex-1 text-sm">Add photos
            <input name="images" type="file" accept="image/*" multiple class="block mt-1" />
          </label>
          <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Upload photos</button>
        </form>
        <div id="image-feedback" class="text-sm mt-3" role="status" aria-live="polite"></div>
      </section>
    </div>
  `;

  const form = document.getElementById("property-edit-form");
  const feedback = document.getElementById("property-edit-feedback");
  const imageList = document.getElementById("property-images");
  const imageForm = document.getElementById("image-upload-form");
  const imageFeedback = document.getElementById("image-feedback");

  function renderImages() {
    imageList.innerHTML = property.images.length
      ? property.images
          .map(
            (image) => `
              <div class="relative overflow-hidden rounded border border-gray-200">
                <img src="${escapeHtml(image.image)}" alt="${escapeHtml(property.title)}" class="h-36 w-full object-cover" loading="lazy" />
                <button type="button" data-image-id="${image.id}" aria-label="Remove photo ${image.id} from ${escapeHtml(property.title)}" class="absolute top-2 right-2 bg-white/95 text-rose-700 text-xs px-2 py-1 rounded shadow hover:bg-white">Remove</button>
              </div>
            `
          )
          .join("")
      : `<p class="col-span-full text-sm text-gray-500">No photos added yet.</p>`;

    imageList.querySelectorAll("[data-image-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const imageId = button.getAttribute("data-image-id");
        if (!confirm("Remove this photo from the listing?")) return;

        button.disabled = true;
        imageFeedback.textContent = "Removing photo...";
        imageFeedback.className = "text-sm mt-3 text-gray-500";
        try {
          await del(`/property-images/${imageId}/`);
          property.images = property.images.filter(
            (image) => String(image.id) !== imageId
          );
          renderImages();
          imageFeedback.textContent = "Photo removed.";
          imageFeedback.className = "text-sm mt-3 text-emerald-600";
        } catch (error) {
          button.disabled = false;
          imageFeedback.textContent =
            (error.data && JSON.stringify(error.data)) ||
            error.message ||
            "Could not remove photo.";
          imageFeedback.className = "text-sm mt-3 text-rose-600";
        }
      });
    });
  }

  renderImages();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "Saving...";
    feedback.className = "text-sm text-gray-500";

    const formData = new FormData(form);
    const price = formData.get("price");
    const payload = {
      title: formData.get("title"),
      address: formData.get("address"),
      price: price === "" ? null : Number(price),
      status: formData.get("status"),
      description: formData.get("description"),
      is_featured: formData.has("is_featured"),
    };

    try {
      await patch(`/properties/${id}/`, payload);
      feedback.textContent = "Listing updated.";
      feedback.className = "text-sm text-emerald-600";
    } catch (error) {
      feedback.textContent =
        (error.data && JSON.stringify(error.data)) || error.message || "Could not update listing.";
      feedback.className = "text-sm text-rose-600";
    }
  });

  imageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fileInput = imageForm.elements.namedItem("images");
    const files = Array.from(fileInput.files || []);
    if (files.length === 0) {
      imageFeedback.textContent = "Choose one or more photos to upload.";
      imageFeedback.className = "text-sm mt-3 text-rose-600";
      return;
    }

    const uploadButton = imageForm.querySelector("button");
    uploadButton.disabled = true;
    imageFeedback.textContent = `Uploading 0 of ${files.length} photos...`;
    imageFeedback.className = "text-sm mt-3 text-gray-500";
    let uploaded = 0;

    try {
      for (const file of files) {
        const body = new FormData();
        body.append("image", file);
        const image = await post(`/properties/${id}/images/`, body, {
          isForm: true,
        });
        property.images.push(image);
        uploaded += 1;
        imageFeedback.textContent = `Uploading ${uploaded} of ${files.length} photos...`;
        renderImages();
      }

      fileInput.value = "";
      imageFeedback.textContent = `${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded.`;
      imageFeedback.className = "text-sm mt-3 text-emerald-600";
    } catch (error) {
      fileInput.value = "";
      imageFeedback.textContent =
        `${uploaded} of ${files.length} photos uploaded. Reselect any remaining photos and try again. ` +
        ((error.data && JSON.stringify(error.data)) ||
          error.message ||
          "The next photo could not be uploaded.");
      imageFeedback.className = "text-sm mt-3 text-rose-600";
    } finally {
      uploadButton.disabled = false;
    }
  });
}
