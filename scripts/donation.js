// scripts/donation.js

let stripe;
let elements;

window.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const amount = queryParams.get("amount");

  // Display donation amount
  const donationDisplay = document.getElementById("donationDisplay");
  if (donationDisplay) {
    donationDisplay.textContent = `Donation Amount: $${amount} CAD`;
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    document.getElementById("error-message").textContent = "Invalid donation amount.";
    document.getElementById("submit").disabled = true;
    return;
  }

  try {
    const res = await fetch("https://baby-registry-backend.vercel.app/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) })
    });

    if (!res.ok) throw new Error("Failed to fetch payment intent");

    const { clientSecret } = await res.json();

    stripe = Stripe("pk_test_51RZyowQ4zF73MCTpzWNzVsHbttIxXSQ6AA77xb0yIeGAIQmAiqGSbO9ZfUZDNa2SQTqdzoSULJEpqUEnc64d6Qvy00tiqrn3Vu");
    elements = stripe.elements({ clientSecret });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    document.querySelector("#payment-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      // Dynamically get repo name (2nd segment in path)
      const pathParts = window.location.pathname.split('/');
      const repo = pathParts[1]; // "baby-registry-site"
      const returnUrl = `${window.location.origin}/${repo}/pages/donation-success.html?amount=${encodeURIComponent(amount)}`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl }
      });

      if (error) {
        document.getElementById("error-message").textContent = error.message;
      }
    });

  } catch (err) {
    console.error("Stripe init error:", err);
    document.getElementById("error-message").textContent = "Failed to load payment form.";
  }
});
