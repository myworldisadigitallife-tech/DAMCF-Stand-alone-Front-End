import { post } from "../api.js";

export async function renderForgotPassword(app) {
  app.innerHTML = `
    <div class="max-w-sm mx-auto">
      <a href="#/login" class="text-sm text-gray-500 hover:underline">← Back to login</a>
      <h1 class="text-2xl font-bold mt-4 mb-2">Reset your password</h1>
      <p class="text-sm text-gray-600 mb-4">Enter your username or account email. If we find a matching account, we’ll email a reset link.</p>
      <form id="forgot-password-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <input name="identifier" required autocomplete="username" placeholder="Username or email" class="w-full border rounded px-3 py-2" />
        <div id="forgot-feedback" role="status" class="text-sm"></div>
        <button type="submit" class="w-full bg-emerald-700 text-white py-2">Send reset link</button>
      </form>
    </div>
  `;
  const form = document.getElementById("forgot-password-form");
  const feedback = document.getElementById("forgot-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "Sending request...";
    feedback.className = "text-sm text-gray-500";
    try {
      const body = Object.fromEntries(new FormData(form));
      const response = await post("/auth/password-reset/", body, { auth: false });
      feedback.textContent = response.detail;
      feedback.className = "text-sm text-emerald-700";
      form.reset();
    } catch (error) {
      feedback.textContent =
        (error.data && JSON.stringify(error.data)) || error.message || "Could not request a reset link.";
      feedback.className = "text-sm text-rose-600";
    }
  });
}
