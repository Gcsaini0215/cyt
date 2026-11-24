import React, { useEffect, useRef, useState } from "react";
import { apiUrl } from "../../utils/url";
import { fetchById, postData } from "../../utils/actions";
import ClearSheet from "./clear-sheet";
import QuickAnswers from "./quick-answers";

/* The CYT Care Team chat inside the floating widget, on any page of the website (2026-11-23, owner).
   Signed-in clients write straight to the team (admin → Live Chats → Care Team); every message carries the page
   it was written from. Live: the app-wide listener (chat-notify.js) hands new messages to window.__lcMini. */

const API = `${apiUrl}/live-chat`;
const time = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).toLowerCase();

export default function SupportMini({ page, onOpenAll, head, initial, onSent, onCta }) {
  const [consent, setConsent] = useState(null);
  const [tid, setTid] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [clearing, setClearing] = useState(false);
  const [more, setMore] = useState(false);
  const [assigned, setAssigned] = useState(null); // { thread, name, at } once CYT connected them with a therapist
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => { const f = () => setReloadKey((k) => k + 1); window.addEventListener("cyt-chat-assigned", f); return () => window.removeEventListener("cyt-chat-assigned", f); }, []);
  const [loadingMore, setLoadingMore] = useState(false);
  const box = useRef(null);
  const end = () => requestAnimationFrame(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const c = await fetchById(`${API}/consent`);
        if (live) setConsent(!!c?.data?.agreed);
        const s = await postData(`${API}/support`, {});
        if (!s?.status || !live) return;
        setTid(s.data.id);
        const t = await fetchById(`${API}/threads/${s.data.id}`);
        if (!live) return;
        setMsgs(Array.isArray(t?.data?.messages) ? t.data.messages : []);
        setAssigned(t?.data?.thread?.assigned || null);
        setMore(!!t?.data?.more);
        end();
        postData(`${API}/threads/${s.data.id}/read`, {}).catch(() => {});
      } catch { if (live) { setErr("Couldn't open the chat — check your internet."); setMsgs([]); } }
    })();
    return () => { live = false; };
  }, [reloadKey]);

  // live messages for this chat land here (chat-notify.js asks before showing a pop-up)
  useEffect(() => {
    if (!tid) return undefined;
    window.__lcMini = (threadId, m) => {
      if (threadId !== tid) return false;
      // "cleared for everyone": only the marker stays on screen
      setMsgs((x) => (m.kind === "cleared" ? [m] : x && !x.some((y) => y._id === m._id) ? [...x, m] : x));
      end();
      if (m.fromRole !== "client") postData(`${API}/threads/${tid}/read`, {}).catch(() => {});
      return true;
    };
    return () => { window.__lcMini = null; };
  }, [tid]);

  // older messages, 60 at a time, keeping the place on screen
  const loadEarlier = async () => {
    if (!tid || !msgs?.length || loadingMore) return;
    setLoadingMore(true);
    const el = box.current; const before = el ? el.scrollHeight : 0;
    try {
      const r = await fetchById(`${API}/threads/${tid}`, { before: msgs[0].createdAt });
      if (r?.status) {
        setMsgs((x) => [...r.data.messages.filter((m) => !(x || []).some((y) => y._id === m._id)), ...(x || [])]);
        setMore(!!r.data.more);
        requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - before; });
      }
    } catch { /* keep what's shown */ }
    setLoadingMore(false);
  };

  const send = async (e, given) => {
    e?.preventDefault();
    const t = (given || text).trim();
    if (!t || !tid || busy) return;
    setBusy(true); setErr("");
    try {
      const r = await postData(`${API}/threads/${tid}/messages`, { text: t, page });
      if (r?.status) { if (!given) setText(""); if (given && onSent) onSent(); setMsgs((x) => (x && !x.some((y) => y._id === r.data.message._id) ? [...x, r.data.message] : x)); end(); }
    } catch (x) {
      const d = x?.response?.data;
      if (d?.code === "consent") setConsent(false);
      setErr(d?.message || "Couldn't send — try again");
    }
    setBusy(false);
  };

  const sentInitial = useRef(false);
  useEffect(() => {
    if (!initial || sentInitial.current || consent !== true || !tid || msgs === null) return;
    sentInitial.current = true;
    send(null, initial);
  }, [initial, consent, tid, msgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const headEl = head ? head({ tid, onClear: () => setClearing(true), onFull: () => tid && onOpenAll(tid) }) : null;

  if (consent === false) {
    return (
      <>
      {headEl}
      <div className="lsm-consent">
        <b>Before you start</b>
        <ul>
          <li>Your messages go to the CYT Care Team and are stored encrypted.</li>
          <li>Our clinical team may review chats for quality and safety; every review is recorded.</li>
          <li>Not for emergencies — call <a href="tel:112">112</a> or Tele-MANAS <a href="tel:14416">14416</a>.</li>
        </ul>
        <button type="button" onClick={async () => { try { await postData(`${API}/consent`, {}); setConsent(true); } catch { setErr("Couldn't save — try again"); } }}>I agree — start chatting</button>
        {err && <p className="lsm-err">{err}</p>}
      </div>
      </>
    );
  }

  return (
    <>
    {headEl}
    <div className="lsm">
      <div className="lsm-msgs" ref={box} onScroll={(e) => { if (e.currentTarget.scrollTop < 40 && more && !loadingMore) loadEarlier(); }}>
        {more && <button type="button" className="lsm-earlier" disabled={loadingMore} onClick={loadEarlier}>{loadingMore ? "Loading…" : "Load earlier messages"}</button>}
        {assigned && (
          <div className="lsm-conn">
            <b>You&apos;re connected with {assigned.name} 🎉</b>
            <span>Chat with them directly — they&apos;ll reply in your Messages.</span>
            <button type="button" onClick={() => onOpenAll(assigned.thread)}>Chat with {assigned.name} ›</button>
            {tid && <button type="button" className="lsm-old" onClick={() => onOpenAll(tid)}>Earlier chat with the Care Team — in Messages ›</button>}
          </div>
        )}
        <div className="lsm-row in"><p className="lsm-bub">Hi 👋 Not sure who to talk to? Tell us a little about what&apos;s going on — we&apos;ll help you find the right therapist.</p></div>
        <QuickAnswers onCta={onCta} />
        {msgs === null ? <p className="lsm-muted">Loading…</p> : (assigned?.at ? msgs.filter((m) => new Date(m.createdAt) > new Date(assigned.at)) : msgs).map((m) => (
          m.fromRole === "system" ? (
            <p key={m._id} className={`lsm-sys${m.kind === "crisis-help" ? " bad" : ""}`}>{m.body}</p>
          ) : (
            <div key={m._id} className={`lsm-row${m.fromRole === "client" ? " me" : " in"}`}>
              <p className="lsm-bub" title={time(m.createdAt)}>{m.deleted ? <i>Message deleted</i> : m.body}</p>
            </div>
          )
        ))}
      </div>
      {err && <p className="lsm-err">{err}</p>}
      <form className="lsm-comp" onSubmit={send}>
        <textarea rows={1} autoComplete="off" data-lpignore="true" data-form-type="other" enterKeyHint="send" name="cyt-chat-message" value={text} maxLength={2000} placeholder="Type your message…" aria-label="Message"
          onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(110, e.target.scrollHeight)}px`; }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) send(e); }} />
        <button type="submit" disabled={!text.trim() || busy} aria-label="Send">Send</button>
      </form>
      {clearing && tid && (
        <ClearSheet threadId={tid} remove otherName="The CYT Care Team" onClose={() => setClearing(false)}
          onDone={() => { setClearing(false); fetchById(`${API}/threads/${tid}`).then((t) => setMsgs(Array.isArray(t?.data?.messages) ? t.data.messages : [])).catch(() => {}); }} />
      )}
    </div>
    </>
  );
}

export const SM_CSS = `
.lsm { display: flex; flex-direction: column; min-height: 0; }
.lsm-msgs { height: min(340px, 46vh); overflow-y: auto; padding: 6px 2px 8px; display: flex; flex-direction: column; gap: 4px; overscroll-behavior: contain; }
.lsm-row { display: flex; } .lsm-row.me { justify-content: flex-end; }
.lsm-bub { margin: 0; max-width: 82%; padding: 7px 12px; border-radius: 18px; font-size: 14.5px; line-height: 1.38; background: #e9e9eb; color: #000; white-space: pre-wrap; overflow-wrap: anywhere; }
.lsm-row.me .lsm-bub { background: linear-gradient(180deg, #3bd16a, #2fb457); color: #fff; }
.lsm-sys { margin: 6px 8px; text-align: center; font-size: 11.5px; color: #8e8e93; line-height: 1.4; }
.lsm-sys.bad { color: #c41e16; background: #fff1f0; border-radius: 12px; padding: 7px 10px; font-weight: 700; }
.lsm-earlier { align-self: center; margin: 2px 0 8px; height: 28px; padding: 0 12px; border: 0; border-radius: 999px; background: #f2f2f7; color: #0a84ff; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.lsm-muted { margin: 10px; font-size: 13px; color: #8e8e93; text-align: center; }
.lsm-err { margin: 4px 2px; font-size: 12.5px; color: #c41e16; }
.lsm-comp { position: relative; margin-top: 6px; }
.lsm-comp textarea { width: 100%; box-sizing: border-box; resize: none; border: 1px solid rgba(60,60,67,.25); border-radius: 19px; padding: 9px 44px 9px 14px; font: inherit; font-size: 15px; line-height: 1.35; background: #fff; outline: none; min-height: 40px; }
.lsm-comp textarea:focus { border-color: rgba(60,60,67,.4); }
.lsm-comp button { position: absolute; right: 6px; bottom: 6px; width: 30px; height: 30px; border-radius: 50%; border: 0; background: #34c759; color: #fff; display: grid; place-items: center; cursor: pointer; }
.lsm-comp button:disabled { background: #c7c7cc; }
.lsm-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; font-size: 11px; color: #aeaeb2; }
.lsm-acts { display: inline-flex; gap: 12px; } .lsm-foot .lsm-clr { color: #8e8e93; }
.lsm-foot button { border: 0; background: none; padding: 0; font: inherit; font-size: 12.5px; font-weight: 700; color: #0a84ff; cursor: pointer; }
.lsm-consent { padding: 4px 4px 2px; font-size: 13.5px; color: #3c3c43; }
.lsm-consent b { font-size: 15px; color: #1c1c1e; } .lsm-consent ul { margin: 8px 0 12px; padding-left: 18px; display: grid; gap: 5px; line-height: 1.45; }
.lsm-consent button { width: 100%; height: 42px; border: 0; border-radius: 13px; background: #34c759; color: #fff; font: inherit; font-size: 14.5px; font-weight: 700; cursor: pointer; }
/* "Send" written on the button, beside the typing box (owner, 2026-11-24) */
.lsm-comp { display: flex !important; align-items: flex-end; gap: 8px; }
.lsm-comp textarea { flex: 1; min-width: 0; padding-right: 14px !important; }
.lsm-comp button[type="submit"] { position: static !important; flex: none; width: auto !important; height: 38px !important; min-width: 64px; padding: 0 16px !important; border-radius: 19px !important; border: 0;
  background: #34c759; color: #fff; font: inherit; font-size: 15px; font-weight: 700; letter-spacing: .01em; display: inline-flex !important; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 1px; }
.lsm-comp button[type="submit"]:disabled { background: #c7c7cc; color: #fff; }

/* connected with a therapist (owner, 2026-11-24) */
.lsm-conn { display: flex; flex-direction: column; gap: 4px; margin: 0 0 10px; padding: 12px; border-radius: 16px; background: #eefaf2; border: 1px solid #c9ead5; }
.lsm-conn b { font-size: 14.5px; color: #14532d; } .lsm-conn span { font-size: 13px; color: #3c3c43; }
.lsm-conn button { margin-top: 6px; height: 38px; border: 0; border-radius: 12px; background: #34c759; color: #fff; font: inherit; font-size: 14.5px; font-weight: 700; cursor: pointer; }
.lsm-conn button.lsm-old { height: auto; margin-top: 2px; padding: 4px 0; background: none; color: #0a84ff; font-size: 12.5px; font-weight: 600; text-align: left; }

`;
