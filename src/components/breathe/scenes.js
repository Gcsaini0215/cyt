import React from "react";

/* Animated nature backdrops for /breathe (2026-11-20). Soft pastel scenes drawn with SVG + CSS (transform /
   opacity animations only — light on phones, no video to download). Every "random" position comes from a seeded
   generator, so the server and the browser draw the same picture. */

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const list = (n, seed, f) => { const r = rng(seed); return Array.from({ length: n }, (_, i) => f(r, i)); };
const W = 1440, H = 900; // the drawing is 16:10 and "slices" to fill any screen

// a smooth hill / wave line across the scene, filled to the bottom
const ridge = (y, amp, waves, phase = 0, width = W) => {
  let d = `M0 ${y}`;
  for (let x = 0; x <= width; x += 40) d += ` L${x} ${(y + Math.sin((x / width) * Math.PI * 2 * waves + phase) * amp).toFixed(1)}`;
  return `${d} L${width} ${H} L0 ${H} Z`;
};

function Lake() { // misty lake at dawn
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="lkS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde4d3" /><stop offset=".55" stopColor="#e3efe9" /><stop offset="1" stopColor="#cfe6e2" /></linearGradient>
        <linearGradient id="lkW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c6e3df" /><stop offset="1" stopColor="#a3d0ca" /></linearGradient>
        <radialGradient id="lkSun"><stop offset="0" stopColor="#fff3e4" /><stop offset="1" stopColor="#fff3e4" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#lkS)" />
      <circle cx="1040" cy="330" r="260" fill="url(#lkSun)" />
      <circle cx="1040" cy="330" r="62" fill="#fff6ec" />
      <path d={ridge(470, 46, 1.3, 0.6)} fill="#b9d6cf" />
      <path d={ridge(530, 30, 2.1, 2)} fill="#a2c8c0" />
      <rect y="590" width={W} height={H - 590} fill="url(#lkW)" />
      <g className="sc-ripples">{list(9, 7, (r, i) => <ellipse key={i} cx={120 + r() * 1200} cy={640 + r() * 220} rx={60 + r() * 90} ry="3" fill="#fff" opacity=".55" style={{ animationDelay: `${(r() * 6).toFixed(1)}s` }} />)}</g>
      <g className="sc-mist"><ellipse cx="400" cy="585" rx="520" ry="34" fill="#fff" opacity=".55" /><ellipse cx="1150" cy="600" rx="460" ry="28" fill="#fff" opacity=".45" /></g>
    </svg>
  );
}

function Night() { // starry night, lavender dusk
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ntS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c2f63" /><stop offset=".6" stopColor="#4f5592" /><stop offset="1" stopColor="#8a87bf" /></linearGradient>
        <radialGradient id="ntM"><stop offset="0" stopColor="#fff8e1" stopOpacity=".55" /><stop offset="1" stopColor="#fff8e1" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ntS)" />
      <g className="sc-stars">{list(70, 11, (r, i) => <circle key={i} cx={r() * W} cy={r() * 560} r={0.8 + r() * 1.8} fill="#fff" style={{ animationDelay: `${(r() * 5).toFixed(1)}s`, animationDuration: `${(3 + r() * 4).toFixed(1)}s` }} />)}</g>
      <circle cx="1120" cy="190" r="150" fill="url(#ntM)" />
      <circle cx="1120" cy="190" r="46" fill="#fdf3d6" />
      <circle cx="1140" cy="176" r="40" fill="#3c4079" />
      <g className="sc-cloud"><ellipse cx="300" cy="300" rx="240" ry="26" fill="#fff" opacity=".1" /><ellipse cx="900" cy="380" rx="300" ry="22" fill="#fff" opacity=".08" /></g>
      <path d={ridge(700, 40, 1.4, 1)} fill="#3f4377" />
      <path d={ridge(760, 26, 2.3, 3)} fill="#32356a" />
    </svg>
  );
}

