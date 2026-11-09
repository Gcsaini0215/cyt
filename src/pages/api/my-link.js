// GET /api/my-link?id=<therapist profile id> → { live, handle, url, posts } for the dashboard's
// "My booking link" and "Social posts" pages. Public data only (what the directory already shows).
import { getSlugMaps } from "../../utils/therapist-slug-maps";
import { handleFor, linkUrl } from "../../utils/my-link";
import { nameSlug } from "../../utils/therapist-slug";

export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^[a-f0-9]{24}$/i.test(id)) return res.status(400).json({ status: false });
  try {
    let maps = await getSlugMaps();
    let t = maps.list.find((x) => String(x._id) === id);
    if (!t) { maps = await getSlugMaps(true); t = maps.list.find((x) => String(x._id) === id); }
    res.setHeader("Cache-Control", "no-store");
    if (!t) return res.json({ status: true, data: { live: false, handle: null, url: null } });
    const handle = handleFor(t, maps);
    const posts = { specialities: String(t.experties || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6) };
    return res.json({ status: true, data: { live: true, handle, url: linkUrl(handle), name: nameSlug(t), posts } });
  } catch (e) {
    return res.status(500).json({ status: false, message: "Couldn't load your link" });
  }
}
