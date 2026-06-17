import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData } from "../../utils/actions";
import { getBookings, imagePath, defaultProfile } from "../../utils/url";
import { getToken, setToken } from "../../utils/jwt";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { id, payment_id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await fetchData(getBookings);
        if (res?.status && res?.data?.length) {
          const b = res.data.find(b => b._id === id);
          if (b) setBooking(b);
        }
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [id]);

  const therapistName = booking?.therapist?.user?.name || "Your Therapist";
  const therapistImg = booking?.therapist?.user?.profile
    ? `${imagePath}/${booking.therapist.user.profile}`
    : defaultProfile;
  const service = booking?.service || "Session";
  const format = booking?.format || "";
  const pin = booking?.otp || "";
  const amount = booking?.amount || "";

  return (
    <>
      <Head>
        <title>Payment Successful | Choose Your Therapist</title>
      </Head>
      <div id="__next">
        <MyNavbar />
        <div style={{
          minHeight: "80vh",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(34,135,86,0.12)",
            padding: "48px 40px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
          }}>
            {/* Success Icon */}
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #228756, #4ade80)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 24px rgba(34,135,86,0.3)",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
              Payment Successful!
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 32px", lineHeight: 1.6 }}>
              Your booking has been confirmed. Get ready for your session!
            </p>

            {/* Therapist Card */}
            {!loading && booking && (
              <div style={{
                background: "#f8fffe",
                border: "1.5px solid #d1fae5",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                textAlign: "left",
              }}>
                <img
                  src={therapistImg}
                  alt={therapistName}
                  style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #228756" }}
                  onError={e => { e.target.src = defaultProfile; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#228756", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Booked With</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{therapistName}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{service}{format ? ` · ${format}` : ""}</div>
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "28px",
              textAlign: "left",
            }}>
              {pin && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Session PIN</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#228756", letterSpacing: 2 }}>{pin}</span>
                </div>
              )}
              {amount && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Amount Paid</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>₹{amount}</span>
                </div>
              )}
              {payment_id && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Transaction ID</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", wordBreak: "break-all", textAlign: "right", maxWidth: "55%" }}>{payment_id}</span>
                </div>
              )}
            </div>

            {/* Note about PIN */}
            {pin && (
              <div style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "28px",
                fontSize: 13,
                color: "#92400e",
                lineHeight: 1.6,
              }}>
                <strong>Important:</strong> Your session PIN is <strong>{pin}</strong>. Share this with your therapist at the start of your session.
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <Link href="/client/my-bookings" style={{
                display: "block",
                background: "linear-gradient(135deg, #1a6b3a, #228756)",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(34,135,86,0.3)",
              }}>
                View My Bookings
              </Link>
              <Link href="/" style={{
                display: "block",
                background: "#f1f5f9",
                color: "#475569",
                borderRadius: "12px",
                padding: "13px",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
