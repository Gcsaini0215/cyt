import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apiUrl, imagePath } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import { fetchById, postData } from "../../utils/actions";
import WidgetLogin from "./widget-login";

/* Chat with a therapist right on their profile (owner, 2026-11-24): the 💬 on the profile opens this sheet instead of
   leaving the page. Visitors pick a one-tap question (or type one), log in / sign up inside the sheet, and the question
   is sent as soon as they're in. Before a first booking a client can ask ONE question (the rule stays as it is);
   after booking the chat is open as usual. Phones: full screen, sized to the part above the keyboard. iPad / desktop:
   a panel at the bottom right. */

const API = `${apiUrl}/live-chat`;
const time = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).toLowerCase();
const SUGGEST = [
  "Do you work with anxiety or stress?",
  "Are you available this week?",
  "Can we talk in Hindi?",
  "What happens in the first session?",
  "Do you offer in-person sessions?",
];
const PKEY = (id) => `cyt_pchat_${id}`;
const NOFILL = { autoComplete: "off", "data-lpignore": "true", "data-form-type": "other", enterKeyHint: "send" };

export default function ProfileChat({ therapistId, name, photo, onClose, onBook }) {
  const [who, setWho] = useState(null); // guest | client | therapist
  const [pending, setPending] = useState("");
  const [own, setOwn] = useState("");
  const [consent, setConsent] = useState(null);
  const [tid, setTid] = useState(null);
  const [st, setSt] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [vv, setVv] = useState(null);
  const [phone, setPhone] = useState(false);
  const box = useRef(null);
  const sentPending = useRef(false);
  const end = () => requestAnimationFrame(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; });
  const first = (name || "").split(" ")[0] || "the therapist";

  // who is here + a question picked before logging in (survives the login)
  useEffect(() => {
    const d = getDecodedToken();
    setWho(!d ? "guest" : d.role === 1 ? "therapist" : "client");
    try { const v = sessionStorage.getItem(PKEY(therapistId)); if (v) setPending(v); } catch { /* ignore */ }
  }, [therapistId]);
  const pick = (q) => { setPending(q); try { sessionStorage.setItem(PKEY(therapistId), q); } catch { /* ignore */ } };
  const clearPending = () => { setPending(""); try { sessionStorage.removeItem(PKEY(therapistId)); } catch { /* ignore */ } };

  // phones: full screen above the keyboard; the page behind stays still
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fit = () => {
      setPhone(mq.matches);
      const v = window.visualViewport;

      setVv(v ? { h: Math.round(v.height), t: Math.round(v.offsetTop), kb: window.innerHeight - v.height > 150 } : null);
    };
    fit();
    window.visualViewport?.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("scroll", fit);
    mq.addEventListener?.("change", fit);
    const b = document.body, y = window.scrollY, prev = b.style.cssText;
    if (mq.matches) { b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.left = "0"; b.style.right = "0"; b.style.width = "100%"; b.style.overflow = "hidden"; }
    const k = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    return () => {
      window.visualViewport?.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("scroll", fit);
      mq.removeEventListener?.("change", fit);
      document.removeEventListener("keydown", k);
      if (mq.matches) { b.style.cssText = prev; window.scrollTo(0, y); }
    };
  }, [onClose]);

  // signed-in client: open (or find) the chat with this therapist
  const load = async () => {
    try {
      const c = await fetchById(`${API}/consent`);
      setConsent(!!c?.data?.agreed);
      const s = await postData(`${API}/threads`, { therapistId });
      if (!s?.status) { setErr(s?.message || "Couldn't open the chat"); return; }
      setTid(s.data.id);
      const t = await fetchById(`${API}/threads/${s.data.id}`);
      setSt(t?.data?.state || null);
      setMsgs(Array.isArray(t?.data?.messages) ? t.data.messages : []);
      end();
      postData(`${API}/threads/${s.data.id}/read`, {}).catch(() => {});
    } catch (x) { setErr(x?.response?.data?.message || "Couldn't open the chat — check your internet."); }
  };
  useEffect(() => { if (who === "client") load(); }, [who]); // eslint-disable-line react-hooks/exhaustive-deps

  // live: new messages in this chat appear here (the app-wide listener hands them over)
  useEffect(() => {
    if (!tid) return undefined;
    const prev = window.__lcMini;
    window.__lcMini = (threadId, m) => {
      if (threadId !== tid) return prev ? prev(threadId, m) : false;
      setMsgs((x) => (x && !x.some((y) => y._id === m._id) ? [...x, m] : x));
      end();
      if (m.fromRole !== "client") postData(`${API}/threads/${tid}/read`, {}).catch(() => {});
      return true;
    };
    return () => { window.__lcMini = prev || null; };
  }, [tid]);

  const send = async (e, given) => {
    e?.preventDefault();
    const t = (given || text).trim();
    if (!t || !tid || busy) return;
    setBusy(true); setErr("");
    try {
      const r = await postData(`${API}/threads/${tid}/messages`, { text: t, page: typeof window !== "undefined" ? window.location.pathname.slice(0, 180) : "" });
      if (r?.status) {
        if (!given) setText(""); else clearPending();
        setMsgs((x) => (x && !x.some((y) => y._id === r.data.message._id) ? [...x, r.data.message] : x));
        end();
        fetchById(`${API}/threads/${tid}`).then((x) => { if (x?.status) { setSt(x.data.state); setMsgs(x.data.messages); end(); } }).catch(() => {});
      } else setErr(r?.message || "Couldn't send — try again");
    } catch (x) {
      const d = x?.response?.data;
      if (d?.code === "consent") setConsent(false);
      setErr(d?.message || "Couldn't send — try again");
    }
    setBusy(false);
  };
  // the question picked before logging in goes out once the chat is ready
  useEffect(() => {
    if (!pending || sentPending.current || consent !== true || !tid || !st) return;
    if (!st.canSend) { clearPending(); return; } // e.g. already asked — keep the note on screen
    sentPending.current = true;
    send(null, pending);
  }, [pending, consent, tid, st]); // eslint-disable-line react-hooks/exhaustive-deps

  if (typeof document === "undefined" || !who) return null;
  const sheetStyle = phone && vv ? { top: vv.t, height: vv.h } : undefined;
  const av = photo ? (photo.startsWith("http") ? photo : `${imagePath}/${photo}`) : null;

  const body = (() => {
    if (who === "therapist") return <p className="pc-note">Therapists can&apos;t message other therapists here.</p>;
    if (who === "guest") {
      return (
        <div className="pc-guest">
          <div className="pc-msgs">
            <div className="pc-row in"><p className="pc-bub">Hi 👋 Ask {first} a quick question before you book — tap one below or type your own.</p></div>
            {!pending ? (
              <div className="pc-sug" role="list">{SUGGEST.map((q) => <button type="button" role="listitem" key={q} onClick={() => pick(q)}>{q}</button>)}</div>
            ) : (
              <>
                <div className="pc-row me"><p className="pc-bub">{pending}</p></div>
                <button type="button" className="pc-change" onClick={() => { clearPending(); setOwn(""); }}>Change question</button>
                <p className="pc-why">Log in or create an account to send this — it goes to {first} as soon as you&apos;re in.</p>
                <WidgetLogin onDone={() => { window.dispatchEvent(new Event("cyt-auth-changed")); setWho("client"); }} />
              </>
            )}
          </div>
          {!pending && (
            <form className="pc-comp" onSubmit={(e) => { e.preventDefault(); if (own.trim()) pick(own.trim().slice(0, 500)); }}>
              <input {...NOFILL} name="cyt-pchat-question" value={own} onChange={(e) => setOwn(e.target.value)} maxLength={500} placeholder="Or type your question…" aria-label="Your question" />
              <button type="submit" disabled={!own.trim()} aria-label="Next">Send</button>
            </form>
          )}
        </div>
      );
    }
    if (consent === false) {
      return (
        <div className="pc-msgs">
          <div className="pc-consent">
            <b>Before you start</b>
            <ul>
              <li>Your messages go to {first} and are stored encrypted.</li>
              <li>CYT&apos;s clinical team may review chats for quality and safety; every review is recorded.</li>
              <li>Not for emergencies — call <a href="tel:112">112</a> or Tele-MANAS <a href="tel:14416">14416</a>.</li>
            </ul>
            <button type="button" onClick={async () => { try { await postData(`${API}/consent`, {}); setConsent(true); } catch { setErr("Couldn't save — try again"); } }}>I agree — start chatting</button>
            {err && <p className="pc-err">{err}</p>}
          </div>
        </div>
      );
    }
    return (
      <>
        <div className="pc-msgs" ref={box}>
          {msgs === null ? <p className="pc-note">Loading…</p> : (
            <>
              {!msgs.length && <div className="pc-row in"><p className="pc-bub">Hi 👋 Ask {first} a quick question — tap one below or type your own.</p></div>}
              {msgs.map((m) => (m.fromRole === "system" ? (
                <p key={m._id} className={`pc-sys${m.kind === "crisis-help" ? " bad" : ""}`}>{m.body}</p>
              ) : (
                <div key={m._id} className={`pc-row${m.fromRole === "client" ? " me" : " in"}`}>
                  <p className="pc-bub" title={time(m.createdAt)}>{m.deleted ? <i>Message deleted</i> : m.body}</p>
                </div>
              )))}
              {st?.canSend && !msgs.some((m) => m.fromRole === "client") && !text && (
                <div className="pc-sug" role="list">{SUGGEST.map((q) => <button type="button" role="listitem" key={q} onClick={() => send(null, q)}>{q}</button>)}</div>
              )}
            </>
          )}
        </div>
        {st?.note && <div className="pc-state"><span>{st.note}</span>{!st.canSend && onBook && <button type="button" onClick={onBook}>Book a session</button>}</div>}
        {err && <p className="pc-err">{err}</p>}
        {st?.canSend && (
          <form className="pc-comp" onSubmit={send}>
            <textarea rows={1} {...NOFILL} name="cyt-pchat-message" value={text} maxLength={2000} placeholder={st.mode === "pre" ? "Ask your one question…" : "Message"} aria-label="Message"
              onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(110, e.target.scrollHeight)}px`; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) send(e); }} />
            <button type="submit" disabled={!text.trim() || busy} aria-label="Send">Send</button>
          </form>
        )}
      </>
    );
  })();

  return createPortal((
    <>
      <style>{CSS}</style>
      {phone && <div className="pc-under" aria-hidden="true" />}
      {!phone && <div className="pc-scrim" onClick={onClose} aria-hidden="true" />}
      <div className={`pc${phone ? " phone" : ""}${vv?.kb ? " kb" : ""}`} style={sheetStyle} role="dialog" aria-modal="true" aria-label={`Chat with ${name || "the therapist"}`}>
        <header className="pc-h">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <span className="pc-av">{av ? <img src={av} alt="" /> : (name || "?").slice(0, 1)}</span>
          <span className="pc-who"><b>{name || "Therapist"}</b><small>{st?.hours ? `Replies ${st.hours}` : "Ask a quick question before you book"}</small></span>
          <button type="button" className="pc-x" onClick={onClose} aria-label="Close">×</button>
        </header>
        {body}
      </div>
    </>
  ), document.body);
}

const CSS = `
.pc-scrim { position: fixed; inset: 0; z-index: 100000; background: rgba(15,23,42,.18); }
.pc { position: fixed; z-index: 100001; right: 24px; bottom: 24px; width: min(390px, calc(100vw - 48px)); height: min(620px, calc(100vh - 110px));
  display: flex; flex-direction: column; background: #fff; border-radius: 22px; overflow: hidden; box-shadow: 0 30px 70px -24px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.05);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, sans-serif; color: #1c1c1e; animation: pcIn .25s cubic-bezier(.2,.9,.3,1.1); }
.pc.phone { left: 0; right: 0; top: 0; bottom: auto; width: auto; height: 100dvh; border-radius: 0; box-shadow: none; animation: pcSheet .25s ease; }
.pc-under { position: fixed; z-index: 100000; left: 0; right: 0; top: 0; height: 100vh; height: 100lvh; background: #fff; }
@keyframes pcIn { from { opacity: 0; transform: translateY(14px) scale(.97); } }
@keyframes pcSheet { from { opacity: 0; transform: translateY(24px); } }
.pc-h { position: relative; flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; min-height: 64px; padding: 12px 12px 10px 14px; border-bottom: 1px solid rgba(60,60,67,.12); background: #fff; }
.pc.phone .pc-h { padding-top: calc(10px + env(safe-area-inset-top, 0px)); } .pc.phone .pc-x { top: calc(50% + env(safe-area-inset-top, 0px) / 2); }
.pc-av { flex: none; width: 40px; height: 40px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: linear-gradient(160deg, #d9f2e3, #a7dcbc); color: #14532d; font-weight: 800; }
.pc-av img { width: 100%; height: 100%; object-fit: cover; }
.pc-who { min-width: 0; max-width: calc(100% - 90px); display: flex; flex-direction: column; align-items: center; line-height: 1.25; }
.pc-who b { font-size: 15.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pc-who small { font-size: 12.5px; color: #34a853; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pc .pc-x { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); flex: none; width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f2f2f7; color: #6e6e73; font-size: 20px; line-height: 1; cursor: pointer; padding: 0; }
.pc-guest { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.pc-msgs { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 12px 14px 8px; display: flex; flex-direction: column; gap: 6px; }
.pc-row { display: flex; } .pc-row.me { justify-content: flex-end; }
.pc .pc-bub { margin: 0; max-width: 80%; padding: 8px 12px; border-radius: 18px; font-size: 15px; line-height: 1.35; white-space: pre-wrap; overflow-wrap: anywhere; }
.pc-row.in .pc-bub { background: #e9e9eb; color: #000; } .pc-row.me .pc-bub { background: #34c759; color: #fff; }
.pc-sys { align-self: center; max-width: 90%; margin: 4px 0; padding: 6px 10px; border-radius: 12px; background: #fff8e6; color: #7a5a00; font-size: 12.5px; text-align: center; }
.pc-sys.bad { background: #fff1f1; color: #b42318; }
.pc-sug { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-top: 4px; }
.pc .pc-sug button { max-width: 90%; border: 1px solid #c7e7d1; background: #fff; color: #15803d; border-radius: 18px; padding: 8px 12px; font: inherit; font-size: 14px; font-weight: 600; text-align: right; cursor: pointer; line-height: 1.3; }
.pc .pc-sug button:hover { background: #effaf2; }
.pc .pc-change { align-self: flex-end; border: 0; background: none; padding: 0 4px; font: inherit; font-size: 12.5px; color: #0a84ff; cursor: pointer; }
.pc .pc-why { margin: 6px 0 4px; font-size: 13px; color: #6e6e73; }
.pc-comp { flex: none; display: flex; align-items: flex-end; gap: 8px; padding: 8px 12px 12px; border-top: 1px solid rgba(60,60,67,.1); background: #fff; }
.pc.phone .pc-comp { padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
.pc.phone.kb .pc-comp { padding-bottom: 8px; } /* keyboard up: right on top of it */
.pc .pc-comp textarea, .pc .pc-comp input { flex: 1; min-width: 0; resize: none; max-height: 110px; min-height: 40px; border: 1px solid #d1d1d6; border-radius: 20px; padding: 9px 14px; font: inherit; font-size: 16px; line-height: 1.35; background: #fff; outline: none; box-sizing: border-box; }
.pc .pc-comp button { flex: none; width: 38px; height: 38px; border: 0; border-radius: 50%; background: #34c759; color: #fff; display: grid; place-items: center; cursor: pointer; padding: 0; margin-bottom: 1px; }
.pc .pc-comp button:disabled { background: #c7c7cc; }
.pc-state { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: #f6faf7; border-top: 1px solid rgba(60,60,67,.08); font-size: 12.5px; color: #3c3c43; line-height: 1.4; }
.pc-state span { flex: 1; }
.pc .pc-state button { flex: none; height: 32px; padding: 0 12px; border: 0; border-radius: 999px; background: #14532d; color: #fff; font: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer; }
.pc-note { margin: 16px; color: #8e8e93; font-size: 14px; }
.pc-err { flex: none; margin: 0; padding: 6px 14px; color: #b42318; font-size: 13px; }
.pc-consent { padding: 4px 2px; font-size: 14px; color: #3c3c43; }
.pc-consent b { font-size: 16px; color: #1c1c1e; } .pc-consent ul { margin: 8px 0 12px; padding-left: 18px; display: grid; gap: 4px; }
.pc .pc-consent button { width: 100%; height: 44px; border: 0; border-radius: 13px; background: #34c759; color: #fff; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
/* "Send" written on the button, beside the typing box (owner, 2026-11-24) */
.pc .pc-comp { display: flex !important; align-items: flex-end; gap: 8px; }
.pc .pc-comp textarea, .pc .pc-comp input { flex: 1; min-width: 0; padding-right: 14px !important; }
.pc .pc-comp button[type="submit"] { position: static !important; flex: none; width: auto !important; height: 38px !important; min-width: 64px; padding: 0 16px !important; border-radius: 19px !important; border: 0;
  background: #34c759; color: #fff; font: inherit; font-size: 15px; font-weight: 700; letter-spacing: .01em; display: inline-flex !important; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 1px; }
.pc .pc-comp button[type="submit"]:disabled { background: #c7c7cc; color: #fff; }

`;
