import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchData, postData } from "../../utils/actions";
import { apiUrl, getTherapistProfiles } from "../../utils/url";
import { cardOf } from "../../utils/related-therapists";
import { isAuthenticated, getDecodedToken } from "../../utils/jwt";

/* One test from /self-assessment, two ways to take it:
   - Just the assessment: pay the assessment fee, answer it now, get the automatic report at once.
   - With a psychologist: booked with a session (/book/<slug>?assess=<key>); the psychologist adds
     their notes from the session to the report and signs it. Nobody offers it yet → our contacts. */

const PHONE = "+918077757951";
const MAIL = "hello@chooseyourtherapist.in";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const SELF_GETS = [
  "Your score, worked out with the questionnaire's published scoring",
  "Your severity level and what it means",
  "The reference ranges from the test manual",
  "A report you can view and download straight away",
];
const PSY_ADDS = [
  ["A summary in simple words", "what your result means for you"],
  ["Clinical observations", "what they noticed in your session"],
  ["Recommendations & next steps", "therapy plan, self-help, lifestyle"],
  ["Follow-up plan", "when to re-assess"],
  ["Referral, if needed", "e.g. a psychiatrist"],
  ["Signed report", "with their RCI / registration no."],
];

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function ClinicalModal({ test, onClose, initialMode = "self" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode === "with" ? "with" : "self");
  const [list, setList] = useState(null);
  const [price, setPrice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

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
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const wa = `https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(`Hi CYT team, I'd like a clinical assessment (${test.short}) with a psychologist.`)}`;
  const unavailable = price && !price.active;
  const fee = price ? (price.price === 0 ? "Free" : inr(price.price)) : "";

  // just the assessment: sign in (client) → pay → answer it
  const startSelf = async () => {
    setErr("");
    if (!isAuthenticated()) { router.push(`/login?next=${encodeURIComponent(`/self-assessment?start=${test.key}&mode=self`)}`); return; }
    if (Number(getDecodedToken()?.role) !== 0) { setErr("Please sign in with a client account to take an assessment."); return; }
    setBusy(true);
    try {
      const o = await postData(`${apiUrl}/assessment-self/order`, { tool: test.key });
      const go = (id) => router.push(`/client/assessment/${id}`);
      if (o?.data?.free && o.data.requestId) { go(o.data.requestId); return; }
      if (!o?.data?.orderId) throw new Error(o?.message || "Couldn't start the payment.");
      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection.");
      const rzp = new window.Razorpay({
        key: o.data.keyId, amount: Math.round(o.data.amount * 100), currency: "INR", order_id: o.data.orderId,
        name: "Choose Your Therapist", description: `${test.short} assessment`, theme: { color: "#14532d" },
        handler: async (resp) => {
          try {
            const v = await postData(`${apiUrl}/assessment-self/verify`, resp);
            if (!v?.data?.requestId) throw new Error(v?.message);
            go(v.data.requestId);
          } catch (e) { setErr(e?.response?.data?.message || e.message || "Payment received but we couldn't open the assessment — please contact hello@chooseyourtherapist.in with your payment ID."); setBusy(false); }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Something went wrong — please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="clm-wrap" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: CLM_CSS }} />
      <div className="clm" role="dialog" aria-modal="true" aria-labelledby="clm-h">
        <button type="button" className="clm-x" onClick={onClose} disabled={busy} aria-label="Close">×</button>
        <span className="clm-kick">Clinical assessment · {test.short}</span>
        <h2 id="clm-h">{test.full}</h2>

        {unavailable ? <p className="clm-off">This assessment can&apos;t be booked right now — please check back soon.</p> : (
          <>
            <div className="clm-modes" role="radiogroup" aria-label="How do you want to take it?">
              <button type="button" role="radio" aria-checked={mode === "self"} className={mode === "self" ? "on" : ""} onClick={() => setMode("self")}>
                <i aria-hidden="true" />
                <b>Just the assessment</b>
                <span>Take it now · instant automatic report</span>
                {price && <em>{fee}</em>}
              </button>
              <button type="button" role="radio" aria-checked={mode === "with"} className={mode === "with" ? "on" : ""} onClick={() => setMode("with")}>
                <i aria-hidden="true" />
                <b>With a psychologist</b>
                <span>Book a session · report with their notes</span>
                {price && <em>{fee} + session</em>}
              </button>
            </div>

            {mode === "self" ? (
              <div className="clm-body">
                <b className="clm-h3">What you get</b>
                <ul className="clm-gets">{SELF_GETS.map((g) => <li key={g}>{g}</li>)}</ul>
                <p className="clm-note">It&apos;s an automatic screening report from your own answers — not reviewed by a psychologist and not a diagnosis. You can book a psychologist any time to go through it with you.</p>
                {err && <p className="clm-err" role="alert">{err}</p>}
                <button type="button" className="clm-go" onClick={startSelf} disabled={busy || !price}>
                  {busy ? "Please wait…" : !price ? "Loading…" : price.price === 0 ? "Start the assessment" : `Pay ${fee} & start`}
                </button>
                <p className="clm-small">{test.questions.length} questions · about {String(test.time || "").replace(/^~\s*/, "")}</p>
              </div>
            ) : (
              <div className="clm-body">
                <b className="clm-h3">What your psychologist adds to your report</b>
                <p className="clm-sub">You answer before your session. After going through it with you, they add to the report — based on your session:</p>
                <ul className="clm-adds">{PSY_ADDS.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}</ul>
                {list === null ? <div className="clm-skel" /> : list.length > 0 ? (
                  <>
                    <b className="clm-h3" style={{ marginTop: 14 }}>Psychologists who offer it</b>
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
                    <span>No psychologist offers the {test.short} on CYT just yet. Message or call us and we&apos;ll arrange it — or take it on its own now.</span>
                    <div className="clm-help-btns">
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="clm-btn">WhatsApp us</a>
                      <a href={`tel:${PHONE}`} className="clm-btn ghost">Call +91 80777 57951</a>
                      <a href={`mailto:${MAIL}?subject=${encodeURIComponent(`${test.short} clinical assessment`)}`} className="clm-btn ghost">Email us</a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <p className="clm-ref">{test.ref}</p>
      </div>
    </div>
  );
}

const CLM_CSS = `
.clm-wrap { position: fixed; inset: 0; z-index: 2000; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; }
.clm { position: relative; width: min(600px, 100%); max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 20px; padding: 24px 22px 18px; box-shadow: 0 30px 70px -20px rgba(0,0,0,.4); }
.clm-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.clm-kick { font-size: 12px; font-weight: 800; color: #166534; background: #dcfce7; border-radius: 999px; padding: 4px 10px; }
.clm h2 { margin: 10px 0 12px; font-size: 20px; font-weight: 800; color: #0f172a; font-family: inherit; padding-right: 30px; line-height: 1.3; }
.clm-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.clm-modes button { position: relative; text-align: left; border: 1.5px solid #e3eae6; background: #fff; border-radius: 14px; padding: 12px 12px 12px 40px; cursor: pointer; font-family: inherit; display: flex; flex-direction: column; gap: 2px; }
.clm-modes button i { position: absolute; left: 13px; top: 14px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5d0; background: #fff; }
.clm-modes button.on { border-color: #14532d; background: #f3faf5; box-shadow: 0 0 0 1px #14532d inset; }
.clm-modes button.on i { border-color: #14532d; box-shadow: inset 0 0 0 4px #fff; background: #14532d; }
.clm-modes b { font-size: 14.5px; color: #0f172a; } .clm-modes span { font-size: 12px; color: #64748b; line-height: 1.4; }
.clm-modes em { margin-top: 4px; font-style: normal; font-size: 13.5px; font-weight: 800; color: #14532d; }
.clm-body { border-top: 1px solid #eef2f0; padding-top: 12px; }
.clm-h3 { display: block; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
.clm-sub { margin: 0 0 8px; font-size: 13px; color: #64748b; line-height: 1.5; }
.clm-gets { margin: 0 0 10px; padding: 0; list-style: none; } .clm-gets li { font-size: 13.5px; color: #334155; padding: 3px 0 3px 22px; position: relative; }
.clm-gets li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 800; }
.clm-adds { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.clm-adds li { margin: 0; border: 1px solid #e3eae6; border-radius: 10px; padding: 8px 10px 8px 30px; position: relative; background: #fbfdfc; }
.clm-adds li::before { content: "✓"; position: absolute; left: 11px; top: 8px; color: #16a34a; font-weight: 800; font-size: 13px; }
.clm-adds b { display: block; font-size: 13px; color: #0f172a; } .clm-adds span { display: block; font-size: 11.5px; color: #64748b; margin-top: 1px; }
.clm-note { margin: 0 0 12px; font-size: 12.5px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px 10px; line-height: 1.5; }
.clm-err { margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #b91c1c; }
.clm-go { width: 100%; height: 48px; border-radius: 12px; border: 0; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; font-weight: 800; font-size: 15px; cursor: pointer; font-family: inherit; }
.clm-go:disabled { opacity: .55; cursor: not-allowed; }
.clm-small { margin: 6px 0 0; text-align: center; font-size: 12px; color: #64748b; }
.clm-off { font-size: 14px; color: #92400e; font-weight: 700; }
.clm-skel { height: 110px; border-radius: 12px; background: #f1f5f4; margin-top: 12px; }
.clm-list { display: flex; flex-direction: column; gap: 8px; }
.clm-t { display: flex; align-items: center; gap: 10px; border: 1px solid #e3eae6; border-radius: 12px; padding: 10px; }
.clm-av { width: 42px; height: 42px; border-radius: 12px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; overflow: hidden; flex-shrink: 0; }
.clm-av img { width: 100%; height: 100%; object-fit: cover; }
.clm-who { flex: 1; min-width: 0; } .clm-who b { display: block; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clm-who span { display: block; font-size: 12px; color: #64748b; }
.clm-btn { height: 36px; padding: 0 14px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; background: #166534; color: #fff !important; text-decoration: none !important; border: 1.5px solid #166534; white-space: nowrap; }
.clm-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.clm-help { margin-top: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.clm-help b { font-size: 15px; color: #14532d; } .clm-help > span { font-size: 13.5px; color: #166534; line-height: 1.55; }
.clm-help-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.clm-ref { margin: 14px 0 0; font-size: 11.5px; color: #94a3b8; line-height: 1.5; }
@media (max-width: 560px) {
  .clm-wrap { place-items: end center; padding: 0; }
  .clm { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }
  .clm-modes { grid-template-columns: 1fr; }
  .clm-adds { grid-template-columns: 1fr; }
  .clm-help-btns .clm-btn { flex: 1 1 100%; height: 44px; }
}
`;
