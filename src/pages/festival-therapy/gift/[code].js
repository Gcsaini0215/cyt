import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { apiUrl, getUserUrl } from "../../../utils/url";
import { fetchById } from "../../../utils/actions";
import { isAuthenticated } from "../../../utils/jwt";
import { FX_CSS, WHATSAPP, dayLabel, EMAIL_RX, FORMAT_LABEL, useOfferSlots, FormatPick, SlotPick, Field, GiftLinkBox } from "../../../components/festival/festival-ui";

/* The free session of a festival "book 1, get 1" offer — whoever has this link (the buyer, or the person they
   gifted it to) books it here at ₹0 on the Noida centre's slots, before the link's last day.
   Flow for the person opening it: a warm welcome → open the gift → log in (so it lands in My Space) → book. */
export async function getServerSideProps({ params }) {
  const code = String(params.code || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  try {
    const r = await fetch(`${apiUrl}/festival-gifts/${encodeURIComponent(code)}`);
    const j = await r.json();
    if (r.ok && j?.status) return { props: { code, gift: j.data } };
  } catch (e) { /* shown as not found */ }
  return { props: { code, gift: null } };
}

const first = (s) => String(s || "").trim().split(" ")[0];
const daysLeft = (today, till) => Math.max(0, Math.round((Date.parse(`${till}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000));
const store = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* fine */ } },
};

export default function FestivalGiftPage({ code, gift: initial }) {
  const [gift, setGift] = useState(initial);
  const [format, setFormat] = useState("in-person");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: initial?.prefill?.name || "", phone: initial?.prefill?.phone || "", email: initial?.prefill?.email || "", age: "", concern: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [share, setShare] = useState(false);
  const [checking, setChecking] = useState(!initial);
  const [opened, setOpened] = useState(false);   // the welcome "envelope" has been opened
  const [user, setUser] = useState(null);         // signed-in client
  const [skipLogin, setSkipLogin] = useState(false);
  const here = `/festival-therapy/gift/${code}`;

  // the server couldn't fetch it (or it's really not valid) — one more try from the browser
  useEffect(() => {
    if (initial) return;
    fetch(`${apiUrl}/festival-gifts/${encodeURIComponent(code)}`).then((r) => r.json()).then((j) => {
      if (j?.status) {
        setGift(j.data);
        setForm((f) => ({ ...f, name: j.data.prefill?.name || "", phone: j.data.prefill?.phone || "", email: j.data.prefill?.email || "" }));
      }
    }).catch(() => {}).finally(() => setChecking(false));
  }, [code, initial]);

  // back from logging in (or already opened it in this tab): skip the envelope; signed in → fill from the account
  useEffect(() => {
    if (store.get(`fxg-open-${code}`)) setOpened(true);
    if (store.get(`fxg-skip-${code}`)) setSkipLogin(true);
    if (!isAuthenticated()) return;
    fetchById(getUserUrl).then((r) => {
      const u = r?.data;
      if (!u) return;
      setUser(u);
      setOpened(true);
      setForm((f) => ({
        ...f,
        name: f.name || u.name || "",
        phone: f.phone || String(u.phone || "").replace(/\D/g, "").slice(-10),
        email: u.email || f.email, // the account's email, so the booking shows in their My Space
      }));
    }).catch(() => {});
  }, [code]);

  // only the modes the admin has switched on
  useEffect(() => { if (gift?.formats?.length && !gift.formats.includes(format)) setFormat(gift.formats[0]); }, [gift]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = gift && !gift.redeemed && !gift.expired;
  const slots = useOfferSlots(open ? { from: gift.today, to: gift.validTill, blocked: gift.blockedDates, refreshKey: refresh } : {});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));
  const gifted = gift && !gift.forSelf && gift.recipientName;
  const fromFirst = first(gift?.from) || "Someone";
  const toFirst = gifted ? first(gift.recipientName) : "";
  const left = gift ? daysLeft(gift.today, gift.validTill) : 0;
  const by = gift ? dayLabel(gift.validTill, { day: "numeric", month: "short" }) : "";
  const showForm = !!user || skipLogin;

  const openGift = () => { setOpened(true); store.set(`fxg-open-${code}`, "1"); setTimeout(() => document.getElementById("gift-next")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); };
  const skip = () => { setSkipLogin(true); store.set(`fxg-skip-${code}`, "1"); };

  const book = async () => {
    if (!date || !slot) return setError("Please pick a date and time.");
    if (!form.name.trim()) return setError("Please enter the name of the person attending.");
    if (!/^\d{10}$/.test(form.phone)) return setError("Please enter a valid 10-digit phone number.");
    if (!EMAIL_RX.test(form.email.trim())) return setError("Please enter an email — it's the login to see this booking.");
    setError(""); setBusy(true);
    try {
      const r = await fetch(`${apiUrl}/festival-gifts/${code}/book`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, date, slot, name: form.name.trim(), phone: form.phone, email: form.email.trim(), age: form.age.trim(), concern: form.concern.trim() }),
      });
      const j = await r.json();
      if (j.status) { setGift((g) => ({ ...g, redeemed: j.data, justBooked: true, bookedEmail: form.email.trim() })); window.scrollTo({ top: 0, behavior: "smooth" }); }
      else { setError(j.message || "Couldn't book. Please try again."); if (j.slotTaken) { setSlot(""); setRefresh((n) => n + 1); } }
    } catch { setError("Couldn't book. Please check your connection and try again."); }
    setBusy(false);
  };

  const title = !gift ? "Free session link"
    : gift.redeemed ? (gifted ? <>Enjoy your session, <em>{toFirst}</em> 💛</> : <>Your free session is <em>booked</em></>)
    : gifted ? <><em>{toFirst}</em>, you've received a gift 🎁</>
    : <>Your <em>free</em> session is waiting</>;

  return (
    <>
      <Head>
        <title>{gifted ? `A Diwali gift for ${toFirst} | CYT` : "Your Free Diwali Therapy Session | CYT"}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="You've received a free therapy session 🎁 — Shubh Deepawali" />
        <meta property="og:description" content="Someone who cares about you has gifted you a free session with an experienced counselling psychologist at Choose Your Therapist. Online or in Noida." />
      </Head>
      <MyNavbar />
      <main className="fx">
        <section className="gh">
          <div className="fx-wrap">
            <div className="gh-k">Shubh Deepawali 🪔</div>
            <h1>{title}</h1>
            {gift && !gift.redeemed && !gift.expired && (
              <p>{gifted ? <><b>{fromFirst}</b> thought of you this Diwali and gifted you a free therapy session — a little time, just for you.</> : <>One free session with an experienced counselling psychologist — online or at our Noida centre.</>}</p>
            )}
          </div>
        </section>
        <div className="fx-wrap gb">
          <section className="fx-card">
            {!gift && checking ? <div className="fx-muted">Loading…</div> : !gift ? (
              <div className="fx-done">
                <h2>This link isn't valid</h2>
                <p className="fx-hint" style={{ fontSize: 14 }}>Please check the link, or <a className="fx-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a> and we'll help.</p>
              </div>
            ) : gift.redeemed ? (
              <div className="fx-done">
                <div className="tick">✓</div>
                <h2>{gift.justBooked ? "Your free session is booked!" : "This free session is booked"}</h2>
                {gift.justBooked && <p className="fx-hint" style={{ fontSize: 14 }}>Well done for taking this step for yourself. We're looking forward to meeting you 💛</p>}
                <div className="fx-rows">
                  <div><span>For</span><b>{gift.redeemed.name}</b></div>
                  <div><span>With</span><b>Counselling psychologist, CYT</b></div>
                  <div><span>When</span><b>{dayLabel(gift.redeemed.date, { weekday: "short", day: "numeric", month: "short" })}, {gift.redeemed.slot}</b></div>
                  <div><span>Mode</span><b>{FORMAT_LABEL[gift.redeemed.format] || gift.redeemed.format}</b></div>
                  <div><span>Cost</span><b>Free 🎁</b></div>
                </div>
                {gift.justBooked && <p className="fx-hint" style={{ fontSize: 13.5 }}>Confirmation sent to {gift.bookedEmail}.</p>}
                {(gift.justBooked || user) && (
                  user
                    ? <Link href="/my-dashboard" className="fx-btn fx-btn-open" style={{ marginTop: 6 }}>Go to My Space →</Link>
                    : <Link href={`/login?next=${encodeURIComponent("/my-dashboard")}`} className="fx-btn fx-btn-open" style={{ marginTop: 6 }}>Log in to see it in My Space →</Link>
                )}
                <p className="fx-hint" style={{ marginTop: 12 }}>Need to change the time? <a className="fx-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.</p>
              </div>
            ) : gift.expired ? (
              <div className="fx-done">
                <h2>This link has expired</h2>
                <p className="fx-hint" style={{ fontSize: 14 }}>It had to be used by {dayLabel(gift.validTill, { day: "numeric", month: "long" })}. <a className="fx-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a> if you need help.</p>
              </div>
            ) : !opened ? (
              /* 1. the welcome — feel cared for, then open the gift */
              <div className="gw">
                <div className="gw-box" aria-hidden="true"><span className="gw-bow">🎀</span>🎁</div>
                <div className="gw-from">{gifted ? `A gift from ${fromFirst}` : "Your Diwali gift"}</div>
                <p className="gw-note">
                  {gifted
                    ? <>“{toFirst}, taking care of your mind is a beautiful thing. This is a safe, private space to talk about anything on your mind — with someone who listens.”</>
                    : <>Taking care of your mind is a beautiful thing. This is a safe, private space to talk about anything on your mind — with someone who listens.</>}
                </p>
                <div className="gw-chips">
                  <span>💛 Fully paid · ₹0 for you</span>
                  <span>{gift.formats.length === 1 ? (gift.formats[0] === "online" ? "💻 Online, from home" : "🏢 In person, Noida") : "💻 Online or 🏢 in person"}</span>
                  <span>📅 Book by {by}{left > 0 ? ` · ${left} day${left === 1 ? "" : "s"} left` : " · last day today"}</span>
                </div>
                <button type="button" className="fx-btn fx-btn-main gw-open" onClick={openGift}>Open my gift 🎁</button>
                <div className="gw-trust"><span>🔒 Private &amp; confidential</span><span>🎓 Qualified psychologist</span><span>🤝 No judgement</span></div>
              </div>
            ) : (
              <div id="gift-next">
                <div className="gr">
                  <div className="gr-ic">🎁</div>
                  <div>
                    <b>1 free therapy session{gifted ? `, from ${fromFirst}` : ""}</b>
                    <span>Paid for — book any time before {by}{left > 0 && left <= 5 ? ` (only ${left} day${left === 1 ? "" : "s"} left!)` : ""}</span>
                  </div>
                </div>

                {/* 2. log in, so the session is saved in their My Space */}
                <div className="fx-step">
                  <h2 className="fx-h"><span className="n">1</span>{user ? "You're logged in" : "Log in to keep it safe"}</h2>
                  {user ? (
                    <div className="gl-ok">✓ Logged in as <b>{user.name || user.email}</b>{user.email ? <> · {user.email}</> : null}. Your session will show in <Link href="/my-dashboard" className="fx-link">My Space</Link>.</div>
                  ) : (
                    <div className="gl">
                      <p>Log in or create a free account — your session, reminders and the video link will all be in <b>My Space</b>. Takes a minute.</p>
                      <div className="gl-acts">
                        <Link href={`/login?next=${encodeURIComponent(here)}`} className="fx-btn fx-btn-open">Log in</Link>
                        <Link href={`/register?next=${encodeURIComponent(here)}${form.email ? `&email=${encodeURIComponent(form.email)}` : ""}`} className="fx-btn fx-btn-ghost">Create account</Link>
                      </div>
                      {!skipLogin && <button type="button" className="gl-skip" onClick={skip}>Continue without logging in</button>}
                    </div>
                  )}
                </div>

                {showForm && (
                  <>
                    <div className="fx-step">
                      <h2 className="fx-h"><span className="n">2</span>How would you like to meet?</h2>
                      <FormatPick value={format} onChange={setFormat} formats={gift.formats} />
                    </div>
                    <div className="fx-step">
                      <h2 className="fx-h"><span className="n">3</span>Pick a time that suits you <span className="gb-by">by {by}</span></h2>
                      <SlotPick {...slots} date={date} slot={slot} onDate={setDate} onSlot={setSlot} blocked={gift.blockedDates.filter((d) => d >= gift.today && d <= gift.validTill)} />
                      <div className="fx-hint" style={{ marginTop: 8 }}>Times around Diwali fill up quickly — grab one that works for you now.</div>
                    </div>
                    <div className="fx-step">
                      <h2 className="fx-h"><span className="n">4</span>A few details</h2>
                      <div className="fx-grid2">
                        <Field label="Full name"><input value={form.name} onChange={set("name")} autoComplete="name" /></Field>
                        <Field label="Phone (WhatsApp)"><input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit number" /></Field>
                        <Field label="Email" hint={user ? "Your account email" : "The login to see this booking in My Space"}><input type="email" value={form.email} onChange={set("email")} autoComplete="email" readOnly={!!user?.email} /></Field>
                        <Field label="Age" optional><input value={form.age} onChange={set("age")} inputMode="numeric" /></Field>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <Field label="Anything you'd like to talk about?" optional hint="Only the psychologist sees this. It's fine to leave it blank."><textarea rows={2} value={form.concern} onChange={set("concern")} /></Field>
                      </div>
                    </div>
                    <div className="fx-step">
                      {date && slot && <div className="fx-hint" style={{ marginBottom: 8 }}>Session: <b>{dayLabel(date, { weekday: "long", day: "numeric", month: "long" })}, {slot}</b> · {format === "online" ? "Online" : "In-person, Noida"}</div>}
                      {error && <div className="fx-err" style={{ marginBottom: 10 }}>{error}</div>}
                      <button type="button" className="fx-btn fx-btn-main" disabled={busy} onClick={book}>{busy ? "Booking…" : "Book my free session"}</button>
                      <div className="fx-hint" style={{ textAlign: "center", marginTop: 8 }}>No payment needed · the link works once</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          {open && opened && !gifted && (
            <div className="gb-share">
              {!share ? (
                <button type="button" className="gb-sharebtn" onClick={() => setShare(true)}>{gifted ? `Send this link to ${toFirst} again` : "Want to gift this session to someone instead? Share the link"}</button>
              ) : (
                <div className="fx-card"><GiftLinkBox link={gift.link} validTill={gift.validTill} toName={gifted ? gift.recipientName : ""} fromName={gift.from} showTemplate openLabel="Open link" /></div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{ __html: FX_CSS + GIFT_CSS }} />
    </>
  );
}

const GIFT_CSS = `
.gh { background:radial-gradient(circle at 85% 20%, #8e1c31 0, transparent 45%), #7a1426; color:#fbf3e6; text-align:center; padding:40px 0 56px; }
.gh-k { letter-spacing:3px; text-transform:uppercase; font-size:12.5px; font-weight:700; color:#f6d9a8; margin-bottom:10px; }
.gh h1 { font-size:clamp(26px,4.6vw,42px); font-weight:800; margin:0 0 10px; color:#fbf3e6; line-height:1.15; }
.gh h1 em { font-style:normal; color:#f2b43c; }
.gh p { margin:0 auto; max-width:560px; color:#f6e7cf; font-size:15.5px; }
.gb { max-width:720px; margin-top:-28px; padding-bottom:48px; position:relative; }
.gb-by { margin-left:auto; font-size:12px; font-weight:700; background:#fff3d6; color:#8f6a14; border-radius:999px; padding:3px 10px; }
.gb-share { margin-top:14px; text-align:center; }
.gb-sharebtn { background:none; border:0; color:#7a1426; font:inherit; font-weight:700; font-size:14px; text-decoration:underline; cursor:pointer; }
.gw { text-align:center; padding:6px 4px 2px; }
.gw-box { font-size:72px; line-height:1; position:relative; display:inline-block; animation:gwfloat 2.6s ease-in-out infinite; }
.gw-bow { position:absolute; font-size:30px; top:-14px; right:-16px; transform:rotate(18deg); }
@keyframes gwfloat { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-8px) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .gw-box { animation:none; } }
.gw-from { font-size:13px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#c98a12; margin:12px 0 6px; }
.gw-note { font-size:17px; line-height:1.55; color:#3a2418; max-width:520px; margin:0 auto 14px; font-style:italic; }
.gw-chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:16px; }
.gw-chips span { background:#fff6e3; border:1px solid #f0d9a6; color:#5e0f1d; border-radius:999px; padding:6px 12px; font-size:13px; font-weight:700; }
.gw-open { max-width:360px; }
.gw-trust { display:flex; flex-wrap:wrap; gap:6px 16px; justify-content:center; margin-top:14px; font-size:12.5px; color:#6b5a4e; }
.gr { display:flex; gap:12px; align-items:center; background:linear-gradient(120deg,#7a1426,#9b2238); color:#fbf3e6; border-radius:14px; padding:12px 14px; margin-bottom:16px; }
.gr-ic { font-size:28px; line-height:1; }
.gr b { display:block; color:#fff; font-size:15.5px; } .gr span { font-size:13px; color:#f6e1c0; }
.gl p { margin:0 0 10px; font-size:14px; color:#3a2418; }
.gl-acts { display:flex; gap:8px; flex-wrap:wrap; }
.gl-acts .fx-btn { flex:1 1 140px; }
.gl-skip { background:none; border:0; padding:0; margin-top:10px; color:#6b5a4e; font:inherit; font-size:13px; text-decoration:underline; cursor:pointer; }
.gl-ok { background:#effaf3; border:1px solid #cdebd8; color:#16733f; border-radius:12px; padding:10px 12px; font-size:14px; }
.gl-ok b { color:#0f5a30; }
.fx-field input[readonly] { background:#f7f2ea; color:#6b5a4e; }
`;
