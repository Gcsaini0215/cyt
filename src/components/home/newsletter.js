import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
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
        background: 'linear-gradient(135deg, #228756 0%, #1a6b45 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row row--15 align-items-center">
          <div className="col-lg-12">
            <div className="inner text-center">
              <div className="section-title text-center" style={{ marginBottom: '40px' }}>
                <span className="subtitle" style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  Get Latest Update
                </span>
                <h2 className="title" style={{
                  color: '#fff',
                  fontSize: '3rem',
                  fontWeight: '800',
                  marginBottom: '20px',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  <strong>Subscribe</strong>
                </h2>
                <p className="description" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1.3rem',
                  lineHeight: 1.6,
                  marginBottom: '0',
                  fontWeight: '400',
                  margin: '0 auto 20px auto',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  Stay informed and inspired on your mental health journey. Subscribe to our newsletter for expert insights, tips, and updates.
                </p>
              </div>

              {otpView ? (
                <div className="newsletter-form-1 mt--40">
                  <input
                    type="email"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Verify Otp</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </button>
                </div>
              ) : (
                <div className="newsletter-form-1 mt--40">
                  <input
                    type="email"
                    placeholder="Enter Your E-Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    onClick={handleSubmit}
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">
                        {loading
                          ? "Please wait..."
                          : "Subscribe Our Newsletter"}
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </button>
                </div>
              )}
              <span className="note-text color-white mt--20">
                Experience mental health support without the hassle.
              </span>
              <div className="row row--15 mt--50">
                <div className="col-lg-3 col-sm-6 col-md-6 single-counter offset-lg-3">
                  <div className="rbt-counterup rbt-hover-03 style-2 text-color-white">
                    <div className="inner">
                      <div className="content">
                        <h3 className="counter color-white">
                          <span className="odometer">{count}</span>
                        </h3>
                        <h5 className="title color-white">
                          Successfull Sessions
                        </h5>
                        <span className="subtitle color-white">
                          Therapy & Counselling
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-md-6 single-counter single-counter">
                  <div className="rbt-counterup rbt-hover-03 style-2 text-color-white">
                    <div className="inner">
                      <div className="content">
                        <h3 className="counter color-white">
                          <span className="odometer">{count1}</span>
                        </h3>
                        <h5 className="title color-white">Valuable Feedback</h5>
                        <span className="subtitle color-white">
                          Counselling and Workshops
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
