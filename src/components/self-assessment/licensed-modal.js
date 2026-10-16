import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { postData } from "../../utils/actions";
import { getDecodedToken, isAuthenticated } from "../../utils/jwt";
import { rememberAssessmentIntent } from "../client/pre-session-forms";
import { fetchData } from "../../utils/actions";
import { apiUrl, getTherapistProfiles } from "../../utils/url";
import { cardOf } from "../../utils/related-therapists";

/* "Take with a psychologist" for a copyrighted questionnaire: only psychologists who have shared
   their licence for it (Settings → Licences) are listed. If none has, the visitor gets our help
   contacts and we connect them. */

const PHONE = "+918077757951";
const MAIL = "hello@chooseyourtherapist.in";

export default function LicensedModal({ test, onClose }) {
  const [list, setList] = useState(null);
  const [note, setNote] = useState({}); // therapist id -> message after "already booked"
  const router = useRouter();
  const isClient = isAuthenticated() && getDecodedToken()?.role === 0;

  // Book: remember the questionnaire — it is sent to the client as soon as the booking is paid
  const book = async (t) => {
    rememberAssessmentIntent(t.id, test.key);
    if (isClient) { try { await postData(`${apiUrl}/assessment-requests/intent`, { therapistId: t.id, tool: test.key }); } catch (e) { /* sent again from the portal */ } }
    router.push(t.href.replace("/view-profile/", "/book/"));
  };
  // already booked with this psychologist → send it now for that session
  const already = async (t) => {
    setNote((n) => ({ ...n, [t.id]: "…" }));
    try {
      const r = await postData(`${apiUrl}/assessment-requests/intent`, { therapistId: t.id, tool: test.key });
      setNote((n) => ({ ...n, [t.id]: r?.data?.state === "sent" ? "✓ Sent — open My check-ins to fill it before your session." : "No upcoming session with them yet — book one and it will be sent automatically." }));
    } catch (e) {
      setNote((n) => ({ ...n, [t.id]: e?.response?.data?.message || "Couldn't send — please try again." }));
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([fetchData(`${apiUrl}/assessment-licences/public?tool=${test.key}`), fetchData(getTherapistProfiles)])
      .then(([lic, prof]) => {
        const ids = new Set((lic?.data || []).map(String));
        const out = (prof?.data || []).filter((t) => t?._id && ids.has(String(t.user?._id || t.user))).map(cardOf);
        if (alive) setList(out);
      })
      .catch(() => alive && setList([]));
    return () => { alive = false; };
  }, [test.key]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const wa = `https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(`Hi CYT team, I'd like to take the ${test.title} (${test.short}) with a licensed psychologist.`)}`;

  return (
    <div className="slm-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: SLM_CSS }} />
      <div className="slm" role="dialog" aria-modal="true" aria-labelledby="slm-h">
        <button type="button" className="slm-x" onClick={onClose} aria-label="Close">×</button>
        <span className="slm-kick">🔒 {test.short} · licensed questionnaire</span>
        <h2 id="slm-h">{test.title}</h2>
        <p className="slm-sub">{test.measures} It is copyrighted, so it is given only by a psychologist who holds the licence. They take you through it in a session and explain your score with you — it isn&apos;t shown online.</p>
        <p className="slm-ref"><b>Reference:</b> {test.ref}<br /><span>{test.holder}</span></p>

        {list === null ? <div className="slm-skel" /> : list.length > 0 ? (
          <>
            <b className="slm-h3">Psychologists licensed to give the {test.short}</b>
            <div className="slm-list">
              {list.map((t) => (
                <div key={t.id} className="slm-t">
                  <div className="slm-t-row">
                    <span className="slm-av">{t.photo ? <img src={t.photo} alt="" /> : t.name.charAt(0)}</span>
                    <div className="slm-who"><b>{t.name}</b><span>{t.type}{t.city ? ` · ${t.city}` : ""}</span></div>
                    <Link href={t.href} className="slm-btn ghost">View</Link>
                    <button type="button" className="slm-btn" onClick={() => book(t)}>Book</button>
                  </div>
                  {isClient && (note[t.id]
                    ? <p className="slm-note">{note[t.id]}</p>
                    : <button type="button" className="slm-link" onClick={() => already(t)}>Already booked with {t.name.split(" ").slice(0, 2).join(" ")}? Send it to me for that session</button>)}
                </div>
              ))}
            </div>
            <p className="slm-tip">After you book, the {test.short} is sent to you automatically to fill before your session. Your score goes to your psychologist, who goes through it with you.</p>
          </>
        ) : (
          <div className="slm-help">
            <b>We&apos;ll connect you with a licensed psychologist</b>
            <span>No psychologist on CYT has shared a licence for the {test.short} yet. Message or call us and we&apos;ll arrange it for you.</span>
            <div className="slm-help-btns">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="slm-btn">WhatsApp us</a>
              <a href={`tel:${PHONE}`} className="slm-btn ghost">Call +91 80777 57951</a>
              <a href={`mailto:${MAIL}?subject=${encodeURIComponent(`${test.short} assessment`)}`} className="slm-btn ghost">Email us</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SLM_CSS = `
.slm-wrap { position: fixed; inset: 0; z-index: 2000; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; }
.slm { position: relative; width: min(560px, 100%); max-height: 88vh; overflow-y: auto; background: #fff; border-radius: 20px; padding: 24px 22px 20px; box-shadow: 0 30px 70px -20px rgba(0,0,0,.4); }
.slm-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.slm-kick { font-size: 12px; font-weight: 800; color: #92400e; background: #fef3c7; border-radius: 999px; padding: 4px 10px; }
.slm h2 { margin: 10px 0 6px; font-size: 21px; font-weight: 800; color: #0f172a; font-family: inherit; padding-right: 30px; }
.slm-sub { margin: 0; font-size: 14px; line-height: 1.6; color: #475569; }
.slm-ref { margin: 12px 0 14px; font-size: 12px; line-height: 1.55; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
.slm-ref span { font-style: italic; }
.slm-skel { height: 120px; border-radius: 12px; background: #f1f5f4; }
.slm-h3 { display: block; font-size: 14px; color: #0f172a; margin-bottom: 8px; }
.slm-list { display: flex; flex-direction: column; gap: 8px; }
.slm-t { border: 1px solid #e3eae6; border-radius: 12px; padding: 10px; }
.slm-t-row { display: flex; align-items: center; gap: 10px; }
.slm-link { margin-top: 8px; border: 0; background: none; padding: 0; color: #166534; font-weight: 700; font-size: 12.5px; text-decoration: underline; cursor: pointer; font-family: inherit; text-align: left; }
.slm-note { margin: 8px 0 0; font-size: 12.5px; font-weight: 700; color: #166534; }
button.slm-btn { cursor: pointer; font-family: inherit; }
.slm-av { width: 42px; height: 42px; border-radius: 12px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; overflow: hidden; flex-shrink: 0; }
.slm-av img { width: 100%; height: 100%; object-fit: cover; }
.slm-who { flex: 1; min-width: 0; } .slm-who b { display: block; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slm-who span { display: block; font-size: 12px; color: #64748b; }
.slm-btn { height: 36px; padding: 0 14px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; background: #166534; color: #fff !important; text-decoration: none !important; border: 1.5px solid #166534; white-space: nowrap; }
.slm-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.slm-tip { margin: 10px 0 0; font-size: 12.5px; color: #64748b; }
.slm-help { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.slm-help b { font-size: 15px; color: #14532d; } .slm-help > span { font-size: 13.5px; color: #166534; line-height: 1.55; }
.slm-help-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
@media (max-width: 560px) {
  .slm-wrap { place-items: end center; padding: 0; }
  .slm { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
  .slm-help-btns .slm-btn { flex: 1 1 100%; height: 44px; }
}
`;
