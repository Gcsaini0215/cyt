import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import Head from "next/head";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData, postData } from "../../utils/actions";
import { getTherapistProfile, BookTherapistUrl, imagePath, defaultProfile } from "../../utils/url";
import useUserStore from "../../store/userStore";
import { getToken, getDecodedToken } from "../../utils/jwt";

const G  = "#1a5c38";
const GL = "#228756";
const GB = "#f0fdf4";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONS[d.getMonth()]} · ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} IST`;
}

export default function TherapistCheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const { userInfo, fetchUserInfo } = useUserStore();

  const [profile,  setProfile]  = useState(null);
  const [pageLoad, setPageLoad] = useState(true);
  const [status,   setStatus]   = useState("init"); // init | booking | error | done
  const [err,      setErr]      = useState("");
  const bookedRef = useRef(false);

  const token       = typeof window !== "undefined" ? getToken() : null;
  const isLoggedIn  = !!token;

  // ── fetch therapist profile for display ──────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetchData(getTherapistProfile + id).then(res => {
      if (res?.status && res?.data) setProfile(res.data);
      setPageLoad(false);
    }).catch(() => setPageLoad(false));
  }, [id]);

  // ── fetch userInfo if logged in and not already loaded ───────────────────
  useEffect(() => {
    if (isLoggedIn && !userInfo?._id && fetchUserInfo) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  // ── trigger booking once everything is ready ─────────────────────────────
  useEffect(() => {
    if (!router.isReady || !id) return;
    if (bookedRef.current) return;                        // run only once
    if (isLoggedIn && !userInfo?._id) return;             // wait for userInfo to load

    // safety timeout — if still loading after 15s, show error
    const safetyTimer = setTimeout(() => {
      if (status === "booking" || status === "init") {
        setErr("Request timed out. Please go back and try again.");
        setStatus("error");
      }
    }, 15000);

    bookedRef.current = true;
    doBook().finally(() => clearTimeout(safetyTimer));
  }, [router.isReady, id, userInfo?._id]);

  // ── build payload and call backend ───────────────────────────────────────
  async function doBook() {
    setStatus("booking");
    setErr("");

    const q    = router.query;
    const isLI = isLoggedIn && !!(userInfo?._id && userInfo._id !== "");

    // Validate required query params
    if (!q.service || !q.format || !q.price) {
      setErr("Booking details missing. Please go back and try again.");
      setStatus("error");
      return;
    }

    const whom = isLI
      ? (q.booking_for === "other" ? "For Other" : "Self")
      : undefined;

    // If just logged in via OTP, userInfo may not be loaded yet —
    // use guest_email from query to identify the user on backend
    const guestEmail = q.guest_email || "";

    const payload = {
      is_logged_in: isLI,
      therapist:    id,
      service:      q.service,
      format:       q.format,
      amount:       Number(q.price  || 0),
      notes:        q.notes        || "",
      booking_date: q.booking_date || "",
      session_type: q.session_type || "",
      ...(whom !== undefined ? { whom } : {}),

      // logged-in: send user details
      ...(isLI ? {
        user_id: userInfo._id,
        name:    userInfo.name  || "",
        email:   userInfo.email || "",
        phone:   userInfo.phone || "",
      } : {
        // guest user: use name/phone from booking form + email from OTP login
        name:  userInfo?.name  || q.guest_name  || "",
        email: userInfo?.email || guestEmail    || "",
        phone: userInfo?.phone || q.guest_phone || "",
      }),

      // "for other" extra fields
      ...(q.booking_for === "other" ? {
        cname:                q.relation || "Patient",
        relation_with_client: q.relation || "Other",
        age:                  q.client_age ? Number(q.client_age) : undefined,
      } : {}),
    };

    console.log("[checkout] payload →", payload);

    try {
      const res = await postData(BookTherapistUrl, payload);
      console.log("[checkout] bookTherapist response →", res);

      if (res?.status && res?.data?.id) {
        await openRazorpay(res.data.id, Number(q.price || 0));
      } else {
        setErr(res?.message || "Booking failed. Please go back and try again.");
        setStatus("error");
      }
    } catch (e) {
      console.error("[checkout] error →", e);
      const msg = e?.response?.data?.message || e?.message || "Something went wrong.";
      setErr(msg);
      setStatus("error");
    }
  }

  // ── Razorpay ─────────────────────────────────────────────────────────────
  async function openRazorpay(bookingId, amount) {
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount, bookingId }),
      });
      const { orderId, error } = await orderRes.json();
      if (!orderId) {
        setErr(error || "Payment init failed. Please try again.");
        setStatus("error");
        return;
      }

      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      Math.round(amount * 100),
        currency:    "INR",
        order_id:    orderId,
        name:        "Choose Your Therapist",
        description: "Therapy Session Booking",
        handler: async function(response) {
          try {
            const verifyRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/verify-razorpay-payment`,
              {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  booking_id:          bookingId,
                }),
              }
            );
            const vd = await verifyRes.json();
            if (vd.status) {
              setStatus("done");
              router.replace(`/payment-success/${bookingId}?payment_id=${response.razorpay_payment_id}`);
            } else {
              setErr(vd.message || "Payment verification failed. Please contact support.");
              setStatus("error");
            }
          } catch {
            setErr("Payment verification failed. Please contact support.");
            setStatus("error");
          }
        },
        prefill: {
          name:    userInfo?.name  || "",
          email:   userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        theme: { color: G },
        modal: {
          ondismiss: function() {
            // user closed Razorpay — let them retry
            setStatus("error");
            setErr("Payment was cancelled. You can go back and try again.");
            bookedRef.current = false;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setErr("Payment failed to initialize. Please try again.");
      setStatus("error");
    }
  }

  function retry() {
    bookedRef.current = false;
    setStatus("init");
    setErr("");
    doBook();
  }

  // ── display values ────────────────────────────────────────────────────────
  const q        = router.query;
  const price    = Number(q.price    || 0);
  const discount = Number(q.discount || 0);
  const total    = Math.max(0, price - discount);
  const avatar   = profile?.user?.profile
    ? `${imagePath}/${profile.user.profile}` : defaultProfile;

  const summaryRows = [
    { icon: "feather-clipboard",  label: "Service",     val: q.service },
    { icon: "feather-layers",     label: "Format",      val: q.format  },
    { icon: "feather-monitor",    label: "Mode",        val: q.session_type === "video" ? "Video Call" : q.session_type === "audio" ? "Voice Call" : q.session_type === "in-person" ? "In-Person" : q.session_type },
    { icon: "feather-calendar",   label: "Date & Time", val: fmtDate(q.booking_date) },
    { icon: "feather-user",       label: "Patient",     val: q.booking_for === "other" ? (q.relation || "Someone else") : "Myself" },
  ].filter(r => r.val);

  const isWorking = status === "init" || status === "booking";

  return (
    <>
      <Head>
        <title>Confirming Booking | Choose Your Therapist</title>
      </Head>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _sp    { to { transform: rotate(360deg); } }
        @keyframes _fd    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _blink { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>

      <div id="__next" style={{ background: "#f4f6f8", minHeight: "100vh" }}>
        <MyNavbar />

        <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>
          <div style={{
            background: "#fff", borderRadius: 20, overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,.07)", animation: "_fd .35s ease",
          }}>

            {/* ── Green header ── */}
            <div style={{ background: G, padding: "24px 24px 22px" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
                Booking confirmation
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                {isWorking
                  ? "Setting up your appointment…"
                  : status === "error"
                  ? "Something went wrong"
                  : "All done!"}
              </div>
              {isWorking && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "_sp .7s linear infinite", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.75)", fontWeight: 600, animation: "_blink 2s ease infinite" }}>
                    {status === "booking" ? "Creating booking…" : "Loading…"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Therapist strip ── */}
            {!pageLoad && profile && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <img src={avatar} alt=""
                  style={{ width: 50, height: 50, borderRadius: 12, objectFit: "cover", objectPosition: "top", border: "2px solid #e2e8f0", flexShrink: 0 }}
                  onError={e => { e.target.src = defaultProfile; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{profile.user?.name}</div>
                  <div style={{ fontSize: 12, color: GL, fontWeight: 700, marginTop: 2 }}>{profile.profile_type}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: GB, border: "1px solid #bbf7d0", borderRadius: 8, padding: "5px 10px", flexShrink: 0 }}>
                  <i className="feather-shield" style={{ fontSize: 12, color: G }}></i>
                  <span style={{ fontSize: 11, fontWeight: 800, color: G }}>Verified</span>
                </div>
              </div>
            )}

            {/* ── Summary rows ── */}
            <div style={{ padding: "0 24px" }}>
              {summaryRows.map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: GB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <i className={row.icon} style={{ fontSize: 13, color: G }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: .4 }}>{row.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{row.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Price box ── */}
            <div style={{ margin: "16px 24px", background: GB, border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Payable</div>
                {discount > 0 && (
                  <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>
                    Coupon saves ₹{discount.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: G }}>
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>

            {/* ── Status area ── */}
            <div style={{ padding: "0 24px 28px" }}>
              {status === "error" ? (
                <>
                  {/* Error box */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                    <i className="feather-alert-circle" style={{ fontSize: 16, color: "#dc2626", flexShrink: 0, marginTop: 1 }}></i>
                    <div style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.5, fontWeight: 600 }}>{err}</div>
                  </div>
                  {/* Retry button */}
                  <button onClick={retry} style={{
                    width: "100%", height: 50, borderRadius: 12, border: "none",
                    background: G, color: "#fff", fontSize: 15, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
                  }}>
                    <i className="feather-refresh-cw" style={{ fontSize: 15 }}></i>
                    Retry Payment
                  </button>
                  <button onClick={() => router.back()} style={{
                    width: "100%", height: 48, borderRadius: 12,
                    border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <i className="feather-arrow-left" style={{ fontSize: 14 }}></i>
                    Go Back
                  </button>
                </>
              ) : (
                /* Working state — info text */
                <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
                    Please don't close this page.<br />
                    <strong style={{ color: "#0f172a" }}>Razorpay payment window</strong> will open automatically.
                  </div>
                </div>
              )}
            </div>

            {/* ── Trust badges ── */}
            <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 24px", display: "flex", justifyContent: "center", gap: 24 }}>
              {[
                { icon: "feather-shield",     t: "Secure"     },
                { icon: "feather-lock",       t: "Encrypted"  },
                { icon: "feather-refresh-cw", t: "Easy refund"},
              ].map(b => (
                <span key={b.t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                  <i className={b.icon} style={{ fontSize: 11, color: GL }}></i>{b.t}
                </span>
              ))}
            </div>

          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
