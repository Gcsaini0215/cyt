import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { AB_CSS } from "../../components/toolkit/abcd";
import { WhyCard, WR_CSS, toolOf } from "../../components/toolkit/registry";
import { apiUrl, imagePath } from "../../utils/url";
import { bookPath } from "../../utils/therapist-slug";
import { getDecodedToken } from "../../utils/jwt";
import { postData } from "../../utils/actions";

/* A therapist's shared worksheet: /worksheet/<code>. Shows the ABCD thought log with THAT therapist's name,
   a Book button that books them, and "Start" — after signing in, the worksheet opens in the person's own
   dashboard (My Space → Worksheets), filled online, nothing to download. */
const SITE = "https://www.chooseyourtherapist.in";
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);

export async function getServerSideProps({ params, res }) {
  const code = String(params.code || "").slice(0, 20);
  try {
    const r = await fetch(`${apiUrl}/worksheet-link/${encodeURIComponent(code)}?count=0`);
    const j = await r.json();
    if (!j?.status) return { notFound: true };
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return { props: { link: j.data } };
  } catch (e) {
    return { notFound: true };
  }
}

export default function SharedWorksheet({ link }) {
  const router = useRouter();
  const t = link.therapist;
  const w = toolOf(link.tool);
  const words = w.headline.split(" ");
  const first = (t?.name || "your psychologist").replace(/^(dr\.?|ms\.?|mr\.?|mrs\.?)\s+/i, "").split(" ")[0];
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const url = `${SITE}/worksheet/${link.code}`;
  const book = t?.live ? bookPath(t) : "/view-all-therapist";

  // count the visit once (the server render doesn't count, so crawlers don't inflate it)
  useEffect(() => { fetch(`${apiUrl}/worksheet-link/${link.code}`).catch(() => {}); }, [link.code]);

  const start = async () => {
    const who = getDecodedToken();
    const live = who && (!who.exp || who.exp * 1000 > Date.now());
    if (!live) { router.push(`/login?next=${encodeURIComponent(`/worksheet/${link.code}?start=1`)}`); return; }
    if (who.role !== 0) { setMsg("You're signed in as a therapist. Clients open this link to fill the worksheet — you can try it in your Toolkit."); return; }
    setBusy(true);
    try {
      const r = await postData(`${apiUrl}/my-worksheets/start`, { code: link.code });
      if (r?.status) router.push(`/client/worksheets/${r.data.id}`); else setMsg(r?.message || "Couldn't open it");
    } catch (e) { setMsg(e?.response?.data?.message || "Couldn't open it — try again"); }
    setBusy(false);
  };
  // back from sign-in with ?start=1 → open it straight away
  const startRef = useRef(start);
  startRef.current = start;
  useEffect(() => {
    if (router.query.start === "1" && getDecodedToken()) startRef.current();
  }, [router.query.start]);

  const onBook = () => { fetch(`${apiUrl}/worksheet-link/${link.code}/book`, { method: "POST" }).catch(() => {}); };
  const title = `${w.name} — a free ${w.tag} worksheet${t ? ` from ${t.name}` : ""}`;
  const desc = `${w.headline}. ${w.short}${t ? ` Shared by ${t.name}${t.profile_type ? `, ${t.profile_type}` : ""}.` : ""}`;
  const img = photoOf(t?.photo);

  return (
    <>
      <Head>
        <title>{title} | Choose Your Therapist</title>
        <meta name="description" content={desc} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE}/api/og/worksheet/${link.code}.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <style>{AB_CSS + WR_CSS + CSS}</style>
      <MyNavbar />
      <main className="sw">
        <section className="sw-hero">
          <div className="sw-in">
            <div className="sw-txt">
              <span className="sw-kick">{w.name} · free</span>
              <h1>{words.slice(0, -3).join(" ")} <em>{words.slice(-3).join(" ")}</em></h1>
              <p>{w.short} Fill it online — it&apos;s saved in your own account, nothing to download or print.</p>
              {link.note && <blockquote>“{link.note}” <cite>— {t?.name}</cite></blockquote>}
              <div className="sw-acts">
                <button type="button" className="sw-btn" onClick={start} disabled={busy}>{busy ? "Opening…" : "Start the worksheet — free"}</button>
                <Link href={book} className="sw-btn line" onClick={onBook}>Book a session with {first}</Link>
              </div>
              {msg && <p className="sw-msg">{msg}</p>}
              <p className="sw-small">🔒 Private: only you{t ? ` and ${t.name}` : ""} can see your answers, and only after you choose to send them.</p>
            </div>
            {t && (
              <aside className="sw-th">
                {img ? <img src={img} alt={t.name} /> : <span className="sw-th-i">{t.name.slice(0, 1)}</span>}
                <b>{t.name}</b>
                <small>{[t.profile_type, t.state].filter(Boolean).join(" · ")}</small>
                <span className="sw-th-v">✓ Verified on Choose Your Therapist</span>
                <Link href={book} className="sw-btn" onClick={onBook}>Book {first}</Link>
              </aside>
            )}
          </div>
        </section>

        <section className="sw-whys">
          <div className="sw-in col"><WhyCard tool={w.key} /></div>
        </section>

        <section className="sw-steps">
          <div className="sw-in col">
            <h2>How it works</h2>
            <div className="sw-grid">
              {w.how.map(([l, name, help], i) => {
                const c = w.tiles[i % w.tiles.length][1];
                return (
                  <div key={name} className="sw-step" style={{ "--c": c, "--soft": `color-mix(in srgb, ${c} 10%, #fff)` }}>
                    <span className="ab-l">{l}</span>
                    <b>{name}</b>
                    <p>{help}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="sw-why">
          <div className="sw-in col">
            <h2>Better with a psychologist</h2>
            <p>Thoughts can be sticky — it&apos;s hard to question your own mind alone. {t ? `${t.name} can` : "A psychologist can"} go through your worksheet with you, spot the patterns that keep coming back, and help them loosen over a few sessions.</p>
            <div className="sw-acts center">
              <Link href={book} className="sw-btn" onClick={onBook}>Book a session with {first}</Link>
              <button type="button" className="sw-btn line" onClick={start} disabled={busy}>Try the worksheet first</button>
            </div>
            <p className="sw-small">This worksheet supports therapy; it isn&apos;t a diagnosis or emergency help. In a crisis call Tele-MANAS <a href="tel:14416">14416</a> (free, 24×7).</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const CSS = `
.sw { background: #f6faf7; color: #0f1f17; }
.sw-in { max-width: 1180px; margin: 0 auto; padding: 0 20px; display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 40px; align-items: center; }
.sw-in.col { display: block; }
.sw-hero { padding: clamp(32px, 6vw, 72px) 0; background: radial-gradient(900px 400px at 85% 0%, #e2f3e8, transparent 70%), linear-gradient(180deg, #ffffff, #f6faf7); }
.sw-kick { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #e9f8ef; color: #15803d; font-size: 12.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.sw-txt h1 { margin: 14px 0 12px; font-size: clamp(30px, 4.4vw, 48px); line-height: 1.1; font-weight: 800; letter-spacing: -.02em; }
.sw-txt h1 em { font-style: normal; background: linear-gradient(90deg, #2563eb, #7c3aed, #ea580c, #16a34a); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sw-txt > p { margin: 0; font-size: 17px; color: #475569; line-height: 1.6; max-width: 620px; }
.sw-txt blockquote { margin: 18px 0 0; padding: 12px 16px; border-left: 4px solid #e0ab45; background: #fffaf0; border-radius: 0 12px 12px 0; font-size: 16px; color: #5b4310; max-width: 620px; }
.sw-txt cite { font-style: normal; font-weight: 800; }
.sw-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.sw-acts.center { justify-content: center; }
.sw-btn { display: inline-flex; align-items: center; justify-content: center; height: 50px; padding: 0 22px; border-radius: 14px; border: 0; background: #14532d; color: #fff !important; font: inherit; font-size: 16px; font-weight: 800; text-decoration: none !important; cursor: pointer; box-shadow: 0 12px 24px -14px rgba(20,83,45,.8); }
.sw-btn.line { background: #fff; color: #14532d !important; border: 1.5px solid #cfe1d5; box-shadow: none; }
.sw-btn:disabled { opacity: .6; }
.sw-msg { margin: 12px 0 0; padding: 10px 12px; border-radius: 12px; background: #fff4dd; color: #7a4f0e; font-size: 14px; max-width: 620px; }
.sw-small { margin: 14px 0 0; font-size: 13px; color: #64748b; }
.sw-small a { color: #b91c1c; font-weight: 800; }
.sw-th { background: #fff; border: 1px solid #e3e9e5; border-radius: 22px; padding: 22px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; box-shadow: 0 20px 40px -30px rgba(15,31,23,.5); }
.sw-th img, .sw-th-i { width: 110px; height: 110px; border-radius: 28px; object-fit: cover; object-position: top; margin-bottom: 8px; }
.sw-th-i { display: grid; place-items: center; background: #14532d; color: #fff; font-size: 40px; font-weight: 800; }
.sw-th b { font-size: 19px; }
.sw-th small { font-size: 13.5px; color: #64748b; }
.sw-th-v { margin: 8px 0 14px; font-size: 12px; font-weight: 800; color: #15803d; background: #e9f8ef; border-radius: 999px; padding: 4px 10px; }
.sw-th .sw-btn { width: 100%; }
.sw-steps, .sw-why { padding: clamp(32px, 5vw, 64px) 0; }
.sw-whys { padding: 0 0 clamp(24px, 4vw, 40px); background: #f6faf7; }
.sw-whys .wr-why { margin: 0; }
.sw-steps { background: #fff; }
.sw h2 { margin: 0 0 18px; font-size: clamp(24px, 3vw, 32px); font-weight: 800; letter-spacing: -.01em; }
.sw-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.sw-step { background: var(--soft); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 8px; }
.sw-step b { font-size: 17px; color: #0f1f17; }
.sw-step p { margin: 0; font-size: 14px; color: #334155; line-height: 1.5; }
.sw-step small { font-size: 13px; color: #475569; font-style: italic; }
.sw-why { text-align: center; }
.sw-why p { max-width: 720px; margin: 0 auto; font-size: 16px; color: #475569; line-height: 1.6; }
@media (max-width: 1023px) { .sw-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 860px) { .sw-in { grid-template-columns: minmax(0, 1fr); gap: 22px; } .sw-th { padding: 18px; } .sw-th img, .sw-th-i { width: 80px; height: 80px; border-radius: 22px; font-size: 30px; } .sw-th-v { margin: 6px 0 10px; } }
@media (max-width: 560px) { .sw-grid { grid-template-columns: minmax(0, 1fr); } .sw-acts .sw-btn { flex: 1 1 100%; } }
`;
