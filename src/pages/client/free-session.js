import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import ClientShell from "../../components/client/client-shell";
import { ProbonoCard, DC_CSS } from "../../components/client/dash-cards";
import useUserStore from "../../store/userStore";
import { getDecodedToken } from "../../utils/jwt";
import { fetchById, fetchData, postData, putData } from "../../utils/actions";
import { apiUrl, getProbonoInternsUrl } from "../../utils/url";

/* The free first session in the client's dashboard: they share their details here, then follow the request.
   The CYT team chooses the trainee and the time. */

const EMPTY = { phone: "", age: "", city: "", language: "", concern: "" };

export default function FreeSession() {
  const [role, setRole] = useState(undefined);
  useEffect(() => { setRole(getDecodedToken()?.role ?? null); }, []);
  if (role === undefined) return null;
  // ClientShell sends therapist accounts away without a word, so say why here instead
  if (role === 1) return <TherapistAccount />;
  return <FreeSessionPage />;
}

function TherapistAccount() {
  return (
    <div className="fs-solo">
      <Head><title>Free Consultation | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fs-card">
        <h2>The free session is for client accounts</h2>
        <p className="fs-note">You&apos;re signed in with a therapist account. Please sign out and sign in with a client account to share your details.</p>
        <Link href="/therapist-dashboard" className="fs-btn">Go to my dashboard</Link>
      </div>
    </div>
  );
}

function FreeSessionPage() {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const [me, setMe] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [guide, setGuide] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // if this can't load, still show the form: the server refuses anyone who can't take a free session
  const load = () => fetchById(`${apiUrl}/probono/me`).then((r) => setMe(r?.data || { eligible: false })).catch(() => setMe((m) => m || { eligible: true, session: null }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (userInfo?.phone) setF((x) => (x.phone ? x : { ...x, phone: String(userInfo.phone) })); }, [userInfo?.phone]);
  useEffect(() => {
    const slug = router.query.guide;
    if (!slug) return;
    fetchData(getProbonoInternsUrl).then((r) => setGuide(r?.data?.find((p) => p.slug === slug)?.name || "")).catch(() => {});
  }, [router.query.guide]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const s = me?.session;
  const waiting = s?.status === "requested";
  const active = waiting || s?.status === "accepted";
  const showForm = editing || (me?.eligible && !active);
  const tracked = !(me && !me.eligible && !s);
  const ready = f.concern.trim() && Number(f.age) >= 18 && f.phone.replace(/\D/g, "").length >= 10 && (editing || agreed);

  const startEdit = () => { setF({ phone: s.phone || "", age: s.age || "", city: s.city || "", language: s.language || "", concern: s.concern || "" }); setEditing(true); };
  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true); setErr("");
    try {
      if (editing) await putData(`${apiUrl}/probono/${s._id}`, f);
      else await postData(`${apiUrl}/probono/request`, { ...f, guide: router.query.guide || "", consent: true });
      setEditing(false);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Couldn't send your details. Please check your internet and try again.");
    }
    setBusy(false);
  };

  return (
    <ClientShell title="Free Consultation">
      <Head><title>Free Consultation | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: DC_CSS + CSS }} />
      <div className="fs">
        <h1>Free Consultation</h1>
        <p className="fs-sub">One free 45-minute support session with a psychology trainee, under professional supervision.</p>
        {!["accepted", "completed", "no_show"].includes(s?.status) && tracked && (
          <p className="fs-wait" role="note"><b>Your request may take some time.</b> We arrange each consultation according to which support person is available, so we can&apos;t promise a time straight away. We&apos;ll confirm it here as soon as it&apos;s arranged.</p>
        )}
        {err && <p className="fs-err" role="alert">{err}</p>}
        <div className={`fs-layout${tracked ? "" : " solo"}`}>
        <div className="fs-main">

        {me === null && <div className="fs-card">Loading…</div>}

        {me && !showForm && <ProbonoCard data={me} onChange={load} hideManage />}

        {me && waiting && !editing && (
          <div className="fs-card">
            <h2>What you shared</h2>
            <dl>
              <dt>Phone</dt><dd>{s.phone}</dd>
              <dt>Age</dt><dd>{s.age || "—"}</dd>
              <dt>City</dt><dd>{s.city || "—"}</dd>
              <dt>Language</dt><dd>{s.language || "—"}</dd>
              {s.preferred && <><dt>Preferred guide</dt><dd>{s.preferred}</dd></>}
              <dt>What you&apos;d like to talk about</dt><dd>{s.concern}</dd>
            </dl>
            <button type="button" className="fs-btn ghost" onClick={startEdit}>Edit my details</button>
          </div>
        )}

        {showForm && (
          <div className="fs-card">
            <h2>{editing ? "Edit your details" : "Share your details"}</h2>
            <p className="fs-note">Our team will choose a guide and a time for you, and confirm them here.</p>
            {guide && !editing && <p className="fs-guide">You chose: <b>{guide}</b>. We&apos;ll try to arrange this guide.</p>}
            <div className="fs-grid">
              <div><label htmlFor="fs-phone">Phone number</label><input id="fs-phone" type="tel" value={f.phone} onChange={set("phone")} /></div>
              <div><label htmlFor="fs-age">Your age</label><input id="fs-age" type="number" min="18" max="120" value={f.age} onChange={set("age")} /></div>
              <div><label htmlFor="fs-city">City</label><input id="fs-city" value={f.city} onChange={set("city")} /></div>
              <div><label htmlFor="fs-lang">Preferred language</label><input id="fs-lang" value={f.language} onChange={set("language")} placeholder="Hindi, English…" /></div>
            </div>
            <label htmlFor="fs-concern">What would you like to talk about?</label>
            <textarea id="fs-concern" rows={4} maxLength={1000} value={f.concern} onChange={set("concern")} placeholder="A line or two is enough" />
            {!editing && (
              <>
                <div className="fs-terms">
                  <h3>Before you send</h3>
                  <ul>
                    <li>This is emotional support with a trainee. It isn&apos;t therapy, a diagnosis or medical advice.</li>
                    <li>It isn&apos;t for emergencies. If you or someone else is in danger, please contact local emergency services.</li>
                    <li>Each person gets one free session, on Google Meet. Missing it without cancelling counts as using it.</li>
                    <li>Your support person sees your name, age, language and what you share here, but not your phone or email.</li>
                  </ul>
                  <a href="/probono-therapist/consent" target="_blank" rel="noopener noreferrer">Read the full terms and consent</a>
                </div>
                <label className="fs-check">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span>I have read and agree to the <a href="/probono-therapist/consent" target="_blank" rel="noopener noreferrer">session terms and consent</a>, and I am 18 or over.</span>
                </label>
              </>
            )}
            <div className="fs-acts">
              <button type="button" className="fs-btn" disabled={!ready || busy} onClick={submit}>{busy ? "Sending…" : editing ? "Save my details" : "Send my details"}</button>
              {editing && <button type="button" className="fs-btn ghost" onClick={() => setEditing(false)}>Back</button>}
            </div>
          </div>
        )}

        {me && !me.eligible && !s && (
          <div className="fs-card">
            <h2>The free session is for first-time clients</h2>
            <p className="fs-note">You can book with any of our therapists.</p>
            <Link href="/client/find" className="fs-btn">Find a therapist</Link>
          </div>
        )}
        </div>
        {tracked && <Tracker session={s} />}
        </div>
      </div>
    </ClientShell>
  );
}

