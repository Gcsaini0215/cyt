import React, { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../../utils/url";

/* Shared bits of the festival "book 1, get 1 free" pages (/festival-therapy and /festival-therapy/gift/[code]):
   mode + date/time picker on the Noida centre's own slots, form fields, the free-session link box. */

export const WHATSAPP = "918077757951";
export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const dayLabel = (d, opts = { weekday: "short", day: "numeric", month: "short" }) => {
  if (!d) return "";
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });
};
export const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const FORMAT_LABEL = { "in-person": "In-person · Noida centre", online: "Online · video call" };

export const PSY = "an experienced counselling psychologist";
// The WhatsApp message the buyer sends with the free-session link (they can edit it before sending).
export const shareText = ({ link, toName, fromName, validTill }) => {
  const by = dayLabel(validTill, { day: "numeric", month: "short" });
  const first = (s) => String(s || "").trim().split(" ")[0];
  return [
    `${toName ? `Hi ${first(toName)}` : "Hi"} 🪔`,
    "",
    `Shubh Deepawali! This Diwali I wanted to give you something special — a *free therapy session* with ${PSY} at Choose Your Therapist 💛`,
    "",
    "🎁 1 free session, just for you",
    "💻 Online or 🏢 in person at their Noida centre",
    `📅 Book any time before *${by}*`,
    "",
    `👉 ${link}`,
    "",
    "Open the link, pick a time that suits you — no payment needed. It's private and only for you.",
    ...(fromName ? ["", `With love,`, first(fromName)] : []),
  ].join("\n");
};
export const waShare = (text, phone) => `https://wa.me/${phone ? `91${phone}` : ""}?text=${encodeURIComponent(text)}`;

// Razorpay's script is only fetched when someone is about to pay
export function loadRazorpay() {
  if (typeof window === "undefined" || window.Razorpay || document.getElementById("rzp-checkout-js")) return;
  const el = document.createElement("script");
  el.id = "rzp-checkout-js";
  el.src = "https://checkout.razorpay.com/v1/checkout.js";
  el.async = true;
  document.body.appendChild(el);
}
export function waitForRazorpay(timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (window.Razorpay) { clearInterval(iv); resolve(); }
      else if (Date.now() - t0 > timeout) { clearInterval(iv); reject(new Error("Payment couldn't load. Please check your connection and try again.")); }
    }, 150);
  });
}

// The Noida centre's open slots (same as /noida-appointment), limited to [from, to] and without blocked days.
export function useOfferSlots({ from, to, blocked = [], refreshKey = 0 }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!from || !to) return;
    let live = true;
    setError("");
    fetch(`${apiUrl}/noida-appointments/slots-matrix?type=new`).then((r) => r.json()).then((j) => {
      if (!live) return;
      if (!j?.status) { setError("Couldn't load times. Please refresh."); setRows([]); return; }
      setRows((j.data || []).filter((s) => !s.booked && !s.past && !s.lastMinute && s.date >= from && s.date <= to && !blocked.includes(s.date)));
    }).catch(() => { if (live) { setError("Couldn't load times. Please check your connection."); setRows([]); } });
    return () => { live = false; };
  }, [from, to, blocked.join(","), refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const byDate = useMemo(() => {
    const m = new Map();
    (rows || []).forEach((s) => { if (!m.has(s.date)) m.set(s.date, []); m.get(s.date).push(s.slot); });
    return m;
  }, [rows]);
  return { loading: rows === null, error, byDate };
}

const minutesOf = (slot) => {
  const [t, ap] = slot.split(" - ")[0].split(" ");
  let [h, m] = t.split(":").map(Number);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

export function FormatPick({ value, onChange, prices, formats = ["in-person", "online"] }) {
  const opts = [["in-person", "In-person", "At our Noida centre"], ["online", "Online", "Video call from home"]].filter(([k]) => formats.includes(k));
  return (
    <div className={`fx-formats ${opts.length === 1 ? "one" : ""}`} role="radiogroup" aria-label="Session mode">
      {opts.map(([k, t, s]) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} className={`fx-format ${value === k ? "on" : ""}`} onClick={() => onChange(k)}>
          <b>{t}</b><span>{s}</span>{prices ? <em>{inr(prices[k])}</em> : <em>Free</em>}
        </button>
      ))}
    </div>
  );
}

// every day from `from` to `to` (YYYY-MM-DD)
export function daysBetween(from, to) {
  const out = [];
  if (!from || !to) return out;
  for (let d = from, i = 0; d <= to && i < 60; i++) {
    out.push(d);
    const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 1); d = x.toISOString().slice(0, 10);
  }
  return out;
}

