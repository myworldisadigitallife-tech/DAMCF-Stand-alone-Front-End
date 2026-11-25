import { get, patch, post } from "../api.js";
import { escapeHtml } from "./home.js";

const serviceCategories = [
  {
    number: "01",
    title: "Real Estate Brokerage",
    description:
      "We provide professional real estate brokerage services, assisting clients in identifying, evaluating, and acquiring properties that meet their personal, commercial, or investment objectives.",
    image: "assets/services/real-estate-brokerage.jpg",
    imageAlt: "Modern residential villa with a swimming pool",
    items: [
      ["Residential Lots", "Assistance in buying and selling residential lots suitable for home construction, property development, and long-term investment."],
      ["Beachfront Properties", "Brokerage services for beachfront properties, offering opportunities for private residences, vacation homes, resorts, and tourism-related investments."],
      ["Commercial & Tourism Estates", "Assistance in acquiring commercial properties and tourism estates ideal for business operations, hospitality ventures, and property development."],
      ["Farmlands & Agribusiness", "Facilitation of farmland transactions and agricultural property investments for farming, agribusiness, and related ventures."],
    ],
  },
  {
    number: "02",
    title: "Documentation & Assistance",
    description:
      "We provide documentation support and coordination to help clients navigate property transactions, legal documentation, and ownership-related requirements efficiently.",
    image: "assets/services/documentation.jpg",
    imageAlt: "A person signing paperwork",
    items: [
      ["Title Transfer", "Assistance and coordination in processing property title transfers to facilitate the proper registration of ownership under the new owner's name."],
      ["Due Diligence", "Preliminary verification and review of property documents, ownership records, and relevant information to help identify potential issues before a transaction."],
      ["Deed of Sale Preparation", "Preparation and coordination of the necessary documentation for property sale and purchase transactions."],
      ["Extra-Judicial Settlement", "Assistance in coordinating documentation for the settlement and transfer of inherited properties through an extra-judicial settlement process."],
      ["SPA & Notarial Coordination", "Assistance in preparing Special Power of Attorney (SPA) documents and coordinating notarization requirements."],
    ],
  },
  {
    number: "03",
    title: "Property Appraisal",
    description:
      "We offer property valuation and market assessment services to help property owners, buyers, and investors understand the estimated value and market position of their real estate assets.",
    image: "assets/services/property-appraisal.jpg",
    imageAlt: "A model house and keys on a desk",
    items: [
      ["Market Appraisal", "Assessment of a property's estimated market value based on its location, characteristics, condition, and prevailing market conditions."],
      ["Comparative Market Analysis", "Evaluation of similar properties in the surrounding area to establish competitive pricing and determine appropriate market positioning."],
      ["Bank Loan Valuation", "Property valuation assistance for clients requiring estimated property values in connection with bank financing and loan applications."],
    ],
  },
  {
    number: "04",
    title: "Permits & Compliance",
    description:
      "We assist property owners, developers, and business operators in coordinating permits, clearances, and regulatory compliance requirements for property development and business operations.",
    image: "assets/services/permits-compliance.jpg",
    imageAlt: "Modern commercial buildings viewed from below",
    items: [
      ["Building Permit Assistance", "Assistance in coordinating documentation and application requirements for building permits before construction or renovation."],
      ["Zoning & Locational Clearance", "Assistance in securing zoning and locational clearances to verify that a proposed property use or development is consistent with applicable land-use regulations."],
      ["Environmental Compliance (ECC)", "Assistance in coordinating Environmental Compliance Certificate (ECC) requirements and related environmental documentation."],
      ["Protected Area (PAMBE) Processing", "Assistance in coordinating processing requirements and documentation related to Protected Area Management Board (PAMBE) applications and approvals."],
    ],
  },
  {
    number: "05",
    title: "Corporate & Legal Support",
    description:
      "We provide administrative and business documentation assistance to help companies establish, maintain, and manage their corporate and regulatory obligations.",
    image: "assets/services/corporate-support.jpg",
    imageAlt: "A contemporary corporate office interior",
    items: [
      ["SEC Registration", "Assistance in coordinating company registration and documentation requirements with the Securities and Exchange Commission (SEC)."],
      ["Business Permits & Renewals", "Assistance in processing new business permits and coordinating annual renewals to support continuous business operations."],
      ["Open Case Inquiry (BIR)", "Assistance in checking and coordinating inquiries regarding open cases and outstanding compliance matters with the Bureau of Internal Revenue (BIR)."],
      ["Corporate Housekeeping", "Administrative assistance in maintaining corporate records, documentation, and regulatory compliance requirements."],
    ],
  },
  {
    number: "06",
    title: "Property Management",
    description:
      "We provide property management support designed to help property owners maintain their investments, oversee tenant-related activities, and coordinate essential property operations.",
    image: "assets/services/property-management.jpg",
    imageAlt: "A modern, well-maintained home interior",
    items: [
      ["Tenant Screening", "Assistance in evaluating prospective tenants through background checks and relevant information to support informed leasing decisions."],
      ["Leasing Assistance", "Support in coordinating property leasing activities, tenant inquiries, lease documentation, and rental arrangements."],
      ["Asset Monitoring", "Monitoring of property conditions and assets to help owners keep track of their investments and identify potential maintenance needs."],
      ["Maintenance Coordination", "Coordination of property repairs, maintenance requests, and service providers to help maintain the property's condition and functionality."],
    ],
  },
];

