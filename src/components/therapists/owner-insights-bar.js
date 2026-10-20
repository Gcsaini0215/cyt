import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getDecodedToken } from "../../utils/jwt";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { useLiveNow, LiveBadge, LIVE_CSS } from "./dashboard/profile-insights";

/* Shown only to the therapist looking at their own public profile (visitors never see it):
   last-30-day views, profile strength and the next thing to improve. */
export default function OwnerInsightsBar({ ownerUserId }) {
  const [data, setData] = useState(null);
  const liveNow = useLiveNow(data?.liveNow || 0, !!data);

  useEffect(() => {
    const me = getDecodedToken();
    if (!me || me.role !== 1 || !ownerUserId || String(me.userId) !== String(ownerUserId)) return;
    fetchById(`${apiUrl}/profile-stats/me`).then((r) => { if (r?.status && r.data?.totals) setData(r.data); }).catch(() => {});
  }, [ownerUserId]);

  if (!data) return null;
  const tip = data.strength?.tips?.[0];
  const score = data.strength?.score ?? 0;
  return (
    <div className="oib" role="note">
      <style dangerouslySetInnerHTML={{ __html: CSS + LIVE_CSS }} />
      <div className="oib-in">
        <span className="oib-eye"><i className="feather-eye" aria-hidden="true" /> Only you can see this</span>
        <span className="oib-n"><b>{data.totals?.views || 0}</b> profile views · last 30 days</span>
        <LiveBadge n={liveNow} />
        <span className="oib-s">
          <span className="oib-bar"><i style={{ width: `${score}%` }} /></span>
          Profile strength <b>{score}%</b>
        </span>
        {tip && <Link href={tip.href} className="oib-tip">{tip.cta} →</Link>}
        <Link href="/therapist-dashboard#profile-insights" className="oib-go">See insights</Link>
      </div>
    </div>
  );
}

const CSS = `
.oib { background: #14532d; color: #e8f5ec; font-size: 13px; }
.oib-in { max-width: 1380px; margin: 0 auto; padding: 8px 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 18px; box-sizing: border-box; }
.oib-eye { display: inline-flex; align-items: center; gap: 6px; color: #ecc77d; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
.oib-n b, .oib-s b { color: #fff; }
.oib-s { display: inline-flex; align-items: center; gap: 8px; }
.oib-bar { width: 70px; height: 6px; border-radius: 99px; background: rgba(255,255,255,.2); overflow: hidden; }
.oib-bar i { display: block; height: 100%; background: #ecc77d; border-radius: 99px; }
.oib-tip { color: #ecc77d !important; font-weight: 800; text-decoration: none !important; }
.oib-go { margin-left: auto; color: #14532d !important; background: #ecc77d; border-radius: 8px; padding: 4px 12px; font-weight: 800; text-decoration: none !important; }
@media (max-width: 600px) { .oib-in { gap: 4px 12px; } .oib-go { margin-left: 0; } }
`;