// "Online only" / "In-person only" / null — when the admin has switched a mode off for one day
export function dayModeNote(dateFormats, d, format) {
  const day = dateFormats?.[d];
  if (!Array.isArray(day) || day.includes(format)) return null;
  if (!day.length) return "Closed";
  return day.includes("online") ? "Online only" : "In-person only";
}

export function SlotPick({ byDate, loading, error, date, slot, onDate, onSlot, blocked = [], emptyText, from, to, dateFormats, format }) {
  const open = [...byDate.keys()].sort().filter((d) => !dayModeNote(dateFormats, d, format));
  // the whole window (e.g. the next 15 days from booking), with days that have no free time greyed out
  const dates = from && to ? daysBetween(from, to) : open;
  useEffect(() => {
    if (loading) return;
    if (open.length && !open.includes(date)) { onDate(open[0]); onSlot(""); }
    if (!open.length && date) { onDate(""); onSlot(""); }
  }, [loading, open.join(","), format]); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading) return <div className="fx-muted">Loading open times…</div>;
  if (error) return <div className="fx-err">{error}</div>;
  const slots = (byDate.get(date) || []).slice().sort((a, b) => minutesOf(a) - minutesOf(b));
  return (
    <div>
      <div className="fx-dates">
        {dates.map((d) => {
          const off = blocked.includes(d), mode = !off && dayModeNote(dateFormats, d, format), full = !off && !mode && !byDate.has(d);
          return (
            <button key={d} type="button" disabled={!!(off || mode || full)} title={off ? "No sessions this day" : mode ? `${mode} on this day` : full ? "No open times this day" : ""}
              className={`fx-date ${d === date ? "on" : ""} ${off || mode || full ? "off" : ""} ${mode ? "mode" : ""}`} onClick={() => { onDate(d); onSlot(""); }}>
              <span>{dayLabel(d, { weekday: "short" })}</span><b>{dayLabel(d, { day: "numeric" })}</b><span>{off ? "Closed" : mode ? (mode === "Closed" ? "Closed" : mode.replace(" only", "")) : full ? "No slots" : dayLabel(d, { month: "short" })}</span>
            </button>
          );
        })}
      </div>
      {!open.length && <div className="fx-empty" style={{ marginTop: 8 }}>{emptyText || "No open times in this window right now."} <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a> and we'll find one.</div>}
      {blocked.length > 0 && <div className="fx-note">🪔 No sessions on {blocked.map((b) => dayLabel(b, { day: "numeric", month: "short" })).join(", ")}.</div>}
      <div className="fx-slots">
        {slots.map((s) => (
          <button key={s} type="button" className={`fx-slot ${s === slot ? "on" : ""}`} onClick={() => onSlot(s)}>{s.split(" - ")[0]}</button>
        ))}
      </div>
    </div>
  );
}

// Live countdown to the end of a day in IST ("YYYY-MM-DD" → 11:59:59 PM IST)
export const offerEnd = (endDate) => (endDate ? Date.parse(`${endDate}T23:59:59+05:30`) : 0);
export function Countdown({ endDate, label = "Offer ends in", onEnd }) {
  const end = offerEnd(endDate);
  const [now, setNow] = useState(null); // set on the client only, so the server HTML matches
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const over = !!end && now !== null && now >= end;
  useEffect(() => { if (over && onEnd) onEnd(); }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!end || now === null) return <div className="fx-cd fx-cd-wait" aria-hidden="true" />;
  const left = Math.max(0, Math.floor((end - now) / 1000));
  if (!left) return <div className="fx-cd"><div className="fx-cd-l">This offer has ended</div></div>;
  const parts = [[Math.floor(left / 86400), "Days"], [Math.floor(left / 3600) % 24, "Hrs"], [Math.floor(left / 60) % 60, "Min"], [left % 60, "Sec"]];
  return (
    <div className="fx-cd" role="timer" aria-label={`${label} ${parts[0][0]} days ${parts[1][0]} hours`}>
      <div className="fx-cd-l">{label}</div>
      <div className="fx-cd-row">
        {parts.map(([n, t]) => <div key={t} className="fx-cd-b"><b>{String(n).padStart(2, "0")}</b><span>{t}</span></div>)}
      </div>
      <div className="fx-cd-s">Book till {dayLabel(endDate, { day: "numeric", month: "short" })}, 11:59 PM</div>
    </div>
  );
}

