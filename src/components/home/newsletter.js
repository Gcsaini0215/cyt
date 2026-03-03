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
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
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
      const data = {
        email,
      };
      try {
        setLoading(true);
        const response = await postData(sendOtpTosubscribe, data);
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
      const data = {
        email,
        otp,
      };
      try {
        setLoading(true);
        const response = await postData(verifyOtpTosubscribe, data);
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

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseOtpView = () => {
    setOtpView(false);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  useEffect(() => {
    let startValue = initialValue2;
    const interval = Math.floor(duration / (targetValue - initialValue2));

    const counter = setInterval(() => {
      startValue += 1;
      setCount(startValue);
      if (startValue >= targetValue) {
        clearInterval(counter);
      }
    }, interval);

    return () => {
      clearInterval(counter);
    };
  }, [targetValue, initialValue, inView]);

  useEffect(() => {
    let startValue = initialValue;
    const interval = Math.floor(duration1 / (targetValue1 - initialValue));

    const counter = setInterval(() => {
      startValue += 1;
      setCount1(startValue);
      if (startValue >= targetValue1) {
        clearInterval(counter);
      }
    }, interval);

    return () => {
      clearInterval(counter);
    };
  }, [targetValue1, initialValue, inView]);

  return (
    <div
      className="rbt-newsletter-area newsletter-style-2 rbt-section-gap"
      ref={ref}
      style={{
        background: '#f0fdf4', // Soft green background
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 0'
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #228756 0%, #1a6b44 100%)',
            borderRadius: '40px',
            padding: isMobile ? '40px 20px' : '60px',
            boxShadow: '0 20px 40px rgba(34, 135, 86, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Circles */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>

          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="inner">
                <div className="section-title text-left">
                  <span className="subtitle" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '50px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'inline-block',
                    marginBottom: '15px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Stay Updated
                  </span>
                  <h2 className="title" style={{
                    color: '#fff',
                    fontSize: isMobile ? '2.2rem' : '3.5rem',
                    fontWeight: '900',
                    marginBottom: '20px',
                    lineHeight: 1.1
                  }}>
                    Join Our Mental <br /> Health Community
                  </h2>
                  <p className="description" style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    marginBottom: '30px',
                    maxWidth: '500px'
                  }}>
                    Get weekly insights, expert tips, and exclusive updates delivered straight to your inbox.
                  </p>

                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', margin: 0 }}>{count}+</h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Successful Sessions</p>
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', margin: 0 }}>{count1}+</h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Happy Users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5 mt_md--40 mt_sm--40">
              <div style={{
                background: '#ffffff',
                padding: isMobile ? '30px 20px' : '40px',
                borderRadius: '30px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ color: '#1e293b', fontWeight: '800', marginBottom: '10px', fontSize: '1.5rem' }}>
                  Subscribe Now
                </h4>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
                  No spam, only valuable content.
                </p>

                {otpView ? (
                  <div className="newsletter-form-modern">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        marginBottom: '15px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleOtpSubmit}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '15px',
                        background: '#228756',
                        color: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {loading ? 'Verifying...' : 'Verify & Subscribe'}
                    </button>
                  </div>
                ) : (
                  <div className="newsletter-form-modern">
                    <input
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        marginBottom: '15px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '15px',
                        background: '#228756',
                        color: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {loading ? 'Joining...' : 'Subscribe Now'}
                    </button>
                  </div>
                )}
                
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '15px' }}>
                  Join 1000+ members today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, fontSize: 16, fontWeight: "bold" }}
          id="customized-dialog-title"
        >
          {error !== "" ? "Error" : "Success"}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon sx={{ fontSize: "2.5rem" }} />
        </IconButton>
        <DialogContent dividers>
          <FormMessage error={error} success={success} />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handleClose}
            style={{ fontSize: 16, fontWeight: "bold" }}
          >
            OK
          </Button>
        </DialogActions>
      </BootstrapDialog>

      <Dialog open={otpView} onClose={handleCloseOtpView}>
        <DialogTitle style={{ fontSize: 17, fontWeight: "bold" }}>
          Subscribe
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontSize: 16 }}>
            To subscribe to this website, please enter otp sent to you email
            address. We will send updates occasionally.
          </DialogContentText>
          <FormMessage error={error} success={success} />
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
            />
            <span className="focus-border"></span>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseOtpView}
            style={{ fontSize: 16, fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOtpSubmit}
            style={{ fontSize: 16, fontWeight: "bold" }}
          >
            {loading ? "Please wait" : "Subscribe"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
