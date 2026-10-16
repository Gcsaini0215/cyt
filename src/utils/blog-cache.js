// Server-only: every blog post, fetched once and kept for 10 minutes. The backend's /get-blogs
// sends whole posts with base64 images (~2 MB), so the /blogs page and /api/blog-thumb read from
// here instead of each fetching it (and the browser never downloads it).
const API = (process.env.NEXT_PUBLIC_API_URL || "https://api.chooseyourtherapist.in/api").replace(/\/$/, "");
const TTL = 10 * 60 * 1000;
let cache = { at: 0, list: null, pending: null };

export async function getAllBlogs() {
  if (cache.list && Date.now() - cache.at < TTL) return cache.list;
  if (!cache.pending) {
    cache.pending = fetch(`${API}/get-blogs`)
      .then((r) => r.json())
      .then((j) => {
        const list = (Array.isArray(j?.data) ? j.data : []).filter((b) => b?._id && b.title)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        cache = { at: Date.now(), list, pending: null };
        return list;
      })
      .catch((e) => { cache.pending = null; if (cache.list) return cache.list; throw e; });
  }
  return cache.pending;
}

const plain = (html) => String(html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// what the /blogs page needs for a card — no content, no image data
export const blogCard = (b) => {
  const text = plain(b.content);
  return {
    id: String(b._id),
    title: b.title,
    // "Mental Health " and "mental health" are the same topic
    category: String(b.category || "Mental Health").trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    excerpt: (String(b.metaDesc || "").trim() || text).slice(0, 170),
    createdAt: b.createdAt || null,
    minutes: Math.max(1, Math.ceil(text.split(" ").filter(Boolean).length / 200)),
    hasImage: !!b.image,
  };
};
