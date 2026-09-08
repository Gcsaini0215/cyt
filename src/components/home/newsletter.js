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
        .nl-band { background:linear-gradient(180deg,#fbf9f3,#f2eee1); width:100%; padding:64px 0; border-top:3px solid #c99a3a; }
        @media(max-width:991px){ .nl-band { padding:44px 0; } }
        .nl-badge {
          display:inline-flex; align-items:center; gap:7px; background:rgba(201,154,58,.1);
          color:#a97b28; padding:6px 16px; border-radius:4px; font-size:11.5px; font-weight:700;
          letter-spacing:1px; text-transform:uppercase; margin-bottom:18px; border:1px solid rgba(201,154,58,.3);
        }
        .nl-form-pill { display:flex; gap:10px; width:100%; background:#fff; border-radius:8px; padding:8px; box-shadow:0 16px 34px rgba(34,28,18,0.1); }
        @media(max-width:575px){ .nl-form-pill { flex-direction:column; } }
        .nl-input { flex:1; min-width:0; padding:13px 16px; border-radius:4px; border:1.5px solid #e2d7bc; font-size:15px; outline:none; transition:border-color .2s,box-shadow .2s; color:#221c12; background:#fbf7ec; box-sizing:border-box; font-family:inherit; }
        .nl-input:focus { border-color:#c99a3a; background:#fff; box-shadow:0 0 0 3px rgba(201,154,58,.14); }
        .nl-btn { padding:13px 28px; background:linear-gradient(135deg,#221c12,#3a2f1c); color:#c99a3a; border:none; border-radius:4px; font-size:15px; font-weight:700; cursor:pointer; letter-spacing:.2px; white-space:nowrap; transition:transform .2s,box-shadow .2s; }
        .nl-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 22px rgba(34,28,18,0.22); }
        .nl-btn:disabled { opacity:.65; cursor:not-allowed; transform:none; }
        @media(max-width:575px){ .nl-btn { width:100%; } }
        .nl-link { color:#8a7d63; font-size:12.5px; text-align:center; margin-top:14px; cursor:pointer; display:block; }
        .nl-link:hover { color:#a97b28; }
      `}</style>

      <div className="nl-band">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-9" style={{ textAlign:'center' }}>

              <span className="nl-badge">
                <i className="feather-mail" style={{ fontSize:12 }}></i> Stay Updated
              </span>

              <h3 style={{
                color:'#221c12', fontSize: isMobile ? '1.7rem' : '2.2rem',
                fontWeight:900, lineHeight:1.2, margin:'0 0 12px'
              }}>
                Join Our Mental Health Community
              </h3>

              <p style={{
                color:'#6b6047', fontSize:'.97rem', lineHeight:1.75,
                margin:'0 auto 26px', maxWidth:440
              }}>
                Get weekly insights, expert tips, and exclusive resources on mental wellness — delivered straight to your inbox.
              </p>

              <div style={{ maxWidth:440, margin:'0 auto' }}>
                <div className="nl-form-pill">
                  {otpView ? (
                    <>
                      <input
                        type="text"
                        className="nl-input"
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={handleOtpChange}
                        style={{ textAlign:'center', fontSize:'19px', letterSpacing:'8px', fontWeight:800 }}
                      />
                      <button className="nl-btn" onClick={handleOtpSubmit} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify →'}
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        className="nl-input"
                        placeholder="yourname@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      />
                      <button className="nl-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Sending...' : 'Subscribe →'}
                      </button>
                    </>
                  )}
                </div>

                {error && <p style={{ color:'#dc2626', fontSize:'12.5px', margin:'10px 0 0', fontWeight:600 }}>{error}</p>}

                <p style={{ color:'#8a7d63', fontSize:'11.5px', margin:'10px 0 0' }}>
                  {otpView ? `A 6-digit OTP has been sent to ${email}` : 'Join our community. No spam, unsubscribe anytime.'}
                </p>
                {otpView && <span className="nl-link" onClick={handleCloseOtpView}>← Use a different email</span>}

                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'8px' }}>
                  <i className="feather-shield" style={{ color:'#c99a3a', fontSize:'12px' }}></i>
                  <span style={{ fontSize:'11.5px', color:'#8a7d63' }}>100% private · Unsubscribe anytime</span>
                </div>
              </div>

              <div style={{ display:'flex', gap:'26px', justifyContent:'center', marginTop:'30px' }}>
                <div>
                  <span style={{ color:'#a97b28', fontSize:'1.15rem', fontWeight:900 }}>{fmtK(sessionsCount)}</span>{' '}
                  <span style={{ color:'#7d7360', fontSize:'11px', fontWeight:600 }}>Successful Sessions</span>
                </div>
                <div style={{ width:1, background:'rgba(34,28,18,.15)' }}></div>
                <div>
                  <span style={{ color:'#a97b28', fontSize:'1.15rem', fontWeight:900 }}>{fmtK(clientsCount)}</span>{' '}
                  <span style={{ color:'#7d7360', fontSize:'11px', fontWeight:600 }}>Happy Clients</span>
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
