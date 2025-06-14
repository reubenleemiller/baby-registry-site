// scripts/donation.js

let stripe;
let elements;

window.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const amount = queryParams.get("amount");

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    document.getElementById("error-message").textContent = "Invalid donation amount.";
    document.getElementById("submit").disabled = true;
    return;
  }

  try {
    // Call Vercel backend to create PaymentIntent
    const res = await fetch("https://baby-registry-backend.vercel.app/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }) // in CAD
    });

    const { clientSecret } = await res.json();

    // Initialize Stripe
    stripe = Stripe("pk_test_51RZyowQ4zF73MCTpzWNzVsHbttIxXSQ6AA77xb0yIeGAIQmAiqGSbO9ZfUZDNa2SQTqdzoSULJEpqUEnc64d6Qvy00tiqrn3Vu");
    elements = stripe.elements({ clientSecret });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    // Handle form submission
    document.querySelector("#payment-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const base = window.location.origin + window.location.pathname.replace(/\/pages\/donate.html$/, '');

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${base}/pages/donation-success.html?amount=${amount}`
        }
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
