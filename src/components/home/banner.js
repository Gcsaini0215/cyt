import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiUrl } from "../../utils/url";
import Star from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Avatar } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { imagePath } from "../../utils/url";

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

function avgRating(t) {
  const hasReviews = t.reviews?.length > 0;
  const avg = hasReviews ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1) : "5.0";
  return { avg, count: hasReviews ? t.reviews.length : 0 };
}

/* desktop wall: photo-first card — the photo fills the card, details sit on a soft gradient,
   View / Book slide up on hover or keyboard focus; the whole card opens the profile */
function PortraitCard({ t, hidden = false }) {
  const { avg, count } = avgRating(t);
  const name = t.user?.name || "Therapist";
  const exp = expLabel(t.year_of_exp);
  const tab = hidden ? -1 : undefined;
  return (
    <div className="cyt-pcard" aria-hidden={hidden || undefined}>
      {t.user?.profile ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cyt-pphoto" src={`${imagePath}/${t.user.profile}`} alt={name} loading="lazy" decoding="async" />
      ) : (
        <span className="cyt-pinit">{initialsOf(name)}</span>
      )}
      {t.state && <span className="cyt-ppin">{t.state}</span>}
      <Link className="cyt-plink" href={`/view-profile/${t._id}`} tabIndex={tab} aria-label={`View ${name}'s profile`} />
      <div className="cyt-pinfo">
        <div className="cyt-pname">
          <span>{name}</span>
          <VerifiedRounded sx={{ fontSize: 16, color: "#7dd3fc", flexShrink: 0 }} />
        </div>
        <div className="cyt-prole">{t.profile_type || "Mental Health Professional"}</div>
        <div className="cyt-pmeta">
          <Star sx={{ fontSize: 14, color: "#f4b53c" }} /> <b>{avg}</b>
          {count > 0 && <span>({count})</span>}
          {exp && <><i className="cyt-pdot" /> {exp}</>}
        </div>
        <div className="cyt-pbtns">
          <Link className="cyt-pv" href={`/view-profile/${t._id}`} tabIndex={tab}>View</Link>
          <Link className="cyt-pb" href={`/book/${t._id}`} tabIndex={tab}>Book</Link>
        </div>
      </div>
    </div>
  );
}

function TherapistCard({ t, className = "", style, hidden = false }) {
  const hasReviews = t.reviews?.length > 0;
  const avg = hasReviews
    ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
    : "5.0";
  const rounded = Math.round(Number(avg));
  const langs = langList(t.language_spoken).slice(0, 2);

  return (
    <div className={`cyt-tcard ${className}`} style={style} aria-hidden={hidden || undefined}>
      <div className="cyt-tphoto">
        {t.user?.profile ? (
          <Avatar
            src={`${imagePath}/${t.user.profile}`}
            alt={t.user?.name || "Therapist"}
            variant="square"
            sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "top center" } }}
          />
        ) : (
          <span className="cyt-tinit">{initialsOf(t.user?.name)}</span>
        )}
        <span className="cyt-tverif" title="Verified"><VerifiedRounded sx={{ fontSize: 15 }} /></span>
        {t.state && <span className="cyt-tpin">{t.state}</span>}
      </div>
      <div className="cyt-tbody">
        <div className="cyt-tname-row">
          <span className="cyt-tname">{t.user?.name || "Therapist"}</span>
          {t.year_of_exp && <span className="cyt-texp">{expLabel(t.year_of_exp)}</span>}
        </div>
        <span className="cyt-ttag">{t.profile_type || "Mental Health Professional"}</span>
        <div className="cyt-trate">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} sx={{ fontSize: 13, color: s <= rounded ? "#f4b53c" : "#e3ece5" }} />
          ))}
          <span>{avg}</span>
          {hasReviews && <span className="cyt-tcnt">({t.reviews.length})</span>}
        </div>
        {langs.length > 0 && (
          <div className="cyt-tlangs">
            {langs.map((l) => (
              <span key={l} className="cyt-tlang">{l}</span>
            ))}
          </div>
        )}
        <div className="cyt-trow">
          <Link className="cyt-v" href={`/view-profile/${t._id}`} tabIndex={hidden ? -1 : undefined}>View</Link>
          <Link className="cyt-b" href={`/book/${t._id}`} tabIndex={hidden ? -1 : undefined}>Book</Link>
        </div>
      </div>
    </div>
  );
}

