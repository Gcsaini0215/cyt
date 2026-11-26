import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { apiUrl } from "../utils/url";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import WorkOutlineRounded from "@mui/icons-material/WorkOutlineRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";

/* /careers — open jobs (set up in admin → Settings → Careers) and an apply form with a resume.
   Applications land in admin → Settings → Careers → Applications. */

const SITE = "https://www.chooseyourtherapist.in";
const PAGE_URL = `${SITE}/careers`;
const SEO_TITLE = "Careers at Choose Your Therapist – Jobs in Marketing & Psychology";
const SEO_DESC = "Join Choose Your Therapist. Open roles in marketing, content and psychology — online and at our Noida centre. Apply in a few minutes with your resume.";
const EXPERIENCE = ["Fresher", "Less than 1 year", "1–2 years", "3–5 years", "5+ years"];
const NOTICE = ["Can join now", "15 days", "30 days", "60 days or more"];
const MAX_MB = 5;

const WHY = [
  { icon: <FavoriteRounded />, title: "Work that matters", text: "Every campaign, post and session helps someone get the right mental health support." },
  { icon: <VerifiedRounded />, title: "A trusted name", text: "Verified psychologists across India since 2020, and our own centre in Noida." },
  { icon: <TrendingUpRounded />, title: "Grow fast", text: "A small team where your ideas ship quickly and you learn across roles." },
  { icon: <GroupsRounded />, title: "Kind culture", text: "We practise what we preach: respect, flexibility and support for each other." },
];

export async function getStaticProps() {
  try {
    const r = await fetch(`${apiUrl}/careers/jobs`);
    const d = await r.json();
    return { props: { initialJobs: Array.isArray(d?.data) ? d.data : [] }, revalidate: 300 };
  } catch {
    return { props: { initialJobs: [] }, revalidate: 60 };
  }
}

// Google for Jobs: one JobPosting per open job
const jobLd = (j) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: j.title,
  description: [j.summary, j.responsibilities?.length ? `Responsibilities: ${j.responsibilities.join("; ")}` : "", j.requirements?.length ? `Requirements: ${j.requirements.join("; ")}` : ""].filter(Boolean).join("\n"),
  datePosted: String(j.postedAt || "").slice(0, 10) || undefined,
  employmentType: { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", Internship: "INTERN", Freelance: "CONTRACTOR", Contract: "CONTRACTOR" }[j.type] || "OTHER",
  hiringOrganization: { "@type": "Organization", name: "Choose Your Therapist", sameAs: SITE, logo: `${SITE}/assets/img/logo.png` },
  ...(/remote|online/i.test(j.location)
    ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "India" } }
    : { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Noida", addressRegion: "Uttar Pradesh", addressCountry: "IN" } } }),
  directApply: true,
  url: `${PAGE_URL}#${j.slug}`,
});

