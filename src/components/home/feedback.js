import React, { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import { imagePath } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";
import { usePublicStats, ratingText, reviewsText, sessionsText } from "../../utils/public-stats";
import { GBP_URL } from "../about/visit-centre";

const initials = (n) => String(n || "C").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
// a soft colour per reviewer, so the avatars aren't all the same
const TINTS = [["#e7f4ec", "#1e7a4c"], ["#fbf1dc", "#9a6a12"], ["#e8f1f8", "#2b6a99"], ["#f6e9ee", "#a24768"], ["#eeeaf8", "#5b4ba0"]];
const tintOf = (n) => TINTS[[...String(n || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];

/* Home "What our clients say": real reviews left on therapists' profiles (newest three per
   therapist), next to the Google rating. No made-up reviews — with fewer than three real ones
   only the rating card shows. Cards are flat (border, no shadow) so nothing overlaps in the slider. */
export default function Feedback({ therapists = [] }) {
  const ps = usePublicStats();
  const items = useMemo(() => {
    const all = [];
    therapists.forEach((t) => {
      if (!t.reviews?.length) return;
      [...t.reviews]
        .filter((r) => r.description?.trim())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3)
        .forEach((r) => {
          all.push({
            reviewerName: r.name || "Client",
            rating: r.rating || 5,
            text: r.description.trim(),
            therapist: t,
            therapistName: t.user?.name || "Therapist",
            therapistType: t.profile_type || "Mental Health Professional",
            therapistPhoto: t.user?.profile ? `${imagePath}/${t.user.profile}` : null,
          });
        });
    });
    return all.sort((a, b) => b.rating - a.rating).slice(0, 18);
  }, [therapists]);
  const showSlides = items.length >= 3;
  const [sw, setSw] = useState(null);
  const [at, setAt] = useState(0);

  return (
    <section className="hrv" aria-labelledby="hrv-title">
      <div className="container">
        <div className="hrv-head">
          <div className="hrv-intro">
            <p className="hrv-eyebrow">Real reviews · verified sessions</p>
            <h2 id="hrv-title" className="hrv-title">What our <span>clients say</span></h2>
            <p className="hrv-sub">Verified reviews from people who found the right psychologist with us.</p>
          </div>
          <a className="hrv-google" href={GBP_URL} target="_blank" rel="noreferrer">
            <span className="hrv-g-n">{ratingText(ps)}</span>
            <span className="hrv-g-r">
              <span className="hrv-g-stars" aria-hidden="true">★★★★★</span>
              <span className="hrv-g-l"><b>Google</b> · {reviewsText(ps)} reviews</span>
            </span>
            <span className="hrv-g-s"><i className="feather-users" aria-hidden="true" /> {sessionsText(ps)} sessions done <i className="feather-arrow-up-right hrv-g-go" aria-hidden="true" /></span>
          </a>
        </div>

        {showSlides && (
          <>
            <Swiper
              className="hrv-swiper"
              spaceBetween={16}
              breakpoints={{ 0: { slidesPerView: 1.2, spaceBetween: 12 }, 601: { slidesPerView: 2, spaceBetween: 16 }, 1024: { slidesPerView: 3, spaceBetween: 16 }, 1200: { slidesPerView: 4, spaceBetween: 16 } }}
              autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              loop={items.length > 3}
              modules={[Autoplay]}
              onSwiper={setSw}
              onSlideChange={(x) => setAt(x.realIndex)}
            >
              {items.map((it, i) => {
                const [bg, fg] = tintOf(it.reviewerName);
                return (
                  <SwiperSlide key={i}>
                    <figure className="hrv-card">
                      <div className="hrv-top">
                        <span className="hrv-stars" aria-label={`${it.rating} out of 5`}>
                          {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= it.rating ? "on" : ""}>★</i>)}
                        </span>
                        <span className="hrv-ok"><i className="feather-check-circle" aria-hidden="true" /> Verified</span>
                      </div>
                      <blockquote className="hrv-text">{it.text}</blockquote>
                      <figcaption className="hrv-foot">
                        <span className="hrv-av" style={{ background: bg, color: fg }}>{initials(it.reviewerName)}</span>
                        <span className="hrv-who">
                          <b>{it.reviewerName}</b>
                          <span>Session with <Link href={profilePath(it.therapist)}>{it.therapistName}</Link></span>
                        </span>
                        {it.therapistPhoto && (
                          <Link href={profilePath(it.therapist)} className="hrv-th" aria-label={`${it.therapistName} profile`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={it.therapistPhoto} alt={it.therapistName} loading="lazy" decoding="async" />
                          </Link>
                        )}
                      </figcaption>
                    </figure>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <div className="hrv-nav">
              <span className="hrv-prog" aria-hidden="true"><i style={{ width: `${((at + 1) / items.length) * 100}%` }} /></span>
              <span className="hrv-count">{String(at + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
              <button type="button" className="hrv-arr" onClick={() => sw?.slidePrev()} aria-label="Previous review"><i className="feather-arrow-left" aria-hidden="true" /></button>
              <button type="button" className="hrv-arr" onClick={() => sw?.slideNext()} aria-label="Next review"><i className="feather-arrow-right" aria-hidden="true" /></button>
            </div>
          </>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </section>
  );
}

const CSS = `
.hrv { position: relative; overflow: hidden; isolation: isolate; padding: 72px 0 60px; background: linear-gradient(180deg, #f2f6f1 0%, #f8f6ee 100%); }
.hrv::before { content: ""; position: absolute; z-index: -1; width: 520px; height: 520px; left: -220px; top: -260px; border-radius: 50%; background: radial-gradient(circle, rgba(227,168,58,.16), rgba(227,168,58,0) 68%); }
.hrv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px 32px; margin-bottom: 28px; }
.hrv-intro { min-width: 0; }
.hrv .hrv-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 12px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #a86e0e; }
.hrv .hrv-eyebrow::before { content: ""; width: 26px; height: 2px; background: #d4a24c; }
.hrv .hrv-title { font-size: clamp(1.95rem, 3.6vw, 2.9rem); font-weight: 800; color: #0b1712; margin: 0 0 10px; line-height: 1.12; letter-spacing: -.02em; }
.hrv-title span { color: #1e7a4c; }
.hrv .hrv-sub { color: #4b5b53; font-size: 16px; line-height: 1.6; margin: 0; padding: 0; max-width: 60ch; }

.hrv-google { flex-shrink: 0; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 0 14px; min-width: 280px; padding: 16px 20px; border-radius: 20px; background: #fff; border: 1px solid #e6dcc3; text-decoration: none !important; transition: border-color .2s ease; }
.hrv-google:hover { border-color: #d4a24c; }
.hrv-g-n { font-size: 40px; font-weight: 900; color: #0b1712; line-height: 1; letter-spacing: -.02em; }
.hrv-g-r { display: flex; flex-direction: column; gap: 4px; }
.hrv-g-stars { color: #e3a83a; font-size: 17px; letter-spacing: 2px; line-height: 1; }
.hrv-g-l { font-size: 13px; color: #4b5b53; font-weight: 600; }
.hrv-g-l b { color: #0b1712; }
.hrv-g-s { grid-column: 1 / -1; display: flex; align-items: center; gap: 7px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed #eadfc4; font-size: 13px; font-weight: 800; color: #166534; }
.hrv-g-go { margin-left: auto; color: #a86e0e; }

.hrv-swiper { overflow: hidden; padding: 2px !important; }
.hrv-swiper .swiper-wrapper { align-items: stretch; }
.hrv-swiper .swiper-slide { height: auto; }
.hrv-card { position: relative; margin: 0; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; padding: 16px 16px 14px; background: #fff; border: 1px solid #e3ebe5; border-radius: 16px; box-shadow: none; transition: border-color .2s ease; }
.hrv-card:hover { border-color: #b9d6c3; }
.hrv-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.hrv-stars { display: inline-flex; gap: 2px; }
.hrv-stars i { font-style: normal; color: #dfe5e1; font-size: 14px; }
.hrv-stars i.on { color: #e3a83a; }
.hrv-text { flex: 1; margin: 0; padding: 0; border: none; font-size: 14px; line-height: 1.6; color: #26342d; font-style: normal; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.hrv-text::before, .hrv-text::after { content: none; }
.hrv-ok { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #166534; background: #eef7f1; border-radius: 999px; padding: 2px 8px; }
.hrv-foot { display: flex; align-items: center; gap: 9px; text-align: left; padding-top: 10px; border-top: 1px solid #eef2ef; }
.hrv-av { flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800; }
.hrv-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.hrv-who b { font-size: 13.5px; color: #13261c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrv-who span { font-size: 12px; color: #6b7b72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrv-who a { color: #1e7a4c !important; font-weight: 700; text-decoration: none !important; }
.hrv-th { flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; overflow: hidden; border: 1px solid #e3ebe5; }
.hrv-th img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }

.hrv-nav { display: flex; align-items: center; gap: 12px; margin-top: 22px; }
.hrv-prog { flex: 1; height: 3px; border-radius: 3px; background: #dfe7e1; overflow: hidden; }
.hrv-prog i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #1e7a4c, #e3a83a); transition: width .4s ease; }
.hrv-count { font-size: 13px; font-weight: 800; color: #4b5b53; font-variant-numeric: tabular-nums; min-width: 58px; text-align: center; }
.hrv-arr { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #cfdcd4; background: #fff; color: #14532d; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s ease, color .2s ease, border-color .2s ease; }
.hrv-arr:hover { background: #1e7a4c; border-color: #1e7a4c; color: #fff; }
.hrv-arr:focus-visible, .hrv-google:focus-visible { outline: 2px solid #e3a83a; outline-offset: 2px; }

@media (max-width: 1023px) {
  .hrv { padding: 56px 0 48px; }
  .hrv-head { flex-direction: column; align-items: stretch; }
  .hrv-google { align-self: flex-start; }
}
@media (max-width: 600px) {
  .hrv { padding: 48px 0 40px; }
  .hrv-head { gap: 16px; margin-bottom: 20px; }
  .hrv .hrv-title { font-size: 24px; line-height: 1.25; margin: 0 0 8px; }
  .hrv .hrv-sub { font-size: 15px; }
  /* one slim row on phones */
  .hrv-google { align-self: stretch; min-width: 0; grid-template-columns: auto 1fr auto; padding: 10px 14px; border-radius: 14px; gap: 0 10px; }
  .hrv-g-n { font-size: 28px; }
  .hrv-g-stars { font-size: 14px; }
  .hrv-g-l { font-size: 12px; }
  .hrv-g-s { grid-column: auto; margin: 0; padding: 0 0 0 10px; border-top: 0; border-left: 1px dashed #eadfc4; flex-direction: column; align-items: flex-start; gap: 0; font-size: 12px; line-height: 1.3; }
  .hrv-g-s > i { display: none; }
  .hrv-swiper { margin: 0 -15px !important; padding: 2px 15px !important; }
  .hrv-card { padding: 14px 14px 12px; }
  .hrv-nav { margin-top: 16px; gap: 10px; }
  .hrv-arr { width: 40px; height: 40px; }
}
@media (prefers-reduced-motion: reduce) { .hrv-card, .hrv-arr, .hrv-prog i, .hrv-google { transition: none; } }
`;
