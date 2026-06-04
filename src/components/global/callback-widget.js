import { useState } from "react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

export default function CallbackWidget() {
  const [open,      setOpen]      = useState(false);
  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) return;
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        name: name.trim(),
        phone: phone.trim(),
        concern: "Callback Request",
        source: "Callback Widget",
      });
      setSubmitted(true);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes cbPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,135,86,0.5)} 60%{box-shadow:0 0 0 10px rgba(34,135,86,0)} }
        @keyframes cbSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .cb-widget { position:fixed; bottom:24px; right:24px; z-index:9990; display:flex; flex-direction:column; align-items:flex-end; gap:10px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        .cb-pill { display:flex; align-items:center; gap:8px; background:#228756; color:#fff; border:none; border-radius:50px; padding:10px 18px; font-size:13px; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(34,135,86,0.4); animation:cbPulse 2.5s ease infinite; transition:transform .15s,opacity .15s; }
        .cb-pill:hover { transform:scale(1.04); opacity:.92; }
        .cb-pill-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; flex-shrink:0; }
        .cb-card { background:#fff; border-radius:18px; padding:20px; width:280px; box-shadow:0 8px 40px rgba(0,0,0,0.18); animation:cbSlide .25s ease; border:1px solid #f0f4f8; }
        .cb-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .cb-card-title { font-size:14px; font-weight:800; color:#0f172a; }
        .cb-card-sub { font-size:11px; color:#94a3b8; margin-top:2px; }
        .cb-close { background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer; line-height:1; padding:0; }
        .cb-close:hover { color:#ef4444; }
        .cb-inp { width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:9px 12px; font-size:13px; font-family:inherit; outline:none; color:#0f172a; box-sizing:border-box; margin-bottom:10px; transition:border-color .15s; }
        .cb-inp:focus { border-color:#228756; }
        .cb-btn { width:100%; border:none; background:#228756; color:#fff; border-radius:10px; padding:11px 0; font-size:13px; font-weight:700; cursor:pointer; transition:opacity .15s; font-family:inherit; }
        .cb-btn:hover:not(:disabled) { opacity:.88; }
        .cb-btn:disabled { opacity:.55; cursor:not-allowed; }
        .cb-success { text-align:center; padding:10px 0 4px; }
        .cb-success-icon { font-size:32px; margin-bottom:8px; }
        .cb-success-title { font-size:14px; font-weight:800; color:#228756; }
        .cb-success-sub { font-size:12px; color:#64748b; margin-top:4px; }
        @media(max-width:480px){ .cb-widget{bottom:80px;right:12px} .cb-card{width:calc(100vw - 28px)} }
      `}</style>

      <div className="cb-widget">
        {open && (
          <div className="cb-card">
            <div className="cb-card-head">
              <div>
                <div className="cb-card-title">Request a Callback</div>
                <div className="cb-card-sub">We'll call you within 30 minutes</div>
              </div>
              <button className="cb-close" onClick={() => { setOpen(false); setSubmitted(false); setName(""); setPhone(""); }}>×</button>
            </div>

            {submitted ? (
              <div className="cb-success">
                <div className="cb-success-icon">✅</div>
                <div className="cb-success-title">We'll call you soon!</div>
                <div className="cb-success-sub">Our team will reach out to {name.split(" ")[0]} shortly.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input className="cb-inp" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                <input className="cb-inp" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} type="tel" maxLength={10} required />
                <button className="cb-btn" type="submit" disabled={loading || !name.trim() || phone.length !== 10}>
                  {loading ? "Submitting…" : "Request Callback"}
                </button>
              </form>
            )}
          </div>
        )}

        <button className="cb-pill" onClick={() => setOpen(p => !p)}>
          <span className="cb-pill-dot" />
          {open ? "Close" : "📞 Request Callback"}
        </button>
      </div>
    </>
  );
}
