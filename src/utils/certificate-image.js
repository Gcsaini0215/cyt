// Server-only: the achievement certificate (A4 landscape, 1754x1240 PNG) for /api/certificate/<code>.png.
// Built like the share cards (sharp + Pango text, Noto Sans) — CYT's own certificate for a therapist's
// achievement on CYT, with the verification code and a QR code to /verify-achievement/<code>.
import path from "path";
import fs from "fs";
import sharp from "sharp";

const W = 1754, H = 1240;
const GREEN = "#14532d", GOLD = "#c9962c", INK = "#0b1712", MUTE = "#475569";
const TIERS = {
  bronze: { ring: "#b8763b", fill: "#f4e2cf", label: "BRONZE" },
  silver: { ring: "#8c99a6", fill: "#eef1f4", label: "SILVER" },
  gold: { ring: "#c9962c", fill: "#fbefcf", label: "GOLD" },
  platinum: { ring: "#1e7a4c", fill: "#dff2e6", label: "PLATINUM" },
};

const FONT = (() => {
  const p = path.join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf");
  return fs.existsSync(p) ? p : undefined;
})();
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function text(markup, { size = 32, width = 1200, color = INK, bold = false, align = "centre", spacing = 0 } = {}) {
  const body = `<span foreground="${color}"${bold ? ' weight="bold"' : ""}${spacing ? ` letter_spacing="${spacing * 1024}"` : ""}>${markup}</span>`;
  return sharp({ text: { text: body, font: `Noto Sans ${size}`, fontfile: FONT, width, align, rgba: true, dpi: 72, wrap: "word" } })
    .png().toBuffer({ resolveWithObject: true });
}
const centred = (img, top) => ({ input: img.data, left: Math.round((W - img.info.width) / 2), top: Math.round(top) });

let logoBuf = null;
async function logo(width) {
  if (!logoBuf) logoBuf = fs.readFileSync(path.join(process.cwd(), "public/logo.png"));
  return sharp(logoBuf).resize({ width }).png().toBuffer({ resolveWithObject: true });
}

// the frame: cream paper, a gold double border and a fine green line inside, gold corner marks
const frame = () => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#fbfaf5"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="${GOLD}" stroke-width="10"/>
  <rect x="58" y="58" width="${W - 116}" height="${H - 116}" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <rect x="76" y="76" width="${W - 152}" height="${H - 152}" fill="none" stroke="${GREEN}" stroke-width="1.5" stroke-opacity=".5"/>
  ${[[76, 76, 1, 1], [W - 76, 76, -1, 1], [76, H - 76, 1, -1], [W - 76, H - 76, -1, -1]].map(([x, y, sx, sy]) =>
    `<path d="M${x} ${y + sy * 70} L${x} ${y} L${x + sx * 70} ${y}" fill="none" stroke="${GOLD}" stroke-width="6"/>`).join("")}