function Ocean() { // gentle waves
  const wave = (y, amp, n, fill, cls, op) => (
    <g className={`sc-wave ${cls}`}><path d={ridge(y, amp, n * 2, 0, W * 2)} fill={fill} opacity={op} /></g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="ocS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e7f5fd" /><stop offset="1" stopColor="#c9e9f7" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#ocS)" />
      <circle cx="320" cy="260" r="70" fill="#fffaf0" opacity=".9" />
      <g className="sc-cloud"><ellipse cx="900" cy="200" rx="200" ry="26" fill="#fff" opacity=".8" /><ellipse cx="1200" cy="260" rx="160" ry="20" fill="#fff" opacity=".7" /></g>
      {wave(560, 14, 3, "#a5dcf2", "w1", 0.9)}
      {wave(620, 18, 2.5, "#86cdec", "w2", 0.85)}
      {wave(690, 22, 2, "#6cbfe3", "w3", 0.8)}
      {wave(770, 18, 3, "#9fd8ee", "w4", 0.9)}
    </svg>
  );
}

function Forest() { // morning light through trees
  const pine = (x, base, h, fill) => <path key={`${x}-${base}`} d={`M${x} ${base - h} L${x - h * 0.32} ${base} L${x + h * 0.32} ${base} Z`} fill={fill} />;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="fsS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3faf2" /><stop offset="1" stopColor="#d3ebd3" /></linearGradient>
        <linearGradient id="fsR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe6" stopOpacity=".75" /><stop offset="1" stopColor="#fffbe6" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fsS)" />
      <g className="sc-rays">{[260, 520, 820, 1100].map((x, i) => <polygon key={x} points={`${x},0 ${x + 90},0 ${x - 140},${H} ${x - 320},${H}`} fill="url(#fsR)" style={{ animationDelay: `${i * 1.6}s` }} />)}</g>
      <g opacity=".55">{list(16, 3, (r, i) => pine(i * 95 + r() * 40, 760, 260 + r() * 140, "#a9d3a9"))}</g>
      <g opacity=".8">{list(12, 5, (r, i) => pine(i * 125 + r() * 50, 840, 300 + r() * 160, "#86bf8a"))}</g>
      <path d={ridge(800, 18, 1.5, 1)} fill="#7ab47f" />
      <g className="sc-pollen">{list(26, 9, (r, i) => <circle key={i} cx={r() * W} cy={300 + r() * 520} r={1.5 + r() * 2.5} fill="#fffde7" style={{ animationDelay: `${(r() * 8).toFixed(1)}s`, animationDuration: `${(8 + r() * 8).toFixed(1)}s` }} />)}</g>
    </svg>
  );
}

function Lavender() { // lavender fields
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="lvS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf3ff" /><stop offset=".6" stopColor="#f1e4fb" /><stop offset="1" stopColor="#fbe7f1" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#lvS)" />
      <circle cx="1100" cy="280" r="80" fill="#fff5ea" opacity=".9" />
      <path d={ridge(560, 34, 1.2, 2)} fill="#e3d1f5" />
      <path d={ridge(640, 26, 1.8, 0.4)} fill="#d4bbf0" />
      <g opacity=".7">{list(14, 21, (r, i) => <path key={i} d={`M${-100 + i * 120} ${H} Q ${200 + i * 90} 700 ${560 + i * 70} 660`} stroke="#b89ae6" strokeWidth="10" fill="none" strokeLinecap="round" />)}</g>
      <path d={ridge(760, 14, 2.4, 1)} fill="#c7a9ee" opacity=".7" />
      <g className="sc-petals">{list(18, 31, (r, i) => <ellipse key={i} cx={r() * W} cy={-20 - r() * 200} rx="6" ry="3" fill="#d8b4fe" style={{ animationDelay: `${(r() * 12).toFixed(1)}s`, animationDuration: `${(12 + r() * 10).toFixed(1)}s` }} />)}</g>
    </svg>
  );
}

