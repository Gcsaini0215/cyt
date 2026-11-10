// Sitemap of published "Ask a psychologist" answers (/ask-a-psychologist/<slug>).
// The listing page itself is added once there are 3+ answers (it's noindex below that).
const API = "https://api.chooseyourtherapist.in/api/ask/public-slugs";
const BASE_URL = "https://www.chooseyourtherapist.in";

export default async function handler(req, res) {
  try {
    const data = await (await fetch(API)).json();
    const rows = data?.data || [];
    const day = (d) => new Date(d || Date.now()).toISOString().split("T")[0];
    const urls = [
      ...(rows.length >= 3 ? [`
  <url>
    <loc>${BASE_URL}/ask-a-psychologist</loc>
    <lastmod>${day(rows[0]?.at)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`] : []),
      ...rows.filter((r) => r.slug).map((r) => `
  <url>
    <loc>${BASE_URL}/ask-a-psychologist/${encodeURIComponent(r.slug)}</loc>
    <lastmod>${day(r.at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ].join("");
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=3600");
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate questions sitemap" });
  }
}
