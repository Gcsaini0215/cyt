import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ClientShell from "../../components/client/client-shell";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { usePager, Pager } from "../../components/therapists/pager";
import { FREE_TESTS } from "../../components/self-assessment/tests";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

/* The client's self-check history (from /self-assessment): latest result per check with its trend,
   and every past result. Only scores and bands are stored — never the answers. */

// every free check, plus the retired sleep check so old results still show
const TESTS = [
  ...FREE_TESTS.map(({ key, name, full, short, max, better }) => ({ key, name, full: full.includes(short) ? full : `${full} (${short})`, max, better })),
  { key: "sleep", name: "Sleep (old check)", full: "Sleep Check (retired)", max: 28, better: "low", retired: true },
];
const TEST = Object.fromEntries(TESTS.map((t) => [t.key, t]));
// tests with several scores: [key, label, max]
const DIMS = {
  bigfive: [["openness", "Openness", 100], ["conscientiousness", "Conscientiousness", 100], ["extraversion", "Extraversion", 100], ["agreeableness", "Agreeableness", 100], ["neuroticism", "Emotional sensitivity", 100]],
  dass21: [["depression", "Depression", 42], ["anxiety", "Anxiety", 42], ["stress", "Stress", 42]],
  cbi: [["personal", "Personal burnout", 100], ["work", "Work-related burnout", 100]],
};

// band colour from the saved level text
const toneOf = (level = "") => {
  const l = level.toLowerCase();
  if (/profile|high self-esteem/.test(l)) return "blue";
  if (/low distress|low risk|no burnout|normal|below/.test(l)) return "green";
  if (/severe|probable|dependence|very high|high burnout|^high$/.test(l)) return "red";
  if (/moderate|medium|harmful|consistent with|possible depression|low self-esteem|high distress|some symptoms/.test(l)) return "orange";
  if (/mild|risky|some sleep|^low$/.test(l)) return "yellow";
  return "green";
};
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const startHref = (key) => `/self-assessment?start=${key}`;

function Spark({ rows, max }) {
  const pts = rows.slice(0, 8).reverse(); // oldest → newest
  if (pts.length < 2) return null;
  const w = 120, h = 34;
  const xy = pts.map((r, i) => [Math.round((i / (pts.length - 1)) * (w - 6)) + 3, Math.round(h - 3 - (r.score / max) * (h - 6))]);
  return (
    <svg className="ci-spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === xy.length - 1 ? 3.5 : 2.2} fill={i === xy.length - 1 ? "#166534" : "#86c79e"} />)}
    </svg>
  );
}

function Trend({ now, before, better }) {
  if (before == null) return <span className="ci-trend flat">First check-in</span>;
  const d = now - before;
  if (d === 0) return <span className="ci-trend flat"><TrendingFlatRoundedIcon /> Same as last time</span>;
  // most checks: lower = fewer symptoms = better; self-esteem: higher = better
  const good = better === "high" ? d > 0 : d < 0;
  return d < 0
    ? <span className={`ci-trend ${good ? "good" : "bad"}`}><TrendingDownRoundedIcon /> {Math.abs(d)} lower than last time</span>
    : <span className={`ci-trend ${good ? "good" : "bad"}`}><TrendingUpRoundedIcon /> {d} higher than last time</span>;
}

function Bars({ test, dims }) {
  return (
    <div className="ci-bars">
      {(DIMS[test] || []).map(([k, label, max]) => (
        <div key={k} className="ci-bar"><span>{label}</span><i><em style={{ width: `${Math.round(((dims?.[k] ?? 0) / max) * 100)}%` }} /></i><b>{dims?.[k] ?? "–"}</b></div>
      ))}
    </div>
  );
}

