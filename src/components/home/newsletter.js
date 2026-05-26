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

export default function NewsLetter() {
  const isMobile = useMediaQuery("(max-width: 991px)");
  const { ref, inView } = useInView({ threshold: 0 });
  const initialValue = 50;
  const initialValue2 = 900;
  const [count, setCount] = useState(initialValue);
  const [count1, setCount1] = useState(initialValue);
  const [otpView, setOtpView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const duration = 50;
  const duration1 = 2500;
  const targetValue = 1000;
  const targetValue1 = 100;

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
    let startValue = initialValue2;
    const interval = Math.floor(duration / (targetValue - initialValue2));
    const counter = setInterval(() => {
      startValue += 1;
      setCount(startValue);
      if (startValue >= targetValue) clearInterval(counter);
    }, interval);
    return () => clearInterval(counter);
  }, [targetValue, initialValue, inView]);

  useEffect(() => {
    let startValue = initialValue;
    const interval = Math.floor(duration1 / (targetValue1 - initialValue));
    const counter = setInterval(() => {
      startValue += 1;
      setCount1(startValue);
      if (startValue >= targetValue1) clearInterval(counter);
    }, interval);
    return () => clearInterval(counter);
  }, [targetValue1, initialValue, inView]);

  return (
    <div ref={ref} style={{ background: '#0f172a', padding: isMobile ? '52px 0' : '72px 0', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .nl-input { width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:15px; outline:none; transition:border-color .2s; margin-bottom:12px; color:#1e293b; }
        .nl-input:focus { border-color:#228756; box-shadow:0 0 0 3px rgba(34,135,86,.08); }
        .nl-btn { width:100%; padding:14px; background:linear-gradient(135deg,#228756,#1a6b44); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; letter-spacing:.3px; }
        .nl-btn:disabled { opacity:.7; cursor:not-allowed; }
        .nl-link { color:#64748b; font-size:12px; text-align:center; margin-top:10px; cursor:pointer; display:block; }
        .nl-link:hover { color:#228756; }
      `}</style>

      {/* subtle decorative bg shapes */}
      <div style={{ position:'absolute', top:-80, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(34,135,86,.07)', pointerEvents:'none' }}></div>
      <div style={{ position:'absolute', bottom:-100, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(34,135,86,.05)', pointerEvents:'none' }}></div>

      <div className="container" style={{ position:'relative', zIndex:1 }}>
        <div className="row align-items-center g-5">

          {/* Left: content */}
          <div className="col-lg-6">
            <span style={{
              display:'inline-block', background:'rgba(34,135,86,.2)',
              color:'#4ade80', padding:'5px 15px', borderRadius:'50px',
              fontSize:'12px', fontWeight:700, letterSpacing:'1px',
              textTransform:'uppercase', marginBottom:'16px'
            }}>
              Stay Updated
            </span>

            <h3 style={{
              color:'#f1f5f9', fontSize: isMobile ? '1.8rem' : '2.6rem',
              fontWeight:900, lineHeight:1.18, margin:'0 0 14px'
            }}>
              Join Our Mental<br />Health Community
            </h3>

            <p style={{
              color:'#64748b', fontSize:'.97rem', lineHeight:1.75,
              margin:'0 0 30px', maxWidth:400
            }}>
              Get weekly insights, expert tips, and exclusive resources on mental wellness — delivered straight to your inbox.
            </p>

            <div style={{ display:'flex', gap:'28px', flexWrap:'wrap' }}>
              <div>
                <div style={{ color:'#f1f5f9', fontSize:'1.9rem', fontWeight:900, lineHeight:1 }}>{count}+</div>
                <div style={{ color:'#475569', fontSize:'13px', marginTop:'4px', fontWeight:500 }}>Successful Sessions</div>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,.08)', alignSelf:'center', height:36 }}></div>
              <div>
                <div style={{ color:'#f1f5f9', fontSize:'1.9rem', fontWeight:900, lineHeight:1 }}>{count1}+</div>
                <div style={{ color:'#475569', fontSize:'13px', marginTop:'4px', fontWeight:500 }}>Happy Members</div>
              </div>
            </div>
          </div>

          {/* Right: subscribe card */}
          <div className="col-lg-5 offset-lg-1">
            <div style={{
              background:'#fff',
              borderRadius:'22px',
              padding: isMobile ? '28px 22px' : '36px',
              boxShadow:'0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <h4 style={{ fontSize:'1.3rem', fontWeight:800, color:'#1e293b', margin:'0 0 5px' }}>
                {otpView ? 'Verify Your Email' : 'Subscribe Now'}
              </h4>
              <p style={{ color:'#94a3b8', fontSize:'13.5px', margin:'0 0 20px', lineHeight:1.5 }}>
                {otpView
                  ? `OTP sent to ${email}`
                  : 'Join 1,000+ members. No spam, ever.'}
              </p>

              {otpView ? (
                <>
                  <input
                    type="text"
                    className="nl-input"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={handleOtpChange}
                    style={{ textAlign:'center', fontSize:'24px', letterSpacing:'10px', fontWeight:800 }}
                  />
                  {error && <p style={{ color:'#ef4444', fontSize:'13px', margin:'-6px 0 10px', fontWeight:600 }}>{error}</p>}
                  <button className="nl-btn" onClick={handleOtpSubmit} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Subscribe →'}
                  </button>
                  <span className="nl-link" onClick={handleCloseOtpView}>← Use a different email</span>
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
                  {error && <p style={{ color:'#ef4444', fontSize:'13px', margin:'-6px 0 10px', fontWeight:600 }}>{error}</p>}
                  <button className="nl-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Subscribe Now →'}
                  </button>
                </>
              )}

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'14px' }}>
                <i className="feather-shield" style={{ color:'#228756', fontSize:'13px' }}></i>
                <span style={{ fontSize:'12px', color:'#94a3b8' }}>100% private · Unsubscribe anytime</span>
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
