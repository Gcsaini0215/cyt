import React from "react";
const logo1 = "/logo.png";
import { Link, useNavigate } from "react-router-dom";
import ImageTag from "../../utils/image-tag";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath } from "../../utils/url";
export default function DashboardTopNav() {
  const { therapistInfo } = useTherapistStore();
  const navigate = useNavigate();
  const [show, setShow] = React.useState(false);
  const [isSticky, setIsSticky] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <>
      <div className={show ? "popup-mobile-menu active" : "popup-mobile-menu"}>
        <div className="inner-wrapper">
          <div className="inner-top">
            <div className="content">
              <div className="logo">
                <Link to="/therapist-dashboard" style={{ cursor: "pointer" }}>
                  <ImageTag
                    alt="Education Logo Images"
                    width="137"
                    height="45"
                    src={logo1}
                  />
                </Link>
              </div>
              <div className="rbt-btn-close">
                <button
                  className="close-button rbt-round-btn"
                  onClick={() => setShow(false)}
                >
                  <i className="feather-x"></i>
                </button>
              </div>
            </div>
          </div>
          <nav className="mainmenu-nav">
            <ul className="mainmenu">
              <li className="position-static">
                <Link to="/therapist-dashboard" style={{ cursor: "pointer" }}>
                  Home<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <Link to="/appointments" style={{ cursor: "pointer" }}>
                  Session Booking<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <Link to="/coupons" style={{ cursor: "pointer" }}>
                  Create Coupons<i className="feather-chevron-down"></i>
                </Link>
              </li>
             {/* 
<li className="position-static">
  <Link 
    to="/invoices" 
    style={{ cursor: "pointer" }}
  >
    Invoices <i className="feather-chevron-down"></i>
  </Link>
</li>

              
              <li className="position-static">
                <Link 
                to="/reviews" 
                style={{ cursor: "pointer" }}>
                  Rewiews<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <Link 
                to="/case-history" 
                style={{ cursor: "pointer" }}>
                  Case History<i className="feather-chevron-down"></i>
                </Link>
              </li>
            
              
              <li className="position-static">
                <Link to="/blogs" style={{ cursor: "pointer" }}>
                  Blog<i className="feather-chevron-down"></i>
                </Link>
              </li>*/}
                <li className="position-static">
                <Link to="/workshops" style={{ cursor: "pointer" }}>
                  Create Events<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <Link to="/settings" style={{ cursor: "pointer" }}>
                  Edit Profile<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <a onClick={handleLogout} style={{ cursor: "pointer" }}>
                  Logout<i className="feather-chevron-down"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <header className={`rbt-header rbt-header-10 ${isSticky ? "header-sticky" : ""}`}>
        <div className={`rbt-header-wrapper ${isSticky ? "rbt-sticky" : "header-space-betwween"}`}>
          <div className="container-fluid">
            <div className="mainbar-row rbt-navigation-start align-items-center">
              <div className="header-left rbt-header-content">
                <div className="header-info">
                  <div className="logo">
                    <Link
                      to="/therapist-dashboard"
                      style={{ cursor: "pointer" }}
                    >
                      <ImageTag
                        alt="Education Logo Images"
                        height={"55"}
                        width={"167"}
                        src={logo1}
                      />
                    </Link>
                  </div>
                </div>
                <div className="header-info d-none d-lg-block"></div>
              </div>
              <div className="rbt-main-navigation d-none d-xl-block"></div>
              <div className="header-right">
                <ul className="quick-access">
                  <li className="access-icon">
                    <a
                      className="search-trigger-active rbt-round-btn"
                      href="https://chooseyourtherapist.in"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-solid fa-globe"></i>
                    </a>
                  </li>
                  <li>
                    <Link className="service-menu-parent" to={"/notifications"}>
                      <i className="fa-solid fa-bell"></i> &nbsp;
                    </Link>
                  </li>
                  <li className="account-access rbt-user-wrapper d-none d-xl-block">
                    <div
                      className="service-menu-parent"
                      style={{ marginRight: 30 }}
                    >
                      <div className="rbt-admin-profile ">
                        <div className="admin-thumbnail">
                          <ImageTag
                            alt="User"
                            height={"50"}
                            width={"50"}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                            src={`${imagePath}/${therapistInfo.user.profile}` || defaultProfile}
                          />
                        </div>
                        <div className="admin-info">
                          <span className="name" style={{ fontSize: "16px", fontWeight: "600" }}>{therapistInfo.user.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rbt-user-menu-list-wrapper">
                      <div className="inner">
                        <ul className="user-list-wrapper">
                          <li>
                            <Link to="/therapist-dashboard">
                              <i className="feather-home"></i>
                              <span>Home</span>
                            </Link>
                          </li>

                          <li>
                            <Link to="/settings">
                              <i className="feather-shopping-bag"></i>
                              <span>Edit Profile</span>
                            </Link>
                          </li>
                         
                          <li>
                            <Link to="/appointments">
                              <i className="feather-clock"></i>
                              <span>Session Booking</span>
                            </Link>
                          </li>
                        </ul>

                        <hr className="mt--10 mb--10" />
                        <ul className="user-list-wrapper">
                          <li>
                            <a
                              onClick={handleLogout}
                              style={{ cursor: "pointer" }}
                            >
                              <i className="feather-log-out"></i>
                              <span>Logout</span>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ul>

                <div
                  className="mobile-menu-bar d-block d-xl-none"
                  onClick={() => setShow(true)}
                >
                  <div className="hamberger">
                    <button className="hamberger-button rbt-round-btn">
                      <i className="feather-menu"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

    </>
  );
}
