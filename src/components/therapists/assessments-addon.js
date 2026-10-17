import React, { useEffect, useState } from "react";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import Link from "next/link";
import { setAssessmentsUpgrade, useAddonLive } from "./nav-extras";
import SignaturePad from "./signature-pad";
import { EducationList } from "../../utils/static-lists";

/* "Add-on & details" tab of the Assessments page: the 6-month Clinical Assessments add-on, bought in
   steps — 1 send details (qualification synced from Settings → Profile, RCI / reg. no., signature) → 2 CYT approves them (admin panel)
   → 3 informed consent → 4 payment on Razorpay (priced by CYT in the admin panel). */

const OTHER_EDU = "Other (Please specify)";
const EDU = EducationList.filter((e) => e !== "Select" && e !== OTHER_EDU);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const STEPS = [["details", "Submit details"], ["review", "CYT approval"], ["consent", "Informed consent"], ["payment", "Payment"]];
const ORDER = { details: 0, rejected: 0, review: 1, consent: 2, payment: 3, active: 4 };

const CONSENT = [
  "The details I have sent (qualification, RCI licence / registration number) are true, and I am qualified to use and interpret these assessments.",
  "These tools are screening and severity measures. I will read each result together with my own clinical assessment and will not give a diagnosis on the score alone.",
  "I will review every report before releasing it to the client, and add notes or a referral where needed.",
  "If a client reports thoughts of self-harm or another risk, I will check on their safety promptly and follow the standard of care — including referral or emergency services when needed.",
  "I will keep client answers and reports confidential and use them only for the client's care, unless the client agrees or the law requires otherwise.",
  "My name, qualification, registration number and signature will be printed on the reports I release.",
  "CYT collects the assessment fee from the client; I receive my share as shown on this page. CYT may pause the add-on if the details are found to be incorrect or the tools are misused.",
];

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function AssessmentsAddon({ onChange }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });
  const [f, setF] = useState({ reg: "", noReg: false, sig: "", edu: "", eduOther: "" });
  const [saving, setSaving] = useState(false);
  const [fmsg, setFmsg] = useState({ text: "", err: false });
  const [editing, setEditing] = useState(false);
  const [agree, setAgree] = useState(false);
  const [cname, setCname] = useState("");

  const load = () => fetchById(`${apiUrl}/therapist-addon`).then((r) => {
    const d = r?.data;
    setData(d || null);
    if (d) setF({ edu: "", eduOther: "", reg: d.assessments?.regNo || d.profile?.licenseNumber || "", noReg: !!d.assessments?.noRegNo, sig: d.assessments?.signature || "" });
    if (d?.assessments) setAssessmentsUpgrade(!d.assessments.active);
    onChange && onChange(d || null);
  }).catch(() => setMsg({ text: "Couldn't load — refresh to try again", err: true }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useAddonLive(() => { setEditing(false); load(); }); // admin approved / sent back → update without a refresh

  const buy = async () => {
    setBusy(true); setMsg({ text: "", err: false });
    try {
      const o = await postData(`${apiUrl}/therapist-addon/order`, {});
      if (o?.data?.free) { setMsg({ text: o.message || "Activated.", err: false }); await load(); setBusy(false); return; }
      if (!o?.data?.orderId) throw new Error(o?.message || "Couldn't start the payment.");
      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection.");
      const rzp = new window.Razorpay({
        key: o.data.keyId, amount: Math.round(o.data.amount * 100), currency: "INR", order_id: o.data.orderId,
        name: "Choose Your Therapist", description: "Clinical Assessments add-on — 6 months", theme: { color: "#0f3d24" },
        handler: async (resp) => {
          try {
            const v = await postData(`${apiUrl}/therapist-addon/verify`, resp);
            setMsg({ text: v?.message || "Activated.", err: !v?.status });
            await load();
          } catch (e) { setMsg({ text: e?.response?.data?.message || "Payment verification failed — contact hello@chooseyourtherapist.in with your payment ID.", err: true }); }
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setMsg({ text: e?.response?.data?.message || e.message || "Payment failed to start.", err: true });
      setBusy(false);
    }
  };

  const a = data?.assessments;
  const share = data?.therapistShare ?? 0.3;
  const step = a?.step || "details";
  const cur = ORDER[step] ?? 0;
  const profileQual = data?.profile?.qualification || "";
  // locked to Settings → Profile; picked here only while the profile has none
  const qual = profileQual || (f.edu === OTHER_EDU ? f.eduOther.trim() : f.edu);
  const changed = !!(a && ((f.noReg ? "" : f.reg.trim()) !== (a.regNo || "") || f.noReg !== !!a.noRegNo || f.sig !== (a.signature || "")));
  const valid = qual.trim().length >= 2 && !!f.sig && (f.noReg || f.reg.trim().length >= 3);
  const showForm = step === "details" || step === "rejected" || editing;

  const saveDetails = async () => {
    if (!valid || saving) return;
    setSaving(true); setFmsg({ text: "", err: false });
    try {
      const d = await postData(`${apiUrl}/therapist-addon/details`, { ...(profileQual ? {} : { credential: qual }), regNo: f.noReg ? "" : f.reg.trim(), noRegNo: f.noReg, signature: f.sig });
      if (!d?.status) throw new Error(d?.message);
      setMsg({ text: d.message || "Sent to CYT for approval.", err: false });
      setEditing(false);
      await load();
    } catch (e) { setFmsg({ text: e?.response?.data?.message || e.message || "Couldn't save — please try again.", err: true }); }
    setSaving(false);
  };

  const signConsent = async () => {
    if (!agree || cname.trim().length < 3 || busy) return;
    setBusy(true); setMsg({ text: "", err: false });
    try {
      const d = await postData(`${apiUrl}/therapist-addon/consent`, { agree: true, name: cname.trim() });
      if (!d?.status) throw new Error(d?.message);
      await load();
    } catch (e) { setMsg({ text: e?.response?.data?.message || e.message || "Couldn't save — please try again.", err: true }); }
    setBusy(false);
  };

  const price = a && (
    <div className="aa-price">
      {a.offer && <s>{inr(a.fee)}</s>} <strong>{a.price === 0 ? "Free" : inr(a.price)}</strong><small>/{a.termMonths || 6} months</small>
      {a.offer && a.offerLabel && <em>{a.offerLabel}</em>}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AA_CSS }} />
      <section className="pt-card aa-card" id="addon">
        <div className="aa-head">
          <h2>Clinical Assessments add-on</h2>
          <ul className="aa-incl">
            <li>12 standard tools — PHQ-9, GAD-7, DASS-21, PCL-5 and more</li>
            <li>Scored, signed report for every client</li>
            <li>Client sees it only after you release it</li>
          </ul>
        </div>
        {msg.text && <p className={`aa-msg${msg.err ? " err" : ""}`} role="status">{msg.text}</p>}
        {!data ? <div className="aa-skel" /> : (
          <>
            {step !== "active" && (
              <ol className="aa-steps" aria-label="Steps to get the add-on">
                {STEPS.map(([k, label], i) => (
                  <li key={k} className={i < cur ? "done" : i === cur ? (step === "rejected" ? "now bad" : "now") : ""} aria-current={i === cur ? "step" : undefined}>
                    <i>{i < cur ? "✓" : i + 1}</i><span>{label}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* step 2 — waiting for CYT */}
            {step === "review" && !editing && (
              <div className="aa-box wait">
                <div><b>Waiting for CYT approval</b><span>We&apos;re checking your qualification, registration no. and signature — usually within a working day. You&apos;ll get an email when it&apos;s done.</span></div>
                {price}
              </div>
            )}

            {/* step 3 — informed consent */}
            {step === "consent" && (
              <div className="aa-box consent">
                <b>✓ Your details are approved. Please read and accept the informed consent.</b>
                <div className="aa-consent">
                  <h3>Informed consent — Clinical Assessments on CYT</h3>
                  <p>By using clinical assessments with my clients on Choose Your Therapist, I agree that:</p>
                  <ol>{CONSENT.map((c) => <li key={c}>{c}</li>)}</ol>
                  <p className="aa-split">Fee split on every assessment a client books with you: <b>you {Math.round(share * 100)}%</b> · CYT {100 - Math.round(share * 100)}% (running, scoring and reporting).</p>
                </div>
                <label className="aa-chk big"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} disabled={busy} /> I have read and agree to the informed consent above.</label>
                <label className="aa-fld" style={{ maxWidth: 360 }}>
                  <span>Type your full name to sign</span>
                  <input value={cname} maxLength={120} onChange={(e) => setCname(e.target.value)} placeholder="Your full name" disabled={busy} />
                </label>
                <div className="aa-row-end"><button type="button" className="aa-btn" onClick={signConsent} disabled={busy || !agree || cname.trim().length < 3}>{busy ? "Please wait…" : "Agree & continue to payment"}</button></div>
              </div>
            )}

            {/* step 4 — payment */}
            {step === "payment" && (
              <div className="aa-box pay">
                <div><b>Last step — activate the add-on</b><span>Approved and consent signed{a.consentAt ? ` on ${fmtDate(a.consentAt)}` : ""}. Pay to start offering assessments for {a.termMonths || 6} months.</span></div>
                {price}
                <button type="button" className="aa-btn" onClick={buy} disabled={busy}>{busy ? "Please wait…" : a.price === 0 ? "Activate free" : `Pay ${inr(a.price)} & activate`}</button>
              </div>
            )}

            {/* done */}
            {step === "active" && (
              <div className="aa-box on">
                <div><b>Active · clients can book assessments with you</b><span>Valid till {fmtDate(a.till)}</span></div>
                {price}
                <button type="button" className="aa-btn" onClick={buy} disabled={busy}>{busy ? "Please wait…" : `Extend ${a.termMonths || 6} months`}</button>
              </div>
            )}

            {/* step 1 — details (also to edit later) */}
            {showForm ? (
              <div className="aa-form">
                <div className="aa-form-h">
                  <b>{step === "details" ? "Step 1 · Your details" : "Edit your details"}</b>
                  {step === "details" && price}
                </div>
                {step === "rejected" && <p className="aa-msg err" style={{ margin: "8px 0 0" }}>CYT sent your details back: {a.rejectNote} — please correct them and send again.</p>}
                <p className="aa-form-p">Printed on every report you release. CYT checks them before you can activate the add-on{step !== "details" && step !== "rejected" ? " — a change has to be approved again" : ""}.</p>
                <div className="aa-grid">
                  <div className="aa-fld">
                    <span>Qualification</span>
                    {profileQual ? (
                      <>
                        <div className="aa-fixed">{profileQual}</div>
                        <small>From your profile — to change it, edit <Link href="/settings">Settings → Profile</Link></small>
                      </>
                    ) : (
                      <>
                        <select className="aa-sel" value={f.edu} onChange={(e) => setF({ ...f, edu: e.target.value })} disabled={saving}>
                          <option value="">Choose your highest qualification</option>
                          {EDU.map((e) => <option key={e} value={e}>{e}</option>)}
                          <option value={OTHER_EDU}>Other (type it)</option>
                        </select>
                        {f.edu === OTHER_EDU && <input value={f.eduOther} maxLength={160} onChange={(e) => setF({ ...f, eduOther: e.target.value })} placeholder="e.g. M.A. Applied Psychology" disabled={saving} />}
                        <small>Also saved to your profile (Settings → Profile)</small>
                      </>
                    )}
                  </div>
                  <div className="aa-fld">
                    <span>RCI licence / registration no.</span>
                    <input value={f.noReg ? "" : f.reg} maxLength={60} onChange={(e) => setF({ ...f, reg: e.target.value })} placeholder={f.noReg ? "Not registered" : "e.g. RCI CRR No. A12345"} disabled={saving || f.noReg} />
                    <label className="aa-chk"><input type="checkbox" checked={f.noReg} onChange={(e) => setF({ ...f, noReg: e.target.checked })} disabled={saving} /> I don&apos;t have one</label>
                  </div>
                </div>
                <div className="aa-fld">
                  <span>Signature</span>
                  <SignaturePad value={f.sig} onChange={(v) => setF((x) => ({ ...x, sig: v }))} disabled={saving} />
                </div>
                {fmsg.text && <p className={`aa-msg${fmsg.err ? " err" : ""}`} role="status" style={{ margin: "10px 0 0" }}>{fmsg.text}</p>}
                <div className="aa-form-foot">
                  {!valid && <small>{qual ? "" : "Choose your qualification. "}Fill in your registration no. (or tick &quot;I don&apos;t have one&quot;) and signature.</small>}
                  {editing && <button type="button" className="aa-link" onClick={() => { setEditing(false); load(); }} disabled={saving}>Cancel</button>}
                  <button type="button" className="aa-btn" onClick={saveDetails} disabled={saving || !valid || (editing && !changed)}>{saving ? "Sending…" : "Send for approval"}</button>
                </div>
              </div>
            ) : (
              <div className="aa-sum">
                <div className="aa-sum-items">
                  <div><span>Qualification</span><b>{qual || a.credential || "—"}</b></div>
                  <div><span>RCI licence / reg. no.</span><b>{a.regNo || (a.noRegNo ? "Not registered" : "—")}</b></div>
                  <div><span>Signature</span>{a.signature ? <img src={a.signature} alt="Your signature" /> : <b>—</b>}</div>
                </div>
                <div className="aa-sum-foot">
                  <small className={a.verified ? "ok" : ""}>{a.verified ? "✓ Approved by CYT" : "Sent — waiting for CYT approval"}</small>
                  <button type="button" className="aa-link" onClick={() => setEditing(true)}>Edit details</button>
                </div>
              </div>
            )}
            {step !== "consent" && <p className="aa-note">You earn {Math.round(share * 100)}% of the fee for every assessment a client books with you; CYT keeps {100 - Math.round(share * 100)}% for running, scoring and reporting it.</p>}
          </>
        )}
      </section>
    </>
  );
}

const AA_CSS = `
.aa-card { margin-bottom: 14px; }
.aa-head { margin-bottom: 12px; } .aa-head h2 { margin: 6px 0 4px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.aa-incl { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; }
.aa-incl li { margin: 0; font-size: 13px; color: #475569; padding-left: 18px; position: relative; }
.aa-incl li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 800; }
.aa-steps { list-style: none; margin: 4px 0 14px; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.aa-steps li { margin: 0; display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 10px; background: #f6f8f7; color: #64748b; font-size: 13px; font-weight: 700; }
.aa-steps li i { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 12px; font-weight: 800; background: #e2e8f0; color: #475569; }
.aa-steps li.done { color: #166534; background: #f0fdf4; } .aa-steps li.done i { background: #16a34a; color: #fff; }
.aa-steps li.now { color: #14532d; background: #fff; box-shadow: inset 0 0 0 1.5px #14532d; } .aa-steps li.now i { background: #14532d; color: #fff; }
.aa-steps li.now.bad { color: #b91c1c; box-shadow: inset 0 0 0 1.5px #dc2626; } .aa-steps li.now.bad i { background: #dc2626; }
.aa-box { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; border: 1.5px solid #e3eae6; border-radius: 14px; padding: 14px 16px; margin-bottom: 12px; }
.aa-box > div:first-child { flex: 1 1 260px; } .aa-box > div:first-child b { display: block; font-size: 15px; color: #0f172a; } .aa-box > div:first-child span { display: block; font-size: 13px; color: #64748b; margin-top: 2px; line-height: 1.5; }
.aa-box.wait { background: #fffbeb; border-color: #fde68a; } .aa-box.wait > div:first-child b { color: #92400e; }
.aa-box.pay, .aa-box.on { background: #f6fef9; border-color: #86efac; } .aa-box.on > div:first-child b, .aa-box.pay > div:first-child b { color: #166534; }
.aa-box.consent { display: block; } .aa-box.consent > b { display: block; font-size: 14px; color: #166534; margin-bottom: 10px; }
.aa-consent { border: 1px solid #e3eae6; border-radius: 12px; padding: 12px 14px; background: #fbfcfb; max-height: 300px; overflow-y: auto; margin-bottom: 12px; }
.aa-consent h3 { margin: 0 0 6px; font-size: 14.5px; font-weight: 800; color: #0f172a; font-family: inherit; }
.aa-consent p { margin: 0 0 6px; font-size: 13px; color: #334155; line-height: 1.55; }
.aa-consent ol { margin: 0 0 8px; padding-left: 20px; } .aa-consent li { margin: 0 0 6px; font-size: 13px; color: #334155; line-height: 1.55; }
.aa-consent .aa-split { margin: 8px 0 0; padding-top: 8px; border-top: 1px dashed #d5e3da; }
.aa-row-end { display: flex; justify-content: flex-end; margin-top: 12px; }
.aa-sum { border: 1px solid #e3eae6; border-radius: 12px; padding: 12px 14px; }
.aa-sum-items { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px; }
.aa-sum-items span { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #64748b; }
.aa-sum-items b { display: block; font-size: 13.5px; color: #0f172a; margin-top: 2px; word-break: break-word; }
.aa-sum-items img { display: block; height: 40px; max-width: 160px; object-fit: contain; margin-top: 2px; }
.aa-sum-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eef2f0; }
.aa-sum-foot small { font-size: 12.5px; font-weight: 700; color: #92400e; } .aa-sum-foot small.ok { color: #166534; }
.aa-link { border: 0; background: none; padding: 0; font: inherit; font-size: 13px; font-weight: 800; color: #1d4ed8; cursor: pointer; text-decoration: underline; }
.aa-form { border: 1px solid #e3eae6; border-radius: 14px; padding: 14px 16px; }
.aa-form-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.aa-form-h b { font-size: 15px; color: #0f172a; }
.aa-form-p { margin: 4px 0 12px; font-size: 12.5px; color: #64748b; line-height: 1.5; }
.aa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.aa-fld { display: flex; flex-direction: column; gap: 5px; margin: 0; }
.aa-fld > span:not(.aa-chk) { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #64748b; }
.aa-fld input:not([type="checkbox"]) { height: 42px; border: 1.5px solid #d5e3da; border-radius: 10px; padding: 0 11px; font: inherit; font-size: 14px; color: #0f172a; background: #fff; width: 100%; }
.aa-fld input:not([type="checkbox"]):focus { outline: none; border-color: #16a34a; }
.aa-fld input:disabled { background: #f8faf9; }
.aa-fixed { display: flex; align-items: center; min-height: 42px; border: 1.5px solid #e3eae6; border-radius: 10px; padding: 8px 11px; background: #f6faf7; font-size: 14px; font-weight: 700; color: #14532d; }
.aa-sel { height: 42px; border: 1.5px solid #d5e3da; border-radius: 10px; padding: 0 10px; font: inherit; font-size: 14px; color: #0f172a; background: #fff; width: 100%; }
.aa-sel:focus { outline: none; border-color: #16a34a; }
.aa-fixed.none { color: #92400e; background: #fffbeb; border-color: #fde68a; }
.aa-fld small a { color: #1d4ed8 !important; font-weight: 700; }
.aa-fld small { font-size: 11.5px; color: #64748b; font-weight: 600; }
.aa-chk { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: #334155; cursor: pointer; }
.aa-chk.big { font-size: 13.5px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
.aa-chk input[type="checkbox"] { display: inline-block !important; position: static !important; opacity: 1 !important; visibility: visible !important; width: 16px; height: 16px; margin: 0; accent-color: #14532d; appearance: auto; -webkit-appearance: checkbox; flex: none; }
.aa-form-foot { display: flex; align-items: center; justify-content: flex-end; gap: 14px; flex-wrap: wrap; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eef2f0; }
.aa-form-foot small { flex: 1 1 220px; font-size: 12px; color: #92400e; font-weight: 600; }
.aa-msg { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; }
.aa-msg.err { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
.aa-note { margin: 12px 0 0; font-size: 12.5px; color: #64748b; }
.aa-skel { height: 220px; border-radius: 12px; background: #f1f5f4; }
.aa-price { font-size: 13px; color: #64748b; } .aa-price strong { font-size: 22px; color: #0f172a; } .aa-price s { color: #94a3b8; }
.aa-price em { display: block; font-style: normal; font-size: 11.5px; font-weight: 800; color: #b45309; }
.aa-btn { height: 42px; padding: 0 18px; border-radius: 11px; border: 0; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; }
.aa-btn:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 700px) {
  .aa-steps { grid-template-columns: 1fr 1fr; }
  .aa-grid, .aa-sum-items { grid-template-columns: 1fr; }
  .aa-form-foot .aa-btn, .aa-box .aa-btn, .aa-row-end .aa-btn { width: 100%; }
}
`;
