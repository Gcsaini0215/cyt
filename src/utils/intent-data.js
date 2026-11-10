// Server-side data for the search-intent landing pages (components/seo/intent-page.js):
// the live directory, filtered per page, with real counts / fees / ratings (no placeholder numbers).
import { fetchData } from "./actions";
import { getTherapistProfiles } from "./url";
import { slimTherapist, sortTherapists, getMinFee, sessionModes, split as splitList } from "./therapist-directory";
import { PLACES, placeStats, placePath } from "./places";

export async function loadDirectory() {
  try {
    const res = await fetchData(getTherapistProfiles);
    return res?.data ? res.data : Array.isArray(res) ? res : [];
  } catch (e) {
    console.error("intent-data loadDirectory:", e?.message);
    return [];
  }
}

export function statsFor(list, total) {
  const fees = list.map((t) => getMinFee(t.fees)).filter(Boolean);
  const ratings = list.flatMap((t) => (t.reviews || []).map((r) => r.rating)).filter((r) => typeof r === "number");
  return {
    count: list.length,
    inPerson: list.filter((t) => sessionModes(t).inPerson).length,
    minFee: fees.length ? Math.min(...fees) : null,
    rating: ratings.length ? { avg: Number((ratings.reduce((a, r) => a + r, 0) / ratings.length).toFixed(1)), count: ratings.length } : null,
    total,
    languages: [...new Set(list.flatMap((t) => splitList(t.language_spoken)))].slice(0, 6),
  };
}

// card data + (for "near me") the public ~1 km area pin and its label — never the street address
export const cards = (list, n = 30, withArea = false) => sortTherapists(list, "", null).slice(0, n).map((t) => ({
  ...slimTherapist(t),
  ...(withArea && t.office_area?.lat != null ? { area: { lat: Number(t.office_area.lat), lng: Number(t.office_area.lng), label: t.office_area.label || "" } } : {}),
}));

// cities / states that have psychologists, for "by city" links
export function placeLinks(all) {
  const st = placeStats(all, getMinFee, sessionModes);
  return Object.entries(PLACES)
    .filter(([slug, p]) => !p.abroad && st[slug]?.count > 0)
    .map(([slug, p]) => ({ name: p.name, href: placePath(slug), count: st[slug].count }))
    .sort((a, b) => b.count - a.count);
}

export const isClinical = (t) => /clinical/i.test(t.profile_type || "");
// expertise / role only — many therapists tick a generic "Teen counselling" service, which is too broad
export const isChild = (t) => /child|adhd|autism|play therap|parenting|adolescen|special educat|learning disab/.test(`${t.profile_type || ""} ${t.experties || ""}`.toLowerCase());
export const isInPerson = (t) => sessionModes(t).inPerson;
