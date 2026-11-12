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
import { getMinFee, split as splitList } from "./therapist-directory";

const W = 1200, H = 630;
const GREEN = "#14532d", GOLD = "#e0ab45";

// Next ships Noto Sans with next/og; pointing Pango at the file makes the text look the same
// on the server as here (the VPS has no Arial).
const FONT = (() => {
  const p = path.join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf");
  return fs.existsSync(p) ? p : undefined;
})();
// bold weight: registering the file once lets Pango draw real bold for <b> (the regular file alone faked nothing)
const FONT_BOLD = path.join(process.cwd(), "public/fonts/og/NotoSans-Bold.ttf");
let boldReady = null;
const ensureBold = () => boldReady || (boldReady = fs.existsSync(FONT_BOLD)
  ? sharp({ text: { text: "x", font: "Noto Sans Bold 12", fontfile: FONT_BOLD, rgba: true } }).png().toBuffer().catch(() => null)
  : Promise.resolve(null));

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
  await ensureBold();
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
  about: { kicker: "ABOUT CHOOSE YOUR THERAPIST", title: "Mental health care you can trust", sub: "Verified psychologists across India since 2020 — and our own centre in Noida" },
  internship: { kicker: "INTERNSHIPS IN PSYCHOLOGY", title: "Learn from practising psychologists", sub: "Supervised clinical internships — online and at our Noida centre" },
  business: { kicker: "CORPORATE WELLNESS", title: "Mental health support at work", sub: "Workshops, counselling and wellbeing programmes for your team" },
  schools: { kicker: "SCHOOLS & COLLEGES", title: "Mental health support for students", sub: "Counselling, workshops and a crisis pathway — by verified psychologists" },
  collab: { kicker: "COLLABORATE WITH CYT · NOIDA", title: "Practise at our Noida centre", sub: "Therapy rooms and clients for psychologists — apply in a few minutes" },
  booking: { kicker: "BOOK A SESSION", title: "Book a session with a verified psychologist", sub: "Pick a time, pay online — video, audio or in person" },
  assessment: { kicker: "MENTAL HEALTH SCREENING", title: "{concern}", sub: "A standard screening test — take it online, or with a psychologist" },
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

