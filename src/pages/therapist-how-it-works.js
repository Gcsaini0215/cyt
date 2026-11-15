import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { PACKAGES, inr, perDay } from "../components/therapist/package-modal";
import { SHARE_STEPS, SHARE_RULES } from "../utils/therapist-share";
import { siteCardUrl } from "../utils/og-urls";

/* How CYT works for therapists (2026-11-16) — linked from the registration page's "How it works".
   Screens are from a demo therapist account with sample data (no real clients), the same set used in the
   therapist brochure. Images: /public/images/therapist-guide/*.webp (+ -sm for phones). */

const URL = "https://www.chooseyourtherapist.in/therapist-how-it-works";
const IMG = (n) => `/images/therapist-guide/${n}`;

const STEPS = [
  { icon: "feather-package", t: "Choose a package", d: "Pick how long you want to be listed — monthly, 6 months or 12 months. Nothing is charged now." },
  { icon: "feather-user", t: "Fill in your details", d: "Name, email and phone, then your practice: profile type, online / in-person, about you, services and location." },
  { icon: "feather-file-text", t: "Upload documents", d: "Your CV / resume and your highest qualification certificate (keep a photo ID handy too). Takes about 5 minutes; progress is saved on your device." },
  { icon: "feather-shield", t: "We verify you", d: "The CYT team checks your qualifications and profile. Only verified psychologists and counsellors are listed." },
  { icon: "feather-credit-card", t: "Pay after approval", d: "Once approved you get an email to pay for your package. You pay only after your profile is approved." },
  { icon: "feather-zap", t: "Go live and get booked", d: "Your profile goes live in the directory. Clients book open slots, pay online, and you run the sessions from your dashboard." },
];

