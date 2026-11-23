import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchById, postData, putData, deleteById } from "../../utils/actions";
import { apiUrl, imagePath } from "../../utils/url";
import { getToken } from "../../utils/jwt";

/* Live chat (2026-11-23) — one app for therapists (/therapists/messages) and clients (/client/messages).
   Desktop / iPad landscape: chat list + conversation side by side. Phones / iPad portrait: the list, then the
   conversation full screen with a back button. Live over SSE (/api/live-chat/stream). Rules live on the server
   (cyt_backend_api helper/chatRules.js): one question before booking, open until 15 days after the last
   session, phone / email / links hidden, office hours auto-reply, crisis help. */

const API = `${apiUrl}/live-chat`;
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);
const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const timeOf = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).toLowerCase();
const dayKey = (d) => new Date(new Date(d).getTime() + 5.5 * 36e5).toISOString().slice(0, 10);
const dayLabel = (d) => {
  const k = dayKey(d), today = dayKey(new Date()), y = dayKey(new Date(Date.now() - 864e5));
  if (k === today) return "Today"; if (k === y) return "Yesterday";
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
};
const listTime = (d) => (!d ? "" : dayKey(d) === dayKey(new Date()) ? timeOf(d) : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }));
const QUICK = ["Please book a session so we can talk properly.", "I've shared a worksheet in your dashboard.", "Thanks — let's go over this in our next session.", "Take care. If it gets too much, call Tele-MANAS 14416."];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Avatar({ p, size = 44 }) {
  const src = photoOf(p?.photo);
  return (
    <span className="lc-av" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : <b>{initials(p?.name)}</b>}
      {p?.online && <i className="lc-on" aria-label="Online" />}
    </span>
  );
}

function Consent({ role, onAgree }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="lc-consent">
      <span className="lc-consent-ic" aria-hidden="true">💬</span>
      <h2>Before you start messaging</h2>
      <ul>
        <li><b>Private.</b> Messages are stored encrypted and are between you and {role === "therapist" ? "your client" : "your therapist"}.</li>
        <li><b>Quality & safety.</b> CYT&apos;s clinical team may review conversations to keep care safe and professional. Every review is recorded.</li>
        <li><b>Stay on CYT.</b> Phone numbers, emails and outside links are hidden automatically.</li>
        <li><b>Not for emergencies.</b> If you or someone is in danger, call <a href="tel:112">112</a> or Tele-MANAS <a href="tel:14416">14416</a>.</li>
        {role === "client" && <li><b>How it works.</b> Ask one question before booking. After you book, messages stay open until 15 days after your last session.</li>}
      </ul>
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await postData(`${API}/consent`, {}); onAgree(); } catch { setBusy(false); } }}>{busy ? "Saving…" : "I agree — start messaging"}</button>
      <small>See our <Link href="/privacy-policy">privacy policy</Link>.</small>
    </div>
  );
}

