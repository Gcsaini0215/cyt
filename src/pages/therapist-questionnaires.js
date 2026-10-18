import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../components/therapists/main-layout";
import { PT_CSS } from "../components/therapists/portal-ui";
import AssessmentsAddon from "../components/therapists/assessments-addon";
import { fetchById } from "../utils/actions";
import { apiUrl } from "../utils/url";

/* Clinical assessments clients booked with their sessions. The client answers before the session,
   CYT scores it and builds the report; the therapist reads it, adds a note and releases it.
   The add-on (plan + verification details) opens from the corner button, which shows the time left
   while it's active. */

const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—");
const STATUS = { sent: ["Waiting for client", "wait"], done: ["To review", "todo"], released: ["Released", "ok"] };
const FILTERS = [["all", "All"], ["done", "To review"], ["sent", "Waiting"], ["released", "Released"]];
const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const shortName = (n) => (String(n || "").match(/\(([^)]+)\)\s*$/) || [])[1] || n;
const longName = (n) => String(n || "").replace(/\s*\([^)]+\)\s*$/, "");
const tone = (level) => {
  const l = String(level || "").toLowerCase();
  if (/extreme|severe|high|probable|positive|likely/.test(l)) return "bad";
  if (/moderate/.test(l)) return "mod";
  if (/mild|borderline/.test(l)) return "mild";
  return "ok";
};

