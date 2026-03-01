import React, { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

const formStyles = `
.consultation-form-input {
  width: 100%;
  padding: 12px 15px 12px 42px !important;
  border: 2px solid #e2e8f0 !important;
  border-radius: 10px !important;
  font-size: 15px !important;
  outline: none !important;
  transition: all 0.3s ease !important;
  background-color: #ffffff !important;
  color: #1e293b !important;
  height: 50px !important;
  line-height: 1.2 !important;
}

select.consultation-form-input {
  cursor: pointer;
  padding-right: 40px !important;
}

@media (max-width: 768px) {
  .consultation-form-input {
    padding: 10px 12px 10px 40px !important;
    font-size: 14px !important;
    height: 46px !important;
  }
}

.consultation-form-input:focus {
  border-color: #228756 !important;
  box-shadow: 0 0 0 4px rgba(34, 135, 86, 0.1) !important;
  background-color: #ffffff !important;
}

.consultation-form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.submit-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #228756 0%, #1a6b44 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 12px -3px rgba(34, 135, 86, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(34, 135, 86, 0.4);
  background: linear-gradient(135deg, #1a6b44 0%, #145335 100%);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #94a3b8;
}
`;

export default function ConsultationForm({ showHeading = true }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    concern: "",
    source: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        concern: formData.concern.trim(),
        source: formData.source.trim()
      };
      const response = await postFormUrlEncoded(SubmitConsultationUrl, dataToSend);
      if (response.status) {
        setShowSuccessPopup(true);
        setFormData({ name: "", phone: "", email: "", concern: "", source: "" });
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
        <div className="inner">
          {showHeading && (
            <div style={{ marginBottom: 30, textAlign: "center" }}>
              <h3 style={{ color: "#1e293b", fontSize: isMobile ? "24px" : "32px", fontWeight: "800", marginBottom: "12px" }}>
                Free Consultation
              </h3>
              <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "0", lineHeight: "1.6" }}>
                Book your 15-minute discovery call with our experts.
              </p>
            </div>
          )}

          {message && messageType === "error" && (
            <div style={{
              padding: "14px 18px",
              marginBottom: "24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fee2e2",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span>⚠️</span> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "0" : "15px" }}>
              <div style={{ marginBottom: isMobile ? "12px" : "15px", flex: 1 }}>
                <label className="consultation-form-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <PersonIcon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 }} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="consultation-form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: isMobile ? "12px" : "15px", flex: 1 }}>
                <label className="consultation-form-label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <PhoneIcon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 }} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="consultation-form-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: isMobile ? "12px" : "15px" }}>
              <label className="consultation-form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <EmailIcon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="consultation-form-input"
                />
              </div>
            </div>

            <div style={{ marginBottom: isMobile ? "12px" : "15px" }}>
              <label className="consultation-form-label">How did you hear about us?</label>
              <div style={{ position: "relative" }}>
                <CheckCircleIcon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 }} />
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="consultation-form-input"
                  style={{ appearance: "none" }}
                >
                  <option value="" disabled>Select an option</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Friend/Family">Friend/Family</option>
                  <option value="Other">Other</option>
                </select>
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                   ▼
                </div>
              </div>
            </div>

            <div style={{ marginBottom: isMobile ? "15px" : "20px" }}>
              <label className="consultation-form-label">Tell us your concern</label>
              <div style={{ position: "relative" }}>
                <MessageIcon style={{ position: "absolute", left: 14, top: 12, color: "#94a3b8", fontSize: 18 }} />
                <textarea
                  name="concern"
                  placeholder="How can we help you?"
                  value={formData.concern}
                  onChange={handleChange}
                  rows={isMobile ? 2 : 3}
                  className="consultation-form-input"
                  style={{ minHeight: isMobile ? "70px" : "90px", height: "auto !important", paddingTop: "10px", resize: "none" }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  Submitting...
                </>
              ) : (
                <>
                  Request a Free Call
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {showSuccessPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }} onClick={() => setShowSuccessPopup(false)}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "40px 30px",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f0fdf4",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: "#228756"
            }}>
              <CheckCircleIcon sx={{ fontSize: 50 }} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "12px" }}>Success!</h2>
            <p style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "30px" }}>
              Your consultation request has been received. Our team will contact you shortly.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#228756",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer"
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
