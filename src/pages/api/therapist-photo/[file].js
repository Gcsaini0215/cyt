// A therapist's profile photo as a square JPEG on our own domain: /api/therapist-photo/<slug>.jpg
// (used for schema "image" and the image sitemap — see utils/og-images).
import { therapistBySlug, photoJpeg, sendJpeg } from "../../../utils/og-images";

export default async function handler(req, res) {
  try {
    const t = await therapistBySlug(req.query.file);
    const jpg = t && (await photoJpeg(t));
    if (jpg) return sendJpeg(res, jpg);
  } catch (e) { console.error("therapist-photo:", e?.message); }
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.redirect(302, "/logo.png");
}
