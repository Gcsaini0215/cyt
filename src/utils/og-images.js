// Server-only: the share / search images (og:image, schema "image") built from real photos —
// therapists' own profile photos and the Noida centre — instead of stock pictures.
//   /api/therapist-photo/<slug>.jpg   square photo on our own domain (the uploads have spaces in
//                                     their file names, which broke og:image and the image sitemap)
//   /api/og/therapist/<slug>.jpg      1200x630 card: photo, name, role, city, rating, logo
//   /api/og/site.jpg?page=…           1200x630 card with a grid of real therapist photos
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { getSlugMaps } from "./therapist-slug-maps";
import { uploadUrl } from "./og-urls";
import { cleanName, cityOf } from "./related-therapists";

const W = 1200, H = 630;
const GREEN = "#14532d", GOLD = "#e0ab45";

// Next ships Noto Sans with next/og; pointing Pango at the file makes the text look the same
// on the server as here (the VPS has no Arial).
const FONT = (() => {
  const p = path.join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf");
  return fs.existsSync(p) ? p : undefined;
})();

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function therapistBySlug(file) {
  const slug = String(file || "").replace(/\.(jpe?g|png)$/i, "");
  let maps = await getSlugMaps();
  if (!maps.bySlug[slug]) maps = await getSlugMaps(true);
  const id = maps.bySlug[slug];
  return id ? maps.list.find((t) => String(t._id) === String(id)) : null;
}

// downloaded photos, kept in memory (a profile photo is fetched once, not per request)
const photoCache = new Map();
export async function fetchPhoto(url) {
  if (!url) return null;
  if (photoCache.has(url)) return photoCache.get(url);
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (photoCache.size > 120) photoCache.delete(photoCache.keys().next().value);
    photoCache.set(url, buf);
    return buf;
  } catch { return null; }
}

// a line of text as a transparent PNG (Pango markup: <b>, <span foreground=…>)
async function text(markup, { size = 32, width = 640, color = "#0f172a", bold = false, align = "left", lines = 0 } = {}) {
  const body = `<span foreground="${color}"${bold ? ' weight="bold"' : ""}>${markup}</span>`;
  const img = sharp({ text: { text: body, font: `Noto Sans ${size}`, fontfile: FONT, width, align, rgba: true, dpi: 72, wrap: "word" } });
  const out = await img.png().toBuffer({ resolveWithObject: true });
  if (lines && out.info.height > size * 1.45 * lines) {
    // too long — shrink until it fits the given number of lines
    return text(markup, { size: Math.round(size * 0.88), width, color, bold, align, lines });
  }
  return out;
}

const rounded = (w, h, r) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
async function roundedPhoto(buf, w, h, r) {
  const img = await sharp(buf).rotate().resize(w, h, { fit: "cover", position: "attention" }).png().toBuffer();
  return sharp(img).composite([{ input: rounded(w, h, r), blend: "dest-in" }]).png().toBuffer();
}

let logoBuf = null;
async function logo(width) {
  if (!logoBuf) logoBuf = fs.readFileSync(path.join(process.cwd(), "public/logo.png"));
  return sharp(logoBuf).resize({ width }).png().toBuffer({ resolveWithObject: true });
}

