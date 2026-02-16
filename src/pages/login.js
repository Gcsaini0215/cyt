import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";
import ImageTag from "../utils/image-tag";
import { isValidMail } from "../utils/validators";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";
import { getDecodedToken, setToken } from "../utils/jwt";
import { postData } from "../utils/actions";
import FormMessage from "../components/global/form-message";
import FormProgressBar from "../components/global/form-progressbar";
import PageBreadCrumb from "../components/global/page-breadcrumb";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email.length < 7 || !isValidMail(email)) {
      setError("Please enter valid email address");
      return;
    }

    const value = {
      email,
    };

    try {
      setLoading(true);
      const response = await postData(loginUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtpView(true);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }

  };

  const handleOtp = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter valid OTP");
      return;
    }
    const value = {
      email,
      otp,
    };
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtp("");
        setToken(response.token);
        if (response.data.role === 1) {
          navigate("/therapist-dashboard");
        } else {
          navigate("/my-dashboard");
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setSuccess("");
      setError(error.response?.data?.message || "Something went wrong");
    } finally {

      setLoading(false);
    }

  };

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) {
        navigate("/therapist-dashboard");
      } else {
        navigate(`/my-dashboard`);
      }
    }
  }, [navigate]);

  return (
    <div>
      <MyNavbar />
      <PageBreadCrumb title="Access Your Account" linkTitle="Login" />

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
                    <h1 className="title"> Because healing starts with your choice..</h1>
                    <p className="description">
                      Log in to access personalized support and manage
                      appointments effortlessly. Track your mental health
                      journey with ease and stay connected for continuous
                      well-being.
                    </p>
                    <div className="rbt-like-total">
                      <div className="profile-share">
                        <Link
                          to="#"
                          className="avatar"
                          data-tooltip="Counselling Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="education"
                            width="55"
                            height="55"
                            src="/assets/img/avatar-027dc8.png"
                          />
                        </Link>
                        <Link
                          to="#"
                          className="avatar"
                          data-tooltip="Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="education"
                            width="55"
                            height="55"
                            src="/assets/img/psychologist.png"
                          />
                        </Link>
                        <Link
                          to="#"
                          className="avatar"
                          data-tooltip="Counselling Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="education"
                            width="55"
                            height="55"
                            src="/assets/img/counselling.png"
                          />
                        </Link>
                        <div className="more-author-text">
                          <h5 className="total-join-students">
                            5,245+ people have already found their path to well-being.
                          </h5>
                          <p className="subtitle">Your well-being awaits.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="rbt-contact-form contact-form-style-1">
                  <h3 className="title">Login</h3>
                  <FormMessage error={error} success={success} />
                  {otpView ? (
                    <div id="contact-form">
                      <div className="form-group">
                        <input
                          placeholder="Enter OTP"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <span className="focus-border"></span>
                      </div>

                      <div className="form-submit-group">
                        {loading ? (
                          <FormProgressBar />
                        ) : (
                          <button
                            onClick={handleOtp}
                            type="submit"
                            className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round w-100 mt--15"
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Verify OTP</span>
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
                  ) : (
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

                      <div className="form-submit-group">
                        {loading ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <CircularProgress />
                          </Box>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            type="submit"
                            className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round w-100 "
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
                      <div
                        className="rbt-lost-password text-end"
                        style={{ marginBottom: 15 }}
                      >
                        <Link className="rbt-btn-link" to="/register">
                          Create Account?
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewsLetter />
      <Footer />
    </div>
  );
}
