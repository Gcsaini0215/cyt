// A therapist's own short booking link: https://www.chooseyourtherapist.in/t/<name>
// <name> is their name slug ("teesta-joshi"); when two listed therapists share a name, the
// newer ones get the last 4 characters of their id added ("teesta-joshi-9f3c").
// Each place they share it carries ?src=my-<where>, which the profile page counts as "My link"
// (or "QR scan" for my-qr) in their profile insights.
import { nameSlug } from "./therapist-slug";

export const SITE = "https://www.chooseyourtherapist.in";
export const LINK_PLACES = [
  { key: "ig", label: "Instagram bio" },
  { key: "wa", label: "WhatsApp" },
  { key: "card", label: "Visiting card / website" },
  { key: "qr", label: "QR code" },
];

export function handleFor(t, maps) {
  const name = nameSlug(t);
  if (!name) return String(t?._id || "");
  const same = maps?.byName?.[name] || [];
  // the oldest profile with this name keeps the plain handle (maps.list is oldest first)
  if (same.length <= 1 || String(same[0]) === String(t._id)) return name;
  return `${name}-${String(t._id).slice(-4)}`;
}

// handle -> therapist _id, or null
export function resolveHandle(handle, maps) {
  const h = String(handle || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100);
  if (!h) return null;
  if (/^[a-f0-9]{24}$/.test(h)) return maps.list.some((t) => String(t._id) === h) ? h : null;
  if (maps.bySlug[h]) return String(maps.bySlug[h]);
  const same = maps.byName[h];
  if (same?.length) return String(same[0]);
  const m = /^(.+)-([a-f0-9]{4})$/.exec(h);
  if (m && maps.byName[m[1]]) {
    const id = maps.byName[m[1]].find((x) => String(x).endsWith(m[2]));
    if (id) return String(id);
  }
  return null;
}

export const linkUrl = (handle, place) => `${SITE}/t/${handle}${place ? `?src=my-${place}` : ""}`;
