// Share / search card for a therapist profile: /api/og/therapist/<slug>.jpg (1200x630, real photo).
import { therapistBySlug, therapistCard, siteCard, sendJpeg } from "../../../../utils/og-images";

export default async function handler(req, res) {
  try {
    const t = await therapistBySlug(req.query.file);
    return sendJpeg(res, t ? await therapistCard(t) : await siteCard({ page: "directory" }));
  } catch (e) {
    console.error("og therapist:", e?.message);
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.redirect(302, "/assets/img/og-image.jpg");
  }
}
