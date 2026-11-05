import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck, Lock, Users, HeartHandshake, MessageCircle, Presentation, ClipboardList, BarChart3, LifeBuoy,
  UserCheck, Check, Laptop, MapPin, Star, Clock, ArrowRight, EyeOff, Phone, Briefcase, Building2, CalendarCheck,
} from "lucide-react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";
import { usePublicStats, ratingText, reviewsText, sessionsText } from "../../utils/public-stats";

/* /for-business — Corporate EAP (Employee Assistance Program). One file for the page's sections so the look
   stays in one place: the site's own green / gold / cream theme (About us, home). Facts only: CYT's real
   registrations, live session + Google numbers (/api/public/stats), cited industry figures, no made-up prices. */

const WHATSAPP = "918077757951";
const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I'd like to know about the CYT Employee Assistance Program (EAP) for our company.")}`;

/* ---------------- content ---------------- */

const REGISTRATIONS = [
  { src: "/images/registrations/mca.png", alt: "Ministry of Corporate Affairs, Government of India", label: "Ministry of Corporate Affairs" },
  { src: "/images/registrations/msme.svg", alt: "MSME registered", label: "MSME registered" },
  { src: "/images/registrations/nha.png", alt: "National Health Authority", label: "National Health Authority" },
  { src: "/images/registrations/abdm.svg", alt: "Ayushman Bharat Digital Mission", label: "ABDM · HFR ID IN0510005384" },
];

/* India figures only, each checked against the original document (Nov 2026):
   Deloitte India report PDF (3,995 employees, fieldwork late 2021 – Apr 2022) and the Economic Survey 2023-24
   as released by PIB (citing the National Mental Health Survey 2015-16, NIMHANS / MoHFW). */
const DELOITTE = { label: "Deloitte India, Mental health and well-being in the workplace (2022)", url: "https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-mental-health-2022-report-noexp.pdf" };
const ECO_SURVEY = { label: "Economic Survey 2023-24 · National Mental Health Survey 2015-16 (PIB, Govt of India)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2034931" };
const WHY = [
  { n: "80%+", t: "of employees surveyed across Indian companies had at least one mental health symptom in the past year", src: DELOITTE },
  { n: "₹1.1 lakh crore", t: "(~US$14 bn) lost by Indian employers in a year (2021–22) to poor employee mental health — through absenteeism, presenteeism and attrition", src: DELOITTE },
  { n: "47%", t: "of those affected named the workplace as their biggest source of stress", src: DELOITTE },
  { n: "1 in 5", t: "employees in the survey had resigned to look after their mental health; a third kept working through it", src: DELOITTE },
  { n: "10.6%", t: "of adults in India live with a mental disorder — 13.5% in metro cities, against 6.9% in rural areas", src: ECO_SURVEY },
  { n: "70–92%", t: "of people with a mental disorder in India get no treatment, depending on the condition", src: ECO_SURVEY },
];

export const EAP_INCLUDES = [
  { icon: MessageCircle, title: "Confidential 1:1 counselling", desc: "Employees talk privately to a verified psychologist — video call from anywhere in India, or in person at our Noida centre." },
  { icon: HeartHandshake, title: "Family cover", desc: "Spouse, parents and children can be included, because stress at home walks into work too." },
  { icon: UserCheck, title: "Manager & HR consultations", desc: "Guidance for managers on a struggling team member, difficult conversations and return-to-work." },
  { icon: Presentation, title: "Workshops & webinars", desc: "Stress, burnout, resilience and more — online, or on-site across Delhi NCR." },
  { icon: ClipboardList, title: "Self-check tools", desc: "Screening tools for stress, anxiety and mood, with a nudge to talk to someone when scores are high." },
  { icon: BarChart3, title: "Anonymous HR reports", desc: "Monthly usage and themes in aggregate — never names, never session content." },
  { icon: LifeBuoy, title: "Critical incident support", desc: "Group and 1:1 support after an accident, loss or traumatic event at work." },
  { icon: Laptop, title: "Easy to reach", desc: "A private link, WhatsApp number and email set up for your company — no app to install." },
];

const EMPLOYEE_STEPS = [
  { t: "Gets access from HR", d: "A private link and WhatsApp number, shared once on email, Slack or the intranet." },
  { t: "Picks a psychologist & time", d: "Filters by language, concern and online or in person." },
  { t: "Talks in private", d: "A confidential session. Only the employee and the psychologist know." },
  { t: "Keeps going if needed", d: "Follow-ups, notes and reminders in their own My Space." },
];

const HR_STEPS = [
  { icon: Phone, t: "Discovery call", d: "20 minutes on your headcount, locations and what you want to solve." },
  { icon: ClipboardList, t: "Proposal", d: "A plan and quote sized to your team — within one working day of the call." },
  { icon: CalendarCheck, t: "Launch", d: "A short launch session for employees and a toolkit for HR to share." },
  { icon: BarChart3, t: "Review", d: "Monthly anonymous report and a quarterly review with your team." },
];

const MODELS = [
  {
    name: "Session bank", tag: "Pilots & small teams",
    desc: "Buy a block of counselling sessions up front. Employees use them as needed; you only top up when it runs low.",
    points: ["Pay for sessions, not seats", "Good for a first pilot", "Usage report every month"],
  },
  {
    name: "Full EAP", tag: "Most chosen", featured: true,
    desc: "One fixed fee per employee per month covering counselling, family cover, workshops and reporting.",
    points: ["Counselling for employees + family", "Quarterly workshops included", "Manager consultations", "Named account manager"],
  },
  {
    name: "Workshops & events", tag: "One-off or quarterly",
    desc: "Sessions for wellness weeks, Mental Health Day, onboarding or after a tough quarter — on-site or online.",
    points: ["Delhi NCR on-site, online anywhere", "Custom topics for your team", "Q&A with a psychologist"],
  },
];

