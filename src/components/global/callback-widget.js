import { useState } from "react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function CallbackWidget() {
  const [open,      setOpen]      = useState(false);
  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const reset = () => { setOpen(false); setSubmitted(false); setName(""); setPhone(""); setError(""); };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setError("Enter a valid 10-digit mobile number."); return; }
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        name:    name.trim(),
        phone:   phone.trim(),
        concern: "Callback Request",
        source:  "Callback Widget",
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cbPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(34,135,86,0.45)} 65%{box-shadow:0 0 0 12px rgba(34,135,86,0)} }
        @keyframes cbSlide  { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes cbSpin   { to{transform:rotate(360deg)} }
        @keyframes cbCheck  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }

        .cb-widget { position:fixed; bottom:28px; right:28px; z-index:9990; display:flex; flex-direction:column; align-items:flex-end; gap:12px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }

        /* ── Pill button ── */
        .cb-pill {
          display:flex; align-items:center; gap:9px;
          background:linear-gradient(135deg,#1a6b3a,#228756);
          color:#fff; border:none; border-radius:50px;
          padding:12px 20px; font-size:13.5px; font-weight:700;
          cursor:pointer; letter-spacing:0.2px;
          box-shadow:0 6px 24px rgba(34,135,86,0.45);
          animation:cbPulse 2.8s ease infinite;
          transition:transform .18s,box-shadow .18s;
        }
        .cb-pill:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(34,135,86,0.55); }
        .cb-pill-icon { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.18); flex-shrink:0; }

        /* ── Card ── */
        .cb-card {
          background:#fff; border-radius:20px; width:300px;
          box-shadow:0 12px 50px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06);
          animation:cbSlide .28s cubic-bezier(.34,1.56,.64,1);
          overflow:hidden; border:1px solid rgba(0,0,0,0.06);
        }

        /* Card header */
        .cb-card-header {
          background:linear-gradient(135deg,#0d2b1c,#1a5c38,#228756);
          padding:16px 18px; display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden;
        }
        .cb-card-header::after { content:''; position:absolute; top:-30px; right:-30px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.06); pointer-events:none; }
        .cb-header-left { display:flex; align-items:center; gap:10px; }
        .cb-header-icon { width:36px; height:36px; border-radius:11px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .cb-card-title { font-size:14px; font-weight:800; color:#fff; line-height:1.2; }
        .cb-card-sub { font-size:10.5px; color:rgba(255,255,255,0.55); margin-top:2px; }
        .cb-close { background:rgba(255,255,255,0.12); border:none; border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:rgba(255,255,255,0.7); flex-shrink:0; transition:background .15s; }
        .cb-close:hover { background:rgba(220,38,38,0.4); color:#fff; }

        /* Form body */
        .cb-body { padding:18px; }
        .cb-inp-wrap { position:relative; margin-bottom:10px; }
        .cb-inp-label { display:block; font-size:10.5px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
        .cb-inp { width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 12px; font-size:13px; font-family:inherit; outline:none; color:#0f172a; box-sizing:border-box; transition:border-color .15s,box-shadow .15s; background:#fff; }
        .cb-inp:focus { border-color:#228756; box-shadow:0 0 0 3px rgba(34,135,86,0.1); }
        .cb-inp::placeholder { color:#cbd5e1; }
        .cb-error { font-size:11px; color:#ef4444; margin:-6px 0 8px; font-weight:500; }
        .cb-btn {
          width:100%; border:none;
          background:linear-gradient(135deg,#1a6b3a,#228756);
          color:#fff; border-radius:11px; padding:12px 0; font-size:13.5px; font-weight:700;
          cursor:pointer; transition:opacity .15s,transform .15s; font-family:inherit;
          display:flex; align-items:center; justify-content:center; gap:8px; margin-top:2px;
          box-shadow:0 4px 16px rgba(34,135,86,0.3);
        }
        .cb-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .cb-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .cb-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:cbSpin .7s linear infinite; }

        /* Success */
        .cb-success { padding:24px 18px; text-align:center; }
        .cb-success-ring { width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:2px solid #86efac; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; animation:cbCheck .4s cubic-bezier(.34,1.56,.64,1); }
        .cb-success-check { font-size:26px; }
        .cb-success-title { font-size:15px; font-weight:800; color:#0f172a; margin-bottom:6px; }
        .cb-success-sub { font-size:12px; color:#64748b; line-height:1.55; }

        @media(max-width:480px){
          .cb-widget { bottom:80px; right:12px; }
          .cb-card { width:calc(100vw - 28px); }
        }
      `}</style>

      <div className="cb-widget">
        {open && (
          <div className="cb-card">
            {/* Header */}
            <div className="cb-card-header">
              <div className="cb-header-left">
                <div className="cb-header-icon">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="cb-card-title">Request a Callback</div>
                  <div className="cb-card-sub">We'll call you within 30 minutes</div>
                </div>
              </div>
              <button className="cb-close" onClick={reset}><CloseIcon /></button>
            </div>

            {/* Body */}
            <div className="cb-body">
              {submitted ? (
                <div className="cb-success">
                  <div className="cb-success-ring">
                    <span className="cb-success-check">✓</span>
                  </div>
                  <div className="cb-success-title">We'll call you soon, {name.split(" ")[0]}!</div>
                  <div className="cb-success-sub">Our team will reach out to you shortly. Thank you for choosing Choose Your Therapist.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="cb-inp-wrap">
                    <label className="cb-inp-label">Your Name</label>
                    <input className="cb-inp" placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="cb-inp-wrap">
                    <label className="cb-inp-label">Mobile Number</label>
                    <input className="cb-inp" placeholder="10-digit number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,""))} type="tel" maxLength={10} />
                  </div>
                  {error && <div className="cb-error">{error}</div>}
                  <button className="cb-btn" type="submit" disabled={loading}>
                    {loading
                      ? <span className="cb-spinner" />
                      : <><SendIcon /> Submit Request</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <button className="cb-pill" onClick={() => setOpen(p => !p)}>
          <span className="cb-pill-icon"><PhoneIcon /></span>
          {open ? "Close" : "Request Callback"}
        </button>
      </div>
    </>
  );
}
