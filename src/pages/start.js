import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { postFormUrlEncoded } from "../utils/actions";
import { SubmitConsultationUrl } from "../utils/url";
import PhoneField from "../components/global/phone-field";
import { DEFAULT_COUNTRY, phoneError, fullPhone, displayPhone } from "../utils/phone";

/* /start — the ad-campaign landing page. One page for both audiences:
     /start                 → people looking for therapy (default)
     /start?for=therapist   → psychologists / counsellors who want clients
   Kept simple on purpose: just the logo on a plain top bar and the form, always open; on a phone the
   whole thing fits one screen without scrolling. Every lead goes to admin → Leads (source "Campaign · <utm_source>",
   form "Campaign · Client" / "Campaign · Therapist"), with the utm / click ids kept on the lead. */

const SITE = "https://www.chooseyourtherapist.in";
const WA = "918077757951";

const AUD = {
  client: {
    tab: "I need support",
    kicker: "Talk to a verified psychologist",
    hook: "Feeling low, stressed or stuck?",
    hook2: "You don't have to handle it alone.",
    sub: "Leave your number. Our care team calls you back and matches you with the right psychologist.",
    points: ["Verified psychologists", "100% private", "Online across India"],
    formTitle: "Get a call back",
    formSub: "Takes 30 seconds. No payment now.",
    cta: "Request a call back",
  },
  therapist: {
    tab: "I'm a therapist",
    kicker: "For psychologists & counsellors",
    hook: "Get clients without chasing them.",
    hook2: "Grow your practice with CYT.",
    sub: "Join a verified network, get booked online and at our Noida centre, and keep 70% of every session.",
    points: ["Clients matched to you", "Your own profile page", "Keep 70% per session"],
    formTitle: "Join as a therapist",
    formSub: "Our team will call you with the next steps.",
    cta: "Get a call from our team",
  },
};
// share / search meta per audience (the page is rendered on the server, so ?for=therapist links preview right)
const META = {
  client: {
    title: "Talk to a Verified Psychologist – Get a Call Back | Choose Your Therapist",
    desc: "Feeling low, stressed or stuck? Leave your number and our care team will call you back and match you with a verified psychologist — online across India or at our Noida centre.",
    ogTitle: "Feeling low, stressed or stuck? Talk to a verified psychologist",
    img: `${SITE}/api/og/site.jpg?page=home`,
    alt: "Verified psychologists at Choose Your Therapist",
    url: `${SITE}/start`,
  },
  therapist: {
    title: "Get Clients Without Chasing Them – Join CYT as a Psychologist | Choose Your Therapist",
    desc: "Psychologists and counsellors: join CYT's verified network, get booked online and at our Noida centre, and keep 70% of every session. Leave your number and our team will call you.",
    ogTitle: "Psychologist? Get clients without chasing them — join CYT",
    img: `${SITE}/api/og/site.jpg?page=join`,
    alt: "Grow your practice with Choose Your Therapist",
    url: `${SITE}/start?for=therapist`,
  },
};

export async function getServerSideProps({ query }) {
  return { props: { initialWho: String(query?.for || "").toLowerCase().startsWith("therap") ? "therapist" : "client" } };
}

const CONCERNS = ["Anxiety", "Stress", "Low mood", "Relationship", "Sleep", "Something else"];
const ROLES = ["Counselling Psychologist", "Clinical Psychologist", "Psychiatrist", "Psychotherapist / Counsellor", "Other"];

