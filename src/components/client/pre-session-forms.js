import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* Clinical assessments booked with a session: answer before the session; the report comes back once
   the psychologist has gone through it with the client. `compact` = only what still needs doing. */

const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "");

export default function PreSessionForms({ compact = false }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    fetchById(`${apiUrl}/assessment-requests/mine`).then((r) => setRows(r?.data || [])).catch(() => setRows([]));
  }, []);

  const list = (rows || []).filter((r) => !compact || r.status === "sent");
  if (!list.length) return null;

  return (
    <section className={`psf${compact ? " compact" : ""}`} aria-labelledby="psf-h">
      <style dangerouslySetInnerHTML={{ __html: PSF_CSS }} />
      <h2 id="psf-h">{compact ? "Before your session" : "Clinical assessments"}</h2>
      <div className="psf-list">
        {list.map((r) => (
          <div key={r._id} className={`psf-row ${r.status}`}>
            <div className="psf-top">
              <div>
                <b>{r.name}</b>
                <span>{r.selfOnly ? "Assessment only · automatic report" : `With ${r.therapist}`}{r.booking_date ? ` · session ${when(r.booking_date)}` : ""}</span>
              </div>
              <span className="psf-chip">{r.status === "sent" ? "To complete" : r.status === "done" ? "Submitted ✓" : "Report ready"}</span>
            </div>
            {r.status === "sent" && (
              <>
                <p className="psf-ins">{r.selfOnly ? "It takes a few minutes — your report is ready as soon as you submit." : `Please answer it before your session — it takes a few minutes. Your answers go only to ${r.therapist}, who will go through the result with you.`}</p>
                <div className="psf-acts"><Link href={`/client/assessment/${r._id}`} className="psf-btn">Start the assessment</Link></div>
              </>
            )}
            {r.status === "done" && <p className="psf-ins">Thank you. {r.therapist} has your report and will go through it with you in the session.</p>}
            {r.status === "released" && (
              <div className="psf-res">
                <span>{r.result?.level}{r.result?.score != null ? ` · score ${r.result.score}` : ""}</span>
                {r.note && !r.selfOnly && <p>“{r.note}” — {r.therapist}</p>}
                <div className="psf-acts"><Link href={`/assessment-report/${r._id}`} className="psf-btn ghost">View full report</Link></div>
              </div>
            )}
          </div>
        ))}
      </div>
      {compact && <Link href="/client/check-ins" className="psf-more">All my check-ins →</Link>}
    </section>
  );
}

const PSF_CSS = `
.psf { margin-bottom: 18px; }
.psf h2 { margin: 0 0 10px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.psf-list { display: flex; flex-direction: column; gap: 10px; }
.psf-row { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; }
.psf-row.sent { border-color: #fde68a; background: #fffdf5; }
.psf-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.psf-top b { display: block; font-size: 14.5px; color: #0f172a; } .psf-top span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; }
.psf-chip { flex-shrink: 0; font-size: 11.5px !important; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: #e7f6ec; color: #166534 !important; margin: 0 !important; }
.psf-row.sent .psf-chip { background: #fef3c7; color: #92400e !important; }
.psf-ins { margin: 8px 0 0; font-size: 13.5px; color: #475569; line-height: 1.55; }
.psf-acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.psf-btn { height: 40px; padding: 0 14px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 800; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; text-decoration: none !important; }
.psf-btn.ghost { background: #fff; color: #166534 !important; border: 1.5px solid #cfe3d6; }
.psf-res { margin-top: 8px; font-size: 14px; font-weight: 700; color: #0f172a; }
.psf-res p { margin: 6px 0 0; font-size: 13px; color: #475569; font-style: italic; font-weight: 500; line-height: 1.55; }
.psf-more { display: inline-block; margin-top: 8px; font-size: 13px; font-weight: 800; color: #166534 !important; }
@media (max-width: 560px) { .psf-acts .psf-btn { flex: 1 1 100%; } }
`;
