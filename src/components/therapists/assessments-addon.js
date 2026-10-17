import React, { useEffect, useState } from "react";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { setAssessmentsUpgrade } from "./nav-extras";
import SignaturePad from "./signature-pad";

/* "Add-on & details" tab of the Assessments page: the 6-month Clinical Assessments add-on (bought on
   Razorpay, priced by CYT in the admin panel), the details CYT verifies, and the fee split. */

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

export default function AssessmentsAddon({ onChange }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });
  const [f, setF] = useState({ qual: "", reg: "", noReg: false, sig: "" });
  const [saving, setSaving] = useState(false);
  const [fmsg, setFmsg] = useState({ text: "", err: false });

  const load = () => fetchById(`${apiUrl}/therapist-addon`).then((r) => { setData(r?.data || null); const d = r?.data; if (d) setF({ qual: d.assessments?.credential || d.profile?.qualification || "", reg: d.assessments?.regNo || d.profile?.licenseNumber || "", noReg: !!d.assessments?.noRegNo, sig: d.assessments?.signature || "" }); if (r?.data?.assessments) setAssessmentsUpgrade(!r.data.assessments.active); onChange && onChange(r?.data || null); }).catch(() => setMsg({ text: "Couldn't load — refresh to try again", err: true }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  const hasId = (x) => !!(x && (x.regNo || (x.noRegNo && x.credential)));
  const listed = a && a.active && a.verified && hasId(a);
  const share = data?.therapistShare ?? 0.3;
  const sent = !!(a && hasId(a) && a.signature);
  const changed = !!(a && (f.qual.trim() !== (a.credential || "") || (f.noReg ? "" : f.reg.trim()) !== (a.regNo || "") || f.noReg !== !!a.noRegNo || f.sig !== (a.signature || "")));
  const valid = f.qual.trim().length >= 2 && !!f.sig && (f.noReg || f.reg.trim().length >= 3);
  const saveDetails = async () => {
    if (!valid || saving) return;
    setSaving(true); setFmsg({ text: "", err: false });
    try {
      const d = await postData(`${apiUrl}/therapist-addon/details`, { credential: f.qual.trim(), regNo: f.noReg ? "" : f.reg.trim(), noRegNo: f.noReg, signature: f.sig });
      if (!d?.status) throw new Error(d?.message);
      setFmsg({ text: d.message || "Saved — sent to CYT for verification.", err: false });
      await load();
    } catch (e) { setFmsg({ text: e?.response?.data?.message || e.message || "Couldn't save — please try again.", err: true }); }
    setSaving(false);
  };

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
            <div className={`aa-plan${a.active ? " on" : ""}`}>
              <div>
                <b>{!a.active ? "Not active" : listed ? "Active · verified" : "Active · waiting for CYT verification"}</b>
                <span>{!a.active ? "Clients can't add assessments to bookings with you yet." : listed ? `Clients can add assessments when they book you · valid till ${fmtDate(a.till)}` : `Valid till ${fmtDate(a.till)} · clients will see you once CYT has verified your details${hasId(a) && a.signature ? "" : " — add them below"}`}</span>
              </div>
              <div className="aa-price">
                {a.offer && <s>{inr(a.fee)}</s>} <strong>{a.price === 0 ? "Free" : inr(a.price)}</strong><small>/6 months</small>
                {a.offer && a.offerLabel && <em>{a.offerLabel}</em>}
              </div>
              {a.active
                ? <button type="button" className="aa-btn" onClick={buy} disabled={busy}>{busy ? "Please wait…" : "Extend 6 months"}</button>
                : <button type="button" className="aa-btn" onClick={buy} disabled={busy}>{busy ? "Please wait…" : a.price === 0 ? "Activate free" : "Buy add-on"}</button>}
            </div>

            <div className="aa-form">
              <div className="aa-form-h">
                <b>Your details for reports</b>
                <span className={`aa-st${a.verified && !changed ? " ok" : ""}`}>{!sent ? "Not sent yet" : changed ? "Unsaved changes" : a.verified ? "✓ Verified by CYT" : "Sent · waiting for CYT to verify"}</span>
              </div>
              <p className="aa-form-p">Printed on every report you release. CYT checks them before clients can book assessments with you — any change is checked again.</p>
              <div className="aa-grid">
                <label className="aa-fld">
                  <span>Qualification</span>
                  <input value={f.qual} maxLength={160} onChange={(e) => setF({ ...f, qual: e.target.value })} placeholder="e.g. M.Phil Clinical Psychology, AIIMS" disabled={saving} />
                  {data.profile?.qualification && f.qual.trim() === data.profile.qualification && <small>from your profile</small>}
                </label>
                <label className="aa-fld">
                  <span>RCI licence / registration no.</span>
                  <input value={f.noReg ? "" : f.reg} maxLength={60} onChange={(e) => setF({ ...f, reg: e.target.value })} placeholder={f.noReg ? "Not registered" : "e.g. RCI CRR No. A12345"} disabled={saving || f.noReg} />
                  <span className="aa-chk"><input type="checkbox" checked={f.noReg} onChange={(e) => setF({ ...f, noReg: e.target.checked })} disabled={saving} /> I don&apos;t have one</span>
                </label>
              </div>
              <div className="aa-fld">
                <span>Signature</span>
                <SignaturePad value={f.sig} onChange={(v) => setF((x) => ({ ...x, sig: v }))} disabled={saving} />
              </div>
              {fmsg.text && <p className={`aa-msg${fmsg.err ? " err" : ""}`} role="status" style={{ margin: "10px 0 0" }}>{fmsg.text}</p>}
              <div className="aa-form-foot">
                {!valid && <small>Fill in your qualification, registration no. (or tick &quot;I don&apos;t have one&quot;) and signature.</small>}
                <button type="button" className="aa-btn" onClick={saveDetails} disabled={saving || !valid || (!changed && sent)}>{saving ? "Saving…" : sent ? "Save changes" : "Save & send for verification"}</button>
              </div>
            </div>
            <p className="aa-note" style={{ marginTop: 12 }}>You earn {Math.round(share * 100)}% of the fee for every assessment a client books with you; CYT keeps {100 - Math.round(share * 100)}% for running, scoring and reporting it.</p>
          </>
        )}
      </section>
    </>
  );
}

