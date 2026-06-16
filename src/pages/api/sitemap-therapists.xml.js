const THERAPIST_API = "https://api.chooseyourtherapist.in/api/get-therapists-profile";
const BASE_URL = "https://www.chooseyourtherapist.in";

export default async function handler(req, res) {
  try {
    const apiRes = await fetch(THERAPIST_API);
    const data = await apiRes.json();
    const therapists = data?.data || [];

    const today = new Date().toISOString().split("T")[0];

    const urls = therapists
      .filter((t) => t._id)
      .map(
        (t) => `
  <url>
    <loc>${BASE_URL}/view-profile/${t._id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate therapist sitemap" });
  }
}