const STAGE = { requested: 1, accepted: 2, no_show: 2, completed: 4 };

function Tracker({ session: s }) {
  const stage = STAGE[s?.status] || 0;
  const when = s?.slot_at && new Date(s.slot_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const missed = s?.status === "no_show";
  const steps = [
    ["Share your details", "Fill in the form and give your consent."],
    ["We arrange your session", "Our team chooses your support person and the time."],
    ["Join on Google Meet", missed ? "This session was missed." : when ? `${when}. Your Meet link is on this page.` : "Your time and Meet link will appear here."],
    ["Get your coupon", "A coupon for your first paid session appears in My Space."],
  ];
  return (
    <aside className="fs-track" aria-label="Track your consultation">
      <h2>Track your consultation</h2>
      <ol>
        {steps.map(([t, d], i) => {
          const state = i < stage ? "done" : i === stage ? "now" : "next";
          return (
            <li key={t} className={state} aria-current={state === "now" ? "step" : undefined}>
              <i aria-hidden="true">{state === "done" ? "✓" : i + 1}</i>
              <div><b>{t}</b><span>{d}</span></div>
            </li>
          );
        })}
      </ol>
      <a href="/probono-therapist/consent" target="_blank" rel="noopener noreferrer">Session terms and consent</a>
    </aside>
  );
}

const CSS = `
.fs { max-width: 1040px; }
.fs-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
.fs-main { min-width: 0; }
.fs-track { padding: 18px; border-radius: 16px; background: #fff; border: 1px solid #e4ece7; }
.fs-track h2 { margin: 0 0 14px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.fs-track ol { margin: 0 0 12px; padding: 0; list-style: none; }
.fs-track li { position: relative; display: flex; gap: 12px; padding-bottom: 18px; }
.fs-track li:last-child { padding-bottom: 0; }
.fs-track li:not(:last-child)::before { content: ""; position: absolute; left: 14px; top: 30px; bottom: 0; width: 2px; background: #e2e8f0; }
.fs-track li.done:not(:last-child)::before { background: #166534; }
.fs-track i { flex: none; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #f1f5f9; color: #64748b; font-style: normal; font-size: 14px; font-weight: 800; }
.fs-track .done i, .fs-track .now i { background: #166534; color: #fff; }
.fs-track .now i { box-shadow: 0 0 0 4px #dcfce7; }
.fs-track b { display: block; font-size: 14.5px; line-height: 1.35; color: #0f172a; }
.fs-track .next b { color: #475569; }
.fs-track span { display: block; margin-top: 2px; font-size: 13.5px; line-height: 1.45; color: #64748b; }
.fs-track > a { font-size: 14px; font-weight: 700; color: #166534; text-decoration: underline; }
@media (min-width: 768px) {
  .fs-layout:not(.solo) { grid-template-columns: minmax(0, 1fr) 270px; }
  .fs-track { position: sticky; top: 84px; }
}
@media (min-width: 768px) and (max-width: 899px) {
  .fs-layout:not(.solo) { grid-template-columns: minmax(0, 1fr) 240px; }
}
.fs-solo { max-width: 520px; margin: 48px auto; padding: 0 16px; }
.fs h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; font-family: inherit; }
.fs-wait { margin: 0 0 16px; padding: 12px 14px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; font-size: 14.5px; line-height: 1.55; color: #78350f; }
.fs-sub { margin: 4px 0 16px; font-size: 14px; color: #64748b; }
.fs-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 18px; margin-bottom: 14px; }
.ch-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px; }
.ch-card h3 { font-size: 16px; font-weight: 800; margin: 0 0 6px; color: #0f172a; font-family: inherit; }
.ch-req b { display: block; font-size: 14px; color: #166534; } .ch-req span { font-size: 14px; color: #475569; }
.fs-card h2 { margin: 0 0 6px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.fs-note { margin: 0 0 12px; font-size: 14px; color: #64748b; }
.fs-guide { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: #f0fdf4; font-size: 14px; color: #166534; }
.fs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 12px; }
.fs-card label { display: block; margin: 10px 0 6px; font-size: 14px; font-weight: 700; color: #334155; }
.fs-card input:not([type=checkbox]), .fs-card textarea { width: 100%; box-sizing: border-box; min-height: 44px; border: 1.5px solid #dbe5df; border-radius: 10px; padding: 9px 12px; font: inherit; font-size: 15px; outline: none; resize: vertical; background: #fff; }
.fs-card input:focus, .fs-card textarea:focus { border-color: #15803d; }
.fs-terms { margin: 16px 0 12px; padding: 14px 16px; border-radius: 12px; background: #f6faf7; border: 1px solid #e0ece4; }
.fs-terms h3 { margin: 0 0 6px; font-size: 14.5px; font-weight: 800; color: #14532d; font-family: inherit; }
.fs-terms ul { margin: 0 0 8px; padding-left: 18px; font-size: 14px; color: #475569; line-height: 1.6; }
.fs-terms a { font-size: 14px; font-weight: 800; color: #166534; text-decoration: underline; }
.fs-card label.fs-check { display: flex; gap: 10px; align-items: flex-start; font-weight: 600; line-height: 1.5; cursor: pointer; }
.fs-check input { position: static !important; opacity: 1 !important; display: block !important; appearance: auto !important; width: 18px !important; height: 18px !important; margin: 2px 0 0 !important; flex: none; accent-color: #166534; }
.fs-check a { color: #166534; font-weight: 800; text-decoration: underline; }
.fs-acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.fs-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 18px; border: 1px solid #166534; border-radius: 10px; background: #166534; color: #fff !important; font: inherit; font-size: 14.5px; font-weight: 800; cursor: pointer; text-decoration: none !important; }
.fs-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.fs-btn:disabled { background: #cbd5e1; border-color: #cbd5e1; color: #64748b !important; cursor: not-allowed; }
.fs-err { color: #b91c1c; font-size: 14px; font-weight: 700; }
.fs dl { margin: 8px 0 14px; } .fs dt { font-size: 12.5px; font-weight: 700; color: #64748b; margin-top: 8px; } .fs dd { margin: 1px 0 0; font-size: 14.5px; color: #0f172a; overflow-wrap: anywhere; white-space: pre-wrap; }
@media (max-width: 480px) { .fs-grid { grid-template-columns: 1fr; } }
`;
