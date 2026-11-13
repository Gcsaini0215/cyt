// Share card for /cycle-mood-care — Cycle & Mood Care for women (utils/og-images.js cycleCareCard)
import { cycleCareCard, sendJpeg } from "../../../utils/og-images";

export default async function handler(req, res) {
  try {
    return sendJpeg(res, await cycleCareCard(), 86400);
  } catch (e) {
    console.error("og cycle-care:", e?.message);
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.redirect(302, "/assets/img/og-image.jpg");
  }
}
