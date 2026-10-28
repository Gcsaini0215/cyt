import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { fetchById, postData, putData } from "../../../utils/actions";
import { apiUrl, imagePath } from "../../../utils/url";

/* Dashboard "Grow your practice": monthly earnings goal, Top-therapist badge progress, past clients
   to follow up with (WhatsApp / email in one tap) and when clients book across CYT vs the therapist's
   own hours. Data: GET /therapist-growth/me. */

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const firstName = (n) => String(n || "").trim().split(/\s+/)[0] || "there";
const fmtDay = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

function GoalCard({ goal, earned, sessions, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal ? String(goal) : "");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setVal(goal ? String(goal) : ""); }, [goal]);
  const pct = goal ? Math.min(100, Math.round((earned / goal) * 100)) : 0;
  const perSession = sessions > 0 ? earned / sessions : 0;
  const left = Math.max(0, goal - earned);
  const toGo = perSession > 0 ? Math.ceil(left / perSession) : null;
  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const r = 40, c = 2 * Math.PI * r;
  const save = async () => {
    setBusy(true);
    try { await onSave(Math.round(Number(val) || 0)); setEditing(false); } finally { setBusy(false); }
  };
  return (
    <div className="gp-card gp-goal">
      <div className="gp-h"><b>Monthly earnings goal</b>{goal > 0 && !editing && <button type="button" onClick={() => setEditing(true)}>Edit</button>}</div>
      {!goal || editing ? (
        <div className="gp-goal-set">
          <p>Set a target for this month — we&apos;ll show how close you are and how many sessions to go.</p>
          <div className="gp-goal-in">
            <span>₹</span>
            <input type="number" inputMode="numeric" min="0" step="1000" placeholder="50000" value={val} onChange={(e) => setVal(e.target.value)} />
            <button type="button" disabled={busy || !(Number(val) > 0)} onClick={save}>{busy ? "Saving…" : "Set goal"}</button>
          </div>
          <div className="gp-goal-quick">{[25000, 50000, 100000].map((n) => <button key={n} type="button" onClick={() => setVal(String(n))}>{inr(n)}</button>)}</div>
        </div>
      ) : (
        <div className="gp-goal-body">
          <svg className="gp-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#f1ead6" strokeWidth="10" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={pct >= 100 ? "#1e7a4c" : "#d4a24c"} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 50 50)" />
            <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill="#13261c">{pct}%</text>
          </svg>
          <div className="gp-goal-txt">
            <b>{inr(earned)} <span>of {inr(goal)}</span></b>
            {pct >= 100
              ? <em className="ok">Goal reached — well done! 🎉</em>
              : <em>{toGo != null ? <>About <strong>{toGo} more session{toGo === 1 ? "" : "s"}</strong> to go</> : <>{inr(left)} to go</>} · {daysLeft} day{daysLeft === 1 ? "" : "s"} left</em>}
            <small>Your share, this month</small>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeCard({ badge, top }) {
  const done = badge?.checks?.filter((c) => c.ok).length || 0;
  const total = badge?.checks?.length || 4;
  return (
    <div className={`gp-card gp-badge${top ? " on" : ""}`}>
      <div className="gp-h"><b>Top therapist badge</b><span>{done}/{total}</span></div>
      <div className="gp-badge-top">
        <span className="gp-medal" aria-hidden="true">★</span>
        <p>{top ? "You're a CYT Top therapist — the gold badge shows on your profile and in search." : "Earn a gold badge on your profile and in search. Clients trust it."}</p>
      </div>
      <ul className="gp-checks">
        {(badge?.checks || []).map((c) => (
          <li key={c.key} className={c.ok ? "ok" : ""}>
            <i aria-hidden="true">{c.ok ? "✓" : ""}</i>
            <span>{c.label}</span>
            {c.value && <em>{c.value}</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ready-to-send messages; {name} = client's first name. The therapist can still edit before sending.
const TEMPLATES = [
  { key: "checkin", label: "Check-in", text: "Hi {name}, it's been a few weeks since our last session — I hope you're doing well. If you'd like to check in or continue where we left off, I'd be glad to see you again. Take care!" },
  { key: "slots", label: "Slots open", text: "Hi {name}, I have a few slots open this week and thought of you. If you'd like to book a session, you can pick a time that suits you from my profile. Looking forward to it!" },
  { key: "progress", label: "Keep progress going", text: "Hi {name}, you've put in real work in our sessions. Regular sessions help keep that progress going — would you like to schedule your next one? I'm here whenever you're ready." },
  { key: "thanks", label: "Thank you", text: "Hi {name}, thank you for trusting me with our sessions. I hope the things we worked on are helping. If anything comes up or you'd like to talk again, I'm just a message away." },
  { key: "tip", label: "Self-care tip", text: "Hi {name}, a small reminder from me: take five slow breaths, drink some water, and do one kind thing for yourself today. If you'd like to talk things through, you can book a session any time." },
  { key: "festival", label: "Festival wishes", text: "Hi {name}, wishing you and your family a peaceful and happy festive season. Remember to take a little time for yourself too. If you'd ever like to talk, I'm here." },
];
const fill = (text, name) => text.replace(/\{name\}/g, firstName(name));

function FollowupCard({ list, therapistName, onChanged }) {
  const due = list.filter((f) => f.due);
  const [tab, setTab] = useState(due.length ? "due" : "all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [tpl, setTpl] = useState("checkin");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [more, setMore] = useState(false);
  const base = tab === "due" ? due : list;
  const filtered = q.trim() ? base.filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase())) : base;
  const shown = more || q.trim() ? filtered : filtered.slice(0, 5);
  const statusOf = (f) => {
    if (f.upcoming > 0) return <span className="gp-st up">Booked {f.nextAt ? fmtDay(f.nextAt) : ""}</span>;
    if (f.due) return <span className="gp-st due">Due · {f.daysSince} days</span>;
    if (f.lastSessionAt) return <span className="gp-st">Last session {fmtDay(f.lastSessionAt)}</span>;
    return <span className="gp-st">No session yet</span>;
  };
  const wa = (f, text) => {
    const phone = f.phone.length === 10 ? `91${f.phone}` : f.phone;
    postData(`${apiUrl}/therapist-growth/followups/${f.clientId}/nudged`, { channel: "whatsapp" }).catch(() => {});
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`${text}\n— ${therapistName}`)}`, "_blank", "noopener");
  };
  const openMail = (f) => {
    if (open === f.clientId) { setOpen(null); return; }
    setOpen(f.clientId);
    setTpl("checkin");
    setMsg(fill(TEMPLATES[0].text, f.name));
  };
  const send = async (f) => {
    setBusy(true);
    try {
      const r = await postData(`${apiUrl}/therapist-growth/followups/${f.clientId}/email`, { message: msg });
      if (r?.status) { toast.success(r.message || "Email sent"); setOpen(null); onChanged(); } else toast.error(r?.message || "Couldn't send");
    } catch (e) { toast.error(e?.response?.data?.message || "Couldn't send"); }
    setBusy(false);
  };
  return (
    <div className="gp-card gp-fu">
      <div className="gp-h"><b>Your clients</b><span>{list.length}</span></div>
      <p className="gp-sub">Stay in touch — a friendly note often brings clients back. &quot;Due&quot; = no session for 2+ weeks and nothing booked.</p>
      <div className="gp-fu-bar">
        <div className="gp-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "due"} className={tab === "due" ? "on" : ""} onClick={() => { setTab("due"); setMore(false); }}>Due for follow-up <i>{due.length}</i></button>
          <button type="button" role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : ""} onClick={() => { setTab("all"); setMore(false); }}>All clients <i>{list.length}</i></button>
        </div>
        {list.length > 5 && <input className="gp-search" type="search" placeholder="Search a client…" value={q} onChange={(e) => setQ(e.target.value)} />}
      </div>
      {shown.length === 0 ? (
        <p className="gp-empty">{tab === "due" ? "You're all caught up — no client is due for a follow-up." : q ? "No client by that name." : "No clients yet."}</p>
      ) : (
        <ul className="gp-fu-list">
          {shown.map((f) => (
            <li key={f.clientId}>
              <div className="gp-fu-row">
                <span className="gp-av">{f.photo ? <img src={/^https?:/.test(f.photo) ? f.photo : `${imagePath}/${f.photo}`} alt="" /> : firstName(f.name).charAt(0).toUpperCase()}</span>
                <span className="gp-fu-i">
                  <b>{f.name}</b>
                  <span>{statusOf(f)} · {f.sessions} session{f.sessions === 1 ? "" : "s"}{f.nudgedAt ? ` · messaged ${fmtDay(f.nudgedAt)}` : ""}</span>
                </span>
                <span className="gp-fu-btns">
                  {f.phone && <button type="button" className="wa" onClick={() => wa(f, open === f.clientId ? msg : fill(TEMPLATES[0].text, f.name))}>WhatsApp</button>}
                  {f.hasEmail && <button type="button" className={open === f.clientId ? "on" : ""} disabled={!f.canEmail} title={f.canEmail ? "" : "Emailed in the last 7 days"} onClick={() => openMail(f)}>Email</button>}
                </span>
              </div>
              {open === f.clientId && (
                <div className="gp-fu-mail">
                  <div className="gp-tpls" aria-label="Message templates">
                    {TEMPLATES.map((t) => (
                      <button key={t.key} type="button" className={tpl === t.key ? "on" : ""} onClick={() => { setTpl(t.key); setMsg(fill(t.text, f.name)); }}>{t.label}</button>
                    ))}
                  </div>
                  <textarea rows={4} maxLength={1200} value={msg} onChange={(e) => setMsg(e.target.value)} />
                  <div><small>Sent by CYT from your name, with a button to book you. Edit it as you like.</small>
                    <button type="button" disabled={busy || msg.trim().length < 10} onClick={() => send(f)}>{busy ? "Sending…" : "Send email"}</button></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!q.trim() && filtered.length > 5 && <button type="button" className="gp-more" onClick={() => setMore(!more)}>{more ? "Show fewer" : `Show all ${filtered.length}`}</button>}
    </div>
  );
}

function DemandCard({ demand }) {
  const max = Math.max(1, ...demand.grid.flat());
  const short = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
  return (
    <div className="gp-card gp-dm">
      <div className="gp-h"><b>When clients book</b><span>last 90 days · all of CYT</span></div>
      <div className="gp-heat" role="table" aria-label="Bookings by day and time">
        <div className="gp-heat-row head" role="row"><span />{demand.bands.map((b) => <span key={b.key} role="columnheader" title={b.range}>{b.label}</span>)}</div>
        {demand.days.map((d, di) => (
          <div className="gp-heat-row" role="row" key={d}>
            <span role="rowheader">{short[d]}</span>
            {demand.bands.map((b, bi) => {
              const n = demand.grid[di][bi];
              const lvl = n === 0 ? 0 : Math.max(1, Math.ceil((n / max) * 4));
              const mine = demand.coverage[di][bi];
              return <span key={b.key} role="cell" className={`gp-cell l${lvl}${mine ? " mine" : ""}`} title={`${d} ${b.label.toLowerCase()} (${b.range}): ${n} booking${n === 1 ? "" : "s"}${mine ? " · you're open" : ""}`} />;
            })}
          </div>
        ))}
      </div>
      <div className="gp-legend"><span><i className="gp-cell l1" /> fewer</span><span><i className="gp-cell l4" /> more bookings</span><span><i className="gp-cell l0 mine" /> your hours</span></div>
      {demand.gaps?.length > 0 ? (
        <div className="gp-gap">
          <b>Busy times you&apos;re not open:</b> {demand.gaps.map((g) => `${g.day} ${g.band.toLowerCase()} (${g.range})`).join(", ")}.
          <Link href="/my-schedule?tab=availability">Open slots →</Link>
        </div>
      ) : demand.total > 0 ? <div className="gp-gap ok">Your hours cover the busiest booking times. 👍</div> : null}
    </div>
  );
}

// one request shared by every growth card on the page; reload() refetches after a change
let growthCache = null;
const growthSubs = new Set();
const fetchGrowth = () => fetchById(`${apiUrl}/therapist-growth/me`).then((r) => (r?.status && r.data?.demand ? r.data : null)).catch(() => null);
export function useGrowth() {
  const [d, setD] = useState(null);
  useEffect(() => {
    growthSubs.add(setD);
    if (!growthCache) growthCache = fetchGrowth();
    growthCache.then((x) => setD(x));
    return () => { growthSubs.delete(setD); };
  }, []);
  const set = (x) => { growthCache = Promise.resolve(x); growthSubs.forEach((f) => f(x)); };
  const reload = () => { growthCache = fetchGrowth(); growthCache.then((x) => growthSubs.forEach((f) => f(x))); };
  return [d, set, reload];
}

export function GrowthStyles() { return <style dangerouslySetInnerHTML={{ __html: CSS }} />; }

export function GrowthGoal({ monthEarnings = 0, monthSessions = 0 }) {
  const [d, set] = useGrowth();
  if (!d) return null;
  const saveGoal = async (amount) => {
    try {
      const r = await putData(`${apiUrl}/therapist-growth/goal`, { amount });
      if (r?.status) { set({ ...d, goal: r.data.goal }); toast.success("Goal saved"); } else toast.error(r?.message || "Couldn't save");
    } catch (e) { toast.error(e?.response?.data?.message || "Couldn't save"); }
  };
  return <GoalCard goal={d.goal} earned={monthEarnings} sessions={monthSessions} onSave={saveGoal} />;
}
export function GrowthBadge() {
  const [d] = useGrowth();
  return d ? <BadgeCard badge={d.badge} top={d.topTherapist} /> : null;
}
export function GrowthFollowups({ therapistName = "" }) {
  const [d, , reload] = useGrowth();
  return d ? <FollowupCard list={d.followups || []} therapistName={therapistName} onChanged={reload} /> : null;
}
export function GrowthDemand() {
  const [d] = useGrowth();
  return d ? <DemandCard demand={d.demand} /> : null;
}

const CSS = `
.gp-title { margin: 4px 0 10px; font-size: 17px; font-weight: 800; color: #13261c; }
.gp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
.gp-card { background: #fff; border: 1px solid #e6ece8; border-radius: 18px; padding: 16px 18px; box-shadow: 0 1px 2px rgba(16,24,40,.04); min-width: 0; }
.gp-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.gp-h b { font-size: 14.5px; color: #13261c; }
.gp-h span { font-size: 12px; font-weight: 700; color: #8a948f; }
.gp-h button { border: none; background: none; color: #1e7a4c; font-weight: 800; font-size: 13px; cursor: pointer; }
.gp-sub { margin: -4px 0 10px; padding: 0; font-size: 12.5px; color: #6b7c72; }
.gp-empty { margin: 0; padding: 12px; border-radius: 12px; background: #f6faf7; font-size: 13px; color: #4b5d53; }

.gp-goal { background: linear-gradient(135deg, #fffaf0, #fff 60%); border-color: #efe2bf; }
.gp-goal-set p { margin: 0 0 10px; padding: 0; font-size: 13px; color: #5b6560; }
.gp-goal-in { display: flex; align-items: center; gap: 6px; border: 1.5px solid #e6d7b8; border-radius: 12px; padding: 4px 4px 4px 12px; background: #fff; }
.gp-goal-in span { font-weight: 800; color: #8a5d06; }
.gp-goal-in input { flex: 1; min-width: 0; border: none !important; outline: none; font-size: 16px; font-weight: 700; height: 38px; background: transparent; box-shadow: none !important; padding: 0 !important; }
.gp-goal-in button { height: 38px; padding: 0 16px; border: none; border-radius: 9px; background: #14532d; color: #fff; font-weight: 800; cursor: pointer; }
.gp-goal-in button:disabled { opacity: .5; cursor: default; }
.gp-goal-quick { display: flex; gap: 6px; margin-top: 8px; }
.gp-goal-quick button { border: 1px solid #e6d7b8; background: #fff; border-radius: 999px; padding: 4px 12px; font-size: 12.5px; font-weight: 700; color: #6b4a0f; cursor: pointer; }
.gp-goal-body { display: flex; align-items: center; gap: 16px; }
.gp-ring { width: 96px; height: 96px; flex-shrink: 0; }
.gp-goal-txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.gp-goal-txt > b { font-size: 22px; font-weight: 900; color: #13261c; }
.gp-goal-txt > b span { font-size: 14px; font-weight: 700; color: #8a7342; }
.gp-goal-txt em { font-style: normal; font-size: 13.5px; color: #475569; }
.gp-goal-txt em.ok { color: #166534; font-weight: 700; }
.gp-goal-txt small { font-size: 11.5px; color: #8a948f; }

.gp-badge-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.gp-medal { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; background: linear-gradient(135deg, #cfd6d2, #a8b3ad); }
.gp-badge.on .gp-medal { background: linear-gradient(135deg, #f0cf7a, #c48a1c); box-shadow: 0 6px 16px -6px rgba(196,138,28,.7); }
.gp-badge-top p { margin: 0; padding: 0; font-size: 13px; line-height: 1.5; color: #475569; }
.gp-badge.on { border-color: #ecd49a; background: linear-gradient(135deg, #fffaf0, #fff 60%); }
.gp-checks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.gp-checks li { display: flex; align-items: center; gap: 10px; margin: 0; padding: 7px 10px; border-radius: 10px; background: #f7f9f8; font-size: 13px; color: #475569; }
.gp-checks li::before { content: none; }
.gp-checks li i { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #cbd5d0; display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 12px; font-weight: 900; color: #fff; }
.gp-checks li.ok i { background: #1e7a4c; border-color: #1e7a4c; }
.gp-checks li.ok span { color: #13261c; font-weight: 600; }
.gp-checks li em { margin-left: auto; font-style: normal; font-weight: 800; color: #13261c; }

.gp-fu-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.gp-fu-list li { margin: 0; padding: 0; }
.gp-fu-list li::before { content: none; }
.gp-fu-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; border: 1px solid #eef2ef; }
.gp-av { flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #fbf1dc; color: #9a6a12; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
.gp-av img { width: 100%; height: 100%; object-fit: cover; }
.gp-fu-i { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.gp-fu-i b { font-size: 14px; color: #13261c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gp-fu-i span { font-size: 11.5px; color: #7c8b81; }
.gp-fu-btns { display: flex; gap: 6px; flex-shrink: 0; }
.gp-fu-btns button { height: 32px; padding: 0 12px; border-radius: 9px; border: 1px solid #cfe3d6; background: #fff; color: #14532d; font-size: 12.5px; font-weight: 800; cursor: pointer; }
.gp-fu-btns button.wa { background: #25d366; border-color: #25d366; color: #fff; }
.gp-fu-btns button:disabled { opacity: .45; cursor: default; }
.gp-fu-mail { margin-top: 6px; padding: 10px; border-radius: 12px; background: #f6faf7; }
.gp-fu-mail textarea { width: 100%; box-sizing: border-box; border: 1px solid #dbe5df; border-radius: 10px; padding: 8px 10px; font-size: 13.5px; line-height: 1.5; font-family: inherit; resize: vertical; }
.gp-fu-mail > div { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px; }
.gp-fu-mail small { font-size: 11.5px; color: #7c8b81; }
.gp-fu-mail button { flex-shrink: 0; white-space: nowrap; height: 34px; padding: 0 14px; border: none; border-radius: 9px; background: #14532d; color: #fff; font-weight: 800; font-size: 13px; cursor: pointer; }
.gp-fu-mail button:disabled { opacity: .5; }
.gp-fu-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.gp-tabs { display: inline-flex; gap: 4px; padding: 3px; border-radius: 12px; background: #f1f5f2; }
.gp-tabs button { border: none; background: transparent; padding: 6px 12px; border-radius: 9px; font-size: 12.5px; font-weight: 800; color: #4b5d53; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.gp-tabs button i { font-style: normal; font-size: 11px; background: #e3ebe6; color: #26463a; border-radius: 999px; padding: 0 7px; }
.gp-tabs button.on { background: #fff; color: #14532d; box-shadow: 0 1px 3px rgba(16,24,40,.12); }
.gp-tabs button.on i { background: #ecc77d; color: #3d2a00; }
.gp-search { height: 34px; border: 1px solid #dbe5df; border-radius: 10px; padding: 0 12px; font-size: 13px; min-width: 0; width: 200px; }
.gp-st { font-weight: 700; color: #6b7c72; }
.gp-st.due { color: #b45309; }
.gp-st.up { color: #166534; }
.gp-fu-btns button.on { background: #14532d; border-color: #14532d; color: #fff; }
.gp-tpls { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.gp-tpls button { border: 1px solid #e6d7b8; background: #fff; border-radius: 999px; padding: 4px 11px; font-size: 12px; font-weight: 700; color: #6b4a0f; cursor: pointer; }
.gp-tpls button.on { background: #fbf1dc; border-color: #d4a24c; color: #3d2a00; }
.gp-more { margin-top: 8px; border: none; background: none; color: #1e7a4c; font-weight: 800; font-size: 13px; cursor: pointer; padding: 0; }

.gp-heat { display: flex; flex-direction: column; gap: 4px; }
.gp-heat-row { display: grid; grid-template-columns: 38px repeat(4, minmax(0, 1fr)); gap: 4px; align-items: center; }
.gp-heat-row > span:first-child { font-size: 11.5px; font-weight: 700; color: #6b7c72; }
.gp-heat-row.head > span { font-size: 11px; font-weight: 700; color: #8a948f; text-align: center; }
.gp-cell { display: block; height: 22px; border-radius: 6px; background: #f2f5f3; box-sizing: border-box; }
.gp-cell.l1 { background: #f8ecc9; } .gp-cell.l2 { background: #efd48c; } .gp-cell.l3 { background: #dfb24f; } .gp-cell.l4 { background: #b9821c; }
.gp-cell.mine { box-shadow: inset 0 0 0 2px #1e7a4c; }
.gp-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px; font-size: 11.5px; color: #6b7c72; }
.gp-legend span { display: inline-flex; align-items: center; gap: 5px; }
.gp-legend .gp-cell { width: 16px; height: 12px; border-radius: 3px; }
.gp-gap { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: #fff8e8; border: 1px solid #f0d9a4; font-size: 13px; line-height: 1.5; color: #5b4a2a; }
.gp-gap b { color: #13261c; }
.gp-gap a { display: inline-block; margin-left: 6px; font-weight: 800; color: #14532d !important; text-decoration: none !important; }
.gp-gap.ok { background: #f0f8f3; border-color: #cfe3d6; color: #14532d; }

@media (max-width: 900px) { .gp-grid { grid-template-columns: 1fr; } }
@media (max-width: 600px) {
  .gp-card { padding: 14px; border-radius: 16px; }
  .gp-fu-row { flex-wrap: wrap; }
  .gp-fu-btns { width: 100%; }
  .gp-fu-btns button { flex: 1; }
  .gp-search { width: 100%; }
  .gp-tabs { width: 100%; } .gp-tabs button { flex: 1; justify-content: center; }
}
`;
