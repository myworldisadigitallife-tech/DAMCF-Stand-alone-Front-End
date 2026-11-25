import { me, logout, isLoggedIn } from "./auth.js";

// Pages (Part 3B — placeholders until you add them)
import { renderHome } from "./pages/home.js";
import { renderListings } from "./pages/listings.js";
import { renderPropertyDetail } from "./pages/property-detail.js";
import { renderServices } from "./pages/services.js";
import { renderAgents } from "./pages/agents.js";
import { renderContact } from "./pages/contact.js";
import { renderLogin } from "./pages/login.js";
import { renderRegister } from "./pages/register.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderPropertyEdit } from "./pages/property-edit.js";
import { renderPropertyCreate } from "./pages/property-create.js";
import { renderForgotPassword } from "./pages/forgot-password.js";
import { renderResetPassword } from "./pages/reset-password.js";

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------
let currentUser = null;

async function refreshUser() {
  currentUser = await me();
  renderHeader();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function renderHeader() {
  const header = document.getElementById("site-header");
  const loggedIn = !!currentUser;

  header.innerHTML = `
    <div class="site-header__inner max-w-6xl mx-auto px-4 flex items-center justify-between">
      <a href="#/" class="site-brand" aria-label="DAMCF Realty home">
        <img src="assets/damcf-logo.png" alt="DAMCF Realty and Brokerage" />
      </a>
      <button id="nav-toggle" class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu">
        <span></span><span></span><span></span>
      </button>
      <nav id="primary-navigation" class="primary-navigation">
        <a href="#/">Home</a>
        <a href="#/listings">Listings</a>
        <a href="#/services">Services</a>
        <a href="#/agents">Agents</a>
        <a href="#/contact">Contact</a>
        ${
          loggedIn
            ? `
              <a href="#/dashboard">Dashboard</a>
              <button id="logout-btn" class="site-nav__logout">Logout</button>
            `
            : `
              <a href="#/login">Login</a>
              <a href="#/register" class="site-nav__cta">Join our team</a>
            `
        }
      </nav>
    </div>
  `;

  const navToggle = document.getElementById("nav-toggle");
  const navigation = document.getElementById("primary-navigation");
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navToggle.classList.toggle("is-open", !expanded);
    navToggle.setAttribute(
      "aria-label",
      expanded ? "Open navigation menu" : "Close navigation menu"
    );
    navigation.classList.toggle("is-open", !expanded);
  });
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-label", "Open navigation menu");
      navigation.classList.remove("is-open");
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      currentUser = null;
      location.hash = "#/";
      renderHeader();
    });
  }
}

function renderFooter() {
  const footer = document.getElementById("site-footer");
  footer.innerHTML = `
    <img
      class="site-footer__banner"
      src="assets/damcf-footer-banner.jpg"
      alt="Trusted solutions for your business. BIR, DENR, SEC, DTI, DOLE, and Mayor's Permit. Call +63 930 015 7769 or email damcfrealtyinc@gmail.com."
    />
    <div class="site-footer__details">
      <span>DAMCF Realty Incorporated · Purok 3, General Luna, Siargao, Surigao del Norte</span>
      <span class="site-footer__contact">
        <a href="tel:+639300157769">+63 930 015 7769</a>
        <a href="mailto:damcfrealtyinc@gmail.com">damcfrealtyinc@gmail.com</a>
      </span>
      <span class="site-footer__copyright">
        © ${new Date().getFullYear()} DAMCF Realty Incorporated.
      </span>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Router (hash-based — works on GitHub Pages without server config)
// ---------------------------------------------------------------------------
async function router() {
  const app = document.getElementById("app");
  const hash = location.hash.replace(/^#/, "") || "/";
  const route = hash.split("?", 1)[0];
  const [path, ...rest] = route.split("/").filter(Boolean);
  const param = rest[0];

  app.innerHTML = `<div class="spinner"></div>`;

  try {
    if (!path) {
      await renderHome(app);
    } else if (path === "listings") {
      await renderListings(app);
    } else if (path === "properties" && param && rest[1] === "edit") {
      await renderPropertyEdit(app, param);
    } else if (path === "properties" && param === "new") {
      await renderPropertyCreate(app);
    } else if (path === "properties" && param) {
      await renderPropertyDetail(app, param);
    } else if (path === "services") {
      await renderServices(app, currentUser);
    } else if (path === "agents") {
      await renderAgents(app);
    } else if (path === "contact") {
      await renderContact(app);
    } else if (path === "login") {
      await renderLogin(app, refreshUser);
    } else if (path === "forgot-password") {
      await renderForgotPassword(app);
    } else if (path === "reset-password") {
      await renderResetPassword(app, rest[0], rest[1]);
    } else if (path === "register") {
      await renderRegister(app, refreshUser);
    } else if (path === "dashboard") {
      if (!isLoggedIn()) {
        location.hash = "#/login";
        return;
      }
      await renderDashboard(app, currentUser);
    } else {
      app.innerHTML = `<div class="text-center py-20 text-gray-500">Page not found</div>`;
    }
  } catch (err) {
    console.error(err);
    app.innerHTML = `
      <div class="text-center py-20">
        <div class="text-rose-600 font-semibold mb-2">Something went wrong</div>
        <div class="text-gray-500 text-sm">${err.message || "Unknown error"}</div>
      </div>
    `;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
window.addEventListener("hashchange", router);

window.addEventListener("auth:expired", () => {
  currentUser = null;
  renderHeader();
  location.hash = "#/login";
});

(async () => {
  renderFooter();
  await refreshUser();
  await router();
})();