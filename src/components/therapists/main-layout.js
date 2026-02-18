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
              top: "80px", 
              left: 0,
              bottom: 0,
              width: sidebarWidth,
              background: "#ffffff",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "10px 0",
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
                    { to: "/workshops", icon: "fa-solid fa-file-medical", title: "Events" },
                    { to: "/coupons", icon: "feather-star", title: "Coupons" },
                  ].map((item) => (
                    <li key={item.to} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
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

        {/* Main Content Area */}
        <main 
          style={{ 
            marginLeft: isMobile ? 0 : sidebarWidth,
            padding: isMobile ? "20px" : "30px 40px"
          }}
        >
          <div className="container-fluid" style={{ maxWidth: "1500px", margin: "0 auto", marginTop: "40px" }}>
            {/* Smooth Content Loading Logic would be in the children components */}
            {props.children}
          </div>
        </main>
      </div>
    </>
  );
}
