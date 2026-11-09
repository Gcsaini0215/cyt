// Renewal advert image for the plan-ending emails: /api/renew-card/<therapistId>-<soon|ended>[-<days>].png
// (the backend fetches it and puts it inside the email). Public data only: photo, name, role.
import { renewCard } from "../../../utils/og-images";
import { getSlugMaps } from "../../../utils/therapist-slug-maps";

export default async function handler(req, res) {
  const m = /^([a-f0-9]{24})-(soon|ended)(?:-(\d{1,2}))?\.png$/i.exec(String(req.query.file || ""));
  if (!m) return res.status(404).send("Not found");
  try {
    let maps = await getSlugMaps();
    let t = maps.list.find((x) => String(x._id) === m[1]);
    if (!t) { maps = await getSlugMaps(true); t = maps.list.find((x) => String(x._id) === m[1]) || null; }
    const png = await renewCard(t, { state: m[2].toLowerCase(), days: Number(m[3]) || 0 });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=21600");
    return res.status(200).end(png);
  } catch (e) {
    console.error("renew-card:", e?.message);
    return res.status(500).send("Couldn't make the image");
  }
}
