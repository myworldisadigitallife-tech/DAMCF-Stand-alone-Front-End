import { get, del, patch, post } from "../api.js";
import { escapeHtml, formatPrice } from "./home.js";

export async function renderDashboard(app, user) {
  if (!user) {
    app.innerHTML = `<div class="text-center py-20">Not logged in.</div>`;
    return;
  }

  // Fetch properties this user created
  const data = await get("/properties/");
  const all = data.results || [];
  const agentsData = await get("/agents/");
  const agentProfile = (agentsData.results || []).find(
    (agent) => String(agent.user) === String(user.id)
  );
  const isAgent = Boolean(user.is_agent || agentProfile);

  // Filter to this user's (if agent). If superuser, show all.
  const mine = user.is_superuser
    ? all
    : all.filter((p) => p.created_by === user.id);

  let rows = "";
  if (mine.length === 0) {
    rows = `<tr><td colspan="4" class="text-center text-gray-500 py-6">No listings yet.</td></tr>`;
  } else {
    rows = mine
      .map(
        (p) => `
      <tr class="border-b">
        <td class="py-2">${escapeHtml(p.title)}</td>
        <td class="py-2">${escapeHtml(p.municipality_name || "—")}</td>
        <td class="py-2">${formatPrice(p.price)}</td>
        <td class="py-2 text-right">
          <a href="#/properties/${p.id}" class="text-emerald-600 text-sm hover:underline mr-3">View</a>
          <a href="#/properties/${p.id}/edit" class="text-emerald-600 text-sm hover:underline mr-3">Edit</a>
          <button data-id="${p.id}" class="delete-btn text-rose-600 text-sm hover:underline">Delete</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  app.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="text-sm text-gray-500">Signed in as ${escapeHtml(user.username)}${user.is_superuser ? " (superuser)" : ""}</div>
      </div>
      ${isAgent || user.is_superuser ? `<a href="#/properties/new" class="bg-emerald-700 text-white px-4 py-2 rounded">Create listing</a>` : ""}
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-3">Title</th>
            <th class="py-2 px-3">Municipality</th>
            <th class="py-2 px-3">Price</th>
            <th class="py-2 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    ${isAgent || user.is_superuser ? `<a href="#/services" class="inline-block mt-4 text-emerald-700 hover:underline">Manage services</a>` : ""}
    ${agentProfile ? `
      <section class="mt-8 max-w-2xl bg-white rounded-lg shadow p-5">
        <h2 class="text-xl font-bold mb-4">My agent profile</h2>
        <form id="agent-profile-form" class="space-y-3">
          ${agentProfile.photo ? `<img src="${escapeHtml(agentProfile.photo)}" alt="${escapeHtml(agentProfile.name)}" class="w-24 h-24 rounded-full object-cover" />` : ""}
          <label class="block text-sm font-medium">Profile photo
            <input name="photo" type="file" accept="image/*" class="block mt-1" />
          </label>
          <label class="block text-sm font-medium">Name
            <input name="name" required maxlength="120" value="${escapeHtml(agentProfile.name)}" class="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label class="block text-sm font-medium">Title
            <input name="title" maxlength="120" value="${escapeHtml(agentProfile.title || "")}" class="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label class="block text-sm font-medium">Email
            <input name="email" type="email" value="${escapeHtml(agentProfile.email || "")}" class="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label class="block text-sm font-medium">Phone
            <input name="phone" type="tel" value="${escapeHtml(agentProfile.phone || "")}" class="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label class="block text-sm font-medium">Bio
            <textarea name="bio" rows="5" class="w-full border rounded px-3 py-2 mt-1">${escapeHtml(agentProfile.bio || "")}</textarea>
          </label>
          <div id="agent-profile-feedback" role="status" class="text-sm"></div>
          <button type="submit" class="bg-emerald-700 text-white px-4 py-2 rounded">Save profile</button>
        </form>
      </section>
    ` : user.is_agent ? `<p class="mt-8 text-sm text-amber-700">No agent profile is linked to this account. Contact an administrator to link one.</p>` : ""}
  `;

  const profileForm = document.getElementById("agent-profile-form");
  if (profileForm) {
    const feedback = document.getElementById("agent-profile-feedback");
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = new FormData(profileForm);
      const photo = values.get("photo");
      feedback.textContent = "Saving profile...";
      feedback.className = "text-sm text-gray-500";
      try {
        await patch(`/agents/${agentProfile.id}/`, {
          name: values.get("name"),
          title: values.get("title"),
          email: values.get("email"),
          phone: values.get("phone"),
          bio: values.get("bio"),
        });
        if (photo instanceof File && photo.size > 0) {
          const body = new FormData();
          body.append("photo", photo);
          await post(`/agents/${agentProfile.id}/photo/`, body, { isForm: true });
        }
        feedback.textContent = "Agent profile updated.";
        feedback.className = "text-sm text-emerald-700";
        await renderDashboard(app, user);
      } catch (error) {
        feedback.textContent =
          (error.data && JSON.stringify(error.data)) || error.message || "Could not update profile.";
        feedback.className = "text-sm text-rose-600";
      }
    });
  }

  // Delete handler
  app.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Delete this listing?")) return;
      try {
        await del(`/properties/${id}/`);
        await renderDashboard(app, user);
      } catch (err) {
        alert((err.data && JSON.stringify(err.data)) || "Delete failed.");
      }
    });
  });
}