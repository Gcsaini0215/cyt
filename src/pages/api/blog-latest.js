import { getAllBlogs, blogCard } from "../../utils/blog-cache";

// The newest few posts as light cards (title, category, excerpt, minutes) for the home page —
// the full /get-blogs feed carries base64 images (~2 MB), so the browser shouldn't fetch it.
export default async function handler(req, res) {
  try {
    const n = Math.min(12, Math.max(1, Number(req.query.n) || 4));
    const all = await getAllBlogs();
    const list = [...all]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, n)
      .map(blogCard);
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json({ status: true, data: list });
  } catch (e) {
    res.status(200).json({ status: false, data: [] });
  }
}
