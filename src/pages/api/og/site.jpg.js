// Share / search card for site pages, built from real therapist photos (and the real Noida centre):
//   /api/og/site.jpg?page=home | directory | city&city=Delhi | concern&concern=Anxiety | join | noida
import { siteCard, noidaCard, sendJpeg } from "../../../utils/og-images";

export default async function handler(req, res) {
  const { page = "home", city = "", concern = "" } = req.query;
  try {
    const jpg = page === "noida" ? await noidaCard() : await siteCard({ page: String(page), city: String(city).slice(0, 40), concern: String(concern).slice(0, 40) });
    return sendJpeg(res, jpg);
  } catch (e) {
    console.error("og site:", e?.message);
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.redirect(302, "/assets/img/og-image.jpg");
  }
}
