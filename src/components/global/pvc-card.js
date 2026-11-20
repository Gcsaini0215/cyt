import React from "react";

/* A wallet card that looks like a real PVC / metro card (2026-11-20, owner): card proportions (85.6 × 54 mm),
   a gold EMV chip, the contactless mark, embossed number, holder name, valid-thru, a transit-card colour band,
   fine guilloche lines and a glossy sheen that moves on hover. Used by the client wallet and the therapist's
   subscription wallet. Purely visual — it isn't a payment card. */

// a stable "card number" from an account id (last 4 shown), e.g. "CYT •••• •••• 4821"
export const cardNo = (id) => {
  const hex = String(id || "").replace(/[^a-f0-9]/gi, "");
  const n = hex ? parseInt(hex.slice(-6), 16) % 10000 : 0;
  return `•••• •••• ${String(n).padStart(4, "0")}`;
};

// tone: "client" (green + gold) | "pro" (emerald + gold, therapist) | "silver" (free plan) | "grey" (ended)
export default function PvcCard({ tone = "client", label = "CYT Wallet", tag = "", big, bigLabel = "", holder = "", number = "", validThru = "", ribbon = "", children = null }) {
  return (
    <div className={`pvc ${tone}`}>
      <style>{PVC_CSS}</style>
      <div className="pvc-card" role="img" aria-label={`${label}: ${big} ${bigLabel}`}>
        <i className="pvc-guill" aria-hidden="true" />
        <i className="pvc-band" aria-hidden="true" />
        <i className="pvc-sheen" aria-hidden="true" />
        {ribbon && <span className="pvc-ribbon">{ribbon}</span>}
        <div className="pvc-top">
          <span className="pvc-brand"><img src="/cyt-emblem.png" alt="" width="26" height="26" /><span><b>{label}</b><small>Choose Your Therapist</small></span></span>
          {tag && !ribbon && <em className="pvc-tag">{tag}</em>}
        </div>
        <div className="pvc-mid">
          <span className="pvc-chip" aria-hidden="true"><i /><i /><i /></span>
          <svg className="pvc-nfc" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7.5a6 6 0 0 1 0 9M12 5a9.5 9.5 0 0 1 0 14M15.5 2.8a13 13 0 0 1 0 18.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span className="pvc-big"><b>{big}</b>{bigLabel && <small>{bigLabel}</small>}</span>
        </div>
        <div className="pvc-no">{number}</div>
        <div className="pvc-bot">
          <span><small>Card holder</small><b>{holder || "—"}</b></span>
          {validThru && <span className="r"><small>Valid thru</small><b>{validThru}</b></span>}
        </div>
      </div>
      {children}
    </div>
  );
}

