import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { apiUrl } from "../../../utils/url";
import { FX_CSS, WHATSAPP, dayLabel, EMAIL_RX, FORMAT_LABEL, useOfferSlots, FormatPick, SlotPick, Field, GiftLinkBox } from "../../../components/festival/festival-ui";

/* The free session of a festival "book 1, get 1" offer — whoever has this link (the buyer, or the person they
   gifted it to) books it here at ₹0 on the Noida centre's slots, before the link's last day. */
export async function getServerSideProps({ params }) {
  const code = String(params.code || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  try {
    const r = await fetch(`${apiUrl}/festival-gifts/${encodeURIComponent(code)}`);
    const j = await r.json();
    if (r.ok && j?.status) return { props: { code, gift: j.data } };
  } catch (e) { /* shown as not found */ }
  return { props: { code, gift: null } };
}

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

  const open = gift && !gift.redeemed && !gift.expired;
  const slots = useOfferSlots(open ? { from: gift.today, to: gift.validTill, blocked: gift.blockedDates, refreshKey: refresh } : {});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));
  const gifted = gift && !gift.forSelf && gift.recipientName;

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

  return (
    <>
      <Head>
        <title>Your Free Diwali Therapy Session | CYT</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MyNavbar />
      <main className="fx">
        <section className="gh">
          <div className="fx-wrap">
            <div className="gh-k">Shubh Deepawali 🪔</div>
            <h1>{!gift ? "Free session link" : gifted ? <>A gift for <em>{gift.recipientName.split(" ")[0]}</em> from {gift.from.split(" ")[0]}</> : <>Your <em>free</em> session</>}</h1>
            {gift && <p>One session with <b>Deepak Kumar</b>, Counselling Psychologist — in person at our Noida centre or online. It's free.</p>}
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
                <div className="fx-rows">
                  <div><span>For</span><b>{gift.redeemed.name}</b></div>
                  <div><span>With</span><b>Deepak Kumar</b></div>
                  <div><span>When</span><b>{dayLabel(gift.redeemed.date, { weekday: "short", day: "numeric", month: "short" })}, {gift.redeemed.slot}</b></div>
                  <div><span>Mode</span><b>{FORMAT_LABEL[gift.redeemed.format] || gift.redeemed.format}</b></div>
                  <div><span>Cost</span><b>Free 🎁</b></div>
                </div>
                {gift.justBooked && <p className="fx-hint" style={{ fontSize: 13.5 }}>Confirmation sent to {gift.bookedEmail}. You'll also see it in <Link href="/my-dashboard" className="fx-link">My Space</Link> — log in with that email.</p>}
                <p className="fx-hint">Need to change the time? <a className="fx-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.</p>
              </div>
            ) : gift.expired ? (
              <div className="fx-done">
                <h2>This link has expired</h2>
                <p className="fx-hint" style={{ fontSize: 14 }}>It had to be used by {dayLabel(gift.validTill, { day: "numeric", month: "long" })}. <a className="fx-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a> if you need help.</p>
              </div>
            ) : (
              <>
                <div className="fx-step">
                  <h2 className="fx-h"><span className="n">1</span>How would you like to meet?</h2>
                  <FormatPick value={format} onChange={setFormat} />
                </div>
                <div className="fx-step">
                  <h2 className="fx-h"><span className="n">2</span>Pick a time <span className="gb-by">by {dayLabel(gift.validTill, { day: "numeric", month: "short" })}</span></h2>
                  <SlotPick {...slots} date={date} slot={slot} onDate={setDate} onSlot={setSlot} blocked={gift.blockedDates.filter((d) => d >= gift.today && d <= gift.validTill)} />
                </div>
                <div className="fx-step">
                  <h2 className="fx-h"><span className="n">3</span>Who's attending?</h2>
                  <div className="fx-grid2">
                    <Field label="Full name"><input value={form.name} onChange={set("name")} autoComplete="name" /></Field>
                    <Field label="Phone (WhatsApp)"><input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit number" /></Field>
                    <Field label="Email" hint="The login to see this booking in My Space"><input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></Field>
                    <Field label="Age" optional><input value={form.age} onChange={set("age")} inputMode="numeric" /></Field>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Field label="What would you like help with?" optional><textarea rows={2} value={form.concern} onChange={set("concern")} /></Field>
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
          </section>

          {open && (
            <div className="gb-share">
              {!share ? (
                <button type="button" className="gb-sharebtn" onClick={() => setShare(true)}>{gifted ? `Send this link to ${gift.recipientName.split(" ")[0]} again` : "Want to gift this session to someone instead? Share the link"}</button>
              ) : (
                <div className="fx-card"><GiftLinkBox link={gift.link} validTill={gift.validTill} toName={gifted ? gift.recipientName : ""} fromName={gifted ? gift.from : ""} /></div>
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
.gh p { margin:0 auto; max-width:560px; color:#f6e7cf; font-size:15px; }
.gb { max-width:720px; margin-top:-28px; padding-bottom:48px; position:relative; }
.gb-by { margin-left:auto; font-size:12px; font-weight:700; background:#fff3d6; color:#8f6a14; border-radius:999px; padding:3px 10px; }
.gb-share { margin-top:14px; text-align:center; }
.gb-sharebtn { background:none; border:0; color:#7a1426; font:inherit; font-weight:700; font-size:14px; text-decoration:underline; cursor:pointer; }
`;