</svg>`);

// the tier seal: a ribboned rosette with a star
const seal = (tier) => {
  const t = TIERS[tier] || TIERS.gold;
  const teeth = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, r = i % 2 ? 98 : 110;
    return `${130 + Math.cos(a) * r},${130 + Math.sin(a) * r}`;
  }).join(" ");
  return Buffer.from(`<svg width="260" height="290" xmlns="http://www.w3.org/2000/svg">
    <path d="M88 205 L70 285 L104 266 L124 290 L140 214 Z" fill="${t.ring}"/>
    <path d="M172 205 L190 285 L156 266 L136 290 L120 214 Z" fill="${t.ring}" opacity=".85"/>
    <polygon points="${teeth}" fill="${t.ring}"/>
    <circle cx="130" cy="130" r="84" fill="${t.fill}" stroke="#fff" stroke-width="5"/>
    <circle cx="130" cy="130" r="70" fill="none" stroke="${t.ring}" stroke-width="2" stroke-dasharray="4 5"/>
    <path d="M130 78 l15 31 34 5 -25 24 6 34 -30 -16 -30 16 6 -34 -25 -24 34 -5z" fill="${t.ring}"/>
  </svg>`);
};

const diag = () => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${W / 2}" y="${H / 2 + 60}" text-anchor="middle" font-family="sans-serif" font-size="230" font-weight="700" fill="#14532d" fill-opacity=".07" transform="rotate(-18 ${W / 2} ${H / 2})">SAMPLE</text></svg>`);

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/* c: { title, tier, line, unlockedAt, code, verifyUrl, qr (data URL), stats, therapist: { name, profile_type, state } } */
export async function certificatePng(c, { sample = false } = {}) {
  const layers = [];
  const lg = await logo(330);
  layers.push({ input: lg.data, left: Math.round((W - lg.info.width) / 2), top: 120 });

  const kTop = 120 + lg.info.height + 34;
  const k = await text("CERTIFICATE OF ACHIEVEMENT", { size: 30, bold: true, color: GOLD, spacing: 6 });
  layers.push(centred(k, kTop));
  const ruleTop = kTop + k.info.height + 26;
  layers.push({ input: Buffer.from(`<svg width="440" height="4"><rect width="440" height="3" fill="${GOLD}"/></svg>`), left: Math.round(W / 2 - 220), top: ruleTop });
  const title = await text(esc(c.title), { size: 80, bold: true, color: GREEN, width: 1300 });
  layers.push(centred(title, ruleTop + 34));
  let y = ruleTop + 34 + title.info.height + 40;

  const pre = await text("This certificate is proudly presented to", { size: 30, color: MUTE });
  layers.push(centred(pre, y)); y += pre.info.height + 18;
  const name = await text(esc(c.therapist?.name || "Therapist"), { size: 70, bold: true, color: INK, width: 1300 });
  layers.push(centred(name, y)); y += name.info.height + 8;
  const role = [c.therapist?.profile_type, String(c.therapist?.state || "").split(",")[0]].filter(Boolean).join("  ·  ");
  if (role) { const r = await text(esc(role), { size: 28, color: GREEN, bold: true }); layers.push(centred(r, y)); y += r.info.height + 26; }
  const line = await text(esc(c.line || ""), { size: 30, color: MUTE, width: 1150 });
  layers.push(centred(line, y)); y += line.info.height + 18;

  const s = c.stats || {};
  const facts = [
    s.sessions ? `${s.sessions} session${s.sessions === 1 ? "" : "s"} completed` : "",
    s.goodReviews ? `${s.goodReviews} review${s.goodReviews === 1 ? "" : "s"} rated 4★+` : "",
    s.avgRating ? `average rating ${Number(s.avgRating).toFixed(1)}★` : "",
  ].filter(Boolean).join("   ·   ");
  if (facts) { const f = await text(esc(facts), { size: 26, color: "#9a6b12", bold: true }); layers.push(centred(f, y)); }

  // bottom row: seal (left) · date + signature (centre) · QR + code (right)
  const sealTop = H - 150 - 290 + 10;
  layers.push({ input: seal(c.tier), left: 150, top: sealTop });
  const tierLabel = await text(`${(TIERS[c.tier] || TIERS.gold).label} ACHIEVEMENT`, { size: 18, bold: true, color: (TIERS[c.tier] || TIERS.gold).ring, width: 320, spacing: 3 });
  layers.push({ input: tierLabel.data, left: 150 + 130 - Math.round(tierLabel.info.width / 2), top: sealTop + 300 });

  const sigTop = H - 300;
  const sig = await text('<span font_style="italic">Deepak Kumar</span>', { size: 46, color: GREEN, width: 600 });
  layers.push(centred(sig, sigTop));
  layers.push({ input: Buffer.from(`<svg width="460" height="4"><rect width="460" height="3" fill="${INK}" fill-opacity=".55"/></svg>`), left: Math.round(W / 2 - 230), top: sigTop + sig.info.height + 10 });
  const who = await text("Founder &amp; Director, Choose Your Therapist LLP", { size: 22, color: MUTE, width: 700 });
  layers.push(centred(who, sigTop + sig.info.height + 24));
  const when = await text(`Awarded on <b>${esc(fmtDate(c.unlockedAt || Date.now()))}</b>`, { size: 24, color: INK, width: 700 });
  layers.push(centred(when, sigTop + sig.info.height + 64));

  const qrLeft = W - 150 - 220 + 15, qrTop = H - 150 - 250;
  if (c.qr) {
    const qrBuf = Buffer.from(String(c.qr).split(",")[1] || "", "base64");
    const qr = await sharp(qrBuf).resize(190, 190).png().toBuffer();
    layers.push({ input: qr, left: qrLeft, top: qrTop });
  } else {
    // a sample has no real code — show where the QR goes
    layers.push({ input: Buffer.from(`<svg width="190" height="190"><rect x="2" y="2" width="186" height="186" rx="10" fill="#fff" stroke="${GREEN}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="10 8"/><text x="95" y="102" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="700" fill="${GREEN}" fill-opacity=".5">QR</text></svg>`), left: qrLeft, top: qrTop });
  }
  const code = await text(`Verify at chooseyourtherapist.in\n<b>${esc(c.code || "")}</b>`, { size: 19, color: MUTE, width: 300 });
  layers.push({ input: code.data, left: W - 150 - 110 - Math.round(code.info.width / 2) + 15, top: H - 150 - 50 });

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