const FEATURES = [
  {
    key: "dashboard", title: "Your dashboard — the day at a glance",
    shots: [{ img: "dashboard", w: 1400, h: 875, label: "Desktop" }, { img: "dashboard-phone", w: 520, h: 1125, label: "Phone", phone: true }],
    points: [
      "Next session card with the client, time, mode and a Join button that opens just before the session",
      "Today's and upcoming sessions, with WhatsApp / call shortcuts to the client",
      "Your numbers: earnings at your share, sessions, new clients and rating",
      "A monthly earnings goal, profile views and your latest reviews in one place",
    ],
    note: "On a phone or iPad the dashboard works like an app — a bottom bar with Home, Sessions, Schedule and More.",
  },
  {
    key: "hours", title: "My Schedule — your weekly hours",
    shots: [{ img: "schedule-hours", w: 1400, h: 875, label: "Desktop" }],
    points: [
      "Tap the hours you are free each day of the week — every box is one 60-minute session",
      "Clients can only book the slots you open; booked and past slots are blocked for you",
      "All times are India time (IST), even for clients booking from abroad",
    ],
  },
  {
    key: "fees", title: "Fees — set your own, on one screen",
    shots: [{ img: "fees", w: 1400, h: 530, label: "Desktop" }],
    points: [
      "Your fee for each service (for example Individual or Couple counselling) and each mode: video, voice or in-person",
      "Turn a mode on or off per service; clients see these fees on your profile and at booking",
      "You keep your share of whatever you charge (see below)",
    ],
  },
  {
    key: "bookings", title: "Bookings and appointments",
    shots: [{ img: "bookings", w: 1400, h: 875, label: "Desktop · bookings" }, { img: "appointments", w: 1400, h: 875, label: "Desktop · appointments" }],
    points: [
      "Every booking with client name, service, date, mode and the amount paid",
      "Today, upcoming, completed and cancelled sessions at a glance, with search and filters",
      "Join online sessions (Google Meet links are created for you when you connect Google), start in-person sessions with the client's code, and reschedule when needed",
    ],
  },
  {
    key: "profile", title: "Your profile — what you edit",
    shots: [{ img: "profile-edit", w: 1400, h: 1588, label: "Desktop · profile" }, { img: "profile-services", w: 1400, h: 1274, label: "Desktop · services" }],
    points: [
      "Photo, about you, profile type, qualifications, experience and languages",
      "The services you offer and your areas of expertise, so the right clients find you",
      "Your practice location pin for in-person sessions — clients see only the area (about 1 km), never your written address",
    ],
  },
  {
    key: "public", title: "Your public profile — what clients see",
    shots: [{ img: "public-profile", w: 1400, h: 807, label: "Desktop" }, { img: "public-profile-phone", w: 520, h: 1120, label: "Phone", phone: true }],
    points: [
      "Verified badge, your next available slot and a Book a Session button",
      "About you, the concerns you help with, fees, availability and reviews",
      "A clean link with your name and city that you can share anywhere, plus share buttons",
    ],
  },
  {
    key: "payouts", title: "Payments and payouts",
    shots: [{ img: "payouts", w: 1400, h: 972, label: "Desktop · payouts" }, { img: "payment-settings", w: 1400, h: 1203, label: "Desktop · payout details" }],
    points: [
      "Clients pay CYT online when they book; your share of every completed session is paid out to you",
      "See earnings by session, what is due and what has been paid, with the payment reference",
      "Add your bank account or UPI once in your payout details",
    ],
  },
  {
    key: "achievements", title: "Achievements — and a bigger share",
    shots: [{ img: "achievements", w: 1400, h: 1069, label: "Desktop" }, { img: "certificate", w: 1400, h: 990, label: "Certificate" }],
    points: [
      "Earn CYT awards for sessions completed, 4★+ reviews and a year with CYT",
      "Each award comes with a certificate that has a QR code anyone can scan to verify it",
      "Achievements move you up the levels, so you keep more of every session fee",
    ],
  },
  {
    key: "insights", title: "Profile insights",
    shots: [{ img: "insights", w: 1400, h: 694, label: "Desktop" }],
    points: [
      "How many people viewed your profile, how many different visitors, and how many tapped Book",
      "Where they came from — Google, the directory, the home page, your own link or QR code",
      "A profile-strength score with tips on what to add next",
    ],
  },
  {
    key: "reviews", title: "Reviews",
    shots: [{ img: "reviews", w: 1400, h: 875, label: "Desktop" }],
    points: [
      "Your average rating and every review clients left after a session",
      "Ask a client for a review with one tap — good reviews raise your level and your place in search",
    ],
  },
  {
    key: "settings", title: "Settings and notifications",
    shots: [{ img: "settings", w: 1400, h: 1723, label: "Desktop" }],
    points: [
      "Connect Google so every online booking gets a Meet link on your calendar automatically",
      "Choose which emails and notifications you get, and keep your account details up to date",
    ],
  },
];

const MORE = [
  { icon: "feather-file", t: "Invoices", d: "An invoice for every paid session, ready to download or send." },
  { icon: "feather-edit-3", t: "Therapist toolkit", d: "Worksheets such as the ABCD model and Activity Diary that clients fill in online." },
  { icon: "feather-link", t: "Your booking link & QR", d: "A short link and a printable QR poster that open your own booking page." },
  { icon: "feather-image", t: "Social posts", d: "Ready-made posts with your name and photo to share on social media." },
  { icon: "feather-map-pin", t: "Google Maps listing", d: "A step-by-step guide to appear when people search “psychologist near me”." },
  { icon: "feather-message-square", t: "Notices & help", d: "Updates from the CYT team, requests and a help desk inside your dashboard." },
];

const img = (name, w, h, alt, phone) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={IMG(`${name}.webp`)}
    srcSet={`${IMG(`${name}-sm.webp`)} ${phone ? 360 : 760}w, ${IMG(`${name}.webp`)} ${phone ? 520 : 1400}w`}
    sizes={phone ? "(max-width: 899px) 60vw, 260px" : "(max-width: 899px) 92vw, 660px"}
    width={w} height={h} alt={alt} loading="lazy" decoding="async"
  />
);

