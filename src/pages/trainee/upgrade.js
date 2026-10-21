import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi, fmtDate } from "../../utils/trainee-api";

/* Upgrade internship: move to a bigger plan — it costs that plan's full price, the same as when applying.
   Plans and fees are the same as the internship application; the server decides the amount. */
const LADDER = ["30 hrs", "40 hrs", "60 hrs", "80 hrs", "100 hrs", "120 hrs", "240 hrs"];
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
  const { me, profile, live } = useTraineePortal();
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
  useEffect(() => { if (live) load(); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <p>Move to a bigger plan with more hours and a longer duration.</p>
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
      <section className="tp-card up-cur">
        <div className="up-cur-top">
          <div className="up-cur-l">
            <span className="up-k">Your current plan</span>
            <div className="up-cur-h"><b>{info.hours || "—"}</b><span>{info.duration}</span></div>
          </div>
          <span className={`up-st ${info.free ? "free" : info.paid ? "paid" : "due"}`}>
            <i className={info.free ? "feather-gift" : info.paid ? "feather-check-circle" : "feather-alert-circle"} aria-hidden="true" />
            {info.free ? "Free plan from CYT" : info.paid ? `Paid · ${inr(info.fee)}` : "Payment not verified"}
          </span>
        </div>
        <ol className="up-ladder" aria-label="All internship plans">
          {LADDER.map((h) => {
            const n = parseInt(h, 10);
            const curN = parseInt(info.hours, 10) || 0;
            const st = n < curN ? "past" : n === curN ? "cur" : "next";
            const canPick = st === "next" && info.options.some((o) => o.hours === h);
            return (
              <li key={h} className={`${st}${pick === h ? " picked" : ""}`}>
                <button type="button" disabled={!canPick} onClick={() => setPick(h)} aria-label={st === "cur" ? `${h} — your plan` : h}>
                  <span className="dot">{st === "past" ? <i className="feather-check" aria-hidden="true" /> : st === "cur" ? "You" : ""}</span>
                  <span className="lbl">{n}<small>hrs</small></span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

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
                <span className="up-pay">{inr(o.pay)}</span>
                <span className="up-full">+{parseInt(o.hours, 10) - parseInt(info.hours, 10)} hrs · ≈ {inr(Math.round(o.pay / parseInt(o.hours, 10)))}/hr</span>
              </button>
            ))}
          </div>
          <div className="up-sum tp-card">
            <div>
              <span>{info.hours} → <b>{chosen?.hours || "—"}</b></span>
              <strong>{chosen ? inr(chosen.pay) : "—"}</strong>
              <small>Full price of the {chosen?.hours || "new"} plan. Secure payment by Razorpay.</small>
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
          <h3>Plan history</h3>
          {info.upgrades.map((u) => (
            <div key={u.paymentId} className="up-row"><span>{u.from ? <>{u.from} → </> : null}<b>{u.to}</b></span><span>{u.amount ? inr(u.amount) : <em className="up-free">Free</em>}</span><small>{fmtDate(u.at)}</small></div>
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
.up-cur { padding: 20px 22px; border-left: 4px solid #d4a24c; background: linear-gradient(135deg, #fffdf7 0%, #fff 55%); }
.up-cur-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.up-k { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8a5a0b; }
.up-cur-h { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
.up-cur-h b { font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: -.02em; line-height: 1.1; }
.up-cur-h span { font-size: 15px; font-weight: 700; color: #64748b; }
.up-st { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; border-radius: 999px; padding: 6px 12px; white-space: nowrap; }
.up-st.paid { background: #ecf7ef; color: #166534; }
.up-st.free { background: #fff6dc; color: #8a5a0b; }
.up-st.due { background: #fef2f2; color: #b91c1c; }
.up-ladder { list-style: none; margin: 20px 0 0; padding: 0; display: grid; grid-template-columns: repeat(7, 1fr); }
.up-ladder li { position: relative; display: flex; justify-content: center; }
.up-ladder li:not(:last-child)::after { content: ""; position: absolute; top: 15px; left: calc(50% + 16px); right: calc(-50% + 16px); height: 3px; border-radius: 2px; background: #e8ede9; }
.up-ladder li.past::after { background: #22a35a; }
.up-ladder button { border: 0; background: none; padding: 0; font: inherit; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; position: relative; z-index: 1; }
.up-ladder button:disabled { cursor: default; }
.up-ladder .dot { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 10px; font-weight: 800; border: 2px solid #dfe6e1; background: #fff; color: #94a3b8; transition: transform .15s, box-shadow .15s; }
.up-ladder .past .dot { background: #15803d; border-color: #15803d; color: #fff; font-size: 13px; }
.up-ladder .cur .dot { background: linear-gradient(135deg, #f3d27a, #c9962c); border-color: #c9962c; color: #3b2a05; box-shadow: 0 0 0 5px rgba(212,161,47,.2); }
.up-ladder .next button:not(:disabled):hover .dot { border-color: #c9962c; transform: scale(1.08); }
.up-ladder .picked .dot { border-color: #c9962c; box-shadow: 0 0 0 4px rgba(212,161,47,.18); background: #fffaf0; }
.up-ladder .lbl { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1; }
.up-ladder .lbl small { font-size: 10.5px; font-weight: 700; color: #94a3b8; margin-left: 2px; }
.up-ladder .past .lbl { color: #64748b; }
.up-ladder .cur .lbl { color: #8a5a0b; }
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
.up-free { font-style: normal; font-size: 12px; font-weight: 800; color: #15803d; background: #ecf7ef; border-radius: 999px; padding: 2px 10px; }
@media (max-width: 640px) { .up-grid { grid-template-columns: 1fr 1fr; } .up-cur-h b { font-size: 26px; } .up-ladder .dot { width: 26px; height: 26px; } .up-ladder li:not(:last-child)::after { top: 12px; left: calc(50% + 13px); right: calc(-50% + 13px); } .up-ladder .lbl { font-size: 12px; } .up-ladder .lbl small { display: none; } .up-cur { padding: 16px; } .up-btn { width: 100%; } .up-opt b { font-size: 18px; } }
`;

export default function UpgradePage() {
  return <TraineeLayout title="Upgrade internship"><Upgrade /></TraineeLayout>;
}
