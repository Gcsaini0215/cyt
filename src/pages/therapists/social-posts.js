import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { getToken } from "../../utils/jwt";
import useTherapistStore from "../../store/therapistStore";
import { linkUrl } from "../../utils/my-link";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";

// "Social posts": one tweet-style image — the therapist's photo, name, green tick and their own short
// line (max 280 characters) with their booking link. Made by POST /api/tweet-card (utils/og-images.js tweetCard).

const MAX = 280;
// colour themes (made in utils/og-images.js TWEET_THEMES — same keys)
const THEMES = [
  { k: "forest", label: "Forest", c: "linear-gradient(135deg, #7fd3a0, #14663d 55%, #073620)" },
  { k: "sage", label: "Sage", c: "linear-gradient(135deg, #fbf6e9, #cfe5d6 55%, #a9cdb4)" },
  { k: "lavender", label: "Lavender", c: "linear-gradient(135deg, #e3d6ff, #6a4fd0 55%, #3b2a78)" },
  { k: "ocean", label: "Ocean", c: "linear-gradient(135deg, #8fd8f2, #0f5f93 55%, #06304f)" },
  { k: "sunset", label: "Sunset", c: "linear-gradient(135deg, #ffd89a, #ec5b3f 55%, #b8320f)" },
  { k: "rose", label: "Rose", c: "linear-gradient(135deg, #ffd3de, #c53d6c 55%, #7a1f45)" },
  { k: "teal", label: "Teal", c: "linear-gradient(135deg, #9be8dc, #0b7a73 55%, #043f3c)" },
  { k: "midnight", label: "Midnight", c: "linear-gradient(135deg, #d4a24c, #26335e 40%, #070b18)" },
];
const GENERAL = [
  "Asking for help is not weakness. It's one of the bravest things you can do for yourself.",
  "You don't have to have it all figured out before you talk to someone. That's what therapy is for.",
  "Rest is not a reward you earn. It's something you need.",
  "Healing is not linear. Bad days don't erase your progress.",
  "Your feelings are valid, even the ones you don't understand yet.",
  "Small steps still count. Be patient with yourself.",
  "Taking care of your mind is as important as taking care of your body.",
  "It's okay to not be okay. It's also okay to ask for support.",
  "You are allowed to set boundaries — even with people you love.",
  "Talking about it is often the first step to feeling lighter.",
];
const BY_TOPIC = [
  [/anxiety|panic|worry/i, ["Anxiety is your mind trying to protect you. Therapy helps it learn when it can rest.", "If your mind won't slow down, you're not alone. Anxiety is very common — and very treatable."]],
  [/depress|low mood/i, ["Depression isn't laziness or weakness. It's real, and it can get better with the right support.", "If getting out of bed feels heavy lately, please talk to someone. You deserve support."]],
  [/stress|burnout/i, ["Burnout doesn't happen overnight, and recovery doesn't either. Start with one small break today.", "Being busy all the time is not the same as being okay."]],
  [/couple|relationship|marriage|marital/i, ["Strong relationships aren't the ones without conflict — they're the ones that learn to repair.", "Couples therapy isn't only for when things fall apart. It helps you grow together."]],
  [/grief|loss/i, ["Grief has no timeline. There's no right way to miss someone."]],
  [/child|parent|teen|adolescen/i, ["Children don't need perfect parents. They need parents who listen and repair."]],
  [/sleep|insomnia/i, ["Poor sleep and a stressed mind feed each other. Caring for one helps the other."]],
  [/self.?esteem|confidence/i, ["Speak to yourself the way you'd speak to someone you love."]],
];

function ideasFor(specs) {
  const hay = (specs || []).join(", ");
  const own = BY_TOPIC.filter(([re]) => re.test(hay)).flatMap(([, list]) => list);
  return [...own, ...GENERAL];
}

