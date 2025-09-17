document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("screeningForm");
  const resultContainer = document.getElementById("resultContainer");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const levelDisplay = document.getElementById("levelDisplay");

  // Alle spørgsmål (q1..q13)
  const QUESTIONS = [
    "q1","q2","q3","q4","q5","q6",
    "q7","q8","q9","q10","q11","q12","q13"
  ];

  // Level definitioner
  const LEVELS = [
    { min: 99, max: 100, key: "green",       label: "Leading (99–100)" },
    { min: 80, max: 98,  key: "light_green", label: "Strong (80–98)" },
    { min: 60, max: 79,  key: "yellow",      label: "Lagging / Not Ready (60–79)" },
    { min: 40, max: 59,  key: "orange",      label: "At Risk (40–59)" },
    { min: 0,  max: 39,  key: "red",         label: "Critical (0–39)" },
  ];

  function determineLevel(pct) {
    return LEVELS.find(l => pct >= l.min && pct <= l.max) || LEVELS[LEVELS.length-1];
  }

  // Beregn score
  function calculateScore(answers) {
    let total = 0;
    let max = QUESTIONS.length;
    answers.forEach(a => {
      if (a.answer === "yes") total += 1.0;
      else if (a.answer === "planned") total += 0.5;
      else total += 0;
    });
    const pct = Math.round((total / max) * 100);
    return { percent: pct, level: determineLevel(pct) };
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const company = document.getElementById("company").value.trim();
    const email = document.getElementById("email").value.trim();

    // Saml svar
    const answers = [];
    QUESTIONS.forEach(q => {
      const val = (document.querySelector(`input[name="${q}"]:checked`) || {}).value || "";
      answers.push({ q, answer: val });
    });

    // Beregn score
    const { percent, level } = calculateScore(answers);

    // Vis resultat til kunden
    resultContainer.style.display = "block";
    scoreDisplay.textContent = percent + "%";
    levelDisplay.textContent = level.label;

    // Byg HTML til rapport (valgfrit hvis du genererer PDF)
    let pdfHtml = `
      <h2>${company}</h2>
      <p><b>Score:</b> ${percent}%</p>
      <p><b>Level:</b> ${level.label}</p>
      <ul>
        ${answers.map(a => `<li>${a.q}: ${a.answer}</li>`).join("")}
      </ul>
    `;

    // --- SEND TIL BACKEND ---
    const backendUrl = window.SCREENING_BACKEND_URL;

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          lead: { company, email },
          answers: Object.fromEntries(answers.map(o => [o.q, o.answer])),
          score: percent,
          level: level.key,
          reportHtml: pdfHtml
        })
      });

      const txt = await response.text();
      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch {
        console.error("Raw backend response:", txt);
        alert("Unknown backend response");
        return;
      }

      console.log("Backend response:", parsed);
      if (parsed.status === "ok") {
        alert("Report sent successfully!");
      } else {
        alert("Error: " + parsed.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error sending report: " + err.message);
    }
  });
});