// Renewal advert for the "your plan is ending / has ended" emails: /api/renew-card/<id>-<soon|ended>.png
// Photo on the left; on the right the logo, a headline, what the plan gives and the price, and a gold button.
export async function renewCard(t, { state = "ended", days = 0 } = {}) {
  const PW = 430;
  const buf = t ? await fetchPhoto(uploadUrl(t)) : null;
  const layers = [];
  // right side: deep green with a soft gold glow
  layers.push({ input: Buffer.from(`<svg width="${W - PW}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="100%" cy="0%" r="120%"><stop offset="0" stop-color="#1f7a4a"/><stop offset=".5" stop-color="#135c37"/><stop offset="1" stop-color="#0b3f26"/></radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f2c94c" stop-opacity=".42"/><stop offset="1" stop-color="#f2c94c" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="${W - PW - 20}" cy="10" r="230" fill="url(#glow)"/>
    <circle cx="${W - PW + 10}" cy="${H + 10}" r="150" fill="none" stroke="#ffffff" stroke-opacity=".08"/>
    <circle cx="${W - PW + 10}" cy="${H + 10}" r="105" fill="none" stroke="#f2c94c" stroke-opacity=".16"/>
  </svg>`), left: PW, top: 0 });
  if (buf) {
    layers.push({ input: await sharp(buf).rotate().resize(PW, H, { fit: "cover", position: "attention" }).png().toBuffer(), left: 0, top: 0 });
  } else {
    layers.push({ input: rect(PW, H, "#dcebe1"), left: 0, top: 0 });
    const lgp = await logo(300);
    layers.push({ input: lgp.data, left: Math.round((PW - lgp.info.width) / 2), top: Math.round((H - lgp.info.height) / 2) });
  }
  layers.push({ input: rect(8, H, GOLD), left: PW, top: 0 });
  // name strip over the photo
  const nm = cleanName(t);
  if (nm) {
    layers.push({ input: Buffer.from(`<svg width="${PW}" height="150" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#s)"/></svg>`), left: 0, top: H - 150 });
    const n1 = await text(`<b>${esc(nm)}</b>`, { size: 30, color: "#ffffff", width: PW - 48, lines: 1 });
    layers.push({ input: n1.data, left: 24, top: H - 30 - n1.info.height - 30 });
    const n2 = await text(esc(t?.profile_type || "Psychologist"), { size: 20, color: "#f6d58a", width: PW - 48, lines: 1 });
    layers.push({ input: n2.data, left: 24, top: H - 26 - n2.info.height });
  }

  const X = PW + 56, TW = W - X - 48;
  let y = 44;
  // white pill behind the logo so it reads on green
  const lg = await logo(210);
  layers.push({ input: rect(lg.info.width + 28, lg.info.height + 18, "#ffffff", 14), left: X, top: y });
  layers.push({ input: lg.data, left: X + 14, top: y + 9 });
  y += lg.info.height + 18 + 26;

  const tag = state === "ended" ? "YOUR PLAN HAS ENDED" : days > 1 ? `YOUR PLAN ENDS IN ${days} DAYS` : "YOUR PLAN ENDS TOMORROW";
  const chip = await text(`<b>${tag}</b>`, { size: 16, color: "#f6d58a", width: 520 });
  layers.push({ input: rect(chip.info.width + 30, chip.info.height + 14, "#f2c94c", 16, 0.16), left: X, top: y });
  layers.push({ input: chip.data, left: X + 15, top: y + 7 });
  y += chip.info.height + 14 + 18;

  const head = state === "ended"
    ? `Get back on the <span foreground="#f2c94c">CYT home page</span>`
    : `Stay on the <span foreground="#f2c94c">CYT home page</span>`;
  const h1 = await text(`<b>${head}</b>`, { size: 50, color: "#ffffff", width: TW, lines: 2 });
  layers.push({ input: h1.data, left: X, top: y });
  y += h1.info.height + 20;

  for (const line of ["Shown to visitors on the home page", "Featured in concern &amp; city sections", "Profile insights, reviews &amp; booking tools"]) {
    const li = await text(`<span foreground="#f2c94c">✓</span>   ${line}`, { size: 23, color: "#e7f2ea", width: TW });
    layers.push({ input: li.data, left: X, top: y });
    y += li.info.height + 10;
  }

  // price + button along the bottom
  const BY = H - 44 - 70;
  const price = await text(`Plans from <b><span foreground="#f2c94c">₹20/day</span></b>`, { size: 24, color: "#ffffff", width: 300 });
  layers.push({ input: price.data, left: X, top: BY + Math.round((70 - price.info.height) / 2) });
  const btnW = 290, btnX = W - 48 - btnW;
  layers.push({ input: Buffer.from(`<svg width="${btnW}" height="70" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#e3a83a"/></linearGradient></defs><rect width="${btnW}" height="70" rx="16" fill="url(#b)"/></svg>`), left: btnX, top: BY });
  const bt = await text(`<b>${state === "ended" ? "Renew now  →" : "Renew in 1 min  →"}</b>`, { size: 26, color: "#1f2a14", width: btnW, align: "centre" });
  layers.push({ input: bt.data, left: btnX + Math.round((btnW - bt.info.width) / 2), top: BY + Math.round((70 - bt.info.height) / 2) });

  return sharp(await canvas()).composite(layers).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
}

// "Scan to book" poster for a therapist's clinic / desk (A4 portrait, 1240x1754 = 150 dpi):
// green top band with the logo; the photo in a gold-framed arch with a gold "Verified" seal on its corner;
// name, role, city · rating; a big QR in a white card with their CYT ID written up one side and the
// site down the other; the short link; a green footer. qr = PNG of their /t/<name>?src=my-qr link.
const archPath = (w, h, r = 22) => `M0 ${w / 2} A ${w / 2} ${w / 2} 0 0 1 ${w} ${w / 2} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} Z`;

// gold scalloped seal with a green centre, a tick and "VERIFIED"
async function verifiedSeal(size) {
  const c = size / 2, n = 28, ro = c, ri = c * 0.9;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? ri : ro;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const base = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset=".55" stop-color="#e0ab45"/><stop offset="1" stop-color="#b8821f"/></linearGradient></defs>
    <polygon points="${pts}" fill="url(#gd)"/>
    <circle cx="${c}" cy="${c}" r="${c * 0.76}" fill="#ffffff"/>
    <circle cx="${c}" cy="${c}" r="${c * 0.68}" fill="#135c37"/>
    <circle cx="${c}" cy="${c}" r="${c * 0.62}" fill="none" stroke="#f2c94c" stroke-opacity=".55" stroke-width="2" stroke-dasharray="3 5"/>
    <path d="M ${c - size * 0.13} ${c - size * 0.06} l ${size * 0.09} ${size * 0.09} l ${size * 0.17} -${size * 0.18}" fill="none" stroke="#f6d58a" stroke-width="${size * 0.05}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`);
  const word = await text("<b>VERIFIED</b>", { size: Math.round(size * 0.1), color: "#ffffff", width: size, align: "centre" });
  const cyt = await text("<b>CYT</b>", { size: Math.round(size * 0.075), color: "#f6d58a", width: size, align: "centre" });
  return sharp(base).composite([
    { input: word.data, left: Math.round(c - word.info.width / 2), top: Math.round(c + size * 0.1) },
    { input: cyt.data, left: Math.round(c - cyt.info.width / 2), top: Math.round(c - size * 0.29) },
  ]).png().toBuffer();
}