function Sunrise() { // mountains at sunrise
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="srS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4ea" /><stop offset=".6" stopColor="#ffe1cc" /><stop offset="1" stopColor="#ffd2bd" /></linearGradient>
        <radialGradient id="srG"><stop offset="0" stopColor="#ffe8cf" /><stop offset="1" stopColor="#ffe8cf" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#srS)" />
      <g className="sc-sun"><circle cx="720" cy="520" r="280" fill="url(#srG)" /><circle cx="720" cy="520" r="90" fill="#ffd9b8" /></g>
      <path d="M0 600 L220 420 L420 560 L640 380 L860 560 L1080 410 L1300 560 L1440 470 L1440 900 L0 900 Z" fill="#f2c2ab" />
      <path d="M0 690 L260 540 L520 680 L780 520 L1040 690 L1260 560 L1440 650 L1440 900 L0 900 Z" fill="#e6ac98" />
      <path d={ridge(780, 20, 1.6, 2)} fill="#d99c8b" />
      <g className="sc-birds">{list(5, 41, (r, i) => <path key={i} d={`M${i * 46} ${200 + r() * 90} q 9 -9 18 0 q 9 -9 18 0`} stroke="#a77a6b" strokeWidth="2.4" fill="none" strokeLinecap="round" />)}</g>
    </svg>
  );
}

function Meadow() { // grass in the breeze
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="mdS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdfdee" /><stop offset="1" stopColor="#eef7d8" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#mdS)" />
      <g className="sc-cloud"><ellipse cx="380" cy="220" rx="220" ry="34" fill="#fff" /><ellipse cx="1100" cy="170" rx="180" ry="28" fill="#fff" /></g>
      <path d={ridge(600, 30, 1.1, 1)} fill="#dcedb5" />
      <path d={ridge(680, 22, 1.7, 3)} fill="#cbe39d" />
      <g className="sc-grass">{list(70, 51, (r, i) => {
        const x = (i / 70) * W + r() * 20, h = 90 + r() * 120, bend = 20 + r() * 30;
        return <path key={i} d={`M${x} ${H} Q ${x + bend / 2} ${H - h / 2} ${x + bend} ${H - h}`} stroke={i % 3 ? "#a8cf74" : "#94c160"} strokeWidth={3 + r() * 3} fill="none" strokeLinecap="round" style={{ animationDelay: `${(r() * 3).toFixed(1)}s` }} />;
      })}</g>
    </svg>
  );
}

function Fireflies() { // garden at dusk
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ffS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbeaf3" /><stop offset=".6" stopColor="#efdcf6" /><stop offset="1" stopColor="#dccff3" /></linearGradient>
        <radialGradient id="ffG"><stop offset="0" stopColor="#fff7c2" /><stop offset=".4" stopColor="#fde68a" stopOpacity=".6" /><stop offset="1" stopColor="#fde68a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ffS)" />
      <path d={ridge(620, 30, 1.3, 1.5)} fill="#d6c4ef" />
      <path d={ridge(720, 24, 2, 0.3)} fill="#c5b0ea" />
      <g>{list(12, 61, (r, i) => { const x = 60 + i * 120 + r() * 40, y = 760 + r() * 60; return <g key={i}><path d={`M${x} ${H} L${x} ${y}`} stroke="#ad97dc" strokeWidth="3" /><circle cx={x} cy={y} r={10 + r() * 8} fill="#e9b8de" /></g>; })}</g>
      <g className="sc-flies">{list(22, 71, (r, i) => <circle key={i} cx={r() * W} cy={360 + r() * 420} r="14" fill="url(#ffG)" style={{ animationDelay: `${(r() * 6).toFixed(1)}s`, animationDuration: `${(5 + r() * 5).toFixed(1)}s` }} />)}</g>
    </svg>
  );
}

