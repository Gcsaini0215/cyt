import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchById } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";

/* Dashboard "Profile insights": how the public profile is doing (last 30 days vs the 30 before),
   where views come from, the search → profile → book funnel, and profile strength with the next
   things to fix. Plan rules: a running package or "free · live" = everything; expired / not live =
   headline numbers only (locked). A package ending within 7 days shows a renew note with the numbers. */

const SRC = [
  ["google", "Google search", "#1e7a4c"], ["directory", "Therapist directory", "#2f9a63"], ["home", "Home page", "#d4a24c"],
  ["city", "City & topic pages", "#7bb38f"], ["blog", "Blogs", "#e7c27d"], ["social", "WhatsApp / social", "#5b8f74"],
  ["direct", "Direct / bookmarked", "#a3c9b1"], ["other", "Other", "#cdd9d1"],
];
const pctChange = (now, before) => {
  if (!before) return now ? { text: "new", up: true } : null;
  const p = Math.round(((now - before) / before) * 100);
  return { text: `${p >= 0 ? "+" : ""}${p}%`, up: p >= 0 };
};
const fmtDay = (d) => new Date(`${d}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function Trend({ t }) {
  if (!t) return null;
  return <span className={`pi-trend ${t.up ? "up" : "down"}`}>{t.up ? "▲" : "▼"} {t.text}</span>;
}

function AreaChart({ daily }) {
  const W = 600, H = 140, P = 6;
  const max = Math.max(4, ...daily.map((d) => d.views));
  const x = (i) => P + (i * (W - 2 * P)) / Math.max(1, daily.length - 1);
  const y = (v) => H - P - (v / max) * (H - 2 * P - 10);
  const line = daily.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.views).toFixed(1)}`).join(" ");
  const area = `${line} L${x(daily.length - 1)},${H - P} L${x(0)},${H - P} Z`;
  return (
    <div className="pi-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Profile views per day, last 30 days">
        <defs>
          <linearGradient id="piFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1e7a4c" stopOpacity=".28" />
            <stop offset="100%" stopColor="#1e7a4c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#eef2ef" strokeWidth="1" />)}
        <path d={area} fill="url(#piFill)" />
        <path d={line} fill="none" stroke="#1e7a4c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {daily.map((d, i) => (
          <rect key={d.day} x={x(i) - (W / daily.length) / 2} y="0" width={W / daily.length} height={H} fill="transparent">
            <title>{`${fmtDay(d.day)}: ${d.views} view${d.views === 1 ? "" : "s"}, ${d.visitors} visitor${d.visitors === 1 ? "" : "s"}`}</title>
          </rect>
        ))}
      </svg>
      <div className="pi-axis"><span>{fmtDay(daily[0].day)}</span><span>{fmtDay(daily[14].day)}</span><span>Today</span></div>
    </div>
  );
}

function Ring({ value }) {
  const r = 30, c = 2 * Math.PI * r;
  const tone = value >= 80 ? "#1e7a4c" : value >= 50 ? "#d4a24c" : "#c2410c";
  return (
    <svg className="pi-ring" viewBox="0 0 76 76" aria-hidden="true">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#eef2ef" strokeWidth="8" />
      <circle cx="38" cy="38" r={r} fill="none" stroke={tone} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 38 38)" />
      <text x="38" y="43" textAnchor="middle" fontSize="17" fontWeight="800" fill="#13261c">{value}%</text>
    </svg>
  );
}

