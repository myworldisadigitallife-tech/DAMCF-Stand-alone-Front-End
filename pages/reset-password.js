import { post } from "../api.js";

export async function renderResetPassword(app, uid, token) {
  app.innerHTML = `
    <div class="max-w-sm mx-auto">
      <h1 class="text-2xl font-bold mb-4">Choose a new password</h1>
      <form id="reset-password-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <input name="new_password" type="password" required minlength="8" autocomplete="new-password" placeholder="New password (at least 8 characters)" class="w-full border rounded px-3 py-2" />
        <input name="confirm_password" type="password" required minlength="8" autocomplete="new-password" placeholder="Confirm new password" class="w-full border rounded px-3 py-2" />
        <div id="reset-feedback" role="status" class="text-sm"></div>
        <button type="submit" class="w-full bg-emerald-700 text-white py-2">Update password</button>
      </form>
    </div>
  `;
  const form = document.getElementById("reset-password-form");
  const feedback = document.getElementById("reset-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const newPassword = values.get("new_password");
    if (newPassword !== values.get("confirm_password")) {
      feedback.textContent = "The passwords do not match.";
      feedback.className = "text-sm text-rose-600";
      return;
    }
    feedback.textContent = "Updating password...";
    feedback.className = "text-sm text-gray-500";
    try {
      const response = await post(
        "/auth/password-reset/confirm/",
        { uid, token, new_password: newPassword },
        { auth: false }
      );
      feedback.textContent = response.detail;
      feedback.className = "text-sm text-emerald-700";
      form.reset();
      const button = form.querySelector("button");
      button.textContent = "Go to login";
      button.addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        location.hash = "#/login";
      }, { once: true });
    } catch (error) {
      feedback.textContent =
        (error.data && JSON.stringify(error.data)) || error.message || "Could not reset password.";
      feedback.className = "text-sm text-rose-600";
    }
  });
}
