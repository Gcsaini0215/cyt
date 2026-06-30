import React, { useState, useEffect, useRef, useCallback } from "react";
import { isAuthenticated, getDecodedToken, setToken } from "../../utils/jwt";
import { postData, fetchById } from "../../utils/actions";
import { loginUrl, verifyOtpUrl, getUserUrl, chatMessagesUrl, chatSendUrl } from "../../utils/url";

/* ── OTP Login Panel ─────────────────────────────────────────── */
function OTPLogin({ onSuccess }) {
  const [step,     setStep]     = useState("email"); // email | otp | name
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Valid email required"); return; }
    setError(""); setLoading(true);
    try {
      const r = await postData(loginUrl, { email: email.trim().toLowerCase() });
      if (r?.status) { setStep("otp"); setCooldown(60); }
      else setError(r?.message || "Failed to send OTP");
    } catch { setError("Network error. Try again."); }
    setLoading(false);
  };

  const handleOtpKey = (e, i) => {
    if (e.key === "Backspace" && !e.target.value && i > 0) otpRefs[i - 1].current?.focus();
  };

  const handleOtpChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = otp.split("");
    arr[i] = val;
    const next = arr.join("").padEnd(6, " ").slice(0, 6).replace(/ /g, "");
    setOtp(arr.slice(0, 6).join(""));
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.replace(/\s/g, "");
    if (code.length !== 6) { setError("Enter 6-digit OTP"); return; }
    setError(""); setLoading(true);
    try {
      const r = await postData(verifyOtpUrl, { email: email.trim().toLowerCase(), otp: code });
      if (r?.status && r?.token) {
        setToken(r.token);
        // fetch user to check if name exists
        const user = await fetchById(getUserUrl);
        if (!user?.data?.name || user.data.name === "User") {
          setStep("name");
        } else {
          onSuccess();
        }
      } else {
        setError(r?.message || "Invalid OTP");
      }
    } catch { setError("Network error. Try again."); }
    setLoading(false);
  };

  const saveName = async (e) => {
    e?.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setError(""); setLoading(true);
    try {
      await postData(`${getUserUrl.replace("get-user", "update-user")}`, { name: name.trim() });
      onSuccess();
    } catch { onSuccess(); } // proceed even if update fails
    setLoading(false);
  };

  const S = { width:"100%", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"11px 14px", fontSize:14, color:"#0f172a", outline:"none", boxSizing:"border-box", background:"#fafbfc" };

  return (
    <div style={{ padding:"28px 24px", display:"flex", flexDirection:"column", gap:0 }}>
      <div style={{ fontSize:18, fontWeight:800, color:"#0f172a", marginBottom:4 }}>
        {step === "email" ? "Start Chatting" : step === "otp" ? "Verify OTP" : "Your Name"}
      </div>
      <div style={{ fontSize:13, color:"#64748b", marginBottom:22, lineHeight:1.5 }}>
        {step === "email" && "Login with your email to send a message to this therapist."}
        {step === "otp"   && <>OTP sent to <b>{email}</b>. Check your inbox.</>}
        {step === "name"  && "One last step — what should we call you?"}
      </div>

      {step === "email" && (
        <form onSubmit={sendOtp} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email address" style={S} autoFocus />
          {error && <div style={{ fontSize:12, color:"#ef4444" }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding:"12px", background:"linear-gradient(135deg,#228756,#16a34a)", border:"none", borderRadius:11, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(34,135,86,0.3)" }}>
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            {[0,1,2,3,4,5].map(i => (
              <input key={i} ref={otpRefs[i]}
                maxLength={1} inputMode="numeric"
                value={otp[i] || ""}
                onChange={e => handleOtpChange(e, i)}
                onKeyDown={e => handleOtpKey(e, i)}
                style={{ width:42, height:48, textAlign:"center", fontSize:20, fontWeight:800, border:"1.5px solid #e2e8f0", borderRadius:10, outline:"none", color:"#0f172a" }}
              />
            ))}
          </div>
          {error && <div style={{ fontSize:12, color:"#ef4444", textAlign:"center" }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding:"12px", background:"linear-gradient(135deg,#228756,#16a34a)", border:"none", borderRadius:11, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>
          <button type="button" onClick={() => setStep("email")} style={{ background:"none", border:"none", fontSize:12, color:"#64748b", cursor:"pointer", textDecoration:"underline" }}>
            ← Change email
          </button>
          {cooldown > 0 ? (
            <div style={{ fontSize:12, color:"#94a3b8", textAlign:"center" }}>Resend OTP in {cooldown}s</div>
          ) : (
            <button type="button" onClick={sendOtp} style={{ background:"none", border:"none", fontSize:12, color:"#228756", cursor:"pointer", fontWeight:700 }}>
              Resend OTP
            </button>
          )}
        </form>
      )}

      {step === "name" && (
        <form onSubmit={saveName} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={S} autoFocus />
          {error && <div style={{ fontSize:12, color:"#ef4444" }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding:"12px", background:"linear-gradient(135deg,#228756,#16a34a)", border:"none", borderRadius:11, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>
            {loading ? "Saving…" : "Continue to Chat"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Chat Box ─────────────────────────────────────────────────── */
export default function ChatBox({ therapistId, therapistName, therapistPhoto, onClose, isMobile }) {
  const [authed,   setAuthed]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [userName, setUserName] = useState("");
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated()) return;
    const user = await fetchById(getUserUrl).catch(() => null);
    if (user?.data) {
      setUserName(user.data.name || "You");
      setAuthed(true);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const r = await fetchById(`${chatMessagesUrl}?therapistId=${therapistId}`);
      if (r?.success) setMessages(r.data || []);
    } catch {}
  }, [therapistId]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!authed) return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [authed, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    // optimistic
    setMessages(p => [...p, { _id: Date.now(), sender: "user", message: text, createdAt: new Date() }]);
    try {
      await postData(chatSendUrl, { therapistId, message: text });
      await loadMessages();
    } catch {}
    setSending(false);
  };

  const fmt = (d) => {
    const date = new Date(d);
    return date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
  };

  const containerStyle = isMobile ? {
    position:"fixed", bottom:0, left:0, right:0, zIndex:1200,
    background:"#fff", borderRadius:"20px 20px 0 0",
    boxShadow:"0 -8px 40px rgba(0,0,0,0.18)",
    display:"flex", flexDirection:"column", maxHeight:"85vh",
  } : {
    position:"fixed", bottom:24, left:24, zIndex:1200,
    width:360, height:520,
    background:"#fff", borderRadius:20,
    boxShadow:"0 12px 50px rgba(0,0,0,0.18)",
    display:"flex", flexDirection:"column",
    border:"1.5px solid #e2e8f0",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", background:"linear-gradient(135deg,#0a2e1c,#155e36)", borderRadius: isMobile ? "20px 20px 0 0" : "20px 20px 0 0", flexShrink:0 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", overflow:"hidden", border:"2px solid rgba(255,255,255,0.3)", flexShrink:0 }}>
          {therapistPhoto
            ? <img src={therapistPhoto} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <div style={{ width:"100%", height:"100%", background:"#228756", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:15 }}>{therapistName?.[0]}</div>
          }
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{therapistName}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>Therapist · Usually replies in a few hours</div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", border:"none", borderRadius:8, width:30, height:30, color:"rgba(255,255,255,0.8)", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
      </div>

      {!authed ? (
        <div style={{ flex:1, overflowY:"auto" }}>
          <OTPLogin onSuccess={() => { checkAuth(); }} />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 8px", display:"flex", flexDirection:"column", gap:8, background:"#f8fafc" }}>
            {messages.length === 0 && (
              <div style={{ textAlign:"center", color:"#94a3b8", fontSize:13, marginTop:40 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>👋</div>
                Say hello to {therapistName}!<br />
                <span style={{ fontSize:11 }}>They typically reply within a few hours.</span>
              </div>
            )}
            {messages.map((m, i) => {
              const isUser = m.sender === "user";
              return (
                <div key={m._id || i} style={{ display:"flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  {!isUser && (
                    <div style={{ width:28, height:28, borderRadius:"50%", overflow:"hidden", flexShrink:0, marginRight:7, alignSelf:"flex-end" }}>
                      {therapistPhoto
                        ? <img src={therapistPhoto} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <div style={{ width:"100%", height:"100%", background:"#228756", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:12 }}>{therapistName?.[0]}</div>
                      }
                    </div>
                  )}
                  <div style={{ maxWidth:"72%" }}>
                    <div style={{
                      padding:"9px 13px", borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isUser ? "linear-gradient(135deg,#228756,#16a34a)" : "#fff",
                      color: isUser ? "#fff" : "#0f172a",
                      fontSize:13, lineHeight:1.55, fontWeight:500,
                      boxShadow: isUser ? "0 2px 8px rgba(34,135,86,0.25)" : "0 2px 6px rgba(0,0,0,0.07)",
                      border: isUser ? "none" : "1px solid #e9eef4",
                      wordBreak:"break-word",
                    }}>
                      {m.message}
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:3, textAlign: isUser ? "right" : "left", paddingLeft: isUser ? 0 : 4 }}>
                      {fmt(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ display:"flex", gap:8, padding:"10px 12px", borderTop:"1.5px solid #e9eef4", flexShrink:0, background:"#fff", borderRadius:"0 0 20px 20px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message…"
              style={{ flex:1, border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", color:"#0f172a", background:"#f8fafc" }}
              autoFocus
            />
            <button type="submit" disabled={!input.trim() || sending}
              style={{ width:40, height:40, borderRadius:10, background: input.trim() ? "linear-gradient(135deg,#228756,#16a34a)" : "#e2e8f0", border:"none", cursor: input.trim() ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
