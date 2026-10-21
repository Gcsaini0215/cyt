import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi, fmtDate } from "../../utils/trainee-api";

/* Upgrade internship: within 7 days of getting the current plan an upgrade costs the difference (min ₹50 per
   extra hour, never more than full price); after that it costs the new plan's full price. Server decides.
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
  const curN = parseInt(info.hours, 10) || 0;
  const offer = info.offer || null;
  const daysLeft = offer?.active ? Math.max(1, Math.ceil((new Date(offer.endsAt).getTime() - Date.now()) / 86400000)) : 0;
  return (
    <>
      {head}
      {done && (
        <div className="up-done" role="status">
          <i className="feather-check-circle" aria-hidden="true" />
          <div><b>Upgraded to {done.to}!</b> We&apos;ve emailed your receipt. Payment ID: {done.paymentId}</div>
        </div>
      )}
      <div className="up-wrap">
        <div className="up-main">
          {/* current plan */}
          <section className="tp-card up-cur">
            <div className="up-cur-top">
              <div>
                <span className="up-k">Current plan</span>
                <div className="up-cur-h"><b>{info.hours || "—"}</b><span>{info.duration}</span></div>
              </div>
              <span className={`up-st ${info.free ? "free" : info.paid ? "paid" : "due"}`}>
                <i className={info.free ? "feather-gift" : info.paid ? "feather-check-circle" : "feather-alert-circle"} aria-hidden="true" />
                {info.free ? "Free plan" : info.paid ? `Paid · ${inr(info.fee)}` : "Not verified"}
              </span>
            </div>
            <ol className="up-ladder" aria-label="All internship plans">
              {LADDER.map((h) => {
                const n = parseInt(h, 10);
                const st = n < curN ? "past" : n === curN ? "cur" : "next";
                const canPick = st === "next" && info.options.some((o) => o.hours === h);
                return (
                  <li key={h} className={`${st}${pick === h ? " picked" : ""}`}>
                    <button type="button" disabled={!canPick} onClick={() => setPick(h)} aria-label={st === "cur" ? `${h} — your plan` : h}>
                      <span className="dot">{st === "past" ? <i className="feather-check" aria-hidden="true" /> : st === "cur" ? <i className="feather-star" aria-hidden="true" /> : ""}</span>
                      <span className="lbl">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          {offer && info.options.length > 0 && (offer.active ? (
            <div className="up-offer on" role="note">
              <i className="feather-zap" aria-hidden="true" />
              <div><b>Upgrade offer · {daysLeft} day{daysLeft === 1 ? "" : "s"} left</b>Pay only the difference until {fmtDate(offer.endsAt, { day: "numeric", month: "short" })}. After that, upgrades cost the full plan price.</div>
            </div>
          ) : offer.freePlan ? (
            <div className="up-offer off" role="note">
              <i className="feather-gift" aria-hidden="true" />
              <div><b>Your current plan is free from CYT</b>Upgrades are at the full plan price.</div>
            </div>
          ) : (
            <div className="up-offer off" role="note">
              <i className="feather-info" aria-hidden="true" />
              <div><b>Upgrade offer ended on {fmtDate(offer.endsAt, { day: "numeric", month: "short" })}</b>The offer runs for {offer.days} days after you get a plan — upgrades are now at the full plan price.</div>
            </div>
          ))}

          {/* choose */}
          {info.options.length === 0 ? (
            <div className="tp-card tp-empty"><i className="feather-star" aria-hidden="true" /><b>You&apos;re on our biggest plan</b>There&apos;s nothing to upgrade — enjoy your internship!</div>
          ) : (
            <section className="tp-card up-choose">
              <h3 className="up-h">Choose a bigger plan</h3>
              <div className="up-list" role="radiogroup" aria-label="Upgrade plans">
                {info.options.map((o) => (
                  <button key={o.hours} type="button" role="radio" aria-checked={pick === o.hours} className={`up-opt${pick === o.hours ? " on" : ""}`} onClick={() => setPick(o.hours)}>
                    <span className="up-radio" aria-hidden="true" />
                    <span className="up-o-t"><b>{o.hours}</b><small>{o.duration} · +{parseInt(o.hours, 10) - curN} hrs</small></span>
                    <span className="up-o-p"><b>{inr(o.pay)}</b>{o.pay < o.fee ? <small><s>{inr(o.fee)}</s> · save {inr(o.fee - o.pay)}</small> : <small>full price</small>}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="up-side">
          {info.options.length > 0 && (
            <section className="tp-card up-sum">
              <span className="up-k">Summary</span>
              <div className="up-sum-r"><span>New plan</span><b>{chosen ? `${chosen.hours} · ${chosen.duration}` : "—"}</b></div>
              <div className="up-sum-r"><span>Hours added</span><b>{chosen ? `+${parseInt(chosen.hours, 10) - curN} hrs` : "—"}</b></div>
              <div className="up-sum-t"><span>To pay</span><strong>{chosen ? inr(chosen.pay) : "—"}</strong></div>
              <button type="button" className="tl-btn gold up-btn" onClick={pay} disabled={!chosen || busy}>
                <i className="feather-lock" aria-hidden="true" /> {busy ? "Opening payment…" : chosen ? `Pay ${inr(chosen.pay)}` : "Choose a plan"}
              </button>
              <small className="up-note">{chosen?.offer && chosen.pay < chosen.fee ? `Offer price · valid till ${fmtDate(offer?.endsAt, { day: "numeric", month: "short" })}` : "Full price of the new plan"} · secure payment by Razorpay</small>
              {err && <div className="tl-err">{err}</div>}
            </section>
          )}
          {info.upgrades?.length > 0 && (
            <section className="tp-card up-hist">
              <span className="up-k">Plan history</span>
              {info.upgrades.map((u) => (
                <div key={u.paymentId} className="up-row">
                  <span>{u.from && u.from !== u.to ? <>{u.from} → </> : null}<b>{u.to}</b><small>{fmtDate(u.at)}</small></span>
                  {u.amount ? <em>{inr(u.amount)}</em> : <em className="up-free">Free</em>}
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.up-done { display: flex; gap: 10px; align-items: center; background: #ecf7ef; border: 1px solid #cfe9d8; color: #14532d; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; font-size: 13.5px; }
.up-done i { font-size: 18px; color: #15803d; }
.up-wrap { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 14px; align-items: start; max-width: 1040px; }
.up-main, .up-side { display: grid; gap: 14px; min-width: 0; }
.up-side { position: sticky; top: calc(var(--tl-h) + 16px); }
.up-wrap .tp-card { padding: 16px 18px; border-radius: 14px; }
.up-k { display: block; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8a5a0b; }
.up-cur { border-left: 3px solid #d4a24c; }
.up-cur-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.up-cur-h { display: flex; align-items: baseline; gap: 8px; margin-top: 2px; }
.up-cur-h b { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -.01em; line-height: 1.15; }
.up-cur-h span { font-size: 13px; font-weight: 700; color: #64748b; }
.up-st { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
.up-st.paid { background: #ecf7ef; color: #166534; }
.up-st.free { background: #fff6dc; color: #8a5a0b; }
.up-st.due { background: #fef2f2; color: #b91c1c; }
.up-ladder { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(7, 1fr); }
.up-ladder li { position: relative; display: flex; justify-content: center; }
.up-ladder li:not(:last-child)::after { content: ""; position: absolute; top: 10px; left: calc(50% + 11px); right: calc(-50% + 11px); height: 2px; border-radius: 2px; background: #e8ede9; }
.up-ladder li.past::after { background: #22a35a; }
.up-ladder button { border: 0; background: none; padding: 0; font: inherit; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; position: relative; z-index: 1; }
.up-ladder button:disabled { cursor: default; }
.up-ladder .dot { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; border: 2px solid #dfe6e1; background: #fff; color: #94a3b8; transition: transform .15s; }
.up-ladder .past .dot { background: #15803d; border-color: #15803d; color: #fff; }
.up-ladder .cur .dot { background: linear-gradient(135deg, #f3d27a, #c9962c); border-color: #c9962c; color: #3b2a05; box-shadow: 0 0 0 4px rgba(212,161,47,.18); }
.up-ladder .next button:not(:disabled):hover .dot { border-color: #c9962c; transform: scale(1.1); }
.up-ladder .picked .dot { border-color: #c9962c; background: #fff6dc; }
.up-ladder .lbl { font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1; }
.up-ladder .past .lbl { color: #94a3b8; }
.up-ladder .cur .lbl { color: #8a5a0b; }
.up-offer { display: flex; gap: 10px; align-items: flex-start; border-radius: 12px; padding: 10px 14px; font-size: 13px; line-height: 1.45; }
.up-offer b { display: block; font-size: 13.5px; }
.up-offer i { font-size: 17px; margin-top: 1px; }
.up-offer.on { background: linear-gradient(135deg, #fff6dc, #fffbef); border: 1px solid #f1dfae; color: #6b4a07; }
.up-offer.on i { color: #c9962c; }
.up-offer.off { background: #f6f8f7; border: 1px solid #e6ece8; color: #64748b; }
.up-offer.off b { color: #334155; }
.up-o-p s { color: #b0bac4; }
.up-h { margin: 0 0 10px; font-size: 14.5px; font-weight: 800; color: #0f172a; }
.up-list { display: grid; gap: 6px; }
.up-opt { display: flex; align-items: center; gap: 12px; text-align: left; background: #fff; border: 1.5px solid #e8ede9; border-radius: 11px; padding: 10px 14px; cursor: pointer; font: inherit; transition: border-color .15s, background .15s; }
.up-opt:hover { border-color: #cfe3d6; background: #fbfdfc; }
.up-opt.on { border-color: #c9962c; background: #fffdf6; }
.up-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #cbd5e1; flex-shrink: 0; box-sizing: border-box; }
.up-opt.on .up-radio { border: 5px solid #c9962c; }
.up-o-t { display: flex; flex-direction: column; min-width: 0; flex: 1; line-height: 1.25; }
.up-o-t b { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.up-o-t small, .up-o-p small { font-size: 11.5px; color: #94a3b8; font-weight: 600; }
.up-o-p { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.25; }
.up-o-p b { font-size: 14.5px; font-weight: 800; color: #14532d; }
.up-sum { display: flex; flex-direction: column; gap: 8px; }
.up-sum-r { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; color: #64748b; }
.up-sum-r b { color: #0f172a; font-weight: 700; text-align: right; }
.up-sum-t { display: flex; justify-content: space-between; align-items: baseline; padding-top: 8px; border-top: 1px dashed #e2e8e4; font-size: 13px; font-weight: 700; color: #475569; }
.up-sum-t strong { font-size: 22px; font-weight: 800; color: #0f172a; }
.up-btn { height: 42px; width: 100%; font-size: 14px; margin-top: 2px; }
.up-note { font-size: 11.5px; color: #94a3b8; text-align: center; }
.up-hist { display: grid; gap: 2px; }
.up-row { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 8px 0; border-top: 1px solid #f1f5f3; font-size: 13px; }
.up-row:first-of-type { border-top: 0; }
.up-row > span { display: flex; flex-direction: column; }
.up-row small { color: #94a3b8; font-size: 11.5px; }
.up-row em { font-style: normal; font-weight: 800; color: #0f172a; font-size: 13px; }
.up-row em.up-free { font-size: 11px; color: #15803d; background: #ecf7ef; border-radius: 999px; padding: 2px 9px; }
@media (max-width: 900px) { .up-wrap { grid-template-columns: 1fr; } .up-side { position: static; } }
@media (max-width: 640px) { .up-wrap .tp-card { padding: 14px; } .up-ladder .lbl { font-size: 11px; } }
`;

export default function UpgradePage() {
  return <TraineeLayout title="Upgrade internship"><Upgrade /></TraineeLayout>;
}