const TOPICS = [
  "Stress & burnout", "Managing anxiety at work", "Work–life balance", "Sleep & mental fitness", "Resilience through change",
  "Emotional intelligence for managers", "Spotting distress in your team", "Handling conflict", "Women's wellbeing at work",
  "Money stress", "Grief & loss", "Parenting while working",
];

export const faqData = [
  { q: "What is an Employee Assistance Program (EAP)?", a: "An EAP is a benefit an employer gives its people: free, confidential access to professional counselling and mental health support for work or personal problems. With CYT, that means verified psychologists online across India and in person at our Noida centre, plus workshops, manager support and anonymous reports for HR." },
  { q: "Will HR or the company know which employees use it?", a: "No. Employees book and attend on their own. The company only sees aggregate numbers — how many sessions were used and broad themes — never names, contact details or what was discussed." },
  { q: "Who are the psychologists?", a: "Counselling and clinical psychologists who are verified by the CYT team before they are listed — qualifications and registration documents are checked. Employees can choose by language, concern and session mode." },
  { q: "How is the EAP priced?", a: "Three ways: a session bank (a prepaid block of sessions), a full EAP with a fixed monthly fee per employee, or workshops on their own. The quote depends on headcount, whether families are covered and how many workshops you want. Share your details and we'll send a proposal." },
  { q: "How quickly can we launch?", a: "Usually within a week of agreeing the plan: we set up your company access, run a short launch session for employees and give HR a toolkit to share." },
  { q: "Do you work outside Delhi NCR?", a: "Yes. Counselling and webinars are online, so they work for teams anywhere in India. On-site workshops and counselling days are available in Delhi NCR; for other cities, ask us." },
  { q: "Which languages are sessions in?", a: "English and Hindi, with other Indian languages depending on psychologist availability." },
  { q: "Can family members use the program?", a: "Yes, on the full EAP family members can be included — usually spouse, children and parents. It can also be added to a session bank." },
  { q: "Is this an emergency service?", a: "No. For anyone at immediate risk, call 112 or India's Tele-MANAS mental health helpline 14416 (free, 24×7). Our team can also guide HR on next steps after a crisis." },
];

