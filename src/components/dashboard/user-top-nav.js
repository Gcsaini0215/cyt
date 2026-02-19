import React from "react";
const logo1 = "/logo.png";
import { Link, useNavigate } from "react-router-dom";
import ImageTag from "../../utils/image-tag";
import useUserStore from "../../store/userStore";
import { removeToken } from "../../utils/jwt";
import { frontendUrl, imagePath } from "../../utils/url";
export default function UserDashboardTopNav() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const [show, setShow] = React.useState(false);

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
                <Link to="/my-dashboard" style={{ cursor: "pointer" }}>
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
                <Link to="/my-dashboard" style={{ cursor: "pointer" }}>
                  Home Base<i className="feather-chevron-down"></i>
                </Link>
              </li>
              {/* <li className="position-static">
                <Link to="/my-invoices" style={{ cursor: "pointer" }}>
                  Invoices<i className="feather-chevron-down"></i>
                </Link>
              </li> */}
              <li className="position-static">
                <Link to="/my-bookings" style={{ cursor: "pointer" }}>
                  My Bookings<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <Link to="/my-therapists" style={{ cursor: "pointer" }}>
                  My Care<i className="feather-chevron-down"></i>
                </Link>
              </li>
              {/* <li className="position-static">
                <Link to="/my-reviews" style={{ cursor: "pointer" }}>
                  Rewiews<i className="feather-chevron-down"></i>
                </Link>
              </li> */}

              <li className="position-static">
                <Link to="/my-workshop-bookings" style={{ cursor: "pointer" }}>
                  Events & Vibes<i className="feather-chevron-down"></i>
                </Link>
              </li>
              <li className="position-static">
                <Link to="/my-settings" style={{ cursor: "pointer" }}>
                  My Edit<i className="feather-chevron-down"></i>
                </Link>
              </li>

              <li className="position-static">
                <button
                  onClick={handleLogout}
                  style={{ cursor: "pointer", background: "none", border: "none",marginTop:"5px",marginLeft:"-4px" }}
                >
                
                  <span style={{fontSize:"17px",fontWeight:600}}>Logout</span>
                </button>
              </li>

            </ul>
          </nav>
        </div>
      </div>
      <header className="rbt-header rbt-header-10">
        <div className="rbt-header-wrapper header-space-betwween header-sticky rbt-sticky">
          <div className="container-fluid">
            <div className="mainbar-row rbt-navigation-start align-items-center">
              <div className="header-left rbt-header-content">
                <div className="header-info">
                  <div className="logo">
                    <Link to="/my-dashboard" style={{ cursor: "pointer" }}>
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
                      href={frontendUrl}
                      target="_blank"
                      rel="noreferrer"
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
                            height={"43"}
                            src={`${imagePath}/${userInfo.profile}`}
                          />
                        </div>
                        <div className="admin-info">
                          <span className="name">{userInfo.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rbt-user-menu-list-wrapper">
                      <div className="inner">
                        <ul className="user-list-wrapper">
                          <li>
                            <Link to="/my-dashboard">
                              <i className="feather-home"></i>
                              <span>My Dashboard</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/my-therapists">
                              <i className="feather-shopping-bag"></i>
                              <span>My Care</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/my-bookings">
                              <i className="feather-shopping-bag"></i>
                              <span>My Bookings</span>
                            </Link>
                          </li>

                          <li>
                            <Link to="/my-workshop-bookings">
                              <i className="feather-shopping-bag"></i>
                              <span>Events & Vibes</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/my-settings">
                              <i className="feather-shopping-bag"></i>
                              <span>Edit Profile</span>
                            </Link>
                          </li>
                        </ul>

                        <hr className="mt--10 mb--10" />
                        <ul className="user-list-wrapper">
                          <li>
                            {/* <Link
                              onClick={handleLogout}
                              style={{ cursor: "pointer" }}
                            >
                              <i className="feather-log-out"></i>
                              <span>Logout</span>
                            </Link> */}
                            <button
                              onClick={handleLogout}
                              style={{ cursor: "pointer", background: "none", border: "none" }}
                            >
                              <i className="feather-log-out" style={{color:"#999ea6"}}></i>
                              <span style={{color:"#999ea6",fontSize:"15px"}}> &nbsp;Logout</span>
                            </button>
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
