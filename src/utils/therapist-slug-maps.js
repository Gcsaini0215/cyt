// Server-side (getServerSideProps) lookups between therapist URL slugs and _ids,
// shared by /view-profile/[id] and /book/[id].
import { fetchData } from "./actions";
import { getTherapistProfiles } from "./url";
import { therapistSlug, nameSlug } from "./therapist-slug";

// URL slug <-> _id maps of the publicly listed therapists, cached per server
// process so a profile view doesn't refetch the whole list every time.
let slugCache = { at: 0, maps: null };
const SLUG_TTL_MS = 10 * 60 * 1000;

export async function getSlugMaps(force = false) {
  if (!force && slugCache.maps && Date.now() - slugCache.at < SLUG_TTL_MS) return slugCache.maps;
  const res = await fetchData(getTherapistProfiles);
  const list = (res?.data || [])
    .filter((t) => t._id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const bySlug = {};  // "counselling-psychologist-teesta-joshi-uttar-pradesh" -> _id
  const slugById = {}; // _id -> "counselling-psychologist-teesta-joshi-uttar-pradesh"
  const byName = {};  // "teesta-joshi" -> [_id, ...]
  // on a slug clash the oldest profile keeps it; the others stay on their _id URL
  list.forEach((t) => {
    const slug = therapistSlug(t);
    if (slug && !bySlug[slug]) {
      bySlug[slug] = t._id;
      slugById[t._id] = slug;
    }
    const name = nameSlug(t);
    if (name) (byName[name] = byName[name] || []).push(t._id);
  });
  slugCache = { at: Date.now(), maps: { bySlug, slugById, byName, list } };
  return slugCache.maps;
}

// A slug that isn't current — an older URL format, or an old type/location after
// the therapist changed it — still points at one therapist if their name is in
// it and matches uniquely.
export function currentSlugFor(param, { slugById, byName }) {
  const name = Object.keys(byName)
    .filter((n) => `-${param}-`.includes(`-${n}-`))
    .sort((a, b) => b.length - a.length)[0];
  const ids = name ? byName[name] : [];
  return ids.length === 1 ? slugById[ids[0]] : null;
}
