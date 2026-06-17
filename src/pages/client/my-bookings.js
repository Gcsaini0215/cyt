import React, { useState } from "react";
import UserLayout from "../../components/dashboard/user-layout";
import { fetchById } from "../../utils/actions";
import { getBookings, imagePath, defaultProfile } from "../../utils/url";
import PageWrapper from "../../components/global/page-wrapper";
import { toast } from "react-toastify";
import { formatDateTime } from "../../utils/time";
import Link from "next/link";

const statusColor = (status) => {
  if (!status) return { bg: "#f1f5f9", color: "#64748b" };
  const s = status.toLowerCase();
  if (s === "new") return { bg: "#dbeafe", color: "#1d4ed8" };
  if (s === "started") return { bg: "#fef9c3", color: "#854d0e" };
  if (s === "completed") return { bg: "#dcfce7", color: "#166534" };
  return { bg: "#f1f5f9", color: "#64748b" };
};

const paymentColor = (name) => {
  if (!name) return { bg: "#f1f5f9", color: "#64748b" };
  const s = name.toLowerCase();
  if (s.includes("success") || s.includes("paid")) return { bg: "#dcfce7", color: "#166534" };
  if (s.includes("pending")) return { bg: "#fef9c3", color: "#854d0e" };
  if (s.includes("fail")) return { bg: "#fee2e2", color: "#991b1b" };
  return { bg: "#f1f5f9", color: "#64748b" };
};

export default function MyBookingsPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchById(getBookings)
      .then(res => { if (res.status) setData(res.data); else toast.error(res.message); })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      <PageWrapper pageTitle={"My Bookings"} loading={loading}>
        <style>{`
          .bk-card {
            background: #fff;
            border-radius: 18px;
            border: 1.5px solid #e8f5ee;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            padding: 24px;
            margin-bottom: 20px;
            transition: box-shadow 0.2s;
          }
          .bk-card:hover { box-shadow: 0 8px 32px rgba(34,135,86,0.1); }
          .bk-badge {
            display: inline-block;
            border-radius: 20px;
            padding: 3px 12px;
            font-size: 12px;
            font-weight: 700;
          }
          .bk-divider { border: none; border-top: 1.5px solid #f1f5f9; margin: 16px 0; }
          .bk-row { display: flex; flex-wrap: wrap; gap: 16px; }
          .bk-field { flex: 1; min-width: 140px; }
          .bk-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .bk-value { font-size: 14px; font-weight: 600; color: #1e293b; }
          .bk-pin {
            font-size: 22px;
            font-weight: 900;
            color: #228756;
            letter-spacing: 4px;
            background: #f0fdf4;
            border: 1.5px dashed #86efac;
            border-radius: 10px;
            padding: 6px 18px;
            display: inline-block;
          }
          @media (max-width: 600px) {
            .bk-card { padding: 16px; }
            .bk-row { gap: 12px; }
          }
        `}</style>

        {!loading && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <h5 style={{ color: "#64748b", fontWeight: 600 }}>No Bookings Found</h5>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>You haven't booked any session yet.</p>
            <Link href="/view-all-therapist" style={{
              display: "inline-block", marginTop: 16,
              background: "#228756", color: "#fff",
              borderRadius: 10, padding: "10px 24px",
              fontWeight: 700, fontSize: 14, textDecoration: "none"
            }}>Find a Therapist</Link>
          </div>
        )}

        {data.map((item) => {
          const therapistImg = item.therapist?.user?.profile
            ? `${imagePath}/${item.therapist.user.profile}`
            : defaultProfile;
          const sessStatus = statusColor(item.status);
          const payStatus = paymentColor(item.transaction?.status?.name);

          return (
            <div className="bk-card" key={item._id}>
              {/* Header — Therapist Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <img
                  src={therapistImg}
                  alt={item.therapist?.user?.name}
                  style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #228756", flexShrink: 0 }}
                  onError={e => { e.target.src = defaultProfile; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                    {item.therapist?.user?.name}
                  </div>
                  <Link href={`/view-profile/${item.therapist?._id}`} target="_blank"
                    style={{ fontSize: 12, color: "#228756", fontWeight: 600, textDecoration: "none" }}>
                    {item.therapist?.profile_code} · View Profile
                  </Link>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="bk-badge" style={{ background: sessStatus.bg, color: sessStatus.color }}>
                    {item.status || "New"}
                  </span>
                  <span className="bk-badge" style={{ background: payStatus.bg, color: payStatus.color }}>
                    {item.transaction?.status?.name || "Pending"}
                  </span>
                </div>
              </div>

              <hr className="bk-divider" />

              {/* Session Details */}
              <div className="bk-row">
                <div className="bk-field">
                  <div className="bk-label">Service</div>
                  <div className="bk-value">{item.service || "—"}</div>
                  {item.format && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.format}</div>}
                </div>

                <div className="bk-field">
                  <div className="bk-label">Booked For</div>
                  <div className="bk-value">{item.whom === "Self" ? "Self" : item.cname || "—"}</div>
                  {item.whom !== "Self" && item.relation_with_client && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.relation_with_client}</div>
                  )}
                </div>

                <div className="bk-field">
                  <div className="bk-label">Booked At</div>
                  <div className="bk-value">{formatDateTime(item.booking_date)}</div>
                </div>

                <div className="bk-field">
                  <div className="bk-label">Amount Paid</div>
                  <div className="bk-value" style={{ color: "#228756" }}>₹ {item.transaction?.amount || "—"}</div>
                </div>
              </div>

              {/* PIN */}
              {item.otp && (
                <>
                  <hr className="bk-divider" />
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div className="bk-label">Session PIN</div>
                      <div className="bk-pin">{item.otp}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", maxWidth: 260 }}>
                      Share this PIN with your therapist at the start of your session.
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {item.notes && (
                <>
                  <hr className="bk-divider" />
                  <div className="bk-label">Notes</div>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{item.notes}</div>
                </>
              )}

              {/* Session Times */}
              {item.status !== "New" && (
                <>
                  <hr className="bk-divider" />
                  <div className="bk-row">
                    {item.session_started_at && (
                      <div className="bk-field">
                        <div className="bk-label">Session Started</div>
                        <div className="bk-value">{formatDateTime(item.session_started_at)}</div>
                      </div>
                    )}
                    {item.session_completed_at && (
                      <div className="bk-field">
                        <div className="bk-label">Session Completed</div>
                        <div className="bk-value">{formatDateTime(item.session_completed_at)}</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </PageWrapper>
    </UserLayout>
  );
}
