import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../components/therapists/main-layout";
import { PT_CSS } from "../components/therapists/portal-ui";
import AssessmentsAddon from "../components/therapists/assessments-addon";
import { fetchById } from "../utils/actions";
import { apiUrl } from "../utils/url";

/* Clinical assessments clients booked with their sessions. The client answers before the session,
   CYT scores it and builds the report; the therapist reads it, adds a note and releases it. */

const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—");
const STATUS = { sent: ["Waiting for client", "warn"], done: ["Report ready · not released", "warn"], released: ["Released to client", "ok"] };

export default function TherapistAssessments() {
  const [rows, setRows] = useState(null);
  const [addon, setAddon] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchById(`${apiUrl}/assessment-requests/therapist`)
      .then((r) => setRows(r?.data || []))
      .catch(() => { setRows([]); setErr("Couldn't load — please refresh"); });
  }, []);

  const share = Math.round((addon?.therapistShare ?? 0.3) * 100);

  return (
    <MainLayout>
      <Head><title>Assessments | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + TA_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Clinical assessments</h1>
            <p>Clients add a standard assessment (PHQ-9, GAD-7, DASS-21…) when they book you, answer it before the session, and you get an automatic report. You earn {share}% of each assessment fee.</p>
          </div>
        </div>
        {err && <p className="ta-msg err">{err}</p>}

        <AssessmentsAddon onChange={setAddon} />

        <div className="pt-card">
          <div className="pt-card-h"><h2>From your clients</h2>{rows?.length > 0 && <span className="pt-chip mut">{rows.length}</span>}</div>
          {rows === null ? <div className="pt-skel" /> : rows.length ? (
            <div className="ta-list">
              {rows.map((r) => {
                const [label, tone] = STATUS[r.status] || ["", "mut"];
                return (
                  <div key={r._id} className="ta-row">
                    <div className="ta-top">
                      <div className="ta-who"><b>{r.client}</b><span>{r.name} · session {when(r.booking_date)}</span></div>
                      <span className={`pt-chip ${tone}`}>{label}</span>
                    </div>
                    {r.status !== "sent" && (
                      <p className="ta-res">{r.flag && <em>⚠ Self-harm item · </em>}{r.level}{r.score != null ? ` · ${r.score}/${r.max}` : ""}</p>
                    )}
                    <div className="ta-acts">
                      {r.status === "sent" ? <span className="ta-hint">You&apos;ll be notified when they&apos;ve answered it.</span>
                        : <Link href={`/assessment-report/${r._id}`} className="pt-btn primary">{r.status === "released" ? "Open report" : "Open report & release"}</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="pt-empty">No assessments yet. When a client adds one to a booking with you, it shows up here.</div>}
        </div>
      </div>
    </MainLayout>
  );
}

const TA_CSS = `
.ta-msg.err { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #b91c1c; }
.ta-up { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: linear-gradient(135deg, #f0fdf4, #fffbeb); }
.ta-up b { display: block; font-size: 15px; color: #14532d; } .ta-up span { display: block; font-size: 13.5px; color: #475569; margin-top: 2px; }
.ta-ok { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #166534; }
.ta-list { display: flex; flex-direction: column; gap: 10px; }
.ta-row { border: 1px solid #e3eae6; border-radius: 14px; padding: 12px 14px; }
.ta-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ta-who b { display: block; font-size: 14.5px; color: #0f172a; } .ta-who span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; }
.ta-res { margin: 8px 0 0; font-size: 14px; font-weight: 700; color: #0f172a; } .ta-res em { font-style: normal; color: #b91c1c; }
.ta-acts { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
.ta-hint { font-size: 12.5px; color: #64748b; }
`;
