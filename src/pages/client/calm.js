import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { BreatheApp } from "../../components/breathe/breathe-app";
import useSessionGuard from "../../utils/session-guard";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* Client → Calm corner (2026-11-20): the full breathing app (9 techniques, nature scenes, sounds) plus
   grounding, calming sounds and the 30-second SOS — full page, only a Back button. 7 days free from the first
   visit, then ₹100 for 30 days (Razorpay; priced and checked on the server, /calm/*). Paying early adds the
   30 days after the current period. */

const load = (name) => dynamic(() => import("../../components/wellness/quick-tools").then((m) => m[name]), { ssr: false, loading: () => <p style={{ textAlign: "center", opacity: 0.6 }}>Loading…</p> });
const TOOLS = {
  grounding: { title: "5-4-3-2-1 grounding", desc: "Come back to the present when thoughts race", icon: "⚓", C: load("GroundingTool") },
  sounds: { title: "Calming sounds", desc: "Rain, waves or wind — with a sleep timer", icon: "🎧", C: load("SoundsTool") },
  sos: { title: "30-second SOS", desc: "For a panic moment, right now", icon: "🆘", C: load("SosTool") },
};
const qtCss = () => import("../../components/wellness/quick-tools").then((m) => m.QT_CSS);
const TZ = "Asia/Kolkata";
const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }) : "");

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CalmCornerPage() {
  const ready = useSessionGuard();
  const router = useRouter();
  const [st, setSt] = useState(null); // { state, open, until, daysLeft, price, days, trialDays }
  const [pay, setPay] = useState(false); // the paywall is open
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [paidNow, setPaidNow] = useState(false);
  const [css, setCss] = useState("");

  useEffect(() => {
    if (!ready) return;
    fetchById(`${apiUrl}/calm/status?start=1`).then((r) => r?.status && setSt(r.data)).catch(() => setMsg("Couldn't load your Calm corner — check your internet."));
    qtCss().then(setCss).catch(() => {});
  }, [ready]);

  const open = !!st?.open;
  const toolKey = typeof router.query.t === "string" && TOOLS[router.query.t] ? router.query.t : "";
  const openPay = () => { setMsg(""); setPay(true); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };
  const closePay = () => { setPay(false); setMsg(""); };

  const buy = async () => {
    setBusy(true); setMsg("");
    try {
      const o = await postData(`${apiUrl}/calm/order`, {});
      if (!o?.data?.orderId) throw new Error(o?.message || "Couldn't start the payment.");
      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection.");
      const rzp = new window.Razorpay({
        key: o.data.keyId, amount: Math.round(o.data.amount * 100), currency: "INR", order_id: o.data.orderId,
        name: "Choose Your Therapist", description: "Calm corner — 30 days", theme: { color: "#2f5f59" },
        handler: async (resp) => {
          try {
            const v = await postData(`${apiUrl}/calm/verify`, resp);
            if (v?.status) { setSt(v.data); setPaidNow(true); setPay(false); }
            else setMsg(v?.message || "We couldn't confirm the payment. Contact hello@chooseyourtherapist.in with your payment ID.");
          } catch (e) { setMsg(e?.response?.data?.message || "We couldn't confirm the payment. Contact hello@chooseyourtherapist.in with your payment ID."); }
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || "Payment failed to start.");
      setBusy(false);
    }
  };

  const price = st?.price || 100, days = st?.days || 30;
  const paywall = (
    <div className="br-panel cc-pay">
      <span className="cc-emoji" aria-hidden="true">🌿</span>
      <h1>{st?.state === "expired" ? "Your free week has ended" : "Keep your Calm corner"}</h1>
      <p>{st?.state === "expired" ? "Hope it helped. Keep everything open for just" : "Unlock it for the month ahead for just"} <b>₹{price}</b> for {days} days.{st?.state === "trial" ? ` Your free days still count — the ${days} days start after them.` : ""}</p>
      <ul className="cc-list">
        <li>9 guided breathing exercises — box, 4-7-8, Anulom Vilom, Bhramari and more</li>
        <li>Calming nature scenes with real breath and nature sounds</li>
        <li>5-4-3-2-1 grounding, calming sounds with a sleep timer, 30-second SOS</li>
        <li>No auto-renew — you choose each month</li>
      </ul>
      <button type="button" className="br-main cc-buy" disabled={busy} onClick={buy}>{busy ? "Opening payment…" : `Pay ₹${price} · ${days} days`}</button>
      {msg && <p className="cc-err" role="alert">{msg}</p>}
      <p className="cc-fine">Secure payment by Razorpay · UPI, cards, net banking</p>
      {open && <button type="button" className="cc-link" onClick={closePay}>Not now</button>}
    </div>
  );
  const success = (
    <div className="br-panel cc-pay">
      <span className="cc-emoji big" aria-hidden="true">✨</span>
      <h1>You&apos;re all set</h1>
      <p>Thank you! Your Calm corner is open till <b>{day(st?.until)}</b>. Take a slow breath — it&apos;s all yours.</p>
      <button type="button" className="br-main cc-buy" onClick={() => { setPaidNow(false); router.push("/client/calm", undefined, { shallow: true }); }}>Start breathing</button>
    </div>
  );
  const Tool = toolKey ? TOOLS[toolKey].C : null;
  const toolView = toolKey && (
    <div className="br-panel cc-tool">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h2>{TOOLS[toolKey].title}</h2>
      <p>{TOOLS[toolKey].desc}</p>
      <div className="cc-tool-b"><Tool /></div>
    </div>
  );
  const top = st && (
    <div className={`cc-status ${st.state}`}>
      {st.state === "trial" && <><span><b>Free trial</b> · {st.daysLeft} day{st.daysLeft === 1 ? "" : "s"} left</span><button type="button" onClick={openPay}>Keep it · ₹{price}/month</button></>}
      {st.state === "active" && <><span><b>Calm corner</b> · open till {day(st.until)}</span>{st.daysLeft <= 5 && <button type="button" onClick={openPay}>Renew · ₹{price}</button>}</>}
      {st.state === "expired" && <><span><b>Free week over</b> · unlock for ₹{price}/month</span><button type="button" onClick={openPay}>Unlock</button></>}
    </div>
  );
  const bottom = (
    <div className="cc-more">
      <p>More calm tools</p>
      <div className="cc-tiles">
        {Object.entries(TOOLS).map(([k, x]) => (
          <button key={k} type="button" onClick={() => (open ? router.push({ pathname: "/client/calm", query: { t: k } }, undefined, { shallow: true }) : openPay())}>
            <span aria-hidden="true">{x.icon}</span><b>{x.title}</b><small>{x.desc}</small>{!open && <em className="br-lock">🔒</em>}
          </button>
        ))}
      </div>
    </div>
  );

  if (!ready) return null;
  const extra = paidNow ? success : pay ? paywall : toolKey ? (open ? toolView : paywall) : null;
  return (
    <>
      <Head><title>Calm corner | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: CC_CSS }} />
      <BreatheApp
        basePath="/client/calm" home="/my-dashboard"
        locked={() => !!st && !open} onLocked={openPay} lockedView={paywall}
        top={top} bottom={bottom} extraView={extra}
        intro="Your Calm corner — pick a breath, follow the circle, let the scene slow you down."
      />
    </>
  );
}

