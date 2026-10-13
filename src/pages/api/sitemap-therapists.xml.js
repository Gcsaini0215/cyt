import { profilePath } from "../../utils/therapist-slug";
import { cleanName, photoOf } from "../../utils/related-therapists";

const THERAPIST_API = "https://api.chooseyourtherapist.in/api/get-therapists-profile";
const BASE_URL = "https://www.chooseyourtherapist.in";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// lastmod = when the profile (or the therapist's account, or a review) last changed — not
// "today" for every URL, which search engines learn to ignore. The profile photo is listed
// as an image so it can show up for "<name> psychologist" image searches.
const lastMod = (t) => {
  const times = [t.updatedAt, t.user?.updatedAt, ...(Array.isArray(t.reviews) ? t.reviews.map((r) => r.createdAt) : [])]
    .map((d) => new Date(d).getTime()).filter((n) => Number.isFinite(n));
  return new Date(times.length ? Math.max(...times) : Date.now()).toISOString().split("T")[0];
};

export default async function handler(req, res) {
  try {
    const apiRes = await fetch(THERAPIST_API);
    const data = await apiRes.json();
    const therapists = data?.data || [];

    const urls = therapists
      .filter((t) => t._id)
      .map((t) => {
        const photo = photoOf(t);
        const name = cleanName(t);
        return `
  <url>
    <loc>${BASE_URL}${profilePath(t)}</loc>
    <lastmod>${lastMod(t)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${photo ? `
    <image:image>
      <image:loc>${esc(photo)}</image:loc>
      <image:title>${esc(`${name} — ${t.profile_type || "Psychologist"}`)}</image:title>
    </image:image>` : ""}
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate therapist sitemap" });
  }
}
