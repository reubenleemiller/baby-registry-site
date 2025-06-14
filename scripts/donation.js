let stripe;
let elements;

window.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const amount = queryParams.get("amount");
  const donationDisplay = document.getElementById("donationDisplay");

  if (donationDisplay) {
    donationDisplay.textContent = `Donation Amount: $${amount} CAD`;
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    document.getElementById("error-message").textContent = "Invalid donation amount.";
    document.getElementById("submit").disabled = true;
    return;
  }

  // Initialize Stripe with your publishable key
  stripe = Stripe("pk_test_51RZyowQ4zF73MCTpzWNzVsHbttIxXSQ6AA77xb0yIeGAIQmAiqGSbO9ZfUZDNa2SQTqdzoSULJEpqUEnc64d6Qvy00tiqrn3Vu");

  document.getElementById("payment-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    if (!email) {
      document.getElementById("error-message").textContent = "Email is required.";
      return;
    }

    if (!emailInput.checkValidity()) {
      document.getElementById("error-message").textContent = "Please use a valid email address format.";
      return;
    }

    try {
      // Create a payment intent with real user info
      const res = await fetch("https://baby-registry-backend.vercel.app/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          email,
          firstName,
          lastName
        })
      });

      if (!res.ok) throw new Error("Failed to create payment intent");
      const { clientSecret } = await res.json();

      // Create Stripe Elements instance and mount once
      if (!elements) {
        elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create("payment");
        paymentElement.mount("#payment-element");
      }

      const returnUrl = `${window.location.origin}/baby-registry-site/pages/donation-success.html?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(firstName + ' ' + lastName)}`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          receipt_email: email
        }
      });

      if (error) {
        document.getElementById("error-message").textContent = error.message;
      }
    } catch (err) {
      console.error("Payment flow error:", err);
      document.getElementById("error-message").textContent = "An error occurred. Please try again.";
    }
  });
});
