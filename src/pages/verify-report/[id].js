import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { fetchData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* Opened from the QR code on a screening report: a ticket-style "authentic" pass that confirms the
   report was issued (and, if a psychologist took it, approved) on CYT. Shows only what is needed to
   check a printed copy — never the answers, and the client by initials only. */

const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—");
const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "—");

export default function VerifyReport() {
  const router = useRouter();
  const { id } = router.query;
  const [r, setR] = useState(null);
  const [err, setErr] = useState("");
  const [checkedAt, setCheckedAt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData(`${apiUrl}/assessment-verify/${id}`)
      .then((x) => { setR(x.data); setCheckedAt(new Date()); })
      .catch((e) => setErr(e?.response?.data?.message || "This report could not be verified."));
  }, [id]);

  const copy = () => {
    try { navigator.clipboard.writeText(r.reportNo); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (e) { /* ignore */ }
  };

  const p = r?.psychologist || {};
  const rows = !r ? [] : [
    ["Screening tool", r.test, true],
    ["Client", r.client],
    ["Result", `${r.level}${r.score != null ? ` · ${r.score}/${r.max}` : ""}`],
    ["Completed on", fmt(r.completedAt)],
    [r.selfOnly ? "Issued on" : "Approved on", fmt(r.releasedAt)],
    ...(r.selfOnly ? [["Type", "Screening only · automatic report", true]] : [
      ["Psychologist", `${p.name || "—"}${p.profileType ? `, ${p.profileType}` : ""}`, true],
      ...(p.regNo ? [["RCI / Reg. No.", p.regNo]] : []),
      ...(p.verified ? [["Credentials", `Verified by CYT${p.verifiedAt ? ` · ${day(p.verifiedAt)}` : ""}`]] : []),
    ]),
  ];

  return (
    <div className="vfy-page">
      <Head><title>Verify screening report | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: VR_CSS }} />
      <div className={`vt${err ? " bad" : ""}`}>
        {/* top: brand + seal */}
        <div className="vt-top">
          <div className="vt-brand">
            <img src="/cyt-emblem.png" alt="" width={34} height={34} />
            <div><b>Choose Your Therapist</b><span>Report verification</span></div>
          </div>
          {err ? (
            <div className="vt-seal-wrap">
              <span className="vt-seal x" aria-hidden="true">✕</span>
              <b className="vt-state">Not verified</b>
              <p className="vt-lead">{err}</p>
            </div>
          ) : !r ? <div className="vt-skel" /> : (
            <div className="vt-seal-wrap">
              <span className="vt-seal" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <b className="vt-state">Verified · Genuine report</b>
              <p className="vt-lead">{r.selfOnly ? "Issued on Choose Your Therapist from the client's own answers. Not reviewed by a psychologist." : "Issued on Choose Your Therapist and approved by the psychologist below."}</p>
            </div>
          )}
        </div>

        {/* perforation */}
        <div className="vt-cut" aria-hidden="true" />

        {/* bottom: code + details */}
        <div className="vt-bot">
          {err ? (
            <p className="vt-help">If you were given a printed copy of this report, please confirm it with the issuing psychologist or write to <a href="mailto:hello@chooseyourtherapist.in">hello@chooseyourtherapist.in</a>.</p>
          ) : !r ? <div className="vt-skel sm" /> : (
            <>
              <div className="vt-code">
                <div><span>Report No.</span><b>{r.reportNo}</b></div>
                <button type="button" onClick={copy} aria-label="Copy report number">{copied ? "Copied" : "Copy"}</button>
              </div>
              <dl className="vt-dl">
                {rows.map(([k, v, wide]) => <div key={k} className={wide ? "wide" : ""}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <div className="vt-foot">
                <span>Checked {checkedAt ? fmt(checkedAt) : ""}</span>
                <span>Not valid for any medico-legal purpose</span>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="vfy-under">Compare these details with the printed report · www.chooseyourtherapist.in</p>
    </div>
  );
}

const VR_CSS = `
.vfy-page { min-height: 100vh; background: #eceeed; display: flex; flex-direction: column; align-items: center; padding: 36px 16px 30px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2937; box-sizing: border-box; }
.vfy-page *, .vfy-page *::before, .vfy-page *::after { box-sizing: border-box; }
.vt { width: 100%; max-width: 440px; background: #fff; border-radius: 20px; box-shadow: 0 24px 50px -30px rgba(15,23,42,.5), 0 1px 2px rgba(15,23,42,.06); overflow: hidden; }
.vt-top { padding: 18px 20px 20px; background: linear-gradient(180deg, #f2faf5 0%, #fff 100%); }
.vt.bad .vt-top { background: linear-gradient(180deg, #fef4f4 0%, #fff 100%); }
.vt-brand { display: flex; align-items: center; gap: 10px; }
.vt-brand img { display: block; flex-shrink: 0; }
.vt-brand b { display: block; font-size: 15px; color: #14532d; line-height: 1.2; } .vt-brand span { font-size: 11.5px; color: #6b7280; letter-spacing: .3px; }
.vt-seal-wrap { text-align: center; margin-top: 16px; }
.vt-seal { width: 64px; height: 64px; margin: 0 auto 10px; border-radius: 50%; display: grid; place-items: center; color: #fff; background: #16a34a; box-shadow: 0 0 0 6px #dcfce7, 0 10px 20px -8px rgba(22,163,74,.6); }
.vt-seal.x { background: #dc2626; box-shadow: 0 0 0 6px #fee2e2, 0 10px 20px -8px rgba(220,38,38,.6); font-size: 26px; font-weight: 800; }
.vt-state { display: block; font-size: 19px; font-weight: 800; color: #14532d; letter-spacing: -.2px; }
.vt.bad .vt-state { color: #b91c1c; }
.vt-lead { margin: 6px auto 0; max-width: 340px; font-size: 13px; color: #4b5563; line-height: 1.55; }
.vt-cut { position: relative; height: 22px; background-image: linear-gradient(90deg, #cfd6d2 55%, transparent 0); background-size: 12px 1.5px; background-repeat: repeat-x; background-position: center; margin: 0 14px; }
.vt-cut::before, .vt-cut::after { content: ""; position: absolute; top: 50%; width: 24px; height: 24px; margin-top: -12px; border-radius: 50%; background: #eceeed; }
.vt-cut::before { left: -26px; } .vt-cut::after { right: -26px; }
.vt-bot { padding: 14px 20px 18px; }
.vt-code { display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1.5px dashed #9fcbb0; background: #f6fbf8; border-radius: 12px; padding: 10px 12px; }
.vt-code > div { min-width: 0; }
.vt-code span { display: block; font-size: 10.5px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .8px; }
.vt-code b { display: block; font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 18px; letter-spacing: 1.5px; color: #14532d; overflow-wrap: anywhere; }
.vt-code button { flex-shrink: 0; height: 34px; padding: 0 12px; border-radius: 9px; border: 1px solid #cfe3d6; background: #fff; color: #14532d; font: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer; }
.vt-dl { margin: 12px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.vt-dl div { min-width: 0; } .vt-dl div.wide { grid-column: 1 / -1; }
.vt-dl dt { font-size: 10.5px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .6px; }
.vt-dl dd { margin: 2px 0 0; font-size: 13.5px; font-weight: 700; color: #111827; line-height: 1.4; overflow-wrap: anywhere; }
.vt-foot { margin-top: 14px; padding-top: 10px; border-top: 1px solid #eef1ef; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; font-size: 11px; color: #6b7280; }
.vt-help { margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6; text-align: center; } .vt-help a { color: #14532d !important; font-weight: 700; }
.vt-skel { height: 140px; margin-top: 16px; border-radius: 12px; background: #f1f3f2; } .vt-skel.sm { height: 120px; margin-top: 0; }
.vfy-under { margin: 14px 0 0; font-size: 11.5px; color: #6b7280; text-align: center; line-height: 1.5; }
.vt-dl dt { margin: 0 !important; line-height: 1.3; } .vt-dl dd { margin: 2px 0 0 !important; } .vt-lead, .vt-help { line-height: 1.55 !important; }
@media (max-width: 380px) { .vt-dl { grid-template-columns: 1fr; } .vt-code b { font-size: 16px; } }
`;
