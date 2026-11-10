import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById, putData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import useTherapistStore from "../../store/therapistStore";
import { linkUrl } from "../../utils/my-link";

/* "Google Maps listing" — a step-by-step guide for therapists with a real clinic to set up their own
   Google Business Profile, so they show up for "psychologist near me". Everything is pre-filled from
   their CYT profile with copy buttons; the Website / Book button points at their CYT booking link with
   ?src=my-gbp so visits show as "Your Google Maps listing" in their insights.
   Backend: GET/PUT /therapist/google-listing (GoogleListingController). */

const STEPS = [
  ["not-started", "Not started"],
  ["in-progress", "Setting up"],
  ["submitted", "Waiting for Google"],
  ["verified", "Verified"],
  ["live", "Live on Maps"],
];

function Copy({ label, value, mono, area }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch (e) { /* old browser */ }
    setDone(true); setTimeout(() => setDone(false), 1600);
  };
  if (!value) return null;
  return (
    <div className="gl-copy">
      <span className="gl-copy-l">{label}</span>
      <div className={`gl-copy-v${mono ? " mono" : ""}${area ? " area" : ""}`}>{value}</div>
      <button type="button" onClick={copy}>{done ? "Copied ✓" : "Copy"}</button>
    </div>
  );
}

// ≤ 750 characters (Google's limit), plain and factual — no "best", no promises, no keyword stuffing
function describe(p, city) {
  const specs = (p.specialities || []).slice(0, 5).join(", ").toLowerCase();
  const langs = (p.languages || []).join(", ");
  const exp = /^\d+/.test(String(p.experience || "")) ? `${parseInt(p.experience, 10)}+ years of experience` : "";
  const parts = [
    `${p.name} is a ${p.role.toLowerCase()} offering in-person therapy${city ? ` in ${city}` : ""} and online sessions across India.`,
    specs ? `Areas of work include ${specs}.` : "",
    [exp, langs ? `sessions in ${langs}` : ""].filter(Boolean).join(", ").replace(/^./, (c) => c.toUpperCase()) + ((exp || langs) ? "." : ""),
    "A verified psychologist on Choose Your Therapist — see availability and book a session online.",
  ].filter(Boolean);
  const out = parts.join(" ").replace(/\s+/g, " ").trim();
  return out.length > 750 ? `${out.slice(0, 747).replace(/\s+\S*$/, "")}…` : out;
}