/* ---------------- motion helpers ---------------- */

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// "80%+" → counts 0 → 80 when it scrolls into view (the real text is in the server HTML)
function CountUp({ text, ms = 1400 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(text);
  useEffect(() => {
    const nums = [...text.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
    if (!nums.length || reduceMotion() || !("IntersectionObserver" in window)) return undefined;
    const fmt = (k) => {
      let i = 0;
      return text.replace(/\d+(?:\.\d+)?/g, (m) => {
        const dec = (nums[i++].split(".")[1] || "").length;
        return (parseFloat(m) * k).toFixed(dec);
      });
    };
    setShown(fmt(0));
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        setShown(k < 1 ? fmt(1 - Math.pow(1 - k, 3)) : text);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [text, ms]);
  return <span ref={ref}>{shown}</span>;
}

// reveal-on-scroll and hero parallax (the progress bar and smooth "#" links are site-wide: global/site-motion.js)
function usePageMotion(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = reduceMotion();
    const els = root.querySelectorAll("[data-r], [data-rs]");
    let io = null;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
    } else {
      root.classList.add("eap-js");
      io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
      els.forEach((el) => io.observe(el));
    }
    const hero = root.querySelector(".eap-hero");
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (hero && !reduce) hero.style.setProperty("--py", String(Math.min(y, 800)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      root.classList.remove("eap-js");
    };
  }, [rootRef]);
}

/* ---------------- sections ---------------- */

function Hero({ stats }) {
  return (
    <section className="eap-hero" aria-labelledby="eap-title">
      <div className="eap-wrap eap-hero-in">
        <div className="eap-hero-l">
          <span className="eap-kicker"><Building2 size={15} /> Employee Assistance Program</span>
          <h1 id="eap-title">Corporate EAP for <em>Indian workplaces</em></h1>
          <p className="eap-lead">
            Confidential counselling with verified psychologists for your employees and their families — online across India
            and in person in Noida — with workshops, manager support and anonymous reports for HR.
          </p>
          <div className="eap-ctas">
            <a href="#eap-enquiry" className="eap-btn eap-btn-main">Get an EAP proposal <ArrowRight size={18} /></a>
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
            <img className="eap-hero-img" src="/images/eap/eap-banner-hd.webp" width="1100" height="1133"
              alt="Smiling young professional pointing to the Employee Assistance Program details" fetchPriority="high" decoding="async" />
          </picture>
          <div className="eap-badge eap-badge-a"><span><EyeOff size={17} /></span><div><b>100% confidential</b><small>HR never sees names</small></div></div>
          <div className="eap-badge eap-badge-b"><span><ShieldCheck size={17} /></span><div><b>Verified psychologists</b><small>Online across India · Noida centre</small></div></div>
        </div>
      </div>
    </section>
  );
}

function Registered() {
  return (
    <section className="eap-reg" aria-label="Registered with">
      <div className="eap-wrap">
        <div className="eap-reg-l">Registered with</div>
        <div className="eap-reg-row" data-rs="">
          {REGISTRATIONS.map((r) => (
            <div className="eap-reg-c" key={r.src}><img src={r.src} alt={r.alt} loading="lazy" /><span>{r.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="eap-sec" aria-labelledby="eap-why">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">Why it matters</span>
          <h2 id="eap-why">In India, mental health is already a <em>business cost</em></h2>
          <p>Most of it is invisible: people who come to work but can't focus, quiet resignations, sick days that aren't really about the flu.</p>
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
    <section className="eap-sec eap-sec-sage" id="eap-program" aria-labelledby="eap-inc">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">What's inside</span>
          <h2 id="eap-inc">Everything in one <em>Employee Assistance Program</em></h2>
          <p>Pick what your team needs — every plan is built from these parts.</p>
        </div>
        <div className="eap-grid" data-rs="">
          {EAP_INCLUDES.map(({ icon: I, title, desc }) => (
            <div className="eap-card" key={title}><span className="eap-ic"><I size={20} /></span><h3>{title}</h3><p>{desc}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="eap-sec eap-dark" aria-labelledby="eap-priv">
      <div className="eap-wrap eap-priv">
        <div data-r="">
          <span className="eap-eyebrow light">Confidential by design</span>
          <h2 id="eap-priv">Employees will only use it if they <em>trust</em> it</h2>
          <p>So privacy isn't a setting — it's how the program works.</p>
        </div>
        <ul className="eap-priv-l" data-rs="">
          <li><Lock size={18} /><div><b>No names to HR, ever</b><span>Reports are aggregate: sessions used and broad themes only.</span></div></li>
          <li><EyeOff size={18} /><div><b>Nothing said in a session is shared</b><span>Notes stay with the psychologist and the employee.</span></div></li>
          <li><UserCheck size={18} /><div><b>Employees book themselves</b><span>No approval from a manager, no request through HR.</span></div></li>
          <li><LifeBuoy size={18} /><div><b>Clear path in a crisis</b><span>Not an emergency service — people at risk are guided to 112 or Tele-MANAS 14416 (24×7).</span></div></li>
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="eap-sec" aria-labelledby="eap-how">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">How it works</span>
          <h2 id="eap-how">Simple for employees, <em>light work for HR</em></h2>
        </div>
        <div className="eap-how">
          <div className="eap-how-col" data-r="">
            <h3><Users size={18} /> For your employees</h3>
            <ol className="eap-steps" data-rs="">
              {EMPLOYEE_STEPS.map((s, i) => <li key={s.t}><span className="n">{i + 1}</span><div><b>{s.t}</b><p>{s.d}</p></div></li>)}
            </ol>
          </div>
          <div className="eap-how-col" data-r="">
            <h3><Briefcase size={18} /> For HR — live in about a week</h3>
            <ol className="eap-steps" data-rs="">
              {HR_STEPS.map(({ icon: I, t, d }) => <li key={t}><span className="n ic"><I size={16} /></span><div><b>{t}</b><p>{d}</p></div></li>)}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Models() {
  return (
    <section className="eap-sec eap-sec-cream" aria-labelledby="eap-plans">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">Ways to work with us</span>
          <h2 id="eap-plans">Start small, <em>scale when it works</em></h2>
          <p>Pricing depends on headcount and what's covered — tell us about your team and we'll send a proposal.</p>
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

/* enquiry — same lead pipeline as before (SubmitConsultationUrl, source "Corporate Page") */
const INDUSTRIES = ["IT / Software", "BFSI", "Consulting & Professional Services", "Manufacturing", "Healthcare & Pharma", "Retail & E-commerce", "Education & EdTech", "Media & Marketing", "Startup", "Other"];
const TEAM_SIZES = ["1-50", "51-200", "201-500", "501-1,000", "1,000-5,000", "5,000+"];
const WORK_MODELS = ["Office", "Hybrid", "Remote"];
const NEEDS = ["1:1 counselling (EAP)", "Family cover", "Workshops", "Manager training", "On-site counselling days", "Critical incident support"];
const TIMELINES = ["Immediately", "Within 1 month", "1-3 months", "Just exploring"];
const EMPTY = { name: "", designation: "", email: "", phone: "", company: "", industry: "", teamSize: "", city: "", workModel: "", services: [], timeline: "", message: "" };

function Enquiry() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));
  const toggle = (s) => setForm((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s] }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name.trim() || !form.designation.trim() || !form.email.trim() || !form.company.trim() || !form.teamSize) return setError("Please fill in the required fields.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid work email.");
    if (!/^[0-9]{10}$/.test(form.phone)) return setError("Please enter a valid 10-digit phone number.");
    const services = form.services.join(", ");
    const summary = [
      `Company: ${form.company}`, `Designation: ${form.designation}`, `Industry: ${form.industry || "Not specified"}`,
      `Employees: ${form.teamSize}`, `City / Locations: ${form.city || "Not specified"}`, `Work model: ${form.workModel || "Not specified"}`,
      `Needs: ${services || "Not specified"}`, `Start timeline: ${form.timeline || "Not specified"}`,
      form.message.trim() ? `\nRequirements: ${form.message.trim()}` : "",
    ].filter(Boolean).join("\n");
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone, location: form.city.trim(),
        concern: `Corporate EAP enquiry — ${form.company} (${form.teamSize} employees)`, message: summary, source: "Corporate Page",
        company: form.company.trim(), designation: form.designation.trim(), industry: form.industry, teamSize: form.teamSize,
        workModel: form.workModel, services, timeline: form.timeline,
      });
      setSuccess("Thank you! Our team will get back to you within one working day.");
      setForm(EMPTY);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp us.");
    }
    setLoading(false);
  };

  return (
    <section className="eap-sec eap-sec-sage" id="eap-enquiry" aria-labelledby="eap-enq">
      <div className="eap-wrap eap-enq">
        <div className="eap-enq-l" data-r="">
          <span className="eap-eyebrow">Get a proposal</span>
          <h2 id="eap-enq">Tell us about your <em>team</em></h2>
          <p>We'll design an EAP around your headcount, locations and goals — with clear pricing.</p>
          <ol className="eap-next">
            <li><Clock size={18} /><div><b>Reply within one working day</b><span>From our corporate team, not a bot.</span></div></li>
            <li><Phone size={18} /><div><b>20-minute discovery call</b><span>Your workforce, locations and what you want to solve.</span></div></li>
            <li><ClipboardList size={18} /><div><b>Proposal & quote</b><span>A plan and price sized to your company.</span></div></li>
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
            <label>Designation *<input value={form.designation} onChange={set("designation")} placeholder="e.g. HR Manager" /></label>
            <label>Work email *<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
            <label>Phone *<input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit number" autoComplete="tel-national" /></label>
            <label>Company *<input value={form.company} onChange={set("company")} autoComplete="organization" /></label>
            <label>Employees *<select value={form.teamSize} onChange={set("teamSize")}><option value="">Select</option>{TEAM_SIZES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>Industry<select value={form.industry} onChange={set("industry")}><option value="">Select</option>{INDUSTRIES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>City / locations<input value={form.city} onChange={set("city")} placeholder="e.g. Noida, Bengaluru" /></label>
            <label>Work model<select value={form.workModel} onChange={set("workModel")}><option value="">Select</option>{WORK_MODELS.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>When to start<select value={form.timeline} onChange={set("timeline")}><option value="">Select</option>{TIMELINES.map((t) => <option key={t}>{t}</option>)}</select></label>
          </div>
          <div className="eap-f-l">What do you need?</div>
          <div className="eap-needs">
            {NEEDS.map((s) => <button type="button" key={s} className={form.services.includes(s) ? "on" : ""} aria-pressed={form.services.includes(s)} onClick={() => toggle(s)}>{form.services.includes(s) && <Check size={14} />}{s}</button>)}
          </div>
          <label className="eap-full">Anything else?<textarea rows={3} value={form.message} onChange={set("message")} placeholder="Goals, challenges, or questions" /></label>
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
    <section className="eap-sec" aria-labelledby="eap-faq">
      <div className="eap-wrap eap-faq">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">FAQs</span>
          <h2 id="eap-faq">Questions HR teams <em>ask us</em></h2>
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
          <h2>Give your people someone to talk to.</h2>
          <p>A confidential EAP your team can start using within a week.</p>
        </div>
        <div className="eap-ctas">
          <a href="#eap-enquiry" className="eap-btn eap-btn-gold">Get an EAP proposal <ArrowRight size={18} /></a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="eap-btn eap-btn-line">WhatsApp us</a>
        </div>
      </div>
    </section>
  );
}

export default function EapPage() {
  const stats = usePublicStats();
  const rootRef = useRef(null);
  usePageMotion(rootRef);
  return (
    <main className="eap" ref={rootRef}>
      <Hero stats={stats} />
      <Registered />
      <Why />
      <Includes />
      <Privacy />
      <HowItWorks />
      <Models />
      <Enquiry />
      <Faqs />
      <FinalCta />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </main>
  );
}

const CSS = `
.eap { --g:#166534; --g2:#1e7a4c; --gd:#173c2a; --ink:#0b1712; --gold:#a86e0e; --gold2:#e3a83a; --cream:#f8f1de; --sage:#e6f3ea; --line:#e6ece8; --soft:#4b5b53; color:var(--ink); background:#fff; }
.eap * { box-sizing:border-box; }
.eap li { margin:0; }
.eap-wrap { max-width:1180px; margin:0 auto; padding:0 16px; }
.eap h1, .eap h2, .eap h3 { color:var(--ink); letter-spacing:-.4px; }
.eap h1 em, .eap h2 em { font-style:normal; color:var(--gold); }
.eap-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; padding:14px 26px; font-weight:800; font-size:16px; text-decoration:none !important; border:2px solid transparent; transition:transform .15s ease, box-shadow .15s ease, background .15s ease; cursor:pointer; line-height:1.2; }
.eap-btn:hover { transform:translateY(-1px); }
.eap-btn-main { background:var(--g); color:#fff !important; box-shadow:0 10px 24px -12px rgba(22,101,52,.7); }
.eap-btn-main:hover { background:var(--gd); }
.eap-btn-ghost { background:#fff; color:var(--g) !important; border-color:#cfe6d3; }
.eap-btn-ghost:hover { border-color:var(--g); }
.eap-btn-gold { background:var(--gold2); color:var(--gd) !important; }
.eap-btn-line { background:transparent; color:#fff !important; border-color:rgba(255,255,255,.55); }
.eap-kicker, .eap-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12.5px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--g); }
.eap-kicker { background:#fff; border:1px solid #cfe6d3; border-radius:999px; padding:8px 16px; box-shadow:0 8px 20px -16px rgba(22,101,52,.6); }
.eap-eyebrow::before { content:""; width:26px; height:2px; background:var(--gold2); display:inline-block; }
.eap-eyebrow.light { color:#cfe6d3; }

/* hero */
.eap-hero { background:radial-gradient(circle at 92% 8%, #cfe6d3 0, transparent 38%), linear-gradient(120deg, #f8f1de 0%, #f3efdd 45%, #e6f3ea 100%); padding:56px 0 64px; overflow:hidden; }
.eap-hero-in { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr); gap:48px; align-items:center; }
.eap-hero h1 { font-size:clamp(34px,5vw,58px); line-height:1.06; font-weight:900; margin:18px 0 16px; }
.eap-lead { font-size:18px; line-height:1.6; color:var(--soft); margin:0 0 24px; max-width:560px; }
.eap-ctas { display:flex; gap:12px; flex-wrap:wrap; }
.eap-proof { list-style:none; padding:0; margin:26px 0 0; display:flex; flex-wrap:wrap; gap:10px 20px; font-size:14px; color:var(--soft); }
.eap-proof li { display:inline-flex; align-items:center; gap:6px; margin:0; line-height:1.4; }
.eap-proof svg { color:var(--gold); } .eap-proof b { color:var(--ink); }
.eap-hero { padding-bottom:0; }
.eap-hero-l { padding-bottom:64px; }
.eap-hero-in { align-items:end; }
.eap-hero-r { position:relative; display:flex; justify-content:center; align-items:flex-end; min-height:540px; }
.eap-hero-circle { position:absolute; left:54%; bottom:-120px; transform:translateX(-50%); width:min(520px,100%); aspect-ratio:1; border-radius:50%;
  background:radial-gradient(circle at 35% 30%, #2a8a58 0, #166534 55%, #173c2a 100%); box-shadow:0 0 0 14px rgba(227,168,58,.28), 0 0 0 30px rgba(227,168,58,.12); }
.eap-hero-img { position:relative; z-index:1; display:block; width:min(500px,98%); height:auto; filter:drop-shadow(0 24px 30px rgba(23,60,42,.28)); }
.eap-badge { position:absolute; z-index:2; display:flex; align-items:center; gap:10px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:10px 14px; box-shadow:0 18px 36px -22px rgba(23,60,42,.6); max-width:250px; }
.eap-badge span { width:36px; height:36px; border-radius:12px; background:var(--sage); color:var(--g); display:flex; align-items:center; justify-content:center; flex:none; }
.eap-badge b { display:block; font-size:14.5px; line-height:1.25; } .eap-badge small { display:block; font-size:12.5px; color:#6b7a72; line-height:1.3; }
.eap-badge-a { right:-6px; top:50%; }
.eap-badge-b { left:0; bottom:36px; }

/* registered */
.eap-reg { padding:26px 0; border-bottom:1px solid var(--line); background:#fff; }
.eap-reg .eap-wrap { display:flex; align-items:center; gap:24px; }
.eap-reg-l { flex:none; font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); }
.eap-reg-row { flex:1; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.eap-reg-c { display:flex; align-items:center; gap:10px; border:1px solid var(--line); border-radius:14px; padding:10px 12px; min-width:0; }
.eap-reg-c img { height:34px; width:auto; max-width:72px; object-fit:contain; flex:none; }
.eap-reg-c span { font-size:12.5px; font-weight:700; color:#3d4d44; line-height:1.3; }

/* sections */
.eap-sec { padding:88px 0; }
.eap-sec-sage { background:#f6faf7; } .eap-sec-cream { background:#fbf7ec; }
.eap-head { max-width:720px; margin:0 auto 44px; text-align:center; }
.eap-head h2 { font-size:clamp(28px,3.6vw,42px); font-weight:900; line-height:1.15; margin:12px 0 12px; }
.eap-head p { font-size:17px; color:var(--soft); margin:0; line-height:1.6; }
.eap-why { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
.eap-why-c { border:1px solid var(--line); border-radius:22px; padding:26px; background:#fff; }
.eap-why-c b { display:block; font-size:40px; font-weight:900; color:var(--g); line-height:1.05; letter-spacing:-1px; }
.eap-why-c p { font-size:16px; line-height:1.5; margin:12px 0 14px; color:#2b3a32; }
.eap-why-c { display:flex; flex-direction:column; }
.eap-why-c p { flex:1; }
.eap-src { font-size:12px; line-height:1.4; color:#6b7a72 !important; text-decoration:underline; text-decoration-color:#cfd8d3; text-underline-offset:2px; }
.eap-src:hover { color:var(--g) !important; }
.eap-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
.eap-card { background:#fff; border:1px solid var(--line); border-radius:20px; padding:22px; transition:transform .2s ease, box-shadow .2s ease; }
.eap-card:hover { transform:translateY(-3px); box-shadow:0 22px 40px -30px rgba(23,60,42,.55); }
.eap-ic { width:44px; height:44px; border-radius:14px; background:var(--sage); color:var(--g); display:inline-flex; align-items:center; justify-content:center; }
.eap-card h3 { font-size:17px; font-weight:800; margin:14px 0 6px; }
.eap-card p { font-size:14.5px; line-height:1.55; color:var(--soft); margin:0; }

/* privacy */
.eap-dark { background:radial-gradient(circle at 10% 0%, #1e7a4c 0, transparent 45%), var(--gd); color:#e6f3ea; }
.eap-dark h2 { color:#fff; font-size:clamp(28px,3.6vw,42px); font-weight:900; line-height:1.15; margin:12px 0; }
.eap-dark h2 em { color:var(--gold2); }
.eap-dark p { color:#cfe6d3; font-size:17px; }
.eap-priv { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); gap:48px; align-items:center; }
.eap-priv-l { list-style:none; margin:0; padding:0; display:grid; gap:12px; }
.eap-priv-l li { display:flex; gap:14px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:16px 18px; }
.eap-priv-l svg { color:var(--gold2); flex:none; margin-top:2px; }
.eap-priv-l b { display:block; color:#fff; font-size:16px; } .eap-priv-l span { font-size:14.5px; color:#cfe6d3; }

/* how */
.eap-how { display:grid; grid-template-columns:1fr 1fr; gap:22px; }
.eap-how-col { border:1px solid var(--line); border-radius:24px; padding:26px; background:#fff; }
.eap-how-col h3 { display:flex; align-items:center; gap:8px; font-size:18px; font-weight:800; margin:0 0 18px; color:var(--g); }
.eap-steps { list-style:none; margin:0; padding:0; display:grid; gap:16px; }
.eap-steps li { display:flex; gap:14px; position:relative; }
.eap-steps .n { width:34px; height:34px; border-radius:50%; background:var(--g); color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; flex:none; }
.eap-steps .n.ic { background:#fbf1dc; color:var(--gold); }
.eap-steps b { font-size:16px; } .eap-steps p { margin:2px 0 0; font-size:14.5px; color:var(--soft); }

/* models */
.eap-models { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; align-items:stretch; }
.eap-model { background:#fff; border:1px solid #ecdfc0; border-radius:24px; padding:26px; display:flex; flex-direction:column; }
.eap-model.feat { border:2px solid var(--g); box-shadow:0 30px 60px -40px rgba(22,101,52,.7); }
.eap-model-tag { align-self:flex-start; font-size:12px; font-weight:800; border-radius:999px; padding:4px 12px; background:#fbf1dc; color:var(--gold); }
.eap-model.feat .eap-model-tag { background:var(--g); color:#fff; }
.eap-model h3 { font-size:22px; font-weight:900; margin:14px 0 8px; }
.eap-model p { font-size:15px; line-height:1.55; color:var(--soft); margin:0 0 14px; }
.eap-model ul { list-style:none; margin:0 0 20px; padding:0; display:grid; gap:8px; flex:1; }
.eap-model li { display:flex; gap:8px; align-items:flex-start; font-size:14.5px; } .eap-model li svg { color:var(--g); flex:none; margin-top:3px; }
.eap-topics { margin-top:40px; text-align:center; }
.eap-topics h3 { font-size:18px; font-weight:800; margin:0 0 14px; }
.eap-chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.eap-chips span { background:#fff; border:1px solid #ecdfc0; border-radius:999px; padding:8px 14px; font-size:14px; font-weight:700; color:#5b4a2a; }

/* enquiry */
.eap-enq { display:grid; grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr); gap:44px; align-items:start; }
.eap-enq-l h2 { font-size:clamp(28px,3.6vw,42px); font-weight:900; margin:12px 0; line-height:1.15; }
.eap-enq-l > p { font-size:17px; color:var(--soft); }
.eap-next { list-style:none; padding:0; margin:22px 0; display:grid; gap:14px; }
.eap-next li { display:flex; gap:12px; } .eap-next svg { color:var(--g); flex:none; margin-top:2px; }
.eap-next b { display:block; font-size:15.5px; } .eap-next span { font-size:14px; color:var(--soft); }
.eap-contact { display:flex; flex-direction:column; gap:6px; border-top:1px solid var(--line); padding-top:18px; font-size:14.5px; }
.eap-contact > span:first-child { font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#8a978f; }
.eap-contact a { color:var(--g); font-weight:700; display:inline-flex; align-items:center; gap:6px; text-decoration:none; }
.eap-addr { display:inline-flex; align-items:center; gap:6px; color:var(--soft); }
.eap-form { background:#fff; border:1px solid var(--line); border-radius:24px; padding:26px; box-shadow:0 30px 60px -44px rgba(23,60,42,.6); }
.eap-f2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.eap-form label { display:flex; flex-direction:column; gap:6px; font-size:13px; font-weight:700; color:#3d4d44; }
.eap-form input, .eap-form select, .eap-form textarea { border:1.5px solid var(--line); border-radius:12px; padding:11px 13px; font:inherit; font-size:15px; font-weight:500; color:var(--ink); background:#fff; width:100%; min-width:0; }
.eap-form input, .eap-form select { height:46px; line-height:1.2; margin:0; box-shadow:none; }
.eap-form select { appearance:none; -webkit-appearance:none; padding-right:36px; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23166534' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center; }
.eap-form textarea { min-height:96px; resize:vertical; margin:0; }
.eap-form input::placeholder, .eap-form textarea::placeholder { color:#9aa8a0; font-size:14.5px; }
.eap-form input:focus, .eap-form select:focus, .eap-form textarea:focus { outline:none; border-color:var(--g); box-shadow:0 0 0 3px rgba(22,101,52,.12); }
.eap-f-l { font-size:13px; font-weight:700; color:#3d4d44; margin:18px 0 8px; }
.eap-needs { display:flex; flex-wrap:wrap; gap:8px; }
.eap-needs button { display:inline-flex; align-items:center; gap:5px; border:1.5px solid var(--line); background:#fff; border-radius:999px; padding:8px 13px; font:inherit; font-size:13.5px; font-weight:700; color:#3d4d44; cursor:pointer; }
.eap-needs button.on { background:var(--sage); border-color:var(--g); color:var(--g); }
.eap-full { margin-top:16px; }
.eap-submit { width:100%; margin-top:18px; }
.eap-submit:disabled { opacity:.6; cursor:wait; }
.eap-note { display:block; text-align:center; color:#8a978f; font-size:12.5px; margin-top:8px; }
.eap-err { background:#fdecec; color:#9b1c1c; border-radius:12px; padding:10px 12px; font-size:14px; margin-top:14px; }
.eap-ok { background:#e4f6ea; color:#16733f; border-radius:12px; padding:10px 12px; font-size:14px; margin-top:14px; font-weight:700; }

/* faq */
.eap-faq { max-width:860px; }
.eap-faq-l { display:grid; gap:10px; }
.eap-q { border:1px solid var(--line); border-radius:16px; background:#fff; }
.eap-q.on { border-color:#cfe6d3; background:#f6faf7; }
.eap-q button { width:100%; display:flex; justify-content:space-between; gap:14px; align-items:center; text-align:left; background:none; border:0; padding:16px 18px; font:inherit; font-size:16px; font-weight:800; color:var(--ink); cursor:pointer; }
.eap-q button span { color:var(--g); font-size:22px; line-height:1; flex:none; }
.eap-q p { margin:0; padding:0 18px 16px; font-size:15px; line-height:1.6; color:var(--soft); }

/* final */
.eap-final { background:linear-gradient(120deg, var(--gd), var(--g)); padding:56px 0; }
.eap-final-in { display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
.eap-final h2 { color:#fff; font-size:clamp(26px,3.2vw,36px); font-weight:900; margin:0 0 6px; }
.eap-final p { color:#cfe6d3; margin:0; font-size:16px; }

/* ===== motion & polish ===== */
@keyframes eapUp { from { opacity:0; transform:translateY(26px); } to { opacity:1; transform:none; } }
@keyframes eapIn { from { opacity:0; translate:40px 0; } to { opacity:1; translate:0 0; } }
@keyframes eapPop { from { opacity:0; scale:.82; } to { opacity:1; scale:1; } }
@keyframes eapFloat { 0%, 100% { translate:0 0; } 50% { translate:0 -9px; } }
@keyframes eapShift { from { background-position:0% 50%; } to { background-position:100% 50%; } }
@keyframes eapSpin { to { rotate:360deg; } }


/* reveal: blocks fade up; lists/grids fade up one child after another (animation fill "backwards" keeps hovers working) */
.eap-js [data-r]:not(.in), .eap-js [data-rs]:not(.in) > * { opacity:0; }
.eap-js [data-r].in { animation:eapUp .75s cubic-bezier(.2,.7,.2,1) backwards; }
.eap-js [data-rs].in > * { animation:eapUp .65s cubic-bezier(.2,.7,.2,1) backwards; }
.eap-js [data-rs].in > *:nth-child(2) { animation-delay:.08s; } .eap-js [data-rs].in > *:nth-child(3) { animation-delay:.16s; }
.eap-js [data-rs].in > *:nth-child(4) { animation-delay:.24s; } .eap-js [data-rs].in > *:nth-child(5) { animation-delay:.32s; }
.eap-js [data-rs].in > *:nth-child(6) { animation-delay:.40s; } .eap-js [data-rs].in > *:nth-child(7) { animation-delay:.48s; }
.eap-js [data-rs].in > *:nth-child(8) { animation-delay:.56s; } .eap-js [data-rs].in > *:nth-child(n+9) { animation-delay:.62s; }

/* hero: entrance + gentle parallax (--py = scrollY, set from JS) */
.eap-hero { position:relative; }
.eap-hero::before { content:""; position:absolute; width:420px; height:420px; left:-160px; top:-140px; border-radius:50%;
  background:radial-gradient(circle, rgba(227,168,58,.22) 0, transparent 65%); pointer-events:none; }
.eap-hero-l > * { animation:eapUp .8s cubic-bezier(.2,.7,.2,1) backwards; }
.eap-hero-l > *:nth-child(2) { animation-delay:.08s; } .eap-hero-l > *:nth-child(3) { animation-delay:.16s; }
.eap-hero-l > *:nth-child(4) { animation-delay:.24s; } .eap-hero-l > *:nth-child(5) { animation-delay:.32s; }
.eap-hero-l { translate:0 calc(var(--py, 0) * .10px); }
.eap-hero-circle { animation:eapPop 1s cubic-bezier(.2,.7,.2,1) .1s backwards; translate:0 calc(var(--py, 0) * .22px); }
.eap-hero-circle::after { content:""; position:absolute; inset:-34px; border-radius:50%; border:2px dashed rgba(168,110,14,.35); animation:eapSpin 60s linear infinite; }
.eap-hero-img { animation:eapIn 1s cubic-bezier(.2,.7,.2,1) .2s backwards; }
.eap-badge { animation:eapUp .7s cubic-bezier(.2,.7,.2,1) .55s backwards, eapFloat 6s ease-in-out 1.3s infinite; }
.eap-badge-b { animation-delay:.75s, 4.3s; }

/* buttons */
.eap-btn svg { transition:transform .2s ease; }
.eap-btn:hover svg { transform:translateX(4px); }
.eap-btn-main { background:linear-gradient(135deg, var(--g2), var(--g) 55%, var(--gd)); }
.eap-btn-main:hover { box-shadow:0 16px 30px -14px rgba(22,101,52,.75); }

/* registrations */
.eap-reg-c { transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.eap-reg-c img { filter:grayscale(.35); transition:filter .2s ease; }
.eap-reg-c:hover { border-color:#cfe6d3; box-shadow:0 14px 28px -22px rgba(23,60,42,.6); transform:translateY(-2px); }
.eap-reg-c:hover img { filter:none; }

/* stats */
.eap-why-c { position:relative; overflow:hidden; transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
.eap-why-c::before { content:""; position:absolute; left:0; top:0; height:4px; width:100%; background:linear-gradient(90deg, var(--g2), var(--gold2));
  transform:scaleX(.18); transform-origin:0 50%; transition:transform .45s ease; }
.eap-why-c:hover { transform:translateY(-4px); box-shadow:0 26px 44px -32px rgba(23,60,42,.6); border-color:#d9eadf; }
.eap-why-c:hover::before { transform:scaleX(1); }
.eap-why-c b { background:linear-gradient(120deg, var(--gd), var(--g2) 55%, var(--gold)); -webkit-background-clip:text; background-clip:text; color:transparent; font-variant-numeric:tabular-nums; }

/* program cards */
.eap-sec-sage { background:radial-gradient(circle at 0% 0%, #e6f3ea 0, transparent 38%), radial-gradient(circle at 100% 100%, #fbf1dc 0, transparent 34%), #f6faf7; }
.eap-sec-cream { background:radial-gradient(circle at 100% 0%, #f8ecd0 0, transparent 36%), #fbf7ec; }
.eap-card { position:relative; }
.eap-card:hover { border-color:#cfe6d3; }
.eap-ic { transition:background .25s ease, color .25s ease, transform .25s ease; }
.eap-card:hover .eap-ic { background:linear-gradient(135deg, var(--g2), var(--gd)); color:#fff; transform:rotate(-6deg) scale(1.06); }

/* privacy */
.eap-dark { position:relative; overflow:hidden; }
.eap-dark::before, .eap-dark::after { content:""; position:absolute; border-radius:50%; border:1px solid rgba(227,168,58,.25); pointer-events:none; }
.eap-dark::before { width:520px; height:520px; right:-180px; top:-200px; }
.eap-dark::after { width:340px; height:340px; right:-90px; top:-110px; border-color:rgba(227,168,58,.4); }
.eap-priv { position:relative; z-index:1; }
.eap-priv-l li { transition:background .25s ease, border-color .25s ease, transform .25s ease; }
.eap-priv-l li:hover { background:rgba(255,255,255,.1); border-color:rgba(227,168,58,.45); transform:translateX(4px); }

/* steps: a line joining the numbers */
.eap-steps li:not(:last-child)::after { content:""; position:absolute; left:16px; top:40px; bottom:-14px; width:2px; background:linear-gradient(#cfe6d3, rgba(207,230,211,0)); }
.eap-how-col { transition:box-shadow .25s ease; }
.eap-how-col:hover { box-shadow:0 26px 50px -38px rgba(23,60,42,.55); }

/* plans */
.eap-model { transition:transform .25s ease, box-shadow .25s ease; }
.eap-model:hover { transform:translateY(-5px); box-shadow:0 30px 56px -40px rgba(23,60,42,.6); }
.eap-model.feat { background:linear-gradient(180deg, #f1f9f3 0, #fff 45%); }
.eap-chips span { transition:background .2s ease, border-color .2s ease, color .2s ease; }
.eap-chips span:hover { background:#fff6e3; border-color:var(--gold2); color:var(--gd); }

/* form + faq */
.eap-form { position:relative; }
.eap-form::before { content:""; position:absolute; inset:-1px; border-radius:24px; padding:1px; background:linear-gradient(135deg, rgba(30,122,76,.35), rgba(227,168,58,.35));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
.eap-q { transition:border-color .2s ease, background .2s ease; }
.eap-q:hover { border-color:#cfe6d3; }
.eap-q p { animation:eapUp .35s ease both; }

/* final band */
.eap-final { position:relative; overflow:hidden; background:linear-gradient(120deg, var(--gd), var(--g), var(--g2), var(--gd)); background-size:300% 100%; animation:eapShift 14s ease-in-out infinite alternate; }
.eap-final::after { content:""; position:absolute; width:300px; height:300px; right:-80px; bottom:-150px; border-radius:50%; border:2px solid rgba(227,168,58,.35); pointer-events:none; }
.eap-final-in { position:relative; z-index:1; }

@media (prefers-reduced-motion: reduce) {
  .eap *, .eap *::before, .eap *::after { animation:none !important; transition:none !important; }
  .eap-hero-l, .eap-hero-circle { translate:none !important; }
}

@media (max-width:1024px) {
  .eap-grid, .eap-why { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .eap-reg .eap-wrap { flex-direction:column; align-items:stretch; }
  .eap-reg-l { text-align:center; }
}
@media (max-width:900px) {
  .eap-hero-in, .eap-priv, .eap-enq, .eap-how { grid-template-columns:minmax(0,1fr); }
  .eap-hero-l { padding-bottom:8px; }
  .eap-hero-r { min-height:0; padding-top:12px; }
  .eap-hero-img { width:min(380px,86%); }
  .eap-hero-circle { width:min(400px,94%); bottom:-90px; }
  .eap-models { grid-template-columns:minmax(0,1fr); }
  .eap-sec { padding:64px 0; }
}
@media (max-width:600px) {
  .eap-hero { padding-top:36px; }
  .eap-badge { padding:8px 10px; max-width:190px; } .eap-badge b { font-size:13px; } .eap-badge small { font-size:11.5px; } .eap-badge span { width:30px; height:30px; }
  .eap-badge-a { top:auto; bottom:96px; right:0; } .eap-badge-b { bottom:16px; }
  .eap-lead { font-size:16.5px; }
  .eap-ctas .eap-btn { flex:1 1 100%; }
  .eap-reg-row { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .eap-grid, .eap-f2, .eap-why { grid-template-columns:minmax(0,1fr); }
  .eap-form, .eap-how-col, .eap-model { padding:20px; }
  .eap-why-c b { font-size:34px; }
}
/* phones and tablets held upright: no banner photo — text, buttons and proof only */
@media (max-width:900px), (max-width:1100px) and (orientation:portrait) {
  .eap-hero { padding-bottom:48px; }
  .eap-hero-in { grid-template-columns:minmax(0,1fr); }
  .eap-hero-l { padding-bottom:0; }
  .eap-hero-r { display:none; }
}
@media (prefers-reduced-motion: reduce) { .eap-btn, .eap-card { transition:none; } }
`;
