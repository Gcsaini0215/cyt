import React, { useState } from "react";

/* CYT wallet card — "Gold Debit" (owner's pick, 2026-11-20): brushed gold like a premium bank card, CYT green
   type, contactless (no chip — owner, 2026-11-20), a 16-digit number made from the account id, holder name, valid thru / member since
   and CYT's own leaf mark (never a card network's logo). The therapist card ("CYT Pro") is a member card that
   can be printed one day: name, profession, verified, member number, member since — nothing that changes day to
   day — and a back with a magnetic stripe and a QR to their profile (Flip). Purely visual, not a payment card. */

// 16 digits from an account id, in groups of 4
export const cardNo = (id) => {
  const hex = String(id || "").replace(/[^a-f0-9]/gi, "");
  let d = hex.split("").map((c) => parseInt(c, 16) % 10).join("");
  while (d.length < 16) d = `7${d}`;
  return d.slice(-16).replace(/(\d{4})(?=\d)/g, "$1 ");
};


// engraved watermark on the right of the card: a head in profile with a leaf growing inside (mind + growth),
// soft "calm" ripples behind it — like the security artwork on a bank card
const Watermark = () => (
  <svg className="gd-wm" viewBox="0 0 220 240" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      {[40, 58, 76, 94, 112].map((r) => <circle key={r} cx="112" cy="104" r={r} />)}
    </g>
    <path className="gd-wm-head" d="M150 240V196C170 176 182 141 178 106C172 51 130 19 92 23C58 27 40 56 44 89L30 117C28 121 31 124 36 124H42L40 135C39 139 42 141 46 142L45 151C44 161 50 169 62 171L76 173V240" />
    <path className="gd-wm-leaf" d="M112 150C112 128 112 108 113 92M112 120C92 112 82 92 88 76C104 82 114 100 112 120ZM113 104C130 96 142 76 136 60C120 66 110 84 113 104Z" />
  </svg>
);

/* label: "CYT Wallet" / "CYT Pro" · kind + kindSub: top-right ("Wallet" / "Prepaid sessions")
   number · name · sub (profession) · thruLabel + thru · balance (client) · back: { qr, link, memberId } */
export default function PvcCard({ label = "CYT Wallet", kind = "", kindSub = "", number = "", name = "", sub = "", thruLabel = "Valid thru", thru = "", balance = "", back = null, mark = true, children = null }) {
  const [flip, setFlip] = useState(false);
  const front = (
    <div className="gd-face gd-front">
      <Watermark />
      <div className="gd-top">
        <span className="gd-brand"><img className="gd-logo" src="/cyt-emblem.png" alt="" width="28" height="28" />{label ? <span><b>{label}</b><small>Choose Your Therapist</small></span> : <span><b className="gd-co">Choose Your Therapist</b></span>}</span>
        {kind && <span className="gd-kind"><b>{kind}</b>{kindSub && <small>{kindSub}</small>}</span>}
      </div>
      <div className="gd-mid">
        {balance && <span className="gd-bal"><small>Balance</small><b>{balance}</b></span>}
      </div>
      <div className="gd-no">{number}</div>
      <div className="gd-row">
        <span className="gd-who">
          <b>{name || "—"}</b>
          {sub && <em>{sub}</em>}
          {thru && <span className="gd-thru"><small>{thruLabel}</small>{thru}</span>}
        </span>
        {mark && <span className="gd-net" aria-hidden="true"><img className="gd-logo" src="/cyt-emblem.png" alt="" width="24" height="24" /><b>CYT</b></span>}
      </div>
    </div>
  );
  return (
    <div className="gd">
      <style>{GD_CSS}</style>
      {back ? (
        <>
          <div className={`gd-card gd-flip${flip ? " on" : ""}`} role="img" aria-label={`${label || "Choose Your Therapist"}${kind ? ` ${kind}` : ""} card`}>
            <div className="gd-inner">
              {front}
              <div className="gd-face gd-back">
                <div className="gd-mag" />
                <div className="gd-bk">
                  <span className="gd-qr">{back.qr ? <img src={back.qr} alt="QR code to my profile" width="120" height="120" /> : <i>QR</i>}</span>
                  <span className="gd-bk-t">
                    <b>Scan to view my profile &amp; book a session</b>
                    <span>Verified on Choose Your Therapist</span>
                    {back.link && <code>{back.link.replace(/^https?:\/\/(www\.)?/, "")}</code>}
                    {back.memberId && <span className="gd-id">{back.memberId}</span>}
                  </span>
                </div>
                <p className="gd-fine">This card belongs to Choose Your Therapist. If found, please hand it to the CYT team · chooseyourtherapist.in</p>
              </div>
            </div>
          </div>
          <button type="button" className="gd-fliptog" onClick={() => setFlip((x) => !x)}>{flip ? "↺ Show front" : "↻ Flip — see the back"}</button>
        </>
      ) : (
        <div className="gd-card" role="img" aria-label={`${label}${balance ? `: balance ${balance}` : ""}`}>{front}</div>
      )}
      {children}
    </div>
  );
}

