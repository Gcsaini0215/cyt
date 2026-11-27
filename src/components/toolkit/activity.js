import React, { useEffect, useMemo, useRef, useState } from "react";

/* Activity Diary (behavioural activation) — our own design: 7 days × 2-hour blocks. For each block: what you did,
   one mood word + how strong (0–100%), and Achievement · Closeness · Enjoyment (0–10). Then a Patterns view that
   shows what lifts the person and what drains them. Phone-first: one day at a time, tap a block to fill it. */

export const SLOTS = [["6", "6–8 am"], ["8", "8–10 am"], ["10", "10 am–12"], ["12", "12–2 pm"], ["14", "2–4 pm"], ["16", "4–6 pm"], ["18", "6–8 pm"], ["20", "8–10 pm"], ["22", "10 pm–12"]];
const SLOT_LABEL = Object.fromEntries(SLOTS);
const MOODS = ["Happy", "Calm", "Content", "Hopeful", "Tired", "Bored", "Sad", "Low", "Anxious", "Irritable", "Lonely", "Stressed"];
const ACE = [["a", "Achievement", "#0ea5e9", "Did it feel like you got something done?"], ["c", "Closeness", "#ec4899", "Did you feel connected to someone?"], ["e", "Enjoyment", "#f59e0b", "Did you enjoy it?"]];
const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const dayName = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export const withActivity = (v) => {
  const days = Array.isArray(v?.days) ? v.days.slice(0, 7) : [];
  while (days.length < 7) days.push({});
  const start = v?.start || todayIST();
  // first = start of week 1; the server starts a new week by itself once 7 days are over ("rolled" = the week that ended)
  const out = { start, first: v?.first && v.first <= start ? v.first : start, days };
  if (v?.rolled) out.rolled = v.rolled;
  return out;
};
export const weekOf = (v) => Math.round((Date.parse(`${v.start}T00:00:00Z`) - Date.parse(`${v.first || v.start}T00:00:00Z`)) / (7 * 864e5)) + 1;
const ace = (c) => (c ? (c.a ?? 0) + (c.c ?? 0) + (c.e ?? 0) : 0);
const cellLine = (c) => [c.mood ? `${c.mood}${c.mp != null ? ` ${c.mp}%` : ""}` : "", c.a != null ? `A${c.a}` : "", c.c != null ? `C${c.c}` : "", c.e != null ? `E${c.e}` : ""].filter(Boolean).join(" · ");
const MOOD_EMOJI = { Happy: "😄", Calm: "😌", Content: "🙂", Hopeful: "🌈", Tired: "😴", Bored: "😐", Sad: "😢", Low: "😞", Anxious: "😰", Irritable: "😤", Lonely: "🥺", Stressed: "😣" };
const POSITIVE = ["Happy", "Calm", "Content", "Hopeful"];
// short, kind lines for the day card (our own wording) — one per date
const LINES = ["Small steps still count.", "Notice one good moment today.", "Rest is part of the plan too.", "You showed up — that matters.", "Be as kind to yourself as to a friend.", "One gentle thing at a time.", "Progress, not perfection."];
const hourIST = () => new Date(Date.now() + 5.5 * 3600e3).getUTCHours();
const filledCell = (c) => !!c && (!!c.did || !!c.mood || c.a != null || c.c != null || c.e != null);
// 0–100 for one day: A·C·E average (70%) + share of positive moods (30%); null when nothing is rated yet
const dayScore = (d) => {
  const cells = Object.values(d || {}).filter(filledCell);
  const rated = cells.map((c) => [c.a, c.c, c.e].filter((x) => x != null)).filter((x) => x.length).map((x) => x.reduce((n, y) => n + y, 0) / x.length);
  const moods = cells.filter((c) => c.mood);
  const parts = [];
  if (rated.length) parts.push([0.7, (rated.reduce((n, x) => n + x, 0) / rated.length) * 10]);
  if (moods.length) parts.push([0.3, (moods.filter((c) => POSITIVE.includes(c.mood)).length / moods.length) * 100]);
  const w = parts.reduce((n, p) => n + p[0], 0);
  return w ? Math.round(parts.reduce((n, p) => n + p[0] * p[1], 0) / w) : null;
};

function Ring({ value }) {
  const r = 24, L = 2 * Math.PI * r, p = value == null ? 0 : value / 100;
  return (
    <div className="ad-ring" title="Day score: how your rated blocks and moods went (0–100)">
      <svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
        <circle cx="31" cy="31" r={r} fill="none" stroke="#e7efe9" strokeWidth="7" />
        <circle cx="31" cy="31" r={r} fill="none" stroke="url(#adg)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${L * p} ${L}`} transform="rotate(-90 31 31)" />
        <defs><linearGradient id="adg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1e7a4c" /><stop offset="1" stopColor="#e0ab45" /></linearGradient></defs>
      </svg>
      <b>{value == null ? "–" : value}</b>
    </div>
  );
}

