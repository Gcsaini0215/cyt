import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { apiUrl } from "../../utils/url";

// Where a client reviews their session at CYT Noida — opened from the review email or the
// WhatsApp link the desk sends. One review per booking; it goes live on /noida-appointment
// once the centre approves it.

const LABELS = ["", "Not good", "Could be better", "Okay", "Good", "Excellent"];

export default function NoidaReview() {
  const router = useRouter();
  const { token } = router.query;
  const [info, setInfo] = useState(null);   // { firstName, date, slot, therapistName, done }
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [showName, setShowName] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/noida-reviews/form/${token}`)
      .then((r) => r.json())
      .then((d) => (d?.status ? setInfo(d.data) : setError(d?.message || "This review link isn't valid.")))
      .catch(() => setError("Couldn't open the review form. Please check your connection and try again."));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) { setError("Please choose a rating first."); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-reviews/form/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text, showName }),
      });
      const d = await res.json();
      if (!d?.status) throw new Error(d?.message || "Couldn't send your review.");
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  };

  const when = info?.date
    ? new Date(`${info.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const shown = hover || rating;

  return (
    <>
      <Head>
        <title>Rate your session | Choose Your Therapist Noida</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="rv-page">
        <div className="rv-card">
          <div className="rv-brand"><img src="/cyt-mark.svg" alt="" width="40" height="40" /><span><small>CHOOSE YOUR</small><b>THERAPIST</b></span></div>
          {sent || info?.done ? (
            <div className="rv-done">
              <div className="rv-done-ic" aria-hidden="true">♥</div>
              <h1>Thank you{info?.firstName ? `, ${info.firstName}` : ""}!</h1>
              <p>{sent ? "Your review means a lot to us — and it helps someone else take their first step." : "You've already shared a review for this session. Thank you!"}</p>
              <a className="rv-btn" href="/noida-appointment">Book your next session</a>
            </div>
          ) : !info ? (
            <p className="rv-muted">{error || "Loading…"}</p>
          ) : (
            <form onSubmit={submit}>
              <h1>How was your session, {info.firstName}?</h1>
              <p className="rv-muted">
                At CYT Noida{when ? ` on ${when}` : ""}{info.therapistName ? ` with ${info.therapistName}` : ""}.
              </p>

              <div className="rv-stars" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""} — ${LABELS[n]}`}
                    className={n <= shown ? "on" : ""} onMouseEnter={() => setHover(n)} onClick={() => { setRating(n); setError(""); }}>★</button>
                ))}
              </div>
              <div className="rv-label" aria-live="polite">{shown ? LABELS[shown] : "Tap a star"}</div>

              <label className="rv-field">
                <span>Tell us more <em>(optional)</em></span>
                <textarea rows={4} maxLength={1500} value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="What helped? How did you feel after the session?" />
              </label>

              <label className="rv-check">
                <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
                Show my first name with the review (otherwise it says “Verified client”)
              </label>

              {error && <p className="rv-error">{error}</p>}
              <button type="submit" className="rv-btn" disabled={sending}>{sending ? "Sending…" : "Send review"}</button>
              <p className="rv-fine">Reviews appear on our booking page after a quick check. We never show your phone number or email.</p>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

const CSS = `
.rv-page { min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 20px 16px; background: #f4f6f5; font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif; box-sizing: border-box; }
.rv-card { width: 100%; max-width: 460px; background: #fff; border-radius: 22px; padding: 28px 24px; box-shadow: 0 1px 2px rgba(6,46,31,.04), 0 18px 44px -18px rgba(6,46,31,.22); text-align: center; box-sizing: border-box; }
.rv-brand { display: inline-flex; align-items: center; gap: 9px; margin: 0 auto 18px; }
.rv-brand img { display: block; }
.rv-brand span { display: flex; flex-direction: column; align-items: flex-start; line-height: 1; }
.rv-brand small { font-size: 9px; font-weight: 700; letter-spacing: .17em; color: #334155; }
.rv-brand b { font-size: 18px; font-weight: 800; letter-spacing: .015em; color: #14532d; margin-top: 2px; }
.rv-card h1 { font-size: 22px; font-weight: 800; color: #0b1712; letter-spacing: -.02em; margin: 0 0 6px; line-height: 1.25; }
.rv-muted { color: #64748b; font-size: 14px; margin: 0 0 18px; line-height: 1.5; }
.rv-stars { display: flex; justify-content: center; gap: 6px; margin: 8px 0 4px; }
.rv-stars button { width: 48px; height: 48px; border: none; background: none; font-size: 40px; line-height: 1; color: #e2e8e4; cursor: pointer; padding: 0; transition: transform .12s, color .12s; }
.rv-stars button.on { color: #d4a24c; }
.rv-stars button:hover { transform: scale(1.12); }
.rv-stars button:focus-visible { outline: 2px solid #1e7a4c; outline-offset: 2px; border-radius: 8px; }
.rv-label { font-size: 13px; font-weight: 700; color: #9a6f22; min-height: 18px; margin-bottom: 16px; }
.rv-field { display: flex; flex-direction: column; gap: 6px; text-align: left; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 12px; }
.rv-field em { font-style: normal; font-weight: 500; color: #94a3b8; }
.rv-field textarea { border-radius: 12px; border: 1.5px solid #e2e8e4; padding: 10px 12px; font: inherit; font-weight: 400; font-size: 14.5px; resize: vertical; min-height: 96px; outline: none; color: #0b1712; }
.rv-field textarea:focus { border-color: #1e7a4c; box-shadow: 0 0 0 3px #dcefe3; }
.rv-check { display: flex; align-items: flex-start; gap: 8px; text-align: left; font-size: 13px; color: #475569; margin-bottom: 16px; line-height: 1.4; }
.rv-check input { margin-top: 2px; width: 16px; height: 16px; accent-color: #1e7a4c; flex-shrink: 0; }
.rv-btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 48px; border: none; border-radius: 14px; background: #1e7a4c; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; text-decoration: none; box-shadow: 0 8px 18px -10px rgba(30,122,76,.7); }
.rv-btn:hover { background: #186640; color: #fff; }
.rv-btn:disabled { opacity: .6; cursor: default; }
.rv-error { color: #b91c1c; font-size: 13px; margin: 0 0 10px; }
.rv-fine { color: #94a3b8; font-size: 11.5px; margin: 12px 0 0; line-height: 1.5; }
.rv-done-ic { width: 56px; height: 56px; border-radius: 50%; background: #fbf3e2; color: #d4a24c; font-size: 26px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.rv-done p { color: #475569; font-size: 14.5px; line-height: 1.6; margin: 0 0 18px; }
`;