export default function CampaignStart({ initialWho = "client" }) {
  const router = useRouter();
  const who = initialWho; // the ad link decides: /start or /start?for=therapist
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [hp, setHp] = useState("");            // honeypot
  const a = AUD[who];
  const m = META[initialWho] || META.client;

  const toggleConcern = (c) => setConcerns((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (hp) return;
    if (name.trim().length < 2) return setErr("Please enter your name.");
    const pe = phoneError(code, phone);
    if (pe) return setErr(pe);
    if (who === "therapist" && email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr("Please check your email address.");
    const q = router.query || {};
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach((k) => { if (q[k]) utm[k] = String(q[k]).slice(0, 120); });
    const concern = who === "client"
      ? (concerns.length ? concerns.join(", ") : "Not sure yet")
      : `Therapist enquiry · ${role || "Role not given"}${city.trim() ? ` · ${city.trim()}` : ""}`;
    setBusy(true);
    try {
      const res = await postFormUrlEncoded(SubmitConsultationUrl, {
        name: name.trim(),
        phone: fullPhone(code, phone),
        email: email.trim(),
        subject: who === "client" ? "Campaign · Client" : "Campaign · Therapist",
        concern,
        location: who === "therapist" ? city.trim() : "",
        message: who === "therapist" && role ? `Role: ${role}` : "",
        source: `Campaign · ${utm.utm_source || "direct"}`,
        audience: who,
        page: "/start",
        ...utm,
      });
      if (!res?.status) throw new Error(res?.message || "Something went wrong. Please try again.");
      setDone(true);
      document.getElementById("st-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      try { localStorage.setItem("cyt_lead_sent", String(Date.now())); } catch { /* storage blocked */ }
      try { window.gtag?.("event", "generate_lead", { form: `campaign_${who}`, source: utm.utm_source || "direct" }); } catch { /* no gtag */ }
      try { window.fbq?.("track", "Lead", { content_name: `campaign_${who}` }); } catch { /* no pixel */ }
    } catch (x) {
      setErr(x?.response?.data?.message || x.message || "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  return (
    <>
      <Head>
        <title>{m.title}</title>
        <meta name="description" content={m.desc} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${SITE}/start`} />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={m.ogTitle} />
        <meta property="og:description" content={m.desc} />
        <meta property="og:url" content={m.url} />
        <meta key="og:image" property="og:image" content={m.img} />
        <meta property="og:image:secure_url" content={m.img} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={m.alt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={m.ogTitle} />
        <meta name="twitter:description" content={m.desc} />
        <meta name="twitter:image" content={m.img} />
        <meta name="twitter:image:alt" content={m.alt} />
        <meta name="theme-color" content="#0f3d24" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className={`st st-${who}`}>
        <header className="st-top">
          <Link href="/" className="st-logo" aria-label="Choose Your Therapist home">
            <img src="/logo.png" alt="Choose Your Therapist" width="190" height="50" />
          </Link>
        </header>

        <main className="st-main">
          <section className="st-card" id="st-form" aria-label={a.formTitle}>
            {done ? (
              <div className="st-done">
                <span className="st-done-ic" aria-hidden="true">✓</span>
                <h2>{who === "client" ? "We'll call you soon" : "Thanks for your interest"}</h2>
                <p>{who === "client"
                  ? <>Our care team will call you on <b>{displayPhone(code, phone)}</b> to understand what you need and match you with the right psychologist.</>
                  : <>Our team will call you on <b>{displayPhone(code, phone)}</b> with the next steps to join CYT.</>}</p>
                {who === "client" ? (
                  <a className="st-cta wa" href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi CYT, I just requested a call back. My name is ${name.trim()}.`)}`} target="_blank" rel="noreferrer">Chat on WhatsApp now</a>
                ) : (
                  <Link className="st-cta" href="/therapist-registration">Create your profile now</Link>
                )}
                <Link className="st-link" href={who === "client" ? "/view-all-therapist" : "/about-us"}>{who === "client" ? "Browse psychologists" : "Learn about CYT"}</Link>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="st-card-h">
                  <h2>{a.formTitle}</h2>
                  <p>{a.formSub}</p>
                </div>
                <label className="st-f">Your name
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} placeholder="Full name" />
                </label>
                <div className="st-f">Mobile number
                  <PhoneField code={code} onCode={setCode} value={phone} onChange={setPhone} inputClassName="st-in" required />
                </div>
                {who === "client" ? (
                  <div className="st-f">What's on your mind? <small>optional</small>
                    <div className="st-chips">
                      {CONCERNS.map((c) => (
                        <button key={c} type="button" aria-pressed={concerns.includes(c)} className={concerns.includes(c) ? "on" : ""} onClick={() => toggleConcern(c)}>{c}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="st-f">Email <small>optional</small>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={120} placeholder="you@example.com" />
                    </label>
                    <div className="st-g2">
                      <label className="st-f">You are a
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                          <option value="">Choose…</option>
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </label>
                      <label className="st-f">City
                        <input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" maxLength={60} placeholder="e.g. Delhi" />
                      </label>
                    </div>
                  </>
                )}
                <input className="st-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" />
                {err && <p className="st-err" role="alert">{err}</p>}
                <button type="submit" className="st-cta" disabled={busy}>{busy ? "Sending…" : a.cta}</button>
                <p className="st-fine">By continuing you agree that CYT may call or WhatsApp you about this request. <Link href="/privacy-policy">Privacy</Link></p>
              </form>
            )}
          </section>
          <ul className="st-points">{a.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="st-trust"><b>★ 5.0</b> on Google · Helping people since 2020</p>
        </main>
        {/* app-style signature at the very bottom */}
        <footer className="st-sign" aria-label="Choose Your Therapist">
          <em className="st-line">{who === "therapist" ? "Every story you hold helps someone feel less alone." : "Some days feel heavy. You don’t have to carry them alone."}</em>
          <b>#CYT</b>
          <span>Crafted with <i aria-label="love">♥</i> in Noida, India</span>
        </footer>
      </div>
    </>
  );
}

const CSS = `
.st { --forest:#0f3d24; --green:#1e7a4c; --gold:#e0ab45; font-family:Inter,-apple-system,"Segoe UI",sans-serif; color:#0f1f17; background:#f4f8f5; position:fixed; inset:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:none; -webkit-overflow-scrolling:touch; display:flex; flex-direction:column; }
.st-sign { margin-top:auto; max-width:520px; width:100%; box-sizing:border-box; margin-left:auto; margin-right:auto; padding:22px 20px 26px; display:flex; flex-direction:column; gap:6px; }
.st-line { font-style:normal; font-size:15px; font-weight:600; line-height:1.4; color:#5f7a6a; margin-bottom:8px; }
.st-sign b { font-size:60px; font-weight:900; line-height:.95; letter-spacing:-.03em; color:#cfdcd4; }
.st-sign span { font-size:13px; font-weight:600; color:#9aaaa1; }
.st-sign i { font-style:normal; color:#e0566b; }
.st-top { background:#fff; border-bottom:1px solid #e3ebe6; display:flex; align-items:center; justify-content:flex-start; gap:12px; flex-wrap:wrap; padding:10px max(20px, env(safe-area-inset-left,0px)); }
.st-logo { display:inline-flex; }
.st-logo img { width:170px; height:auto; display:block; }
.st-tabs { display:inline-flex; background:#f1f5f3; border:1px solid #e3ebe6; border-radius:999px; padding:3px; gap:2px; }
.st-tabs button { border:0; background:none; color:#475569; font:inherit; font-size:13.5px; font-weight:700; padding:8px 14px; border-radius:999px; cursor:pointer; white-space:nowrap; }
.st-tabs button.on { background:var(--forest); color:#fff; }
.st-tabs button:focus-visible { outline:3px solid var(--gold); outline-offset:2px; }

.st-banner { background:radial-gradient(700px 260px at 85% -20%, rgba(224,171,69,.35), transparent 70%), linear-gradient(135deg,#0b2e1b,#14532d 60%,#1e7a4c); color:#fff; padding:40px 20px 96px; text-align:center; }
.st-banner-in { max-width:720px; margin:0 auto; animation:stUp .45s ease; }
.st-kicker { display:inline-block; font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#f3d79a; margin-bottom:12px; }
.st-banner h1 { font-size:clamp(28px,4vw,44px); line-height:1.15; font-weight:800; margin:0 0 12px; color:#fff; text-wrap:balance; }
.st-banner h1 span { color:var(--gold); }
.st-banner p { font-size:16.5px; line-height:1.6; color:rgba(255,255,255,.86); margin:0 auto; max-width:600px; }

.st-main { max-width:520px; margin:28px auto 0; padding:0 16px 40px; position:relative; }
.st-card { background:#fff; border-radius:20px; box-shadow:0 24px 60px -30px rgba(15,61,36,.55); border:1px solid #e3ebe6; padding:22px 20px 18px; scroll-margin-top:12px; }
.st-card-h { margin-bottom:14px; }
.st-card-h h2 { font-size:21px; font-weight:800; color:var(--forest); margin:0; }
.st-card-h p { font-size:13.5px; color:#5b6b62; margin:3px 0 0; }
.st-f { display:grid; gap:6px; font-size:13px; font-weight:700; color:#334155; margin:0 0 13px; min-width:0; }
.st-f small { font-weight:500; color:#94a3b8; }
.st-f input, .st-f select, .st .st-in { width:100%; box-sizing:border-box; height:48px; border:1.5px solid #dbe3df !important; border-radius:12px !important; padding:0 14px; font:inherit; font-size:16px !important; font-weight:500; color:#0f1f17; background:#fff; outline:none; box-shadow:none !important; }
.st-f input:focus, .st-f select:focus, .st .st-in:focus { border-color:var(--green) !important; box-shadow:0 0 0 3px rgba(30,122,76,.14) !important; }
.st-g2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.st-chips { display:flex; flex-wrap:wrap; gap:7px; }
.st-chips button { border:1.5px solid #dbe3df; background:#fff; color:#334155; font:inherit; font-size:13.5px; font-weight:700; border-radius:999px; padding:8px 13px; cursor:pointer; }
.st-chips button.on { background:#ecf7ef; border-color:var(--green); color:var(--forest); }
.st-hp { position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
.st-err { background:#fdf0f0; color:#b91c1c; border-radius:10px; padding:9px 12px; font-size:13.5px; margin:0 0 10px; }
.st .st-cta { display:flex; align-items:center; justify-content:center; width:100%; height:54px; border:0 !important; border-radius:14px; background:linear-gradient(135deg,#14532d,#1e7a4c) !important; color:#fff !important; font:inherit; font-size:16.5px; font-weight:800; cursor:pointer; text-decoration:none; box-shadow:0 14px 28px -14px rgba(20,83,45,.9); }
.st .st-cta:hover { filter:brightness(1.08); color:#fff !important; }
.st .st-cta:disabled { opacity:.75; cursor:default; }
.st .st-cta.wa { background:#128c4a !important; }
.st-fine { font-size:11.5px; color:#94a3b8; text-align:center; margin:10px 0 0; line-height:1.5; }
.st-fine a { color:#5b6b62; }
.st-points { list-style:none; margin:18px 0 6px; padding:0; display:flex; flex-wrap:wrap; justify-content:center; gap:8px; }
.st-points li { font-size:13px; font-weight:700; color:var(--forest); background:#fff; border:1px solid #d6eadc; border-radius:999px; padding:6px 12px; }
.st-points li::before { content:"✓ "; color:var(--green); }
.st-trust { text-align:center; font-size:13px; color:#5b6b62; margin:6px 0 0; }
.st-trust b { color:#b07a14; }
.st-done { text-align:center; display:grid; gap:12px; justify-items:center; padding:8px 0 4px; }
.st-done-ic { width:72px; height:72px; border-radius:50%; display:grid; place-items:center; background:#ecf7ef; color:var(--green); font-size:38px; font-weight:900; animation:stPop .45s cubic-bezier(.34,1.56,.64,1); }
.st-done h2 { margin:0; font-size:22px; color:var(--forest); }
.st-done p { margin:0; font-size:15px; line-height:1.6; color:#334155; }
.st-link { font-size:14px; font-weight:700; color:var(--green); }
@keyframes stUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
@keyframes stPop { from { transform:scale(.4); opacity:0 } to { transform:scale(1); opacity:1 } }
/* phones: logo + hook + the whole form on one screen, no scrolling */
@media (max-width:600px) {
  .st-top { padding:8px 14px; }
  .st-logo img { width:132px; }
  .st-main { margin-top:14px; padding:0 12px 10px; width:100%; box-sizing:border-box; }
  .st-card { padding:14px 14px 12px; border-radius:18px; }
  .st-card-h { margin-bottom:10px; }
  .st-card-h h2 { font-size:18px; }
  .st-card-h p { font-size:12.5px; }
  .st-f { gap:5px; margin-bottom:10px; font-size:12.5px; }
  .st-f input, .st-f select, .st .st-in { height:44px; }
  .st-chips { gap:6px; }
  .st-chips button { padding:6px 11px; font-size:12.5px; }
  .st-g2 { grid-template-columns:1fr 1fr; gap:8px; }
  .st .st-cta { height:50px; font-size:16px; }
  .st-fine { font-size:10.5px; margin-top:7px; }
  .st-points, .st-trust { display:none; }
  .st-sign { padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px)); }
  .st-sign b { font-size:48px; }
  .st-line { font-size:13.5px; margin-bottom:6px; }
}
/* short phones: a smaller signature, and none at all on the smallest, so nothing needs scrolling */
@media (max-width:600px) and (max-height:680px) {
  .st-sign { padding-top:8px; padding-bottom:10px; gap:2px; }
  .st-sign b { font-size:36px; }
  .st-sign span { font-size:11.5px; }
  .st-line { font-size:12.5px; margin-bottom:4px; }
}
@media (max-width:600px) and (max-height:600px) { .st-sign { display:none; } }
@media (max-width:600px) and (max-height:700px) {
  .st-card-h p { display:none; }
}
@media (prefers-reduced-motion:reduce) { .st-banner-in, .st-done-ic { animation:none; } }
`;
