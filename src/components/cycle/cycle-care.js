import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fetchById, putData, postData, deleteById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import {
  istDay, addDays, diffDays, niceDay, FLOWS, SYMPTOMS, GOALS, PHASES, cycleState, phaseOf, moodByPhase,
} from "../../utils/cycle";
import { setCycleFlag } from "../client/cycle-card";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

/* Cycle & Mood Care — a private period + mood tracker with therapy support, for clients who get periods.
   Funnel: who is this for? (gender / "do you get periods?") → privacy consent → last period + cycle length
   → what would help → the tracker (phase ring, today's log, calendar, mood by phase, support).
   API: GET/PUT /my-cycle… (backend CycleController). Moods share /my-moods with My Space. */

// where links go: the client portal, or the therapist portal (therapists look after themselves too)
const PORTALS = {
  client: { find: "/client/find", home: "/my-dashboard", homeLabel: "Back to My Space", forYou: "Women therapists who understand cycles, hormones and mood." },
  therapist: { find: "/view-all-therapist", home: "/therapist-dashboard", homeLabel: "Back to Dashboard", forYou: "You care for others all day — your own mind matters too. Talk to a colleague." },
};
const Portal = createContext(PORTALS.client);

const MOODS = [{ v: 1, e: "😞", l: "Low" }, { v: 2, e: "😕", l: "Meh" }, { v: 3, e: "😐", l: "Okay" }, { v: 4, e: "🙂", l: "Good" }, { v: 5, e: "😄", l: "Great" }];
const WA = (t) => "https://wa.me/918077757951?text=" + encodeURIComponent(t);
const errMsg = (e, f) => e?.response?.data?.message || f;

export default function CycleCare({ portal = "client" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const load = () => fetchById(`${apiUrl}/my-cycle`)
    .then((r) => { if (r?.status) { setData(r.data); setErr(""); } else setErr("Couldn't load this page. Please refresh."); })
    .catch(() => setErr("Couldn't load this page. Please check your connection and refresh."));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (data) setCycleFlag(!!data.profile?.enabled); }, [data]);

  return (
    <Portal.Provider value={PORTALS[portal] || PORTALS.client}>
      <style dangerouslySetInnerHTML={{ __html: CY_CSS }} />
      <div className="cy">
        {err && <div className="cy-err">{err}</div>}
        {!data && !err && <div className="cy-skel" />}
        {data && (data.profile?.enabled
          ? <Tracker data={data} setData={setData} />
          : <Gate data={data} onDone={(profile) => setData((d) => ({ ...d, profile, logs: d.logs || {}, moods: d.moods || {} }))} reload={load} />)}
      </div>
    </Portal.Provider>
  );
}

