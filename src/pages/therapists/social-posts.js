import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import useTherapistStore from "../../store/therapistStore";
import { linkUrl } from "../../utils/my-link";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

// "Social posts": ready-made images for the therapist's own Instagram / WhatsApp, built from their
// photo, specialities and published reviews (client shown by initial only), with a caption to copy.
// Images: /api/social-card/<handle>/<kind>-<post|story>-<n>.png (utils/og-images.js socialCard).

const KINDS = [
  { key: "book", label: "Now taking sessions", hint: "Tell people you're open for sessions." },
  { key: "review", label: "Client review", hint: "Share kind words from a client (initial only)." },
  { key: "concern", label: "Speciality", hint: "Reach people who are going through it." },
];
const SIZES = [
  { key: "post", label: "Post", sub: "Instagram / Facebook · square" },
  { key: "story", label: "Story / Status", sub: "Instagram story · WhatsApp status" },
];
const tagOf = (s) => `#${String(s || "").replace(/&/g, "and").replace(/[^a-z0-9]+/gi, "").toLowerCase()}`;

function captionFor({ kind, name, role, posts, n, link }) {
  const first = String(name || "").trim().split(/\s+/)[0];
  const specs = (posts?.specialities || []).slice(0, 3);
  const base = ["#therapy", "#mentalhealth", "#psychologist", "#counselling", "#chooseyourtherapist"];
  if (kind === "review") {
    return `Grateful for these kind words from a client 💚\n\nIf you've been thinking about talking to someone, I'm here — online or in person.\n\nBook a session 👉 ${link}\n\n${base.join(" ")}`;
  }
  if (kind === "concern") {
    const tag = posts?.concerns?.[n % (posts?.concerns?.length || 1)] || "Therapy";
    return `${tag} can feel heavy — and you don't have to carry it alone.\n\nI'm ${name}${role ? `, ${role}` : ""}. I help people with ${tag.toLowerCase()} in a calm, private space — online or in person.\n\nBook a session 👉 ${link}\n\n${[tagOf(tag), ...base].join(" ")}`;
  }
  return `Now taking sessions 🌿\n\nI'm ${name}${role ? `, ${role}` : ""} on Choose Your Therapist.${specs.length ? ` I work with ${specs.join(", ").toLowerCase()}.` : ""} Sessions online & in person.\n\nBook here 👉 ${link}${first ? `\n— ${first}` : ""}\n\n${[...specs.map(tagOf), ...base].join(" ")}`;
}

