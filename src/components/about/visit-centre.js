import React from "react";
import Link from "next/link";

/**
 * "Visit our Noida centre" — address, phone and hours exactly as on the
 * Google Business Profile (keep them identical: Google cross-checks the
 * site's NAP against the listing for local ranking), plus the same map
 * embed as the contact page. Keep in sync with GBP_URL / the `location`
 * block in pages/about-us.js.
 */
export const GBP_URL = "https://www.google.com/maps?cid=4421494166537850872";
const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.744111222452!2d77.37163351147552!3d28.58216257568552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce53c9f5d50bb%3A0x3d5c4d84b4f34ff8!2sChoose%20Your%20Therapist%20LLP%20%7C%20Psychologist%20in%20Noida%20%26%20Delhi!5e0!3m2!1sen!2sin!4v1716200000000!5m2!1sen!2sin";

const styles = `
  .vc-section { background: #f7f4ec; padding: clamp(48px, 7vw, 80px) 0; }
  .vc-wrap {
    max-width: 1120px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 48px);
    display: grid; grid-template-columns: 0.9fr 1.1fr; gap: clamp(24px, 4vw, 48px); align-items: stretch;
  }
  .vc-kicker {
    font-size: 12px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #a8862a;
    display: inline-flex; align-items: center; gap: 12px; margin: 0 0 10px;
  }
  .vc-kicker::before { content: ""; width: 28px; height: 2px; background: #d4af37; display: inline-block; }
  .vc-title { font-size: clamp(24px, 3vw, 32px); font-weight: 900; color: #0f172a; line-height: 1.2; margin: 0 0 12px; }
  .vc-lead { font-size: 14.5px; line-height: 1.8; color: #4a5468; margin: 0 0 22px; }

  .vc-list { list-style: none; margin: 0 0 24px; padding: 0; border-top: 1px solid #e6dfcc; }
  .vc-list li { display: grid; grid-template-columns: 92px 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e6dfcc; font-size: 14.5px; line-height: 1.6; color: #1f2937; }
  .vc-list b { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #a8862a; padding-top: 2px; }
  .vc-list a { color: #0f172a; font-weight: 700; text-decoration: none; }
  .vc-list a:hover { text-decoration: underline; }

  .vc-actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .vc-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; transition: background .2s, color .2s, border-color .2s; }
  .vc-btn-primary { background: #0f172a; color: #fff; }
  .vc-btn-primary:hover { background: #1e293b; color: #fff; }
  .vc-btn-ghost { border: 1.5px solid #0f172a; color: #0f172a; background: transparent; }
  .vc-btn-ghost:hover { background: #0f172a; color: #fff; }

  .vc-map { border-radius: 18px; overflow: hidden; border: 6px solid #fff; box-shadow: 0 30px 60px -36px rgba(15,23,42,.45); min-height: 380px; background: #e9e4d4; }
  .vc-map iframe { width: 100%; height: 100%; min-height: 380px; border: 0; display: block; }

  @media (max-width: 860px) {
    .vc-wrap { grid-template-columns: 1fr; }
    .vc-map, .vc-map iframe { min-height: 300px; }
  }
  @media (max-width: 480px) {
    .vc-list li { grid-template-columns: 1fr; gap: 2px; }
    .vc-btn { flex: 1 1 100%; justify-content: center; }
  }
`;

export default function VisitCentre() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="vc-section" aria-labelledby="vc-title">
        <div className="vc-wrap">
          <div>
            <p className="vc-kicker">Visit Us</p>
            <h2 className="vc-title" id="vc-title">Our Therapy Centre in Noida</h2>
            <p className="vc-lead">
              Prefer to meet in person? Sessions with our psychologists are available at our
              clinical space in Sector 51, Noida — easy to reach from Delhi, Greater Noida and
              Ghaziabad.
            </p>
            <ul className="vc-list">
              <li>
                <b>Address</b>
                <address style={{ fontStyle: "normal", margin: 0 }}>
                  Choose Your Therapist LLP, Gate No-3, D-137, near LPS Global School, Block D,
                  Sector 51, Noida, Uttar Pradesh 201301
                </address>
              </li>
              <li>
                <b>Phone</b>
                <a href="tel:+918077757951">+91 80777 57951</a>
              </li>
              <li>
                <b>Hours</b>
                <span>Monday – Sunday, 9:00 AM – 9:00 PM</span>
              </li>
            </ul>
            <div className="vc-actions">
              <Link className="vc-btn vc-btn-primary" href="/noida-appointment">Book at Noida Centre</Link>
              <a className="vc-btn vc-btn-ghost" href={GBP_URL} target="_blank" rel="noopener noreferrer">Get Directions</a>
            </div>
          </div>
          <div className="vc-map">
            <iframe
              src={MAP_EMBED}
              title="Choose Your Therapist LLP — therapy centre in Sector 51, Noida on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