/* ─── the funnel: who it's for → privacy → cycle basics → what would help ─── */
function Gate({ data, onDone }) {
  const P = useContext(Portal);
  const g = data.gender;
  const p = data.profile;
  const first = g === "Female" || p?.menstruates ? "privacy" : "who"; // a wrong tap earlier? they can answer again
  const [step, setStep] = useState(first);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [consent, setConsent] = useState(false);
  const [last, setLast] = useState("");
  const [unsure, setUnsure] = useState(false);
  const [periodLen, setPeriodLen] = useState(5);
  const [cycleLen, setCycleLen] = useState(28);
  const [goals, setGoals] = useState([]);
  const today = istDay();
  // phones: each new step brings the question card into view
  const qRef = useRef(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    const el = qRef.current; if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: 'smooth' });
  }, [step]);

  const save = async (body) => {
    setBusy(true); setMsg("");
    try { const r = await putData(`${apiUrl}/my-cycle/profile`, body); setBusy(false); return r?.data || {}; }
    catch (e) { setBusy(false); setMsg(errMsg(e, "Couldn't save. Please try again.")); return null; }
  };
  const pickWho = async (who) => {
    if (who === "Female") { if (await save({ gender: "Female", menstruates: true })) setStep("privacy"); return; }
    if (who === "Male") { if (await save({ gender: "Male", dismissed: true })) setStep("notfor"); return; }
    if (who !== "skip" && !(await save({ gender: who }))) return;
    setStep("periods");
  };
  const pickPeriods = async (yes) => {
    if (await save(yes ? { menstruates: true, dismissed: false } : { menstruates: false, dismissed: true })) setStep(yes ? "privacy" : "notfor");
  };
  const finish = async () => {
    const r = await save({ menstruates: true, enabled: true, consent: true, lastStart: unsure ? "" : last, cycleLen, periodLen, goals });
    if (r) { setCycleFlag(true); onDone(r); window.scrollTo({ top: 0 }); }
  };
  const setupSteps = ["privacy", "basics", "goals"];
  const at = setupSteps.indexOf(step);

  return (
    <div className="cy-gate">
      <div className="cy-hero">
        <div className="cy-hero-ic"><SpaRoundedIcon /></div>
        <div>
          <span className="cy-kicker">New · For women · Free</span>
          <h1>Cycle &amp; Mood Care</h1>
          <p>Track your period and how you feel through the month — and get support from a therapist when PMS, PMDD, period pain or PCOS start affecting your mood.</p>
        </div>
      </div>

      {at >= 0 && (
        <div ref={qRef} className="cy-steps" aria-label={`Step ${at + 1} of 3`}>
          {["Privacy", "Your cycle", "Support"].map((l, i) => (
            <span key={l} className={i < at ? "done" : i === at ? "on" : ""}><i>{i < at ? <CheckRoundedIcon /> : i + 1}</i>{l}</span>
          ))}
        </div>
      )}

      <div className="cy-card cy-q">
        {step === "who" && (
          <>
            <h2>First — who is this for?</h2>
            <p className="cy-sub">This section is made for people who get periods. Your answer is saved to your account (you can change it later).</p>
            <div className="cy-opts">
              {[["Female", "Woman"], ["Male", "Man"], ["Non-binary", "Non-binary"], ["Other", "Other"]].map(([v, l]) => (
                <button key={v} type="button" disabled={busy} onClick={() => pickWho(v)}>{l}</button>
              ))}
            </div>
            <button type="button" className="cy-link" disabled={busy} onClick={() => pickWho("skip")}>Prefer not to say</button>
          </>
        )}

        {step === "periods" && (
          <>
            <h2>Do you get periods?</h2>
            <p className="cy-sub">We only ask so this section shows for the people it can help.</p>
            <div className="cy-opts two">
              <button type="button" disabled={busy} onClick={() => pickPeriods(true)}>Yes</button>
              <button type="button" disabled={busy} onClick={() => pickPeriods(false)}>No</button>
            </div>
          </>
        )}

        {step === "notfor" && (
          <>
            <h2>This section isn&apos;t for you — and that&apos;s okay</h2>
            <p className="cy-sub">Cycle &amp; Mood Care is for people who get periods. Everything else in My Space is just the same.</p>
            <div className="cy-acts">
              <Link href={P.home} className="cy-btn">{P.homeLabel}</Link>
              <Link href="/therapy-for/relationships" className="cy-btn line">Supporting a partner? Talk to a therapist</Link>
            </div>
            <button type="button" className="cy-link" disabled={busy} onClick={() => setStep("who")}>Picked by mistake? Change my answer</button>
          </>
        )}

        {step === "privacy" && (
          <>
            <h2><LockRoundedIcon /> Your data stays private</h2>
            <ul className="cy-priv">
              <li><CheckRoundedIcon />Only you can see your cycle, symptoms and notes.</li>
              <li><CheckRoundedIcon />Therapists and CYT staff can&apos;t see them — unless you choose to tell your therapist.</li>
              <li><CheckRoundedIcon />Turn it off and delete everything any time, in one tap.</li>
              <li><CheckRoundedIcon />Dates are estimates from what you log — not medical advice or birth control.</li>
            </ul>
            <label className="cy-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I understand and want to use Cycle &amp; Mood Care</label>
            <div className="cy-acts"><button type="button" className="cy-btn" disabled={!consent} onClick={() => setStep("basics")}>Continue <ArrowForwardRoundedIcon /></button></div>
          </>
        )}

        {step === "basics" && (
          <>
            <h2>About your cycle</h2>
            <label className="cy-field">
              <span>When did your last period start?</span>
              <input type="date" value={last} max={today} min={addDays(today, -120)} disabled={unsure} onChange={(e) => setLast(e.target.value)} />
            </label>
            <label className="cy-check"><input type="checkbox" checked={unsure} onChange={(e) => setUnsure(e.target.checked)} /> I don&apos;t remember — I&apos;ll log my next one</label>
            <div className="cy-two">
              <Stepper label="Period lasts about" unit="days" value={periodLen} min={2} max={10} onChange={setPeriodLen} />
              <Stepper label="Cycle length about" unit="days" value={cycleLen} min={21} max={45} onChange={setCycleLen} hint="Not sure? Keep 28" />
            </div>
            <div className="cy-acts">
              <button type="button" className="cy-btn line" onClick={() => setStep("privacy")}>Back</button>
              <button type="button" className="cy-btn" disabled={!unsure && !last} onClick={() => setStep("goals")}>Continue <ArrowForwardRoundedIcon /></button>
            </div>
          </>
        )}

        {step === "goals" && (
          <>
            <h2>What would you like help with?</h2>
            <p className="cy-sub">Pick any — we&apos;ll show the right support. You can change this later.</p>
            <div className="cy-chips">
              {GOALS.map(([k, l]) => (
                <button key={k} type="button" className={goals.includes(k) ? "on" : ""} aria-pressed={goals.includes(k)}
                  onClick={() => setGoals((gs) => (gs.includes(k) ? gs.filter((x) => x !== k) : [...gs, k]))}>{goals.includes(k) && <CheckRoundedIcon />}{l}</button>
              ))}
            </div>
            <div className="cy-acts">
              <button type="button" className="cy-btn line" onClick={() => setStep("basics")}>Back</button>
              <button type="button" className="cy-btn" disabled={busy} onClick={finish}>{busy ? "Setting up…" : "Start tracking"} <ArrowForwardRoundedIcon /></button>
            </div>
          </>
        )}
        {msg && <div className="cy-err">{msg}</div>}
      </div>

      <div className="cy-why">
        {[[WaterDropRoundedIcon, "Know what's coming", "Your next period and phase, from your own logs."],
          [InsightsRoundedIcon, "See your mood pattern", "How you feel in each phase — spot PMS early."],
          [VolunteerActivismRoundedIcon, "Get support", "Therapists who understand PMS, PMDD and PCOS."]].map(([Icon, b, s]) => (
          <div key={b}><Icon /><b>{b}</b><span>{s}</span></div>
        ))}
      </div>
    </div>
  );
}

function Stepper({ label, unit, value, min, max, onChange, hint }) {
  return (
    <div className="cy-stepper">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Less">−</button>
        <b>{value} <small>{unit}</small></b>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="More">+</button>
      </div>
      {hint && <em>{hint}</em>}
    </div>
  );
}