export default function SocialPosts() {
  const { therapistInfo } = useTherapistStore();
  const [stats, setStats] = useState(null);
  const id = therapistInfo?._id || stats?.therapistId || null;
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState("");
  const [kind, setKind] = useState("book");
  const [size, setSize] = useState("post");
  const [n, setN] = useState(0);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { fetchById(`${apiUrl}/profile-stats/me`).then((r) => setStats(r?.status ? r.data : {})).catch(() => setStats({})); }, []);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/my-link?id=${id}`).then((r) => r.json()).then((j) => { if (j?.status) setInfo(j.data); else setErr("Couldn't load your posts. Please refresh."); })
      .catch(() => setErr("Couldn't load your posts. Please check your connection and refresh."));
  }, [id]);
  useEffect(() => {
    if (id) return undefined;
    const t = setTimeout(() => setErr("Couldn't load your profile. Please refresh the page — if it keeps happening, log out and back in."), 10000);
    return () => clearTimeout(t);
  }, [id]);

  const posts = info?.posts;
  const kinds = useMemo(() => KINDS.filter((k) => k.key !== "review" || (posts?.reviews || 0) > 0), [posts]);
  const count = kind === "review" ? posts?.reviews || 1 : kind === "concern" ? posts?.concerns?.length || 1 : 1;
  const h = info?.handle;
  const src = h ? `/api/social-card/${h}/${kind}-${size}-${n % count}.png` : "";
  const name = therapistInfo?.user?.name || "";
  const role = therapistInfo?.profile_type || "";
  const link = h ? linkUrl(h, size === "story" ? "wa" : "ig") : "";

  useEffect(() => { setN(0); }, [kind]);
  useEffect(() => { setLoaded(false); }, [src]);
  useEffect(() => { if (h) setCaption(captionFor({ kind, name, role, posts, n, link })); }, [kind, n, h, size]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = async () => {
    try { await navigator.clipboard.writeText(caption); } catch (e) { /* older browsers */ }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const share = async () => {
    if (!src) return;
    setBusy(true);
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], `CYT-${kind}-${size}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.clipboard.writeText(caption); } catch (e) { /* fine */ }
        await navigator.share({ files: [file], text: caption });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }
    } catch (e) { /* share sheet closed */ }
    setBusy(false);
  };

  return (
    <MainLayout>
      <Head><title>Social posts | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + SP_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Social posts</h1>
            <p>Ready-made posts with your photo and booking link — share them on Instagram and WhatsApp in a tap.</p>
          </div>
        </div>

        {err && <div className="pt-err">{err}</div>}
        {!info && !err && <div className="pt-skel spp-skel" />}
        {info && !info.live && (
          <div className="pt-card spp-off"><b>Your profile isn't live on the website yet</b><p>Your posts will appear here as soon as your profile is live.</p></div>
        )}

        {info?.live && (
          <div className="spp">
            <div className="spp-side">
              <div className="pt-card spp-card">
                <h2>1. Choose a post</h2>
                <div className="spp-kinds" role="tablist">
                  {kinds.map((k) => (
                    <button key={k.key} type="button" role="tab" aria-selected={kind === k.key} className={kind === k.key ? "on" : ""} onClick={() => setKind(k.key)}>
                      <b>{k.label}</b><span>{k.hint}</span>
                    </button>
                  ))}
                </div>
                <h2>2. Size</h2>
                <div className="spp-sizes">
                  {SIZES.map((s) => (
                    <button key={s.key} type="button" className={size === s.key ? "on" : ""} onClick={() => setSize(s.key)}><b>{s.label}</b><span>{s.sub}</span></button>
                  ))}
                </div>
              </div>
              <div className="pt-card spp-card">
                <h2>3. Caption</h2>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={8} aria-label="Caption" />
                <button type="button" className="spp-b line" onClick={copy}>{copied ? <><CheckRoundedIcon /> Copied</> : <><ContentCopyRoundedIcon /> Copy caption</>}</button>
              </div>
            </div>

            <div className="pt-card spp-card spp-preview">
              <div className={`spp-frame ${size}`}>
                {!loaded && <div className="pt-skel spp-imgskel" />}
                {src && <img key={src} src={src} alt="Your post" onLoad={() => setLoaded(true)} style={loaded ? undefined : { opacity: 0 }} />}
              </div>
              {count > 1 && (
                <div className="spp-nav">
                  <button type="button" onClick={() => setN((x) => (x - 1 + count) % count)} aria-label="Previous design"><ChevronLeftRoundedIcon /></button>
                  <span>{kind === "concern" ? posts?.concerns?.[n % count] : `Review ${(n % count) + 1}`} · {(n % count) + 1} of {count}</span>
                  <button type="button" onClick={() => setN((x) => (x + 1) % count)} aria-label="Next design"><ChevronRightRoundedIcon /></button>
                </div>
              )}
              <div className="spp-acts">
                <button type="button" className="spp-b gold" onClick={share} disabled={busy}><IosShareRoundedIcon /> {busy ? "Opening…" : "Share"}</button>
                <a className="spp-b line" href={`${src}?dl=1`} download><FileDownloadRoundedIcon /> Download</a>
              </div>
              <p className="spp-note">On your phone, Share opens Instagram / WhatsApp straight away — the caption is copied for you, just paste it.</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const SP_CSS = `
.spp-skel { height: 420px; border-radius: 18px; }
.spp-off { padding: 22px; }
.spp-off b { display: block; font-size: 16px; margin-bottom: 4px; }
.spp-off p { margin: 0; color: var(--mut); font-size: 14px; }
.spp { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 14px; align-items: start; }
.spp-side { display: grid; gap: 14px; min-width: 0; }
.spp-card { margin: 0; padding: 18px 20px; min-width: 0; }
.spp-card h2 { font-size: 14px; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.spp-card h2 + * { margin-bottom: 16px; }
.spp-kinds { display: grid; gap: 8px; }
.spp-kinds button, .spp-sizes button { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--line); background: #fff; cursor: pointer; font-family: inherit; }
.spp-kinds button b, .spp-sizes button b { font-size: 14px; color: var(--ink); }
.spp-kinds button span, .spp-sizes button span { font-size: 12.5px; color: var(--mut); }
.spp-kinds button.on, .spp-sizes button.on { border-color: #1e7a4c; background: #f0faf3; box-shadow: inset 3px 0 0 #e0ab45; }
.spp-sizes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.spp-card textarea { width: 100%; border: 1.5px solid var(--line); border-radius: 12px; padding: 10px 12px; font-size: 13.5px; line-height: 1.55; font-family: inherit; resize: vertical; color: var(--ink); margin-bottom: 10px; height: auto; }
.spp-card textarea:focus { outline: none; border-color: #1e7a4c; }
.spp-preview { display: flex; flex-direction: column; align-items: center; gap: 12px; position: sticky; top: 76px; }
.spp-frame { position: relative; width: 100%; max-width: 440px; border-radius: 16px; overflow: hidden; background: #eef3ef; box-shadow: 0 16px 36px -22px rgba(15,23,42,.45); }
.spp-frame.post { aspect-ratio: 1 / 1; }
.spp-frame.story { aspect-ratio: 9 / 16; max-width: 300px; }
.spp-frame img { display: block; width: 100%; height: 100%; object-fit: cover; transition: opacity .25s ease; }
.spp-imgskel { position: absolute; inset: 0; margin: 0; border-radius: 0; }
.spp-nav { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; color: #334155; }
.spp-nav button { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--line); background: #fff; display: grid; place-items: center; cursor: pointer; color: #166534; }
.spp-acts { display: flex; gap: 8px; width: 100%; max-width: 440px; }
.spp-acts .spp-b { flex: 1; }
.spp-b { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; padding: 0 16px; border-radius: 12px; font-size: 14px; font-weight: 800; border: 0; cursor: pointer; text-decoration: none !important; font-family: inherit; }
.spp-b svg { font-size: 18px; }
.spp-b.gold { background: linear-gradient(180deg, #f6d27a, #e3a83a); color: #1f2a14 !important; }
.spp-b.line { background: #fff; border: 1.5px solid #cfe3d6; color: #166534 !important; }
.spp-b:disabled { opacity: .7; }
.spp-note { margin: 0; font-size: 12.5px; color: var(--mut); text-align: center; max-width: 440px; }
@media (max-width: 1023px) {
  .spp { grid-template-columns: 1fr; }
  .spp-preview { position: static; order: -1; }
}
@media (max-width: 575px) {
  .spp-card { padding: 16px 14px; }
  .spp-sizes { grid-template-columns: 1fr; }
}
`;
