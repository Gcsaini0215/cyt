// Server-only: the achievement certificate (A4 landscape, 1754x1240 PNG) for /api/certificate/<code>.png.
// Built like the share cards (sharp + Pango text, Noto Sans) — CYT's own certificate for a therapist's
// achievement on CYT: white paper, green + gold frame, a faint CYT watermark, the numbers in small panels,
// the tier medal, the founder's signature, and a QR + ID that verify it at /verify-achievement/<code>.
import path from "path";
import fs from "fs";
import sharp from "sharp";

const W = 1754, H = 1240;
const GREEN = "#14532d", GREEN2 = "#1e7a4c", GOLD = "#c9962c", INK = "#0b1712", MUTE = "#4b5a52";
const TIERS = {
  bronze: { a: "#e0a06a", b: "#9a5a2a", label: "BRONZE" },
  silver: { a: "#d3dbe2", b: "#7d8a96", label: "SILVER" },
  gold: { a: "#f2cf6d", b: "#b07d1c", label: "GOLD" },
  platinum: { a: "#6fcb93", b: "#14532d", label: "PLATINUM" },
};

const fontFile = (p) => { const f = path.join(process.cwd(), p); return fs.existsSync(f) ? f : undefined; };
// sans for labels; Libre Baskerville (bold/italic) for the title, name and numbers; Great Vibes for the signature (OFL, public/fonts/cert)
const FACES = {
  sans: { font: "Noto Sans", file: fontFile("node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf") },
  serif: { font: "Libre Baskerville", file: fontFile("public/fonts/cert/LibreBaskerville.ttf") },
  italic: { font: "Libre Baskerville", file: fontFile("public/fonts/cert/LibreBaskerville-Italic.ttf") },
  script: { font: "Great Vibes", file: fontFile("public/fonts/cert/GreatVibes-Regular.ttf") },
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function text(markup, { size = 32, width = 1200, color = INK, bold = false, align = "centre", spacing = 0, face = "sans" } = {}) {
  const f = FACES[face]?.file ? FACES[face] : FACES.sans;
  const body = `<span foreground="${color}"${bold ? ' weight="bold"' : ""}${face === "italic" ? ' font_style="italic"' : ""}${spacing ? ` letter_spacing="${spacing * 1024}"` : ""}>${markup}</span>`;
  return sharp({ text: { text: body, font: `${f.font} ${size}`, fontfile: f.file, width, align, rgba: true, dpi: 72, wrap: "word" } })
    .png().toBuffer({ resolveWithObject: true });
}
const centred = (img, top, cx = W / 2) => ({ input: img.data, left: Math.round(cx - img.info.width / 2), top: Math.round(top) });

let logoBuf = null;
async function logo(width, opacity = 1) {
  if (!logoBuf) logoBuf = fs.readFileSync(path.join(process.cwd(), "public/logo.png"));
  let img = sharp(logoBuf).resize({ width }).ensureAlpha();
  if (opacity < 1) {
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * opacity);
    img = sharp(data, { raw: info });
  }
  return img.png().toBuffer({ resolveWithObject: true });
}