function Rain() { // soft rain on a lake
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="rnS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef2f7" /><stop offset=".6" stopColor="#dde6ef" /><stop offset="1" stopColor="#d5e3ee" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#rnS)" />
      <path d={ridge(520, 30, 1.2, 1)} fill="#cad7e3" />
      <rect y="600" width={W} height={H - 600} fill="#c3d6e6" />
      <g className="sc-rain">{list(70, 81, (r, i) => { const x = r() * (W + 200), y = r() * H - 100; return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 22} stroke="#9fb6cc" strokeWidth="1.6" strokeLinecap="round" style={{ animationDelay: `${(r() * 2).toFixed(2)}s`, animationDuration: `${(1 + r() * 0.8).toFixed(2)}s` }} />; })}</g>
      <g className="sc-drops">{list(10, 91, (r, i) => <ellipse key={i} cx={100 + r() * 1240} cy={640 + r() * 220} rx="34" ry="7" fill="none" stroke="#fff" strokeWidth="1.6" style={{ animationDelay: `${(r() * 3).toFixed(1)}s` }} />)}</g>
    </svg>
  );
}

export const SCENES = { lake: Lake, night: Night, ocean: Ocean, forest: Forest, lavender: Lavender, sunrise: Sunrise, meadow: Meadow, fireflies: Fireflies, rain: Rain };

export function Scene({ kind }) {
  const S = SCENES[kind] || Lake;
  return <div className="sc" aria-hidden="true"><S /></div>;
}

export const SCENE_CSS = `
.sc { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.sc svg { width: 100%; height: 100%; display: block; }
.sc svg * { transform-box: fill-box; }
.sc-ripples ellipse { transform-origin: center; animation: scRipple 6s ease-in-out infinite; }
@keyframes scRipple { 0%, 100% { transform: scaleX(.6); opacity: .15; } 50% { transform: scaleX(1.1); opacity: .6; } }
.sc-mist ellipse, .sc-cloud ellipse { animation: scDrift 40s ease-in-out infinite alternate; }
.sc-cloud ellipse:nth-child(2), .sc-mist ellipse:nth-child(2) { animation-duration: 55s; animation-direction: alternate-reverse; }
@keyframes scDrift { from { transform: translateX(-60px); } to { transform: translateX(80px); } }
.sc-stars circle { transform-origin: center; animation: scTwinkle 4s ease-in-out infinite; }
@keyframes scTwinkle { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
.sc-wave { animation: scWave 14s linear infinite; }
.sc-wave.w2 { animation-duration: 18s; animation-direction: reverse; } .sc-wave.w3 { animation-duration: 22s; } .sc-wave.w4 { animation-duration: 11s; animation-direction: reverse; }
@keyframes scWave { from { transform: translateX(0); } to { transform: translateX(-${W}px); } }
.sc-rays polygon { animation: scRay 9s ease-in-out infinite; }
@keyframes scRay { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
.sc-pollen circle, .sc-flies circle { animation-name: scFloat; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
@keyframes scFloat { 0% { transform: translate(0, 0); opacity: .2; } 50% { opacity: 1; } 100% { transform: translate(40px, -60px); opacity: .3; } }
.sc-petals ellipse { animation-name: scFall; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes scFall { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(-260px, 1100px) rotate(540deg); } }
.sc-sun { animation: scRise 30s ease-in-out infinite alternate; }
@keyframes scRise { from { transform: translateY(30px); } to { transform: translateY(-30px); } }
.sc-birds { animation: scBirds 40s linear infinite; }
@keyframes scBirds { from { transform: translateX(-200px); } to { transform: translateX(1700px); } }
.sc-grass path { transform-origin: 50% 100%; animation: scSway 4.5s ease-in-out infinite alternate; }
@keyframes scSway { from { transform: rotate(-4deg); } to { transform: rotate(5deg); } }
.sc-rain line { animation-name: scRainFall; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes scRainFall { from { transform: translate(0, -40px); } to { transform: translate(-40px, 960px); } }
.sc-drops ellipse { transform-origin: center; animation: scDrop 3s ease-out infinite; }
@keyframes scDrop { from { transform: scale(.2); opacity: .9; } to { transform: scale(1.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .sc * { animation: none !important; } }
`;
