import React, { useState } from "react";
import { AbcdLogsView } from "./abcd";
import { ActivityView } from "./activity";
import { WhatIfView } from "./whatif";
import { PackForm, isPack, packCompletion } from "./rp-pack";

/* Progress over time (2026-11-19): the server keeps one snapshot per day a worksheet was saved, with a few
   numbers (answers, scores, before/after ratings). The client sees all of them; the therapist only the ones
   the client sent. "View" opens what was written that day, read-only. */

export function ToolView({ tool, data }) {
  if (isPack(tool)) return <PackForm tool={tool} value={data} readOnly />;
  if (tool === "activity") return <ActivityView data={data} />;
  if (tool === "whatif") return <WhatIfView data={data} />;
  return <AbcdLogsView data={data} />;
}

const COLORS = ["#0f766e", "#7c3aed", "#ea580c"];
const dayLabel = (day) => new Date(`${day}T12:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const fmt = (m) => (m.max ? `${m.v}${m.max === 100 ? "%" : `/${m.max}`}` : String(m.v));

// numbers that make sense on a line: scores / ratings (with a max), or counts when nothing else is there
function series(history) {
  const keys = [];
  for (const h of history) for (const m of h.metrics || []) if (!keys.some((k) => k.k === m.k)) keys.push({ k: m.k, label: m.label, max: m.max || null });
  const scored = keys.filter((k) => k.max);
  return (scored.length ? scored : keys).slice(0, 3).map((k, i) => ({
    ...k, color: COLORS[i],
    pts: history.map((h, x) => { const m = (h.metrics || []).find((y) => y.k === k.k); return m ? { x, v: m.v } : null; }).filter(Boolean),
  })).filter((s) => s.pts.length >= 2);
}

function Chart({ history }) {
  const lines = series(history);
  if (!lines.length) return null;
  const W = 600, H = 150, P = 18, n = Math.max(history.length - 1, 1);
  const top = Math.max(...lines.map((l) => l.max || Math.max(...l.pts.map((p) => p.v), 1)));
  const X = (x) => P + (x / n) * (W - 2 * P);
  const Y = (v) => H - P - (v / top) * (H - 2 * P);
  return (
    <div className="hx-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Progress chart">
        {[0, 0.5, 1].map((g) => <line key={g} x1={P} x2={W - P} y1={Y(top * g)} y2={Y(top * g)} stroke="#e5ece9" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        {lines.map((l) => (
          <g key={l.k}>
            <polyline points={l.pts.map((p) => `${X(p.x)},${Y(p.v)}`).join(" ")} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {l.pts.map((p) => <circle key={p.x} cx={X(p.x)} cy={Y(p.v)} r="4" fill="#fff" stroke={l.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
          </g>
        ))}
      </svg>
      <div className="hx-legend">
        {lines.map((l) => <span key={l.k}><i style={{ background: l.color }} />{l.label}: {l.pts[0].v}{l.max === 100 ? "%" : ""} → <b>{l.pts[l.pts.length - 1].v}{l.max === 100 ? "%" : ""}</b></span>)}
        <span className="hx-axis">{dayLabel(history[0].day)} – {dayLabel(history[history.length - 1].day)}</span>
      </div>
    </div>
  );
}

// one day so far: the latest scores as bars (before / after side by side)
function Bars({ metrics }) {
  const scored = (metrics || []).filter((m) => m.max);
  if (!scored.length) return null;
  return (
    <div className="hx-bars">
      {scored.map((m, i) => (
        <div key={m.k} className="hx-b">
          <span>{m.label}</span>
          <div className="hx-bar"><i style={{ width: `${Math.max(2, Math.round((m.v / m.max) * 100))}%`, background: COLORS[i % COLORS.length] }} /></div>
          <b>{fmt(m)}</b>
        </div>
      ))}
    </div>
  );
}

// history: oldest first (as the server keeps it). forTherapist: wording for the therapist's review page.
// onSend: the client's "Send my progress" (same as Send to therapist) — shown when there's something unsent.
// current: the answers on screen right now (live completion bar for pack worksheets)
export function HistoryCard({ tool, history, current = null, forTherapist = false, clientName = "", therapistName = "", onSend = null, sending = false }) {
  const [open, setOpen] = useState(null);
  const [showDays, setShowDays] = useState(forTherapist);
  const list = Array.isArray(history) ? history : [];
  const comp = current && isPack(tool) ? packCompletion(tool, current) : null;
  if (!list.length && !(comp && comp.done)) return null;
  const unsent = !forTherapist && list.some((h) => !h.sent);
  const pct = comp && comp.total ? Math.round((comp.done / comp.total) * 100) : 0;
  const hasLine = series(list).length > 0;
  return (
    <section className="hx">
      <style>{HX_CSS}</style>
      <div className="hx-h">
        <span className="hx-ic" aria-hidden="true">📈</span>
        <div>
          <h3>{forTherapist ? `${clientName ? `${clientName.split(" ")[0]}'s` : "Their"} progress` : "Your progress"}</h3>
          <p>{forTherapist ? `${list.length} sent version${list.length === 1 ? "" : "s"} — how the answers changed over time` : list.length ? `Saved on ${list.length} day${list.length === 1 ? "" : "s"} — each day's answers are kept, so you can see how things change` : "Your answers save as you type"}</p>
        </div>
      </div>
      {comp && comp.total > 0 && (
        <div className="hx-comp">
          <div className="hx-comp-t"><b>{comp.done} of {comp.total}</b> answered <span>{pct}%</span></div>
          <div className="hx-bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
      )}
      {hasLine ? <Chart history={list} /> : list.length > 0 && <Bars metrics={list[list.length - 1].metrics} />}
      {!forTherapist && list.length === 1 && <p className="hx-tip">Come back and save it on another day — your progress line starts from here.</p>}
      {list.length > 0 && (
        <button type="button" className="hx-days" onClick={() => setShowDays((s) => !s)} aria-expanded={showDays}>
          {showDays ? "Hide saved days" : `Saved days (${list.length})`} <i aria-hidden="true">{showDays ? "−" : "+"}</i>
        </button>
      )}
      {showDays && <ul className="hx-list">
        {[...list].reverse().map((h, ri) => {
          const i = list.length - 1 - ri;
          return (
            <li key={`${h.day}-${i}`}>
              <div className="hx-row">
                <b className="hx-day">{dayLabel(h.day)}</b>
                <span className="hx-ms">{(h.metrics || []).map((m) => <em key={m.k}>{m.label} <b>{fmt(m)}</b></em>)}</span>
                {!forTherapist && <span className={`hx-tag${h.sent ? " sent" : ""}`}>{h.sent ? `Sent${therapistName ? ` to ${therapistName.split(" ")[0]}` : ""}` : "Saved"}</span>}
                {h.data && <button type="button" className="hx-view" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>{open === i ? "Hide" : "View"}</button>}
              </div>
              {open === i && h.data && <div className="hx-body"><ToolView tool={tool} data={h.data} /></div>}
            </li>
          );
        })}
      </ul>}
      {unsent && onSend && therapistName && (
        <div className="hx-send">
          <p>Your latest answers aren&apos;t sent yet — {therapistName.split(" ")[0]} only sees what you send.</p>
          <button type="button" disabled={sending} onClick={onSend}>{sending ? "Sending…" : `Send my progress to ${therapistName.split(" ")[0]}`}</button>
        </div>
      )}
    </section>
  );
}

