import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import useMediaQuery from "@mui/material/useMediaQuery";
import FormMessage from "../global/form-message";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import { postData } from "../../utils/actions";
import { sendOtpTosubscribe, verifyOtpTosubscribe } from "../../utils/url";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(2) },
  "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}));

const fmtK = (n) => {
  const k = n / 1000;
  return `${k % 1 === 0 ? k : k.toFixed(1)}K+`;
};

export default function NewsLetter() {
  const isMobile = useMediaQuery("(max-width: 991px)");
  const { ref, inView } = useInView({ threshold: 0 });
  const [sessionsCount, setSessionsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [otpView, setOtpView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const SESSIONS_TARGET = 5000;
  const CLIENTS_TARGET  = 2000;

  const handleSubmit = async () => {
    setSuccess("");
    if (email === "") {
      setOpen(true);
      setError("Please enter valid email");
      return;
    } else if (!validateEmail(email)) {
      setOpen(true);
      setError("Please enter valid email");
      return;
    } else {
      setError("");
      setOpen(false);
      try {
        setLoading(true);
        const response = await postData(sendOtpTosubscribe, { email });
        if (response.status) {
          setSuccess(response.message);
          setError("");
          setOpen(false);
          setOtpView(true);
        } else {
          setOpen(true);
          setError("Something went wrong");
        }
      } catch (error) {
        setOpen(true);
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleOtpSubmit = async () => {
    setSuccess("");
    if (otp.length !== 6) {
      setError("Please enter valid otp");
      return;
    } else {
      setError("");
      try {
        setLoading(true);
        const response = await postData(verifyOtpTosubscribe, { email, otp });
        if (response.status) {
          setOtp("");
          setError("");
          setSuccess(response.message);
          setOtpView(false);
          setOpen(true);
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  };

  const handleClose = () => setOpen(false);
  const handleCloseOtpView = () => setOtpView(false);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) setOtp(value);
  };

  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setSessionsCount(Math.floor(p * SESSIONS_TARGET));
      setClientsCount(Math.floor(p * CLIENTS_TARGET));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div ref={ref} style={{ background: '#f8faf9' }}>
      <style>{`
        .nl-label { display:block; font-size:11.5px; font-weight:700; color:#64748b; margin-bottom:7px; }
        .nl-input { width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:15px; outline:none; transition:border-color .2s,box-shadow .2s; margin-bottom:14px; color:#1e293b; background:#f8fafc; box-sizing:border-box; font-family:inherit; }
        .nl-input:focus { border-color:#228756; background:#fff; box-shadow:0 0 0 3px rgba(34,135,86,.1); }
        .nl-btn { width:100%; padding:14px; background:linear-gradient(135deg,#1b5e20,#228756); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; letter-spacing:.2px; box-shadow:0 10px 24px rgba(15,89,54,0.28); transition:transform .2s,box-shadow .2s; }
        .nl-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 28px rgba(15,89,54,0.34); }
        .nl-btn:disabled { opacity:.7; cursor:not-allowed; transform:none; }
        .nl-link { color:#94a3b8; font-size:12px; text-align:center; margin-top:12px; cursor:pointer; display:block; }
        .nl-link:hover { color:#228756; }
        .nl-band { background:linear-gradient(120deg,#0d3320 0%,#1a6b3a 55%,#228756 100%); width:100%; padding: 64px 0; position:relative; overflow:hidden; }
        @media(max-width:991px){ .nl-band { padding:44px 0; } }
        .nl-card { background:#fff; border-radius:20px; padding:32px; box-shadow:0 20px 45px rgba(0,0,0,0.18); }
        @media(max-width:991px){ .nl-card { padding:26px 22px; } }
        @media(min-width:768px) and (max-width:1024px){ .nl-input,.nl-btn { min-height:48px; } }
      `}</style>

      <div className="nl-band">
        {/* decorative blobs */}
        <div style={{ position:'absolute', top:-70, right:-50, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.06)', pointerEvents:'none' }}></div>
        <div style={{ position:'absolute', bottom:-90, left:60, width:200, height:200, borderRadius:'50%', background:'rgba(74,222,128,.1)', pointerEvents:'none' }}></div>

        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div className="row align-items-center g-5">

            {/* Left: content */}
            <div className="col-lg-6">
              <span style={{
                display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.14)',
                color:'#fff', padding:'6px 16px', borderRadius:'50px',
                fontSize:'11.5px', fontWeight:700, letterSpacing:'1px',
                textTransform:'uppercase', marginBottom:'20px',
                border:'1px solid rgba(255,255,255,.2)',
              }}>
                <i className="feather-mail" style={{ fontSize:12 }}></i> Stay Updated
              </span>

              <h3 style={{
                color:'#fff', fontSize: isMobile ? '1.8rem' : '2.5rem',
                fontWeight:900, lineHeight:1.18, margin:'0 0 14px'
              }}>
                Join Our Mental<br />Health Community
              </h3>

              <p style={{
                color:'rgba(255,255,255,.72)', fontSize:'.97rem', lineHeight:1.75,
                margin:'0 0 32px', maxWidth:400
              }}>
                Get weekly insights, expert tips, and exclusive resources on mental wellness — delivered straight to your inbox.
              </p>

              <div style={{ display:'flex', gap: isMobile ? '24px' : '44px', flexWrap:'wrap' }}>
                <div>
                  <div style={{ color:'#fff', fontSize:'2.2rem', fontWeight:900, lineHeight:1 }}>{fmtK(sessionsCount)}</div>
                  <div style={{ color:'rgba(255,255,255,.65)', fontSize:'12.5px', marginTop:'6px', fontWeight:600 }}>Successful Sessions</div>
                </div>
                <div style={{ width:1, background:'rgba(255,255,255,.18)', alignSelf:'stretch' }}></div>
                <div>
                  <div style={{ color:'#fff', fontSize:'2.2rem', fontWeight:900, lineHeight:1 }}>{fmtK(clientsCount)}</div>
                  <div style={{ color:'rgba(255,255,255,.65)', fontSize:'12.5px', marginTop:'6px', fontWeight:600 }}>Happy Clients</div>
                </div>
              </div>
            </div>

            {/* Right: subscribe card */}
            <div className="col-lg-5 offset-lg-1">
              <div className="nl-card">
                <h4 style={{ fontSize:'1.3rem', fontWeight:800, color:'#1e293b', margin:'0 0 5px' }}>
                  {otpView ? 'Verify Your Email' : 'Subscribe Now'}
                </h4>
                <p style={{ color:'#94a3b8', fontSize:'13.5px', margin:'0 0 20px', lineHeight:1.5 }}>
                  {otpView
                    ? `A 6-digit OTP has been sent to ${email}`
                    : 'Join our community. No spam, unsubscribe anytime.'}
                </p>

                {otpView ? (
                  <>
                    <label className="nl-label" htmlFor="nl-otp">One-Time Password</label>
                    <input
                      id="nl-otp"
                      type="text"
                      className="nl-input"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={handleOtpChange}
                      style={{ textAlign:'center', fontSize:'24px', letterSpacing:'10px', fontWeight:800 }}
                    />
                    {error && <p style={{ color:'#ef4444', fontSize:'13px', margin:'-8px 0 12px', fontWeight:600 }}>{error}</p>}
                    <button className="nl-btn" onClick={handleOtpSubmit} disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Subscribe →'}
                    </button>
                    <span className="nl-link" onClick={handleCloseOtpView}>← Use a different email</span>
                  </>
                ) : (
                  <>
                    <label className="nl-label" htmlFor="nl-email">Email Address</label>
                    <input
                      id="nl-email"
                      type="email"
                      className="nl-input"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    {error && <p style={{ color:'#ef4444', fontSize:'13px', margin:'-8px 0 12px', fontWeight:600 }}>{error}</p>}
                    <button className="nl-btn" onClick={handleSubmit} disabled={loading}>
                      {loading ? 'Sending OTP...' : 'Subscribe Now →'}
                    </button>
                  </>
                )}

                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'16px' }}>
                  <i className="feather-shield" style={{ color:'#228756', fontSize:'13px' }}></i>
                  <span style={{ fontSize:'12px', color:'#94a3b8' }}>100% private · Unsubscribe anytime</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Success / Error dialog */}
      <BootstrapDialog onClose={handleClose} aria-labelledby="nl-dialog-title" open={open} fullWidth maxWidth="xs">
        <DialogTitle sx={{ m:0, p:2, fontSize:16, fontWeight:'bold' }} id="nl-dialog-title">
          {error !== '' ? 'Error' : 'Success'}
        </DialogTitle>
        <IconButton aria-label="close" onClick={handleClose}
          sx={{ position:'absolute', right:8, top:8, color:(theme) => theme.palette.grey[500] }}>
          <CloseIcon sx={{ fontSize:'2.5rem' }} />
        </IconButton>
        <DialogContent dividers>
          <FormMessage error={error} success={success} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} style={{ fontSize:16, fontWeight:'bold' }}>OK</Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
}
