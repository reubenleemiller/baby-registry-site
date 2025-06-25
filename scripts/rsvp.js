document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("rsvp-form");
  const message = document.getElementById("form-message");
  const emailInput = form.querySelector('input[name="Email"]');
  const phoneInput = form.querySelector('input[name="Phone"]');
  const submitBtn = document.getElementById('rsvp-submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const spinner = submitBtn ? submitBtn.querySelector('.tiny-spinner') : null;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Custom validation: Require at least one of email or phone
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!email && !phone) {
      message.textContent = "❌ Please provide either an email address or a phone number.";
      message.style.color = "#b0413e";
      return;
    }

    // Show embedded spinner in button
    if (btnText && spinner) {
      btnText.style.display = "none";
      spinner.style.display = "inline-block";
      submitBtn.disabled = true;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxlaIwk1jLF7NWXRdOu-LwAAibWcN2MF0e2nxjTgn7yoq6SswYes6nOg-l5fw7mPXHKJg/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      const rawText = await response.text();
      console.log("Raw response:", rawText);

      let result;

      try {
        result = JSON.parse(rawText);
        console.log("Parsed result:", result);
      } catch {
        throw new Error("Invalid JSON in response");
      }

      if (result.result === "Success") {
        window.location.href = "/thank-you.html";
        return;
      } else {
        throw new Error(result.message || "Unexpected response");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.textContent = "❌ Something went wrong. Please try again.";
      message.style.color = "#b0413e";
    } finally {
      // Hide spinner, restore button state
      if (btnText && spinner) {
        spinner.style.display = "none";
        btnText.style.display = "";
        submitBtn.disabled = false;
      }
    }
  });
});