// white paper; a green outer band, a gold double rule inside it; gold corner ornaments; dotted top/bottom borders
const frame = () => {
  const corner = (x, y, sx, sy) => `
    <g transform="translate(${x} ${y}) scale(${sx} ${sy})" fill="none" stroke="${GOLD}">
      <path d="M0 96 L0 0 L96 0" stroke-width="5"/>
      <path d="M16 74 L16 16 L74 16" stroke-width="2"/>
      <rect x="27" y="27" width="14" height="14" transform="rotate(45 34 34)" fill="${GOLD}" stroke="none"/>
    </g>`;
  const dots = Array.from({ length: 34 }, (_, i) => `<circle cx="${200 + i * 41}" cy="94" r="2.2" fill="${GOLD}" fill-opacity=".5"/><circle cx="${200 + i * 41}" cy="${H - 94}" r="2.2" fill="${GOLD}" fill-opacity=".5"/>`).join("");
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${GREEN}" stroke-width="14"/>
    <rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <rect x="66" y="66" width="${W - 132}" height="${H - 132}" fill="none" stroke="${GOLD}" stroke-width="1"/>
    ${corner(66, 66, 1, 1)}${corner(W - 66, 66, -1, 1)}${corner(66, H - 66, 1, -1)}${corner(W - 66, H - 66, -1, -1)}
    ${dots}
  </svg>`);
};

// "—— ◆ ——" ornament line
const ornament = (w = 520) => Buffer.from(`<svg width="${w}" height="24" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 12 L${w / 2 - 22} 12" stroke="${GOLD}" stroke-width="2"/><path d="M${w / 2 + 22} 12 L${w} 12" stroke="${GOLD}" stroke-width="2"/>
  <rect x="${w / 2 - 8}" y="4" width="16" height="16" transform="rotate(45 ${w / 2} 12)" fill="${GOLD}"/></svg>`);

// the tier medal: gradient rosette, ribbons, star
const medal = (tier) => {
  const t = TIERS[tier] || TIERS.gold;
  const teeth = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2, r = i % 2 ? 104 : 116;
    return `${130 + Math.cos(a) * r},${130 + Math.sin(a) * r}`;
  }).join(" ");
  return Buffer.from(`<svg width="260" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></radialGradient></defs>
    <path d="M86 205 L66 292 L102 272 L124 300 L142 214 Z" fill="${t.b}"/>
    <path d="M174 205 L194 292 L158 272 L136 300 L118 214 Z" fill="${t.b}" opacity=".8"/>
    <polygon points="${teeth}" fill="url(#g)"/>
    <circle cx="130" cy="130" r="86" fill="#ffffff" fill-opacity=".93"/>
    <circle cx="130" cy="130" r="76" fill="none" stroke="${t.b}" stroke-width="2.5"/>
    <circle cx="130" cy="130" r="69" fill="none" stroke="${t.b}" stroke-width="1" stroke-dasharray="3 4"/>
    <path d="M130 82 l14 29 32 5 -23 22 5 32 -28 -15 -28 15 5 -32 -23 -22 32 -5z" fill="url(#g)" stroke="${t.b}" stroke-width="1.5"/>
  </svg>`);
};

// a small panel with a number and its label
async function statPanel(value, label) {
  const v = await text(esc(value), { size: 38, bold: true, color: GREEN, width: 300, face: "serif" });
  const l = await text(esc(label), { size: 16, color: MUTE, width: 300, spacing: 2 });
  const w = 300, h = 20 + v.info.height + 10 + l.info.height + 22;
  const box = Buffer.from(`<svg width="${w}" height="${h}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="#f6faf7" stroke="#d7e7dd" stroke-width="2"/></svg>`);
  const data = await sharp(box).composite([
    { input: v.data, left: Math.round((w - v.info.width) / 2), top: 20 },
    { input: l.data, left: Math.round((w - l.info.width) / 2), top: 20 + v.info.height + 10 },
  ]).png().toBuffer();
  return { data, w, h };
}

