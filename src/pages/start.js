import React, { useEffect, useRef, useState } from "react";
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
   Very little text, one short form. On phones the form is a bottom sheet you can drag (or tap) up to
   open and down to tuck away. Every lead goes to admin → Leads (source "Campaign · <utm_source>",
   form "Campaign · Client" / "Campaign · Therapist"), with the utm / click ids kept on the lead. */

const SITE = "https://www.chooseyourtherapist.in";
const WA = "918077757951";

const AUD = {
  client: {
    tab: "I need support",
    kicker: "Talk to a verified psychologist",
    hook: "Feeling low, stressed or stuck?",
    hook2: "You don't have to handle it alone.",
    sub: "Leave your number. Our care team calls you back and matches you with the right psychologist — online or at our Noida centre.",
    points: ["Verified psychologists", "100% private", "Online across India"],
    img: "/assets/img/hero/noida-client-talk",
    alt: "A woman talking to a psychologist in a calm room",
    formTitle: "Get a call back",
    formSub: "Takes 30 seconds. No payment now.",
    cta: "Request a call back",
  },
  therapist: {
    tab: "I'm a therapist",
    kicker: "For psychologists & counsellors",
    hook: "Get clients without chasing them.",
    hook2: "Grow your practice with CYT.",
    sub: "Join a verified network. Get booked online and at our Noida centre — and keep 70% of every session.",
    points: ["Clients matched to you", "Your own profile page", "Keep 70% per session"],
    img: "/assets/img/hero/in-consultation",
    alt: "A psychologist in a session with a client",
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
const MODES = ["Online", "In person (Noida)"];
const ROLES = ["Counselling Psychologist", "Clinical Psychologist", "Psychiatrist", "Psychotherapist / Counsellor", "Other"];

export default function CampaignStart({ initialWho = "client" }) {
  const router = useRouter();
  const [who, setWho] = useState(initialWho);
  const [open, setOpen] = useState(false);     // phone bottom sheet expanded?
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [mode, setMode] = useState("Online");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [hp, setHp] = useState("");            // honeypot
  const drag = useRef(null);
  const a = AUD[who];
  const m = META[initialWho] || META.client;

  // lock the page behind the open sheet (phones only)
  useEffect(() => {
    if (!open || window.innerWidth > 899) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const switchTo = (k) => { setWho(k); setErr(""); };

  // drag the sheet's handle: up opens, down closes; a tap toggles
  const onDown = (e) => { drag.current = { y: e.clientY, moved: false }; };
  const onMove = (e) => { if (drag.current && Math.abs(e.clientY - drag.current.y) > 8) drag.current.moved = true; };
  const onUp = (e) => {
    const d = drag.current; drag.current = null;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (!d.moved) setOpen((v) => !v);
    else if (dy < -30) setOpen(true);
    else if (dy > 30) setOpen(false);
  };

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
    const src = `Campaign · ${utm.utm_source || "direct"}`;
    const concern = who === "client"
      ? `${concerns.length ? concerns.join(", ") : "Not sure yet"} · ${mode}`
      : `Therapist enquiry · ${role || "Role not given"}${city.trim() ? ` · ${city.trim()}` : ""}`;
    setBusy(true);
    try {
      const res = await postFormUrlEncoded(SubmitConsultationUrl, {
        name: name.trim(),
        phone: fullPhone(code, phone),
        email: email.trim(),
        subject: who === "client" ? "Campaign · Client" : "Campaign · Therapist",
        concern,
        location: who === "client" ? (mode === "Online" ? "Online" : "Noida") : (city.trim() || ""),
        message: who === "therapist" && role ? `Role: ${role}` : "",
        source: src,
        audience: who,
        page: "/start",
        ...utm,
      });
      if (!res?.status) throw new Error(res?.message || "Something went wrong. Please try again.");
      setDone(true);
      setOpen(true);
      try { localStorage.setItem("cyt_lead_sent", String(Date.now())); } catch { /* storage blocked */ }
      try { window.gtag?.("event", "generate_lead", { form: `campaign_${who}`, source: utm.utm_source || "direct" }); } catch { /* no gtag */ }
      try { window.fbq?.("track", "Lead", { content_name: `campaign_${who}` }); } catch { /* no pixel */ }
    } catch (x) {
      setErr(x?.response?.data?.message || x.message || "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  const toggleConcern = (c) => setConcerns((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

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
        <link rel="preload" as="image" href={`${AUD[initialWho].img}-900.webp`} media="(max-width: 899px)" />
        <link rel="preload" as="image" href={`${AUD[initialWho].img}-1920.webp`} media="(min-width: 900px)" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className={`st st-${who}`}>
        <header className="st-top">
          <Link href="/" className="st-logo" aria-label="Choose Your Therapist home">
            <img src="/logo.png" alt="Choose Your Therapist" width="168" height="44" />
          </Link>
          <div className="st-tabs" role="tablist" aria-label="Who is this for">
            {Object.entries(AUD).map(([k, v]) => (
              <button key={k} type="button" role="tab" aria-selected={who === k} className={who === k ? "on" : ""} onClick={() => switchTo(k)}>{v.tab}</button>
            ))}
          </div>
        </header>

        <section className="st-hero">
          <picture className="st-bg" key={who}>
            <source media="(max-width: 899px)" srcSet={`${a.img}-900.webp`} />
            <img src={`${a.img}-1920.webp`} alt={a.alt} fetchpriority="high" />
          </picture>
          <div className="st-hero-in">
            <div className="st-copy" key={`c-${who}`}>
              <span className="st-kicker">{a.kicker}</span>
              <h1>{a.hook}<span>{a.hook2}</span></h1>
              <p>{a.sub}</p>
              <ul className="st-points">{a.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <div className="st-trust"><b>★ 5.0</b> on Google · Helping people since 2020</div>
            </div>

            {/* the form: a card on bigger screens, a drag-up sheet on phones */}
            <aside className={`st-sheet${open ? " open" : ""}${done ? " done" : ""}`} aria-label={a.formTitle}>
              <div className="st-grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; }}
                role="button" tabIndex={0} aria-expanded={open} aria-label={open ? "Close the form" : "Open the form"}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}>
                <span className="st-handle" aria-hidden="true" />
                <div className="st-sheet-h">
                  <b>{done ? "Thank you!" : a.formTitle}</b>
                  <small>{done ? "We've got your details" : a.formSub}</small>
                </div>
                <span className="st-chev" aria-hidden="true">{open ? "▾" : "▴"}</span>
              </div>

              {!open && !done && (
                <button type="button" className="st-cta st-peek" onClick={() => setOpen(true)}>{a.cta} →</button>
              )}

              <div className="st-body">
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
                    <label className="st-f">Your name
                      <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} placeholder="Full name" />
                    </label>
                    <div className="st-f">Mobile number
                      <PhoneField code={code} onCode={setCode} value={phone} onChange={setPhone} inputClassName="st-in" required />
                    </div>

                    {who === "client" ? (
                      <>
                        <div className="st-f">What's on your mind? <small>optional</small>
                          <div className="st-chips">
                            {CONCERNS.map((c) => (
                              <button key={c} type="button" aria-pressed={concerns.includes(c)} className={concerns.includes(c) ? "on" : ""} onClick={() => toggleConcern(c)}>{c}</button>
                            ))}
                          </div>
                        </div>
                        <div className="st-f">How would you like to talk?
                          <div className="st-seg">
                            {MODES.map((m) => <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>{m}</button>)}
                          </div>
                        </div>
                      </>
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
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}

const CSS = `
.st { --forest:#0f3d24; --green:#1e7a4c; --gold:#e0ab45; --cream:#fffaf0; font-family:Inter,-apple-system,"Segoe UI",sans-serif; color:#0f1f17; background:var(--forest); min-height:100vh; min-height:100dvh; }
.st-top { position:absolute; top:0; left:0; right:0; z-index:5; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px max(20px, env(safe-area-inset-left,0px)); }
.st-logo { background:var(--cream); border-radius:14px; padding:7px 12px; display:inline-flex; box-shadow:0 8px 24px -12px rgba(0,0,0,.5); }
.st-logo img { width:150px; height:auto; display:block; }
.st-tabs { display:inline-flex; background:rgba(255,255,255,.14); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.25); border-radius:999px; padding:4px; gap:2px; }
.st-tabs button { border:0; background:none; color:#fff; font:inherit; font-size:13.5px; font-weight:700; padding:8px 14px; border-radius:999px; cursor:pointer; white-space:nowrap; }
.st-tabs button.on { background:#fff; color:var(--forest); }
.st-tabs button:focus-visible { outline:3px solid var(--gold); outline-offset:2px; }

.st-hero { position:relative; min-height:100vh; min-height:100dvh; display:flex; align-items:center; overflow:hidden; }
.st-bg { position:absolute; inset:0; animation:stFade .5s ease; }
.st-bg img { width:100%; height:100%; object-fit:cover; object-position:center 30%; display:block; }
.st-hero::before { content:""; position:absolute; inset:0; z-index:1; background:linear-gradient(90deg, rgba(8,32,19,.94) 0%, rgba(10,42,25,.82) 42%, rgba(10,42,25,.35) 75%, rgba(10,42,25,.15) 100%); }
.st-hero::after { content:""; position:absolute; inset:auto 0 0 0; height:6px; z-index:2; background:var(--gold); }
.st-hero-in { position:relative; z-index:3; width:100%; max-width:1180px; margin:0 auto; padding:110px 24px 60px; display:grid; grid-template-columns:minmax(0,1fr) 420px; gap:48px; align-items:center; }
.st-copy { color:#fff; animation:stUp .5s ease; }
.st-kicker { display:inline-block; font-size:12.5px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#f3d79a; background:rgba(224,171,69,.16); border:1px solid rgba(224,171,69,.4); border-radius:999px; padding:5px 12px; margin-bottom:16px; }
.st-copy h1 { font-size:clamp(34px,4.6vw,58px); line-height:1.08; font-weight:800; margin:0 0 16px; color:#fff; text-wrap:balance; letter-spacing:-.01em; }
.st-copy h1 span { display:block; color:var(--gold); }
.st-copy p { font-size:18px; line-height:1.6; color:rgba(255,255,255,.88); max-width:560px; margin:0 0 20px; }
.st-points { list-style:none; margin:0 0 22px; padding:0; display:flex; flex-wrap:wrap; gap:8px; }
.st-points li { font-size:14px; font-weight:700; color:#fff; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.25); border-radius:999px; padding:7px 14px; }
.st-points li::before { content:"✓ "; color:var(--gold); }
.st-trust { font-size:14px; color:rgba(255,255,255,.8); }
.st-trust b { color:var(--gold); }

.st-sheet { background:#fff; border-radius:22px; box-shadow:0 30px 70px -30px rgba(0,0,0,.6); overflow:hidden; animation:stUp .55s ease; }
.st-grab { display:flex; align-items:center; gap:10px; padding:18px 20px 10px; position:relative; cursor:default; touch-action:none; user-select:none; }
.st-handle, .st-chev { display:none; }
.st-sheet-h { display:flex; flex-direction:column; }
.st-sheet-h b { font-size:21px; font-weight:800; color:var(--forest); }
.st-sheet-h small { font-size:13.5px; color:#5b6b62; margin-top:2px; }
.st-body { padding:6px 20px 20px; }
.st .st-cta.st-peek { display:none; }
.st-f { display:grid; gap:6px; font-size:13px; font-weight:700; color:#334155; margin:0 0 12px; min-width:0; }
.st-f small { font-weight:500; color:#94a3b8; }
.st-f input, .st-f select, .st .st-in { width:100%; box-sizing:border-box; height:48px; border:1.5px solid #dbe3df !important; border-radius:12px !important; padding:0 14px; font:inherit; font-size:16px !important; font-weight:500; color:#0f1f17; background:#fff; outline:none; box-shadow:none !important; }
.st-f input:focus, .st-f select:focus, .st .st-in:focus { border-color:var(--green) !important; box-shadow:0 0 0 3px rgba(30,122,76,.14) !important; }
.st-g2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.st-chips { display:flex; flex-wrap:wrap; gap:7px; }
.st-chips button, .st-seg button { border:1.5px solid #dbe3df; background:#fff; color:#334155; font:inherit; font-size:13.5px; font-weight:700; border-radius:999px; padding:8px 13px; cursor:pointer; }
.st-chips button.on { background:#ecf7ef; border-color:var(--green); color:var(--forest); }
.st-seg { display:grid; grid-template-columns:1fr 1fr; gap:6px; background:#f1f5f3; border-radius:12px; padding:4px; }
.st-seg button { border:0; background:none; border-radius:9px; padding:10px 8px; }
.st-seg button.on { background:#fff; color:var(--forest); box-shadow:0 2px 8px rgba(15,61,36,.12); }
.st-hp { position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
.st-err { background:#fdf0f0; color:#b91c1c; border-radius:10px; padding:9px 12px; font-size:13.5px; margin:0 0 10px; }
.st .st-cta { display:flex; align-items:center; justify-content:center; width:100%; height:54px; border:0 !important; border-radius:14px; background:linear-gradient(135deg,#14532d,#1e7a4c) !important; color:#fff !important; font:inherit; font-size:16.5px; font-weight:800; cursor:pointer; text-decoration:none; box-shadow:0 14px 28px -14px rgba(20,83,45,.9); }
.st .st-cta:hover { filter:brightness(1.08); color:#fff !important; }
.st .st-cta:disabled { opacity:.75; cursor:default; }
.st .st-cta.wa { background:#128c4a !important; }
.st-fine { font-size:11.5px; color:#94a3b8; text-align:center; margin:10px 0 0; line-height:1.5; }
.st-fine a { color:#5b6b62; }
.st-done { text-align:center; display:grid; gap:12px; justify-items:center; padding:8px 0 4px; }
.st-done-ic { width:72px; height:72px; border-radius:50%; display:grid; place-items:center; background:#ecf7ef; color:var(--green); font-size:38px; font-weight:900; animation:stPop .45s cubic-bezier(.34,1.56,.64,1); }
.st-done h2 { margin:0; font-size:22px; color:var(--forest); }
.st-done p { margin:0; font-size:15px; line-height:1.6; color:#334155; }
.st-link { font-size:14px; font-weight:700; color:var(--green); }
@keyframes stUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
@keyframes stFade { from { opacity:.3 } to { opacity:1 } }
@keyframes stPop { from { transform:scale(.4); opacity:0 } to { transform:scale(1); opacity:1 } }

/* tablets: stack the copy above the card */
@media (max-width:1080px) and (min-width:900px) { .st-hero-in { grid-template-columns:minmax(0,1fr) 380px; gap:28px; } }

/* phones (and iPad portrait): the form becomes a bottom sheet */
@media (max-width:899px) {
  .st-top { padding:12px 14px; flex-wrap:wrap; }
  .st-logo img { width:120px; }
  .st-tabs button { padding:7px 11px; font-size:12.5px; }
  .st-hero { align-items:flex-start; }
  .st-hero::before { background:linear-gradient(180deg, rgba(8,32,19,.55) 0%, rgba(8,32,19,.78) 45%, rgba(8,32,19,.96) 100%); }
  .st-hero-in { grid-template-columns:minmax(0,1fr); padding:120px 18px 200px; }
  .st-copy p { font-size:16px; }
  .st-points li { font-size:13px; padding:6px 11px; }
  .st-sheet { position:fixed; left:0; right:0; bottom:0; z-index:99990; border-radius:24px 24px 0 0; box-shadow:0 -18px 50px -20px rgba(0,0,0,.55);
    max-height:88dvh; display:flex; flex-direction:column; transform:translateY(0); transition:max-height .35s cubic-bezier(.2,.8,.2,1); animation:stSheet .5s cubic-bezier(.2,.8,.2,1); padding-bottom:env(safe-area-inset-bottom,0px); }
  .st-sheet:not(.open) { max-height:150px; }
  .st-grab { cursor:grab; padding:14px 18px 8px; flex-direction:row; }
  .st-handle { display:block; position:absolute; top:7px; left:50%; width:44px; height:5px; margin-left:-22px; border-radius:9px; background:#d5ddd8; }
  .st-chev { display:grid; place-items:center; margin-left:auto; width:34px; height:34px; border-radius:50%; background:#f1f5f3; color:var(--forest); font-size:16px; }
  .st-sheet-h b { font-size:18px; }
  .st-sheet-h small { font-size:12.5px; }
  .st-body { overflow-y:auto; -webkit-overflow-scrolling:touch; padding:6px 18px 18px; }
  .st-sheet:not(.open) .st-body { display:none; }
  .st .st-cta.st-peek { display:flex; width:auto; margin:4px 18px 16px; }
  .st-g2 { grid-template-columns:minmax(0,1fr); gap:0; }
}
@keyframes stSheet { from { transform:translateY(100%) } to { transform:translateY(0) } }
@media (max-width:420px) { .st-copy h1 { font-size:31px; } .st-tabs { width:100%; } .st-tabs button { flex:1; } }
@media (prefers-reduced-motion:reduce) { .st-sheet, .st-copy, .st-bg, .st-done-ic { animation:none; transition:none; } }
`;
