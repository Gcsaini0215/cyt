import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Newsletter from "../components/home/newsletter";
import { SubmitConsultationUrl } from "../utils/url";
import { postData } from "../utils/actions";

const PSYCH_TYPES = [
  "Clinical Psychology", "Counselling Psychology", "Industrial & Organizational Psychology",
];
const GENERAL_TYPES = [
  "Research & Data", "Content / Social Media",
  "Administrative / Operations", "Social Media & Outreach",
];
const UG_DEGREES = new Set([
  "B.A.", "B.Sc.", "B.A. (Hons.)", "B.Sc. (Hons.)",
  "Integrated B.A./B.Sc. + M.A./M.Sc. (5-year)",
]);

const DEGREES = [
  { header: "Undergraduate" },
  "B.A.", "B.Sc.",
  "B.A. (Hons.)", "B.Sc. (Hons.)",
  "Integrated B.A./B.Sc. + M.A./M.Sc. (5-year)",
  { header: "Postgraduate" },
  "M.A.", "M.Sc.", "M.Phil.",
  { header: "Diploma & Certificate" },
  "Diploma", "PG Diploma", "Certificate",
  { header: "Doctoral" },
  "Ph.D.", "Psy.D.",
  { header: "Other" },
  "Other",
];

const SPECIALIZATIONS = [
  "General Psychology", "Applied Psychology",
  "Clinical Psychology", "Counselling Psychology",
  "Industrial / Organizational Psychology", "Educational Psychology",
  "Child Psychology", "Sports Psychology", "Forensic Psychology",
  "Health Psychology", "Neuropsychology", "Social Psychology",
  "Cognitive Psychology", "Rehabilitation Psychology", "Other",
];
const YEARS   = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester", "9th Semester", "10th Semester"];
const DURS    = ["1 Month", "2 Months", "3 Months", "6 Months"];
const HOURS   = ["30 hrs", "40 hrs", "60 hrs", "80 hrs", "100 hrs", "120 hrs", "280 hrs"];
const MODES   = ["Online", "Offline", "Hybrid"];

const PERKS = [
  { icon: "feather-award",         text: "Certificate of Internship" },
  { icon: "feather-users",         text: "Mentorship by Professionals" },
  { icon: "feather-file-text",     text: "Letter of Recommendation (exam-based)" },
  { icon: "feather-monitor",       text: "Flexible Online / Offline Options" },
  { icon: "feather-briefcase",     text: "Portfolio-Worthy Real Projects" },
  { icon: "feather-trending-up",   text: "Career Growth in Mental Health" },
];