export async function renderServices(app, user = null) {
  const data = await get("/services/", { auth: !!user });
  const services = data.results || [];
  const canManage = Boolean(user?.is_agent || user?.is_superuser);
  const canEdit = (service) =>
    Boolean(user?.is_superuser || (user?.is_agent && service.created_by === user.id));

  const categories = serviceCategories
    .map(
      (category) => `
        <section class="service-category" aria-labelledby="service-category-${category.number}">
          <div class="service-category__intro">
            <span class="service-category__number">${category.number}</span>
            <div>
              <h2 id="service-category-${category.number}">${escapeHtml(category.title)}</h2>
              <p>${escapeHtml(category.description)}</p>
            </div>
          </div>
          <img
            class="service-category__image"
            src="${escapeHtml(category.image)}"
            alt="${escapeHtml(category.imageAlt)}"
            loading="lazy"
          />
          <ul class="service-category__items">
            ${category.items.map(([title, description]) => `
              <li>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(description)}</p>
              </li>
            `).join("")}
          </ul>
        </section>
      `
    )
    .join("");

  const cards = services
    .map(
      (service) => `
        <article class="service-card">
          ${service.image ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.name)}" loading="lazy" />` : ""}
          <div class="service-card__body">
            <h3>${escapeHtml(service.name)}</h3>
            <p class="whitespace-pre-line">${escapeHtml(service.description || "")}</p>
            ${canEdit(service) ? `<button type="button" class="service-edit" data-id="${service.id}">Edit</button>` : ""}
          </div>
        </article>
      `
    )
    .join("");

  app.innerHTML = `
    <div class="services-page">
      <header class="services-heading">
        <p class="services-heading__eyebrow">DAMCF Realty & Brokerage</p>
        <h1>Our Services</h1>
      </header>
    ${canManage ? `
      <form id="service-form" class="service-manager">
        <h2 id="service-form-title" class="text-lg font-semibold">Add a service</h2>
        <input name="name" required maxlength="120" placeholder="Service name" class="w-full border px-3 py-2" />
        <textarea name="description" rows="3" placeholder="Description" class="w-full border px-3 py-2"></textarea>
        <label class="block text-sm">Upload service photo
          <input name="image_file" type="file" accept="image/*" class="block mt-1" />
        </label>
        <label class="block text-sm">Or use an image URL
          <input name="image" type="url" placeholder="https://..." class="w-full border px-3 py-2 mt-1" />
        </label>
        <label class="flex items-center gap-2 text-sm"><input name="active" type="checkbox" checked /> Published</label>
        <div id="service-feedback" role="status" class="text-sm"></div>
        <button class="bg-emerald-700 text-white px-4 py-2" type="submit">Save service</button>
        <button id="service-cancel" class="px-4 py-2 border" type="button" hidden>Cancel edit</button>
      </form>` : ""}
      <div class="service-categories">${categories}</div>
      ${cards ? `
        <section class="service-catalog" aria-labelledby="service-catalog-title">
          <div class="service-catalog__heading">
            <p class="services-heading__eyebrow">Additional offerings</p>
            <h2 id="service-catalog-title">Services from our team</h2>
          </div>
          <div class="service-cards">${cards}</div>
        </section>
      ` : ""}
    </div>
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
      form.elements.image_file.value = "";
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
      const service = editingId
        ? await patch(`/services/${editingId}/`, payload)
        : await post("/services/", payload);
      const imageFile = values.get("image_file");
      if (imageFile instanceof File && imageFile.size > 0) {
        const body = new FormData();
        body.append("image", imageFile);
        await post(`/services/${service.id}/image/`, body, { isForm: true });
      }
      await renderServices(app, user);
    } catch (error) {
      feedback.textContent =
        (error.data && JSON.stringify(error.data)) || error.message || "Could not save service.";
      feedback.className = "text-sm text-rose-600";
    }
  });
}