const PVC_CSS = `
.pvc { --a: #1f8a55; --b: #0f5132; --c: #062b1b; --band: linear-gradient(90deg, #ecc77d, #f6dc9f 50%, #d9a441); --ink: #fff; --ink2: rgba(255,255,255,.78); perspective: 1200px; margin-bottom: 16px; }
.pvc.pro { --a: #0f766e; --b: #0b4f4a; --c: #052523; --band: linear-gradient(90deg, #d4a24c, #f2d28a 50%, #b98523); }
.pvc.silver { --a: #e8edf1; --b: #b8c3cc; --c: #8a96a1; --band: linear-gradient(90deg, #f59e0b, #fbbf24 50%, #f59e0b); --ink: #1f2937; --ink2: rgba(31,41,55,.7); }
.pvc.grey { --a: #6b7280; --b: #4b5563; --c: #1f2937; --band: linear-gradient(90deg, #9ca3af, #d1d5db 50%, #9ca3af); }
.pvc-card { position: relative; width: 100%; max-width: 440px; aspect-ratio: 1.586; border-radius: 20px; overflow: hidden; color: var(--ink); padding: 18px 20px; box-sizing: border-box;
  display: flex; flex-direction: column; justify-content: space-between;
  background: radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.22) 0%, rgba(255,255,255,0) 45%), radial-gradient(90% 80% at 0% 100%, rgba(0,0,0,.25), rgba(0,0,0,0) 60%), linear-gradient(135deg, var(--a) 0%, var(--b) 55%, var(--c) 100%);
  box-shadow: 0 1px 0 rgba(255,255,255,.35) inset, 0 -1px 0 rgba(0,0,0,.25) inset, 0 28px 46px -24px rgba(0,0,0,.55), 0 10px 18px -12px rgba(0,0,0,.35);
  transform: rotateX(4deg) rotateY(-6deg); transform-style: preserve-3d; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.pvc-card:hover { transform: rotateX(0) rotateY(0) translateY(-3px); }
/* fine banknote-like lines */
.pvc-guill { position: absolute; inset: 0; pointer-events: none; opacity: .13;
  background: repeating-radial-gradient(circle at 85% 120%, transparent 0 9px, rgba(255,255,255,.9) 9px 10px), repeating-linear-gradient(115deg, transparent 0 14px, rgba(255,255,255,.35) 14px 15px); mix-blend-mode: overlay; }
.pvc.silver .pvc-guill { opacity: .25; mix-blend-mode: normal; background: repeating-radial-gradient(circle at 85% 120%, transparent 0 9px, rgba(255,255,255,.95) 9px 10px); }
/* the metro / transit colour band */
.pvc-band { position: absolute; left: -10%; right: -10%; top: 58%; height: 14px; background: var(--band); transform: rotate(-8deg); opacity: .85; box-shadow: 0 2px 6px rgba(0,0,0,.2); }
.pvc-sheen { position: absolute; inset: -40% -60%; background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.28) 50%, transparent 60%); transform: translateX(-30%); transition: transform .9s ease; pointer-events: none; }
.pvc-card:hover .pvc-sheen { transform: translateX(30%); }
.pvc-ribbon { position: absolute; top: 14px; right: -34px; transform: rotate(35deg); width: 140px; text-align: center; padding: 4px 0; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 900; letter-spacing: .14em; box-shadow: 0 4px 10px rgba(0,0,0,.25); z-index: 2; }
.pvc-top, .pvc-mid, .pvc-no, .pvc-bot { position: relative; z-index: 1; }
.pvc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.pvc-brand { display: inline-flex; align-items: center; gap: 8px; }
.pvc-brand img { width: 26px; height: 26px; border-radius: 50%; background: #fff; padding: 2px; box-sizing: border-box; }
.pvc-brand span { display: flex; flex-direction: column; line-height: 1.1; }
.pvc-brand b { font-size: 13px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.pvc-brand small { font-size: 9.5px; font-weight: 700; letter-spacing: .06em; color: var(--ink2); }
.pvc-tag { font-style: normal; font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: 999px; background: rgba(255,255,255,.18); color: var(--ink); white-space: nowrap; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
.pvc.silver .pvc-tag { background: rgba(255,255,255,.6); }
.pvc-mid { display: flex; align-items: center; gap: 12px; }
.pvc-chip { position: relative; flex: none; width: 46px; height: 35px; border-radius: 7px; background: linear-gradient(135deg, #f7e2a3 0%, #d6a94a 45%, #f3d58c 70%, #b8862f 100%); box-shadow: inset 0 0 0 1px rgba(120,80,20,.45), 0 1px 2px rgba(0,0,0,.3); overflow: hidden; }
.pvc-chip i { position: absolute; background: rgba(120,80,20,.45); }
.pvc-chip i:nth-child(1) { left: 0; right: 0; top: 50%; height: 1px; }
.pvc-chip i:nth-child(2) { top: 0; bottom: 0; left: 33%; width: 1px; } .pvc-chip i:nth-child(3) { top: 0; bottom: 0; left: 66%; width: 1px; }
.pvc-nfc { flex: none; width: 26px; height: 26px; color: var(--ink2); transform: rotate(90deg) translateY(2px); }
.pvc-big { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; line-height: 1; }
.pvc-big b { font-size: clamp(30px, 7vw, 40px); font-weight: 800; letter-spacing: -.02em; text-shadow: 0 1px 0 rgba(0,0,0,.25), 0 -1px 0 rgba(255,255,255,.15); }
.pvc-big small { margin-top: 4px; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--ink2); }
.pvc-no { font-family: "OCR A Std", "Courier New", ui-monospace, monospace; font-size: clamp(15px, 3.6vw, 19px); letter-spacing: .18em; font-weight: 700; color: var(--ink);
  text-shadow: 0 1px 0 rgba(0,0,0,.35), 0 -1px 0 rgba(255,255,255,.25); }
.pvc.silver .pvc-no, .pvc.silver .pvc-big b { text-shadow: 0 1px 0 rgba(255,255,255,.8), 0 -1px 0 rgba(0,0,0,.15); }
.pvc-bot { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; }
.pvc-bot span { display: flex; flex-direction: column; min-width: 0; }
.pvc-bot span.r { align-items: flex-end; }
.pvc-bot small { font-size: 8.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--ink2); }
.pvc-bot b { font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
@media (hover: none) { .pvc-card { transform: none; } }
@media (prefers-reduced-motion: reduce) { .pvc-card, .pvc-sheen { transition: none; transform: none; } }
`;
