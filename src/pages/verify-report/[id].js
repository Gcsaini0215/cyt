import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { fetchData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* Opened from the QR code on a clinical assessment report: confirms the report was issued and
   approved on CYT. Shows only what is needed to check a printed copy — never the answers, and the
   client by initials only. */

const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—");

export default function VerifyReport() {
  const router = useRouter();
  const { id } = router.query;
  const [r, setR] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchData(`${apiUrl}/assessment-verify/${id}`).then((x) => setR(x.data)).catch((e) => setErr(e?.response?.data?.message || "This report could not be verified."));
  }, [id]);

  const p = r?.psychologist || {};
  return (
    <div className="vr">
      <Head><title>Verify assessment report | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: VR_CSS }} />
      <div className="vr-card">
        <div className="vr-head">
          <img src="/cyt-emblem.png" alt="" width={44} height={44} />
          <div><b>Choose Your Therapist</b><span>Report verification · HFR ID IN0510005384</span></div>
        </div>
        {err ? (
          <div className="vr-bad"><b>✕ Not verified</b><span>{err}</span><span>If you were given a printed copy of this report, please confirm it with the issuing psychologist or write to hello@chooseyourtherapist.in.</span></div>
        ) : !r ? <div className="vr-skel" /> : (
          <>
            <div className="vr-ok"><b>✓ Genuine report</b><span>This report was issued on Choose Your Therapist and approved by the psychologist below.</span></div>
            <dl className="vr-dl">
              <div><dt>Report No.</dt><dd>{r.reportNo}</dd></div>
              <div><dt>Assessment</dt><dd>{r.test}</dd></div>
              <div><dt>Client</dt><dd>{r.client}</dd></div>
              <div><dt>Result</dt><dd>{r.level}{r.score != null ? ` · ${r.score}/${r.max}` : ""}</dd></div>
              <div><dt>Completed on</dt><dd>{fmt(r.completedAt)}</dd></div>
              <div><dt>Approved on</dt><dd>{fmt(r.releasedAt)}</dd></div>
              <div><dt>Psychologist</dt><dd>{p.name}{p.profileType ? `, ${p.profileType}` : ""}</dd></div>
              <div><dt>{p.regNo ? "Reg. / Licence No." : "Qualification"}</dt><dd>{p.regNo || p.credential || "—"}</dd></div>
            </dl>
            <p className="vr-note">Compare these details with the printed report. This report is not valid for any medico-legal purpose.</p>
          </>
        )}
      </div>
    </div>
  );
}

const VR_CSS = `
.vr { min-height: 100vh; background: #eceeed; display: grid; place-items: start center; padding: 40px 16px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2937; }
.vr-card { width: min(520px, 100%); background: #fff; border: 1px solid #dfe3e1; border-radius: 14px; padding: 22px; box-shadow: 0 12px 32px -24px rgba(15,23,42,.45); }
.vr-head { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 2px solid #14532d; margin-bottom: 14px; }
.vr-head b { display: block; font-size: 17px; color: #14532d; } .vr-head span { font-size: 12px; color: #6b7280; }
.vr-ok, .vr-bad { display: flex; flex-direction: column; gap: 4px; border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; }
.vr-ok { background: #f0fdf4; border: 1px solid #bbf7d0; } .vr-ok b { color: #166534; font-size: 16px; }
.vr-bad { background: #fef2f2; border: 1px solid #fecaca; } .vr-bad b { color: #b91c1c; font-size: 16px; }
.vr-ok span, .vr-bad span { font-size: 13px; color: #374151; line-height: 1.5; }
.vr-skel { height: 220px; border-radius: 10px; background: #f1f3f2; }
.vr-dl { margin: 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.vr-dl div { display: grid; grid-template-columns: 140px 1fr; gap: 10px; padding: 8px 12px; border-top: 1px solid #f0f1f1; font-size: 13.5px; }
.vr-dl div:first-child { border-top: 0; }
.vr-dl dt { color: #6b7280; } .vr-dl dd { margin: 0; font-weight: 700; color: #111827; word-break: break-word; }
.vr-note { margin: 12px 0 0; font-size: 12px; color: #6b7280; line-height: 1.5; }
`;
