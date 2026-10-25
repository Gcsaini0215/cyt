import React, { useMemo } from "react";
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
   only the rating card shows. */
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

  return (
    <section className="hrv" aria-labelledby="hrv-title">
      <div className="container">
        <div className="hrv-head">
          <div>
            <span className="hrv-bar" aria-hidden="true" />
            <h2 id="hrv-title" className="hrv-title">What our <span>clients say</span></h2>
            <p className="hrv-sub">Verified reviews from people who found the right psychologist with us.</p>
          </div>
          <a className="hrv-google" href={GBP_URL} target="_blank" rel="noreferrer">
            <b>{ratingText(ps)}</b>
            <span className="hrv-g-stars" aria-hidden="true">★★★★★</span>
            <span className="hrv-g-l">on Google · {reviewsText(ps)} reviews</span>
            <span className="hrv-g-s">{sessionsText(ps)} sessions</span>
          </a>
        </div>

        {showSlides && (
          <Swiper
            className="hrv-swiper"
            spaceBetween={16}
            breakpoints={{ 0: { slidesPerView: 1.12 }, 601: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={items.length > 3}
            modules={[Autoplay]}
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
                      <span className="hrv-ok">✓ Verified session</span>
                    </div>
                    <blockquote className="hrv-text">{it.text}</blockquote>
                    <figcaption className="hrv-foot">
                      <span className="hrv-av" style={{ background: bg, color: fg }}>{initials(it.reviewerName)}</span>
                      <span className="hrv-who">
                        <b>{it.reviewerName}</b>
                        <span>Session with <Link href={profilePath(it.therapist)}>{it.therapistName}</Link></span>
                      </span>
                      {it.therapistPhoto && (
                        <Link href={profilePath(it.therapist)} className="hrv-th" aria-label={`${it.therapistName}'s profile`}>
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
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </section>
  );
}

const CSS = `
.hrv { background: #f6faf7; padding: 64px 0 56px; }
.hrv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
.hrv-bar { display: block; width: 42px; height: 4px; border-radius: 2px; background: #d4a24c; margin-bottom: 12px; }
.hrv .hrv-title { font-size: clamp(24px, 3vw, 34px); font-weight: 800; color: #0b1712; margin: 0 0 6px; line-height: 1.2; }
.hrv-title span { color: #a86e0e; }
.hrv .hrv-sub { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0; padding: 0; }
.hrv-google { flex-shrink: 0; display: grid; grid-template-columns: auto auto; align-items: center; gap: 0 10px; padding: 12px 18px; border-radius: 16px; background: #fff; border: 1px solid #e8e1cc; box-shadow: 0 14px 30px -24px rgba(122,84,19,.6); text-decoration: none !important; }
.hrv-google b { grid-row: span 2; font-size: 30px; font-weight: 900; color: #0b1712; line-height: 1; }
.hrv-g-stars { color: #e3a83a; font-size: 15px; letter-spacing: 1px; }
.hrv-g-l { font-size: 12.5px; color: #475569; font-weight: 600; }
.hrv-g-s { grid-column: 1 / -1; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f0ebdc; font-size: 12px; font-weight: 700; color: #1e7a4c; }

.hrv-swiper { padding: 4px 2px 8px !important; }
.hrv-swiper .swiper-wrapper { align-items: stretch; }
.hrv-swiper .swiper-slide { height: auto; }
.hrv-card { position: relative; margin: 0; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; padding: 20px 20px 16px; background: #fff; border: 1px solid #e6ece8; border-radius: 18px; box-shadow: 0 16px 34px -28px rgba(20,83,45,.55); }
.hrv-card::before { content: "\\201C"; position: absolute; top: 4px; right: 16px; font-size: 64px; line-height: 1; font-family: Georgia, serif; color: #f1e3c2; pointer-events: none; }
.hrv-top { display: flex; align-items: center; gap: 10px; }
.hrv-stars i { font-style: normal; color: #dfe5e1; font-size: 15px; }
.hrv-stars i.on { color: #e3a83a; }
.hrv-ok { font-size: 11px; font-weight: 700; color: #1e7a4c; background: #eef7f1; border-radius: 999px; padding: 2px 9px; }
.hrv-text { flex: 1; margin: 0; padding: 0; border: none; font-size: 14.5px; line-height: 1.7; color: #334155; font-style: normal; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
.hrv-text::before, .hrv-text::after { content: none; }
.hrv-foot { display: flex; align-items: center; gap: 10px; text-align: left; padding-top: 12px; border-top: 1px solid #f0f3f1; }
.hrv-av { flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
.hrv-who { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.hrv-who b { font-size: 14px; color: #13261c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrv-who span { font-size: 12px; color: #7c8b81; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrv-who a { color: #1e7a4c !important; font-weight: 700; text-decoration: none !important; }
.hrv-th { flex-shrink: 0; width: 38px; height: 38px; border-radius: 10px; overflow: hidden; border: 1.5px solid #e6ece8; }
.hrv-th img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }

@media (max-width: 1023px) { .hrv { padding: 52px 0 48px; } }
@media (max-width: 600px) {
  .hrv { padding: 40px 0 36px; }
  .hrv-head { flex-direction: column; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
  .hrv-swiper { margin: 0 -16px !important; padding: 4px 16px 8px !important; }
  .hrv-card { padding: 16px 16px 14px; }
  .hrv-text { font-size: 14px; }
}
`;
