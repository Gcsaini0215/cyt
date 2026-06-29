import React, { useState } from "react";
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

export default function AppointmentForm() {
  const [form, setForm] = useState({ name: "", phone: "", concern: "", preferredTime: "", message: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError("Name and phone number are required."); return; }
    if (!/^\d{10}$/.test(form.phone.trim())) { setError("Please enter a valid 10-digit phone number."); return; }
    setError("");
    setStatus("loading");
    try {
      const res = await fetch(`${apiUrl}/appointment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone.trim(), name: form.name.trim() }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else { setError(data.message || "Something went wrong. Please try again."); setStatus(null); }
    } catch {
      setError("Could not connect. Please try again."); setStatus(null);
    }
  };

  if (status === "success") {
    return (
      <section style={{ minHeight: "70vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32 }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Request Received!</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            Thank you, <strong>{form.name.split(" ")[0]}</strong>. We have received your appointment request and will reach out to you on <strong>{form.phone}</strong> via WhatsApp to confirm your session time.
          </p>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", textAlign: "left", fontSize: 13, color: "#475569", lineHeight: 2 }}>
            {form.concern && <div><span style={{ fontWeight: 600, color: "#0f172a" }}>Concern:</span> {form.concern}</div>}
            {form.preferredTime && <div><span style={{ fontWeight: 600, color: "#0f172a" }}>Preferred time:</span> {form.preferredTime}</div>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: "#f8fafc", padding: "60px 20px 80px" }}>
      <style>{`
        .apt-inp { border: 1.5px solid #e2e8f0; borderRadius: 8px; padding: 10px 13px; fontSize: 14px; color: #0f172a; outline: none; width: 100%; boxSizing: border-box; background: #fff; fontFamily: inherit; transition: border-color 0.15s; }
        .apt-inp:focus { border-color: #16a34a; }
        .apt-lbl { fontSize: 12px; fontWeight: 700; color: #475569; textTransform: uppercase; letterSpacing: 0.6px; display: block; marginBottom: 6px; }
        .apt-slot { flex: 1; padding: 9px 0; borderRadius: 8px; fontSize: 12.5px; fontWeight: 600; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; transition: all 0.15s; }
        .apt-slot.active { background: #f0fdf4; border-color: #16a34a; color: #15803d; }
        .apt-slot:hover { border-color: #94a3b8; }
        @media (max-width: 600px) { .apt-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, color: "#16a34a", letterSpacing: 1.4, textTransform: "uppercase", background: "#dcfce7", padding: "5px 14px", borderRadius: 50, marginBottom: 14 }}>
            Book a Session
          </span>
          <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: "#0f172a", margin: "0 0 10px", lineHeight: 1.25 }}>
            Request an Appointment
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.7 }}>
            Fill in your details below. We will contact you on WhatsApp to confirm your session time — usually within a few hours.
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Name + Phone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="apt-lbl">Full Name *</label>
              <input className="apt-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" autoFocus />
            </div>
            <div>
              <label className="apt-lbl">Phone Number *</label>
              <input className="apt-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" type="tel" inputMode="numeric" maxLength={10} />
            </div>
          </div>

          {/* Concern */}
          <div>
            <label className="apt-lbl">What would you like help with?</label>
            <select className="apt-inp" value={form.concern} onChange={e => set("concern", e.target.value)} style={{ height: 42 }}>
              <option value="">Select a concern (optional)</option>
              {CONCERNS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Preferred time */}
          <div>
            <label className="apt-lbl">Preferred Session Time</label>
            <div className="apt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button"
                  className={`apt-slot${form.preferredTime === slot ? " active" : ""}`}
                  onClick={() => set("preferredTime", form.preferredTime === slot ? "" : slot)}
                  style={{ textAlign: "center", padding: "9px 6px", fontSize: 11.5 }}
                >{slot}</button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="apt-lbl">Anything else you'd like us to know?</label>
            <textarea className="apt-inp" value={form.message} onChange={e => set("message", e.target.value)}
              placeholder="e.g. Preferred language, session type (online/in-person), any other details..."
              rows={3} style={{ height: "auto", resize: "none", lineHeight: 1.6 }} />
          </div>

          {/* Error */}
          {error && <div style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}

          {/* Submit */}
          <button type="submit" disabled={status === "loading"}
            style={{ background: status === "loading" ? "#86efac" : "#16a34a", border: "none", borderRadius: 10, padding: "14px 0", fontSize: 15, fontWeight: 700, color: "#fff", cursor: status === "loading" ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {status === "loading" ? "Submitting..." : "Request Appointment"}
          </button>

          <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            We will reach out to you on WhatsApp within a few hours to confirm your time slot.
          </p>
        </form>
      </div>
    </section>
  );
}
