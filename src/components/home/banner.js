import React, { useEffect, useMemo, useState } from "react";
import { usePublicStats, sessionsText, ratingText, reviewsText } from "../../utils/public-stats";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiUrl, imagePath } from "../../utils/url";
import Star from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { thumb } from "../../utils/thumb";
import { getMinFee } from "../../utils/therapist-directory";
import { GBP_URL } from "../about/visit-centre";
import { RegistrationsBand } from "../about/registrations";

// quick concern picks under the search box -> the concern's own page (/therapy-for/<slug>),
// not the directory with ?concern= (parameter links are crawl noise)
const QUICK = [
  ["Anxiety", "anxiety"],
  ["Stress", "stress"],
  ["Relationships", "relationships"],
  ["Low mood", "depression"],
  ["Anger", "anger"],
];

// the banner turns through these: a colour and one encouraging word. They say nothing about the therapist shown.
// c: panel; soft, soft2: the arcs around it; ink: words and buttons on the sage base (kept dark enough to read)
// a touch deeper than before, so the hero doesn't look washed out on the sage background
const THEMES = [
  { id: "hope", word: "HOPE", c: "#72b04c", soft: "#acd283", soft2: "#c9dfb2", ink: "#2f6b38" },
  { id: "courage", word: "COURAGE", c: "#e3716b", soft: "#eba996", soft2: "#eecdbb", ink: "#b13a49" },
  { id: "calm", word: "CALM", c: "#5fa6d8", soft: "#a4cbe0", soft2: "#c8dcd6", ink: "#25618f" },
  { id: "strength", word: "STRENGTH", c: "#d08f46", soft: "#e2b878", soft2: "#e8d3a8", ink: "#935512" },
];
const TURN_MS = 5000;

// same event the "Chat with CYT" lead form listens for (components/global/booking-popup.js)
const OPEN_CHAT_EVENT = "cyt:open-chat";

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function langList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((l) => String(l).trim()).filter(Boolean);
  return String(raw).split(",").map((l) => l.trim()).filter(Boolean);
}

function expLabel(raw) {
  if (!raw) return "";
  const v = String(raw).trim();
  return /year|yr/i.test(v) ? v.replace(/years?/i, "yrs") : `${v} yrs`;
}

// no reviews yet -> "New", never a made-up 5.0
function rating(t) {
  const r = (t.reviews || []).filter((x) => typeof x.rating === "number");
  return r.length ? { avg: (r.reduce((a, x) => a + x.rating, 0) / r.length).toFixed(1), count: r.length } : null;
}

const photo = (t) => (t.user?.profile ? `${imagePath}/${t.user.profile}` : "");

// One link per card (the name, stretched over the whole card) + a "Book now" button.
function TherapistCard({ t, onBroken }) {
  const r = rating(t);
  const name = t.user?.name || "Therapist";
  const langs = langList(t.language_spoken).slice(0, 2).join(", ");
  const fee = getMinFee(t.fees);
  const exp = expLabel(t.year_of_exp);
  return (
    <div className="cyt-tcard">
      <div className="cyt-tphoto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb(photo(t), 640, 90)} srcSet={`${thumb(photo(t), 640, 90)} 1x, ${thumb(photo(t), 1080, 90)} 2x`} alt={name} loading="lazy" decoding="async" onError={onBroken} />
      </div>
      <div className="cyt-tbody">
        <Link className="cyt-tname cyt-stretch" href={profilePath(t)}>
          <span>{name}</span><VerifiedRounded sx={{ fontSize: 17, color: "#1d9bf0", flexShrink: 0 }} />
        </Link>
        <div className="cyt-trole">{t.profile_type || "Mental Health Professional"}</div>
        <div className="cyt-tmeta">
          <span className="cyt-trate">{r ? <><Star sx={{ fontSize: 15, color: "#e3a83a" }} /><b>{r.avg}</b> ({r.count})</> : <b className="cyt-tnew">New</b>}</span>
          {exp && <span>{exp}</span>}
          {langs && <span>{langs}</span>}
        </div>
        <div className="cyt-trow">
          {fee ? <span className="cyt-tfee"><small>Session from</small><b>₹{fee.toLocaleString("en-IN")}</b></span> : <span />}
          <Link className="cyt-b" href={bookPath(t)}>Book now<span className="cyt-sr"> with {name}</span></Link>
        </div>
      </div>
    </div>
  );
}