// The Noida centre on a map — shown when someone picks an in-person session
export const CENTRE_ADDRESS = "Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida, Uttar Pradesh 201301";
const MAP_EMBED = "https://www.google.com/maps?q=Choose+Your+Therapist+LLP,+D-137,+Sector+51,+Noida&z=16&output=embed";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Choose+Your+Therapist+LLP+Sector+51+Noida";
export function CentreMap() {
  return (
    <div className="fx-map">
      <iframe title="Map — Choose Your Therapist, D-137, Sector 51, Noida" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      <div className="fx-map-b">
        <div><b>📍 CYT Noida centre</b>{CENTRE_ADDRESS}</div>
        <a className="fx-btn fx-btn-ghost" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Directions</a>
      </div>
    </div>
  );
}

// Fade-up cards as they scroll into view; the hero drifts up and fades (no motion if the reader prefers less)
export function useScrollFx(heroSel) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("fx-js");
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.01, rootMargin: "0px 0px -40px 0px" }) : null;
    document.querySelectorAll(".fx-reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const hero = heroSel && document.querySelector(heroSel);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!hero) return;
        const y = Math.min(window.scrollY, 600);
        hero.style.transform = `translateY(${y * 0.35}px)`;
        hero.style.opacity = String(Math.max(0.15, 1 - y / 520));
      });
    };
    if (hero && !reduce) { window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
    return () => { root.classList.remove("fx-js"); io?.disconnect(); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); if (hero) { hero.style.transform = ""; hero.style.opacity = ""; } };
  }, [heroSel]);
}

export function Field({ label, optional, children, hint }) {
  return (
    <label className="fx-field">
      <span className="fx-label">{label}{optional && <i> (optional)</i>}</span>
      {children}
      {hint && <span className="fx-hint">{hint}</span>}
    </label>
  );
}

export function GiftLinkBox({ link, validTill, toName, fromName, phone, openLabel = "Open free session link", showTemplate = true }) {
  const [copied, setCopied] = useState("");
  const tpl = shareText({ link, toName, fromName, validTill });
  const [text, setText] = useState(tpl);
  const [edited, setEdited] = useState(false);
  const [to, setTo] = useState(phone || "");
  useEffect(() => { if (!edited) setText(tpl); }, [tpl]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (phone) setTo(phone); }, [phone]);
  const copy = async (what, val) => {
    try { await navigator.clipboard.writeText(val); setCopied(what); setTimeout(() => setCopied(""), 1800); }
    catch { window.prompt("Copy this", val); }
  };
  return (
    <div className="fx-linkbox">
      <div className="fx-linkbox-k">🎁 Free session link</div>
      <div className="fx-linkbox-v">{link}</div>
      <div className="fx-linkbox-acts">
        <a className="fx-btn fx-btn-open" href={link}>{openLabel} →</a>
        <button type="button" className="fx-btn fx-btn-ghost" onClick={() => copy("link", link)}>{copied === "link" ? "Copied ✓" : "Copy link"}</button>
      </div>
      <div className="fx-hint">Use by {dayLabel(validTill, { day: "numeric", month: "long" })} · works once</div>
      {showTemplate && (
        <div className="fx-wa">
          <div className="fx-wa-h"><span className="fx-wa-ic">✆</span> WhatsApp message <i>— ready to send, edit if you like</i></div>
          <textarea className="fx-wa-msg" rows={9} value={text} onChange={(e) => { setText(e.target.value); setEdited(true); }} aria-label="WhatsApp message" />
          <div className="fx-wa-row">
            <input className="fx-wa-to" value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="Their WhatsApp no. (optional)" aria-label="Their WhatsApp number" />
            <a className="fx-btn fx-btn-wa" href={waShare(text, /^\d{10}$/.test(to) ? to : "")} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
          </div>
          <button type="button" className="fx-wa-copy" onClick={() => copy("msg", text)}>{copied === "msg" ? "Message copied ✓" : "Copy message"}</button>
        </div>
      )}
    </div>
  );
}

