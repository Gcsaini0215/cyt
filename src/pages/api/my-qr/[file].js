// QR code PNG of a therapist's booking link: /api/my-qr/<handle>.png[?dl=1]  (drawn by the backend, cached here)
import { apiUrl } from "../../../utils/url";
import { linkUrl } from "../../../utils/my-link";

// the backend draws the QR; if this server's API doesn't have the route yet (an older local backend), use the live one
export async function qrPng(link) {
  for (const base of [apiUrl, "https://api.chooseyourtherapist.in/api"]) {
    try {
      const r = await fetch(`${base}/profile-link/qr?w=1000&u=${encodeURIComponent(link)}`);
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch (e) { /* try the next one */ }
  }
  return null;
}

export default async function handler(req, res) {
  const m = /^([a-z0-9-]{2,90})\.png$/.exec(String(req.query.file || ""));
  if (!m) return res.status(404).send("Not found");
  try {
    const png = await qrPng(linkUrl(m[1], "qr"));
    if (!png) throw new Error("no qr");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    if (req.query.dl) res.setHeader("Content-Disposition", `attachment; filename="CYT-QR-${m[1]}.png"`);
    return res.status(200).end(png);
  } catch (e) {
    console.error("my-qr:", e?.message);
    return res.status(502).send("Couldn't make the QR code");
  }
}
