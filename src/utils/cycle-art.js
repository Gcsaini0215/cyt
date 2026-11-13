/* The Cycle & Mood Care illustration (no photo, no text): a tilted calendar with period days marked by hearts,
   a phase ring and a smiling mood bubble. One SVG string, used by the home section, /cycle-mood-care and the
   share card (utils/og-images.js cycleCareCard). */

const heart = (x, y, s, fill) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -3.2 C -2.2 -7.6 -9 -6.4 -9 -1.2 C -9 3.6 -3.4 6.8 0 9.6 C 3.4 6.8 9 3.6 9 -1.2 C 9 -6.4 2.2 -7.6 0 -3.2 Z" fill="${fill}"/>`;

export function cycleArtSvg({ size = 520 } = {}) {
  const cells = [];
  const cx0 = 150, cy0 = 214, cw = 46, ch = 40, gap = 8;
  const marked = new Set([7, 8, 9, 10, 11]); // the period days
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      const i = r * 6 + c;
      const x = cx0 + c * (cw + gap), y = cy0 + r * (ch + gap);
      cells.push(`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="${marked.has(i) ? "#ffe3ea" : i === 22 ? "#efeafd" : "#f6f3f5"}"/>`);
      if (marked.has(i)) cells.push(heart(x + cw / 2, y + ch / 2 - 1, 1.25, "#e5476b"));
      else if (i === 22) cells.push(`<circle cx="${x + cw / 2}" cy="${y + ch / 2}" r="7" fill="#7c5ce0"/>`);
      else cells.push(`<circle cx="${x + cw / 2}" cy="${y + ch / 2}" r="3" fill="#d8ccd2"/>`);
    }
  }
  const rings = Array.from({ length: 7 }, (_, i) => `<rect x="${170 + i * 44}" y="146" width="10" height="30" rx="5" fill="#8e1f47"/>`).join("");
  // phase ring (period · follicular · ovulation · luteal) with today's marker
  const R = 58, C = 2 * Math.PI * R;
  const seg = (from, len, color) => `<circle cx="0" cy="0" r="${R}" fill="none" stroke="${color}" stroke-width="16" stroke-dasharray="${len * C - 4} ${C}" stroke-dashoffset="${-from * C}"/>`;
  const ring = `<g transform="translate(410 400) rotate(-90)">${seg(0, 0.18, "#e5476b")}${seg(0.18, 0.3, "#1e9e64")}${seg(0.48, 0.1, "#7c5ce0")}${seg(0.58, 0.42, "#e08a1e")}</g>
    <circle cx="410" cy="400" r="40" fill="#fff"/>
    <circle cx="${410 + R * Math.cos(-Math.PI / 2 + 0.36 * 2 * Math.PI)}" cy="${400 + R * Math.sin(-Math.PI / 2 + 0.36 * 2 * Math.PI)}" r="12" fill="#fff" stroke="#1e9e64" stroke-width="5"/>
    ${heart(410, 400, 1.6, "#e5476b")}`;
  const face = `<g transform="translate(96 392)">
    <circle r="46" fill="#ffd36b"/><circle r="46" fill="url(#cfFace)"/>
    <circle cx="-15" cy="-8" r="5.5" fill="#5b3a12"/><circle cx="15" cy="-8" r="5.5" fill="#5b3a12"/>
    <path d="M -18 10 Q 0 28 18 10" stroke="#5b3a12" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="-26" cy="8" r="7" fill="#ff9aa8" fill-opacity=".7"/><circle cx="26" cy="8" r="7" fill="#ff9aa8" fill-opacity=".7"/></g>`;
  const spark = (x, y, s, f) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L2.6 -2.6 L10 0 L2.6 2.6 L0 10 L-2.6 2.6 L-10 0 L-2.6 -2.6 Z" fill="${f}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 520 520" role="img" aria-label="A period calendar with marked days, a cycle ring and a smiling face">
  <defs>
    <radialGradient id="cfBlob" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#ffd1dc"/><stop offset="1" stop-color="#ffd1dc" stop-opacity="0"/></radialGradient>
    <linearGradient id="cfHead" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0668a"/><stop offset="1" stop-color="#c22d58"/></linearGradient>
    <radialGradient id="cfFace" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff3c4" stop-opacity=".8"/><stop offset="1" stop-color="#ffb938" stop-opacity="0"/></radialGradient>
    <filter id="cfSh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#8e1f47" flood-opacity=".28"/></filter>
  </defs>
  <circle cx="270" cy="250" r="240" fill="url(#cfBlob)"/>
  <g transform="rotate(-6 270 270)" filter="url(#cfSh)">
    <rect x="128" y="160" width="368" height="320" rx="30" fill="#fff"/>
    <rect x="128" y="160" width="368" height="40" rx="30" fill="url(#cfHead)"/><rect x="128" y="180" width="368" height="20" fill="url(#cfHead)"/>
    ${rings}
    ${cells.join("")}
  </g>
  <g filter="url(#cfSh)">${ring}</g>
  <g filter="url(#cfSh)">${face}</g>
  ${spark(470, 150, 1.4, "#f6c453")}${spark(70, 230, 1, "#f0668a")}${spark(440, 60, .8, "#7c5ce0")}${spark(120, 110, .7, "#1e9e64")}
</svg>`;
}
