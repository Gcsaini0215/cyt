import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import React, { useState } from "react";
import Link from "next/link";
import Star from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import { Avatar } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { imagePath } from "../../utils/url";

function initialsOf(name) {
  if (!name) return "T";
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

function TherapistCard({ t, className = "", style }) {
  const hasReviews = t.reviews?.length > 0;
  const avg = hasReviews
    ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
    : "5.0";
  const rounded = Math.round(Number(avg));

  return (
    <div className={`cyt-tcard ${className}`} style={style}>
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
        <div className="cyt-tname">{t.user?.name || "Therapist"}</div>
        <div className="cyt-trate">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} sx={{ fontSize: 13, color: s <= rounded ? "#f4b53c" : "#e3ece5" }} />
          ))}
          <span>{avg}</span>
        </div>
        <div className="cyt-tspec">
          {t.profile_type || "Mental Health Professional"}
          {t.language_spoken ? ` · ${t.language_spoken}` : ""}
        </div>
        <div className="cyt-trow">
          <Link className="cyt-v" href={`/view-profile/${t._id}`}>View</Link>
          <Link className="cyt-b" href={`/book/${t._id}`}>Book</Link>
        </div>
      </div>
    </div>
  );
}

export default function Banner({ topTherapists = [], userCity = null }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.between("sm", "md"));
  // desktop = the fanned layout; also fires on iPad landscape (>=1024)
  const isDesktop = useMediaQuery("(min-width:1024px)");

  const ranked = [...topTherapists].sort(
    (a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0)
  );
  const strip = ranked.slice(0, 10); // mobile / tablet carousel

  /* desktop fan — manual only, navigated with the arrows */
  const [fanStart, setFanStart] = useState(0);
  const fanCards = ranked.length
    ? Array.from({ length: Math.min(3, ranked.length) }, (_, i) => ranked[(fanStart + i) % ranked.length])
    : [];
  const fanGo = (d) => setFanStart((s) => (s + d + ranked.length) % ranked.length);

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
                ? "clamp(3.1rem, 10vw, 3.8rem)"
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
              <span style={{ visibility: "hidden" }}>Personalized</span>
            </span>
            <br />
            therapist &amp; start healing.
          </h4>

          <p className="description">
            We provide verified mental health experts every step of the way to your{" "}
            <strong>well-being.</strong>
          </p>

          <div className="slider-btn">
            <Link className="rbt-btn btn-gradient hover-icon-reverse" href="/view-all-therapist">
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Get Started</span>
                <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                <span className="btn-icon"><i className="feather-arrow-right"></i></span>
              </span>
            </Link>
          </div>
        </div>

        {/* ── visual ── */}
        <div className="cyt-hero-visual">
          {isDesktop && fanCards.length > 0 ? (
            <div className="cyt-fan-wrap">
              <div className="cyt-fan">
                {fanCards.map((t, i) => (
                  <TherapistCard
                    key={t._id || `${fanStart}-${i}`}
                    t={t}
                    className={`cyt-fan-card cyt-fan-${i + 1}`}
                  />
                ))}
              </div>
              {ranked.length > 3 && (
                <div className="cyt-fan-nav">
                  <button type="button" aria-label="Previous therapist" onClick={() => fanGo(-1)}>
                    <ChevronLeftRounded sx={{ fontSize: 24 }} />
                  </button>
                  <button type="button" aria-label="Next therapist" onClick={() => fanGo(1)}>
                    <ChevronRightRounded sx={{ fontSize: 24 }} />
                  </button>
                </div>
              )}
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
            <div className="cyt-fan-skeleton" />
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes wordCycle {
          0%   { opacity: 0; }
          5%   { opacity: 1; }
          45%  { opacity: 1; }
          50%  { opacity: 0; }
          100% { opacity: 0; }
        }
        .banner-word-1 { position: absolute; left: 0; top: 0; animation: wordCycle 6s ease-in-out infinite; }
        .banner-word-2 { position: absolute; left: 0; top: 0; animation: wordCycle 6s ease-in-out infinite; animation-delay: 3s; opacity: 0; }

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
        .cyt-tname { font-weight: 800; font-size: 15px; color: #142a1d; }
        .cyt-trate { display: flex; align-items: center; gap: 1px; margin: 4px 0 8px; }
        .cyt-trate span { font-size: 12px; font-weight: 700; color: #49594e; margin-left: 6px; }
        .cyt-tspec {
          font-size: 12px; color: #5a6a5f; margin-bottom: 12px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
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

        /* ── fan (desktop + iPad landscape) ── */
        @media (min-width: 1024px) {
          .cyt-hero-inner { flex-direction: row; align-items: center; gap: 26px; }
          .cyt-hero-copy { flex: 0 0 52%; max-width: none; }
          .cyt-hero-visual { flex: 1; min-height: 420px; justify-content: flex-end; }
          .cyt-hero-visual::before { left: auto; right: 0; transform: none; top: -6px; width: 400px; height: 400px; }
          .cyt-fan { width: 408px; height: 372px; }
          .cyt-fan-card { width: 192px; max-width: 192px; }
          .cyt-fan-1 { left: 0; }
          .cyt-fan-2 { left: 108px; }
          .cyt-fan-3 { left: 216px; }
        }
        /* iPad landscape / small desktop: trim the headline so it fits beside the fan */
        @media (min-width: 1024px) and (max-width: 1299px) {
          .cyt-hero .title { font-size: clamp(2.2rem, 4vw, 3rem) !important; }
        }
        /* roomier fan on real desktop widths */
        @media (min-width: 1300px) {
          .cyt-hero-inner { gap: 30px; }
          .cyt-hero-copy { flex: 0 0 56%; }
          .cyt-hero-visual { min-height: 460px; }
          .cyt-hero-visual::before { top: -10px; width: 470px; height: 470px; }
          .cyt-fan { width: 486px; height: 404px; }
          .cyt-fan-card { width: 220px; max-width: 220px; }
          .cyt-fan-1 { left: 0; }
          .cyt-fan-2 { left: 133px; }
          .cyt-fan-3 { left: 266px; }
        }
        .cyt-fan-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 18px; }
        .cyt-fan {
          position: relative; z-index: 1; width: 486px; height: 404px;
          animation: cytFanIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cytFanIn {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cyt-fan-card {
          position: absolute; width: 220px; max-width: 220px;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.42s ease;
          will-change: transform;
          animation: cytCardIn 0.6s ease both;
        }
        @keyframes cytCardIn { from { opacity: 0; } to { opacity: 1; } }

        .cyt-fan-nav { display: flex; gap: 10px; margin-right: 4px; }
        .cyt-fan-nav button {
          width: 42px; height: 42px; border-radius: 50%; border: 1px solid #dbe9e0;
          background: rgba(255, 255, 255, 0.92); color: #1c6b45; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 22px -10px rgba(18, 66, 42, 0.28);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .cyt-fan-nav button:hover { transform: translateY(-2px); background: #fff; box-shadow: 0 16px 30px -12px rgba(18, 66, 42, 0.35); }
        .cyt-fan-nav button:active { transform: scale(0.92); }
        @media (prefers-reduced-motion: reduce) { .cyt-fan-nav button { transition: none; } }
        .cyt-fan-1 { left: 0; top: 40px; transform: rotate(-8deg); z-index: 1; }
        .cyt-fan-2 { left: 133px; top: 6px; transform: rotate(-1deg); z-index: 2; }
        .cyt-fan-3 { left: 266px; top: 44px; transform: rotate(7deg); z-index: 3; }
        .cyt-fan:hover .cyt-fan-card { filter: saturate(0.97) brightness(0.99); }
        .cyt-fan-card:hover {
          transform: rotate(0deg) translateY(-10px) scale(1.045); z-index: 9; filter: none;
          box-shadow: 0 44px 76px -22px rgba(18, 66, 42, 0.36), 0 8px 20px rgba(18, 66, 42, 0.1);
        }

        .cyt-fan-skeleton { width: 260px; height: 340px; border-radius: 22px; background: rgba(130, 204, 161, 0.18); }

        @media (prefers-reduced-motion: reduce) {
          .cyt-fan, .cyt-fan-card, .cyt-trow a, .cyt-swiper .swiper-slide,
          .banner-word-1, .banner-word-2 { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
}
