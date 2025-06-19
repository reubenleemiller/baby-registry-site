document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 donation.js loaded");

  const stripe = Stripe("pk_live_51RZyoqLJf9l8aRwrsX691muLzT1KcLKZWHMU94NPg9v45Cb2fV8aXvcVbUSQS6j6InzuEpTGQRKpYno9tOKYtGhC00HPGZg7uR");
  const backendBaseURL = "https://baby-registry-backend.vercel.app";

  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const donationInput = document.getElementById("donation-amount");
  const donateBtn = document.getElementById("donate-button");
  const goal = 500;

  async function updateProgressBar() {
    try {
      const res = await fetch(`${backendBaseURL}/api/getProgress`);
      const data = await res.json();
      const raised = data.total || 0;
      const percent = Math.min((raised / goal) * 100, 100);
      if (progressBar) progressBar.style.width = percent + "%";
      if (progressText) progressText.textContent = `$${raised} raised of $${goal} goal`;
      console.log("✅ Progress bar updated:", raised);
    } catch (err) {
      console.error("❌ Could not fetch donation progress", err);
    }
  }

  if (donateBtn) {
    donateBtn.addEventListener("click", () => {
      const amount = donationInput.value;
      if (!amount || amount <= 0) {
        alert("Please enter a valid donation amount.");
        return;
      }
      window.location.href = `donate.html?amount=${amount}`;
    });
  }

  if (window.location.pathname.includes("donate.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = parseInt(urlParams.get("amount") || "0");

    if (!amount || isNaN(amount)) {
      console.error("❌ Invalid or missing donation amount in URL");
      return;
    }

    console.log("💵 Starting donation for:", amount);
    let elements;

    async function initialize() {
      try {
        const res = await fetch(`${backendBaseURL}/api/stripeCheckout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount })
        });

        const { clientSecret } = await res.json();
        console.log("🔑 clientSecret received:", clientSecret);

        if (!clientSecret) {
          console.error("❌ Stripe clientSecret is missing");
          return;
        }

        elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create("payment");
        paymentElement.mount("#payment-element");
        console.log("✅ Stripe payment element mounted");
      } catch (err) {
        console.error("❌ Error initializing Stripe:", err);
      }
    }

    async function handleSubmit(e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      console.log("📨 Submitting payment with email:", email);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/baby-registry-site/success.html",
          receipt_email: email
        }
      });

      if (error) {
        console.error("❌ Stripe confirmPayment error:", error.message);
        const msg = document.getElementById("error-message");
        msg.textContent = error.message;
      } else {
        console.log("✅ Payment confirmed, redirecting...");
      }
    }

    const form = document.getElementById("payment-form");
    if (form) {
      form.addEventListener("submit", handleSubmit);
      initialize();
    } else {
      console.error("❌ payment-form not found in DOM");
    }
  }

  updateProgressBar();
});