export default function Banner({ topTherapists = [], userCity = null }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.between("sm", "md"));
  // desktop = the scrolling card wall; also fires on iPad landscape (>=1024)
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // shuffled once per load — same top-rated pool, different order each visit
  const ranked = useMemo(() => shuffled(topTherapists), [topTherapists]);
  const strip = ranked.slice(0, 10); // mobile / tablet carousel

  /* desktop wall — two columns of cards drifting in opposite directions (CSS
     animation on a doubled list, so the loop is seamless); pauses on hover */
  const wallPool = ranked.slice(0, 12);
  const wallCols = [wallPool.filter((_, i) => i % 2 === 0), wallPool.filter((_, i) => i % 2 === 1)];
  const wallMoves = !prefersReducedMotion && wallPool.length >= 4;

  // live Noida offer (admin → Coupons → "show on booking page"); nothing shows when none is running
  const [offer, setOffer] = useState(null);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/offers`)
      .then((r) => r.json())
      .then((d) => { if (d?.status && d.data?.length) setOffer(d.data[0]); })
      .catch(() => {});
  }, []);
  const offerHref = "/noida-appointment?offer=1";

  return (
    <section className="rbt-banner-area rbt-banner-1 variation-2 cyt-hero">
      <div className="cyt-hero-inner">
        {/* ── message (original SEO copy, unchanged) ── */}
        <div className="cyt-hero-copy">
          {!isMobile && (
            <div className="rbt-new-badge rbt-new-badge-one">
              <span className="rbt-new-badge-icon">
                <PersonSearchIcon sx={{ color: "#228756", fontSize: 30 }} />
              </span>{" "}
              Discover mental wellness solutions.
            </div>
          )}

          <h4
            className="title"
            style={{
              fontSize: isMobile
                ? "clamp(2.4rem, 8.4vw, 3.1rem)"
                : isTablet
                ? "clamp(2.6rem, 5.5vw, 3.8rem)"
                : "clamp(2.8rem, 5vw, 4.8rem)",
              lineHeight: 1.15,
              marginBottom: "12px",
            }}
          >
            Find your&nbsp;
            <span
              style={{
                display: "inline-block",
                position: "relative",
                minWidth: isMobile ? "140px" : "220px",
                verticalAlign: "bottom",
              }}
            >
              <span className="banner-word-1 theme-gradient">Personalized</span>
              <span className="banner-word-2 theme-gradient">Affordable</span>
              <span className="banner-word-3 theme-gradient">Verified</span>
              <span className="banner-word-4 theme-gradient">Multilingual</span>
              <span style={{ visibility: "hidden" }}>Personalized</span>
            </span>
            <br />
            therapist &amp; start healing.
          </h4>

          <p className="description">
            We provide verified mental health experts every step of the way to your{" "}
            <strong>well-being.</strong>
          </p>

          <div className="slider-btn cyt-hero-ctas">
            <Link className="rbt-btn btn-gradient hover-icon-reverse" href="/view-all-therapist">
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Find my therapist</span>
                <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                <span className="btn-icon"><i className="feather-arrow-right"></i></span>
              </span>
            </Link>
            <Link
              className="cyt-cta2"
              href={offer ? offerHref : "/noida-appointment"}
              title="Book a psychologist in Noida, Sector 51 — in-person, online or home visit"
            >
              <i className="feather-map-pin" aria-hidden="true" style={{ marginRight: 6 }} />
              Book a Psychologist in Noida
              {offer && <span className="cyt-cta2-badge">{offer.discount.replace(/ off$/i, "")} OFF</span>}
            </Link>
          </div>

          <ul className="cyt-trust" aria-label="Why people choose us">
            <li><Star sx={{ fontSize: 15, color: "#f4b53c" }} /> <b>4.9</b> on Google <span>(178 reviews)</span></li>
            <li><VerifiedRounded sx={{ fontSize: 15, color: "#1c6b45" }} /> <b>5000+</b> sessions completed</li>
            <li><i className="feather-shield" /> Verified therapists · Online &amp; in person</li>
          </ul>
        </div>

        {/* ── visual ── */}
        <div className="cyt-hero-visual">
          {isDesktop && wallPool.length > 0 ? (
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
          ) : strip.length > 0 ? (
            <Swiper
              className="cyt-swiper mySwiper"
              style={{ width: "100%", margin: 0, paddingBottom: "30px" }}
              slidesPerView={1.5}
              spaceBetween={14}
              breakpoints={{
                640: { slidesPerView: 2.2, spaceBetween: 16 },
                1000: { slidesPerView: 2.7, spaceBetween: 20 },
              }}
              autoplay={{ delay: 3200, disableOnInteraction: false }}
              loop={strip.length > 1}
              modules={[Autoplay]}
            >
              {strip.map((t, i) => (
                <SwiperSlide key={t._id || i}>
                  <TherapistCard t={t} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="cyt-cover-skeleton" />
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes wordCycle {
          0%    { opacity: 0; }
          2.5%  { opacity: 1; }
          22.5% { opacity: 1; }
          25%   { opacity: 0; }
          100%  { opacity: 0; }
        }
        .banner-word-1 { position: absolute; left: 0; top: 0; animation: wordCycle 12s ease-in-out infinite; }
        .banner-word-2 { position: absolute; left: 0; top: 0; animation: wordCycle 12s ease-in-out infinite; animation-delay: 3s; opacity: 0; }
        .banner-word-3 { position: absolute; left: 0; top: 0; animation: wordCycle 12s ease-in-out infinite; animation-delay: 6s; opacity: 0; }
        .banner-word-4 { position: absolute; left: 0; top: 0; animation: wordCycle 12s ease-in-out infinite; animation-delay: 9s; opacity: 0; }

        /* keep the original .rbt-banner-1 background image — just lay a soft,
           calm wash over it so the light cards and copy stay readable */
        .cyt-hero {
          position: relative;
          overflow: hidden;
          padding: 54px 0 60px;
        }
        .cyt-hero::after {
          content: "";
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(52% 42% at 88% 6%, rgba(122, 202, 159, 0.22), transparent 70%),
            radial-gradient(44% 40% at 4% 98%, rgba(150, 205, 175, 0.16), transparent 72%),
            linear-gradient(180deg, rgba(250, 253, 251, 0.62), rgba(240, 248, 242, 0.78));
        }
        @media (max-width: 600px) { .cyt-hero.rbt-banner-1 { padding-top: 14px; } }

        /* Desktop: the hero runs up behind the floating navbar. The zoom-safe
           over-pull + matching top padding live in navbar.js so every page's
           banner gets the same treatment consistently. */

        .cyt-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 38px;
          align-items: center;
        }
        .cyt-hero-copy { width: 100%; max-width: 620px; }
        .cyt-hero .title { color: #142a1d; }
        .cyt-hero .description { color: #49594e; font-size: 17px; line-height: 1.65; max-width: 48ch; }
        .cyt-hero .rbt-new-badge { margin-bottom: 18px; }
        .cyt-hero .slider-btn { margin-top: 28px; }
        .cyt-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
        .cyt-cta2 {
          display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px;
          border-radius: 10px; border: 1.5px solid #1c6b45; color: #1c6b45; background: rgba(255, 255, 255, 0.7);
          font-weight: 700; font-size: 15px; text-decoration: none; transition: background .2s, color .2s;
        }
        .cyt-cta2:hover { background: #1c6b45; color: #fff; }
        .cyt-cta2 { position: relative; }
        .cyt-cta2-badge {
          position: absolute; top: -10px; right: -8px; padding: 3px 8px; border-radius: 999px;
          background: #c2410c; color: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; line-height: 1.3;
          box-shadow: 0 4px 10px -2px rgba(194, 65, 12, .45); animation: cytBadgePop 2.4s ease-in-out infinite;
        }
        @keyframes cytBadgePop { 0%, 80%, 100% { transform: scale(1); } 88% { transform: scale(1.12); } }

        .cyt-trust { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 13px; color: #49594e; }
        .cyt-trust li { display: inline-flex; align-items: center; gap: 5px; margin: 0; padding: 0; }
        .cyt-trust li::before { content: none; }
        .cyt-trust b { color: #142a1d; } .cyt-trust span { color: #7c8b81; }
        .cyt-trust i { color: #1c6b45; font-size: 14px; }
        @media (max-width: 600px) {
          .cyt-hero-inner { gap: 20px; }
          .cyt-hero .description { font-size: 15px; line-height: 1.55; margin-bottom: 0; }
          .cyt-hero .slider-btn { margin-top: 16px; }
          .cyt-hero-ctas { gap: 10px; }
          .cyt-hero-ctas .rbt-btn { flex: 1 1 100%; justify-content: center; }
          .cyt-cta2 { flex: 1 1 100%; min-height: 46px; }
          .cyt-cta2-badge { right: 10px; }
          .cyt-trust { margin-top: 14px; gap: 6px 14px; font-size: 12.5px; }
        }
        @media (min-width: 601px) and (max-width: 1023px) { .cyt-hero-inner { gap: 26px; } .cyt-hero .slider-btn { margin-top: 20px; } }

        .cyt-hero-visual { width: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
        .cyt-hero-visual::before {
          content: ""; position: absolute; width: 420px; height: 420px; right: 0; top: -30px;
          border-radius: 50%; background: radial-gradient(circle, rgba(88, 168, 118, 0.26), transparent 66%);
          filter: blur(30px); z-index: 0; pointer-events: none;
        }

        /* ── card ── */
        .cyt-tcard {
          background: #fff; border: 1px solid #e8f0ea; border-radius: 22px; overflow: hidden;
          box-shadow: 0 22px 48px -16px rgba(18, 66, 42, 0.24), 0 4px 12px rgba(18, 66, 42, 0.06);
          width: 100%; max-width: 300px; margin: 0 auto;
        }
        .cyt-tphoto { position: relative; height: 176px; background: linear-gradient(150deg, #c3e8d2, #82cca1); }
        .cyt-tphoto .MuiAvatar-root { width: 100%; height: 100%; }
        .cyt-tinit {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: #1c6b45;
        }
        .cyt-tverif {
          position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%;
          background: #1d9bf0; color: #fff; display: flex; align-items: center; justify-content: center;
        }
        .cyt-tpin {
          position: absolute; top: 10px; left: 10px; font-size: 10.5px; font-weight: 700;
          background: rgba(255, 255, 255, 0.92); color: #1c6b45; padding: 3px 10px; border-radius: 999px;
        }
        .cyt-tbody { padding: 14px 16px 16px; }
        .cyt-tname-row { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
        .cyt-tname {
          font-weight: 800; font-size: 15px; color: #142a1d;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cyt-texp { font-size: 10.5px; color: #6b7a70; flex-shrink: 0; }
        .cyt-ttag {
          display: inline-block; margin-top: 7px; font-size: 10.5px; font-weight: 700; color: #1c6b45;
          background: #eaf5ee; padding: 3px 9px; border-radius: 999px;
        }
        .cyt-trate { display: flex; align-items: center; gap: 1px; margin: 8px 0 7px; }
        .cyt-trate span { font-size: 12px; font-weight: 700; color: #49594e; margin-left: 6px; }
        .cyt-trate .cyt-tcnt { font-weight: 400; color: #7c8b81; margin-left: 2px; }
        .cyt-tlangs { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
        .cyt-tlang { font-size: 10px; color: #5a6a5f; background: #f0f4f1; padding: 3px 8px; border-radius: 999px; }
        .cyt-trow { display: flex; gap: 8px; }
        .cyt-trow a {
          flex: 1; text-align: center; font-size: 12.5px; font-weight: 700; padding: 9px 6px;
          border-radius: 9px; text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cyt-trow .cyt-v { border: 1.5px solid #dce8e0; color: #26463a; }
        .cyt-trow .cyt-b { background: linear-gradient(135deg, #2aa066, #1c6b45); color: #fff; }
        .cyt-trow a:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(18, 66, 42, 0.14); }

        /* ── swiper (mobile / tablet) — 1 full card + a peek of the next ── */
        .cyt-swiper { overflow: visible !important; }
        .cyt-swiper .swiper-slide { transition: opacity 0.4s ease; height: auto; display: flex; }
        .cyt-swiper .swiper-slide .cyt-tcard { max-width: none; }
        .cyt-swiper .swiper-slide:not(.swiper-slide-active) { opacity: 0.72; }

        /* ── desktop + iPad landscape: two-column scrolling card wall ── */
        @media (min-width: 1024px) {
          .cyt-hero-inner { flex-direction: row; align-items: center; gap: 26px; padding: 0 clamp(56px, 6vw, 96px); box-sizing: border-box; }
          .cyt-hero-copy { flex: 0 0 52%; max-width: none; }
          .cyt-hero-visual { flex: 1; min-width: 0; justify-content: flex-end; }
          .cyt-hero-visual::before { left: auto; right: 0; transform: none; top: -6px; width: 400px; height: 400px; }
        }
        /* iPad landscape / small desktop: trim the headline so it fits beside the wall */
        @media (min-width: 1024px) and (max-width: 1299px) {
          .cyt-hero .title { font-size: clamp(2.2rem, 4vw, 3rem) !important; }
          .cyt-hero-inner { padding: 0 clamp(40px, 4.5vw, 56px); }
          .cyt-hero-copy { flex-basis: 48%; }
          .cyt-hero .cyt-wall { height: 500px; gap: 12px; }
          .cyt-hero .cyt-wall-track { gap: 12px; }
        }
        @media (min-width: 1300px) {
          .cyt-hero-inner { gap: 30px; }
          .cyt-hero-copy { flex: 0 0 54%; }
          .cyt-hero-visual::before { top: -10px; width: 470px; height: 470px; }
        }

        .cyt-wall {
          position: relative; z-index: 1; width: 100%; max-width: 540px; height: 560px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px; overflow: hidden;
          -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 12%, #000 88%, transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0, #000 12%, #000 88%, transparent 100%);
          animation: cytCoverIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cytCoverIn {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        .cyt-pcard {
          position: relative; flex-shrink: 0; height: 300px; border-radius: 22px; overflow: hidden;
          background: linear-gradient(150deg, #c3e8d2, #82cca1);
          box-shadow: 0 18px 36px -16px rgba(18, 66, 42, 0.38), 0 3px 8px rgba(18, 66, 42, 0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cyt-pcard:hover, .cyt-pcard:focus-within { transform: translateY(-4px); box-shadow: 0 26px 44px -18px rgba(18, 66, 42, 0.45); }
        .cyt-pphoto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform 0.5s ease; }
        .cyt-pcard:hover .cyt-pphoto { transform: scale(1.04); }
        .cyt-pinit { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; color: #1c6b45; }
        .cyt-ppin {
          position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 10.5px; font-weight: 700;
          background: rgba(255, 255, 255, 0.9); color: #1c6b45; padding: 3px 10px; border-radius: 999px;
          backdrop-filter: blur(4px);
        }
        .cyt-plink { position: absolute; inset: 0; z-index: 1; }
        .cyt-plink:focus-visible { outline: 3px solid #f4b53c; outline-offset: -3px; border-radius: 22px; }
        .cyt-pinfo {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; pointer-events: none;
          padding: 56px 14px 14px; color: #fff;
          background: linear-gradient(180deg, rgba(8, 32, 20, 0) 0%, rgba(8, 32, 20, 0.62) 42%, rgba(8, 32, 20, 0.9) 100%);
        }
        .cyt-pname { display: flex; align-items: center; gap: 5px; font-weight: 800; font-size: 15.5px; line-height: 1.25; }
        .cyt-pname span { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .cyt-prole { font-size: 12px; color: rgba(255, 255, 255, 0.82); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cyt-pmeta { display: flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 12px; color: rgba(255, 255, 255, 0.85); }
        .cyt-pmeta b { color: #fff; font-weight: 700; }
        .cyt-pdot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255, 255, 255, 0.6); margin: 0 3px; display: inline-block; }
        .cyt-pbtns {
          display: flex; gap: 8px; max-height: 0; opacity: 0; overflow: hidden; margin-top: 0;
          transition: max-height 0.3s ease, opacity 0.25s ease, margin-top 0.3s ease; pointer-events: auto;
        }
        .cyt-pcard:hover .cyt-pbtns, .cyt-pcard:focus-within .cyt-pbtns { max-height: 44px; opacity: 1; margin-top: 10px; }
        .cyt-pbtns a {
          flex: 1; text-align: center; font-size: 12.5px; font-weight: 700; padding: 8px 4px; border-radius: 10px; text-decoration: none;
        }
        .cyt-pv { background: rgba(255, 255, 255, 0.16); color: #fff !important; border: 1px solid rgba(255, 255, 255, 0.45); backdrop-filter: blur(4px); }
        .cyt-pv:hover { background: rgba(255, 255, 255, 0.26); }
        .cyt-pb { background: #fff; color: #1c6b45 !important; }
        .cyt-pb:hover { background: #eaf5ee; }
        @media (min-width: 1024px) and (max-width: 1299px) { .cyt-hero .cyt-pcard { height: 260px; } }

        .cyt-cover-skeleton { width: 260px; height: 340px; border-radius: 22px; background: rgba(130, 204, 161, 0.18); }

        @media (prefers-reduced-motion: reduce) {
          .cyt-cta2-badge,
          .cyt-wall, .cyt-wall-track, .cyt-trow a, .cyt-swiper .swiper-slide, .cyt-pcard, .cyt-pphoto, .cyt-pbtns,
          .banner-word-1, .banner-word-2, .banner-word-3, .banner-word-4 { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
}
