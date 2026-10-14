import { post } from "../api.js";

export async function renderContact(app) {
  app.innerHTML = `
    <div class="max-w-xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Contact Us</h1>
      <form id="contact-form" class="space-y-3 bg-white p-5 rounded-lg shadow">
        <input name="name" required placeholder="Your name" class="w-full border rounded px-3 py-2" />
        <input name="email" type="email" required placeholder="Your email" class="w-full border rounded px-3 py-2" />
        <textarea name="message" rows="5" required placeholder="Your message" class="w-full border rounded px-3 py-2"></textarea>
        <button type="submit" class="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">Send Message</button>
        <div id="contact-feedback" class="text-sm"></div>
      </form>
    </div>
  `;

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("contact-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "Sending...";
    feedback.className = "text-sm text-gray-500";
    const fd = new FormData(form);

    try {
      await post("/contacts/", {
        name: fd.get("name"),
        email: fd.get("email"),
        message: fd.get("message"),
      }, { auth: false });
      feedback.className = "text-sm text-emerald-600";
      feedback.textContent = "Message sent. We'll get back to you soon.";
      form.reset();
    } catch (err) {
      feedback.className = "text-sm text-rose-600";
      feedback.textContent = (err.data && JSON.stringify(err.data)) || "Something went wrong.";
    }
  });
}