export default function CheckIns() {
  const [rows, setRows] = useState(null); // null = loading
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchById(`${apiUrl}/assessments`)
      .then((r) => setRows(Array.isArray(r?.data) ? r.data : []))
      .catch(() => { setRows([]); setErr("Couldn't load your check-ins — please refresh"); });
  }, []);

  const byTest = useMemo(() => {
    const m = {};
    (rows || []).forEach((r) => { (m[r.test] = m[r.test] || []).push(r); });
    return m;
  }, [rows]);
  const taken = TESTS.filter((t) => byTest[t.key]);
  const notYet = TESTS.filter((t) => !byTest[t.key] && !t.retired);
  const shown = useMemo(() => (rows || []).filter((r) => filter === "all" || r.test === filter), [rows, filter]);
  const pg = usePager(shown, 8, filter);
  const flagged = byTest.phq9?.[0]?.flag || byTest.epds?.[0]?.flag;

  return (
    <ClientShell title="My check-ins">
      <style dangerouslySetInnerHTML={{ __html: CI_CSS }} />
      <div className="ci">
        <div className="ci-head">
          <div>
            <h1>My check-ins</h1>
            <p className="ci-sub"><LockRoundedIcon /> Private to you. Only your score is saved — never your answers.</p>
          </div>
          <Link href="/self-assessment" className="ci-btn primary"><PsychologyAltRoundedIcon /> Take a self-check</Link>
        </div>

        {err && <p className="ci-err" role="alert">{err}</p>}

        {flagged && (
          <div className="ci-care" role="note">
            <b>You mentioned thoughts of being better off dead or hurting yourself in a recent check-in.</b>
            <span>You don&apos;t have to carry that alone. Talk to someone now: Tele-MANAS <a href="tel:14416">14416</a> (free, 24×7), or book a session with a psychologist.</span>
            <Link href="/client/find" className="ci-btn ghost">Find a psychologist</Link>
          </div>
        )}

        {rows === null ? (
          <div className="ci-grid">{[0, 1, 2].map((i) => <div key={i} className="ci-skel" />)}</div>
        ) : rows.length === 0 ? (
          <div className="ci-empty">
            <PsychologyAltRoundedIcon />
            <b>No check-ins yet</b>
            <p>A self-check takes 2–10 minutes. Do one now and again every couple of weeks — you&apos;ll see here how you&apos;re doing over time.</p>
            <div className="ci-try">
              {TESTS.filter((t) => !t.retired).map((t) => <Link key={t.key} href={startHref(t.key)}>{t.name}</Link>)}
            </div>
          </div>
        ) : (
          <>
            <div className="ci-grid">
              {taken.map((t) => {
                const list = byTest[t.key];
                const last = list[0];
                return (
                  <div key={t.key} className="ci-card">
                    <div className="ci-card-top">
                      <div><span className="ci-name">{t.name}</span><b>{t.full}</b></div>
                      <span className={`ci-chip ${toneOf(last.level)}`}>{last.level}</span>
                    </div>
                    {t.max ? (
                      <>
                        <div className="ci-score">
                          <span><b>{last.score}</b>/{t.max}</span>
                          <Spark rows={list} max={t.max} />
                        </div>
                        <Trend now={last.score} before={list[1]?.score} better={t.better} />
                      </>
                    ) : <Bars test={t.key} dims={last.dims} />}
                    <div className="ci-card-foot">
                      <span>Last: {fmt(last.createdAt)} · {list.length} time{list.length > 1 ? "s" : ""}</span>
                      {!t.retired && <Link href={startHref(t.key)} className="ci-btn ghost sm"><ReplayRoundedIcon /> Take again</Link>}
                    </div>
                  </div>
                );
              })}
            </div>

            {notYet.length > 0 && (
              <div className="ci-more">
                <span>Also try:</span>
                {notYet.map((t) => <Link key={t.key} href={startHref(t.key)}>{t.name}</Link>)}
              </div>
            )}

            <h2 className="ci-h2">All check-ins</h2>
            <div className="ci-filters" role="tablist">
              {[{ key: "all", name: "All" }, ...taken].map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={filter === t.key} className={filter === t.key ? "on" : ""} onClick={() => setFilter(t.key)}>
                  {t.name}{t.key !== "all" && <em>{byTest[t.key].length}</em>}
                </button>
              ))}
            </div>
            <div data-pager-scope>
              <div className="ci-list">
                {pg.items.map((r) => (
                  <div key={r._id} className="ci-row">
                    <span className="ci-date">{fmt(r.createdAt)}</span>
                    <span className="ci-what">{TEST[r.test]?.full || r.title}</span>
                    {r.max ? <span className="ci-val"><b>{r.score}</b>/{r.max}</span> : <span className="ci-val">—</span>}
                    <span className={`ci-chip ${toneOf(r.level)}`}>{r.level}</span>
                  </div>
                ))}
              </div>
              <Pager pg={pg} noun="check-ins" />
            </div>

            <p className="ci-note">
              Self-checks are screening tools, not a diagnosis. Scores going up for two check-ins in a row, or a &ldquo;Moderate&rdquo; result or higher, is a good reason to
              {" "}<Link href="/client/find">talk to a psychologist</Link> — you can show them this page.
            </p>
          </>
        )}
      </div>
    </ClientShell>
  );
}

