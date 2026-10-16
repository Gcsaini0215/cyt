// Serves blog featured image as a real HTTP image response
// This makes OG image tags work on WhatsApp/social media
// even when the image is stored as base64 in the database.
export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).end("Missing id");

  const FALLBACK = "https://i.postimg.cc/gj1yngrd/choose.png";

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.chooseyourtherapist.in/api";
    // pages pass the blog's _id; /get-blog/:x looks up by slug, so try the id route first
    let blog = null;
    for (const path of [`get-blog-by-id/${encodeURIComponent(id)}`, `get-blog/${encodeURIComponent(id)}`]) {
      const r = await fetch(`${apiBase}/${path}`);
      if (!r.ok) continue;
      const json = await r.json().catch(() => null);
      const found = json?.data || null;
      if (found?.image) { blog = found; break; }
    }

    const img = blog?.image;

    // If it's already an HTTP URL, redirect to it
    if (img && (img.startsWith("http://") || img.startsWith("https://"))) {
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.redirect(302, img);
    }

    // If it's a base64 data URI, decode and serve as image
    if (img && img.startsWith("data:")) {
      const matches = img.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.end(buffer);
      }
    }

    // Fallback: redirect to default CYT image
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.redirect(302, FALLBACK);
  } catch {
    return res.redirect(302, FALLBACK);
  }
}