const toJpeg = (base, layers) => sharp(base).composite(layers).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
const canvas = (bg = "#f5faf6") => sharp({ create: { width: W, height: H, channels: 3, background: bg } }).png().toBuffer();
const rect = (w, h, fill, r = 0, opacity = 1) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="${fill}" fill-opacity="${opacity}"/></svg>`);

// square photo for schema / image sitemap
export async function photoJpeg(t) {
  const buf = await fetchPhoto(uploadUrl(t));
  if (!buf) return null;
  return sharp(buf).rotate().resize(800, 800, { fit: "cover", position: "attention" }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

const ratingOf = (t) => {
  const rs = (t?.reviews || []).filter((r) => typeof r.rating === "number");
  return rs.length ? { avg: (rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(1), n: rs.length } : null;
};
const expOf = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return "";
  return /yr|year/i.test(s) ? s : `${s} yrs`;
};

// 1200x630: photo on the left, the therapist's details on the right
export async function therapistCard(t) {
  const PW = 470;
  const buf = await fetchPhoto(uploadUrl(t));
  const layers = [];
  layers.push({ input: rect(8, H, GOLD), left: PW, top: 0 });
  if (buf) {
    layers.push({ input: await sharp(buf).rotate().resize(PW, H, { fit: "cover", position: "attention" }).png().toBuffer(), left: 0, top: 0 });
  } else {
    layers.push({ input: rect(PW, H, "#dcebe1"), left: 0, top: 0 });
  }
  const X = PW + 60, TW = W - X - 50;
  const lg = await logo(270);
  layers.push({ input: lg.data, left: X, top: 46 });

  let y = 46 + lg.info.height + 38;
  const chip = await text("✓  VERIFIED BY CHOOSE YOUR THERAPIST", { size: 17, color: "#ffffff", bold: true, width: 520 });
  layers.push({ input: rect(chip.info.width + 32, chip.info.height + 16, "#1e7a4c", 18), left: X, top: y });
  layers.push({ input: chip.data, left: X + 16, top: y + 8 });
  y += chip.info.height + 16 + 26;

  const name = await text(esc(cleanName(t) || "Psychologist"), { size: 56, bold: true, color: "#0b1712", width: TW, lines: 2 });
  layers.push({ input: name.data, left: X, top: y });
  y += name.info.height + 10;

  const role = await text(esc(t?.profile_type || "Psychologist"), { size: 30, color: "#1e7a4c", bold: true, width: TW });
  layers.push({ input: role.data, left: X, top: y });
  y += role.info.height + 18;

  const facts = [cityOf(t), expOf(t?.year_of_exp) && `${expOf(t.year_of_exp)} experience`].filter(Boolean).join("  ·  ");
  if (facts) {
    const f = await text(esc(facts), { size: 24, color: "#475569", width: TW });
    layers.push({ input: f.data, left: X, top: y });
    y += f.info.height + 14;
  }
  const r = ratingOf(t);
  if (r) {
    const full = Math.round(Number(r.avg));
    const rt = await text(`<span foreground="${GOLD}">${"★".repeat(full)}</span><span foreground="#cbd5d0">${"★".repeat(5 - full)}</span>  <b>${r.avg}</b>  (${r.n} review${r.n > 1 ? "s" : ""})`, { size: 24, color: "#0f172a", width: TW });
    layers.push({ input: rt.data, left: X, top: y });
  }
  const foot = await text("Book online or in person  ·  <b>chooseyourtherapist.in</b>", { size: 21, color: GREEN, width: TW });
  layers.push({ input: foot.data, left: X, top: H - 40 - foot.info.height });
  return toJpeg(await canvas(), layers);
}

const PAGES = {
  home: { kicker: "INDIA'S VERIFIED PSYCHOLOGIST NETWORK", title: "Talk to a verified psychologist", sub: "Online anywhere in India, or in person at our Noida centre" },
  directory: { kicker: "THERAPIST DIRECTORY", title: "{n} verified psychologists", sub: "Compare expertise, languages and fees — book online or in person" },
  city: { kicker: "PSYCHOLOGISTS IN {CITY}", title: "Psychologist in {city}", sub: "Verified psychologists — online, and in person where available" },
  concern: { kicker: "VERIFIED PSYCHOLOGISTS · ONLINE & IN PERSON", title: "{concern}", sub: "Verified psychologists who specialise in it — online or in person" },
  join: { kicker: "FOR PSYCHOLOGISTS & COUNSELLORS", title: "Grow your practice with CYT", sub: "Get verified, get booked online or in person — keep 70% of every session" },
};

// 1200x630: headline on the left, a 3x3 grid of real therapist photos on the right
export async function siteCard({ page = "home", city = "", concern = "" } = {}) {
  const { list } = await getSlugMaps();
  let pool = list.filter((t) => uploadUrl(t));
  pool.sort((a, b) => (a.priority || 9) - (b.priority || 9) || (ratingOf(b)?.n || 0) - (ratingOf(a)?.n || 0));
  if (city) {
    const c = city.toLowerCase();
    const local = pool.filter((t) => String(t.state || t.user?.state || "").toLowerCase().includes(c));
    pool = [...local, ...pool.filter((t) => !local.includes(t))];
  }
  if (concern) {
    // therapists whose expertise covers the concern first ("Therapy for Anxiety" -> "anxiety")
    const word = concern.toLowerCase().replace(/^therapy for\s+/, "").split(/[\s&,]+/)[0];
    const match = pool.filter((t) => String(t.experties || "").toLowerCase().includes(word));
    pool = [...match, ...pool.filter((t) => !match.includes(t))];
  }
  const tpl = PAGES[page] || PAGES.home;
  const fill = (s) => s.replace("{n}", String(list.length)).replace("{city}", city).replace("{CITY}", city.toUpperCase())
    .replace("{concern}", concern).replace("{CONCERN}", concern.toUpperCase());

  const layers = [];
  const G = 3, gap = 12, tile = Math.floor((H - 2 * 40 - (G - 1) * gap) / G), gx = W - 40 - (G * tile + (G - 1) * gap);
  const photos = [];
  for (const t of pool) {
    if (photos.length === G * G) break;
    const b = await fetchPhoto(uploadUrl(t));
    if (b) { try { photos.push(await roundedPhoto(b, tile, tile, 18)); } catch { /* unreadable upload */ } }
  }
  photos.forEach((p, i) => layers.push({ input: p, left: gx + (i % G) * (tile + gap), top: 40 + Math.floor(i / G) * (tile + gap) }));

  const X = 60, TW = gx - X - 40;
  const lg = await logo(300);
  layers.push({ input: lg.data, left: X, top: 52 });
  const k = await text(esc(fill(tpl.kicker)), { size: 18, bold: true, color: "#9a6b12", width: TW });
  layers.push({ input: rect(64, 5, GOLD, 2), left: X, top: 196 });
  layers.push({ input: k.data, left: X, top: 214 });
  const title = await text(esc(fill(tpl.title)), { size: 52, bold: true, color: "#0b1712", width: TW, lines: 3 });
  layers.push({ input: title.data, left: X, top: 250 });
  const s = await text(esc(fill(tpl.sub)), { size: 24, color: "#475569", width: TW });
  layers.push({ input: s.data, left: X, top: 250 + title.info.height + 18 });
  const foot = await text(`<span foreground="${GOLD}">★</span> <b>5.0 on Google</b>  ·  chooseyourtherapist.in`, { size: 22, color: GREEN, width: TW });
  layers.push({ input: foot.data, left: X, top: H - 52 - foot.info.height });
  return toJpeg(await canvas(), layers);
}

// Noida: the real centre photo (Google Business Profile) with the address on it
export async function noidaCard() {
  const photo = fs.readFileSync(path.join(process.cwd(), "public/images/centre/cyt-noida-centre-sector-51.jpg"));
  const layers = [];
  layers.push({ input: await sharp(photo).resize(W, H, { fit: "cover", position: "centre" }).png().toBuffer(), left: 0, top: 0 });
  layers.push({ input: rect(W, 120, "#0b1712", 0, 0.93), left: 0, top: H - 120 });
  const t1 = await text("<b>CYT Therapy Centre, Noida</b>  ·  D-137, Sector 51", { size: 30, color: "#ffffff", width: W - 120 });
  layers.push({ input: t1.data, left: 60, top: H - 120 + 22 });
  const t2 = await text(`In person, online or home visit  ·  <span foreground="${GOLD}">★ 5.0 on Google</span>  ·  chooseyourtherapist.in`, { size: 21, color: "#d9e7de", width: W - 120 });
  layers.push({ input: t2.data, left: 60, top: H - 120 + 22 + t1.info.height + 8 });
  return toJpeg(await canvas(), layers);
}

export const sendJpeg = (res, buf, maxAge = 86400) => {
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=604800`);
  res.status(200).end(buf);
};
