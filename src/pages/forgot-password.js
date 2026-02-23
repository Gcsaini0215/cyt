import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";
import ClientImg from "../assets/img/avatar-027dc8.png";
import Fabiha from "../assets/img/psychologist.png";
import ClientImg3 from "../assets/img/counselling.png";
import ImageTag from "../utils/image-tag";
import { isValidMail } from "../utils/validators";
import {
  sendForgotPasswordOtpUrl,
  verifyOtpAndResetPasswordpUrl,
} from "../utils/url";
import { getDecodedToken } from "../utils/jwt";
import { postData } from "../utils/actions";
import FormMessage from "../components/global/form-message";
import FormProgressBar from "../components/global/form-progressbar";
import { successColor } from "../utils/colors";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

export default function Forgotpassword() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSuccess, setotpSuccess] = useState("");
  const [successView, setSuccessView] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (email.length < 7 || !isValidMail(email)) {
      setError("Please enter valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await postData(sendForgotPasswordOtpUrl, {
        email,
      });
      if (response.status) {
        setOtpView(true);
        setotpSuccess(response.message);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
    setLoading(false);
  };

  const handleOTpAndPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6 || password.length > 16) {
      setError("Password should be more than 6 and less than 16 character");
      return;
    } else if (otp.length !== 6) {
      setError("Please enter valid OTP");
      return;
    } else {
      try {
        setError("");
        setSuccess("");
        setLoading(true);
        const response = await postData(verifyOtpAndResetPasswordpUrl, {
          email,
          otp,
          password,
        });
        if (response.status) {
          setOtp("");
          setPassword("");
          setotpSuccess("");
          setOpen(true);
          setSuccessView(true);
        } else {
          setError(response.message);
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) {
        router.push("/therapist-dashboard");
      } else {
        router.push(`/my-dashboard`);
      }
    }
  }, [router]);

  return (
    <div>
      <MyNavbar />
      <div className="rbt-breadcrumb-default ptb--100 ptb_md--50 ptb_sm--30 bg-gradient-1">
        <div className="container mt--60">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-inner text-center">
                <h2 className="title">Forgot Password</h2>
                <ul className="page-list">
                  <li className="rbt-breadcrumb-item">
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="feather-chevron-right"></i>
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item active">Login</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-banner-area rbt-banner-3 header-transperent-spacer">
        <div className="wrapper">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-7">
                <div className="banner-content">
                  <div className="inner">
                    <div className="section-title text-start">
                      <span className="subtitle bg-pink-opacity">
                        Discover mental health experts.
                      </span>
                    </div>
                    <h1 className="title">Login for Mental Health</h1>
                    <p className="description">
                      Log in to access personalized support and manage
                      appointments effortlessly. Track your mental health
                      journey with ease and stay connected for continuous
                      well-being.
                    </p>
                    <div className="rbt-like-total">
                      <div className="profile-share">
                        <Link
                          href="#"
                          className="avatar"
                          data-tooltip="Counselling Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="education"
                            width="55"
                            height="55"
                            src={ClientImg}
                          />
                        </Link>
                        <Link
                          href="#"
                          className="avatar"
                          data-tooltip="Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="education"
                            width="55"
                            height="55"
                            src={Fabiha}
                          />
                        </Link>
                        <Link
                          href="#"
                          className="avatar"
                          data-tooltip="Counselling Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="education"
                            width="55"
                            height="55"
                            src={ClientImg3}
                          />
                        </Link>
                        <div className="more-author-text">
                          <h5 className="total-join-students">
                            Join Over 50+ Experts
                          </h5>
                          <p className="subtitle">We are Listening You!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {otpView ? (
                <div className="col-lg-5">
                  <div className="rbt-contact-form contact-form-style-1">
                    <h3 className="title">Verify</h3>
                    <span style={{ color: successColor }}>{otpSuccess}</span>
                    <div id="contact-form">
                      <div className="form-group">
                        <input
                          placeholder="OTP"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <span className="focus-border"></span>
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Enter New Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <span className="focus-border"></span>
                      </div>
                      <FormMessage error={error} success={success} />
                      <div className="form-submit-group mt--20">
                        {loading ? (
                          <FormProgressBar />
                        ) : (
                          <button
                            onClick={handleOTpAndPasswordSubmit}
                            type="submit"
                            className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round w-100"
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Reset Password</span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col-lg-5">
                  <div className="rbt-contact-form contact-form-style-1">
                    <h3 className="title">Forgot Password</h3>
                    <FormMessage error={error} success={success} />
                    <div id="contact-form">
                      <div className="form-group">
                        <input
                          placeholder="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <span className="focus-border"></span>
                      </div>
                      {/* <div className="form-group">
                      <input
                        type="text"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span className="focus-border"></span>
                    </div> */}
                      <div className="form-submit-group mt--20">
                        {loading ? (
                          <FormProgressBar />
                        ) : (
                          <button
                            onClick={handleSubmit}
                            type="submit"
                            className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round w-100"
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Send OTP</span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {successView ? (
                <div className="col-lg-5">
                  <div className="rbt-contact-form contact-form-style-1">
                    <h3 className="title">Success</h3>
                    <FormMessage error={error} success={success} />
                    <div id="contact-form">
                      <div className="form-submit-group mt--20">
                        <Link
                          href={"/login"}
                          className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round w-100"
                        >
                          <span className="icon-reverse-wrapper">
                            <span className="btn-text">Login</span>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewsLetter />
      <Footer />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
        BackdropProps={{
          onClick: (event) => event.stopPropagation(),
        }}
      >
        <Box sx={{ ...style, width: 400 }}>
          <h2 id="parent-modal-title">Success</h2>
          <p id="parent-modal-description">
            Password has been changed You may login now.
          </p>
          <Link
            href={"/login"}
            className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round w-100"
          >
            <span className="icon-reverse-wrapper">
              <span className="btn-text">Login</span>
            </span>
          </Link>
        </Box>
      </Modal>
    </div>
  );
}
