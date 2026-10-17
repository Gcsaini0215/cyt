import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import SignaturePad from "./signature-pad";
import { clearAssessmentsUpgrade } from "./nav-extras";

/* One screen to get the Clinical Assessments add-on: qualification (from the profile), RCI licence /
   registration no. (prefilled from the profile when saved there), signature — then pay. The details go
   to CYT for verification; clients see the therapist for assessments once verified. */

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
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

export default function AddonWizard({ onClose, onDone }) {
  const [data, setData] = useState(null);
  const [reg, setReg] = useState("");
  const [noReg, setNoReg] = useState(false);
  const [sig, setSig] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchById(`${apiUrl}/therapist-addon`).then((r) => {
      const d = r?.data || {};
      setData(d);
      setReg(d.assessments?.regNo || d.profile?.licenseNumber || "");
      setNoReg(!!d.assessments?.noRegNo);
      setSig(d.assessments?.signature || "");
    }).catch(() => setErr("Couldn't load — please try again."));
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const a = data?.assessments;
  const qual = data?.profile?.qualification || "";
  const ready = qual && sig && (noReg || reg.trim().length >= 3);

  const finish = () => { clearAssessmentsUpgrade(); setDone(true); setBusy(false); onDone && onDone(); };

  const submit = async () => {
    if (!ready) return;
    setBusy(true); setErr("");
    try {
      const d = await postData(`${apiUrl}/therapist-addon/details`, { regNo: noReg ? "" : reg.trim(), noRegNo: noReg, signature: sig });
      if (!d?.status) throw new Error(d?.message);
      if (a?.active) { finish(); return; }
      const o = await postData(`${apiUrl}/therapist-addon/order`, {});
      if (o?.data?.free) { finish(); return; }
      if (!o?.data?.orderId) throw new Error(o?.message || "Couldn't start the payment.");
      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection.");
      const rzp = new window.Razorpay({
        key: o.data.keyId, amount: Math.round(o.data.amount * 100), currency: "INR", order_id: o.data.orderId,
        name: "Choose Your Therapist", description: "Clinical Assessments add-on — 1 year", theme: { color: "#14532d" },
        handler: async (resp) => {
          try {
            const v = await postData(`${apiUrl}/therapist-addon/verify`, resp);
            if (!v?.status) throw new Error(v?.message);
            finish();
          } catch (e) { setErr(e?.response?.data?.message || e.message || "Payment verification failed — contact hello@chooseyourtherapist.in with your payment ID."); setBusy(false); }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Something went wrong — please try again.");
      setBusy(false);
    }
  };

  return createPortal(
    <div className="awz-wrap" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: AWZ_CSS }} />
      <div className="awz" role="dialog" aria-modal="true" aria-labelledby="awz-h">
        <button type="button" className="awz-x" onClick={onClose} disabled={busy} aria-label="Close">×</button>
        {done ? (
          <div className="awz-done">
            <span className="awz-tick">✓</span>
            <h2>{a?.active ? "Details sent" : "Clinical Assessments activated"}</h2>
            <p>Your details have gone to CYT for verification — usually within a working day. Clients will see you for assessments as soon as you&apos;re verified.</p>
            <button type="button" className="awz-go" onClick={onClose}>Done</button>
          </div>
        ) : !data ? <div className="awz-skel">{err || ""}</div> : (
          <>
            <span className="awz-kick">⭐ Clinical Assessments add-on</span>
            <h2 id="awz-h">{a?.active ? "Your assessment details" : "Offer clinical assessments to your clients"}</h2>
            {!a?.active && (
              <p className="awz-price">
                {a?.offer && <s>{inr(a.fee)}</s>} <b>{a?.price === 0 ? "Free" : inr(a?.price)}</b> / year
                {a?.offer && a?.offerLabel && <em>{a.offerLabel}</em>}
                <span>Clients add PHQ-9, GAD-7, DASS-21 and more when they book you · automatic reports · you earn {Math.round((data.therapistShare ?? 0.3) * 100)}% of each fee</span>
              </p>
            )}

            <ol className="awz-steps">
              <li>
                <b>Qualification</b>
                {qual ? <div className="awz-fixed"><span>{qual}</span><em>from your profile</em></div>
                  : <p className="awz-warn">Add your qualification in <Link href="/settings">Settings → Profile</Link> first.</p>}
              </li>
              <li>
                <b>RCI licence / registration number</b>
                {!noReg && <input className="awz-in" maxLength={60} value={reg} onChange={(e) => setReg(e.target.value)} placeholder="e.g. RCI CRR No. A12345" />}
                {!noReg && data.profile?.licenseNumber && reg.trim() === data.profile.licenseNumber && <span className="awz-hint">from your profile</span>}
                <label className="awz-chk"><input type="checkbox" checked={noReg} onChange={(e) => setNoReg(e.target.checked)} /> I don&apos;t have an RCI licence / registration number</label>
              </li>
              <li>
                <b>Your signature</b>
                <span className="awz-hint">Printed on the assessment reports you approve.</span>
                <SignaturePad value={sig} onChange={setSig} disabled={busy} />
              </li>
            </ol>

            {err && <p className="awz-err" role="alert">{err}</p>}
            <button type="button" className="awz-go" onClick={submit} disabled={busy || !ready}>
              {busy ? "Please wait…" : a?.active ? "Save & send for verification" : a?.price === 0 ? "Activate free" : `Pay ${inr(a?.price)} & activate`}
            </button>
            <p className="awz-small">CYT verifies your details before clients can book assessments with you. Prices and the {Math.round((data.therapistShare ?? 0.3) * 100)}% / {100 - Math.round((data.therapistShare ?? 0.3) * 100)}% split are set by CYT.</p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

const AWZ_CSS = `
.awz-wrap { position: fixed; inset: 0; z-index: 2100; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; }
.awz { position: relative; width: min(520px, 100%); max-height: 92vh; overflow-y: auto; background: #fff; border-radius: 18px; padding: 22px 22px 18px; box-shadow: 0 30px 70px -20px rgba(0,0,0,.4); font-family: inherit; }
.awz-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.awz-skel { height: 300px; border-radius: 12px; background: #f1f5f4; display: grid; place-items: center; color: #b91c1c; font-weight: 700; }
.awz-kick { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #92400e; background: #fde68a; border-radius: 999px; padding: 3px 10px; }
.awz h2 { margin: 10px 30px 6px 0; font-size: 19px; font-weight: 800; color: #0f172a; font-family: inherit; line-height: 1.3; }
.awz-price { margin: 0 0 12px; font-size: 13px; color: #475569; } .awz-price b { font-size: 22px; color: #14532d; } .awz-price s { color: #94a3b8; }
.awz-price em { font-style: normal; font-size: 11px; font-weight: 800; color: #b45309; background: #fef3c7; border-radius: 999px; padding: 2px 8px; margin-left: 6px; }
.awz-price span { display: block; margin-top: 4px; font-size: 12.5px; color: #64748b; line-height: 1.5; }
.awz-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; counter-reset: s; }
.awz-steps > li { margin: 0; counter-increment: s; border: 1px solid #e3eae6; border-radius: 12px; padding: 12px 14px 12px 44px; position: relative; display: flex; flex-direction: column; gap: 6px; }
.awz-steps > li::before { content: counter(s); position: absolute; left: 12px; top: 12px; width: 22px; height: 22px; border-radius: 50%; background: #14532d; color: #fff; font-size: 12px; font-weight: 800; display: grid; place-items: center; }
.awz-steps b { font-size: 14px; color: #0f172a; }
.awz-fixed { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: #f6faf7; border: 1px solid #d9eadf; border-radius: 10px; padding: 9px 11px; font-size: 13.5px; font-weight: 700; color: #14532d; }
.awz-fixed em, .awz-hint { font-style: normal; font-size: 11.5px; color: #64748b; font-weight: 600; }
.awz-in { height: 42px; border: 1.5px solid #d5e3da; border-radius: 10px; padding: 0 11px; font: inherit; font-size: 14px; }
.awz-in:focus { outline: none; border-color: #16a34a; }
.awz-chk { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; }
.awz-chk input[type="checkbox"] { display: inline-block !important; position: static !important; opacity: 1 !important; visibility: visible !important; width: 18px; height: 18px; margin: 0; accent-color: #14532d; appearance: auto; -webkit-appearance: checkbox; flex: none; }
.awz-warn { margin: 0; font-size: 13px; color: #92400e; font-weight: 600; } .awz-warn a { color: #1d4ed8 !important; }
.awz-err { margin: 10px 0 0; font-size: 13px; font-weight: 700; color: #b91c1c; }
.awz-go { margin-top: 14px; width: 100%; height: 48px; border-radius: 12px; border: 0; background: #14532d; color: #fff; font-weight: 800; font-size: 15px; cursor: pointer; font-family: inherit; box-shadow: 0 10px 20px -12px rgba(20,83,45,.8); }
.awz-go:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
.awz-small { margin: 8px 0 0; font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5; }
.awz-done { text-align: center; padding: 10px 4px; }
.awz-tick { width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; color: #166534; display: grid; place-items: center; font-size: 28px; font-weight: 800; margin: 0 auto 8px; }
.awz-done h2 { margin: 6px 0; } .awz-done p { margin: 0; font-size: 13.5px; color: #475569; line-height: 1.6; }
@media (max-width: 560px) { .awz-wrap { place-items: end center; padding: 0; } .awz { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); } }
`;
