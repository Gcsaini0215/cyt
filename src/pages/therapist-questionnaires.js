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
   Two tabs: the client reports, and the add-on (plan + verification details). */

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
  const [tab, setTab] = useState("reports");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try { if (new URLSearchParams(window.location.search).get("buy")) setTab("addon"); } catch (e) { /* ignore */ }
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
  const addonTag = !a ? "" : !a.active ? "Upgrade" : a.verified ? "" : "Pending";

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
        </div>

        <div className="ta-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "reports"} className={tab === "reports" ? "on" : ""} onClick={() => setTab("reports")}>
            Client reports{counts.done > 0 ? <i className="hot">{counts.done}</i> : counts.all > 0 ? <i>{counts.all}</i> : null}
          </button>
          <button type="button" role="tab" aria-selected={tab === "addon"} className={tab === "addon" ? "on" : ""} onClick={() => setTab("addon")}>
            Add-on &amp; details{addonTag && <i className={addonTag === "Upgrade" ? "up" : "pend"}>{addonTag}</i>}
          </button>
        </div>
        {err && <p className="ta-msg err">{err}</p>}

        {/* kept mounted so the plan loads (tab tag); ?buy=1 opens this tab */}
        <div hidden={tab !== "addon"}><AssessmentsAddon onChange={setAddon} /></div>

        {tab === "reports" && (
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
                {a && !a.active && <><br /><button type="button" className="ta-link" onClick={() => setTab("addon")}>Get the add-on →</button></>}
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
.ta-tabs { display: flex; gap: 4px; margin: 0 0 14px; border-bottom: 1px solid #e3eae6; overflow-x: auto; }
.ta-tabs button { flex: none; display: inline-flex; align-items: center; gap: 7px; border: 0; background: none; padding: 10px 14px; font: inherit; font-size: 14.5px; font-weight: 700; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -1px; }
.ta-tabs button.on { color: #14532d; border-bottom-color: #14532d; }
.ta-tabs i { font-style: normal; font-size: 11.5px; font-weight: 800; background: #eef2f0; color: #334155; border-radius: 999px; padding: 1px 8px; }
.ta-tabs i.hot { background: #14532d; color: #fff; } .ta-tabs i.up { background: #fde68a; color: #92400e; } .ta-tabs i.pend { background: #fef3c7; color: #92400e; }
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
@media (max-width: 480px) {
  .ta-tabs { gap: 0; } .ta-tabs button { padding: 10px 10px; font-size: 13.5px; gap: 5px; }
}
@media (max-width: 900px) {
  .ta-row { grid-template-columns: auto 1fr; row-gap: 10px; }
  .ta-score { grid-column: 1 / -1; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 8px; }
  .ta-score .ta-bar { flex: 1 1 100%; }
  .ta-act { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; text-align: left; }
  .ta-act .ta-btn { margin-left: auto; }
}
`;
