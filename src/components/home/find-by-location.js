import React from "react";
import Link from "next/link";
import ImageTag from "../../utils/image-tag";

// Real city photography — Delhi already existed in the repo; the rest are
// freely-licensed (CC) landmark photos sourced from Wikimedia Commons.
// NOTE before shipping: these need a short photo-credit line per Wikimedia's
// CC-BY-SA licence (see footer), or swap in owned/stock photography instead.
const CITIES = [
  { name: "Delhi NCR", count: "140+ therapists", img: "/assets/img/Delhi.png", href: "/psychologist-in/delhi" },
  { name: "Noida", count: "80+ therapists", img: "/assets/img/cities/noida.jpg", href: "/psychologist-in-noida-delhi" },
  { name: "Mumbai", count: "95+ therapists", img: "/assets/img/cities/mumbai.jpg", href: "/psychologist-in/mumbai" },
  { name: "Bangalore", count: "110+ therapists", img: "/assets/img/cities/bangalore.jpg", href: "/psychologist-in/bangalore" },
  { name: "Hyderabad", count: "58+ therapists", img: "/assets/img/cities/hyderabad.jpg", href: "/psychologist-in/hyderabad" },
  { name: "Chennai", count: "71+ therapists", img: "/assets/img/cities/chennai.jpg", href: "/psychologist-in/chennai" },
  { name: "Kolkata", count: "44+ therapists", img: "/assets/img/cities/kolkata.jpg", href: "/psychologist-in/kolkata" },
  { name: "Jaipur", count: "33+ therapists", img: "/assets/img/cities/jaipur.jpg", href: "/psychologist-in/jaipur" },
  { name: "Dehradun", count: "21+ therapists", img: "/assets/img/cities/dehradun.jpg", href: "/psychologist-in/uttarakhand" },
  { name: "Haridwar", count: "18+ therapists", img: "/assets/img/cities/haridwar.jpg", href: "/psychologist-in/uttarakhand" },
];

export default function FindByLocation() {
  return (
    <section className="fbl-section">
      <div className="container">
        <div className="fbl-head">
          <h2>Find a Psychologist Near You</h2>
          <p>Connect with verified therapists in your city — online or in person.</p>
        </div>

        <div className="fbl-grid">
          {CITIES.map((c) => (
            <Link key={c.name} href={c.href} className="fbl-tile">
              <ImageTag src={c.img} alt={`Psychologist in ${c.name}`} className="fbl-img" />
              <span className="fbl-scrim" />
              <span className="fbl-arrow">→</span>
              <span className="fbl-info">
                <span className="fbl-name">{c.name}</span>
                <span className="fbl-count">{c.count}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="fbl-cta-wrap">
          <Link href="/view-all-therapist" className="fbl-cta">
            View All Cities <span>→</span>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .fbl-section {
          background: linear-gradient(135deg, #ffffff, #f7fbf9);
          padding: 80px 0 90px;
          position: relative;
          overflow: hidden;
        }
        .fbl-head { text-align: center; margin-bottom: 36px; }
        .fbl-head h2 {
          font-weight: 900; font-size: clamp(1.7rem, 3vw, 2.3rem); color: #0f2f1f;
          margin: 0 0 10px; letter-spacing: -0.3px;
        }
        .fbl-head p { color: #556b63; font-size: 15px; max-width: 560px; margin: 0 auto; line-height: 1.6; }

        .fbl-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
        .fbl-tile {
          position: relative; display: block; aspect-ratio: 4 / 3; border-radius: 16px; overflow: hidden;
          box-shadow: 0 16px 34px -18px rgba(15, 47, 31, 0.3); text-decoration: none;
        }
        .fbl-tile .fbl-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          object-position: center 65%; transition: transform 0.5s ease;
        }
        .fbl-tile:hover .fbl-img { transform: scale(1.06); }
        .fbl-scrim {
          position: absolute; left: 0; right: 0; bottom: 0; height: 65%;
          background: linear-gradient(to top, rgba(4, 15, 9, 0.85), transparent);
        }
        .fbl-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px; display: flex; flex-direction: column; }
        .fbl-name { font-weight: 800; color: #fff; font-size: 13.5px; }
        .fbl-count { font-size: 10.5px; color: rgba(255, 255, 255, 0.82); margin-top: 2px; }
        .fbl-arrow {
          position: absolute; top: 10px; right: 10px; width: 26px; height: 26px; border-radius: 50%;
          background: rgba(255, 255, 255, 0.92); display: flex; align-items: center; justify-content: center;
          color: #228756; font-weight: 800; opacity: 0; transform: translateY(-4px); transition: all 0.25s ease;
        }
        .fbl-tile:hover .fbl-arrow { opacity: 1; transform: translateY(0); }

        .fbl-cta-wrap { text-align: center; margin-top: 30px; }
        .fbl-cta {
          display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800; color: #fff;
          background: linear-gradient(135deg, #228756, #1a6f47); padding: 12px 28px; border-radius: 999px;
          text-decoration: none; box-shadow: 0 10px 24px -8px rgba(34, 135, 86, 0.5); transition: transform 0.2s ease;
        }
        .fbl-cta:hover { transform: translateY(-2px); }

        @media (max-width: 1200px) { .fbl-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 900px) { .fbl-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
        @media (max-width: 600px) {
          .fbl-section { padding: 56px 0 60px; }
          .fbl-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .fbl-name { font-size: 12px; }
          .fbl-count { font-size: 9.5px; }
        }
      `}</style>
    </section>
  );
}