const diag = () => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${W / 2}" y="${H / 2 + 70}" text-anchor="middle" font-family="sans-serif" font-size="240" font-weight="700" fill="#14532d" fill-opacity=".06" transform="rotate(-18 ${W / 2} ${H / 2})">SAMPLE</text></svg>`);

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/* c: { title, tier, line, unlockedAt, code, verifyUrl, qr (data URL), stats, therapist: { name, profile_type, state } } */
export async function certificatePng(c, { sample = false } = {}) {
  const layers = [];
  const tier = TIERS[c.tier] || TIERS.gold;

  // faint CYT watermark behind the text
  const wm = await logo(720, 0.05);
  layers.push({ input: wm.data, left: Math.round((W - wm.info.width) / 2), top: Math.round(H / 2 - wm.info.height / 2 + 30) });

  const lg = await logo(280);
  layers.push({ input: lg.data, left: Math.round((W - lg.info.width) / 2), top: 120 });
  let y = 120 + lg.info.height + 30;

  const k = await text("CERTIFICATE  OF  ACHIEVEMENT", { size: 26, color: GOLD, spacing: 8, face: "serif", bold: true });
  layers.push(centred(k, y)); y += k.info.height + 14;
  layers.push({ input: ornament(560), left: Math.round(W / 2 - 280), top: y }); y += 24 + 30;

  const title = await text(esc(c.title), { size: 74, bold: true, color: GREEN, width: 1350, face: "serif" });
  layers.push(centred(title, y)); y += title.info.height + 34;

  const pre = await text("This is to certify that", { size: 26, color: MUTE, face: "italic" });
  layers.push(centred(pre, y)); y += pre.info.height + 14;
  const name = await text(esc(c.therapist?.name || "Therapist"), { size: 64, bold: true, color: INK, width: 1300, face: "serif" });
  layers.push(centred(name, y)); y += name.info.height + 8;
  layers.push({ input: Buffer.from(`<svg width="700" height="3"><rect width="700" height="2" fill="${GOLD}" fill-opacity=".7"/></svg>`), left: Math.round(W / 2 - 350), top: y }); y += 16;
  const role = [c.therapist?.profile_type, String(c.therapist?.state || "").split(",")[0]].filter(Boolean).join("   ·   ");
  if (role) { const r = await text(esc(role.toUpperCase()), { size: 20, color: GREEN2, spacing: 4 }); layers.push(centred(r, y)); y += r.info.height + 22; }
  const line = await text(`has been awarded the <b>${esc(c.title)}</b> by Choose Your Therapist ${esc(c.line || "")}.`, { size: 26, color: MUTE, width: 1150, face: "italic" });
  layers.push(centred(line, y)); y += line.info.height + 32;

  // the numbers, in panels
  const s = c.stats || {};
  const panels = [];
  if (s.sessions) panels.push(await statPanel(String(s.sessions), `SESSION${s.sessions === 1 ? "" : "S"} COMPLETED`));
  if (s.goodReviews) panels.push(await statPanel(String(s.goodReviews), `REVIEW${s.goodReviews === 1 ? "" : "S"} RATED 4+`));
  if (s.avgRating) panels.push(await statPanel(`${Number(s.avgRating).toFixed(1)} / 5`, "AVERAGE RATING"));
  if (panels.length) {
    const gap = 26, total = panels.reduce((n, p) => n + p.w, 0) + gap * (panels.length - 1);
    let x = Math.round(W / 2 - total / 2);
    for (const p of panels) { layers.push({ input: p.data, left: x, top: y }); x += p.w + gap; }
  }

  // bottom row: medal (left) · signature + date (centre) · QR (right)
  const rowTop = H - 440;
  layers.push({ input: medal(c.tier), left: 170, top: rowTop });
  const tl = await text(`${tier.label} ACHIEVEMENT`, { size: 16, color: tier.b, width: 420, spacing: 3, face: "serif", bold: true });
  layers.push(centred(tl, rowTop + 306, 170 + 130));

  const sig = await text("Deepak Kumar", { size: 76, color: GREEN, width: 600, face: "script" });
  const sigTop = rowTop + 70;
  layers.push(centred(sig, sigTop));
  const sigLine = sigTop + sig.info.height - 4;
  layers.push({ input: Buffer.from(`<svg width="440" height="3"><rect width="440" height="2" fill="${INK}" fill-opacity=".6"/></svg>`), left: Math.round(W / 2 - 220), top: sigLine });
  const who = await text("Founder &amp; Director\nChoose Your Therapist LLP", { size: 20, color: MUTE, width: 600, spacing: 1 });
  layers.push(centred(who, sigLine + 12));
  const when = await text(`Awarded on ${esc(fmtDate(c.unlockedAt || Date.now()))}`, { size: 21, color: INK, width: 600, face: "italic" });
  layers.push(centred(when, sigLine + 16 + who.info.height + 8));

  const qrX = W - 170 - 220, qrY = rowTop + 40;
  layers.push({ input: Buffer.from(`<svg width="220" height="220"><rect x="1" y="1" width="218" height="218" rx="14" fill="#fff" stroke="${GOLD}" stroke-width="2"/></svg>`), left: qrX, top: qrY });
  if (c.qr) {
    const qrBuf = Buffer.from(String(c.qr).split(",")[1] || "", "base64");
    layers.push({ input: await sharp(qrBuf).resize(194, 194).png().toBuffer(), left: qrX + 13, top: qrY + 13 });
  } else {
    // a sample has no real code — show where the QR goes
    layers.push({ input: Buffer.from(`<svg width="194" height="194"><rect x="2" y="2" width="190" height="190" rx="10" fill="#fff" stroke="${GREEN}" stroke-opacity=".3" stroke-width="3" stroke-dasharray="10 8"/><text x="97" y="106" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="${GREEN}" fill-opacity=".45">QR</text></svg>`), left: qrX + 13, top: qrY + 13 });
  }
  const scan = await text("SCAN TO VERIFY", { size: 16, color: GREEN, width: 260, spacing: 3 });
  layers.push(centred(scan, qrY + 232, qrX + 110));

  // the certificate ID along the bottom
  const id = await text(`CERTIFICATE ID   <span foreground="${GREEN}">${esc(c.code || "")}</span>      ·      chooseyourtherapist.in/verify-achievement`, { size: 16, color: "#7b8a82", width: 1300, spacing: 2 });
  layers.push(centred(id, H - 118));

  if (sample) layers.push({ input: diag(), left: 0, top: 0 });
  return sharp(frame()).composite(layers).png({ compressionLevel: 8 }).toBuffer();
}

// demo data for the "sample" certificates (watermarked SAMPLE)
export const SAMPLE = {
  excellence_100: { title: "CYT Excellence Award", tier: "platinum", line: "for earning 100 client reviews rated 4 stars or more", stats: { sessions: 240, goodReviews: 104, avgRating: 4.8 } },
  rising_star: { title: "Rising Star", tier: "silver", line: "for earning 10 client reviews rated 4 stars or more", stats: { sessions: 38, goodReviews: 12, avgRating: 4.7 } },
  sessions_100: { title: "100 Sessions Milestone", tier: "gold", line: "for completing 100 therapy sessions with clients on Choose Your Therapist", stats: { sessions: 100, goodReviews: 31, avgRating: 4.6 } },
  first_session: { title: "First Session", tier: "bronze", line: "for completing a first session with a client on Choose Your Therapist", stats: { sessions: 1 } },
};
