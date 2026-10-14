import { register } from "../auth.js";

export async function renderRegister(app, onSuccess) {
  app.innerHTML = `
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">Become an Agent</h1>
      <form id="register-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <input name="name" required placeholder="Full name" class="w-full border rounded px-3 py-2" />
        <input name="title" placeholder="Title (e.g. Real Estate Broker)" class="w-full border rounded px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" class="w-full border rounded px-3 py-2" />
        <input name="phone" placeholder="Phone (e.g. +639123456789)" class="w-full border rounded px-3 py-2" />
        <input name="password" type="password" required minlength="8" placeholder="Password (min 8 chars)" class="w-full border rounded px-3 py-2" />
        <textarea name="bio" rows="3" placeholder="Short bio (optional)" class="w-full border rounded px-3 py-2"></textarea>
        <button type="submit" class="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">Create Account</button>
        <div id="register-feedback" class="text-sm"></div>
      </form>
      <div class="mt-3 text-sm text-center text-gray-500">
        Already have an account? <a href="#/login" class="text-emerald-600 hover:underline">Login</a>
      </div>
    </div>
  `;

  const form = document.getElementById("register-form");
  const feedback = document.getElementById("register-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "Creating...";
    feedback.className = "text-sm text-gray-500";
    const fd = new FormData(form);

    try {
      await register({
        name: fd.get("name"),
        title: fd.get("title"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
        bio: fd.get("bio"),
      });
      if (onSuccess) await onSuccess();
      location.hash = "#/dashboard";
    } catch (err) {
      feedback.className = "text-sm text-rose-600";
      feedback.textContent = (err.data && JSON.stringify(err.data)) || "Registration failed.";
    }
  });
}