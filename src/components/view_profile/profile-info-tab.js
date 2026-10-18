import React, { useEffect } from "react";
import Link from "next/link";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { getValidServices } from "../../utils/helpers";
import { bookPath } from "../../utils/therapist-slug";
import { groupConcerns, approachLines } from "../../utils/concern-lines";

/* Profile tabs: Overview (about, what they help with, therapy approaches) · Fees · Availability.
   Same width and card style as the header card above (max 1180, 32px / 14px side padding). */

const TABS = [
  { id: 1, label: "Overview" },
  { id: 2, label: "Fees" },
  { id: 3, label: "Availability" },
];

const FORMAT = {
  video: { label: "Video call", Icon: VideocamRoundedIcon },
  audio: { label: "Voice call", Icon: CallRoundedIcon },
  "in-person": { label: "In-person", Icon: PlaceRoundedIcon },
};
const formatOf = (type) => {
  const k = String(type || "").toLowerCase();
  return FORMAT[k] || { label: k ? k.charAt(0).toUpperCase() + k.slice(1) : "Session", Icon: VideocamRoundedIcon };
};
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
// "01:00pm" → "1:00 PM"
const prettyTime = (t) => String(t || "").trim().replace(/^0(\d)/, "$1").replace(/\s*(am|pm)$/i, (m, p) => ` ${p.toUpperCase()}`);
// "Grief And Loss" → "Grief and Loss"
const tidy = (s) => s.replace(/\s+/g, " ").replace(/ (And|Or|Of|With|For|To|In) /g, (m, w) => ` ${w.toLowerCase()} `);
const splitList = (s) => [...new Set(String(s || "").split(",").map((x) => tidy(x.trim())).filter(Boolean))];

// therapy methods vs. the concerns a therapist helps with
const APPROACH_RE = /therap(y|ies)|\b(CBT|DBT|ACT|SFBT|IPT|EMDR|REBT|NLP|MBCT)\b|mindfulness|psychoanaly|hypno/i;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CONCERN_PREVIEW = 9; // 3 full rows on desktop
const APPROACH_PREVIEW = 6;

