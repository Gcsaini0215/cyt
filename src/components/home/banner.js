import React, { useEffect, useRef, useState } from "react";
import { usePublicStats, sessionsText, ratingText, reviewsText } from "../../utils/public-stats";
import Link from "next/link";
import { apiUrl, imagePath } from "../../utils/url";
import Star from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { thumb, thumbSet } from "../../utils/thumb";
import { getMinFee } from "../../utils/therapist-directory";
import { GBP_URL } from "../about/visit-centre";

// quick concern picks under the search box -> the directory, pre-filtered
const QUICK = [
  ["Anxiety", "Anxiety"],
  ["Stress", "Stress Management"],
  ["Relationships", "Couples Counselling"],
  ["Low mood", "Depression"],
  ["Anger", "Anger Management"],
];

// same event the "Chat with CYT" lead form listens for (components/global/booking-popup.js)
const OPEN_CHAT_EVENT = "cyt:open-chat";

function initialsOf(name) {
  if (!name) return "T";
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

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

const feeLabel = (t) => {
  const fee = getMinFee(t.fees);
  return fee ? `From ₹${fee.toLocaleString("en-IN")}` : "";
};

const photo = (t) => (t.user?.profile ? `${imagePath}/${t.user.profile}` : "");

// every area of expertise the therapist saved on their profile, as it was written
const expertiseOf = (t) => String(t?.experties || "").split(",").map((x) => x.trim()).filter(Boolean);

// five stars filled to the average (rounded to the nearest half)
function Stars({ avg = 0 }) {
  const v = Math.round(avg * 2) / 2;
  return (
    <span className="cyt-tstars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="cyt-tstar">
          <Star sx={{ fontSize: 14, color: "#dbe3dd" }} />
          {v >= i - 0.5 && <span className="cyt-tstar-on" style={{ width: v >= i ? "100%" : "50%" }}><Star sx={{ fontSize: 14, color: "#e3a83a" }} /></span>}
        </span>
      ))}
    </span>
  );
}

