import React, { useRef, useState } from "react";
import {
  ShieldCheck, Lock, Users, MessageCircle, Presentation, ClipboardList, BarChart3, LifeBuoy, UserCheck, Check, MapPin, Star,
  Clock, ArrowRight, EyeOff, Phone, GraduationCap, School, CalendarCheck, HeartHandshake, FileText, BookOpen, Award,
} from "lucide-react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";
import { usePublicStats, ratingText, reviewsText, sessionsText } from "../../utils/public-stats";
import { CountUp, usePageMotion, Registered, CSS as EAP_CSS } from "../business/eap";

/* /for-schools-colleges — Student Wellbeing Program for schools, colleges, universities and coaching institutes.
   Same look and motion as /for-business (shares the EAP page's CSS, CountUp, reveal + parallax). Facts only: CYT's own
   registrations and live numbers, Indian figures and rules with links to where they were reported, no prices. */

const WHATSAPP = "918077757951";
const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I'd like to know about the CYT Student Wellbeing Program for our school / college.")}`;

/* ---------------- content ---------------- */

const SRC = {
  ncrb: { label: "NCRB, Accidental Deaths & Suicides in India 2022 (Lok Sabha reply, Jul 2025)", url: "https://theprint.in/india/student-suicides-7-6-pc-of-all-suicide-cases-across-india-mos-in-ls/2697653" },
  ncert: { label: "NCERT Mental Health & Well-being of School Students survey, cited in the Economic Survey 2023-24 (PIB)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2034931" },
  eco: { label: "Economic Survey 2023-24 · National Mental Health Survey (PIB, Govt of India)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2034931" },
  sc: { label: "Supreme Court, Sukdeb Saha v. State of Andhra Pradesh, 25 Jul 2025 (SCC Online)", url: "https://www.scconline.com/blog/post/2025/07/25/supreme-court-guidelines-protecting-mental-health-of-coaching-and-college-students-legal-news/" },
  cbse: { label: "CBSE circular on counsellors in affiliated schools, Jan 2026 (Careers360)", url: "https://news.careers360.com/cbse-mandates-socio-emotional-career-counsellors-affiliated-schools-rajasthan-hc-pil-student-mental-health-guidance-classes-9-12" },
};

const WHY = [
  { n: "7.6%", t: "of all suicides in India in 2022 were students — more than 13,000 young lives in a single year", src: SRC.ncrb },
  { n: "43%", t: "of school students surveyed reported mood swings; 14% felt extreme emotions", src: SRC.ncert },
  { n: "11%", t: "of school students said they often feel anxious — most never get to talk to a professional", src: SRC.ncert },
  { n: "70–92%", t: "of people with a mental disorder in India get no treatment, depending on the condition", src: SRC.eco },
  { n: "100+", t: "students: the Supreme Court's 2025 guidelines ask every such institution to have at least one qualified counsellor; smaller ones need a referral link to outside professionals", src: SRC.sc },
  { n: "1 : 500", t: "CBSE now asks affiliated schools for a counselling & wellness teacher for every 500 students, plus a career counsellor", src: SRC.cbse },
];

export const SWP_INCLUDES = [
  { icon: MessageCircle, title: "1:1 student counselling", desc: "Private sessions with a verified psychologist — online from anywhere, or in person at our Noida centre. Parent consent for under-18s." },
  { icon: CalendarCheck, title: "Visiting counsellor days", desc: "A psychologist on your campus on fixed days each term, across Delhi NCR — drop-in hours and booked sessions." },
  { icon: Presentation, title: "Student workshops", desc: "Exam stress, anxiety, bullying and online safety, relationships, sleep and screen time — age-appropriate for each class." },
  { icon: UserCheck, title: "Teacher & staff training", desc: "How to spot a student in distress, start the conversation and refer safely — for teachers, wardens and mentors." },
  { icon: HeartHandshake, title: "Parent sessions", desc: "Exam season, adolescence, screen time, and supporting a child who is seeing a counsellor." },
  { icon: ClipboardList, title: "Screening & check-ins", desc: "Consent-based self-check tools for stress, anxiety and mood, so students who need help are noticed early." },
  { icon: LifeBuoy, title: "Referral & crisis pathway", desc: "A written plan for who to call and when, support after a difficult incident, and links to 112 and Tele-MANAS 14416." },
  { icon: FileText, title: "Policy & reports", desc: "Help drafting the mental health policy and referral linkages the 2025 guidelines ask for, plus anonymous term reports." },
];

