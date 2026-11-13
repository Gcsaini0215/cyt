// Share card for /worksheet/<code> — a therapist's shared CBT worksheet (utils/og-images.js worksheetCard)
import { worksheetCard, sendJpeg } from "../../../../utils/og-images";
import { apiUrl } from "../../../../utils/url";

export default async function handler(req, res) {
  try {
    const code = String(req.query.code || "").replace(/\.(jpe?g|png)$/i, "").slice(0, 20);
    let t = null;
    try {
      const r = await fetch(`${apiUrl}/worksheet-link/${encodeURIComponent(code)}?count=0`);
      const j = await r.json();
      if (j?.status && j.data?.therapist) t = { ...j.data.therapist, user: { name: j.data.therapist.name, profile: j.data.therapist.photo } };
    } catch (e) { /* card without the photo */ }
    return sendJpeg(res, await worksheetCard(t), 86400);
  } catch (e) {
    console.error("og worksheet:", e?.message);
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.redirect(302, "/assets/img/og-image.jpg");
  }
}
