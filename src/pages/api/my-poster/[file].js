// "Scan to book" A4 poster PNG for a therapist: /api/my-poster/<handle>.png[?dl=1]
import { apiUrl } from "../../../utils/url";
import { getSlugMaps } from "../../../utils/therapist-slug-maps";
import { resolveHandle, linkUrl } from "../../../utils/my-link";
import { posterPng } from "../../../utils/og-images";

export default async function handler(req, res) {
  const m = /^([a-z0-9-]{2,90})\.png$/.exec(String(req.query.file || ""));
  if (!m) return res.status(404).send("Not found");
  try {
    let maps = await getSlugMaps();
    let id = resolveHandle(m[1], maps);
    if (!id) { maps = await getSlugMaps(true); id = resolveHandle(m[1], maps); }
    if (!id) return res.status(404).send("Not found");
    const t = maps.list.find((x) => String(x._id) === id);
    const qrUrl = linkUrl(m[1], "qr");
    const r = await fetch(`${apiUrl}/profile-link/qr?w=1000&u=${encodeURIComponent(qrUrl)}`);
    const qr = r.ok ? Buffer.from(await r.arrayBuffer()) : null;
    const png = await posterPng(t, { qr, link: linkUrl(m[1]) });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (req.query.dl) res.setHeader("Content-Disposition", `attachment; filename="CYT-poster-${m[1]}.png"`);
    return res.status(200).end(png);
  } catch (e) {
    console.error("my-poster:", e?.message);
    return res.status(500).send("Couldn't make the poster");
  }
}
