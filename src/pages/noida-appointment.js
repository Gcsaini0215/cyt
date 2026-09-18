import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Script from "next/script";
import { apiUrl } from "../utils/url";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STEP_LABELS = ["You", "Session", "When", "Confirm"];

function dateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return { value: dateStr, weekday: WEEKDAY_SHORT[dt.getDay()], day: dt.getDate(), month: MONTH_SHORT[dt.getMonth()] };
}

function priceFieldFor(sessionMode, format) {
  const fmt = format === "home-visit" ? "homevisit" : format === "online" ? "online" : "inperson";
  const mode = sessionMode === "couple" ? "couple" : "individual";
  return `${mode}_${fmt}`;
}

function waitForRazorpay(timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (typeof window !== "undefined" && window.Razorpay) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() - t0 > timeout) {
        clearInterval(iv);
        reject(new Error("Payment library failed to load. Please check your connection and retry."));
      }
    }, 150);
  });
}

export default function NoidaAppointment() {
  const [step, setStep] = useState(1); // 1 = You, 2 = When, 3 = Confirm
  const [bookingType, setBookingType] = useState("new"); // "new" | "followup"

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── Pricing + packages, fetched once ─────────────────────────────────
  const [pricing, setPricing] = useState(null);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/pricing`)
      .then(r => r.json())
      .then(data => setPricing(data?.status ? data.data : null))
      .catch(() => setPricing(null));
  }, []);

  const [sessionMode, setSessionMode] = useState("individual"); // "individual" | "couple" | "package"
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [format, setFormat] = useState("in-person"); // "in-person" | "online" | "home-visit"
  const [address, setAddress] = useState("");

  const selectedPackage = (pricing?.packages || []).find(p => p._id === selectedPackageId);
  const baseAmount = sessionMode === "package"
    ? (selectedPackage?.price ?? 0)
    : (pricing?.[priceFieldFor(sessionMode, format)] ?? 0);
  const platformFee = pricing?.platformFee ?? 20;
  const totalAmount = baseAmount + platformFee;

  // ── Date strip — only dates the admin has actually opened for this type ─
  const [dateOptions, setDateOptions] = useState(null); // null = loading
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setDateOptions(null);
    setSelectedDate("");
    fetch(`${apiUrl}/noida-appointments/followup-dates?type=${bookingType}`)
      .then(r => r.json())
      .then(data => {
        const dates = data?.status ? (data.data || []) : [];
        const opts = dates.map(dateLabel);
        setDateOptions(opts);
        setSelectedDate(opts[0]?.value || "");
      })
      .catch(() => setDateOptions([]));
  }, [bookingType]);

  // ── Slots for whichever date is active ───────────────────────────────
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const loadSlots = useCallback(async (date, type) => {
    setSlotsLoading(true);
    setSelectedSlot("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/slots?date=${date}&type=${type}`);
      const data = await res.json();
      setSlots(data?.status ? (data.data || []) : []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate, bookingType);
    else setSlots([]);
  }, [selectedDate, bookingType, loadSlots]);

  // ── Follow-up phone lookup ───────────────────────────────────────────
  const [lookupStatus, setLookupStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [foundName, setFoundName] = useState("");
  const [manualOverride, setManualOverride] = useState(false); // "not you? enter manually"

  const runLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setLookupStatus(null); return; }
    setLookupStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/lookup?phone=${phone}`);
      const data = await res.json();
      if (data?.status && data.data?.found) {
        setFoundName(data.data.name || "");
        setLookupStatus("found");
      } else {
        setLookupStatus("not-found");
      }
    } catch {
      setLookupStatus("not-found");
    }
  }, []);

  // ── Form ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", concern: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    set("phone", digits);
    setManualOverride(false);
    if (digits.length === 10 && bookingType === "followup") runLookup(digits);
    else setLookupStatus(null);
  };

  const switchTab = (type) => {
    setBookingType(type);
    setStatus(null);
    setError("");
    setLookupStatus(null);
    setManualOverride(false);
    setForm({ name: "", age: "", phone: "", email: "", concern: "" });
  };

  const needsFullDetails = bookingType === "new" || lookupStatus === "not-found" || manualOverride;
  const effectiveName = bookingType === "followup" && lookupStatus === "found" && !manualOverride ? foundName : form.name;

  const goToStep2 = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setStep(2);
  };

  const goToStep3 = () => {
    setError("");
    if (sessionMode === "package" && !selectedPackageId) { setError("Please choose a package."); return; }
    if (format === "home-visit" && !address.trim()) { setError("Please add your address for the home visit."); return; }
    setStep(3);
  };

  const goToStep4 = () => {
    setError("");
    if (!selectedDate || !selectedSlot) { setError("Please select a date and time slot."); return; }
    setStep(4);
  };

  const finalizeBooking = async (paymentResponse) => {
    try {
      const res = await fetch(`${apiUrl}/noida-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveName.trim(),
          age: form.age.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          concern: form.concern.trim(),
          date: selectedDate,
          slot: selectedSlot,
          type: bookingType,
          sessionMode,
          format,
          address: format === "home-visit" ? address.trim() : "",
          packageId: sessionMode === "package" ? selectedPackageId : undefined,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus("success");
      } else {
        setError(`${data.message || "Booking failed after payment."} Please WhatsApp us with payment ID ${paymentResponse.razorpay_payment_id} and we'll sort it out.`);
        setStatus(null);
      }
    } catch {
      setError(`Payment succeeded but we couldn't save the booking. Please WhatsApp us with payment ID ${paymentResponse.razorpay_payment_id}.`);
      setStatus(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const orderRes = await fetch(`${apiUrl}/noida-appointments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionMode, format,
          packageId: sessionMode === "package" ? selectedPackageId : undefined,
          address: format === "home-visit" ? address.trim() : undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.status) {
        setError(orderData.message || "Could not start payment. Please try again.");
        setStatus(null);
        return;
      }

      await waitForRazorpay();

      const rzp = new window.Razorpay({
        key: orderData.data.keyId,
        amount: Math.round(orderData.data.amount * 100),
        currency: "INR",
        order_id: orderData.data.orderId,
        name: "Choose Your Therapist",
        description: "Noida Center Appointment",
        handler: (response) => finalizeBooking(response),
        prefill: { name: effectiveName, email: form.email, contact: form.phone },
        theme: { color: "#1a6b3a" },
        modal: {
          ondismiss: () => {
            setStatus(null);
            setError("Payment was cancelled. You can try again whenever you're ready.");
          },
        },
      });
      rzp.on("payment.failed", () => {
        setStatus(null);
        setError("Payment failed. Please try again or use a different payment method.");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment. Please try again.");
      setStatus(null);
    }
  };

  const selectedDateLabel = (dateOptions || []).find(d => d.value === selectedDate);
  const formatLabel = format === "home-visit" ? "Home Visit" : format === "online" ? "Online" : "In-person";
  const modeLabel = sessionMode === "package" ? (selectedPackage?.name || "Package") : sessionMode === "couple" ? "Couple" : "Individual";

  return (
    <>
      <Head>
        <title>Book an In-Person Appointment — Noida Therapy Center | Choose Your Therapist</title>
        <meta name="description" content="Book your in-person therapy session at our Noida (Sector 51) center. Pick a date and time that works for you — instantly confirmed." />
        <link rel="canonical" href="https://chooseyourtherapist.in/noida-appointment" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Book an In-Person Appointment — Noida Therapy Center" />
        <meta property="og:description" content="Pick a date and time for your in-person session at our Noida center — instantly confirmed." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {mounted && <style>{`
        .na-page { font-family: 'Inter', sans-serif; background: #f4f6f5; min-height: 100vh; }

        .na-wrap { max-width: 560px; margin: 0 auto; padding: 32px 20px 60px; }
        .na-card {
          background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14);
          padding: 28px 24px 32px;
        }

        .na-tabs { display: flex; gap: 6px; background: #f1f5f9; border-radius: 12px; padding: 5px; margin-bottom: 20px; }
        .na-tab { flex: 1; border: none; background: none; padding: 10px 0; border-radius: 9px; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; transition: all .15s; }
        .na-tab.active { background: #fff; color: #1a6b3a; box-shadow: 0 2px 6px rgba(0,0,0,.08); }

        .na-steps { display: flex; align-items: center; gap: 6px; margin-bottom: 22px; }
        .na-step-dot {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .na-step-circle {
          width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; border: 2px solid #e2e8f0; color: #94a3b8; background: #fff; transition: all .2s;
        }
        .na-step-dot.done .na-step-circle { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
        .na-step-dot.active .na-step-circle { border-color: #1a6b3a; color: #1a6b3a; }
        .na-step-label { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
        .na-step-dot.active .na-step-label, .na-step-dot.done .na-step-label { color: #1a6b3a; }
        .na-step-line { flex: 1.4; height: 2px; background: #e2e8f0; margin-top: -22px; }
        .na-step-line.done { background: #1a6b3a; }

        .na-section-label {
          font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase;
          letter-spacing: 0.6px; margin-bottom: 12px;
        }

        .na-pill-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .na-pill {
          flex: 1; min-width: 90px; padding: 10px 8px; border-radius: 10px; text-align: center;
          border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s;
          font-size: 12.5px; font-weight: 700; color: #334155;
        }
        .na-pill:hover { border-color: #94a3b8; }
        .na-pill.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-pill-price { display: block; font-size: 10.5px; font-weight: 600; color: #94a3b8; margin-top: 2px; }
        .na-pill.active .na-pill-price { color: #15803d; }

        .na-pkg-card-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .na-pkg-card {
          display: flex; align-items: center; justify-content: space-between; padding: 12px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; transition: all .15s;
        }
        .na-pkg-card:hover { border-color: #94a3b8; }
        .na-pkg-card.active { background: #f0fdf4; border-color: #1a6b3a; }
        .na-pkg-card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
        .na-pkg-card-meta { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
        .na-pkg-card-price { font-size: 14px; font-weight: 800; color: #1a6b3a; }

        .na-date-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 26px; }
        .na-date-pill {
          flex-shrink: 0; width: 62px; padding: 10px 0; border-radius: 12px; text-align: center;
          border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s;
        }
        .na-date-pill.active { background: #1a6b3a; border-color: #1a6b3a; }
        .na-date-pill.active .na-dow, .na-date-pill.active .na-dnum, .na-date-pill.active .na-dmon { color: #fff; }
        .na-dow { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .na-dnum { font-size: 17px; font-weight: 800; color: #0f172a; margin: 2px 0; }
        .na-dmon { font-size: 10px; color: #94a3b8; }

        .na-slot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; }
        @media (min-width: 480px) { .na-slot-grid { grid-template-columns: repeat(3, 1fr); } }
        .na-slot-btn {
          padding: 10px 6px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 12.5px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s;
        }
        .na-slot-btn:hover { border-color: #94a3b8; }
        .na-slot-btn.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-slot-btn.taken { background: #f8fafc; border-color: #e2e8f0; color: #cbd5e1; cursor: not-allowed; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .na-slot-btn.taken:hover { border-color: #e2e8f0; }
        .na-slot-taken-tag { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; color: #cbd5e1; }
        .na-slot-empty { font-size: 13px; color: #94a3b8; padding: 18px 0; text-align: center; background: #f8fafc; border-radius: 10px; margin-bottom: 8px; }

        .na-inp {
          width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 11px 13px;
          font-size: 14px; color: #0f172a; outline: none; background: #f8fafc; box-sizing: border-box;
          font-family: inherit; transition: border-color .15s;
        }
        .na-inp:focus { border-color: #1a6b3a; background: #fff; }
        .na-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
        .na-lbl { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 6px; }
        .na-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 480px) { .na-row { grid-template-columns: 1fr; } }

        .na-btn-row { display: flex; gap: 10px; margin-top: 10px; }
        .na-btn-back {
          flex: 0 0 auto; padding: 15px 20px; border: 1.5px solid #e2e8f0; border-radius: 12px;
          background: #fff; color: #475569; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s;
        }
        .na-btn-back:hover { border-color: #94a3b8; }
        .na-submit {
          display: block; width: 100%; flex: 1; padding: 15px 0; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff;
          font-size: 15px; font-weight: 800; cursor: pointer; transition: all .2s;
          box-shadow: 0 6px 18px rgba(22,101,52,.28);
        }
        .na-submit:disabled { opacity: .6; cursor: not-allowed; }

        .na-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }

        .na-lookup-box { border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .na-lookup-checking { background: #f8fafc; color: #64748b; }
        .na-lookup-found { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-weight: 700; }
        .na-lookup-notfound { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .na-lookup-link { background: none; border: none; color: inherit; text-decoration: underline; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; flex-shrink: 0; }

        .na-review { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; font-size: 13.5px; color: #334155; line-height: 2; margin-bottom: 20px; }
        .na-review strong { color: #0f172a; }
        .na-price-breakdown { border-top: 1px dashed #cbd5e1; margin-top: 8px; padding-top: 8px; }
        .na-price-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #1a6b3a; margin-top: 4px; }

        .na-success { text-align: center; padding: 20px 4px; }
        .na-success-icon {
          width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; color: #16a34a;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 34px;
        }
        .na-success h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
        .na-success p { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 20px; }
        .na-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; text-align: left; font-size: 13.5px; color: #334155; line-height: 2; }
      `}</style>}

      <div className="na-page">
        <div className="na-wrap">
          <div className="na-card">
            {status === "success" ? (
              <div className="na-success">
                <div className="na-success-icon">✓</div>
                <h2>You're all set, {(effectiveName || "there").split(" ")[0]}!</h2>
                <p>Your appointment at our Noida center is confirmed. We'll see you there — please arrive 10 minutes early.</p>
                <div className="na-summary">
                  <div><strong>Date:</strong> {selectedDateLabel ? `${selectedDateLabel.weekday}, ${selectedDateLabel.day} ${selectedDateLabel.month}` : selectedDate}</div>
                  <div><strong>Time:</strong> {selectedSlot}</div>
                  <div><strong>Session:</strong> {modeLabel} · {formatLabel}</div>
                  <div><strong>Amount Paid:</strong> ₹{totalAmount}</div>
                  <div><strong>Location:</strong> Sector 51, Noida, Uttar Pradesh</div>
                  {form.email && <div><strong>Confirmation sent to:</strong> {form.email}</div>}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayment}>
                <div className="na-steps">
                  {STEP_LABELS.map((label, i) => {
                    const n = i + 1;
                    const state = n < step ? "done" : n === step ? "active" : "";
                    return (
                      <React.Fragment key={label}>
                        <div className={`na-step-dot ${state}`}>
                          <div className="na-step-circle">{n < step ? "✓" : n}</div>
                          <div className="na-step-label">{label}</div>
                        </div>
                        {i < STEP_LABELS.length - 1 && <div className={`na-step-line ${n < step ? "done" : ""}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {step === 1 && (
                  <>
                    <div className="na-tabs">
                      <button type="button" className={`na-tab ${bookingType === "new" ? "active" : ""}`} onClick={() => switchTab("new")}>New Client</button>
                      <button type="button" className={`na-tab ${bookingType === "followup" ? "active" : ""}`} onClick={() => switchTab("followup")}>Follow-up</button>
                    </div>

                    {bookingType === "followup" ? (
                      <>
                        <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                          <div>
                            <label className="na-lbl">Phone Number *</label>
                            <input
                              className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)}
                              placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" maxLength={10}
                            />
                          </div>
                        </div>
                        {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                        {lookupStatus === "found" && !manualOverride && (
                          <div className="na-lookup-box na-lookup-found">
                            <span>👋 Welcome back, {foundName}!</span>
                            <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                          </div>
                        )}
                        {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                          <div className="na-lookup-box na-lookup-notfound">
                            {lookupStatus === "not-found" ? "New here — please add your details below." : "No problem, please add your details below."}
                          </div>
                        )}
                        {needsFullDetails && form.phone.length === 10 && (
                          <div className="na-row">
                            <div>
                              <label className="na-lbl">Full Name *</label>
                              <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                            </div>
                            <div>
                              <label className="na-lbl">Age</label>
                              <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                            </div>
                          </div>
                        )}
                        {form.phone.length === 10 && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional, for confirmation)</span></label>
                              <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="na-row">
                          <div>
                            <label className="na-lbl">Full Name *</label>
                            <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                          </div>
                          <div>
                            <label className="na-lbl">Age</label>
                            <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                          </div>
                        </div>
                        <div className="na-row">
                          <div>
                            <label className="na-lbl">Phone Number *</label>
                            <input className="na-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" type="tel" inputMode="numeric" maxLength={10} />
                          </div>
                          <div>
                            <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                            <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                          </div>
                        </div>
                      </>
                    )}

                    {(bookingType === "new" || form.phone.length === 10) && (
                      <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                        <div>
                          <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                          <textarea className="na-inp na-textarea" rows={3} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                        </div>
                      </div>
                    )}

                    {error && <div className="na-error">⚠️ {error}</div>}
                    <button type="button" className="na-submit" onClick={goToStep2}>Continue →</button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="na-section-label">What kind of session?</div>
                    <div className="na-pill-row">
                      <div className={`na-pill ${sessionMode === "individual" ? "active" : ""}`} onClick={() => setSessionMode("individual")}>
                        Individual
                        <span className="na-pill-price">₹{pricing?.[priceFieldFor("individual", format)] ?? "—"}</span>
                      </div>
                      <div className={`na-pill ${sessionMode === "couple" ? "active" : ""}`} onClick={() => setSessionMode("couple")}>
                        Couple
                        <span className="na-pill-price">₹{pricing?.[priceFieldFor("couple", format)] ?? "—"}</span>
                      </div>
                      {(pricing?.packages || []).length > 0 && (
                        <div className={`na-pill ${sessionMode === "package" ? "active" : ""}`} onClick={() => setSessionMode("package")}>
                          Package
                          <span className="na-pill-price">{pricing.packages.length} available</span>
                        </div>
                      )}
                    </div>

                    {sessionMode === "package" && (
                      <div className="na-pkg-card-row">
                        {(pricing?.packages || []).map(pkg => (
                          <div
                            key={pkg._id}
                            className={`na-pkg-card ${selectedPackageId === pkg._id ? "active" : ""}`}
                            onClick={() => setSelectedPackageId(pkg._id)}
                          >
                            <div>
                              <div className="na-pkg-card-name">{pkg.name}</div>
                              <div className="na-pkg-card-meta">{pkg.sessionsCount} sessions</div>
                            </div>
                            <div className="na-pkg-card-price">₹{pkg.price}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="na-section-label">Format</div>
                    <div className="na-pill-row">
                      <div className={`na-pill ${format === "in-person" ? "active" : ""}`} onClick={() => setFormat("in-person")}>In-person</div>
                      <div className={`na-pill ${format === "online" ? "active" : ""}`} onClick={() => setFormat("online")}>Online</div>
                      <div className={`na-pill ${format === "home-visit" ? "active" : ""}`} onClick={() => setFormat("home-visit")}>Home Visit</div>
                    </div>

                    {format === "home-visit" && (
                      <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                        <div>
                          <label className="na-lbl">Address in Noida *</label>
                          <textarea className="na-inp na-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat / House no., Street, Sector, Landmark…" />
                        </div>
                      </div>
                    )}

                    {error && <div className="na-error">⚠️ {error}</div>}
                    <div className="na-btn-row">
                      <button type="button" className="na-btn-back" onClick={() => setStep(1)}>Back</button>
                      <button type="button" className="na-submit" onClick={goToStep3}>Continue →</button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="na-section-label">Choose a date</div>
                    {dateOptions === null ? (
                      <div className="na-slot-empty">Loading available dates…</div>
                    ) : dateOptions.length === 0 ? (
                      <div className="na-slot-empty">No slots are open right now — please WhatsApp us and we'll set one up.</div>
                    ) : (
                      <div className="na-date-strip">
                        {dateOptions.map(d => (
                          <div
                            key={d.value}
                            className={`na-date-pill ${selectedDate === d.value ? "active" : ""}`}
                            onClick={() => setSelectedDate(d.value)}
                          >
                            <div className="na-dow">{d.weekday}</div>
                            <div className="na-dnum">{d.day}</div>
                            <div className="na-dmon">{d.month}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {dateOptions && dateOptions.length > 0 && (
                      <>
                        <div className="na-section-label">Choose a time</div>
                        {slotsLoading ? (
                          <div className="na-slot-empty">Loading available times…</div>
                        ) : slots.length === 0 ? (
                          <div className="na-slot-empty">No slots left for this day — try another date.</div>
                        ) : (
                          <div className="na-slot-grid">
                            {slots.map(s => (
                              <button
                                type="button"
                                key={s.slot}
                                disabled={s.booked}
                                className={`na-slot-btn ${selectedSlot === s.slot ? "active" : ""} ${s.booked ? "taken" : ""}`}
                                onClick={() => setSelectedSlot(s.slot)}
                              >
                                {s.slot}
                                {s.booked && <span className="na-slot-taken-tag">Not available</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {error && <div className="na-error" style={{ marginTop: 16 }}>⚠️ {error}</div>}
                    <div className="na-btn-row">
                      <button type="button" className="na-btn-back" onClick={() => setStep(2)}>Back</button>
                      <button type="button" className="na-submit" disabled={!selectedSlot} onClick={goToStep4}>Continue →</button>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="na-section-label">Review &amp; confirm</div>
                    <div className="na-review">
                      <div><strong>Name:</strong> {effectiveName || "—"}</div>
                      <div><strong>Phone:</strong> {form.phone}</div>
                      <div><strong>Session:</strong> {modeLabel} · {formatLabel}</div>
                      {format === "home-visit" && <div><strong>Address:</strong> {address}</div>}
                      <div><strong>Date:</strong> {selectedDateLabel ? `${selectedDateLabel.weekday}, ${selectedDateLabel.day} ${selectedDateLabel.month}` : selectedDate}</div>
                      <div><strong>Time:</strong> {selectedSlot}</div>
                      {form.concern && <div><strong>Concern:</strong> {form.concern}</div>}
                      <div className="na-price-breakdown">
                        <div>{modeLabel === "Package" ? selectedPackage?.name : `${modeLabel} session`}: ₹{baseAmount}</div>
                        <div>Platform fee: ₹{platformFee}</div>
                        <div className="na-price-total"><span>Total</span><span>₹{totalAmount}</span></div>
                      </div>
                    </div>

                    {error && <div className="na-error">⚠️ {error}</div>}
                    <div className="na-btn-row">
                      <button type="button" className="na-btn-back" onClick={() => setStep(3)}>Back</button>
                      <button type="submit" className="na-submit" disabled={status === "loading"}>
                        {status === "loading" ? "Opening payment…" : `Pay ₹${totalAmount} & Confirm`}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
