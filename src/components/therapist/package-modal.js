import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { checkTherapistStatusUrl, verifyTherapistSubscriptionUrl } from "../../utils/url";
import { postData } from "../../utils/actions";

/* Listing packages for therapists. Same plans, prices and payment flow as /therapist-payment.
   A package buys a listing on CYT — never promise clients. */
export const PACKAGES = [
  { id: "1_month", label: "Monthly", amount: 999, days: 30, per: "Renew month to month", tag: null,
    points: ["Profile listed in our therapist directory", "Verified badge on your profile", "Booking & invoice tools"] },
  { id: "6_month", label: "6 months", amount: 4999, days: 182, per: "₹833 / month", tag: "Most popular",
    points: ["Profile listed in our therapist directory", "Verified badge on your profile", "Priority placement in directory search", "Booking, invoices, client records & notes"] },
  { id: "annual", label: "12 months", amount: 7300, days: 365, per: "₹608 / month", tag: "Best value",
    points: ["Everything in 6 months", "“Top Pick” badge on your profile", "Year-long listing, no mid-year renewal"] },
];
const TERMS_VERSION = "2026-10"; // same as /therapist-payment
export const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
// "≈ ₹33 / day" — what the package works out to per day of listing
export const perDay = (pk) => `≈ ₹${Math.round(pk.amount / pk.days)} / day`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const daysLeft = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PackageModal({ initialEmail = "", onClose }) {
  const [email, setEmail] = useState(initialEmail);
  const [checking, setChecking] = useState(false);
  const [checkErr, setCheckErr] = useState("");
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !paying) onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, paying]);

  const check = async () => {
    setCheckErr(""); setProfile(null); setDone(null); setPayErr("");
    if (!validEmail(email)) { setCheckErr("Enter the email you registered with"); return; }
    setChecking(true);
    try {
      const res = await postData(checkTherapistStatusUrl, { email: email.trim() });
      setProfile(res.data);
    } catch (e) {
      setCheckErr(e.response?.data?.message || "No therapist profile found for this email");
    }
    setChecking(false);
  };

  // came from "Check status" with an email already typed: look it up straight away
  useEffect(() => { if (initialEmail && validEmail(initialEmail)) check(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sub = profile?.subscription;
  const approved = profile?.stage === "approved";
  const live = Boolean(profile?.isLive && sub?.expiresAt && daysLeft(sub.expiresAt) > 0);
  const chosen = PACKAGES.find((p) => p.id === plan);

  async function pay() {
    if (!chosen) { setPayErr("Choose a package first"); return; }
    if (!agreed) { setPayErr("Please tick the box to accept the listing charge and the 70:30 split"); return; }
    setPayErr(""); setPaying(true);
    try {
      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection.");
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: chosen.amount, bookingId: `sub_${email.trim()}_${Date.now()}` }),
      });
      const { orderId, error } = await orderRes.json();
      if (!orderId) throw new Error(error || "Payment init failed. Please try again.");
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(chosen.amount * 100),
        currency: "INR",
        order_id: orderId,
        name: "Choose Your Therapist",
        description: `Therapist listing — ${chosen.label}`,
        prefill: { name: profile?.name || "", email: email.trim(), contact: profile?.phone || "" },
        theme: { color: "#0f3d24" },
        handler: async (response) => {
          try {
            const v = await postData(verifyTherapistSubscriptionUrl, {
              email: email.trim(), plan: chosen.id, terms_accepted: true, terms_version: TERMS_VERSION,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (v.status) { setDone(v.data); setProfile((p) => ({ ...p, isLive: true, subscription: v.data })); }
            else setPayErr(v.message || "Payment verification failed. Please contact support.");
          } catch (e) {
            setPayErr(e.response?.data?.message || "Payment verification failed. Please contact support.");
          }
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (e) {
      setPayErr(e.message || "Payment failed to start. Please try again.");
      setPaying(false);
    }
  }

  return createPortal(
    <div className="pm-bg" onClick={() => !paying && onClose()}>
      <style dangerouslySetInnerHTML={{ __html: PM_CSS }} />
      <div className="pm" role="dialog" aria-modal="true" aria-labelledby="pm-title" onClick={(e) => e.stopPropagation()}>
        <div className="pm-head">
          <div>
            <h3 id="pm-title">Listing packages</h3>
            <p>Subscribe, renew or upgrade your CYT profile listing.</p>
          </div>
          <button type="button" className="pm-x" onClick={onClose} disabled={paying} aria-label="Close"><i className="feather-x" /></button>
        </div>

        <form className="pm-email" onSubmit={(e) => { e.preventDefault(); check(); }} noValidate>
          <input type="email" inputMode="email" autoComplete="email" value={email} placeholder="Your registered email"
            onChange={(e) => { setEmail(e.target.value); setProfile(null); setCheckErr(""); setDone(null); }} />
          <button type="submit" disabled={checking}>{checking ? "Checking…" : "Check"}</button>
        </form>
        {checkErr && <p className="pm-err" role="alert">{checkErr}</p>}

        {profile && (
          <div className={`pm-status ${live ? "live" : approved ? "due" : "wait"}`}>
            {live ? (
              <>
                <b><i className="feather-check-circle" /> {profile.name ? `${profile.name}, your` : "Your"} profile is live</b>
                <span>Current package: <strong>{PACKAGES.find((p) => p.id === sub.plan)?.label || sub.plan || "—"}</strong> · valid until <strong>{fmtDate(sub.expiresAt)}</strong></span>
                <span className="pm-days">{daysLeft(sub.expiresAt)} day{daysLeft(sub.expiresAt) === 1 ? "" : "s"} left</span>
              </>
            ) : approved ? (
              <>
                <b><i className="feather-alert-circle" /> {sub?.expiresAt ? "Your listing has expired" : "Approved — not live yet"}</b>
                <span>{sub?.expiresAt ? <>It ended on <strong>{fmtDate(sub.expiresAt)}</strong>. Pick a package to go live again.</> : "Pick a package below to put your profile live."}</span>
              </>
            ) : (
              <>
                <b><i className="feather-clock" /> {profile.stage === "email_pending" ? "Email verification pending" : "Application under review"}</b>
                <span>You can buy a package once your profile is approved. Here&rsquo;s what&rsquo;s available.</span>
              </>
            )}
          </div>
        )}

        {done ? (
          <div className="pm-done">
            <i className="feather-check" />
            <b>Payment received — thank you!</b>
            <span>Your listing is active until <strong>{fmtDate(done.expiresAt)}</strong>.</span>
            <button type="button" className="pm-pay" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="pm-grid" role="radiogroup" aria-label="Packages">
              {PACKAGES.map((pk) => {
                const on = plan === pk.id;
                const current = live && sub?.plan === pk.id;
                return (
                  <button type="button" key={pk.id} role="radio" aria-checked={on} className={`pm-card ${on ? "on" : ""}`}
                    onClick={() => { setPlan(pk.id); setPayErr(""); }}>
                    {current ? <span className="pm-tag cur">Current plan</span> : pk.tag && <span className="pm-tag">{pk.tag}</span>}
                    <span className="pm-radio">{on && <i className="feather-check" />}</span>
                    <span className="pm-label">{pk.label}</span>
                    <span className="pm-price">{inr(pk.amount)}</span>
                    <span className="pm-day">{perDay(pk)}</span>
                    <span className="pm-per">{pk.per}</span>
                    <ul>{pk.points.map((pt) => <li key={pt}><i className="feather-check" /> {pt}</li>)}</ul>
                  </button>
                );
              })}
            </div>

            <ul className="pm-terms">
              <li><b>Listing charge:</b> the package is a fee to list your profile on Choose Your Therapist for the chosen period. Plans don&rsquo;t auto-renew; fees are non-refundable once live.</li>
              <li><b>70:30 on every booking:</b> for each session booked through CYT, 70% of the fee goes to you and 30% to CYT.</li>
              <li>Packages are for listing and visibility — bookings depend on your profile, availability and client demand.</li>
            </ul>
            <label className={`pm-check ${agreed ? "on" : ""}`}>
              <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setPayErr(""); }} />
              <span>Yes, I have read and agree to the <b>website listing charge</b> and the <b>70:30 split for every booking</b>.</span>
            </label>
            {payErr && <p className="pm-err" role="alert">{payErr}</p>}
            <button type="button" className="pm-pay" onClick={pay}
              disabled={paying || !approved || !chosen || !agreed}
              title={!profile ? "Check your email first" : !approved ? "Available after your profile is approved" : ""}>
              {paying ? "Opening payment…"
                : !profile ? "Enter your email to continue"
                : !approved ? "Available after approval"
                : !chosen ? "Choose a package"
                : `${live ? "Renew / upgrade" : "Subscribe"} — ${inr(chosen.amount)}`}
            </button>
            {live && chosen && (
              <p className="pm-note">A new package starts from today — the {daysLeft(sub.expiresAt)} day{daysLeft(sub.expiresAt) === 1 ? "" : "s"} left on your current package are not added on top.</p>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

const PM_CSS = `
.pm-bg { position: fixed; inset: 0; z-index: 100001; background: rgba(10,30,20,.35); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; font-family: 'Inter', system-ui, sans-serif; }
.pm { width: 100%; max-width: 780px; max-height: calc(100dvh - 32px); overflow-y: auto; background: #fff; border-radius: 22px; padding: 22px 24px 20px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.4); }
.pm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.pm-head h3 { margin: 0; font-size: 21px; font-weight: 800; color: #0b1712; }
.pm-head p { margin: 4px 0 0; font-size: 14px; color: #64748b; }
.pm-x { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; border: 1px solid #dbe5df; background: #fff; color: #0b1712; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.pm-email { display: flex; gap: 8px; }
.pm-email input { flex: 1; min-width: 0; height: 46px; border-radius: 12px; border: 1.5px solid #dbe5df !important; background: #f8faf9 !important; padding: 0 14px !important; font-size: 15px; outline: none; box-shadow: none !important; }
.pm-email input:focus { border-color: #1e7a4c !important; background: #fff !important; }
.pm-email button { height: 46px; padding: 0 20px; border: none; border-radius: 12px; background: #0f3d24; color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; }
.pm-email button:disabled { opacity: .6; }
.pm-err { margin: 8px 0 0; font-size: 13px; color: #b91c1c; font-weight: 600; }
.pm-status { margin-top: 12px; padding: 12px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 3px; font-size: 13.5px; color: #334155; border: 1px solid; }
.pm-status b { display: flex; align-items: center; gap: 7px; font-size: 14.5px; color: #0b1712; }
.pm-status.live { background: #f0fdf4; border-color: #bbf7d0; }
.pm-status.live b i { color: #16a34a; }
.pm-status.due { background: #fffbeb; border-color: #fde68a; }
.pm-status.due b i { color: #d97706; }
.pm-status.wait { background: #eff6ff; border-color: #bfdbfe; }
.pm-status.wait b i { color: #2563eb; }
.pm-days { align-self: flex-start; margin-top: 4px; padding: 3px 10px; border-radius: 999px; background: #16a34a; color: #fff; font-size: 12px; font-weight: 800; }
.pm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
.pm-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 2px; padding: 18px 14px 14px; border-radius: 14px; border: 1.5px solid #dbe5df; background: #fff; cursor: pointer; font-family: inherit; transition: border-color .15s, box-shadow .15s, background .15s; }
.pm-card:hover { border-color: #9fcdb2; }
.pm-card.on { border-color: #1e7a4c; background: #f3faf6; box-shadow: 0 0 0 3px #dcefe3; }
.pm-tag { position: absolute; top: -10px; left: 12px; padding: 2px 9px; border-radius: 999px; background: #d4af37; color: #3a2d05; font-size: 10.5px; font-weight: 800; }
.pm-tag.cur { background: #16a34a; color: #fff; }
.pm-radio { position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #cbd5e1; background: #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; }
.pm-card.on .pm-radio { border-color: #1e7a4c; background: #1e7a4c; }
.pm-label { font-size: 13px; font-weight: 700; color: #475569; }
.pm-price { font-size: 25px; font-weight: 900; color: #0f3d24; line-height: 1.15; }
.pm-day { display: inline-block; margin: 3px 0 2px; padding: 2px 8px; border-radius: 999px; background: #e8f5ee; color: #166534; font-size: 12px; font-weight: 800; }
.pm-per { font-size: 12px; color: #64748b; margin-bottom: 8px; }
.pm-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.pm-card li { margin: 0; display: flex; gap: 6px; align-items: flex-start; font-size: 12.5px; color: #334155; line-height: 1.4; }
.pm-card li::before { content: none; }
.pm-card li i { color: #1e7a4c; font-size: 12px; margin-top: 2px; }
.pm-terms { margin: 16px 0 0; padding: 12px 14px 12px 30px; border-radius: 12px; background: #f8faf9; border: 1px solid #e3ebe6; font-size: 12.5px; color: #334155; line-height: 1.55; display: flex; flex-direction: column; gap: 5px; }
.pm-terms li { margin: 0; }
.pm-check { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #cbd5c9; background: #fafafa; cursor: pointer; font-size: 13.5px; color: #334155; line-height: 1.55; }
.pm-check.on { border-color: #86efac; background: #f0fdf4; color: #166534; }
.pm-check input { width: 18px; height: 18px; margin: 2px 0 0; flex-shrink: 0; accent-color: #1e7a4c; position: static; opacity: 1; }
.pm-pay { width: 100%; height: 50px; margin-top: 12px; border: none; border-radius: 12px; background: linear-gradient(135deg, #0f3d24, #1e7a4c); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
.pm-pay:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
.pm-note { margin: 8px 0 0; font-size: 12px; color: #64748b; text-align: center; }
.pm-done { margin-top: 16px; padding: 20px; border-radius: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #334155; }
.pm-done > i { width: 48px; height: 48px; border-radius: 50%; background: #16a34a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.pm-done b { font-size: 16px; color: #0b1712; }
@media (max-width: 680px) {
  .pm { padding: 18px 16px; border-radius: 18px; }
  .pm-grid { grid-template-columns: 1fr; gap: 14px; }
  .pm-email button { padding: 0 14px; }
}
`;
