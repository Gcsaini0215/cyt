import React, { useState } from "react";
import useUserStore from "../../store/userStore";
import { apiUrl } from "../../utils/url";

const CONCERNS = [
  "Anxiety", "Depression", "Stress Management", "Relationship Issues",
  "Trauma / PTSD", "Grief & Loss", "Self-Esteem", "Anger Management",
  "OCD", "Sleep Issues", "Life Transitions", "Career Counselling", "Other",
];

const TIME_SLOTS = [
  "Morning (9 AM – 12 PM)",
  "Afternoon (12 PM – 4 PM)",
  "Evening (4 PM – 7 PM)",
  "Flexible / Any time",
];

export default function DashAppointmentForm() {
  const { userInfo } = useUserStore();
  const [form, setForm] = useState({
    name: userInfo?.name || "",
    phone: userInfo?.phone || "",
    email: userInfo?.email || "",
    concern: "",
    preferredTime: "",
  });
  const [status, setStatus] = useState(null); // null | "loading" | "success"
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError("Name and phone are required."); return; }
    if (!/^\d{10}$/.test(form.phone.trim())) { setError("Please enter a valid 10-digit phone number."); return; }
    setError("");
    setStatus("loading");
    try {
      const res = await fetch(`${apiUrl}/appointment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "dashboard" }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else { setError(data.message || "Something went wrong."); setStatus(null); }
    } catch {
      setError("Could not connect. Please try again."); setStatus(null);
    }
  };

  return (
    <div style={{ marginTop: 48, marginBottom: 32 }}>
      <style>{`
        .da-inp { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 13px; font-size: 14px; color: #0f172a; outline: none; width: 100%; box-sizing: border-box; background: #fff; font-family: inherit; transition: border-color 0.15s; }
        .da-inp:focus { border-color: #16a34a; }
        .da-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; display: block; margin-bottom: 5px; }
        .da-slot { flex: 1; padding: 8px 6px; border-radius: 8px; font-size: 11.5px; font-weight: 600; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; transition: all 0.15s; text-align: center; }
        .da-slot.active { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
        .da-slot:hover:not(.active) { border-color: #94a3b8; }
        @media (max-width: 600px) { .da-time-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 3, height: 22, background: "#16a34a", borderRadius: 2 }} />
        <h5 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Book an Appointment</h5>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>— We'll confirm via WhatsApp</span>
      </div>

      {status === "success" ? (
        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#15803d", marginBottom: 3 }}>Appointment request sent!</div>
            <div style={{ fontSize: 13, color: "#475569" }}>We'll reach out to you on <strong>{form.phone}</strong> via WhatsApp to confirm your session time.</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Name + Phone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="da-lbl">Full Name *</label>
              <input className="da-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="da-lbl">Phone *</label>
              <input className="da-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" type="tel" inputMode="numeric" maxLength={10} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="da-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#94a3b8" }}>(for confirmation email)</span></label>
            <input className="da-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
          </div>

          {/* Concern */}
          <div>
            <label className="da-lbl">What would you like help with?</label>
            <select className="da-inp" value={form.concern} onChange={e => set("concern", e.target.value)} style={{ height: 42 }}>
              <option value="">Select a concern (optional)</option>
              {CONCERNS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Preferred time */}
          <div>
            <label className="da-lbl">Preferred Session Time</label>
            <div className="da-time-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button"
                  className={`da-slot${form.preferredTime === slot ? " active" : ""}`}
                  onClick={() => set("preferredTime", form.preferredTime === slot ? "" : slot)}
                >{slot}</button>
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}

          <button type="submit" disabled={status === "loading"}
            style={{ background: status === "loading" ? "#86efac" : "#16a34a", border: "none", borderRadius: 9, padding: "12px 0", fontSize: 14, fontWeight: 700, color: "#fff", cursor: status === "loading" ? "not-allowed" : "pointer" }}>
            {status === "loading" ? "Sending..." : "Request Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}