// a line of text turned to read upwards (left side) or downwards (right side)
async function vertical(markup, { size, color, angle }) {
  const tx = await text(markup, { size, color, width: 1200 });
  return sharp(tx.data).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer({ resolveWithObject: true });
}

// a row of rounded pills centred on cx; returns the row height
async function pillRow(layers, items, { cx, y, size = 25, color = "#24412f", fill = "#eef6f0", stroke = "", padX = 22, h = 50, gap = 12, maxW = 1080 }) {
  const imgs = await Promise.all(items.map((p) => text(p, { size, color, width: 600, lines: 1 })));
  // drop items from the end until the row fits
  while (imgs.length > 1 && imgs.reduce((a, p) => a + p.info.width + padX * 2, 0) + gap * (imgs.length - 1) > maxW) imgs.pop();
  const total = imgs.reduce((a, p) => a + p.info.width + padX * 2, 0) + gap * (imgs.length - 1);
  let px = Math.round(cx - total / 2);
  for (const p of imgs) {
    const w = p.info.width + padX * 2;
    layers.push({ input: Buffer.from(`<svg width="${w}" height="${h}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="2"` : ""}/></svg>`), left: px, top: y });
    layers.push({ input: p.data, left: px + padX, top: y + Math.round((h - p.info.height) / 2) });
    px += w + gap;
  }
  return h;
}

export async function posterPng(t, { qr, link }) {
  const PW = 1240, PH = 1754, cx = PW / 2, FOOT = 170;
  const layers = [];
  layers.push({ input: Buffer.from(`<svg width="${PW}" height="${PH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="100%" cy="0%" r="110%"><stop offset="0" stop-color="#1f7a4a"/><stop offset=".55" stop-color="#135c37"/><stop offset="1" stop-color="#0b3f26"/></radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f2c94c" stop-opacity=".4"/><stop offset="1" stop-color="#f2c94c" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="#fbf8f0"/>
    <path d="M0 0 H${PW} V330 Q${cx} 450 0 330 Z" fill="url(#g)"/>
    <circle cx="${PW - 90}" cy="40" r="300" fill="url(#glow)"/>
    <circle cx="80" cy="270" r="110" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>
    <circle cx="80" cy="270" r="72" fill="none" stroke="#f2c94c" stroke-opacity=".14" stroke-width="2"/>
    <rect x="0" y="${PH - FOOT}" width="${PW}" height="${FOOT}" fill="#0b3f26"/>
    <rect x="0" y="${PH - FOOT - 6}" width="${PW}" height="6" fill="${GOLD}"/>
  </svg>`), left: 0, top: 0 });

  // eyebrow on the green band
  const eb = await text("<b>VERIFIED THERAPIST  ·  CHOOSE YOUR THERAPIST</b>", { size: 22, color: "#f6d58a", width: PW - 160, align: "centre" });
  layers.push({ input: eb.data, left: Math.round(cx - eb.info.width / 2), top: 42 });

  // photo in a gold-framed arch
  const AW = 300, AH = 360, F = 12, top = 100;
  const FW = AW + F * 2, FH = AH + F * 2;
  layers.push({ input: Buffer.from(`<svg width="${FW + 24}" height="${FH + 24}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#c9922c"/></linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#062a18" flood-opacity=".35"/></filter></defs>
    <g transform="translate(12 8)" filter="url(#sh)"><path d="${archPath(FW, FH, 28)}" fill="url(#fg)"/></g>
  </svg>`), left: Math.round(cx - FW / 2 - 12), top: top - F - 8 });
  const buf = t ? await fetchPhoto(uploadUrl(t)) : null;
  const mask = Buffer.from(`<svg width="${AW}" height="${AH}"><path d="${archPath(AW, AH, 18)}"/></svg>`);
  const photo = buf
    ? await sharp(await sharp(buf).rotate().resize(AW, AH, { fit: "cover", position: "attention" }).png().toBuffer()).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer()
    : await sharp({ create: { width: AW, height: AH, channels: 4, background: "#dcebe1" } }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  layers.push({ input: photo, left: Math.round(cx - AW / 2), top });
  const S = 150;
  layers.push({ input: await verifiedSeal(S), left: Math.round(cx + AW / 2 - S * 0.55), top: top + AH - S * 0.7 });

  let y = top + AH + F + 30;
  const name = await text(`<b>${esc(cleanName(t) || "Your therapist")}</b>`, { size: 66, color: "#0b1712", width: PW - 160, align: "centre", lines: 1 });
  layers.push({ input: name.data, left: Math.round(cx - name.info.width / 2), top: y });
  y += name.info.height + 4;
  const role = await text(`<b>${esc(t?.profile_type || "Psychologist")}</b>`, { size: 34, color: "#1e7a4c", width: PW - 160, align: "centre", lines: 1 });
  layers.push({ input: role.data, left: Math.round(cx - role.info.width / 2), top: y });
  y += role.info.height + 20;

  // city · rating · languages
  const r = ratingOf(t);
  const langs = splitList(t?.language_spoken).slice(0, 3);
  const pills = [
    cityOf(t) && esc(cityOf(t)),
    r && `<span foreground="${GOLD}">★</span> <b>${r.avg}</b>  (${r.n} review${r.n > 1 ? "s" : ""})`,
    langs.length && esc(langs.join(" · ")),
  ].filter(Boolean);
  if (pills.length) y += (await pillRow(layers, pills, { cx, y })) + 24;

  // what they help with
  const helps = splitList(t?.experties).filter((x) => x.length <= 34).slice(0, 4).map(esc);
  if (helps.length) {
    const hl = await text("<b>HELPS WITH</b>", { size: 20, color: "#8a6a1f", width: 400, align: "centre" });
    layers.push({ input: hl.data, left: Math.round(cx - hl.info.width / 2), top: y });
    y += hl.info.height + 10;
    y += (await pillRow(layers, helps, { cx, y, size: 24, color: "#0b3f26", fill: "#ffffff", stroke: "#e3cf9b", h: 48 })) + 30;
  } else y += 10;

  // booking panel: QR card on the left, headline + steps + fee + ID on the right
  const PANEL_W = 1060, PX = Math.round(cx - PANEL_W / 2), PAD = 36;
  const Q = 420, CARD = Q + 48;
  const RX = PX + PAD + CARD + 44, RW = PX + PANEL_W - PAD - RX;
  const right = [];
  let ry = 0;
  const head = await text("<b>Scan to book\na session</b>", { size: 50, color: "#0b3f26", width: RW });
  right.push({ input: head.data, left: 0, top: ry });
  ry += head.info.height + 22;
  const steps = ["Scan the QR with your phone camera", "Pick a day and time that suits you", "Talk online or meet in person"];
  for (let i = 0; i < steps.length; i++) {
    const D = 44;
    right.push({ input: Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#135c37"/></svg>`), left: 0, top: ry });
    const num = await text(`<b>${i + 1}</b>`, { size: 24, color: "#f6d58a", width: D, align: "centre" });
    right.push({ input: num.data, left: Math.round((D - num.info.width) / 2), top: ry + Math.round((D - num.info.height) / 2) });
    const st = await text(steps[i], { size: 26, color: "#334155", width: RW - D - 16 });
    right.push({ input: st.data, left: D + 16, top: ry + Math.max(0, Math.round((D - st.info.height) / 2)) });
    ry += Math.max(D, st.info.height) + 16;
  }
  const fee = getMinFee(t?.fees);
  const code = String(t?.profile_code || "").trim();
  const meta = [fee && `Sessions from <b>₹${fee.toLocaleString("en-IN")}</b>`, code && `CYT ID  <b>${esc(code)}</b>`].filter(Boolean);
  if (meta.length) {
    ry += 8;
    for (const m of meta) {
      const mt = await text(m, { size: 24, color: "#5b4a1f", width: RW - 40, lines: 1 });
      const w = mt.info.width + 36, h = 46;
      right.push({ input: rect(w, h, "#fdf3dc", 23), left: 0, top: ry });
      right.push({ input: mt.data, left: 18, top: ry + Math.round((h - mt.info.height) / 2) });
      ry += h + 10;
    }
    ry -= 10;
  }
  const PANEL_H = Math.max(CARD, ry) + PAD * 2;
  layers.push({ input: Buffer.from(`<svg width="${PANEL_W + 30}" height="${PANEL_H + 40}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="ps" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#0b3f26" flood-opacity=".13"/></filter></defs>
    <rect x="15" y="8" width="${PANEL_W}" height="${PANEL_H}" rx="36" fill="#ffffff" stroke="#e7dcc0" stroke-width="2" filter="url(#ps)"/>
  </svg>`), left: PX - 15, top: y - 8 });
  const cardY = y + Math.round((PANEL_H - CARD) / 2);
  layers.push({ input: Buffer.from(`<svg width="${CARD}" height="${CARD}"><rect x="2" y="2" width="${CARD - 4}" height="${CARD - 4}" rx="26" fill="#ffffff" stroke="${GOLD}" stroke-width="4"/></svg>`), left: PX + PAD, top: cardY });
  if (qr) layers.push({ input: await sharp(qr).resize(Q, Q, { kernel: "nearest" }).png().toBuffer(), left: PX + PAD + 24, top: cardY + 24 });
  const rTop = y + Math.round((PANEL_H - ry) / 2);
  for (const l of right) layers.push({ ...l, left: RX + l.left, top: rTop + l.top });
  y += PANEL_H + 40;

  // link, centred, with a small label
  const lnLabel = await text("Or open your booking link", { size: 22, color: "#64748b", width: PW - 160, align: "centre" });
  const ln = await text(`<b>${esc(String(link || "").replace(/^https:\/\/www\./, ""))}</b>`, { size: 32, color: "#135c37", width: PW - 160, align: "centre", lines: 1 });
  const footTop = PH - FOOT - 6;
  const block = lnLabel.info.height + 6 + ln.info.height;
  const ly = y + Math.max(0, Math.round((footTop - y - block) / 2));
  layers.push({ input: lnLabel.data, left: Math.round(cx - lnLabel.info.width / 2), top: ly });
  layers.push({ input: ln.data, left: Math.round(cx - ln.info.width / 2), top: ly + lnLabel.info.height + 6 });

  // footer: logo pill + site + tagline
  const FY = PH - FOOT;
  const flg = await logo(240);
  const site = await text(`<b>chooseyourtherapist.in</b>`, { size: 42, color: "#f2c94c", width: 700 });
  const tag = await text("Verified psychologists  ·  Online &amp; in person", { size: 24, color: "#cfe3d6", width: 700 });
  const pillW = flg.info.width + 36, pillH = flg.info.height + 24, GAPF = 40;
  const textW = Math.max(site.info.width, tag.info.width);
  const fx = Math.round(cx - (pillW + GAPF + textW) / 2);
  layers.push({ input: rect(pillW, pillH, "#ffffff", 18), left: fx, top: FY + Math.round((FOOT - pillH) / 2) });
  layers.push({ input: flg.data, left: fx + 18, top: FY + Math.round((FOOT - pillH) / 2) + 12 });
  const tx = fx + pillW + GAPF, th = site.info.height + 6 + tag.info.height;
  layers.push({ input: site.data, left: tx, top: FY + Math.round((FOOT - th) / 2) });
  layers.push({ input: tag.data, left: tx, top: FY + Math.round((FOOT - th) / 2) + site.info.height + 6 });

  return sharp({ create: { width: PW, height: PH, channels: 3, background: "#fbf8f0" } }).png().composite(layers).png({ compressionLevel: 9 }).toBuffer();
}

