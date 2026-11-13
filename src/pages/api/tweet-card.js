// POST /api/tweet-card  (Authorization: Bearer <therapist token>)  body { words, size: "post"|"story", theme, hd } (hd = 2160 px) → PNG
// Tweet-style post with the logged-in therapist's own words (utils/og-images.js tweetCard).
// Only the therapist themself can make one — the token is checked with the backend, so nobody can
// put words in another therapist's mouth on a CYT image.
import { getSlugMaps } from "../../utils/therapist-slug-maps";
import { handleFor, linkUrl } from "../../utils/my-link";
import { tweetCard, TWEET_THEMES } from "../../utils/og-images";
import { apiUrl } from "../../utils/url";
import { qrPng } from "./my-qr/[file]";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

async function myTherapistId(auth) {
  for (const base of [apiUrl, "https://api.chooseyourtherapist.in/api"]) {
    try {
      const r = await fetch(`${base}/profile-stats/me`, { headers: { Authorization: auth } });
      if (r.status === 401 || r.status === 403) return null;
      if (!r.ok) continue;
      const j = await r.json();
      return j?.status && j.data?.therapistId ? String(j.data.therapistId) : null;
    } catch (e) { /* try the next one */ }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("POST only");
  const auth = String(req.headers.authorization || "");
  if (!/^Bearer \S+$/.test(auth)) return res.status(401).send("Please log in");
  const words = String(req.body?.words || "").slice(0, 280);
  const size = req.body?.size === "story" ? "story" : "post";
  const hd = req.body?.hd === true;
  const theme = Object.prototype.hasOwnProperty.call(TWEET_THEMES, req.body?.theme) ? req.body.theme : "forest";
  try {
    const id = await myTherapistId(auth);
    if (!id) return res.status(401).send("Please log in again");
    let maps = await getSlugMaps();
    let t = maps.list.find((x) => String(x._id) === id);
    if (!t) { maps = await getSlugMaps(true); t = maps.list.find((x) => String(x._id) === id); }
    if (!t) return res.status(404).send("Your profile isn't live yet");
    const handle = handleFor(t, maps);
    const qr = size === "story" ? await qrPng(linkUrl(handle, "qr")) : null;
    const png = await tweetCard(t, { words, size, link: linkUrl(handle), qr, theme, hd });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).end(png);
  } catch (e) {
    console.error("tweet-card:", e?.message);
    return res.status(500).send("Couldn't make the image");
  }
}
