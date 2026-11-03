import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { apiUrl } from "../../utils/url";

/* Public page the QR on a CYT certificate or letter opens, so a college or employer can check it is real.
   /verify-certificate/check shows only the code box. */
export async function getServerSideProps({ params }) {
  const code = String(params.code || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  if (!code || code === "CHECK") return { props: { code: "", data: null } };
  try {
    const r = await fetch(`${apiUrl}/certificates/verify/${encodeURIComponent(code)}`);
    const j = await r.json();
    if (r.ok && j?.status) return { props: { code, data: j.data } };
  } catch (e) { /* treated as not found */ }
  return { props: { code, data: null } };
}

const day = (d) => {
  if (!d) return "";
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

const REGS = [
  ["/images/registrations/mca.png", "Ministry of Corporate Affairs"],
  ["/images/registrations/msme.svg", "MSME"],
  ["/images/registrations/nha.png", "National Health Authority"],
  ["/images/registrations/abdm.svg", "Ayushman Bharat Digital Mission"],
];

export default function VerifyCertificate({ code, data }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const go = (e) => {
    e.preventDefault();
    const c = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length === 8) router.push(`/verify-certificate/${c.slice(0, 4)}-${c.slice(4)}`);
  };
  const ok = data && !data.revoked;
  const rows = data ? [
    ["Certificate no.", data.certNumber],
    ["Issued to", data.name],
    ["Document", data.typeLabel],
    data.role && [data.type === "experience" ? "Role" : "Area", data.role],
    data.hours && data.type === "internship" && ["Duration", `${data.hours} hours`],
    (data.startDate || data.endDate) && ["Period", `${day(data.startDate) || "—"} to ${day(data.endDate) || "—"}`],
    data.issueDate && ["Date of issue", day(data.issueDate)],
    data.signatoryName && ["Signed by", [data.signatoryName, data.signatoryDesignation].filter(Boolean).join(", ")],
    ["Issued by", "Choose Your Therapist LLP"],
  ].filter(Boolean) : [];

  return (
    <>
      <Head>
        <title>{data ? `Verify ${data.certNumber} | Choose Your Therapist` : "Verify a certificate | Choose Your Therapist"}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Check that a certificate or letter issued by Choose Your Therapist LLP is genuine." />
      </Head>
      <MyNavbar />
      <main className="vc">
        <style dangerouslySetInnerHTML={{ __html: VC_CSS }} />
        {data ? (
          <section className={`vc-card ${ok ? "" : "bad"}`}>
            <div className="vc-head">
              <span className="vc-mark" aria-hidden="true">{ok ? "✓" : "!"}</span>
              <div>
                <h1>{ok ? "Genuine certificate" : "This certificate has been withdrawn"}</h1>
                <p>{ok
                  ? "Choose Your Therapist LLP issued this document. The details below are from our records; they should match the paper or PDF in front of you."
                  : `Choose Your Therapist LLP no longer stands behind this document${data.revokedReason ? `: ${data.revokedReason}` : "."}`}</p>
              </div>
            </div>
            <dl className="vc-rows">
              {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <p className="vc-code">Verification code <b>{data.code}</b></p>
          </section>
        ) : (
          <section className="vc-card">
            <h1 className="vc-h">{code ? "No certificate found" : "Verify a certificate"}</h1>
            <p className="vc-p">{code
              ? <>No Choose Your Therapist certificate has the code <b>{code}</b>. Check the code printed next to the QR and try again.</>
              : "Enter the 8-character verification code printed next to the QR on the certificate or letter."}</p>
            <form className="vc-form" onSubmit={go}>
              <label htmlFor="vc-in" className="vc-sr">Verification code</label>
              <input id="vc-in" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 7K2M-9QXA" maxLength={9} autoComplete="off" />
              <button type="submit">Verify</button>
            </form>
          </section>
        )}
        <section className="vc-about">
          <p>Choose Your Therapist LLP (LLP AAX-8113) is registered with the Ministry of Corporate Affairs and MSME, and is a health facility on the Health Facility Registry under ABDM, National Health Authority (HFR ID IN0510005384).</p>
          <div className="vc-regs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {REGS.map(([src, alt]) => <img key={src} src={src} alt={alt} />)}
          </div>
          <p className="vc-help">Questions about a certificate? Write to <a href="mailto:hello@chooseyourtherapist.in">hello@chooseyourtherapist.in</a>.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}

const VC_CSS = `
.vc { max-width: 760px; margin: 0 auto; padding: 36px 16px 56px; background: #fff; box-sizing: border-box; }
.vc-card { border: 1px solid #d9eadf; border-radius: 18px; padding: 24px; background: #fbfdfb; box-shadow: 0 18px 40px -32px rgba(20,83,45,.5); }
.vc-card.bad { border-color: #fecaca; background: #fffafa; }
.vc-head { display: flex; gap: 14px; align-items: flex-start; }
.vc-mark { flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: #16a34a; color: #fff; font-size: 22px; font-weight: 900; }
.vc-card.bad .vc-mark { background: #dc2626; }
.vc-head h1, .vc-h { margin: 2px 0 4px; font-size: 24px; font-weight: 800; color: #0f2a1d; }
.vc-card.bad h1 { color: #991b1b; }
.vc-head p, .vc-p { margin: 0; color: #475569; font-size: 15px; line-height: 1.55; }
.vc-rows { margin: 20px 0 0; border-top: 1px solid #e5efe8; }
.vc-rows div { display: grid; grid-template-columns: 160px 1fr; gap: 12px; padding: 11px 0; border-bottom: 1px solid #e5efe8; }
.vc-rows dt { color: #64748b; font-size: 14px; font-weight: 600; }
.vc-rows dd { margin: 0; color: #0f2a1d; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
.vc-code { margin: 14px 0 0; color: #64748b; font-size: 13px; } .vc-code b { color: #14532d; letter-spacing: .06em; }
.vc-form { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.vc-form input { flex: 1 1 200px; min-width: 0; height: 48px; padding: 0 14px; border: 1.5px solid #cfe0d5; border-radius: 12px; font-size: 17px; letter-spacing: .08em; text-transform: uppercase; }
.vc-form input:focus { outline: none; border-color: #16a34a; }
.vc-form button { height: 48px; padding: 0 24px; border: 0; border-radius: 12px; background: #166534; color: #fff; font-weight: 800; font-size: 15px; cursor: pointer; }
.vc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.vc-about { margin-top: 26px; color: #64748b; font-size: 13.5px; line-height: 1.6; }
.vc-regs { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; margin: 12px 0; }
.vc-regs img { height: 34px; width: auto; }
.vc-help a { color: #166534; font-weight: 700; }
@media (max-width: 560px) {
  .vc { padding-top: 24px; }
  .vc-card { padding: 18px; }
  .vc-head h1, .vc-h { font-size: 20px; }
  .vc-rows div { grid-template-columns: 1fr; gap: 2px; }
  .vc-regs img { height: 28px; }
}
`;
