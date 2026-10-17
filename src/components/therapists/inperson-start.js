import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { postData } from "../../utils/actions";
import { apiUrl, StartSessionUrl } from "../../utils/url";

/* In-person sessions start with a code: tapping Start emails the client a 6-digit code, the
   therapist asks the client for it and enters it here — that confirms the session has started. */

export const isInPerson = (b) => /in[-\s]?person|offline|clinic|centre|center/i.test(`${b?.format || ""} ${b?.session_type || ""}`);

const RESEND_AFTER = 45;

export function InPersonStartDialog({ booking, clientName, onClose, onStarted }) {
  const [sentTo, setSentTo] = useState("");
  const [sending, setSending] = useState(false);
  const [cool, setCool] = useState(0);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });
  const inputRef = useRef(null);

  const send = async () => {
    setSending(true); setMsg({ text: "", err: false });
    try {
      const r = await postData(`${apiUrl}/start-session/send-code`, { bookingId: booking._id });
      setSentTo(r?.data?.sentTo || "the client's email");
      setMsg({ text: r?.message || "Code sent.", err: false });
      setCool(RESEND_AFTER);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (e) {
      setMsg({ text: e?.response?.data?.message || "Couldn't send the code — please try again.", err: true });
    }
    setSending(false);
  };
  useEffect(() => { send(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cool <= 0) return undefined;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const start = async (e) => {
    e?.preventDefault();
    if (code.length !== 6) { setMsg({ text: "Enter the 6-digit code from the client.", err: true }); return; }
    setBusy(true); setMsg({ text: "", err: false });
    try {
      const r = await postData(StartSessionUrl, { bookingId: booking._id, pin: code });
      if (!r?.status) throw new Error(r?.message);
      onStarted && onStarted(r.data);
      onClose();
    } catch (err) {
      const m = err?.response?.data?.message || err?.message || "";
      setMsg({ text: /invalid pin/i.test(m) ? "That code doesn't match — check it with the client, or resend." : m || "Couldn't start the session.", err: true });
    }
    setBusy(false);
  };

  return createPortal(
    <div className="ips-wrap" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: IPS_CSS }} />
      <form className="ips" role="dialog" aria-modal="true" aria-labelledby="ips-h" onSubmit={start}>
        <button type="button" className="ips-x" onClick={onClose} aria-label="Close" disabled={busy}>×</button>
        <span className="ips-kick">In-person session</span>
        <h2 id="ips-h">Start session with {clientName || "your client"}</h2>
        <p className="ips-sub">{sending && !sentTo ? "Sending a 6-digit code to the client's email…" : sentTo ? <>We&apos;ve emailed a 6-digit code to <b>{sentTo}</b>. Ask your client for it and enter it below.</> : "We'll email a 6-digit code to your client."}</p>
        <input
          ref={inputRef} className="ips-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••"
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-label="Session code" disabled={busy}
        />
        {msg.text && <p className={`ips-msg${msg.err ? " err" : ""}`} role="status">{msg.text}</p>}
        <button type="submit" className="ips-go" disabled={busy || code.length !== 6}>{busy ? "Starting…" : "Start session"}</button>
        <button type="button" className="ips-resend" onClick={send} disabled={sending || cool > 0 || busy}>
          {sending ? "Sending…" : cool > 0 ? `Resend code in ${cool}s` : "Resend code"}
        </button>
      </form>
    </div>,
    document.body
  );
}

const IPS_CSS = `
.ips-wrap { position: fixed; inset: 0; z-index: 2100; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; }
.ips { position: relative; width: min(400px, 100%); background: #fff; border-radius: 18px; padding: 24px 22px 18px; text-align: center; box-shadow: 0 30px 70px -20px rgba(0,0,0,.4); font-family: inherit; }
.ips-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.ips-kick { font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #92400e; background: #fef3c7; border-radius: 999px; padding: 3px 10px; }
.ips h2 { margin: 10px 0 6px; font-size: 19px; font-weight: 800; color: #0f172a; font-family: inherit; }
.ips-sub { margin: 0 0 14px; font-size: 13.5px; color: #475569; line-height: 1.55; }
.ips-code { width: 100%; height: 56px; border: 1.5px solid #d5e3da; border-radius: 12px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 12px; font-family: ui-monospace, monospace; color: #0f172a; }
.ips-code:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.15); }
.ips-msg { margin: 10px 0 0; font-size: 13px; font-weight: 700; color: #166534; } .ips-msg.err { color: #b91c1c; }
.ips-go { margin-top: 14px; width: 100%; height: 48px; border-radius: 12px; border: 0; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; font-weight: 800; font-size: 15px; cursor: pointer; font-family: inherit; }
.ips-go:disabled { opacity: .55; cursor: not-allowed; }
.ips-resend { margin-top: 8px; border: 0; background: none; color: #166534; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit; }
.ips-resend:disabled { color: #94a3b8; cursor: default; }
@media (max-width: 560px) { .ips-wrap { place-items: end center; padding: 0; } .ips { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); } }
`;