const CI_CSS = `
.ci h1 { font-size: clamp(21px, 2.4vw, 26px); font-weight: 800; margin: 0; letter-spacing: -.3px; color: #0f172a; font-family: inherit; }
.ci-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.ci-sub { margin: 4px 0 0; font-size: 13.5px; color: #64748b; display: flex; align-items: center; gap: 5px; }
.ci-sub svg { font-size: 15px; color: #166534; }
.ci-err { color: #dc2626; font-weight: 600; font-size: 13.5px; }
.ci-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 11px; font-size: 13.5px; font-weight: 800; text-decoration: none !important; border: 1px solid transparent; white-space: nowrap; }
.ci-btn svg { font-size: 18px; }
.ci-btn.primary { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; }
.ci-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.ci-btn.sm { height: 34px; padding: 0 11px; font-size: 12.5px; }
.ci-care { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.ci-care b { font-size: 14px; color: #9a3412; } .ci-care > span { font-size: 13.5px; color: #7c2d12; line-height: 1.55; }
.ci-care a[href^="tel"] { color: #c2410c !important; font-weight: 800; }
.ci-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; }
.ci-skel { height: 190px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: cisk 1.3s infinite linear; }
@keyframes cisk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.ci-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ci-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ci-card-top > div { min-width: 0; }
.ci-name { display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; color: #16a34a; }
.ci-card-top b { display: block; font-size: 14.5px; color: #0f172a; line-height: 1.3; margin-top: 2px; }
.ci-chip { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 800; white-space: nowrap; flex-shrink: 0; }
.ci-chip.green { background: #dcfce7; color: #166534; } .ci-chip.yellow { background: #fef9c3; color: #854d0e; }
.ci-chip.orange { background: #ffedd5; color: #c2410c; } .ci-chip.red { background: #fee2e2; color: #b91c1c; } .ci-chip.blue { background: #e0f2fe; color: #0369a1; }
.ci-score { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.ci-score > span { font-size: 14px; color: #64748b; } .ci-score > span b { font-size: 30px; color: #0f172a; line-height: 1; }
.ci-spark { flex-shrink: 0; }
.ci-trend { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; font-weight: 700; }
.ci-trend svg { font-size: 17px; }
.ci-trend.good { color: #15803d; } .ci-trend.bad { color: #c2410c; } .ci-trend.flat { color: #64748b; }
.ci-bars { display: flex; flex-direction: column; gap: 6px; }
.ci-bar { display: grid; grid-template-columns: 128px 1fr 28px; align-items: center; gap: 8px; font-size: 12.5px; color: #475569; }
.ci-bar i { height: 8px; border-radius: 8px; background: #eef2f0; overflow: hidden; display: block; }
.ci-bar em { display: block; height: 100%; border-radius: 8px; background: linear-gradient(90deg, #86c79e, #16a34a); }
.ci-bar b { text-align: right; color: #0f172a; font-size: 12.5px; }
.ci-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f0; }
.ci-card-foot > span { font-size: 12px; color: #64748b; }
.ci-more { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; font-size: 13px; color: #64748b; }
.ci-more a, .ci-try a { padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid #cfe3d6; color: #166534 !important; font-weight: 700; font-size: 12.5px; text-decoration: none !important; }
.ci-h2 { margin: 26px 0 10px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.ci-filters { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 10px; scrollbar-width: none; }
.ci-filters::-webkit-scrollbar { display: none; }
.ci-filters button { flex-shrink: 0; height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid #dfe7e2; background: #fff; color: #475569; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; }
.ci-filters button em { font-style: normal; font-size: 11px; background: #eef2f0; border-radius: 999px; padding: 1px 7px; }
.ci-filters button.on { background: #166534; border-color: #166534; color: #fff; } .ci-filters button.on em { background: rgba(255,255,255,.2); }
.ci-list { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; overflow: hidden; }
.ci-row { display: grid; grid-template-columns: 120px minmax(0, 1fr) 64px 180px; align-items: center; gap: 10px; padding: 12px 16px; border-top: 1px solid #eef2f0; font-size: 13.5px; }
.ci-row:first-child { border-top: 0; }
.ci-date { color: #64748b; font-size: 12.5px; } .ci-what { color: #0f172a; font-weight: 700; min-width: 0; }
.ci-val { color: #64748b; font-size: 12.5px; text-align: right; } .ci-row > .ci-chip { justify-self: end; } .ci-val b { color: #0f172a; font-size: 15px; }
.ci-note { margin: 16px 0 0; font-size: 12.5px; color: #64748b; line-height: 1.6; }
.ci-note a { color: #166534 !important; font-weight: 800; }
.ci-empty { background: #fff; border: 1px dashed #cfe3d6; border-radius: 16px; padding: 34px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ci-empty > svg { font-size: 40px; color: #86c79e; }
.ci-empty b { font-size: 16px; } .ci-empty p { margin: 0 0 8px; font-size: 13.5px; color: #64748b; max-width: 460px; line-height: 1.55; }
.ci-try { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
@media (max-width: 767px) {
  .ci-head .ci-btn.primary { width: 100%; }
  .ci-row { grid-template-columns: 1fr auto; grid-template-areas: "what chip" "date val"; row-gap: 3px; padding: 11px 14px; }
  .ci-what { grid-area: what; } .ci-chip { justify-self: end; } .ci-row .ci-chip { grid-area: chip; }
  .ci-date { grid-area: date; } .ci-val { grid-area: val; justify-self: end; }
  .ci-bar { grid-template-columns: 112px 1fr 26px; }
}
`;
