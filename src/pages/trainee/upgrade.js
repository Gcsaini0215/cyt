import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi, fmtDate } from "../../utils/trainee-api";

/* Upgrade internship: move to more hours and pay only the difference from the plan already bought.
   Plans and fees are the same as the internship application; the server decides the amount. */
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function loadRazorpay() {
  if (typeof window === "undefined" || window.Razorpay || document.getElementById("rzp-checkout-js")) return;
  const el = document.createElement("script");
  el.id = "rzp-checkout-js";
  el.src = "https://checkout.razorpay.com/v1/checkout.js";
  document.body.appendChild(el);
}
const waitForRazorpay = (timeout = 12000) => new Promise((resolve, reject) => {
  if (window.Razorpay) { resolve(); return; }
  const start = Date.now();
  const iv = setInterval(() => {
    if (window.Razorpay) { clearInterval(iv); resolve(); } else if (Date.now() - start > timeout) { clearInterval(iv); reject(new Error("Payment window didn't load. Check your internet and try again.")); }
  }, 150);
});

function Upgrade() {
  const { me, profile } = useTraineePortal();
  const [info, setInfo] = useState(null);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const paid = useRef(false);

  const load = async () => {
    const r = await tApi("/trainee-portal/upgrade");
    if (r.status) { setInfo(r.data); setPick((p) => p || r.data.options?.[0]?.hours || ""); } else setErr(r.message || "Couldn't load your plan");
  };
  useEffect(() => { load(); loadRazorpay(); }, []);

  const pay = async () => {
    setErr(""); setBusy(true);
    const od = await tApi("/trainee-portal/upgrade/order", { method: "POST", body: { hours: pick } });
    if (!od.status) { setErr(od.message || "Couldn't start payment"); setBusy(false); return; }
    try { await waitForRazorpay(); } catch (e) { setErr(e.message); setBusy(false); return; }
    paid.current = false;
    const rzp = new window.Razorpay({
      key: od.data.keyId,
      amount: Math.round(od.data.amount * 100),
      currency: "INR",
      order_id: od.data.orderId,
      name: "Choose Your Therapist",
      description: `Internship upgrade to ${pick}`,
      prefill: { name: me?.name, email: me?.email, contact: profile?.phone || me?.phone },
      theme: { color: "#1b5e20" },
      handler: async (resp) => {
        paid.current = true;
        let r = null;
        for (let i = 0; i < 3 && !r?.status; i += 1) {
          // the money is taken — retry a dropped reply before giving up
          r = await tApi("/trainee-portal/upgrade/verify", { method: "POST", body: resp }); // eslint-disable-line no-await-in-loop
        }
        setBusy(false);
        if (!r?.status) { setErr(`${r?.message || "We couldn't confirm the upgrade."} Payment ID: ${resp.razorpay_payment_id}`); return; }
        setDone({ to: pick, paymentId: resp.razorpay_payment_id });
        setPick("");
        load();
      },
      modal: { ondismiss: () => { if (!paid.current) { setBusy(false); setErr("Payment was cancelled."); } } },
    });
    rzp.on("payment.failed", (resp) => { setBusy(false); setErr(`Payment failed${resp?.error?.description ? ` — ${resp.error.description}` : ""}. Please try again.`); });
    rzp.open();
  };

  if (!info) return err ? <div className="tl-err">{err}</div> : <div className="tp-load">Loading your plan…</div>;

  const head = (
    <div className="tp-h">
      <div>
        <h1>Upgrade internship</h1>
        <p>Add more hours to your internship — you only pay the difference.</p>
      </div>
    </div>
  );

  if (!info.application) {
    return (
      <>
        {head}
        <div className="tp-card tp-empty">
          <i className="feather-file-plus" aria-hidden="true" />
          <b>You haven&apos;t applied for the internship yet</b>
          Apply first — then you can upgrade your hours here any time.
          <div style={{ marginTop: 16 }}><Link href="/internship-registration" className="tl-btn">Apply for the internship <i className="feather-arrow-right" aria-hidden="true" /></Link></div>
        </div>
      </>
    );
  }

  const chosen = info.options.find((o) => o.hours === pick);
  return (
    <>
      {head}
      {done && (
        <div className="up-done" role="status">
          <i className="feather-check-circle" aria-hidden="true" />
          <div><b>Upgraded to {done.to}!</b> We&apos;ve emailed your receipt. Payment ID: {done.paymentId}</div>
        </div>
      )}
      <div className="up-cur tp-card">
        <div>
          <span className="up-k">Your current plan</span>
          <h2>{info.hours || "—"} <small>{info.duration}</small></h2>
          <span className="up-fee">Plan value {inr(info.fee)}{info.paid ? "" : " · payment not verified"}</span>
        </div>
        <div className="up-cur-ic" aria-hidden="true"><i className="feather-layers" /></div>
      </div>

      {info.options.length === 0 ? (
        <div className="tp-card tp-empty"><i className="feather-star" aria-hidden="true" /><b>You&apos;re on our biggest plan</b>There&apos;s nothing to upgrade — enjoy your internship!</div>
      ) : (
        <>
          <h3 className="up-h">Choose your new plan</h3>
          <div className="up-grid" role="radiogroup" aria-label="Upgrade plans">
            {info.options.map((o) => (
              <button key={o.hours} type="button" role="radio" aria-checked={pick === o.hours} className={`up-opt${pick === o.hours ? " on" : ""}`} onClick={() => setPick(o.hours)}>
                <span className="up-tick" aria-hidden="true"><i className="feather-check" /></span>
                <b>{o.hours}</b>
                <small>{o.duration}</small>
                <span className="up-pay">Pay {inr(o.pay)}</span>
                <span className="up-full">Full plan {inr(o.fee)} · +{parseInt(o.hours, 10) - parseInt(info.hours, 10)} hrs</span>
              </button>
            ))}
          </div>
          <div className="up-sum tp-card">
            <div>
              <span>{info.hours} → <b>{chosen?.hours || "—"}</b></span>
              <strong>{chosen ? inr(chosen.pay) : "—"}</strong>
              <small>You already paid for {info.hours}. Secure payment by Razorpay.</small>
            </div>
            <button type="button" className="tl-btn gold up-btn" onClick={pay} disabled={!chosen || busy}>
              <i className="feather-lock" aria-hidden="true" /> {busy ? "Opening payment…" : chosen ? `Pay ${inr(chosen.pay)} & upgrade` : "Choose a plan"}
            </button>
          </div>
          {err && <div className="tl-err">{err}</div>}
        </>
      )}

      {info.upgrades?.length > 0 && (
        <div className="tp-card up-hist">
          <h3>Past upgrades</h3>
          {info.upgrades.map((u) => (
            <div key={u.paymentId} className="up-row"><span>{u.from} → <b>{u.to}</b></span><span>{inr(u.amount)}</span><small>{fmtDate(u.at)}</small></div>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.up-done { display: flex; gap: 12px; align-items: center; background: #ecf7ef; border: 1px solid #cfe9d8; color: #14532d; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; font-size: 14px; }
.up-done i { font-size: 22px; color: #15803d; }
.up-cur { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: linear-gradient(135deg, #14532d, #1e7a4c); border: none; color: #fff; }
.up-k { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #ecc77d; }
.up-cur h2 { margin: 6px 0 2px; font-size: 30px; font-weight: 800; color: #fff; }
.up-cur h2 small { font-size: 15px; font-weight: 700; color: #cfe9d8; margin-left: 6px; }
.up-fee { font-size: 13.5px; color: #cfe9d8; }
.up-cur-ic { width: 60px; height: 60px; border-radius: 16px; background: rgba(255,255,255,.12); display: grid; place-items: center; font-size: 26px; color: #ecc77d; flex-shrink: 0; }
.up-h { margin: 24px 0 12px; font-size: 17px; font-weight: 800; color: #0f172a; }
.up-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.up-opt { position: relative; text-align: left; background: #fff; border: 1.5px solid #e2e8e4; border-radius: 16px; padding: 16px; cursor: pointer; font: inherit; display: flex; flex-direction: column; gap: 2px; transition: border-color .15s, box-shadow .15s; }
.up-opt:hover { border-color: #b7dcc4; }
.up-opt.on { border-color: #c9962c; box-shadow: 0 0 0 3px rgba(212,161,47,.18); background: #fffdf6; }
.up-opt b { font-size: 21px; font-weight: 800; color: #0f172a; }
.up-opt small { font-size: 13px; color: #64748b; font-weight: 700; }
.up-pay { margin-top: 10px; font-size: 16px; font-weight: 800; color: #14532d; }
.up-full { font-size: 12px; color: #94a3b8; font-weight: 600; }
.up-tick { position: absolute; top: 12px; right: 12px; width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #d7e0db; display: grid; place-items: center; font-size: 12px; color: transparent; }
.up-opt.on .up-tick { background: #c9962c; border-color: #c9962c; color: #fff; }
.up-sum { margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.up-sum > div { display: flex; flex-direction: column; gap: 2px; }
.up-sum span { font-size: 14px; color: #475569; }
.up-sum strong { font-size: 28px; font-weight: 800; color: #0f172a; }
.up-sum small { font-size: 12.5px; color: #94a3b8; }
.up-btn { height: 50px; padding: 0 24px; font-size: 15px; }
.up-hist { margin-top: 16px; }
.up-hist h3 { margin: 0 0 8px; font-size: 16px; font-weight: 800; }
.up-row { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 10px 0; border-top: 1px solid #eef2f0; font-size: 14px; }
.up-row small { color: #94a3b8; }
@media (max-width: 640px) { .up-grid { grid-template-columns: 1fr 1fr; } .up-cur h2 { font-size: 24px; } .up-btn { width: 100%; } .up-opt b { font-size: 18px; } }
`;

export default function UpgradePage() {
  return <TraineeLayout title="Upgrade internship"><Upgrade /></TraineeLayout>;
}