export default function GoogleListingPage() {
  const { therapistInfo } = useTherapistStore();
  const [stats, setStats] = useState(null);
  const id = therapistInfo?._id || stats?.therapistId || null;
  const [data, setData] = useState(null);
  const [link, setLink] = useState(null); // { live, handle }
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("not-started");
  const [mapsUrl, setMapsUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchById(`${apiUrl}/therapist/google-listing`).then((r) => {
      if (!r?.status) throw new Error(r?.message);
      setData(r.data); setStatus(r.data.listing.status); setMapsUrl(r.data.listing.mapsUrl || "");
    }).catch((e) => setErr(e?.response?.data?.message || "Couldn't load this page. Please refresh."));
    fetchById(`${apiUrl}/profile-stats/me`).then((r) => setStats(r?.status ? r.data : {})).catch(() => setStats({}));
  }, []);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/my-link?id=${id}`).then((r) => r.json()).then((j) => setLink(j?.status ? j.data : { live: false })).catch(() => setLink({ live: false }));
  }, [id]);

  const p = data?.prefill;
  const bookUrl = link?.handle ? linkUrl(link.handle, "gbp") : "";
  const city = [p?.city, p?.state].filter(Boolean).join(", ");
  const description = useMemo(() => (p ? describe(p, p.city) : ""), [p]);
  const address = p ? [p.address, p.city, p.state, p.pincode].filter(Boolean).join(", ") : "";

  const save = async (next = {}) => {
    setSaving(true); setMsg(""); setErr("");
    try {
      const r = await putData(`${apiUrl}/therapist/google-listing`, { status: next.status ?? status, mapsUrl: next.mapsUrl ?? mapsUrl });
      if (!r?.status) throw new Error(r?.message);
      setStatus(r.data.status); setMapsUrl(r.data.mapsUrl || "");
      setMsg("Saved ✓");
    } catch (e) { setErr(e?.response?.data?.message || e.message || "Couldn't save."); }
    setSaving(false);
  };

  const stepIdx = STEPS.findIndex(([k]) => k === status);

  return (
    <MainLayout>
      <Head><title>Google Maps listing | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + CSS }} />
      <div className="pt gl">
        <div className="gl-hero">
          <div>
            <span className="gl-eyebrow">Free · for therapists with a clinic</span>
            <h1>Show up for “psychologist near me” on Google</h1>
            <p>A free Google Business Profile puts your clinic on Google Maps and in the top local results. Its <b>Website</b> and <b>Book</b> buttons will open your Choose Your Therapist booking page — so new clients book you directly, and you can see every visit from Google in your insights.</p>
          </div>
          <ul className="gl-why">
            <li><b>Found nearby</b><span>Shown when people near your clinic search for a psychologist or counsellor.</span></li>
            <li><b>Google reviews</b><span>Stars on Google are what most people check before they call.</span></li>
            <li><b>Tracked bookings</b><span>Visits from your listing show up as “Your Google Maps listing”.</span></li>
          </ul>
        </div>

        {err && <div className="pt-err">{err}</div>}
        {!data && !err && <div className="pt-skel" style={{ height: 260, borderRadius: 18 }} />}

        {data && !data.eligible && (
          <div className="pt-card gl-card gl-no">
            <h2>First, a couple of things in your profile</h2>
            <p>Google only lists a place where clients actually come to see you — online-only practices can&apos;t have a Maps listing (it gets suspended).</p>
            <ul>{data.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            <Link href="/settings" className="gl-b main">Open Settings</Link>
          </div>
        )}

        {data && data.eligible && (
          <>
            <div className="pt-card gl-card gl-status">
              <h2>Your listing</h2>
              <div className="gl-steps">
                {STEPS.map(([k, l], i) => (
                  <button key={k} type="button" className={`${i <= stepIdx ? "done" : ""}${i === stepIdx ? " on" : ""}`} onClick={() => save({ status: k })} disabled={saving}>
                    <i>{i < stepIdx ? "✓" : i + 1}</i><span>{l}</span>
                  </button>
                ))}
              </div>
              <div className="gl-url">
                <label htmlFor="gl-url">Link to your listing on Google Maps <small>(Maps → your listing → Share → Copy link)</small></label>
                <div>
                  <input id="gl-url" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/…" />
                  <button type="button" className="gl-b main" onClick={() => save({ mapsUrl })} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                </div>
                {mapsUrl && /^https:/.test(mapsUrl) && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="gl-open">Open my listing ↗</a>}
                {msg && <span className="gl-ok">{msg}</span>}
              </div>
            </div>

            <ol className="gl-guide">
              <li className="pt-card gl-card">
                <h3>Start your profile on Google</h3>
                <p>Sign in with your own Google account (the listing will belong to you).</p>
                <a className="gl-b main" href="https://business.google.com/create" target="_blank" rel="noopener noreferrer" onClick={() => stepIdx < 1 && save({ status: "in-progress" })}>Open Google Business Profile ↗</a>
              </li>
              <li className="pt-card gl-card">
                <h3>Name and category</h3>
                <Copy label="Business name" value={p.name} />
                <p className="gl-warn">Use your name exactly as you practise. Don&apos;t add words like “best psychologist” or your city — Google suspends listings for that.</p>
                <Copy label="Primary category" value="Psychologist" />
                <p className="gl-hint">Later you can add: <b>Psychotherapist</b>, <b>Counselor</b>, <b>Mental health service</b>.</p>
              </li>
              <li className="pt-card gl-card">
                <h3>Your clinic location</h3>
                <p>Choose <b>Yes, add a location customers can visit</b>, then enter your clinic address and drop the pin on the exact building.</p>
                <Copy label="Address" value={address} area />
              </li>
              <li className="pt-card gl-card">
                <h3>Phone and website</h3>
                <Copy label="Phone" value={p.phone ? `+91 ${p.phone}` : ""} mono />
                {bookUrl
                  ? <Copy label="Website" value={bookUrl} mono />
                  : <p className="gl-warn">{link && !link.live ? "Your booking link appears here once your profile is live on Choose Your Therapist." : "Loading your booking link…"}</p>}
                <p className="gl-hint">This is your Choose Your Therapist booking page — keep it as the website so bookings and payments go through CYT.</p>
              </li>
              <li className="pt-card gl-card">
                <h3>Verify with Google</h3>
                <p>Google will ask you to verify — usually a short video at your clinic (signboard, entrance, your workspace), sometimes a postcard or phone call. Do it from the clinic.</p>
                <button type="button" className="gl-b line" onClick={() => save({ status: "submitted" })} disabled={saving}>I&apos;ve sent it for verification</button>
              </li>
              <li className="pt-card gl-card">
                <h3>Finish the profile (after verification)</h3>
                <Copy label="Description" value={description} area />
                {p.specialities?.length > 0 && <Copy label="Services" value={p.specialities.join(", ")} area />}
                {bookUrl && <Copy label="Appointment link" value={bookUrl} mono />}
                <ul className="gl-list">
                  <li><b>Hours:</b> your clinic timings (not your online slots).</li>
                  <li><b>Photos:</b> clinic outside with signboard, waiting area, your room, and a clear photo of you. No stock photos.</li>
                  {p.languages?.length > 0 && <li><b>Languages:</b> {p.languages.join(", ")}.</li>}
                </ul>
              </li>
              <li className="pt-card gl-card">
                <h3>Ask for reviews</h3>
                <p>Ask clients who are happy with your sessions to leave a Google review — share the review link from your listing. Never offer discounts or gifts for reviews (Google removes them), and never share anything about a client.</p>
              </li>
              <li className="pt-card gl-card">
                <h3>Paste your Maps link above</h3>
                <p>Once your listing shows on Google Maps, paste its link in “Your listing” at the top — it marks you live and lets our team help with reviews and photos.</p>
              </li>
            </ol>
            <p className="gl-foot">Your Google listing belongs to you. Choose Your Therapist only helps set it up and doesn&apos;t promise a number of clients.</p>
          </>
        )}
      </div>
    </MainLayout>
  );
}

const CSS = `
.gl-hero { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 18px; align-items: start; background: radial-gradient(circle at 100% 0, rgba(242,201,76,.28), transparent 42%), linear-gradient(135deg, #1f7a4a, #0b3d26 75%); color: #fff; border-radius: 22px; padding: 24px; margin-bottom: 16px; }
.gl-eyebrow { display: inline-block; font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #f6d58a; margin-bottom: 8px; }
.gl-hero h1 { color: #fff !important; font-size: clamp(1.35rem, 2.6vw, 1.9rem); font-weight: 800; line-height: 1.2; margin: 0 0 8px; }
.gl-hero p { margin: 0; color: #d9eadf; font-size: 14.5px; line-height: 1.6; }
.gl-why { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.gl-why li { background: rgba(255,255,255,.1); border-radius: 14px; padding: 10px 12px; }
.gl-why b { display: block; font-size: 14px; color: #fff; }
.gl-why span { font-size: 12.5px; color: #cfe3d6; }
.gl-card { margin: 0 0 12px; padding: 18px 20px; }
.gl-card h2 { font-size: 17px; font-weight: 800; margin: 0 0 10px; }
.gl-no p { color: var(--mut); margin: 0 0 8px; }
.gl-no ul { margin: 0 0 14px; padding-left: 18px; color: #8a5a06; line-height: 1.7; }
.gl-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 14px; }
.gl-steps button { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px 4px; border: 0; background: none; cursor: pointer; font-family: inherit; color: #64748b; font-size: 12px; font-weight: 700; text-align: center; position: relative; }
.gl-steps button i { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-style: normal; background: #eef2ee; color: #64748b; font-weight: 800; }
.gl-steps button.done i { background: #dcf3e4; color: #14532d; }
.gl-steps button.on i { background: #14532d; color: #fff; box-shadow: 0 6px 14px -6px rgba(20,83,45,.6); }
.gl-steps button.on { color: #14532d; }
.gl-url label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px; }
.gl-url label small { font-weight: 500; color: #94a3b8; }
.gl-url > div { display: flex; gap: 8px; }
.gl-url input { flex: 1; min-width: 0; height: 44px; border: 1.5px solid var(--line); border-radius: 12px; padding: 0 12px; font-size: 14.5px; font-family: inherit; }
.gl-open { display: inline-block; margin-top: 8px; font-weight: 800; color: #1e7a4c !important; font-size: 13.5px; }
.gl-ok { margin-left: 10px; color: #166534; font-weight: 700; font-size: 13px; }
.gl-guide { list-style: none; counter-reset: gl; margin: 0; padding: 0; }
.gl-guide > li { counter-increment: gl; position: relative; padding-left: 64px; }
.gl-guide > li::before { content: counter(gl); position: absolute; left: 18px; top: 18px; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: #ecfdf3; color: #14532d; font-weight: 800; }
.gl-guide h3 { font-size: 16px; font-weight: 800; margin: 4px 0 8px; color: #0b1712; }
.gl-guide p { margin: 0 0 10px; font-size: 14px; color: #334155; line-height: 1.6; }
.gl-warn { color: #8a5a06 !important; background: #fdf3dc; border-radius: 10px; padding: 8px 12px; font-size: 13px !important; }
.gl-hint { color: #64748b !important; font-size: 13px !important; }
.gl-list { margin: 6px 0 0; padding-left: 18px; font-size: 14px; color: #334155; line-height: 1.7; }
.gl-copy { display: grid; grid-template-columns: 130px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 8px 0; border-bottom: 1px solid #f1f4f2; }
.gl-copy-l { font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #94a3b8; padding-top: 8px; }
.gl-copy-v { background: #f6faf7; border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; font-size: 14px; color: #0b1712; overflow-wrap: anywhere; }
.gl-copy-v.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
.gl-copy-v.area { white-space: pre-line; line-height: 1.55; }
.gl-copy button { height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #cfe3d6; background: #fff; color: #166534; font-weight: 800; font-size: 13px; cursor: pointer; font-family: inherit; white-space: nowrap; }
.gl-b { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 18px; border-radius: 12px; font-size: 14px; font-weight: 800; border: 0; cursor: pointer; font-family: inherit; text-decoration: none !important; white-space: nowrap; }
.gl-b.main { background: linear-gradient(180deg, #1f7a4a, #14532d); color: #fff !important; }
.gl-b.line { background: #fff; border: 1.5px solid #cfe3d6; color: #166534 !important; }
.gl-b:disabled { opacity: .6; }
.gl-foot { font-size: 12.5px; color: #94a3b8; margin: 8px 0 20px; }
@media (max-width: 900px) { .gl-hero { grid-template-columns: 1fr; } }
@media (max-width: 575px) {
  .gl-steps { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .gl-steps button span { font-size: 10.5px; }
  .gl-guide > li { padding-left: 20px; padding-top: 56px; }
  .gl-guide > li::before { left: 20px; top: 16px; }
  .gl-copy { grid-template-columns: 1fr auto; }
  .gl-copy-l { grid-column: 1 / -1; padding-top: 0; }
  .gl-url > div { flex-direction: column; }
}
`;
