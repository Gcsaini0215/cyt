import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { fetchData } from "../../utils/actions";
import { getBookings, imagePath, defaultProfile } from "../../utils/url";
import { getToken } from "../../utils/jwt";
import useUserStore from "../../store/userStore";

const HIDE_ROUTES = [
  "/therapist-dashboard", "/appointments", "/clinic-patients",
  "/case-history", "/create-report", "/settings", "/therapist-checkout",
  "/payment-success", "/payment-pending", "/intern-login", "/login", "/register",
];

export default function ActiveBookingBanner() {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const [booking, setBooking] = useState(null);
  const [closed, setClosed] = useState(false);

  const shouldHide = HIDE_ROUTES.some(r => router.pathname.startsWith(r));

  useEffect(() => {
    setClosed(false);
  }, [router.pathname]);

  useEffect(() => {
    const token = getToken();
    // Only show for logged-in clients (role 0 or undefined, not therapist=1 or admin=2)
    if (!token || !userInfo?._id || userInfo?.role === 1 || userInfo?.role === 2) return;

    const fetchBooking = async () => {
      try {
        const res = await fetchData(getBookings);
        if (!res?.status || !res?.data?.length) return;
        const active = res.data.find(
          b => b.session_status !== "completed" && b.is_payment_success === true
        );
        if (active) setBooking(active);
      } catch {}
    };

    fetchBooking();
  }, [userInfo]);

  if (!booking || closed || shouldHide) return null;

  const therapist = booking.therapist?.user;
  const therapistImg = therapist?.profile
    ? `${imagePath}/${therapist.profile}`
    : defaultProfile;
  const therapistName = therapist?.name || "Your Therapist";
  const service = booking.service || "Session";
  const format = booking.format ? ` · ${booking.format}` : "";
  const bookingDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  return (
    <>
      <style>{`
        @keyframes abb-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .abb-wrap {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 9998;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 13px;
          max-width: 320px;
          width: calc(100vw - 48px);
          border: 1.5px solid #d1fae5;
          animation: abb-slide-up 0.4s ease;
        }
        .abb-img {
          width: 50px; height: 50px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid #228756;
        }
        .abb-badge {
          font-size: 10px;
          font-weight: 700;
          color: #228756;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .abb-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .abb-meta {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
        .abb-btn {
          display: inline-block;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          background: #228756;
          border-radius: 8px;
          padding: 5px 14px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .abb-btn:hover { background: #1a6b3a; color: #fff; }
        .abb-close {
          position: absolute;
          top: 8px; right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #94a3b8;
          line-height: 1;
          padding: 0;
        }
        .abb-close:hover { color: #475569; }
        @media (max-width: 480px) {
          .abb-wrap { left: 12px; bottom: 16px; max-width: calc(100vw - 24px); width: calc(100vw - 24px); }
        }
      `}</style>

      <div className="abb-wrap">
        <img
          src={therapistImg}
          alt={therapistName}
          className="abb-img"
          onError={e => { e.target.src = defaultProfile; }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="abb-badge">Active Booking</div>
          <div className="abb-name">{therapistName}</div>
          <div className="abb-meta">{service}{format}{bookingDate ? ` · ${bookingDate}` : ""}</div>
          <Link href="/client/my-bookings" className="abb-btn">View Booking</Link>
        </div>
        <button className="abb-close" onClick={() => setClosed(true)} aria-label="Close">×</button>
      </div>
    </>
  );
}