const HX_CSS = `
.hx { background: #fff; border-radius: 20px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); margin: 14px 0; }
.hx-h { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.hx-ic { flex: none; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; background: #e6f4f1; }
.hx-h h3 { margin: 0; font-size: 17px; font-weight: 800; color: #1c1c1e; }
.hx-h p { margin: 2px 0 0; font-size: 13px; color: #6e6e73; }
.hx-comp { margin: 4px 0 12px; }
.hx-comp-t { display: flex; align-items: baseline; gap: 6px; font-size: 14px; color: #334155; margin-bottom: 6px; }
.hx-comp-t b { color: #0f2a24; }
.hx-comp-t span { margin-left: auto; font-weight: 800; color: #0f766e; }
.hx-bar { height: 10px; border-radius: 999px; background: #edf2f0; overflow: hidden; }
.hx-bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #14b8a6, #0f766e); transition: width .3s ease; }
.hx-bars { display: flex; flex-direction: column; gap: 10px; margin: 4px 0 10px; }
.hx-b { display: grid; grid-template-columns: minmax(110px, 180px) minmax(0, 1fr) auto; align-items: center; gap: 10px; font-size: 13.5px; color: #334155; }
.hx-b b { color: #0f2a24; min-width: 44px; text-align: right; }
.hx-tip { margin: 0 0 8px; font-size: 13px; color: #6e6e73; }
.hx-days { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 0 4px; border: 0; border-top: 1px solid #eef2f0; background: none; font: inherit; font-size: 14px; font-weight: 800; color: #0f766e; cursor: pointer; text-align: left; }
.hx-days i { margin-left: auto; font-style: normal; font-size: 18px; }
@media (max-width: 640px) { .hx-b { grid-template-columns: minmax(0, 1fr) auto; } .hx-b > span { grid-column: 1 / -1; } }
.hx-chart { margin: 6px 0 10px; }
.hx-chart svg { display: block; width: 100%; height: 150px; }
.hx-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; color: #334155; }
.hx-legend span { display: inline-flex; align-items: center; gap: 6px; }
.hx-legend i { width: 10px; height: 10px; border-radius: 50%; }
.hx-legend .hx-axis { color: #94a3b8; margin-left: auto; }
.hx-list { list-style: none; margin: 0; padding: 0; }
.hx-list > li { border-top: 1px solid #eef2f0; }
.hx-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; flex-wrap: wrap; }
.hx-day { flex: none; min-width: 56px; font-size: 14px; color: #1c1c1e; }
.hx-ms { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.hx-ms em { font-style: normal; font-size: 12.5px; color: #475569; background: #f2f5f4; border-radius: 999px; padding: 3px 9px; }
.hx-ms em b { color: #0f2a24; }
.hx-tag { flex: none; font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 9px; background: #f1f5f9; color: #64748b; }
.hx-tag.sent { background: #e3f4e9; color: #15803d; }
.hx-view { flex: none; height: 32px; padding: 0 14px; border-radius: 999px; border: 1px solid #cfe3dc; background: #fff; color: #0f766e; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.hx-view:hover { background: #f0faf8; }
.hx-body { padding: 4px 0 14px; }
.hx-send { margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: #f0faf8; border: 1px solid #cdebe5; border-radius: 14px; padding: 12px 14px; }
.hx-send p { margin: 0; font-size: 13.5px; color: #234; flex: 1; min-width: 200px; }
.hx-send button { height: 40px; padding: 0 16px; border: 0; border-radius: 12px; background: #14532d; color: #fff; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
.hx-send button:disabled { opacity: .6; cursor: default; }
@media (max-width: 640px) { .hx { padding: 16px 14px; } .hx-legend .hx-axis { margin-left: 0; width: 100%; } }
`;