function Settings({ onClose }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState("");
  useEffect(() => { fetchById(`${API}/settings`).then((r) => r?.status && setS(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    const b = document.body, y = window.scrollY, prev = b.style.cssText;
    b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.width = "100%"; b.style.overflow = "hidden";
    return () => { b.style.cssText = prev; window.scrollTo(0, y); };
  }, []);
  const save = async () => {
    setSaving("Saving…");
    try { const r = await putData(`${API}/settings`, s); if (r?.status) { setS(r.data); setSaving("Saved ✓"); setTimeout(onClose, 500); } else setSaving("Couldn't save"); } catch { setSaving("Couldn't save"); }
  };
  return createPortal((
    <div className="lc-scrim" role="dialog" aria-modal="true" aria-label="Message settings" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{CSS}</style>
      <div className="lc-sheet">
        <button type="button" className="lc-x" onClick={onClose} aria-label="Close">×</button>
        <h3>Message settings</h3>
        {!s ? <p className="lc-muted">Loading…</p> : (
          <>
            <label className="lc-switch">
              <span><b>Accept messages</b><small>Off: clients can still read old messages, but can&apos;t send new ones.</small></span>
              <input type="checkbox" checked={s.enabled !== false} onChange={(e) => setS({ ...s, enabled: e.target.checked })} />
              <i aria-hidden="true" />
            </label>
            <div className="lc-f">
              <b>Office hours</b>
              <small>Outside these hours clients get an automatic reply. You won&apos;t be expected to answer.</small>
              <div className="lc-hours">
                <input type="time" value={s.start} onChange={(e) => setS({ ...s, start: e.target.value })} aria-label="From" />
                <span>to</span>
                <input type="time" value={s.end} onChange={(e) => setS({ ...s, end: e.target.value })} aria-label="To" />
              </div>
              <div className="lc-days">
                {DAYS.map((d, i) => (
                  <button type="button" key={d} className={(s.days || []).includes(i) ? "on" : ""} aria-pressed={(s.days || []).includes(i)}
                    onClick={() => setS({ ...s, days: (s.days || []).includes(i) ? s.days.filter((x) => x !== i) : [...(s.days || []), i] })}>{d}</button>
                ))}
              </div>
            </div>
            <label className="lc-f">
              <b>Auto-reply (optional)</b>
              <textarea rows={3} maxLength={400} value={s.autoReply || ""} onChange={(e) => setS({ ...s, autoReply: e.target.value })} placeholder="Thanks for your message. I reply during my working hours…" />
            </label>
            <button type="button" className="lc-save" onClick={save}>{saving || "Save settings"}</button>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

export default function ChatApp({ role }) {
  const router = useRouter();
  const [consent, setConsent] = useState(null);
  const [threads, setThreads] = useState(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null); // thread id
  const [conv, setConv] = useState(null); // { thread, state, messages, more }
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [settings, setSettings] = useState(false);
  const [live, setLive] = useState(false);
  const scroller = useRef(null);
  const activeRef = useRef(null);
  activeRef.current = active;

  const loadThreads = useCallback(() => fetchById(`${API}/threads`).then((r) => r?.status && setThreads(r.data.threads)).catch(() => setThreads((t) => t || [])), []);
  useEffect(() => {
    fetchById(`${API}/consent`).then((r) => setConsent(!!r?.data?.agreed)).catch(() => setConsent(false));
    loadThreads();
  }, [loadThreads]);

  // open from a link: ?t=<thread>  or (clients) ?to=<therapistId>
  useEffect(() => {
    if (!router.isReady) return;
    const { t, to } = router.query;
    if (t) setActive(String(t));
    else if (to && role === "client") {
      postData(`${API}/start`, { therapistId: String(to) }).then((r) => { if (r?.status) { setActive(r.data.id); router.replace({ pathname: router.pathname, query: { t: r.data.id } }, undefined, { shallow: true }); } }).catch((e) => setErr(e?.response?.data?.message || "Couldn't open the chat"));
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollDown = (smooth = false) => requestAnimationFrame(() => { const el = scroller.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" }); });
  const markRead = useCallback((id) => postData(`${API}/threads/${id}/read`, {}).then(() => setThreads((ts) => (ts || []).map((t) => (t._id === id ? { ...t, unread: 0 } : t)))).catch(() => {}), []);

  // load a conversation
  useEffect(() => {
    if (!active) { setConv(null); return; }
    setConv(null); setErr("");
    fetchById(`${API}/threads/${active}`).then((r) => {
      if (!r?.status) return setErr(r?.message || "Chat not found");
      setConv(r.data); scrollDown(); markRead(active);
      setThreads((ts) => (ts && !ts.some((t) => t._id === active) ? [r.data.thread, ...ts] : ts));
    }).catch((e) => setErr(e?.response?.data?.message || "Couldn't open this chat"));
  }, [active, markRead]);

  // live events
  useEffect(() => {
    const token = getToken();
    if (!token || typeof EventSource === "undefined") return undefined;
    const es = new EventSource(`${API}/stream?token=${encodeURIComponent(token)}`);
    es.addEventListener("hello", () => setLive(true));
    es.onerror = () => setLive(false);
    es.addEventListener("message", (e) => {
      const { threadId, message } = JSON.parse(e.data || "{}");
      if (!threadId || !message) return;
      const mine = message.fromRole === role;
      if (threadId === activeRef.current) {
        setConv((c) => (c && !c.messages.some((m) => m._id === message._id) ? { ...c, messages: [...c.messages, message] } : c));
        scrollDown(true);
        if (!mine && document.visibilityState === "visible") markRead(threadId);
      }
      setThreads((ts) => {
        const list = ts || [];
        const t = list.find((x) => x._id === threadId);
        if (!t) { loadThreads(); return list; }
        const upd = { ...t, preview: message.body, lastMessageAt: message.createdAt, lastFrom: message.fromRole, unread: mine || threadId === activeRef.current ? t.unread : (t.unread || 0) + 1 };
        return [upd, ...list.filter((x) => x._id !== threadId)];
      });
    });
    es.addEventListener("read", (e) => {
      const { threadId, by, at } = JSON.parse(e.data || "{}");
      if (threadId !== activeRef.current || by === role) return;
      setConv((c) => (c ? { ...c, messages: c.messages.map((m) => (m.fromRole === role && !m.readAt ? { ...m, readAt: at } : m)) } : c));
    });
    es.addEventListener("deleted", (e) => {
      const { threadId, id } = JSON.parse(e.data || "{}");
      if (threadId === activeRef.current) setConv((c) => (c ? { ...c, messages: c.messages.map((m) => (m._id === id ? { ...m, deleted: true, body: "" } : m)) } : c));
    });
    return () => es.close();
  }, [role, loadThreads, markRead]);

  const send = async (body) => {
    const t = (body ?? text).trim();
    if (!t || !active || sending) return;
    setSending(true); setErr("");
    try {
      const r = await postData(`${API}/threads/${active}/messages`, { text: t });
      if (r?.status) {
        setText("");
        setConv((c) => (c && !c.messages.some((m) => m._id === r.data.message._id) ? { ...c, messages: [...c.messages, r.data.message] } : c));
        scrollDown(true);
        if (r.data.masked) setErr("Phone numbers, emails and outside links are hidden to keep your conversation safe on CYT.");
        // the pre-booking question uses up the one message: refresh what's allowed next
        fetchById(`${API}/threads/${active}`).then((x) => x?.status && setConv((c) => (c ? { ...c, state: x.data.state } : c))).catch(() => {});
      }
    } catch (e) {
      const d = e?.response?.data;
      if (d?.code === "consent") setConsent(false);
      setErr(d?.message || "Couldn't send — check your internet");
      if (d?.state) setConv((c) => (c ? { ...c, state: d.state } : c));
    }
    setSending(false);
  };

  const remove = async (m) => {
    try { await deleteById(`${API}/messages/${m._id}`); setConv((c) => ({ ...c, messages: c.messages.map((x) => (x._id === m._id ? { ...x, deleted: true, body: "" } : x)) })); }
    catch (e) { setErr(e?.response?.data?.message || "Couldn't delete"); }
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (threads || []).filter((t) => !s || t.other.name.toLowerCase().includes(s));
  }, [threads, q]);

  const st = conv?.state;
  const other = conv?.thread?.other;
  const bookHref = conv?.thread?.therapistId ? `/book/${conv.thread.therapistId}` : "/client/find";

  return (
    <div className={`lc${active ? " has-active" : ""}`} data-sm-skip="">
      <style>{CSS}</style>
      {consent === false ? <Consent role={role} onAgree={() => setConsent(true)} /> : (
        <div className="lc-app">
          {/* chat list */}
          <aside className="lc-list" aria-label="Chats">
            <div className="lc-list-h">
              <h1>Messages {live && <span className="lc-live" title="Live">● Live</span>}</h1>
              {role === "therapist" && <button type="button" className="lc-gear" onClick={() => setSettings(true)} aria-label="Message settings">⚙︎</button>}
            </div>
            <label className="lc-search"><span aria-hidden="true">⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search chats" /></label>
            <div className="lc-items">
              {threads === null ? <p className="lc-muted pad">Loading…</p> : !shown.length ? (
                <div className="lc-empty">
                  <span aria-hidden="true">💬</span>
                  <b>No messages yet</b>
                  <p>{role === "therapist" ? "When a client messages you, the chat appears here." : "Ask a therapist a quick question from their profile, or message your therapist after booking."}</p>
                  {role === "client" && <Link href="/client/find" className="lc-btn">Find a therapist</Link>}
                </div>
              ) : shown.map((t) => (
                <button type="button" key={t._id} className={`lc-item${t._id === active ? " on" : ""}${t.unread ? " unread" : ""}`} onClick={() => { setActive(t._id); router.replace({ pathname: router.pathname, query: { t: t._id } }, undefined, { shallow: true }); }}>
                  <Avatar p={t.other} />
                  <span className="lc-item-m">
                    <span className="lc-item-t"><b>{t.other.name}</b><time>{listTime(t.lastMessageAt)}</time></span>
                    <span className="lc-item-p">{t.lastFrom === role ? "You: " : ""}{t.preview || "…"}</span>
                  </span>
                  {t.unread > 0 && <em className="lc-badge">{t.unread > 9 ? "9+" : t.unread}</em>}
                </button>
              ))}
            </div>
          </aside>

          {/* conversation */}
          <section className="lc-conv" aria-label="Conversation">
            {!active ? (
              <div className="lc-pick"><span aria-hidden="true">💬</span><b>Select a chat</b><p>Your conversations update live.</p></div>
            ) : !conv ? (
              <div className="lc-pick">{err ? <><b>{err}</b><button type="button" className="lc-btn" onClick={() => setActive(null)}>Back</button></> : <p>Loading…</p>}</div>
            ) : (
              <>
                <header className="lc-conv-h">
                  <button type="button" className="lc-back" onClick={() => { setActive(null); router.replace({ pathname: router.pathname }, undefined, { shallow: true }); }} aria-label="Back to chats">‹</button>
                  <Avatar p={other} size={40} />
                  <div className="lc-conv-who">
                    <b>{other.name}</b>
                    <small>{other.online ? "Online now" : role === "client" && st?.hours ? `Replies ${st.hours}` : other.title || ""}</small>
                  </div>
                  {role === "client" && <Link href={bookHref} className="lc-book">Book</Link>}
                </header>

                <div className="lc-msgs" ref={scroller}>
                  {conv.messages.length === 0 && <p className="lc-start">Say hello 👋 — {role === "client" ? "keep it short and simple." : "your reply goes to the client right away."}</p>}
                  {conv.messages.map((m, i) => {
                    const prev = conv.messages[i - 1];
                    const sep = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                    const mine = m.fromRole === role;
                    const canDel = mine && !m.deleted && Date.now() - new Date(m.createdAt).getTime() < 10 * 60000;
                    return (
                      <React.Fragment key={m._id}>
                        {sep && <div className="lc-day"><span>{dayLabel(m.createdAt)}</span></div>}
                        {m.fromRole === "system" ? (
                          <div className={`lc-sys${m.kind === "crisis-help" ? " crisis" : ""}`}><span>{m.kind === "crisis-help" ? "🆘 " : "🕐 "}{m.body}</span></div>
                        ) : (
                          <div className={`lc-row${mine ? " me" : ""}`}>
                            <div className={`lc-bub${m.deleted ? " del" : ""}${m.crisis && !mine ? " flag" : ""}`}>
                              {m.kind === "pre-question" && <em className="lc-tag">Question before booking</em>}
                              {m.deleted ? <i>This message was deleted</i> : <p>{m.body}</p>}
                              <span className="lc-meta">{timeOf(m.createdAt)}{mine && !m.deleted && <b className={m.readAt ? "read" : ""}>{m.readAt ? "✓✓" : "✓"}</b>}</span>
                              {canDel && <button type="button" className="lc-del" onClick={() => remove(m)} aria-label="Delete for everyone">×</button>}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {st?.note && (
                  <div className={`lc-note ${st.mode}`}>
                    <span>{st.note}</span>
                    {role === "client" && (st.mode !== "open") && <Link href={bookHref} className="lc-btn sm">Book a session</Link>}
                  </div>
                )}
                {err && <div className="lc-err" role="alert">{err}</div>}
                {st?.canSend && (
                  <>
                    {role === "therapist" && st.mode === "open" && !text && (
                      <div className="lc-quick">{QUICK.map((x) => <button type="button" key={x} onClick={() => setText(x)}>{x}</button>)}</div>
                    )}
                    <form className="lc-comp" onSubmit={(e) => { e.preventDefault(); send(); }}>
                      <textarea rows={1} value={text} maxLength={2000} placeholder={st.mode === "pre" && role === "client" ? "Ask your one question…" : "Message"}
                        onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`; }}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); send(); } }} aria-label="Message" />
                      <button type="submit" disabled={!text.trim() || sending} aria-label="Send">{sending ? "…" : "➤"}</button>
                    </form>
                    <small className="lc-foot">Not for emergencies — call 112 or Tele-MANAS 14416.</small>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
      {settings && <Settings onClose={() => setSettings(false)} />}
    </div>
  );
}

/* small dashboard widget: latest chats + unread, live */
export function MessagesWidget({ role }) {
  const [threads, setThreads] = useState(null);
  const href = role === "therapist" ? "/therapists/messages" : "/client/messages";
  useEffect(() => {
    const load = () => fetchById(`${API}/threads`).then((r) => r?.status && setThreads(r.data.threads)).catch(() => setThreads([]));
    load();
    const token = getToken();
    if (!token || typeof EventSource === "undefined") return undefined;
    const es = new EventSource(`${API}/stream?token=${encodeURIComponent(token)}`);
    es.addEventListener("message", load);
    es.addEventListener("read", load);
    return () => es.close();
  }, []);
  const unread = (threads || []).reduce((n, t) => n + (t.unread || 0), 0);
  return (
    <section className="chw">
      <style>{W_CSS}</style>
      <div className="chw-h">
        <span className="chw-ic" aria-hidden="true">💬</span>
        <b>Messages</b>
        {unread > 0 && <em>{unread} new</em>}
        <Link href={href} className="chw-all">Open ›</Link>
      </div>
      {threads === null ? <p className="chw-muted">Loading…</p> : !threads.length ? (
        <p className="chw-muted">{role === "therapist" ? "No messages yet. Clients can message you after booking, or ask one question from your profile." : "Message your therapist between sessions, or ask a therapist a question from their profile."}</p>
      ) : (
        <ul>
          {threads.slice(0, 3).map((t) => (
            <li key={t._id}>
              <Link href={`${href}?t=${t._id}`} className={t.unread ? "unread" : ""}>
                <Avatar p={t.other} size={36} />
                <span><b>{t.other.name}</b><small>{t.lastFrom === role ? "You: " : ""}{t.preview}</small></span>
                <time>{listTime(t.lastMessageAt)}</time>
                {t.unread > 0 && <em className="lc-badge">{t.unread}</em>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const AV_CSS = `
.lc-av { position: relative; flex: none; display: inline-grid; place-items: center; border-radius: 50%; background: linear-gradient(160deg, #d9f2e3, #a7dcbc); color: #14532d; overflow: visible; }
.lc-av img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.lc-av b { font-size: 15px; font-weight: 800; }
.lc-on { position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 2px #fff; }
.lc-badge { flex: none; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: #22a55a; color: #fff; font-style: normal; font-size: 12px; font-weight: 800; display: inline-grid; place-items: center; }
`;

const CSS = AV_CSS + `
.lc { max-width: 1200px; margin: 0 auto; color: #1c1c1e; }
.lc-app { display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); height: calc(100dvh - 150px); min-height: 520px; background: #fff; border-radius: 22px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 16px 36px -24px rgba(15,23,42,.4); }
.lc-list { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid #eef1f0; background: #fbfcfb; }
.lc-list-h { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 8px; }
.lc-list-h h1 { margin: 0; font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.lc-live { font-size: 11px; font-weight: 800; color: #16a34a; background: #e3f6ea; border-radius: 999px; padding: 3px 8px; }
.lc-gear { width: 36px; height: 36px; border-radius: 50%; border: 0; background: #eef2f0; font-size: 18px; cursor: pointer; }
.lc-search { display: flex; align-items: center; gap: 8px; margin: 0 14px 8px; padding: 0 12px; height: 38px; border-radius: 12px; background: #eef2f0; color: #8e8e93; }
.lc-search input { flex: 1; min-width: 0; border: 0 !important; background: none !important; box-shadow: none !important; font: inherit; font-size: 14.5px; height: 36px; padding: 0 !important; outline: none; }
.lc-items { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
.lc-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px; border: 0; border-radius: 14px; background: none; text-align: left; cursor: pointer; font: inherit; color: inherit; }
.lc-item:hover { background: #f0f4f2; }
.lc-item.on { background: #e5f4eb; }
.lc-item-m { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lc-item-t { display: flex; align-items: baseline; gap: 8px; }
.lc-item-t b { flex: 1; min-width: 0; font-size: 15px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-item-t time { flex: none; font-size: 12px; color: #8e8e93; }
.lc-item-p { font-size: 13.5px; color: #6e6e73; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-item.unread .lc-item-t b, .lc-item.unread .lc-item-p { color: #1c1c1e; font-weight: 800; }
.lc-empty, .lc-pick { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 30px 20px; color: #6e6e73; }
.lc-pick { height: 100%; background: radial-gradient(circle at 50% 40%, #f3faf6, #fff 60%); }
.lc-empty > span, .lc-pick > span { font-size: 38px; }
.lc-empty b, .lc-pick b { color: #1c1c1e; font-size: 16px; }
.lc-empty p, .lc-pick p { margin: 0; font-size: 14px; max-width: 300px; }
.lc-muted { color: #8e8e93; font-size: 14px; } .lc-muted.pad { padding: 16px; }
.lc-btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 16px; border-radius: 12px; border: 0; background: #14532d; color: #fff !important; font: inherit; font-size: 14px; font-weight: 800; text-decoration: none !important; cursor: pointer; margin-top: 8px; }
.lc-btn.sm { height: 34px; padding: 0 12px; font-size: 13px; margin: 0; flex: none; }
.lc-conv { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: #f4f6f5; }
.lc-conv-h { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,.92); backdrop-filter: blur(10px); border-bottom: 1px solid #eef1f0; }
.lc-back { display: none; width: 34px; height: 34px; border: 0; border-radius: 50%; background: none; font-size: 30px; line-height: 1; color: #14532d; cursor: pointer; }
.lc-conv-who { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lc-conv-who b { font-size: 16px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-conv-who small { font-size: 12.5px; color: #16a34a; }
.lc-book { flex: none; height: 34px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; background: #14532d; color: #fff !important; font-size: 13.5px; font-weight: 800; text-decoration: none !important; }
.lc-msgs { flex: 1; overflow-y: auto; padding: 14px 16px 10px; display: flex; flex-direction: column; gap: 4px; overscroll-behavior: contain; }
.lc-start { align-self: center; margin: 20px 0; font-size: 13.5px; color: #8e8e93; }
.lc-day { display: flex; justify-content: center; margin: 10px 0 6px; }
.lc-day span { font-size: 11.5px; font-weight: 700; color: #6e6e73; background: #e6ebe8; border-radius: 999px; padding: 3px 10px; }
.lc-row { display: flex; } .lc-row.me { justify-content: flex-end; }
.lc-bub { position: relative; max-width: min(76%, 560px); padding: 8px 12px 6px; border-radius: 6px 18px 18px 18px; background: #fff; box-shadow: 0 1px 1px rgba(0,0,0,.06); }
.lc-row.me .lc-bub { border-radius: 18px 6px 18px 18px; background: linear-gradient(160deg, #1f8a52, #15703f); color: #fff; }
.lc-bub p { margin: 0; font-size: 15px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.lc-bub.del i { font-size: 13.5px; opacity: .7; }
.lc-bub.flag { box-shadow: 0 0 0 2px #fca5a5; }
.lc-tag { display: block; font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; opacity: .75; margin-bottom: 2px; }
.lc-meta { display: flex; justify-content: flex-end; gap: 4px; margin-top: 2px; font-size: 11px; opacity: .7; }
.lc-meta b.read { color: #a7f3d0; } .lc-row:not(.me) .lc-meta b.read { color: #0ea5e9; }
.lc-del { position: absolute; top: -8px; left: -8px; width: 22px; height: 22px; border-radius: 50%; border: 0; background: #fff; color: #b91c1c; box-shadow: 0 2px 6px rgba(0,0,0,.2); font-size: 15px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .15s; }
.lc-bub:hover .lc-del, .lc-bub:focus-within .lc-del { opacity: 1; }
@media (hover: none) { .lc-del { opacity: .85; } }
.lc-sys { display: flex; justify-content: center; margin: 6px 0; }
.lc-sys span { max-width: 88%; font-size: 13px; line-height: 1.45; text-align: center; color: #5b4310; background: #fff7e6; border: 1px solid #f3e2bb; border-radius: 14px; padding: 8px 12px; }
.lc-sys.crisis span { color: #7f1d1d; background: #fff1f1; border-color: #fecaca; font-weight: 700; }
.lc-note { display: flex; align-items: center; gap: 10px; margin: 0 12px 8px; padding: 10px 12px; border-radius: 14px; background: #eef7f1; color: #14532d; font-size: 13.5px; line-height: 1.4; }
.lc-note.closed { background: #fff7e6; color: #5b4310; }
.lc-note span { flex: 1; }
.lc-err { margin: 0 12px 8px; padding: 8px 12px; border-radius: 12px; background: #fff1f1; color: #9b1c1c; font-size: 13px; }
.lc-quick { display: flex; gap: 6px; overflow-x: auto; padding: 0 12px 8px; scrollbar-width: none; }
.lc-quick button { flex: none; height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid #d4e5da; background: #fff; color: #14532d; font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.lc-comp { display: flex; align-items: flex-end; gap: 8px; padding: 8px 12px 6px; background: #fff; border-top: 1px solid #eef1f0; }
.lc-comp textarea { flex: 1; min-width: 0; resize: none; max-height: 140px; border: 1px solid #e3e8e5 !important; border-radius: 20px !important; padding: 10px 14px !important; font: inherit; font-size: 15px; line-height: 1.4; background: #f7f9f8 !important; outline: none; box-shadow: none !important; }
.lc-comp textarea:focus { border-color: #1f8a52 !important; background: #fff !important; }
.lc-comp button { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: #1f8a52; color: #fff; font-size: 17px; cursor: pointer; }
.lc-comp button:disabled { background: #b9d9c6; cursor: default; }
.lc-foot { display: block; padding: 0 16px 10px; background: #fff; font-size: 11.5px; color: #9aa3a0; }
.lc-consent { max-width: 560px; margin: 20px auto; padding: 26px; background: #fff; border-radius: 24px; box-shadow: 0 16px 36px -24px rgba(15,23,42,.4); text-align: center; }
.lc-consent-ic { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; font-size: 32px; background: linear-gradient(160deg, #e3f6ea, #c6ead4); }
.lc-consent h2 { margin: 12px 0 10px; font-size: 22px; font-weight: 800; }
.lc-consent ul { text-align: left; margin: 0 0 18px; padding-left: 20px; display: grid; gap: 8px; font-size: 14.5px; line-height: 1.5; color: #334155; }
.lc-consent button { width: 100%; height: 50px; border-radius: 14px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; }
.lc-consent small { display: block; margin-top: 10px; color: #8e8e93; }
.lc-scrim { position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center; padding: 16px; background: rgba(15,23,42,.45); backdrop-filter: blur(3px); overscroll-behavior: contain; }
.lc-sheet { position: relative; width: 100%; max-width: 440px; max-height: calc(100dvh - 32px); overflow-y: auto; background: #fff; border-radius: 24px; padding: 22px; }
.lc-sheet h3 { margin: 0 0 14px; font-size: 20px; font-weight: 800; }
.lc-x { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: 0; background: #f1f5f9; font-size: 20px; cursor: pointer; }
.lc-switch { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #f4f7f5; cursor: pointer; margin-bottom: 14px; }
.lc-switch span { flex: 1; display: flex; flex-direction: column; } .lc-switch small { font-size: 12.5px; color: #6e6e73; }
.lc-switch input { position: absolute; opacity: 0; pointer-events: none; }
.lc-switch i { flex: none; width: 50px; height: 30px; border-radius: 999px; background: #d1d5db; position: relative; transition: background .2s; }
.lc-switch i::after { content: ""; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
.lc-switch input:checked + i { background: #22a55a; } .lc-switch input:checked + i::after { transform: translateX(20px); }
.lc-f { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.lc-f small { font-size: 12.5px; color: #6e6e73; }
.lc-f textarea { border: 1px solid #e3e8e5; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14.5px; resize: vertical; }
.lc-hours { display: flex; align-items: center; gap: 8px; } .lc-hours input { height: 40px; border: 1px solid #e3e8e5; border-radius: 10px; padding: 0 10px; font: inherit; }
.lc-days { display: flex; flex-wrap: wrap; gap: 6px; }
.lc-days button { height: 34px; min-width: 46px; border-radius: 999px; border: 1px solid #d4e5da; background: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.lc-days button.on { background: #14532d; border-color: #14532d; color: #fff; }
.lc-save { width: 100%; height: 48px; border-radius: 14px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
/* phones + iPad portrait: one pane at a time */
@media (max-width: 899px), (max-width: 1100px) and (orientation: portrait) {
  .lc-app { grid-template-columns: minmax(0, 1fr); height: calc(100dvh - 170px); border-radius: 18px; }
  .lc.has-active .lc-list { display: none; }
  .lc:not(.has-active) .lc-conv { display: none; }
  .lc-back { display: inline-grid; place-items: center; }
  .lc-list { border-right: 0; }
}
@media (max-width: 600px) {
  .lc-app { height: calc(100dvh - 150px); border-radius: 16px; min-height: 420px; }
  .lc-bub { max-width: 84%; }
}
`;

const W_CSS = AV_CSS + `
.chw { background: #fff; border-radius: 20px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.chw-h { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.chw-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(160deg, #5ad08a, #1f8a52); font-size: 17px; }
.chw-h b { font-size: 16px; font-weight: 800; }
.chw-h em { font-style: normal; font-size: 12px; font-weight: 800; color: #fff; background: #22a55a; border-radius: 999px; padding: 2px 8px; }
.chw-all { margin-left: auto; font-size: 13.5px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
.chw-muted { margin: 4px 0; font-size: 13.5px; color: #8e8e93; line-height: 1.45; }
.chw ul { list-style: none; margin: 0; padding: 0; }
.chw li + li { border-top: 1px solid #f0f2f1; }
.chw li a { display: flex; align-items: center; gap: 10px; padding: 8px 2px; text-decoration: none !important; color: #1c1c1e !important; }
.chw li a > span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.chw li b { font-size: 14px; } .chw li small { font-size: 12.5px; color: #6e6e73; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chw li a.unread b, .chw li a.unread small { font-weight: 800; color: #1c1c1e; }
.chw li time { flex: none; font-size: 11.5px; color: #8e8e93; }
`;
