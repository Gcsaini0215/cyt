import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import MainLayout from "../components/therapists/main-layout";
import useTherapistStore from "../store/therapistStore";
import { fetchData } from "../utils/actions";
import { getTherapistProfile, imagePath } from "../utils/url";
import { thumb } from "../utils/thumb";
import { profilePath } from "../utils/therapist-slug";

/* Therapist → Social posts: ready-made Instagram posts and stories from the therapist's own profile
   (photo, name, expertise, reviews, fee). Drawn on a canvas at full Instagram size (1080 px wide) and
   downloaded as an HD PNG. The photo is loaded through /_next/image (same site) so the canvas can be saved. */

const SITE = "chooseyourtherapist.in";
const FORMATS = [
  { key: "post", label: "Post", sub: "1080 × 1080", w: 1080, h: 1080 },
  { key: "portrait", label: "Portrait post", sub: "1080 × 1350", w: 1080, h: 1350 },
  { key: "story", label: "Story", sub: "1080 × 1920", w: 1080, h: 1920 },
];
const THEMES = [
  { key: "forest", label: "Forest", bg: ["#0f3d24", "#1e7a4c"], ink: "#ffffff", soft: "rgba(255,255,255,.82)", accent: "#ecc77d", chip: "rgba(255,255,255,.14)", chipInk: "#ffffff", card: "rgba(255,255,255,.10)" },
  { key: "cream", label: "Cream", bg: ["#fbf3e0", "#f3e2bb"], ink: "#173c2a", soft: "#4b5d53", accent: "#a86e0e", chip: "#ffffff", chipInk: "#14532d", card: "#ffffff" },
  { key: "sage", label: "Sage", bg: ["#d9eee1", "#f3ead9"], ink: "#173c2a", soft: "#3f4f47", accent: "#1e7a4c", chip: "rgba(255,255,255,.85)", chipInk: "#14532d", card: "rgba(255,255,255,.8)" },
];
const TEMPLATES = [
  { key: "book", label: "Book a session", headline: "Feeling overwhelmed? Let's talk." },
  { key: "help", label: "I can help with", headline: "Areas I can help you with" },
  { key: "review", label: "Client review", headline: "What my clients say" },
  { key: "open", label: "Now accepting clients", headline: "Now accepting new clients" },
];

const clean = (v) => (v == null || v === "null" ? "" : String(v).trim());
const listOf = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((x) => clean(typeof x === "object" ? x.value || x.label : x)).filter(Boolean);
const minFee = (t) => {
  const f = (Array.isArray(t?.fees) ? t.fees : []).flatMap((x) => (x?.formats || []).map((y) => Number(y?.fee) || 0)).filter((n) => n > 0);
  return f.length ? Math.min(...f) : 0;
};
const modesText = (t) => {
  const f = (Array.isArray(t?.fees) ? t.fees : []).flatMap((x) => x?.formats || []).filter((y) => Number(y?.fee) > 0).map((y) => String(y.type || "").toLowerCase());
  const m = [];
  if (f.some((x) => /video|audio/.test(x))) m.push("Online");
  if (f.some((x) => /person/.test(x))) m.push("In-person");
  return m.join(" · ") || "Online sessions";
};

/* ── canvas helpers ── */
const font = (w, size, fam = "sans") => `${w} ${size}px ${fam === "serif" ? "'Playfair Display', Georgia, serif" : "Inter, 'Helvetica Neue', Arial, sans-serif"}`;
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function lines(ctx, text, maxW) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const out = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}
// draws wrapped text, returns the y below it
function textBlock(ctx, text, x, y, maxW, lh, maxLines = 9, align = "left") {
  let ls = lines(ctx, text, maxW);
  if (ls.length > maxLines) { ls = ls.slice(0, maxLines); ls[maxLines - 1] = `${ls[maxLines - 1].replace(/\W*\s*\S*$/, "")}…`; }
  ctx.textAlign = align;
  ls.forEach((l, i) => ctx.fillText(l, align === "center" ? x + maxW / 2 : x, y + i * lh));
  ctx.textAlign = "left";
  return y + ls.length * lh;
}
function photo(ctx, img, x, y, w, h, r, circle = false) {
  ctx.save();
  if (circle) { ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2); ctx.closePath(); } else rr(ctx, x, y, w, h, r);
  ctx.clip();
  if (img) {
    const s = Math.max(w / img.width, h / img.height);
    const iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) * 0.1, iw, ih);
  } else {
    ctx.fillStyle = "#cfe9d8"; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}
