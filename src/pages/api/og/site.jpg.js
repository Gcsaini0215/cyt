// Share / search card for site pages, built from real therapist photos (and the real Noida centre):
//   /api/og/site.jpg?page=home | directory | city&city=Delhi | concern&concern=Anxiety | join | noida | careers
import { siteCard, noidaCard, careersCard, homeCard, sendJpeg } from "../../../utils/og-images";
import { apiUrl } from "../../../utils/url";

// open job titles for the careers card (the card still renders if the API is slow or down)
async function openRoles() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(`${apiUrl}/careers/jobs`, { signal: ctrl.signal });
    clearTimeout(t);
    const d = await r.json();
    return Array.isArray(d?.data) ? d.data.map((j) => j.title).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const { page = "home", city = "", concern = "" } = req.query;
  try {
    const jpg = page === "home" ? await homeCard()
      : page === "noida" ? await noidaCard()
      : page === "careers" ? await careersCard({ roles: await openRoles() })
      : await siteCard({ page: String(page), city: String(city).slice(0, 40), concern: String(concern).slice(0, 40) });
    return sendJpeg(res, jpg, page === "careers" ? 3600 : 86400);
  } catch (e) {
    console.error("og site:", e?.message);
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.redirect(302, "/assets/img/og-image.jpg");
  }
}
