document.getElementById("screeningForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const lead = {
    company: formData.get("company"),
    email: formData.get("email")
  };

  const answers = {};
  for (let i = 1; i <= 13; i++) {
    answers["q" + i] = formData.get("q" + i) || "no";
  }

  fetch("YOUR_WEBAPP_URL_HERE", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ lead, answers })
  })
  .then(r => r.json())
  .then(data => {
    if (data.status === "ok") {
      alert("Thank you! Your screening has been submitted.\nScore: " + data.score.score + "%");
    } else {
      alert("Error: " + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Submission failed.");
  });
});
