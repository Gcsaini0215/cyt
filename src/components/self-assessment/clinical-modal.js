import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchData } from "../../utils/actions";
import { apiUrl, getTherapistProfiles } from "../../utils/url";
import { cardOf } from "../../utils/related-therapists";

/* "Clinical assessment with a psychologist" for one test: what it costs, what the client gets, and
   the psychologists who offer it (Clinical Assessments add-on). Book → /book/<slug>?assess=<key>.
   Nobody offers it yet → our help contacts. */

const PHONE = "+918077757951";
const MAIL = "hello@chooseyourtherapist.in";

export default function ClinicalModal({ test, onClose }) {
  const [list, setList] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchData(`${apiUrl}/assessment-providers`), fetchData(getTherapistProfiles), fetchData(`${apiUrl}/assessment-pricing`)])
      .then(([prov, prof, pr]) => {
        const ids = new Set((prov?.data || []).map(String));
        const out = (prof?.data || []).filter((t) => t?._id && ids.has(String(t.user?._id || t.user))).map(cardOf);
        if (!alive) return;
        setList(out);
        setPrice(pr?.data?.tests?.[test.key] || null);
      })
      .catch(() => alive && setList([]));
    return () => { alive = false; };
  }, [test.key]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const wa = `https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(`Hi CYT team, I'd like a clinical assessment (${test.short}) with a psychologist.`)}`;
  const unavailable = price && !price.active;

  return (
    <div className="clm-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: CLM_CSS }} />
      <div className="clm" role="dialog" aria-modal="true" aria-labelledby="clm-h">
        <button type="button" className="clm-x" onClick={onClose} aria-label="Close">×</button>
        <span className="clm-kick">Clinical assessment · {test.short}</span>
        <h2 id="clm-h">{test.full} with a psychologist</h2>
        <ul className="clm-gets">
          <li>Answer the {test.short} online before your session</li>
          <li>Your psychologist gets an automatic report with your answers and score</li>
          <li>They go through it with you in the session, then the report is yours to keep</li>
        </ul>
        {price && !unavailable && (
          <p className="clm-price">
            Assessment fee {price.offer && <s>₹{price.fee}</s>} <b>₹{price.price}</b>{price.offer && price.offerLabel && <em>{price.offerLabel}</em>} <span>+ the psychologist&apos;s session fee</span>
          </p>
        )}

        {unavailable ? <p className="clm-off">This assessment can&apos;t be booked right now — please check back soon.</p>
          : list === null ? <div className="clm-skel" /> : list.length > 0 ? (
            <>
              <b className="clm-h3">Psychologists who offer it</b>
              <div className="clm-list">
                {list.map((t) => (
                  <div key={t.id} className="clm-t">
                    <span className="clm-av">{t.photo ? <img src={t.photo} alt="" /> : t.name.charAt(0)}</span>
                    <div className="clm-who"><b>{t.name}</b><span>{t.type}{t.city ? ` · ${t.city}` : ""}{t.fee ? ` · session from ₹${t.fee.toLocaleString("en-IN")}` : ""}</span></div>
                    <Link href={t.href} className="clm-btn ghost">View</Link>
                    <Link href={`${t.href.replace("/view-profile/", "/book/")}?assess=${test.key}`} className="clm-btn">Book</Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="clm-help">
              <b>We&apos;ll connect you with a psychologist</b>
              <span>No psychologist offers the {test.short} on CYT just yet. Message or call us and we&apos;ll arrange it.</span>
              <div className="clm-help-btns">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="clm-btn">WhatsApp us</a>
                <a href={`tel:${PHONE}`} className="clm-btn ghost">Call +91 80777 57951</a>
                <a href={`mailto:${MAIL}?subject=${encodeURIComponent(`${test.short} clinical assessment`)}`} className="clm-btn ghost">Email us</a>
              </div>
            </div>
          )}
        <p className="clm-ref">{test.ref}</p>
      </div>
    </div>
  );
}

const CLM_CSS = `
.clm-wrap { position: fixed; inset: 0; z-index: 2000; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; }
.clm { position: relative; width: min(580px, 100%); max-height: 88vh; overflow-y: auto; background: #fff; border-radius: 20px; padding: 24px 22px 18px; box-shadow: 0 30px 70px -20px rgba(0,0,0,.4); }
.clm-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.clm-kick { font-size: 12px; font-weight: 800; color: #166534; background: #dcfce7; border-radius: 999px; padding: 4px 10px; }
.clm h2 { margin: 10px 0 8px; font-size: 20px; font-weight: 800; color: #0f172a; font-family: inherit; padding-right: 30px; line-height: 1.3; }
.clm-gets { margin: 0 0 12px; padding: 0; list-style: none; } .clm-gets li { font-size: 13.5px; color: #334155; padding: 3px 0 3px 22px; position: relative; }
.clm-gets li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 800; }
.clm-price { margin: 0 0 14px; font-size: 14px; color: #334155; background: #f0fdf4; border-radius: 10px; padding: 10px 12px; }
.clm-price b { font-size: 18px; color: #14532d; } .clm-price s { color: #94a3b8; } .clm-price span { color: #64748b; font-size: 12.5px; }
.clm-price em { font-style: normal; font-size: 11.5px; font-weight: 800; color: #b45309; background: #fef3c7; border-radius: 999px; padding: 2px 8px; margin: 0 4px; }
.clm-off { font-size: 14px; color: #92400e; font-weight: 700; }
.clm-skel { height: 110px; border-radius: 12px; background: #f1f5f4; }
.clm-h3 { display: block; font-size: 14px; color: #0f172a; margin-bottom: 8px; }
.clm-list { display: flex; flex-direction: column; gap: 8px; }
.clm-t { display: flex; align-items: center; gap: 10px; border: 1px solid #e3eae6; border-radius: 12px; padding: 10px; }
.clm-av { width: 42px; height: 42px; border-radius: 12px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; overflow: hidden; flex-shrink: 0; }
.clm-av img { width: 100%; height: 100%; object-fit: cover; }
.clm-who { flex: 1; min-width: 0; } .clm-who b { display: block; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clm-who span { display: block; font-size: 12px; color: #64748b; }
.clm-btn { height: 36px; padding: 0 14px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; background: #166534; color: #fff !important; text-decoration: none !important; border: 1.5px solid #166534; white-space: nowrap; }
.clm-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.clm-help { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.clm-help b { font-size: 15px; color: #14532d; } .clm-help > span { font-size: 13.5px; color: #166534; line-height: 1.55; }
.clm-help-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.clm-ref { margin: 14px 0 0; font-size: 11.5px; color: #94a3b8; line-height: 1.5; }
@media (max-width: 560px) {
  .clm-wrap { place-items: end center; padding: 0; }
  .clm { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }
  .clm-help-btns .clm-btn { flex: 1 1 100%; height: 44px; }
}
`;