const AA_CSS = `
.aa-card { margin-bottom: 14px; }
.aa-head { margin-bottom: 12px; } .aa-head h2 { margin: 6px 0 4px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.aa-head p { margin: 0; font-size: 13.5px; color: #64748b; line-height: 1.55; }
.aa-incl { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; }
.aa-incl li { margin: 0; font-size: 13px; color: #475569; padding-left: 18px; position: relative; }
.aa-incl li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 800; }
.aa-kick { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #92400e; background: #fde68a; border-radius: 999px; padding: 3px 9px; }
.aa-sum { margin-top: 12px; border: 1px solid #e3eae6; border-radius: 12px; padding: 12px 14px; }
.aa-sum-items { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px; }
.aa-sum-items span { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #64748b; }
.aa-sum-items b { display: block; font-size: 13.5px; color: #0f172a; margin-top: 2px; word-break: break-word; }
.aa-sum-items img { display: block; height: 40px; max-width: 160px; object-fit: contain; margin-top: 2px; }
.aa-sum-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eef2f0; }
.aa-sum-foot small { font-size: 12.5px; font-weight: 700; color: #92400e; } .aa-sum-foot small.ok { color: #166534; }
.aa-link { border: 0; background: none; padding: 0; font: inherit; font-size: 13px; font-weight: 800; color: #1d4ed8; cursor: pointer; text-decoration: underline; }
@media (max-width: 600px) { .aa-sum-items { grid-template-columns: 1fr; } }
.aa-form { margin-top: 12px; border: 1px solid #e3eae6; border-radius: 14px; padding: 14px 16px; }
.aa-form-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.aa-form-h b { font-size: 15px; color: #0f172a; }
.aa-st { font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 2px 10px; background: #fef3c7; color: #92400e; } .aa-st.ok { background: #dcfce7; color: #166534; }
.aa-form-p { margin: 4px 0 12px; font-size: 12.5px; color: #64748b; line-height: 1.5; }
.aa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.aa-fld { display: flex; flex-direction: column; gap: 5px; margin: 0; }
.aa-fld > span:not(.aa-chk) { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #64748b; }
.aa-fld input:not([type="checkbox"]) { height: 42px; border: 1.5px solid #d5e3da; border-radius: 10px; padding: 0 11px; font: inherit; font-size: 14px; color: #0f172a; background: #fff; width: 100%; }
.aa-fld input:not([type="checkbox"]):focus { outline: none; border-color: #16a34a; }
.aa-fld input:disabled { background: #f8faf9; }
.aa-fld small { font-size: 11.5px; color: #64748b; font-weight: 600; }
.aa-chk { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: #334155; cursor: pointer; }
.aa-chk input[type="checkbox"] { display: inline-block !important; position: static !important; opacity: 1 !important; visibility: visible !important; width: 16px; height: 16px; margin: 0; accent-color: #14532d; appearance: auto; -webkit-appearance: checkbox; flex: none; }
.aa-form-foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eef2f0; }
.aa-form-foot small { flex: 1 1 220px; font-size: 12px; color: #92400e; font-weight: 600; }
.aa-btn:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 600px) { .aa-grid { grid-template-columns: 1fr; } .aa-form-foot .aa-btn { width: 100%; } }
.aa-msg { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; }
.aa-msg.err { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
.aa-skel { height: 220px; border-radius: 12px; background: #f1f5f4; }
.aa-plan { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; border: 1.5px solid #e3eae6; border-radius: 14px; padding: 14px 16px; }
.aa-plan.on { border-color: #86efac; background: #f6fef9; }
.aa-plan > div:first-child { flex: 1 1 260px; } .aa-plan b { display: block; font-size: 15px; color: #0f172a; } .aa-plan span { display: block; font-size: 13px; color: #64748b; margin-top: 2px; }
.aa-plan.on > div:first-child b { color: #166534; }
.aa-price { font-size: 13px; color: #64748b; } .aa-price strong { font-size: 22px; color: #0f172a; } .aa-price s { color: #94a3b8; }
.aa-price em { display: block; font-style: normal; font-size: 11.5px; font-weight: 800; color: #b45309; }
.aa-btn { height: 42px; padding: 0 18px; border-radius: 11px; border: 0; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; }
.aa-btn:disabled { opacity: .6; }
.aa-btn.ghost { background: #fff; color: #166534; border: 1.5px solid #cfe3d6; }
.aa-reg { margin-top: 12px; border: 1px dashed #d5e3da; border-radius: 12px; padding: 12px 14px; }
.aa-reg label { display: block; font-size: 13px; font-weight: 800; color: #0f172a; } .aa-reg label span { font-weight: 500; color: #64748b; }
.aa-reg > div { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.aa-reg input:not([type="checkbox"]) { flex: 1 1 220px; height: 42px; border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 0 10px; font: inherit; font-size: 14px; }
.aa-reg input:not([type="checkbox"]):focus { outline: none; border-color: #16a34a; }
.aa-reg-h { display: block; font-size: 14px; color: #0f172a; margin-bottom: 10px; } .aa-reg-h span { font-weight: 500; color: #64748b; font-size: 12.5px; }
.aa-reg label.aa-noreg { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; }
.aa-reg label.aa-noreg input { width: 18px; height: 18px; margin: 0; accent-color: #166534; flex: none; appearance: auto; -webkit-appearance: checkbox; opacity: 1; position: static; }
.aa-reg-foot { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
.aa-reg-foot small { margin-top: 0 !important; }
.aa-note.warn { color: #92400e; margin-top: 8px; }
.aa-reg small { display: block; margin-top: 6px; font-size: 12.5px; color: #92400e; font-weight: 700; } .aa-reg small.ok { color: #166534; }
.aa-h3 { margin: 20px 0 4px; font-size: 15px; font-weight: 800; color: #0f172a; font-family: inherit; }
.aa-note { margin: 0 0 10px; font-size: 13px; color: #64748b; line-height: 1.55; } .aa-note a { color: #166534 !important; font-weight: 800; }
.aa-table { border: 1px solid #e3eae6; border-radius: 12px; overflow: hidden; margin-bottom: 10px; }
.aa-row { display: grid; grid-template-columns: minmax(0, 1fr) 110px 130px; gap: 10px; align-items: center; padding: 9px 14px; border-top: 1px solid #eef2f0; font-size: 13.5px; }
.aa-row:first-child { border-top: 0; }
.aa-name b { margin-right: 6px; color: #166534; } .aa-pay { font-weight: 800; text-align: right; } .aa-pay s { color: #94a3b8; font-weight: 500; }
.aa-earn { text-align: right; color: #166534; font-weight: 700; font-size: 12.5px; }
@media (max-width: 600px) { .aa-row { grid-template-columns: 1fr auto; } .aa-earn { grid-column: 1 / -1; text-align: left; } }
`;