export default function ProfileInsights() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetchById(`${apiUrl}/profile-stats/me`).then((r) => (r?.status ? setD(r.data) : setErr(true))).catch(() => setErr(true));
  }, []);

  const sources = useMemo(() => {
    if (!d?.sources) return [];
    const total = Object.values(d.sources).reduce((a, b) => a + b, 0);
    return SRC.map(([k, label, color]) => ({ k, label, color, n: d.sources[k] || 0, pct: total ? Math.round(((d.sources[k] || 0) / total) * 100) : 0 }))
      .filter((s) => s.n > 0).sort((a, b) => b.n - a.n);
  }, [d]);

  if (err) return null;
  if (!d) return <section id="profile-insights" className="pi pi-load"><style dangerouslySetInnerHTML={{ __html: CSS }} /><div className="pi-skel" /></section>;

  const t = d.totals;
  const plan = d.plan || {};
  const renewSoon = plan.status === "active" && plan.daysLeft <= 7;
  const a = d.actions || {};

  return (
    <section id="profile-insights" className="pi" aria-labelledby="pi-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pi-head">
        <div>
          <h2 id="pi-title">Profile insights</h2>
          <p>How your public profile did in the last 30 days{d.trackingSince ? ` · counting since ${fmtDay(d.trackingSince)}` : ""}</p>
        </div>
        <Link href={`/view-profile/${d.therapistId}`} className="pi-view">View my profile ↗</Link>
      </div>

      {renewSoon && (
        <div className="pi-renew">
          <span>Your plan ends in <b>{plan.daysLeft} day{plan.daysLeft === 1 ? "" : "s"}</b>. In the last 30 days your profile got <b>{t.views} views</b>{a.book ? <> and <b>{a.book} booking clicks</b></> : null} — renew to stay listed.</span>
          <Link href="/my-plans">Renew plan</Link>
        </div>
      )}

      <div className="pi-kpis">
        <div className="pi-kpi">
          <span>Profile views</span>
          <b>{t.views.toLocaleString("en-IN")}</b>
          <Trend t={pctChange(t.views, t.prevViews)} />
        </div>
        <div className="pi-kpi">
          <span>Different visitors</span>
          <b>{t.visitors.toLocaleString("en-IN")}</b>
          <Trend t={pctChange(t.visitors, t.prevVisitors)} />
        </div>
        <div className={`pi-kpi${d.locked ? " lock" : ""}`}>
          <span>Shown in search</span>
          <b>{d.locked ? "•••" : (a.impressions || 0).toLocaleString("en-IN")}</b>
          {!d.locked && <Trend t={pctChange(a.impressions || 0, a.prevImpressions || 0)} />}
        </div>
        <div className={`pi-kpi${d.locked ? " lock" : ""}`}>
          <span>Booking clicks</span>
          <b>{d.locked ? "•••" : (a.book || 0).toLocaleString("en-IN")}</b>
          {!d.locked && <Trend t={pctChange(a.book || 0, a.prevBook || 0)} />}
        </div>
      </div>

      {d.locked ? (
        <div className="pi-locked">
          <div className="pi-locked-blur" aria-hidden="true"><div className="pi-fake-chart" /><div className="pi-fake-bars"><i /><i /><i /></div></div>
          <div className="pi-locked-msg">
            <b>{plan.status === "none" ? "Go live to see the full picture" : "Your plan has ended"}</b>
            <span>{plan.status === "none"
              ? "Once your profile is live you'll see daily views, where visitors come from and how many tap Book."
              : `Your profile was still viewed ${t.views} time${t.views === 1 ? "" : "s"} in the last 30 days. Renew to see where they come from and how many tap Book — and to stay listed.`}</span>
            <Link href="/my-plans">{plan.status === "none" ? "See plans" : "Renew plan"}</Link>
          </div>
        </div>
      ) : (
        <div className="pi-grid">
          <div className="pi-box">
            <div className="pi-box-h"><b>Daily views</b><span>last 30 days · hover a day</span></div>
            {d.daily?.length ? <AreaChart daily={d.daily} /> : null}
          </div>
          <div className="pi-box">
            <div className="pi-box-h"><b>Where views come from</b></div>
            {sources.length ? (
              <ul className="pi-src">
                {sources.map((s) => (
                  <li key={s.k}>
                    <span className="pi-src-l">{s.label}</span>
                    <span className="pi-src-bar"><i style={{ width: `${Math.max(4, s.pct)}%`, background: s.color }} /></span>
                    <span className="pi-src-n">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            ) : <p className="pi-empty">No views yet — share your profile link with clients and on social media.</p>}
            <div className="pi-funnel" aria-label="From search to booking">
              <div><b>{(a.impressions || 0).toLocaleString("en-IN")}</b><span>shown in search</span></div>
              <i aria-hidden="true">→</i>
              <div><b>{t.views.toLocaleString("en-IN")}</b><span>opened profile</span></div>
              <i aria-hidden="true">→</i>
              <div><b>{(a.book || 0).toLocaleString("en-IN")}</b><span>tapped Book</span></div>
            </div>
          </div>
        </div>
      )}

      {d.strength && (
        <div className="pi-strength">
          <Ring value={d.strength.score} />
          <div className="pi-st-body">
            <b>Profile strength</b>
            <span>{d.strength.score >= 100 ? "Your profile is complete — great work." : "Complete profiles get more views and bookings. Next steps:"}</span>
            {d.strength.tips?.length > 0 && (
              <ul>
                {d.strength.tips.slice(0, 3).map((tip) => (
                  <li key={tip.key}><span>{tip.tip}</span><Link href={tip.href}>{tip.cta} →</Link></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const CSS = `
.pi { background: #fff; border: 1px solid #e6ece8; border-radius: 18px; box-shadow: 0 1px 2px rgba(16,24,40,.04); padding: 18px 20px 20px; scroll-margin-top: 90px; }
.pi-load { min-height: 220px; }
.pi-skel { height: 200px; border-radius: 14px; background: linear-gradient(90deg, #f3f6f4, #fafcfb, #f3f6f4); background-size: 200% 100%; animation: piSk 1.4s infinite; }
@keyframes piSk { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.pi-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.pi-head h2 { margin: 0; font-size: 17px; font-weight: 800; color: #13261c; }
.pi-head p { margin: 2px 0 0; padding: 0; font-size: 12.5px; color: #6b7c72; }
.pi-view { flex-shrink: 0; font-size: 13px; font-weight: 800; color: #1e7a4c !important; text-decoration: none !important; border: 1px solid #cfe3d6; border-radius: 999px; padding: 5px 12px; }
.pi-renew { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; padding: 12px 14px; border-radius: 12px; background: #fff8e8; border: 1px solid #f0d9a4; font-size: 13.5px; color: #5b4a2a; }
.pi-renew b { color: #13261c; }
.pi-renew a { flex-shrink: 0; background: #14532d; color: #fff !important; font-weight: 800; font-size: 13px; padding: 7px 14px; border-radius: 10px; text-decoration: none !important; }

.pi-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.pi-kpi { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: 14px; background: #f6faf7; border: 1px solid #e8efea; }
.pi-kpi > span { font-size: 12px; font-weight: 700; color: #5b6b62; }
.pi-kpi > b { font-size: 24px; font-weight: 900; color: #13261c; line-height: 1.15; }
.pi-kpi.lock > b { color: #b9c5bd; letter-spacing: 2px; }
.pi-trend { align-self: flex-start; font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 1px 7px; }
.pi-trend.up { color: #166534; background: #dcfce7; }
.pi-trend.down { color: #b91c1c; background: #fee2e2; }

.pi-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 12px; margin-top: 12px; }
.pi-box { border: 1px solid #e8efea; border-radius: 14px; padding: 12px 14px; min-width: 0; display: flex; flex-direction: column; }
.pi-box-h { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.pi-box-h b { font-size: 13.5px; color: #13261c; }
.pi-box-h span { font-size: 11.5px; color: #8a948f; }
.pi-chart { flex: 1; display: flex; flex-direction: column; }
.pi-chart svg { display: block; width: 100%; flex: 1; min-height: 150px; }
.pi-axis { display: flex; justify-content: space-between; font-size: 11px; color: #8a948f; margin-top: 4px; }
.pi-src { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.pi-src li { display: grid; grid-template-columns: 130px minmax(0, 1fr) 38px; align-items: center; gap: 8px; margin: 0; padding: 0; font-size: 12.5px; }
.pi-src li::before { content: none; }
.pi-src-l { color: #334155; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pi-src-bar { height: 8px; border-radius: 99px; background: #f0f4f1; overflow: hidden; }
.pi-src-bar i { display: block; height: 100%; border-radius: 99px; }
.pi-src-n { text-align: right; font-weight: 800; color: #13261c; }
.pi-empty { margin: 0; padding: 0; font-size: 13px; color: #6b7c72; }
.pi-funnel { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e3ebe6; }
.pi-funnel div { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; }
.pi-funnel b { font-size: 18px; font-weight: 900; color: #13261c; }
.pi-funnel span { font-size: 11px; color: #6b7c72; }
.pi-funnel i { font-style: normal; color: #d4a24c; font-weight: 800; }

.pi-locked { position: relative; margin-top: 12px; border-radius: 14px; overflow: hidden; border: 1px solid #e8efea; min-height: 190px; }
.pi-locked-blur { position: absolute; inset: 0; filter: blur(6px); opacity: .55; padding: 16px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
.pi-fake-chart { border-radius: 10px; background: linear-gradient(180deg, rgba(30,122,76,.25), rgba(30,122,76,0)); clip-path: polygon(0 80%, 15% 60%, 30% 70%, 45% 40%, 60% 50%, 75% 25%, 90% 35%, 100% 15%, 100% 100%, 0 100%); }
.pi-fake-bars { display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.pi-fake-bars i { display: block; height: 10px; border-radius: 99px; background: #1e7a4c; opacity: .4; }
.pi-fake-bars i:nth-child(2) { width: 70%; } .pi-fake-bars i:nth-child(3) { width: 40%; }
.pi-locked-msg { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 6px; min-height: 190px; padding: 18px; background: rgba(255,255,255,.55); }
.pi-locked-msg b { font-size: 16px; color: #13261c; }
.pi-locked-msg span { max-width: 460px; font-size: 13.5px; line-height: 1.55; color: #475569; }
.pi-locked-msg a { margin-top: 6px; background: #ecc77d; color: #14532d !important; font-weight: 800; font-size: 13.5px; padding: 8px 18px; border-radius: 10px; text-decoration: none !important; }

.pi-strength { display: flex; gap: 16px; align-items: flex-start; margin-top: 12px; padding: 14px; border-radius: 14px; background: linear-gradient(135deg, #f1f8f3, #fbf4e3); border: 1px solid #e8e1cc; }
.pi-ring { width: 76px; height: 76px; flex-shrink: 0; }
.pi-st-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.pi-st-body > b { font-size: 14.5px; color: #13261c; }
.pi-st-body > span { font-size: 12.5px; color: #5b6560; }
.pi-st-body ul { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pi-st-body li { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.75); font-size: 13px; color: #334155; }
.pi-st-body li::before { content: none; }
.pi-st-body li a { flex-shrink: 0; font-weight: 800; color: #1e7a4c !important; text-decoration: none !important; white-space: nowrap; }

@media (max-width: 900px) {
  .pi-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pi-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .pi { padding: 14px; border-radius: 16px; }
  .pi-head { flex-direction: column; }
  .pi-kpi > b { font-size: 21px; }
  .pi-src li { grid-template-columns: minmax(0, 1fr) 34px; gap: 3px 8px; }
  .pi-src-l { grid-column: 1 / -1; }
  .pi-src-bar { grid-column: 1; }
  .pi-strength { flex-direction: column; align-items: stretch; }
  .pi-ring { align-self: center; }
  .pi-st-body li { flex-direction: column; align-items: flex-start; gap: 4px; }
  .pi-locked-blur { grid-template-columns: 1fr; }
}
`;
