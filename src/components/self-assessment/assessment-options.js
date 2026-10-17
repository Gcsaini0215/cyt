import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchData, postData } from "../../utils/actions";
import { apiUrl, getTherapistProfiles } from "../../utils/url";
import { cardOf } from "../../utils/related-therapists";
import { isAuthenticated, getDecodedToken } from "../../utils/jwt";
import { pathOf } from "./seo";

/* The two ways to take one assessment, on its page (/self-assessment/<slug>) — the psychologists who
   offer it are listed below the options (AssessmentProviders), so a long list has room:
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
export const PSY_ADDS = [
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

// the psychologists who offer this test (approved add-on) + its price — shared by the options and the list
export function useAssessmentData(key) {
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
        setPrice(pr?.data?.tests?.[key] || null);
      })
      .catch(() => { if (alive) { setList([]); setPrice({ active: false }); } });
    return () => { alive = false; };
  }, [key]);
  return { list, price };
}

export default function AssessmentOptions({ test, initialMode = "self", list = null, price = null }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode === "with" ? "with" : "self");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setMode(initialMode === "with" ? "with" : "self"); }, [initialMode]);

  const wa = `https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(`Hi CYT team, I'd like the ${test.short} screening with a psychologist.`)}`;
  const unavailable = price && price.active === false;
  const fee = price && price.price != null ? (price.price === 0 ? "Free" : inr(price.price)) : "";

  // just the assessment: sign in (client) → pay → answer it
  const startSelf = async () => {
    setErr("");
    if (!isAuthenticated()) { router.push(`/login?next=${encodeURIComponent(`${pathOf(test.key)}?mode=self`)}`); return; }
    if (Number(getDecodedToken()?.role) !== 0) { setErr("Please sign in with a client account to take a screening."); return; }
    setBusy(true);
    try {
      const o = await postData(`${apiUrl}/assessment-self/order`, { tool: test.key });
      const go = (id) => router.push(`/client/assessment/${id}`);
      if (o?.data?.free && o.data.requestId) { go(o.data.requestId); return; }
      if (!o?.data?.orderId) throw new Error(o?.message || "Couldn't start the payment.");
      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection.");
      const rzp = new window.Razorpay({
        key: o.data.keyId, amount: Math.round(o.data.amount * 100), currency: "INR", order_id: o.data.orderId,
        name: "Choose Your Therapist", description: `${test.short} screening`, theme: { color: "#14532d" },
        handler: async (resp) => {
          try {
            const v = await postData(`${apiUrl}/assessment-self/verify`, resp);
            if (!v?.data?.requestId) throw new Error(v?.message);
            go(v.data.requestId);
          } catch (e) { setErr(e?.response?.data?.message || e.message || "Payment received but we couldn't open the screening — please contact hello@chooseyourtherapist.in with your payment ID."); setBusy(false); }
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
    <div className="aop" id="take">
      <style dangerouslySetInnerHTML={{ __html: AOP_CSS }} />
      <h2 className="aop-h">How would you like to take it?</h2>
      {unavailable ? <p className="aop-off">This screening can&apos;t be booked right now — please check back soon.</p> : (
        <>
          <div className="aop-modes" role="radiogroup" aria-label="How would you like to take it?">
            <button type="button" role="radio" aria-checked={mode === "self"} className={mode === "self" ? "on" : ""} onClick={() => setMode("self")}>
              <i aria-hidden="true" />
              <b>Just the screening</b>
              <span>Take it now · instant automatic report</span>
              <em>{fee || " "}</em>
            </button>
            <button type="button" role="radio" aria-checked={mode === "with"} className={mode === "with" ? "on" : ""} onClick={() => setMode("with")}>
              <i aria-hidden="true" />
              <b>With a psychologist</b>
              <span>Book a session · report with their notes</span>
              <em>{fee ? `${fee} + session` : " "}</em>
            </button>
          </div>

          {mode === "self" ? (
            <div className="aop-body">
              <b className="aop-h3">What you get</b>
              <ul className="aop-gets">{SELF_GETS.map((g) => <li key={g}>{g}</li>)}</ul>
              <p className="aop-note">It&apos;s an automatic screening report from your own answers — not reviewed by a psychologist and not a diagnosis. You can book a psychologist any time to go through it with you.</p>
              {err && <p className="aop-err" role="alert">{err}</p>}
              <button type="button" className="aop-go" onClick={startSelf} disabled={busy || !price}>
                {busy ? "Please wait…" : !price ? "Loading…" : price.price === 0 ? "Start the screening" : `Pay ${fee} & start`}
              </button>
              <p className="aop-small">{test.questions.length} questions · about {String(test.time || "").replace(/^~\s*/, "")} · secure payment</p>
            </div>
          ) : (
            <div className="aop-body">
              <b className="aop-h3">What your psychologist adds to your report</b>
              <p className="aop-sub">You answer before your session. After going through it with you, they add to the report — based on your session:</p>
              <ul className="aop-adds">{PSY_ADDS.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}</ul>
              {list === null ? <div className="aop-skel" /> : list.length > 0 ? (
                <div className="aop-sum">
                  <span className="aop-stack" aria-hidden="true">
                    {list.slice(0, 4).map((t) => <span key={t.id}>{t.photo ? <img src={t.photo} alt="" /> : t.name.charAt(0)}</span>)}
                  </span>
                  <span className="aop-sum-t"><b>{list.length} psychologist{list.length === 1 ? "" : "s"}</b> offer the {test.short}</span>
                  <a href="#psychologists" className="aop-btn" onClick={(e) => { e.preventDefault(); document.getElementById("psychologists")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Choose a psychologist ↓</a>
                </div>
              ) : (
                <div className="aop-help">
                  <b>We&apos;ll connect you with a psychologist</b>
                  <span>No psychologist offers the {test.short} on CYT just yet. Message or call us and we&apos;ll arrange it — or take it on its own now.</span>
                  <div className="aop-help-btns">
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="aop-btn">WhatsApp us</a>
                    <a href={`tel:${PHONE}`} className="aop-btn ghost">Call +91 80777 57951</a>
                    <a href={`mailto:${MAIL}?subject=${encodeURIComponent(`${test.short} screening`)}`} className="aop-btn ghost">Email us</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const AOP_CSS = `
.aop { background: #fff; border: 1px solid #e3eae6; border-radius: 20px; padding: 20px; box-shadow: 0 18px 40px -30px rgba(15,23,42,.45); }
.aop-h { margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a; font-family: inherit; }
.aop-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.aop-modes button { position: relative; text-align: left; border: 1.5px solid #e3eae6; background: #fff; border-radius: 14px; padding: 12px 12px 12px 40px; cursor: pointer; font-family: inherit; display: flex; flex-direction: column; gap: 2px; }
.aop-modes button i { position: absolute; left: 13px; top: 14px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5d0; background: #fff; }
.aop-modes button.on { border-color: #14532d; background: #f3faf5; box-shadow: 0 0 0 1px #14532d inset; }
.aop-modes button.on i { border-color: #14532d; box-shadow: inset 0 0 0 4px #fff; background: #14532d; }
.aop-modes b { font-size: 14.5px; color: #0f172a; } .aop-modes span { font-size: 12px; color: #64748b; line-height: 1.4; }
.aop-modes em { margin-top: 4px; font-style: normal; font-size: 13.5px; font-weight: 800; color: #14532d; }
.aop-body { border-top: 1px solid #eef2f0; padding-top: 12px; }
.aop-h3 { display: block; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
.aop-sub { margin: 0 0 8px; font-size: 13px; color: #64748b; line-height: 1.5; }
.aop-gets { margin: 0 0 10px; padding: 0; list-style: none; } .aop-gets li { font-size: 13.5px; color: #334155; padding: 3px 0 3px 22px; position: relative; margin: 0; }
.aop-gets li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 800; }
.aop-adds { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.aop-adds li { margin: 0; border: 1px solid #e3eae6; border-radius: 10px; padding: 8px 10px 8px 30px; position: relative; background: #fbfdfc; }
.aop-adds li::before { content: "✓"; position: absolute; left: 11px; top: 8px; color: #16a34a; font-weight: 800; font-size: 13px; }
.aop-adds b { display: block; font-size: 13px; color: #0f172a; } .aop-adds span { display: block; font-size: 11.5px; color: #64748b; margin-top: 1px; }
.aop-note { margin: 0 0 12px; font-size: 12.5px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px 10px; line-height: 1.5; }
.aop-err { margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #b91c1c; }
.aop-go { width: 100%; height: 50px; border-radius: 12px; border: 0; background: #1f6b45; box-shadow: 0 10px 20px -12px rgba(31,107,69,.8); color: #fff; font-weight: 800; font-size: 15.5px; cursor: pointer; font-family: inherit; }
.aop-go:disabled { opacity: .55; cursor: not-allowed; }
.aop-small { margin: 6px 0 0; text-align: center; font-size: 12px; color: #64748b; }
.aop-off { font-size: 14px; color: #92400e; font-weight: 700; }
.aop-skel { height: 110px; border-radius: 12px; background: #f1f5f4; margin-top: 12px; }
.aop-list { display: flex; flex-direction: column; gap: 8px; }
.aop-t { display: flex; align-items: center; gap: 10px; border: 1px solid #e3eae6; border-radius: 12px; padding: 10px; }
.aop-av { width: 42px; height: 42px; border-radius: 12px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; overflow: hidden; flex-shrink: 0; }
.aop-av img { width: 100%; height: 100%; object-fit: cover; }
.aop-who { flex: 1; min-width: 0; } .aop-who b { display: block; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aop-who span { display: block; font-size: 12px; color: #64748b; }
.aop-btn { height: 36px; padding: 0 14px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; background: #166534; color: #fff !important; text-decoration: none !important; border: 1.5px solid #166534; white-space: nowrap; }
.aop-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.aop-sum { margin-top: 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: #f3faf5; border: 1px solid #d9eadf; border-radius: 14px; padding: 10px 12px; }
.aop-stack { display: inline-flex; } .aop-stack span { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; margin-left: -8px; background: #e7f6ec; color: #166534; font-weight: 800; font-size: 13px; display: grid; place-items: center; overflow: hidden; }
.aop-stack span:first-child { margin-left: 0; } .aop-stack img { width: 100%; height: 100%; object-fit: cover; }
.aop-sum-t { flex: 1 1 160px; font-size: 13.5px; color: #334155; } .aop-sum-t b { color: #14532d; }
.aop-help { margin-top: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.aop-help b { font-size: 15px; color: #14532d; } .aop-help > span { font-size: 13.5px; color: #166534; line-height: 1.55; }
.aop-help-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
@media (max-width: 560px) {
  .aop { padding: 16px; border-radius: 16px; }
  .aop-modes, .aop-adds { grid-template-columns: 1fr; }
  .aop-help-btns .aop-btn { flex: 1 1 100%; height: 44px; }
}
`;

/* Every psychologist who offers the test: a full-width, searchable grid with "Show more", so it stays
   tidy with 2 profiles or 200. */
const STEP = 8;
export function AssessmentProviders({ test, list }) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("all");
  const [shown, setShown] = useState(STEP);
  if (!list || !list.length) return null;
  const needle = q.trim().toLowerCase();
  const rows = list.filter((t) => (!needle || `${t.name} ${t.city} ${t.type} ${(t.tags || []).join(" ")}`.toLowerCase().includes(needle))
    && (mode === "all" || (mode === "online" ? /online/i.test(t.modes) : /in-person/i.test(t.modes))));
  const many = list.length > 6;
  return (
    <section className="apv" id="psychologists" aria-labelledby="apv-h">
      <style dangerouslySetInnerHTML={{ __html: APV_CSS }} />
      <div className="apv-head">
        <div>
          <h2 id="apv-h">Psychologists who offer the {test.short}</h2>
          <p>Verified by CYT to offer screenings. Book a session with the {test.short} added — they go through your report with you and add their notes.</p>
        </div>
        {many && (
          <div className="apv-tools">
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(STEP); }} placeholder="Search by name, city or expertise" aria-label="Search psychologists" />
            <div className="apv-chips" role="tablist" aria-label="Session type">
              {[["all", "All"], ["online", "Online"], ["inperson", "In-person"]].map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={mode === k} className={mode === k ? "on" : ""} onClick={() => { setMode(k); setShown(STEP); }}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      {rows.length ? (
        <div className="apv-grid">
          {rows.slice(0, shown).map((t) => (
            <article key={t.id} className="apv-card">
              <div className="apv-top">
                <span className="apv-av">{t.photo ? <img src={t.photo} alt={t.name} loading="lazy" /> : t.name.charAt(0)}</span>
                <div className="apv-who">
                  <b title={t.name}>{t.name}</b>
                  <span>{t.type}</span>
                  {t.rating && <em>★ {t.rating.avg} <small>({t.rating.count})</small></em>}
                </div>
              </div>
              <div className="apv-meta">
                {t.city && <span><i className="feather-map-pin" aria-hidden="true" /> {t.city}</span>}
                {t.modes && <span><i className="feather-video" aria-hidden="true" /> {t.modes}</span>}
              </div>
              {t.tags?.length > 0 && <div className="apv-tags">{t.tags.map((x) => <span key={x}>{x}</span>)}</div>}
              <div className="apv-foot">
                <span className="apv-fee">{t.fee ? <>Session from <b>₹{t.fee.toLocaleString("en-IN")}</b></> : "\u00a0"}</span>
                <div className="apv-btns">
                  <Link href={t.href} className="apv-btn ghost">Profile</Link>
                  <Link href={`${t.href.replace("/view-profile/", "/book/")}?assess=${test.key}`} className="apv-btn">Book</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="apv-none">No psychologist matches — try another search.</p>}
      {rows.length > shown && (
        <div className="apv-more"><button type="button" onClick={() => setShown((n) => n + STEP)}>Show more ({rows.length - shown} more)</button></div>
      )}
    </section>
  );
}

const APV_CSS = `
.apv { margin-top: 26px; }
.apv-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
.apv-head h2 { margin: 0 0 4px; font-size: 19px; font-weight: 800; color: #0f172a; font-family: inherit; }
.apv-head p { margin: 0; max-width: 620px; font-size: 13.5px; color: #64748b; line-height: 1.55; }
.apv-tools { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.apv-tools input { height: 40px; width: 260px; max-width: 100%; border: 1.5px solid #dfe7e2; border-radius: 11px; padding: 0 12px; font: inherit; font-size: 13.5px; background: #fff; }
.apv-tools input:focus { outline: none; border-color: #16a34a; }
.apv-chips { display: flex; gap: 6px; }
.apv-chips button { height: 36px; padding: 0 12px; border-radius: 999px; border: 1px solid #dfe7e2; background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; }
.apv-chips button.on { background: #14532d; border-color: #14532d; color: #fff; }
.apv-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.apv-card { background: #fff; border: 1px solid #e3eae6; border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; min-width: 0; transition: box-shadow .2s, border-color .2s; }
.apv-card:hover { border-color: #b9d7c4; box-shadow: 0 14px 30px -22px rgba(15,23,42,.45); }
.apv-top { display: flex; gap: 10px; align-items: center; min-width: 0; }
.apv-av { width: 54px; height: 54px; border-radius: 14px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; font-size: 20px; overflow: hidden; flex-shrink: 0; }
.apv-av img { width: 100%; height: 100%; object-fit: cover; }
.apv-who { min-width: 0; } .apv-who b { display: block; font-size: 14.5px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apv-who span { display: block; font-size: 12px; color: #64748b; }
.apv-who em { display: block; font-style: normal; font-size: 12px; font-weight: 800; color: #b45309; margin-top: 1px; } .apv-who em small { color: #94a3b8; font-weight: 600; }
.apv-meta { display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; color: #475569; } .apv-meta i { color: #1f6b45; }
.apv-tags { display: flex; flex-wrap: wrap; gap: 5px; } .apv-tags span { font-size: 11px; font-weight: 700; color: #334155; background: #f1f5f4; border-radius: 999px; padding: 2px 8px; }
.apv-foot { margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 8px; }
.apv-fee { font-size: 12.5px; color: #64748b; } .apv-fee b { color: #0f172a; font-size: 14px; }
.apv-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.apv-btn { height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; background: #166534; color: #fff !important; text-decoration: none !important; border: 1.5px solid #166534; }
.apv-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.apv-none { font-size: 14px; color: #64748b; }
.apv-more { text-align: center; margin-top: 14px; }
.apv-more button { height: 42px; padding: 0 20px; border-radius: 12px; border: 1.5px solid #cfe3d6; background: #fff; color: #166534; font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; }
@media (max-width: 1100px) { .apv-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 800px) { .apv-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .apv-tools, .apv-tools input { width: 100%; } }
@media (max-width: 520px) { .apv-grid { grid-template-columns: 1fr; } }
`;
