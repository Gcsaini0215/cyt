import React, { useMemo, useState } from "react";

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
  return { start: v?.start || todayIST(), days };
};
const ace = (c) => (c ? (c.a ?? 0) + (c.c ?? 0) + (c.e ?? 0) : 0);
const cellLine = (c) => [c.mood ? `${c.mood}${c.mp != null ? ` ${c.mp}%` : ""}` : "", c.a != null ? `A${c.a}` : "", c.c != null ? `C${c.c}` : "", c.e != null ? `E${c.e}` : ""].filter(Boolean).join(" · ");

function Ten({ label, color, hint, value, onChange, disabled }) {
  return (
    <div className="ad-ten" style={{ "--c": color }}>
      <div className="ad-ten-h"><b>{label}</b><small>{hint}</small></div>
      <div className="ad-ten-r" role="radiogroup" aria-label={label}>
        {Array.from({ length: 11 }, (_, i) => (
          <button key={i} type="button" disabled={disabled} role="radio" aria-checked={value === i} className={value === i ? "on" : value != null && i < value ? "fill" : ""} onClick={() => onChange(value === i ? null : i)}>{i}</button>
        ))}
      </div>
    </div>
  );
}

export function ActivityForm({ value, step, onChange, onStep, readOnly = false, finish }) {
  const v = withActivity(value);
  const [day, setDay] = useState(() => {
    const i = Math.round((Date.parse(`${todayIST()}T00:00:00Z`) - Date.parse(`${v.start}T00:00:00Z`)) / 864e5);
    return Math.max(0, Math.min(6, i));
  });
  const [open, setOpen] = useState(null);
  const setCell = (s, patch) => {
    const days = v.days.map((d, i) => (i === day ? { ...d, [s]: { ...(d[s] || {}), ...patch } } : d));
    onChange({ ...v, days });
  };
  const clearCell = (s) => { const days = v.days.map((d, i) => { if (i !== day) return d; const n = { ...d }; delete n[s]; return n; }); onChange({ ...v, days }); setOpen(null); };
  const filled = v.days.reduce((n, d) => n + Object.keys(d).length, 0);

  return (
    <div className="ad">
      <style>{AD_CSS}</style>
      <div className="ad-tabs2">
        <button type="button" className={step === 0 ? "on" : ""} onClick={() => onStep(0)}>📝 Diary <i>{filled}</i></button>
        <button type="button" className={step === 1 ? "on" : ""} onClick={() => onStep(1)}>📊 Patterns</button>
      </div>

      {step === 0 ? (
        <section className="ad-card">
          <div className="ad-days" role="tablist" aria-label="Day">
            {v.days.map((d, i) => {
              const date = addDays(v.start, i);
              const n = Object.keys(d).length;
              return (
                <button key={date} type="button" role="tab" aria-selected={day === i} className={`${day === i ? "on" : ""}${date === todayIST() ? " today" : ""}`} onClick={() => { setDay(i); setOpen(null); }}>
                  <small>Day {i + 1}</small><b>{dayName(date).split(",")[0]}</b><em>{dayName(date).split(" ").slice(1).join(" ")}</em>
                  {n > 0 && <i className="ad-dot">{n}</i>}
                </button>
              );
            })}
          </div>
          {!readOnly && day === 0 && filled === 0 && (
            <label className="ad-start">Diary starts on <input type="date" value={v.start} onChange={(e) => e.target.value && onChange({ ...v, start: e.target.value })} /></label>
          )}
          <p className="ad-tip">Tap a time block and note what you were doing — even resting or scrolling counts.</p>
          <ul className="ad-slots">
            {SLOTS.map(([s, label]) => {
              const c = v.days[day][s];
              const isOpen = open === s;
              return (
                <li key={s} className={`${c ? "has" : ""}${isOpen ? " open" : ""}`}>
                  <button type="button" className="ad-slot" onClick={() => setOpen(isOpen ? null : s)} aria-expanded={isOpen}>
                    <span className="ad-time">{label}</span>
                    <span className="ad-sum">{c ? <><b>{c.did || "—"}</b><small>{cellLine(c)}</small></> : <span className="ad-add">+ Add</span>}</span>
                    {c && <span className="ad-score" title="A + C + E">{ace(c)}</span>}
                  </button>
                  {isOpen && (
                    <div className="ad-ed">
                      <input type="text" maxLength={200} disabled={readOnly} autoFocus value={c?.did || ""} onChange={(e) => setCell(s, { did: e.target.value })} placeholder="What were you doing? e.g. watching TV with my son" />
                      <div className="ad-sub">Mood — one word</div>
                      <div className="ad-moods">
                        {MOODS.map((m) => <button key={m} type="button" disabled={readOnly} className={c?.mood === m ? "on" : ""} onClick={() => setCell(s, { mood: c?.mood === m ? "" : m, mp: c?.mp ?? 50 })}>{m}</button>)}
                      </div>
                      {c?.mood && (
                        <label className="ad-mp">How strong? <b>{c.mp ?? 50}%</b>
                          <input type="range" min="0" max="100" step="10" disabled={readOnly} value={c.mp ?? 50} onChange={(e) => setCell(s, { mp: Number(e.target.value) })} style={{ "--p": `${c.mp ?? 50}%` }} />
                        </label>
                      )}
                      {ACE.map(([k, label2, color, hint]) => <Ten key={k} label={label2} color={color} hint={hint} disabled={readOnly} value={c?.[k] ?? null} onChange={(x) => setCell(s, { [k]: x })} />)}
                      <div className="ad-ed-b">
                        {c && !readOnly ? <button type="button" className="ad-x" onClick={() => clearCell(s)}>Clear</button> : <span />}
                        <button type="button" className="ad-done" onClick={() => setOpen(null)}>Done</button>
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
.ad-card { background: #fff; border: 1px solid #e3e9e5; border-top: 4px solid #0ea5e9; border-radius: 18px; padding: 16px; box-shadow: 0 10px 30px -22px rgba(15,31,23,.45); }
.ad-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.ad-days button { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0; padding: 8px 2px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; cursor: pointer; min-width: 0; }
.ad-days small { font-size: 10px; color: #94a3b8; font-weight: 700; }
.ad-days b { font-size: 14px; }
.ad-days em { font-style: normal; font-size: 11px; color: #64748b; white-space: nowrap; }
.ad-days button.today { border-color: #7dd3fc; }
.ad-days button.on { background: #0ea5e9; border-color: #0ea5e9; color: #fff; }
.ad-days button.on small, .ad-days button.on em { color: #e0f2fe; }
.ad-dot { position: absolute; top: -6px; right: -4px; min-width: 18px; height: 18px; border-radius: 999px; background: #16a34a; color: #fff; font-style: normal; font-size: 10.5px; font-weight: 800; display: grid; place-items: center; padding: 0 4px; border: 2px solid #fff; }
.ad-start { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; font-weight: 700; color: #475569; }
.ad-start input { border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 6px 8px; font: inherit; }
.ad-tip { margin: 12px 0 8px; font-size: 13.5px; color: #64748b; }
.ad-slots { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ad-slots li { border: 1px solid #e8eee9; border-radius: 14px; background: #fbfdfc; overflow: hidden; }
.ad-slots li.has { background: #fff; border-color: #d6e9dd; }
.ad-slots li.open { border-color: #0ea5e9; box-shadow: 0 0 0 3px #e0f2fe; }
.ad-slot { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; }
.ad-time { flex: none; width: 76px; font-size: 12.5px; font-weight: 800; color: #0369a1; }
.ad-sum { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ad-sum b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ad-sum small { font-size: 12px; color: #64748b; }
.ad-add { font-size: 13.5px; font-weight: 700; color: #94a3b8; }
.ad-score { flex: none; min-width: 34px; height: 28px; border-radius: 9px; background: #ecfdf5; color: #15803d; font-weight: 900; font-size: 13px; display: grid; place-items: center; }
.ad-ed { padding: 4px 12px 12px; }
.ad-ed input[type="text"] { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; outline: none; }
.ad-ed input[type="text"]:focus { border-color: #0ea5e9; }
.ad-sub { margin: 12px 0 6px; font-size: 13px; font-weight: 800; }
.ad-moods { display: flex; flex-wrap: wrap; gap: 6px; }
.ad-moods button { padding: 6px 12px; border-radius: 999px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; }
.ad-moods button.on { border-color: #14532d; background: #14532d; color: #fff; }
.ad-mp { display: block; margin-top: 10px; font-size: 13px; font-weight: 700; color: #334155; }
.ad-mp input { display: block; width: 100%; margin-top: 6px; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; background: linear-gradient(90deg, #14532d var(--p), #e5ebe7 var(--p)); }
.ad-mp input::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid #14532d; }
.ad-ten { margin-top: 12px; }
.ad-ten-h { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.ad-ten-h b { font-size: 13.5px; color: var(--c); }
.ad-ten-h small { font-size: 12px; color: #64748b; }
.ad-ten-r { display: grid; grid-template-columns: repeat(11, minmax(0, 1fr)); gap: 3px; margin-top: 6px; }
.ad-ten-r button { height: 34px; border-radius: 8px; border: 1px solid #e3e9e5; background: #fff; font: inherit; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; padding: 0; }
.ad-ten-r button.fill { background: color-mix(in srgb, var(--c) 18%, #fff); border-color: transparent; }
.ad-ten-r button.on { background: var(--c); border-color: var(--c); color: #fff; }
.ad-ed-b { display: flex; justify-content: space-between; margin-top: 12px; }
.ad-x { border: 0; background: none; color: #b91c1c; font: inherit; font-weight: 700; cursor: pointer; }
.ad-done { height: 38px; padding: 0 18px; border-radius: 10px; border: 0; background: #0ea5e9; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
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
.ad-grid tbody th { color: #0369a1; }
.ad-grid td { vertical-align: top; padding: 6px; border-bottom: 1px solid #f1f5f3; border-left: 1px solid #f1f5f3; width: 13%; }
.ad-grid td.has { background: #fbfefc; }
.ad-grid td b { display: block; font-size: 12px; }
.ad-grid td small { font-size: 11px; color: #64748b; }
@media (max-width: 640px) {
  .ad-card { padding: 12px; }
  .ad-days { gap: 4px; } .ad-days em { display: none; } .ad-days b { font-size: 13px; }
  .ad-time { width: 62px; font-size: 11.5px; }
  .ad-ten-r button { height: 32px; font-size: 12px; }
  .ad-avg { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ad-two { grid-template-columns: minmax(0, 1fr); }
}
`;