export default function TherapistHowItWorks() {
  const title = "How CYT Works for Therapists — Joining, Fees & Your Dashboard";
  const desc = "How psychologists and counsellors join Choose Your Therapist: the 4-step application, verification, listing packages, the 70% share that grows to 93%, and a tour of the therapist dashboard.";
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: desc,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "Choose Your Therapist", url: "https://www.chooseyourtherapist.in" },
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={siteCardUrl("join")} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />

      <main className="thw">
        {/* ── hero ── */}
        <section className="thw-hero">
          <div className="thw-wrap">
            <span className="thw-eyebrow"><i className="feather-briefcase" aria-hidden="true" /> For psychologists &amp; counsellors</span>
            <h1>How Choose Your Therapist works for therapists</h1>
            <p className="thw-lead">From your application to your first booking — what you do, what it costs, how much of each session you keep, and the dashboard you run your practice from.</p>
            <div className="thw-cta">
              <Link href="/therapist-registration" className="thw-btn">Start your registration <i className="feather-arrow-right" aria-hidden="true" /></Link>
              <a href="#dashboard" className="thw-btn ghost">See the dashboard</a>
            </div>
            <ul className="thw-quick">
              <li><b>Verified</b> profiles only</li>
              <li><b>Pay after</b> approval</li>
              <li><b>70%</b> of every session fee, up to 93%</li>
            </ul>
          </div>
        </section>

        {/* ── steps ── */}
        <section className="thw-sec">
          <div className="thw-wrap">
            <h2>From application to your first booking</h2>
            <p className="thw-sub">The application takes about 5 minutes. Everything after that happens by email and in your dashboard.</p>
            <ol className="thw-steps">
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="thw-step-n">{i + 1}</span>
                  <span className="thw-step-ic"><i className={s.icon} aria-hidden="true" /></span>
                  <b>{s.t}</b>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── cost ── */}
        <section className="thw-sec alt" id="packages">
          <div className="thw-wrap">
            <h2>What it costs: a listing package</h2>
            <p className="thw-sub">The package is a charge for listing your profile on Choose Your Therapist for the chosen period. <b>You pay only after your profile is approved.</b></p>
            <div className="thw-pk">
              {PACKAGES.map((pk) => (
                <div key={pk.id} className={`thw-pk-card${pk.tag ? " tagged" : ""}`}>
                  {pk.tag && <span className="thw-pk-tag">{pk.tag}</span>}
                  <span className="thw-pk-label">{pk.label}</span>
                  <span className="thw-pk-price">{inr(pk.amount)}</span>
                  <span className="thw-pk-day">{perDay(pk)} · {pk.per}</span>
                  <ul>{pk.points.map((pt) => <li key={pt}><i className="feather-check" aria-hidden="true" /> {pt}</li>)}</ul>
                </div>
              ))}
            </div>
            <p className="thw-fine">Packages are for listing and visibility. Bookings depend on your profile, availability and client demand. The listing charge is separate from your share of each booking, below.</p>
          </div>
        </section>

        {/* ── share ladder ── */}
        <section className="thw-sec" id="share">
          <div className="thw-wrap thw-two">
            <div>
              <h2>You keep 70% — and more as you grow</h2>
              <p className="thw-sub">For every session booked through CYT you keep <b>70%</b> of the session fee and CYT keeps 30% for bringing the client, payments, reminders and support. As you earn achievements your share goes up — 75%, 80%, 85%, up to <b>93%</b>.</p>
              <p className="thw-fine">{SHARE_RULES}</p>
              <p className="thw-eg"><i className="feather-info" aria-hidden="true" /> Example: on a ₹1,000 session you keep ₹700 when you join, and ₹850 at Level 3.</p>
            </div>
            <div className="thw-ladder" aria-label="Your share by level">
              {SHARE_STEPS.map((x) => (
                <div key={x.you} className="thw-lad">
                  <div className="thw-lad-row">
                    <span className="thw-lad-bar"><i style={{ width: `${x.you}%` }}><em>You {x.you}%</em></i></span>
                    <small>CYT {x.cyt}%</small>
                  </div>
                  <span className="thw-lad-txt"><b>{x.when}</b> {x.how}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── dashboard tour ── */}
        <section className="thw-sec alt" id="dashboard">
          <div className="thw-wrap">
            <h2>Inside your therapist dashboard</h2>
            <p className="thw-sub">Everything you need to run your practice on CYT. It works on a desktop, an iPad and a phone.</p>
            <p className="thw-demo"><i className="feather-eye" aria-hidden="true" /> Screens show a demo therapist with sample data — not real clients.</p>
            <div className="thw-feats">
              {FEATURES.map((f, i) => (
                <article key={f.key} className={`thw-feat${i % 2 ? " flip" : ""}`} id={`feature-${f.key}`}>
                  <div className="thw-feat-txt">
                    <span className="thw-feat-n">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{f.title}</h3>
                    <ul>{f.points.map((p) => <li key={p}><i className="feather-check-circle" aria-hidden="true" /> {p}</li>)}</ul>
                    {f.note && <p className="thw-feat-note">{f.note}</p>}
                  </div>
                  <div className={`thw-shots${f.shots.length > 1 ? " many" : ""}${f.shots.some((s) => s.phone) ? " with-phone" : ""}`}>
                    {f.shots.map((s) => (
                      <figure key={s.img} className={s.phone ? "phone" : ""}>
                        {/* tap / click opens the full-size screen in a new tab */}
                        <a href={IMG(`${s.img}.webp`)} target="_blank" rel="noopener" aria-label={`Open the ${s.label} screen full size`}>
                          {img(s.img, s.w, s.h, `${f.title} — ${s.label} screen (sample data)`, s.phone)}
                        </a>
                        <figcaption>{s.label}</figcaption>
                      </figure>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── more tools ── */}
        <section className="thw-sec">
          <div className="thw-wrap">
            <h2>More tools in your dashboard</h2>
            <div className="thw-more">
              {MORE.map((m) => (
                <div key={m.t} className="thw-more-i">
                  <span><i className={m.icon} aria-hidden="true" /></span>
                  <b>{m.t}</b>
                  <p>{m.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── final CTA ── */}
        <section className="thw-final">
          <div className="thw-wrap">
            <h2>Ready to list your practice?</h2>
            <p>About 5 minutes to apply. Keep your CV and qualification certificate handy. Need help? Call <a href="tel:+918077757951">+91 80777 57951</a>.</p>
            <Link href="/therapist-registration" className="thw-btn light">Start your registration <i className="feather-arrow-right" aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

const CSS = `
.thw { color: #0b1712; background: #fff; }
.thw-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.thw h2 { font-size: clamp(22px, 2.6vw, 30px); font-weight: 800; color: #14532d; margin: 0 0 8px; letter-spacing: -.3px; line-height: 1.2; }
.thw-sub { font-size: 15.5px; color: #475569; line-height: 1.6; margin: 0 0 22px; max-width: 760px; }
.thw-fine { font-size: 13px; color: #64748b; line-height: 1.6; margin: 14px 0 0; max-width: 820px; }

.thw-hero { background: linear-gradient(160deg, #f1f8f4 0%, #fbf6ea 100%); border-bottom: 1px solid #e3ebe6; padding: 54px 0 46px; }
.thw-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 800; color: #14532d; background: #fff; border: 1px solid #e3ebe6; padding: 6px 12px; border-radius: 999px; }
.thw-hero h1 { font-size: clamp(28px, 4.2vw, 46px); font-weight: 900; color: #0f3d24; margin: 16px 0 12px; line-height: 1.12; letter-spacing: -.6px; max-width: 820px; }
.thw-lead { font-size: 17px; color: #3f5148; line-height: 1.6; margin: 0 0 22px; max-width: 720px; }
.thw-cta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 22px; }
.thw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 22px; border-radius: 12px; background: linear-gradient(135deg, #1e7a4c, #14532d); color: #fff !important; font-weight: 800; font-size: 15px; text-decoration: none; box-shadow: 0 10px 22px -12px rgba(15,61,36,.6); }
.thw-btn.ghost { background: #fff; color: #14532d !important; border: 1.5px solid #cfe3d6; box-shadow: none; }
.thw-btn.light { background: #fff; color: #14532d !important; }
.thw-quick { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.thw-quick li { margin: 0; font-size: 13.5px; color: #3f5148; background: rgba(255,255,255,.75); border: 1px solid #e3ebe6; border-radius: 999px; padding: 6px 12px; }
.thw-quick b { color: #14532d; }

.thw-sec { padding: 56px 0; }
.thw-sec.alt { background: #f6faf7; border-top: 1px solid #e8efea; border-bottom: 1px solid #e8efea; }

.thw-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; counter-reset: s; }
.thw-steps li { position: relative; margin: 0; background: #fff; border: 1px solid #e3ebe6; border-radius: 16px; padding: 20px 18px 18px; }
.thw-steps li::before { content: none; }
.thw-step-n { position: absolute; top: 14px; right: 16px; font-size: 30px; font-weight: 900; color: #e8f1eb; line-height: 1; }
.thw-step-ic { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; background: #f1f8f4; color: #1e7a4c; font-size: 18px; margin-bottom: 10px; }
.thw-steps b { display: block; font-size: 16px; color: #0f3d24; margin-bottom: 6px; }
.thw-steps p { margin: 0; font-size: 14px; color: #475569; line-height: 1.55; }

.thw-pk { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.thw-pk-card { position: relative; background: #fff; border: 1.5px solid #dbe5df; border-radius: 16px; padding: 22px 18px 18px; display: flex; flex-direction: column; gap: 3px; }
.thw-pk-card.tagged { border-color: #b7dcc5; }
.thw-pk-tag { position: absolute; top: -11px; left: 16px; font-size: 11.5px; font-weight: 800; color: #3d2a05; background: #e3a83a; padding: 3px 10px; border-radius: 999px; }
.thw-pk-label { font-size: 14px; font-weight: 800; color: #475569; }
.thw-pk-price { font-size: 30px; font-weight: 900; color: #0f3d24; }
.thw-pk-day { font-size: 12.5px; color: #64748b; font-weight: 600; margin-bottom: 10px; }
.thw-pk-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.thw-pk-card li { margin: 0; display: flex; gap: 7px; font-size: 13.5px; color: #334155; line-height: 1.45; }
.thw-pk-card li::before { content: none; }
.thw-pk-card li i { color: #1e7a4c; margin-top: 3px; }

.thw-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: center; }
.thw-eg { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; color: #14532d; background: #f1f8f4; border-radius: 12px; padding: 12px 14px; margin: 16px 0 0; }
.thw-eg i { margin-top: 3px; }
.thw-ladder { display: flex; flex-direction: column; gap: 12px; }
.thw-lad-row { display: flex; align-items: center; gap: 10px; }
.thw-lad-bar { flex: 1; min-width: 0; height: 30px; border-radius: 8px; background: #fdf3dc; overflow: hidden; display: flex; }
.thw-lad-bar i { display: flex; align-items: center; height: 100%; background: linear-gradient(90deg, #14532d, #22a35a); border-radius: 8px 0 0 8px; }
.thw-lad-bar em { font-style: normal; font-size: 13px; font-weight: 800; color: #fff; padding-left: 10px; white-space: nowrap; }
.thw-lad-row small { flex: 0 0 64px; text-align: right; font-size: 12.5px; font-weight: 800; color: #8a5a06; }
.thw-lad-txt { display: block; font-size: 13px; color: #475569; margin-top: 4px; line-height: 1.45; }
.thw-lad-txt b { color: #0f3d24; margin-right: 4px; }

.thw-demo { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: #6b4a0c; background: #fbf3e2; border: 1px solid #f0dcae; border-radius: 999px; padding: 6px 12px; margin: -8px 0 26px; }
.thw-feats { display: flex; flex-direction: column; gap: 56px; }
.thw-feat { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 40px; align-items: center; }
.thw-feat.flip { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); } /* the screens keep the wide column on either side */
.thw-feat.flip .thw-feat-txt { order: 2; }
.thw-feat-n { display: inline-block; font-size: 12px; font-weight: 900; letter-spacing: .08em; color: #b07a1c; background: #fbf3e2; border-radius: 999px; padding: 4px 10px; margin-bottom: 10px; }
.thw-feat h3 { font-size: clamp(19px, 2vw, 23px); font-weight: 800; color: #0f3d24; margin: 0 0 12px; line-height: 1.25; }
.thw-feat ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.thw-feat li { margin: 0; display: flex; gap: 9px; font-size: 15px; color: #334155; line-height: 1.55; }
.thw-feat li::before { content: none; }
.thw-feat li i { color: #1e7a4c; margin-top: 4px; flex: none; }
.thw-feat-note { margin: 14px 0 0; font-size: 13.5px; color: #64748b; line-height: 1.55; }
.thw-shots { display: grid; gap: 14px; }
.thw-shots.many { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; } /* two screens side by side, not one tall stack */
.thw-shots.with-phone { grid-template-columns: minmax(0, 1fr) minmax(0, 200px); align-items: end; }
.thw-shots figure { margin: 0; }
.thw-shots a { display: block; border-radius: 14px; }
.thw-shots a:hover img { border-color: #9fcdb2; }
.thw-shots img { display: block; width: 100%; height: auto; border-radius: 14px; border: 1px solid #dfe8e2; background: #fff; }
.thw-shots figure.phone img { border-radius: 22px; border: 6px solid #0f1f17; }
.thw-shots figcaption { font-size: 12px; font-weight: 700; color: #64748b; margin-top: 6px; text-align: center; }

.thw-more { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
.thw-more-i { border: 1px solid #e3ebe6; border-radius: 16px; padding: 18px; background: #fff; }
.thw-more-i span { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 11px; background: #f1f8f4; color: #1e7a4c; font-size: 17px; margin-bottom: 10px; }
.thw-more-i b { display: block; font-size: 15.5px; color: #0f3d24; margin-bottom: 4px; }
.thw-more-i p { margin: 0; font-size: 14px; color: #475569; line-height: 1.5; }

.thw-final { background: linear-gradient(135deg, #1e7a4c, #0f3d24); color: #fff; padding: 48px 0; text-align: center; }
.thw-final h2 { color: #fff; }
.thw-final p { color: rgba(255,255,255,.88); font-size: 15.5px; margin: 0 auto 20px; max-width: 620px; line-height: 1.6; }
.thw-final a:not(.thw-btn) { color: #fff; font-weight: 800; text-decoration: underline; }

/* iPad */
@media (max-width: 1100px) {
  .thw-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .thw-feat { grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 28px; }
  .thw-feat.flip { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }
  .thw-more { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 899px) {
  .thw-two { grid-template-columns: minmax(0, 1fr); gap: 22px; }
  .thw-feat, .thw-feat.flip { grid-template-columns: minmax(0, 1fr); gap: 18px; }
  .thw-feat.flip .thw-feat-txt { order: 0; }
  .thw-shots.with-phone { grid-template-columns: minmax(0, 1fr) minmax(0, 34%); }
  .thw-pk { grid-template-columns: minmax(0, 1fr); max-width: 520px; }
}
/* phone */
@media (max-width: 600px) {
  .thw-wrap { padding: 0 16px; }
  .thw-hero { padding: 36px 0 32px; }
  .thw-lead { font-size: 15.5px; }
  .thw-btn { width: 100%; }
  .thw-sec { padding: 40px 0; }
  .thw-steps, .thw-more { grid-template-columns: minmax(0, 1fr); }
  .thw-feats { gap: 40px; }
  .thw-feat li { font-size: 14.5px; }
  .thw-shots.with-phone, .thw-shots.many { grid-template-columns: minmax(0, 1fr); }
  .thw-shots.with-phone figure.phone { max-width: 230px; margin: 0 auto; }
}
`;
