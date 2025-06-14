let stripe;
let elements;

window.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const amount = queryParams.get("amount");

  // Display donation amount on the page
  const donationDisplay = document.getElementById("donationDisplay");
  if (donationDisplay) {
    donationDisplay.textContent = `Donation Amount: $${amount} CAD`;
  }

  // Basic validation
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    document.getElementById("error-message").textContent = "Invalid donation amount.";
    document.getElementById("submit").disabled = true;
    return;
  }

  try {
    // Get the email input
    const emailInput = document.getElementById("email");

    // Wait for form to be submitted to include email
    document.querySelector("#payment-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const receiptEmail = emailInput?.value?.trim();
      if (!receiptEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiptEmail)) {
        document.getElementById("error-message").textContent = "Please enter a valid email address.";
        return;
      }

      // Create PaymentIntent with backend
      const res = await fetch("https://baby-registry-backend.vercel.app/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          email: receiptEmail
        })
      });

      if (!res.ok) {
        throw new Error("Failed to fetch payment intent");
      }

      const { clientSecret } = await res.json();

      // Initialize Stripe and mount payment element
      stripe = Stripe("pk_test_51RZyowQ4zF73MCTpzWNzVsHbttIxXSQ6AA77xb0yIeGAIQmAiqGSbO9ZfUZDNa2SQTqdzoSULJEpqUEnc64d6Qvy00tiqrn3Vu");
      elements = stripe.elements({ clientSecret });

      const paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");

      // Confirm payment
      const returnUrl = `${window.location.origin}/baby-registry-site/pages/donation-success.html?amount=${encodeURIComponent(amount)}`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl
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
