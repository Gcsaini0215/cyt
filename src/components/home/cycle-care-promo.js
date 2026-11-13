import React, { useMemo, useState } from "react";
import Link from "next/link";
import { cycleArtSvg } from "../../utils/cycle-art";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

/* "Cycle & Mood Care" introduction — the home page section and the top of /cycle-mood-care.
   Start → the client portal page (/client/cycle; login first). Share → the phone's share sheet with the
   /cycle-mood-care link (its share card: /api/og/cycle-care.jpg), else WhatsApp / copy link. */

export const CYCLE_URL = "https://www.chooseyourtherapist.in/cycle-mood-care";
const SHARE_TEXT = "Track your period and mood privately — and get support for PMS, PMDD, period pain and PCOS. Free on Choose Your Therapist 💗";

const BENEFITS = [
  { Icon: WaterDropRoundedIcon, t: "Know what's coming", s: "Your phase and next period, worked out from what you log." },
  { Icon: InsightsRoundedIcon, t: "See your mood pattern", s: "Spot PMS early — how you feel in each part of your cycle." },
  { Icon: VolunteerActivismRoundedIcon, t: "Get support when it's heavy", s: "Women therapists who understand PMS, PMDD and PCOS." },
  { Icon: LockRoundedIcon, t: "Private to you", s: "Nobody else sees it. Delete everything in one tap." },
];

export function useShareCycle() {
  const [msg, setMsg] = useState("");
  const share = async () => {
    const data = { title: "Cycle & Mood Care — Choose Your Therapist", text: SHARE_TEXT, url: CYCLE_URL };
    try {
      if (navigator.share) { await navigator.share(data); return; }
    } catch (e) { if (e?.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(`${SHARE_TEXT}\n${CYCLE_URL}`); setMsg("Link copied — paste it anywhere"); }
    catch (e) { window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT}\n${CYCLE_URL}`)}`, "_blank", "noopener"); }
    setTimeout(() => setMsg(""), 3000);
  };
  return { share, msg };
}

export default function CycleCarePromo({ as = "section", heading = "h2" }) {
  const art = useMemo(() => cycleArtSvg({ size: 520 }), []);
  const { share, msg } = useShareCycle();
  const Tag = as;
  const H = heading;
  return (
    <Tag className="ccp" aria-labelledby="ccp-title">
      <style dangerouslySetInnerHTML={{ __html: CCP_CSS }} />
      <div className="container ccp-in">
        <div className="ccp-text">
          <span className="ccp-kicker"><SpaRoundedIcon /> New · For women · <em>FREE</em></span>
          <H id="ccp-title">Your cycle. Your mood. <span>Your care.</span></H>
          <p className="ccp-lead">PMS, PMDD, period pain and PCOS can change how you feel — not just your body. Track your period and mood privately, and get support from a therapist when it gets heavy.</p>
          <ul className="ccp-ben">
            {BENEFITS.map(({ Icon, t, s }) => (
              <li key={t}><span><Icon /></span><div><b>{t}</b><small>{s}</small></div></li>
            ))}
          </ul>
          <div className="ccp-acts">
            <Link href="/client/cycle" className="ccp-btn">Start tracking — free <ArrowForwardRoundedIcon /></Link>
            <button type="button" className="ccp-btn line" onClick={share}><IosShareRoundedIcon /> Share with a friend</button>
          </div>
          {msg ? <p className="ccp-msg"><CheckRoundedIcon /> {msg}</p> : <p className="ccp-note">Not medical advice. Your data stays private to you.</p>}
        </div>
        <div className="ccp-art">
          <div className="ccp-svg" dangerouslySetInnerHTML={{ __html: art }} />
          <span className="ccp-chip a"><i className="r" />Day 14 · Ovulation (est.)</span>
          <span className="ccp-chip b"><i className="g" />Next period in 14 days</span>
          <span className="ccp-chip c">🙂 Mood: Good</span>
        </div>
      </div>
    </Tag>
  );
}