// 0–10 slider; "not rated" until it is touched
function Slide({ label, color, hint, value, onChange, disabled }) {
  const v = value ?? 0;
  return (
    <div className={`ad-sl${value == null ? " none" : ""}`} style={{ "--c": color, "--p": `${v * 10}%` }}>
      <div className="ad-sl-h"><b>{label}</b><em>{value == null ? "–" : value}<small>/10</small></em></div>
      <small className="ad-sl-hint">{hint}</small>
      <input type="range" min="0" max="10" step="1" value={v} disabled={disabled} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="ad-sl-ends"><span>0 · not at all</span>{value != null && !disabled && <button type="button" onClick={() => onChange(null)}>Clear</button>}<span>10 · a lot</span></div>
    </div>
  );
}

// every filled day the person has: older weeks come from the progress history (latest snapshot of each week),
// the current week from the form itself
const daysMap = (v, history) => {
  const byStart = {};
  for (const h of history || []) { const d = h?.data; if (d?.start && Array.isArray(d.days)) byStart[d.start] = d; }
  byStart[v.start] = v;
  const map = {};
  for (const w of Object.values(byStart)) {
    (w.days || []).forEach((day, i) => {
      const cells = Object.fromEntries(Object.entries(day || {}).filter(([, c]) => filledCell(c)));
      if (Object.keys(cells).length) map[addDays(w.start, i)] = { cells, start: w.start };
    });
  }
  return map;
};
const monthTitle = (ym) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
const shiftMonth = (ym, n) => { const [y, m] = ym.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return d.toISOString().slice(0, 7); };

