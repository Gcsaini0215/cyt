import React, { useEffect, useState } from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import useTherapistStore from "../../store/therapistStore";
import { linkUrl } from "../../utils/my-link";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

// "My booking link": the therapist's short link (/t/<name>), one version per place they share it
// (so their insights show where people came from), their QR code and a printable "Scan to book" poster.

const PLACES = [
  { key: "ig", Icon: InstagramIcon, title: "Instagram bio", hint: "Paste it in your bio or a story link sticker." },
  { key: "wa", Icon: WhatsAppIcon, title: "WhatsApp", hint: "Send to clients, or add it to your WhatsApp Business profile." },
  { key: "card", Icon: BadgeRoundedIcon, title: "Visiting card / website", hint: "For your card, email signature, Google profile or website." },
];

function useCopy() {
  const [done, setDone] = useState("");
  const copy = async (key, value) => {
    try { await navigator.clipboard.writeText(value); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = value; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) { /* nothing else to try */ }
      ta.remove();
    }
    setDone(key); setTimeout(() => setDone(""), 2000);
  };
  return [done, copy];
}

export default function MyLink() {
  const { therapistInfo } = useTherapistStore();
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState(null);
  const [done, copy] = useCopy();
  // the profile id comes with the therapist's profile; the insights call also carries it (a fallback
  // for an older API that left the id out)
  const id = therapistInfo?._id || stats?.therapistId || null;

  useEffect(() => {
    fetchById(`${apiUrl}/profile-stats/me`).then((r) => { if (r?.status) setStats(r.data); else setStats({}); }).catch(() => setStats({}));
  }, []);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/my-link?id=${id}`).then((r) => r.json()).then((j) => { if (j?.status) setInfo(j.data); else setErr("Couldn't load your link. Please refresh."); })
      .catch(() => setErr("Couldn't load your link. Please check your connection and refresh."));
  }, [id]);
  // nothing to go on after a while: say so instead of loading for ever
  useEffect(() => {
    if (id) return undefined;
    const t = setTimeout(() => setErr("Couldn't load your profile. Please refresh the page — if it keeps happening, log out and back in."), 10000);
    return () => clearTimeout(t);
  }, [id]);

  const h = info?.handle;
  const url = h ? linkUrl(h) : "";
  const first = String(therapistInfo?.user?.name || "").trim().split(/\s+/)[0];
  const waText = h ? `Hi! You can book a session with me here: ${linkUrl(h, "wa")}${first ? `\n- ${first}` : ""}` : "";
  const share = async () => {
    if (!h) return;
    try { if (navigator.share) { await navigator.share({ title: "Book a session with me", url: linkUrl(h, "card") }); return; } } catch (e) { return; }
    copy("main", url);
  };
  const src = stats?.sources || null;
  const fromLink = src ? src.mylink || 0 : null;
  const fromQr = src ? src.qr || 0 : null;

  return (
    <MainLayout>
      <Head><title>My booking link | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + ML_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>My booking link</h1>
            <p>Your own short link and QR code — share them anywhere and clients land straight on your profile to book.</p>
          </div>
        </div>

        {err && <div className="pt-err">{err}</div>}
        {!info && !err && <div className="pt-skel ml-skel" />}

        {info && !info.live && (
          <div className="pt-card ml-off">
            <b>Your profile isn't live on the website yet</b>
            <p>Your booking link and QR code will appear here as soon as your profile is live.</p>
          </div>
        )}

        {info?.live && (
          <>
            <section className="ml-hero">
              <span className="ml-hero-ic"><LinkRoundedIcon /></span>
              <div className="ml-hero-t">
                <em>Your booking link</em>
                <a href={url} target="_blank" rel="noopener noreferrer" className="ml-url">{url.replace("https://www.", "")}</a>
              </div>
              <div className="ml-hero-acts">
                <button type="button" className="ml-b gold" onClick={() => copy("main", url)}>{done === "main" ? <><CheckRoundedIcon /> Copied</> : <><ContentCopyRoundedIcon /> Copy link</>}</button>
                <button type="button" className="ml-b ghost" onClick={share}><IosShareRoundedIcon /> Share</button>
                <a className="ml-b ghost" href={url} target="_blank" rel="noopener noreferrer"><OpenInNewRoundedIcon /> Open</a>
              </div>
            </section>

            <div className="ml-grid">
              <section className="pt-card ml-card">
                <h2>Share it everywhere</h2>
                <p className="ml-sub">Each place has its own link, so you can see below which one brings people.</p>
                {PLACES.map(({ key, Icon, title, hint }) => {
                  const u = linkUrl(h, key);
                  return (
                    <div key={key} className={`ml-row ml-p-${key}`}>
                      <span className="ml-row-ic"><Icon /></span>
                      <div className="ml-row-t"><b>{title}</b><span>{hint}</span><code>{u.replace("https://www.", "")}</code></div>
                      <div className="ml-row-acts">
                        {key === "wa" && <a className="ml-b wa sm" href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Send</a>}
                        <button type="button" className="ml-b line sm" onClick={() => copy(key, u)}>{done === key ? <><CheckRoundedIcon /> Copied</> : <><ContentCopyRoundedIcon /> Copy</>}</button>
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="pt-card ml-card ml-qr">
                <h2><QrCode2RoundedIcon /> QR code &amp; poster</h2>
                <p className="ml-sub">Put the poster at your clinic desk or door — clients scan it to book.</p>
                <div className="ml-qr-body">
                  <a href={`/api/my-poster/${h}.png`} target="_blank" rel="noopener noreferrer" className="ml-poster" title="Open the poster">
                    <img src={`/api/my-poster/${h}.png`} alt="Your Scan to book poster" width="248" height="351" loading="lazy" />
                  </a>
                  <div className="ml-qr-side">
                    <img className="ml-qr-img" src={`/api/my-qr/${h}.png`} alt="QR code for your booking link" width="140" height="140" loading="lazy" />
                    <a className="ml-b line sm" href={`/api/my-qr/${h}.png?dl=1`} download><FileDownloadRoundedIcon /> Download QR</a>
                    <a className="ml-b line sm" href={`/api/my-poster/${h}.png?dl=1`} download><FileDownloadRoundedIcon /> Download poster</a>
                    <button type="button" className="ml-b gold sm" onClick={() => {
                      const w = window.open("", "_blank");
                      if (!w) return;
                      w.document.write(`<!doctype html><title>Poster</title><style>@page{size:A4;margin:0}html,body{margin:0}img{width:100%;display:block}</style><img src="${window.location.origin}/api/my-poster/${h}.png" onload="setTimeout(function(){print()},300)">`);
                      w.document.close();
                    }}><PrintRoundedIcon /> Print poster</button>
                  </div>
                </div>
              </section>
            </div>

            <section className="pt-card ml-card">
              <h2>Who came from your link · last 30 days</h2>
              {stats?.locked ? (
                <p className="ml-sub">These numbers show while your plan is active.</p>
              ) : (
                <div className="ml-stats">
                  <div><b>{fromLink ?? "…"}</b><span>from your link</span></div>
                  <div><b>{fromQr ?? "…"}</b><span>from your QR code</span></div>
                  <div><b>{stats?.totals?.views ?? "…"}</b><span>profile views in all</span></div>
                </div>
              )}
              <p className="ml-tip">Tip: add the link to your Instagram bio and WhatsApp Business profile today — it takes a minute and works for you every day.</p>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
}

const ML_CSS = `
.ml-skel { height: 140px; border-radius: 18px; }
.ml-off { padding: 22px; }
.ml-off b { display: block; font-size: 16px; margin-bottom: 4px; }
.ml-off p { margin: 0; color: var(--mut); font-size: 14px; }
.ml-hero { position: relative; overflow: hidden; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 22px 24px; border-radius: 20px; margin-bottom: 14px;
  background: radial-gradient(120% 140% at 100% 0%, #1f7a4a 0%, #135c37 45%, #0b3f26 100%); color: #fff; box-shadow: 0 18px 36px -22px rgba(11,63,38,.7); }
.ml-hero::after { content: ""; position: absolute; width: 260px; height: 260px; right: -90px; top: -120px; border-radius: 50%; background: radial-gradient(circle, rgba(242,201,76,.35), rgba(242,201,76,0) 65%); pointer-events: none; }
.ml-hero-ic { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; background: rgba(242,201,76,.16); border: 1px solid rgba(242,201,76,.4); color: #f6d58a; flex-shrink: 0; }
.ml-hero-ic svg { font-size: 28px; }
.ml-hero-t { flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 4px; position: relative; z-index: 1; }
.ml-hero-t em { font-style: normal; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #f6d58a; }
.ml-url { font-size: clamp(18px, 2.4vw, 24px); font-weight: 800; color: #fff !important; text-decoration: none !important; overflow-wrap: anywhere; }
.ml-hero-acts { display: flex; gap: 8px; flex-wrap: wrap; position: relative; z-index: 1; }
.ml-b { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 42px; padding: 0 16px; border-radius: 12px; font-size: 14px; font-weight: 800; border: 0; cursor: pointer; text-decoration: none !important; font-family: inherit; white-space: nowrap; }
.ml-b svg { font-size: 18px; }
.ml-b.sm { height: 36px; padding: 0 12px; font-size: 13px; border-radius: 10px; }
.ml-b.gold { background: linear-gradient(180deg, #f6d27a, #e3a83a); color: #1f2a14 !important; }
.ml-b.ghost { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.28); color: #fff !important; }
.ml-b.line { background: #fff; border: 1.5px solid #cfe3d6; color: #166534 !important; }
.ml-b.line:hover { border-color: #166534; }
.ml-b.wa { background: #25d366; color: #fff !important; }
.ml-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 14px; margin-bottom: 14px; }
.ml-card { margin: 0; padding: 18px 20px; }
.ml-card h2 { display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 800; color: var(--ink); margin: 0 0 4px; }
.ml-card h2 svg { font-size: 20px; color: #1e7a4c; }
.ml-sub { font-size: 13px; color: var(--mut); margin: 0 0 12px; }
.ml-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--line); }
.ml-row-ic { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
.ml-p-ig .ml-row-ic { background: #fdf0f5; color: #c13584; }
.ml-p-wa .ml-row-ic { background: #e9f9ef; color: #128c4b; }

.ml-p-card .ml-row-ic { background: #fdf7ea; color: #a86e0e; }
.ml-row-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ml-row-t b { font-size: 14px; color: var(--ink); }
.ml-row-t span { font-size: 12.5px; color: var(--mut); }
.ml-row-t code { font-size: 12px; color: #1e7a4c; background: #f3f8f4; border-radius: 6px; padding: 2px 6px; margin-top: 4px; width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ml-row-acts { display: flex; gap: 6px; flex-shrink: 0; }
.ml-qr-body { display: flex; gap: 16px; align-items: flex-start; }
.ml-poster { flex-shrink: 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 10px 24px -16px rgba(15,23,42,.4); background: #fbf8f0; }
.ml-poster img { display: block; width: 180px; height: auto; }
.ml-qr-side { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.ml-qr-img { width: 120px; height: 120px; border-radius: 10px; border: 1px solid var(--line); background: #fff; padding: 6px; }
.ml-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 6px 0 10px; }
.ml-stats div { background: #f3f8f4; border-radius: 14px; padding: 14px 10px; text-align: center; }
.ml-stats b { display: block; font-size: 26px; font-weight: 800; color: #135c37; }
.ml-stats span { font-size: 12.5px; color: var(--mut); }
.ml-tip { margin: 0; font-size: 13px; color: #6b5a3a; background: #fdf7ea; border: 1px solid #f0dfba; border-radius: 10px; padding: 9px 12px; }
@media (max-width: 1023px) { .ml-grid { grid-template-columns: 1fr; } }
@media (max-width: 575px) {
  .ml-hero { padding: 18px 16px; }
  .ml-hero-acts { width: 100%; }
  .ml-hero-acts .ml-b { flex: 1; padding: 0 10px; }
  .ml-row { flex-wrap: wrap; }
  .ml-row-t { flex-basis: calc(100% - 52px); }
  .ml-row-acts { width: 100%; padding-left: 52px; }
  .ml-row-acts .ml-b { flex: 1; }
  .ml-qr-body { flex-direction: column; align-items: center; }
  .ml-poster img { width: 220px; }
  .ml-qr-side { width: 100%; }
  .ml-qr-img { align-self: center; }
  .ml-stats b { font-size: 22px; }
}
`;
