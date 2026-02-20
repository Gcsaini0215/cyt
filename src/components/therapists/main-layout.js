import { Link, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import DashboardTopNav from "./top-nav";
import useMediaQuery from "@mui/material/useMediaQuery";
import { checkProfileSet } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import CircleIcon from "@mui/icons-material/Circle";

export default function MainLayout(props) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { profileSet, setProfileSet, therapistInfo } = useTherapistStore();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [blogDropdownOpen, setBlogDropdownOpen] = React.useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = React.useState(false);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  React.useEffect(() => {
    if (!profileSet) {
      const getData = async () => {
        try {
          const res = await fetchById(checkProfileSet);
          if (res.status) {
            setProfileSet(res.data.check);
          }
        } catch (err) {
          console.log(err);
        }
      };
      getData();
    }
  }, [profileSet]);

  const sidebarWidth = "80px";

  return (
    <>
      <DashboardTopNav />
      <div className="rbt-dashboard-area" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        
        {/* Desktop Sidebar - Minimalist Icon Bar */}
        {!isMobile && (
          <aside 
            style={{ 
              position: "fixed",
              top: 0, 
              left: 0,
              bottom: 0,
              width: sidebarWidth,
              background: "#ffffff",
              zIndex: 90, // Lower than TopNav
              display: "flex",
              flexDirection: "column",
              padding: "80px 0 10px 0",
              boxShadow: "none",
              borderRight: "none"
            }}
          >
            <div className="sidebar-inner" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              
              {/* Navigation Items */}
              <nav style={{ width: "100%" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                  {[
                    { to: "/therapist-dashboard", icon: "feather-home", title: "Home" },
                    { to: "/appointments", icon: "fa-regular fa-calendar-check", title: "Sessions" },
                    { 
                      id: 'event-menu',
                      icon: "fa-solid fa-file-medical", 
                      title: "Events",
                      isDropdown: true,
                      isOpen: eventDropdownOpen,
                      setOpen: setEventDropdownOpen,
                      activePaths: ["/workshops", "/coupons"],
                      subItems: [
                        { to: "/workshops", title: "Manage Events", icon: "feather-calendar" },
                        { to: "/coupons", title: "Coupons", icon: "feather-star" }
                      ]
                    },
                    { 
                      id: 'blog-menu',
                      icon: "feather-edit", 
                      title: "Blog",
                      isDropdown: true,
                      isOpen: blogDropdownOpen,
                      setOpen: setBlogDropdownOpen,
                      activePaths: ["/therapist-blogs", "/therapist-ai-blog"],
                      subItems: [
                        { to: "/therapist-blogs", title: "Write Blog", icon: "feather-edit-2" },
                        { to: "/therapist-ai-blog", title: "Write with AI", icon: "feather-zap" }
                      ]
                    },
                  ].map((item) => (
                    <li key={item.to || item.id} style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative" }}>
                      {item.isDropdown ? (
                        <div 
                          onMouseEnter={() => item.setOpen(true)}
                          onMouseLeave={() => item.setOpen(false)}
                          style={{ position: 'relative' }}
                        >
                          <div
                            title={item.title}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "56px",
                              height: "56px",
                              borderRadius: "14px",
                              color: item.activePaths.includes(pathname) ? "#228756" : "#64748b",
                              background: item.activePaths.includes(pathname) ? "#e8f5e9" : "transparent",
                              cursor: "pointer",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                          >
                            <i className={item.icon} style={{ fontSize: "28px" }}></i>
                          </div>
                          
                          {/* Dropdown Menu */}
                          {item.isOpen && (
                            <div style={{
                              position: 'absolute',
                              left: '56px',
                              top: '0',
                              paddingLeft: '10px',
                              zIndex: 1000,
                            }}>
                              <div style={{
                                background: '#fff',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                borderRadius: '12px',
                                padding: '8px',
                                width: '180px',
                                border: '1px solid #f1f5f9'
                              }}>
                                {item.subItems.map((sub) => (
                                  <Link
                                    key={sub.to}
                                    to={sub.to}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      padding: '10px 12px',
                                      color: pathname === sub.to ? '#228756' : '#64748b',
                                      background: pathname === sub.to ? '#f0fdf4' : 'transparent',
                                      textDecoration: 'none',
                                      borderRadius: '8px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <i className={sub.icon} style={{ fontSize: '16px' }}></i>
                                    {sub.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.to}
                          title={item.title}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            color: pathname === item.to ? "#228756" : "#64748b",
                            background: pathname === item.to ? "#e8f5e9" : "transparent",
                            textDecoration: "none",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                        >
                          <i className={item.icon} style={{ fontSize: "28px" }}></i>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Minimal Divider */}
                <div style={{ width: "30px", height: "1px", background: "#f1f5f9", margin: "15px auto" }}></div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                  <li>
                    <Link
                      to="/settings"
                      title="Edit Profile"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        color: pathname === "/settings" ? "#228756" : "#64748b",
                        background: pathname === "/settings" ? "#e8f5e9" : "transparent",
                        textDecoration: "none",
                        position: "relative",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                    >
                      <i className="feather-settings" style={{ fontSize: "28px" }}></i>
                      <div style={{ 
                        position: "absolute", 
                        top: "10px", 
                        right: "10px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: profileSet ? "#22c55e" : "#ef4444",
                        border: "2px solid #fff"
                      }}></div>
                    </Link>
                  </li>
                  <li>
                    <a
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        color: "#ef4444",
                        cursor: "pointer",
                        textDecoration: "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                      title="Logout"
                    >
                      <i className="feather-log-out" style={{ fontSize: "28px" }}></i>
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Minimal Profile Shortcut at Bottom */}
              <div style={{ marginTop: "auto", marginBottom: "15px" }}>
                <Link to="/settings" title="Profile Settings">
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "16px", 
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #f1f5f9",
                    overflow: "hidden",
                    transition: "all 0.2s ease"
                  }}>
                    <i className="feather-user" style={{ fontSize: "22px", color: "#94a3b8" }}></i>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav 
            style={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: '#fff', 
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-around',
              padding: '12px 0',
              zIndex: 1000,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}
          >
            {[
              { to: "/therapist-dashboard", icon: "feather-home", label: "Home" },
              { to: "/appointments", icon: "fa-regular fa-calendar-check", label: "Sessions" },
              { to: "/settings", icon: "feather-user", label: "Profile" }
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  color: pathname === item.to ? '#228756' : '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '11px',
                  fontWeight: pathname === item.to ? '700' : '500'
                }}
              >
                <i className={item.icon} style={{ fontSize: '22px' }}></i>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Main Content Area */}
        <main 
          style={{ 
            marginLeft: isMobile ? 0 : sidebarWidth,
            padding: isMobile ? "20px 20px 80px 20px" : "30px 40px"
          }}
        >
          <div className="container-fluid" style={{ maxWidth: "1500px", margin: "0 auto", marginTop: "10px" }}>
            {/* Smooth Content Loading Logic would be in the children components */}
            {props.children}
          </div>
        </main>
      </div>
    </>
  );
}
