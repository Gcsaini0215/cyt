import React, { useEffect, useState } from "react";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* "My check-ins": the client's daily mood from My Space over the last 30 days, with the average of
   each week. Moods are saved with the account (/my-moods). Nothing shows until there is a mood. */

const TZ = "Asia/Kolkata";
const istDay = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const FACE = ["", "😞", "😕", "😐", "🙂", "😄"];
const LABEL = ["", "Low", "Meh", "Okay", "Good", "Great"];

export default function MoodMonth() {
  const [moods, setMoods] = useState(null);
  useEffect(() => {
    fetchById(`${apiUrl}/my-moods`, { days: 30 }).then((r) => setMoods(r?.status ? r.data || {} : {})).catch(() => setMoods({}));
  }, []);
  if (!moods || !Object.keys(moods).length) return null;

  const now = Date.now();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000);
    return { k: istDay(d), d, v: moods[istDay(d)] || 0 };
  });
  const logged = days.filter((x) => x.v);
  const avg = (list) => (list.length ? list.reduce((n, x) => n + x.v, 0) / list.length : 0);
  const thisWeek = avg(days.slice(-7).filter((x) => x.v));
  const lastWeek = avg(days.slice(-14, -7).filter((x) => x.v));
  const trend = thisWeek && lastWeek ? thisWeek - lastWeek : 0;

  return (
    <section className="mm" id="mood" aria-labelledby="mm-h">
      <style dangerouslySetInnerHTML={{ __html: MM_CSS }} />
      <div className="mm-h">
        <h2 id="mm-h">Your mood · last 30 days</h2>
        <span>{logged.length} day{logged.length === 1 ? "" : "s"} logged{thisWeek ? ` · this week ${FACE[Math.round(thisWeek)]} ${LABEL[Math.round(thisWeek)]}` : ""}
          {trend >= 0.5 ? " · better than last week" : trend <= -0.5 ? " · lower than last week" : ""}</span>
      </div>
      <div className="mm-bars" role="img" aria-label={`Mood on ${logged.length} of the last 30 days`}>
        {days.map((x) => (
          <span key={x.k} title={`${x.d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: TZ })}${x.v ? ` · ${LABEL[x.v]}` : ""}`}>
            <i className={x.v ? `m${x.v}` : ""} style={{ height: x.v ? `${x.v * 20}%` : undefined }} />
          </span>
        ))}
      </div>
      <div className="mm-axis"><span>{days[0].d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: TZ })}</span><span>Today</span></div>
      {trend <= -0.5 && <p className="mm-note">Rough patch? Talking it through in your next session can help.</p>}
    </section>
  );
}

const MM_CSS = `
.mm { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; margin-bottom: 18px; }
.mm-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.mm-h h2 { margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.mm-h span { font-size: 12.5px; color: #64748b; }
.mm-bars { display: flex; align-items: flex-end; gap: 3px; height: 72px; }
.mm-bars span { flex: 1; height: 100%; display: flex; align-items: flex-end; background: #f6f8f7; border-radius: 4px; }
.mm-bars i { display: block; width: 100%; border-radius: 4px; }
.mm-bars i.m1 { background: #f87171; } .mm-bars i.m2 { background: #fb923c; } .mm-bars i.m3 { background: #facc15; } .mm-bars i.m4 { background: #4ade80; } .mm-bars i.m5 { background: #16a34a; }
.mm-axis { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 4px; }
.mm-note { margin: 8px 0 0; font-size: 12.5px; color: #7c2d12; }
`;
