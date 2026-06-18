import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData, postData } from "../../utils/actions";
import {
  getTherapistProfile, imagePath, defaultProfile,
  ApplyCouponUrl, sendOtpUrl, verifyOtpUrl, GetCouponsUrl,
} from "../../utils/url";
import { getValidServices } from "../../utils/helpers";
import { getToken } from "../../utils/jwt";

// ── constants ────────────────────────────────────────────────────────────────
const DAYS  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const G  = "#1a5c38";
const GL = "#228756";
const GB = "#f0fdf4";

const SESSION_MODES = [
  { key:"video",     icon:"feather-video",   label:"Video Call",  desc:"Online from home" },
  { key:"audio",     icon:"feather-phone",   label:"Voice Call",  desc:"Phone session"    },
  { key:"in-person", icon:"feather-map-pin", label:"In-Person",   desc:"Visit clinic"     },
];
const RELATIONS = ["Spouse","Parent","Child","Sibling","Friend","Other"];

function toMinutes(t) {
  if (!t) return 0;
  // handles "09:00am", "05:00pm", "09:00AM", "17:00", "9:00"
  const lower = t.trim().toLowerCase();
  const isPm  = lower.endsWith("pm");
  const isAm  = lower.endsWith("am");
  const clean = lower.replace("am","").replace("pm","").trim();
  const [hStr, mStr] = clean.split(":");
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPm && h !== 12) h += 12;
  if (isAm && h === 12) h = 0;
  return h * 60 + m;
}

