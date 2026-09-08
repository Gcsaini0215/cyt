import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { PROGRAM_DATA, GENERAL_TYPES } from "./internship-registration";

const COURSE_CODES = {
  "Counselling Psychology": "CYT-CN102",
  "Research & Data": "CYT-RD104",
  "Content / Social Media": "CYT-CS105",
  "Administrative / Operations": "CYT-AO106",
  "Social Media & Outreach": "CYT-SO107",
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function CourseCard({ name, data, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [duration, hours] = data.duration.split(" | ");
  const id = slugify(name);

  return (
    <div id={id} className="im-course">
      <button type="button" className="im-course-head" onClick={() => setOpen((v) => !v)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="im-code mono">{COURSE_CODES[name]}</div>
          <h3 className="im-course-title serif">{name}</h3>
          <p className="im-course-tagline">{data.tagline}</p>
        </div>
        <span className="im-chev" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>

      <div className="im-meta">
        <div><div className="im-meta-k">Duration</div><div className="im-meta-v">{duration}</div></div>
        <div><div className="im-meta-k">Hours</div><div className="im-meta-v">{hours}</div></div>
        <div><div className="im-meta-k">Modules</div><div className="im-meta-v">{data.modules.length}</div></div>
      </div>

      {open && (
        <div className="im-syllabus">
          {data.modules.map((mod, i) => (
            <div className="im-mod" key={i}>
              <div className="im-mod-num mono">{String(i + 1).padStart(2, "0")}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="im-mod-title">{mod.title.replace(/^Module \d+\s*—\s*/, "")}</p>
                <ul>
                  {mod.activities.map((act, j) => <li key={j}>{act}</li>)}
                </ul>
              </div>
            </div>
          ))}
          <div className="im-award">🎓 <span>Upon completion: <b>{data.outcome}</b></span></div>
        </div>
      )}
    </div>
  );
}

function CourseGroup({ num, title, subtitle, types, accentClass, defaultOpenName }) {
  return (
    <div className="im-group">
      <div className="im-group-head">
        <span className="im-group-num serif">{num}.</span>
        <span className={`im-group-title serif ${accentClass}`}>{title}</span>
      </div>
      <p className="im-group-sub">{subtitle}</p>
      {types.map((name) => (
        <CourseCard key={name} name={name} data={PROGRAM_DATA[name]} defaultOpen={name === defaultOpenName} />
      ))}
    </div>
  );
}

export default function InternshipModules() {
  const psychTypes = ["Counselling Psychology"];
  const allTypes = [...psychTypes, ...GENERAL_TYPES];

  return (
    <>
      <Head>
        <title>Internship Modules & Curriculum | Choose Your Therapist</title>
        <meta name="description" content="See the full module-by-module curriculum for every track in the Choose Your Therapist Supervision cum Internship Program." />
        <link rel="canonical" href="https://chooseyourtherapist.in/internship-modules" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,600;0,700;1,500&family=Public+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .im-page { font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f6f8f5; }
        .im-page .serif { font-family: 'Source Serif 4', Georgia, serif; }
        .im-page .mono { font-family: 'IBM Plex Mono', monospace; }

        .im-wrap { max-width: 760px; margin: 0 auto; padding: 40px 20px 20px; }

        .im-toc { padding: 0 0 30px; border-bottom: 1px solid #d8e0da; margin-bottom: 6px; }
        .im-toc-label { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #a67c29; margin-bottom: 16px; }
        .im-toc-row { display: flex; align-items: baseline; gap: 8px; padding: 7px 0; text-decoration: none; color: inherit; }
        .im-toc-code { font-size: 11px; color: #4b5d53; flex-shrink: 0; width: 76px; }
        .im-toc-name { font-size: 14.5px; font-weight: 600; flex-shrink: 0; color: #132a1c; }
        .im-toc-dots { flex: 1; border-bottom: 1px dotted #d8e0da; margin-bottom: 5px; min-width: 20px; }
        .im-toc-hrs { font-size: 11px; color: #4b5d53; flex-shrink: 0; }

        .im-group { padding: 32px 0 6px; }
        .im-group-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px; }
        .im-group-num { font-size: 12px; color: #4b5d53; }
        .im-group-title { font-size: 20px; font-weight: 700; }
        .im-group-title.accent-green { color: #1b5e20; }
        .im-group-title.accent-navy { color: #1e3a5f; }
        .im-group-sub { font-size: 13.5px; color: #4b5d53; margin: 2px 0 24px; max-width: 58ch; }

        .im-course { border: 1px solid #d8e0da; border-radius: 4px; background: #fff; margin-bottom: 18px; overflow: hidden; }
        .im-course-head { width: 100%; display: flex; align-items: flex-start; gap: 16px; padding: 20px 22px; background: none; border: none; cursor: pointer; text-align: left; font: inherit; color: inherit; }
        .im-code { font-size: 11px; color: #a67c29; font-weight: 500; margin-bottom: 5px; letter-spacing: .03em; }
        .im-course-title { font-size: 17px; font-weight: 700; margin: 0 0 6px; color: #132a1c; }
        .im-course-tagline { font-size: 12.5px; color: #4b5d53; font-style: italic; max-width: 56ch; margin: 0; }
        .im-chev { flex-shrink: 0; margin-top: 4px; font-size: 13px; color: #4b5d53; transition: transform .2s ease; }

        .im-meta { display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid #d8e0da; border-bottom: 1px solid #d8e0da; }
        .im-meta > div { padding: 11px 22px; border-right: 1px solid #d8e0da; }
        .im-meta > div:last-child { border-right: none; }
        .im-meta-k { font-size: 9.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #4b5d53; margin-bottom: 3px; }
        .im-meta-v { font-size: 12px; font-weight: 600; color: #132a1c; }

        .im-syllabus { padding: 22px 22px 26px; }
        .im-mod { display: flex; gap: 16px; margin-bottom: 20px; }
        .im-mod:last-of-type { margin-bottom: 16px; }
        .im-mod-num { font-size: 11px; color: #a67c29; flex-shrink: 0; width: 26px; padding-top: 2px; text-align: right; }
        .im-mod-title { font-size: 13.5px; font-weight: 700; margin: 0 0 8px; color: #132a1c; }
        .im-mod ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .im-mod li { font-size: 12.5px; color: #4b5d53; line-height: 1.55; padding-left: 14px; position: relative; }
        .im-mod li::before { content: "—"; position: absolute; left: 0; color: #d8e0da; }

        .im-award { display: flex; align-items: center; gap: 10px; margin-top: 6px; padding-top: 18px; border-top: 1px dashed #d8e0da; font-size: 12px; color: #4b5d53; }
        .im-award b { color: #132a1c; font-weight: 700; }

        .im-enroll { margin-top: 30px; padding: 34px 30px; border-radius: 6px; text-align: center; background: linear-gradient(135deg,#e8f3ea,#fff); border: 1px solid #d8e0da; }
        .im-enroll h3 { font-size: 19px; font-weight: 700; margin: 0 0 8px; color: #132a1c; }
        .im-enroll p { font-size: 13px; color: #4b5d53; max-width: 46ch; margin: 0 auto 20px; }
        .im-enroll a { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 3px; background: #1b5e20; color: #fff; font-weight: 700; font-size: 13.5px; text-decoration: none; }

        @media (max-width: 600px) {
          .im-meta { grid-template-columns: 1fr; }
          .im-meta > div { border-right: none; border-bottom: 1px solid #d8e0da; }
          .im-meta > div:last-child { border-bottom: none; }
        }

        /* ── HERO BANNER — same treatment as the application page ── */
        .intern-banner {
          position: relative;
          background-image: url(https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg);
          background-size: cover;
          background-position: center;
          background-attachment: scroll;
          padding: 70px 0 70px 0;
          overflow: hidden;
          margin-top: 0px;
        }
        .intern-banner::before {
          content: no-open-quote;
          position: absolute; inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1;
        }
        .intern-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,.75); font-size: 12.5px; font-weight: 700;
          text-decoration: none; margin-bottom: 18px; position: relative; z-index: 1;
        }
        .intern-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.15); color: #ffffff;
          padding: 8px 20px; border-radius: 50px;
          font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(4px); position: relative; z-index: 1;
        }
        .intern-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; animation: internPulse 2s infinite; }
        @keyframes internPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        .intern-title {
          font-size: 30px; font-weight: 900; color: #ffffff; line-height: 1.3;
          margin-bottom: 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          position: relative; z-index: 1;
        }
        .intern-subtitle {
          font-size: 14px; color: rgba(255,255,255,0.85); max-width: 600px;
          margin: 0 auto; line-height: 1.6; position: relative; z-index: 1;
        }
        @media (max-width: 768px) {
          .intern-banner { padding: 24px 0 20px 0; }
          .intern-badge { display: none; }
          .intern-title { font-size: 18px; line-height: 1.4; margin-bottom: 8px; }
          .intern-subtitle { font-size: 12px; padding: 0 12px; }
        }
      `}</style>

      <div className="im-page">
        <MyNavbar />

        <section className="intern-banner">
          <div className="container">
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <Link href="/internship-registration" className="intern-back">
                <i className="feather-arrow-left"></i> Back to application
              </Link>
              <div className="intern-badge">
                <span className="intern-badge-dot"></span>
                Course Curriculum
              </div>
              <h1 className="intern-title">
                Internship Modules &amp; <span style={{ color: "#4ade80" }}>Curriculum</span>
              </h1>
              <p className="intern-subtitle">
                Every track in the Supervision cum Internship Program, broken down module by module — tap a track to see exactly what you'll learn.
              </p>
            </div>
          </div>
        </section>

        <div className="im-wrap">
          <nav className="im-toc">
            <div className="im-toc-label">Table of Contents</div>
            {allTypes.map((name) => (
              <a key={name} className="im-toc-row" href={`#${slugify(name)}`}>
                <span className="im-toc-code mono">{COURSE_CODES[name]}</span>
                <span className="im-toc-name serif">{name}</span>
                <span className="im-toc-dots"></span>
                <span className="im-toc-hrs mono">{PROGRAM_DATA[name].duration.split(" | ")[1]}</span>
              </a>
            ))}
          </nav>

          <CourseGroup
            num="I"
            title="Psychology-Related Tracks"
            subtitle="Hands-on, mentor-led exposure to counselling psychology practice."
            types={psychTypes}
            accentClass="accent-green"
            defaultOpenName="Counselling Psychology"
          />
          <CourseGroup
            num="II"
            title="General Support Tracks"
            subtitle="Research, content, operations, and outreach roles that keep a mental health platform running."
            types={GENERAL_TYPES}
            accentClass="accent-navy"
          />

          <div className="im-enroll">
            <h3 className="serif">Ready to enrol?</h3>
            <p>Pick your track — you can select more than one on the application form.</p>
            <Link href="/internship-registration#apply-form">
              Go to Application Form <i className="feather-arrow-right"></i>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