/* ─── Desk table tent (print on A4, cut, fold, stand) ───
   Sheet top→bottom: glue tab | back panel (QR, printed upside down) | front panel (photo, name).
   Fold on both dashed lines so the two panels form an A-frame; the tab glues inside the front's lower edge. */
// front: a headline cover in deep green + gold (no photo, no logo image — just type and shapes)
async function tentFront(t, link, W, H) {
  const L = [];
  L.push({ input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d4a2e"/><stop offset="1" stop-color="#06301d"/></linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8d77e"/><stop offset="1" stop-color="#d9a032"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <circle cx="${W - 120}" cy="${H - 110}" r="330" fill="#13603b" fill-opacity=".55"/>
    <circle cx="${W - 120}" cy="${H - 110}" r="250" fill="#177045" fill-opacity=".55"/>
    <circle cx="${W - 120}" cy="${H - 110}" r="170" fill="url(#sun)"/>
    <circle cx="${W - 120}" cy="${H - 110}" r="200" fill="none" stroke="#f6d58a" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 10"/>
    <rect x="56" y="58" width="56" height="5" rx="2.5" fill="#f2c94c"/>
  </svg>`), left: 0, top: 0 });

  const X = 56;
  const brand = await text("<b>CHOOSE YOUR THERAPIST</b>", { size: 20, color: "#f6d58a", width: 500 });
  L.push({ input: brand.data, left: X + 70, top: 60 - Math.round(brand.info.height / 2) + 1 });

  let y = 150;
  const h1 = await text("<b>Say it here.</b>", { size: 92, color: "#ffffff", width: W - X * 2 });
  L.push({ input: h1.data, left: X - 4, top: y });
  y += 108;
  const h2 = await text("<b>It stays here.</b>", { size: 92, color: "#f2c94c", width: W - X * 2 });
  L.push({ input: h2.data, left: X - 4, top: y });
  y += 128;
  const sub = await text("Talk to someone who truly listens —\nonline or in person.", { size: 29, color: "#cfe6d8", width: 520 });
  L.push({ input: sub.data, left: X, top: y });

  // who: name + role at the bottom left, with a verified chip
  const nm = await text(`<b>${esc(cleanName(t) || "Your therapist")}</b>`, { size: 38, color: "#ffffff", width: 480, lines: 1 });
  const rl = await text(esc(t?.profile_type || "Psychologist"), { size: 24, color: "#cfe6d8", width: 480, lines: 1 });
  const chip = await text("<b>✓ CYT VERIFIED</b>", { size: 17, color: "#0b3f26", width: 300 });
  const by = H - 56 - rl.info.height - 6 - nm.info.height - 14 - 34;
  const cw = chip.info.width + 26;
  L.push({ input: rect(cw, 34, "#f2c94c", 17), left: X, top: by });
  L.push({ input: chip.data, left: X + 13, top: by + Math.round((34 - chip.info.height) / 2) });
  L.push({ input: nm.data, left: X, top: by + 34 + 14 });
  L.push({ input: rl.data, left: X, top: by + 34 + 14 + nm.info.height + 6 });

  // nudge on the sun: "book on the back"
  const nb = await text("<b>Scan the\nback to\nbook</b>", { size: 26, color: "#0b3f26", width: 200, align: "centre" });
  L.push({ input: nb.data, left: Math.round(W - 120 - nb.info.width / 2), top: Math.round(H - 110 - nb.info.height / 2) });
  return sharp({ create: { width: W, height: H, channels: 4, background: "#0b3f26" } }).composite(L).png().toBuffer();
}

// back: warm gold with soft rings, white QR card, how-to, fee + ID, link
async function tentBack(t, qr, W, H, link) {
  const L = [];
  L.push({ input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7d57c"/><stop offset="1" stop-color="#e8ae3e"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#b)"/>
    <circle cx="0" cy="0" r="260" fill="#ffffff" fill-opacity=".14"/>
    <circle cx="0" cy="0" r="170" fill="#ffffff" fill-opacity=".12"/>
    <circle cx="${W}" cy="${H}" r="300" fill="#0b3f26" fill-opacity=".08"/>
    <circle cx="${W}" cy="${H}" r="200" fill="#0b3f26" fill-opacity=".08"/>
    <rect y="${H - 74}" width="${W}" height="74" fill="#0b3f26"/>
  </svg>`), left: 0, top: 0 });
  let y = 0;
  const hd = await text("<b>Book a session</b>", { size: 50, color: "#0b3f26", width: W - 60, align: "centre", lines: 1 });
  L.push({ input: hd.data, left: Math.round(W / 2 - hd.info.width / 2), top: y });
  y += 70;
  const sb = await text("Point your phone camera at the code", { size: 24, color: "#3f3417", width: W - 60, align: "centre" });
  L.push({ input: sb.data, left: Math.round(W / 2 - sb.info.width / 2), top: y });
  y += sb.info.height + 20;
  const Q = 350, C = Q + 44;
  L.push({ input: Buffer.from(`<svg width="${C + 20}" height="${C + 24}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="s" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#5a3d00" flood-opacity=".25"/></filter></defs><rect x="10" y="6" width="${C}" height="${C}" rx="28" fill="#ffffff" filter="url(#s)"/></svg>`), left: Math.round(W / 2 - C / 2 - 10), top: y - 6 });
  if (qr) L.push({ input: await sharp(qr).resize(Q, Q, { kernel: "nearest" }).png().toBuffer(), left: Math.round(W / 2 - Q / 2), top: y + 22 });
  y += C + 22;
  const fee = getMinFee(t?.fees);
  const code = String(t?.profile_code || "").trim();
  const pills = [fee && `Sessions from <b>₹${fee.toLocaleString("en-IN")}</b>`, code && `CYT ID <b>${esc(code)}</b>`].filter(Boolean);
  if (pills.length) y += await pillRow(L, pills, { cx: W / 2, y, size: 22, color: "#0b3f26", fill: "#fff7e3", stroke: "#0b3f26", h: 44, maxW: W - 40 });
  // centre the block in the space above the dark strip
  const shift = Math.max(0, Math.round((H - 74 - y) / 2));
  for (let i = 1; i < L.length; i++) L[i].top += shift;
  const ln = await text(`<b>${esc(String(link || "").replace(/^https:\/\/www\./, ""))}</b>`, { size: 24, color: "#f6d58a", width: W - 40, align: "centre", lines: 1 });
  L.push({ input: ln.data, left: Math.round(W / 2 - ln.info.width / 2), top: H - 74 + Math.round((74 - ln.info.height) / 2) });
  return sharp({ create: { width: W, height: H, channels: 4, background: "#f2c94c" } }).composite(L).png().toBuffer();
}

