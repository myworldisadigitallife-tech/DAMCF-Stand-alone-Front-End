import { get } from "../api.js";

export function humanVerificationMarkup(id) {
  return `
    <div class="human-verification">
      <label id="${id}-question" for="${id}-answer">
        <span data-human-question>Loading human verification...</span>
      </label>
      <input
        id="${id}-answer"
        class="human-verification__answer"
        name="human_answer"
        type="number"
        inputmode="numeric"
        min="4"
        max="18"
        required
        autocomplete="off"
        aria-labelledby="${id}-question"
      />
      <input name="human_token" type="hidden" />
    </div>
  `;
}

export function setHumanVerification(form, challenge) {
  const question = form.querySelector("[data-human-question]");
  const token = form.querySelector('[name="human_token"]');
  const answer = form.querySelector('[name="human_answer"]');
  if (!question || !token || !answer) {
    throw new Error("The human verification fields are missing.");
  }
  question.textContent = challenge.question;
  token.value = challenge.token;
  answer.value = "";
}

export async function refreshHumanVerification(form) {
  setHumanVerification(
    form,
    await get("/human-verification/", { auth: false })
  );
}