const PROGRAM_DATA = {
  "Clinical Psychology": {
    icon: "feather-activity", color: "#228756", bg: "#f0fdf4",
    tagline: "Work alongside clinical psychologists in assessment, documentation, case analysis, and therapeutic practice.",
    duration: "1–3 Months | 30–120 hrs",
    modules: [
      { title: "Module 1: Introduction to Clinical Psychology", activities: ["Overview of clinical psychology as a discipline", "Roles & responsibilities of a clinical psychologist", "History of mental health treatment in India", "RCI registration & professional pathways"] },
      { title: "Module 2: Psychopathology & DSM-5", activities: ["Understanding major mental health disorders: anxiety, depression, OCD, PTSD", "DSM-5 diagnostic criteria & differential diagnosis", "Study of personality disorders & spectrum conditions", "Case-based learning from anonymized clinical presentations"] },
      { title: "Module 3: Psychological Assessment Tools", activities: ["Introduction to standardized tests: WAIS, BDI-II, GAD-7, PHQ-9, MMPI", "Observation of supervised intake sessions & clinical interviews", "Practice administering & scoring assessment instruments", "Interpreting test results in clinical context"] },
      { title: "Module 4: Case Conceptualization", activities: ["CBT, psychodynamic & biopsychosocial conceptualization frameworks", "Analyzing anonymized real-world case studies", "Writing structured case formulations step-by-step", "Supervisor feedback & group case discussion sessions"] },
      { title: "Module 5: Therapeutic Approaches", activities: ["Introduction to CBT, DBT, ACT & trauma-focused therapies", "Observe supervised therapy sessions (with consent)", "Understand session structure: opening, working phase, closure", "Role-play therapeutic techniques with peer feedback"] },
      { title: "Module 6: Report Writing & Documentation", activities: ["Draft psychological assessment reports in APA format", "Clinical documentation: SOAP notes, progress notes, session summaries", "Peer-review reports with senior supervisors", "Maintaining confidentiality in written records"] },
      { title: "Module 7: Crisis Intervention & Risk Assessment", activities: ["Recognizing signs of psychiatric emergencies", "Suicide risk assessment: Columbia Protocol basics", "De-escalation techniques & safety planning", "Referral pathways & emergency protocols in India"] },
      { title: "Module 8: Ethics & Professional Conduct", activities: ["RCI & APA ethical guidelines in clinical practice", "Confidentiality, informed consent & dual relationships", "Case-based ethical dilemma discussions", "Self-care & managing vicarious trauma as a clinician"] },
    ],
    outcome: "Certificate of Internship + Exposure Letter + LOR (exam-based)",
  },
  "Counselling Psychology": {
    icon: "feather-message-circle", color: "#0ea5e9", bg: "#f0f9ff",
    tagline: "Develop core counselling competencies through supervised practice, theory, and reflective learning.",
    duration: "1–3 Months | 30–120 hrs",
    modules: [
      { title: "Module 1: Foundations of Counselling", activities: ["History & evolution of counselling psychology", "Counselling vs psychotherapy vs coaching — distinctions", "Core values: empathy, unconditional positive regard, congruence", "Introduction to the therapeutic relationship & working alliance"] },
      { title: "Module 2: Counselling Theories & Approaches", activities: ["Person-Centered Therapy (Rogers) — principles & application", "Cognitive Behavioural Therapy (CBT) — thought records & behavioral experiments", "Acceptance & Commitment Therapy (ACT) — values & defusion", "Existential, Gestalt & narrative approaches overview"] },
      { title: "Module 3: Core Counselling Skills", activities: ["Active listening, minimal encouragers & silence", "Reflection of feelings, paraphrasing & summarizing", "Open-ended questioning & Socratic dialogue", "Non-verbal communication & attending behaviours"] },
      { title: "Module 4: Practical Skills Development", activities: ["Role-play counselling scenarios with structured peer feedback", "Video analysis of real counselling session recordings", "Micro-skills practice under supervisor observation", "Developing & refining a personal counselling style"] },
      { title: "Module 5: Special Populations & Presenting Issues", activities: ["Counselling adolescents, students & young adults", "Grief, loss, bereavement & adjustment disorders", "Relationship issues, family conflict & communication breakdown", "Academic pressure, burnout & life transitions"] },
      { title: "Module 6: Crisis Intervention & Mental Health First Aid", activities: ["Identifying acute distress & crisis presentations", "Suicide & self-harm: risk assessment & safety planning", "Stabilization techniques: grounding, breathing, containment", "Warm handoff referrals & emergency contact protocols"] },
      { title: "Module 7: Group Counselling & Psychoeducation", activities: ["Principles & stages of group therapy", "Facilitating psychoeducation groups on anxiety, stress & depression", "Managing group dynamics, resistance & conflict", "Designing & co-facilitating a structured group session"] },
      { title: "Module 8: Documentation, Ethics & Self-Care", activities: ["Writing SOAP notes, session summaries & treatment plans", "Progress evaluation, outcome tracking & closure planning", "APA & IPC ethical guidelines: confidentiality, consent, dual relationships", "Reflective journaling, supervision & preventing counsellor burnout"] },
    ],
    outcome: "Certificate of Internship + Exposure Letter + LOR (exam-based)",
  },
  "Industrial & Organizational Psychology": {
    icon: "feather-briefcase", color: "#f59e0b", bg: "#fffbeb",
    tagline: "Apply psychological principles to workplace well-being, productivity, and organizational behavior.",
    duration: "1–3 Months | 40–120 hrs",
    modules: [
      { title: "Module 1: Workplace Psychology Essentials", activities: ["Introduction to I/O psychology & its applications", "Employee motivation theories: Maslow, Herzberg, Self-Determination", "Workplace stress, burnout & well-being assessment", "Job satisfaction & organizational commitment models"] },
      { title: "Module 2: Employee Well-being Programs", activities: ["Design mental health awareness workshops", "Employee Assistance Program (EAP) structure & delivery", "Psychoeducation sessions for corporate teams", "Wellness initiative planning & execution"] },
      { title: "Module 3: Organizational Assessment", activities: ["Conduct organizational climate surveys", "Analyze psychometric assessment data", "Team dynamics & group process observation", "HR policy review with psychological lens"] },
      { title: "Module 4: Research & Reporting", activities: ["Write organizational psychology case reports", "Present findings & recommendations to supervisors", "Literature review on workplace mental health", "Develop evidence-based intervention proposals"] },
    ],
    outcome: "Certificate of Internship + Exposure Letter + LOR (exam-based)",
  },
  "Research & Data": {
    icon: "feather-bar-chart-2", color: "#8b5cf6", bg: "#f5f3ff",
    tagline: "Conduct clinical, counselling, and administrative research to generate insights that shape mental health practice.",
    duration: "1–6 Months | 40–280 hrs",
    modules: [
      { title: "Module 1: Research Methodology Fundamentals", activities: ["Quantitative, qualitative & mixed-methods research designs", "Hypothesis formulation & research question development", "Literature review: PubMed, Google Scholar, APA PsycINFO", "Research ethics: consent, anonymization & IRB basics"] },
      { title: "Module 2: Clinical Research", activities: ["Research on psychological assessment reliability & validity", "Study clinical outcome measures: symptom reduction, functioning", "Analyze anonymized clinical case data trends", "Contribute to clinical efficacy & intervention research"] },
      { title: "Module 3: Counselling Research", activities: ["Research on counselling session outcomes & client satisfaction", "Design & distribute counselling effectiveness surveys", "Qualitative thematic analysis of counselling session notes", "Develop counselling-specific research instruments & scales"] },
      { title: "Module 4: Administrative & Operational Research", activities: ["Platform usage metrics & user behavior data analysis", "Client retention, drop-off & appointment pattern research", "Process improvement through operational data insights", "Compile administrative research reports for leadership"] },
      { title: "Module 5: Data Collection & Management", activities: ["Design and distribute validated psychological scales (GAD-7, PHQ-9, etc.)", "Conduct structured & semi-structured research interviews", "Transcription, coding & thematic categorization of qualitative data", "Survey management, data cleaning & response quality checks"] },
      { title: "Module 6: Statistical Analysis & Interpretation", activities: ["Descriptive & inferential statistics using SPSS / Excel", "Correlation, regression & factor analysis basics", "Thematic analysis & coding for qualitative research", "Creating data visualizations, tables & research graphs"] },
      { title: "Module 7: Report Writing & Publication", activities: ["Write APA-format research papers, reports & abstracts", "Co-author research findings with senior researchers", "Present research in internal team review sessions", "Submit abstracts to psychology conferences & journals"] },
    ],
    outcome: "Certificate of Internship + Co-authorship Opportunity + LOR (exam-based)",
  },
  "Content / Social Media": {
    icon: "feather-edit-3", color: "#f43f5e", bg: "#fff1f2",
    tagline: "Create impactful mental health content that educates, destigmatizes, and engages audiences.",
    duration: "1–3 Months | 30–120 hrs",
    modules: [
      { title: "Module 1: Mental Health Content Fundamentals", activities: ["Mental health communication principles", "Stigma-free language & responsible reporting", "Audience research & tone mapping", "Content types: blogs, reels, infographics, carousels"] },
      { title: "Module 2: Content Creation & Strategy", activities: ["Write SEO-friendly blog articles on mental health topics", "Design infographics using Canva & creative tools", "Script short-form videos & reels", "Content calendar planning & scheduling"] },
      { title: "Module 3: Platform Management", activities: ["Instagram, LinkedIn & YouTube content strategy", "Community management & audience engagement", "Hashtag strategy & reach optimization", "Responding to DMs & comments professionally"] },
      { title: "Module 4: Analytics & Optimization", activities: ["Track performance using platform analytics", "A/B testing captions, visuals & posting times", "Monthly performance reports", "Iterate strategy based on data insights"] },
    ],
    outcome: "Certificate of Internship + Portfolio Building + LOR (exam-based)",
  },
  "Administrative / Operations": {
    icon: "feather-settings", color: "#64748b", bg: "#f8fafc",
    tagline: "Support the backbone of a mental health platform — operations, coordination, and quality assurance.",
    duration: "1–3 Months | 30–120 hrs",
    modules: [
      { title: "Module 1: Platform & Operations Overview", activities: ["Understand platform workflows & SOP documentation", "Client onboarding process & therapist coordination", "Scheduling systems & appointment management", "Introduction to CRM tools & databases"] },
      { title: "Module 2: Client Coordination", activities: ["Handle client queries via email & messaging", "Escalation protocols & complaint resolution", "Feedback collection & NPS tracking", "Maintain client records & session logs"] },
      { title: "Module 3: Quality Assurance", activities: ["Review platform listings for accuracy & completeness", "Audit session feedback & therapist ratings", "Draft quality reports & improvement proposals", "Assist in onboarding & verification of new therapists"] },
      { title: "Module 4: Process Documentation", activities: ["Write SOPs for recurring operational tasks", "Create training guides for new team members", "Map and optimize existing workflows", "Contribute to team knowledge base"] },
    ],
    outcome: "Certificate of Internship + Exposure Letter + LOR (exam-based)",
  },
  "Social Media & Outreach": {
    icon: "feather-globe", color: "#06b6d4", bg: "#ecfeff",
    tagline: "Drive awareness campaigns and build community around mental health advocacy and outreach.",
    duration: "1–3 Months | 30–120 hrs",
    modules: [
      { title: "Module 1: Digital Outreach Strategy", activities: ["Mental health awareness campaign planning", "Target audience identification & persona building", "Platform selection & channel strategy", "Partnership & collaboration outreach"] },
      { title: "Module 2: Campaign Execution", activities: ["Launch & manage awareness campaigns", "Coordinate with content & design teams", "Organize online events, webinars & live sessions", "Influencer & community leader collaboration"] },
      { title: "Module 3: Community Building", activities: ["Grow & engage mental health support communities", "Moderate online groups & safe spaces", "User-generated content campaigns", "Ambassador & volunteer program support"] },
      { title: "Module 4: Impact Measurement", activities: ["Track reach, impressions & engagement metrics", "Campaign performance reports", "Community sentiment analysis", "End-of-internship impact presentation"] },
    ],
    outcome: "Certificate of Internship + Portfolio Building + LOR (exam-based)",
  },
};

