import React, { useState, useEffect } from "react";
import Script from "next/script";
import useMediaQuery from "@mui/material/useMediaQuery";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import MessageIcon from "@mui/icons-material/Message";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CakeIcon from "@mui/icons-material/Cake";

import { VerifyConsultPaymentUrl } from "../../utils/url";

const AMOUNT = 99;
const G = "#0f4c74";

const formStyles = `
@media (max-width: 600px) {
  .cpf-row { flex-direction: column !important; gap: 6px !important; }
}

@keyframes fadeInUpPopup {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cpf-input {
  width: 100% !important;
  padding: 0 14px 0 42px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  outline: none !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  background: #f8fafc !important;
  color: #1e293b !important;
  height: 44px !important;
  box-sizing: border-box !important;
  font-family: 'Inter', sans-serif !important;
  display: flex !important;
  align-items: center !important;
}

.cpf-input:focus {
  border-color: #0e74b1 !important;
  box-shadow: 0 0 0 3px rgba(14,116,177,0.12) !important;
  background: #fff !important;
}

.cpf-textarea {
  width: 100% !important;
  padding: 14px 14px 14px 42px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  outline: none !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  background: #f8fafc !important;
  color: #1e293b !important;
  min-height: 70px !important;
  resize: none !important;
  box-sizing: border-box !important;
  font-family: 'Inter', sans-serif !important;
  line-height: 1.5 !important;
}

.cpf-textarea:focus {
  border-color: #0e74b1 !important;
  box-shadow: 0 0 0 3px rgba(14,116,177,0.12) !important;
  background: #fff !important;
}

.cpf-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cpf-submit {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0a3450 0%, #0f4c74 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(15,76,116,0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
}

.cpf-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15,76,116,0.38);
}

.cpf-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  background: #94a3b8;
  box-shadow: none;
}
`;

export default function ConsultPaymentForm() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", age: "", concern: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    let timer;
    if (showSuccessPopup) timer = setTimeout(() => setShowSuccessPopup(false), 30000);
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage(validationErrors.join(", "));
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      setMessage("Payment gateway is still loading, please try again in a moment.");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: AMOUNT, bookingId: `consult_${Date.now()}` }),
      });
      const { orderId, error } = await orderRes.json();
      if (!orderId) {
        setMessage(error || "Payment initialization failed. Please try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(AMOUNT * 100),
        currency: "INR",
        order_id: orderId,
        name: "Choose Your Therapist",
        description: "15-Minute Consultation",
        handler: async function (response) {
          try {
            const verifyRes = await fetch(VerifyConsultPaymentUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                concern: `Age: ${formData.age}\nConcern: ${formData.concern.trim()}`,
                source: "15-Min Paid Consultation",
              }),
            });
            const vd = await verifyRes.json();
            if (vd.status) {
              setShowSuccessPopup(true);
              setFormData({ name: "", phone: "", email: "", age: "", concern: "" });
            } else {
              setMessage(vd.message || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setMessage("Payment succeeded but confirmation failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: G },
        modal: {
          ondismiss: function () {
            setMessage("Payment was cancelled. You can try again.");
            setLoading(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage("An error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {mounted && <style>{formStyles}</style>}
      <div style={{ width: "100%" }}>

        {message && (
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

          <div className="cpf-row" style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label className="cpf-label">Full Name</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <PersonIcon style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, zIndex: 1, pointerEvents: "none" }} />
                <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required className="cpf-input" />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label className="cpf-label">Age</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <CakeIcon style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, zIndex: 1, pointerEvents: "none" }} />
                <input type="text" name="age" placeholder="e.g. 25 yrs" value={formData.age} onChange={handleChange} className="cpf-input" />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label className="cpf-label">Phone Number</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <PhoneIcon style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, zIndex: 1, pointerEvents: "none" }} />
                <input type="tel" name="phone" placeholder="10-digit number" value={formData.phone} onChange={handleChange} required className="cpf-input" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label className="cpf-label">Email Address</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <EmailIcon style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, zIndex: 1, pointerEvents: "none" }} />
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="cpf-input" />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label className="cpf-label">Your Concern</label>
            <div style={{ position: "relative" }}>
              <MessageIcon style={{ position: "absolute", left: 11, top: 13, color: "#94a3b8", fontSize: 16, zIndex: 1, pointerEvents: "none" }} />
              <textarea
                name="concern"
                placeholder="Briefly describe what you're going through..."
                value={formData.concern}
                onChange={handleChange}
                className="cpf-textarea"
                rows={2}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="cpf-submit">
            {loading ? "Processing..." : `Pay ₹${AMOUNT} & Book Consultation →`}
          </button>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: 12, marginBottom: 0 }}>
            🔒 Secure payment via Razorpay · 100% confidential
          </p>
        </form>
      </div>

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
              background: "linear-gradient(135deg, #eaf6ff, #cfeaff)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 0 8px rgba(14,116,177,0.08)"
            }}>
              <CheckCircleIcon sx={{ fontSize: 44, color: "#0e74b1" }} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>Payment Successful!</h2>
            <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "14px", marginBottom: 28 }}>
              Your 15-minute consultation is booked. Our team will reach out on your WhatsApp within 24 hours to confirm the time.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #0a3450, #0f4c74)",
                color: "white", border: "none",
                borderRadius: "12px", fontWeight: 700,
                fontSize: "15px", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(15,76,116,0.25)"
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
