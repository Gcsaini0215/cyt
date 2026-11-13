import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "../../components/therapists/main-layout";
import { LIBRARY, Tiles, WhyCard, WR_CSS, toolOf } from "../../components/toolkit/registry";
import { deleteById, fetchById, postJsonData } from "../../utils/actions";
import { apiUrl, imagePath } from "../../utils/url";

/* Therapist → Toolkit: CBT worksheets to use with clients.
   ABCD thought log: try it, share a link (anyone who opens it sees YOUR name and a Book button that books you),
   or send it straight to one of your clients — they fill it in their own dashboard, nothing to download —
   and review what clients send you.
   Plan rules: the first two worksheets are free for the therapist's OWN use (saved, private). The yearly plan
   unlocks every worksheet for themselves, plus Share link and Send to a client (server checks it too). */
const FREE_SELF = ["abcd", "activity"];
const PLAN_NAME = { annual: "Yearly", free: "Free (given by CYT)", "1_month": "1-month", "3_month": "3-month", "6_month": "6-month" };
const longDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const SITE = "https://www.chooseyourtherapist.in";
const STATUS = { assigned: ["Not opened yet", "new"], draft: ["Filling it in", "draft"], submitted: ["Sent to you — review", "sent"], reviewed: ["Reviewed", "done"] };
const dt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "");
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);