// Bullet lines with the keyword in bold. Every line stays in the HTML (search engines read it);
// lines past `preview` are only hidden with CSS until "more" is tapped.
function LineList({ groups, preview, open, gold = false }) {
  let n = 0;
  return (
    <div className={`pit-lines${open ? " open" : ""}${gold ? " gold" : ""}`}>
      {groups.map((g) => {
        const startsHidden = n >= preview;
        return (
          <div key={g.group} className={`pit-lg${startsHidden ? " pit-x" : ""}`}>
            {g.label && <h3>{g.label}</h3>}
            <ul>
              {g.items.map(({ keyword, line: [before, kw, after] }) => (
                <li key={keyword} className={n++ >= preview ? "pit-x" : undefined}>
                  {before}<strong>{kw}</strong>{after}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfileInfoTab({ pageData }) {
  const [tab, setTab] = React.useState(1);
  const [services, setServices] = React.useState();
  const [allConcerns, setAllConcerns] = React.useState(false);
  const [allApproaches, setAllApproaches] = React.useState(false);
  const [bioOpen, setBioOpen] = React.useState(false);
  const [today, setToday] = React.useState("");

  useEffect(() => {
    let alive = true;
    getValidServices(pageData.fees).then((s) => { if (alive) setServices(s); });
    return () => { alive = false; };
  }, [pageData]);

  // set after mount so the server and browser render the same HTML
  useEffect(() => { setToday(new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" })); }, []);

  const bio = String(pageData.user?.bio || "").replace(/<[^>]*>/g, "").trim();
  const longBio = bio.length > 700;
  const expertise = splitList(pageData.experties);
  const approaches = expertise.filter((s) => APPROACH_RE.test(s));
  const concerns = expertise.filter((s) => !APPROACH_RE.test(s));
  const firstName = (pageData.user?.name || "").replace(/^(dr|mr|ms|mrs)\.?\s+/i, "").split(" ")[0];
  const bookHref = bookPath(pageData);
  const allFees = (services || []).flatMap((v) => v.formats.map((x) => Number(x.fee) || 0)).filter((n) => n > 0);
  const minFee = allFees.length ? Math.min(...allFees) : null;
  // all seven days in order; a day the therapist has not set is "Closed"
  const byDay = Object.fromEntries((pageData.availabilities || []).map((d) => [String(d.day || "").trim().toLowerCase(), (d.times || []).filter((t) => t && t.open && t.close)]));
  const week = DAYS.map((day) => ({ day, times: byDay[day.toLowerCase()] || [] }));
  const openDays = week.filter((d) => d.times.length);

  return (
    <div className="pit">
      <style dangerouslySetInnerHTML={{ __html: PIT_CSS }} />
      <div className="pit-w">
        <div className="pit-tabbar" role="tablist" aria-label="Profile details">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
              className={`pit-tab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 1 && (
          <div className="pit-stack">
            {bio && (
              <section className="pit-card">
                <h2 className="pit-h">About</h2>
                <p className={`pit-bio therapist-bio${longBio && !bioOpen ? " clamp" : ""}`}>{bio}</p>
                {longBio && (
                  <button type="button" className="pit-more" onClick={() => setBioOpen((v) => !v)}>{bioOpen ? "Show less" : "Read more"}</button>
                )}
              </section>
            )}

            {expertise.length > 0 && (
              <section className="pit-card pastel">
                {concerns.length > 0 && (
                  <>
                    <h2 className="pit-h">{firstName ? `${firstName} helps with` : "Helps with"} <span className="pit-count">{concerns.length}</span></h2>
                    <LineList groups={groupConcerns(concerns)} preview={CONCERN_PREVIEW} open={allConcerns} />
                    {concerns.length > CONCERN_PREVIEW && (
                      <button type="button" className="pit-more" onClick={() => setAllConcerns((v) => !v)}>
                        {allConcerns ? "Show less" : `+ ${concerns.length - CONCERN_PREVIEW} more`}
                      </button>
                    )}
                  </>
                )}
                {approaches.length > 0 && (
                  <>
                    <h2 className={`pit-h${concerns.length ? " gap" : ""}`}>Therapy approaches <span className="pit-count">{approaches.length}</span></h2>
                    <LineList groups={approachLines(approaches)} preview={APPROACH_PREVIEW} open={allApproaches} gold />
                    {approaches.length > APPROACH_PREVIEW && (
                      <button type="button" className="pit-more" onClick={() => setAllApproaches((v) => !v)}>
                        {allApproaches ? "Show less" : `+ ${approaches.length - APPROACH_PREVIEW} more`}
                      </button>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}

        {tab === 2 && (
          <section className="pit-card pastel">
            <h2 className="pit-h">Session fees {minFee != null && <span className="pit-from">Starts at {inr(minFee)}</span>}</h2>
            {services && services.length > 0 ? (
              <>
                <div className={`pit-svcgrid${services.length > 1 ? " two" : ""}`}>
                  {services.map((svc) => (
                    <div key={svc._id || svc.name} className="pit-svc">
                      <h3>{svc.name}</h3>
                      <ul className="pit-rows">
                        {svc.formats.map((f) => {
                          const { label, Icon } = formatOf(f.type);
                          return (
                            <li key={f._id || f.type}>
                              {/* opens the booking page with this service + format already picked */}
                              <Link href={`${bookHref}?svc=${encodeURIComponent(svc.name)}&fmt=${encodeURIComponent(f.type)}`} className="pit-row-a">
                                <span className="pit-ic" aria-hidden="true"><Icon /></span>
                                <span className="pit-lbl">{label}</span>
                                <span className="pit-fee">{inr(f.fee)}<small> / session</small></span>
                                <span className="pit-go" aria-hidden="true">Book ›</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                <Link href={bookHref} className="pit-cta">Book a session</Link>
              </>
            ) : (
              <p className="pit-empty">{services ? "Fee details will be shared during booking." : "Loading fees…"}</p>
            )}
          </section>
        )}

        {tab === 3 && (
          <section className="pit-card pastel">
            <h2 className="pit-h">Weekly hours <small>Times in IST</small></h2>
            {openDays.length > 0 ? (
              <>
                <div className="pit-week">
                  {week.map((d) => (
                    <span key={d.day} className={`pit-wd${d.times.length ? " on" : ""}${today === d.day ? " now" : ""}`} title={d.times.length ? d.day : `${d.day}: closed`}>
                      {d.day.slice(0, 3)}
                    </span>
                  ))}
                  <span className="pit-wk-sum">{openDays.length === 7 ? "Open all 7 days" : `Open ${openDays.length} day${openDays.length === 1 ? "" : "s"} a week`}</span>
                </div>
                <ul className="pit-days">
                  {week.map((d) => (
                    <li key={d.day} className={`${today === d.day ? "today" : ""}${d.times.length ? "" : " closed"}`}>
                      <span className="pit-day">{d.day}{today === d.day && <em>Today</em>}</span>
                      <span className="pit-times">
                        {d.times.length
                          ? d.times.map((t, j) => <span key={j} className="pit-time">{prettyTime(t.open)} – {prettyTime(t.close)}</span>)
                          : <span className="pit-off">Closed</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={bookHref} className="pit-cta">See open slots &amp; book</Link>
              </>
            ) : (
              <p className="pit-empty">Please contact via chat to confirm current availability.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

const PIT_CSS = `
.pit { background: #fff; padding: 6px 0 8px; font-family: inherit; }
.pit-w { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
.pit-tabbar { display: flex; gap: 28px; overflow-x: auto; border-bottom: 1px solid #e4ece7; margin-bottom: 18px; scrollbar-width: none; }
.pit-tabbar::-webkit-scrollbar { display: none; }
.pit-tab { background: none; border: 0; border-bottom: 2.5px solid transparent; padding: 12px 2px; margin-bottom: -1px; cursor: pointer; white-space: nowrap;
  font-family: inherit; font-size: 15px; font-weight: 700; color: #64748b; transition: color .15s, border-color .15s; }
.pit-tab:hover { color: #0f3d24; }
.pit-tab.on { color: #0f3d24; border-bottom-color: #166534; }
.pit-stack { display: grid; gap: 16px; }
.pit-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 24px 26px; box-shadow: 0 1px 3px rgba(15,61,36,.05); }
.pit-h { font-family: inherit; font-size: 18px; font-weight: 800; color: #0f2a1d; margin: 0 0 12px; letter-spacing: -.1px; display: flex; align-items: baseline; gap: 10px; }
.pit-h.gap { margin-top: 22px; padding-top: 20px; border-top: 1px solid #eef2f0; }
/* "helps with" + "therapy approaches": soft mint fading to warm gold (green and gold bullets) */
.pit-card.pastel { background: linear-gradient(165deg, #f2faf3 0%, #fbf8e8 48%, #fbf1d3 100%); border-color: #eadfae; box-shadow: 0 4px 14px -6px rgba(176,134,30,.25); }
.pit-card.pastel .pit-h.gap { border-top: 1px dashed #e3d29c; }
.pit-card.pastel .pit-lg h3 { color: #4b6b58; }
.pit-card.pastel .pit-lg li { color: #3f5247; }
.pit-card.pastel .pit-count { background: #fffdf5; box-shadow: inset 0 0 0 1px #e6d59f; }
.pit-h small { font-size: 12.5px; font-weight: 600; color: #94a3b8; }
.pit-bio { font-size: 16px; line-height: 1.75; color: #334155; margin: 0; white-space: pre-line; text-align: left; }
.pit-bio.clamp { display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden; }
.pit-more { margin-top: 10px; background: none; border: 0; padding: 0; color: #166534; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
.pit-more:hover { text-decoration: underline; }
.pit-count { font-size: 12px; font-weight: 800; color: #166534; background: #ecfdf3; border-radius: 999px; padding: 1px 8px; }
.pit-lines { display: grid; gap: 14px; }
.pit-lg h3 { font-family: inherit; font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #64748b; margin: 0 0 6px; }
.pit-lg ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 24px; }
.pit-lg li { position: relative; margin: 0; padding: 5px 0 5px 16px; font-size: 14.5px; line-height: 1.5; color: #475569; }
.pit-lg li::before { content: ""; position: absolute; left: 2px; top: 13px; width: 6px; height: 6px; border-radius: 50%; background: #22a35a; }
.pit-lg li strong { color: #0f2a1d; font-weight: 800; }
.pit-lines:not(.open) .pit-x { display: none; }
.pit-lines.gold li::before { background: #d4a12f; }
.pit-from { font-size: 12.5px; font-weight: 800; color: #7a5a10; background: #fdf3d4; border: 1px solid #ecd49a; border-radius: 999px; padding: 3px 10px; }
.pit-svcgrid { display: grid; gap: 18px; margin-top: 16px; }
.pit-svcgrid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pit-rows { background: #fff; }
.pit-rows li { padding: 0 !important; }
.pit-row-a { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; padding: 12px 14px; color: inherit !important; text-decoration: none !important; transition: background .15s; }
.pit-row-a:hover { background: #f6fbf8; }
.pit-go { flex-shrink: 0; font-size: 12.5px; font-weight: 800; color: #166534; border: 1px solid #cfe6d8; border-radius: 999px; padding: 3px 10px; transition: background .15s, color .15s; }
.pit-row-a:hover .pit-go { background: #166534; color: #fff; border-color: #166534; }
.pit-week { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 14px; }
.pit-wd { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 800; background: #eef1ef; color: #94a3b8; }
.pit-wd.on { background: #166534; color: #fff; box-shadow: 0 3px 8px -3px rgba(22,101,52,.5); }
.pit-wd.now { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #d4a12f; }
.pit-wk-sum { margin-left: 6px; font-size: 13.5px; font-weight: 700; color: #4b6b58; }
.pit-days { background: #fff; }
.pit-days li.today { background: #fffaeb !important; box-shadow: inset 4px 0 0 #d4a12f; }
.pit-days li.closed .pit-day { color: #94a3b8; font-weight: 600; }
.pit-days li.today .pit-day em { background: #d4a12f; color: #3b2a05; }
.pit-svc h3 { font-family: inherit; font-size: 15px; font-weight: 800; color: #0f2a1d; margin: 0 0 8px; }
.pit-rows, .pit-days { list-style: none; margin: 0; padding: 0; border: 1px solid #e4ece7; border-radius: 12px; overflow: hidden; }
.pit-rows li { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin: 0; border-top: 1px solid #eef2f0; }
.pit-rows li:first-child, .pit-days li:first-child { border-top: 0; }
.pit-ic { flex: 0 0 34px; height: 34px; border-radius: 10px; background: #ecfdf3; color: #166534; display: grid; place-items: center; }
.pit-ic svg { font-size: 19px; }
.pit-lbl { flex: 1; font-size: 15px; font-weight: 600; color: #1e293b; }
.pit-fee { font-size: 16px; font-weight: 800; color: #0f2a1d; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pit-fee small { font-size: 12.5px; font-weight: 600; color: #94a3b8; }
.pit-days li { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin: 0; border-top: 1px solid #eef2f0; }
.pit-day { flex: 0 0 150px; font-size: 15px; font-weight: 700; color: #0f2a1d; display: flex; align-items: center; gap: 8px; }
.pit-day em { font-style: normal; font-size: 11px; font-weight: 800; color: #fff; background: #16a34a; border-radius: 999px; padding: 2px 8px; }
.pit-times { flex: 1; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.pit-time { white-space: nowrap; font-size: 13.5px; font-weight: 600; color: #166534; background: #ecfdf3; border: 1px solid #c6ecd5; border-radius: 8px; padding: 4px 10px; font-variant-numeric: tabular-nums; }
.pit-off { font-size: 13.5px; color: #94a3b8; }
.pit-cta { display: inline-flex; align-items: center; justify-content: center; margin-top: 16px; height: 44px; padding: 0 22px; border-radius: 10px; background: #0f3d24; color: #fff !important; font-size: 14.5px; font-weight: 800; text-decoration: none !important; transition: background .15s; }
.pit-cta:hover { background: #166534; }
.pit-empty { margin: 0; font-size: 14.5px; color: #64748b; }
@media (max-width: 1023px) { .pit-lg ul { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 380px) { .pit-lg li { font-size: 13px !important; } .pit-lg li strong { font-weight: 700; } }
@media (max-width: 599px) {
  .pit-w { padding: 0 14px; }
  .pit-tabbar { gap: 22px; margin-bottom: 14px; }
  .pit-tab { font-size: 14.5px; }
  .pit-stack { gap: 12px; }
  .pit-card { padding: 18px 16px; border-radius: 14px; }
  .pit-h { font-size: 17px; }
  .pit-bio { font-size: 15px; line-height: 1.7; }
  .pit-lg ul { grid-template-columns: 1fr; }
  /* one line each on a phone; a very narrow screen trims the end rather than wrapping */
  .pit-lg li { font-size: 14px; padding: 4px 0 4px 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pit-lg li::before { top: 12px; }
  .pit-rows li, .pit-days li { padding: 11px 12px; }
  .pit-svcgrid.two { grid-template-columns: 1fr; }
  .pit-row-a { padding: 11px 12px; gap: 10px; }
  .pit-go { font-size: 0; border: 0; padding: 0 2px; }
  .pit-go::after { content: "›"; font-size: 22px; font-weight: 700; color: #166534; line-height: 1; }
  .pit-row-a:hover .pit-go { background: none; }
  .pit-week { gap: 5px; }
  .pit-wd { width: 38px; height: 38px; font-size: 11px; }
  .pit-wk-sum { flex-basis: 100%; margin: 4px 0 0; font-size: 13px; }
  .pit-days li { align-items: flex-start; }
  .pit-day { flex-basis: 96px; font-size: 14px; flex-wrap: wrap; gap: 4px; padding-top: 3px; }
  .pit-time { font-size: 12.5px; padding: 3px 8px; }
  .pit-cta { width: 100%; }
}
`;
