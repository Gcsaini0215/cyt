import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData, postData } from "../../utils/actions";
import {
  getTherapistProfile, imagePath, defaultProfile,
  ApplyCouponUrl, sendGuestEmailOtpUrl, verifyGuestEmailOtpUrl, GetCouponsUrl,
  BookedSlotsUrl, apiUrl,
} from "../../utils/url";
import { getValidServices } from "../../utils/helpers";
import { getToken } from "../../utils/jwt";

// ── constants ────────────────────────────────────────────────────────────────
const DAYS  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const G    = "#0f3d24";
const GL   = "#166534";
const GB   = "#eef5f1";
const GOLD = "#d4af37";
const DARK = "#132a1c";
const GRAD = `linear-gradient(135deg, ${G}, #175c37)`;

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
        width: 44, height: 44, borderRadius: 8, objectFit: "cover",
        objectPosition: "top", border: `2px solid ${GOLD}`, flexShrink: 0,
      }} onError={e => { e.target.src = defaultProfile; }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#132a1c",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile?.user?.name}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
          {profile?.profile_type || "Mental Health Professional"}
        </div>
      </div>
      {total != null && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: G }}>
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

// ── THERAPIST HERO (slot-picking phase): photo, name, credentials at a glance ─
function TherapistHero({ profile, nextLabel, fromFee }) {
  const u = profile?.user || {};
  const avatar = u.profile ? `${imagePath}/${u.profile}` : defaultProfile;
  const langs = (() => {
    const r = profile?.languages;
    if (!r) return [];
    return (Array.isArray(r) ? r : String(r).split(",")).map(s => String(s).trim()).filter(Boolean).slice(0, 3);
  })();
  const city = profile?.city || u.city;
  const chips = [];
  if (profile?.experience_years) chips.push({ icon: "feather-award", t: `${profile.experience_years} yrs experience` });
  if (city) chips.push({ icon: "feather-map-pin", t: city });
  if (langs.length) chips.push({ icon: "feather-globe", t: langs.join(", ") });
  if (profile?.rci_number) chips.push({ icon: "feather-shield", t: "RCI verified" });

  return (
    <div className="bk-hero">
      <img className="bk-hero-img" src={avatar} alt={u.name || "Therapist"}
        onError={e => { e.target.src = defaultProfile; }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="bk-hero-eyebrow">Book a session with</div>
        <div className="bk-hero-name">{u.name}</div>
        <div className="bk-hero-role">{profile?.profile_type || "Mental Health Professional"}</div>
        {chips.length > 0 && (
          <div className="bk-chips">
            {chips.map(c => (
              <span key={c.t} className="bk-chip"><i className={c.icon}></i>{c.t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="bk-hero-r">
        {nextLabel && <div className="bk-next"><i className="feather-calendar"></i>Next available: {nextLabel}</div>}
        {fromFee != null && <div className="bk-from">Sessions from <b>₹{fromFee.toLocaleString("en-IN")}</b></div>}
      </div>
    </div>
  );
}

// ── CYT NOIDA CENTRE CARD: an in-person alternative that books through the centre's own funnel ──
function NoidaCentreCard({ pricing }) {
  const from = pricing?.individual_inperson;
  return (
    <div className="bk-noida">
      <div className="bk-noida-mark"><img src="/favicon.png" alt="Choose Your Therapist" width="64" height="64" /></div>
      <div className="bk-noida-body">
        <div className="bk-noida-eyebrow"><i className="feather-map-pin"></i> Our Noida centre · Sector 51</div>
        <div className="bk-noida-title">Prefer to visit us in person?</div>
        <div className="bk-noida-sub">Book a session at the Choose Your Therapist centre — pick any open slot, no need to choose a therapist. Also available online or as a home visit.</div>
        <div className="bk-noida-tags">
          {from ? <span><i className="feather-tag"></i>From ₹{Number(from).toLocaleString("en-IN")} per session</span> : null}
          <span><i className="feather-clock"></i>50–60 min</span>
          <span><i className="feather-check-circle"></i>Instant confirmation</span>
        </div>
      </div>
      <Link href="/noida-appointment" className="bk-noida-cta">
        Book at Noida centre <i className="feather-arrow-right"></i>
      </Link>
    </div>
  );
}

// ── 3-STEP STEPPER (form phase) ──────────────────────────────────────────────
function FormStepper({ step }) {
  const labels = ["You", "Session", "Payment"];
  return (
    <div className="bk-stp">
      {labels.map((l, i) => {
        const n = i + 1;
        const cls = n < step ? "done" : n === step ? "on" : "";
        return (
          <React.Fragment key={l}>
            <div className={`bk-stp-it ${cls}`}>
              <div className="bk-stp-dot">{n < step ? <i className="feather-check"></i> : n}</div>
              <div className="bk-stp-lb">{l}</div>
            </div>
            {n < labels.length && <div className={`bk-stp-line ${n < step ? "done" : ""}`} />}
          </React.Fragment>
        );
      })}
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
      width: "100%", height: 52, borderRadius: 8,
      border: disabled ? "1px solid #e2e8f0" : `1px solid ${GOLD}`,
      background: disabled ? "#e2e8f0" : GRAD,
      color: disabled ? "#94a3b8" : "#fff",
      fontSize: 16, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "filter .2s", marginTop: 24,
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

  const [phase,    setPhase]    = React.useState("slots"); // "slots" | "form"
  const [fstep,    setFstep]    = React.useState(1);       // form step: 1 You · 2 Session · 3 Payment
  const [period,   setPeriod]   = React.useState("");      // "" | morning | afternoon | evening
  const [noidaPricing, setNoidaPricing] = React.useState(null); // Noida centre rates, for the alternative-booking card
  const [selSvc,   setSelSvc]   = React.useState(null);
  const [selFmt,   setSelFmt]   = React.useState(null);
  const [selDate,  setSelDate]  = React.useState(null);
  const [selSlot,  setSelSlot]  = React.useState(null);
  const [mode,     setMode]     = React.useState("video");
  const [bookedSlots, setBookedSlots] = React.useState(() => new Set());
  const [bookFor,  setBookFor]  = React.useState("self");
  const [relation, setRelation] = React.useState("");
  const [age,      setAge]      = React.useState("");
  const [notes,    setNotes]    = React.useState("");

  const [guestName,  setGuestName]  = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");

  const [couponInput,   setCouponInput]   = React.useState("");
  const [couponApplied, setCouponApplied] = React.useState(null);
  const [couponSave,    setCouponSave]    = React.useState(0);
  const [couponErr,     setCouponErr]     = React.useState("");
  const [couponLoad,    setCouponLoad]    = React.useState(false);
  const [couponSheet,   setCouponSheet]   = React.useState(false);
  const [couponManual,  setCouponManual]  = React.useState("");

  const [emailOtpSent,   setEmailOtpSent]   = React.useState(false);
  const [emailVerified,  setEmailVerified]  = React.useState(false);
  const [verifiedEmail,  setVerifiedEmail]  = React.useState("");
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
        getValidServices(res.data.fees || []).then(svcs => {
          setServices(svcs);
          // A single service has nothing to choose — preselect it (and its first format).
          if (svcs.length === 1) { setSelSvc(svcs[0]); setSelFmt(svcs[0].formats?.[0] || null); }
        });
      }
      setLoading(false);
    });
  }, [id]);

  React.useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/pricing`)
      .then(r => r.json())
      .then(d => setNoidaPricing(d?.status ? d.data : null))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    fetchData(GetCouponsUrl).then(r => {
      if (r?.status) setCoupons((r.data || []).filter(c => c.status));
    }).catch(() => {});
  }, []);

  // Slots already taken for this therapist — refreshed whenever the user
  // returns to the slot grid so the picker stays reasonably current.
  React.useEffect(() => {
    if (!id) return;
    fetchData(BookedSlotsUrl + id)
      .then(r => { if (r?.status && Array.isArray(r.data)) setBookedSlots(new Set(r.data)); })
      .catch(() => {});
  }, [id, phase]);

  const slotIso = React.useCallback((date, val) => {
    if (!date || !val) return "";
    const [h, m] = val.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }, []);

  // Slot grid model: one column per open day (max 10), one row per distinct start time.
  const grid = React.useMemo(() => {
    if (!profile) return { days: [], rows: [] };
    const avail = profile.availabilities || [];
    const days = [];
    for (const d of days14) {
      const av = avail.find(a => a.day === DAYS[d.getDay()]);
      if (!av?.times?.length) continue;
      const slots = av.times.flatMap(t => buildSlots(t.open, t.close));
      if (!slots.length) continue;
      days.push({ date: d, slots, vals: new Set(slots.map(s => s.val)) });
    }
    const shown = days.slice(0, 10);
    const rowMap = new Map();
    shown.forEach(dy => dy.slots.forEach(s => rowMap.set(s.val, s.label)));
    const rows = [...rowMap.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([val, label]) => ({ val, label }));
    return { days: shown, rows };
  }, [profile, days14]);

  React.useEffect(() => {
    setCouponApplied(null); setCouponSave(0); setCouponErr(""); setCouponInput("");
  }, [selSvc, selFmt]);

  React.useEffect(() => {
    if (selFmt?.type) setMode(selFmt.type.toLowerCase());
  }, [selFmt]);

  function startTimer() {
    setResend(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResend(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; });
    }, 1000);
  }

  async function sendEmailOtp() {
    const email = (guestEmail || "").trim().toLowerCase();
    if (!email.includes("@")) { setLErr("Please enter a valid email."); return; }
    setLLoad(true); setLErr("");
    try {
      await postData(sendGuestEmailOtpUrl, { email });
      setEmailOtpSent(true); startTimer();
    } catch(e) { setLErr(e?.response?.data?.message || "Failed to send verification code."); }
    finally { setLLoad(false); }
  }

  async function verifyEmailOtp() {
    const code = lOtp.join("");
    const email = (guestEmail || "").trim().toLowerCase();
    if (code.length < 6) { setLErr("Enter the 6-digit code."); return; }
    setLLoad(true); setLErr("");
    try {
      const res = await postData(verifyGuestEmailOtpUrl, { email, otp: code });
      if (res?.status) {
        setEmailVerified(true); setVerifiedEmail(email);
      } else { setLErr(res?.message || "Invalid code. Please try again."); }
    } catch(e) { setLErr(e?.response?.data?.message || "Invalid code."); }
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
      ...(!isLoggedIn && (guestName || "").trim() ? { guest_name: (guestName || "").trim() } : {}),
      ...(!isLoggedIn && guestPhone ? { guest_phone: guestPhone } : {}),
      ...(!isLoggedIn && (guestEmail || "").trim() ? { guest_email: (guestEmail || "").trim().toLowerCase() } : {}),
      ...(!isLoggedIn && emailVerified ? { guest_email_verified: "true" } : {}),
    });
    router.push(`/therapist-checkout/${id}?${p.toString()}`);
  }

  function confirmBooking() {
    // Hard gate: a guest cannot reach payment without verified contact details.
    if (!isLoggedIn && !emailVerified) {
      setFstep(1);
      setLErr("Please verify your email address to continue.");
      return;
    }
    if (!isLoggedIn && (!(guestName || "").trim() || (guestPhone || "").length < 10)) {
      setFstep(1);
      setLErr("Please add your name and 10-digit WhatsApp number.");
      return;
    }
    doCheckout();
  }

  // Tapping an open cell in the slot grid starts the booking form.
  function pickSlot(date, row) {
    setSelDate(new Date(date));
    setSelSlot({ val: row.val, label: row.label });
    setFstep(1);
    setPhase("form");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
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

  // ── SLOT GRID (phase "slots"): dates across, times down — tap an open cell to start ──
  const rowMins = r => { const [h, m] = r.val.split(":").map(Number); return h * 60 + m; };
  const visibleRows = grid.rows.filter(r => {
    if (!period) return true;
    const mins = rowMins(r);
    return period === "morning" ? mins < 720 : period === "afternoon" ? mins >= 720 && mins < 1020 : mins >= 1020;
  });
  const cellState = (dy, row) => {
    if (!dy.vals.has(row.val)) return "off";
    if (isToday(dy.date) && rowMins(row) <= nowMin) return "past";
    if (bookedSlots.has(slotIso(dy.date, row.val))) return "booked";
    return "open";
  };
  let nextLabel = "";
  outer: for (const dy of grid.days) {
    for (const row of grid.rows) {
      if (cellState(dy, row) === "open") {
        nextLabel = `${isToday(dy.date) ? "Today" : SDAYS[dy.date.getDay()]} ${dy.date.getDate()} ${MONS[dy.date.getMonth()]} · ${row.label}`;
        break outer;
      }
    }
  }
  const allFees = services.flatMap(s => (s.formats || []).map(f => Number(f.fee))).filter(n => Number.isFinite(n) && n > 0);
  const fromFee = allFees.length ? Math.min(...allFees) : null;

  const SlotsScreen = (
    <div>
      <TherapistHero profile={profile} nextLabel={nextLabel} fromFee={fromFee} />
      <div className="bk-panel">
        <div className="bk-panel-hd">
          <div>
            <h2 className="bk-h2">Pick an open slot to start booking</h2>
            <p className="bk-sub">
              {grid.days.length
                ? `${profile.user?.name?.split(" ")[0]}'s availability — next ${grid.days.length} open day${grid.days.length > 1 ? "s" : ""}`
                : "No availability published yet"}
            </p>
          </div>
          <div className="bk-periods">
            {[["", "All"], ["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]].map(([k, l]) => (
              <button key={k || "all"} type="button" className={`bk-period ${period === k ? "on" : ""}`} onClick={() => setPeriod(k)}>{l}</button>
            ))}
          </div>
        </div>

        {grid.days.length === 0 ? (
          <div className="bk-empty">
            <i className="feather-calendar"></i>
            <div>No open slots right now. Please check back soon or try another therapist.</div>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="bk-empty">
            <i className="feather-clock"></i>
            <div>No slots in this part of the day. Try another time of day.</div>
          </div>
        ) : (
          <div className="bk-scroll">
            <div className="bk-grid" style={{ gridTemplateColumns: `76px repeat(${grid.days.length}, minmax(72px, 1fr))` }}>
              <div className="bk-corner" />
              {grid.days.map(dy => (
                <div key={dy.date.toDateString()} className={`bk-dh ${isToday(dy.date) ? "today" : ""}`}>
                  <div>{isToday(dy.date) ? "TODAY" : SDAYS[dy.date.getDay()].toUpperCase()}</div>
                  <div>{dy.date.getDate()} {MONS[dy.date.getMonth()].toUpperCase()}</div>
                </div>
              ))}
              {visibleRows.map(row => (
                <React.Fragment key={row.val}>
                  <div className="bk-time">{row.label}</div>
                  {grid.days.map(dy => {
                    const st = cellState(dy, row);
                    return (
                      <button key={dy.date.toDateString() + row.val} type="button"
                        className={`bk-cell ${st}`} disabled={st !== "open"}
                        aria-label={`${row.label}, ${dy.date.getDate()} ${MONS[dy.date.getMonth()]} — ${st}`}
                        onClick={() => pickSlot(dy.date, row)}>
                        {st === "open" ? "Book" : st === "booked" ? "Booked" : st === "past" ? "—" : ""}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="bk-legend">
          <span><i className="bk-sw open"></i>Open — tap to book</span>
          <span><i className="bk-sw booked"></i>Booked</span>
          <span><i className="bk-sw past"></i>Passed</span>
          <span><i className="bk-sw off"></i>Not open</span>
        </div>
        <div className="bk-trust">
          <span><i className="feather-clock"></i>60 min session</span>
          <span><i className="feather-shield"></i>Secure online payment</span>
          <span><i className="feather-refresh-cw"></i>Easy rescheduling</span>
          <span><i className="feather-lock"></i>100% confidential</span>
        </div>
      </div>
      <NoidaCentreCard pricing={noidaPricing} />
    </div>
  );

  // ── FORM STEP 1: You ───────────────────────────────────────────────────────
  const Step1 = (
    <div style={{ padding: "8px 20px 32px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#132a1c", margin: "10px 0 4px" }}>
        A few details
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Tell us who this session is for.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[{ key: "self", label: "Myself" }, { key: "other", label: "Someone else" }].map(o => (
          <div key={o.key} onClick={() => { setBookFor(o.key); if(o.key === "self") setRelation(""); }} style={{
            flex: 1, padding: "14px 12px", border: `1.5px solid ${bookFor === o.key ? G : "#e2e8f0"}`,
            borderRadius: 8, cursor: "pointer", textAlign: "center",
            background: bookFor === o.key ? GB : "#fff",
            fontWeight: 700, fontSize: 14, color: bookFor === o.key ? G : "#64748b", transition: "all .15s",
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
              width: 120, height: 44, border: "1.5px solid #e2e8f0", borderRadius: 8,
              padding: "0 14px", fontSize: 15, fontWeight: 700, color: "#132a1c",
              outline: "none", marginBottom: 20,
            }} />
        </>
      )}

      {!isLoggedIn && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Your contact details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Full name *"
              style={{ width: "100%", height: 46, border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#132a1c", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <input
              value={guestPhone}
              onChange={e => setGuestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="WhatsApp number * (10 digits)"
              type="tel"
              style={{ width: "100%", height: 46, border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#132a1c", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <input
              value={guestEmail}
              onChange={e => {
                setGuestEmail(e.target.value);
                if (emailVerified && e.target.value.trim().toLowerCase() !== verifiedEmail) {
                  setEmailVerified(false); setEmailOtpSent(false); setLOtp(["","","","","",""]); setLErr("");
                }
              }}
              placeholder="Email address *"
              type="email"
              disabled={emailVerified}
              style={{ width: "100%", height: 46, border: `1.5px solid ${emailVerified ? GL : "#e2e8f0"}`, borderRadius: 8, padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#132a1c", outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: emailVerified ? GB : "#fff" }}
            />

            {emailVerified ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: G }}>
                <i className="feather-check-circle" /> Email verified
              </div>
            ) : !emailOtpSent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                <button
                  type="button"
                  onClick={sendEmailOtp}
                  disabled={lLoad || !(guestEmail || "").includes("@")}
                  style={{
                    padding: "9px 16px", borderRadius: 8, border: `1.5px solid ${G}`,
                    background: "#fff", color: G, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    opacity: !(guestEmail || "").includes("@") ? 0.5 : 1,
                  }}
                >
                  {lLoad ? "Sending…" : "Verify Email"}
                </button>
                {lErr && <div style={{ fontSize: 12.5, color: "#dc2626" }}>{lErr}</div>}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12.5, color: "#64748b" }}>Enter the 6-digit code sent to {guestEmail}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {lOtp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => (otpRefs.current[i] = el)}
                      value={d}
                      onChange={e => otpChange(e.target.value, i)}
                      maxLength={1}
                      inputMode="numeric"
                      style={{ width: 40, height: 46, textAlign: "center", fontSize: 18, fontWeight: 700, border: "1.5px solid #e2e8f0", borderRadius: 8, outline: "none" }}
                    />
                  ))}
                </div>
                {lErr && <div style={{ fontSize: 12.5, color: "#dc2626" }}>{lErr}</div>}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={lLoad || lOtp.join("").length < 6}
                    style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: G, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    {lLoad ? "Verifying…" : "Confirm Code"}
                  </button>
                  <button
                    type="button"
                    onClick={sendEmailOtp}
                    disabled={resend > 0 || lLoad}
                    style={{ background: "none", border: "none", color: resend > 0 ? "#94a3b8" : G, fontWeight: 700, fontSize: 12.5, cursor: resend > 0 ? "default" : "pointer" }}
                  >
                    {resend > 0 ? `Resend in ${resend}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ContinueBtn
        disabled={
          (bookFor === "other" && !relation) ||
          (!isLoggedIn && (!(guestName || "").trim() || (guestPhone || "").length < 10 || !(guestEmail || "").includes("@") || !emailVerified))
        }
        onClick={() => setFstep(2)}
      />
      <div style={{ textAlign: "center", marginTop: 10 }}><BackBtn onClick={() => setPhase("slots")} /></div>
    </div>
  );

  // ── FORM STEP 2: Session (service + format + notes) ───────────────────────
  const Step2 = (
    <div style={{ padding: "8px 20px 32px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#132a1c", margin: "10px 0 4px" }}>
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
              borderRadius: 8, cursor: "pointer", background: on ? GB : "#fff", transition: "all .15s",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: on ? G : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="feather-clipboard" style={{ fontSize: 17, color: on ? "#fff" : "#94a3b8" }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#132a1c" }}>{svc.name}</div>
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
                  borderRadius: 8, cursor: "pointer", background: on ? GB : "#fff", transition: "all .15s",
                }}>
                  <i className={icons[fmt.type?.toLowerCase()] || "feather-calendar"} style={{ fontSize: 14, color: on ? G : "#94a3b8" }}></i>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#132a1c" }}>{fmt.type}</div>
                    <div style={{ fontSize: 12, color: on ? GL : "#64748b", fontWeight: 600 }}>₹{Number(fmt.fee).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", margin: "22px 0 8px" }}>
        Notes for therapist <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional)</span>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={500}
        placeholder="Briefly describe what you'd like to discuss…"
        style={{
          width: "100%", minHeight: 90, border: "1.5px solid #e2e8f0", borderRadius: 8,
          padding: "12px 14px", fontSize: 14, color: "#132a1c", outline: "none",
          resize: "vertical", lineHeight: 1.6, fontFamily: "inherit",
        }} />
      <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "right", marginTop: 4 }}>{notes.length}/500</div>

      <ContinueBtn disabled={!selSvc || !selFmt} onClick={() => setFstep(3)} />
      <div style={{ textAlign: "center", marginTop: 10 }}><BackBtn onClick={() => setFstep(1)} /></div>
    </div>
  );

  // ── STEP 3: Summary + Coupon + Confirm ────────────────────────────────────
  const Step3 = (
    <div style={{ padding: "20px 20px 40px" }}>
      <BackBtn onClick={() => setFstep(2)} />
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#132a1c", margin: "10px 0 4px" }}>
        Booking summary
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
        Review your appointment before confirming.
      </p>

      {/* Summary rows */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
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
            <span style={{ fontSize: 13, color: "#132a1c", fontWeight: 700, flex: 1 }}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* Fee breakdown */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "flex", padding: "12px 16px", borderBottom: couponSave > 0 ? "1px solid #e2e8f0" : "none" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, minWidth: 80 }}>Session fee</span>
          <span style={{ fontSize: 13, color: "#132a1c", fontWeight: 700 }}>₹{base.toLocaleString("en-IN")}</span>
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
        padding: "16px 18px", background: GB, border: `1.5px solid ${GOLD}`,
        borderRadius: 8, marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Payable</div>
          {couponSave > 0 && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>You save ₹{couponSave.toLocaleString("en-IN")}</div>}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: G }}>₹{total.toLocaleString("en-IN")}</div>
      </div>

      {/* Coupon */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Have a coupon?</div>
        {couponApplied ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: `1.5px solid ${G}`, borderRadius: 8, background: GB }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="feather-check" style={{ fontSize: 15, color: "#fff" }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#132a1c" }}>{couponApplied.code} applied</div>
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, marginTop: 1 }}>You saved ₹{couponSave.toLocaleString("en-IN")}</div>
            </div>
            <button onClick={() => { setCouponApplied(null); setCouponSave(0); setCouponInput(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>
        ) : (
          <>
            {coupons.length > 0 && (
              <button onClick={() => setCouponSheet(true)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: 8,
                background: "#fff", cursor: "pointer", marginBottom: 10,
              }}>
                <i className="feather-tag" style={{ fontSize: 15, color: G }}></i>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: "#132a1c" }}>
                  View {coupons.length} available offer{coupons.length > 1 ? "s" : ""}
                </span>
                <i className="feather-chevron-right" style={{ fontSize: 15, color: "#94a3b8" }}></i>
              </button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(""); }}
                placeholder="ENTER CODE" style={{
                  flex: 1, height: 46, border: "1.5px solid #e2e8f0", borderRadius: 8,
                  padding: "0 14px", fontSize: 14, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase", color: "#132a1c", outline: "none", fontFamily: "inherit",
                }} />
              <button onClick={() => applyCoupon()} disabled={couponLoad || !couponInput.trim()} style={{
                height: 46, padding: "0 22px", background: G, color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
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

  const FORM_SCREENS = [Step1, Step2, Step3];

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
        input:focus, textarea:focus { border-color: ${G} !important; box-shadow: 0 0 0 3px rgba(15,61,36,.08) !important; outline: none !important; }
        ::-webkit-scrollbar { display: none; }

        .bk-wrap { max-width: 560px; margin: 0 auto; padding: 24px 12px 80px; }
        .bk-wrap.wide { max-width: 1040px; }
        .bk-card { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,.07); border-top: 3px solid ${GOLD}; animation: _fd .3s ease; }

        /* therapist hero */
        .bk-hero { display: flex; gap: 18px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-top: 3px solid ${GOLD}; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 24px rgba(0,0,0,.05); margin-bottom: 14px; }
        .bk-hero-img { width: 92px; height: 92px; border-radius: 16px; object-fit: cover; object-position: top; border: 2px solid ${GOLD}; flex-shrink: 0; background: #f1f5f9; }
        .bk-hero-eyebrow { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .6px; }
        .bk-hero-name { font-size: 22px; font-weight: 800; color: ${DARK}; line-height: 1.25; margin-top: 2px; }
        .bk-hero-role { font-size: 13px; color: ${GL}; font-weight: 700; margin-top: 2px; }
        .bk-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .bk-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; border-radius: 99px; padding: 5px 11px; }
        .bk-chip i { font-size: 12px; color: ${GL}; }
        .bk-hero-r { margin-left: auto; text-align: right; flex-shrink: 0; }
        .bk-next { display: inline-flex; align-items: center; gap: 6px; background: ${GB}; border: 1px solid #bbf7d0; color: ${GL}; font-weight: 700; font-size: 12.5px; padding: 7px 14px; border-radius: 99px; }
        .bk-from { font-size: 12px; color: #64748b; margin-top: 8px; }
        .bk-from b { color: ${G}; font-size: 18px; font-weight: 800; }

        /* slot panel */
        .bk-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 16px 14px; box-shadow: 0 4px 24px rgba(0,0,0,.04); }
        .bk-panel-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
        .bk-h2 { font-size: 18px; font-weight: 800; color: ${DARK}; margin: 0; }
        .bk-sub { font-size: 13px; color: #64748b; margin: 3px 0 0; }
        .bk-periods { display: flex; gap: 6px; flex-wrap: wrap; }
        .bk-period { border: 1px solid #e2e8f0; background: #fff; color: #475569; font-size: 12.5px; font-weight: 700; padding: 6px 14px; border-radius: 99px; cursor: pointer; }
        .bk-period.on { background: ${G}; border-color: ${G}; color: #fff; }
        .bk-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
        .bk-grid { display: grid; gap: 6px; min-width: max-content; width: 100%; }
        .bk-corner { position: sticky; left: 0; background: #fff; z-index: 2; }
        .bk-dh { text-align: center; font-size: 10.5px; font-weight: 800; color: #64748b; letter-spacing: .3px; padding: 6px 2px; border-radius: 8px; line-height: 1.35; }
        .bk-dh.today { background: #e8f5ec; color: ${G}; }
        .bk-time { position: sticky; left: 0; z-index: 2; background: #eef2ef; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800; color: ${DARK}; min-height: 46px; padding: 0 6px; text-align: center; }
        .bk-cell { min-height: 46px; border-radius: 8px; border: 1px solid transparent; font-size: 12.5px; font-weight: 700; font-family: inherit; }
        .bk-cell.open { background: #f0fdf4; border-color: #86efac; color: ${GL}; cursor: pointer; transition: transform .12s, background .12s; }
        .bk-cell.open:hover { background: #dcfce7; transform: translateY(-1px); }
        .bk-cell.booked { background: #fef2f2; border-color: #fecaca; color: #b91c1c; cursor: not-allowed; font-size: 12px; }
        .bk-cell.past { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; }
        .bk-cell.off { background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 4px, #f1f5f9 4px, #f1f5f9 8px); cursor: default; }
        .bk-empty { text-align: center; padding: 36px 12px; color: #94a3b8; font-size: 14px; }
        .bk-empty i { font-size: 32px; display: block; margin-bottom: 10px; }
        .bk-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 14px 0 10px; font-size: 12px; color: #64748b; font-weight: 600; border-top: 1px solid #eef2f6; padding-top: 12px; }
        .bk-legend span { display: inline-flex; align-items: center; gap: 6px; }
        .bk-sw { width: 14px; height: 14px; border-radius: 4px; display: inline-block; border: 1px solid transparent; }
        .bk-sw.open { background: #f0fdf4; border-color: #86efac; }
        .bk-sw.booked { background: #fef2f2; border-color: #fecaca; }
        .bk-sw.past { background: #f1f5f9; }
        .bk-sw.off { background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 3px, #e2e8f0 3px, #e2e8f0 6px); }
        .bk-trust { display: flex; flex-wrap: wrap; gap: 8px 18px; background: #f8fafc; border: 1px solid #eef2f6; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #475569; font-weight: 700; }
        .bk-trust span { display: inline-flex; align-items: center; gap: 6px; }
        .bk-trust i { color: ${GL}; font-size: 13px; }

        /* noida centre card */
        .bk-noida { display: flex; align-items: center; gap: 18px; margin-top: 16px; padding: 18px 20px; border-radius: 12px; background: linear-gradient(135deg, ${G} 0%, #175c37 100%); border: 1px solid ${GOLD}; box-shadow: 0 6px 24px rgba(15,61,36,.18); color: #fff; }
        .bk-noida-mark { flex-shrink: 0; width: 64px; height: 64px; border-radius: 16px; background: #fff; padding: 9px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
        .bk-noida-mark img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .bk-noida-body { flex: 1; min-width: 0; }
        .bk-noida-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: ${GOLD}; display: flex; align-items: center; gap: 6px; }
        .bk-noida-title { font-size: 18px; font-weight: 800; margin-top: 3px; }
        .bk-noida-sub { font-size: 13px; color: rgba(255,255,255,.82); line-height: 1.55; margin-top: 4px; max-width: 560px; }
        .bk-noida-tags { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 10px; font-size: 12px; font-weight: 700; color: #d9f2e2; }
        .bk-noida-tags span { display: inline-flex; align-items: center; gap: 6px; }
        .bk-noida-cta { flex-shrink: 0; background: ${GOLD}; color: ${DARK}; font-weight: 800; font-size: 14px; padding: 12px 20px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; transition: transform .12s, filter .12s; }
        .bk-noida-cta:hover { transform: translateY(-1px); filter: brightness(1.05); color: ${DARK}; }

        /* form phase */
        .bk-slotchip { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: ${G}; font-weight: 800; font-size: 13px; padding: 10px 20px; }
        .bk-slotchip button { background: none; border: none; color: ${G}; font-weight: 800; font-size: 12.5px; text-decoration: underline; cursor: pointer; padding: 0; }
        .bk-stp { display: flex; align-items: flex-start; padding: 18px 26px 4px; }
        .bk-stp-it { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 56px; }
        .bk-stp-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #d5dbe3; color: #94a3b8; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; background: #fff; }
        .bk-stp-it.on .bk-stp-dot { border-color: ${G}; color: ${G}; box-shadow: 0 0 0 4px rgba(15,61,36,.1); }
        .bk-stp-it.done .bk-stp-dot { background: ${G}; border-color: ${G}; color: #fff; }
        .bk-stp-lb { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; }
        .bk-stp-it.on .bk-stp-lb, .bk-stp-it.done .bk-stp-lb { color: ${G}; }
        .bk-stp-line { flex: 1; height: 2px; background: #e2e8f0; margin-top: 12px; }
        .bk-stp-line.done { background: ${G}; }

        @media (max-width: 640px) {
          .bk-wrap { padding: 12px 8px 80px; }
          .bk-hero { flex-wrap: wrap; padding: 14px; gap: 14px; }
          .bk-hero-img { width: 68px; height: 68px; border-radius: 12px; }
          .bk-hero-name { font-size: 18px; }
          .bk-hero-r { margin-left: 0; text-align: left; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
          .bk-from { margin-top: 0; }
          .bk-panel { padding: 14px 10px 12px; }
          .bk-h2 { font-size: 16px; }
          .bk-cell, .bk-time { min-height: 44px; }
          .bk-noida { flex-wrap: wrap; padding: 16px; gap: 14px; }
          .bk-noida-mark { width: 52px; height: 52px; border-radius: 13px; padding: 7px; }
          .bk-noida-cta { width: 100%; justify-content: center; }
        }
      `}</style>

      <div id="__next" style={{ background: "#f4f6f8", minHeight: "100vh" }}>
        <MyNavbar />

        {phase === "slots" ? (
          <div className="bk-wrap wide">{SlotsScreen}</div>
        ) : (
          <div className="bk-wrap" style={{ paddingBottom: fstep === 3 ? 120 : 80 }}>
            <div className="bk-card">
              <TherapistBar profile={profile} selFmt={selFmt} couponSave={couponSave} />
              <div className="bk-slotchip">
                <span><i className="feather-calendar" style={{ marginRight: 8 }}></i>
                  {selDate ? `${SDAYS[selDate.getDay()]}, ${selDate.getDate()} ${MONS[selDate.getMonth()]}` : ""} · {selSlot?.label}
                </span>
                <button type="button" onClick={() => setPhase("slots")}>Change</button>
              </div>
              <FormStepper step={fstep} />
              <div key={fstep} style={{ animation: "_fd .22s ease" }}>
                {FORM_SCREENS[fstep - 1]}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>

      {/* ══ STICKY CONFIRM BUTTON (last step only) ══ */}
      {phase === "form" && fstep === 3 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
          background: "#fff", borderTop: "1px solid #e2e8f0",
          padding: "12px 16px 16px",
          boxShadow: "0 -4px 24px rgba(0,0,0,.1)",
        }}>
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Total Payable</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: G }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={confirmBooking} style={{
              width: "100%", height: 52, borderRadius: 10, border: `1px solid ${GOLD}`,
              background: GRAD, color: "#fff", fontSize: 16, fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <i className="feather-lock" style={{ fontSize: 15 }}></i>
              Confirm Appointment
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
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#132a1c" }}>Available Offers</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Tap a coupon to apply it</div>
                </div>
                <button onClick={() => setCouponSheet(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="feather-x" style={{ fontSize: 15, color: "#64748b" }}></i>
                </button>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Enter manually</div>
              <div style={{ display: "flex", gap: 8, marginBottom: couponErr ? 6 : 16 }}>
                <input value={couponManual} onChange={e => { setCouponManual(e.target.value.toUpperCase()); setCouponErr(""); }} placeholder="COUPON CODE" style={{ flex: 1, height: 44, border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "0 14px", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#132a1c", outline: "none", fontFamily: "inherit" }} />
                <button onClick={async () => { setCouponInput(couponManual); const ok = await applyCoupon(couponManual); if (ok) setCouponSheet(false); }} disabled={couponLoad || !couponManual.trim()} style={{ height: 44, padding: "0 20px", background: G, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: couponManual.trim() ? "pointer" : "not-allowed", opacity: couponManual.trim() ? 1 : .55 }}>
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
                <div key={c._id || c.code} onClick={async () => { setCouponInput(c.code); const ok = await applyCoupon(c.code); if (ok) setCouponSheet(false); }} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", border: "1.5px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "#fff", marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: GB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="feather-tag" style={{ fontSize: 17, color: G }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#132a1c" }}>
                      {c.code}
                      <span style={{ marginLeft: 8, background: GB, color: G, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        {c.discount_type === "percent" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                      </span>
                    </div>
                    {(c.name || c.description) && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{c.name || c.description}</div>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: G, flexShrink: 0, paddingTop: 2 }}>APPLY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