function buildSlots(open, close, dur = 60) {
  const toMin = t => toMinutes(t);
  const out = []; let cur = toMin(open); const end = toMin(close);
  while (cur + dur <= end) {
    const h = Math.floor(cur / 60), m = cur % 60;
    out.push({
      label: `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`,
      val:   `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
    });
    cur += dur;
  }
  return out;
}

function getNext14Days() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return new Date(d);
  });
}

// ── MINI THERAPIST HEADER (shown on every step) ──────────────────────────────
function TherapistBar({ profile, selFmt, couponSave }) {
  const avatar = profile?.user?.profile
    ? `${imagePath}/${profile.user.profile}` : defaultProfile;
  const fee = selFmt?.fee;
  const total = fee != null ? Math.max(0, fee - (couponSave || 0)) : null;

  return (
    <div style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <img src={avatar} alt="" style={{
        width: 44, height: 44, borderRadius: 10, objectFit: "cover",
        objectPosition: "top", border: "1px solid #e5e7eb", flexShrink: 0,
      }} onError={e => { e.target.src = defaultProfile; }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile?.user?.name}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
          {profile?.profile_type || "Mental Health Professional"}
        </div>
      </div>
      {total != null && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: G }}>
            ₹{total.toLocaleString("en-IN")}
          </div>
          {couponSave > 0 && (
            <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
              saved ₹{couponSave.toLocaleString("en-IN")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── STEP PROGRESS BAR ────────────────────────────────────────────────────────
function StepBar({ step, total }) {
  return (
    <div style={{ padding: "14px 20px 0", background: "#f8fafc" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < step ? G : i === step ? GL : "#e2e8f0",
            transition: "background .3s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 6 }}>
        Step {step + 1} of {total}
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "none", border: "none", cursor: "pointer",
      color: "#64748b", fontSize: 13, fontWeight: 600, padding: "0 0 4px",
    }}>
      <i className="feather-arrow-left" style={{ fontSize: 14 }}></i> Back
    </button>
  );
}

function ContinueBtn({ label = "Continue", disabled, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", height: 52, borderRadius: 12, border: "none",
      background: disabled ? "#e2e8f0" : G,
      color: disabled ? "#94a3b8" : "#fff",
      fontSize: 16, fontWeight: 800, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "background .2s", marginTop: 24,
    }}>
      {loading
        ? <span style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", display: "inline-block", animation: "_sp .7s linear infinite" }} />
        : <>{label}<i className="feather-arrow-right" style={{ fontSize: 16 }}></i></>
      }
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function BookPage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile,  setProfile]  = React.useState(null);
  const [loading,  setLoading]  = React.useState(true);
  const [services, setServices] = React.useState([]);
  const [coupons,  setCoupons]  = React.useState([]);

  const [step,     setStep]     = React.useState(0);
  const [selSvc,   setSelSvc]   = React.useState(null);
  const [selFmt,   setSelFmt]   = React.useState(null);
  const [selDate,  setSelDate]  = React.useState(null);
  const [selSlot,  setSelSlot]  = React.useState(null);
  const [mode,     setMode]     = React.useState("video");
  const [avSlots,  setAvSlots]  = React.useState([]);
  const [bookFor,  setBookFor]  = React.useState("self");
  const [relation, setRelation] = React.useState("");
  const [age,      setAge]      = React.useState("");
  const [notes,    setNotes]    = React.useState("");

  const [couponInput,   setCouponInput]   = React.useState("");
  const [couponApplied, setCouponApplied] = React.useState(null);
  const [couponSave,    setCouponSave]    = React.useState(0);
  const [couponErr,     setCouponErr]     = React.useState("");
  const [couponLoad,    setCouponLoad]    = React.useState(false);
  const [couponSheet,   setCouponSheet]   = React.useState(false);
  const [couponManual,  setCouponManual]  = React.useState("");

  const [loginOpen, setLoginOpen] = React.useState(false);
  const [lEmail,    setLEmail]    = React.useState("");
  const [lOtpSent,  setLOtpSent]  = React.useState(false);
  const [lOtp,      setLOtp]      = React.useState(["","","","","",""]);
  const [lLoad,     setLLoad]     = React.useState(false);
  const [lErr,      setLErr]      = React.useState("");
  const [resend,    setResend]    = React.useState(0);
  const timerRef = React.useRef(null);
  const otpRefs  = React.useRef([]);

  const days14     = React.useMemo(getNext14Days, []);
  const isLoggedIn = typeof window !== "undefined" && !!getToken();
  const nowMin     = new Date().getHours() * 60 + new Date().getMinutes();
  const isToday    = d => d?.toDateString() === new Date().toDateString();

  React.useEffect(() => {
    if (!id) return;
    fetchData(getTherapistProfile + id).then(res => {
      if (res?.status && res?.data) {
        setProfile(res.data);
        getValidServices(res.data.fees || []).then(svcs => setServices(svcs));
      }
      setLoading(false);
    });
  }, [id]);

  React.useEffect(() => {
    fetchData(GetCouponsUrl).then(r => {
      if (r?.status) setCoupons((r.data || []).filter(c => c.status));
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!selDate || !profile) { setAvSlots([]); return; }
    const dn = DAYS[selDate.getDay()];
    const av = (profile.availabilities || []).find(a => a.day === dn);
    if (!av?.times?.length) { setAvSlots([]); return; }
    setAvSlots(av.times.flatMap(t => buildSlots(t.open, t.close)));
    setSelSlot(null);
  }, [selDate, profile]);

  React.useEffect(() => {
    setCouponApplied(null); setCouponSave(0); setCouponErr(""); setCouponInput("");
  }, [selSvc, selFmt]);

  function startTimer() {
    setResend(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResend(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; });
    }, 1000);
  }

  async function sendOtp() {
    if (!lEmail.trim()) { setLErr("Please enter your email."); return; }
    setLLoad(true); setLErr("");
    try {
      await postData(sendOtpUrl, { email: lEmail.trim().toLowerCase() });
      setLOtpSent(true); startTimer();
    } catch(e) { setLErr(e?.response?.data?.message || "Failed to send OTP."); }
    finally { setLLoad(false); }
  }

  async function verifyOtp() {
    const code = lOtp.join("");
    if (code.length < 6) { setLErr("Enter the 6-digit OTP."); return; }
    setLLoad(true); setLErr("");
    try {
      const res = await postData(verifyOtpUrl, { email: lEmail.trim().toLowerCase(), otp: code });
      if (res?.token) {
        localStorage.setItem("token", res.token);
        setLoginOpen(false);
        doCheckout();
      } else { setLErr("Invalid OTP. Please try again."); }
    } catch(e) { setLErr(e?.response?.data?.message || "Invalid OTP."); }
    finally { setLLoad(false); }
  }

  function otpChange(text, idx) {
    const d = text.replace(/\D/g, "").slice(-1);
    const n = [...lOtp]; n[idx] = d; setLOtp(n);
    if (d && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!d && idx > 0) otpRefs.current[idx - 1]?.focus();
  }

  async function applyCoupon(code) {
    const c = (code || couponInput).trim().toUpperCase();
    if (!c) return false;
    setCouponLoad(true); setCouponErr("");
    try {
      const res = await postData(ApplyCouponUrl, { coupon_code: c, amount: selFmt?.fee || 0 });
      if (res?.status) {
        setCouponApplied(res.data); setCouponSave(res.data.discount || 0);
        setCouponInput(c); setCouponManual(""); return true;
      } else { setCouponErr(res?.message || "Invalid coupon."); return false; }
    } catch(e) { setCouponErr(e?.response?.data?.message || "Invalid coupon."); return false; }
    finally { setCouponLoad(false); }
  }

  function doCheckout() {
    if (!selSvc || !selFmt || !selDate || !selSlot) return;
    const dt = new Date(selDate);
    const [h, m] = selSlot.val.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    const p = new URLSearchParams({
      service: selSvc.name, format: selFmt.type,
      price: String(selFmt.fee), booking_date: dt.toISOString(),
      session_type: mode, booking_for: bookFor,
      ...(bookFor === "other" ? { relation, client_age: age } : {}),
      ...(notes ? { notes } : {}),
      ...(couponApplied ? { coupon: couponApplied.code, discount: String(couponSave) } : {}),
    });
    router.push(`/therapist-checkout/${id}?${p.toString()}`);
  }

  function confirmBooking() {
    if (!isLoggedIn) { setLoginOpen(true); return; }
    doCheckout();
  }

  if (loading) return (
    <div id="__next" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <MyNavbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <style>{`@keyframes _sp{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 38, height: 38, border: `3px solid #e2e8f0`, borderTop: `3px solid ${GL}`, borderRadius: "50%", animation: "_sp .8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Loading…</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!profile) return (
    <div id="__next"><MyNavbar />
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>Therapist not found.</div>
      <Footer /></div>
  );

  const base  = selFmt?.fee || 0;
  const total = Math.max(0, base - couponSave);

  // ── STEP 0: Choose Service ─────────────────────────────────────────────────
  const Step0 = (
    <div style={{ padding: "20px 20px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>
        What kind of help do you need?
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Choose the service you'd like to book.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {services.map(svc => {
          const on = selSvc?._id === svc._id;
          return (
            <div key={svc._id} onClick={() => { setSelSvc(svc); setSelFmt(svc.formats[0] || null); }} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px", border: `1.5px solid ${on ? G : "#e2e8f0"}`,
              borderRadius: 12, cursor: "pointer", background: on ? GB : "#fff", transition: "all .15s",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: on ? G : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="feather-clipboard" style={{ fontSize: 17, color: on ? "#fff" : "#94a3b8" }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{svc.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {svc.formats.length} format{svc.formats.length > 1 ? "s" : ""} · from ₹{Math.min(...svc.formats.map(f => f.fee)).toLocaleString("en-IN")}
                </div>
              </div>
              {on && (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="feather-check" style={{ fontSize: 12, color: "#fff" }}></i>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selSvc && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Select format</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selSvc.formats.map(fmt => {
              const icons = { audio: "feather-phone", video: "feather-video", "in-person": "feather-map-pin" };
              const on = selFmt?.type === fmt.type;
              return (
                <div key={fmt.type} onClick={() => setSelFmt(fmt)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 16px", border: `1.5px solid ${on ? G : "#e2e8f0"}`,
                  borderRadius: 10, cursor: "pointer", background: on ? GB : "#fff", transition: "all .15s",
                }}>
                  <i className={icons[fmt.type?.toLowerCase()] || "feather-calendar"} style={{ fontSize: 14, color: on ? G : "#94a3b8" }}></i>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{fmt.type}</div>
                    <div style={{ fontSize: 12, color: on ? GL : "#64748b", fontWeight: 600 }}>₹{Number(fmt.fee).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ContinueBtn disabled={!selSvc || !selFmt} onClick={() => setStep(1)} />
    </div>
  );

  // ── STEP 1: Date & Time ────────────────────────────────────────────────────
  const Step1 = (
    <div style={{ padding: "20px 20px 32px" }}>
      <BackBtn onClick={() => setStep(0)} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "10px 0 4px" }}>
        Pick a date & time
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Showing available slots for {profile.user?.name?.split(" ")[0]}.
      </p>

      <div style={{ overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {days14.map((d, i) => {
            const dn  = DAYS[d.getDay()];
            const has = (profile.availabilities || []).some(a => a.day === dn && a.times?.length > 0);
            const on  = selDate && d.toDateString() === selDate.toDateString();
            return (
              <div key={i} onClick={() => has && setSelDate(new Date(d))} style={{
                flexShrink: 0, width: 58, padding: "10px 4px",
                border: `1.5px solid ${on ? G : has ? "#e2e8f0" : "#f1f5f9"}`,
                borderRadius: 12, textAlign: "center", cursor: has ? "pointer" : "not-allowed",
                background: on ? G : "#fff", opacity: has ? 1 : 0.35, transition: "all .15s",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: on ? "rgba(255,255,255,.7)" : "#94a3b8", textTransform: "uppercase" }}>
                  {SDAYS[d.getDay()]}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: on ? "#fff" : "#0f172a", lineHeight: 1.2, marginTop: 2 }}>
                  {d.getDate()}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: on ? "rgba(255,255,255,.6)" : "#94a3b8", marginTop: 1 }}>
                  {MONS[d.getMonth()]}
                </div>
                {has && !on && <div style={{ width: 5, height: 5, borderRadius: "50%", background: GL, margin: "4px auto 0" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {selDate && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>
            Available times — {DAYS[selDate.getDay()]}, {selDate.getDate()} {MONS[selDate.getMonth()]}
          </div>
          {avSlots.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              <i className="feather-calendar" style={{ fontSize: 32, display: "block", marginBottom: 10 }}></i>
              No slots on this day. Try a different date.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {avSlots.map(s => {
                const [h, m] = s.val.split(":").map(Number);
                const past = isToday(selDate) && (h * 60 + m) <= nowMin;
                const on   = selSlot?.val === s.val && !past;
                return (
                  <div key={s.val} onClick={() => !past && setSelSlot(s)} style={{
                    padding: "10px 18px", borderRadius: 10,
                    border: `1.5px solid ${on ? G : past ? "#f1f5f9" : "#e2e8f0"}`,
                    background: on ? G : past ? "#f8fafc" : "#fff",
                    color: on ? "#fff" : past ? "#cbd5e1" : "#0f172a",
                    fontSize: 14, fontWeight: 700,
                    cursor: past ? "not-allowed" : "pointer",
                    textDecoration: past ? "line-through" : "none",
                    transition: "all .15s",
                  }}>
                    {s.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ContinueBtn disabled={!selDate || !selSlot} onClick={() => setStep(2)} />
    </div>
  );

  // ── STEP 2: Session Mode ───────────────────────────────────────────────────
  const Step2 = (
    <div style={{ padding: "20px 20px 32px" }}>
      <BackBtn onClick={() => setStep(1)} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "10px 0 4px" }}>
        How would you like to meet?
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Choose your preferred consultation mode.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SESSION_MODES.map(s => {
          const on = mode === s.key;
          return (
            <div key={s.key} onClick={() => setMode(s.key)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "18px 18px", border: `1.5px solid ${on ? G : "#e2e8f0"}`,
              borderRadius: 12, cursor: "pointer", background: on ? GB : "#fff", transition: "all .15s",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: on ? G : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={s.icon} style={{ fontSize: 18, color: on ? "#fff" : "#94a3b8" }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{s.label}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{s.desc}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${on ? G : "#e2e8f0"}`, background: on ? G : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                {on && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
          );
        })}
      </div>
      <ContinueBtn onClick={() => setStep(3)} />
    </div>
  );

  // ── STEP 3: Who + Notes ────────────────────────────────────────────────────
  const Step3 = (
    <div style={{ padding: "20px 20px 32px" }}>
      <BackBtn onClick={() => setStep(2)} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "10px 0 4px" }}>
        A few details
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Tell us who this session is for.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[{ key: "self", label: "Myself" }, { key: "other", label: "Someone else" }].map(o => (
          <div key={o.key} onClick={() => { setBookFor(o.key); if(o.key === "self") setRelation(""); }} style={{
            flex: 1, padding: "14px 12px", border: `1.5px solid ${bookFor === o.key ? G : "#e2e8f0"}`,
            borderRadius: 12, cursor: "pointer", textAlign: "center",
            background: bookFor === o.key ? GB : "#fff",
            fontWeight: 800, fontSize: 14, color: bookFor === o.key ? G : "#64748b", transition: "all .15s",
          }}>
            {o.label}
          </div>
        ))}
      </div>

      {bookFor === "other" && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Relation to patient</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {RELATIONS.map(r => (
              <div key={r} onClick={() => setRelation(r)} style={{
                padding: "8px 16px", borderRadius: 8,
                border: `1.5px solid ${relation === r ? G : "#e2e8f0"}`,
                background: relation === r ? G : "#fff",
                color: relation === r ? "#fff" : "#64748b",
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s",
              }}>{r}</div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Patient's age</div>
          <input value={age} onChange={e => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="e.g. 28" style={{
              width: 120, height: 44, border: "1.5px solid #e2e8f0", borderRadius: 10,
              padding: "0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a",
              outline: "none", marginBottom: 20,
            }} />
        </>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
        Notes for therapist <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional)</span>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={500}
        placeholder="Briefly describe what you'd like to discuss…"
        style={{
          width: "100%", minHeight: 100, border: "1.5px solid #e2e8f0", borderRadius: 10,
          padding: "12px 14px", fontSize: 14, color: "#0f172a", outline: "none",
          resize: "vertical", lineHeight: 1.6, fontFamily: "inherit",
        }} />
      <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "right", marginTop: 4 }}>{notes.length}/500</div>

      <ContinueBtn disabled={bookFor === "other" && !relation} onClick={() => setStep(4)} />
    </div>
  );

  // ── STEP 4: Summary + Coupon + Confirm ────────────────────────────────────
  const Step4 = (
    <div style={{ padding: "20px 20px 40px" }}>
      <BackBtn onClick={() => setStep(3)} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "10px 0 4px" }}>
        Booking summary
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Review your appointment before confirming.
      </p>

      {/* Summary rows */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        {[
          { k: "Therapist", v: profile.user?.name },
          { k: "Service",   v: selSvc?.name },
          { k: "Format",    v: selFmt?.type },
          { k: "Mode",      v: mode === "video" ? "Video Call" : mode === "audio" ? "Voice Call" : "In-Person" },
          { k: "Date",      v: selDate ? `${DAYS[selDate.getDay()]}, ${selDate.getDate()} ${MONS[selDate.getMonth()]}` : "—" },
          { k: "Time",      v: selSlot ? `${selSlot.label} IST` : "—" },
          { k: "Patient",   v: bookFor === "self" ? "Myself" : `${relation || "Other"}${age ? ` · Age ${age}` : ""}` },
        ].map((row, i, arr) => (
          <div key={row.k} style={{ display: "flex", padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid #e2e8f0" : "none" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, minWidth: 80 }}>{row.k}</span>
            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, flex: 1 }}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* Fee breakdown */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "flex", padding: "12px 16px", borderBottom: couponSave > 0 ? "1px solid #e2e8f0" : "none" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, minWidth: 80 }}>Session fee</span>
          <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>₹{base.toLocaleString("en-IN")}</span>
        </div>
        {couponSave > 0 && (
          <div style={{ display: "flex", padding: "12px 16px" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, minWidth: 80 }}>Discount</span>
            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>−₹{couponSave.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px", background: GB, border: `1.5px solid #bbf7d0`,
        borderRadius: 12, marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Payable</div>
          {couponSave > 0 && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>You save ₹{couponSave.toLocaleString("en-IN")}</div>}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: G }}>₹{total.toLocaleString("en-IN")}</div>
      </div>

      {/* Coupon */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Have a coupon?</div>
        {couponApplied ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: `1.5px solid ${G}`, borderRadius: 12, background: GB }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="feather-check" style={{ fontSize: 15, color: "#fff" }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{couponApplied.code} applied</div>
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, marginTop: 1 }}>You saved ₹{couponSave.toLocaleString("en-IN")}</div>
            </div>
            <button onClick={() => { setCouponApplied(null); setCouponSave(0); setCouponInput(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>
        ) : (
          <>
            {coupons.length > 0 && (
              <button onClick={() => setCouponSheet(true)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12,
                background: "#fff", cursor: "pointer", marginBottom: 10,
              }}>
                <i className="feather-tag" style={{ fontSize: 15, color: G }}></i>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  View {coupons.length} available offer{coupons.length > 1 ? "s" : ""}
                </span>
                <i className="feather-chevron-right" style={{ fontSize: 15, color: "#94a3b8" }}></i>
              </button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(""); }}
                placeholder="ENTER CODE" style={{
                  flex: 1, height: 46, border: "1.5px solid #e2e8f0", borderRadius: 10,
                  padding: "0 14px", fontSize: 14, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase", color: "#0f172a", outline: "none", fontFamily: "inherit",
                }} />
              <button onClick={() => applyCoupon()} disabled={couponLoad || !couponInput.trim()} style={{
                height: 46, padding: "0 22px", background: G, color: "#fff",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                cursor: couponInput.trim() ? "pointer" : "not-allowed", opacity: couponInput.trim() ? 1 : .55,
              }}>{couponLoad ? "…" : "Apply"}</button>
            </div>
            {couponErr && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626", marginTop: 6 }}>
                <i className="feather-alert-circle" style={{ fontSize: 12 }}></i>{couponErr}
              </div>
            )}
          </>
        )}
      </div>

      {/* Trust badges */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 8, flexWrap: "wrap" }}>
        {[{ icon: "feather-shield", t: "Secure payment" }, { icon: "feather-refresh-cw", t: "Free cancellation" }, { icon: "feather-lock", t: "Encrypted" }].map(b => (
          <span key={b.t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b", fontWeight: 600 }}>
            <i className={b.icon} style={{ fontSize: 11, color: GL }}></i>{b.t}
          </span>
        ))}
      </div>
    </div>
  );

  const SCREENS = [Step0, Step1, Step2, Step3, Step4];

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Head>
        <title>Book Session — {profile.user?.name} | Choose Your Therapist</title>
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _sp { to { transform: rotate(360deg); } }
        @keyframes _in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes _up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes _fd { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus { border-color: ${G} !important; box-shadow: 0 0 0 3px rgba(26,92,56,.08) !important; outline: none !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div id="__next" style={{ background: "#f4f6f8", minHeight: "100vh" }}>
        <MyNavbar />

        <div style={{ maxWidth: 540, margin: "0 auto", padding: `24px 12px ${step === 4 ? "120px" : "80px"}` }}>
          <div style={{
            background: "#fff", borderRadius: 18, overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,.07)",
            animation: "_fd .3s ease",
          }}>
            <TherapistBar profile={profile} selFmt={selFmt} couponSave={couponSave} />
            <StepBar step={step} total={5} />
            <div key={step} style={{ animation: "_fd .22s ease" }}>
              {SCREENS[step]}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* ══ STICKY CONFIRM BUTTON (step 4 only) ══ */}
      {step === 4 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
          background: "#fff", borderTop: "1px solid #e2e8f0",
          padding: "12px 16px 16px",
          boxShadow: "0 -4px 24px rgba(0,0,0,.1)",
        }}>
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Payable</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: G }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={confirmBooking} style={{
              width: "100%", height: 52, borderRadius: 14, border: "none",
              background: G, color: "#fff", fontSize: 16, fontWeight: 900,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <i className="feather-lock" style={{ fontSize: 15 }}></i>
              {isLoggedIn ? "Confirm Appointment" : "Sign In & Confirm"}
              <i className="feather-arrow-right" style={{ fontSize: 15 }}></i>
            </button>
          </div>
        </div>
      )}

      {/* ══ COUPON SHEET ══ */}
      {couponSheet && (
        <div onClick={() => setCouponSheet(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "_in .2s" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 540, maxHeight: "80vh", overflowY: "auto", animation: "_up .25s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0", margin: "12px auto 0" }} />
            <div style={{ padding: "20px 20px 36px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Available Offers</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Tap a coupon to apply it</div>
                </div>
                <button onClick={() => setCouponSheet(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="feather-x" style={{ fontSize: 15, color: "#64748b" }}></i>
                </button>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Enter manually</div>
              <div style={{ display: "flex", gap: 8, marginBottom: couponErr ? 6 : 16 }}>
                <input value={couponManual} onChange={e => { setCouponManual(e.target.value.toUpperCase()); setCouponErr(""); }} placeholder="COUPON CODE" style={{ flex: 1, height: 44, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "0 14px", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#0f172a", outline: "none", fontFamily: "inherit" }} />
                <button onClick={async () => { setCouponInput(couponManual); const ok = await applyCoupon(couponManual); if (ok) setCouponSheet(false); }} disabled={couponLoad || !couponManual.trim()} style={{ height: 44, padding: "0 20px", background: G, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: couponManual.trim() ? "pointer" : "not-allowed", opacity: couponManual.trim() ? 1 : .55 }}>
                  {couponLoad ? "…" : "Apply"}
                </button>
              </div>
              {couponErr && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626", marginBottom: 12 }}>
                  <i className="feather-alert-circle" style={{ fontSize: 12 }}></i>{couponErr}
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>All coupons</div>
              {coupons.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No active offers right now.</div>
              ) : coupons.map(c => (
                <div key={c._id || c.code} onClick={async () => { setCouponInput(c.code); const ok = await applyCoupon(c.code); if (ok) setCouponSheet(false); }} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12, cursor: "pointer", background: "#fff", marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: GB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="feather-tag" style={{ fontSize: 17, color: G }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                      {c.code}
                      <span style={{ marginLeft: 8, background: GB, color: G, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        {c.discount_type === "percent" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                      </span>
                    </div>
                    {(c.name || c.description) && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{c.name || c.description}</div>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: G, flexShrink: 0, paddingTop: 2 }}>APPLY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ LOGIN SHEET ══ */}
      {loginOpen && (
        <div onClick={() => setLoginOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "_in .2s" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", animation: "_up .25s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0", margin: "12px auto 0" }} />
            <div style={{ padding: "24px 24px 40px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
                    {lOtpSent ? "Enter OTP" : "Sign in to continue"}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>
                    {lOtpSent ? `A 6-digit code was sent to ${lEmail}` : "Enter your email to receive a one-time login code."}
                  </div>
                </div>
                <button onClick={() => { setLoginOpen(false); setLOtpSent(false); setLOtp(["","","","","",""]); setLErr(""); }} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="feather-x" style={{ fontSize: 15, color: "#64748b" }}></i>
                </button>
              </div>

              {lErr && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                  <i className="feather-alert-circle" style={{ fontSize: 13, flexShrink: 0 }}></i>{lErr}
                </div>
              )}

              {!lOtpSent ? (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Email address</div>
                  <input type="email" value={lEmail} onChange={e => { setLEmail(e.target.value); setLErr(""); }} placeholder="you@example.com" style={{ width: "100%", height: 48, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "0 16px", fontSize: 15, color: "#0f172a", outline: "none", fontFamily: "inherit", marginBottom: 16 }} />
                  <button onClick={sendOtp} disabled={lLoad} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: G, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {lLoad ? <span style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", display: "inline-block", animation: "_sp .7s linear infinite" }} /> : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                    {lOtp.map((d, i) => (
                      <input key={i} ref={el => { otpRefs.current[i] = el; }} value={d} maxLength={1}
                        onChange={e => otpChange(e.target.value, i)}
                        onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i - 1]?.focus(); }}
                        style={{ width: 46, height: 54, border: `1.5px solid ${d ? G : "#e2e8f0"}`, borderRadius: 10, textAlign: "center", fontSize: 22, fontWeight: 900, color: "#0f172a", background: d ? GB : "#fff", outline: "none" }} />
                    ))}
                  </div>
                  <button onClick={verifyOtp} disabled={lLoad} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: G, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                    {lLoad ? <span style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", display: "inline-block", animation: "_sp .7s linear infinite" }} /> : "Verify & Confirm Booking"}
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <button onClick={resend === 0 ? sendOtp : undefined} disabled={resend > 0} style={{ border: "none", background: "none", fontSize: 13, fontWeight: 600, color: resend > 0 ? "#94a3b8" : G, cursor: resend > 0 ? "default" : "pointer", padding: "4px 8px" }}>
                      {resend > 0 ? `Resend OTP in ${resend}s` : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