export const FX_CSS = `
.fx { --m:#7a1426; --m2:#5e0f1d; --g:#f2b43c; --g2:#c98a12; --c:#fbf3e6; --ink:#2b1a12; --soft:#6b5a4e; --line:#ecdcc4; background:var(--c); color:var(--ink); min-height:60vh; }
.fx * { box-sizing:border-box; }
.fx-wrap { max-width:1080px; margin:0 auto; padding:0 16px; }
.fx-card { background:#fff; border:1px solid var(--line); border-radius:18px; padding:20px; box-shadow:0 10px 30px rgba(122,20,38,.07); }
.fx-h { font-size:15px; font-weight:800; margin:0 0 10px; color:var(--m); display:flex; align-items:center; gap:8px; }
.fx-h .n { width:22px; height:22px; border-radius:50%; background:var(--m); color:#fff; font-size:12px; display:inline-flex; align-items:center; justify-content:center; flex:none; }
.fx-step { padding:16px 0; border-top:1px dashed var(--line); }
.fx-step:first-child { border-top:0; padding-top:0; }
.fx-formats { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.fx-format { text-align:left; border:1.5px solid var(--line); background:#fff; border-radius:14px; padding:12px 14px; cursor:pointer; display:flex; flex-direction:column; gap:2px; font:inherit; color:inherit; }
.fx-format b { font-size:15px; } .fx-format span { font-size:12.5px; color:var(--soft); } .fx-format em { font-style:normal; font-weight:800; color:var(--m); margin-top:4px; }
.fx-format.on { border-color:var(--m); background:#fff6f3; box-shadow:0 0 0 3px rgba(122,20,38,.1); }
.fx-dates { display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin; }
.fx-date { flex:none; width:62px; border:1.5px solid var(--line); background:#fff; border-radius:12px; padding:7px 0; display:flex; flex-direction:column; align-items:center; cursor:pointer; font:inherit; color:inherit; }
.fx-date span { font-size:11px; color:var(--soft); } .fx-date b { font-size:18px; line-height:1.2; }
.fx-date.on { background:var(--m); border-color:var(--m); color:#fff; } .fx-date.on span { color:#f6d9a8; }
.fx-date.off { opacity:.45; cursor:not-allowed; background:#f6f1ea; } .fx-date.off span:last-child { font-weight:700; color:#9b1c1c; }
.fx-date.mode { opacity:.6; } .fx-date.mode span:last-child { color:#1f6f8b; font-size:10px; }
.fx-map { margin-top:12px; border:1px solid var(--line); border-radius:14px; overflow:hidden; background:#fff; }
.fx-map iframe { display:block; width:100%; height:230px; border:0; }
.fx-map-b { display:flex; gap:10px; align-items:center; justify-content:space-between; padding:10px 12px; flex-wrap:wrap; }
.fx-map-b div { font-size:13px; color:var(--ink); min-width:0; flex:1 1 220px; } .fx-map-b b { display:block; font-size:14px; color:var(--m); }
.fx-map-b a { flex:none; padding:9px 16px; font-size:14px; }
.fx-reveal { transition:opacity .6s ease, transform .6s ease; }
.fx-js .fx-reveal:not(.in) { opacity:0; transform:translateY(26px); }
@media (prefers-reduced-motion: reduce) { .fx-js .fx-reveal:not(.in) { opacity:1; transform:none; } .fx-reveal { transition:none; } }
.fx-slots { display:grid; grid-template-columns:repeat(auto-fill,minmax(96px,1fr)); gap:8px; margin-top:10px; }
.fx-slot { border:1.5px solid var(--line); background:#fff; border-radius:10px; padding:9px 4px; font-weight:700; font-size:14px; cursor:pointer; font:inherit; font-weight:700; color:inherit; }
.fx-slot.on { background:var(--g); border-color:var(--g2); color:var(--m2); }
.fx-cd { margin:0 auto 22px; min-height:96px; }
.fx-cd-l { font-size:13px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#f6d9a8; margin-bottom:8px; }
.fx-cd-row { display:flex; gap:8px; justify-content:center; }
.fx-cd-b { min-width:62px; background:rgba(0,0,0,.22); border:1px solid rgba(242,180,60,.55); border-radius:12px; padding:8px 6px 6px; display:flex; flex-direction:column; align-items:center; }
.fx-cd-b b { font-size:26px; line-height:1; color:#f2b43c; font-variant-numeric:tabular-nums; }
.fx-cd-b span { font-size:10.5px; letter-spacing:1px; text-transform:uppercase; color:#f6e7cf; margin-top:4px; }
.fx-cd-s { font-size:12.5px; color:#f6e7cf; margin-top:8px; }
.fx-note { font-size:12.5px; color:var(--soft); margin-top:6px; }
.fx-muted { color:var(--soft); font-size:14px; padding:8px 0; }
.fx-empty { background:#fff8ec; border:1px solid var(--line); border-radius:12px; padding:12px; font-size:14px; }
.fx-empty a, .fx a.fx-link { color:var(--m); font-weight:700; }
.fx-err { background:#fdecec; color:#9b1c1c; border-radius:10px; padding:10px 12px; font-size:14px; margin-top:10px; }
.fx-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px 12px; }
.fx-field { display:flex; flex-direction:column; gap:4px; }
.fx-label { font-size:12.5px; font-weight:700; color:var(--soft); } .fx-label i { font-weight:400; font-style:normal; }
.fx-field input, .fx-field textarea { border:1.5px solid var(--line); border-radius:10px; padding:10px 12px; font:inherit; font-size:15px; background:#fff; color:var(--ink); width:100%; }
.fx-field input:focus, .fx-field textarea:focus { outline:none; border-color:var(--m); box-shadow:0 0 0 3px rgba(122,20,38,.1); }
.fx-hint { font-size:12px; color:var(--soft); }
.fx-seg { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
.fx-seg button { border:1.5px solid var(--line); background:#fff; border-radius:999px; padding:8px 14px; font:inherit; font-size:14px; font-weight:700; cursor:pointer; color:inherit; }
.fx-seg button.on { background:var(--m); border-color:var(--m); color:#fff; }
.fx-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:0; border-radius:999px; padding:12px 22px; font:inherit; font-weight:800; font-size:15px; cursor:pointer; text-decoration:none; }
.fx-btn-main { background:var(--g); color:var(--m2); width:100%; padding:15px; font-size:16.5px; box-shadow:0 6px 18px rgba(201,138,18,.3); }
.fx-btn-main:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; }
.fx-btn-wa { background:#1f9d55; color:#fff; } .fx-btn-ghost { background:#fff; color:var(--m); border:1.5px solid var(--m); }
.fx-sum { background:#fff8ec; border:1px solid var(--line); border-radius:14px; padding:12px 14px; font-size:14px; }
.fx-sum div { display:flex; justify-content:space-between; gap:10px; padding:3px 0; }
.fx-sum .tot { border-top:1px dashed var(--line); margin-top:5px; padding-top:7px; font-weight:800; font-size:16px; }
.fx-sum .free { color:#1f7a3f; font-weight:700; }
.fx-linkbox { border:2px dashed var(--g2); background:#fffaf0; border-radius:14px; padding:14px; text-align:center; }
.fx-linkbox-k { font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:var(--g2); }
.fx-linkbox-v { font-weight:800; color:var(--m); word-break:break-all; margin:6px 0 10px; font-size:15px; }
.fx-linkbox-acts { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:6px; }
.fx-btn-open { background:var(--m); color:#fff; box-shadow:0 6px 16px rgba(122,20,38,.25); }
.fx-btn-open:hover { color:#fff; background:var(--m2); }
.fx-formats.one { grid-template-columns:1fr; max-width:320px; }
.fx-wa { text-align:left; margin-top:14px; background:#effaf3; border:1px solid #cdebd8; border-radius:14px; padding:12px; }
.fx-wa-h { font-size:13px; font-weight:800; color:#16733f; margin-bottom:8px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.fx-wa-h i { font-style:normal; font-weight:500; color:#4f7a60; }
.fx-wa-ic { width:20px; height:20px; border-radius:50%; background:#1f9d55; color:#fff; font-size:12px; display:inline-flex; align-items:center; justify-content:center; }
.fx-wa-msg { width:100%; border:1px solid #cdebd8; border-radius:10px 10px 10px 2px; background:#dcf8c6; padding:10px 12px; font:inherit; font-size:14px; line-height:1.45; color:#1b2b20; resize:vertical; }
.fx-wa-row { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.fx-wa-to { flex:1 1 170px; min-width:0; border:1.5px solid #cdebd8; border-radius:999px; padding:10px 14px; font:inherit; font-size:14px; }
.fx-wa-row .fx-btn-wa { flex:1 1 170px; }
.fx-wa-copy { background:none; border:0; color:#16733f; font:inherit; font-size:13px; font-weight:700; text-decoration:underline; cursor:pointer; margin-top:6px; padding:0; }
.fx-done { text-align:center; }
.fx-done .tick { width:58px; height:58px; border-radius:50%; background:#1f9d55; color:#fff; font-size:30px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:8px; }
.fx-done h2 { margin:0 0 4px; font-size:22px; color:var(--m); }
.fx-rows { text-align:left; margin:14px 0; font-size:14px; }
.fx-rows div { display:flex; justify-content:space-between; gap:12px; padding:7px 0; border-bottom:1px solid #f3e8d6; } .fx-rows div:last-child { border-bottom:0; }
.fx-rows span { color:var(--soft); } .fx-rows b { text-align:right; }
@media (max-width:560px) {
  .fx-card { padding:16px; border-radius:16px; }
  .fx-grid2 { grid-template-columns:1fr; }
}
`;
