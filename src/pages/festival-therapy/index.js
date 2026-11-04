import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { apiUrl } from "../../utils/url";
import {
  FX_CSS, WHATSAPP, inr, dayLabel, EMAIL_RX, FORMAT_LABEL, loadRazorpay, waitForRazorpay, useOfferSlots,
  FormatPick, SlotPick, Field, GiftLinkBox,
} from "../../components/festival/festival-ui";

/* Festival offer page — Diwali 2026: book one session with Deepak Kumar at the normal Noida fee, get a second
   one free (for yourself or as a gift). Slots are the Noida centre's own; payment, booking and dashboards go
   through the usual Noida flow (with `offer` set). The free session is booked from its link: /festival-therapy/gift/<code>. */
const OFFER = "diwali-2026";
const PAGE_URL = "https://www.chooseyourtherapist.in/festival-therapy";

export default function FestivalTherapy() {
  const [offer, setOffer] = useState(null);
  const [offerErr, setOfferErr] = useState("");
  const [format, setFormat] = useState("in-person");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", age: "", concern: "" });
  const [giftFor, setGiftFor] = useState("gift");
  const [gift, setGift] = useState({ name: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch(`${apiUrl}/festival-offers/current?offer=${OFFER}`).then((r) => r.json())
      .then((j) => (j?.status ? setOffer(j.data) : setOfferErr("This offer isn't available right now.")))
      .catch(() => setOfferErr("Couldn't load the offer. Please refresh."));
  }, []);
  useEffect(() => { if (offer?.open) loadRazorpay(); }, [offer]);

  const slots = useOfferSlots({ from: offer?.today, to: offer?.lastSessionDate, blocked: offer?.blockedDates || [], refreshKey: refresh });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));
  const setG = (k) => (e) => setGift((f) => ({ ...f, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));

  const fee = offer ? offer.prices[format] : 0;
  const total = offer ? fee + offer.prices.platformFee : 0;

  const problem = () => {
    if (!date || !slot) return "Please pick a date and time.";
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\d{10}$/.test(form.phone)) return "Please enter a valid 10-digit phone number.";
    if (!EMAIL_RX.test(form.email.trim())) return "Please enter your email — it's your login to see this booking.";
    if (giftFor === "gift" && !gift.name.trim()) return "Please enter the name of the person you're gifting the free session to (or choose 'Decide later').";
    if (giftFor === "gift" && gift.email.trim() && !EMAIL_RX.test(gift.email.trim())) return "Their email doesn't look right.";
    return "";
  };

  const payload = () => ({
    offer: OFFER, type: "new", sessionMode: "individual", format,
    name: form.name.trim(), phone: form.phone, email: form.email.trim(), age: form.age.trim(), concern: form.concern.trim(),
    date, slot,
    giftFor: giftFor === "later" ? "" : giftFor,
    ...(giftFor === "gift" ? { giftName: gift.name.trim(), giftPhone: gift.phone, giftEmail: gift.email.trim() } : {}),
  });

  const lostSlot = (msg) => { setError(msg || "That time was just booked. Please pick another."); setSlot(""); setRefresh((n) => n + 1); };

  const finish = async (rz) => {
    setBusy(true);
    try {
      const r = await fetch(`${apiUrl}/noida-appointments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload(), ...rz }) });
      const j = await r.json();
      if (j.status) { setDone(j.data); window.scrollTo({ top: document.getElementById("book")?.offsetTop - 80 || 0, behavior: "smooth" }); }
      else if (j.paymentHandled && j.refunded !== undefined) lostSlot(j.message);
      else setError(j.message || `Payment received, but we couldn't save the booking. Please WhatsApp us with payment ID ${rz.razorpay_payment_id}.`);
    } catch {
      setError(`Payment succeeded but we couldn't confirm the booking. Please WhatsApp us with payment ID ${rz.razorpay_payment_id}.`);
    }
    setBusy(false);
  };

  const pay = async () => {
    const p = problem();
    if (p) { setError(p); return; }
    setError(""); setBusy(true); loadRazorpay();
    try {
      const r = await fetch(`${apiUrl}/noida-appointments/create-order`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
      const j = await r.json();
      if (!j.status) { setBusy(false); return r.status === 409 ? lostSlot(j.message) : setError(j.message || "Couldn't start payment. Please try again."); }
      await waitForRazorpay();
      const rzp = new window.Razorpay({
        key: j.data.keyId, amount: Math.round(j.data.amount * 100), currency: "INR", order_id: j.data.orderId,
        name: "Choose Your Therapist", description: "Diwali 1+1 — session with Deepak Kumar",
        handler: (resp) => finish({ razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature }),
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#7a1426" },
        modal: { ondismiss: () => { setBusy(false); setError("Payment was cancelled. You can try again whenever you're ready."); } },
      });
      rzp.on("payment.failed", () => { setBusy(false); setError("Payment failed. Please try again or use another method."); });
      rzp.open();
    } catch (e) {
      setBusy(false); setError(e.message || "Couldn't start payment. Please try again.");
    }
  };

  const bookBy = offer ? dayLabel(offer.bookBy, { day: "numeric", month: "short" }) : "7 Nov";

  return (
    <>
      <Head>
        <title>Diwali Offer: Book 1 Therapy Session, Get 1 Free | CYT</title>
        <meta name="description" content="Shubh Deepawali! Book one session with Deepak Kumar, Counselling Psychologist, online or at our Noida centre, and get a second session free — for yourself or as a gift for a loved one. Book till 7 Nov." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Is Diwali, Ek Session Apne Liye, Ek Apno Ke Liye — Book 1, Get 1 Free" />
        <meta property="og:description" content="Book a session with Deepak Kumar (Counselling Psychologist), online or in Noida, and get a second session free to keep or gift. Book till 7 Nov." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
      </Head>
      <MyNavbar />
      <main className="fx">
        <section className="fh">
          <div className="fx-wrap fh-in">
            <div className="fh-brand">Shubh Deepawali 🪔</div>
            <h1><em>Is Diwali,</em> Ek Session Apne Liye, Ek <em>Apno</em> Ke Liye.</h1>
            <p className="fh-sub">Book 1 Session, Get 1 Session</p>
            <div className="fh-free">FREE</div>
            <a href="#book" className="fx-btn fh-cta">Book Now</a>
            <p className="fh-with">with <b>Deepak Kumar</b>, Counselling Psychologist · Online &amp; Noida</p>
          </div>
        </section>

        <div className="fx-wrap fb">
          <section className="fx-card fb-book" id="book">
            {offerErr ? <div className="fx-err">{offerErr}</div>
              : !offer ? <div className="fx-muted">Loading…</div>
              : done ? <Done d={done} email={form.email} giftFor={giftFor} giftPhone={giftFor === "gift" ? gift.phone : ""} />
              : !offer.open ? <Closed />
              : (
                <>
                  <div className="fx-step">
                    <h2 className="fx-h"><span className="n">1</span>How would you like to meet?</h2>
                    <FormatPick value={format} onChange={setFormat} prices={offer.prices} />
                  </div>
                  <div className="fx-step">
                    <h2 className="fx-h"><span className="n">2</span>Pick your session time</h2>
                    <SlotPick {...slots} date={date} slot={slot} onDate={setDate} onSlot={setSlot} blocked={offer.blockedDates} />
                  </div>
                  <div className="fx-step">
                    <h2 className="fx-h"><span className="n">3</span>Your details</h2>
                    <div className="fx-grid2">
                      <Field label="Full name"><input value={form.name} onChange={set("name")} autoComplete="name" /></Field>
                      <Field label="Phone (WhatsApp)"><input value={form.phone} onChange={set("phone")} inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" /></Field>
                      <Field label="Email" hint="Your login to see this booking in My Space"><input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></Field>
                      <Field label="Age" optional><input value={form.age} onChange={set("age")} inputMode="numeric" /></Field>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Field label="What would you like help with?" optional><textarea rows={2} value={form.concern} onChange={set("concern")} /></Field>
                    </div>
                  </div>
                  <div className="fx-step">
                    <h2 className="fx-h"><span className="n">4</span>Your free session is for…</h2>
                    <div className="fx-seg">
                      {[["gift", "🎁 A loved one"], ["self", "Me"], ["later", "Decide later"]].map(([k, t]) => (
                        <button key={k} type="button" className={giftFor === k ? "on" : ""} onClick={() => setGiftFor(k)}>{t}</button>
                      ))}
                    </div>
                    {giftFor === "gift" && (
                      <div className="fx-grid2">
                        <Field label="Their name"><input value={gift.name} onChange={setG("name")} /></Field>
                        <Field label="Their phone" optional><input value={gift.phone} onChange={setG("phone")} inputMode="numeric" placeholder="10-digit number" /></Field>
                        <Field label="Their email" optional hint="We'll email them the gift link"><input type="email" value={gift.email} onChange={setG("email")} /></Field>
                      </div>
                    )}
                    <div className="fx-hint" style={{ marginTop: 8 }}>
                      {giftFor === "self" ? "You'll get a link to book your second session." : giftFor === "later" ? "You'll get the free-session link by email and in My Space — use it or gift it anytime before it expires." : "You'll get a link to share on WhatsApp — they pick their own time."}
                    </div>
                  </div>
                  <div className="fx-step">
                    <div className="fx-sum">
                      <div><span>Session with Deepak Kumar · {format === "online" ? "Online" : "In-person"}</span><b>{inr(fee)}</b></div>
                      <div><span>Platform fee</span><b>{inr(offer.prices.platformFee)}</b></div>
                      <div className="free"><span>+ 1 session FREE 🎁</span><b>{inr(0)}</b></div>
                      <div className="tot"><span>You pay</span><b>{inr(total)}</b></div>
                    </div>
                    {date && slot && <div className="fx-hint" style={{ margin: "8px 0 0" }}>Your session: <b>{dayLabel(date, { weekday: "long", day: "numeric", month: "long" })}, {slot}</b></div>}
                    {error && <div className="fx-err">{error}</div>}
                    <button type="button" className="fx-btn fx-btn-main" style={{ marginTop: 12 }} disabled={busy} onClick={pay}>{busy ? "Please wait…" : `Pay ${inr(total)} & book`}</button>
                    <div className="fx-hint" style={{ textAlign: "center", marginTop: 8 }}>Secure payment by Razorpay · UPI, cards, net banking</div>
                  </div>
                </>
              )}
          </section>

          <aside className="fb-side">
            <div className="fx-card fb-offer">
              <div className="fb-tag">Diwali Offer</div>
              <div className="fb-big">1 + 1 Session</div>
              <ul className="fb-list">
                <li><b>Pay for one</b> session at the usual fee — the second is free.</li>
                <li><b>Keep it or gift it</b> 🎁 — share the free session's link with someone you care about.</li>
                <li><b>Online or in person</b> at our Noida centre — your choice, for each session.</li>
                <li>With <b>Deepak Kumar</b>, Counselling Psychologist.</li>
              </ul>
            </div>
            <div className="fx-card fb-terms">
              <h3>Terms</h3>
              <ul>
                <li>Book till <b>{bookBy}</b>.</li>
                <li>Use both sessions within <b>{offer?.validDays || 15} days</b> of booking.</li>
                <li>No sessions on <b>8 Nov</b> (Diwali).</li>
                <li>Free session: one per paid session, booked from its link; the link works once.</li>
                <li>Individual sessions only; can't be combined with other coupons.</li>
              </ul>
              <a className="fx-link" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I have a question about the Diwali 1+1 offer.")}`} target="_blank" rel="noopener noreferrer">Questions? WhatsApp +91 80777 57951</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{ __html: FX_CSS + PAGE_CSS }} />
    </>
  );
}

function Closed() {
  return (
    <div className="fx-done">
      <div className="tick" style={{ background: "#7a1426" }}>🪔</div>
      <h2>This Diwali offer has ended</h2>
      <p className="fx-hint" style={{ fontSize: 14 }}>Thank you for the love! Already have a free-session link? Open it from your email or My Space.</p>
      <Link href="/noida-appointment" className="fx-btn fx-btn-ghost" style={{ marginTop: 10 }}>Book a regular session</Link>
    </div>
  );
}

function Done({ d, email, giftFor: chosen, giftPhone }) {
  const g = d.gift;
  const [giftFor, setGiftFor] = useState(g?.recipientName ? "gift" : g?.forSelf ? "self" : "");
  const [recipient, setRecipient] = useState(g?.recipientName || "");
  const [phone, setPhone] = useState(giftPhone || "");
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "" });
  const [msg, setMsg] = useState("");
  const save = async () => {
    if (!f.name.trim()) { setMsg("Please enter their name."); return; }
    setMsg("Saving…");
    try {
      const r = await fetch(`${apiUrl}/festival-gifts/${g.code}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ giftFor: "gift", giftName: f.name, giftPhone: f.phone, giftEmail: f.email }) });
      const j = await r.json();
      if (!j.status) { setMsg(j.message || "Couldn't save."); return; }
      setGiftFor("gift"); setRecipient(j.data.recipientName); setPhone(f.phone); setShow(false); setMsg(j.emailed ? `We've emailed ${j.data.recipientName} the link too.` : "");
    } catch { setMsg("Couldn't save. Please try again."); }
  };
  return (
    <div className="fx-done">
      <div className="tick">✓</div>
      <h2>Your session is booked!</h2>
      <p className="fx-hint" style={{ fontSize: 14 }}>Confirmation sent to {d.email || email}. Shubh Deepawali 🪔</p>
      <div className="fx-rows">
        <div><span>With</span><b>Deepak Kumar</b></div>
        <div><span>When</span><b>{dayLabel(d.date, { weekday: "short", day: "numeric", month: "short" })}, {d.slot}</b></div>
        <div><span>Mode</span><b>{FORMAT_LABEL[d.format] || d.format}</b></div>
        <div><span>Paid</span><b>{inr(d.amount)}</b></div>
      </div>
      {g ? (
        <>
          <h3 className="fd-h">🎁 Your free session {giftFor === "gift" ? `for ${recipient}` : ""}</h3>
          <p className="fx-hint" style={{ fontSize: 13.5, marginBottom: 10 }}>
            {giftFor === "gift" ? `Send this link to ${recipient.split(" ")[0]} — they choose their own time (in-person or online).` : "Book your second session with this link anytime before it expires — or gift it to someone."}
          </p>
          <GiftLinkBox link={g.link} validTill={g.validTill} toName={giftFor === "gift" ? recipient : ""} fromName={giftFor === "gift" ? d.name : ""} phone={giftFor === "gift" && /^\d{10}$/.test(phone) ? phone : ""} />
          {giftFor !== "gift" && !show && <button type="button" className="fx-btn fx-btn-ghost" style={{ marginTop: 12 }} onClick={() => setShow(true)}>Gift it to someone</button>}
          {show && (
            <div style={{ textAlign: "left", marginTop: 12 }}>
              <div className="fx-grid2">
                <Field label="Their name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
                <Field label="Their phone" optional><input value={f.phone} inputMode="numeric" onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></Field>
                <Field label="Their email" optional><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
              </div>
              <button type="button" className="fx-btn fx-btn-main" style={{ marginTop: 10 }} onClick={save}>Save &amp; send</button>
            </div>
          )}
          {msg && <div className="fx-hint" style={{ marginTop: 8 }}>{msg}</div>}
        </>
      ) : (
        <p className="fx-hint">Your free-session link is on its way to your email{chosen === "gift" ? " (and to the person you're gifting it to)" : ""}.</p>
      )}
      <p className="fx-hint" style={{ marginTop: 14 }}>Both sessions also show in <Link href="/my-dashboard" className="fx-link">My Space</Link> — log in with {d.email || email}.</p>
    </div>
  );
}

