import React, { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HearingIcon from "@mui/icons-material/Hearing";

import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

const formStyles = `
@keyframes fadeInUpPopup {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cf-input {
  width: 100% !important;
  padding: 0 14px 0 42px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  outline: none !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  background: #f8fafc !important;
  color: #1e293b !important;
  height: 50px !important;
  box-sizing: border-box !important;
  font-family: 'Inter', sans-serif !important;
  display: flex !important;
  align-items: center !important;
}

.cf-input:focus {
  border-color: #16a34a !important;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.12) !important;
  background: #fff !important;
}

.cf-textarea {
  width: 100% !important;
  padding: 14px 14px 14px 42px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  outline: none !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  background: #f8fafc !important;
  color: #1e293b !important;
  min-height: 95px !important;
  resize: none !important;
  box-sizing: border-box !important;
  font-family: 'Inter', sans-serif !important;
  line-height: 1.5 !important;
}

.cf-textarea:focus {
  border-color: #16a34a !important;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.12) !important;
  background: #fff !important;
}

select.cf-input {
  cursor: pointer !important;
  padding-left: 14px !important;
  appearance: none !important;
}

.cf-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cf-submit {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #166534 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(22,101,52,0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
}

.cf-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(22,101,52,0.38);
}

.cf-submit:active:not(:disabled) {
  transform: translateY(0);
}

.cf-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  background: #94a3b8;
  box-shadow: none;
}
`;

export default function ConsultationForm({ showHeading = true, showLocation = true, showSource = true }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    concern: "",
    source: "",
    location: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => setShowSuccessPopup(false), 30000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errors.push("Please enter a valid 10-digit phone number");
    }
    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.push("Please enter a valid email address");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage(validationErrors.join(", "));
      setMessageType("error");
      return;
    }
    setLoading(true);
    try {
      const dataToSend = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        subject: "Free Consultation Request",
        concern: `Location: ${formData.location}\nConcern: ${formData.concern.trim()}`,
        source: formData.source.trim()
      };
      const response = await postFormUrlEncoded(SubmitConsultationUrl, dataToSend);
      if (response.status) {
        setShowSuccessPopup(true);
        setFormData({ name: "", phone: "", email: "", concern: "", source: "", location: "" });
      } else {
        setMessage(response.message || "Failed to submit. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{formStyles}</style>
      <div style={{ width: "100%" }}>

        {showHeading && (
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <h3 style={{ color: "#1e293b", fontSize: isMobile ? "22px" : "28px", fontWeight: 800, marginBottom: 8 }}>
              Free Consultation
            </h3>
            <p style={{ color: "#64748b", fontSize: "15px", marginBottom: 0, lineHeight: 1.6 }}>
              Book your 15-minute discovery call with our experts.
            </p>
          </div>
        )}

        {message && messageType === "error" && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fee2e2",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <span>⚠️</span> {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>

          {/* Name */}
          <div style={{ marginBottom: "12px" }}>
            <label className="cf-label">Full Name</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <PersonIcon style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18, zIndex: 1, pointerEvents: "none" }} />
              <input type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required className="cf-input" />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "12px" }}>
            <label className="cf-label">Phone Number</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <PhoneIcon style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18, zIndex: 1, pointerEvents: "none" }} />
              <input type="tel" name="phone" placeholder="10-digit mobile number" value={formData.phone} onChange={handleChange} required className="cf-input" />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label className="cf-label">Email Address</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <EmailIcon style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18, zIndex: 1, pointerEvents: "none" }} />
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="cf-input" />
            </div>
          </div>

          {/* Location + Source (conditionally shown) */}
          {(showLocation || showSource) && (
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {showLocation && (
                <div style={{ flex: 1 }}>
                  <label className="cf-label">Location</label>
                  <div style={{ position: "relative" }}>
                    <select name="location" value={formData.location} onChange={handleChange} required={showLocation} className="cf-input">
                      <option value="" disabled>Select</option>
                      <option value="Noida Center">Noida (In-Person)</option>
                      <option value="Delhi Center">Delhi (In-Person)</option>
                      <option value="Online">Online / Video</option>
                    </select>
                  </div>
                </div>
              )}
              {showSource && (
                <div style={{ flex: 1 }}>
                  <label className="cf-label">Heard via</label>
                  <div style={{ position: "relative" }}>
                    <select name="source" value={formData.source} onChange={handleChange} required={showSource} className="cf-input">
                      <option value="" disabled>Select</option>
                      <option value="Google Search">Google</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Friend/Family">Friend/Family</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Concern */}
          <div style={{ marginBottom: "20px" }}>
            <label className="cf-label">Your Concern</label>
            <div style={{ position: "relative" }}>
              <MessageIcon style={{ position: "absolute", left: 13, top: 15, color: "#94a3b8", fontSize: 18, zIndex: 1, pointerEvents: "none" }} />
              <textarea
                name="concern"
                placeholder="Briefly describe what you're going through..."
                value={formData.concern}
                onChange={handleChange}
                className="cf-textarea"
                rows={3}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="cf-submit">
            {loading ? "Submitting..." : "Talk to a Therapist →"}
          </button>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: 12, marginBottom: 0 }}>
            🔒 100% confidential · No spam, ever
          </p>
        </form>
      </div>

      {/* Success popup */}
      {showSuccessPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }} onClick={() => setShowSuccessPopup(false)}>
          <div style={{
            background: "white",
            borderRadius: "28px",
            padding: "44px 32px",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
            animation: "fadeInUpPopup 0.4s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: 76, height: 76,
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 0 8px rgba(34,197,94,0.08)"
            }}>
              <CheckCircleIcon sx={{ fontSize: 44, color: "#16a34a" }} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>Request Received!</h2>
            <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "14px", marginBottom: 28 }}>
              Our team will reach out on your WhatsApp within 24 hours. No commitment required.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #166534, #16a34a)",
                color: "white", border: "none",
                borderRadius: "12px", fontWeight: 700,
                fontSize: "15px", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(22,101,52,0.25)"
              }}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
