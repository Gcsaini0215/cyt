import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiUrl, imagePath } from "../../utils/url";
import Star from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { profilePath } from "../../utils/therapist-slug";
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

/* desktop wall: photo-first card — the photo fills the card, details sit on a soft gradient,
   View / Book slide up on hover or keyboard focus; the whole card opens the profile */
function PortraitCard({ t, hidden = false }) {
  const r = rating(t);
  const name = t.user?.name || "Therapist";
  const exp = expLabel(t.year_of_exp);
  const fee = feeLabel(t);
  const tab = hidden ? -1 : undefined;
  return (
    <div className="cyt-pcard" aria-hidden={hidden || undefined}>
      {photo(t) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cyt-pphoto" src={thumb(photo(t), 256)} srcSet={thumbSet(photo(t), 256, 640)} alt={name} loading="lazy" decoding="async" />
      ) : (
        <span className="cyt-pinit">{initialsOf(name)}</span>
      )}
      {fee && <span className="cyt-ppin">{fee}</span>}
      <Link className="cyt-plink" href={profilePath(t)} tabIndex={tab} aria-label={`View ${name}'s profile`} />
      <div className="cyt-pinfo">
        <div className="cyt-pname">
          <span>{name}</span>
          <VerifiedRounded sx={{ fontSize: 16, color: "#7dd3fc", flexShrink: 0 }} />
        </div>
        <div className="cyt-prole">{t.profile_type || "Mental Health Professional"}</div>
        <div className="cyt-pmeta">
          {r ? <><Star sx={{ fontSize: 14, color: "#ecc77d" }} /> <b>{r.avg}</b> <span>({r.count})</span></> : <span className="cyt-new">New</span>}
          {exp && <><i className="cyt-pdot" /> {exp}</>}
        </div>
        <div className="cyt-pbtns">
          <Link className="cyt-pv" href={profilePath(t)} tabIndex={tab}>View</Link>
          <Link className="cyt-pb" href={`/book/${t._id}`} tabIndex={tab}>Book</Link>
        </div>
      </div>
    </div>
  );
}

function TherapistCard({ t }) {
  const r = rating(t);
  const name = t.user?.name || "Therapist";
  const langs = langList(t.language_spoken).slice(0, 2);
  const fee = feeLabel(t);
  return (
    <div className="cyt-tcard">
      <div className="cyt-tphoto">
        {photo(t) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb(photo(t), 384)} srcSet={thumbSet(photo(t), 384, 640)} alt={name} loading="lazy" decoding="async" />
        ) : (
          <span className="cyt-tinit">{initialsOf(name)}</span>
        )}
        <span className="cyt-tverif" title="Verified"><VerifiedRounded sx={{ fontSize: 15 }} /></span>
        {fee && <span className="cyt-tpin">{fee}</span>}
      </div>
      <div className="cyt-tbody">
        <div className="cyt-tname-row">
          <span className="cyt-tname">{name}</span>
          {t.year_of_exp && <span className="cyt-texp">{expLabel(t.year_of_exp)}</span>}
        </div>
        <span className="cyt-ttag">{t.profile_type || "Mental Health Professional"}</span>
        <div className="cyt-trate">
          {r ? <><Star sx={{ fontSize: 14, color: "#d4a24c" }} /><span>{r.avg}</span><span className="cyt-tcnt">({r.count} reviews)</span></>
            : <span className="cyt-new">New on CYT</span>}
        </div>
        {langs.length > 0 && (
          <div className="cyt-tlangs">
            {langs.map((l) => <span key={l} className="cyt-tlang">{l}</span>)}
          </div>
        )}
        <div className="cyt-trow">
          <Link className="cyt-v" href={profilePath(t)}>View</Link>
          <Link className="cyt-b" href={`/book/${t._id}`}>Book</Link>
        </div>
      </div>
    </div>
  );
}