const STUDENT_STEPS = [
  { t: "Hears about it at school", d: "An orientation talk, a poster with a QR code, or a teacher who suggests it." },
  { t: "Reaches out privately", d: "Books a session, drops in on a counsellor day, or messages on WhatsApp." },
  { t: "Talks to a psychologist", d: "In confidence — online or in person. Parents are involved for under-18s." },
  { t: "Gets ongoing support", d: "Follow-ups, coping tools and, if needed, a referral to specialist care." },
];

const INST_STEPS = [
  { icon: Phone, t: "Discovery call", d: "Your student numbers, classes or courses, campus and what worries you most." },
  { icon: ClipboardList, t: "Proposal", d: "A plan sized to your institution and term calendar — within one working day of the call." },
  { icon: CalendarCheck, t: "Launch", d: "Staff briefing, a student orientation and a note for parents — ready to share." },
  { icon: BarChart3, t: "Review", d: "Anonymous reports each term and a planning call before exams and new sessions." },
];

const MODELS = [
  {
    name: "Referral partner", tag: "Under 100 students",
    desc: "A formal referral link to CYT psychologists — students are referred when they need support. Pay per session or keep a small session bank.",
    points: ["Meets the referral-linkage route for smaller institutions", "Pay only for sessions used", "Written referral & crisis pathway"],
  },
  {
    name: "Campus wellbeing program", tag: "Most chosen", featured: true,
    desc: "Visiting counsellor days, online counselling, a workshop every term, teacher training and anonymous reports — one yearly plan.",
    points: ["On-campus days across Delhi NCR", "Online counselling for every student", "Termly workshops + staff training", "Named coordinator for your institution"],
  },
  {
    name: "Workshops & events", tag: "One-off or termly",
    desc: "For exam season, orientation week, World Mental Health Day or after a difficult event — on campus or online.",
    points: ["Delhi NCR on campus, online anywhere", "Students, teachers or parents", "Q&A with a psychologist"],
  },
];

const TOPICS = [
  "Exam stress", "Anxiety & panic", "Bullying & cyberbullying", "Healthy relationships", "Sleep & screen time", "Body image",
  "Coping with failure", "Study & career pressure", "Homesickness & hostel life", "Grief & loss", "Peer support training", "Spotting distress (for teachers)",
];

export const faqData = [
  { q: "Do you work with schools as well as colleges?", a: "Yes — schools (any board), colleges, universities and coaching institutes. Workshops and sessions are adapted to the age group, and counselling for students under 18 is done with parental consent." },
  { q: "Is it confidential? What does the school or college get to know?", a: "What a student says stays between them and the psychologist. Management receives anonymous numbers only — sessions used, broad themes and workshop attendance. The one exception is a risk to someone's safety, where the agreed safety protocol is followed." },
  { q: "Do students under 18 need parental consent?", a: "Yes. For minors we take a parent's or guardian's consent before ongoing counselling, and parents can join sessions where that helps. Workshops in class don't need individual consent." },
  { q: "Does this help with the Supreme Court's 2025 guidelines?", a: "The July 2025 guidelines ask institutions with 100 or more students to have at least one qualified counsellor, and smaller ones to set up referral links with outside mental health professionals. CYT can be that outside partner, provide visiting counsellors, and help you draft the mental health policy and referral pathway. Your institution stays responsible for its own compliance." },
  { q: "Online or on campus?", a: "Counselling and webinars work online anywhere in India. Visiting counsellor days and on-campus workshops are available across Delhi NCR; for other cities, ask us." },
  { q: "Which languages?", a: "English and Hindi, with other Indian languages depending on psychologist availability." },
  { q: "How is it priced?", a: "Three ways: a referral partnership (pay per session or a small session bank), a yearly campus wellbeing program, or workshops on their own. The quote depends on student numbers, campus days and how many workshops you need. Share your details and we'll send a proposal." },
  { q: "Is this an emergency service?", a: "No. For anyone at immediate risk, call 112 or India's Tele-MANAS mental health helpline 14416 (free, 24×7). We help your team set up a clear crisis pathway and support students and staff after a difficult incident." },
  { q: "We have a psychology department — can students intern with you?", a: "Yes. CYT runs structured psychology internships with supervised hours, online and at our Noida centre, and every certificate carries a QR code you can verify on our website. Ask us about a department partnership." },
];

