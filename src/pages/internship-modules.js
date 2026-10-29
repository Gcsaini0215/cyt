import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import PhotoHero from "../components/global/photo-hero";
import { PROGRAM_DATA, GENERAL_TYPES, PLANS, BEST_PLAN } from "./internship-registration";

/* /internship-modules — the curriculum of every internship track, module by module.
   Light banner like the registration pages; a sticky track list beside the course cards on wide screens. */

const COURSE_CODES = {
  "Counselling Psychology": "CYT-CN102",
  "Research & Data": "CYT-RD104",
  "Content / Social Media": "CYT-CS105",
  "Administrative / Operations": "CYT-AO106",
  "Social Media & Outreach": "CYT-SO107",
};
const PSYCH_TRACKS = ["Counselling Psychology"];
const GROUPS = [
  { key: "psych", title: "Psychology tracks", sub: "Hands-on, mentor-led exposure to counselling psychology practice.", types: PSYCH_TRACKS },
  { key: "general", title: "General support tracks", sub: "Research, content, operations and outreach roles that keep a mental health platform running.", types: GENERAL_TYPES },
];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
// the plans whose hours fall inside a track's range ("30–240 hrs")
const plansFor = (hoursText) => {
  const m = String(hoursText || "").match(/(\d+)\D+(\d+)/);
  if (!m) return PLANS;
  const lo = Number(m[1]), hi = Number(m[2]);
  const inRange = PLANS.filter((p) => { const h = parseInt(p.hours, 10); return h >= lo && h <= hi; });
  return inRange.length ? inRange : PLANS;
};

function FeeGrid({ plans, compact }) {
  return (
    <div className={`imf-grid${compact ? " compact" : ""}`}>
      {plans.map((p) => (
        <div key={p.hours} className={`imf${p.hours === BEST_PLAN ? " best" : ""}`}>
          {p.hours === BEST_PLAN && <em>Best value</em>}
          <span>{p.hours} · {p.duration}</span>
          <b>{inr(p.fee)}</b>
          <small>≈ ₹{p.perHour}/hr</small>
        </div>
      ))}
    </div>
  );
}

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const split = (d) => { const [duration, hours] = String(d || "").split(" | "); return { duration, hours }; };

