import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const amount = event.data.object.amount_received / 100;
    console.log(`✅ Payment received: $${amount}`);

    try {
      const binId = process.env.JSONBIN_BIN_ID;
      const secretKey = process.env.JSONBIN_SECRET;

      // Fetch current total
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { 'X-Master-Key': secretKey }
      });
      const json = await response.json();
      const current = json.record.total || 0;

      // Update total
      await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': secretKey
        },
        body: JSON.stringify({ total: current + amount })
      });

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('❌ JSONBin update error:', e);
      return res.status(500).json({ error: 'JSONBin update failed' });
    }
  }

  res.status(200).json({ received: true });
}