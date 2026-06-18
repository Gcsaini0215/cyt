import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData } from "../../utils/actions";
import { getBookings, imagePath, defaultProfile } from "../../utils/url";

const G  = "#1a5c38";
const GL = "#228756";
const GB = "#f0fdf4";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { id, payment_id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick,    setTick]    = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData(getBookings).then(res => {
      if (res?.status && res?.data?.length) {
        const b = res.data.find(b => b._id === id);
        if (b) setBooking(b);
      }
      setLoading(false);
      setTimeout(() => setTick(true), 100);
    }).catch(() => setLoading(false));
  }, [id]);

  const therapistName = booking?.therapist?.user?.name || "Your Therapist";
  const therapistImg  = booking?.therapist?.user?.profile
    ? `${imagePath}/${booking.therapist.user.profile}` : defaultProfile;
  const service  = booking?.service  || "";
  const format   = booking?.format   || "";
  const pin      = booking?.otp      || "";
  const amount   = booking?.amount   || "";
  const dateStr  = fmtDate(booking?.booking_date);
  const timeStr  = fmtTime(booking?.booking_date);
  const mode     = booking?.session_type || "";

  const rows = [
    { icon: "feather-clipboard",  label: "Service",  val: service },
    { icon: "feather-monitor",    label: "Format",   val: format  },
    { icon: "feather-video",      label: "Mode",     val: mode === "video" ? "Video Call" : mode === "audio" ? "Voice Call" : mode === "in-person" ? "In-Person" : mode },
    { icon: "feather-calendar",   label: "Date",     val: dateStr },
    { icon: "feather-clock",      label: "Time",     val: timeStr ? `${timeStr} IST` : null },
    { icon: "feather-hash",       label: "Session PIN", val: pin  },
    { icon: "feather-credit-card",label: "Amount Paid", val: amount ? `₹${Number(amount).toLocaleString("en-IN")}` : null },
    { icon: "feather-file-text",  label: "Transaction", val: payment_id ? `${String(payment_id).slice(0,18)}…` : null },
  ].filter(r => r.val);

  return (
    <>
      <Head>
        <title>Booking Confirmed | Choose Your Therapist</title>
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes _tick {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          80%  { transform: scale(.94) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes _ring {
          0%   { transform: scale(.6); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes _fd {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes _pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,135,86,.4); }
          50%       { box-shadow: 0 0 0 12px rgba(34,135,86,0); }
        }

        .ps-wrap { background: #f4f6f8; min-height: 100vh; }
        .ps-card {
          max-width: 480px; margin: 0 auto;
          background: #fff; border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,.08);
          overflow: hidden;
          animation: _fd .4s ease;
        }

        /* green header */
        .ps-hdr {
          background: ${G};
          padding: 36px 28px 28px;
          text-align: center;
          position: relative;
        }
        .ps-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: rgba(255,255,255,.15);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          animation: _ring .5s cubic-bezier(.22,1,.36,1) .1s both;
        }
        .ps-check {
          width: 60px; height: 60px; border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          animation: _tick .5s cubic-bezier(.22,1,.36,1) .2s both, _pulse 2s ease 1s infinite;
        }
        .ps-check svg { display: block; }
        .ps-hdr-title {
          font-size: 24px; font-weight: 900; color: #fff; margin: 0 0 6px;
        }
        .ps-hdr-sub {
          font-size: 14px; color: rgba(255,255,255,.75); margin: 0; line-height: 1.5;
          font-weight: 500;
        }

        /* therapist strip */
        .ps-therapist {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
          animation: _fd .4s ease .2s both;
        }
        .ps-therapist img {
          width: 56px; height: 56px; border-radius: 14px;
          object-fit: cover; object-position: top;
          border: 2px solid #e2e8f0; flex-shrink: 0;
        }

        /* rows */
        .ps-rows { padding: 0 24px; animation: _fd .4s ease .3s both; }
        .ps-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #f8fafc;
        }
        .ps-row:last-child { border-bottom: none; }
        .ps-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: ${GB}; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; margin-top: 1px;
        }
        .ps-icon i { font-size: 14px; color: ${G}; }
        .ps-lbl { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
        .ps-val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }

        /* PIN callout */
        .ps-pin {
          margin: 4px 24px 16px;
          background: #fffbeb; border: 1.5px solid #fde68a;
          border-radius: 14px; padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          animation: _fd .4s ease .4s both;
        }
        .ps-pin-num {
          font-size: 28px; font-weight: 900; color: #92400e;
          letter-spacing: 6px; line-height: 1;
        }

        /* buttons */
        .ps-btns {
          padding: 0 24px 28px;
          display: flex; flex-direction: column; gap: 10px;
          animation: _fd .4s ease .5s both;
        }
        .ps-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          height: 52px; border-radius: 14px; border: none;
          background: ${G}; color: #fff;
          font-size: 15px; font-weight: 800; cursor: pointer;
          text-decoration: none; transition: background .15s;
        }
        .ps-btn-primary:hover { background: ${GL}; }
        .ps-btn-ghost {
          display: flex; align-items: center; justify-content: center;
          height: 48px; border-radius: 14px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; font-size: 14px; font-weight: 700;
          cursor: pointer; text-decoration: none; transition: all .15s;
        }
        .ps-btn-ghost:hover { border-color: #94a3b8; color: #0f172a; }

        /* trust */
        .ps-trust {
          border-top: 1px solid #f1f5f9;
          padding: 14px 24px;
          display: flex; justify-content: center; gap: 24px;
        }
        .ps-trust-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #94a3b8; font-weight: 600;
        }
        .ps-trust-item i { font-size: 11px; color: ${GL}; }

        /* skeleton */
        .ps-skeleton {
          height: 14px; border-radius: 6px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: _shimmer 1.2s infinite;
        }
        @keyframes _shimmer { to { background-position: -200% 0; } }
      `}</style>

      <div className="ps-wrap" id="__next">
        <MyNavbar />

        <div style={{ padding: "32px 16px 80px" }}>
          <div className="ps-card">

            {/* ── Green header ── */}
            <div className="ps-hdr">
              <div className="ps-ring">
                <div className="ps-check">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 className="ps-hdr-title">Booking Confirmed!</h1>
              <p className="ps-hdr-sub">
                Your therapy session has been booked.<br />
                Check your email for details.
              </p>
            </div>

            {/* ── Therapist strip ── */}
            {loading ? (
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f1f5f9", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="ps-skeleton" style={{ width: "60%", marginBottom: 8 }} />
                    <div className="ps-skeleton" style={{ width: "40%", height: 10 }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="ps-therapist">
                <img src={therapistImg} alt={therapistName}
                  onError={e => { e.target.src = defaultProfile; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: GL, fontWeight: 800, textTransform: "uppercase", letterSpacing: .5 }}>Session with</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>{therapistName}</div>
                  {booking?.therapist?.profile_type && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{booking.therapist.profile_type}</div>
                  )}
                </div>
                <div style={{ background: GB, border: "1px solid #bbf7d0", borderRadius: 8, padding: "5px 12px", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: G }}>₹{Number(amount || 0).toLocaleString("en-IN")}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textAlign: "center" }}>paid</div>
                </div>
              </div>
            )}

            {/* ── Detail rows ── */}
            {loading ? (
              <div style={{ padding: "12px 24px" }}>
                {[70, 55, 65, 50].map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f1f5f9", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="ps-skeleton" style={{ width: "35%", height: 10, marginBottom: 6 }} />
                      <div className="ps-skeleton" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ps-rows">
                {rows.filter(r => r.label !== "Session PIN").map(row => (
                  <div key={row.label} className="ps-row">
                    <div className="ps-icon"><i className={row.icon}></i></div>
                    <div>
                      <div className="ps-lbl">{row.label}</div>
                      <div className="ps-val">{row.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PIN callout (if exists) ── */}
            {!loading && pin && (
              <div className="ps-pin">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>
                    Your Session PIN
                  </div>
                  <div className="ps-pin-num">{pin}</div>
                  <div style={{ fontSize: 12, color: "#92400e", marginTop: 6, lineHeight: 1.5 }}>
                    Share this with your therapist at the start of the session.
                  </div>
                </div>
                <i className="feather-key" style={{ fontSize: 24, color: "#d97706", flexShrink: 0 }}></i>
              </div>
            )}

            {/* ── Buttons ── */}
            <div className="ps-btns">
              <Link href="/client/my-bookings" className="ps-btn-primary">
                <i className="feather-calendar" style={{ fontSize: 16 }}></i>
                View My Bookings
              </Link>
              <Link href="/" className="ps-btn-ghost">
                Back to Home
              </Link>
            </div>

            {/* ── Trust footer ── */}
            <div className="ps-trust">
              {[
                { icon: "feather-mail",        t: "Confirmation sent" },
                { icon: "feather-shield",      t: "Payment secured"   },
                { icon: "feather-refresh-cw",  t: "Easy reschedule"   },
              ].map(b => (
                <span key={b.t} className="ps-trust-item">
                  <i className={b.icon}></i>{b.t}
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