const CC_CSS = `
.cc-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin: 0 0 16px; padding: 10px 12px 10px 16px; border-radius: 16px;
  background: rgba(255,255,255,.7); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.7); font-size: 14px; color: #22302f; }
.cc-status.expired { background: rgba(255,241,224,.85); }
.cc-status button, .cc-tiles button em { font: inherit; }
.cc-status button { height: 36px; padding: 0 14px; border: 0; border-radius: 999px; background: #2b3b39; color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; }
.cc-more { margin-top: 22px; }
.cc-more > p { margin: 0 0 10px; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: rgba(34,48,47,.7); }
.cc-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.cc-tiles button { position: relative; text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 16px; border-radius: 20px; border: 1px solid rgba(34,48,47,.12); background: rgba(255,255,255,.55);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); color: #22302f; font: inherit; cursor: pointer; }
.cc-tiles span { font-size: 26px; } .cc-tiles b { font-size: 15.5px; } .cc-tiles small { font-size: 12.5px; color: rgba(34,48,47,.72); }
.cc-pay { margin-top: 6vh; text-align: center; }
.cc-emoji { font-size: 44px; display: block; margin-bottom: 4px; } .cc-emoji.big { font-size: 56px; }
.cc-pay h1 { font-size: 26px; font-weight: 800; }
.cc-pay > p { font-size: 15px; line-height: 1.55; margin: 0 0 12px; }
.cc-list { text-align: left; margin: 0 auto 16px; padding: 0; list-style: none; max-width: 420px; display: flex; flex-direction: column; gap: 8px; }
.cc-list li { position: relative; padding-left: 28px; font-size: 14.5px; line-height: 1.45; color: #22302f; }
.cc-list li::before { content: "✓"; position: absolute; left: 0; top: 0; width: 20px; height: 20px; border-radius: 50%; background: #2f8f6b; color: #fff; font-size: 12px; font-weight: 900; display: grid; place-items: center; }
.cc-buy { min-width: 220px; }
.cc-err { color: #b42318 !important; font-size: 14px; margin: 10px 0 0 !important; }
.cc-fine { font-size: 12.5px !important; margin: 10px 0 0 !important; }
.cc-link { margin-top: 8px; border: 0; background: none; color: #2f5f59; font: inherit; font-weight: 700; text-decoration: underline; cursor: pointer; }
.cc-tool { margin-top: 2vh; } .cc-tool h2 { font-size: 22px; font-weight: 800; } .cc-tool > p { margin: 0 0 12px; font-size: 14px; }
.cc-tool-b { background: #fff; border-radius: 18px; padding: 16px; }
@media (max-width: 760px) { .cc-tiles { grid-template-columns: minmax(0, 1fr); } .cc-tiles button { flex-direction: row; align-items: center; gap: 12px; } .cc-tiles small { display: none; } }
`;