export async function tentPng(t, { qr, link }) {
  const SW = 1240, SH = 1754; // A4 at 150 dpi
  const W = 840, H = 760, TAB = 100, X = Math.round((SW - W) / 2), TOP = 96;
  const yTab = TOP, yBack = TOP + TAB, yFront = yBack + H, yEnd = yFront + H;
  const [front, back] = await Promise.all([tentFront(t, link, W, H), tentBack(t, qr, W, H, link)]);
  const L = [];
  const howto = await text("<b>Cut</b> along the solid outline  ·  <b>Fold</b> on both dashed lines  ·  <b>Glue</b> the tab inside the front", { size: 22, color: "#475569", width: SW - 100, align: "centre", lines: 1 });
  L.push({ input: howto.data, left: Math.round(SW / 2 - howto.info.width / 2), top: Math.round((TOP - howto.info.height) / 2) });
  // glue tab (slightly tapered so it tucks in neatly)
  L.push({ input: Buffer.from(`<svg width="${W}" height="${TAB}"><path d="M40 0 H${W - 40} L${W} ${TAB} H0 Z" fill="#eef1ef"/></svg>`), left: X, top: yTab });
  const gl = await text("<b>GLUE HERE</b>", { size: 22, color: "#94a3b8", width: 400, align: "centre" });
  L.push({ input: await sharp(gl.data).rotate(180, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), left: Math.round(SW / 2 - gl.info.width / 2), top: yTab + Math.round((TAB - gl.info.height) / 2) });
  L.push({ input: await sharp(back).rotate(180).png().toBuffer(), left: X, top: yBack });
  L.push({ input: front, left: X, top: yFront });
  // cut outline + fold lines + markers
  L.push({ input: Buffer.from(`<svg width="${SW}" height="${SH}" xmlns="http://www.w3.org/2000/svg">
    <path d="M${X + 40} ${yTab} H${X + W - 40} L${X + W} ${yBack} V${yEnd} H${X} V${yBack} Z" fill="none" stroke="#334155" stroke-width="2.5"/>
    <line x1="${X - 30}" y1="${yBack}" x2="${X + W + 30}" y2="${yBack}" stroke="#64748b" stroke-width="2.5" stroke-dasharray="14 10"/>
    <line x1="${X - 30}" y1="${yFront}" x2="${X + W + 30}" y2="${yFront}" stroke="#64748b" stroke-width="2.5" stroke-dasharray="14 10"/>
  </svg>`), left: 0, top: 0 });
  for (const [yy, lbl] of [[yBack, "FOLD"], [yFront, "FOLD"]]) {
    const f = await text(`<b>${lbl}</b>`, { size: 18, color: "#64748b", width: 200 });
    L.push({ input: f.data, left: X + W + 40, top: yy - Math.round(f.info.height / 2) });
    L.push({ input: f.data, left: X - 40 - f.info.width, top: yy - Math.round(f.info.height / 2) });
  }
  const cut = await text("CUT", { size: 18, color: "#334155", width: 200 });
  L.push({ input: (await sharp(cut.data).rotate(-90, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()), left: X - 30, top: yFront + Math.round(H / 2) });
  const ft = await text("Choose Your Therapist  ·  desk card", { size: 18, color: "#94a3b8", width: 600, align: "centre" });
  L.push({ input: ft.data, left: Math.round(SW / 2 - ft.info.width / 2), top: yEnd + Math.round((SH - yEnd - ft.info.height) / 2) });
  return sharp({ create: { width: SW, height: SH, channels: 3, background: "#ffffff" } }).png().composite(L).png({ compressionLevel: 9 }).toBuffer();
}


/* ─── Tweet-style post for the therapist's own Instagram / WhatsApp (pages/therapists/social-posts.js) ───
   Green gradient background with a frosted "tweet" card: round photo, name + green tick, profile type,
   their own short line, date + booking link. No logo, no rating / reviews (owner's choice).
   size: post = 1080x1080 · story = 1080x1920 (story adds a QR, since links in a WhatsApp status can't be tapped). */
export async function tweetCard(t, { words = "", size = "post", link = "", qr = null } = {}) {
  const story = size === "story";
  const W2 = 1080, H2 = story ? 1920 : 1080, M = 72, CW = W2 - M * 2, PAD = 56, IW = CW - PAD * 2;
  const name = esc(cleanName(t) || "Your therapist");
  const role = esc(t?.profile_type || "Psychologist");
  const body = esc(String(words || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 280)) || "Your words here.";
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).replace(/ (\d{4})$/, ", $1");

  const parts = [];
  let y = PAD;
  const D = 116;
  const buf = t ? await fetchPhoto(uploadUrl(t)) : null;
  const circle = Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}"/></svg>`);
  const av = buf
    ? await sharp(await sharp(buf).rotate().resize(D, D, { fit: "cover", position: "attention" }).png().toBuffer()).composite([{ input: circle, blend: "dest-in" }]).png().toBuffer()
    : await sharp({ create: { width: D, height: D, channels: 4, background: "#f6d9b8" } }).composite([{ input: circle, blend: "dest-in" }]).png().toBuffer();
  parts.push({ input: av, left: PAD, top: y });
  const tx = PAD + D + 26, TW = IW - D - 26 - 50;
  const nm = await text(`<b>${name}</b>`, { size: 40, color: "#0f1419", width: TW, lines: 1 });
  const rl = await text(role, { size: 32, color: "#536471", width: IW - D - 26, lines: 1 });
  const ny = y + Math.round((D - nm.info.height - 6 - rl.info.height) / 2);
  parts.push({ input: nm.data, left: tx, top: ny });
  const S = 36; // green verified tick next to the name
  const tick = Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#1e8a4f"/><path d="M ${S * 0.28} ${S * 0.52} l ${S * 0.15} ${S * 0.15} l ${S * 0.3} -${S * 0.32}" fill="none" stroke="#fff" stroke-width="${S * 0.11}" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  parts.push({ input: tick, left: tx + nm.info.width + 10, top: ny + Math.round((nm.info.height - S) / 2) });
  parts.push({ input: rl.data, left: tx, top: ny + nm.info.height + 6 });
  y += D + 44;
  const msg = await text(body, { size: story ? 58 : 50, color: "#0f1419", width: IW, lines: story ? 12 : 7 });
  parts.push({ input: msg.data, left: PAD, top: y });
  y += msg.info.height + 44;
  const meta = await text(`${date}  ·  Book: <span foreground="#1e7a4c">www.chooseyourtherapist.in</span>`, { size: 30, color: "#6b7a86", width: IW, lines: 1 });
  parts.push({ input: meta.data, left: PAD, top: y });
  y += meta.info.height;
  y += PAD + 6;
  const CH = y;

  // frosted card: translucent white with a soft mint tint and a bright edge
  const cardBg = Buffer.from(`<svg width="${CW}" height="${CH}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".55" stop-color="#f3fbf6" stop-opacity=".9"/><stop offset="1" stop-color="#ddf3e5" stop-opacity=".88"/></linearGradient></defs>
    <rect x="2" y="2" width="${CW - 4}" height="${CH - 4}" rx="34" fill="url(#c)" stroke="#ffffff" stroke-opacity=".75" stroke-width="4"/>
  </svg>`);
  const card = await sharp({ create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: cardBg, left: 0, top: 0 }, ...parts]).png().toBuffer();
  const shadow = await sharp(Buffer.from(`<svg width="${CW + 120}" height="${CH + 120}"><rect x="60" y="80" width="${CW}" height="${CH}" rx="34" fill="#021a0e" fill-opacity=".45"/></svg>`)).blur(28).png().toBuffer();

  // green brand gradient: deep forest bottom-left → fresh mint top-right, with a soft gold glow
  const bg = Buffer.from(`<svg width="${W2}" height="${H2}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#073620"/><stop offset=".4" stop-color="#14663d"/><stop offset=".75" stop-color="#2a9a5f"/><stop offset="1" stop-color="#7fd3a0"/></linearGradient>
      <radialGradient id="a" cx="0" cy="1" r="0.8"><stop offset="0" stop-color="#021f12" stop-opacity=".7"/><stop offset="1" stop-color="#021f12" stop-opacity="0"/></radialGradient>
      <radialGradient id="b" cx="1" cy="0" r="0.6"><stop offset="0" stop-color="#f2c94c" stop-opacity=".45"/><stop offset="1" stop-color="#f2c94c" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#a)"/><rect width="100%" height="100%" fill="url(#b)"/>
  </svg>`);

  const layers = [{ input: bg, left: 0, top: 0 }];
  const QB = story && qr ? 300 : 0; // room for the QR row at the bottom of a story
  const cy = Math.max(48, Math.round((H2 - QB - CH) / 2));
  layers.push({ input: shadow, left: M - 60, top: cy - 60 }, { input: card, left: M, top: cy });
  if (QB) {
    const Q = 200, qy = H2 - M - Q - 30;
    const lead = await text("<b>Scan to book a session</b>", { size: 36, color: "#0f1419", width: CW - Q - 120 });
    const sub = await text("www.chooseyourtherapist.in", { size: 28, color: "#1e7a4c", width: CW - Q - 120, lines: 1 });
    const box = Buffer.from(`<svg width="${CW}" height="${Q + 30}"><rect x="2" y="2" width="${CW - 4}" height="${Q + 26}" rx="28" fill="#ffffff" fill-opacity=".88" stroke="#ffffff" stroke-width="4"/></svg>`);
    layers.push({ input: box, left: M, top: qy });
    layers.push({ input: await sharp(qr).resize(Q, Q, { kernel: "nearest" }).png().toBuffer(), left: M + 15, top: qy + 15 });
    const lx = M + Q + 50, ly = qy + Math.round((Q + 30 - lead.info.height - 8 - sub.info.height) / 2);
    layers.push({ input: lead.data, left: lx, top: ly }, { input: sub.data, left: lx, top: ly + lead.info.height + 8 });
  }
  return sharp({ create: { width: W2, height: H2, channels: 3, background: "#14663d" } }).png().composite(layers).png({ compressionLevel: 9 }).toBuffer();
}
