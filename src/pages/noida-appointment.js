import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { apiUrl } from "../utils/url";

const CONCERNS = [
  "Anxiety", "Depression", "Stress Management", "Relationship Issues",
  "Trauma / PTSD", "Grief & Loss", "Self-Esteem", "Anger Management",
  "OCD", "Sleep Issues", "Life Transitions", "Career Counselling", "Other",
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function pad2(n) { return String(n).padStart(2, "0"); }
function toDateStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

// Current wall-clock instant in Asia/Kolkata, computed with plain offset math
// (no locale-string round-trip) so it can't drift between server and browser ICU builds.
function nowIST() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + IST_OFFSET_MS);
}

function dateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return { value: dateStr, weekday: WEEKDAY_SHORT[dt.getDay()], day: dt.getDate(), month: MONTH_SHORT[dt.getMonth()], isSunday: dt.getDay() === 0 };
}

// Next 14 calendar days, IST-anchored so "today" matches the center's clock, not the visitor's device.
// Deliberately not run during the initial render (see mount effect below) — "now" differs between
// the server-rendered pass and the browser, which would otherwise trip a hydration mismatch.
function buildDateOptions() {
  const base = nowIST();
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    days.push(dateLabel(toDateStr(d)));
  }
  return days;
}

export default function NoidaAppointment() {
  const [bookingType, setBookingType] = useState("new"); // "new" | "followup"

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── New-client date strip (fixed 14-day window) ─────────────────────
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const opts = buildDateOptions();
    setDateOptions(opts);
    setSelectedDate(opts.find(d => !d.isSunday)?.value || opts[0]?.value || "");
  }, []);

  // ── Follow-up date strip (only dates the admin has actually opened) ─
  const [followupDateOptions, setFollowupDateOptions] = useState(null); // null = not loaded yet
  const [followupDate, setFollowupDate] = useState("");

  useEffect(() => {
    if (bookingType !== "followup" || followupDateOptions !== null) return;
    fetch(`${apiUrl}/noida-appointments/followup-dates`)
      .then(r => r.json())
      .then(data => {
        const dates = data?.status ? (data.data || []) : [];
        const opts = dates.map(dateLabel);
        setFollowupDateOptions(opts);
        setFollowupDate(opts[0]?.value || "");
      })
      .catch(() => setFollowupDateOptions([]));
  }, [bookingType, followupDateOptions]);

  const activeDate = bookingType === "followup" ? followupDate : selectedDate;

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
    if (activeDate) loadSlots(activeDate, bookingType);
    else setSlots([]);
  }, [activeDate, bookingType, loadSlots]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    const effectiveName = bookingType === "followup" && lookupStatus === "found" && !manualOverride ? foundName : form.name;
    if (!effectiveName?.trim()) {
      setError("Name is required.");
      return;
    }
    if (!activeDate || !selectedSlot) {
      setError("Please select a date and time slot.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveName.trim(),
          age: form.age.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          concern: form.concern,
          date: activeDate,
          slot: selectedSlot,
          type: bookingType,
        }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus("success");
      } else {
        setError(data.message || "Something went wrong. Please try again.");
        setStatus(null);
        if (res.status === 409) loadSlots(activeDate, bookingType); // slot got taken — refresh the list
      }
    } catch {
      setError("Could not connect. Please try again.");
      setStatus(null);
    }
  };

  const activeDateOptions = bookingType === "followup" ? (followupDateOptions || []) : dateOptions;
  const selectedDateLabel = activeDateOptions.find(d => d.value === activeDate);
  const confirmedName = bookingType === "followup" && lookupStatus === "found" && !manualOverride ? foundName : form.name;

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

      {mounted && <style>{`
        .na-page { font-family: 'Inter', sans-serif; }
        .na-hero {
          background: linear-gradient(135deg, #0f3d22 0%, #1a6b3a 100%);
          padding: 56px 20px 64px; text-align: center; color: #fff;
        }
        .na-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25);
          border-radius: 50px; padding: 7px 18px; margin-bottom: 18px;
          font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
        }
        .na-hero h1 { font-size: clamp(26px, 3.2vw, 42px); font-weight: 900; margin: 0 0 12px; line-height: 1.2; }
        .na-hero p { font-size: 15px; color: rgba(255,255,255,.8); max-width: 560px; margin: 0 auto; line-height: 1.7; }

        .na-wrap { max-width: 720px; margin: -32px auto 60px; padding: 0 20px; }
        .na-card {
          background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14);
          padding: 28px 24px 32px;
        }

        .na-tabs { display: flex; gap: 6px; background: #f1f5f9; border-radius: 12px; padding: 5px; margin-bottom: 24px; }
        .na-tab { flex: 1; border: none; background: none; padding: 10px 0; border-radius: 9px; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; transition: all .15s; }
        .na-tab.active { background: #fff; color: #1a6b3a; box-shadow: 0 2px 6px rgba(0,0,0,.08); }

        .na-section-label {
          font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase;
          letter-spacing: 0.6px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
        }
        .na-section-num {
          width: 20px; height: 20px; border-radius: 50%; background: #1a6b3a; color: #fff;
          font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;
        }

        .na-date-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 26px; }
        .na-date-pill {
          flex-shrink: 0; width: 62px; padding: 10px 0; border-radius: 12px; text-align: center;
          border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s;
        }
        .na-date-pill.disabled { opacity: .4; cursor: not-allowed; }
        .na-date-pill.active { background: #1a6b3a; border-color: #1a6b3a; }
        .na-date-pill.active .na-dow, .na-date-pill.active .na-dnum, .na-date-pill.active .na-dmon { color: #fff; }
        .na-dow { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .na-dnum { font-size: 17px; font-weight: 800; color: #0f172a; margin: 2px 0; }
        .na-dmon { font-size: 10px; color: #94a3b8; }

        .na-slot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 26px; }
        @media (min-width: 480px) { .na-slot-grid { grid-template-columns: repeat(3, 1fr); } }
        .na-slot-btn {
          padding: 10px 6px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 12.5px; font-weight: 700; color: #334155; cursor: pointer; transition: all .15s;
        }
        .na-slot-btn:hover { border-color: #94a3b8; }
        .na-slot-btn.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-slot-empty { font-size: 13px; color: #94a3b8; padding: 18px 0; text-align: center; background: #f8fafc; border-radius: 10px; margin-bottom: 26px; }

        .na-inp {
          width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 11px 13px;
          font-size: 14px; color: #0f172a; outline: none; background: #f8fafc; box-sizing: border-box;
          font-family: inherit; transition: border-color .15s;
        }
        .na-inp:focus { border-color: #1a6b3a; background: #fff; }
        .na-lbl { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 6px; }
        .na-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 480px) { .na-row { grid-template-columns: 1fr; } }

        .na-submit {
          width: 100%; padding: 15px 0; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff;
          font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 6px;
          box-shadow: 0 6px 18px rgba(22,101,52,.28); transition: all .2s;
        }
        .na-submit:disabled { opacity: .6; cursor: not-allowed; }

        .na-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }

        .na-address { display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 13px; color: rgba(255,255,255,.85); margin-top: 16px; }

        .na-lookup-box { border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .na-lookup-checking { background: #f8fafc; color: #64748b; }
        .na-lookup-found { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-weight: 700; }
        .na-lookup-notfound { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .na-lookup-link { background: none; border: none; color: inherit; text-decoration: underline; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; flex-shrink: 0; }

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
        <MyNavbar />

        <section className="na-hero">
          <div className="na-hero-badge">📍 Sector 51, Noida</div>
          <h1>Book Your In-Person Session</h1>
          <p>Pick a date and time that works for you at our Noida therapy center — confirmed instantly, no back-and-forth calls.</p>
          <div className="na-address">🕙 Mon–Sat, 10:00 AM – 7:00 PM &middot; Closed Sunday</div>
        </section>

        <div className="na-wrap">
          <div className="na-card">
            {status === "success" ? (
              <div className="na-success">
                <div className="na-success-icon">✓</div>
                <h2>You're all set, {(confirmedName || "there").split(" ")[0]}!</h2>
                <p>Your appointment at our Noida center is confirmed. We'll see you there — please arrive 10 minutes early.</p>
                <div className="na-summary">
                  <div><strong>Date:</strong> {selectedDateLabel ? `${selectedDateLabel.weekday}, ${selectedDateLabel.day} ${selectedDateLabel.month}` : activeDate}</div>
                  <div><strong>Time:</strong> {selectedSlot}</div>
                  <div><strong>Location:</strong> Sector 51, Noida, Uttar Pradesh</div>
                  {form.email && <div><strong>Confirmation sent to:</strong> {form.email}</div>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="na-tabs">
                  <button type="button" className={`na-tab ${bookingType === "new" ? "active" : ""}`} onClick={() => switchTab("new")}>New Client</button>
                  <button type="button" className={`na-tab ${bookingType === "followup" ? "active" : ""}`} onClick={() => switchTab("followup")}>Follow-up</button>
                </div>

                {bookingType === "followup" && (
                  <>
                    <div className="na-section-label"><span className="na-section-num">1</span> Your phone number</div>
                    <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 20 }}>
                      <input
                        className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" maxLength={10}
                      />
                    </div>
                    {lookupStatus === "checking" && (
                      <div className="na-lookup-box na-lookup-checking">Checking…</div>
                    )}
                    {lookupStatus === "found" && !manualOverride && (
                      <div className="na-lookup-box na-lookup-found">
                        <span>👋 Welcome back, {foundName}!</span>
                        <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                      </div>
                    )}
                    {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                      <div className="na-lookup-box na-lookup-notfound">
                        {lookupStatus === "not-found" ? "New here — please fill in your details below." : "No problem, fill in your details below."}
                      </div>
                    )}
                  </>
                )}

                {(bookingType === "new" || form.phone.length === 10) && (
                  <>
                    <div className="na-section-label"><span className="na-section-num">{bookingType === "followup" ? 2 : 1}</span> Choose a date</div>
                    {bookingType === "followup" && followupDateOptions === null ? (
                      <div className="na-slot-empty">Loading available dates…</div>
                    ) : activeDateOptions.length === 0 ? (
                      <div className="na-slot-empty">No follow-up slots are open right now — please WhatsApp us and we'll set one up.</div>
                    ) : (
                      <div className="na-date-strip">
                        {activeDateOptions.map(d => (
                          <div
                            key={d.value}
                            className={`na-date-pill ${d.isSunday ? "disabled" : ""} ${activeDate === d.value ? "active" : ""}`}
                            onClick={() => !d.isSunday && (bookingType === "followup" ? setFollowupDate(d.value) : setSelectedDate(d.value))}
                          >
                            <div className="na-dow">{d.weekday}</div>
                            <div className="na-dnum">{d.day}</div>
                            <div className="na-dmon">{d.month}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeDateOptions.length > 0 && (
                      <>
                        <div className="na-section-label"><span className="na-section-num">{bookingType === "followup" ? 3 : 2}</span> Choose a time</div>
                        {slotsLoading ? (
                          <div className="na-slot-empty">Loading available times…</div>
                        ) : slots.length === 0 ? (
                          <div className="na-slot-empty">No slots left for this day — try another date.</div>
                        ) : (
                          <div className="na-slot-grid">
                            {slots.map(s => (
                              <button
                                type="button"
                                key={s}
                                className={`na-slot-btn ${selectedSlot === s ? "active" : ""}`}
                                onClick={() => setSelectedSlot(s)}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {needsFullDetails && (
                  <>
                    <div className="na-section-label"><span className="na-section-num">{bookingType === "followup" ? 4 : 3}</span> Your details</div>
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
                    {bookingType === "new" && (
                      <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                        <div>
                          <label className="na-lbl">Phone Number *</label>
                          <input className="na-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" type="tel" inputMode="numeric" maxLength={10} />
                        </div>
                      </div>
                    )}
                    <div className="na-row">
                      <div>
                        <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional, for confirmation)</span></label>
                        <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                      </div>
                      <div>
                        <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                        <select className="na-inp" value={form.concern} onChange={e => set("concern", e.target.value)}>
                          <option value="">Select</option>
                          {CONCERNS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {!needsFullDetails && bookingType === "followup" && lookupStatus === "found" && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr", marginTop: -4 }}>
                    <div>
                      <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                      <select className="na-inp" value={form.concern} onChange={e => set("concern", e.target.value)}>
                        <option value="">Select</option>
                        {CONCERNS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {error && <div className="na-error">⚠️ {error}</div>}

                <button type="submit" className="na-submit" disabled={status === "loading" || !selectedSlot}>
                  {status === "loading" ? "Booking…" : selectedSlot ? `Confirm ${selectedSlot}` : "Select a time slot"}
                </button>
              </form>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
