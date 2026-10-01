import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard } from "swiper/modules";
import "swiper/css";
import { imagePath } from "../../utils/url";

/**
 * Leadership notes — a short personal message per person, image on one side
 * and the note on the other. Sits right under the hero banner. One person per
 * slide; moved by swipe/drag, arrows or dots only (no autoplay — a note
 * shouldn't slide away mid-read). To add someone, append to NOTES; `focus`
 * is the object-position that keeps their face in the portrait crop.
 */
const NOTES = [
  {
    kicker: "A Note From Our Founder",
    name: "Mr. Deepak Kumar",
    role: "Founder & Director, Choose Your Therapist LLP",
    caption: "Mr. Deepak Kumar — Founder & Director",
    // Same photo as his therapist directory card.
    img: `${imagePath}/2bbed01e-4c05-4d99-aa6a-7c1f2053cfa5_profile-picture.jpg`,
    focus: "top center",
    note:
      "When I started Choose Your Therapist in 2020, mental health support in India was hard to find, harder to trust, and hardest to afford. I built this platform because reaching out for help should never be the hardest part of healing. Every therapist on our network is personally verified, every session is confidential, and every person who comes to us is met with care — not judgment.",
  },
  {
    kicker: "A Note From Our Head of Operations",
    name: "Mr. Shubham Kumar",
    role: "Associate Psychologist & Head of Operations",
    caption: "Mr. Shubham Kumar — Head of Operations",
    img: "/images/team/shubham-kumar.jpg",
    focus: "55% 20%",
    note:
      "As a psychologist, I see every day how much courage it takes to book that first session. As Head of Operations, my job is to make sure nothing gets in the way once you do — the right therapist match, sessions that start on time, clear communication, and a team that follows up and genuinely listens. Behind every booking on CYT are people who treat your trust as a responsibility, not a transaction.",
  },
];

const styles = `
  .dn-section {
    background: #fff;
    padding: clamp(48px, 8vw, 84px) 0;
  }
  .dn-wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 clamp(20px, 5vw, 48px);
  }
  .dn-slide {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: clamp(32px, 6vw, 64px);
    align-items: center;
    padding: 4px 0 34px; /* room for the portrait's shadow inside the swiper's overflow clip */
  }

  .dn-portrait {
    position: relative;
    justify-self: center;
    width: 320px;
    max-width: 100%;
    aspect-ratio: 3 / 3.6;
    border-radius: 20px;
    overflow: hidden;
    border: 6px solid #f2eee1;
    box-shadow: 0 30px 60px -28px rgba(15, 61, 36, 0.35);
    margin: 0;
  }
  .dn-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .dn-portrait figcaption {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 26px 16px 14px;
    background: linear-gradient(180deg, transparent, rgba(15, 25, 15, 0.78));
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .dn-copy { color: #1f3320; }
  .dn-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3c7a4a;
    margin: 0 0 14px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .dn-kicker::before { content: ""; width: 28px; height: 2px; background: #d4af37; display: inline-block; }

  .dn-quote-mark {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 64px;
    line-height: 0.5;
    color: #d9e5d2;
    display: block;
    margin-bottom: 8px;
  }

  /* Same type as the About The Platform columns (.sq-col p), so the page
     reads in one font. */
  .dn-note {
    font-size: 14.5px;
    line-height: 1.85;
    color: #2b3d2a;
    margin: 0 0 22px;
  }

  .dn-sign-name { font-weight: 700; font-size: 16px; color: #0f3d24; }
  .dn-sign-role { font-size: 12.5px; color: #6b7a63; margin-top: 4px; }

  /* Controls — arrows + dots, centred under the slides */
  .dn-controls { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 6px; }
  .dn-arrow {
    width: 42px; height: 42px;
    border-radius: 50%;
    border: 1px solid #d9e5d2;
    background: #fff;
    color: #0f3d24;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .2s, border-color .2s, opacity .2s;
  }
  .dn-arrow:hover:not(:disabled) { background: #f2f7ef; border-color: #3c7a4a; }
  .dn-arrow:disabled { opacity: .35; cursor: default; }
  .dn-arrow svg { width: 18px; height: 18px; }
  .dn-dots { display: flex; gap: 8px; }
  .dn-dot {
    width: 9px; height: 9px; padding: 0;
    border-radius: 999px;
    border: 0;
    background: #d9e5d2;
    cursor: pointer;
    transition: width .25s, background .25s;
  }
  .dn-dot.is-active { width: 26px; background: #3c7a4a; }

  /* Tablet + mobile — stack, smaller portrait; note/kicker/sign sizes stay
     exactly as above at every width, on purpose. */
  @media (max-width: 860px) {
    .dn-slide { grid-template-columns: 1fr; text-align: center; }
    .dn-kicker { justify-content: center; }
    .dn-quote-mark { text-align: center; }
    .dn-portrait { width: 240px; }
  }
  @media (max-width: 480px) {
    .dn-portrait { width: 190px; }
    .dn-quote-mark { font-size: 44px; }
    .dn-kicker::before { display: none; }
  }
`;

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
  </svg>
);

export default function DirectorNote() {
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);

  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes
          in <style> text children but browsers don't un-escape them, so a
          string child hydration-mismatches. */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="dn-section" aria-roledescription="carousel" aria-label="Notes from our leadership">
        <div className="dn-wrap">
          <Swiper
            modules={[Keyboard]}
            slidesPerView={1}
            spaceBetween={40}
            speed={500}
            keyboard={{ enabled: true, onlyInViewport: true }}
            onSwiper={(s) => { swiperRef.current = s; }}
            onSlideChange={(s) => setActive(s.activeIndex)}
          >
            {NOTES.map((p, i) => (
              <SwiperSlide key={p.name} aria-label={`${i + 1} of ${NOTES.length}`}>
                <div className="dn-slide">
                  <figure className="dn-portrait">
                    <img src={p.img} alt={`${p.name}, ${p.role}`} style={{ objectPosition: p.focus }} loading={i === 0 ? "eager" : "lazy"} />
                    <figcaption>{p.caption}</figcaption>
                  </figure>

                  <div className="dn-copy">
                    <span className="dn-kicker">{p.kicker}</span>
                    <span className="dn-quote-mark">&ldquo;</span>
                    <p className="dn-note">{p.note}</p>
                    <div className="dn-sign-name">{p.name}</div>
                    <div className="dn-sign-role">{p.role}</div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {NOTES.length > 1 && (
            <div className="dn-controls">
              <button type="button" className="dn-arrow" aria-label="Previous note" disabled={active === 0} onClick={() => swiperRef.current?.slidePrev()}>
                <Arrow dir="prev" />
              </button>
              <div className="dn-dots">
                {NOTES.map((p, i) => (
                  <button
                    key={p.name}
                    type="button"
                    className={`dn-dot${i === active ? " is-active" : ""}`}
                    aria-label={`Show note from ${p.name}`}
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => swiperRef.current?.slideTo(i)}
                  />
                ))}
              </div>
              <button type="button" className="dn-arrow" aria-label="Next note" disabled={active === NOTES.length - 1} onClick={() => swiperRef.current?.slideNext()}>
                <Arrow dir="next" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
