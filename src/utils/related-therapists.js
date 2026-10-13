// Shared helpers for linking therapist profiles from other pages (profile "similar
// psychologists", blog "talk to a psychologist", Noida pages) and for the profile's
// search title/description. Works on the /get-therapists-profile documents.
import { profilePath } from "./therapist-slug";
import { CONCERN_PAGES, concernPath } from "./concerns";
import { PLACES, inPlace, placePath } from "./places";

const PHOTO_BASE = "https://api.chooseyourtherapist.in/uploads/images";

export const cleanName = (t) => String(t?.user?.name || t?.name || "").replace(/\s+/g, " ").trim();
// "Noida, Uttar Pradesh" -> "Noida"
export const cityOf = (t) => String(t?.state || t?.user?.state || "").split(",")[0].replace(/\s+/g, " ").trim();
export const expertiseOf = (t) => String(t?.experties || "").split(",").map((s) => s.trim()).filter(Boolean);
export const languagesOf = (t) => String(t?.language_spoken || "").split(",").map((s) => s.trim()).filter(Boolean);

export const minFeeOf = (t) => {
  const fees = Array.isArray(t?.fees) ? t.fees : [];
  const all = fees.flatMap((s) => (Array.isArray(s?.formats) ? s.formats : [])).map((f) => Number(f?.fee)).filter((n) => n > 0);
  return all.length ? Math.min(...all) : null;
};

// "Audio call, In-Person, Video Call" -> "Online & in-person"
export const modesOf = (t) => {
  const s = String(t?.session_formats || "").toLowerCase();
  const online = /video|audio|online/.test(s);
  const inPerson = /in-person|in person|offline/.test(s);
  return online && inPerson ? "Online & in-person" : inPerson ? "In-person" : online ? "Online" : "";
};

export const ratingOf = (t) => {
  const r = Array.isArray(t?.reviews) ? t.reviews : [];
  if (!r.length) return null;
  return { avg: Number((r.reduce((a, x) => a + (Number(x.rating) || 5), 0) / r.length).toFixed(1)), count: r.length };
};

export const photoOf = (t) => {
  const p = t?.user?.profile || t?.image;
  if (!p) return null;
  return String(p).startsWith("http") ? p : `${PHOTO_BASE}/${p}`;
};

// the /therapy-for/<slug> pages this therapist's expertise covers
export const concernLinksOf = (t) => {
  const exp = expertiseOf(t).map((e) => e.toLowerCase());
  return CONCERN_PAGES.filter((c) => exp.some((e) => e === String(c.value).toLowerCase() || e.includes(String(c.label).toLowerCase())))
    .map((c) => ({ href: concernPath(c), label: c.label }));
};

// the /psychologist-in/<place> page for this therapist, if we have one
export const placeLinkOf = (t) => {
  const p = Object.values(PLACES).find((pl) => pl.filterValues && inPlace(t, pl));
  return p ? { href: placePath(p.slug), label: p.name } : null;
};

// small card data — only what the cards show
export const cardOf = (t) => ({
  id: String(t._id),
  href: profilePath(t),
  name: cleanName(t) || "Therapist",
  type: t.profile_type || "Psychologist",
  city: cityOf(t),
  photo: photoOf(t),
  fee: minFeeOf(t),
  rating: ratingOf(t),
  modes: modesOf(t),
  tags: expertiseOf(t).filter((e) => !/therapy \(|cbt|management$/i.test(e)).slice(0, 3),
});

/* Best matches for `subject` (a therapist) or for a set of keywords: same city first,
   then shared expertise, then rating. Never returns `exclude`. */
export function pickRelated(list, { exclude, city = "", expertise = [], keywords = [], limit = 6 } = {}) {
  const c = city.toLowerCase();
  const exp = new Set(expertise.map((e) => e.toLowerCase()));
  const kws = keywords.map((k) => k.toLowerCase());
  return (list || [])
    .filter((t) => t?._id && String(t._id) !== String(exclude) && cleanName(t))
    .map((t) => {
      const te = expertiseOf(t).map((e) => e.toLowerCase());
      const sameCity = c && cityOf(t).toLowerCase() === c ? 6 : 0;
      const shared = te.filter((e) => exp.has(e)).length;
      const kw = kws.length ? te.filter((e) => kws.some((k) => e.includes(k))).length * 3 : 0;
      const r = ratingOf(t);
      return { t, score: sameCity + shared + kw + (r ? Math.min(3, r.count / 5) : 0) + (photoOf(t) ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ t }) => cardOf(t));
}

// Search title + description for a profile (title ≤ ~62 chars where possible)
export function profileSeo(t) {
  const name = cleanName(t) || "Therapist";
  const type = t?.profile_type || "Psychologist";
  const city = cityOf(t) || "India";
  const base = `${name} – ${type} in ${city}`;
  const title = `${base} | CYT`.length <= 62 ? `${base} | CYT` : base;

  const r = ratingOf(t);
  const focus = expertiseOf(t).filter((e) => !/therapy \(|cbt|management$|motivation/i.test(e)).slice(0, 3).map((e) => e.toLowerCase());
  const fee = minFeeOf(t);
  const head = `${r ? `⭐ ${r.avg.toFixed(1)} (${r.count} review${r.count > 1 ? "s" : ""}) · ` : ""}Book ${name}, ${type} in ${city}`;
  // add the most useful bits first (fee, then how, then languages), each only if it still fits in 160 characters
  const withFocus = `${head} for ${focus.join(", ")}.`;
  const lead = focus.length && withFocus.length <= 150 ? withFocus : `${head}.`;
  const extras = [fee ? `From ₹${fee.toLocaleString("en-IN")}` : "", modesOf(t) ? `${modesOf(t)} sessions` : "", languagesOf(t).slice(0, 2).join(", ")].filter(Boolean);
  const added = [];
  for (const x of extras) if (`${lead} ${[...added, x].join(" · ")}.`.length <= 160) added.push(x);
  const desc = added.length ? `${lead} ${added.join(" · ")}.` : lead;
  return { title, description: desc, name, type, city };
}

// server-side: the listed therapists, cached per process (10 min)
let listCache = { at: 0, list: null };
export async function getListedTherapists(fetcher) {
  if (listCache.list && Date.now() - listCache.at < 10 * 60 * 1000) return listCache.list;
  const res = await fetcher();
  const list = (res?.data || []).filter((t) => t?._id);
  listCache = { at: Date.now(), list };
  return list;
}
