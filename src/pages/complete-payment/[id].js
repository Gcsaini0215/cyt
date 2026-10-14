import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { apiUrl, imagePath, defaultProfile, releaseBookingSlot } from "../../utils/url";
import { getToken, setToken } from "../../utils/jwt";
import { profilePath } from "../../utils/therapist-slug";

// "Complete payment" from the reminder email lands here: the session the client already filled in,
// ready to pay — no form again. The amount comes from the saved booking, not the URL.

const G = "#1a5c38";

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) + " IST";
}
const modeLabel = (m) => (m === "video" ? "Video call" : m === "audio" ? "Voice call" : m === "in-person" ? "In-person" : m);

function waitForRazorpay(timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (window.Razorpay) { clearInterval(iv); resolve(); }
      else if (Date.now() - t0 > timeout) { clearInterval(iv); reject(new Error("Payment library failed to load. Please check your connection and retry.")); }
    }, 150);
  });
}

const MSG = {
  paid: { t: "This session is already paid", d: "You're all set — your confirmation email has the details." },
  taken: { t: "This slot has been booked by someone else", d: "Sorry — that time isn't available any more. Please pick another slot with the same therapist." },
  past: { t: "This session time has passed", d: "Please pick a new slot with the therapist." },
  cancelled: { t: "This booking was cancelled", d: "Please book a new slot with the therapist." },
};