// whole-month calendar: dots on filled days, the current week opens for editing, older days show read-only
function MonthView({ v, history, selected, onPickCurrent }) {
  const [ym, setYm] = useState(selected.slice(0, 7));
  const [picked, setPicked] = useState(null);
  const map = useMemo(() => daysMap(v, history), [v, history]);
  const today = todayIST();
  const [y, m] = ym.split("-").map(Number);
  const firstDow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday first
  const nDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const dates = Array.from({ length: nDays }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`);
  const curIndex = (d) => { const i = Math.round((Date.parse(`${d}T00:00:00Z`) - Date.parse(`${v.start}T00:00:00Z`)) / 864e5); return i >= 0 && i < 7 ? i : -1; };
  const filledHere = dates.filter((d) => map[d]).length;
  const pastHere = dates.filter((d) => d <= today).length;
  const p = picked && map[picked];
  const pWeek = p ? weekOf({ start: p.start, first: v.first }) : 0;
  return (
    <div className="ad-month">
      <div className="ad-month-h">
        <button type="button" onClick={() => { setYm(shiftMonth(ym, -1)); setPicked(null); }} aria-label="Previous month">‹</button>
        <b>{monthTitle(ym)}</b>
        <button type="button" disabled={ym >= today.slice(0, 7)} onClick={() => { setYm(shiftMonth(ym, 1)); setPicked(null); }} aria-label="Next month">›</button>
      </div>
      <div className="ad-month-g">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => <small key={w}>{w}</small>)}
        {Array.from({ length: firstDow }, (_, i) => <span key={`b${i}`} />)}
        {dates.map((d) => {
          const ci = curIndex(d);
          const has = !!map[d];
          const fut = d > today;
          const can = !fut && (ci >= 0 || has);
          return (
            <button key={d} type="button" disabled={!can}
              className={`${has ? "has" : ""}${ci >= 0 ? " cur" : ""}${d === today ? " today" : ""}${d === picked ? " sel" : ""}${fut ? " fut" : ""}`}
              onClick={() => (ci >= 0 ? onPickCurrent(ci) : setPicked(d))}
              aria-label={`${d}${has ? `, ${Object.keys(map[d].cells).length} blocks` : ""}`}>
              <b>{Number(d.slice(8))}</b><i />
            </button>
          );
        })}
      </div>
      <p className="ad-month-n">🟡 {filledHere} of {pastHere} days filled in {monthTitle(ym).split(" ")[0]} · <span className="ad-month-k">This week</span> opens to edit, older days are saved in your history.</p>
      {p && (
        <div className="ad-month-day">
          <div className="ad-month-dh"><b>{dayName(picked)}</b><small>Week {pWeek} · saved · read-only</small><button type="button" onClick={() => setPicked(null)} aria-label="Close">✕</button></div>
          <ul>
            {SLOTS.filter(([s]) => p.cells[s]).map(([s, label]) => {
              const c = p.cells[s];
              return (
                <li key={s}>
                  <span className="ad-time">{label}</span>
                  <span className="ad-emo" aria-hidden="true">{c.mood ? MOOD_EMOJI[c.mood] || "🙂" : "•"}</span>
                  <span className="ad-sum"><b>{c.did || c.mood || "—"}</b>
                    <span className="ad-tags">{c.mood && <small>{c.mood}{c.mp != null ? ` ${c.mp}%` : ""}</small>}{ACE.map(([k, , color]) => <i key={k} style={{ "--c": color }}>{k.toUpperCase()} {c[k] ?? "–"}</i>)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ActivityForm({ value, step, onChange, onStep, readOnly = false, finish, history = [] }) {
  const v = withActivity(value);
  const [day, setDay] = useState(() => {
    const i = Math.round((Date.parse(`${todayIST()}T00:00:00Z`) - Date.parse(`${v.start}T00:00:00Z`)) / 864e5);
    return Math.max(0, Math.min(6, i));
  });
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState("");
  const [hideRolled, setHideRolled] = useState(false);
  const [month, setMonth] = useState(false);
  const toastT = useRef(null);
  useEffect(() => () => clearTimeout(toastT.current), []);
  const setCell = (s, patch) => {
    const days = v.days.map((d, i) => (i === day ? { ...d, [s]: { ...(d[s] || {}), ...patch } } : d));
    onChange({ ...v, days });
  };
  const clearCell = (s) => { const days = v.days.map((d, i) => { if (i !== day) return d; const n = { ...d }; delete n[s]; return n; }); onChange({ ...v, days }); setOpen(null); };
  const saveBlock = (s) => {
    setOpen(null);
    if (!filledCell(v.days[day][s])) return;
    setToast("Block saved ✨");
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(""), 1800);
  };
  const filled = v.days.reduce((n, d) => n + Object.values(d).filter(filledCell).length, 0);
  const date = addDays(v.start, day);
  const isToday = date === todayIST();
  const h = hourIST();
  const nowSlot = isToday && h >= 6 ? SLOTS[Math.min(8, Math.floor((h - 6) / 2))][0] : null;
  const dayFilled = SLOTS.filter(([s]) => filledCell(v.days[day][s])).length;
  const daysUsed = v.days.filter((d) => Object.values(d).some(filledCell)).length;
  const greet = isToday ? (h < 12 ? "Good morning ☀️" : h < 17 ? "Good afternoon 🌤️" : "Good evening 🌙") : "Your day, remembered";
  const week = weekOf(v);
  const line = LINES[Math.floor(Date.parse(`${date}T00:00:00Z`) / 864e5) % LINES.length];

  return (
    <div className="ad">
      <style>{AD_CSS}</style>
      <div className="ad-tabs2">
        <button type="button" className={step === 0 ? "on" : ""} onClick={() => onStep(0)}>📝 Diary <i>{filled}</i></button>
        <button type="button" className={step === 1 ? "on" : ""} onClick={() => onStep(1)}>📊 Patterns</button>
      </div>

      {step === 0 ? (
        <section className="ad-card">
          {/* day card: greeting, a kind line, progress and the day score */}
          <div className="ad-hero">
            <div className="ad-hero-t">
              <small>{week > 1 ? `Week ${week} · ` : ""}Day {day + 1} · {dayName(date)}</small>
              <h3>{greet}</h3>
              <p>“{line}”</p>
              <div className="ad-pills"><span>✨ {dayFilled}/9 blocks</span><span>📅 {daysUsed}/7 days</span><button type="button" className={`ad-mbtn${month ? " on" : ""}`} onClick={() => { setMonth(!month); setOpen(null); }} aria-expanded={month}>🗓 {month ? "Close month" : "Month view"}</button></div>
            </div>
            <Ring value={dayScore(v.days[day])} />
          </div>

          {v.rolled && !hideRolled && (
            <div className="ad-new" role="status">
              <span>🎉 Week {v.rolled} is saved in your progress history. <b>Week {week} has started</b> — keep going!</span>
              <button type="button" onClick={() => setHideRolled(true)} aria-label="Close">✕</button>
            </div>
          )}
          {month ? <MonthView v={v} history={history} selected={date} onPickCurrent={(i) => { setDay(i); setMonth(false); setOpen(null); }} /> : (<>
          <div className="ad-days" role="tablist" aria-label="Day">
            {v.days.map((d, i) => {
              const dt = addDays(v.start, i);
              const n = Object.values(d).filter(filledCell).length;
              return (
                <button key={dt} type="button" role="tab" aria-selected={day === i} className={`${day === i ? "on" : ""}${dt === todayIST() ? " today" : ""}`} onClick={() => { setDay(i); setOpen(null); }}>
                  <small>Day {i + 1}</small><b>{dayName(dt).split(",")[0]}</b><em>{dayName(dt).split(" ").slice(1).join(" ")}</em>
                  <i className={`ad-dot2${n ? " on" : ""}`} aria-label={n ? `${n} blocks` : "empty"} />
                </button>
              );
            })}
          </div>
          {!readOnly && day === 0 && filled === 0 && week === 1 && (
            <label className="ad-start">Diary starts on <input type="date" value={v.start} onChange={(e) => e.target.value && onChange({ ...v, start: e.target.value })} /></label>
          )}
          <p className="ad-tip">Tap a time block and note what you were doing — even resting or scrolling counts.</p>
          <ul className="ad-slots">
            {SLOTS.map(([s, label]) => {
              const c = v.days[day][s];
              const has = filledCell(c);
              const isOpen = open === s;
              return (
                <li key={s} className={`${has ? "has" : ""}${isOpen ? " open" : ""}${s === nowSlot ? " now" : ""}`}>
                  <button type="button" className="ad-slot" onClick={() => setOpen(isOpen ? null : s)} aria-expanded={isOpen}>
                    <span className="ad-time">{label}{s === nowSlot && <em>now</em>}</span>
                    <span className="ad-emo" aria-hidden="true">{c?.mood ? MOOD_EMOJI[c.mood] || "🙂" : "＋"}</span>
                    <span className="ad-sum">
                      {has ? (
                        <>
                          <b>{c.did || c.mood || "—"}</b>
                          <span className="ad-tags">
                            {c.mood && <small>{c.mood}{c.mp != null ? ` ${c.mp}%` : ""}</small>}
                            {ACE.map(([k, , color]) => <i key={k} style={{ "--c": color }}>{k.toUpperCase()} {c[k] ?? "–"}</i>)}
                          </span>
                        </>
                      ) : <span className="ad-add">Tap to add this block</span>}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="ad-ed">
                      <input type="text" maxLength={200} disabled={readOnly} autoFocus value={c?.did || ""} onChange={(e) => setCell(s, { did: e.target.value })} placeholder="What were you doing? e.g. watching TV with my son" />
                      <div className="ad-sub">How did you feel? Pick one</div>
                      <div className="ad-moods">
                        {MOODS.map((m) => (
                          <button key={m} type="button" disabled={readOnly} className={c?.mood === m ? "on" : ""} onClick={() => setCell(s, { mood: c?.mood === m ? "" : m, mp: c?.mp ?? 50 })}>
                            <span aria-hidden="true">{MOOD_EMOJI[m]}</span>{m}
                          </button>
                        ))}
                      </div>
                      {c?.mood && (
                        <label className="ad-mp">How strong? <b>{c.mp ?? 50}%</b>
                          <input type="range" min="0" max="100" step="10" disabled={readOnly} value={c.mp ?? 50} onChange={(e) => setCell(s, { mp: Number(e.target.value) })} style={{ "--p": `${c.mp ?? 50}%` }} />
                        </label>
                      )}
                      {ACE.map(([k, label2, color, hint]) => <Slide key={k} label={label2} color={color} hint={hint} disabled={readOnly} value={c?.[k] ?? null} onChange={(x) => setCell(s, { [k]: x })} />)}
                      <div className="ad-ed-b">
                        {c && !readOnly ? <button type="button" className="ad-x" onClick={() => clearCell(s)}>Clear block</button> : <span />}
                        <button type="button" className="ad-done" onClick={() => (readOnly ? setOpen(null) : saveBlock(s))}>{readOnly ? "Close" : "Save this block"}</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="ad-nav">
            {day > 0 ? <button type="button" className="ad-btn line" onClick={() => { setDay(day - 1); setOpen(null); }}>← Day {day}</button> : <span />}
            {day < 6 ? <button type="button" className="ad-btn" onClick={() => { setDay(day + 1); setOpen(null); }}>Day {day + 2} →</button> : <button type="button" className="ad-btn" onClick={() => onStep(1)}>See patterns →</button>}
          </div>
          {day === 6 && !readOnly && <p className="ad-roll">🔁 A fresh week starts by itself on {dayName(addDays(v.start, 7))}. This week stays saved in your progress history.</p>}
          </>)}
          {toast && <div className="ad-toast" role="status">{toast}<span className="ad-burst" aria-hidden="true"><i>✨</i><i>🌟</i><i>✨</i><i>💚</i><i>✨</i></span></div>}
        </section>
      ) : (
        <section className="ad-card">
          <Patterns v={v} />
          {finish}
          <div className="ad-nav"><button type="button" className="ad-btn line" onClick={() => onStep(0)}>← Back to diary</button><span /></div>
        </section>
      )}
    </div>
  );
}

/* what lifts and what drains — from the filled blocks */
export function Patterns({ v: raw }) {
  const v = withActivity(raw);
  const cells = useMemo(() => v.days.flatMap((d, i) => Object.entries(d).map(([s, c]) => ({ ...c, day: i, s }))), [v]);
  if (!cells.length) return <p className="ad-empty">Fill a few time blocks and your patterns appear here — what lifts your mood and what drains it.</p>;
  const rated = cells.filter((c) => c.a != null || c.c != null || c.e != null);
  const top = [...rated].sort((x, y) => ace(y) - ace(x)).slice(0, 3);
  const low = [...rated].sort((x, y) => ace(x) - ace(y)).filter((c) => !top.includes(c)).slice(0, 3);
  const avg = (k) => { const r = cells.filter((c) => c[k] != null); return r.length ? Math.round((r.reduce((n, c) => n + c[k], 0) / r.length) * 10) / 10 : null; };
  const moods = {};
  for (const c of cells) if (c.mood) moods[c.mood] = (moods[c.mood] || 0) + 1;
  const moodList = Object.entries(moods).sort((a, b) => b[1] - a[1]);
  const perDay = v.days.map((d, i) => { const r = Object.values(d).filter((c) => c.a != null || c.c != null || c.e != null); return { i, n: r.length, s: r.length ? r.reduce((n, c) => n + ace(c), 0) / r.length : 0 }; });
  const maxS = Math.max(1, ...perDay.map((d) => d.s));
  const row = (c) => <li key={`${c.day}-${c.s}`}><b>{c.did || "—"}</b><small>Day {c.day + 1} · {SLOT_LABEL[c.s]} · {cellLine(c)}</small></li>;
  return (
    <div className="ad-pat">
      <div className="ad-avg">
        {ACE.map(([k, label, color]) => <div key={k} style={{ "--c": color }}><b>{avg(k) ?? "—"}</b><span>avg {label}</span></div>)}
        <div style={{ "--c": "#14532d" }}><b>{cells.length}</b><span>blocks filled</span></div>
      </div>
      <h4>Day by day <small>(average A + C + E)</small></h4>
      <div className="ad-bars">
        {perDay.map((d) => <div key={d.i} title={`Day ${d.i + 1}: ${d.n ? d.s.toFixed(1) : "no ratings"}`}><span style={{ height: `${Math.max(4, (d.s / maxS) * 100)}%`, opacity: d.n ? 1 : 0.25 }} /><small>D{d.i + 1}</small></div>)}
      </div>
      <div className="ad-two">
        <div className="ad-up"><h4>🌱 What lifted you</h4>{top.length ? <ul>{top.map(row)}</ul> : <p className="ad-empty">Rate A · C · E to see this</p>}</div>
        <div className="ad-dn"><h4>🌧 What drained you</h4>{low.length ? <ul>{low.map(row)}</ul> : <p className="ad-empty">—</p>}</div>
      </div>
      {moodList.length > 0 && (
        <>
          <h4>Moods you noted</h4>
          <div className="ad-mtags">{moodList.map(([m, n]) => <i key={m}>{m} <b>×{n}</b></i>)}</div>
        </>
      )}
      <p className="ad-next">💡 <b>Next step:</b> plan one more of the activities that lifted you into the coming week — small and doable is enough. Your therapist can help you build a plan.</p>
    </div>
  );
}

/* the therapist's view: the whole week as a grid + patterns */
export function ActivityView({ data }) {
  const v = withActivity(data);
  return (
    <div className="ad">
      <style>{AD_CSS}</style>
      <div className="ad-grid-w">
        <table className="ad-grid">
          <thead><tr><th>Time</th>{v.days.map((_, i) => <th key={i}>{dayName(addDays(v.start, i))}</th>)}</tr></thead>
          <tbody>
            {SLOTS.map(([s, label]) => (
              <tr key={s}><th>{label}</th>{v.days.map((d, i) => { const c = d[s]; return <td key={i} className={c ? "has" : ""}>{c ? <><b>{c.did}</b><small>{cellLine(c)}</small></> : ""}</td>; })}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <Patterns v={v} />
    </div>
  );
}

export const AD_CSS = `
.ad { color: #0f1f17; }
.ad-tabs2 { display: inline-flex; gap: 4px; background: #fff; border: 1px solid #e3e9e5; border-radius: 14px; padding: 4px; margin-bottom: 12px; }
.ad-tabs2 button { height: 38px; padding: 0 16px; border-radius: 10px; border: 0; background: none; font: inherit; font-size: 14px; font-weight: 800; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.ad-tabs2 button.on { background: #14532d; color: #fff; }
.ad-tabs2 i { font-style: normal; font-size: 11px; background: rgba(0,0,0,.08); border-radius: 999px; padding: 1px 7px; }
.ad-tabs2 button.on i { background: rgba(255,255,255,.22); }
.ad-card { background: #fff; border: 1px solid #e3e9e5; border-top: 4px solid #1e7a4c; border-radius: 18px; padding: 16px; box-shadow: 0 10px 30px -22px rgba(15,31,23,.45); }
.ad-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.ad-days button { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0; padding: 8px 2px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; cursor: pointer; min-width: 0; }
.ad-days small { font-size: 10px; color: #94a3b8; font-weight: 700; }
.ad-days b { font-size: 14px; }
.ad-days em { font-style: normal; font-size: 11px; color: #64748b; white-space: nowrap; }
.ad-days button.today { border-color: #e0ab45; }
.ad-days button.on { background: #14532d; border-color: #14532d; color: #fff; }
.ad-days button.on small, .ad-days button.on em { color: #d6ecdf; }
.ad-dot { position: absolute; top: -6px; right: -4px; min-width: 18px; height: 18px; border-radius: 999px; background: #16a34a; color: #fff; font-style: normal; font-size: 10.5px; font-weight: 800; display: grid; place-items: center; padding: 0 4px; border: 2px solid #fff; }
.ad-start { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; font-weight: 700; color: #475569; }
.ad-start input { border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 6px 8px; font: inherit; }
.ad-tip { margin: 12px 0 8px; font-size: 13.5px; color: #64748b; }
.ad-slots { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ad-slots li { border: 1px solid #e8eee9; border-radius: 14px; background: #fbfdfc; overflow: hidden; }
.ad-slots li.has { background: #fff; border-color: #d6e9dd; }
.ad-slots li.open { border-color: #1e7a4c; box-shadow: 0 0 0 3px #dcefe3; }
.ad-slot { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; }
.ad-time { flex: none; width: 76px; font-size: 12.5px; font-weight: 800; color: #1e7a4c; }
.ad-sum { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ad-sum b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ad-sum small { font-size: 12px; color: #64748b; }
.ad-add { font-size: 13.5px; font-weight: 700; color: #94a3b8; }
.ad-score { flex: none; min-width: 34px; height: 28px; border-radius: 9px; background: #ecfdf5; color: #15803d; font-weight: 900; font-size: 13px; display: grid; place-items: center; }
.ad-ed { padding: 4px 12px 12px; }
.ad-ed input[type="text"] { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; outline: none; }
.ad-ed input[type="text"]:focus { border-color: #1e7a4c; }
.ad-sub { margin: 12px 0 6px; font-size: 13px; font-weight: 800; }
.ad-mp { display: block; margin-top: 10px; font-size: 13px; font-weight: 700; color: #334155; }
.ad-mp input { display: block; width: 100%; margin-top: 6px; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; background: linear-gradient(90deg, #14532d var(--p), #e5ebe7 var(--p)); }
.ad-mp input::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid #14532d; }
.ad-ed-b { display: flex; justify-content: space-between; margin-top: 12px; }
.ad-x { border: 0; background: none; color: #b91c1c; font: inherit; font-weight: 700; cursor: pointer; }
.ad-done { height: 42px; padding: 0 20px; border-radius: 12px; border: 0; background: #14532d; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
.ad-nav { display: flex; justify-content: space-between; gap: 10px; margin-top: 16px; }
.ad-btn { height: 46px; padding: 0 20px; border-radius: 12px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.ad-btn.line { background: #fff; color: #334155; border: 1.5px solid #dfe7e2; }
.ad-pat h4 { margin: 16px 0 8px; font-size: 14px; font-weight: 800; }
.ad-pat h4 small { font-weight: 600; color: #94a3b8; }
.ad-avg { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.ad-avg div { padding: 10px; border-radius: 12px; background: color-mix(in srgb, var(--c) 10%, #fff); display: flex; flex-direction: column; }
.ad-avg b { font-size: 22px; color: var(--c); }
.ad-avg span { font-size: 11.5px; font-weight: 700; color: #475569; }
.ad-bars { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; height: 110px; align-items: end; }
.ad-bars div { display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
.ad-bars span { width: 100%; max-width: 38px; border-radius: 8px 8px 3px 3px; background: linear-gradient(180deg, #34d399, #059669); }
.ad-bars small { font-size: 11px; color: #64748b; font-weight: 700; }
.ad-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ad-up, .ad-dn { border-radius: 14px; padding: 2px 12px 10px; }
.ad-up { background: #ecfdf5; } .ad-dn { background: #f1f5f9; }
.ad-two ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ad-two li { display: flex; flex-direction: column; background: #fff; border-radius: 10px; padding: 8px 10px; }
.ad-two li b { font-size: 14px; }
.ad-two li small { font-size: 12px; color: #64748b; }
.ad-mtags { display: flex; flex-wrap: wrap; gap: 6px; }
.ad-mtags i { font-style: normal; font-size: 13px; background: #f1f5f3; border-radius: 999px; padding: 4px 10px; }
.ad-next { margin: 16px 0 0; padding: 12px 14px; border-radius: 12px; background: #fffaf0; border: 1px solid #f3e2bb; font-size: 14px; color: #5b4310; }
.ad-empty { color: #94a3b8; font-size: 14px; margin: 6px 0; }
.ad-grid-w { overflow-x: auto; border: 1px solid #e3e9e5; border-radius: 14px; margin-bottom: 6px; }
.ad-grid { border-collapse: collapse; width: 100%; min-width: 860px; font-size: 12px; }
.ad-grid th { background: #f1f7f3; font-size: 11.5px; padding: 6px; text-align: left; white-space: nowrap; border-bottom: 1px solid #e3e9e5; }
.ad-grid tbody th { color: #1e7a4c; }
.ad-grid td { vertical-align: top; padding: 6px; border-bottom: 1px solid #f1f5f3; border-left: 1px solid #f1f5f3; width: 13%; }
.ad-grid td.has { background: #fbfefc; }
.ad-grid td b { display: block; font-size: 12px; }
.ad-grid td small { font-size: 11px; color: #64748b; }
/* day card (same sizes as the other toolkit cards) */
.ad-pills .ad-mbtn { font: inherit; font-size: 12px; font-weight: 800; color: #8a5a00; background: #fff7e2; border: 1px solid #f0d9a4; border-radius: 999px; padding: 3px 10px; cursor: pointer; }
.ad-pills .ad-mbtn.on { background: #14532d; border-color: #14532d; color: #fff; }
.ad-month { border: 1px solid #e3ede6; border-radius: 16px; padding: 12px; background: #fff; }
.ad-month-h { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.ad-month-h b { font-size: 15px; font-weight: 800; color: #0f2a1d; }
.ad .ad-month-h button { width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; font-size: 18px; font-weight: 800; color: #14532d; cursor: pointer; padding: 0; }
.ad .ad-month-h button:disabled { opacity: .35; cursor: default; }
.ad-month-g { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.ad-month-g > small { text-align: center; font-size: 11px; font-weight: 800; color: #94a3b8; padding-bottom: 2px; }
.ad .ad-month-g button { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; height: 44px; border-radius: 11px; border: 1.5px solid #eef3f0; background: #fbfdfc; font: inherit; color: #334155; cursor: pointer; padding: 0; }
.ad-month-g button b { font-size: 13.5px; font-weight: 800; }
.ad-month-g button i { width: 6px; height: 6px; border-radius: 50%; background: transparent; }
.ad-month-g button.has i { background: #e0ab45; }
.ad .ad-month-g button.cur { background: #eef8f1; border-color: #cfe6d7; }
.ad-month-g button.today b { color: #b07a14; }
.ad .ad-month-g button.sel { background: #14532d; border-color: #14532d; color: #fff; }
.ad .ad-month-g button.sel.has i { background: #ffd977; }
.ad .ad-month-g button:disabled { opacity: .4; cursor: default; background: #fff; }
.ad-month-n { margin: 10px 0 0; font-size: 12.5px; color: #64748b; }
.ad-month-k { background: #eef8f1; border: 1px solid #cfe6d7; border-radius: 6px; padding: 0 6px; color: #14532d; font-weight: 700; }
.ad-month-day { margin-top: 12px; border-top: 1px solid #eef3f0; padding-top: 10px; }
.ad-month-dh { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.ad-month-dh b { font-size: 14.5px; }
.ad-month-dh small { flex: 1; font-size: 12px; color: #94a3b8; font-weight: 700; }
.ad .ad-month-dh button { border: 0; background: none; font-size: 14px; color: #64748b; cursor: pointer; }
.ad-month-day ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ad-month-day li { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border: 1px solid #e8eee9; border-radius: 12px; background: #fbfdfc; }

.ad-new { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 12px; padding: 10px 12px; border-radius: 12px; background: #fdf6e7; border: 1px solid #f3e2bb; font-size: 13.5px; color: #5b4310; }
.ad-new span { flex: 1; }
.ad-new button { border: 0; background: none; padding: 0 2px; font-size: 14px; color: #8a6d2b; cursor: pointer; }
.ad-roll { margin: 12px 0 0; font-size: 12.5px; color: #64748b; text-align: center; }

.ad-hero { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; margin-bottom: 12px; border-radius: 16px; background: linear-gradient(135deg, #eef8f1, #fdf6e7); border: 1px solid #e3ede6; }
.ad-hero-t { min-width: 0; }
.ad-hero-t small { font-size: 12px; font-weight: 700; color: #64748b; }
.ad-hero-t h3 { margin: 2px 0 2px; font-size: 18px; font-weight: 800; color: #0f2a1d; }
.ad-hero-t p { margin: 0 0 8px; font-size: 13.5px; color: #475569; }
.ad-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.ad-pills span { font-size: 12px; font-weight: 700; color: #14532d; background: #fff; border: 1px solid #dcebe1; border-radius: 999px; padding: 3px 10px; }
.ad-ring { position: relative; flex: none; width: 62px; height: 62px; }
.ad-ring svg { display: block; }
.ad-ring b { position: absolute; inset: 0; display: grid; place-items: center; font-size: 17px; font-weight: 900; color: #14532d; }
.ad-dot2 { width: 6px; height: 6px; border-radius: 50%; margin-top: 3px; background: transparent; }
.ad-dot2.on { background: #e0ab45; box-shadow: 0 0 0 2px #fff7e2; }
.ad-days button.on .ad-dot2.on { background: #ffd977; box-shadow: none; }
.ad-slots li.now { border-color: #e0ab45; box-shadow: 0 0 0 3px #fbefd2; }
.ad-time em { display: block; font-style: normal; font-size: 10.5px; font-weight: 800; color: #b07a14; text-transform: uppercase; letter-spacing: .04em; }
.ad-emo { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 19px; background: #f1f7f3; color: #94a3b8; }
.ad-slots li.has .ad-emo { background: #eaf5ee; }
.ad-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 2px; }
.ad-tags small { font-size: 12px; color: #64748b; margin-right: 2px; }
.ad-tags i { font-style: normal; font-size: 11px; font-weight: 800; color: var(--c); background: color-mix(in srgb, var(--c) 12%, #fff); border-radius: 7px; padding: 1px 7px; }
.ad-moods { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
.ad .ad-moods button { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 2px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; font-size: 12px; font-weight: 700; color: #334155; cursor: pointer; }
.ad-moods button span { font-size: 22px; line-height: 1.1; }
.ad .ad-moods button.on { border-color: #14532d; background: #eaf5ee; color: #14532d; box-shadow: 0 0 0 2px #cfe6d7; }
.ad-sl { margin-top: 14px; }
.ad-sl-h { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ad-sl-h b { font-size: 13.5px; color: var(--c); }
.ad-sl-h em { font-style: normal; font-size: 17px; font-weight: 900; color: var(--c); }
.ad-sl-h em small { font-size: 11px; color: #94a3b8; font-weight: 700; }
.ad-sl-hint { display: block; font-size: 12px; color: #64748b; }
.ad-sl input[type="range"] { display: block !important; width: 100%; margin: 10px 0 4px; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; padding: 0; border: 0; background: linear-gradient(90deg, var(--c) var(--p), #e5ebe7 var(--p)); }
.ad-sl.none input[type="range"] { background: #e5ebe7; }
.ad-sl input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 3px solid var(--c); box-shadow: 0 2px 6px rgba(15,31,23,.18); cursor: pointer; }
.ad-sl input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 3px solid var(--c); }
.ad-sl.none input[type="range"]::-webkit-slider-thumb { border-color: #cbd5e1; }
.ad-sl-ends { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; }
.ad-sl-ends button { border: 0; background: none; padding: 0; font: inherit; font-size: 11.5px; font-weight: 700; color: #64748b; text-decoration: underline; cursor: pointer; }
.ad-card { position: relative; }
.ad-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 60; background: #14532d; color: #fff; font-size: 14px; font-weight: 800; padding: 10px 18px; border-radius: 999px; box-shadow: 0 14px 30px -10px rgba(20,83,45,.6); animation: adIn .25s ease-out; }
.ad-burst { position: absolute; left: 50%; top: 0; pointer-events: none; }
.ad-burst i { position: absolute; font-style: normal; font-size: 16px; animation: adFly 1.1s ease-out forwards; }
.ad-burst i:nth-child(1) { --dx: -70px; } .ad-burst i:nth-child(2) { --dx: -30px; animation-delay: .05s; } .ad-burst i:nth-child(3) { --dx: 10px; animation-delay: .1s; } .ad-burst i:nth-child(4) { --dx: 45px; animation-delay: .05s; } .ad-burst i:nth-child(5) { --dx: 80px; animation-delay: .12s; }
@keyframes adIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes adFly { from { opacity: 1; transform: translate(0, 0); } to { opacity: 0; transform: translate(var(--dx), -90px) rotate(30deg); } }
@media (prefers-reduced-motion: reduce) { .ad-toast, .ad-burst i { animation: none; } .ad-burst { display: none; } }
@media (max-width: 640px) {
  .ad-card { padding: 12px; }
  .ad-moods { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ad-hero { padding: 12px; }
  .ad-hero-t h3 { font-size: 16.5px; }
  .ad-emo { width: 32px; height: 32px; font-size: 17px; }
  .ad-days { gap: 4px; } .ad-days em { display: none; } .ad-days b { font-size: 13px; }
  .ad-time { width: 62px; font-size: 11.5px; }
  .ad-avg { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ad-two { grid-template-columns: minmax(0, 1fr); }
}
`;