// stats: { count, minFee } of the whole directory, worked out on the server
export default function Banner({ topTherapists = [], stats = null }) {
  // Server order first (so server and browser HTML match), shuffled after mount —
  // same top-rated pool, different order each visit.
  const [ranked, setRanked] = useState(topTherapists);
  useEffect(() => { setRanked(shuffled(topTherapists)); }, [topTherapists]);

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
            Find the right <span className="cyt-hl">therapist</span><br /> &amp; start healing.
          </h1>

          <p className="description">
            Talk to a verified psychologist — online or in person, in Hindi, English and more.
          </p>

          <form className="cyt-hsearch" action="/view-all-therapist" method="get" role="search">
            <i className="feather-search" aria-hidden="true" />
            <label htmlFor="cyt-hq" className="cyt-sr">Search by concern, name or city</label>
            <input id="cyt-hq" name="search" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Anxiety, a therapist's name, your city…" />
            <button type="submit">Find therapist</button>
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
              <i className="feather-map-pin" aria-hidden="true" /> Book a Psychologist in Noida
              {offer && <span className="cyt-cta2-badge">{offer.discount.replace(/ off$/i, "")} OFF</span>}
            </Link>
            <button type="button" className="cyt-wa" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
              <i className="feather-message-circle" aria-hidden="true" /> Prefer to talk first? <b>Get matched on WhatsApp</b>
            </button>
          </div>

          <ul className="cyt-trust" aria-label="Why people choose us">
            <li><a href={GBP_URL} target="_blank" rel="noreferrer"><Star sx={{ fontSize: 15, color: "#d4a24c" }} /> <b>4.9</b> on Google <span>(178 reviews)</span></a></li>
            <li><VerifiedRounded sx={{ fontSize: 15, color: "#1e7a4c" }} /> <b>5000+</b> sessions</li>
            <li className="cyt-trust-x"><i className="feather-lock" /> 100% confidential</li>
          </ul>
        </div>

        <div className="cyt-hero-visual">
          {wallPool.length > 0 && (
            <div className={`cyt-wall ${wallMoves ? "is-moving" : ""}`} aria-label="Top-rated therapists">
              {wallCols.map((col, ci) => (
                <div key={ci} className={`cyt-wall-col ${ci === 0 ? "up" : "down"}`}>
                  <div className="cyt-wall-track" style={{ animationDuration: `${Math.max(col.length, 3) * 7}s` }}>
                    {(wallMoves ? [...col, ...col] : col).map((t, i) => (
                      <PortraitCard key={`${t._id || i}-${i}`} t={t} hidden={i >= col.length} />
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

        .cyt-hero-inner { position: relative; z-index: 2; max-width: 1240px; margin: 0 auto; padding: 0 20px; display: flex; flex-direction: column; gap: 34px; align-items: center; }
        .cyt-hero-copy { width: 100%; max-width: 620px; }
        .cyt-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        .cyt-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 16px; padding: 7px 14px 7px 12px; border-radius: 999px; background: rgba(255,255,255,.85); border: 1px solid #dfeae3; box-shadow: 0 6px 16px -10px rgba(20,83,45,.35); font-size: 13px; font-weight: 700; color: #14532d; line-height: 1.3; }
        .cyt-live { width: 8px; height: 8px; border-radius: 50%; background: #22a35a; box-shadow: 0 0 0 3px rgba(34,163,90,.2); flex-shrink: 0; }

        .cyt-hero .cyt-title { color: #0b1712; font-size: clamp(2.8rem, 5vw, 4.6rem); line-height: 1.12; margin: 0 0 12px; letter-spacing: -.02em; font-weight: 800; }
        .cyt-hl { color: #1e7a4c; position: relative; white-space: nowrap; }
        .cyt-hl::after { content: ""; position: absolute; left: 2%; right: 2%; bottom: .04em; height: .14em; border-radius: 999px; background: #ecc77d; opacity: .75; z-index: -1; }
        .cyt-hero .description { color: #475569; font-size: 17px; line-height: 1.6; max-width: 46ch; margin: 0 0 20px; }

        .cyt-hsearch { position: relative; display: flex; align-items: center; max-width: 580px; background: #fff; border: 1.5px solid #dbe5df; border-radius: 14px; padding: 5px; box-shadow: 0 16px 36px -22px rgba(20,83,45,.55); }
        .cyt-hsearch:focus-within { border-color: #1e7a4c; box-shadow: 0 0 0 3px #dcefe3, 0 16px 36px -22px rgba(20,83,45,.55); }
        .cyt-hsearch > i { position: absolute; left: 17px; font-size: 18px; color: #64748b; pointer-events: none; }
        .cyt-hsearch input { flex: 1; min-width: 0; height: 46px; border: none !important; outline: none; background: transparent; padding: 0 10px 0 42px; font-size: 15.5px; color: #0f172a; box-shadow: none !important; }
        .cyt-hsearch input::-webkit-search-cancel-button { display: none; }
        .cyt-hsearch button { flex-shrink: 0; height: 46px; padding: 0 22px; border: none; border-radius: 10px; background: #1e7a4c; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 18px -10px rgba(30,122,76,.8); }
        .cyt-hsearch button:hover { background: #186640; }

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
        .cyt-tphoto { position: relative; height: 176px; background: linear-gradient(150deg, #c3e8d2, #82cca1); }
        .cyt-tphoto img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
        .cyt-tinit { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #1e7a4c; }
        .cyt-tverif { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%; background: #1d9bf0; color: #fff; display: flex; align-items: center; justify-content: center; }
        .cyt-tpin { position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: 800; background: rgba(255,255,255,.94); color: #14532d; padding: 3px 10px; border-radius: 999px; }
        .cyt-tbody { padding: 13px 15px 15px; }
        .cyt-tname-row { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
        .cyt-tname { font-weight: 800; font-size: 15px; color: #0b1712; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-texp { font-size: 11px; color: #64748b; flex-shrink: 0; }
        .cyt-ttag { display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 700; color: #1e7a4c; background: #eef6f1; padding: 3px 9px; border-radius: 999px; }
        .cyt-trate { display: flex; align-items: center; gap: 3px; margin: 8px 0 8px; min-height: 18px; }
        .cyt-trate span { font-size: 12.5px; font-weight: 800; color: #0b1712; }
        .cyt-trate .cyt-tcnt { font-weight: 500; color: #7c8b81; margin-left: 2px; }
        .cyt-tlangs { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
        .cyt-tlang { font-size: 10.5px; color: #475569; background: #f1f5f3; padding: 3px 8px; border-radius: 999px; }
        .cyt-trow { display: flex; gap: 8px; }
        .cyt-trow a { flex: 1; text-align: center; font-size: 13px; font-weight: 700; padding: 9px 6px; border-radius: 10px; text-decoration: none !important; }
        .cyt-trow .cyt-v { border: 1.5px solid #dce8e0; color: #26463a !important; }
        .cyt-trow .cyt-b { background: #1e7a4c; color: #fff !important; }
        .cyt-cover-skeleton { width: 260px; height: 340px; border-radius: 22px; background: rgba(130,204,161,.18); }

        @media (max-width: 600px) {
          .cyt-hero { padding: 14px 0 16px !important; }
          .cyt-hero-inner { gap: 18px; padding: 0 16px; }
          .cyt-eyebrow { font-size: 11.5px; padding: 5px 11px 5px 9px; margin-bottom: 10px; }
          .cyt-hero .cyt-title { font-size: clamp(2.3rem, 8.6vw, 2.9rem); margin-bottom: 14px; }
          .cyt-hero .description { display: none; }
          .cyt-hsearch { border-radius: 12px; }
          .cyt-hsearch input { height: 44px; font-size: 15px; padding-left: 38px; }
          .cyt-hsearch > i { left: 15px; }
          .cyt-hsearch button { height: 44px; padding: 0 14px; font-size: 14px; }
          /* one swipeable row of chips instead of three wrapped ones */
          .cyt-hchips { flex-wrap: nowrap; overflow-x: auto; margin: 12px -16px 0; padding: 0 16px 2px; scrollbar-width: none; }
          .cyt-hchips::-webkit-scrollbar { display: none; }
          .cyt-hchips a { height: 32px; font-size: 13px; padding: 0 12px; }
          .cyt-hero-ctas { margin-top: 14px; gap: 6px; }
          .cyt-cta2 { flex: 1 1 100%; min-height: 44px; font-size: 14.5px; }
          .cyt-cta2-badge { right: 10px; }
          .cyt-wa { font-size: 13px; }
          .cyt-trust { margin-top: 10px; gap: 6px 14px; font-size: 12.5px; }
          .cyt-trust-x { display: none !important; }
          .cyt-tphoto { height: 160px; }
        }
        @media (min-width: 601px) and (max-width: 1023px) {
          .cyt-hero { padding-bottom: 28px; }
          .cyt-hero-inner { gap: 24px; }
          .cyt-hero .cyt-title { font-size: clamp(2.8rem, 5.6vw, 3.8rem); }
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
        }
        /* iPad landscape / small desktop: trim the headline so it fits beside the wall */
        @media (min-width: 1024px) and (max-width: 1299px) {
          .cyt-hero .cyt-title { font-size: clamp(2.4rem, 4vw, 3.2rem); }
          .cyt-hero-inner { padding: 0 clamp(40px, 4.5vw, 56px); }
          .cyt-hero-copy { flex-basis: 50%; }
          .cyt-hero .cyt-wall { height: 520px; gap: 12px; }
          .cyt-hero .cyt-wall-track { gap: 12px; }
          .cyt-hero .cyt-pcard { height: 260px; }
        }
        @media (min-width: 1300px) {
          .cyt-hero-inner { gap: 30px; }
          .cyt-hero-copy { flex: 0 0 54%; }
          .cyt-hero-visual::before { top: -10px; width: 470px; height: 470px; }
        }

        .cyt-wall {
          position: relative; z-index: 1; width: 100%; max-width: 540px; height: 580px;
          grid-template-columns: 1fr 1fr; gap: 16px; overflow: hidden;
          -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0, #000 8%, #000 92%, transparent 100%);
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

        /* ── photo-first portrait card (desktop wall) ── */
        .cyt-pcard { position: relative; flex-shrink: 0; height: 300px; border-radius: 22px; overflow: hidden; background: linear-gradient(150deg, #c3e8d2, #82cca1); box-shadow: 0 18px 36px -16px rgba(18,66,42,.38), 0 3px 8px rgba(18,66,42,.06); transition: transform .25s ease, box-shadow .25s ease; }
        .cyt-pcard:hover, .cyt-pcard:focus-within { transform: translateY(-4px); box-shadow: 0 26px 44px -18px rgba(18,66,42,.45); }
        .cyt-pphoto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform .5s ease; }
        .cyt-pcard:hover .cyt-pphoto { transform: scale(1.04); }
        .cyt-pinit { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; color: #1e7a4c; }
        .cyt-ppin { position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 11px; font-weight: 800; background: rgba(255,255,255,.92); color: #14532d; padding: 3px 10px; border-radius: 999px; backdrop-filter: blur(4px); }
        .cyt-plink { position: absolute; inset: 0; z-index: 1; }
        .cyt-plink:focus-visible { outline: 3px solid #ecc77d; outline-offset: -3px; border-radius: 22px; }
        .cyt-pinfo { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; pointer-events: none; padding: 56px 14px 14px; color: #fff; background: linear-gradient(180deg, rgba(8,32,20,0) 0%, rgba(8,32,20,.62) 42%, rgba(8,32,20,.9) 100%); }
        .cyt-pname { display: flex; align-items: center; gap: 5px; font-weight: 800; font-size: 15.5px; line-height: 1.25; }
        .cyt-pname span { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .cyt-prole { font-size: 12px; color: rgba(255,255,255,.82); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-pmeta { display: flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 12px; color: rgba(255,255,255,.85); }
        .cyt-pmeta b { color: #fff; font-weight: 700; }
        .cyt-pmeta .cyt-new { background: rgba(236,199,125,.95); color: #14532d; }
        .cyt-pdot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.6); margin: 0 3px; display: inline-block; }
        .cyt-pbtns { display: flex; gap: 8px; max-height: 0; opacity: 0; overflow: hidden; margin-top: 0; transition: max-height .3s ease, opacity .25s ease, margin-top .3s ease; pointer-events: auto; }
        .cyt-pcard:hover .cyt-pbtns, .cyt-pcard:focus-within .cyt-pbtns { max-height: 44px; opacity: 1; margin-top: 10px; }
        .cyt-pbtns a { flex: 1; text-align: center; font-size: 12.5px; font-weight: 700; padding: 8px 4px; border-radius: 10px; text-decoration: none; }
        .cyt-pv { background: rgba(255,255,255,.16); color: #fff !important; border: 1px solid rgba(255,255,255,.45); backdrop-filter: blur(4px); }
        .cyt-pv:hover { background: rgba(255,255,255,.26); }
        .cyt-pb { background: #fff; color: #14532d !important; }
        .cyt-pb:hover { background: #eef6f1; }

        @media (prefers-reduced-motion: reduce) {
          .cyt-cta2-badge, .cyt-wall, .cyt-wall-track, .cyt-pcard, .cyt-pphoto, .cyt-pbtns { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
}
