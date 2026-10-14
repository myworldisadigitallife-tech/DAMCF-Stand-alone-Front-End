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
    <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
      <a href="#/" class="font-bold text-lg">DAMCF Realty</a>
      <nav class="flex gap-4 items-center text-sm flex-wrap">
        <a href="#/" class="hover:text-emerald-600">Home</a>
        <a href="#/listings" class="hover:text-emerald-600">Listings</a>
        <a href="#/services" class="hover:text-emerald-600">Services</a>
        <a href="#/agents" class="hover:text-emerald-600">Agents</a>
        <a href="#/contact" class="hover:text-emerald-600">Contact</a>
        ${
          loggedIn
            ? `
              <a href="#/dashboard" class="hover:text-emerald-600">Dashboard</a>
              <button id="logout-btn" class="text-rose-600 hover:underline">Logout</button>
            `
            : `
              <a href="#/login" class="hover:text-emerald-600">Login</a>
              <a href="#/register" class="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Sign up</a>
            `
        }
      </nav>
    </div>
  `;

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
    <div class="max-w-6xl mx-auto px-4 text-sm space-y-1">
      <div class="font-semibold">DAMCF Realty Incorporated</div>
      <div>Purok 3, General Luna, Siargao, Surigao del Norte</div>
      <div>+639300157769 · damcfrealtyinc@gmail.com</div>
      <div class="opacity-70 pt-2 text-xs">
        © ${new Date().getFullYear()} DAMCF Realty Incorporated.
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Router (hash-based — works on GitHub Pages without server config)
// ---------------------------------------------------------------------------
async function router() {
  const app = document.getElementById("app");
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path, ...rest] = hash.split("/").filter(Boolean);
  const param = rest[0];

  app.innerHTML = `<div class="spinner"></div>`;

  try {
    if (!path) {
      await renderHome(app);
    } else if (path === "listings") {
      await renderListings(app);
    } else if (path === "properties" && param) {
      await renderPropertyDetail(app, param);
    } else if (path === "services") {
      await renderServices(app);
    } else if (path === "agents") {
      await renderAgents(app);
    } else if (path === "contact") {
      await renderContact(app);
    } else if (path === "login") {
      await renderLogin(app, refreshUser);
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