// stats: { count, minFee } of the whole directory, worked out on the server
export default function Banner({ topTherapists = [], stats = null }) {
  const ps = usePublicStats();
  // Server order first (so server and browser HTML match), re-ordered after mount —
  // same top-rated pool, different order each visit.
  const [ranked, setRanked] = useState(topTherapists);
  useEffect(() => {
    // strongest first: photo + reviews, then photo only, then the rest — shuffled within each group
    const tier = (t) => (photo(t) ? 2 : 0) + (rating(t) ? 1 : 0);
    const groups = [3, 2, 1, 0].map((k) => shuffled(topTherapists.filter((t) => tier(t) === k)));
    setRanked(groups.flat());
  }, [topTherapists]);

  // a photo that won't load drops that person from the banner, rather than showing an empty card
  const [broken, setBroken] = useState([]);
  const dropPhoto = (t) => setBroken((b) => [...b, t._id]);

  const people = useMemo(() => ranked.filter((t) => photo(t) && !broken.includes(t._id)), [ranked, broken]);

  // fetched ahead, so a card that slides in already has its photo
  useEffect(() => { people.slice(0, 8).forEach((t) => { new Image().src = thumb(photo(t), 640, 85); }); }, [people]);

  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false); // the pause button, or the visitor chose a dot
  const [resting, setResting] = useState(false); // pointer or keyboard focus on the cards
  const cur = THEMES[turn % THEMES.length];
  // the next person leads on each turn, and the following ones stand beside them
  const list = people.length ? [...people.slice(turn % people.length), ...people.slice(0, turn % people.length)] : [];
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true); }, []);
  useEffect(() => {
    if (paused || resting || people.length < 2) return undefined;
    const t = setInterval(() => setTurn((n) => n + 1), TURN_MS);
    return () => clearInterval(t);
  }, [paused, resting, people.length]);

  // live Noida offer (admin → Coupons → "show on booking page"); nothing shows when none is running
  const [offer, setOffer] = useState(null);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/offers`)
      .then((r) => r.json())
      .then((d) => { if (d?.status && d.data?.length) setOffer(d.data[0]); })
      .catch(() => {});
  }, []);

  const [q, setQ] = useState("");

  return (
    <>
    <section className="rbt-banner-area rbt-banner-1 variation-2 cyt-hero" style={{ "--ink": cur.ink }}>
      {THEMES.map((c) => (
        <span key={c.id} className={`cyt-bgl${c === cur ? " on" : ""}`} style={{ "--c": c.c, "--soft": c.soft, "--soft2": c.soft2 }} aria-hidden="true" />
      ))}
      <span key={cur.id} className="cyt-word" style={{ "--c": cur.c, "--len": cur.word.length }} aria-hidden="true">
        <b>{cur.word}</b><i>{cur.word}</i>
      </span>
      <div className="cyt-hero-inner">
        <div className="cyt-hero-copy">
          <p className="cyt-eyebrow">
            <span className="cyt-live" aria-hidden="true" />
            {stats?.count
              ? <>{stats.count} verified psychologists{stats.minFee ? <> · sessions from ₹{stats.minFee.toLocaleString("en-IN")}</> : null}</>
              : <>Verified psychologists · online &amp; in-person</>}
          </p>

          <h1 className="title cyt-title">
            Talk to a verified <span className="cyt-hl">psychologist</span><br /> online, anywhere in India.
          </h1>

          <p className="description">
            For anxiety, stress, low mood or relationships — in Hindi, English and more, by video or at our Noida centre.
          </p>

          <form className="cyt-hsearch" action="/view-all-therapist" method="get" role="search">
            <i className="feather-search" aria-hidden="true" />
            <label htmlFor="cyt-hq" className="cyt-sr">Search by concern, name or city</label>
            <input id="cyt-hq" name="search" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Anxiety, therapist name, city…" />
            <button type="submit" aria-label="Find therapist"><span className="cyt-hs-txt">Find therapist</span><i className="feather-arrow-right cyt-hs-ico" aria-hidden="true" /></button>
          </form>

          <div className="cyt-hchips" aria-label="Popular concerns">
            {QUICK.map(([label, value]) => (
              <Link key={value} href={`/therapy-for/${value}`}>{label}<span className="cyt-sr"> therapy</span></Link>
            ))}
            <Link className="cyt-help" href="/view-all-therapist?help=1" rel="nofollow"><i className="feather-compass" aria-hidden="true" /> Help me choose</Link>
          </div>

          <div className="cyt-hero-ctas">
            <Link className="cyt-cta2" href={offer ? "/noida-appointment?offer=1" : "/noida-appointment"}
              title="Book a psychologist in Noida, Sector 51 — in-person, online or home visit">
              <i className="feather-map-pin" aria-hidden="true" /> <span className="cyt-cta2-txt">Book a Psychologist in Noida<small>In-person · Sector 51 · online too</small></span>
              <i className="feather-arrow-right cyt-cta2-go" aria-hidden="true" />
              {offer && <span className="cyt-cta2-badge">{offer.discount.replace(/ off$/i, "")} OFF</span>}
            </Link>
            <button type="button" className="cyt-wa" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
              <i className="feather-message-circle" aria-hidden="true" /> Prefer to talk first? <b>Get matched on WhatsApp</b>
            </button>
          </div>

          <ul className="cyt-trust" aria-label="Why people choose us">
            <li><a href={GBP_URL} target="_blank" rel="noreferrer"><Star sx={{ fontSize: 15, color: "#d4a24c" }} /> <span style={{ fontWeight: 700 }}>{ratingText(ps)}</span> on Google <span>({reviewsText(ps)} reviews)</span></a></li>
            <li><VerifiedRounded sx={{ fontSize: 15, color: "#1e7a4c" }} /> <span style={{ fontWeight: 700 }}>{sessionsText(ps)}</span> sessions</li>
            <li className="cyt-trust-x"><i className="feather-lock" /> 100% confidential</li>
          </ul>
        </div>

        <div className="cyt-hero-visual" onMouseEnter={() => setResting(true)} onMouseLeave={() => setResting(false)} onFocus={() => setResting(true)} onBlur={() => setResting(false)}>
          {list.length ? (
            <>
              {/* desktop: one card to the front; phones and tablets: a row to swipe */}
              <div className="cyt-stage" key={list[0]._id}>
                {list.slice(1, 3).map((t, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={t._id} className={`cyt-back b${i}`} src={thumb(photo(t), 640, 85)} alt="" onError={() => dropPhoto(t)} />
                ))}
                <div className="cyt-spot"><TherapistCard t={list[0]} onBroken={() => dropPhoto(list[0])} /></div>
              </div>
              <div className="cyt-strip" key={`strip-${list[0]._id}`} aria-label="Top-rated therapists">
                {list.slice(0, 6).map((t, i) => <TherapistCard key={t._id || i} t={t} onBroken={() => dropPhoto(t)} />)}
              </div>
              <div className="cyt-dots" role="group" aria-label="Choose a slide">
                {THEMES.map((c, i) => (
                  <button key={c.id} type="button" className={c === cur ? "on" : ""} aria-label={c.word} aria-pressed={c === cur}
                    onClick={() => { setTurn(i); setPaused(true); }} />
                ))}
                <button type="button" className="cyt-cpause" aria-label={paused ? "Play" : "Pause"} onClick={() => setPaused((x) => !x)}>
                  <i className={paused ? "feather-play" : "feather-pause"} aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <div className="cyt-cover-skeleton" />
          )}
        </div>
      </div>

      <style jsx global>{`
        /* sage on the left; the slide's colour fans out from the right in arcs (cyt-bgl) */
        .cyt-hero { position: relative; overflow: hidden; padding: 48px 0 52px; }
        .rbt-banner-1.cyt-hero { --ink: #2f6b38; background: #e2ece1; }
        @media (min-width: 768px) { .rbt-banner-1.cyt-hero { padding-bottom: 76px !important; } }
        @media (min-width: 768px) and (max-width: 1199px) { .rbt-banner-1.cyt-hero { padding-bottom: 60px !important; } }
        @media (max-width: 767px) { .rbt-banner-1.cyt-hero { padding-bottom: 44px !important; } }
        /* phones: no slide dots above the logo strip (the slides still change on their own) */
        @media (max-width: 767px) { .cyt-hero .cyt-dots { display: none !important; } }
        .cyt-bgl { position: absolute; inset: 0; z-index: 0; opacity: 0; transition: opacity .8s ease; pointer-events: none;
          background: linear-gradient(180deg, transparent 42%, var(--soft) 100%), radial-gradient(circle at 106% 50%, var(--c) 0 27vw, var(--soft) 27.1vw 38vw, var(--soft2) 38.1vw 50vw, transparent 50.1vw); }
        .cyt-bgl.on { opacity: 1; }
        @media (max-width: 1023px) {
          .cyt-bgl { background: linear-gradient(180deg, transparent 42%, var(--soft2) 100%), radial-gradient(circle at 108% 100%, var(--c) 0 42vw, var(--soft) 42.2vw 66vw, var(--soft2) 66.2vw 92vw, transparent 92.2vw); }
        }
        /* Desktop: the hero runs up behind the floating navbar. The zoom-safe over-pull +
           matching top padding live in navbar.js so every page's banner gets the same treatment. */

        .cyt-hero-inner { position: relative; z-index: 2; max-width: 1380px; margin: 0 auto; padding: 0 20px; display: flex; flex-direction: column; gap: 34px; align-items: center; }
        .cyt-hero-copy { width: 100%; max-width: 620px; }
        .cyt-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        .cyt-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 16px; padding: 7px 14px 7px 12px; border-radius: 999px; background: rgba(255,255,255,.85); border: 1px solid #dfeae3; box-shadow: 0 6px 16px -10px rgba(20,83,45,.35); font-size: 13px; font-weight: 700; color: #14532d; line-height: 1.3; }
        .cyt-live { width: 8px; height: 8px; border-radius: 50%; background: #22a35a; box-shadow: 0 0 0 3px rgba(34,163,90,.2); flex-shrink: 0; }

        .cyt-hero .cyt-title { color: #0b1712; font-size: clamp(2.8rem, 5vw, 4.6rem); line-height: 1.12; margin: 0 0 12px; letter-spacing: -.02em; font-weight: 800; }
        .cyt-hl { color: #1e7a4c; position: relative; white-space: nowrap; }
        /* hand-drawn gold swoosh under the key word */
        .cyt-hl::after { content: ""; position: absolute; left: -2%; right: -2%; bottom: -.1em; height: .3em; background: url("data:image/svg+xml,%3Csvg xmlns='http:%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 300 24' preserveAspectRatio='none'%3E%3Cpath d='M4 17 C 60 7, 140 4, 296 11' fill='none' stroke='%23e0ab45' stroke-width='8' stroke-linecap='round'/%3E%3Cpath d='M30 21 C 110 14, 190 13, 270 17' fill='none' stroke='%23e0ab45' stroke-width='3' stroke-linecap='round' opacity='.55'/%3E%3C/svg%3E") no-repeat center / 100% 100%; z-index: -2; pointer-events: none;
          /* drawn in from the left, like a pen stroke */
          clip-path: inset(0 100% 0 0); animation: cytHlDraw .9s cubic-bezier(.65,0,.35,1) .35s forwards; }
        /* then a soft shine runs along the stroke every few seconds */
        .cyt-hl::before { content: ""; position: absolute; left: -2%; right: -2%; bottom: -.1em; height: .3em; z-index: -1; pointer-events: none;
          -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http:%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 300 24' preserveAspectRatio='none'%3E%3Cpath d='M4 17 C 60 7, 140 4, 296 11' fill='none' stroke='%23e0ab45' stroke-width='8' stroke-linecap='round'/%3E%3Cpath d='M30 21 C 110 14, 190 13, 270 17' fill='none' stroke='%23e0ab45' stroke-width='3' stroke-linecap='round' opacity='.55'/%3E%3C/svg%3E") no-repeat center / 100% 100%; mask: url("data:image/svg+xml,%3Csvg xmlns='http:%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 300 24' preserveAspectRatio='none'%3E%3Cpath d='M4 17 C 60 7, 140 4, 296 11' fill='none' stroke='%23e0ab45' stroke-width='8' stroke-linecap='round'/%3E%3Cpath d='M30 21 C 110 14, 190 13, 270 17' fill='none' stroke='%23e0ab45' stroke-width='3' stroke-linecap='round' opacity='.55'/%3E%3C/svg%3E") no-repeat center / 100% 100%;
          background: linear-gradient(100deg, transparent 40%, #fffdf3 50%, transparent 60%) no-repeat; background-size: 250% 100%; background-position: 160% 0;
          animation: cytHlShine 4.5s ease-in-out 1.5s infinite; }
        @keyframes cytHlDraw { to { clip-path: inset(0 0 0 0); } }
        @keyframes cytHlShine { 0% { background-position: 160% 0; } 35%, 100% { background-position: -60% 0; } }
        @media (prefers-reduced-motion: reduce) { .cyt-hl::after { animation: none; clip-path: none; } .cyt-hl::before { display: none; } }
        .cyt-hero .description { color: #475569; font-size: 17px; line-height: 1.6; max-width: 46ch; margin: 0 0 20px; }

        .cyt-hsearch { position: relative; display: flex; align-items: center; max-width: 580px; background: #fff; border: 1.5px solid #dbe5df; border-radius: 14px; padding: 5px; box-shadow: 0 16px 36px -22px rgba(20,83,45,.55); }
        .cyt-hsearch:focus-within { border-color: #1e7a4c; box-shadow: 0 0 0 3px #dcefe3, 0 16px 36px -22px rgba(20,83,45,.55); }
        .cyt-hsearch > i { position: absolute; left: 17px; font-size: 18px; color: #64748b; pointer-events: none; }
        .cyt-hsearch input { flex: 1; min-width: 0; height: 46px; border: none !important; outline: none; background: transparent; padding: 0 10px 0 42px; font-size: 15.5px; color: #0f172a; box-shadow: none !important; }
        .cyt-hsearch input::-webkit-search-cancel-button { display: none; }
        .cyt-hsearch button { flex-shrink: 0; height: 46px; padding: 0 22px; border: none; border-radius: 10px; background: #1e7a4c; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 18px -10px rgba(30,122,76,.8); }
        .cyt-hsearch button:hover { background: #186640; }
        .cyt-hs-ico, .cyt-cta2-go { display: none; }
        .cyt-cta2-txt small { display: none; }

        .cyt-hchips { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 0; }
        .cyt-hchips a { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 999px; background: rgba(255,255,255,.8); border: 1px solid #dbe5df; color: #26463a !important; font-size: 13.5px; font-weight: 600; text-decoration: none !important; white-space: nowrap; transition: border-color .15s, background .15s; }
        .cyt-hchips a:hover { border-color: #1e7a4c; background: #fff; color: #1e7a4c !important; }
        .cyt-hchips a.cyt-help { background: #fffaf0; border-color: #ecd3a3; color: #7a5413 !important; font-weight: 700; }

        .cyt-hero-ctas { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; margin-top: 22px; }
        .cyt-cta2 { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; padding: 0 20px; border-radius: 12px; border: 1.5px solid #1e7a4c; color: #14532d !important; background: rgba(255,255,255,.75); font-weight: 700; font-size: 15px; text-decoration: none !important; transition: background .2s, color .2s; }
        .cyt-cta2:hover { background: #1e7a4c; color: #fff !important; }
        /* phones: the Noida button moves to the bottom bar that slides up on scroll (MobileActionBar
           with noida) — it stays in the HTML here so the link and its text still count for search */
        @media (max-width: 767px) { .cyt-hero .cyt-cta2 { display: none !important; } }
        .cyt-cta2-badge { position: absolute; top: -10px; right: -8px; padding: 3px 8px; border-radius: 999px; background: #c2410c; color: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; line-height: 1.3; box-shadow: 0 4px 10px -2px rgba(194,65,12,.45); animation: cytBadgePop 2.4s ease-in-out infinite; }
        @keyframes cytBadgePop { 0%, 80%, 100% { transform: scale(1); } 88% { transform: scale(1.12); } }
        .cyt-wa { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; padding: 6px 0; font-size: 14px; color: #475569; cursor: pointer; text-align: left; }
        .cyt-wa i { color: #1e7a4c; font-size: 16px; }
        .cyt-wa b { color: #1e7a4c; font-weight: 800; text-decoration: underline; text-decoration-color: #ecc77d; text-decoration-thickness: 2px; text-underline-offset: 3px; }
        .cyt-wa:hover b { color: #14532d; }

        .cyt-trust { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 13px; color: #475569; }
        .cyt-trust li { display: inline-flex; align-items: center; gap: 5px; margin: 0; padding: 0; }
        .cyt-trust li::before { content: none; }
        .cyt-trust a { display: inline-flex; align-items: center; gap: 5px; color: inherit !important; text-decoration: none !important; }
        .cyt-trust a:hover { text-decoration: underline !important; }
        .cyt-trust b { color: #0b1712; } .cyt-trust span { color: #7c8b81; }
        .cyt-trust i { color: #1e7a4c; font-size: 14px; }
        .cyt-hero.cyt-hero .cyt-hl { color: var(--ink); transition: color .6s ease; }
        .cyt-hero.cyt-hero .cyt-hsearch button { background: var(--ink); color: #fff; transition: background .6s ease; }
        .cyt-hero.cyt-hero .cyt-hsearch button:hover { background: var(--ink); filter: brightness(.92); }
        .cyt-hero.cyt-hero .cyt-hchips a, .cyt-hero.cyt-hero .cyt-eyebrow { background: #fff; }

        /* the slide's word down the right edge */
        .cyt-word { display: none; }
        /* the dots, then the card that swings in */
        .cyt-dots { position: relative; z-index: 2; display: flex; align-items: center; gap: 2px; padding: 2px 6px; border-radius: 999px; background: rgba(255,255,255,.7); }
        .cyt-dots button { width: 24px; height: 28px; padding: 0; border: 0; background: none; cursor: pointer; display: grid; place-items: center; }
        .cyt-dots button:not(.cyt-cpause)::before { content: ""; width: 9px; height: 9px; border-radius: 9px; background: #b8c4bb; transition: width .25s ease, background .25s ease; }
        .cyt-dots button.on::before { width: 20px; background: var(--ink); }
        .cyt-dots .cyt-cpause { width: 28px; color: #33423a; font-size: 13px; }
        .cyt-stage { display: none; }
        .cyt-hero-visual { flex-direction: column; gap: 12px; }
        .cyt-hero-visual::before { display: none; }
        @keyframes cytWordIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
        @keyframes cytSwing { from { opacity: 0; transform: translateY(26px) rotate(7deg) scale(.95); } to { opacity: 1; transform: none; } }
        @keyframes cytBackIn { from { opacity: 0; } to { opacity: 1; } }
        .cyt-strip { animation: cytBackIn .5s ease both; }
        @media (min-width: 1024px) {
          .cyt-strip { display: none !important; }
          .cyt-stage { display: block; position: relative; width: 270px; height: 360px; }
          .cyt-spot { position: absolute; inset: 0; z-index: 2; animation: cytSwing .7s cubic-bezier(.22,1,.36,1) both; }
          /* desktop: the photo is the card, with the details and Book now on it */
          .cyt-spot .cyt-tcard { width: 100%; height: 100%; padding: 0; overflow: hidden; box-shadow: 0 30px 50px -24px rgba(20,40,30,.55); }
          .cyt-spot .cyt-tphoto { height: 100%; border-radius: 22px; }
          .cyt-spot .cyt-tbody { position: absolute; left: 0; right: 0; bottom: 0; padding: 48px 12px 10px; background: linear-gradient(180deg, transparent, rgba(5,20,12,.9) 52%); }
          .cyt-spot .cyt-tname { color: #fff !important; }
          .cyt-spot .cyt-trole, .cyt-spot .cyt-tmeta, .cyt-spot .cyt-trate b, .cyt-spot .cyt-tfee small { color: rgba(255,255,255,.9); }
          .cyt-spot .cyt-tfee b { color: #fff; }
          .cyt-spot .cyt-tmeta { margin-top: 5px; }
          .cyt-spot .cyt-trow { margin-top: 8px; padding-top: 0; border-top: 0; }
          .cyt-spot .cyt-trow .cyt-b { min-height: 40px; padding: 0 16px; background: #fff; color: var(--ink) !important; }
          .cyt-spot .cyt-tmeta > span:nth-child(3) { display: none; }
          /* measured from the bottom: the hero runs up behind the navbar, so its top isn't on screen */
          .cyt-word { position: absolute; bottom: 56px; height: 440px; right: 0; z-index: 1; display: flex; flex-direction: row-reverse; align-items: center; gap: 6px; pointer-events: none; animation: cytWordIn .7s ease both; }
          .cyt-word b, .cyt-word i { writing-mode: vertical-rl; transform: rotate(180deg); font-style: normal; font-weight: 800; line-height: 1; white-space: nowrap; }
          .cyt-word i { font-size: min(96px, calc(420px / (var(--len) * .76))); color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.62); }
          .cyt-word b { display: none; padding: 14px 5px; border-radius: 10px; background: rgba(255,255,255,.72); color: #22302a; font-size: 26px; letter-spacing: .02em; }
          .cyt-back { position: absolute; top: 40px; width: 180px; height: 250px; object-fit: cover; object-position: center 25%; border-radius: 20px; opacity: .9; animation: cytBackIn .6s ease both; box-shadow: 0 18px 34px -20px rgba(20,40,30,.5); }
          .cyt-back.b0 { left: -96px; transform: rotate(-8deg); }
          .cyt-back.b1 { right: -96px; transform: rotate(8deg); }
        }
        @media (min-width: 1300px) {
        }
        @media (min-width: 1300px) { .cyt-word b { display: block; } }
        @media (prefers-reduced-motion: reduce) { .cyt-bgl, .cyt-spot, .cyt-back, .cyt-strip, .cyt-word { animation: none !important; transition: none !important; } }

        .cyt-hero-visual { width: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
        .cyt-hero-visual::before { content: ""; position: absolute; width: 420px; height: 420px; right: 0; top: -30px; border-radius: 50%; background: radial-gradient(circle, rgba(88,168,118,.26), transparent 66%); filter: blur(30px); z-index: 0; pointer-events: none; }
        .cyt-new { display: inline-block; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; color: #7a5413; background: #fbf3e2; border-radius: 5px; padding: 2px 7px; }

        /* ── phone / tablet: swipeable card strip ── */
        .cyt-wall { display: none; }
        .cyt-strip { position: relative; z-index: 1; width: 100%; display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 4px 22px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .cyt-strip::-webkit-scrollbar { display: none; }
        .cyt-tcard { position: relative; flex: 0 0 min(70%, 262px); scroll-snap-align: start; padding: 8px; background: #fff; border-radius: 22px; box-shadow: 0 10px 22px -14px rgba(20,40,30,.4); }
        .cyt-tphoto { position: relative; height: 190px; border-radius: 16px; overflow: hidden; background: #e6efe9; }
        .cyt-tphoto img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; display: block; }
        .cyt-tbody { padding: 12px 8px 6px; }
        .cyt-tname { display: flex; align-items: center; gap: 5px; color: #0b1712 !important; font-size: 16px; font-weight: 800; line-height: 1.25; text-decoration: none !important; }
        .cyt-tname span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cyt-trole { margin-top: 1px; color: #55665c; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-tmeta { display: flex; align-items: center; flex-wrap: nowrap; margin-top: 8px; color: #55665c; font-size: 13px; white-space: nowrap; overflow: hidden; }
        .cyt-tmeta > span + span::before { content: "·"; margin: 0 6px; color: #9fb3a6; }
        .cyt-trate { display: inline-flex; align-items: center; gap: 3px; }
        .cyt-trate b { color: #0b1712; font-weight: 800; }
        .cyt-trow { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eef2ee; }
        .cyt-tfee small { display: block; color: #7c8b81; font-size: 11.5px; line-height: 1.2; }
        .cyt-tfee b { display: block; color: #0b1712; font-size: 18px; font-weight: 800; line-height: 1.2; }
        .cyt-trow .cyt-b { flex: none; min-height: 44px; display: inline-flex; align-items: center; padding: 0 20px; border-radius: 12px; background: var(--ink); color: #fff !important; font-size: 14.5px; font-weight: 800; text-decoration: none !important; transition: background .6s ease; }
        .cyt-cover-skeleton { width: 260px; height: 340px; border-radius: 22px; background: rgba(130,204,161,.18); }

        /* ── every width: copy as a column so the trust line sits right under the headline ── */
        .cyt-hero-copy { display: flex; flex-direction: column; align-items: flex-start; }
        .cyt-hero-copy > * { order: 3; }
        .cyt-hero-copy > .cyt-eyebrow { order: 0; }
        .cyt-hero-copy > .cyt-title { order: 1; }
        .cyt-hero-copy > .cyt-trust { order: 2; margin: 0 0 14px; }
        .cyt-hsearch, .cyt-hchips, .cyt-hero-ctas { width: 100%; box-sizing: border-box; }
        /* chips: one row, swipe / scroll for the rest */
        .cyt-hchips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
        .cyt-hchips::-webkit-scrollbar { display: none; }
        /* Noida booking: a soft white card with a gold accent — stands out without a block of green */
        .cyt-hero .cyt-cta2 { justify-content: flex-start; gap: 12px; min-height: 58px; padding: 9px 16px 9px 10px; font-size: 15px; text-align: left; color: #0b1712 !important; background: #fff; border: 1px solid #e6d7b8; border-left: 4px solid #d4a24c; box-shadow: 0 10px 24px -16px rgba(122,84,19,.55); }
        .cyt-hero .cyt-cta2:hover { background: #fffcf5; color: #0b1712 !important; }
        .cyt-cta2 > i.feather-map-pin { flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: #fbf3e2; display: inline-flex; align-items: center; justify-content: center; font-size: 17px; color: #b07a1c; }
        .cyt-cta2-txt { display: flex; flex-direction: column; line-height: 1.25; font-weight: 800; color: #14532d; }
        .cyt-hero .cyt-cta2-txt small { display: block; font-size: 12px; font-weight: 600; color: #64748b; }
        .cyt-hero .cyt-cta2-go { display: inline; margin-left: 14px; font-size: 18px; color: #1e7a4c; }
        .cyt-cta2-badge { top: -9px; right: 12px; }

        /* ── phone + iPad portrait: one column, Noida card full width ── */
        @media (max-width: 1023px) {
          .cyt-hero .description { display: none; }
          /* phones have the Call / Get matched bar */
          .cyt-wa { display: none !important; }
          .cyt-hero .cyt-cta2 { flex: 1 1 100%; }
          .cyt-hero .cyt-cta2-go { margin-left: auto; }
          .cyt-trust-x { display: none !important; }
        }
        @media (max-width: 600px) {
          .cyt-hero { padding: 10px 0 12px !important; }
          .cyt-hero-inner { gap: 14px; padding: 0 16px; }
          .cyt-hchips { width: calc(100% + 32px); }
          .cyt-eyebrow { font-size: 11.5px; padding: 5px 11px 5px 9px; margin-bottom: 8px; }
          .cyt-hero .cyt-title { font-size: clamp(2.05rem, 7.8vw, 2.6rem); line-height: 1.1; margin-bottom: 8px; }
          .cyt-hsearch { border-radius: 12px; }
          .cyt-hsearch input { height: 44px; font-size: 15px; padding-left: 38px; }
          .cyt-hsearch > i { left: 15px; }
          /* icon-only search button so the placeholder isn't cut off */
          .cyt-hsearch button { height: 44px; width: 44px; padding: 0; font-size: 20px; display: inline-flex; align-items: center; justify-content: center; }
          .cyt-hs-txt { display: none; }
          .cyt-hs-ico { display: inline; }
          /* one swipeable row of chips instead of three wrapped ones */
          .cyt-hchips { flex-wrap: nowrap; overflow-x: auto; margin: 12px -16px 0; padding: 0 16px 2px; scrollbar-width: none; }
          .cyt-hchips::-webkit-scrollbar { display: none; }
          .cyt-hchips a { height: 32px; font-size: 13px; padding: 0 12px; }
          .cyt-hero-ctas { margin-top: 14px; gap: 6px; }
          .cyt-trust { gap: 6px 14px; font-size: 12.5px; }
          .cyt-tphoto { height: 170px; }
        }
        @media (min-width: 601px) and (max-width: 1023px) {
          .cyt-hero { padding: 22px 0 24px !important; }
          .cyt-hero-inner { gap: 22px; padding: 0 40px; align-items: stretch; box-sizing: border-box; }
          /* iPad portrait: copy uses the full width (no empty space beside the headline),
             starting at the same 40px gutter as the sections below */
          .cyt-hero-copy { max-width: none; }
          .cyt-eyebrow { margin-bottom: 12px; }
          .cyt-hero .cyt-hero-copy .cyt-title { font-size: clamp(3.8rem, 6.5vw, 6.4rem); line-height: 1.08; margin-bottom: 14px; }
          .cyt-trust { font-size: 14.5px; gap: 8px 22px; }
          .cyt-hero-copy > .cyt-trust { margin-bottom: 18px; }
          .cyt-hsearch { max-width: none; }
          .cyt-hsearch input { height: 50px; font-size: 16px; }
          .cyt-hsearch button { height: 50px; padding: 0 26px; }
          /* one swipeable row of chips, like on phones */
          .cyt-hchips { flex-wrap: nowrap; overflow-x: auto; margin: 14px -40px 0; padding: 0 40px 2px; width: calc(100% + 80px); scrollbar-width: none; }
          .cyt-hchips::-webkit-scrollbar { display: none; }
          .cyt-hchips a { height: 38px; font-size: 14.5px; padding: 0 16px; }
          .cyt-hero-ctas { margin-top: 18px; }
          .cyt-cta2 { min-height: 64px; font-size: 16.5px; padding: 10px 18px 10px 12px; }
          .cyt-cta2 > i.feather-map-pin { width: 42px; height: 42px; font-size: 19px; }
          .cyt-cta2-txt small { font-size: 13px; }
          .cyt-tcard { flex-basis: 262px; }
        }

        /* ── desktop + iPad landscape: two-column scrolling card wall ── */
        @media (min-width: 1024px) {
          .cyt-strip, .cyt-hero-visual > .cyt-cover-skeleton { display: none; }
          .cyt-wall { display: grid; }
          .cyt-hero-inner { flex-direction: row; align-items: center; gap: 26px; padding: 0 clamp(56px, 6vw, 96px); box-sizing: border-box; }
          .cyt-hero-copy { flex: 0 0 52%; max-width: none; }
          .cyt-hero-visual { flex: 1; min-width: 0; justify-content: flex-end; }
          .cyt-hero-visual::before { top: -6px; width: 400px; height: 400px; }
          .cyt-hero .description { margin-bottom: 18px; }
          .cyt-hchips { margin-top: 12px; -webkit-mask-image: linear-gradient(90deg, #000 92%, transparent); mask-image: linear-gradient(90deg, #000 92%, transparent); }
          .cyt-hero-ctas { margin-top: 18px; gap: 12px 20px; }
        }
        /* iPad landscape / small desktop: trim the headline so it fits beside the wall */
        @media (min-width: 1024px) and (max-width: 1299px) {
          .cyt-hero .cyt-hero-copy .cyt-title { font-size: clamp(3.2rem, 3.3vw, 4rem); }
          .cyt-hero-inner { padding: 0 clamp(40px, 4.5vw, 56px); }
          .cyt-hero-copy { flex-basis: 50%; }
          .cyt-hero .cyt-wall { height: 520px; gap: 12px; }
          .cyt-hero .cyt-wall-track { gap: 12px; }
          .cyt-hero .cyt-ph { height: 250px; }
        }
        @media (min-width: 1440px) { .cyt-hero .cyt-wall { max-width: 620px; } }
        @media (min-width: 1300px) {
          /* line the copy up with the logo and the sections below (they use ~40px gutters) */
          .cyt-hero-inner { gap: 30px; padding: 0 40px; }
          .cyt-hero-copy { flex: 0 0 54%; }
          .cyt-hero-visual::before { top: -10px; width: 470px; height: 470px; }
        }

        .cyt-wall {
          position: relative; z-index: 1; width: 100%; max-width: 540px; height: 580px;
          grid-template-columns: 1fr 1fr; gap: 16px; overflow: hidden;
          -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 16%, #000 84%, transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0, #000 16%, #000 84%, transparent 100%);
          animation: cytCoverIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cytCoverIn { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        .cyt-wall-col { min-width: 0; }
        .cyt-wall-track { display: flex; flex-direction: column; gap: 16px; padding: 12px 0; }
        .cyt-wall.is-moving .cyt-wall-col.up .cyt-wall-track { animation: cytWallUp linear infinite; }
        .cyt-wall.is-moving .cyt-wall-col.down .cyt-wall-track { animation: cytWallDown linear infinite; }
        .cyt-wall.is-moving:hover .cyt-wall-track,
        .cyt-wall.is-moving:focus-within .cyt-wall-track { animation-play-state: paused; }
        /* the list is doubled, so moving by half its height (plus half a gap) loops seamlessly */
        @keyframes cytWallUp { from { transform: translateY(0); } to { transform: translateY(calc(-50% - 8px)); } }
        @keyframes cytWallDown { from { transform: translateY(calc(-50% - 8px)); } to { transform: translateY(0); } }
        .cyt-wall:not(.is-moving) { overflow-y: auto; -webkit-mask-image: none; mask-image: none; }

        /* desktop wall: photo card */
        .cyt-ph { position: relative; display: block; flex-shrink: 0; height: 290px; border-radius: 22px; overflow: hidden; background: linear-gradient(150deg, #c3e8d2, #82cca1); text-decoration: none !important; box-shadow: 0 18px 36px -16px rgba(18,66,42,.38), 0 3px 8px rgba(18,66,42,.06); transition: transform .25s ease, box-shadow .25s ease; }
        .cyt-stretch::after { content: ""; position: absolute; inset: 0; z-index: 1; }
        .cyt-trow .cyt-b { position: relative; z-index: 2; }
        .cyt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .cyt-ph { cursor: pointer; }
        .cyt-ph-name a { color: inherit !important; text-decoration: none !important; }
        .cyt-ph:hover, .cyt-ph:focus-within { transform: translateY(-4px); box-shadow: 0 26px 44px -18px rgba(18,66,42,.45); }
        .cyt-ph:has(a:focus-visible) { outline: 3px solid #ecc77d; outline-offset: 2px; }
        .cyt-ph-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 22%; transition: transform .5s ease; }
        .cyt-ph:hover .cyt-ph-img { transform: scale(1.04); }
        .cyt-ph-init { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; color: #1e7a4c; }
        .cyt-ph-fee { position: absolute; top: 12px; left: 12px; font-size: 11px; font-weight: 800; background: rgba(255,255,255,.94); color: #14532d; padding: 3px 10px; border-radius: 999px; }
        /* a short shade, only behind the text — the face above stays clear */
        .cyt-ph-info { position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; gap: 2px; padding: 34px 14px 13px; color: #fff; background: linear-gradient(180deg, rgba(8,32,20,0) 0%, rgba(8,32,20,.7) 45%, rgba(8,32,20,.88) 100%); }
        .cyt-ph-name { display: flex; align-items: center; gap: 5px; font-weight: 800; font-size: 15.5px; line-height: 1.25; white-space: nowrap; overflow: hidden; }
        .cyt-ph-role { font-size: 12px; color: rgba(255,255,255,.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-ph-meta { display: flex; align-items: center; gap: 4px; margin-top: 3px; font-size: 12px; color: rgba(255,255,255,.85); white-space: nowrap; }
        .cyt-ph-meta .cyt-ph-avg { color: #fff; font-weight: 800; }
        .cyt-ph-new { font-weight: 800; color: #14532d; background: #ecc77d; border-radius: 5px; padding: 1px 6px; font-size: 10.5px; }
        .cyt-ph-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.6); margin: 0 4px; }

        @media (prefers-reduced-motion: reduce) {
          .cyt-cta2-badge, .cyt-wall, .cyt-wall-track, .cyt-ph, .cyt-ph-img { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
    <RegistrationsBand />
    </>
  );
}
