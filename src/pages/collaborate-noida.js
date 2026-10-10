import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { apiUrl } from "../utils/url";
import CheckRounded from "@mui/icons-material/CheckRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import MeetingRoomRounded from "@mui/icons-material/MeetingRoomRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import PersonSearchRounded from "@mui/icons-material/PersonSearchRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import OtpInput from "../components/global/otp-input";

// Health professionals apply to practise at CYT Noida on a booking basis: they share their
// preferred timing, we screen them, then give each one clash-free hours in the single room.

const SITE = "https://www.chooseyourtherapist.in";
const PAGE_URL = `${SITE}/collaborate-noida`;
const SEO_TITLE = "Practise at CYT Noida – Collaborate with Choose Your Therapist";
const SEO_DESC = "Psychologists and health professionals: practise at our Sector 51, Noida centre on a booking basis. Keep 70% of every session fee, paid weekly. Apply in 3 minutes.";
const WA_NUMBER = "918077757951"; // same desk number as /noida-appointment
const SHARE = { you: 70, cyt: 30 };

// consultation-based work only — the room is set up for conversation, not procedures or equipment
const ROLES = [
  "Clinical Psychologist", "Counselling Psychologist", "Psychiatrist", "Psychotherapist / Counsellor",
  "Gynaecologist", "Dermatologist", "Nutritionist / Dietitian", "Other",
];
const SPECIALITIES = [
  "Anxiety", "Depression", "Relationships", "Couples", "Child & adolescent", "Trauma",
  "Addiction", "Stress & burnout", "OCD", "Grief", "Autism / ADHD", "Sleep",
  "Women's health", "PCOS / hormonal", "Skin & hair", "Weight & diet",
];
const LANGUAGES = ["Hindi", "English", "Punjabi", "Bengali", "Urdu", "Other"];
const DAYS = [ // Monday first, as people think of a work week
  { d: 1, s: "Mon" }, { d: 2, s: "Tue" }, { d: 3, s: "Wed" }, { d: 4, s: "Thu" },
  { d: 5, s: "Fri" }, { d: 6, s: "Sat" }, { d: 0, s: "Sun" },
];
const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM … 8 PM starts
const BANDS = [
  { k: "Morning", hours: [8, 9, 10, 11] },
  { k: "Afternoon", hours: [12, 13, 14, 15] },
  { k: "Evening", hours: [16, 17, 18, 19, 20] },
];
const hourLabel = (h) => `${((h + 11) % 12) + 1} ${h < 12 ? "AM" : "PM"}`;

const STEPS_INFO = [
  { t: "Apply", d: "Share your details and the days & hours that suit you." },
  { t: "Screening", d: "A short call with our team, then registration & documents check." },
  { t: "Your hours are confirmed", d: "Once your profile is verified, we confirm your consultation hours with you." },
  { t: "Come in when booked", d: "Clients book your hours; we tell you in advance. No booking, no need to come." },
  { t: "Weekly payout", d: `${SHARE.you}% of every session fee goes to you, every week.` },
];
const PERKS = [
  { I: MeetingRoomRounded, t: "A private, furnished room", d: "Calm therapy room at Sector 51 — no rent, no deposit." },
  { I: PersonSearchRounded, t: "Clients find you", d: "Your profile goes on our Noida booking page, which clients already use." },
  { I: SupportAgentRounded, t: "Reception handles the rest", d: "Bookings, reminders, payments and rescheduling — done by our desk." },
  { I: PaymentsRounded, t: `${SHARE.you}% to you, weekly`, d: "Clear split on every session, with a weekly statement." },
];
const FAQS = [
  { q: "Do I have to come in every day?", a: "No. You only come in for sessions that a client has booked in your hours. We let you know in advance — if nothing is booked, you don't need to come." },
  { q: "Are clients guaranteed?", a: "No. Clients book according to demand and your hours. We list you on our Noida booking page and promote the centre, but the number of sessions can vary week to week." },
  { q: "How is the 70:30 split worked out?", a: `On each session's fee, ${SHARE.you}% goes to you and ${SHARE.cyt}% to CYT for the room, reception, bookings and payments. Payouts are made weekly with a statement of sessions.` },
  { q: "Will I get exactly the timing I choose?", a: "We try to. The timing you share is your preference — final hours are confirmed with you after your profile is verified. If an hour isn't available, we'll suggest the nearest one." },
  { q: "Who can apply?", a: "Professionals whose work is consultation-based — psychologists, psychiatrists, psychotherapists, counsellors, gynaecologists, dermatologists and nutritionists — with a valid qualification. The room is for consultations, not procedures." },
];

const emptyForm = {
  name: "", phone: "", email: "", role: "", roleOther: "",
  qualification: "", registrationNo: "", experienceYears: "", specialisations: [], languages: ["Hindi", "English"],
  sessionFee: "", about: "", profileLink: "",
  availability: {}, flexibility: "some", agreedTerms: false,
};

// "Dr. Riya Sharma" -> "Riya"
const firstName = (n) => String(n || "").trim().split(/\s+/).find((w) => !/^(dr|prof|mr|mrs|ms)\.?$/i.test(w)) || "there";