export default function TherapistAssessments() {
  const [rows, setRows] = useState(null);
  const [addon, setAddon] = useState(null);
  const [err, setErr] = useState("");
  const [showAddon, setShowAddon] = useState(false); // add-on panel, opened from the corner button
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try { if (new URLSearchParams(window.location.search).get("buy")) setShowAddon(true); } catch (e) { /* ignore */ }
    fetchById(`${apiUrl}/assessment-requests/therapist`)
      .then((r) => setRows(r?.data || []))
      .catch(() => { setRows([]); setErr("Couldn't load — please refresh"); });
  }, []);

  const a = addon?.assessments;
  const counts = useMemo(() => {
    const c = { all: rows?.length || 0, sent: 0, done: 0, released: 0 };
    (rows || []).forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [rows]);
  const shown = (rows || []).filter((r) => filter === "all" || r.status === filter);
  // corner button: time left while active, otherwise "Upgrade" (or where they are in the buying steps)
  const daysLeft = a?.active && a.till ? Math.max(0, Math.ceil((new Date(a.till) - Date.now()) / 864e5)) : 0;
  const left = daysLeft > 60 ? `${Math.round(daysLeft / 30)} months left` : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  const pending = !a || a.active ? "" : ({ rejected: "Action needed", review: "In review", consent: "Sign consent", payment: "Pay to activate" })[a.step] || "";

  return (
    <MainLayout>
      <Head><title>Assessments | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + TA_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Clinical assessments</h1>
            <p>Clients add a standard assessment (PHQ-9, GAD-7, DASS-21…) when they book you, answer it before the session, and you get an automatic report to review and release.</p>
          </div>
          {a && (a.active ? (
            <button type="button" className={`ta-plan on${daysLeft <= 15 ? " soon" : ""}`} onClick={() => setShowAddon((v) => !v)} aria-expanded={showAddon}>
              {/* ring = share of the term still left */}
              <span className="ta-ring" style={{ "--p": `${Math.min(100, Math.round((daysLeft / ((a.termMonths || 6) * 30)) * 100))}%` }} aria-hidden="true">
                <span><b>{daysLeft}</b><small>days</small></span>
              </span>
              <span className="ta-plan-txt">
                <b>Add-on active</b>
                <small>{daysLeft <= 15 ? `${left} · renew soon` : `till ${new Date(a.till).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}</small>
              </span>
              <span className="ta-plan-go" aria-hidden="true">{showAddon ? "Close" : "Manage"} ›</span>
            </button>
          ) : (
            <button type="button" className="ta-plan up" onClick={() => setShowAddon((v) => !v)} aria-expanded={showAddon}>
              <span className="ta-plan-shine" aria-hidden="true" />
              <span className="ta-plan-ic" aria-hidden="true">✦</span>
              <span className="ta-plan-txt">
                <b>Upgrade</b>
                <small>{pending || (a.price != null ? `₹${Number(a.price).toLocaleString("en-IN")} · ${a.termMonths || 6} months` : "Clinical Assessments add-on")}</small>
              </span>
              <span className="ta-plan-go" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
        {err && <p className="ta-msg err">{err}</p>}

        {/* add-on plan + verification details: kept mounted so the corner button knows the plan; ?buy=1 opens it */}
        <div className="ta-addon" hidden={!showAddon}>
          <button type="button" className="ta-addon-x" onClick={() => setShowAddon(false)} aria-label="Close">×</button>
          <AssessmentsAddon onChange={setAddon} />
        </div>

        <h2 className="ta-h">Client reports{counts.done > 0 ? <i className="hot">{counts.done} to review</i> : counts.all > 0 ? <i>{counts.all}</i> : null}</h2>
        {(

          <div className="pt-card">
            {rows === null ? <div className="pt-skel" /> : rows.length ? (
              <>
                <div className="ta-filters">
                  {FILTERS.map(([k, l]) => (
                    <button key={k} type="button" className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l} <span>{counts[k] || 0}</span></button>
                  ))}
                </div>
                {shown.length ? (
                  <div className="ta-list">
                    {shown.map((r) => {
                      const [label, st] = STATUS[r.status] || ["", "wait"];
                      const scored = r.status !== "sent" && r.score != null;
                      const t = tone(r.level);
                      return (
                        <div key={r._id} className={`ta-row st-${st}`}>
                          <span className="ta-av" aria-hidden="true">{initials(r.client)}</span>
                          <div className="ta-main">
                            <div className="ta-line1">
                              <b>{r.client}</b>
                              <span className={`ta-st ${st}`}>{label}</span>
                            </div>
                            <div className="ta-line2"><span className="ta-tool">{shortName(r.name)}</span>{longName(r.name) !== shortName(r.name) && <span className="ta-long">{longName(r.name)}</span>}</div>
                            <div className="ta-line3">Session {when(r.booking_date)}</div>
                          </div>
                          <div className="ta-score">
                            {scored ? (
                              <>
                                <div className="ta-num"><b>{r.score}</b><span>/{r.max}</span></div>
                                <span className={`ta-lvl ${t}`}>{r.level}</span>
                                <span className="ta-bar"><span className={t} style={{ width: `${Math.min(100, Math.round((r.score / (r.max || 1)) * 100))}%` }} /></span>
                              </>
                            ) : r.status !== "sent" && r.level ? <span className={`ta-lvl ${t}`}>{r.level}</span>
                              : <span className="ta-wait">Not answered yet</span>}
                          </div>
                          <div className="ta-act">
                            {r.flag && <span className="ta-flag" title="The client said they had thoughts of self-harm or of being better off dead (e.g. PHQ-9 question 9 answered above 'Not at all'). Check on their safety before or at the start of the session.">⚠ Reported self-harm thoughts</span>}
                            {r.status === "sent" ? <span className="ta-hint">You&apos;ll be notified when they answer.</span>
                              : <Link href={`/assessment-report/${r._id}`} className={`ta-btn${r.status === "done" ? " pri" : ""}`}>{r.status === "released" ? "Open report" : "Review & release"}</Link>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="pt-empty">Nothing here.</div>}
              </>
            ) : (
              <div className="pt-empty">
                No assessments yet. When a client adds one to a booking with you, it shows up here.
                {a && !a.active && <><br /><button type="button" className="ta-link" onClick={() => { setShowAddon(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Get the add-on →</button></>}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const TA_CSS = `
.ta-msg.err { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #b91c1c; }
/* corner button: "Upgrade" (gold) or "Add-on active · N months left" */
.ta-plan { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; gap: 12px; min-height: 58px; padding: 8px 14px 8px 10px;
  border-radius: 16px; cursor: pointer; font: inherit; text-align: left; flex-shrink: 0; transition: transform .15s, box-shadow .15s, filter .15s; }
.ta-plan:hover { transform: translateY(-1px); }
.ta-plan:focus-visible { outline: 2px solid #16a34a; outline-offset: 2px; }
.ta-plan-txt b { display: block; font-size: 14.5px; font-weight: 800; line-height: 1.2; }
.ta-plan-txt small { display: block; font-size: 12px; font-weight: 700; margin-top: 2px; white-space: nowrap; }
.ta-plan-go { margin-left: auto; padding-left: 4px; font-size: 12.5px; font-weight: 800; white-space: nowrap; }
/* not upgraded: gold, with a light sweep */
.ta-plan.up { border: 0; color: #fff; background: linear-gradient(135deg, #7a5410 0%, #b8891f 45%, #e2b54a 100%);
  box-shadow: 0 10px 22px -10px rgba(176,134,30,.85), inset 0 1px 0 rgba(255,255,255,.35); }
.ta-plan.up:hover { box-shadow: 0 14px 26px -10px rgba(176,134,30,.95), inset 0 1px 0 rgba(255,255,255,.35); filter: brightness(1.05); }
.ta-plan.up .ta-plan-txt small { color: #fdf0c9; }
.ta-plan-ic { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: 17px; color: #a37a16; background: #fffaf0; box-shadow: 0 2px 6px rgba(120,80,0,.3); flex-shrink: 0; }
.ta-plan.up .ta-plan-go { font-size: 18px; transition: transform .15s; } .ta-plan.up:hover .ta-plan-go { transform: translateX(3px); }
.ta-plan-shine { position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%);
  background-size: 250% 100%; background-position: 150% 0; animation: taShine 4s ease-in-out 1s infinite; }
@keyframes taShine { 0% { background-position: 150% 0; } 45%, 100% { background-position: -60% 0; } }
/* upgraded: mint card with a ring of the time left */
.ta-plan.on { border: 1px solid #e3d29c; color: #14532d; background: linear-gradient(150deg, #f2faf3, #fbf6e3); box-shadow: 0 6px 16px -10px rgba(22,101,52,.35); }
.ta-plan.on:hover { box-shadow: 0 10px 20px -10px rgba(22,101,52,.45); }
.ta-plan.on .ta-plan-txt small { color: #15803d; }
.ta-plan.on .ta-plan-go { color: #166534; background: #fff; border: 1px solid #c5e8d2; border-radius: 999px; padding: 3px 10px; }
.ta-ring { --p: 50%; width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center;
  background: conic-gradient(#16a34a var(--p), #dfeee5 0); }
.ta-ring > span { width: 34px; height: 34px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
.ta-ring b { font-size: 12.5px; font-weight: 900; color: #14532d; }
.ta-ring small { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 1px; }
.ta-plan.soon { border-color: #fcd34d; background: linear-gradient(150deg, #fffbeb, #fef3c7); }
.ta-plan.soon .ta-ring { background: conic-gradient(#d97706 var(--p), #fde9c4 0); }
.ta-plan.soon .ta-plan-txt small { color: #b45309; }
@media (prefers-reduced-motion: reduce) { .ta-plan-shine { animation: none; } .ta-plan:hover { transform: none; } }
.ta-addon { position: relative; margin-bottom: 14px; }
.ta-addon-x { position: absolute; top: 10px; right: 10px; z-index: 2; width: 34px; height: 34px; border-radius: 50%; border: 0; background: #eef2f0; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.ta-h { display: flex; align-items: center; gap: 8px; font-family: inherit; font-size: 17px; font-weight: 800; color: #0f172a; margin: 4px 0 10px; }
.ta-h i { font-style: normal; font-size: 11.5px; font-weight: 800; background: #eef2f0; color: #334155; border-radius: 999px; padding: 2px 9px; }
.ta-h i.hot { background: #14532d; color: #fff; }
.ta-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.ta-filters button { border: 1px solid #dfe7e2; background: #fff; border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; }
.ta-filters button span { color: #94a3b8; margin-left: 2px; }
.ta-filters button.on { background: #14532d; border-color: #14532d; color: #fff; } .ta-filters button.on span { color: #bbf7d0; }
.ta-list { display: flex; flex-direction: column; gap: 10px; }
.ta-row { display: grid; grid-template-columns: auto 1fr 170px 220px; gap: 14px; align-items: center; border: 1px solid #e3eae6; border-left: 4px solid #cbd5e1; border-radius: 14px; padding: 14px 16px; background: #fff; }
.ta-row.st-todo { border-left-color: #d97706; } .ta-row.st-ok { border-left-color: #16a34a; }
.ta-av { width: 42px; height: 42px; border-radius: 50%; background: #e7f3ec; color: #14532d; display: grid; place-items: center; font-weight: 800; font-size: 14px; }
.ta-main { min-width: 0; }
.ta-line1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; } .ta-line1 b { font-size: 15px; color: #0f172a; }
.ta-st { font-size: 11px; font-weight: 800; border-radius: 999px; padding: 2px 9px; text-transform: uppercase; letter-spacing: .3px; }
.ta-st.ok { background: #dcfce7; color: #166534; } .ta-st.todo { background: #fef3c7; color: #92400e; } .ta-st.wait { background: #f1f5f9; color: #475569; }
.ta-line2 { display: flex; align-items: baseline; gap: 6px; margin-top: 4px; min-width: 0; }
.ta-tool { flex: none; font-size: 12px; font-weight: 800; color: #1e3a8a; background: #eff6ff; border-radius: 6px; padding: 1px 7px; }
.ta-long { font-size: 13px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-line3 { font-size: 12.5px; color: #64748b; margin-top: 3px; }
.ta-score { display: flex; flex-direction: column; gap: 4px; }
.ta-num b { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1; } .ta-num span { font-size: 13px; color: #64748b; font-weight: 700; }
.ta-lvl { align-self: flex-start; font-size: 12px; font-weight: 800; border-radius: 6px; padding: 1px 7px; }
.ta-lvl.ok { background: #dcfce7; color: #166534; } .ta-lvl.mild { background: #fef9c3; color: #854d0e; } .ta-lvl.mod { background: #ffedd5; color: #9a3412; } .ta-lvl.bad { background: #fee2e2; color: #991b1b; }
.ta-bar { display: block; height: 5px; border-radius: 99px; background: #eef2f0; overflow: hidden; }
.ta-bar span { display: block; height: 100%; border-radius: 99px; }
.ta-bar .ok { background: #16a34a; } .ta-bar .mild { background: #ca8a04; } .ta-bar .mod { background: #ea580c; } .ta-bar .bad { background: #dc2626; }
.ta-wait { font-size: 12.5px; color: #94a3b8; font-weight: 600; }
.ta-act { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; text-align: right; }
.ta-flag { white-space: nowrap; font-size: 11.5px; font-weight: 800; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 2px 7px; }
.ta-btn { display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 16px; border-radius: 10px; border: 1.5px solid #14532d; color: #14532d !important; background: #fff; font-weight: 800; font-size: 13.5px; text-decoration: none !important; white-space: nowrap; }
.ta-btn.pri { background: #14532d; color: #fff !important; }
.ta-hint { font-size: 12.5px; color: #64748b; }
.ta-link { border: 0; background: none; padding: 0; margin-top: 8px; font: inherit; font-weight: 800; color: #1d4ed8; cursor: pointer; }
@media (max-width: 600px) {
  .ta-plan { width: 100%; justify-content: flex-start; }
}
@media (max-width: 900px) {
  .ta-row { grid-template-columns: auto 1fr; row-gap: 10px; }
  .ta-score { grid-column: 1 / -1; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 8px; }
  .ta-score .ta-bar { flex: 1 1 100%; }
  .ta-act { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; text-align: left; }
  .ta-act .ta-btn { margin-left: auto; }
}
`;