const CCP_CSS = `
.ccp { position: relative; overflow: hidden; padding: clamp(48px, 7vw, 88px) 0; background: radial-gradient(90% 80% at 100% 0%, #ffe1e9 0%, rgba(255,225,233,0) 60%), radial-gradient(60% 70% at 0% 100%, #fff1e3 0%, rgba(255,241,227,0) 60%), #fff8fa; }
.ccp-in { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(24px, 4vw, 56px); align-items: center; }
.ccp-kicker { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; background: #fde2ea; color: #a3173f; font-size: 13px; font-weight: 800; letter-spacing: .02em; }
.ccp-kicker svg { font-size: 18px; }
.ccp-kicker em { font-style: normal; padding: 1px 8px; border-radius: 999px; background: #d63a62; color: #fff; }
.ccp-text h2, .ccp-text h1 { margin: 14px 0 12px; font-size: clamp(30px, 4.2vw, 50px); line-height: 1.08; font-weight: 800; letter-spacing: -.03em; color: #2a0b17; }
.ccp-text h2 span, .ccp-text h1 span { color: #d63a62; }
.ccp-lead { margin: 0 0 20px; font-size: clamp(15.5px, 1.4vw, 17.5px); line-height: 1.6; color: #4b3a41; max-width: 560px; }
.ccp-ben { list-style: none; margin: 0 0 24px; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.ccp-ben li { margin: 0 !important; display: flex; gap: 12px; align-items: flex-start; padding: 14px; border-radius: 18px; background: #fff; border: 1px solid #f7dbe3; box-shadow: 0 10px 24px -20px rgba(142,31,71,.5); }
.ccp-ben li > span { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex: none; color: #fff; background: linear-gradient(160deg, #f0668a, #c22d58); box-shadow: 0 6px 14px -6px rgba(194,45,88,.7); }
.ccp-ben li:nth-child(2) > span { background: linear-gradient(160deg, #b98cff, #6a3fd6); box-shadow: 0 6px 14px -6px rgba(106,63,214,.6); }
.ccp-ben li:nth-child(3) > span { background: linear-gradient(160deg, #4fd38b, #12804a); box-shadow: 0 6px 14px -6px rgba(18,128,74,.6); }
.ccp-ben li:nth-child(4) > span { background: linear-gradient(160deg, #ffc65a, #f07b12); box-shadow: 0 6px 14px -6px rgba(240,123,18,.6); }
.ccp-ben li > span svg { font-size: 22px; }
.ccp-ben b { display: block; font-size: 15px; color: #2a0b17; }
.ccp-ben small { display: block; font-size: 13px; color: #6b5a61; line-height: 1.45; margin-top: 2px; }
.ccp-acts { display: flex; flex-wrap: wrap; gap: 12px; }
.ccp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 52px; padding: 0 22px; border-radius: 14px; border: 0; cursor: pointer; font: inherit; font-size: 15.5px; font-weight: 800;
  background: linear-gradient(160deg, #f0668a, #c22d58); color: #fff !important; text-decoration: none !important; box-shadow: 0 14px 26px -14px rgba(194,45,88,.9); transition: transform .15s ease; }
.ccp-btn:hover { transform: translateY(-2px); }
.ccp-btn svg { font-size: 20px; }
.ccp-btn.line { background: #fff; color: #a3173f !important; border: 1.5px solid #f3b3c4; box-shadow: none; }
.ccp-note, .ccp-msg { margin: 12px 0 0; font-size: 12.5px; color: #8b7880; }
.ccp-msg { display: inline-flex; align-items: center; gap: 4px; color: #15803d; font-weight: 800; }
.ccp-msg svg { font-size: 17px; }
.ccp-art { position: relative; max-width: 520px; width: 100%; justify-self: center; }
.ccp-svg svg { display: block; width: 100%; height: auto; }
.ccp-chip { position: absolute; display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; border-radius: 999px; background: #fff; font-size: 13.5px; font-weight: 800; color: #2a0b17; white-space: nowrap;
  box-shadow: 0 14px 30px -14px rgba(142,31,71,.55); animation: ccpFloat 4.5s ease-in-out infinite; }
.ccp-chip i { width: 10px; height: 10px; border-radius: 50%; } .ccp-chip i.r { background: #7c5ce0; } .ccp-chip i.g { background: #1e9e64; }
.ccp-chip.a { top: 7%; left: -2%; }
.ccp-chip.b { top: 22%; right: -3%; animation-delay: -1.5s; }
.ccp-chip.c { bottom: 4%; left: 30%; animation-delay: -3s; }
@keyframes ccpFloat { 50% { transform: translateY(-8px); } }
@media (prefers-reduced-motion: reduce) { .ccp-chip { animation: none; } }
@media (max-width: 991px) {
  .ccp-in { grid-template-columns: minmax(0, 1fr); }
  .ccp-art { order: -1; max-width: 420px; }
}
@media (max-width: 575px) {
  .ccp-ben { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  .ccp-acts .ccp-btn { flex: 1 1 100%; }
  .ccp-art { max-width: 340px; }
  .ccp-chip { font-size: 12px; padding: 7px 11px; }
  .ccp-chip.a { left: 0; } .ccp-chip.b { right: 0; }
}
`;