/* ---------------- sections ---------------- */

function Hero({ stats }) {
  return (
    <section className="eap-hero" aria-labelledby="swp-title">
      <div className="eap-wrap eap-hero-in">
        <div className="eap-hero-l">
          <span className="eap-kicker"><GraduationCap size={15} /> Student Wellbeing Program</span>
          <h1 id="swp-title">Mental health support for <em>schools &amp; colleges</em></h1>
          <p className="eap-lead">
            Verified psychologists for your students — counselling online and at our Noida centre, campus visits across Delhi NCR,
            workshops for students, teachers and parents, and a clear crisis pathway. For schools, colleges, universities and coaching institutes.
          </p>
          <div className="eap-ctas">
            <a href="#eap-enquiry" className="eap-btn eap-btn-main">Get a proposal <ArrowRight size={18} /></a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="eap-btn eap-btn-ghost">WhatsApp our team</a>
          </div>
          <ul className="eap-proof">
            <li><Star size={15} /> <b>{ratingText(stats)}</b> on Google · {reviewsText(stats)} reviews</li>
            <li><Users size={15} /> <b>{sessionsText(stats)}</b> sessions on CYT</li>
            <li><ShieldCheck size={15} /> Since 2020 · HFR ID IN0510005384</li>
          </ul>
        </div>
        <div className="eap-hero-r">
          <div className="eap-hero-circle" aria-hidden="true" />
          <picture>
            {/* phones / upright tablets don't show the photo — a 1px placeholder so they don't download it */}
            <source media="(max-width:900px), (max-width:1100px) and (orientation:portrait)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
            <img className="eap-hero-img" src="/images/eap/student-wellbeing.webp" width="754" height="745"
              alt="Smiling college student holding books — student wellbeing program" fetchPriority="high" decoding="async" />
          </picture>
          <div className="eap-badge eap-badge-a"><span><EyeOff size={17} /></span><div><b>Confidential for students</b><small>Management sees numbers, not names</small></div></div>
          <div className="eap-badge eap-badge-b"><span><ShieldCheck size={17} /></span><div><b>Verified psychologists</b><small>Online · campus visits in NCR</small></div></div>
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="eap-sec" aria-labelledby="swp-why">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">Why it matters</span>
          <h2 id="swp-why">Students are under more pressure — and the rules now <em>expect support</em></h2>
          <p>Exams, competition, screens and being away from home weigh on students long before anyone notices. India's courts and boards now ask every institution to have help in place.</p>
        </div>
        <div className="eap-why" data-rs="">
          {WHY.map((w) => (
            <div className="eap-why-c" key={w.n}>
              <b><CountUp text={w.n} /></b><p>{w.t}</p>
              <a className="eap-src" href={w.src.url} target="_blank" rel="noopener noreferrer">Source: {w.src.label} ↗</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Includes() {
  return (
    <section className="eap-sec eap-sec-sage" aria-labelledby="swp-inc">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">What's inside</span>
          <h2 id="swp-inc">Everything a <em>student wellbeing program</em> needs</h2>
          <p>Pick what your institution needs — every plan is built from these parts.</p>
        </div>
        <div className="eap-grid" data-rs="">
          {SWP_INCLUDES.map(({ icon: I, title, desc }) => (
            <div className="eap-card" key={title}><span className="eap-ic"><I size={20} /></span><h3>{title}</h3><p>{desc}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="eap-sec eap-dark" aria-labelledby="swp-priv">
      <div className="eap-wrap eap-priv">
        <div data-r="">
          <span className="eap-eyebrow light">Safe to speak up</span>
          <h2 id="swp-priv">Students only open up when it feels <em>safe</em></h2>
          <p>So confidentiality, consent and safety are agreed with you before the first session.</p>
        </div>
        <ul className="eap-priv-l" data-rs="">
          <li><Lock size={18} /><div><b>Confidential for students</b><span>Management gets anonymous numbers and themes — never names or what was said.</span></div></li>
          <li><Users size={18} /><div><b>Parents in the loop for minors</b><span>Consent before ongoing counselling for under-18s; parents can join when it helps.</span></div></li>
          <li><ShieldCheck size={18} /><div><b>A clear safety protocol</b><span>If someone is at risk, an agreed plan decides who is told and what happens next.</span></div></li>
          <li><LifeBuoy size={18} /><div><b>Not an emergency service</b><span>Anyone at immediate risk is guided to 112 or Tele-MANAS 14416 (free, 24×7).</span></div></li>
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="eap-sec" aria-labelledby="swp-how">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">How it works</span>
          <h2 id="swp-how">Easy for students, <em>light work for your team</em></h2>
        </div>
        <div className="eap-how">
          <div className="eap-how-col" data-r="">
            <h3><GraduationCap size={18} /> For your students</h3>
            <ol className="eap-steps" data-rs="">
              {STUDENT_STEPS.map((s, i) => <li key={s.t}><span className="n">{i + 1}</span><div><b>{s.t}</b><p>{s.d}</p></div></li>)}
            </ol>
          </div>
          <div className="eap-how-col" data-r="">
            <h3><School size={18} /> For your institution — live in about two weeks</h3>
            <ol className="eap-steps" data-rs="">
              {INST_STEPS.map(({ icon: I, t, d }) => <li key={t}><span className="n ic"><I size={16} /></span><div><b>{t}</b><p>{d}</p></div></li>)}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Models() {
  return (
    <section className="eap-sec eap-sec-cream" aria-labelledby="swp-plans">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">Ways to work with us</span>
          <h2 id="swp-plans">A plan for every <em>size of institution</em></h2>
          <p>Pricing depends on student numbers, campus days and workshops — tell us about your institution and we'll send a proposal.</p>
        </div>
        <div className="eap-models" data-rs="">
          {MODELS.map((m) => (
            <div className={`eap-model ${m.featured ? "feat" : ""}`} key={m.name}>
              <span className="eap-model-tag">{m.tag}</span>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
              <ul>{m.points.map((p) => <li key={p}><Check size={16} /> {p}</li>)}</ul>
              <a href="#eap-enquiry" className={`eap-btn ${m.featured ? "eap-btn-main" : "eap-btn-ghost"}`}>Get a quote</a>
            </div>
          ))}
        </div>
        <div className="eap-topics" data-r="">
          <h3>Popular workshop topics</h3>
          <div className="eap-chips">{TOPICS.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      </div>
    </section>
  );
}

function Departments() {
  return (
    <section className="eap-sec" aria-labelledby="swp-dept">
      <div className="eap-wrap swp-dept" data-r="">
        <div className="swp-dept-ic" aria-hidden="true"><BookOpen size={30} /></div>
        <div className="swp-dept-t">
          <span className="eap-eyebrow">For psychology departments</span>
          <h2 id="swp-dept">Give your students <em>real practice</em></h2>
          <p>Structured internships with practising psychologists — online and at our Noida centre — with supervised hours and certificates your faculty can verify by QR code.</p>
          <ul className="swp-dept-l">
            <li><Check size={16} /> Internship modules and supervised hours</li>
            <li><Award size={16} /> Certificates with QR verification</li>
            <li><Presentation size={16} /> Guest lectures and case-discussion sessions</li>
          </ul>
        </div>
        <div className="swp-dept-a">
          <a href="/internship-modules" className="eap-btn eap-btn-main">See internship modules <ArrowRight size={18} /></a>
          <a href="#eap-enquiry" className="eap-btn eap-btn-ghost">Partner with us</a>
        </div>
      </div>
    </section>
  );
}

/* enquiry — same lead pipeline as the rest of the site (SubmitConsultationUrl), source "Schools & Colleges Page" */
const TYPES = ["School", "College", "University", "Coaching institute", "Other"];
const SIZES = ["Up to 100", "101-500", "501-1,000", "1,001-5,000", "5,000+"];
const BOARDS = ["CBSE", "ICSE / ISC", "State board", "IB / IGCSE", "University / autonomous", "Other"];
const NEEDS = ["1:1 counselling", "Visiting counsellor days", "Student workshops", "Teacher training", "Parent sessions", "Crisis pathway / policy", "Psychology internships"];
const TIMELINES = ["This term", "Next term", "Next academic year", "Just exploring"];
const EMPTY = { name: "", designation: "", email: "", phone: "", org: "", type: "", size: "", city: "", board: "", needs: [], timeline: "", message: "" };

function Enquiry() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));
  const toggle = (s) => setForm((p) => ({ ...p, needs: p.needs.includes(s) ? p.needs.filter((x) => x !== s) : [...p.needs, s] }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name.trim() || !form.designation.trim() || !form.email.trim() || !form.org.trim() || !form.type || !form.size) return setError("Please fill in the required fields.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid email.");
    if (!/^[0-9]{10}$/.test(form.phone)) return setError("Please enter a valid 10-digit phone number.");
    const needs = form.needs.join(", ");
    const summary = [
      `Institution: ${form.org}`, `Type: ${form.type}`, `Designation: ${form.designation}`, `Students: ${form.size}`,
      `City: ${form.city || "Not specified"}`, `Board / affiliation: ${form.board || "Not specified"}`,
      `Needs: ${needs || "Not specified"}`, `Start: ${form.timeline || "Not specified"}`,
      form.message.trim() ? `\nRequirements: ${form.message.trim()}` : "",
    ].filter(Boolean).join("\n");
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone, location: form.city.trim(),
        concern: `Student wellbeing enquiry — ${form.org} (${form.type}, ${form.size} students)`, message: summary, source: "Schools & Colleges Page",
        company: form.org.trim(), designation: form.designation.trim(), industry: form.type, teamSize: form.size, services: needs, timeline: form.timeline,
      });
      setSuccess("Thank you! Our team will get back to you within one working day.");
      setForm(EMPTY);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp us.");
    }
    setLoading(false);
  };

  return (
    <section className="eap-sec eap-sec-sage" id="eap-enquiry" aria-labelledby="swp-enq">
      <div className="eap-wrap eap-enq">
        <div className="eap-enq-l" data-r="">
          <span className="eap-eyebrow">Get a proposal</span>
          <h2 id="swp-enq">Tell us about your <em>institution</em></h2>
          <p>We'll design a program around your students, campus and term calendar — with clear pricing.</p>
          <ol className="eap-next">
            <li><Clock size={18} /><div><b>Reply within one working day</b><span>From our team, not a bot.</span></div></li>
            <li><Phone size={18} /><div><b>20-minute discovery call</b><span>Your students, campus and what worries you most.</span></div></li>
            <li><ClipboardList size={18} /><div><b>Proposal & quote</b><span>A plan and price sized to your institution.</span></div></li>
          </ol>
          <div className="eap-contact">
            <span>Prefer to talk now?</span>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp +91 80777 57951</a>
            <a href="mailto:chooseyourtherapist@gmail.com">chooseyourtherapist@gmail.com</a>
            <span className="eap-addr"><MapPin size={15} /> D-137, Sector 51, Noida</span>
          </div>
        </div>
        <form className="eap-form" onSubmit={submit} noValidate data-r="">
          <div className="eap-f2">
            <label>Your name *<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
            <label>Designation *<input value={form.designation} onChange={set("designation")} placeholder="e.g. Principal, Counsellor, Dean" /></label>
            <label>Email *<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
            <label>Phone *<input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit number" autoComplete="tel-national" /></label>
            <label>Institution name *<input value={form.org} onChange={set("org")} autoComplete="organization" /></label>
            <label>Type *<select value={form.type} onChange={set("type")}><option value="">Select</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>Students *<select value={form.size} onChange={set("size")}><option value="">Select</option>{SIZES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>City<input value={form.city} onChange={set("city")} placeholder="e.g. Noida, Lucknow" /></label>
            <label>Board / affiliation<select value={form.board} onChange={set("board")}><option value="">Select</option>{BOARDS.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>When to start<select value={form.timeline} onChange={set("timeline")}><option value="">Select</option>{TIMELINES.map((t) => <option key={t}>{t}</option>)}</select></label>
          </div>
          <div className="eap-f-l">What do you need?</div>
          <div className="eap-needs">
            {NEEDS.map((s) => <button type="button" key={s} className={form.needs.includes(s) ? "on" : ""} aria-pressed={form.needs.includes(s)} onClick={() => toggle(s)}>{form.needs.includes(s) && <Check size={14} />}{s}</button>)}
          </div>
          <label className="eap-full">Anything else?<textarea rows={3} value={form.message} onChange={set("message")} placeholder="Concerns, upcoming exams, past incidents, questions" /></label>
          {error && <div className="eap-err" role="alert">{error}</div>}
          {success && <div className="eap-ok" role="status">{success}</div>}
          <button type="submit" className="eap-btn eap-btn-main eap-submit" disabled={loading}>{loading ? "Sending…" : "Request proposal"}</button>
          <small className="eap-note">Your details are only used to reply to this enquiry.</small>
        </form>
      </div>
    </section>
  );
}

function Faqs() {
  const [open, setOpen] = useState(0);
  return (
    <section className="eap-sec" aria-labelledby="swp-faq">
      <div className="eap-wrap eap-faq">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">FAQs</span>
          <h2 id="swp-faq">Questions principals and deans <em>ask us</em></h2>
        </div>
        <div className="eap-faq-l" data-rs="">
          {faqData.map((f, i) => (
            <div className={`eap-q ${open === i ? "on" : ""}`} key={f.q}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{f.q}<span>{open === i ? "−" : "+"}</span></button>
              {open === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="eap-final">
      <div className="eap-wrap eap-final-in" data-r="">
        <div>
          <h2>Give every student someone to talk to.</h2>
          <p>Counselling, workshops and a crisis pathway your institution can start this term.</p>
        </div>
        <div className="eap-ctas">
          <a href="#eap-enquiry" className="eap-btn eap-btn-gold">Get a proposal <ArrowRight size={18} /></a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="eap-btn eap-btn-line">WhatsApp us</a>
        </div>
      </div>
    </section>
  );
}

export default function StudentWellbeingPage() {
  const stats = usePublicStats();
  const rootRef = useRef(null);
  usePageMotion(rootRef);
  return (
    <main className="eap swp" ref={rootRef}>
      <Hero stats={stats} />
      <Registered />
      <Why />
      <Includes />
      <Privacy />
      <HowItWorks />
      <Models />
      <Departments />
      <Enquiry />
      <Faqs />
      <FinalCta />
      <style dangerouslySetInnerHTML={{ __html: EAP_CSS + SWP_CSS }} />
    </main>
  );
}

const SWP_CSS = `
/* the student photo stands upright: badges sit off her face and the books */
.swp .eap-hero-img { width:min(440px,92%); }
.swp .eap-badge-a { left:0; right:auto; top:auto; bottom:120px; }
.swp .eap-badge-b { right:0; left:auto; bottom:28px; }
.swp-dept { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:28px; align-items:center; background:linear-gradient(120deg, #fbf7ec, #f6faf7);
  border:1px solid #ecdfc0; border-radius:28px; padding:32px; }
.swp-dept-ic { width:72px; height:72px; border-radius:22px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, var(--g2), var(--gd)); color:#fff; }
.swp-dept-t h2 { font-size:clamp(24px,3vw,34px); font-weight:900; margin:10px 0 8px; line-height:1.15; }
.swp-dept-t p { margin:0 0 12px; color:var(--soft); font-size:16px; line-height:1.6; }
.swp-dept-l { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:8px 18px; font-size:14.5px; font-weight:700; color:#2b3a32; }
.swp-dept-l li { display:inline-flex; align-items:center; gap:6px; } .swp-dept-l svg { color:var(--g); }
.swp-dept-a { display:flex; flex-direction:column; gap:10px; }
@media (max-width:900px) {
  .swp-dept { grid-template-columns:minmax(0,1fr); padding:22px; }
  .swp-dept-a { flex-direction:row; flex-wrap:wrap; } .swp-dept-a .eap-btn { flex:1 1 220px; }
}
`;