const EMPTY = {
  name: "", email: "", phone: "", city: "", gender: "", dob: "",
  college: "", degree: "", specialization: "", year: "",
  internType: [], mode: "", duration: "", hours: "", availableFrom: "",
  motivation: "", resumeFile: null, collegeId: null, passportPhoto: null, agreeTerms: false,
};

function validate(f) {
  if (!f.name.trim() || f.name.trim().length < 3)         return "Enter your full name (min 3 chars)";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))       return "Enter a valid email address";
  if (!/^\d{10}$/.test(f.phone))                           return "Enter a valid 10-digit phone number";
  if (!f.city.trim())                                      return "Enter your city";
  if (!f.college.trim())                                   return "Enter your college / university name";
  if (!f.degree)                                           return "Select your degree";
  if (!UG_DEGREES.has(f.degree) && !f.specialization)     return "Select your specialization";
  if (!f.year)                                             return "Select your current year";
  if (!f.internType || f.internType.length === 0)          return "Select at least one internship type";
  if (!f.mode)                                             return "Select preferred mode";
  if (!f.duration)                                         return "Select preferred duration";
  if (!f.hours)                                            return "Select required hours";
  if (!f.availableFrom)                                    return "Select your available start date";
  if (!f.motivation.trim() || f.motivation.trim().length < 50)
                                                           return "Write at least 50 characters for motivation";
  if (!f.agreeTerms)                                       return "Please agree to the terms and conditions";
  return null;
}

