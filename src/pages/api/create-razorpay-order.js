export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, bookingId } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `booking_${bookingId || Date.now()}`,
      }),
    });

    const order = await response.json();
    if (!response.ok) return res.status(500).json({ error: order.error?.description || "Order creation failed" });

    return res.status(200).json({ orderId: order.id });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