/* ─── the tracker ─── */
function Tracker({ data, setData }) {
  const { profile } = data;
  const logs = useMemo(() => data.logs || {}, [data.logs]);
  const moods = useMemo(() => data.moods || {}, [data.moods]);
  const today = istDay();
  const st = useMemo(() => cycleState(profile, logs, today), [profile, logs, today]);
  const [sel, setSel] = useState(today);
  const logRef = useRef(null);
  const pick = (d) => { setSel(d); logRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const saveLog = async (day, entry, mood) => {
    const r = await putData(`${apiUrl}/my-cycle/log`, { day, ...entry });
    if (mood) await postData(`${apiUrl}/my-moods`, { day, v: mood }).catch(() => {});
    setData((d) => {
      const nl = { ...(d.logs || {}) };
      if (r?.data) nl[day] = r.data; else delete nl[day];
      return { ...d, logs: nl, moods: mood ? { ...(d.moods || {}), [day]: mood } : d.moods };
    });
  };

  const ph = st?.phase ? PHASES[st.phase] : null;
  return (
    <>
      <div className="cy-top">
        <div className="cy-card cy-ringcard" style={ph ? { "--ph": ph.color, "--ph-soft": ph.soft } : undefined}>
          {st?.start ? (
            <>
              <Ring st={st} />
              <div className="cy-now">
                <span className="cy-pill">{ph.name}</span>
                <h1>{st.late ? `Period ${st.late} day${st.late === 1 ? "" : "s"} late` : st.phase === "menstrual" ? `Period · day ${st.day}` : st.inDays === 0 ? "Period may start today" : `Period in ${st.inDays} day${st.inDays === 1 ? "" : "s"}`}</h1>
                <p>{ph.feel}</p>
                <div className="cy-facts">
                  <span><b>{niceDay(st.next)}</b>Next period (est.)</span>
                  <span><b>{st.cycleLen} days</b>{st.gaps.length ? "Your average cycle" : "Cycle length"}</span>
                  <span><b>Day {st.day}</b>of this cycle</span>
                </div>
                {st.late >= 7 && <p className="cy-note">A late period can come from stress, travel, illness or PCOS. If it&apos;s unusual for you, a doctor can help — and if the worry is weighing on you, talk to us.</p>}
              </div>
            </>
          ) : (
            <div className="cy-start">
              <WaterDropRoundedIcon />
              <h1>Log your next period to begin</h1>
              <p>When your period starts, tap below. We&apos;ll work out your phases and predict the next one.</p>
              <button type="button" className="cy-btn" onClick={() => saveLog(today, { flow: 3, symptoms: logs[today]?.symptoms || [], note: logs[today]?.note || "" })}>My period started today</button>
            </div>
          )}
        </div>

        <div className="cy-card cy-tips" style={ph ? { "--ph": ph.color, "--ph-soft": ph.soft } : undefined}>
          <h2><SpaRoundedIcon /> {ph ? `Care for your ${ph.name.replace(" (est.)", "").replace(" (pre-period)", "").toLowerCase()} days` : "Care for every phase"}</h2>
          <ul>{(ph || PHASES.follicular).tips.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="cy-legend">
            {Object.entries(PHASES).map(([k, v]) => <span key={k}><i style={{ background: v.color }} />{v.name.replace(" (pre-period)", "")}</span>)}
          </div>
        </div>
      </div>

      <div className="cy-grid">
        <div ref={logRef} className="cy-scroll"><DayLog key={sel} day={sel} today={today} entry={logs[sel]} mood={moods[sel]} onSave={saveLog} onDay={setSel} /></div>
        <Calendar st={st} logs={logs} moods={moods} today={today} sel={sel} onPick={pick} />
      </div>

      <MoodPattern st={st} moods={moods} />
      <Support goals={profile.goals || []} phase={st?.phase} />
      <Settings profile={profile} setData={setData} />
      <p className="cy-disc">Estimates come from what you log and aren&apos;t medical advice or birth control. For severe pain, very heavy bleeding or missed periods, please see a doctor. In crisis, call Tele-MANAS <a href="tel:14416">14416</a> (24×7, free).</p>
    </>
  );
}

function Ring({ st }) {
  const S = 200, R = 82, C = 2 * Math.PI * R, L = st.cycleLen;
  const ovu = Math.max(st.periodLen + 2, L - 14);
  const segs = [["menstrual", 1, st.periodLen], ["follicular", st.periodLen + 1, ovu - 2], ["ovulation", ovu - 1, ovu + 1], ["luteal", ovu + 2, L]].filter(([, a, b]) => b >= a);
  const day = Math.min(st.day, L);
  const ang = ((day - 0.5) / L) * 2 * Math.PI - Math.PI / 2;
  return (
    <svg className="cy-ring" viewBox={`0 0 ${S} ${S}`} role="img" aria-label={`Day ${st.day} of about ${L}`}>
      <g transform={`rotate(-90 ${S / 2} ${S / 2})`}>
        {segs.map(([k, a, b]) => {
          const len = ((b - a + 1) / L) * C;
          return <circle key={k} cx={S / 2} cy={S / 2} r={R} fill="none" stroke={PHASES[k].color} strokeOpacity={k === st.phase ? 1 : 0.28} strokeWidth="16"
            strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-((a - 1) / L) * C} strokeLinecap="butt" />;
        })}
      </g>
      <circle cx={S / 2 + R * Math.cos(ang)} cy={S / 2 + R * Math.sin(ang)} r="13" fill="#fff" stroke={PHASES[st.phase].color} strokeWidth="5" />
      <text x={S / 2} y={S / 2 - 6} textAnchor="middle" className="cy-ring-d">{st.day}</text>
      <text x={S / 2} y={S / 2 + 18} textAnchor="middle" className="cy-ring-l">DAY OF CYCLE</text>
    </svg>
  );
}

function DayLog({ day, today, entry, mood: savedMood, onSave, onDay }) {
  const [flow, setFlow] = useState(entry?.flow || 0);
  const [sym, setSym] = useState(entry?.symptoms || []);
  const [note, setNote] = useState(entry?.note || "");
  const [mood, setMood] = useState(savedMood || 0);
  const [state, setState] = useState("");
  const dirty = flow !== (entry?.flow || 0) || note !== (entry?.note || "") || mood !== (savedMood || 0)
    || sym.slice().sort().join() !== (entry?.symptoms || []).slice().sort().join();
  const save = async () => {
    setState("saving");
    try { await onSave(day, { flow, symptoms: sym, note }, mood !== (savedMood || 0) ? mood : 0); setState("saved"); }
    catch (e) { setState(errMsg(e, "Couldn't save. Please try again.")); }
  };
  return (
    <div className="cy-card cy-log">
      <div className="cy-log-h">
        <h2><EventRoundedIcon /> {day === today ? "Today" : niceDay(day, { weekday: "short", day: "numeric", month: "short" })}</h2>
        <div className="cy-daynav">
          <button type="button" onClick={() => onDay(addDays(day, -1))} aria-label="Day before"><ChevronLeftRoundedIcon /></button>
          <button type="button" onClick={() => onDay(addDays(day, 1))} disabled={day >= today} aria-label="Next day"><ChevronRightRoundedIcon /></button>
        </div>
      </div>
      <span className="cy-lbl">Period</span>
      <div className="cy-flow">
        {FLOWS.map((f) => (
          <button key={f.v} type="button" className={flow === f.v ? "on" : ""} aria-pressed={flow === f.v} onClick={() => setFlow(f.v)}>
            <i className={`f${f.v}`} />{f.l}
          </button>
        ))}
      </div>
      <span className="cy-lbl">Mood</span>
      <div className="cy-moods">
        {MOODS.map((m) => (
          <button key={m.v} type="button" className={mood === m.v ? "on" : ""} aria-pressed={mood === m.v} onClick={() => setMood(m.v)}><span>{m.e}</span>{m.l}</button>
        ))}
      </div>
      <span className="cy-lbl">How&apos;s your body and mind?</span>
      <div className="cy-chips sm">
        {SYMPTOMS.map(([k, l]) => (
          <button key={k} type="button" className={sym.includes(k) ? "on" : ""} aria-pressed={sym.includes(k)} onClick={() => setSym((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))}>{l}</button>
        ))}
      </div>
      <textarea value={note} maxLength={280} rows={2} placeholder="A note for yourself (optional)" onChange={(e) => setNote(e.target.value)} />
      <div className="cy-acts end">
        {state === "saved" && !dirty && <span className="cy-ok"><CheckRoundedIcon /> Saved</span>}
        {state && state !== "saved" && state !== "saving" && <span className="cy-bad">{state}</span>}
        <button type="button" className="cy-btn" disabled={!dirty || state === "saving"} onClick={save}>{state === "saving" ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

function Calendar({ st, logs, moods, today, sel, onPick }) {
  const [ym, setYm] = useState(today.slice(0, 7));
  const first = `${ym}-01`;
  const days = new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0)).getUTCDate();
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday first
  const shift = (n) => { const d = new Date(`${first}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n); setYm(d.toISOString().slice(0, 7)); };
  // predicted period days + estimated ovulation for the next 3 cycles
  const pred = new Set(); const ovu = new Set();
  if (st?.start) {
    for (let c = 0; c < 4; c += 1) {
      const s = addDays(st.start, st.cycleLen * c);
      const o = addDays(s, Math.max(st.periodLen + 2, st.cycleLen - 14) - 1);
      if (o > today) ovu.add(o);
      if (c === 0) continue;
      for (let i = 0; i < st.periodLen; i += 1) { const d = addDays(s, i); if (d > today) pred.add(d); }
    }
  }
  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let i = 1; i <= days; i += 1) cells.push(`${ym}-${String(i).padStart(2, "0")}`);
  return (
    <div className="cy-card cy-cal">
      <div className="cy-log-h">
        <h2><WaterDropRoundedIcon /> {niceDay(first, { month: "long", year: "numeric" })}</h2>
        <div className="cy-daynav">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeftRoundedIcon /></button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month"><ChevronRightRoundedIcon /></button>
        </div>
      </div>
      <div className="cy-cal-g">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={`h${i}`} className="cy-cal-wd">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const f = logs[d]?.flow || 0;
          const ph = d <= today && st ? (() => { const s = (st.starts || []).filter((x) => x <= d).pop(); return s ? phaseOf(diffDays(d, s) + 1, st.cycleLen, st.periodLen) : null; })() : null;
          const cls = ["cy-d", f >= 2 ? "per" : f === 1 ? "spot" : "", pred.has(d) ? "pred" : "", ovu.has(d) ? "ovu" : "", d === today ? "today" : "", d === sel ? "sel" : "", d > today ? "fut" : ""].filter(Boolean).join(" ");
          return (
            <button key={d} type="button" className={cls} disabled={d > today} onClick={() => onPick(d)}
              style={ph && !f ? { "--pc": PHASES[ph].soft } : undefined} aria-label={niceDay(d, { day: "numeric", month: "long" })}>
              {+d.slice(8)}
              {moods[d] ? <em>{MOODS[moods[d] - 1].e}</em> : null}
            </button>
          );
        })}
      </div>
      <div className="cy-cal-key">
        <span><i className="k-per" />Period</span><span><i className="k-pred" />Predicted</span><span><i className="k-ovu" />Ovulation (est.)</span>
      </div>
    </div>
  );
}

function MoodPattern({ st, moods }) {
  const P = useContext(Portal);
  const by = useMemo(() => moodByPhase(moods, st), [moods, st]);
  const keys = ["menstrual", "follicular", "ovulation", "luteal"];
  const logged = keys.reduce((n, k) => n + (by[k]?.n || 0), 0);
  const others = keys.filter((k) => k !== "luteal" && by[k]?.n >= 2).map((k) => by[k].avg);
  const dip = by.luteal?.n >= 3 && others.length && by.luteal.avg <= 2.6 && Math.max(...others) - by.luteal.avg >= 0.8;
  return (
    <div className="cy-card cy-pattern">
      <h2><InsightsRoundedIcon /> Your mood through the cycle</h2>
      {logged < 6 ? (
        <p className="cy-sub">Log your mood for a few weeks and you&apos;ll see how each phase feels for you. ({logged} day{logged === 1 ? "" : "s"} so far)</p>
      ) : (
        <div className="cy-bars">
          {keys.map((k) => (
            <div key={k}>
              <span className="cy-bar-l">{PHASES[k].name.replace(" (est.)", "").replace(" (pre-period)", "")}</span>
              <div className="cy-bar"><i style={{ width: by[k] ? `${(by[k].avg / 5) * 100}%` : 0, background: PHASES[k].color }} /></div>
              <b>{by[k] ? MOODS[Math.round(by[k].avg) - 1].e : "—"}</b>
            </div>
          ))}
        </div>
      )}
      {dip && (
        <div className="cy-alert">
          <b>Your mood drops before your period</b>
          <p>This pattern can be PMS — and when it&apos;s strong, PMDD. It&apos;s real and it&apos;s treatable. A therapist can help you plan for these days.</p>
          <Link href={`${P.find}?gender=Female&concern=Depression`} className="cy-btn">Find a therapist <ArrowForwardRoundedIcon /></Link>
        </div>
      )}
    </div>
  );
}

const SUPPORT = {
  pms: { t: "PMS mood swings", d: "Plan for the hard days with a therapist.", q: "?gender=Female&concern=Anxiety" },
  pmdd: { t: "PMDD & pre-period lows", d: "Very low mood or anger before periods is treatable.", q: "?gender=Female&concern=Depression" },
  pain: { t: "Period pain & stress", d: "Cope with pain without it taking over your week.", q: "?gender=Female&concern=Stress%20Management" },
  pcos: { t: "PCOS & irregular periods", d: "The worry, weight talk and frustration — share it.", q: "?gender=Female&concern=Stress%20Management" },
  body: { t: "Body image & self-worth", d: "Feel kinder towards your body.", q: "?gender=Female&concern=Self%20Esteem" },
  fertility: { t: "Trying to conceive", d: "Support for the waiting, hoping and grief.", q: "?gender=Female&concern=Anxiety" },
  meno: { t: "Perimenopause & menopause", d: "Mood, sleep and identity changes — you're not alone.", q: "?gender=Female&concern=Depression" },
};

function Support({ goals, phase }) {
  const P = useContext(Portal);
  const keys = goals.filter((g) => SUPPORT[g]);
  const list = (keys.length ? keys : ["pms", "pmdd", "pain"]).slice(0, 4);
  return (
    <section className="cy-card cy-support">
      <div className="cy-support-h">
        <span><VolunteerActivismRoundedIcon /></span>
        <div><h2>Therapy support for you</h2><p className="cy-sub">{phase === "luteal" ? "Pre-period days can feel heavy — this is a good time to reach out." : P.forYou}</p></div>
      </div>
      <div className="cy-sup-grid">
        {list.map((k) => (
          <Link key={k} href={`${P.find}${SUPPORT[k].q}`} className="cy-sup"><FavoriteRoundedIcon /><b>{SUPPORT[k].t}</b><span>{SUPPORT[k].d}</span><i>Find a therapist <ArrowForwardRoundedIcon /></i></Link>
        ))}
      </div>
      <div className="cy-acts">
        <Link href={`${P.find}?gender=Female`} className="cy-btn">See women therapists</Link>
        <a href={WA("Hi CYT team, I'd like help choosing a therapist for period-related mood changes.")} target="_blank" rel="noopener noreferrer" className="cy-btn line"><SupportAgentRoundedIcon /> Talk to us</a>
        <Link href="/self-assessment/phq-9-depression-test" className="cy-btn line">Take a mood check (PHQ-9)</Link>
      </div>
    </section>
  );
}

function Settings({ profile, setData }) {
  const P = useContext(Portal);
  const [open, setOpen] = useState(false);
  const [cycleLen, setCycleLen] = useState(profile.cycleLen || 28);
  const [periodLen, setPeriodLen] = useState(profile.periodLen || 5);
  const [goals, setGoals] = useState(profile.goals || []);
  const [msg, setMsg] = useState("");
  const save = async () => {
    setMsg("Saving…");
    try { const r = await putData(`${apiUrl}/my-cycle/profile`, { cycleLen, periodLen, goals }); setData((d) => ({ ...d, profile: r.data })); setMsg("Saved"); }
    catch (e) { setMsg(errMsg(e, "Couldn't save.")); }
  };
  const wipe = async () => {
    if (!window.confirm("Turn off Cycle & Mood Care and delete all your cycle logs? Your daily moods on My Space stay.")) return;
    try { await deleteById(`${apiUrl}/my-cycle`); setCycleFlag(false); window.location.href = P.home; }
    catch (e) { setMsg("Couldn't delete. Please try again."); }
  };
  return (
    <div className="cy-card cy-set">
      <button type="button" className="cy-set-t" onClick={() => setOpen((o) => !o)} aria-expanded={open}><TuneRoundedIcon /> Cycle settings &amp; privacy <ChevronRightRoundedIcon className={open ? "up" : ""} /></button>
      {open && (
        <div className="cy-set-b">
          <div className="cy-two">
            <Stepper label="Period lasts about" unit="days" value={periodLen} min={2} max={10} onChange={setPeriodLen} />
            <Stepper label="Cycle length about" unit="days" value={cycleLen} min={21} max={45} onChange={setCycleLen} hint="Your logs refine this" />
          </div>
          <span className="cy-lbl">Help with</span>
          <div className="cy-chips sm">
            {GOALS.map(([k, l]) => (
              <button key={k} type="button" className={goals.includes(k) ? "on" : ""} aria-pressed={goals.includes(k)} onClick={() => setGoals((gs) => (gs.includes(k) ? gs.filter((x) => x !== k) : [...gs, k]))}>{l}</button>
            ))}
          </div>
          <div className="cy-acts">
            <button type="button" className="cy-btn" onClick={save}>Save settings</button>
            {msg && <span className="cy-ok">{msg}</span>}
          </div>
          <div className="cy-danger">
            <div><b><LockRoundedIcon /> Only you can see this data</b><span>Turning off deletes your cycle logs and settings for good.</span></div>
            <button type="button" onClick={wipe}>Turn off &amp; delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

const CY_CSS = `
.cls-main:has(.cy) { max-width: none !important; }
.ts-page .cy { margin: 0 auto; }
.cy { --cy-ink: #0f172a; --cy-mut: #64748b; --cy-line: #e6ece8; --cy-rose: #e5476b; max-width: 1180px; }
.cy-skel { height: 420px; border-radius: 20px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: cySk 1.3s infinite linear; }
@keyframes cySk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.cy-err { background: #fef2f2; color: #b91c1c; border-radius: 12px; padding: 10px 14px; font-size: 13.5px; font-weight: 600; margin: 10px 0; }
.cy-card { background: #fff; border: 1px solid var(--cy-line); border-radius: 20px; padding: 18px; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -20px rgba(15,23,42,.35); min-width: 0; }
.cy h1, .cy h2 { font-family: inherit; color: var(--cy-ink); }
.cy h2 { display: flex; align-items: center; gap: 8px; font-size: 16.5px; font-weight: 800; margin: 0 0 10px; }
.cy h2 svg { font-size: 21px; color: var(--cy-rose); }
.cy-sub { margin: 0 0 12px; font-size: 13.5px; color: var(--cy-mut); line-height: 1.5; }
.cy-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; padding: 0 18px; border-radius: 12px; border: 0; cursor: pointer; font: inherit; font-size: 14px; font-weight: 800;
  background: linear-gradient(160deg, #f0668a, #d63a62); color: #fff !important; text-decoration: none !important; box-shadow: 0 8px 18px -10px rgba(214,58,98,.8); }
.cy-btn svg { font-size: 18px; }
.cy-btn.line { background: #fff; color: #9f1d43 !important; border: 1.5px solid #f6cbd7; box-shadow: none; }
.cy-btn:disabled { opacity: .5; cursor: default; }
.cy-link { display: block; margin: 12px auto 0; border: 0; background: none; color: var(--cy-mut); font: inherit; font-size: 13.5px; font-weight: 700; text-decoration: underline; cursor: pointer; }
.cy-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; align-items: center; }
.cy-acts.end { justify-content: flex-end; margin-top: 12px; }
.cy-ok { display: inline-flex; align-items: center; gap: 4px; color: #15803d; font-size: 13px; font-weight: 800; }
.cy-ok svg { font-size: 17px; }
.cy-bad { color: #b91c1c; font-size: 13px; font-weight: 700; }

/* funnel */
.cy-gate { max-width: 760px; margin: 0 auto; }
.cy-hero { display: flex; gap: 16px; align-items: flex-start; padding: 22px; border-radius: 22px; color: #fff; margin-bottom: 16px;
  background: radial-gradient(120% 140% at 100% 0%, #ffb8c9 0%, rgba(255,184,201,0) 55%), linear-gradient(140deg, #8e1f47, #d63a62 60%, #f0789a); box-shadow: 0 18px 40px -26px rgba(142,31,71,.9); }
.cy-hero-ic { width: 54px; height: 54px; border-radius: 16px; background: rgba(255,255,255,.18); display: grid; place-items: center; flex: none; }
.cy-hero-ic svg { font-size: 30px; }
.cy-kicker { display: inline-block; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,.2); font-size: 11.5px; font-weight: 800; letter-spacing: .04em; }
.cy-hero h1 { color: #fff !important; font-size: clamp(24px, 3vw, 30px); font-weight: 800; margin: 8px 0 6px; letter-spacing: -.02em; }
.cy-hero p { margin: 0; font-size: 14.5px; line-height: 1.55; opacity: .92; }
.cy-steps { display: flex; gap: 8px; margin: 0 0 12px; }
.cy-steps span { flex: 1; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: #fff; border: 1px solid var(--cy-line); font-size: 13px; font-weight: 700; color: var(--cy-mut); }
.cy-steps i { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 12px; font-weight: 800; background: #f1f5f3; flex: none; }
.cy-steps i svg { font-size: 16px; }
.cy-steps .on { border-color: #f3b3c4; color: #9f1d43; } .cy-steps .on i { background: #d63a62; color: #fff; }
.cy-steps .done i { background: #fde8ee; color: #d63a62; }
.cy-q { padding: 22px; }
.cy-q h2 { font-size: 19px; }
.cy-opts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.cy-opts.two { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 380px; }
.cy-opts button { height: 54px; border-radius: 14px; border: 1.5px solid var(--cy-line); background: #fff; font: inherit; font-size: 15px; font-weight: 800; color: var(--cy-ink); cursor: pointer; transition: all .15s ease; }
.cy-opts button:hover { border-color: #f3b3c4; background: #fff5f8; color: #9f1d43; }
.cy-priv { list-style: none; padding: 0; margin: 4px 0 14px; display: grid; gap: 10px; }
.cy-priv li { display: flex; gap: 10px; font-size: 14px; line-height: 1.45; color: #334155; }
.cy-priv svg { flex: none; font-size: 18px; color: #fff; background: #1e9e64; border-radius: 50%; padding: 2px; }
.cy-check { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: var(--cy-ink); cursor: pointer; margin-top: 6px; }
/* the site theme hides native checkboxes (opacity 0, absolute) — draw our own, always visible */
.cy .cy-check input[type=checkbox] { position: static !important; opacity: 1 !important; visibility: visible !important; display: inline-grid !important; place-content: center; flex: none; margin: 0 !important; width: 24px !important; height: 24px !important; border-radius: 7px; border: 2px solid #d9a3b3; background: #fff; -webkit-appearance: none; appearance: none; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
.cy .cy-check input[type=checkbox]::after { content: ""; width: 6px; height: 11px; border: solid #fff; border-width: 0 3px 3px 0; transform: rotate(45deg) translate(-1px, -1px); opacity: 0; }
.cy .cy-check input[type=checkbox]:checked { background: #d63a62; border-color: #d63a62; }
.cy .cy-check input[type=checkbox]:checked::after { opacity: 1; }
.cy .cy-check input[type=checkbox]:focus-visible { outline: 3px solid #f9c4d3; outline-offset: 2px; }
.cy .cy-check::before, .cy .cy-check::after { display: none !important; }
.cy .cy-check { padding: 12px 14px; border-radius: 14px; background: #fff7f9; border: 1px solid #f9dbe3; line-height: 1.4; }
.cy-field { display: grid; gap: 6px; margin-bottom: 8px; }
.cy-field span, .cy-lbl { font-size: 13px; font-weight: 800; color: #334155; }
.cy-lbl { display: block; margin: 14px 0 8px; }
.cy-field input { height: 46px; border: 1.5px solid var(--cy-line); border-radius: 12px; padding: 0 12px; font: inherit; font-size: 15px; color: var(--cy-ink); max-width: 260px; }
.cy-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.cy-stepper { padding: 12px; border-radius: 14px; background: #fafbfa; border: 1px solid var(--cy-line); display: grid; gap: 8px; }
.cy-stepper > span { font-size: 13px; font-weight: 800; color: #334155; }
.cy-stepper > div { display: flex; align-items: center; justify-content: space-between; }
.cy-stepper button { width: 40px; height: 40px; border-radius: 12px; border: 1.5px solid var(--cy-line); background: #fff; font-size: 20px; font-weight: 800; cursor: pointer; color: #9f1d43; }
.cy-stepper b { font-size: 22px; font-weight: 800; } .cy-stepper small { font-size: 13px; color: var(--cy-mut); font-weight: 700; }
.cy-stepper em { font-style: normal; font-size: 12px; color: var(--cy-mut); }
.cy-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cy-chips button { display: inline-flex; align-items: center; gap: 5px; padding: 10px 14px; border-radius: 999px; border: 1.5px solid var(--cy-line); background: #fff; font: inherit; font-size: 13.5px; font-weight: 700; color: #334155; cursor: pointer; text-align: left; }
.cy-chips.sm button { padding: 7px 12px; font-size: 13px; }
.cy-chips button svg { font-size: 16px; }
.cy-chips button.on { background: #fde8ee; border-color: #f3a5bb; color: #9f1d43; }
.cy-why { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
.cy-why > div { display: grid; gap: 3px; padding: 14px; border-radius: 16px; background: #fff; border: 1px solid var(--cy-line); }
.cy-why svg { font-size: 24px; color: #d63a62; margin-bottom: 4px; }
.cy-why b { font-size: 14px; } .cy-why span { font-size: 12.5px; color: var(--cy-mut); line-height: 1.4; }

/* tracker */
.cy-top { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 14px; }
.cy-ringcard { display: flex; gap: 22px; align-items: center; background: radial-gradient(110% 120% at 0% 0%, var(--ph-soft, #fde8ee) 0%, #fff 60%); }
.cy-ring { width: 200px; height: 200px; flex: none; }
.cy-ring-d { font-size: 46px; font-weight: 800; fill: #0f172a; font-family: inherit; }
.cy-ring-l { font-size: 10px; font-weight: 800; letter-spacing: .12em; fill: #64748b; font-family: inherit; }
.cy-now { min-width: 0; }
.cy-pill { display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--ph, #e5476b); color: #fff; font-size: 12px; font-weight: 800; letter-spacing: .02em; }
.cy-now h1 { font-size: clamp(22px, 2.6vw, 28px); font-weight: 800; margin: 8px 0 6px; letter-spacing: -.02em; }
.cy-now > p { margin: 0; font-size: 14px; color: #475569; line-height: 1.5; }
.cy-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
.cy-facts span { display: grid; padding: 10px; border-radius: 14px; background: #fff; border: 1px solid var(--cy-line); font-size: 11.5px; color: var(--cy-mut); font-weight: 600; }
.cy-facts b { font-size: 15.5px; color: var(--cy-ink); font-weight: 800; }
.cy-note { margin: 12px 0 0 !important; padding: 10px 12px; border-radius: 12px; background: #fff8eb; color: #92400e !important; font-size: 13px !important; }
.cy-start { text-align: center; padding: 10px; width: 100%; }
.cy-start > svg { font-size: 40px; color: #d63a62; }
.cy-start h1 { font-size: 22px; margin: 6px 0; } .cy-start p { margin: 0 0 14px; color: var(--cy-mut); font-size: 14px; }
.cy-tips { background: linear-gradient(180deg, var(--ph-soft, #e4f6ec), #fff 70%); }
.cy-tips h2 svg { color: var(--ph, #1e9e64); }
.cy-tips ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.cy-tips li { position: relative; padding: 10px 12px 10px 30px; border-radius: 12px; background: #fff; border: 1px solid var(--cy-line); font-size: 13.5px; line-height: 1.45; color: #334155; }
.cy-tips li::before { content: ""; position: absolute; left: 12px; top: 16px; width: 8px; height: 8px; border-radius: 50%; background: var(--ph, #1e9e64); }
.cy-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; font-size: 11.5px; font-weight: 700; color: var(--cy-mut); }
.cy-legend span { display: inline-flex; align-items: center; gap: 5px; } .cy-legend i { width: 10px; height: 10px; border-radius: 50%; }
.cy-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; margin-top: 14px; align-items: start; }
.cy-scroll { scroll-margin-top: 80px; min-width: 0; }
.cy-log-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cy-log-h h2 { margin: 0; }
.cy-daynav { display: flex; gap: 6px; }
.cy-daynav button { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--cy-line); background: #fff; display: grid; place-items: center; cursor: pointer; color: #334155; }
.cy-daynav button:disabled { opacity: .35; cursor: default; }
.cy-flow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.cy-flow button { display: grid; justify-items: center; gap: 5px; padding: 9px 2px; border-radius: 12px; border: 1.5px solid var(--cy-line); background: #fff; font: inherit; font-size: 12px; font-weight: 700; color: #334155; cursor: pointer; }
.cy-flow i { width: 14px; height: 18px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #f1f5f3; border: 1.5px solid #cbd5d1; }
.cy-flow i.f1 { background: #fbd0dc; border-color: #f3a5bb; } .cy-flow i.f2 { background: #f58aa6; border-color: #f58aa6; } .cy-flow i.f3 { background: #e5476b; border-color: #e5476b; } .cy-flow i.f4 { background: #a3173f; border-color: #a3173f; }
.cy-flow button.on { border-color: #e5476b; background: #fff3f6; color: #9f1d43; }
.cy-moods { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.cy-moods button { display: grid; justify-items: center; gap: 2px; padding: 8px 2px; border-radius: 12px; border: 1.5px solid var(--cy-line); background: #fff; font: inherit; font-size: 11.5px; font-weight: 700; color: var(--cy-mut); cursor: pointer; }
.cy-moods span { font-size: 22px; line-height: 1.1; }
.cy-moods button.on { border-color: #1e9e64; background: #effaf3; color: #166534; }
.cy-log textarea { width: 100%; margin-top: 12px; border: 1.5px solid var(--cy-line); border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14px; resize: vertical; color: var(--cy-ink); }
.cy-cal-g { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; margin-top: 12px; }
.cy-cal-wd { text-align: center; font-size: 11px; font-weight: 800; color: var(--cy-mut); padding-bottom: 2px; }
.cy-d { position: relative; aspect-ratio: 1; border-radius: 12px; border: 1.5px solid transparent; background: var(--pc, #f6f8f7); font: inherit; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; display: grid; place-items: center; padding: 0; }
.cy-d em { position: absolute; bottom: 1px; right: 2px; font-style: normal; font-size: 10px; line-height: 1; }
.cy-d.per { background: #e5476b; color: #fff; } .cy-d.spot { background: #fbd0dc; color: #9f1d43; }
.cy-d.pred { background: #fff; border: 1.5px dashed #e5476b; color: #c0264f; }
.cy-d.ovu::after { content: ""; position: absolute; top: 4px; right: 5px; width: 6px; height: 6px; border-radius: 50%; background: #7c5ce0; }
.cy-d.today { box-shadow: 0 0 0 2px #0f172a inset; }
.cy-d.sel { outline: 2.5px solid #1e9e64; outline-offset: 1px; }
.cy-d.fut { cursor: default; background: #fff; color: #94a3b8; }
.cy-d.fut.pred { color: #c0264f; }
.cy-cal-key { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; font-size: 12px; font-weight: 700; color: var(--cy-mut); }
.cy-cal-key span { display: inline-flex; align-items: center; gap: 6px; }
.cy-cal-key i { width: 14px; height: 14px; border-radius: 5px; }
.k-per { background: #e5476b; } .k-pred { border: 1.5px dashed #e5476b; } .k-ovu { background: #7c5ce0; border-radius: 50% !important; width: 9px !important; height: 9px !important; }
.cy-pattern, .cy-support, .cy-set { margin-top: 14px; }
.cy-bars { display: grid; gap: 10px; }
.cy-bars > div { display: grid; grid-template-columns: 110px minmax(0, 1fr) 30px; gap: 10px; align-items: center; }
.cy-bar-l { font-size: 13px; font-weight: 700; color: #334155; }
.cy-bar { height: 14px; border-radius: 999px; background: #f1f5f3; overflow: hidden; }
.cy-bar i { display: block; height: 100%; border-radius: 999px; }
.cy-bars b { font-size: 18px; text-align: center; }
.cy-alert { margin-top: 14px; padding: 14px; border-radius: 16px; background: #fff3f6; border: 1px solid #f9cfdb; }
.cy-alert b { font-size: 15px; color: #9f1d43; } .cy-alert p { margin: 4px 0 12px; font-size: 13.5px; color: #475569; line-height: 1.5; }
.cy-support-h { display: flex; gap: 12px; align-items: flex-start; }
.cy-support-h > span { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; color: #fff; flex: none; background: linear-gradient(160deg, #f0668a, #d63a62); box-shadow: 0 6px 14px -6px rgba(214,58,98,.7); }
.cy-support-h h2 { margin: 0 0 2px; } .cy-support-h .cy-sub { margin: 0; }
.cy-sup-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 10px; margin-top: 14px; }
.cy-sup { display: flex; flex-direction: column; gap: 4px; padding: 14px; border-radius: 16px; background: #fff7f9; border: 1px solid #f9dbe3; color: var(--cy-ink) !important; text-decoration: none !important; transition: transform .15s ease; }
.cy-sup:hover { transform: translateY(-2px); }
.cy-sup > svg { font-size: 22px; color: #e5476b; }
.cy-sup b { font-size: 14.5px; } .cy-sup span { font-size: 12.5px; color: var(--cy-mut); line-height: 1.4; flex: 1; }
.cy-sup i { display: inline-flex; align-items: center; gap: 3px; font-style: normal; font-size: 12.5px; font-weight: 800; color: #c0264f; margin-top: 6px; }
.cy-sup i svg { font-size: 15px; }
.cy-set { padding: 6px 18px; }
.cy-set-t { width: 100%; display: flex; align-items: center; gap: 8px; padding: 12px 0; border: 0; background: none; font: inherit; font-size: 15px; font-weight: 800; color: var(--cy-ink); cursor: pointer; }
.cy-set-t svg:first-child { color: #64748b; }
.cy-set-t svg:last-child { margin-left: auto; transition: transform .2s; } .cy-set-t svg.up { transform: rotate(90deg); }
.cy-set-b { padding: 0 0 16px; }
.cy-set-b .cy-two { margin-top: 0; }
.cy-danger { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 12px 14px; border-radius: 14px; background: #fafbfa; border: 1px solid var(--cy-line); }
.cy-danger b { display: flex; align-items: center; gap: 6px; font-size: 13.5px; } .cy-danger b svg { font-size: 17px; color: #1e9e64; }
.cy-danger span { display: block; font-size: 12.5px; color: var(--cy-mut); }
.cy-danger button { flex: none; height: 38px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #fecaca; background: #fff; color: #b91c1c; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.cy-disc { margin: 14px 2px 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }
.cy-disc a { color: #64748b; font-weight: 700; }

@media (max-width: 1023px) {
  .cy-top, .cy-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 699px) {
  .cy-hero { padding: 18px; flex-direction: column; gap: 10px; }
  .cy-opts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cy-steps span { font-size: 0; justify-content: center; } .cy-steps span i { font-size: 12px; }
  .cy-steps span.on { font-size: 12.5px; }
  .cy-why { grid-template-columns: minmax(0, 1fr); }
  .cy-two { grid-template-columns: minmax(0, 1fr); }
  .cy-ringcard { flex-direction: column; text-align: center; }
  .cy-ring { width: 170px; height: 170px; }
  .cy-facts span { padding: 8px 6px; } .cy-facts b { font-size: 14px; }
  .cy-card { padding: 14px; border-radius: 18px; }
  .cy-bars > div { grid-template-columns: 86px minmax(0, 1fr) 26px; }
  .cy-danger { flex-direction: column; align-items: stretch; }
  .cy-acts .cy-btn { flex: 1 1 auto; }
}
`;
