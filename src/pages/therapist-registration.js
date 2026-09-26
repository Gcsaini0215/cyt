import React, { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import RegistrationHeader from "../components/therapist/registration-header";
import Footer from "../components/footer";
import { therapistRegistrationUrl, verifyOtpUrl, checkTherapistEmailUrl, checkTherapistStatusUrl, resendTherapistOtpUrl } from "../utils/url";
import { postData, postFormData } from "../utils/actions";

const MapPicker = dynamic(() => import("../components/therapist/map-picker"), { ssr: false });

const PROFILE_TYPES = ["Counselling Psychologist", "Psychiatrist", "Clinical Psychologist", "Special Educator"];
const MODES = [
  { label: "Virtual", value: "1", icon: "feather-video" },
  { label: "In-Person", value: "2", icon: "feather-map-pin" },
  { label: "Both", value: "3", icon: "feather-globe" },
];
const ABOUT_MIN = 50;
const ABOUT_MAX = 250;
const wordCount = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;
const needsAddress = (mode) => mode === "2" || mode === "3";
const ID_CARD_TYPES = ["Aadhar Card", "PAN Card", "Voter ID", "Passport", "Driving License"];
const MAX_FILE_MB = 5;
const DRAFT_KEY = "cyt_therapist_reg_draft";

// The form is split into three short steps; each validates only its own fields.
const FORM_STEPS = [
  { label: "Your details", icon: "feather-user" },
  { label: "Your practice", icon: "feather-briefcase" },
  { label: "Documents", icon: "feather-upload-cloud" },
];

const JOURNEY_STEPS = [
  { label: "Application", icon: "feather-edit-3" },
  { label: "Review",      icon: "feather-search" },
  { label: "Approval",    icon: "feather-shield" },
  { label: "Payment",     icon: "feather-credit-card" },
  { label: "Live",        icon: "feather-zap" },
];

function JourneySteps({ current, isMobile }) {
  const circleSize = isMobile ? 22 : 28;
  return (
    <div style={{ background: "#fff", border: "1px solid #dbe3df", borderRadius: 4, borderTop: "3px solid #d4af37", padding: isMobile ? "10px 10px" : "12px 20px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center" }}>
        {JOURNEY_STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const state = done ? "done" : active ? "active" : "upcoming";
          const color = state === "upcoming" ? "#cbd5c9" : "#0f3d24";
          return (
            <React.Fragment key={s.label}>
              <div style={{
                display: "flex", flexDirection: isMobile ? "column" : "row",
                alignItems: "center", gap: isMobile ? 3 : 7, flex: 1, minWidth: 0, justifyContent: "center",
              }}>
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: state === "done" ? "#0f3d24" : state === "active" ? "#f0fdf4" : "#fff",
                  border: `2px solid ${state === "active" ? "#228756" : color}`,
                  boxShadow: state === "active" ? "0 0 0 3px rgba(34,135,86,0.12)" : "none",
                  transition: "all 0.2s",
                }}>
                  {state === "done"
                    ? <i className="feather-check" style={{ fontSize: isMobile ? 10 : 12, color: "#fff" }}></i>
                    : <i className={s.icon} style={{ fontSize: isMobile ? 10 : 12, color: state === "active" ? "#228756" : "#94a3b8" }}></i>}
                </div>
                <span style={{
                  fontSize: isMobile ? 8.5 : 12, fontWeight: state === "upcoming" ? 600 : 800,
                  color: state === "upcoming" ? "#94a3b8" : "#0f3d24",
                  whiteSpace: "nowrap",
                }}>{s.label}</span>
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <div style={{
                  flex: isMobile ? "0 0 8px" : "0 0 20px", height: 2, minWidth: isMobile ? 8 : 20,
                  alignSelf: isMobile ? "flex-start" : "center",
                  marginTop: isMobile ? circleSize / 2 - 1 : 0,
                  background: i < current ? "#0f3d24" : "#e2e8f0", transition: "background 0.2s",
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY = {
  name: "", email: "", phone: "",
  profileType: "", mode: "",
  about: "",
  officeAddress: "", officePincode: "", officeCity: "", officeState: "", officeLat: null, officeLng: null,
  resumeFile: null, qualificationCertFile: null, idCardFile: null, idCardType: "",
  agreeTerms: false,
};

function validateStep(step, f) {
  if (step === 1) {
    const name = f.name.trim();
    if (!name || name.length < 3)                            return "Enter your full name (min 3 characters)";
    if (name.length > 30)                                    return "Name can be at most 30 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))        return "Enter a valid email address";
    if (!/^\d{10}$/.test(f.phone))                           return "Enter a valid 10-digit phone number";
  }
  if (step === 2) {
    if (!f.profileType)                                      return "Select your profile type";
    if (!f.mode)                                             return "Select your preferred service mode";
    const words = wordCount(f.about);
    if (words < ABOUT_MIN)                                   return `Write at least ${ABOUT_MIN} words about yourself (${words} so far)`;
    if (words > ABOUT_MAX)                                   return `Keep your About under ${ABOUT_MAX} words (${words} now)`;
    if (needsAddress(f.mode)) {
      if (f.officeAddress.trim().length < 10)                return "Enter the full address where you see clients";
      if (!/^\d{6}$/.test(f.officePincode))                  return "Enter a valid 6-digit PIN code";
      if (!f.officeCity.trim() || !f.officeState.trim())     return "Enter your city and state";
      if (f.officeLat == null || f.officeLng == null)        return "Place your clinic's pin on the map";
    }
  }
  if (step === 3) {
    if (!f.resumeFile)                                       return "Upload your resume";
    if (!f.qualificationCertFile)                            return "Upload your highest qualification certificate";
    if (!f.idCardType)                                       return "Select your ID card type";
    if (!f.idCardFile)                                       return "Upload your ID card";
    if (!f.agreeTerms)                                       return "Please agree to the terms and conditions";
  }
  return null;
}

function validate(f) {
  return validateStep(1, f) || validateStep(2, f) || validateStep(3, f);
}

// small thumbnail for image uploads (object URL released when the file changes)
function FileThumb({ file }) {
  const [url, setUrl] = React.useState("");
  React.useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) { setUrl(""); return undefined; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 6, border: "1px solid #dbe3df" }} />;
}

const STAGE_INFO = {
  email_pending: { icon: "feather-mail",         color: "#fbbf24", label: "Email verification pending", text: "Please check your inbox for the OTP to verify your email." },
  review:        { icon: "feather-search",       color: "#38bdf8", label: "Under review",                text: "Your application is with our team for review." },
  approved:      { icon: "feather-check-circle", color: "#4ade80", label: "Approved",                    text: "You're approved! Log in to access your therapist dashboard." },
};

const STAGE_TO_STEP = { email_pending: 0, review: 1, approved: 2 };

function StatusCheckBox({ isMobile, onResult }) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [err, setErr] = React.useState("");

  const check = async () => {
    setErr(""); setResult(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await postData(checkTherapistStatusUrl, { email });
      setResult(res.data);
      onResult?.(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "No application found for this email");
    }
    setLoading(false);
  };

  const boxStyle = {
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 3, padding: "10px 12px", width: isMobile ? "100%" : 320, flexShrink: 0,
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{
        ...boxStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        color: "#fff", fontSize: 12.5, fontWeight: 700, justifyContent: isMobile ? "center" : "flex-start",
      }}>
        <i className="feather-search" style={{ fontSize: 13 }}></i> Already applied? Check status
      </button>
    );
  }

  return (
    <div style={boxStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.6 }}>Check Application Status</span>
        <button type="button" onClick={() => { setOpen(false); setResult(null); setErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <i className="feather-x" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}></i>
        </button>
      </div>
      <input
        type="email" value={email} placeholder="you@example.com"
        onChange={e => { setEmail(e.target.value); setErr(""); setResult(null); }}
        onKeyDown={e => e.key === "Enter" && check()}
        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.95)", border: "none", borderRadius: 3, padding: "8px 10px", fontSize: 12.5, outline: "none", fontFamily: "inherit", marginBottom: 8 }}
      />
      <button type="button" onClick={check} disabled={loading} style={{
        width: "100%", background: "#d4af37", border: "none", borderRadius: 3, padding: "8px 12px",
        color: "#0f3d24", fontWeight: 800, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "Checking…" : "Check Status"}
      </button>

      <Link href={email ? `/therapist-payment?email=${encodeURIComponent(email)}` : "/therapist-payment"} style={{
        width: "100%", marginTop: 8, background: "transparent", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 3, padding: "8px 12px",
        color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        textDecoration: "none", boxSizing: "border-box",
      }}>
        <i className="feather-credit-card" style={{ fontSize: 12 }}></i> Make Payment
      </Link>

      {err && (
        <p style={{ fontSize: 11, color: "#fca5a5", margin: "8px 0 0", fontWeight: 600 }}>{err}</p>
      )}

      {result && (() => {
        const info = STAGE_INFO[result.stage] || STAGE_INFO.review;
        return (
          <div style={{ marginTop: 10, background: "rgba(255,255,255,0.1)", border: `1px solid ${info.color}55`, borderRadius: 3, padding: "9px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <i className={info.icon} style={{ fontSize: 12, color: info.color }}></i>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{info.label}</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5 }}>{info.text}</p>
            {result.appliedOn && (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
                Applied on {new Date(result.appliedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function SuccessScreen({ name, email }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#2ecc71)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <i className="feather-check" style={{ fontSize: 36, color: "#fff" }}></i>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>
          Your Profile Has Been Sent Under Review
        </h2>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
          Thank you, <strong>{name}</strong>. Your application and documents have been received
          and our team is now reviewing your profile, resume, qualification certificate, and ID.
          You'll hear back within <strong>1–2 business days</strong> on your registered email{" "}
          <strong>{email}</strong>.
        </p>

        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "18px 20px", marginBottom: 24, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#166534", margin: "0 0 4px" }}>Need further assistance?</p>
          <p style={{ fontSize: 12.5, color: "#3f6212", margin: "0 0 12px", lineHeight: 1.6 }}>
            Message us on WhatsApp or email us — our team is happy to help with any questions about your application.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="https://wa.me/918077757951?text=Hi%2C%20I%20registered%20as%20a%20therapist%20and%20need%20assistance."
              target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", background: "#25D366", color: "#fff", padding: "9px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 700 }}>
              <i className="feather-message-circle"></i> WhatsApp Us
            </a>
            <a href="mailto:hello@chooseyourtherapist.in"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", background: "#fff", color: "#166534", border: "1.5px solid #86efac", padding: "9px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 700 }}>
              <i className="feather-mail"></i> hello@chooseyourtherapist.in
            </a>
          </div>
        </div>

        <Link href="/" style={{
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 28px", borderRadius: 12,
          background: "linear-gradient(135deg,#1b5e20,#228756)",
          color: "#fff", fontWeight: 700, fontSize: 14,
          boxShadow: "0 4px 14px rgba(34,135,86,0.25)",
        }}>
          <i className="feather-home"></i> Go to Home
        </Link>
      </div>
    </div>
  );
}

export default function TherapistRegistration() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [checkedStage, setCheckedStage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [step, setStep] = useState(1);
  const [fileErrors, setFileErrors] = useState({});
  const [draftRestored, setDraftRestored] = useState(false);
  const formTopRef = React.useRef(null);

  // Restore a saved draft (text fields only — browsers can't keep picked files)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved && (saved.name || saved.email || saved.phone)) {
        setForm((f) => ({ ...f, ...saved }));
        setDraftRestored(true);
      }
    } catch { /* storage blocked or bad JSON */ }
  }, []);

  // Keep the draft up to date while they type
  useEffect(() => {
    if (submitted) return;
    const { name, email, phone, profileType, mode, about, officeAddress, officePincode, officeCity, officeState, officeLat, officeLng, idCardType } = form;
    if (!name && !email && !phone) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, email, phone, profileType, mode, about, officeAddress, officePincode, officeCity, officeState, officeLat, officeLng, idCardType })); } catch { /* ignore */ }
  }, [form, submitted]);

  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };
  const startOver = () => { clearDraft(); setForm(EMPTY); setStep(1); setDraftRestored(false); setError(""); };

  const scrollToForm = () => {
    const el = formTopRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" });
  };

  // file picked (or photographed) — check the size straight away, not at submit
  const pickFile = (key, file) => {
    if (!file) { set(key, null); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileErrors((e) => ({ ...e, [key]: `This file is ${(file.size / 1048576).toFixed(1)}MB — please upload one under ${MAX_FILE_MB}MB.` }));
      return;
    }
    setFileErrors((e) => ({ ...e, [key]: "" }));
    set(key, file);
  };

  const goNext = async () => {
    setError("");
    const err = validateStep(step, form);
    if (err) { setError(err); scrollToForm(); return; }
    if (step === 1) {
      // tell them now (not after uploading documents) if this email is already registered
      setLoading(true);
      try {
        await postData(checkTherapistEmailUrl, { email: form.email });
      } catch (err2) {
        const msg = err2.response?.data?.message || "";
        if (err2.response?.status === 400 && msg) { setLoading(false); setError(msg); scrollToForm(); return; }
      }
      setLoading(false);
    }
    setStep((n) => Math.min(3, n + 1));
    scrollToForm();
  };
  const goBack = () => { setError(""); setStep((n) => Math.max(1, n - 1)); scrollToForm(); };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 992);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setProfileType = (v) => set("profileType", v);

  // PIN code → city + state (India Post) and a map centre (OpenStreetMap search)
  const [pinInfo, setPinInfo] = useState({ loading: false, msg: "", center: null });
  useEffect(() => {
    const pin = form.officePincode;
    if (!/^\d{6}$/.test(pin) || !needsAddress(form.mode)) { setPinInfo((p) => ({ ...p, msg: "", loading: false })); return undefined; }
    let alive = true;
    setPinInfo((p) => ({ ...p, loading: true, msg: "" }));
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const po = d?.[0]?.PostOffice?.[0];
        if (po) {
          setForm((f) => ({ ...f, officeCity: f.officeCity || po.District || "", officeState: f.officeState || po.State || "" }));
          setPinInfo((p) => ({ ...p, loading: false, msg: `${po.District}, ${po.State}` }));
        } else setPinInfo((p) => ({ ...p, loading: false, msg: "We couldn't find this PIN — please check it." }));
      })
      .catch(() => alive && setPinInfo((p) => ({ ...p, loading: false })));
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&postalcode=${pin}`)
      .then((r) => r.json())
      .then((d) => { if (alive && d?.[0]) setPinInfo((p) => ({ ...p, center: { lat: +d[0].lat, lng: +d[0].lon } })); })
      .catch(() => {});
    return () => { alive = false; };
  }, [form.officePincode, form.mode]);

  const handleReview = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate(form);
    if (err) { setError(err); scrollToForm(); return; }

    setLoading(true);
    try {
      await postData(checkTherapistEmailUrl, { email: form.email });
    } catch (err2) {
      setLoading(false);
      const msg = err2.response?.data?.message || "";
      if (err2.response?.status === 400 && msg) {
        setError(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // network/server error — allow to proceed
    }
    setLoading(false);
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const data = new FormData();
    data.append("resume", form.resumeFile);
    data.append("qualification_certificate", form.qualificationCertFile);
    data.append("id_card", form.idCardFile);
    data.append("idCardType", form.idCardType);
    data.append("name", form.name);
    data.append("phone", form.phone);
    data.append("email", form.email);
    data.append("type", form.profileType);
    data.append("mode", form.mode);
    data.append("about", form.about.trim());
    if (needsAddress(form.mode)) {
      data.append("officeAddress", form.officeAddress.trim());
      data.append("officePincode", form.officePincode);
      data.append("officeCity", form.officeCity.trim());
      data.append("officeState", form.officeState.trim());
      if (form.officeLat != null) { data.append("officeLat", String(form.officeLat)); data.append("officeLng", String(form.officeLng)); }
    }

    try {
      const response = await postFormData(therapistRegistrationUrl, data);
      if (response.status) {
        setRegisteredEmail(form.email);
        setReviewing(false);
        setOtpStep(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleOtpChange = (value) => setOtp(value.replace(/\D/g, "").trim().slice(0, 6));

  const resendOtp = async () => {
    setResendMsg("");
    setOtpError("");
    setResendLoading(true);
    try {
      await postData(resendTherapistOtpUrl, { email: registeredEmail });
      setResendMsg("OTP resent successfully. Please check your email.");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    }
    setResendLoading(false);
  };

  const verifyOtp = async () => {
    setOtpError("");
    if (otp.length !== 6) return setOtpError("Please enter valid OTP");
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, { email: registeredEmail, otp: otp.trim() });
      if (response.status) {
        setOtp("");
        setOtpStep(false);
        setSubmitted(true);
        clearDraft();
      } else {
        setOtpError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "OTP verification failed. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "#fff", border: "1.5px solid #cbd5c9",
    borderRadius: 3, padding: "10px 13px", fontSize: 14, color: "#1e293b",
    outline: "none", transition: "border-color 0.2s",
    fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 11.5, fontWeight: 700, color: "#3f4d47", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" };
  const sectionHead = { fontSize: 13.5, fontWeight: 800, color: "#0f3d24", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #0f3d24", display: "flex", alignItems: "center", gap: 12, textTransform: "uppercase", letterSpacing: "0.8px" };
  const sectionNum = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 4, background: "#0f3d24", color: "#fff", fontSize: 12, fontWeight: 900, flexShrink: 0, letterSpacing: 0, textTransform: "none" };
  const fieldWrap = { marginBottom: 18 };
  const gridTwo = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 18px", alignItems: "start" };

  return (
    <>
      <Head>
        <title>Therapist Registration | Join Our Network of Mental Health Experts | Choose Your Therapist</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Are you a qualified psychologist or psychiatrist? Register with Choose Your Therapist to connect with clients across India and grow your professional practice on our secure platform." />
        <meta name="keywords" content="Therapist Registration, Join Mental Health Network, Psychologist Jobs India, Online Therapy Practice" />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapist-registration" />

        <meta property="og:title" content="Therapist Registration | Join Our Network of Mental Health Experts" />
        <meta property="og:description" content="Register with Choose Your Therapist to connect with clients across India and grow your professional practice." />
        <meta property="og:url" content="https://chooseyourtherapist.in/therapist-registration" />
        <meta key="og:type" property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Therapist Registration | Join Our Network of Mental Health Experts" />
        <meta name="twitter:description" content="Register as a verified therapist and grow your practice with Choose Your Therapist." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        input:focus, select:focus, textarea:focus { border-color: #228756 !important; box-shadow: 0 0 0 3px rgba(34,135,86,0.08) !important; }
        .req { color: #ef4444; }
        .section-card { background: #fff; border: 1px solid #dbe3df; border-radius: 4px; padding: 26px 28px; margin-bottom: 20px; }
        @media (max-width: 991px) { .section-card { padding: 18px 16px; } }
        @keyframes trspin { to { transform: rotate(360deg); } }

        .af-doc { border: 1px solid #dbe3df; border-radius: 4px; background: #fff; overflow: hidden; }
        .af-titlebar { background: #0f3d24; text-align: left; padding: 18px 24px; border-radius: 4px 4px 0 0; border-bottom: 3px solid #d4af37; }
        .af-titlebar-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.65) !important; margin: 0 0 4px; }
        .af-titlebar-title { font-size: 18px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; margin: 0; color: #ffffff !important; }
        .af-titlebar-sub { font-size: 12px; color: rgba(255,255,255,0.7) !important; margin: 6px 0 0; }
        .tr-steps { display: flex; gap: 8px; margin-bottom: 10px; }
        .tr-step { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
        .tr-step-dot { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800; background: #fff; border: 2px solid #cbd5c9; color: #94a3b8; }
        .tr-step.on .tr-step-dot { border-color: #228756; color: #166534; background: #f0fdf4; box-shadow: 0 0 0 3px rgba(34,135,86,.12); }
        .tr-step.done .tr-step-dot { background: #166534; border-color: #166534; color: #fff; }
        .tr-step-label { font-size: 13px; font-weight: 700; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tr-step.on .tr-step-label, .tr-step.done .tr-step-label { color: #0f3d24; }
        .tr-bar { height: 4px; border-radius: 999px; background: #e8efeb; margin-bottom: 22px; overflow: hidden; }
        .tr-bar i { display: block; height: 100%; background: linear-gradient(90deg, #22a35a, #166534); border-radius: 999px; transition: width .35s ease; }
        .tr-note { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; font-weight: 600; }
        .tr-note button { margin-left: auto; background: none; border: none; color: #1d4ed8; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 13px; }
        .tr-ready { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px; }
        .tr-ready p { margin: 0 0 8px; font-size: 13.5px; color: #14532d; font-weight: 600; line-height: 1.5; }
        .tr-ready p i { margin-right: 6px; vertical-align: -1px; }
        .tr-ready ul { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; }
        .tr-ready li { font-size: 13px; color: #166534; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .tr-ready li span { font-weight: 500; color: #4d7c5f; }
        .tr-ready small { font-size: 12px; color: #4d7c5f; }
        .tr-hint { font-size: 12px; color: #64748b; margin: 8px 0 0; display: flex; align-items: center; gap: 6px; }
        .tr-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .tr-chip { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; border-radius: 999px; border: 1.5px solid #cbd5c9; background: #fff; color: #334155; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
        .tr-chip:hover { border-color: #86efac; }
        .tr-chip.on { border-color: #228756; background: #f0fdf4; color: #166534; font-weight: 700; }
        .tr-chip.sm { padding: 7px 12px; font-size: 12.5px; }
        .tr-chip i { font-size: 13px; }
        .tr-upload { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border: 2px dashed #cbd5c9; border-radius: 12px; padding: 14px; background: #fafafa; }
        .tr-upload.has { border-style: solid; border-color: #86efac; background: #f0fdf4; }
        .tr-upload-name { flex: 1; min-width: 140px; display: flex; flex-direction: column; }
        .tr-upload-name b { font-size: 13.5px; color: #1e293b; word-break: break-all; }
        .tr-upload-name span { font-size: 11.5px; color: #64748b; }
        .tr-btn-sm { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 9px; background: #166534; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; margin: 0; }
        .tr-btn-sm.ghost { background: #fff; color: #166534; border: 1.5px solid #86efac; }
        .tr-link { background: none; border: none; color: #dc2626; font-size: 12.5px; font-weight: 700; cursor: pointer; }
        .tr-file-err { margin: 6px 0 0; font-size: 12.5px; color: #dc2626; font-weight: 600; }
        .tr-nav { display: flex; gap: 10px; margin-top: 4px; }
        .tr-addr { border: 1px solid #fde68a; background: #fffdf5; border-radius: 12px; padding: 16px; margin-top: 4px; }
        .tr-addr-title { margin: 0 0 12px; font-size: 13.5px; font-weight: 800; color: #92400e; display: flex; align-items: center; gap: 7px; }
        .tr-map { height: 280px; border-radius: 12px; border: 1.5px solid #cbd5c9; overflow: hidden; z-index: 0; background: #e8efeb; }
        .tr-map-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
        .tr-map-status { font-size: 12.5px; color: #475569; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
        .tr-map-status i { color: #16a34a; }
        .tr-words { text-align: right; font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 6px; }
        .tr-words.ok { color: #16a34a; }
        .tr-words.over { color: #dc2626; }
        @media (max-width: 575px) { .tr-map { height: 240px; } }
        .tr-back { flex: 1; padding: 14px; border-radius: 10px; border: 1.5px solid #cbd5c9; background: #fff; color: #374151; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tr-next { flex: 2; padding: 14px; border-radius: 10px; border: none; background: linear-gradient(135deg, #1b5e20, #228756); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .tr-next:disabled { opacity: .7; cursor: not-allowed; }
        @media (max-width: 575px) {
          .tr-step-label { font-size: 11px; }
          .tr-step-dot { width: 24px; height: 24px; font-size: 11px; }
          .tr-step { gap: 5px; }
        }
        .af-notice { display: flex; gap: 10px; align-items: flex-start; background: #fffbeb; border: 1px solid #fde68a; border-left: 3px solid #d4af37; border-radius: 3px; padding: 12px 14px; margin: 18px; font-size: 11.5px; color: #78350f; line-height: 1.6; }
      ` }} />

      <MyNavbar />
      <RegistrationHeader />

      {/* Full-bleed white backdrop — Footer.js forces <body> dark site-wide,
          so without this the margins around the container (and the gap
          before Footer actually starts) would show that dark green through. */}
      <div style={{ background: "#fff" }}>
      <div className="container" style={{ padding: isMobile ? "32px 16px" : "48px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <JourneySteps current={checkedStage ? (STAGE_TO_STEP[checkedStage] ?? (submitted ? 1 : 0)) : (submitted ? 1 : 0)} isMobile={isMobile} />
        </div>
        {submitted ? (
          <SuccessScreen name={form.name} email={registeredEmail} />
        ) : otpStep ? (
          /* ── OTP VERIFICATION ── */
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div className="af-doc">
              <div className="af-titlebar">
                <p className="af-titlebar-eyebrow">Choose Your Therapist</p>
                <h1 className="af-titlebar-title">Verify Your Email</h1>
                <p className="af-titlebar-sub">Final step to complete your registration</p>
              </div>
              <div style={{ padding: "26px 28px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <i className="feather-mail" style={{ fontSize: 22, color: "#166534" }}></i>
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                    We've sent a 6-digit code to<br />
                    <strong style={{ color: "#166534" }}>{registeredEmail}</strong>
                  </p>
                </div>

                <div style={{ background: "#f8fafc", border: "1px solid #dbe3df", borderRadius: 3, padding: "18px 14px", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center", margin: "0 0 12px" }}>Enter Verification Code</p>
                  <input
                    type="text" inputMode="numeric" placeholder="• • • • • •"
                    value={otp} onChange={(e) => handleOtpChange(e.target.value)} maxLength={6}
                    style={{
                      width: "100%", padding: 14, border: "1.5px solid #cbd5c9", borderRadius: 3,
                      fontSize: isMobile ? 24 : 28, fontWeight: 800, letterSpacing: isMobile ? 10 : 14, textAlign: "center",
                      boxSizing: "border-box", outline: "none", color: "#111827", background: "#fff", fontFamily: "inherit",
                    }}
                  />
                </div>

                {otpError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, textAlign: "center", fontWeight: 600 }}>{otpError}</p>}
                {resendMsg && <p style={{ color: "#228756", fontSize: 13, marginBottom: 8, textAlign: "center", fontWeight: 600 }}>{resendMsg}</p>}

                <button onClick={verifyOtp} disabled={loading}
                  style={{ width: "100%", padding: "14px", borderRadius: 3, border: "none", background: "linear-gradient(135deg,#1b5e20,#228756)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  {loading
                    ? <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "trspin 0.8s linear infinite" }}></span> Verifying...</>
                    : <><i className="feather-check-circle"></i> Verify &amp; Complete Registration</>}
                </button>

                <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#94a3b8" }}>
                  Didn't receive the code?{" "}
                  <button onClick={resendOtp} disabled={resendLoading}
                    style={{ background: "none", border: "none", color: "#228756", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, opacity: resendLoading ? 0.6 : 1 }}>
                    {resendLoading ? "Sending..." : "Resend"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            maxWidth: 860, margin: "0 auto",
            background: "#fff",
            padding: isMobile ? "20px 16px 24px" : "32px 36px 36px",
          }}>
            <div className="af-doc" style={{ marginBottom: 24 }}>
              <div className="af-titlebar" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", justifyContent: "space-between", gap: isMobile ? 14 : 20 }}>
                <div>
                  <p className="af-titlebar-eyebrow">Choose Your Therapist</p>
                  <h1 className="af-titlebar-title">Therapist Registration Form</h1>
                  <p className="af-titlebar-sub">Join our network of verified mental health professionals</p>
                </div>
                <StatusCheckBox isMobile={isMobile} onResult={(data) => setCheckedStage(data?.stage || null)} />
              </div>
              <div className="af-notice">
                <i className="feather-alert-circle" style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}></i>
                <span>Please read all instructions carefully before filling this form. Fields marked <strong>*</strong> are mandatory. Applications with incomplete or unclear documents may be rejected.</span>
              </div>
            </div>

            {reviewing ? (
              /* ── REVIEW SCREEN ── */
              <div>
                <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#1e293b", margin: "0 0 4px" }}>Review Your Application</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Please review all details before submitting.</p>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                    <i className="feather-alert-circle"></i> {error}
                  </div>
                )}

                {[
                  { title: "Personal Details", icon: "feather-user", color: "#228756", rows: [
                    ["Full Name", form.name], ["Email", form.email], ["Phone", form.phone],
                  ]},
                  { title: "Professional Profile", icon: "feather-briefcase", color: "#0ea5e9", rows: [
                    ["Profile Type", form.profileType],
                    ["Service Mode", MODES.find(m => m.value === form.mode)?.label || "—"],
                  ]},
                  { title: "About You", icon: "feather-align-left", color: "#8b5cf6", rows: [
                    [`About (${wordCount(form.about)} words)`, form.about.trim()],
                  ]},
                  ...(needsAddress(form.mode) ? [{ title: "Practice Location", icon: "feather-map-pin", color: "#f59e0b", rows: [
                    ["Address", `${form.officeAddress.trim()}, ${form.officeCity.trim()}, ${form.officeState.trim()} – ${form.officePincode}`],
                    ["Map pin", form.officeLat != null ? `${form.officeLat}, ${form.officeLng}` : "—"],
                  ]}] : []),
                ].map((section, si) => (
                  <div key={si} className="section-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: section.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={section.icon} style={{ fontSize: 13, color: section.color }}></i>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{section.title}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 24px" }}>
                      {section.rows.map(([label, val], ri) => (
                        <div key={ri} style={section.rows.length === 1 ? { gridColumn: "1 / -1" } : undefined}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "3px 0 0", wordBreak: "break-word", lineHeight: 1.6, whiteSpace: "pre-line" }}>{val || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Documents */}
                <div className="section-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-upload-cloud" style={{ fontSize: 13, color: "#f59e0b" }}></i>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Verification Documents</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Resume / CV", file: form.resumeFile, icon: "feather-file-text" },
                      { label: "Highest Qualification Certificate", file: form.qualificationCertFile, icon: "feather-award" },
                      { label: `ID Card${form.idCardType ? ` (${form.idCardType})` : ""}`, file: form.idCardFile, icon: "feather-credit-card" },
                    ].map(({ label, file, icon }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <i className={icon} style={{ fontSize: 14, color: file ? "#228756" : "#cbd5e1", flexShrink: 0 }}></i>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>{label}</span>
                          <span style={{ fontSize: 13, color: file ? "#374151" : "#94a3b8" }}>{file ? file.name : "Not uploaded"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => { setReviewing(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{ flex: 1, minWidth: 120, padding: "14px", borderRadius: 3, border: "1.5px solid #cbd5c9", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="feather-edit-2"></i> Edit Details
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    style={{ flex: 2, minWidth: 180, padding: "14px", borderRadius: 3, border: "none", background: "linear-gradient(135deg,#1b5e20,#228756)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {loading
                      ? <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "trspin 0.8s linear infinite" }}></span> Submitting...</>
                      : <><i className="feather-send"></i> Confirm &amp; Submit</>}
                  </button>
                </div>
              </div>
            ) : (
              /* ── MAIN FORM: 3 short steps ── */
              <form ref={formTopRef} noValidate onSubmit={(e) => { e.preventDefault(); if (step < 3) goNext(); else handleReview(e); }}>

                {/* step progress */}
                <div className="tr-steps" aria-label={`Step ${step} of 3`}>
                  {FORM_STEPS.map((st, i) => {
                    const n = i + 1;
                    const state = n < step ? "done" : n === step ? "on" : "";
                    return (
                      <div key={st.label} className={`tr-step ${state}`}>
                        <span className="tr-step-dot">{n < step ? <i className="feather-check" /> : n}</span>
                        <span className="tr-step-label">{st.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="tr-bar"><i style={{ width: `${(step / 3) * 100}%` }} /></div>

                {draftRestored && step === 1 && (
                  <div className="tr-note">
                    <i className="feather-rotate-ccw" />
                    <span>We restored the details you filled in last time.</span>
                    <button type="button" onClick={startOver}>Start over</button>
                  </div>
                )}

                {error && (
                  <div role="alert" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                    <i className="feather-alert-circle"></i> {error}
                  </div>
                )}

                {/* ── Step 1: details ── */}
                {step === 1 && (
                  <>
                    <div className="tr-ready">
                      <p><i className="feather-clock" /> Takes about <b>5 minutes</b>. Keep these ready:</p>
                      <ul>
                        <li><i className="feather-file-text" /> Resume / CV <span>(PDF or DOC)</span></li>
                        <li><i className="feather-award" /> Degree or diploma certificate</li>
                        <li><i className="feather-credit-card" /> Aadhaar, PAN or another photo ID</li>
                      </ul>
                      <small>Your progress is saved on this device — you can come back and finish later.</small>
                    </div>

                    <div className="section-card">
                      <div style={sectionHead}><span style={sectionNum}>01</span> Your details</div>
                      <div style={gridTwo}>
                        <div style={fieldWrap}>
                          <label style={labelStyle} htmlFor="tr-name">Full Name <span className="req">*</span></label>
                          <input id="tr-name" style={inputStyle} type="text" autoComplete="name" maxLength={30} placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
                        </div>
                        <div style={fieldWrap}>
                          <label style={labelStyle} htmlFor="tr-email">Email Address <span className="req">*</span></label>
                          <input id="tr-email" style={inputStyle} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value.trim())} />
                        </div>
                      </div>
                      <div style={{ ...fieldWrap, marginBottom: 0 }}>
                        <label style={labelStyle} htmlFor="tr-phone">Phone Number <span className="req">*</span></label>
                        <input id="tr-phone" style={{ ...inputStyle, maxWidth: isMobile ? "100%" : "calc(50% - 9px)" }} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number"
                          value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").slice(0, 10))} />
                        <p className="tr-hint">We&rsquo;ll send your verification code to your email after you submit.</p>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 2: practice ── */}
                {step === 2 && (
                  <div className="section-card">
                    <div style={sectionHead}><span style={sectionNum}>02</span> Your practice</div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Profile Type <span className="req">*</span></label>
                      <div className="tr-chips" role="radiogroup" aria-label="Profile type">
                        {PROFILE_TYPES.map(opt => (
                          <button type="button" key={opt} role="radio" aria-checked={form.profileType === opt}
                            className={`tr-chip ${form.profileType === opt ? "on" : ""}`} onClick={() => setProfileType(opt)}>
                            {form.profileType === opt && <i className="feather-check" />} {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Preferred Service Mode <span className="req">*</span></label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        {MODES.map(m => {
                          const checked = form.mode === m.value;
                          return (
                            <button type="button" key={m.value} onClick={() => set("mode", m.value)} aria-pressed={checked} style={{
                              border: `1.5px solid ${checked ? "#228756" : "#cbd5c9"}`, borderRadius: 10, padding: "12px 8px", cursor: "pointer",
                              background: checked ? "#f0fdf4" : "#fff", transition: "all 0.15s", fontFamily: "inherit",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            }}>
                              <i className={m.icon} style={{ fontSize: 18, color: checked ? "#228756" : "#94a3b8" }}></i>
                              <span style={{ fontSize: 12.5, fontWeight: checked ? 700 : 500, color: checked ? "#166534" : "#475569" }}>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {needsAddress(form.mode) && (
                      <div className="tr-addr">
                        <p className="tr-addr-title"><i className="feather-map-pin" /> Where do you see clients in person?</p>
                        <div style={fieldWrap}>
                          <label style={labelStyle} htmlFor="tr-addr">Full Address <span className="req">*</span></label>
                          <textarea id="tr-addr" rows={2} style={{ ...inputStyle, resize: "vertical" }} autoComplete="street-address"
                            placeholder="Clinic / building, street, area, landmark"
                            value={form.officeAddress} onChange={e => set("officeAddress", e.target.value)} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "160px 1fr 1fr", gap: "0 12px" }}>
                          <div style={{ ...fieldWrap, gridColumn: isMobile ? "1 / -1" : "auto" }}>
                            <label style={labelStyle} htmlFor="tr-pin">PIN Code <span className="req">*</span></label>
                            <input id="tr-pin" style={inputStyle} inputMode="numeric" autoComplete="postal-code" placeholder="6 digits"
                              value={form.officePincode} onChange={e => set("officePincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
                            {(pinInfo.loading || pinInfo.msg) && <p className="tr-hint">{pinInfo.loading ? "Looking up PIN…" : pinInfo.msg}</p>}
                          </div>
                          <div style={fieldWrap}>
                            <label style={labelStyle} htmlFor="tr-city">City <span className="req">*</span></label>
                            <input id="tr-city" style={inputStyle} autoComplete="address-level2" value={form.officeCity} onChange={e => set("officeCity", e.target.value)} />
                          </div>
                          <div style={fieldWrap}>
                            <label style={labelStyle} htmlFor="tr-state">State <span className="req">*</span></label>
                            <input id="tr-state" style={inputStyle} autoComplete="address-level1" value={form.officeState} onChange={e => set("officeState", e.target.value)} />
                          </div>
                        </div>
                        <label style={labelStyle}>Pin Your Clinic on the Map <span className="req">*</span></label>
                        <MapPicker
                          value={form.officeLat != null ? { lat: form.officeLat, lng: form.officeLng } : null}
                          center={pinInfo.center}
                          onChange={({ lat, lng }) => setForm(f => ({ ...f, officeLat: lat, officeLng: lng }))}
                        />
                      </div>
                    )}

                    {(() => {
                      const words = wordCount(form.about);
                      const ok = words >= ABOUT_MIN && words <= ABOUT_MAX;
                      return (
                        <div style={{ ...fieldWrap, marginBottom: 0, marginTop: 18 }}>
                          <label style={labelStyle} htmlFor="tr-about">About You <span className="req">*</span></label>
                          <p className="tr-hint" style={{ margin: "-2px 0 8px" }}>
                            This appears on your public profile — you can edit it anytime later. Mention your approach, who you work with and your experience.
                          </p>
                          <textarea id="tr-about" rows={7} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                            placeholder="e.g. I'm a counselling psychologist with 5 years of experience helping adults with anxiety, stress and relationship concerns. My approach combines CBT with mindfulness…"
                            value={form.about} onChange={e => set("about", e.target.value)} />
                          <div className={`tr-words ${ok ? "ok" : words > ABOUT_MAX ? "over" : ""}`}>
                            {words} / {ABOUT_MAX} words{words < ABOUT_MIN ? ` · at least ${ABOUT_MIN - words} more` : ""}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── Step 3: documents ── */}
                {step === 3 && (
                  <div className="section-card">
                    <div style={sectionHead}><span style={sectionNum}>03</span> Verification documents</div>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: -8, marginBottom: 18 }}>
                      We verify every therapist before listing them. Clear photos or PDFs work best — each file up to {MAX_FILE_MB}MB.
                    </p>

                    {[
                      { key: "resumeFile", label: "Resume / CV", hint: "PDF or DOC", accept: ".pdf,.doc,.docx", icon: "feather-file-text", camera: false },
                      { key: "qualificationCertFile", label: "Highest Qualification Certificate", hint: "PDF, JPG or PNG", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx", icon: "feather-award", camera: true },
                    ].map(({ key, label, hint, accept, icon, camera }) => (
                      <div key={key} style={fieldWrap}>
                        <label style={labelStyle}>{label} <span className="req">*</span></label>
                        <div className={`tr-upload ${form[key] ? "has" : ""}`}>
                          {form[key] ? (
                            <>
                              <FileThumb file={form[key]} />
                              {!form[key].type?.startsWith("image/") && <i className={icon} style={{ fontSize: 26, color: "#228756" }} />}
                              <div className="tr-upload-name">
                                <b>{form[key].name}</b>
                                <span>{(form[key].size / 1048576).toFixed(1)}MB · ready</span>
                              </div>
                              <button type="button" className="tr-link" onClick={() => pickFile(key, null)}>Remove</button>
                            </>
                          ) : (
                            <>
                              <i className={icon} style={{ fontSize: 24, color: "#94a3b8" }} />
                              <div className="tr-upload-name"><b>Choose a file</b><span>{hint}</span></div>
                              <label className="tr-btn-sm">
                                <input type="file" accept={accept} hidden onChange={e => { pickFile(key, e.target.files?.[0]); e.target.value = ""; }} />
                                <i className="feather-upload" /> Upload
                              </label>
                              {camera && isMobile && (
                                <label className="tr-btn-sm ghost">
                                  <input type="file" accept="image/*" capture="environment" hidden onChange={e => { pickFile(key, e.target.files?.[0]); e.target.value = ""; }} />
                                  <i className="feather-camera" /> Photo
                                </label>
                              )}
                            </>
                          )}
                        </div>
                        {fileErrors[key] && <p className="tr-file-err">{fileErrors[key]}</p>}
                      </div>
                    ))}

                    <div style={fieldWrap}>
                      <label style={labelStyle}>ID Card <span className="req">*</span></label>
                      <div className="tr-chips" role="radiogroup" aria-label="ID card type" style={{ marginBottom: 10 }}>
                        {ID_CARD_TYPES.map(t => (
                          <button type="button" key={t} role="radio" aria-checked={form.idCardType === t}
                            className={`tr-chip sm ${form.idCardType === t ? "on" : ""}`} onClick={() => set("idCardType", t)}>
                            {form.idCardType === t && <i className="feather-check" />} {t}
                          </button>
                        ))}
                      </div>
                      <div className={`tr-upload ${form.idCardFile ? "has" : ""}`}>
                        {form.idCardFile ? (
                          <>
                            <FileThumb file={form.idCardFile} />
                            {!form.idCardFile.type?.startsWith("image/") && <i className="feather-credit-card" style={{ fontSize: 26, color: "#228756" }} />}
                            <div className="tr-upload-name">
                              <b>{form.idCardFile.name}</b>
                              <span>{(form.idCardFile.size / 1048576).toFixed(1)}MB · ready</span>
                            </div>
                            <button type="button" className="tr-link" onClick={() => pickFile("idCardFile", null)}>Remove</button>
                          </>
                        ) : (
                          <>
                            <i className="feather-credit-card" style={{ fontSize: 24, color: "#94a3b8" }} />
                            <div className="tr-upload-name"><b>{form.idCardType ? `Upload your ${form.idCardType}` : "Choose an ID type, then upload"}</b><span>JPG, PNG or PDF — never shown publicly</span></div>
                            <label className="tr-btn-sm">
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={e => { pickFile("idCardFile", e.target.files?.[0]); e.target.value = ""; }} />
                              <i className="feather-upload" /> Upload
                            </label>
                            {isMobile && (
                              <label className="tr-btn-sm ghost">
                                <input type="file" accept="image/*" capture="environment" hidden onChange={e => { pickFile("idCardFile", e.target.files?.[0]); e.target.value = ""; }} />
                                <i className="feather-camera" /> Photo
                              </label>
                            )}
                          </>
                        )}
                      </div>
                      {fileErrors.idCardFile && <p className="tr-file-err">{fileErrors.idCardFile}</p>}
                    </div>

                    {/* Terms */}
                    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginTop: 6, padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${form.agreeTerms ? "#86efac" : "#cbd5c9"}`, background: form.agreeTerms ? "#f0fdf4" : "#fafafa", transition: "all 0.2s" }}>
                      <input type="checkbox" checked={form.agreeTerms} onChange={e => set("agreeTerms", e.target.checked)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${form.agreeTerms ? "#228756" : "#cbd5e1"}`, background: form.agreeTerms ? "#228756" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                        {form.agreeTerms && <i className="feather-check" style={{ fontSize: 12, color: "#fff" }}></i>}
                      </div>
                      <span style={{ fontSize: 12.5, color: form.agreeTerms ? "#166534" : "#475569", lineHeight: 1.7, fontWeight: form.agreeTerms ? 600 : 400 }}>
                        I agree to the{" "}
                        <Link href="/terms-conditions" style={{ color: "#228756", fontWeight: 700 }}>Terms &amp; Conditions</Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" style={{ color: "#228756", fontWeight: 700 }}>Privacy Policy</Link>,
                        and confirm that the information and documents are accurate and mine.
                      </span>
                    </label>
                    <p className="tr-hint" style={{ marginTop: 12 }}>
                      <i className="feather-info" /> Applications are reviewed within 1–2 business days. You&rsquo;ll hear back by email and phone.
                    </p>
                  </div>
                )}

                {/* ── navigation ── */}
                <div className="tr-nav">
                  {step > 1 && (
                    <button type="button" className="tr-back" onClick={goBack}>
                      <i className="feather-arrow-left" /> Back
                    </button>
                  )}
                  <button type="submit" className="tr-next" disabled={loading}>
                    {loading ? (
                      <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "trspin 0.8s linear infinite" }}></span> Checking…</>
                    ) : step < 3 ? (
                      <>Continue <i className="feather-arrow-right" /></>
                    ) : (
                      <><i className="feather-eye" /> Review Application</>
                    )}
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <Link href="/login" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 600 }}>
                    Already have an account? <span style={{ color: "#228756" }}>Login here</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      </div>

      <Footer />
    </>
  );
}
