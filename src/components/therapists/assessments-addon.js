import React, { useEffect, useState } from "react";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { FREE_TESTS } from "../self-assessment/tests";
import { clearAssessmentsUpgrade } from "./nav-extras";

/* Top of the Assessments page: the yearly "Clinical Assessments" add-on (bought here on Razorpay,
   priced by CYT in the admin panel) and what clients pay / the therapist earns for each assessment. */

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

  const load = () => fetchById(`${apiUrl}/therapist-addon`).then((r) => { setData(r?.data || null); clearAssessmentsUpgrade(); onChange && onChange(r?.data || null); }).catch(() => setMsg({ text: "Couldn't load — refresh to try again", err: true }));
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
        name: "Choose Your Therapist", description: "Clinical Assessments add-on — 1 year", theme: { color: "#0f3d24" },
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AA_CSS }} />
      <section className="pt-card aa-card" id="addon">
        <div className="aa-head">
          <span className="aa-kick">⭐ Upgrade</span>
          <h2>Clinical Assessments add-on</h2>
          <p>Let clients add a standard clinical assessment (PHQ-9, GAD-7, DASS-21, PCL-5 and more) when they book you. They answer it on CYT before the session, and you get an automatic report — the client sees it only after you release it.</p>
        </div>
        {msg.text && <p className={`aa-msg${msg.err ? " err" : ""}`} role="status">{msg.text}</p>}
        {!data ? <div className="aa-skel" /> : (
          <>
            <div className={`aa-plan${a.active ? " on" : ""}`}>
              <div>
                <b>{a.active ? "Active" : "Not active"}</b>
                <span>{a.active ? `Clients can add assessments when they book you · valid till ${fmtDate(a.till)}` : "Clients can't add assessments to bookings with you yet."}</span>
              </div>
              <div className="aa-price">
                {a.offer && <s>{inr(a.fee)}</s>} <strong>{a.price === 0 ? "Free" : inr(a.price)}</strong><small>/year</small>
                {a.offer && a.offerLabel && <em>{a.offerLabel}</em>}
              </div>
              <button type="button" className="aa-btn" onClick={buy} disabled={busy}>{busy ? "Please wait…" : a.active ? "Extend 1 year" : a.price === 0 ? "Activate free" : "Buy add-on"}</button>
            </div>

            <h3 className="aa-h3">What clients pay — and what you earn</h3>
            <p className="aa-note">Prices are set by CYT. You earn {Math.round(share * 100)}% of every assessment fee; CYT keeps {100 - Math.round(share * 100)}% for running the test, scoring it and building the report. Your session fee is unchanged.</p>
            <div className="aa-table">
              {FREE_TESTS.map((t) => {
                const p = data.tests?.[t.key];
                if (!p || !p.active) return null;
                return (
                  <div key={t.key} className="aa-row">
                    <span className="aa-name"><b>{t.short}</b>{t.title}</span>
                    <span className="aa-pay">{p.offer && <s>{inr(p.fee)}</s>} {inr(p.price)}</span>
                    <span className="aa-earn">You earn {inr(Math.round(p.price * share))}</span>
                  </div>
                );
              })}
            </div>
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
.aa-kick { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #92400e; background: #fde68a; border-radius: 999px; padding: 3px 9px; }
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
.aa-h3 { margin: 20px 0 4px; font-size: 15px; font-weight: 800; color: #0f172a; font-family: inherit; }
.aa-note { margin: 0 0 10px; font-size: 13px; color: #64748b; line-height: 1.55; } .aa-note a { color: #166534 !important; font-weight: 800; }
.aa-table { border: 1px solid #e3eae6; border-radius: 12px; overflow: hidden; margin-bottom: 10px; }
.aa-row { display: grid; grid-template-columns: minmax(0, 1fr) 110px 130px; gap: 10px; align-items: center; padding: 9px 14px; border-top: 1px solid #eef2f0; font-size: 13.5px; }
.aa-row:first-child { border-top: 0; }
.aa-name b { margin-right: 6px; color: #166534; } .aa-pay { font-weight: 800; text-align: right; } .aa-pay s { color: #94a3b8; font-weight: 500; }
.aa-earn { text-align: right; color: #166534; font-weight: 700; font-size: 12.5px; }
@media (max-width: 600px) { .aa-row { grid-template-columns: 1fr auto; } .aa-earn { grid-column: 1 / -1; text-align: left; } }
`;
