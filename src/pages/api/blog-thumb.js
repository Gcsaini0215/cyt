// A blog's cover image as a real (cacheable) image response, from the server-side blog cache
// (utils/blog-cache) — the posts store it as a base64 data URI.
import { getAllBlogs } from "../../utils/blog-cache";

export default async function handler(req, res) {
  const id = String(req.query.id || "");
  try {
    const blog = (await getAllBlogs()).find((b) => String(b._id) === id);
    const img = blog?.image ? String(blog.image) : "";
    if (/^https?:\/\//.test(img)) { res.setHeader("Cache-Control", "public, max-age=86400"); return res.redirect(302, img); }
    const m = img.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
    if (m) {
      res.setHeader("Content-Type", m[1]);
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      return res.end(Buffer.from(m[2], "base64"));
    }
  } catch (e) { /* fall through to the default image */ }
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.redirect(302, "/assets/img/blog-card-048b22.jpg");
}