function WelcomeModal({ onClose }) {
  const [mob, setMob] = React.useState(false);

  React.useEffect(() => {
    const check = () => setMob(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", check);
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const points = [
    { icon: "feather-users", title: "Learn From Professionals", desc: "A qualified supervisor guides every step — reviewing your cases, reports, and skill development." },
    { icon: "feather-trending-up", title: "Accelerated Growth", desc: "Real feedback on real work builds confidence and clinical judgment 3x faster." },
    { icon: "feather-file-text", title: "Documented & Verifiable", desc: "Certificate and LOR backed by supervised proof of work — not just attendance." },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(5,10,20,0.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: mob ? "12px" : "20px", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0f172a", borderRadius: mob ? 16 : 22,
        width: "100%", maxWidth: mob ? "100%" : 820,
        maxHeight: mob ? "92vh" : "88vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", position: "relative",
      }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "rgba(255,255,255,0.1)", border: "none", width: 32, height: 32, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="feather-x" style={{ fontSize: 15, color: "#fff" }}></i>
        </button>

        <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: mob ? "column" : "row" }}>

          {/* Image Panel — full width banner on mobile, side panel on desktop */}
          {mob ? (
            <div style={{ position: "relative", height: 130, flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
                alt="Supervised internship"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.85) 100%)" }} />
              <div style={{ position: "absolute", bottom: 14, left: 16, right: 48 }}>
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, lineHeight: 1.5, margin: 0, fontStyle: "italic", opacity: 0.9 }}>
                  "Supervision is the compass that turns learning into mastery."
                </p>
              </div>
            </div>
          ) : (
            <div style={{ width: "38%", flexShrink: 0, position: "relative", display: "flex" }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
                alt="Supervised internship"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.8) 100%)" }} />
              <div style={{ position: "absolute", bottom: 28, left: 20, right: 20 }}>
                <i className="feather-message-square" style={{ fontSize: 20, color: "#4ade80", display: "block", marginBottom: 10 }}></i>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                  "Supervision is the compass that turns learning into mastery."
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: mob ? "18px 16px 16px" : "32px 28px 28px", WebkitOverflowScrolling: "touch" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", padding: "3px 10px", borderRadius: 20, display: "inline-block", marginBottom: 10 }}>
              Before You Apply — Read This
            </span>

            <h2 style={{ color: "#fff", fontSize: mob ? 17 : 20, fontWeight: 900, lineHeight: 1.3, marginBottom: 6 }}>
              What is a Supervised Internship?
            </h2>
            {!mob && (
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                A supervised internship is not just a certificate program — it's a structured, mentor-led journey where every task you do is guided, reviewed, and validated by a professional.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: mob ? 10 : 16, marginBottom: mob ? 16 : 26, marginTop: mob ? 10 : 0 }}>
              {points.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: mob ? 30 : 36, height: mob ? 30 : 36, borderRadius: 9, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={p.icon} style={{ fontSize: mob ? 13 : 15, color: "#4ade80" }}></i>
                  </div>
                  <div>
                    <p style={{ color: "#fff", fontSize: mob ? 12 : 13, fontWeight: 700, margin: "0 0 2px" }}>{p.title}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: mob ? 11 : 12, lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: mob ? "11px" : "12px", borderRadius: 10, background: "linear-gradient(135deg,#1b5e20,#228756)", color: "#fff", border: "none", fontSize: mob ? 13 : 13, fontWeight: 800, cursor: "pointer" }}>
                Apply Now <i className="feather-arrow-right" style={{ marginLeft: 4 }}></i>
              </button>
              <button onClick={onClose} style={{ padding: mob ? "11px 14px" : "12px 18px", borderRadius: 10, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgramModal({ domain, onClose }) {
  const data = PROGRAM_DATA[domain];
  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);
  if (!data) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 660, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${data.color}22, ${data.color}10)`, borderBottom: `2px solid ${data.color}20`, padding: "22px 26px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: data.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={data.icon} style={{ fontSize: 20, color: "#fff" }}></i>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1e293b", marginBottom: 3 }}>{domain}</h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: data.color, background: data.bg, padding: "2px 10px", borderRadius: 20 }}>{data.duration}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="feather-x" style={{ fontSize: 16, color: "#64748b" }}></i>
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{data.tagline}</p>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "24px 26px 28px", flex: 1, WebkitOverflowScrolling: "touch" }}>
          {data.modules.map((mod, i) => (
            <div key={i} style={{ marginBottom: 20, background: "#fafafa", border: "1.5px solid #f1f5f9", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: `${data.color}12`, borderBottom: `1.5px solid ${data.color}20`, padding: "11px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: data.color, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{mod.title}</span>
              </div>
              <ul style={{ margin: 0, padding: "12px 16px 12px 36px", listStyle: "none" }}>
                {mod.activities.map((act, j) => (
                  <li key={j} style={{ fontSize: 13, color: "#475569", marginBottom: 7, lineHeight: 1.5, position: "relative" }}>
                    <span style={{ position: "absolute", left: -18, top: 6, width: 5, height: 5, borderRadius: "50%", background: data.color, display: "inline-block" }}></span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Outcome */}
          <div style={{ background: "#1e293b", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <i className="feather-award" style={{ fontSize: 22, color: "#fbbf24", flexShrink: 0 }}></i>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Program Outcome</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{data.outcome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(p => !p)} style={{
        width: "100%", background: "#fff", border: `1.5px solid ${open ? "#228756" : "#e2e8f0"}`,
        borderRadius: 10, padding: "11px 14px", fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        textAlign: "left", fontFamily: "inherit", outline: "none",
        boxShadow: open ? "0 0 0 3px rgba(34,135,86,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}>
        <span style={{ color: value ? "#1e293b" : "#94a3b8", fontWeight: value ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || placeholder}
        </span>
        <i className="feather-chevron-down" style={{ fontSize: 14, color: "#94a3b8", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 300,
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,0.10)", overflow: "hidden", maxHeight: 220, overflowY: "auto",
        }}>
          {options.map((opt, i) => {
            if (opt && typeof opt === "object" && opt.header) {
              return (
                <div key={`h${i}`} style={{
                  padding: "8px 14px 4px", fontSize: 10, fontWeight: 800,
                  color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px",
                  borderTop: i > 0 ? "1px solid #f1f5f9" : "none", background: "#fafafa",
                }}>
                  {opt.header}
                </div>
              );
            }
            return (
              <div key={opt} onMouseDown={() => { onChange(opt); setOpen(false); }} style={{
                padding: "9px 14px 9px 18px", cursor: "pointer", fontSize: 13,
                fontWeight: value === opt ? 700 : 400,
                color: value === opt ? "#228756" : "#374151",
                background: value === opt ? "#f0fdf4" : "transparent",
                borderBottom: i < options.length - 1 ? "1px solid #f8fafc" : "none",
              }}>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SuccessScreen({ name, internType }) {
  const types = Array.isArray(internType) ? internType.join(", ") : internType;
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#2ecc71)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <i className="feather-check" style={{ fontSize: 36, color: "#fff" }}></i>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>
          Application Submitted
        </h2>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.8, marginBottom: 28, wordSpacing: "0.5px" }}>
          Thank you, <strong>{name}</strong>. Your application for{" "}
          <strong>{types}</strong> internship has been received.{" "}
          Our team will review it and reach out within{" "}
          <strong>3–5 business days</strong> on your registered email and phone.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", borderRadius: 12,
            background: "linear-gradient(135deg,#1b5e20,#228756)",
            color: "#fff", fontWeight: 700, fontSize: 14,
            boxShadow: "0 4px 14px rgba(34,135,86,0.25)",
          }}>
            <i className="feather-home"></i> Go to Home
          </Link>
          <Link href="/intern-login" style={{
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 24px", borderRadius: 12,
            border: "1.5px solid #228756", color: "#228756", fontWeight: 700, fontSize: 14,
          }}>
            <i className="feather-log-in"></i> Intern Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const DRAFT_KEY = "cyt_internship_draft";

function saveDraft(f) {
  try {
    const serializable = { ...f };
    delete serializable.resumeFile;
    delete serializable.collegeId;
    delete serializable.passportPhoto;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable));
  } catch (_) {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

export default function InternshipRegistration() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalDomain, setModalDomain] = useState(null);
  const [welcomeModal, setWelcomeModal] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setForm(p => ({ ...p, ...draft }));
    const t = setTimeout(() => setWelcomeModal(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 992);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleReview = (e) => {
    e.preventDefault();
    setError("");
    const err = validate(form);
    if (err) { setError(err); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    saveDraft(form);
    setDraftSaved(true);
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await Promise.allSettled([
        postData(SubmitConsultationUrl, {
          name:    form.name,
          email:   form.email,
          phone:   form.phone,
          message: `[INTERNSHIP APPLICATION]\nType: ${form.internType.join(", ")}\nCollege: ${form.college} | Degree: ${form.degree} (${form.year})\nSpecialization: ${form.specialization}\nCity: ${form.city}\nMode: ${form.mode} | Duration: ${form.duration} | Hours: ${form.hours} | Start: ${form.availableFrom}\nMotivation: ${form.motivation}`,
          type: "internship",
        }),
        fetch("/api/send-internship-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:           form.name,
            email:          form.email,
            phone:          form.phone,
            city:           form.city,
            college:        form.college,
            degree:         form.degree,
            specialization: form.specialization,
            internType:     form.internType,
            mode:           form.mode,
            duration:       form.duration,
            hours:          form.hours,
            availableFrom:  form.availableFrom,
            motivation:     form.motivation,
          }),
        }),
      ]);
    } finally {
      setLoading(false);
      setSubmitted(true);
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    }
  };

  const inputStyle = {
    width: "100%", background: "#fff", border: "1.5px solid #e2e8f0",
    borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b",
    outline: "none", transition: "border-color 0.2s",
    fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" };
  const sectionHead = { fontSize: 15, fontWeight: 800, color: "#1b5e20", marginBottom: 18, paddingBottom: 10, borderBottom: "2px solid #f0fdf4", display: "flex", alignItems: "center", gap: 8 };
  const fieldWrap = { marginBottom: 18 };
  const gridTwo   = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 18px" };
  const gridThree = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "0 18px" };

  return (
    <>
      <Head>
        <title>Internship Registration | Choose Your Therapist</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Apply for internship at Choose Your Therapist. Gain hands-on experience in clinical psychology, counselling, research, content, and more." />
        <link rel="canonical" href="https://chooseyourtherapist.in/internship-registration" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        input:focus, select:focus, textarea:focus { border-color: #228756 !important; box-shadow: 0 0 0 3px rgba(34,135,86,0.08) !important; }
        .intern-input:focus { border-color: #228756 !important; }
        input[type="date"] { -webkit-appearance: none; appearance: none; }
        @media (max-width: 640px) { input[type="date"] { font-size: 13px !important; padding: 10px 10px !important; min-height: unset !important; } }
        .req { color: #ef4444; }
        .section-card { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 18px; padding: 24px 26px; margin-bottom: 22px; }
        @media (max-width: 991px) { .section-card { padding: 18px 16px; } }
        .submit-btn { background: linear-gradient(135deg, #1b5e20, #228756); color: #fff; border: none; borderRadius: 12px; padding: 14px 40px; fontSize: 15px; fontWeight: 800; cursor: pointer; width: 100%; letterSpacing: 0.3px; transition: opacity 0.2s; }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      ` }} />

      <MyNavbar />

      {/* ── HERO BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #071a0e 0%, #0d3320 45%, #1b5e20 100%)",
        paddingTop: isMobile ? "95px" : "110px",
        paddingBottom: isMobile ? "70px" : "96px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* dot-grid pattern */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        {/* glow orbs */}
        <div style={{ position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(46,204,113,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 20, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,204,113,0.06)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>

          {/* badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,204,113,0.18)", border: "1px solid rgba(46,204,113,0.3)", color: "#6ee7a0", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 13px", borderRadius: 20, marginBottom: 18 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2ecc71", display: "inline-block", animation: "pulse 2s infinite" }}></span>
            Applications Open — 2025
          </div>

          <h1 style={{ color: "#fff", fontSize: isMobile ? 26 : 40, fontWeight: 900, lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.5px" }}>
            Launch Your Career<br />
            <span style={{ color: "#6ee7a0" }}>in Mental Health</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.62)", fontSize: isMobile ? 13 : 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 520, margin: "0 auto 28px" }}>
            Join the Choose Your Therapist Internship Program. Work with licensed therapists, contribute to real projects, and build skills that matter in the mental health space.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="#apply-form" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#2ecc71", color: "#071a0e", textDecoration: "none", borderRadius: 10, padding: "11px 28px", fontSize: 13, fontWeight: 800, boxShadow: "0 4px 18px rgba(46,204,113,0.3)" }}>
              <i className="feather-edit-3"></i> Apply Now
            </a>
            <Link href="/intern-login" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", textDecoration: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.18)" }}>
              <i className="feather-log-in"></i> Intern Login
            </Link>
          </div>
        </div>

        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}`}</style>

        {/* concave bottom — white dome cuts into banner */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: isMobile ? 50 : 64,
          background: "#fff",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
          pointerEvents: "none",
        }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div id="apply-form" className="container" style={{ padding: isMobile ? "32px 16px" : "48px 24px" }}>
        {submitted ? (
          <SuccessScreen name={form.name} internType={form.internType} />
        ) : (
        <div style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>

          {/* LEFT SIDEBAR — hidden on mobile */}
          {!isMobile && (
            <div style={{ width: 300, flexShrink: 0, position: "sticky", top: 90 }}>
              {/* Perks card */}
              <div id="why-join" style={{ background: "linear-gradient(160deg, #1e293b, #334155)", borderRadius: 20, padding: "24px 22px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 18, position: "relative" }}>Why Join Us?</h3>
                {PERKS.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14, position: "relative" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={p.icon} style={{ fontSize: 14, color: "#94a3b8" }}></i>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500, lineHeight: 1.5, paddingTop: 6 }}>{p.text}</span>
                  </div>
                ))}
              </div>

              {/* Domains */}
              <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 20, padding: "20px 22px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Internship Domains</h4>
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>click to explore</span>
                </div>
                {[...PSYCH_TYPES, ...GENERAL_TYPES].map((t, i) => (
                  <div key={i} onClick={() => setModalDomain(t)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6, fontSize: 12, color: PROGRAM_DATA[t] ? "#1e293b" : "#475569", fontWeight: 600, padding: "7px 10px", borderRadius: 8, cursor: PROGRAM_DATA[t] ? "pointer" : "default", background: "#fafafa", border: "1px solid #f1f5f9", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (PROGRAM_DATA[t]) e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: PROGRAM_DATA[t] ? (PROGRAM_DATA[t].color) : "#228756", flexShrink: 0 }}></span>
                      {t}
                    </div>
                    {PROGRAM_DATA[t] && <i className="feather-chevron-right" style={{ fontSize: 12, color: "#94a3b8" }}></i>}
                  </div>
                ))}
              </div>

              {/* Already applied */}
              <div style={{ background: "#1e293b", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 12 }}>Already applied?</p>
                <Link href="/intern-login" style={{ display: "block", background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.15)" }}>
                  <i className="feather-log-in" style={{ marginRight: 6 }}></i> Intern Login
                </Link>
              </div>
            </div>
          )}

          {/* RIGHT FORM */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {reviewing ? (
              /* ── REVIEW SCREEN ── */
              <div>
                <div style={{ marginBottom: 4 }}>
                  <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#1e293b", margin: "0 0 4px" }}>Review Your Application</h2>
                  {draftSaved && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#228756", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <i className="feather-save" style={{ fontSize: 11 }}></i> Draft Saved
                    </span>
                  )}
                </div>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Please review all details before submitting.</p>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                    <i className="feather-alert-circle"></i> {error}
                  </div>
                )}

                {/* Personal */}
                {[
                  { title: "Personal Information", icon: "feather-user", color: "#228756", rows: [
                    ["Full Name", form.name, true], ["Email", form.email, true],
                    ["Phone", form.phone, true], ["City", form.city, false],
                    ["Gender", form.gender || "—", false], ["Date of Birth", form.dob || "—", false],
                  ]},
                  { title: "Academic Information", icon: "feather-book", color: "#0ea5e9", rows: [
                    ["College / Institute", form.college, true], ["Degree", form.degree, false],
                    ["Specialization", form.specialization || "—", false], ["Current Semester", form.year, false],
                  ]},
                  { title: "Internship Preferences", icon: "feather-settings", color: "#8b5cf6", rows: [
                    ["Internship Types", form.internType.join(", "), true],
                    ["Mode", form.mode, false], ["Duration", form.duration, false],
                    ["Required Hours", form.hours, false], ["Start From", form.availableFrom, false],
                  ]},
                ].map((section, si) => (
                  <div key={si} className="section-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: section.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={section.icon} style={{ fontSize: 13, color: section.color }}></i>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{section.title}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 24px" }}>
                      {section.rows.map(([label, val, bold], ri) => (
                        <div key={ri}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "3px 0 0", wordBreak: "break-word", lineHeight: 1.5 }}>{val || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Uploads */}
                <div className="section-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-upload-cloud" style={{ fontSize: 13, color: "#f59e0b" }}></i>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Uploads</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, alignItems: "flex-start" }}>
                    {/* Passport photo preview */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {form.passportPhoto ? (
                        <img src={URL.createObjectURL(form.passportPhoto)} alt="Passport"
                          style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: "1.5px solid #e2e8f0" }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: 10, background: "#f8fafc", border: "1.5px dashed #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="feather-camera" style={{ fontSize: 22, color: "#cbd5e1" }}></i>
                        </div>
                      )}
                      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Passport Photo</span>
                    </div>
                    {/* File names */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { label: "CV / Resume", file: form.resumeFile, icon: "feather-file-text" },
                        { label: "College ID", file: form.collegeId, icon: "feather-credit-card" },
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
                </div>

                {/* Motivation */}
                <div className="section-card" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Motivation</p>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, margin: 0, wordBreak: "break-word", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>{form.motivation}</p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => { setReviewing(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{ flex: 1, minWidth: 120, padding: "14px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="feather-edit-2"></i> Edit Details
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    style={{ flex: 2, minWidth: 180, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1b5e20,#228756)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {loading
                      ? <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span> Submitting...</>
                      : <><i className="feather-send"></i> Confirm & Submit</>}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReview} noValidate>
                <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#1e293b", marginBottom: 6 }}>Apply for Internship</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
                  Fill in the details below. Fields marked <span className="req">*</span> are required.
                </p>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                    <i className="feather-alert-circle"></i> {error}
                  </div>
                )}

                {/* ── Section 1: Personal ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-user" style={{ fontSize: 14, color: "#228756" }}></i>
                    </div>
                    Personal Information
                  </div>

                  <div style={gridTwo}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Full Name <span className="req">*</span></label>
                      <input className="intern-input" style={inputStyle} type="text" placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Email Address <span className="req">*</span></label>
                      <input className="intern-input" style={inputStyle} type="email" placeholder="you@example.com"
                        value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                  </div>

                  <div style={gridTwo}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Phone Number <span className="req">*</span></label>
                      <input className="intern-input" style={inputStyle} type="tel" placeholder="10-digit number" maxLength={10} value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>City <span className="req">*</span></label>
                      <input className="intern-input" style={inputStyle} type="text" placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} />
                    </div>
                  </div>

                  <div style={gridTwo}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Gender</label>
                      <CustomSelect value={form.gender} onChange={v => set("gender", v)} placeholder="Select gender" options={["Male", "Female", "Non-binary", "Other"]} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Date of Birth</label>
                      <input className="intern-input" style={inputStyle} type="date" value={form.dob} onChange={e => set("dob", e.target.value)} max={new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Academic ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-book" style={{ fontSize: 14, color: "#0ea5e9" }}></i>
                    </div>
                    Academic Information
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>College / University / Institute <span className="req">*</span></label>
                    <input className="intern-input" style={inputStyle} type="text" placeholder="College / University name" value={form.college} onChange={e => set("college", e.target.value)} />
                  </div>

                  <div style={gridThree}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Degree <span className="req">*</span></label>
                      <CustomSelect value={form.degree} onChange={v => set("degree", v)} placeholder="Select degree" options={DEGREES} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>
                        Specialization{" "}
                        {UG_DEGREES.has(form.degree)
                          ? <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>(optional)</span>
                          : <span className="req">*</span>}
                      </label>
                      <CustomSelect value={form.specialization} onChange={v => set("specialization", v)} placeholder="Select specialization" options={SPECIALIZATIONS} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Current Semester <span className="req">*</span></label>
                      <CustomSelect value={form.year} onChange={v => set("year", v)} placeholder="Select semester" options={YEARS} />
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Preferences ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-settings" style={{ fontSize: 14, color: "#8b5cf6" }}></i>
                    </div>
                    Internship Preferences
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>
                      Internship Type <span className="req">*</span>
                      <span style={{ fontWeight: 500, color: "#94a3b8", marginLeft: 6, fontSize: 11 }}>(multiple select allowed)</span>
                    </label>

                    {/* Psychology-related */}
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                      Psychology-Related
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {PSYCH_TYPES.map(t => {
                        const checked = form.internType.includes(t);
                        return (
                          <label key={t} style={{
                            display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                            borderRadius: 9, cursor: "pointer", userSelect: "none",
                            border: `1.5px solid ${checked ? "#228756" : "#e2e8f0"}`,
                            background: checked ? "#f0fdf4" : "#fff",
                            transition: "all 0.15s",
                          }}>
                            <span style={{
                              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                              border: `2px solid ${checked ? "#228756" : "#cbd5e1"}`,
                              background: checked ? "#228756" : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}>
                              {checked && <i className="feather-check" style={{ fontSize: 10, color: "#fff" }}></i>}
                            </span>
                            <input type="checkbox" checked={checked} style={{ display: "none" }}
                              onChange={() => {
                                const next = checked
                                  ? form.internType.filter(x => x !== t)
                                  : [...form.internType, t];
                                const hasPsych = next.some(x => PSYCH_TYPES.includes(x));
                                const withResearch = hasPsych && !next.includes("Research & Data")
                                  ? [...next, "Research & Data"] : next;
                                set("internType", withResearch);
                              }} />
                            <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "#166534" : "#475569", lineHeight: 1.3 }}>{t}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* General */}
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                      General Support
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
                      {GENERAL_TYPES.map(t => {
                        const isResearch = t === "Research & Data";
                        const locked = isResearch && form.internType.some(x => PSYCH_TYPES.includes(x));
                        const checked = form.internType.includes(t) || locked;
                        return (
                          <label key={t} style={{
                            display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                            borderRadius: 9, cursor: locked ? "not-allowed" : "pointer", userSelect: "none",
                            border: `1.5px solid ${checked ? (locked ? "#86efac" : "#228756") : "#e2e8f0"}`,
                            background: checked ? (locked ? "#f0fdf4" : "#f0fdf4") : "#fff",
                            opacity: locked ? 0.85 : 1,
                            transition: "all 0.15s",
                          }}>
                            <span style={{
                              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                              border: `2px solid ${checked ? (locked ? "#4ade80" : "#228756") : "#cbd5e1"}`,
                              background: checked ? (locked ? "#4ade80" : "#228756") : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}>
                              {checked && <i className="feather-check" style={{ fontSize: 10, color: "#fff" }}></i>}
                            </span>
                            <input type="checkbox" checked={checked} disabled={locked} style={{ display: "none" }}
                              onChange={() => {
                                if (locked) return;
                                const next = checked
                                  ? form.internType.filter(x => x !== t)
                                  : [...form.internType, t];
                                set("internType", next);
                              }} />
                            <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "#166534" : "#475569", lineHeight: 1.3 }}>
                              {t}
                              {locked && <span style={{ display: "block", fontSize: 9, color: "#16a34a", fontWeight: 600, marginTop: 1 }}>Auto-required</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={gridThree}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Preferred Mode <span className="req">*</span></label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {MODES.map(m => (
                          <button type="button" key={m} onClick={() => set("mode", m)}
                            style={{
                              flex: 1, padding: "9px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                              border: `1.5px solid ${form.mode === m ? "#228756" : "#e2e8f0"}`,
                              background: form.mode === m ? "#f0fdf4" : "#fff",
                              color: form.mode === m ? "#166534" : "#64748b",
                              transition: "all 0.15s",
                            }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Duration <span className="req">*</span></label>
                      <CustomSelect value={form.duration} onChange={v => set("duration", v)} placeholder="Select duration" options={DURS} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Required Hours <span className="req">*</span></label>
                      <CustomSelect value={form.hours} onChange={v => set("hours", v)} placeholder="Select hours" options={HOURS} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Start From <span className="req">*</span></label>
                      <input className="intern-input" style={inputStyle} type="date" value={form.availableFrom} onChange={e => set("availableFrom", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* ── Section 4: About ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-edit-2" style={{ fontSize: 14, color: "#f59e0b" }}></i>
                    </div>
                    Tell Us About Yourself
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>
                      Why do you want to intern with us? <span className="req">*</span>
                      <span style={{ fontWeight: 500, color: "#94a3b8", marginLeft: 6 }}>(min 50 chars)</span>
                    </label>
                    <textarea className="intern-input" style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
                      placeholder="Tell us your motivation, goals, and what you hope to learn..."
                      maxLength={500} value={form.motivation}
                      onChange={e => set("motivation", e.target.value)} />
                    <span style={{ fontSize: 11, color: "#94a3b8", display: "block", textAlign: "right", marginTop: 4 }}>{form.motivation.length}/500</span>
                  </div>


                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
                    {[
                      { id: "resumeInput",   key: "resumeFile",  label: "CV / Resume",        hint: "PDF, DOC — max 5MB", accept: ".pdf,.doc,.docx", icon: "feather-file-text",  color: "#228756", bg: "#f0fdf4" },
                      { id: "collegeIdInput",key: "collegeId",   label: "College ID Card",     hint: "JPG, PNG, PDF — max 5MB", accept: ".jpg,.jpeg,.png,.pdf", icon: "feather-credit-card", color: "#0ea5e9", bg: "#f0f9ff" },
                      { id: "photoInput",    key: "passportPhoto",label: "Passport Size Photo", hint: "JPG, PNG — max 2MB", accept: ".jpg,.jpeg,.png", icon: "feather-camera", color: "#8b5cf6", bg: "#f5f3ff" },
                    ].map(({ id, key, label, hint, accept, icon, color, bg }) => (
                      <div key={id}>
                        <label style={{ ...labelStyle, marginBottom: 8 }}>{label}</label>
                        <div
                          onClick={() => document.getElementById(id).click()}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = color; }}
                          onDragLeave={e => { e.currentTarget.style.borderColor = form[key] ? color : "#e2e8f0"; }}
                          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) set(key, f); e.currentTarget.style.borderColor = color; }}
                          style={{
                            border: `2px dashed ${form[key] ? color : "#e2e8f0"}`,
                            borderRadius: 12, padding: "18px 12px", textAlign: "center",
                            background: form[key] ? bg : "#fafafa", cursor: "pointer",
                            transition: "all 0.2s", minHeight: 110,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                          }}>
                          <input id={id} type="file" accept={accept} style={{ display: "none" }}
                            onChange={e => set(key, e.target.files?.[0] || null)} />
                          <i className={icon} style={{ fontSize: 24, color: form[key] ? color : "#94a3b8" }}></i>
                          <span style={{ fontSize: 12, fontWeight: 700, color: form[key] ? color : "#64748b", wordBreak: "break-all", padding: "0 4px" }}>
                            {form[key] ? `✓ ${form[key].name}` : "Click or drag & drop"}
                          </span>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{hint}</span>
                        </div>
                        {form[key] && (
                          <button type="button" onClick={() => set(key, null)}
                            style={{ marginTop: 4, background: "none", border: "none", fontSize: 11, color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Terms */}
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginTop: 4, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${form.agreeTerms ? "#86efac" : "#e2e8f0"}`, background: form.agreeTerms ? "#f0fdf4" : "#fafafa", transition: "all 0.2s" }}>
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => set("agreeTerms", e.target.checked)} style={{ display: "none" }} />
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${form.agreeTerms ? "#228756" : "#cbd5e1"}`, background: form.agreeTerms ? "#228756" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                      {form.agreeTerms && <i className="feather-check" style={{ fontSize: 12, color: "#fff" }}></i>}
                    </div>
                    <span style={{ fontSize: 12, color: form.agreeTerms ? "#166534" : "#475569", lineHeight: 1.7, fontWeight: form.agreeTerms ? 600 : 400 }}>
                      I agree to the{" "}
                      <Link href="/terms-conditions" style={{ color: "#228756", fontWeight: 700 }}>Terms & Conditions</Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" style={{ color: "#228756", fontWeight: 700 }}>Privacy Policy</Link>.
                      I confirm that all information provided is accurate and complete.
                    </span>
                  </label>
                </div>

                {/* Mobile login link */}
                {isMobile && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                    Already applied?{" "}
                    <Link href="/intern-login" style={{ color: "#228756", fontWeight: 700 }}>Intern Login →</Link>
                  </p>
                )}

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", background: "linear-gradient(135deg, #1b5e20, #228756)",
                    color: "#fff", border: "none", borderRadius: 12, padding: "15px 40px",
                    fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1, letterSpacing: "0.3px", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 10,
                  }}>
                  {loading ? (
                    <>
                      <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <i className="feather-save"></i> Save & Next
                    </>
                  )}
                </button>
                <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
              </form>
            )}
          </div>
        </div>
        )}
      </div>

      <Newsletter />
      <Footer />

      {modalDomain && <ProgramModal domain={modalDomain} onClose={() => setModalDomain(null)} />}
      {welcomeModal && <WelcomeModal onClose={() => setWelcomeModal(false)} />}
    </>
  );
}