function visitSource() {
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get("src") || p.get("ref") || p.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct");
  } catch { return ""; }
}

export default function CollaborateNoida() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  // email verification (anti-spam): a 6-digit code by email, swapped for a token sent with the form
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMsg, setOtpMsg] = useState({ t: "", bad: false });
  const [resendIn, setResendIn] = useState(0);
  const [otpKey, setOtpKey] = useState(0); // remounts the boxes so the cursor is back in box 1 after a wrong code
  const [emailToken, setEmailToken] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showHow, setShowHow] = useState(false);
  // informed consent: Continue only works once they've opened "How it works" and ticked the box
  const [howRead, setHowRead] = useState(false);
  const [howTick, setHowTick] = useState(false);
  const [nextAfterHow, setNextAfterHow] = useState(false);
  const openHow = (thenNext = false) => { setHowTick(howRead); setNextAfterHow(thenNext); setShowHow(true); };

  useEffect(() => {
    if (!showHow) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setShowHow(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [showHow]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErr(""); };
  const normEmail = form.email.trim().toLowerCase();
  const emailVerified = !!emailToken && verifiedEmail === normEmail;

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function postJson(path, body) {
    const res = await fetch(`${apiUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.status) throw new Error(data.message || "Something went wrong. Please try again.");
    return data;
  }

  async function sendCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normEmail)) return setOtpMsg({ t: "Please enter a valid email address first.", bad: true });
    setOtpBusy(true); setOtpMsg({ t: "", bad: false }); setOtp("");
    try {
      const d = await postJson("/collab-applications/email-otp", { email: normEmail });
      setOtpSentTo(normEmail); setResendIn(30);
      setOtpMsg({ t: d.message, bad: false });
    } catch (ex) {
      setOtpMsg({ t: ex.message, bad: true });
      const m = /wait (\d+)s/.exec(ex.message); if (m) setResendIn(Number(m[1]));
    } finally { setOtpBusy(false); }
  }

  async function verifyCode(code) {
    if (String(code).length !== 6 || otpBusy) return;
    setOtpBusy(true);
    try {
      const d = await postJson("/collab-applications/email-otp/verify", { email: otpSentTo, otp: code });
      setEmailToken(d.data.token); setVerifiedEmail(otpSentTo);
      setOtpSentTo(""); setOtp(""); setOtpMsg({ t: "", bad: false }); setErr("");
    } catch (ex) {
      setOtp(""); setOtpMsg({ t: ex.message, bad: true }); setOtpKey((k) => k + 1);
    } finally { setOtpBusy(false); }
  }

  const changeEmail = () => { setOtpSentTo(""); setOtp(""); setOtpMsg({ t: "", bad: false }); setEmailToken(""); setVerifiedEmail(""); };
  const toggleIn = (k, v) => set(k, form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v]);

  const av = form.availability;
  const toggleDay = (d) => {
    const next = { ...av };
    if (next[d]) delete next[d]; else next[d] = [];
    set("availability", next);
  };
  const toggleHour = (d, h) => {
    const cur = av[d] || [];
    set("availability", { ...av, [d]: cur.includes(h) ? cur.filter((x) => x !== h) : [...cur, h].sort((a, b) => a - b) });
  };
  const toggleBand = (d, hours) => {
    const cur = av[d] || [];
    const all = hours.every((h) => cur.includes(h));
    const next = all ? cur.filter((h) => !hours.includes(h)) : [...new Set([...cur, ...hours])].sort((a, b) => a - b);
    set("availability", { ...av, [d]: next });
  };
  const totalHours = useMemo(() => Object.values(av).reduce((n, hs) => n + hs.length, 0), [av]);

  function validate(s) {
    if (s === 0) {
      if (form.name.trim().length < 2) return "Please enter your full name.";
      if (!/^[6-9]\d{9}$/.test(form.phone)) return "Please enter a valid 10-digit mobile number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normEmail)) return "Please enter your email address.";
      if (!emailVerified) return "Please verify your email with the 6-digit code we send you.";
      if (!form.role) return "Please choose your profession.";
      if (form.role === "Other" && !form.roleOther.trim()) return "Please tell us your profession.";
    }
    if (s === 1) {
      if (!form.qualification.trim()) return "Please add your highest qualification.";
    }
    if (s === 2) {
      if (!totalHours) return "Pick at least one day and hour that suits you.";
      const empty = DAYS.find(({ d }) => av[d] && !av[d].length);
      if (empty) return `You picked ${empty.s} — choose some hours for it, or unselect the day.`;
      if (!form.agreedTerms) return "Please accept the collaboration terms.";
    }
    return "";
  }

  const next = (consented = howRead) => {
    if (!consented) return openHow(true);
    const e = validate(step);
    if (e) return setErr(e);
    setStep(step + 1);
    if (typeof window !== "undefined") document.getElementById("cn-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submit() {
    if (!howRead) return openHow(false);
    const e = validate(2);
    if (e) return setErr(e);
    setSending(true); setErr("");
    try {
      const res = await fetch(`${apiUrl}/collab-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: form.role === "Other" ? form.roleOther.trim() : form.role,
          availability: Object.entries(av).map(([day, hours]) => ({ day: Number(day), hours })),
          source: visitSource(),
          readHowItWorks: howRead,
          email: normEmail,
          emailToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.status) throw new Error(data.message || "Could not send your application. Please try again.");
      setDone(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (ex) {
      setErr(ex.message || "Network error — please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  const waText = encodeURIComponent("Hi, I'd like to know more about practising at CYT Noida.");

  return (
    <div id="__next">
      <Head>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />

      <main className="cn">
        {done ? (
          <>
            <section className="cn-hero cn-hero-done">
              <div className="cn-wrap cn-hero-in">
                <span className="cn-pill"><PlaceRounded fontSize="inherit" /> CYT Noida · Sector 51</span>
                <h1>Thank you, {firstName(form.name)} — <span>your application is in</span></h1>
                <p className="cn-lead">We're glad you want to practise with us. Here's what happens next.</p>
              </div>
            </section>

            <section className="cn-wrap cn-formsec">
              <div className="cn-card cn-donecard">
                <div className="cn-done-head">
                  <div className="cn-done-icon"><CheckRounded /></div>
                  <div>
                    <h2>Application received</h2>
                    <p>Our team will call you on <b>+91 {form.phone}</b> within <b>2 working days</b> for a short screening.</p>
                  </div>
                </div>

                <div className="cn-summary">
                  <div><span>Profession</span><b>{form.role === "Other" ? form.roleOther : form.role}</b></div>
                  <div><span>Preferred time</span><b>{totalHours} hrs / week</b></div>
                  <div><span>Email</span><b className="ok"><VerifiedRounded fontSize="inherit" /> Verified</b></div>
                </div>

                <h3 className="cn-next-title">What happens next</h3>
                <ol className="cn-timeline">
                  <li className="cur"><span>1</span><div><b>Screening call &amp; documents check</b><p>We'll call you to talk about your practice and check your qualification and registration.</p></div></li>
                  <li><span>2</span><div><b>Your consultation hours are confirmed</b><p>Once your profile is verified, we agree your final days and hours with you.</p></div></li>
                  <li><span>3</span><div><b>You go live on our Noida booking page</b><p>Clients book your hours — you come in only when a session is booked.</p></div></li>
                </ol>

                <div className="cn-done-actions">
                  <a className="cn-btn" href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon fontSize="small" /> Questions? WhatsApp us
                  </a>
                  <a className="cn-btn ghost" href="/">Back to home</a>
                </div>
                <p className="cn-done-note">A confirmation has been sent to <b>{normEmail}</b>.</p>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="cn-hero">
              <div className="cn-wrap cn-hero-in">
                <span className="cn-pill"><PlaceRounded fontSize="inherit" /> CYT Noida · Sector 51</span>
                <h1>Practise at our Noida centre — <span>only when you're booked</span></h1>
                <p className="cn-lead">
                  For psychologists, counsellors and consulting doctors. Tell us the hours that suit you; clients book those hours,
                  and you come in for booked sessions only.
                </p>
                <div className="cn-stats">
                  <div><b>{SHARE.you}%</b><span>of every session fee to you</span></div>
                  <div><b>₹0</b><span>rent or deposit</span></div>
                  <div><b>Weekly</b><span>payouts with a statement</span></div>
                </div>
              </div>
            </section>

            <section className="cn-wrap cn-formsec" id="cn-form">
              <div className="cn-card">
                <div className="cn-card-head">
                  <h2>Apply to collaborate</h2>
                  <div className="cn-progress">
                    {["About you", "Practice", "Timing"].map((l, i) => (
                      <div key={l} className={`cn-prog ${i === step ? "on" : ""} ${i < step ? "done" : ""}`}>
                        <span>{i < step ? <CheckRounded fontSize="inherit" /> : i + 1}</span>{l}
                      </div>
                    ))}
                  </div>
                </div>

                {step === 0 && (
                  <div className="cn-fields">
                    <label className="cn-f"><span>Full name *</span>
                      <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Dr. Riya Sharma" autoComplete="name" maxLength={80} />
                    </label>
                    <div>
                      <label className="cn-f"><span>Mobile (WhatsApp) *</span>
                        <div className="cn-phone"><em>+91</em>
                          <input value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="98xxxxxxxx" autoComplete="tel-national" />
                        </div>
                      </label>
                    </div>
                    <div className="cn-f"><span>Email * <em className="cn-why">— we'll send a code to confirm it's you</em></span>
                      <div className="cn-emailrow">
                        <input type="email" value={form.email} readOnly={emailVerified || !!otpSentTo}
                          onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
                        {emailVerified ? (
                          <span className="cn-verified"><VerifiedRounded fontSize="small" /> Verified</span>
                        ) : !otpSentTo ? (
                          <button type="button" className="cn-btn cn-sendcode" onClick={sendCode} disabled={otpBusy || resendIn > 0}>
                            {otpBusy ? "Sending…" : resendIn > 0 ? `Wait ${resendIn}s` : "Send code"}
                          </button>
                        ) : null}
                      </div>
                      {(emailVerified || otpSentTo) && <button type="button" className="cn-textbtn" onClick={changeEmail}>Use a different email</button>}
                      {otpSentTo && !emailVerified && (
                        <div className="cn-otp">
                          <p>Enter the 6-digit code sent to <b>{otpSentTo}</b></p>
                          <OtpInput key={otpKey} value={otp} onChange={setOtp} onComplete={verifyCode} disabled={otpBusy} autoFocus />
                          <div className="cn-otp-foot">
                            <span>{otpBusy ? "Checking…" : "Didn't get it? Check spam."}</span>
                            <button type="button" className="cn-textbtn" onClick={sendCode} disabled={otpBusy || resendIn > 0}>
                              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                            </button>
                          </div>
                        </div>
                      )}
                      {otpMsg.t && !emailVerified && <small className={`cn-otp-msg ${otpMsg.bad ? "bad" : ""}`}>{otpMsg.t}</small>}
                    </div>
                    <div className="cn-f"><span>Profession *</span>
                      <div className="cn-chips">
                        {ROLES.map((r) => (
                          <button type="button" key={r} className={`cn-chip ${form.role === r ? "on" : ""}`} onClick={() => set("role", r)}>{r}</button>
                        ))}
                      </div>
                    </div>
                    {form.role === "Other" && (
                      <label className="cn-f"><span>Your profession *</span>
                        <input value={form.roleOther} onChange={(e) => set("roleOther", e.target.value)} placeholder="e.g. Marriage & family therapist" maxLength={60} />
                      </label>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="cn-fields">
                    <label className="cn-f"><span>Highest qualification *</span>
                      <input value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="M.Phil Clinical Psychology, AIIMS" maxLength={200} />
                    </label>
                    <div className="cn-row">
                      <label className="cn-f"><span>Registration no. (RCI / NMC / other)</span>
                        <input value={form.registrationNo} onChange={(e) => set("registrationNo", e.target.value)} placeholder="If applicable" maxLength={80} />
                      </label>
                      <label className="cn-f"><span>Experience (years)</span>
                        <input value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" placeholder="3" />
                      </label>
                    </div>
                    <div className="cn-f"><span>Areas you work with</span>
                      <div className="cn-chips">
                        {SPECIALITIES.map((s) => (
                          <button type="button" key={s} className={`cn-chip sm ${form.specialisations.includes(s) ? "on" : ""}`} onClick={() => toggleIn("specialisations", s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cn-f"><span>Languages</span>
                      <div className="cn-chips">
                        {LANGUAGES.map((s) => (
                          <button type="button" key={s} className={`cn-chip sm ${form.languages.includes(s) ? "on" : ""}`} onClick={() => toggleIn("languages", s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="cn-row">
                      <label className="cn-f"><span>Your usual fee per session (₹)</span>
                        <input value={form.sessionFee} onChange={(e) => set("sessionFee", e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" placeholder="1200" />
                        {Number(form.sessionFee) > 0 && (
                          <small className="cn-split">You'd get ₹{Math.round(Number(form.sessionFee) * SHARE.you / 100).toLocaleString("en-IN")} · CYT ₹{Math.round(Number(form.sessionFee) * SHARE.cyt / 100).toLocaleString("en-IN")}</small>
                        )}
                      </label>
                      <label className="cn-f"><span>LinkedIn / website</span>
                        <input value={form.profileLink} onChange={(e) => set("profileLink", e.target.value)} placeholder="https://" maxLength={300} />
                      </label>
                    </div>
                    <label className="cn-f"><span>A few lines about your practice</span>
                      <textarea rows={3} value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="Approach, client groups, anything we should know" maxLength={1500} />
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div className="cn-fields">
                    <div className="cn-f"><span>Which days suit you? *</span>
                      <div className="cn-days">
                        {DAYS.map(({ d, s }) => (
                          <button type="button" key={d} className={`cn-day ${av[d] ? "on" : ""}`} onClick={() => toggleDay(d)}>
                            {s}{av[d]?.length ? <em>{av[d].length}h</em> : null}
                          </button>
                        ))}
                      </div>
                    </div>

                    {DAYS.filter(({ d }) => av[d]).map(({ d, s }) => (
                      <div className="cn-dayblock" key={d}>
                        <div className="cn-dayhead">
                          <b>{s}</b>
                          <div className="cn-bands">
                            {BANDS.map((b) => (
                              <button type="button" key={b.k} className={`cn-band ${b.hours.every((h) => av[d].includes(h)) ? "on" : ""}`} onClick={() => toggleBand(d, b.hours)}>{b.k}</button>
                            ))}
                          </div>
                        </div>
                        <div className="cn-hours">
                          {HOURS.map((h) => (
                            <button type="button" key={h} className={`cn-hour ${av[d].includes(h) ? "on" : ""}`} onClick={() => toggleHour(d, h)}>{hourLabel(h)}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!Object.keys(av).length && <p className="cn-hint">Tap a day above, then choose the hours (each slot is 1 hour, e.g. 5 PM = 5–6 PM).</p>}

                    <div className="cn-f"><span>How flexible is this timing?</span>
                      <div className="cn-chips">
                        {[["fixed", "Only these hours"], ["some", "A little flexible"], ["flexible", "Fully flexible"]].map(([k, l]) => (
                          <button type="button" key={k} className={`cn-chip sm ${form.flexibility === k ? "on" : ""}`} onClick={() => set("flexibility", k)}>{l}</button>
                        ))}
                      </div>
                    </div>

                    <div className="cn-terms">
                      <b>Collaboration terms</b>
                      <ul>
                        <li><b>{SHARE.you}%</b> of each session fee to you, <b>{SHARE.cyt}%</b> to CYT (room, reception, bookings, payments)</li>
                        <li>Booking basis — you come in only for sessions clients have booked</li>
                        <li>Clients are not guaranteed; numbers vary with demand</li>
                        <li>Payouts every week, with a statement</li>
                        <li>Your timing is a preference; final hours are confirmed after screening</li>
                      </ul>
                      <label className="cn-check">
                        <input type="checkbox" checked={form.agreedTerms} onChange={(e) => set("agreedTerms", e.target.checked)} />
                        <span>I have read and agree to these terms</span>
                      </label>
                    </div>
                  </div>
                )}

                {err && <div className="cn-err" role="alert">{err}</div>}

                <div className={`cn-howline ${howRead ? "ok" : ""}`}>
                  <label className="cn-check sm" onClick={(e) => { if (!howRead) { e.preventDefault(); openHow(false); } }}>
                    <input type="checkbox" checked={howRead} readOnly onChange={() => {}} />
                    <span>{howRead ? "I have read how it works" : "Please read how it works before you continue *"}</span>
                  </label>
                  <button type="button" onClick={() => openHow(false)}>How it works <ArrowForwardRounded fontSize="inherit" /></button>
                </div>

                <div className="cn-actions">
                  {step > 0 && <button type="button" className="cn-btn ghost" onClick={() => { setErr(""); setStep(step - 1); }}><ArrowBackRounded fontSize="small" /> Back</button>}
                  {step < 2
                    ? <button type="button" className="cn-btn" onClick={() => next()}>Continue <ArrowForwardRounded fontSize="small" /></button>
                    : <button type="button" className="cn-btn" onClick={submit} disabled={sending}>{sending ? "Sending…" : `Send application${totalHours ? ` · ${totalHours} hrs/week` : ""}`}</button>}
                </div>
              </div>
            </section>

            <section className="cn-wrap cn-sec">
              <h2>What you get</h2>
              <div className="cn-perks">
                {PERKS.map(({ I, t, d }) => (
                  <div className="cn-perk" key={t}>
                    <div className="cn-perk-i"><I /></div>
                    <div><b>{t}</b><p>{d}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="cn-wrap cn-sec">
              <h2>Questions</h2>
              <div className="cn-faqs">
                {FAQS.map((f, i) => (
                  <div className={`cn-faq ${openFaq === i ? "open" : ""}`} key={f.q}>
                    <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{f.q}<span>{openFaq === i ? "–" : "+"}</span></button>
                    {openFaq === i && <p>{f.a}</p>}
                  </div>
                ))}
              </div>
              <a className="cn-btn ghost cn-wa" href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon fontSize="small" /> Talk to us on WhatsApp
              </a>
            </section>
          </>
        )}
        {showHow && (
          <div className="cn-modal-bg" onClick={() => setShowHow(false)}>
            <div className="cn-modal" role="dialog" aria-modal="true" aria-labelledby="cn-how-title" onClick={(e) => e.stopPropagation()}>
              <div className="cn-modal-head">
                <h2 id="cn-how-title">How it works</h2>
                <button type="button" className="cn-modal-x" onClick={() => setShowHow(false)} aria-label="Close"><CloseRounded /></button>
              </div>
              <ol className="cn-howlist">
                {STEPS_INFO.map((s) => (
                  <li key={s.t}><b>{s.t}.</b> {s.d}</li>
                ))}
              </ol>
              <label className="cn-check cn-consent">
                <input type="checkbox" checked={howTick} onChange={(e) => setHowTick(e.target.checked)} />
                <span>I have read and understood how this collaboration works, and I agree to proceed on this basis.</span>
              </label>
              <button type="button" className="cn-btn cn-modal-ok" disabled={!howTick}
                onClick={() => {
                  setHowRead(true); setShowHow(false); setErr("");
                  if (nextAfterHow) { setNextAfterHow(false); next(true); }
                }}>
                I agree, continue
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const CSS = `
.cn { --g: #1a6b3a; --g2: #155a30; --gl: #f0fdf4; --gb: #d5e3da; --ink: #10231a; --mut: #5b6b62;
  font-family: 'Inter', system-ui, -apple-system, sans-serif; color: var(--ink); background: #f7faf8; padding-bottom: 48px; }
.cn * { box-sizing: border-box; }
.cn-wrap { max-width: 880px; margin: 0 auto; padding: 0 16px; }
.cn h1, .cn h2 { font-family: 'Inter', system-ui, sans-serif; color: var(--ink); letter-spacing: -0.02em; }
.cn-hero { position: relative; color: #fff; padding: 120px 0 96px; background-color: #1a4d30;
  background-image: linear-gradient(90deg, rgba(12,58,32,.94) 0%, rgba(20,86,48,.84) 42%, rgba(26,107,58,.35) 75%, rgba(26,107,58,.12) 100%), url('/assets/img/profile-banner-calm-room.jpg');
  background-size: cover; background-position: center right; }
.cn-hero-in { max-width: 1040px; }
.cn-hero-in > * { max-width: 600px; }
.cn-formsec { position: relative; margin-top: -64px; z-index: 2; }
.cn-howline { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 22px; padding-top: 14px; border-top: 1px dashed #d5e3da; font-size: 14px; color: var(--mut); }
.cn-howline button { display: inline-flex; align-items: center; gap: 4px; border: none; background: none; padding: 0; color: var(--g); font: 700 14px 'Inter', system-ui, sans-serif; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.cn-howline button:hover { color: var(--g2); }
.cn-howline .cn-check.sm { font-size: 13.5px; font-weight: 600; color: #7c2d12; }
.cn-howline.ok .cn-check.sm { color: var(--g); }
.cn-consent { align-items: flex-start !important; margin-top: 16px !important; padding: 12px 14px; border-radius: 12px; background: var(--gl); border: 1px solid #bbf7d0; font-size: 14px; line-height: 1.45; }
.cn-consent input { margin-top: 1px !important; flex-shrink: 0; }
.cn-modal-ok:disabled { opacity: .45; cursor: not-allowed; }
.cn-actions { margin-top: 14px !important; }
.cn-modal-bg { position: fixed; inset: 0; z-index: 100000; background: rgba(10,30,20,.35); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: cnFade .15s ease; }
.cn-modal { width: 100%; max-width: 480px; max-height: calc(100dvh - 32px); overflow-y: auto; margin: auto; background: #fff; border-radius: 20px; padding: 22px 24px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.4); }
.cn-howlist { margin: 0; padding-left: 20px; display: grid; gap: 9px; font-size: 15px; line-height: 1.55; color: #33463b; }
.cn-howlist li { margin: 0; padding-left: 2px; }
.cn-howlist li::marker { color: var(--g); font-weight: 800; }
.cn-howlist b { color: var(--ink); }
.cn-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.cn-modal-head h2 { margin: 0; font-size: 21px; font-weight: 800; }
.cn-modal-x { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #d5e3da; background: #fff; color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.cn-modal-ok { width: 100%; margin-top: 14px; }
@keyframes cnFade { from { opacity: 0; } to { opacity: 1; } }
.cn-hero h1 { color: #fff; font-size: clamp(28px, 5vw, 44px); line-height: 1.12; margin: 14px 0 12px; font-weight: 800; }
.cn-hero h1 span { color: #bbf7d0; }
.cn-lead { font-size: 17px; line-height: 1.6; color: #dcfce7; max-width: 620px; margin: 0 0 22px; }
.cn-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.14); font-size: 13px; font-weight: 700; }
.cn-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; max-width: 620px; }
.cn-stats div { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 14px; padding: 12px; }
.cn-stats b { display: block; font-size: 24px; font-weight: 900; }
.cn-stats span { font-size: 12.5px; color: #d1fae5; line-height: 1.35; display: block; }
.cn-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 22px; border-radius: 14px; border: none; background: var(--g); color: #fff !important; font: 800 15px 'Inter', system-ui, sans-serif; cursor: pointer; text-decoration: none; transition: background .15s, transform .15s; }
.cn-hero .cn-btn { background: #fff; color: var(--g) !important; }
.cn-btn:hover { background: var(--g2); }
.cn-hero .cn-btn:hover { background: #ecfdf5; transform: translateY(-1px); }
.cn-btn:disabled { opacity: .6; cursor: wait; }
.cn-btn.ghost { background: #fff; color: var(--g) !important; border: 1.5px solid var(--gb); }
.cn-btn.ghost:hover { background: var(--gl); }
.cn-sec { margin-top: 36px; }
.cn-sec h2 { font-size: 24px; font-weight: 800; margin: 0 0 14px; }
.cn-perks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.cn-perk { display: flex; gap: 12px; background: #fff; border: 1px solid #e3ece6; border-radius: 16px; padding: 16px; }
.cn-perk-i { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; background: var(--gl); color: var(--g); display: flex; align-items: center; justify-content: center; }
.cn-perk b { font-size: 15.5px; }
.cn-perk p, .cn-steps p { margin: 3px 0 0; font-size: 14px; line-height: 1.5; color: var(--mut); }
.cn-steps { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.cn-steps li { margin: 0; display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1px solid #e3ece6; border-radius: 16px; padding: 14px 16px; }
.cn-step-n { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; background: var(--g); color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.cn-note { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; padding: 12px 14px; border-radius: 14px; background: #fffbeb; border: 1px solid #fde68a; color: #78350f; font-size: 14px; line-height: 1.5; }
.cn-note svg { flex-shrink: 0; margin-top: 2px; }
.cn-card { background: #fff; border: 1px solid #e3ece6; border-radius: 20px; padding: 22px; box-shadow: 0 18px 40px -28px rgba(16,35,26,.35); scroll-margin-top: 90px; }
#cn-form { scroll-margin-top: 90px; }
.cn-card-head h2 { margin-bottom: 12px; }
.cn-progress { display: flex; gap: 6px; margin-bottom: 20px; }
.cn-prog { flex: 1; display: flex; align-items: center; gap: 7px; padding: 8px 10px; border-radius: 12px; background: #f3f6f4; color: var(--mut); font-size: 13px; font-weight: 700; }
.cn-prog span { width: 22px; height: 22px; border-radius: 50%; background: #dfe8e2; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
.cn-prog.on { background: var(--gl); color: var(--g); }
.cn-prog.on span, .cn-prog.done span { background: var(--g); color: #fff; }
.cn-prog.done { color: var(--g); }
.cn-fields { display: grid; gap: 16px; }
.cn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.cn-f { display: grid; gap: 7px; margin: 0; }
.cn-f > span { font-size: 13.5px; font-weight: 700; color: #26392f; }
.cn input:not([type=checkbox]), .cn textarea { width: 100%; height: auto; min-height: 46px; padding: 11px 13px; border: 1.5px solid var(--gb); border-radius: 12px; background: #fbfdfc; font: 500 15px 'Inter', system-ui, sans-serif; color: var(--ink); outline: none; box-shadow: none; transition: border-color .15s, background .15s; }
.cn textarea { resize: vertical; line-height: 1.5; }
.cn input:focus, .cn textarea:focus { border-color: var(--g); background: #fff; }
.cn-phone { display: flex; align-items: stretch; }
.cn-phone em { font-style: normal; display: flex; align-items: center; padding: 0 11px; border: 1.5px solid var(--gb); border-right: none; border-radius: 12px 0 0 12px; background: #f3f6f4; font-weight: 700; font-size: 14px; color: var(--mut); }
.cn-phone input { border-radius: 0 12px 12px 0 !important; }
.cn-why { font-style: normal; font-weight: 500; color: var(--mut); font-size: 12.5px; }
.cn-emailrow { display: flex; gap: 8px; align-items: stretch; }
.cn-emailrow input { flex: 1; min-width: 0; }
.cn-emailrow input[readonly] { background: #f3f6f4; color: #33463b; }
.cn-sendcode { flex-shrink: 0; padding: 0 16px !important; border-radius: 12px !important; font-size: 14px !important; white-space: nowrap; }
.cn-verified { flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; padding: 0 14px; border-radius: 12px; background: var(--gl); border: 1.5px solid #bbf7d0; color: var(--g); font-weight: 800; font-size: 14px; }
.cn-textbtn { justify-self: start; border: none; background: none; padding: 0; color: var(--g); font: 700 13px 'Inter', system-ui, sans-serif; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.cn-textbtn:disabled { color: var(--mut); text-decoration: none; cursor: default; }
.cn-otp { display: grid; gap: 10px; padding: 14px; border-radius: 14px; background: #fbfdfc; border: 1px solid #e3ece6; }
.cn-otp p { margin: 0; font-size: 14px; color: #33463b; }
.cn-otp-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--mut); }
.cn-otp-msg { font-size: 13px; font-weight: 600; color: var(--g); }
.cn-otp-msg.bad { color: #b91c1c; }
.cn-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cn-chip, .cn-day, .cn-hour, .cn-band { border: 1.5px solid var(--gb); background: #fff; color: #26392f; border-radius: 999px; padding: 9px 14px; font: 600 14px 'Inter', system-ui, sans-serif; cursor: pointer; transition: all .12s; line-height: 1.2; }
.cn-chip.sm { padding: 7px 12px; font-size: 13px; }
.cn-chip:hover, .cn-day:hover, .cn-hour:hover, .cn-band:hover { border-color: var(--g); }
.cn-chip.on, .cn-day.on, .cn-hour.on { background: var(--g); border-color: var(--g); color: #fff; }
.cn-split { color: var(--g); font-weight: 700; font-size: 12.5px; }
.cn-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.cn-day { border-radius: 12px; padding: 11px 0; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.cn-day em { font-style: normal; font-size: 11px; font-weight: 700; opacity: .85; }
.cn-dayblock { border: 1px solid #e3ece6; border-radius: 16px; padding: 12px; background: #fbfdfc; }
.cn-dayhead { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.cn-dayhead b { font-size: 15px; }
.cn-bands { display: flex; gap: 6px; flex-wrap: wrap; }
.cn-band { padding: 5px 10px; font-size: 12px; color: var(--g); }
.cn-band.on { background: var(--gl); border-color: var(--g); }
.cn-hours { display: grid; grid-template-columns: repeat(auto-fill, minmax(74px, 1fr)); gap: 6px; }
.cn-hour { border-radius: 10px; padding: 9px 0; font-size: 13px; }
.cn-hint { margin: 0; font-size: 13.5px; color: var(--mut); }
.cn-terms { border-radius: 16px; background: var(--gl); border: 1px solid #bbf7d0; padding: 14px 16px; font-size: 14px; }
.cn-terms ul { margin: 8px 0 12px; padding-left: 18px; line-height: 1.6; color: #1f3b2b; }
.cn-check { display: flex; gap: 9px; align-items: center; font-weight: 700; cursor: pointer; margin: 0; }
.cn-check input { width: 18px; height: 18px; accent-color: var(--g); margin: 0; opacity: 1; position: static; }
.cn-err { margin-top: 14px; padding: 11px 13px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 14px; font-weight: 600; }
.cn-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.cn-actions .cn-btn:last-child { flex: 0 1 auto; min-width: 180px; }
.cn-faqs { display: grid; gap: 8px; }
.cn-faq { background: #fff; border: 1px solid #e3ece6; border-radius: 14px; overflow: hidden; }
.cn-faq button { width: 100%; display: flex; justify-content: space-between; gap: 12px; text-align: left; padding: 14px 16px; border: none; background: none; font: 700 15px 'Inter', system-ui, sans-serif; color: var(--ink); cursor: pointer; }
.cn-faq button span { color: var(--g); font-size: 18px; line-height: 1; }
.cn-faq p { margin: 0; padding: 0 16px 14px; font-size: 14.5px; line-height: 1.6; color: var(--mut); }
.cn-wa { margin-top: 16px; }
.cn-hero-done { padding-bottom: 104px; }
.cn-donecard { max-width: 720px; margin: 0 auto; }
.cn-done-head { display: flex; gap: 14px; align-items: flex-start; }
.cn-done-head h2 { margin: 2px 0 4px !important; font-size: 22px; }
.cn-done-head p { margin: 0; color: var(--mut); font-size: 15px; line-height: 1.55; }
.cn-done-head p b { color: var(--ink); }
.cn-done-icon { flex-shrink: 0; width: 52px; height: 52px; border-radius: 16px; background: var(--g); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px -10px rgba(26,107,58,.8); animation: cnPop .35s ease; }
.cn-done-icon svg { font-size: 30px; }
@keyframes cnPop { from { transform: scale(.6); opacity: 0; } }
.cn-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0 22px; }
.cn-summary div { background: #f7faf8; border: 1px solid #e3ece6; border-radius: 14px; padding: 11px 13px; display: grid; gap: 2px; min-width: 0; }
.cn-summary span { font-size: 12px; color: var(--mut); font-weight: 600; }
.cn-summary b { font-size: 14.5px; color: var(--ink); overflow-wrap: anywhere; }
.cn-summary b.ok { color: var(--g); display: inline-flex; align-items: center; gap: 4px; }
.cn-next-title { margin: 0 0 12px; font-size: 13px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: #4b5d53; }
.cn-timeline { list-style: none; margin: 0; padding: 0; display: grid; }
.cn-timeline li { position: relative; display: flex; gap: 14px; margin: 0; padding-bottom: 18px; }
.cn-timeline li:last-child { padding-bottom: 0; }
.cn-timeline li:not(:last-child)::before { content: ""; position: absolute; left: 15px; top: 34px; bottom: 4px; width: 2px; background: #e3ece6; }
.cn-timeline li > span { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: #eef3f0; color: var(--mut); font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
.cn-timeline li.cur > span { background: var(--gl); color: var(--g); box-shadow: inset 0 0 0 2px var(--g); }
.cn-timeline b { display: block; font-size: 15px; color: var(--ink); margin-top: 5px; }
.cn-timeline p { margin: 3px 0 0; font-size: 14px; line-height: 1.5; color: var(--mut); }
.cn-done-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; padding-top: 18px; border-top: 1px dashed #d5e3da; }
.cn-done-actions .cn-btn { flex: 1 1 200px; }
.cn-done-note { margin: 12px 0 0; font-size: 13px; color: var(--mut); text-align: center; }
@media (max-width: 640px) {
  .cn-hero { padding: 96px 0 84px; background-image: linear-gradient(180deg, rgba(12,58,32,.9) 0%, rgba(20,86,48,.86) 60%, rgba(26,107,58,.78) 100%), url('/assets/img/profile-banner-calm-room.jpg'); background-position: 70% center; }
  .cn-formsec { margin-top: -56px; }
  .cn-summary { grid-template-columns: 1fr 1fr; }
  .cn-summary div:first-child { grid-column: 1 / -1; }
  .cn-done-head h2 { font-size: 19px; }
  .cn-modal { padding: 16px; border-radius: 18px; }
  .cn-lead { font-size: 15.5px; }
  .cn-stats b { font-size: 19px; }
  .cn-stats span { font-size: 11.5px; }
  .cn-perks, .cn-row { grid-template-columns: 1fr; }
  .cn-card { padding: 16px; border-radius: 18px; }
  .cn-prog { font-size: 0; justify-content: center; padding: 8px 4px; gap: 0; }
  .cn-prog.on { font-size: 12.5px; gap: 6px; flex: 2; }
  .cn-days { gap: 4px; }
  .cn-day { font-size: 12.5px; padding: 10px 0; }
  .cn-actions .cn-btn { flex: 1; min-width: 0; }
}
`;
