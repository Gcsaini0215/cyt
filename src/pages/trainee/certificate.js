import React, { useEffect, useState } from "react";
import TraineeLayout from "../../components/trainee/trainee-layout";
import { tApi, fileUrl, fmtDate } from "../../utils/trainee-api";

/* Certificate: the PDF the CYT team forwards once the internship is complete. */
function Certificate() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    tApi("/trainee-portal/certificates").then((r) => (r.status ? setList(r.data) : setErr(r.message || "Couldn't load certificates")));
  }, []);
  if (!list) return err ? <div className="tl-err">{err}</div> : <div className="tp-load">Loading…</div>;

  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Certificate</h1>
          <p>Your certificate appears here as soon as the CYT team issues it.</p>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="tp-card ce-wait">
          <div className="ce-seal" aria-hidden="true"><i className="feather-award" /></div>
          <h2>Your certificate isn&apos;t ready yet</h2>
          <p>Complete your internship hours and tasks. Once your supervisor signs off, the CYT team will send your certificate here — and we&apos;ll email you.</p>
          <ol className="ce-steps">
            <li><i className="feather-clock" aria-hidden="true" /> Attend and check in for your sessions</li>
            <li><i className="feather-check-square" aria-hidden="true" /> Finish the tasks sent to you</li>
            <li><i className="feather-award" aria-hidden="true" /> Receive your certificate PDF</li>
          </ol>
        </div>
      ) : (
        <div className="ce-grid">
          {list.map((c) => (
            <article key={c._id} className="ce">
              <div className="ce-face">
                <div className="ce-seal sm" aria-hidden="true"><i className="feather-award" /></div>
                <span className="ce-k">Choose Your Therapist</span>
                <h3>{c.title}</h3>
                <span className="ce-to">Awarded to <b>{c.name || "you"}</b></span>
                <span className="ce-d">Issued {fmtDate(c.createdAt)}</span>
              </div>
              {c.note && <p className="ce-note">{c.note}</p>}
              <div className="ce-a">
                <a className="tl-btn" href={fileUrl(c.file)} target="_blank" rel="noreferrer"><i className="feather-eye" aria-hidden="true" /> View</a>
                <a className="tl-btn gold" href={fileUrl(c.file)} download><i className="feather-download" aria-hidden="true" /> Download PDF</a>
              </div>
            </article>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.ce-wait { text-align: center; padding: 40px 24px; }
.ce-seal { width: 76px; height: 76px; margin: 0 auto 14px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fbe7a8, #d4a24c 70%); color: #fff; display: grid; place-items: center; font-size: 34px; box-shadow: 0 10px 24px rgba(201,150,44,.35), inset 0 0 0 4px rgba(255,255,255,.35); }
.ce-seal.sm { width: 54px; height: 54px; font-size: 24px; margin-bottom: 10px; }
.ce-wait h2 { margin: 0 0 6px; font-size: 20px; font-weight: 800; color: #0f172a; }
.ce-wait p { margin: 0 auto; max-width: 520px; font-size: 14.5px; color: #64748b; line-height: 1.6; }
.ce-steps { list-style: none; padding: 0; margin: 22px auto 0; max-width: 420px; display: grid; gap: 8px; text-align: left; }
.ce-steps li { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; background: #f6faf7; font-size: 14px; font-weight: 700; color: #1e3a2a; }
.ce-steps i { color: #15803d; }
.ce-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.ce { background: #fff; border: 1px solid #e4ece7; border-radius: 18px; padding: 16px; }
.ce-face { border-radius: 14px; padding: 26px 18px; text-align: center; background: linear-gradient(135deg, #fffaf0, #fff 55%, #f3faf5); border: 1.5px solid #f1e2bd; box-shadow: inset 0 0 0 6px #fff, inset 0 0 0 7px #f1e2bd; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ce-k { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8a5a0b; }
.ce-face h3 { margin: 4px 0; font-size: 19px; font-weight: 800; color: #14532d; }
.ce-to { font-size: 13.5px; color: #475569; }
.ce-to b { color: #0f172a; }
.ce-d { font-size: 12px; color: #94a3b8; font-weight: 600; margin-top: 4px; }
.ce-note { margin: 12px 2px 0; font-size: 13.5px; color: #475569; line-height: 1.55; }
.ce-a { display: flex; gap: 8px; margin-top: 14px; }
.ce-a .tl-btn { flex: 1; }
@media (max-width: 640px) { .ce-grid { grid-template-columns: 1fr; } }
`;

export default function CertificatePage() {
  return <TraineeLayout title="Certificate"><Certificate /></TraineeLayout>;
}
