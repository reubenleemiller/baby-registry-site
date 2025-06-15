import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const amount = event.data.object.amount / 100;

    // Get current value
    const binId = process.env.JSONBIN_BIN_ID;
    const secretKey = process.env.JSONBIN_SECRET;

    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': secretKey }
    });
    const current = await getRes.json();
    const total = current.record.total + amount;

    // Update JSONBin
    await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': secretKey
      },
      body: JSON.stringify({ total })
    });
  }

  res.status(200).json({ received: true });
}

import { buffer } from 'micro';
