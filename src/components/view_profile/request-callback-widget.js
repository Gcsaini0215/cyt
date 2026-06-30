import React, { useState } from "react";
import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

export default function RequestCallbackWidget({ therapistName, therapistId }) {
  const [form, setForm]       = useState({ name: "", phone: "", email: "", concern: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError("Name and phone are required."); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) { setError("Enter a valid 10-digit mobile number."); return; }
    setError(""); setLoading(true);
    try {
      await postFormUrlEncoded(SubmitConsultationUrl, {
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        email:   form.email.trim(),
        message: form.concern.trim() || `Callback request for ${therapistName}`,
        source:  "view-profile-widget",
        therapist_id: therapistId || "",
      });
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 13px",
    fontSize: 13, color: "#0f172a", outline: "none", background: "#fafbfc",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden",
      position: "sticky", top: 90,
    }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0a2e1c,#155e36)", padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 5.45 5.45l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Request a Callback</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              {therapistName ? `with ${therapistName}` : "Get a free callback"}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "18px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Request Received!</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
              We'll call you back shortly to schedule your session with {therapistName || "the therapist"}.
            </div>
            <button onClick={() => { setDone(false); setForm({ name:"", phone:"", email:"", concern:"" }); }}
              style={{ marginTop: 14, padding: "8px 18px", background: "none", border: "1.5px solid #228756", borderRadius: 8, color: "#228756", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>YOUR NAME *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>PHONE NUMBER *</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit mobile" inputMode="numeric" style={inp} maxLength={10} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>EMAIL (optional)</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>CONCERN (optional)</label>
              <textarea value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe your concern…" rows={3}
                style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", background: loading ? "#e2e8f0" : "linear-gradient(135deg,#228756,#16a34a)", border: "none", borderRadius: 11, color: loading ? "#94a3b8" : "#fff", fontWeight: 800, fontSize: 14, cursor: loading ? "default" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(34,135,86,0.3)", transition: "all 0.2s" }}>
              {loading ? "Submitting…" : "Request Callback"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 2 }}>
              <svg width="12" height="12" fill="none" stroke="#228756" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 11, color: "#64748b" }}>100% private & confidential</span>
            </div>
          </form>
        )}
      </div>

      {/* Trust strip */}
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 20px", display: "flex", justifyContent: "space-around", background: "#fafbfc" }}>
        {[["⚡", "Quick"], ["🔒", "Safe"], ["💬", "Free"]].map(([icon, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>{icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