function CourseCard({ name, data, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const { duration, hours } = split(data.duration);
  return (
    <article id={slugify(name)} className={`imc${open ? " open" : ""}`} style={{ "--c": data.color || "#1e7a4c" }}>
      <button type="button" className="imc-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="imc-ic"><i className={data.icon || "feather-book-open"} aria-hidden="true" /></span>
        <span className="imc-t">
          <small>{COURSE_CODES[name] || "CYT"}</small>
          <b>{name}</b>
          <em>{data.tagline}</em>
        </span>
        <span className="imc-chev" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div className="imc-meta">
        <span><i className="feather-calendar" aria-hidden="true" /> {duration}</span>
        <span><i className="feather-clock" aria-hidden="true" /> {hours}</span>
        <span><i className="feather-layers" aria-hidden="true" /> {data.modules.length} modules</span>
        <span className="imc-from"><i className="feather-tag" aria-hidden="true" /> from {inr(Math.min(...plansFor(hours).map((p) => p.fee)))}</span>
      </div>
      {open && (
        <div className="imc-body">
          <ol className="imc-mods">
            {data.modules.map((mod, i) => (
              <li key={i}>
                <span className="imc-n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{mod.title.replace(/^Module \d+\s*[:—-]\s*/, "")}</b>
                  <ul>{mod.activities.map((act, j) => <li key={j}>{act}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
          <div className="imc-fee">
            <b><i className="feather-tag" aria-hidden="true" /> Fee for this track</b>
            <FeeGrid plans={plansFor(hours)} compact />
          </div>
          <div className="imc-award"><i className="feather-award" aria-hidden="true" /> <span>On completion: <b>{data.outcome}</b></span></div>
        </div>
      )}
    </article>
  );
}

export default function InternshipModules() {
  const all = GROUPS.flatMap((g) => g.types).filter((t) => PROGRAM_DATA[t]);
  const totalModules = all.reduce((a, t) => a + PROGRAM_DATA[t].modules.length, 0);

  return (
    <>
      <Head>
        <meta key="og:image" property="og:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=internship" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Internships in psychology at Choose Your Therapist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=internship" />
        <title>Internship Modules &amp; Curriculum | Choose Your Therapist</title>
        <meta name="description" content="See the full module-by-module curriculum for every track in the Choose Your Therapist Supervision cum Internship Program." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/internship-modules" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />
      <PhotoHero
        pill={<><i className="feather-book-open" aria-hidden="true" /> Course curriculum</>}
        title={<>Internship modules &amp; <span>curriculum</span></>}
        lead="Every track in the Supervision cum Internship Program, module by module — open a track to see exactly what you'll learn."
        stats={[{ value: `${all.length}`, label: "tracks" }, { value: `${totalModules}`, label: "modules" }, { value: "Certificate", label: "+ LOR" }]}
      />

      <div className="im-bg">
        <div className="im-wrap">
          <aside className="im-side" aria-label="Tracks">
            <div className="im-side-in">
              <b className="im-side-h">Tracks</b>
              {GROUPS.map((g) => (
                <div key={g.key} className="im-side-g">
                  <span>{g.title}</span>
                  {g.types.filter((t) => PROGRAM_DATA[t]).map((t) => (
                    <a key={t} href={`#${slugify(t)}`} style={{ "--c": PROGRAM_DATA[t].color || "#1e7a4c" }}>
                      <i aria-hidden="true" />
                      <span>{t}</span>
                      <small>{split(PROGRAM_DATA[t].duration).hours}</small>
                    </a>
                  ))}
                </div>
              ))}
              <div className="im-side-fee">
                <span>Program fee</span>
                <b>{inr(Math.min(...PLANS.map((p) => p.fee)))} – {inr(Math.max(...PLANS.map((p) => p.fee)))}</b>
                <a href="#im-fees-h">See fee by hours</a>
              </div>
              <Link href="/internship-registration#apply-form" className="im-side-cta">Apply now <i className="feather-arrow-right" aria-hidden="true" /></Link>
            </div>
          </aside>

          <main className="im-main">
            <Link href="/internship-registration" className="im-back"><i className="feather-arrow-left" aria-hidden="true" /> Back to application</Link>

            <section className="im-fees" aria-labelledby="im-fees-h">
              <div className="im-fees-h">
                <div>
                  <h2 id="im-fees-h">Program fee</h2>
                  <p>The same for every track — pick the hours that suit you. Paid online when you apply.</p>
                </div>
              </div>
              <FeeGrid plans={PLANS} />
            </section>
            {GROUPS.map((g, gi) => (
              <section key={g.key} className="im-group" aria-labelledby={`g-${g.key}`}>
                <div className="im-group-h">
                  <span className="im-group-n">{String(gi + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 id={`g-${g.key}`}>{g.title}</h2>
                    <p>{g.sub}</p>
                  </div>
                </div>
                {g.types.filter((t) => PROGRAM_DATA[t]).map((t, i) => (
                  <CourseCard key={t} name={t} data={PROGRAM_DATA[t]} defaultOpen={gi === 0 && i === 0} />
                ))}
              </section>
            ))}

            <div className="im-cta">
              <div>
                <b>Ready to apply?</b>
                <span>Pick one or more tracks on the application form — it takes about 5 minutes.</span>
              </div>
              <Link href="/internship-registration#apply-form">Go to application <i className="feather-arrow-right" aria-hidden="true" /></Link>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

const CSS = `
.im-bg { background: #fff; padding: 32px 0 56px; }
.im-wrap { max-width: 1140px; margin: 0 auto; padding: 0 16px; box-sizing: border-box; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 24px; align-items: start; }
.im-side { position: sticky; top: 96px; }
.im-side-fee { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: 14px; background: #fffaf0; border: 1px solid #efe2bf; }
.im-side-fee span { font-size: 11.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #8a5a0b; }
.im-side-fee b { font-size: 17px; color: #0f3d24; }
.im-side-fee a { font-size: 12.5px; font-weight: 800; color: #14532d !important; }
.im-fees { padding: 20px; border-radius: 20px; background: linear-gradient(135deg, #fffaf0, #fff 70%); border: 1px solid #efe2bf; display: flex; flex-direction: column; gap: 14px; scroll-margin-top: 96px; }
.im-fees-h h2 { margin: 0; font-size: 22px; font-weight: 800; color: #0b1712; }
.im-fees-h p { margin: 2px 0 0; padding: 0; font-size: 14px; color: #5b6b62; }
.imf-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.imf-grid.compact { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
.imf { position: relative; display: flex; flex-direction: column; gap: 1px; padding: 12px 14px; border-radius: 14px; background: #fff; border: 1.5px solid #ece4cf; }
.imf.best { border-color: #d4a24c; }
.imf em { position: absolute; top: -9px; left: 12px; font-style: normal; font-size: 10.5px; font-weight: 800; color: #3d2a00; background: #ecc77d; border-radius: 999px; padding: 1px 8px; }
.imf span { font-size: 12.5px; font-weight: 700; color: #5b6b62; }
.imf b { font-size: 21px; font-weight: 900; color: #0f3d24; line-height: 1.2; }
.imf small { font-size: 11.5px; font-weight: 600; color: #8a948f; }
.imf-grid.compact .imf b { font-size: 17px; }
.imc-fee { margin-top: 14px; padding: 14px; border-radius: 14px; background: #fffdf7; border: 1px solid #efe2bf; display: flex; flex-direction: column; gap: 10px; }
.imc-fee > b { font-size: 13.5px; color: #5b4a2a; display: inline-flex; align-items: center; gap: 6px; }
.imc-from { background: #fbf1dc !important; color: #6b4a0f !important; }
.imc-from i { color: #b07a1c !important; }
.im-side-in { background: #fff; border: 1px solid #e3ebe6; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 24px 48px -32px rgba(20,83,45,.4); }
.im-side-h { font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #8a5a0b; }
.im-side-g { display: flex; flex-direction: column; gap: 4px; }
.im-side-g > span { font-size: 11.5px; font-weight: 800; color: #8a948f; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.im-side-g a { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; text-decoration: none !important; color: #13261c !important; font-size: 14px; font-weight: 700; transition: background .15s; }
.im-side-g a:hover { background: #f4f8f5; }
.im-side-g a i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); flex-shrink: 0; }
.im-side-g a span { flex: 1; min-width: 0; }
.im-side-g a small { font-size: 11.5px; color: #8a948f; font-weight: 600; white-space: nowrap; }
.im-side-cta { display: flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 12px; background: #14532d; color: #fff !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.im-side-cta:hover { background: #0f3d22; }

.im-main { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.im-back { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 999px; background: #fff; border: 1px solid #e3ebe6; color: #14532d !important; font-size: 13px; font-weight: 700; text-decoration: none !important; box-shadow: 0 8px 20px -14px rgba(20,83,45,.5); }
.im-group { margin-top: 18px; display: flex; flex-direction: column; gap: 14px; }
.im-group-h { display: flex; gap: 14px; align-items: flex-start; }
.im-group-n { flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; background: #14532d; color: #ecc77d; font-weight: 900; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
.im-group-h h2 { margin: 0; font-size: 22px; font-weight: 800; color: #0b1712; }
.im-group-h p { margin: 2px 0 0; padding: 0; font-size: 14px; color: #5b6b62; }

.imc { background: #fff; border: 1px solid #e3ebe6; border-radius: 18px; overflow: hidden; transition: box-shadow .2s, border-color .2s; }
.imc.open { border-color: color-mix(in srgb, var(--c) 35%, #e3ebe6); box-shadow: 0 20px 44px -30px rgba(20,83,45,.5); }
.imc-head { width: 100%; display: flex; align-items: flex-start; gap: 14px; padding: 18px 20px; border: none; background: none; cursor: pointer; text-align: left; font: inherit; color: inherit; }
.imc-ic { flex-shrink: 0; width: 46px; height: 46px; border-radius: 14px; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); display: inline-flex; align-items: center; justify-content: center; font-size: 20px; }
.imc-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.imc-t small { font-size: 11.5px; font-weight: 800; letter-spacing: .06em; color: #a86e0e; }
.imc-t b { font-size: 18px; font-weight: 800; color: #0b1712; }
.imc-t em { font-style: normal; font-size: 13.5px; color: #5b6b62; line-height: 1.5; }
.imc-chev { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: #f1f5f2; color: #14532d; font-size: 20px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
.imc.open .imc-chev { background: #14532d; color: #fff; }
.imc-meta { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 20px 16px 80px; }
.imc-meta span { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #26463a; background: #f4f8f5; border-radius: 999px; padding: 4px 11px; }
.imc-meta i { color: var(--c); }
.imc-body { border-top: 1px solid #eef2ef; padding: 18px 20px 20px; background: #fcfdfc; }
.imc-mods { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.imc-mods > li { margin: 0; display: flex; gap: 12px; padding: 14px; border-radius: 14px; background: #fff; border: 1px solid #eef2ef; }
.imc-mods > li::before { content: none; }
.imc-n { flex-shrink: 0; width: 30px; height: 30px; border-radius: 9px; background: var(--c); color: #fff; font-size: 12px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; }
.imc-mods b { display: block; font-size: 14.5px; color: #13261c; margin: 4px 0 6px; line-height: 1.35; }
.imc-mods ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.imc-mods ul li { margin: 0; position: relative; padding-left: 14px; font-size: 13px; line-height: 1.5; color: #4b5d53; }
.imc-mods ul li::before { content: ""; position: absolute; left: 0; top: 8px; width: 5px; height: 5px; border-radius: 50%; background: color-mix(in srgb, var(--c) 60%, #fff); }
.imc-award { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: #fff8e8; border: 1px solid #f0d9a4; font-size: 13.5px; color: #5b4a2a; }
.imc-award i { color: #b07a1c; font-size: 18px; }
.imc-award b { color: #13261c; }

.im-cta { margin-top: 26px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 22px 24px; border-radius: 20px; background: linear-gradient(135deg, #14532d, #1e7a4c); color: #fff; }
.im-cta b { display: block; font-size: 19px; }
.im-cta span { font-size: 14px; color: #d4ecdd; }
.im-cta a { display: inline-flex; align-items: center; gap: 6px; height: 46px; padding: 0 20px; border-radius: 12px; background: #ecc77d; color: #14532d !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }

@media (max-width: 1100px) { .imf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 960px) {
  .im-wrap { grid-template-columns: 1fr; }
  .im-side { position: static; order: 2; }
  .im-main { order: 1; }
  .imc-mods { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .im-bg { padding-top: 20px; }
  .imf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .im-fees { padding: 16px; }
  .imc-head { padding: 16px 14px; gap: 12px; }
  .imc-ic { width: 40px; height: 40px; font-size: 18px; }
  .imc-t b { font-size: 16.5px; }
  .imc-meta { padding: 0 14px 14px; }
  .imc-body { padding: 14px; }
  .im-group-h h2 { font-size: 19px; }
  .im-cta a { width: 100%; justify-content: center; }
}
`;
