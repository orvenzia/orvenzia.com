// === CONFIG ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyjJPhK1krK-hXzdkQivpWl2Waj3YY7MFzDxLRkSy3iT9Kh5yi0YZHByikgDYjxfD8Q/exec";

// === Submit form ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("screeningForm");
  const resultBox = document.getElementById("resultBox");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect lead info
    const lead = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      company: document.getElementById("company").value.trim()
    };

    // Collect answers
    const answers = {};
    for (let i = 1; i <= 13; i++) {
      const q = document.querySelector(`input[name="q${i}"]:checked`);
      answers[`q${i}`] = q ? q.value : "n/a";
    }

    // UI feedback while waiting
    resultBox.innerHTML = "<p><em>Processing your ESG screening...</em></p>";

    try {
      // Send to backend
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead, answers })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Show result
      resultBox.innerHTML = `
        <div class="result-card">
          <h2>Your ESG Readiness Score</h2>
          <p><strong>${data.score}/100 → ${data.status}</strong></p>
        </div>
      `;
    } catch (err) {
      console.error("Screening error:", err);
      resultBox.innerHTML = `<p style="color:red;">An error occurred. Please try again later.</p>`;
    }
  });
});
