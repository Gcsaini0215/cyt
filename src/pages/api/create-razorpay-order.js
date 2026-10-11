// Creates the Razorpay order on the backend (api.chooseyourtherapist.in), which holds the live
// Razorpay keys and later verifies the payment signature with the same account. The frontend's
// own keys had drifted from the backend's, so orders made here failed ("Authentication failed")
// and could never have verified anyway.
const API = (process.env.NEXT_PUBLIC_API_URL || "https://api.chooseyourtherapist.in/api").replace(/\/$/, "");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, bookingId } = req.body || {};
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const r = await fetch(`${API}/create-razorpay-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, booking_id: String(bookingId || Date.now()).slice(0, 30) }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d?.data?.id) return res.status(502).json({ error: d?.message || "Order creation failed" });
    // the checkout must open with the key the order was created under
    return res.status(200).json({ orderId: d.data.id, keyId: d.key_id });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
