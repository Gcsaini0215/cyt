import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchById, postData } from "../../../utils/actions";
import { chatConversationsUrl, chatThreadUrl, chatTherapistSendUrl } from "../../../utils/url";

const fmt = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const now  = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
  return date.toLocaleDateString("en-IN", { day:"2-digit", month:"short" });
};

const fmtTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });

export default function ChatInbox() {
  const [convos,    setConvos]    = useState([]);
  const [active,    setActive]    = useState(null); // selected conversation
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const bottomRef   = useRef(null);
  const pollRef     = useRef(null);
  const threadPoll  = useRef(null);

  const loadConvos = useCallback(async () => {
    try {
      const r = await fetchById(chatConversationsUrl);
      if (r?.success) setConvos(r.data || []);
    } catch {}
    setLoading(false);
  }, []);

  const loadThread = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const r = await fetchById(`${chatThreadUrl}?userId=${userId}`);
      if (r?.success) {
        setMessages(r.data || []);
        // refresh convos to clear unread badge
        loadConvos();
      }
    } catch {}
  }, [loadConvos]);

  useEffect(() => {
    loadConvos();
    pollRef.current = setInterval(loadConvos, 5000);
    return () => clearInterval(pollRef.current);
  }, [loadConvos]);

  useEffect(() => {
    if (!active) return;
    loadThread(active.userId?._id || active.userId);
    threadPoll.current = setInterval(() => loadThread(active.userId?._id || active.userId), 4000);
    return () => clearInterval(threadPoll.current);
  }, [active, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const selectConvo = (c) => {
    setActive(c);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending || !active) return;
    const text = input.trim();
    const userId = active.userId?._id || active.userId;
    setInput("");
    setSending(true);
    setMessages(p => [...p, { _id: Date.now(), sender:"therapist", message:text, createdAt:new Date() }]);
    try {
      await postData(chatTherapistSendUrl, { userId, message: text });
      await loadThread(userId);
    } catch {}
    setSending(false);
  };

  const activeUser = active?.user || active?.lastMessage?.userId;
  const activeName = activeUser?.name || "Client";
  const activeEmail = activeUser?.email || "";

  return (
    <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:16, marginBottom:20, overflow:"hidden", display:"flex", height:480 }}>

      {/* ── Left: conversation list ── */}
      <div style={{ width:220, borderRight:"1.5px solid #f1f5f9", display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* Header */}
        <div style={{ padding:"13px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="15" height="15" fill="none" stroke="#3b82f6" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>Messages</span>
          {convos.reduce((s,c) => s + (c.unread||0), 0) > 0 && (
            <span style={{ marginLeft:"auto", fontSize:10, fontWeight:800, background:"#ef4444", color:"#fff", borderRadius:10, padding:"1px 6px" }}>
              {convos.reduce((s,c) => s + (c.unread||0), 0)}
            </span>
          )}
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {loading && (
            <div style={{ padding:20, textAlign:"center", color:"#94a3b8", fontSize:12 }}>Loading…</div>
          )}
          {!loading && convos.length === 0 && (
            <div style={{ padding:24, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
              <div style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>No messages yet</div>
              <div style={{ fontSize:11, color:"#cbd5e1", marginTop:3 }}>Clients can chat from your profile</div>
            </div>
          )}
          {convos.map((c, i) => {
            const user = c.user || c.lastMessage?.userId;
            const name = user?.name || "Client";
            const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
            const isActive = active && (active.userId?._id || active.userId) === (c.userId?._id || c.userId);
            const preview = c.lastMessage?.message || "";
            const isFromClient = c.lastMessage?.sender === "user";

            return (
              <div key={i} onClick={() => selectConvo(c)}
                style={{ padding:"10px 12px", cursor:"pointer", background: isActive ? "#eff6ff" : "transparent", borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent", transition:"all 0.12s", display:"flex", gap:9, alignItems:"flex-start" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="#f8fafc"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}>
                {/* Avatar — NO name/email shown */}
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>
                  {initials}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {/* Show "Anonymous User" until therapist opens the chat */}
                      {isActive ? name : "Client"}
                    </div>
                    <div style={{ fontSize:9, color:"#94a3b8", flexShrink:0, marginLeft:4 }}>{fmt(c.lastMessage?.createdAt)}</div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
                    <div style={{ fontSize:11, color: isFromClient ? "#475569" : "#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                      {isFromClient ? "" : "You: "}{preview.slice(0, 30)}{preview.length > 30 ? "…" : ""}
                    </div>
                    {c.unread > 0 && (
                      <span style={{ fontSize:9, fontWeight:800, background:"#3b82f6", color:"#fff", borderRadius:10, padding:"1px 5px", flexShrink:0, marginLeft:4 }}>{c.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: chat thread ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {!active ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#94a3b8" }}>
            <svg width="40" height="40" fill="none" stroke="#e2e8f0" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom:10 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div style={{ fontSize:13, fontWeight:600 }}>Select a conversation</div>
            <div style={{ fontSize:11, marginTop:3 }}>to read and reply to messages</div>
          </div>
        ) : (
          <>
            {/* Thread header — shows name only after selection */}
            <div style={{ padding:"11px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"#fafbfc" }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>
                {activeName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>{activeName}</div>
                {activeEmail && <div style={{ fontSize:10, color:"#94a3b8" }}>{activeEmail}</div>}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 8px", display:"flex", flexDirection:"column", gap:8, background:"#f8fafc" }}>
              {messages.length === 0 && (
                <div style={{ textAlign:"center", color:"#94a3b8", fontSize:12, marginTop:40 }}>
                  No messages in this thread yet
                </div>
              )}
              {messages.map((m, i) => {
                const isMe = m.sender === "therapist";
                return (
                  <div key={m._id || i} style={{ display:"flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    {!isMe && (
                      <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:11, flexShrink:0, marginRight:7, alignSelf:"flex-end" }}>
                        {activeName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ maxWidth:"70%" }}>
                      <div style={{
                        padding:"9px 12px",
                        borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        background: isMe ? "linear-gradient(135deg,#228756,#16a34a)" : "#fff",
                        color: isMe ? "#fff" : "#0f172a",
                        fontSize:13, lineHeight:1.55, fontWeight:500,
                        boxShadow: isMe ? "0 2px 8px rgba(34,135,86,0.2)" : "0 2px 6px rgba(0,0,0,0.07)",
                        border: isMe ? "none" : "1px solid #e9eef4",
                        wordBreak:"break-word",
                      }}>
                        {m.message}
                      </div>
                      <div style={{ fontSize:10, color:"#94a3b8", marginTop:2, textAlign: isMe ? "right" : "left" }}>
                        {fmtTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            <form onSubmit={handleSend} style={{ display:"flex", gap:8, padding:"10px 12px", borderTop:"1.5px solid #e9eef4", flexShrink:0, background:"#fff" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Reply to ${activeName}…`}
                style={{ flex:1, border:"1.5px solid #e2e8f0", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none", color:"#0f172a", background:"#f8fafc" }}
                autoFocus
              />
              <button type="submit" disabled={!input.trim() || sending}
                style={{ width:38, height:38, borderRadius:10, background: input.trim() ? "linear-gradient(135deg,#228756,#16a34a)" : "#e2e8f0", border:"none", cursor: input.trim() ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