export default function CompletePaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [info, setInfo] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const paidRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${apiUrl}/booking/${id}/pay-info`)
      .then((r) => r.json())
      .then((r) => (r?.status ? setInfo(r.data) : setLoadErr(r?.message || "Booking not found.")))
      .catch(() => setLoadErr("Couldn't load your booking. Please check your connection and refresh."));
  }, [id]);

  async function pay() {
    if (busy || !info) return;
    setErr("");
    setBusy(true);
    try {
      await waitForRazorpay();
      const orderRes = await fetch(`${apiUrl}/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: info.amount, booking_id: info.id }),
      });
      const od = await orderRes.json();
      if (!od?.status || !od?.data?.id || !od?.key_id) {
        if (orderRes.status === 409) setInfo((i) => ({ ...i, state: /paid/i.test(od?.message || "") ? "paid" : "taken" }));
        else setErr(od?.message || "Could not start payment. Please try again.");
        setBusy(false);
        return;
      }
      paidRef.current = false;
      const rzp = new window.Razorpay({
        key: od.key_id,
        amount: Math.round(info.amount * 100),
        currency: "INR",
        order_id: od.data.id,
        name: "Choose Your Therapist",
        description: "Therapy Session Booking",
        theme: { color: "#228756" },
        handler: async (response) => {
          paidRef.current = true;
          const paymentId = response.razorpay_payment_id;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const vr = await fetch(`${apiUrl}/verify-razorpay-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: paymentId,
                  razorpay_signature: response.razorpay_signature,
                  booking_id: info.id,
                }),
              });
              const vd = await vr.json();
              if (vd.status) {
                if (vd.token && !getToken()) setToken(vd.token);
                router.replace(`/payment-success/${info.id}?payment_id=${paymentId}`);
                return;
              }
              if (vr.status < 500) break;
            } catch { /* retry */ }
            await new Promise((r) => setTimeout(r, 1500));
          }
          setErr(`Your payment went through (ID: ${paymentId}) but we couldn't confirm the booking. Please WhatsApp us with this payment ID and we'll sort it out right away.`);
          setBusy(false);
        },
        modal: {
          ondismiss: () => {
            if (paidRef.current) return;
            releaseBookingSlot(info.id);
            setErr("Payment was cancelled. You can try again whenever you're ready.");
            setBusy(false);
          },
        },
      });
      rzp.on("payment.failed", (resp) => {
        const why = resp?.error?.description;
        setErr(`Payment failed${why ? ` — ${why}` : ""}. Please retry or use a different payment method.`);
      });
      rzp.open();
    } catch (e) {
      setErr(e?.message || "Payment failed to start. Please try again.");
      setBusy(false);
    }
  }

  const t = info?.therapist;
  const avatar = t?.profile ? `${imagePath}/${t.profile}` : defaultProfile;
  const profileHref = t ? profilePath({ _id: t.id, profile_type: t.profile_type, state: t.state, user: { name: t.name } }) : "/view-all-therapist";
  const blocked = info && info.state !== "payable" ? MSG[info.state] : null;

  return (
    <>
      <Head>
        <title>Complete your payment | Choose Your Therapist</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div id="__next" style={{ background: "#f4f6f8", minHeight: "100vh" }}>
        <MyNavbar />
        <main className="cp">
          {!info && !loadErr && <div className="cp-card"><div className="cp-skel" /><div className="cp-skel s" /></div>}
          {loadErr && (
            <div className="cp-card cp-center">
              <h1>We couldn&apos;t find this booking</h1>
              <p>{loadErr}</p>
              <Link href="/view-all-therapist" className="cp-btn">Find a therapist</Link>
            </div>
          )}
          {info && (
            <div className="cp-card">
              <span className={`cp-eyebrow ${blocked ? (info.state === "paid" ? "ok" : "off") : ""}`}>{blocked ? (info.state === "paid" ? "Paid" : "Not available") : "Payment pending"}</span>
              <h1>{blocked ? blocked.t : "Complete your booking"}</h1>
              <p className="cp-sub">{blocked ? blocked.d : "Your session details are saved. Pay now to confirm — it's confirmed the moment payment succeeds."}</p>

              {t && (
                <div className="cp-ther">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatar} alt={t.name} onError={(e) => { e.currentTarget.src = defaultProfile; }} />
                  <div><b>{t.name}</b><span>{t.profile_type}</span></div>
                </div>
              )}
              <dl className="cp-rows">
                {[["Service", info.service], ["Format", info.format], ["Mode", modeLabel(info.session_type)], ["Date & time", fmtDate(info.booking_date)]]
                  .filter(([, v]) => v)
                  .map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                <div className="cp-total"><dt>Amount</dt><dd>₹{Number(info.amount || 0).toLocaleString("en-IN")}</dd></div>
              </dl>

              {err && <div className="cp-err" role="alert">{err}</div>}

              {!blocked && (
                <button type="button" className="cp-btn" onClick={pay} disabled={busy}>
                  {busy ? "Opening payment…" : `Pay ₹${Number(info.amount || 0).toLocaleString("en-IN")} & confirm`}
                </button>
              )}
              {blocked && info.state === "paid" && <Link href="/client/my-bookings" className="cp-btn">View my bookings</Link>}
              {blocked && info.state !== "paid" && <Link href={profileHref} className="cp-btn">Pick another slot</Link>}
              <p className="cp-fine">Secure payment by Razorpay · UPI, cards, net banking</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}

const CSS = `
.cp { max-width: 520px; margin: 0 auto; padding: 32px 16px 56px; font-family: Inter, -apple-system, "Segoe UI", sans-serif; }
.cp-card { background: #fff; border: 1px solid #e6ece8; border-radius: 20px; padding: 24px; box-shadow: 0 14px 34px -20px rgba(15,23,42,.22); }
.cp-center { text-align: center; }
.cp-eyebrow { display: inline-block; font-size: 11.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; background: #fef3c7; color: #92400e; }
.cp-eyebrow.ok { background: #dcfce7; color: #166534; }
.cp-eyebrow.off { background: #fee2e2; color: #b91c1c; }
.cp h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 10px 0 6px; line-height: 1.25; }
.cp-sub, .cp-card > p { font-size: 14px; color: #475569; margin: 0 0 18px; line-height: 1.5; }
.cp-ther { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; background: #f0fdf4; border: 1px solid #dcefe3; margin-bottom: 14px; }
.cp-ther img { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
.cp-ther b { display: block; font-size: 15px; color: #0f172a; }
.cp-ther span { font-size: 12.5px; color: #64748b; }
.cp-rows { margin: 0 0 16px; }
.cp-rows div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
.cp-rows dt { color: #64748b; font-weight: 500; }
.cp-rows dd { margin: 0; color: #0f172a; font-weight: 600; text-align: right; }
.cp-rows .cp-total { border-bottom: 0; padding-top: 14px; }
.cp-rows .cp-total dt, .cp-rows .cp-total dd { font-size: 17px; font-weight: 800; color: ${G}; }
.cp-err { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; border-radius: 12px; padding: 10px 12px; font-size: 13.5px; margin-bottom: 12px; }
.cp-btn { display: flex; align-items: center; justify-content: center; width: 100%; height: 50px; border: 0; border-radius: 14px; background: ${G}; color: #fff !important; font-size: 15.5px; font-weight: 800; text-decoration: none !important; cursor: pointer; }
.cp-btn:hover { background: #14532d; }
.cp-btn:disabled { opacity: .7; cursor: wait; }
.cp-fine { text-align: center; font-size: 12px !important; color: #94a3b8 !important; margin: 12px 0 0 !important; }
.cp-skel { height: 140px; border-radius: 14px; background: linear-gradient(90deg,#f1f5f3 25%,#e7efe9 50%,#f1f5f3 75%); background-size: 200% 100%; animation: cpSh 1.2s infinite; }
.cp-skel.s { height: 60px; margin-top: 12px; }
@keyframes cpSh { to { background-position: -200% 0; } }
`;