export default function SocialPosts() {
  const { therapistInfo } = useTherapistStore();
  const [stats, setStats] = useState(null);
  const id = therapistInfo?._id || stats?.therapistId || null;
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState("");
  const [words, setWords] = useState("");
  const size = "post"; // square only — the owner dropped the story / status size
  const [theme, setThemeState] = useState("forest");
  useEffect(() => { try { const v = localStorage.getItem("cyt_post_theme"); if (THEMES.some((x) => x.k === v)) setThemeState(v); } catch (e) { /* fine */ } }, []);
  const setTheme = (v) => { setThemeState(v); try { localStorage.setItem("cyt_post_theme", v); } catch (e) { /* fine */ } };
  const [img, setImg] = useState(null); // { url, blob }
  const [making, setMaking] = useState(false);
  const [imgErr, setImgErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const ideaAt = useRef(0);
  const reqNo = useRef(0);

  useEffect(() => { fetchById(`${apiUrl}/profile-stats/me`).then((r) => setStats(r?.status ? r.data : {})).catch(() => setStats({})); }, []);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/my-link?id=${id}`).then((r) => r.json()).then((j) => { if (j?.status) setInfo(j.data); else setErr("Couldn't load your page. Please refresh."); })
      .catch(() => setErr("Couldn't load your page. Please check your connection and refresh."));
  }, [id]);
  useEffect(() => {
    if (id) return undefined;
    const t = setTimeout(() => setErr("Couldn't load your profile. Please refresh the page — if it keeps happening, log out and back in."), 10000);
    return () => clearTimeout(t);
  }, [id]);

  const ideas = useMemo(() => ideasFor(info?.posts?.specialities), [info]);
  useEffect(() => { if (info && !words) setWords(ideas[0]); }, [ideas]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextIdea = () => { ideaAt.current = (ideaAt.current + 1) % ideas.length; setWords(ideas[ideaAt.current]); };

  // the HD (2160 px) copy for Download / Share — made in the background once the preview is ready
  const hdRef = useRef(null); // { no, blob } or { no, wait: Promise }
  const makeCard = async (hd) => {
    const r = await fetch("/api/tweet-card", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ words, size, theme, hd }),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.blob();
  };

  // remake the preview a moment after typing stops
  useEffect(() => {
    if (!info?.live || !words) return undefined;
    const no = ++reqNo.current;
    const t = setTimeout(async () => {
      setMaking(true); setImgErr("");
      try {
        const blob = await makeCard(false);
        if (no !== reqNo.current) return;
        setImg((old) => { if (old) URL.revokeObjectURL(old.url); return { url: URL.createObjectURL(blob), blob, no }; });
        const wait = makeCard(true).then((b) => { if (hdRef.current?.no === no) hdRef.current = { no, blob: b }; return b; });
        wait.catch(() => { if (hdRef.current?.no === no) hdRef.current = null; });
        hdRef.current = { no, wait };
      } catch (e) {
        if (no === reqNo.current) setImgErr(e?.message && e.message.length < 80 ? e.message : "Couldn't make the image. Please try again.");
      }
      if (no === reqNo.current) setMaking(false);
    }, 700);
    return () => clearTimeout(t);
  }, [words, size, info, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const link = info?.handle ? linkUrl(info.handle, "ig") : "";
  const caption = `${words.trim()}\n\nBook a session 👉 ${link}\n\n#mentalhealth #therapy #psychologist #chooseyourtherapist`;
  const fileName = `CYT-post-${theme}-HD.png`;

  // the HD image for this preview (falls back to the preview if the HD one fails)
  const hdBlob = async () => {
    const h = hdRef.current;
    if (h && h.no === img.no) {
      if (h.blob) return h.blob;
      try { return await h.wait; } catch (e) { /* use the preview */ }
    }
    try { return await makeCard(true); } catch (e) { return img.blob; }
  };
  const saveBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  const download = async () => {
    if (!img) return;
    setSaving(true);
    saveBlob(await hdBlob());
    setSaving(false);
  };
  const share = async () => {
    if (!img) return;
    setBusy(true);
    try {
      const blob = await hdBlob();
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.clipboard.writeText(caption); } catch (e) { /* fine */ }
        await navigator.share({ files: [file], text: caption });
      } else saveBlob(blob);
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
            <p>Write a short thought — we turn it into a post with your photo and booking link for Instagram and WhatsApp.</p>
          </div>
        </div>

        {err && <div className="pt-err">{err}</div>}
        {!info && !err && <div className="pt-skel spp-skel" />}
        {info && !info.live && (
          <div className="pt-card spp-off"><b>Your profile isn't live on the website yet</b><p>You can make posts as soon as your profile is live.</p></div>
        )}

        {info?.live && (
          <div className="spp">
            <div className="pt-card spp-card">
              <div className="spp-row">
                <h2>Your post</h2>
                <button type="button" className="spp-idea" onClick={nextIdea}><AutorenewRoundedIcon /> Another idea</button>
              </div>
              <textarea value={words} maxLength={MAX} onChange={(e) => setWords(e.target.value)} rows={6} aria-label="Your post" placeholder="Write something helpful for your followers…" />
              <div className={`spp-count ${words.length > MAX - 20 ? "near" : ""}`}>{words.length}/{MAX}</div>
              <h2 className="spp-ch">Colour</h2>
              <div className="spp-themes" role="radiogroup" aria-label="Post colour">
                {THEMES.map((x) => (
                  <button key={x.k} type="button" role="radio" aria-checked={theme === x.k} className={`spp-th${theme === x.k ? " on" : ""}`} onClick={() => setTheme(x.k)} title={x.label}>
                    <span className="spp-sw" style={{ background: x.c }} />
                    <small>{x.label}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-card spp-card spp-preview">
              <div className={`spp-frame ${size}`}>
                {img && <img src={img.url} alt="Your post" style={making ? { opacity: 0.55 } : undefined} />}
                {!img && <div className="pt-skel spp-imgskel" />}
              </div>
              {imgErr && <div className="pt-err spp-ierr">{imgErr}</div>}
              <div className="spp-acts">
                <button type="button" className="spp-b gold" onClick={share} disabled={!img || busy || making}><IosShareRoundedIcon /> {busy ? "Opening…" : "Share"}</button>
                <button type="button" className="spp-b line" onClick={download} disabled={!img || making || saving}><FileDownloadRoundedIcon /> {saving ? "Getting HD…" : "Download HD"}</button>
              </div>
              <p className="spp-note">On your phone, Share opens Instagram / WhatsApp straight away — a caption with your link is copied too, just paste it.</p>
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
.spp { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.spp-card { margin: 0; padding: 18px 20px; min-width: 0; }
.spp-card h2 { font-size: 14px; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.spp-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.spp-row h2 { margin: 0; }
.spp-idea { display: inline-flex; align-items: center; gap: 5px; border: 0; background: #f0faf3; color: #166534; font-weight: 800; font-size: 13px; padding: 7px 12px; border-radius: 999px; cursor: pointer; font-family: inherit; }
.spp-idea svg { font-size: 17px; }
.spp-card textarea { width: 100%; border: 1.5px solid var(--line); border-radius: 12px; padding: 12px 14px; font-size: 15px; line-height: 1.55; font-family: inherit; resize: vertical; color: var(--ink); height: auto; }
.spp-card textarea:focus { outline: none; border-color: #1e7a4c; }
.spp-count { text-align: right; font-size: 12px; color: var(--mut); margin: 4px 0 0; font-weight: 700; }
.spp-count.near { color: #b45309; }
.spp-card h2.spp-ch { margin: 14px 0 10px; }
.spp-themes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px 8px; }
.spp-th { display: flex; flex-direction: column; align-items: center; gap: 6px; border: 0; background: none; padding: 4px 0; cursor: pointer; font-family: inherit; }
.spp-sw { width: 52px; height: 52px; border-radius: 16px; box-shadow: 0 6px 14px -8px rgba(15,23,42,.55), inset 0 0 0 1px rgba(255,255,255,.35); transition: transform .15s ease, box-shadow .15s ease; }
.spp-th small { font-size: 12px; font-weight: 700; color: var(--mut); }
.spp-th:hover .spp-sw { transform: translateY(-2px); }
.spp-th.on .spp-sw { box-shadow: 0 0 0 3px #fff, 0 0 0 5.5px #1e7a4c, 0 8px 16px -8px rgba(15,23,42,.55); }
.spp-th.on small { color: #166534; font-weight: 800; }
.spp-preview { display: flex; flex-direction: column; align-items: center; gap: 12px; position: sticky; top: 76px; }
.spp-frame { position: relative; width: 100%; max-width: 440px; border-radius: 16px; overflow: hidden; background: #eef3ef; box-shadow: 0 16px 36px -22px rgba(15,23,42,.45); }
.spp-frame.post { aspect-ratio: 1 / 1; }
.spp-frame.story { aspect-ratio: 9 / 16; max-width: 300px; }
.spp-frame img { display: block; width: 100%; height: 100%; object-fit: cover; transition: opacity .2s ease; }
.spp-imgskel { position: absolute; inset: 0; margin: 0; border-radius: 0; }
.spp-ierr { width: 100%; max-width: 440px; margin: 0; }
.spp-acts { display: flex; gap: 8px; width: 100%; max-width: 440px; }
.spp-acts .spp-b { flex: 1; }
.spp-b { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; padding: 0 16px; border-radius: 12px; font-size: 14px; font-weight: 800; border: 0; cursor: pointer; font-family: inherit; }
.spp-b svg { font-size: 18px; }
.spp-b.gold { background: linear-gradient(180deg, #f6d27a, #e3a83a); color: #1f2a14; }
.spp-b.line { background: #fff; border: 1.5px solid #cfe3d6; color: #166534; }
.spp-b:disabled { opacity: .6; cursor: default; }
.spp-note { margin: 0; font-size: 12.5px; color: var(--mut); text-align: center; max-width: 440px; }
@media (max-width: 1023px) {
  .spp { grid-template-columns: 1fr; }
  .spp-preview { position: static; order: -1; }
}
@media (max-width: 575px) {
  .spp-card { padding: 16px 14px; }
}
`;
