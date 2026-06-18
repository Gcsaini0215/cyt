import sharp from "sharp";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#071f12;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d3d25;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="green" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#86efac;stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />

  <circle cx="980" cy="120" r="280" fill="none" stroke="rgba(74,222,128,0.08)" stroke-width="1.5"/>
  <circle cx="980" cy="120" r="200" fill="none" stroke="rgba(74,222,128,0.06)" stroke-width="1"/>
  <circle cx="150" cy="520" r="180" fill="none" stroke="rgba(74,222,128,0.05)" stroke-width="1"/>

  <rect x="80" y="80" width="60" height="4" rx="2" fill="#4ade80" />

  <rect x="80" y="108" width="240" height="36" rx="18" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
  <text x="200" y="131" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#4ade80" text-anchor="middle" letter-spacing="1.5">100% FREE · NO COMMITMENT</text>

  <text x="80" y="220" font-family="Arial Black, Arial, sans-serif" font-size="64" font-weight="900" fill="#ffffff" letter-spacing="-1">Real Support.</text>
  <text x="80" y="300" font-family="Arial Black, Arial, sans-serif" font-size="64" font-weight="900" fill="#ffffff" letter-spacing="-1">Right Therapist.</text>
  <text x="80" y="378" font-family="Arial Black, Arial, sans-serif" font-size="56" font-weight="900" fill="#4ade80" letter-spacing="-1">Start Today — Free.</text>

  <text x="80" y="440" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.65)">Connect with a verified psychologist and book</text>
  <text x="80" y="470" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.65)">your therapy appointment — all in 30 minutes.</text>

  <rect x="80" y="510" width="180" height="34" rx="17" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="170" y="532" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.75)" text-anchor="middle">Verified Experts</text>

  <rect x="276" y="510" width="190" height="34" rx="17" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="371" y="532" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.75)" text-anchor="middle">100% Confidential</text>

  <rect x="482" y="510" width="170" height="34" rx="17" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="567" y="532" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.75)" text-anchor="middle">30-Min Match</text>

  <text x="1120" y="580" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.30)" text-anchor="end">chooseyourtherapist.in</text>

  <rect x="0" y="620" width="1200" height="10" fill="#4ade80" />
</svg>`;

export default async function handler(req, res) {
  try {
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.status(200).send(png);
  } catch (e) {
    res.status(500).end("Error generating image");
  }
}
