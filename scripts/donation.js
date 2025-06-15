// donation.js
const stripe = Stripe("pk_test_51RZyowQ4zF73MCTpzWNzVsHbttIxXSQ6AA77xb0yIeGAIQmAiqGSbO9ZfUZDNa2SQTqdzoSULJEpqUEnc64d6Qvy00tiqrn3Vu");

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
  } catch (err) {
    console.error("Could not fetch donation progress", err);
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

  let elements;

  async function initialize() {
    const res = await fetch(`${backendBaseURL}/api/stripeCheckout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const { clientSecret } = await res.json();

    elements = stripe.elements({ clientSecret });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html",
        receipt_email: email
      }
    });

    if (error) {
      const msg = document.getElementById("error-message");
      msg.textContent = error.message;
    }
  }

  document.getElementById("payment-form").addEventListener("submit", handleSubmit);
  initialize();
}

updateProgressBar();
