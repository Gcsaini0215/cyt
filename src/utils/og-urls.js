// URLs of the share / search images built from real photos (the images themselves: utils/og-images,
// server-only). Safe to import from pages.
import { therapistSlug } from "./therapist-slug";

export const SITE = "https://www.chooseyourtherapist.in";
const UPLOADS = "https://api.chooseyourtherapist.in/uploads/images";

// the raw upload, with the file name URL-encoded ("WhatsApp Image 2025-09-08 at ….jpg")
export const uploadUrl = (t) => {
  const p = t?.user?.profile || t?.image;
  if (!p || p === "null") return null;
  if (/^https?:\/\//.test(p)) return encodeURI(decodeURI(p));
  return `${UPLOADS}/${encodeURIComponent(p)}`;
};

const version = (t) => {
  const v = Date.parse(t?.user?.updatedAt || t?.updatedAt || "") || 0;
  return v ? `?v=${Math.floor(v / 1000)}` : "";
};

// square 800x800 photo on our own domain (schema "image", image sitemap)
export const therapistPhotoUrl = (t) => (uploadUrl(t) && therapistSlug(t) ? `${SITE}/api/therapist-photo/${therapistSlug(t)}.jpg${version(t)}` : null);
// 1200x630 card: photo, name, role, city, rating (og:image)
export const therapistCardUrl = (t) => (therapistSlug(t) ? `${SITE}/api/og/therapist/${therapistSlug(t)}.jpg${version(t)}` : null);
// 1200x630 card with real therapist photos — page: home | directory | city | concern | noida
export const siteCardUrl = (page = "home", params = {}) => {
  const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join("");
  return `${SITE}/api/og/site.jpg?page=${page}${q}`;
};
// real photos of the Noida centre (Google Business Profile + the team's own)
export const CENTRE_PHOTOS = [
  `${SITE}/images/centre/cyt-noida-centre-sector-51.jpg`,
  `${SITE}/images/centre/cyt-noida-centre-counselling-room.jpg`,
  `${SITE}/images/centre/cyt-noida-centre-team.jpg`,
  `${SITE}/images/centre/cyt-noida-centre-activity-area.jpg`,
  `${SITE}/images/centre/cyt-noida-centre-therapy-room.jpg`,
];
