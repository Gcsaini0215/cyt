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

export async function posterPng(t, { qr, link }) {
  const PW = 1240, PH = 1754, cx = PW / 2;
  const layers = [];
  layers.push({ input: Buffer.from(`<svg width="${PW}" height="${PH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="100%" cy="0%" r="110%"><stop offset="0" stop-color="#1f7a4a"/><stop offset=".55" stop-color="#135c37"/><stop offset="1" stop-color="#0b3f26"/></radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f2c94c" stop-opacity=".45"/><stop offset="1" stop-color="#f2c94c" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="#fbf8f0"/>
    <path d="M0 0 H${PW} V400 Q${cx} 520 0 400 Z" fill="url(#g)"/>
    <circle cx="${PW - 90}" cy="60" r="330" fill="url(#glow)"/>
    <circle cx="90" cy="330" r="120" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>
    <circle cx="90" cy="330" r="80" fill="none" stroke="#f2c94c" stroke-opacity=".14" stroke-width="2"/>
    <rect x="0" y="${PH - 190}" width="${PW}" height="190" fill="#0b3f26"/>
    <rect x="0" y="${PH - 196}" width="${PW}" height="6" fill="${GOLD}"/>
  </svg>`), left: 0, top: 0 });


  // photo in a gold-framed arch
  const AW = 350, AH = 420, F = 14, top = 104;
  const FW = AW + F * 2, FH = AH + F * 2;
  layers.push({ input: Buffer.from(`<svg width="${FW + 24}" height="${FH + 24}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#c9922c"/></linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#062a18" flood-opacity=".35"/></filter></defs>
    <g transform="translate(12 8)" filter="url(#sh)"><path d="${archPath(FW, FH, 30)}" fill="url(#fg)"/></g>
  </svg>`), left: Math.round(cx - FW / 2 - 12), top: top - F - 8 });
  const buf = t ? await fetchPhoto(uploadUrl(t)) : null;
  const mask = Buffer.from(`<svg width="${AW}" height="${AH}"><path d="${archPath(AW, AH, 20)}"/></svg>`);
  const photo = buf
    ? await sharp(await sharp(buf).rotate().resize(AW, AH, { fit: "cover", position: "attention" }).png().toBuffer()).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer()
    : await sharp({ create: { width: AW, height: AH, channels: 4, background: "#dcebe1" } }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  layers.push({ input: photo, left: Math.round(cx - AW / 2), top });

  // gold seal on the arch's lower-right corner
  const S = 170;
  layers.push({ input: await verifiedSeal(S), left: Math.round(cx + AW / 2 - S * 0.55), top: top + AH - S * 0.7 });

  let y = top + AH + F + 40;
  const name = await text(`<b>${esc(cleanName(t) || "Your therapist")}</b>`, { size: 64, color: "#0b1712", width: PW - 160, align: "centre", lines: 2 });
  layers.push({ input: name.data, left: Math.round(cx - name.info.width / 2), top: y });
  y += name.info.height + 8;
  const role = await text(`<b>${esc(t?.profile_type || "Psychologist")}</b>`, { size: 34, color: "#1e7a4c", width: PW - 160, align: "centre", lines: 1 });
  layers.push({ input: role.data, left: Math.round(cx - role.info.width / 2), top: y });
  y += role.info.height + 14;
  // city · rating as small pills (no experience line)
  const r = ratingOf(t);
  const pills = [cityOf(t) && esc(cityOf(t)), r && `<span foreground="${GOLD}">★</span> ${r.avg}  (${r.n} review${r.n > 1 ? "s" : ""})`, "Online &amp; in person"].filter(Boolean);
  const pillImgs = await Promise.all(pills.map((p) => text(p, { size: 25, color: "#24412f", width: 600 })));
  const PADX = 22, GAP = 12, PHH = 50;
  const total = pillImgs.reduce((a, p) => a + p.info.width + PADX * 2, 0) + GAP * (pillImgs.length - 1);
  let px = Math.round(cx - total / 2);
  for (const p of pillImgs) {
    const w = p.info.width + PADX * 2;
    layers.push({ input: rect(w, PHH, "#eef6f0", PHH / 2), left: px, top: y });
    layers.push({ input: p.data, left: px + PADX, top: y + Math.round((PHH - p.info.height) / 2) });
    px += w + GAP;
  }
  y += PHH + 34;

  const head = await text(`<b>Scan to book a session</b>`, { size: 50, color: "#0b3f26", width: PW - 160, align: "centre" });
  layers.push({ input: head.data, left: Math.round(cx - head.info.width / 2), top: y });
  y += head.info.height + 22;

  // QR card with the therapist's CYT ID written up a light gold strip on its left
  const Q = 500, CARD = Q + 64, STRIP = 62, GAPX = 16;
  const code = String(t?.profile_code || "").trim();
  const groupW = (code ? STRIP + GAPX : 0) + CARD;
  const stripX = Math.round(cx - groupW / 2);
  const cardX = code ? stripX + STRIP + GAPX : Math.round(cx - CARD / 2);
  const qcx = cardX + CARD / 2;
  layers.push({ input: Buffer.from(`<svg width="${CARD}" height="${CARD}"><rect x="2" y="2" width="${CARD - 4}" height="${CARD - 4}" rx="32" fill="#ffffff" stroke="${GOLD}" stroke-width="4"/></svg>`), left: cardX, top: y });
  if (qr) layers.push({ input: await sharp(qr).resize(Q, Q, { kernel: "nearest" }).png().toBuffer(), left: Math.round(qcx - Q / 2), top: y + 32 });
  if (code) {
    layers.push({ input: Buffer.from(`<svg width="${STRIP}" height="${CARD}"><rect x="1.5" y="1.5" width="${STRIP - 3}" height="${CARD - 3}" rx="18" fill="#fdf3dc" stroke="${GOLD}" stroke-width="3"/></svg>`), left: stripX, top: y });
    const idTxt = await vertical(`<b>${esc(code)}</b>`, { size: 32, color: "#0b3f26", angle: -90 });
    layers.push({ input: idTxt.data, left: stripX + Math.round((STRIP - idTxt.info.width) / 2), top: y + Math.round((CARD - idTxt.info.height) / 2) });
  }
  y += CARD + 24;

  const ln = await text(`<b>${esc(String(link || "").replace(/^https:\/\/www\./, ""))}</b>`, { size: 30, color: "#135c37", width: PW - 160, align: "centre" });
  layers.push({ input: ln.data, left: Math.round(qcx - ln.info.width / 2), top: y });

  const FY = PH - 190, FH2 = 190;
  const flg = await logo(250);
  const site = await text(`<b>chooseyourtherapist.in</b>`, { size: 44, color: "#f2c94c", width: 700 });
  const tag = await text("Online &amp; in-person sessions  ·  Verified therapists", { size: 24, color: "#cfe3d6", width: 700 });
  const pillW = flg.info.width + 36, pillH = flg.info.height + 24, GAPF = 40;
  const textW = Math.max(site.info.width, tag.info.width);
  const fx = Math.round(cx - (pillW + GAPF + textW) / 2);
  layers.push({ input: rect(pillW, pillH, "#ffffff", 18), left: fx, top: FY + Math.round((FH2 - pillH) / 2) });
  layers.push({ input: flg.data, left: fx + 18, top: FY + Math.round((FH2 - pillH) / 2) + 12 });
  const tx = fx + pillW + GAPF, th = site.info.height + 6 + tag.info.height;
  layers.push({ input: site.data, left: tx, top: FY + Math.round((FH2 - th) / 2) });
  layers.push({ input: tag.data, left: tx, top: FY + Math.round((FH2 - th) / 2) + site.info.height + 6 });

  return sharp({ create: { width: PW, height: PH, channels: 3, background: "#fbf8f0" } }).png().composite(layers).png({ compressionLevel: 9 }).toBuffer();
}


/* ─── Tweet-style post for the therapist's own Instagram / WhatsApp (pages/therapists/social-posts.js) ───
   A white "tweet" card: round photo, name + green tick, @handle, their own short line, booking link.
   size: post = 1080x1080 · story = 1080x1920 (story adds a QR, since links in a WhatsApp status can't be tapped). */
export async function tweetCard(t, { words = "", size = "post", handle = "", link = "", qr = null } = {}) {
  const story = size === "story";
  const W2 = 1080, H2 = story ? 1920 : 1080, CW = W2 - 128, PAD = 56, IW = CW - PAD * 2;
  const name = esc(cleanName(t) || "Your therapist");
  const role = esc(t?.profile_type || "Psychologist");
  const short = esc(String(link || "").replace(/^https:\/\/www\./, ""));
  const body = esc(String(words || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 280)) || "Your words here.";

  // card contents, top to bottom
  const parts = [];
  let y = PAD;
  const D = 120;
  const buf = t ? await fetchPhoto(uploadUrl(t)) : null;
  const circle = Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}"/></svg>`);
  const av = buf
    ? await sharp(await sharp(buf).rotate().resize(D, D, { fit: "cover", position: "attention" }).png().toBuffer()).composite([{ input: circle, blend: "dest-in" }]).png().toBuffer()
    : await sharp({ create: { width: D, height: D, channels: 4, background: "#dcebe1" } }).composite([{ input: circle, blend: "dest-in" }]).png().toBuffer();
  parts.push({ input: av, left: PAD, top: y });
  const tx = PAD + D + 26, TW = IW - D - 26 - 50;
  const nm = await text(`<b>${name}</b>`, { size: 42, color: "#0f1419", width: TW, lines: 1 });
  const hd = await text(`@${esc(handle)}  ·  ${role}`, { size: 28, color: "#536471", width: IW - D - 26, lines: 1 });
  const ny = y + Math.round((D - nm.info.height - 4 - hd.info.height) / 2);
  parts.push({ input: nm.data, left: tx, top: ny });
  const S = 40; // green verified tick next to the name
  const tick = Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#1e8a4f"/><path d="M ${S * 0.28} ${S * 0.52} l ${S * 0.15} ${S * 0.15} l ${S * 0.3} -${S * 0.32}" fill="none" stroke="#fff" stroke-width="${S * 0.11}" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  parts.push({ input: tick, left: tx + nm.info.width + 12, top: ny + Math.round((nm.info.height - S) / 2) });
  parts.push({ input: hd.data, left: tx, top: ny + nm.info.height + 4 });
  y += D + 40;
  const msg = await text(body, { size: story ? 58 : 50, color: "#0f1419", width: IW, lines: story ? 12 : 8 });
  parts.push({ input: msg.data, left: PAD, top: y });
  y += msg.info.height + 40;
  parts.push({ input: rect(IW, 2, "#e6ecf0"), left: PAD, top: y });
  y += 28;
  const ft = await text(`<b>Book a session:</b> <span foreground="#1e7a4c"><b>${short}</b></span>`, { size: 28, color: "#0f1419", width: IW, lines: 1 });
  parts.push({ input: ft.data, left: PAD, top: y });
  y += ft.info.height + PAD;
  const CH = y;

  const card = await sharp({ create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: rect(CW, CH, "#ffffff", 36), left: 0, top: 0 }, ...parts]).png().toBuffer();
  const shadow = await sharp(Buffer.from(`<svg width="${CW + 80}" height="${CH + 80}"><rect x="40" y="52" width="${CW}" height="${CH}" rx="36" fill="#03190e" fill-opacity=".45"/></svg>`)).blur(22).png().toBuffer();

  const bg = Buffer.from(`<svg width="${W2}" height="${H2}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="100%" cy="0%" r="130%"><stop offset="0" stop-color="#1f7a4a"/><stop offset=".55" stop-color="#135c37"/><stop offset="1" stop-color="#0a3622"/></radialGradient>
    <radialGradient id="gl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f2c94c" stop-opacity=".35"/><stop offset="1" stop-color="#f2c94c" stop-opacity="0"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/><circle cx="${W2 - 60}" cy="40" r="${W2 * 0.36}" fill="url(#gl)"/>
  </svg>`);
  const lg = await logo(story ? 230 : 190);
  const LW = lg.info.width + 28, LH = lg.info.height + 18;
  const pill = await sharp(rect(LW, LH, "#ffffff", 14)).composite([{ input: lg.data, left: 14, top: 9 }]).png().toBuffer();

  const layers = [{ input: bg, left: 0, top: 0 }];
  const QB = story && qr ? 290 : 0; // room for the QR row at the bottom of a story
  const blockH = LH + 36 + CH;
  const top = Math.max(40, Math.round((H2 - QB - blockH) / 2));
  layers.push({ input: pill, left: Math.round((W2 - LW) / 2), top });
  const cy = top + LH + 36;
  layers.push({ input: shadow, left: 64 - 40, top: cy - 40 }, { input: card, left: 64, top: cy });
  if (QB) {
    const Q = 200, qy = H2 - 64 - Q - 30;
    layers.push({ input: rect(Q + 30, Q + 30, "#ffffff", 22), left: 64, top: qy });
    layers.push({ input: await sharp(qr).resize(Q, Q, { kernel: "nearest" }).png().toBuffer(), left: 79, top: qy + 15 });
    const lead = await text("<b>Scan to book a session</b>", { size: 36, color: "#ffffff", width: W2 - 64 - 64 - Q - 60 });
    const sub = await text(short, { size: 28, color: "#f6d58a", width: W2 - 64 - 64 - Q - 60, lines: 1 });
    const lx = 64 + Q + 30 + 34, ly = qy + Math.round((Q + 30 - lead.info.height - 10 - sub.info.height) / 2);
    layers.push({ input: lead.data, left: lx, top: ly }, { input: sub.data, left: lx, top: ly + lead.info.height + 10 });
  }
  return sharp({ create: { width: W2, height: H2, channels: 3, background: "#0b3f26" } }).png().composite(layers).png({ compressionLevel: 9 }).toBuffer();
}
