import Link from "next/link";
import { useRouter  } from "next/router";
import  { useState } from "react";
import useUserStore from "../../store/userStore";
import { removeToken } from "../../utils/jwt";
import useMediaQuery from "@mui/material/useMediaQuery";
import UserDashboardTopNav from "./user-top-nav";
import DashboardFooter from "../global/dashboard-footer";
import NotifyBar from "./notify-bar";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { sendOtpTosubscribe, verifyOtpTosubscribe } from "../../utils/url";
import { postData } from "../../utils/actions";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import FormProgressBar from "../global/form-progressbar";
export default function UserLayout(props) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { userInfo } = useUserStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [otpView, setOtpView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const handleSubmit = async () => {
    if (email === "") {
      toast.error("Please enter valid email");
      return;
    } else if (!validateEmail(email)) {
      toast.error("Please enter valid email");
      return;
    } else {
      const data = {
        email,
      };
      try {
        setLoading(true);
        const response = await postData(sendOtpTosubscribe, data);
        if (response.status) {
          toast.success(response.message);
          setOtpView(true);
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter valid otp");
      return;
    } else {
      const data = {
        email,
        otp,
      };
      try {
        setLoading(true);
        const response = await postData(verifyOtpTosubscribe, data);
        if (response.status) {
          setOtp("");
          toast.success(response.message);
          setOtpView(false);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
      setLoading(false);
    }
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


  return (
    <>
      <UserDashboardTopNav />
      <div className="rbt-dashboard-area">
        <div
          className="container"
          style={{ marginTop: 100, marginBottom: 20, maxWidth: "98%" }}
        >
          <div className="row">
            <div className="col-lg-12">
              <div className="row">
                {isMobile ? (
                  <div></div>
                ) : (
                  <div className="col-lg-2">
                    <div className="rbt-default-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
                      <div className="inner">
                        <div className="content-item-content">
                          <div className="rbt-default-sidebar-wrapper">
                            <div className="section-title mb--20">
                              <h6 className="rbt-title-style-2">
                                Welcome, {userInfo.name}
                              </h6>
                            </div>
                            <nav className="mainmenu-nav">
                              <ul className="dashboard-mainmenu rbt-default-sidebar-list nav-tabs">
                                <li className="nav-item">
                                  <Link
                                    href={"/my-dashboard"}
                                    className={
                                      pathname === "/my-dashboard"
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    <i className="feather-home"></i>
                                    <span>Home Base</span>
                                  </Link>
                                </li>
                                <li className="nav-item">
                                  <Link className={
                                    pathname === "/my-bookings"
                                      ? "active"
                                      : ""
                                  } href="/my-bookings">
                                    <i className="fa-regular fa-calendar-check"></i>
                                    <span>My Bookings</span>
                                  </Link>
                                </li>
                                <li className="nav-item">
                                  <Link
                                    className={
                                      pathname === "/my-therapists"
                                        ? "active"
                                        : ""
                                    }
                                    href="/my-therapists"
                                  >
                                    <i className="fa-regular fa-calendar-check"></i>
                                    <span>My Care</span>
                                  </Link>
                                </li>

                                <li className="nav-item">
                                  <Link  className={
                                      pathname === "/my-workshop-bookings"
                                        ? "active"
                                        : ""
                                    } href="/my-workshop-bookings">
                                    <i className="feather-star"></i>
                                    <span>Events & Vibes</span>
                                  </Link>
                                </li>

                              </ul>
                            </nav>

                            <div className="section-title mt--40 mb--20">
                              <h6 className="rbt-title-style-2">User</h6>
                            </div>
                            <nav className="mainmenu-nav">
                              <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                                <li>
                                  <Link
                                    className={
                                      pathname === "/my-settings"
                                        ? "active"
                                        : ""
                                    }
                                    href="/my-settings"
                                  >
                                    <i className="feather-settings"></i>
                                    <span>My Edit</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    className={
                                      pathname === "/my-change-password"
                                        ? "active"
                                        : ""
                                    }
                                    href="/my-change-password"
                                  >
                                    <i className="feather-lock"></i>
                                    <span>Change Password</span>
                                  </Link>
                                </li>
                                <li>
                                  <a onClick={handleLogout}>
                                    <i className="feather-log-out"></i>
                                    <span>Sign Out</span>
                                  </a>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="col-lg-10">
                  <NotifyBar title={props.title || ""} />
                  {props.children}
                  <div class="section-title text-center mt--100 mb--100">
                    <h2 class="title">Get discounts, programs & updates. <br />directly in mail. </h2>
                    <div class="newsletter-form-1 mt--50 radius-round">
                      <input class="rbt-border" type="email" placeholder="Enter Your E-Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      {loading ? <CircularProgress /> : <button onClick={handleSubmit} class="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round">
                        <span class="icon-reverse-wrapper">
                          <span class="btn-text">Subscribe</span>
                          <span class="btn-icon"><i class="feather-arrow-right"></i></span>
                          <span class="btn-icon"><i class="feather-arrow-right"></i></span>
                        </span>
                      </button>}
                    </div>
                  </div>
                  <DashboardFooter />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={otpView} onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCloseOtpView();
        }} maxWidth="sm" fullWidth>
          <div style={{ padding: "8px" }}>
            <h5>Enter OTP</h5>
            <DialogContent dividers>
              <div className="col-md-6 col-12 mb--10">
                <label htmlFor="phone">OTP*</label>
                <input
                  type="text"
                  placeholder="OTP"
                  id="otp"
                  value={otp}
                  name="otp"
                  onChange={handleOtpChange}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <div className="plceholder-button mt--10">
                {loading ? (
                  <FormProgressBar />
                ) : (
                  <button
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    onClick={handleOtpSubmit}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Submit</span>
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
            </DialogActions>
          </div>
        </Dialog>
      </div>
    </>
  );
}
