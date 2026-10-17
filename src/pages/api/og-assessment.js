import sharp from "sharp";
import { TEST_BY_KEY } from "../../components/self-assessment/tests";
import { ASSESSMENT_SEO } from "../../components/self-assessment/seo";

/* Open Graph banner (1200×630 PNG) for one assessment page: /api/og-assessment?t=phq9 */

const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// split a heading into at most two lines of ~maxChars
function lines(text, maxChars) {
  const words = String(text).split(/\s+/);
  const out = [""];
  for (const w of words) {
    const cur = out[out.length - 1];
    if ((cur + " " + w).trim().length > maxChars && cur && out.length < 2) out.push(w);
    else out[out.length - 1] = (cur + " " + w).trim();
  }
  return out;
}

function svgFor(test) {
  const h1 = ASSESSMENT_SEO[test.key]?.h1 || test.full;
  const [l1, l2] = lines(h1, 24);
  const sub = `${test.questions.length} questions · ${String(test.time).replace(/^~\s*/, "")} · ${test.age}`;
  const pills = ["Instant scored report", "With a verified psychologist", "Screening, not a diagnosis"];
  let x = 80;
  const pillSvg = pills.map((p) => {
    const w = Math.round(p.length * 9.4 + 40);
    const out = `<rect x="${x}" y="500" width="${w}" height="38" rx="19" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>
  <text x="${x + w / 2}" y="524" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="rgba(255,255,255,0.85)" text-anchor="middle">${esc(p)}</text>`;
    x += w + 14;
    return out;
  }).join("\n  ");
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071f12"/><stop offset="100%" stop-color="#0d3d25"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1010" cy="130" r="290" fill="none" stroke="rgba(74,222,128,0.08)" stroke-width="1.5"/>
  <circle cx="1010" cy="130" r="205" fill="none" stroke="rgba(74,222,128,0.06)" stroke-width="1"/>
  <rect x="80" y="78" width="60" height="4" rx="2" fill="#4ade80"/>
  <rect x="80" y="104" width="360" height="38" rx="19" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
  <text x="260" y="129" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#4ade80" text-anchor="middle" letter-spacing="1.2">SCREENING TOOL · ONLINE</text>
  <text x="80" y="236" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="900" fill="#ffffff" letter-spacing="-1">${esc(l1)}</text>
  ${l2 ? `<text x="80" y="314" font-family="Arial Black, Arial, sans-serif" font-size="60" font-weight="900" fill="#ffffff" letter-spacing="-1">${esc(l2)}</text>` : ""}
  <text x="80" y="${l2 ? 378 : 300}" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#86efac">${esc(test.full)}</text>
  <text x="80" y="${l2 ? 428 : 350}" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.68)">${esc(sub)}</text>
  ${pillSvg}
  <text x="1120" y="590" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.4)" text-anchor="end">chooseyourtherapist.in</text>
  <rect x="0" y="620" width="1200" height="10" fill="#4ade80"/>
</svg>`;
}

export default async function handler(req, res) {
  const test = TEST_BY_KEY[String(req.query.t || "")];
  if (!test) { res.status(404).end("Unknown assessment"); return; }
  try {
    const png = await sharp(Buffer.from(svgFor(test))).png().toBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, immutable");
    res.status(200).send(png);
  } catch (e) {
    res.status(500).end("Error generating image");
  }
}