export default function CareersPage({ initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [dept, setDept] = useState("All");
  const [open, setOpen] = useState(null);       // expanded job slug
  const [applyFor, setApplyFor] = useState(null); // job object, or { general: true }

  // fresh list on the client too (a job closed a minute ago shouldn't take applications)
  useEffect(() => {
    let alive = true;
    fetch(`${apiUrl}/careers/jobs`).then((r) => r.json()).then((d) => { if (alive && Array.isArray(d?.data)) setJobs(d.data); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  // /careers#slug opens that job
  useEffect(() => {
    const h = decodeURIComponent((window.location.hash || "").slice(1));
    if (h) setOpen(h);
  }, []);

  const depts = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))], [jobs]);
  const shown = dept === "All" ? jobs : jobs.filter((j) => j.department === dept);

  return (
    <>
      <Head>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta key="og:image" property="og:image" content={`${SITE}/api/og/site.jpg?page=careers`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Careers at Choose Your Therapist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE}/api/og/site.jpg?page=careers`} />
        {initialJobs.map((j) => (
          <script key={j._id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd(j)) }} />
        ))}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />

      <main className="cr">
        <section className="cr-hero">
          <div className="cr-wrap">
            <span className="cr-kicker">Careers at Choose Your Therapist</span>
            <h1>Help more people find the right therapist</h1>
            <p>We're a mental health platform with verified psychologists across India and our own centre in Noida. Join us in marketing, content or clinical work.</p>
            <div className="cr-hero-cta">
              <a href="#jobs" className="cr-btn gold">See open roles{jobs.length ? ` (${jobs.length})` : ""}</a>
              <button type="button" className="cr-btn ghost" onClick={() => setApplyFor({ general: true })}>Send a general application</button>
            </div>
          </div>
        </section>

        <section className="cr-why">
          <div className="cr-wrap cr-why-grid">
            {WHY.map((w) => (
              <div key={w.title} className="cr-why-card">
                <span className="cr-why-ic" aria-hidden="true">{w.icon}</span>
                <b>{w.title}</b>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cr-jobs" id="jobs">
          <div className="cr-wrap">
            <div className="cr-jobs-head">
              <h2>Open roles</h2>
              {depts.length > 2 && (
                <div className="cr-chips" role="tablist" aria-label="Filter by team">
                  {depts.map((d) => (
                    <button key={d} type="button" role="tab" aria-selected={dept === d} className={dept === d ? "on" : ""} onClick={() => setDept(d)}>{d}</button>
                  ))}
                </div>
              )}
            </div>

            {shown.length === 0 ? (
              <div className="cr-empty">
                <b>No open roles right now</b>
                <p>We still read every application. Send yours and we'll reach out when something fits.</p>
                <button type="button" className="cr-btn" onClick={() => setApplyFor({ general: true })}>Send a general application</button>
              </div>
            ) : (
              <div className="cr-list">
                {shown.map((j) => {
                  const isOpen = open === j.slug;
                  return (
                    <article key={j._id} id={j.slug} className={`cr-job${isOpen ? " open" : ""}`}>
                      <button type="button" className="cr-job-top" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : j.slug)}>
                        <span className="cr-job-t">
                          <span className="cr-dept">{j.department}</span>
                          <b>{j.title}</b>
                          <span className="cr-meta">
                            <span><PlaceRounded aria-hidden="true" />{j.location}</span>
                            <span><WorkOutlineRounded aria-hidden="true" />{j.type}</span>
                            {j.experience && <span><ScheduleRounded aria-hidden="true" />{j.experience}</span>}
                            {j.salary && <span>₹ {j.salary}</span>}
                          </span>
                        </span>
                        <ExpandMoreRounded className="cr-chev" aria-hidden="true" />
                      </button>
                      {j.summary && <p className="cr-sum">{j.summary}</p>}
                      {isOpen && (
                        <div className="cr-detail">
                          {j.responsibilities?.length > 0 && (
                            <div><h3>What you'll do</h3><ul>{j.responsibilities.map((x) => <li key={x}>{x}</li>)}</ul></div>
                          )}
                          {j.requirements?.length > 0 && (
                            <div><h3>What we're looking for</h3><ul>{j.requirements.map((x) => <li key={x}>{x}</li>)}</ul></div>
                          )}
                        </div>
                      )}
                      <div className="cr-job-foot">
                        <button type="button" className="cr-link" onClick={() => setOpen(isOpen ? null : j.slug)}>{isOpen ? "Show less" : "Read more"}</button>
                        <button type="button" className="cr-btn" onClick={() => setApplyFor(j)}>Apply now</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="cr-general">
              <div>
                <b>Don't see your role?</b>
                <p>Tell us what you're great at. We keep every application and reach out when a role opens.</p>
              </div>
              <button type="button" className="cr-btn line" onClick={() => setApplyFor({ general: true })}>Send a general application</button>
            </div>
          </div>
        </section>
      </main>

      {applyFor && <ApplyModal job={applyFor} jobs={jobs} onClose={() => setApplyFor(null)} />}
      <Footer />
    </>
  );
}

function ApplyModal({ job, jobs, onClose }) {
  const [jobId, setJobId] = useState(job.general ? "general" : job._id);
  const [f, setF] = useState({ name: "", email: "", phone: "", city: "", experience: "", currentRole: "", qualification: "", rciNumber: "", link: "", noticePeriod: "", message: "", website: "" });
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const boxRef = useRef(null);
  const picked = jobs.find((j) => j._id === jobId);
  const clinical = !!picked?.clinical;
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    // the form is locked open (only the ✕ closes it) so a stray tap never loses what they typed
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const pickFile = (e) => {
    const x = e.target.files?.[0];
    setErr("");
    if (!x) return;
    if (!/\.(pdf|docx?)$/i.test(x.name)) { setErr("Please attach your resume as a PDF or Word file."); e.target.value = ""; return; }
    if (x.size > MAX_MB * 1024 * 1024) { setErr(`Your resume is over ${MAX_MB} MB. Please attach a smaller file.`); e.target.value = ""; return; }
    setFile(x);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (f.name.trim().length < 2) return setErr("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setErr("Please enter a valid email address.");
    if (!/^\+?[0-9 ]{10,16}$/.test(f.phone.trim())) return setErr("Please enter a valid phone number.");
    if (!file) return setErr("Please attach your resume.");
    if (!consent) return setErr("Please agree to let us contact you about this application.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("jobId", jobId);
      Object.entries(f).forEach(([k, v]) => fd.append(k, String(v).trim()));
      fd.append("resume", file);
      const r = await fetch(`${apiUrl}/careers/apply`, { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.status) throw new Error(d.message || "Something went wrong. Please try again.");
      setDone(true);
      boxRef.current?.scrollTo?.({ top: 0 });
    } catch (x) {
      setErr(x.message || "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="cr-modal-bg" role="presentation">
      <div className="cr-modal" role="dialog" aria-modal="true" aria-labelledby="cr-apply-h" ref={boxRef}>
        <button type="button" className="cr-x" onClick={onClose} aria-label="Close"><CloseRounded /></button>
        {done ? (
          <div className="cr-done">
            <CheckCircleRounded className="cr-done-ic" aria-hidden="true" />
            <h2 id="cr-apply-h">Application sent</h2>
            <p>Thank you, {f.name.trim().split(" ")[0]}. We've emailed you a confirmation. If your profile fits, our team will contact you for the next step.</p>
            <button type="button" className="cr-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="cr-apply-h">Apply{picked ? ` for ${picked.title}` : ""}</h2>
            <p className="cr-sub">Takes about 3 minutes. Fields with * are needed.</p>

            <label className="cr-f full">Role *
              <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
                <option value="general">General application (any role)</option>
              </select>
            </label>
            <div className="cr-grid">
              <label className="cr-f">Full name *<input value={f.name} onChange={set("name")} autoComplete="name" maxLength={80} /></label>
              <label className="cr-f">Email *<input type="email" value={f.email} onChange={set("email")} autoComplete="email" maxLength={120} /></label>
              <label className="cr-f">Phone *<input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="10-digit mobile" maxLength={16} /></label>
              <label className="cr-f">City<input value={f.city} onChange={set("city")} autoComplete="address-level2" maxLength={80} /></label>
              <label className="cr-f">Experience
                <select value={f.experience} onChange={set("experience")}>
                  <option value="">Choose…</option>
                  {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="cr-f">Can join
                <select value={f.noticePeriod} onChange={set("noticePeriod")}>
                  <option value="">Choose…</option>
                  {NOTICE.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="cr-f">Current role / college<input value={f.currentRole} onChange={set("currentRole")} maxLength={120} /></label>
              <label className="cr-f">LinkedIn / portfolio link<input type="url" value={f.link} onChange={set("link")} placeholder="https://" maxLength={300} /></label>
              {clinical && <label className="cr-f">Highest qualification<input value={f.qualification} onChange={set("qualification")} placeholder="e.g. M.A. Clinical Psychology" maxLength={160} /></label>}
              {clinical && <label className="cr-f">RCI number (if any)<input value={f.rciNumber} onChange={set("rciNumber")} maxLength={40} /></label>}
            </div>
            <label className="cr-f full">Why do you want to join CYT?
              <textarea rows={3} value={f.message} onChange={set("message")} maxLength={2000} />
            </label>
            {/* honeypot: hidden from people, bots fill it */}
            <input className="cr-hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} aria-hidden="true" />

            <label className={`cr-file${file ? " has" : ""}`}>
              <UploadFileRounded aria-hidden="true" />
              <span>{file ? <><b>{file.name}</b> · {(file.size / 1024 / 1024).toFixed(1)} MB · change</> : <>Attach your resume * <small>PDF or Word, up to {MAX_MB} MB</small></>}</span>
              <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={pickFile} />
            </label>

            <label className="cr-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Choose Your Therapist can keep my details and resume to contact me about jobs.</span>
            </label>

            <div className="cr-submit-bar">
              {err && <p className="cr-err" role="alert">{err}</p>}
              <button type="submit" className="cr-btn wide" disabled={busy}>{busy ? "Sending…" : "Submit application"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const CSS = `
.cr { --forest:#14532d; --green:#1e7a4c; --gold:#d4a24c; --cream:#fffaf0; --ink:#10241a; --mute:#5b6b62; --line:#e3ebe6; font-family:Inter,-apple-system,"Segoe UI",sans-serif; color:var(--ink); background:#f6f9f7; }
.cr-wrap { max-width:1120px; margin:0 auto; padding:0 20px; }
.cr-hero { background:radial-gradient(1200px 400px at 85% -10%, rgba(212,162,76,.28), transparent 60%), linear-gradient(135deg,#0f3d24,#14532d 55%,#1e7a4c); color:#fff; padding:72px 0 64px; }
.cr-kicker { display:inline-block; font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#f3d79a; margin-bottom:12px; }
.cr-hero h1 { font-size:clamp(30px,4.4vw,48px); line-height:1.12; font-weight:800; max-width:720px; margin:0 0 14px; color:#fff; text-wrap:balance; }
.cr-hero p { font-size:17px; line-height:1.6; max-width:640px; margin:0; color:rgba(255,255,255,.86); }
.cr-hero-cta { display:flex; gap:12px; flex-wrap:wrap; margin-top:26px; }
.cr-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:46px; padding:0 22px; border-radius:12px; border:0; background:var(--forest); color:#fff; font:inherit; font-size:15px; font-weight:700; cursor:pointer; text-decoration:none; transition:transform .15s, filter .15s; }
.cr-btn:hover { filter:brightness(1.1); color:#fff; transform:translateY(-1px); }
.cr-btn:focus-visible, .cr-chips button:focus-visible, .cr-job-top:focus-visible, .cr-link:focus-visible { outline:3px solid var(--gold); outline-offset:2px; }
.cr-btn.gold { background:var(--gold); color:#1b1405; }
.cr-btn.gold:hover { color:#1b1405; }
.cr-btn.ghost { background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.45); }
.cr-btn.line { background:#fff; color:var(--forest); border:1.5px solid var(--forest); }
.cr-btn.line:hover { color:var(--forest); background:#f0f8f3; }
.cr-btn.wide { width:100%; }
.cr-submit-bar { position:sticky; bottom:calc(-1 * var(--mpb)); z-index:2; margin:4px calc(-1 * var(--mpx)) calc(-1 * var(--mpb)); padding:12px var(--mpx) var(--mpb); background:#fff; border-top:1px solid #eef2ef; box-shadow:0 -10px 20px -14px rgba(15,61,36,.35); }
.cr-submit-bar .cr-err { margin:0 0 8px; }
.cr-btn:disabled { opacity:.7; cursor:default; transform:none; }

.cr-why { margin-top:-30px; }
.cr-why-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.cr-why-card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px; box-shadow:0 10px 30px -20px rgba(15,61,36,.45); }
.cr-why-ic { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; background:#ecf7ef; color:var(--green); margin-bottom:10px; }
.cr-why-card b { display:block; font-size:15.5px; margin-bottom:4px; }
.cr-why-card p { margin:0; font-size:14px; line-height:1.55; color:var(--mute); }

.cr-jobs { padding:48px 0 64px; scroll-margin-top:80px; }
.cr-jobs-head { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:18px; }
.cr-jobs-head h2 { font-size:28px; font-weight:800; margin:0; color:var(--ink); }
.cr-chips { display:flex; gap:8px; flex-wrap:wrap; }
.cr-chips button { height:36px; padding:0 15px; border-radius:999px; border:1.5px solid var(--line); background:#fff; font:inherit; font-size:13.5px; font-weight:700; color:#475569; cursor:pointer; }
.cr-chips button.on { background:var(--forest); border-color:var(--forest); color:#fff; }
.cr-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; align-items:start; }
.cr-job { background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px 18px 14px; display:grid; gap:10px; min-width:0; transition:border-color .15s, box-shadow .15s; scroll-margin-top:90px; }
.cr-job:hover, .cr-job.open { border-color:#b9d8c4; box-shadow:0 12px 30px -22px rgba(15,61,36,.55); }
.cr-job-top { display:flex; align-items:flex-start; gap:10px; background:none; border:0; padding:0; text-align:left; font:inherit; color:inherit; cursor:pointer; width:100%; }
.cr-job-t { flex:1; min-width:0; display:grid; gap:5px; }
.cr-dept { justify-self:start; font-size:11.5px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:#92651a; background:#fdf6e7; border-radius:999px; padding:3px 10px; }
.cr-job-t b { font-size:19px; font-weight:800; line-height:1.3; }
.cr-meta { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:13.5px; color:var(--mute); }
.cr-meta span { display:inline-flex; align-items:center; gap:4px; }
.cr-meta svg { font-size:17px; color:var(--green); }
.cr-chev { color:#94a3b8; transition:transform .2s; flex:none; margin-top:4px; }
.cr-job.open .cr-chev { transform:rotate(180deg); }
.cr-sum { margin:0; font-size:14.5px; line-height:1.6; color:#2b3b33; }
.cr-detail { display:grid; gap:12px; border-top:1px dashed var(--line); padding-top:12px; }
.cr-detail h3 { font-size:14px; font-weight:800; margin:0 0 6px; color:var(--forest); }
.cr-detail ul { margin:0; padding-left:18px; display:grid; gap:4px; font-size:14px; line-height:1.55; color:#2b3b33; }
.cr-job-foot { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:2px; }
.cr-link { background:none; border:0; padding:4px 0; font:inherit; font-size:14px; font-weight:700; color:var(--green); cursor:pointer; }
.cr-job-foot .cr-btn { height:40px; padding:0 18px; font-size:14px; }
.cr-empty { background:#fff; border:1px dashed #cfe0d5; border-radius:16px; padding:34px 20px; text-align:center; display:grid; gap:8px; justify-items:center; }
.cr-empty b { font-size:18px; } .cr-empty p { margin:0 0 8px; color:var(--mute); }
.cr-general { margin-top:22px; background:var(--cream); border:1px solid #f1e2bf; border-radius:16px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.cr-general b { font-size:17px; } .cr-general p { margin:2px 0 0; color:var(--mute); font-size:14px; }

.cr-modal-bg { position:fixed; inset:0; z-index:3000; background:rgba(10,24,17,.55); display:flex; align-items:center; justify-content:center; padding:16px; }
.cr-modal { --mpx:24px; --mpb:20px; position:relative; width:100%; max-width:640px; max-height:calc(100dvh - 32px); overflow-y:auto; background:#fff; border-radius:20px; padding:26px var(--mpx) var(--mpb); font-family:Inter,-apple-system,"Segoe UI",sans-serif; color:#10241a; box-shadow:0 30px 80px -30px rgba(0,0,0,.5); }
.cr-modal h2 { font-size:22px; font-weight:800; margin:0 34px 2px 0; color:#10241a; }
.cr-sub { margin:0 0 14px; color:#5b6b62; font-size:13.5px; }
.cr-x { position:sticky; float:right; top:0; margin:-12px -10px 0 8px; z-index:3; box-shadow:0 2px 8px rgba(0,0,0,.08); width:36px; height:36px; border-radius:50%; border:0; background:#f1f5f3; color:#334155; display:grid; place-items:center; cursor:pointer; }
.cr-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 12px; }
.cr-f { display:grid; gap:5px; font-size:13px; font-weight:700; color:#334155; margin:0 0 10px; min-width:0; }
.cr-grid .cr-f { margin:0; }
.cr-f.full { margin:0 0 12px; }
.cr-grid + .cr-f.full { margin-top:12px; }
.cr-f input, .cr-f select, .cr-f textarea { width:100%; box-sizing:border-box; height:44px; border:1.5px solid #dbe3df; border-radius:11px; padding:0 12px; font:inherit; font-size:15px; font-weight:500; color:#10241a; background:#fff; outline:none; }
.cr-f textarea { height:auto; padding:10px 12px; resize:vertical; }
.cr-f :is(input,select,textarea):focus { border-color:#1e7a4c; box-shadow:0 0 0 3px rgba(30,122,76,.12); }
.cr-hp { position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
.cr-file { display:flex; align-items:center; gap:10px; border:1.5px dashed #b9d8c4; border-radius:12px; padding:14px; background:#f6fbf8; cursor:pointer; font-size:14px; color:#14532d; margin-bottom:12px; }
.cr-file.has { border-style:solid; background:#ecf7ef; }
.cr-file svg { font-size:26px; color:#1e7a4c; flex:none; }
.cr-file span { min-width:0; overflow-wrap:anywhere; }
.cr-file small { display:block; color:#5b6b62; font-size:12.5px; }
.cr-file input { position:absolute; width:1px; height:1px; opacity:0; }
.cr-consent { display:flex; gap:10px; align-items:flex-start; font-size:13.5px; color:#334155; margin-bottom:10px; cursor:pointer; }
.cr-consent input { width:18px; height:18px; margin-top:2px; flex:none; accent-color:#14532d; }
.cr-err { background:#fdf0f0; color:#b91c1c; border-radius:10px; padding:9px 12px; font-size:13.5px; margin:0 0 10px; }
.cr-done { text-align:center; display:grid; gap:10px; justify-items:center; padding:16px 4px 6px; }
.cr-done-ic { font-size:56px !important; color:#1e7a4c; }
.cr-done h2 { margin:0; }
.cr-done p { margin:0 0 6px; color:#5b6b62; font-size:15px; line-height:1.6; max-width:420px; }

@media (max-width:1023px) {
  .cr-why-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:760px) {
  .cr-hero { padding:48px 0 52px; }
  .cr-hero p { font-size:15.5px; }
  .cr-hero-cta .cr-btn { flex:1 1 100%; }
  .cr-list { grid-template-columns:minmax(0,1fr); }
  .cr-jobs-head h2 { font-size:24px; }
  .cr-chips { overflow-x:auto; flex-wrap:nowrap; scrollbar-width:none; width:100%; }
  .cr-chips button { flex:none; }
  .cr-general .cr-btn { width:100%; }
  .cr-modal-bg { align-items:flex-end; padding:0; }
  .cr-modal { --mpx:16px; --mpb:calc(16px + env(safe-area-inset-bottom,0px)); max-width:none; border-radius:20px 20px 0 0; max-height:92dvh; padding:22px var(--mpx) var(--mpb); }
  .cr-grid { grid-template-columns:minmax(0,1fr); }
}
@media (max-width:480px) {
  .cr-why-grid { grid-template-columns:minmax(0,1fr); }
  .cr-wrap { padding:0 16px; }
}
@media (prefers-reduced-motion:reduce) { .cr-btn, .cr-chev, .cr-job { transition:none; } }
`;
