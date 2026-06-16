const BLOGS_API = "https://api.chooseyourtherapist.in/api/get-blogs";
const BASE_URL = "https://www.chooseyourtherapist.in";

export default async function handler(req, res) {
  try {
    const apiRes = await fetch(BLOGS_API);
    const data = await apiRes.json();
    const blogs = data?.data || [];

    const urls = blogs
      .filter((b) => b._id)
      .map((b) => {
        const lastmod = b.createdAt
          ? new Date(b.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        return `
  <url>
    <loc>${BASE_URL}/blog-details?id=${b._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate blog sitemap" });
  }
}
