import { get } from "../api.js";
import { API_BASE } from "../config.js";

export async function renderHome(app) {
  const data = await get("/properties/?is_featured=true", { auth: false });
  const properties = (data.results || []).slice(0, 6);
  const lead = properties.find((p) => p.primary_image?.startsWith("http")) ||
    properties.find((p) => p.primary_image) ||
    properties[0];
  const remaining = properties.filter((p) => p !== lead);
  const cards = remaining.map((p) => `
    <a href="#/properties/${p.id}" class="home-listing">
      ${
        p.primary_image
          ? `<img class="home-image" data-home-fallback="listing" src="${escapeHtml(imageUrl(p.primary_image))}" alt="${escapeHtml(p.title)}" loading="lazy" />`
          : `<div class="home-listing__placeholder" aria-hidden="true">DAMCF <span>SIARGAO</span></div>`
      }
      <div class="home-listing__details">
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.municipality_name || p.address || "")}</p>
        </div>
        <div class="home-listing__price">${formatPrice(p.price)}</div>
      </div>
    </a>
  `).join("");

  app.innerHTML = `
    <div class="home-page">
      <section class="home-hero">
        <div class="home-hero__copy">
          <p class="home-eyebrow"><span></span> DAMCF Realty · Siargao Island</p>
          <h1>Find your place<br />in <em>Siargao.</em></h1>
          <p class="home-hero__intro">Thoughtful property guidance for a life shaped by the island.</p>
          <a href="#/listings" class="home-button">Explore properties <span aria-hidden="true">↗</span></a>
          <div class="home-hero__note">Real estate · Property management · Business consultancy</div>
        </div>
        ${
          lead
            ? `<a href="#/properties/${lead.id}" class="home-hero__feature" aria-label="View featured property: ${escapeHtml(lead.title)}">
                ${
                  lead.primary_image
                    ? `<img class="home-image" data-home-fallback="hero" src="${escapeHtml(imageUrl(lead.primary_image))}" alt="${escapeHtml(lead.title)}" />`
                    : `<div class="home-hero__art" aria-hidden="true"><span>ISLAND<br />LIVING</span></div>`
                }
                <div class="home-hero__caption">
                  <div><span class="home-eyebrow">Featured property</span><strong>${escapeHtml(lead.title)}</strong><span>${escapeHtml(lead.municipality_name || lead.address || "")}</span></div>
                  <b>${formatPrice(lead.price)}</b>
                </div>
              </a>`
            : `<div class="home-hero__feature home-hero__art" aria-hidden="true"><span>ISLAND<br />LIVING</span></div>`
        }
      </section>

      <section class="home-featured" aria-labelledby="featured-heading">
        <div class="home-section-heading">
          <div><p class="home-eyebrow">A considered collection</p><h2 id="featured-heading">Featured properties</h2></div>
          <a href="#/listings">View all properties <span aria-hidden="true">↗</span></a>
        </div>
        ${
          cards
            ? `<div class="home-listings">${cards}</div>`
            : `<p class="home-empty">No additional featured listings at the moment. Explore our full collection of properties.</p>`
        }
      </section>
      <section class="home-contact">
        <p>Looking for something specific?</p>
        <a href="#/contact">Speak with our local team <span aria-hidden="true">↗</span></a>
      </section>
    </div>
  `;

  app.querySelectorAll(".home-image").forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = document.createElement("div");
      fallback.className = image.dataset.homeFallback === "hero"
        ? "home-hero__art"
        : "home-listing__placeholder";
      fallback.setAttribute("aria-hidden", "true");
      if (image.dataset.homeFallback === "hero") {
        fallback.textContent = "ISLAND\nLIVING";
      } else {
        fallback.append("DAMCF ");
        const label = document.createElement("span");
        label.textContent = "SIARGAO";
        fallback.append(label);
      }
      image.replaceWith(fallback);
    }, { once: true });
  });
}

function imageUrl(path) {
  return new URL(path, API_BASE).href;
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