export default function ToolkitPage() {
  const router = useRouter();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [panel, setPanel] = useState(null); // { kind: "share" | "send" | "upgrade", tool } — worksheets themselves open as pages
  const load = useCallback(() => fetchById(`${apiUrl}/therapist/worksheets`).then((r) => (r?.status ? setD(r.data) : setErr(r?.message || "Couldn't load"))).catch(() => setErr("Couldn't load your toolkit")), []);
  useEffect(() => { load(); }, [load]);
  // worksheets clients send show up without a reload: refresh every 30 s while the page is open, and on return
  useEffect(() => {
    const again = () => { if (document.visibilityState === "visible") load(); };
    const t = setInterval(again, 30000);
    document.addEventListener("visibilitychange", again);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", again); };
  }, [load]);
  // old notification links (?entry=<id>) → the worksheet page
  useEffect(() => { if (router.query.entry) router.replace(`/therapists/toolkit/${router.query.entry}?review=1`); }, [router, router.query.entry]);

  const waiting = useMemo(() => (d?.entries || []).filter((e) => e.status === "submitted"), [d]);
  const yearly = !!d?.access?.yearly;
  const selfOk = (tool) => yearly || FREE_SELF.includes(tool);
  const [starting, setStarting] = useState("");
  const [linkPage, setLinkPage] = useState(1);
  const LINKS_PER = 5;
  const [busyDel, setBusyDel] = useState("");
  const removeMine = async (id) => {
    if (!window.confirm("Delete this worksheet? Everything written in it is removed.")) return;
    setBusyDel(id);
    try { await deleteById(`${apiUrl}/my-worksheets/${id}`); } catch (x) { /* already gone */ }
    setBusyDel(""); load();
  };
  const removeClient = async (e) => {
    if (!window.confirm(`Remove ${e.client.name}'s worksheet from your list? It stays in their dashboard.`)) return;
    setBusyDel(e._id);
    try { await deleteById(`${apiUrl}/therapist/worksheets/entries/${e._id}`); } catch (x) { /* already gone */ }
    setBusyDel(""); load();
  };
  const openForMe = async (tool) => {
    if (!selfOk(tool)) { setPanel({ kind: "upgrade", tool, why: "self" }); return; }
    setStarting(tool);
    try {
      const r = await postJsonData(`${apiUrl}/therapist/worksheets/self`, { tool });
      if (r?.status) { router.push(`/therapists/toolkit/${r.data.id}`); return; }
    } catch (e) { if (e?.response?.data?.locked) setPanel({ kind: "upgrade", tool, why: "self" }); }
    setStarting("");
  };

  return (
    <MainLayout>
      <Head><title>Toolkit | Choose Your Therapist</title></Head>
      <style>{CSS + WR_CSS}</style>
      <div className="tk">
        <header className="tk-h">
          <div>
            <h1>Toolkit</h1>
            <p>Therapy worksheets your clients fill online — in their own dashboard, no PDFs. Share a link to bring new clients to <b>you</b>.</p>
          </div>
          {waiting.length > 0 && <button type="button" className="tk-alert" onClick={() => router.push(`/therapists/toolkit/${waiting[0]._id}?review=1`)}>● {waiting.length} worksheet{waiting.length === 1 ? "" : "s"} to review</button>}
        </header>

        {d?.access?.free && (
          <div className="tk-freeplan" role="note">
            <span aria-hidden="true">⚠️</span>
            <p><b>You&apos;re on CYT&apos;s free plan{d.access.planEnds ? ` (till ${longDate(d.access.planEnds)})` : ""}.</b> It was given by the CYT team and can be ended by the admin at any time — the Toolkit would lock again. Take the yearly plan to keep it for sure.</p>
            <Link href="/my-plans" className="tk-btn">Take the yearly plan</Link>
          </div>
        )}
        {err && <div className="tk-box">{err}</div>}

        <section className="tk-lib" aria-label="Worksheets">
          {LIBRARY.filter((w) => w.ready).map((w) => (
            <article key={w.key} className="tk-w ready">
              <div className="tk-w-top">
                <Tiles tool={w.key} />
                <span className="tk-tags">{!yearly && <em className={FREE_SELF.includes(w.key) ? "free" : "lock"}>{FREE_SELF.includes(w.key) ? "Free for you" : "🔒 Yearly plan"}</em>}<em>{w.tag}</em></span>
              </div>
              <h2>{w.name}</h2>
              <p>{w.short}</p>
              {w.ready && (
                <>
                  <div className="tk-acts">
                    <button type="button" className={`tk-btn${yearly ? "" : " locked"}`} onClick={() => setPanel(yearly ? { kind: "share", tool: w.key } : { kind: "upgrade", tool: w.key, why: "share" })}>{yearly ? "" : "🔒 "}Share link</button>
                    <button type="button" className={`tk-btn line${yearly ? "" : " locked"}`} onClick={() => setPanel(yearly ? { kind: "send", tool: w.key } : { kind: "upgrade", tool: w.key, why: "send" })}>{yearly ? "" : "🔒 "}Send to a client</button>
                    <button type="button" className="tk-btn ghost" disabled={starting === w.key} onClick={() => openForMe(w.key)}>{starting === w.key ? "Opening…" : `${selfOk(w.key) ? "" : "🔒 "}Use it for myself`}</button>
                  </div>
                  <WhyCard tool={w.key} open={false} compact />
                </>
              )}
            </article>
          ))}
        </section>

        {d?.mine?.length > 0 && (
          <section className="tk-card tk-mine">
            <div className="tk-card-h"><h3>Just for you</h3><small>{d.mine.length}</small><span className="tk-mine-s">Your own worksheets — saved, and only you can see them</span></div>
            <ul className="tk-mine-l">
              {d.mine.map((m) => (
                <li key={m._id}>
                  <button type="button" onClick={() => router.push(`/therapists/toolkit/${m._id}`)}>
                    <Tiles tool={m.tool} size={20} />
                    <span><b>{m.title}</b><small>{m.preview || "Not filled yet"} · {dt(m.updatedAt)}</small></span>
                  </button>
                  <button type="button" className="tk-del" disabled={busyDel === m._id} onClick={() => removeMine(m._id)} aria-label={`Delete ${m.title}`} title="Delete"><DeleteOutlineRoundedIcon /></button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="tk-cols">
          <section className="tk-card">
            <div className="tk-card-h"><h3>From your clients</h3><small>{(d?.entries || []).length}</small></div>
            {!d ? <p className="tk-mut">Loading…</p> : d.entries.length === 0 ? (
              <p className="tk-mut">When a client fills a worksheet you shared or sent, it shows here. You see their answers once they press Send.</p>
            ) : (
              <ul className="tk-list">
                {d.entries.map((e) => {
                  const [label, tone] = STATUS[e.status] || STATUS.draft;
                  return (
                    <li key={e._id}>
                      <button type="button" onClick={() => router.push(`/therapists/toolkit/${e._id}?review=1`)} className={e.flag ? "flag" : ""}>
                        {photoOf(e.client.photo) ? <img src={photoOf(e.client.photo)} alt="" /> : <span className="tk-av">{(e.client.name || "C").slice(0, 1)}</span>}
                        <span className="tk-l-t"><b>{e.client.name}{e.flag && <em className="tk-flag">⚠ check in</em>}</b><small>{e.title}{e.preview ? ` · “${e.preview}”` : ""}</small></span>
                        <span className="tk-l-r"><em className={`tk-st ${tone}`}>{label}</em><small>{dt(e.submittedAt || e.updatedAt)}</small></span>
                      </button>
                      <button type="button" className="tk-del" disabled={busyDel === e._id} onClick={() => removeClient(e)} aria-label={`Remove ${e.client.name}'s worksheet`} title="Remove from my list"><DeleteOutlineRoundedIcon /></button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="tk-card">
            <div className="tk-card-h"><h3>Your links</h3><small>{(d?.links || []).length}</small></div>
            {!d ? <p className="tk-mut">Loading…</p> : d.links.length === 0 ? <p className="tk-mut">Share the ABCD worksheet on WhatsApp, Instagram or with a client — every link shows your name and books you.</p> : (
              <ul className="tk-links">
                {d.links.slice((linkPage - 1) * LINKS_PER, linkPage * LINKS_PER).map((l) => (
                  <li key={l._id}>
                    <span><b>{l.forClient ? `Sent to ${l.forClient.name}` : "Share link"}</b><small>{l.note ? `“${l.note}” · ` : ""}{dt(l.createdAt)}</small></span>
                    <span className="tk-nums"><i title="Opened">👁 {l.opens}</i><i title="Started">✍ {l.starts}</i><i title="Book clicks">📅 {l.bookClicks}</i></span>
                    <CopyBtn url={`${SITE}/worksheet/${l.code}`} />
                  </li>
                ))}
              </ul>
            )}
            {d && d.links.length > LINKS_PER && (() => {
              const pages = Math.ceil(d.links.length / LINKS_PER);
              return (
                <div className="tk-pg">
                  <button type="button" disabled={linkPage <= 1} onClick={() => setLinkPage(linkPage - 1)} aria-label="Previous">‹</button>
                  {Array.from({ length: pages }, (_, i) => <button key={i} type="button" className={linkPage === i + 1 ? "on" : ""} onClick={() => setLinkPage(i + 1)}>{i + 1}</button>)}
                  <button type="button" disabled={linkPage >= pages} onClick={() => setLinkPage(linkPage + 1)} aria-label="Next">›</button>
                </div>
              );
            })()}
          </section>
        </div>
      </div>

      {panel?.kind === "upgrade" && <UpgradePanel tool={panel.tool} why={panel.why} access={d?.access} onClose={() => setPanel(null)} />}
      {panel?.kind === "share" && <SharePanel tool={panel.tool} onClose={() => setPanel(null)} onMade={load} />}
      {panel?.kind === "send" && <SendPanel tool={panel.tool} clients={d?.clients || []} onClose={() => setPanel(null)} onMade={load} />}
    </MainLayout>
  );
}

function Sheet({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="tk-scrim" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`tk-sheet${wide ? " wide" : ""}`}>
        <div className="tk-sheet-h"><h3>{title}</h3><button type="button" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="tk-sheet-b">{children}</div>
      </div>
    </div>
  );
}

function CopyBtn({ url }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="tk-mini" onClick={() => { navigator.clipboard?.writeText(url).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); }); }}>{ok ? "Copied" : "Copy"}</button>;
}

/* locked: Share / Send (any worksheet) and own use of worksheets after the first two need the yearly plan */
function UpgradePanel({ tool, why, access, onClose }) {
  const w = toolOf(tool);
  const title = "Boost your profile first — with the yearly plan";
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="tk-up">
        <span className="tk-up-ic" aria-hidden="true">👑</span>
        <h4 className="tk-up-h">Boost your profile first with the yearly plan</h4>
        <div className={`tk-cur${access?.plan ? "" : " none"}`}>
          <small>Your plan right now</small>
          <b>{access?.plan ? `${PLAN_NAME[access.plan] || access.plan} plan` : "No active plan"}</b>
          {access?.plan && access?.planEnds && <span>till {longDate(access.planEnds)}</span>}
          {access?.plan && access.plan !== "annual" && access.plan !== "free" && <em>The Toolkit opens with the yearly plan — your current plan doesn&apos;t include it.</em>}
        </div>
        <p>{why === "self"
          ? <>Your profile stays live and growing on CYT all year — and <b>{w.name}</b> and every new worksheet open for you. ABCD and the Activity Diary stay free for your own use.</>
          : <>Your profile stays live and growing on CYT all year — and you can share worksheets with your name and Book button, and send them to your clients. ABCD and the Activity Diary stay free for your own use.</>}</p>
        <ul>
          <li>Your profile stays live on CYT for the full year — one payment, no monthly renewals</li>
          <li>Send any worksheet to your clients — they fill it in their dashboard</li>
          <li>Share links with your name and a Book button that brings clients to <b>you</b></li>
          <li>Every worksheet for your own use, including new ones as they come</li>
          <li>Review answers and send feedback before the next session</li>
        </ul>
        <Link href="/my-plans" className="tk-btn big">Boost my profile — yearly plan ₹7,300 (₹20 a day)</Link>
      </div>
    </Sheet>
  );
}

function ShareResult({ url, text, title = "Worksheet" }) {
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const share = () => { if (navigator.share) navigator.share({ title, text, url }).catch(() => {}); else navigator.clipboard?.writeText(url); };
  return (
    <div className="tk-done">
      <p className="tk-ok">✓ Your link is ready</p>
      <div className="tk-url"><code>{url}</code><CopyBtn url={url} /></div>
      <div className="tk-acts">
        <a className="tk-btn wa" href={wa} target="_blank" rel="noreferrer">Share on WhatsApp</a>
        <button type="button" className="tk-btn line" onClick={share}>More ways to share</button>
        <a className="tk-btn ghost" href={url} target="_blank" rel="noreferrer">Open it</a>
      </div>
    </div>
  );
}

function SharePanel({ tool, onClose, onMade }) {
  const w = toolOf(tool);
  const [note, setNote] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const make = async () => {
    setBusy(true);
    try { const r = await postJsonData(`${apiUrl}/therapist/worksheets/link`, { tool, note }); if (r?.status) { setRes(r.data); onMade(); } else setRes({ error: r?.message || "Couldn't make the link" }); }
    catch (e) { setRes({ error: e?.response?.data?.message || "Couldn't make the link — try again in a minute" }); }
    setBusy(false);
  };
  return (
    <Sheet title={`Share the ${w.name}`} onClose={onClose}>
      <ul className="tk-how">
        <li>Anyone who opens the link sees the worksheet with <b>your name and photo</b>.</li>
        <li>The <b>Book</b> button books a session with <b>you</b>.</li>
        <li>They fill it in their own CYT account, and can send it to you.</li>
        <li>Free for <b>one situation</b> — your ongoing clients can log as many as they need between sessions (use <b>Send to a client</b>).</li>
      </ul>
      {res?.code ? <ShareResult url={`${SITE}${res.path}`} title={w.name} text={`Try this free worksheet: ${w.name} — ${w.headline.toLowerCase()}.`} /> : (
        <>
          <label className="tk-lbl">A short note on top (optional)
            <input maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Use this whenever overthinking starts at night" />
          </label>
          {res?.error && <p className="tk-err">{res.error}</p>}
          <button type="button" className="tk-btn big" onClick={make} disabled={busy}>{busy ? "Making…" : "Make my share link"}</button>
        </>
      )}
    </Sheet>
  );
}

function SendPanel({ tool, clients, onClose, onMade }) {
  const w = toolOf(tool);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState("");
  const [note, setNote] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const shown = clients.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));
  const chosen = clients.find((c) => c.id === pick);
  const send = async () => {
    if (!pick) return;
    setBusy(true);
    try { const r = await postJsonData(`${apiUrl}/therapist/worksheets/link`, { tool, note, client: pick }); if (r?.status) { setRes(r.data); onMade(); } else setRes({ error: r?.message }); }
    catch (e) { setRes({ error: e?.response?.data?.message || "Couldn't send" }); }
    setBusy(false);
  };
  return (
    <Sheet title={`Send the ${w.name} to a client`} onClose={onClose}>
      {res?.code ? (
        <>
          <p className="tk-ok">✓ Sent to {res.client?.name}. It&apos;s waiting in their My Space → Worksheets, and they got a notification.</p>
          <ShareResult url={`${SITE}${res.path}`} title={w.name} text={`Hi ${res.client?.name?.split(" ")[0] || ""}, here's the worksheet we talked about. Fill it before our next session.`} />
        </>
      ) : clients.length === 0 ? (
        <p className="tk-mut">Clients appear here after their first paid session with you. For anyone else, use <b>Share link</b>.</p>
      ) : (
        <>
          <input className="tk-in" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your clients" />
          <div className="tk-pick">
            {shown.map((c) => (
              <label key={c.id} className={pick === c.id ? "on" : ""}>
                <input type="radio" name="cl" checked={pick === c.id} onChange={() => setPick(c.id)} />
                {photoOf(c.photo) ? <img src={photoOf(c.photo)} alt="" /> : <span className="tk-av">{c.name.slice(0, 1)}</span>}
                <b>{c.name}</b>
              </label>
            ))}
          </div>
          <label className="tk-lbl">Note for {chosen ? chosen.name.split(" ")[0] : "them"} (optional)
            <input maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Fill this the next time you feel anxious at work" />
          </label>
          {res?.error && <p className="tk-err">{res.error}</p>}
          <button type="button" className="tk-btn big" disabled={!pick || busy} onClick={send}>{busy ? "Sending…" : chosen ? `Send to ${chosen.name}` : "Choose a client"}</button>
        </>
      )}
    </Sheet>
  );
}

const CSS = `
.tk { color: #0f1f17; }
.tk-h { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.tk-h h1 { margin: 0; font-size: 26px; font-weight: 800; }
.tk-h p { margin: 4px 0 0; font-size: 14.5px; color: #475569; max-width: 680px; }
.tk-alert { border: 0; border-radius: 999px; padding: 10px 16px; background: #fee2e2; color: #b91c1c; font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; }
.tk-box { background: #fff; border: 1px solid #e3e9e5; border-radius: 16px; padding: 18px; margin-bottom: 14px; color: #64748b; }
.tk-lib { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; align-items: start; }
.tk-w { grid-column: span 3; background: #fff; border: 1px solid #e3e9e5; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 6px; opacity: .72; }
.tk-w.ready { opacity: 1; grid-column: span 4; border: 1.5px solid #bfe0cb; background: linear-gradient(135deg, #ffffff 55%, #eef8f2); box-shadow: 0 16px 34px -26px rgba(20,83,45,.6); padding: 20px; }
.tk-w .wr-why { margin: 12px 0 0; }
.tk-w-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tk-w-top em { font-style: normal; font-size: 11.5px; font-weight: 800; color: #15803d; background: #e9f8ef; border-radius: 999px; padding: 3px 10px; }
.tk-abcd { display: flex; gap: 6px; }
.tk-abcd i { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; color: #fff; font-style: normal; font-weight: 900; font-size: 17px; }
.tk-tags { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.tk-tags em.free { background: #e0f2fe; color: #0369a1; }
.tk-tags em.lock { background: #fff4dd; color: #92651a; }
.tk-btn.locked { background: #fffaf0 !important; color: #92651a !important; border: 1.5px solid #ecd59c !important; }
.tk-btn.ghost:disabled { opacity: .6; }
.tk-mine { margin-bottom: 14px; }
.tk-mine .tk-card-h { flex-wrap: wrap; }
.tk-mine-s { font-size: 12.5px; color: #64748b; }
.tk-mine-l { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px; }
.tk-mine-l button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; border: 1px solid #e3e9e5; background: #fbfdfc; font: inherit; text-align: left; cursor: pointer; }
.tk-mine-l button:hover { border-color: #15803d; }
.tk-mine-l button > span:last-child { min-width: 0; display: flex; flex-direction: column; }
.tk-mine-l b { font-size: 14px; }
.tk-mine-l small { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tk-saved { margin-left: 6px; color: #15803d; font-size: 12.5px; }
.tk-selfnote { margin: 14px 0 0; font-size: 13.5px; color: #475569; }
.tk-selfnote button { border: 0; background: none; color: #b91c1c; font: inherit; font-weight: 700; cursor: pointer; margin-left: 6px; }
.tk-up-h { margin: 12px 0 0; font-size: 19px; font-weight: 800; color: #0f1f17; }
.tk-list li, .tk-mine-l li { display: flex; align-items: center; gap: 6px; }
.tk-list li > button:first-child, .tk-mine-l li > button:first-child { flex: 1; min-width: 0; }
.tk-del { flex: none; width: 36px; height: 36px; border-radius: 50%; border: 0; background: #fef2f2; color: #dc2626; cursor: pointer; display: grid; place-items: center; padding: 0; transition: background .15s ease, transform .15s ease; }
.tk-del svg { font-size: 19px; }
.tk-del:hover { background: #fee2e2; }
.tk-del:active { transform: scale(.9); }
.tk-freeplan { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; padding: 12px 14px; border-radius: 16px; background: #fffbeb; border: 1px solid #fde68a; }
.tk-freeplan > span { font-size: 20px; }
.tk-freeplan p { flex: 1 1 320px; margin: 0; font-size: 14px; color: #713f12; line-height: 1.5; }
.tk-freeplan .tk-btn { height: 38px; }
.tk-cur { margin: 12px 0 0; padding: 12px 14px; border-radius: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; flex-direction: column; gap: 2px; }
.tk-cur.none { background: #f8fafc; border-color: #e2e8f0; }
.tk-cur small { font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #64748b; }
.tk-cur b { font-size: 16px; color: #0f1f17; }
.tk-cur span { font-size: 13px; color: #475569; }
.tk-cur em { font-style: normal; margin-top: 4px; font-size: 13px; color: #92651a; }
.tk-del:disabled { opacity: .5; }
.tk-pg { display: flex; justify-content: center; gap: 4px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f3; }
.tk-pg button { min-width: 32px; height: 32px; border-radius: 9px; border: 1px solid #dfe7e2; background: #fff; font: inherit; font-size: 13px; font-weight: 800; color: #14532d; cursor: pointer; }
.tk-pg button.on { background: #14532d; border-color: #14532d; color: #fff; }
.tk-pg button:disabled { opacity: .4; cursor: default; }
.tk-up { text-align: center; }
.tk-up-ic { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #fff1c7, #f8d77a); font-size: 32px; }
.tk-up p { margin: 12px 0; font-size: 15px; color: #334155; line-height: 1.55; }
.tk-up ul { text-align: left; list-style: none; margin: 0 0 6px; padding: 12px 14px; background: #fff; border: 1px solid #e3e9e5; border-radius: 14px; display: flex; flex-direction: column; gap: 8px; }
.tk-up li { position: relative; padding-left: 24px; font-size: 14px; color: #1f2937; }
.tk-up li::before { content: "✓"; position: absolute; left: 0; top: 1px; width: 17px; height: 17px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 10px; font-weight: 900; display: grid; place-items: center; }
.tk-soon { font-size: 11.5px; font-weight: 800; color: #64748b; background: #f1f5f3; border-radius: 999px; padding: 3px 10px; }
.tk-w h2 { margin: 6px 0 0; font-size: 17px; font-weight: 800; }
.tk-w.ready h2 { font-size: 22px; }
.tk-w p { margin: 0; font-size: 13.5px; color: #475569; line-height: 1.5; }
.tk-acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.tk-btn { display: inline-flex; align-items: center; justify-content: center; height: 42px; padding: 0 16px; border-radius: 12px; border: 0; background: #14532d; color: #fff !important; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; text-decoration: none !important; }
.tk-btn.line { background: #fff; color: #14532d !important; border: 1.5px solid #cfe1d5; }
.tk-btn.ghost { background: transparent; color: #15803d !important; }
.tk-btn.wa { background: #25d366; color: #fff !important; }
.tk-btn.big { width: 100%; height: 48px; margin-top: 14px; font-size: 15px; }
.tk-btn:disabled { opacity: .5; cursor: default; }
.tk-cols { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; }
.tk-card { background: #fff; border: 1px solid #e3e9e5; border-radius: 18px; padding: 16px; min-width: 0; }
.tk-card-h { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tk-card-h h3 { margin: 0; font-size: 16px; font-weight: 800; }
.tk-card-h small { font-size: 12px; font-weight: 800; color: #64748b; background: #f1f5f3; border-radius: 999px; padding: 1px 8px; }
.tk-mut { color: #64748b; font-size: 14px; line-height: 1.5; margin: 6px 0; }
.tk-pad { margin: 0 0 12px; }
.tk-list, .tk-links { list-style: none; margin: 0; padding: 0; }
.tk-list li + li, .tk-links li + li { border-top: 1px solid #f1f5f3; }
.tk-list button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 4px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; border-radius: 10px; }
.tk-list button:hover { background: #f8fbf9; }
.tk-list button.flag { background: #fff5f5; }
.tk-list img, .tk-av, .tk-pick img { width: 38px; height: 38px; border-radius: 11px; object-fit: cover; flex: none; }
.tk-av { display: grid; place-items: center; background: #14532d; color: #fff; font-weight: 800; }
.tk-l-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tk-l-t b { font-size: 14px; display: flex; gap: 6px; align-items: center; }
.tk-l-t small { font-size: 12.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tk-flag { font-style: normal; font-size: 11px; color: #b91c1c; background: #fee2e2; border-radius: 999px; padding: 1px 7px; }
.tk-l-r { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex: none; }
.tk-l-r small { font-size: 11.5px; color: #94a3b8; }
.tk-st { font-style: normal; font-size: 11px; font-weight: 800; border-radius: 999px; padding: 3px 9px; white-space: nowrap; }
.tk-st.new { background: #f1f5f9; color: #64748b; } .tk-st.draft { background: #fff4dd; color: #92651a; }
.tk-st.sent { background: #fee2e2; color: #b91c1c; } .tk-st.done { background: #e9f8ef; color: #15803d; }
.tk-links li { display: flex; align-items: center; gap: 10px; padding: 10px 2px; }
.tk-links li > span:first-child { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tk-links b { font-size: 13.5px; }
.tk-links small { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tk-nums { display: flex; gap: 8px; font-size: 12px; color: #475569; }
.tk-nums i { font-style: normal; white-space: nowrap; }
.tk-mini { height: 30px; padding: 0 10px; border-radius: 9px; border: 1px solid #cfe1d5; background: #fff; color: #14532d; font: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer; flex: none; }
.tk-scrim { position: fixed; inset: 0; z-index: 3000; background: rgba(11,23,18,.5); display: flex; align-items: center; justify-content: center; padding: 16px; }
.tk-sheet { width: 100%; max-width: 560px; max-height: calc(100dvh - 32px); display: flex; flex-direction: column; background: #f7faf8; border-radius: 22px; overflow: hidden; box-shadow: 0 30px 70px -30px rgba(0,0,0,.5); }
.tk-sheet.wide { max-width: 900px; }
.tk-sheet-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; background: #fff; border-bottom: 1px solid #e3e9e5; }
.tk-sheet-h h3 { margin: 0; font-size: 17px; font-weight: 800; }
.tk-sheet-h button { width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f3; font-size: 15px; cursor: pointer; }
.tk-sheet-b { padding: 16px 18px 20px; overflow-y: auto; overscroll-behavior: contain; }
.tk-how { margin: 0 0 14px; padding: 12px 14px 12px 32px; background: #fff; border: 1px solid #e3e9e5; border-radius: 14px; font-size: 14px; color: #334155; line-height: 1.7; }
.tk-lbl { display: block; margin-top: 12px; font-size: 13.5px; font-weight: 800; color: #334155; }
.tk-lbl input, .tk-lbl textarea, .tk-in { display: block; width: 100%; box-sizing: border-box; margin-top: 6px; padding: 11px 13px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; font-weight: 400; background: #fff; }
.tk-pick { max-height: 280px; overflow: auto; margin-top: 8px; background: #fff; border: 1px solid #e3e9e5; border-radius: 14px; }
.tk-pick label { display: flex; align-items: center; gap: 10px; padding: 9px 12px; cursor: pointer; border-bottom: 1px solid #f1f5f3; }
.tk-pick label.on { background: #eef8f2; }
.tk-pick input { accent-color: #14532d; }
.tk-pick b { font-size: 14px; }
.tk-ok { margin: 8px 0; color: #15803d; font-weight: 800; font-size: 14.5px; }
.tk-err { color: #b91c1c; font-size: 14px; margin: 8px 0 0; }
.tk-done { background: #fff; border: 1px solid #cfe7d8; border-radius: 16px; padding: 14px; }
.tk-url { display: flex; gap: 8px; align-items: center; background: #f1f7f3; border-radius: 12px; padding: 8px 8px 8px 12px; }
.tk-url code { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #14532d; }
.tk-sos { margin-bottom: 10px; padding: 12px 14px; border-radius: 12px; background: #fff1f2; border: 1px solid #fecdd3; color: #881337; font-weight: 700; font-size: 14px; }
@media (max-width: 1100px) { .tk-w { grid-column: span 6; } .tk-w.ready { grid-column: span 6; } }
@media (max-width: 820px) { .tk-w.ready { grid-column: span 12; } .tk-cols { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 640px) {
  .tk-h h1 { font-size: 22px; }
  .tk-lib { grid-template-columns: minmax(0, 1fr); gap: 10px; } .tk-w, .tk-w.ready { grid-column: auto; } .tk-w.ready { padding: 16px; }
  .tk-acts .tk-btn { flex: 1 1 100%; }
  .tk-scrim { align-items: flex-end; padding: 0; }
  .tk-sheet { max-width: none !important; border-radius: 22px 22px 0 0; max-height: calc(100dvh - 24px); }
  .tk-nums { display: none; }
}
`;