const PAGE_CSS = `
.fh { background:radial-gradient(circle at 85% 15%, #8e1c31 0, transparent 45%), radial-gradient(circle at 10% 90%, #8e1c31 0, transparent 40%), #7a1426; color:#fbf3e6; text-align:center; padding:54px 0 64px; position:relative; overflow:hidden; }
.fh::before, .fh::after { content:"✦"; position:absolute; color:#f2b43c; font-size:34px; }
.fh::before { right:9%; top:42%; } .fh::after { left:7%; bottom:22%; font-size:24px; }
.fh-in { max-width:760px; }
.fh-brand { letter-spacing:3px; text-transform:uppercase; font-size:13px; font-weight:700; color:#f6d9a8; margin-bottom:14px; }
.fh h1 { font-size:clamp(30px,5.4vw,54px); line-height:1.12; font-weight:800; margin:0 0 18px; color:#fbf3e6; }
.fh h1 em { font-style:normal; color:#f2b43c; }
.fh-sub { font-size:clamp(18px,2.6vw,26px); margin:0; color:#fbf3e6; }
.fh-free { font-size:clamp(66px,12vw,124px); font-weight:900; color:#f2b43c; line-height:1; letter-spacing:2px; margin:4px 0 20px; }
.fh-free sup { font-size:.4em; vertical-align:top; }
.fh-cta { background:#f2b43c; color:#5e0f1d; font-size:20px; padding:14px 46px; box-shadow:0 8px 24px rgba(0,0,0,.25); }
.fh-with { margin:16px 0 0; color:#f6e7cf; font-size:15px; }
.fb { display:grid; grid-template-columns:minmax(0,1fr) 330px; gap:22px; align-items:start; margin-top:-30px; padding-bottom:48px; position:relative; }
.fb-side { display:flex; flex-direction:column; gap:16px; position:sticky; top:90px; }
.fb-offer { background:#fbf3e6; border-color:#ecdcc4; }
.fb-tag { color:#7a1426; font-weight:700; font-size:14px; }
.fb-big { font-size:30px; font-weight:900; color:#5e0f1d; margin:2px 0 10px; }
.fb-list, .fb-terms ul { margin:0; padding-left:18px; font-size:14px; line-height:1.55; }
.fb-list li, .fb-terms li { margin-bottom:6px; }
.fb-terms h3 { margin:0 0 8px; font-size:15px; color:#7a1426; }
.fb-terms .fx-link { display:inline-block; margin-top:6px; font-size:14px; }
.fd-h { font-size:17px; color:#7a1426; margin:18px 0 4px; }
@media (max-width:900px) {
  .fb { grid-template-columns:minmax(0,1fr); margin-top:-24px; }
  .fb-side { position:static; order:-1; }
  .fb-offer { display:none; }
}
@media (max-width:560px) {
  .fh { padding:38px 0 50px; }
  .fh::before, .fh::after { display:none; }
  .fh-cta { font-size:18px; padding:13px 38px; }
  .fh-with { font-size:13.5px; }
}
`;