function chips(ctx, items, x, y, maxW, th, size = 30) {
  ctx.font = font(700, size);
  const padX = size * 0.7, h = size * 1.9, gap = size * 0.45;
  let cx = x, cy = y;
  for (const it of items) {
    const w = ctx.measureText(it).width + padX * 2;
    if (cx + w > x + maxW && cx > x) { cx = x; cy += h + gap; }
    ctx.fillStyle = th.chip; rr(ctx, cx, cy, w, h, h / 2); ctx.fill();
    ctx.fillStyle = th.chipInk; ctx.fillText(it, cx + padX, cy + h * 0.66);
    cx += w + gap;
  }
  return cy + h;
}
function stars(ctx, x, y, size, n, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const cx = x + i * size * 1.2 + size / 2, cy = y + size / 2;
    ctx.globalAlpha = i < Math.round(n) ? 1 : 0.3;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? size * 0.22 : size / 2;
      const a = (Math.PI / 5) * k - Math.PI / 2;
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function brandBar(ctx, W, H, th, link) {
  const y = H - 120;
  ctx.fillStyle = th.card; rr(ctx, 60, y, W - 120, 76, 38); ctx.fill();
  ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(104, y + 38, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = th.key === "forest" ? "#0f3d24" : "#fff"; ctx.font = font(900, 14); ctx.textAlign = "center"; ctx.fillText("CYT", 104, y + 43); ctx.textAlign = "left";
  ctx.fillStyle = th.ink; ctx.font = font(800, 27); ctx.fillText("Book on Choose Your Therapist", 140, y + 47);
  ctx.fillStyle = th.accent; ctx.font = font(800, 25); ctx.textAlign = "right"; ctx.fillText(link, W - 96, y + 47); ctx.textAlign = "left";
}

function draw(ctx, opts) {
  const { W, H, th } = opts;
  // measure the content on a scratch canvas, then centre it between the top and the brand bar
  const scratch = document.createElement("canvas");
  scratch.width = W; scratch.height = H;
  const end = content(scratch.getContext("2d"), opts, 0);
  const top = H >= 1900 ? 150 : H > 1100 ? 90 : 64;
  const room = H - 150 - top;
  const dy = Math.max(0, (room - (end - top)) / 2);
  background(ctx, W, H, th);
  content(ctx, opts, dy);
  brandBar(ctx, W, H, th, SITE);
}

function background(ctx, W, H, th) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // soft shapes
  ctx.globalAlpha = 0.18; ctx.fillStyle = th.accent;
  ctx.beginPath(); ctx.arc(W - 60, 80, 260, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(40, H - 200, 200, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// draws the post's content starting dy lower; returns where it ends
function content(ctx, { W, H, th, tpl, headline, p, img, review }, dy) {

  const story = H >= 1900, tall = H > 1100;
  const pad = 80, inner = W - pad * 2;
  let y = (story ? 170 : tall ? 110 : 80) + dy;

  // eyebrow
  ctx.fillStyle = th.accent; ctx.font = font(800, 26);
  ctx.fillText(tpl === "review" ? "★ CLIENT REVIEW" : tpl === "open" ? "● NOW BOOKING" : "VERIFIED PSYCHOLOGIST", pad, y);
  y += story ? 70 : 52;

  // headline
  ctx.fillStyle = th.ink;
  const hs = story ? 78 : tall ? 66 : 58;
  ctx.font = font(800, hs, "serif");
  y = textBlock(ctx, headline, pad, y + hs * 0.8, inner, hs * 1.18, 3) + (story ? 40 : 24);

  const name = p.name, role = p.role;
  if (tpl === "book" || tpl === "open") {
    const ph = story ? 760 : tall ? 520 : 400;
    const pw = tpl === "book" ? inner : Math.min(inner, ph);
    photo(ctx, img, pad, y, pw, ph, 36);
    if (tpl === "open") {
      // details beside / under the photo
      const bx = pad + pw + 40, bw = W - bx - pad;
      let by = y + 20;
      if (bw > 220) {
        ctx.fillStyle = th.ink; ctx.font = font(800, 40); by = textBlock(ctx, name, bx, by + 36, bw, 48, 2);
        ctx.fillStyle = th.soft; ctx.font = font(600, 28); by = textBlock(ctx, role, bx, by + 10, bw, 36, 2) + 20;
        ctx.fillStyle = th.ink; ctx.font = font(700, 28);
        for (const line of [p.modes, p.langs && `Languages: ${p.langs}`, p.exp && `${p.exp} experience`, p.fee && `Sessions from ₹${p.fee.toLocaleString("en-IN")}`].filter(Boolean)) {
          ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(bx + 8, by + 22, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = th.ink; by = textBlock(ctx, line, bx + 28, by + 32, bw - 28, 36, 2) + 14;
        }
      }
      y = Math.max(y + ph, by) + (story ? 50 : 34);
      if (bw <= 220) { ctx.fillStyle = th.ink; ctx.font = font(800, 40); y = textBlock(ctx, name, pad, y + 36, inner, 48, 2); }
      if (story || tall) { y = chips(ctx, p.skills.slice(0, story ? 6 : 4), pad, y, inner, th, story ? 30 : 26) + 30; }
    } else {
      // name card over the photo's bottom edge
      const cy = y + ph - 34;
      ctx.fillStyle = th.key === "forest" ? "rgba(15,61,36,.88)" : "rgba(255,255,255,.94)";
      rr(ctx, pad + 30, cy, inner - 60, 96, 24); ctx.fill();
      ctx.fillStyle = th.key === "forest" ? "#fff" : "#13261c"; ctx.font = font(800, 36);
      ctx.fillText(name, pad + 60, cy + 45);
      ctx.fillStyle = th.key === "forest" ? "#ecc77d" : "#8a5d06"; ctx.font = font(700, 24);
      ctx.fillText(`${role}${p.rating ? `  ·  ★ ${p.rating}` : ""}`, pad + 60, cy + 78);
      y += ph + (story ? 90 : 72);
      y = chips(ctx, p.skills.slice(0, story ? 6 : tall ? 4 : 3), pad, y, inner, th, story ? 30 : 26) + (story ? 40 : 24);
      if (story || tall) {
        ctx.fillStyle = th.soft; ctx.font = font(600, story ? 34 : 30);
        y = textBlock(ctx, `${p.modes}${p.fee ? ` · from ₹${p.fee.toLocaleString("en-IN")}` : ""}${p.langs ? ` · ${p.langs}` : ""}`, pad, y + 30, inner, 44, 2) + 10;
      }
    }
  }

  if (tpl === "help") {
    const items = p.skills.slice(0, story ? 9 : tall ? 7 : 5);
    const rowH = story ? 92 : 74;
    items.forEach((s, i) => {
      const ry = y + i * (rowH + 12);
      ctx.fillStyle = th.card; rr(ctx, pad, ry, inner, rowH, 22); ctx.fill();
      ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(pad + 44, ry + rowH / 2, 18, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = th.key === "forest" ? "#0f3d24" : "#fff"; ctx.lineWidth = 5; ctx.beginPath();
      ctx.moveTo(pad + 35, ry + rowH / 2); ctx.lineTo(pad + 42, ry + rowH / 2 + 7); ctx.lineTo(pad + 54, ry + rowH / 2 - 7); ctx.stroke();
      ctx.fillStyle = th.ink; ctx.font = font(700, story ? 36 : 32);
      ctx.fillText(s, pad + 84, ry + rowH / 2 + 12);
    });
    y += items.length * (rowH + 12) + 30;
    // who
    photo(ctx, img, pad, y, 110, 110, 0, true);
    ctx.fillStyle = th.ink; ctx.font = font(800, 36); ctx.fillText(name, pad + 135, y + 48);
    ctx.fillStyle = th.soft; ctx.font = font(600, 26); ctx.fillText(role, pad + 135, y + 86);
    y += 110;
  }

  if (tpl === "review") {
    const qh = story ? 820 : tall ? 640 : 470;
    ctx.fillStyle = th.card; rr(ctx, pad, y, inner, qh, 36); ctx.fill();
    ctx.fillStyle = th.accent; ctx.font = font(900, 160, "serif"); ctx.fillText("“", pad + 30, y + 150);
    stars(ctx, pad + 50, y + 150, 40, review?.rating || 5, th.accent);
    ctx.fillStyle = th.ink;
    const qs = story ? 46 : tall ? 42 : 36;
    ctx.font = font(600, qs, "serif");
    const text = review?.description || "My clients' kind words will appear here once they leave a review on my profile.";
    textBlock(ctx, text, pad + 50, y + 250, inner - 100, qs * 1.42, story ? 11 : tall ? 8 : 5);
    ctx.fillStyle = th.soft; ctx.font = font(700, 28);
    ctx.fillText(`— ${review?.name ? String(review.name).split(/\s+/)[0] : "A client"}, verified session`, pad + 50, y + qh - 50);
    y += qh + 40;
    photo(ctx, img, pad, y, 110, 110, 0, true);
    ctx.fillStyle = th.ink; ctx.font = font(800, 36); ctx.fillText(name, pad + 135, y + 48);
    ctx.fillStyle = th.soft; ctx.font = font(600, 26); ctx.fillText(`${role}${p.rating ? `  ·  ★ ${p.rating} (${p.reviewsN})` : ""}`, pad + 135, y + 86);
    y += 110;
  }
  return y;
}

const loadImg = (src) => new Promise((resolve) => {
  if (!src) return resolve(null);
  const im = new Image();
  im.crossOrigin = "anonymous";
  im.onload = () => resolve(im);
  im.onerror = () => resolve(null);
  im.src = src;
});

export default function SocialPosts() {
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();
  const [profile, setProfile] = useState(null);
  const [img, setImg] = useState(null);
  const [fmt, setFmt] = useState("post");
  const [themeKey, setThemeKey] = useState("forest");
  const [tpl, setTpl] = useState("book");
  const [headlines, setHeadlines] = useState(() => Object.fromEntries(TEMPLATES.map((t) => [t.key, t.headline])));
  const [ri, setRi] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => { if (!therapistInfo?._id) fetchTherapistInfo(); }, [therapistInfo?._id, fetchTherapistInfo]);
  useEffect(() => {
    if (!therapistInfo?._id) return;
    fetchData(getTherapistProfile + therapistInfo._id).then((r) => { if (r?.data) setProfile(r.data); }).catch(() => {});
  }, [therapistInfo?._id]);
  useEffect(() => {
    const f = profile?.user?.profile;
    if (!f) return;
    const full = /^https?:/.test(f) ? f : `${imagePath}/${f}`;
    loadImg(thumb(full, 1080, 90)).then(setImg);
  }, [profile?.user?.profile]);

  const reviews = useMemo(() => (profile?.reviews || []).filter((r) => clean(r.description).length > 15).sort((a, b) => (b.rating || 0) - (a.rating || 0)), [profile]);
  const p = useMemo(() => {
    if (!profile) return null;
    const rs = (profile.reviews || []).filter((r) => typeof r.rating === "number");
    const avg = rs.length ? (rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(1) : "";
    const skills = listOf(profile.experties).map((s) => s.replace(/\s*\(.*?\)\s*/g, "").trim()).filter((s) => s.length <= 28);
    return {
      name: clean(profile.user?.name) || "Your name",
      role: clean(profile.profile_type) || "Psychologist",
      skills: skills.length ? skills : ["Anxiety", "Stress", "Relationships"],
      rating: avg, reviewsN: rs.length,
      fee: minFee(profile),
      modes: modesText(profile),
      langs: listOf(profile.language_spoken).slice(0, 3).join(", "),
      exp: clean(profile.year_of_exp) ? `${clean(profile.year_of_exp).replace(/years?/i, "").trim()} yrs` : "",
      link: `https://www.${SITE}${profilePath(profile)}`,
    };
  }, [profile]);

  const F = FORMATS.find((f) => f.key === fmt);
  const th = THEMES.find((t) => t.key === themeKey);

  const render = useCallback(async () => {
    const c = canvasRef.current;
    if (!c || !p) return;
    try { await Promise.all([document.fonts.load(font(800, 60, "serif")), document.fonts.load(font(600, 40, "serif"))]); } catch { /* fall back to Georgia */ }
    c.width = F.w; c.height = F.h;
    draw(c.getContext("2d"), { W: F.w, H: F.h, th, tpl, headline: headlines[tpl], p, img, review: reviews[ri % Math.max(1, reviews.length)] });
  }, [p, F, th, tpl, headlines, img, reviews, ri]);
  useEffect(() => { render(); }, [render]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    try {
      c.toBlob((blob) => {
        if (!blob) { toast.error("Couldn't create the image — please try again"); return; }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `cyt-${tpl}-${fmt}-${F.w}x${F.h}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, "image/png");
    } catch {
      toast.error("Couldn't create the image — please try again");
    }
  };

  const caption = p ? [
    tpl === "review" ? `Grateful for kind words from a client 💚` : tpl === "help" ? `Here's what I can help you with 🌿` : tpl === "open" ? `I'm now accepting new clients 🌱` : `Feeling overwhelmed? You don't have to go through it alone. 💚`,
    "",
    `I'm ${p.name}, a ${p.role}${p.langs ? ` — I work in ${p.langs}` : ""}. ${p.modes}${p.fee ? `, sessions from ₹${p.fee.toLocaleString("en-IN")}` : ""}.`,
    "",
    `Book a session: ${p.link}`,
    "",
    `#mentalhealth #therapy #psychologist #${p.skills[0] ? p.skills[0].replace(/[^A-Za-z]/g, "").toLowerCase() : "selfcare"} #mentalhealthindia #chooseyourtherapist`,
  ].join("\n") : "";
  const copyCaption = () => { try { navigator.clipboard.writeText(caption); toast.success("Caption copied"); } catch { toast.error("Couldn't copy"); } };

  return (
    <MainLayout>
      <Head><title>Social posts | CYT Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sp">
        <div className="sp-head">
          <h1>Social posts</h1>
          <p>Instagram posts and stories made from your profile. Pick a design, edit the headline and download in HD.</p>
        </div>
        <div className="sp-wrap">
          <div className="sp-controls">
            <div className="sp-group">
              <span className="sp-l">Design</span>
              <div className="sp-opts col">
                {TEMPLATES.map((t) => <button key={t.key} type="button" className={tpl === t.key ? "on" : ""} onClick={() => setTpl(t.key)}>{t.label}</button>)}
              </div>
            </div>
            <div className="sp-group">
              <span className="sp-l">Size</span>
              <div className="sp-opts">
                {FORMATS.map((f) => <button key={f.key} type="button" className={fmt === f.key ? "on" : ""} onClick={() => setFmt(f.key)}>{f.label}<small>{f.sub}</small></button>)}
              </div>
            </div>
            <div className="sp-group">
              <span className="sp-l">Colours</span>
              <div className="sp-opts">
                {THEMES.map((t) => (
                  <button key={t.key} type="button" className={`sp-sw${themeKey === t.key ? " on" : ""}`} onClick={() => setThemeKey(t.key)}>
                    <i style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]})` }} />{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sp-group">
              <span className="sp-l">Headline</span>
              <textarea rows={2} maxLength={80} value={headlines[tpl]} onChange={(e) => setHeadlines((h) => ({ ...h, [tpl]: e.target.value }))} />
            </div>
            {tpl === "review" && (
              <div className="sp-group">
                <span className="sp-l">Review</span>
                {reviews.length > 1 ? (
                  <div className="sp-rev">
                    <button type="button" onClick={() => setRi((i) => (i - 1 + reviews.length) % reviews.length)}>‹</button>
                    <span>{(ri % reviews.length) + 1} of {reviews.length}</span>
                    <button type="button" onClick={() => setRi((i) => (i + 1) % reviews.length)}>›</button>
                  </div>
                ) : <p className="sp-note">{reviews.length ? "Your review is used." : "No written reviews yet — ask a client to leave one, then it appears here."}</p>}
              </div>
            )}
            <button type="button" className="sp-dl" disabled={!p} onClick={download}>Download HD ({F.w} × {F.h})</button>
            <div className="sp-group">
              <span className="sp-l">Caption</span>
              <textarea className="sp-cap" rows={7} readOnly value={caption} />
              <button type="button" className="sp-copy" disabled={!p} onClick={copyCaption}>Copy caption</button>
            </div>
          </div>
          <div className={`sp-preview ${fmt}`}>
            {!p && <div className="sp-loading">Loading your profile…</div>}
            <canvas ref={canvasRef} aria-label="Post preview" style={{ display: p ? "block" : "none" }} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const CSS = `
.sp { padding-bottom: 40px; }
.sp-head h1 { margin: 0; font-size: 22px; font-weight: 800; color: #13261c; }
.sp-head p { margin: 4px 0 16px; padding: 0; font-size: 14px; color: #5b6b62; }
.sp-wrap { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 20px; align-items: start; }
.sp-controls { display: flex; flex-direction: column; gap: 16px; background: #fff; border: 1px solid #e6ece8; border-radius: 18px; padding: 18px; }
.sp-group { display: flex; flex-direction: column; gap: 8px; }
.sp-l { font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8a948f; }
.sp-opts { display: flex; flex-wrap: wrap; gap: 6px; }
.sp-opts.col { display: grid; grid-template-columns: 1fr 1fr; }
.sp-opts button { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 1px; border: 1.5px solid #e3ebe6; background: #fff; border-radius: 12px; padding: 8px 12px; font-size: 13px; font-weight: 700; color: #26463a; cursor: pointer; text-align: left; }
.sp-opts button small { font-size: 11px; font-weight: 600; color: #8a948f; }
.sp-opts button.on { border-color: #1e7a4c; background: #eef7f1; color: #14532d; }
.sp-sw { flex-direction: row !important; align-items: center !important; gap: 8px !important; }
.sp-sw i { width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(0,0,0,.08); }
.sp-group textarea { width: 100%; box-sizing: border-box; border: 1.5px solid #e3ebe6; border-radius: 12px; padding: 10px 12px; font-size: 14px; font-family: inherit; resize: vertical; }
.sp-cap { font-size: 12.5px !important; color: #475569; background: #f7f9f8; }
.sp-rev { display: flex; align-items: center; gap: 10px; }
.sp-rev button { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #e3ebe6; background: #fff; font-size: 18px; font-weight: 800; color: #14532d; cursor: pointer; }
.sp-rev span { font-size: 13px; font-weight: 700; color: #26463a; }
.sp-note { margin: 0; padding: 0; font-size: 12.5px; color: #6b7c72; }
.sp-dl { height: 48px; border: none; border-radius: 12px; background: #14532d; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
.sp-dl:hover { background: #0f3d22; }
.sp-dl:disabled, .sp-copy:disabled { opacity: .5; cursor: default; }
.sp-copy { align-self: flex-start; height: 36px; padding: 0 14px; border: 1.5px solid #cfe3d6; background: #fff; border-radius: 10px; font-weight: 800; font-size: 13px; color: #14532d; cursor: pointer; }
.sp-preview { position: sticky; top: 90px; display: flex; justify-content: center; align-items: flex-start; background: #f1f5f2; border: 1px solid #e6ece8; border-radius: 18px; padding: 20px; min-height: 300px; }
.sp-preview canvas { width: 100%; max-width: 560px; height: auto; border-radius: 10px; box-shadow: 0 20px 40px -24px rgba(16,40,28,.5); }
.sp-preview.story canvas { max-width: 360px; }
.sp-preview.portrait canvas { max-width: 480px; }
.sp-loading { align-self: center; color: #6b7c72; font-size: 14px; }
@media (max-width: 900px) {
  .sp-wrap { grid-template-columns: 1fr; }
  .sp-preview { position: static; order: -1; padding: 12px; }
  .sp-preview.story canvas { max-width: 300px; }
}
`;
