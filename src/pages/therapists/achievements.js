import React, { useEffect, useState } from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import useTherapistStore from "../../store/therapistStore";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* Achievements: what the therapist has earned on CYT (sessions, reviews of 4★+, time on CYT), progress to the
   rest, and a certificate for each unlocked one — download it, share it, and anyone can verify it from its code. */

const SITE = "https://www.chooseyourtherapist.in";
const TIER = { bronze: "#b8763b", silver: "#8c99a6", gold: "#c9962c", platinum: "#1e7a4c" };
const day = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const UNIT = { sessions: "sessions", goodReviews: "reviews of 4★+", months: "months on CYT" };

export default function Achievements() {
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [view, setView] = useState(null); // { src, title, code? }

  useEffect(() => { if (!therapistInfo?.user?.name) fetchTherapistInfo(); }, [therapistInfo?.user?.name, fetchTherapistInfo]);
  useEffect(() => {
    fetchById(`${apiUrl}/therapist/achievements`)
      .then((r) => (r?.status ? setData(r.data) : setErr(r?.message || "Couldn't load your achievements.")))
      .catch(() => setErr("Couldn't load your achievements — check your connection."));
  }, []);
  useEffect(() => {
    if (!view) return undefined;
    const k = (e) => { if (e.key === "Escape") setView(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [view]);

  const name = therapistInfo?.user?.name || "";
  const list = data?.list || [];
  const won = list.filter((a) => a.unlocked);
  const s = data?.stats;

  return (
    <MainLayout>
      <Head><title>Achievements | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + AC_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Achievements</h1>
            <p>Earn certificates from your sessions and 4★+ reviews on CYT. Each one has a code anyone can verify.</p>
          </div>
        </div>
        {err && <div className="pt-err">{err}</div>}

        {s && (
          <div className="ac-stats">
            <div><b>{won.length}<i>/{list.length}</i></b><span>unlocked</span></div>
            <div><b>{s.sessions}</b><span>sessions completed</span></div>
            <div><b>{s.goodReviews}</b><span>reviews of 4★+</span></div>
            <div><b>{s.avgRating ? `${s.avgRating.toFixed(1)}★` : "—"}</b><span>average rating</span></div>
          </div>
        )}

        {data?.level && (
          <div className="ac-level">
            <div className="ac-level-now">
              <span>Your share of each session</span>
              <b>{data.level.therapistPct}%</b>
              <small>CYT keeps {data.level.platformPct}% · {data.level.level}</small>
            </div>
            <div className="ac-level-body">
              {data.level.ratingHold
                ? <p className="warn">Your average rating is under 4★, so CYT&apos;s share is back to 30% for now. {data.level.next?.needs?.[0]} and your better share comes back.</p>
                : data.level.next
                  ? <p>Next: <b>you keep {100 - data.level.next.pct}%</b> once you have {data.level.next.needs.join(" and ")}.</p>
                  : <p>You&apos;re at the top level — CYT keeps only {data.level.minPlatformPct}%.</p>}
              <ol className="ac-ladder">
                {[["30%", "To start"], ["25%", "Rising Star + 25 Sessions"], ["20%", "+ 100 Sessions + Client Favourite"], ["15%", "All achievements"], ["−2% / 100 sessions", "After that, down to 7%"]].map(([pct, need]) => (
                  <li key={pct}><b>CYT {pct}</b><span>{need}</span></li>
                ))}
              </ol>
              <small>Each session keeps the share it was completed at. Average rating under 4★ → back to 30% until it&apos;s 4★ again.</small>
            </div>
          </div>
        )}

        {data === null && !err ? <div className="ac-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="ac-skel" />)}</div> : (
          <div className="ac-grid">
            {list.map((a) => {
              const pct = Math.round(a.progress * 100);
              const left = Math.max(0, a.goal - a.value);
              return (
                <div key={a.key} className={`ac-card${a.unlocked ? " on" : ""}`} style={{ "--t": TIER[a.tier] || TIER.gold }}>
                  <div className="ac-top">
                    <span className="ac-medal">{a.unlocked ? <EmojiEventsRoundedIcon /> : <LockRoundedIcon />}</span>
                    <span className="ac-tier">{a.tier}</span>
                  </div>
                  <b className="ac-title">{a.title}</b>
                  <p className="ac-line">{a.line.replace(/^for /, "").replace(/^./, (c) => c.toUpperCase())}{a.minAvg ? ` (average ${a.minAvg}★ or higher)` : ""}.</p>
                  {a.unlocked ? (
                    <>
                      <span className="ac-date">Unlocked {day(a.unlockedAt)} · {a.code}</span>
                      <div className="ac-acts">
                        <button type="button" className="pt-btn primary" onClick={() => setView({ src: `/api/certificate/${a.code}.png`, title: a.title, code: a.code })}><VisibilityRoundedIcon /> Certificate</button>
                        <a className="pt-btn outline" href={`/api/certificate/${a.code}.png?download=1`} download><DownloadRoundedIcon /> Download</a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ac-bar" aria-label={`${pct}% done`}><i style={{ width: `${pct}%` }} /></div>
                      <span className="ac-prog">{a.value} / {a.goal} {UNIT[a.metric]}{left ? ` · ${left} to go` : a.minAvg ? ` · needs ${a.minAvg}★ average` : ""}</span>
                      <button type="button" className="ac-peek" onClick={() => setView({ src: `/api/certificate/sample-${a.key}.png${name ? `?name=${encodeURIComponent(name)}` : ""}`, title: `${a.title} — sample` })}>See the certificate</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="ac-foot">Achievements count your completed sessions on CYT and reviews from your clients. Once unlocked, a certificate stays yours.</p>
      </div>

      {view && (
        <div className="ac-ov" onClick={(e) => { if (e.target === e.currentTarget) setView(null); }}>
          <div className="ac-dlg" role="dialog" aria-modal="true" aria-label={view.title}>
            <div className="ac-dlg-h"><b>{view.title}</b><button type="button" onClick={() => setView(null)} aria-label="Close"><CloseRoundedIcon /></button></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={view.src} alt={`${view.title} certificate`} />
            {view.code && (
              <div className="ac-dlg-acts">
                <a className="pt-btn primary" href={`${view.src}?download=1`} download><DownloadRoundedIcon /> Download</a>
                <a className="pt-btn outline" target="_blank" rel="noopener noreferrer"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE}/verify-achievement/${view.code}`)}`}><LinkedInIcon /> Share on LinkedIn</a>
                <a className="pt-link" href={`/verify-achievement/${view.code}`} target="_blank" rel="noopener noreferrer">Verification page →</a>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

const AC_CSS = `
.ac-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.ac-stats > div { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
.ac-stats b { display: block; font-size: 22px; font-weight: 800; color: var(--g-dk); } .ac-stats b i { font-style: normal; font-size: 14px; color: var(--faint); }
.ac-stats span { font-size: 12px; color: var(--mut); }
.ac-level { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 14px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px; margin-bottom: 14px; }
.ac-level-now { background: linear-gradient(160deg, #14532d, #1e7a4c); color: #fff; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: center; }
.ac-level-now span { font-size: 12px; opacity: .85; } .ac-level-now b { font-size: 40px; font-weight: 900; line-height: 1.1; } .ac-level-now small { font-size: 12.5px; opacity: .9; }
.ac-level-body p { margin: 0 0 10px; font-size: 14px; color: var(--ink); } .ac-level-body p.warn { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px 10px; }
.ac-ladder { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.ac-ladder li { border: 1px solid var(--line); border-radius: 10px; padding: 6px 10px; font-size: 12px; background: #fbfdfb; }
.ac-ladder b { display: block; color: var(--g-dk); font-size: 12.5px; } .ac-ladder span { color: var(--mut); }
.ac-level-body small { font-size: 11.5px; color: var(--faint); }
@media (max-width: 700px) { .ac-level { grid-template-columns: 1fr; } }
.ac-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 12px; }
.ac-skel { height: 200px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0,#f7f9f8,#eef2f0); background-size: 400px 100%; animation: acSh 1.2s infinite linear; }
@keyframes acSh { from { background-position: -200px 0; } to { background-position: 200px 0; } }
.ac-card { position: relative; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; }
.ac-card.on { border-color: color-mix(in srgb, var(--t) 45%, #fff); background: linear-gradient(160deg, color-mix(in srgb, var(--t) 12%, #fff) 0%, #fff 55%); }
.ac-top { display: flex; align-items: center; justify-content: space-between; }
.ac-medal { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: #f1f5f9; color: #94a3b8; }
.ac-card.on .ac-medal { background: var(--t); color: #fff; box-shadow: 0 8px 18px -10px var(--t); }
.ac-medal svg { font-size: 24px; }
.ac-tier { font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--t); }
.ac-title { font-size: 16.5px; font-weight: 800; color: var(--ink); }
.ac-line { margin: 0; font-size: 12.5px; color: var(--mut); line-height: 1.5; flex: 1; }
.ac-bar { height: 7px; border-radius: 99px; background: #eef2f0; overflow: hidden; } .ac-bar i { display: block; height: 100%; background: var(--t); border-radius: 99px; }
.ac-prog, .ac-date { font-size: 12px; font-weight: 700; color: var(--mut); }
.ac-date { color: var(--g); }
.ac-acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
.ac-acts .pt-btn { height: 36px; font-size: 13px; }
.ac-peek { align-self: flex-start; border: 0; background: none; padding: 0; font: inherit; font-size: 12.5px; font-weight: 700; color: var(--g); cursor: pointer; text-decoration: underline; }
.ac-foot { font-size: 12px; color: var(--faint); margin: 14px 2px 0; }
.ac-ov { position: fixed; inset: 0; z-index: 2000; background: rgba(15,23,42,.6); display: flex; align-items: center; justify-content: center; padding: 16px; }
.ac-dlg { background: #fff; border-radius: 16px; max-width: 980px; width: 100%; max-height: 92vh; overflow: auto; padding: 12px; }
.ac-dlg-h { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 10px; }
.ac-dlg-h b { font-size: 15px; } .ac-dlg-h button { border: 0; background: #f1f5f9; border-radius: 9px; width: 34px; height: 34px; display: grid; place-items: center; cursor: pointer; }
.ac-dlg img { display: block; width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--line); }
.ac-dlg-acts { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 12px 4px 4px; }
@media (max-width: 700px) { .ac-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;
