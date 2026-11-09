// Social post images for a therapist: /api/social-card/<handle>/<book|review|concern>-<post|story>-<n>.png[?dl=1]
// Public data only (photo, name, role, specialities, published reviews with the client's initial).
import { getSlugMaps } from "../../../utils/therapist-slug-maps";
import { resolveHandle, linkUrl } from "../../../utils/my-link";
import { socialCard } from "../../../utils/og-images";
import { qrPng } from "../my-qr/[file]";

export default async function handler(req, res) {
  const [handle, file] = Array.isArray(req.query.p) ? req.query.p : [];
  const m = /^(book|review|concern)-(post|story)-(\d{1,2})\.png$/.exec(String(file || ""));
  if (!handle || !m || !/^[a-z0-9-]{2,90}$/.test(handle)) return res.status(404).send("Not found");
  try {
    let maps = await getSlugMaps();
    let id = resolveHandle(handle, maps);
    if (!id) { maps = await getSlugMaps(true); id = resolveHandle(handle, maps); }
    if (!id) return res.status(404).send("Not found");
    const t = maps.list.find((x) => String(x._id) === id);
    const [, kind, size, n] = m;
    const qr = size === "story" ? await qrPng(linkUrl(handle, "qr")) : null;
    const png = await socialCard(t, { kind, size, n: Number(n), link: linkUrl(handle), qr });
    if (!png) return res.status(404).send("No reviews to show yet");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (req.query.dl) res.setHeader("Content-Disposition", `attachment; filename="CYT-${kind}-${size}-${handle}.png"`);
    return res.status(200).end(png);
  } catch (e) {
    console.error("social-card:", e?.message);
    return res.status(500).send("Couldn't make the image");
  }
}
