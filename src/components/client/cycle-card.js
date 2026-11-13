import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { cycleState, PHASES, niceDay } from "../../utils/cycle";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

/* My Space card for Cycle & Mood Care (pages/client/cycle.js):
   switched on → today's phase + next period · not asked yet → an invite ("Is this for me?")
   (shown to everyone as "New" — the page itself asks who it is for). */

export const CYCLE_FLAG = "cyt_cycle";
export const CYCLE_EVENT = "cyt-cycle";
export function setCycleFlag(on) {
  try { localStorage.setItem(CYCLE_FLAG, on ? "on" : "off"); } catch (e) { /* storage blocked */ }
  try { window.dispatchEvent(new Event(CYCLE_EVENT)); } catch (e) { /* old browser */ }
}

export default function CycleCard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    fetchById(`${apiUrl}/my-cycle`, { lite: 1 }).then((r) => { if (r?.status) { setD(r.data); setCycleFlag(!!r.data?.profile?.enabled); } }).catch(() => {});
  }, []);
  if (!d) return null;
  const p = d.profile;

  if (p?.enabled) {
    const st = cycleState(p, d.logs || {});
    const ph = st?.phase ? PHASES[st.phase] : null;
    return (
      <Link href="/client/cycle" className="cyc on" style={ph ? { "--ph": ph.color, "--ph-soft": ph.soft } : undefined}>
        <span className="cyc-ic"><SpaRoundedIcon /></span>
        <div className="cyc-t">
          <small>Cycle &amp; Mood{ph ? ` · ${ph.name}` : ""}</small>
          <b>{!st?.start ? "Log your period to begin" : st.late ? `Period ${st.late} day${st.late === 1 ? "" : "s"} late` : st.phase === "menstrual" ? `Period · day ${st.day}` : `Next period in ${st.inDays} day${st.inDays === 1 ? "" : "s"}`}</b>
          <span>{st?.start ? `Day ${st.day} of your cycle · next ~${niceDay(st.next)}` : "Tap when your period starts"}</span>
        </div>
        <span className="cyc-go">Log today <ArrowForwardRoundedIcon /></span>
      </Link>
    );
  }
  return (
    <div className="cyc invite">
      <span className="cyc-ic"><SpaRoundedIcon /></span>
      <div className="cyc-t">
        <small>New · For women</small>
        <b>Cycle &amp; Mood Care</b>
        <span>Track your period and mood — and get support when PMS, PMDD or PCOS weigh on you. Private to you.</span>
      </div>
      <Link href="/client/cycle" className="cyc-go">{d.gender === "Female" ? "Set it up" : "Is this for me?"} <ArrowForwardRoundedIcon /></Link>
    </div>
  );
}

export const CYC_CSS = `
.cyc { position: relative; display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 20px; text-decoration: none !important; color: #0f172a !important; min-width: 0;
  background: radial-gradient(120% 160% at 100% 0%, #ffd6e0 0%, rgba(255,214,224,0) 55%), linear-gradient(135deg, #fff5f8, #fff); border: 1px solid #f9d5df;
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 12px 26px -20px rgba(214,58,98,.55); }
.cyc.on { background: radial-gradient(120% 160% at 100% 0%, var(--ph-soft, #fde8ee) 0%, rgba(255,255,255,0) 60%), #fff; border-color: #ecdfe3; }
.cyc-ic { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; flex: none; color: #fff;
  background: linear-gradient(160deg, #f0668a, #d63a62); box-shadow: 0 8px 16px -8px rgba(214,58,98,.8); }
.cyc.on .cyc-ic { background: var(--ph, #e5476b); }
.cyc-ic svg { font-size: 26px; }
.cyc-t { flex: 1; min-width: 0; display: grid; gap: 1px; }
.cyc-t small { font-size: 11.5px; font-weight: 800; letter-spacing: .03em; color: #c0264f; text-transform: uppercase; }
.cyc.on .cyc-t small { color: var(--ph, #c0264f); }
.cyc-t b { font-size: 16.5px; font-weight: 800; }
.cyc-t span { font-size: 13px; color: #64748b; line-height: 1.4; }
.cyc-go { flex: none; display: inline-flex; align-items: center; gap: 4px; height: 40px; padding: 0 14px; border-radius: 12px; font-size: 13.5px; font-weight: 800;
  background: linear-gradient(160deg, #f0668a, #d63a62); color: #fff !important; text-decoration: none !important; box-shadow: 0 8px 16px -10px rgba(214,58,98,.9); }
.cyc.on .cyc-go { background: var(--ph, #d63a62); }
.cyc-go svg { font-size: 17px; }
.cyc-x { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; border: 0; background: rgba(255,255,255,.8); color: #94a3b8; display: grid; place-items: center; cursor: pointer; }
.cyc-x svg { font-size: 17px; }
@media (max-width: 699px) {
  .cyc { flex-wrap: wrap; padding: 14px; }
  .cyc-go { width: 100%; justify-content: center; }
}
`;
