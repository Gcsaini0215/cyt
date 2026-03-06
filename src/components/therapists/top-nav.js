import React, { useEffect, useRef } from "react";
const logo1 = "/logo.png";
import Link from "next/link";
import { useRouter } from "next/router";
import ImageTag from "../../utils/image-tag";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { getBookings } from "../../utils/url";
import { toast } from "react-toastify";

export default function DashboardTopNav() {
  const { therapistInfo, fetchTherapistInfo, notificationCount, setNotificationCount, incrementNotificationCount } = useTherapistStore();
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const [isSticky, setIsSticky] = React.useState(false);
  const prevBookingsCount = useRef(null);

  useEffect(() => {
    fetchTherapistInfo();
  }, [fetchTherapistInfo]);

  // Polling for new bookings
  useEffect(() => {
    const checkNewBookings = async () => {
      try {
        const res = await fetchById(getBookings);
        if (res.status && res.data) {
          const currentCount = res.data.length;
          
          if (prevBookingsCount.current !== null && currentCount > prevBookingsCount.current) {
            // New booking found
            const newOnes = currentCount - prevBookingsCount.current;
            setNotificationCount(notificationCount + newOnes);
            
            // Show toast notification
            toast.info(`🔔 You have ${newOnes} new session booking${newOnes > 1 ? 's' : ''}!`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });

            // Optional: Play a subtle notification sound if you have one
            // new Audio('/notification-sound.mp3').play().catch(() => {});
          }
          
          prevBookingsCount.current = currentCount;
        }
      } catch (err) {
        console.error("Error checking notifications:", err);
      }
    };

    // Initial check
    checkNewBookings();

    // Poll every 30 seconds
    const interval = setInterval(checkNewBookings, 30000);
    return () => clearInterval(interval);
  }, [notificationCount, setNotificationCount]);

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
    router.push("/login");
  };

  return (
    <>
      <div className={show ? "popup-mobile-menu active" : "popup-mobile-menu"}>
        <div className="inner-wrapper" style={{ padding: "0", background: "#fff", maxWidth: "300px" }}>
          <div className="inner-top" style={{ 
            padding: "30px 25px", 
            background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
            borderBottom: "none",
            marginBottom: "10px"
          }}>
            <div className="content" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div className="user-info-mobile" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="thumbnail" style={{ position: "relative" }}>
                  <ImageTag
                    alt={therapistInfo.user.name}
                    width="65"
                    height="65"
                    style={{ borderRadius: "18px", border: "3px solid rgba(255,255,255,0.2)", objectFit: "cover" }}
                    src={`${imagePath}/${therapistInfo.user.profile}` || defaultProfile}
                  />
                </div>
                <div className="details">
                  <h5 style={{ color: "#fff", marginBottom: "2px", fontSize: "18px", fontWeight: "800" }}>{therapistInfo.user.name}</h5>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Therapist Dashboard</span>
                </div>
              </div>
              <div className="rbt-btn-close">
                <button
                  className="close-button rbt-round-btn"
                  onClick={() => setShow(false)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "36px", height: "36px" }}
                >
                  <i className="feather-x"></i>
                </button>
              </div>
            </div>
          </div>
          
          <nav className="mainmenu-nav" style={{ padding: "10px 15px" }}>
            <ul className="mainmenu" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[
                { to: "/therapist-dashboard", icon: "feather-home", label: "Dashboard" },
                { to: "/appointments", icon: "feather-calendar", label: "Sessions", hasBadge: true },
                { to: "/clinic-patients", icon: "feather-users", label: "Clinic Clients" },
                { to: "/workshops", icon: "feather-award", label: "Manage Events" },
                { to: "/coupons", icon: "feather-tag", label: "Coupons" },
                { to: "/therapist-blogs", icon: "feather-edit-3", label: "Write Blog" },
                { to: "/therapist-ai-blog", icon: "feather-zap", label: "Write with AI" },
                { to: "/therapists/invoices", icon: "feather-file-text", label: "Invoices" },
                { to: "/settings", icon: "feather-settings", label: "Settings" },
              ].map((item) => (
                <li key={item.to} className="position-static" style={{ width: "100%" }}>
                  <Link 
                    href={item.to} 
                    onClick={() => { setShow(false); if(item.hasBadge) setNotificationCount(0); }}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      gap: "12px", 
                      padding: "12px 15px", 
                      borderRadius: "12px",
                      color: router.pathname === item.to ? "#059669" : "#475569",
                      background: router.pathname === item.to ? "#f0fdf4" : "transparent",
                      fontSize: "15px",
                      fontWeight: router.pathname === item.to ? "700" : "500",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <i className={item.icon} style={{ fontSize: "20px" }}></i>
                      {item.label}
                    </div>
                    {item.hasBadge && notificationCount > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
              
              <li style={{ height: "1px", background: "#f1f5f9", margin: "10px 15px" }}></li>
              
              <li className="position-static" style={{ width: "100%" }}>
                <a 
                  onClick={() => { handleLogout(); setShow(false); }} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "12px 15px", 
                    borderRadius: "12px",
                    color: "#ef4444",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  <i className="feather-log-out" style={{ fontSize: "20px" }}></i>
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <header className={`rbt-header rbt-header-10 ${isSticky ? "header-sticky" : ""}`} style={{ zIndex: 1000 }}>
        <div className={`rbt-header-wrapper ${isSticky ? "rbt-sticky" : "header-space-betwween"}`} style={{ zIndex: 1000 }}>
          <div className="container-fluid">
            <div className="mainbar-row rbt-navigation-start align-items-center">
              <div className="header-left rbt-header-content">
                <div className="header-info">
                  <div className="logo">
                    <Link
                      href="/therapist-dashboard"
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
                      <i className="feather-globe"></i>
                    </a>
                  </li>
                  <li style={{ position: 'relative' }}>
                    <Link 
                      className="service-menu-parent" 
                      href={"/appointments"}
                      onClick={() => setNotificationCount(0)}
                      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    >
                      <i className="feather-bell" style={{ fontSize: '20px' }}></i>
                      {notificationCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          border: '2px solid white'
                        }}>
                          {notificationCount}
                        </span>
                      )}
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
                            <Link href="/therapist-dashboard">
                              <i className="feather-home"></i>
                              <span>Home</span>
                            </Link>
                          </li>

                          <li>
                            <Link href="/settings">
                              <i className="feather-settings"></i>
                              <span>Edit Profile</span>
                            </Link>
                          </li>
                         
                          <li>
                            <Link href="/appointments">
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