function TherapistCard({ t, hidden = false }) {
  const r = rating(t);
  const name = t.user?.name || "Therapist";
  const langs = langList(t.language_spoken).slice(0, 2);
  const fee = feeLabel(t);
  const exp = expLabel(t.year_of_exp);
  const skills = expertiseOf(t);
  const href = profilePath(t);
  const tab = hidden ? -1 : undefined; // the wall's second (loop) copy is skipped by keyboard + screen readers
  return (
    <div className="cyt-tcard" aria-hidden={hidden || undefined}>
      {/* photo and name both open the profile */}
      <Link className="cyt-tphoto" href={href} tabIndex={tab} aria-label={`View ${name}'s profile`}>
        {photo(t) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb(photo(t), 384)} srcSet={thumbSet(photo(t), 384, 640)} alt={name} loading="lazy" decoding="async" />
        ) : (
          <span className="cyt-tinit">{initialsOf(name)}</span>
        )}
        <span className="cyt-tverif" title="Verified"><VerifiedRounded sx={{ fontSize: 15 }} /></span>
        {fee && <span className="cyt-tpin">{fee}</span>}
      </Link>
      <div className="cyt-tbody">
        <Link className="cyt-tname" href={href} tabIndex={tab}>{name}</Link>
        <div className="cyt-trole">
          <span>{t.profile_type || "Mental Health Professional"}</span>
        </div>
        <div className="cyt-trate">
          <Stars avg={r ? Number(r.avg) : 0} />
          {r ? <><b>{r.avg}</b><span className="cyt-tcnt">({r.count})</span></>
            : <span className="cyt-tcnt">New</span>}
          {exp && <><i className="cyt-tdot" /><span className="cyt-tcnt">{exp}</span></>}
        </div>
        {skills.length > 0 && (
          /* expertise pills drifting left, same as the directory cards (list doubled for a seamless loop) */
          <div className="cyt-tskills" aria-label={`Areas of expertise: ${skills.join(", ")}`}>
            <div className="cyt-tmq" style={{ animationDuration: `${Math.max(18, skills.length * 5)}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} className="cyt-tmq-set" aria-hidden={copy === 1 || undefined}>
                  {skills.map((x) => <span key={x} className="cyt-tskill">{x}</span>)}
                </div>
              ))}
            </div>
          </div>
        )}
        {langs.length > 0 && (
          <div className="cyt-tlangs">
            {langs.map((l) => <span key={l} className="cyt-tlang">{l}</span>)}
          </div>
        )}
        <div className="cyt-trow">
          <Link className="cyt-v" href={href} tabIndex={tab}>View</Link>
          <Link className="cyt-b" href={bookPath(t)} tabIndex={tab}>Book</Link>
        </div>
      </div>
    </div>
  );
}

// desktop wall: just the photo — name, type, rating and fee on a short shade at the bottom,
// so the face stays clear. The whole card opens the profile.
function PhotoCard({ t, hidden = false }) {
  const r = rating(t);
  const name = t.user?.name || "Therapist";
  const exp = expLabel(t.year_of_exp);
  const fee = feeLabel(t);
  return (
    <Link className="cyt-ph" href={profilePath(t)} tabIndex={hidden ? -1 : undefined} aria-hidden={hidden || undefined} aria-label={`View ${name}'s profile`}>
      {photo(t) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cyt-ph-img" src={thumb(photo(t), 384)} srcSet={thumbSet(photo(t), 384, 640)} alt={name} loading="lazy" decoding="async" />
      ) : (
        <span className="cyt-ph-init">{initialsOf(name)}</span>
      )}
      {fee && <span className="cyt-ph-fee">{fee}</span>}
      <span className="cyt-ph-info">
        <span className="cyt-ph-name">{name}<VerifiedRounded sx={{ fontSize: 15, color: "#7dd3fc", flexShrink: 0 }} /></span>
        <span className="cyt-ph-role">{t.profile_type || "Mental Health Professional"}</span>
        <span className="cyt-ph-meta">
          {r ? <><Star sx={{ fontSize: 14, color: "#ecc77d" }} /><b>{r.avg}</b> ({r.count})</> : <span className="cyt-ph-new">New</span>}
          {exp && <><i className="cyt-ph-dot" />{exp}</>}
        </span>
      </span>
    </Link>
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

  const strip = ranked.slice(0, 10); // phone / tablet carousel
  /* desktop wall — two columns of cards drifting in opposite directions (CSS animation on a
     doubled list, so the loop is seamless); pauses on hover. Desktop vs phone is decided in
     CSS, not JS, so the server sends the right layout and nothing jumps after load. */
  const wallPool = ranked.slice(0, 12);
  const wallCols = [wallPool.filter((_, i) => i % 2 === 0), wallPool.filter((_, i) => i % 2 === 1)];
  const wallMoves = wallPool.length >= 4;

  // phone carousel: native swipe (scroll-snap) + a gentle auto-advance that stops for good
  // once the visitor touches it
  const stripRef = useRef(null);
  useEffect(() => {
    const el = stripRef.current;
    if (!el || strip.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stopped = false;
    const stop = () => { stopped = true; };
    el.addEventListener("pointerdown", stop);
    el.addEventListener("touchstart", stop, { passive: true });
    const t = setInterval(() => {
      if (stopped || el.offsetParent === null) return;
      const card = el.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 14 : el.clientWidth * 0.7;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: "smooth" });
    }, 3500);
    return () => { clearInterval(t); el.removeEventListener("pointerdown", stop); el.removeEventListener("touchstart", stop); };
  }, [strip.length]);

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
    <section className="rbt-banner-area rbt-banner-1 variation-2 cyt-hero">
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
              <Link key={value} href={`/view-all-therapist?concern=${encodeURIComponent(value)}`}>{label}</Link>
            ))}
            <Link className="cyt-help" href="/view-all-therapist?help=1"><i className="feather-compass" aria-hidden="true" /> Help me choose</Link>
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
            <li><a href={GBP_URL} target="_blank" rel="noreferrer"><Star sx={{ fontSize: 15, color: "#d4a24c" }} /> <b>{ratingText(ps)}</b> on Google <span>({reviewsText(ps)} reviews)</span></a></li>
            <li><VerifiedRounded sx={{ fontSize: 15, color: "#1e7a4c" }} /> <b>{sessionsText(ps)}</b> sessions</li>
            <li className="cyt-trust-x"><i className="feather-lock" /> 100% confidential</li>
          </ul>
        </div>

        <div className="cyt-hero-visual">
          {wallPool.length > 0 && (
            <div className={`cyt-wall ${wallMoves ? "is-moving" : ""}`} aria-label="Top-rated therapists">
              {wallCols.map((col, ci) => (
                <div key={ci} className={`cyt-wall-col ${ci === 0 ? "up" : "down"}`}>
                  <div className="cyt-wall-track" style={{ animationDuration: `${Math.max(col.length, 3) * 12}s` }}>
                    {(wallMoves ? [...col, ...col] : col).map((t, i) => (
                      <PhotoCard key={`${t._id || i}-${i}`} t={t} hidden={i >= col.length} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {strip.length > 0 ? (
            <div className="cyt-strip" ref={stripRef} aria-label="Top-rated therapists">
              {strip.map((t, i) => <TherapistCard key={t._id || i} t={t} />)}
            </div>
          ) : (
            <div className="cyt-cover-skeleton" />
          )}
        </div>
      </div>

      <style jsx global>{`
        /* keep the original .rbt-banner-1 background image — a soft, calm wash over it keeps the copy readable */
        .cyt-hero { position: relative; overflow: hidden; padding: 48px 0 52px; }
        .cyt-hero::after {
          content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(52% 42% at 88% 6%, rgba(122, 202, 159, 0.22), transparent 70%),
            radial-gradient(44% 40% at 4% 98%, rgba(150, 205, 175, 0.16), transparent 72%),
            linear-gradient(180deg, rgba(250, 253, 251, 0.66), rgba(240, 248, 242, 0.82));
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
        .cyt-hl::after { content: ""; position: absolute; left: -2%; right: -2%; bottom: -.1em; height: .3em; background: url("data:image/svg+xml,%3Csvg xmlns='http:%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 300 24' preserveAspectRatio='none'%3E%3Cpath d='M4 17 C 60 7, 140 4, 296 11' fill='none' stroke='%23e0ab45' stroke-width='8' stroke-linecap='round'/%3E%3Cpath d='M30 21 C 110 14, 190 13, 270 17' fill='none' stroke='%23e0ab45' stroke-width='3' stroke-linecap='round' opacity='.55'/%3E%3C/svg%3E") no-repeat center / 100% 100%; z-index: -1; pointer-events: none; }
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

        .cyt-hero-visual { width: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
        .cyt-hero-visual::before { content: ""; position: absolute; width: 420px; height: 420px; right: 0; top: -30px; border-radius: 50%; background: radial-gradient(circle, rgba(88,168,118,.26), transparent 66%); filter: blur(30px); z-index: 0; pointer-events: none; }
        .cyt-new { display: inline-block; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; color: #7a5413; background: #fbf3e2; border-radius: 5px; padding: 2px 7px; }

        /* ── phone / tablet: swipeable card strip ── */
        .cyt-wall { display: none; }
        .cyt-strip { position: relative; z-index: 1; width: 100%; display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 4px 22px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .cyt-strip::-webkit-scrollbar { display: none; }
        .cyt-tcard { flex: 0 0 min(66%, 290px); scroll-snap-align: start; background: #fff; border: 1px solid #e8f0ea; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 40px -18px rgba(18,66,42,.3), 0 3px 10px rgba(18,66,42,.05); }
        .cyt-tphoto { display: block; position: relative; height: 176px; background: linear-gradient(150deg, #c3e8d2, #82cca1); }
        .cyt-tphoto img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; display: block; }
        .cyt-tinit { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #1e7a4c; }
        .cyt-tverif { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%; background: #1d9bf0; color: #fff; display: flex; align-items: center; justify-content: center; }
        .cyt-tpin { position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: 800; background: rgba(255,255,255,.94); color: #14532d; padding: 3px 10px; border-radius: 999px; }
        .cyt-tbody { padding: 13px 15px 15px; }
        .cyt-tname { display: block; font-weight: 800; font-size: 15.5px; line-height: 1.3; color: #0b1712 !important; text-decoration: none !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-trole { display: flex; align-items: center; gap: 6px; margin-top: 2px; font-size: 12px; font-weight: 600; color: #1e7a4c; white-space: nowrap; overflow: hidden; }
        .cyt-trole span { overflow: hidden; text-overflow: ellipsis; }
        .cyt-tdot { width: 3px; height: 3px; border-radius: 50%; background: #9fb3a6; flex-shrink: 0; }
        .cyt-trate { display: flex; align-items: center; gap: 5px; white-space: nowrap; overflow: hidden; margin: 7px 0 9px; min-height: 18px; font-size: 12.5px; }
        .cyt-trate b { font-weight: 800; color: #0b1712; }
        .cyt-tcnt { font-weight: 500; color: #7c8b81; }
        .cyt-tstars { display: inline-flex; }
        .cyt-tstar { position: relative; display: inline-flex; width: 14px; height: 14px; }
        .cyt-tstar-on { position: absolute; left: 0; top: 0; overflow: hidden; display: inline-flex; }
        .cyt-tskills { overflow: hidden; margin: 0 -15px 10px; padding: 0 15px; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 90%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 90%, transparent 100%); }
        .cyt-tmq { display: flex; width: max-content; animation: cytTmq linear infinite; }
        .cyt-tmq-set { display: flex; gap: 6px; padding-right: 6px; flex-shrink: 0; }
        .cyt-tskill { flex-shrink: 0; white-space: nowrap; font-size: 11px; font-weight: 700; color: #166534; background: #ecfdf3; border: 1px solid #bbf7d0; padding: 3px 9px; border-radius: 999px; }
        @keyframes cytTmq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .cyt-tmq { animation: none; } }
        .cyt-tlangs { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
        .cyt-tlang { font-size: 10.5px; color: #475569; background: #f1f5f3; padding: 3px 8px; border-radius: 999px; }
        .cyt-trow { display: flex; gap: 8px; }
        .cyt-trow a { flex: 1; text-align: center; font-size: 13px; font-weight: 700; padding: 9px 6px; border-radius: 10px; text-decoration: none !important; }
        .cyt-trow .cyt-v { border: 1.5px solid #dce8e0; color: #26463a !important; }
        .cyt-trow .cyt-b { background: #1e7a4c; color: #fff !important; }
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
          .cyt-tphoto { height: 160px; }
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
          .cyt-tcard { flex-basis: 280px; }
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
        .cyt-ph:hover, .cyt-ph:focus-visible { transform: translateY(-4px); box-shadow: 0 26px 44px -18px rgba(18,66,42,.45); }
        .cyt-ph:focus-visible { outline: 3px solid #ecc77d; outline-offset: 2px; }
        .cyt-ph-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 22%; transition: transform .5s ease; }
        .cyt-ph:hover .cyt-ph-img { transform: scale(1.04); }
        /* brand duotone — dark-green shadows, cream highlights; the real photo on hover / focus.
           cream card + greyscale photo (multiply) gives cream-to-black, then a dark green layer
           (lighten) lifts the blacks to green. */
        .cyt-ph:has(.cyt-ph-img) { background: #f4ecd6; }
        .cyt-ph-img { z-index: 0; filter: grayscale(1) contrast(1.08) brightness(1.04); mix-blend-mode: multiply; transition: transform .5s ease, filter .45s ease; }
        .cyt-ph:has(.cyt-ph-img)::before { content: ""; position: absolute; inset: 0; z-index: 1; background: #155e3a; mix-blend-mode: lighten; pointer-events: none; transition: opacity .45s ease; }
        .cyt-ph:hover .cyt-ph-img, .cyt-ph:focus-visible .cyt-ph-img { filter: none; mix-blend-mode: normal; }
        .cyt-ph:hover::before, .cyt-ph:focus-visible::before { opacity: 0; }
        .cyt-ph-fee, .cyt-ph-info { z-index: 2; }
        .cyt-ph-init { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; color: #1e7a4c; }
        .cyt-ph-fee { position: absolute; top: 12px; left: 12px; font-size: 11px; font-weight: 800; background: rgba(255,255,255,.94); color: #14532d; padding: 3px 10px; border-radius: 999px; }
        /* a short shade, only behind the text — the face above stays clear */
        .cyt-ph-info { position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; gap: 2px; padding: 34px 14px 13px; color: #fff; background: linear-gradient(180deg, rgba(8,32,20,0) 0%, rgba(8,32,20,.7) 45%, rgba(8,32,20,.88) 100%); }
        .cyt-ph-name { display: flex; align-items: center; gap: 5px; font-weight: 800; font-size: 15.5px; line-height: 1.25; white-space: nowrap; overflow: hidden; }
        .cyt-ph-role { font-size: 12px; color: rgba(255,255,255,.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-ph-meta { display: flex; align-items: center; gap: 4px; margin-top: 3px; font-size: 12px; color: rgba(255,255,255,.85); white-space: nowrap; }
        .cyt-ph-meta b { color: #fff; font-weight: 800; }
        .cyt-ph-new { font-weight: 800; color: #14532d; background: #ecc77d; border-radius: 5px; padding: 1px 6px; font-size: 10.5px; }
        .cyt-ph-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.6); margin: 0 4px; }

        @media (prefers-reduced-motion: reduce) {
          .cyt-cta2-badge, .cyt-wall, .cyt-wall-track, .cyt-ph, .cyt-ph-img { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
}