const GD_CSS = `
.gd { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; }
.gd-card { position: relative; width: 100%; max-width: 440px; aspect-ratio: 1.586; border-radius: 18px; perspective: 1400px; }
.gd-face { position: absolute; inset: 0; border-radius: 18px; overflow: hidden; color: #2a1d06; padding: 16px 20px; box-sizing: border-box;
  display: grid; grid-template-rows: auto 1fr auto auto;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 2px, rgba(0,0,0,.03) 2px 4px), linear-gradient(135deg, #f6dc9f 0%, #d4a24c 45%, #f0d08a 70%, #b8862f 100%);
  box-shadow: 0 1px 0 rgba(255,255,255,.55) inset, 0 -1px 0 rgba(0,0,0,.2) inset, 0 24px 40px -24px rgba(60,40,0,.65), 0 8px 14px -10px rgba(0,0,0,.35); }
.gd-card:not(.gd-flip) .gd-face { position: relative; height: 100%; }
.gd-face::after { content: ""; position: absolute; inset: -40% -60%; background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,.35) 50%, transparent 58%); transform: translateX(-35%); transition: transform 1s ease; pointer-events: none; }
.gd-card:hover .gd-face::after { transform: translateX(35%); }
.gd-top, .gd-mid, .gd-no, .gd-row, .gd-bk, .gd-mag, .gd-fine { position: relative; z-index: 1; }
.gd-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.gd-brand { display: inline-flex; align-items: center; gap: 8px; color: #14532d; }
.gd-logo { flex: none; border-radius: 50%; background: #fff; padding: 2px; box-sizing: border-box; box-shadow: 0 1px 3px rgba(80,55,0,.35); }
.gd-brand .gd-logo { width: 28px; height: 28px; }
.gd-brand span { display: flex; flex-direction: column; line-height: 1.1; }
.gd-brand b { font-size: 12.5px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
.gd-brand b.gd-co { font-size: 14px; font-weight: 800; letter-spacing: .02em; text-transform: none; color: #14532d; }
.gd-brand small { font-size: 9.5px; font-weight: 700; letter-spacing: .05em; opacity: .8; }
.gd-kind { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex: none; }
.gd-kind b { display: inline-block; padding: 5px 11px 4px; border-radius: 8px; font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; line-height: 1.2; color: #f6dc9f;
  background: linear-gradient(160deg, #1f6e40 0%, #0d3b21 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.2), inset 0 0 0 1px rgba(246,220,159,.35), 0 3px 6px -2px rgba(60,40,0,.45); }
.gd-kind small { font-size: 9.5px; font-weight: 800; letter-spacing: .06em; color: #14532d; white-space: nowrap; }
.gd-wm { position: absolute; z-index: 0; right: -4%; top: 50%; height: 118%; width: auto; transform: translateY(-46%); color: #6b4c12; opacity: .2; pointer-events: none; }
.gd-wm-head { fill: rgba(255,255,255,.18); stroke: #6b4c12; stroke-width: 2.2; stroke-linejoin: round; }
.gd-wm-leaf { fill: rgba(20,83,45,.55); stroke: #14532d; stroke-width: 2.4; stroke-linecap: round; }
.gd-mid { display: flex; align-items: center; gap: 12px; }
.gd-chip { width: 42px; height: 32px; border-radius: 6px; flex: none; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #fbecc0 0%, #cfa64c 45%, #f6dc9f 70%, #a8802c 100%); box-shadow: inset 0 0 0 1px rgba(110,80,20,.5), 0 1px 2px rgba(0,0,0,.25); }
.gd-chip::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(110,80,20,.55); }
.gd-chip::after { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: rgba(110,80,20,.55); }
.gd-nfc { width: 22px; height: 22px; color: #5a4310; opacity: .75; transform: rotate(90deg); flex: none; }
.gd-bal { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; }
.gd-bal small { font-size: 8.5px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; opacity: .75; }
.gd-bal b { font-size: clamp(22px, 5.4vw, 28px); font-weight: 800; color: #14532d; letter-spacing: -.01em; }
.gd-no { font-family: "OCR A Std", "IBM Plex Mono", ui-monospace, "Courier New", monospace; font-size: clamp(15px, 3.8vw, 20px); font-weight: 700; letter-spacing: .14em; white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255,255,255,.8), 0 -1px 0 rgba(0,0,0,.2); }
.gd-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; margin-top: 4px; }
.gd-who { display: flex; flex-direction: column; min-width: 0; }
.gd-who b { font-size: 12.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
.gd-who em { font-style: normal; font-size: 10.5px; font-weight: 600; opacity: .85; }
.gd-thru { display: inline-flex; align-items: center; gap: 6px; font-family: ui-monospace, "Courier New", monospace; font-size: 12px; font-weight: 700; margin-top: 3px; }
.gd-thru small { font-family: inherit; width: 36px; font-size: 7.5px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; line-height: 1.05; opacity: .7; }
.gd-net { display: inline-flex; align-items: center; gap: 4px; color: #14532d; flex: none; }
.gd-net .gd-logo { width: 24px; height: 24px; }
.gd-net b { font-size: 15px; font-weight: 800; font-style: italic; letter-spacing: .06em; }
/* flip (therapist) */
.gd-inner { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .7s cubic-bezier(.3,.7,.2,1); }
.gd-flip.on .gd-inner { transform: rotateY(180deg); }
.gd-flip .gd-face { -webkit-backface-visibility: hidden; backface-visibility: hidden; transition: visibility 0s linear .32s; }
.gd-flip.on .gd-front, .gd-flip:not(.on) .gd-back { visibility: hidden; }
.gd-flip .gd-face::after { display: none; } /* the sheen layer ignored backface-visibility */
.gd-back { transform: rotateY(180deg); display: flex !important; flex-direction: column; justify-content: space-between; padding: 0 0 12px !important; }
.gd-mag { height: 34px; margin-top: 16px; background: linear-gradient(180deg, #1a1a1a, #2d2d2d 50%, #111); }
.gd-bk { flex: 1; display: flex; align-items: center; gap: 14px; padding: 10px 18px 0; min-width: 0; }
.gd-qr { flex: none; width: 34%; max-width: 116px; aspect-ratio: 1; background: #fff; border-radius: 10px; padding: 6px; box-sizing: border-box; display: grid; place-items: center; box-shadow: 0 4px 10px -6px rgba(0,0,0,.4); }
.gd-qr img { width: 100%; height: 100%; display: block; }
.gd-qr i { font-style: normal; font-size: 12px; font-weight: 800; color: #94a3b8; }
.gd-bk-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.gd-bk-t b { font-size: clamp(13px, 3vw, 16px); line-height: 1.2; color: #14532d; }
.gd-bk-t span { font-size: 11px; opacity: .85; }
.gd-bk-t code { font-family: ui-monospace, "Courier New", monospace; font-size: 10px; opacity: .85; overflow-wrap: anywhere; background: none; color: inherit; padding: 0; }
.gd-id { font-family: ui-monospace, "Courier New", monospace; font-size: 11px !important; letter-spacing: .12em; font-weight: 700; opacity: 1 !important; }
.gd-fine { margin: 0; padding: 0 18px; font-size: 8.5px; line-height: 1.35; opacity: .75; }
.gd-fliptog { margin-top: 10px; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid #e3d2a6; background: #fffaf0; color: #6b4f12; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.gd-fliptog:hover { background: #fbf1da; }
@media (prefers-reduced-motion: reduce) { .gd-inner, .gd-face::after { transition: none; } }
`;
