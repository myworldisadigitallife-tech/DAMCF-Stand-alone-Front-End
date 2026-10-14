import { login } from "../auth.js";

export async function renderLogin(app, onSuccess) {
  app.innerHTML = `
    <div class="max-w-sm mx-auto">
      <h1 class="text-2xl font-bold mb-4">Login</h1>
      <form id="login-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <input name="email" type="email" required placeholder="Email" class="w-full border rounded px-3 py-2" />
        <input name="password" type="password" required placeholder="Password" class="w-full border rounded px-3 py-2" />
        <button type="submit" class="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">Login</button>
        <div id="login-feedback" class="text-sm"></div>
      </form>
      <div class="mt-3 text-sm text-center text-gray-500">
        No account? <a href="#/register" class="text-emerald-600 hover:underline">Sign up as agent</a>
      </div>
    </div>
  `;

  const form = document.getElementById("login-form");
  const feedback = document.getElementById("login-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "";
    const fd = new FormData(form);
    try {
      await login(fd.get("email"), fd.get("password"));
      if (onSuccess) await onSuccess();
      location.hash = "#/dashboard";
    } catch (err) {
      feedback.className = "text-sm text-rose-600";
      feedback.textContent = (err.data && (err.data.detail || JSON.stringify(err.data))) || "Login failed.";
    }
  });
}