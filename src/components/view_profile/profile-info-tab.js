import React, { useEffect } from "react";
import Link from "next/link";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { successColor } from "../../utils/colors";
import { getValidServices } from "../../utils/helpers";

export default function ProfileInfoTab({ pageData }) {
  const [tab, setTab] = React.useState(1);
  const [services, setServices] = React.useState();

  const handleClick = (id) => {
    setTab(id);
  };

  const listStyleTime = {
    fontSize: 24,
    color: successColor,
  };

  const setConfig = async (profile) => {
    const validServices = await getValidServices(profile.fees);
    setServices(validServices);
  };

  useEffect(() => {
    setConfig(pageData);
  }, [pageData]);

  // Glassmorphism card style
  const glassCard = {
    backdropFilter: "blur(10px)",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "25px",
    boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  };

  const bioTextStyle = {
    fontSize: "17px",
    lineHeight: "1.8",
    color: "#4a5568",
    fontFamily: "'Inter', 'Roboto', sans-serif",
    textAlign: "left",
    letterSpacing: "0.2px",
    whiteSpace: "pre-line",
    wordSpacing: "1px"
  };

  const chipStyleBase = {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 22px",
    borderRadius: "50px",
    margin: "6px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "default",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap"
  };

  const serviceChipStyle = {
    ...chipStyleBase,
    background: "#f0fdf4",
    color: "#166534",
    border: "1.5px solid #dcfce7",
  };

  const expertiseChipStyle = {
    ...chipStyleBase,
    background: "#eff6ff",
    color: "#1e40af",
    border: "1.5px solid #dbeafe",
  };

  return (
    <div
      className="rbt-advance-tab-area"
      style={{
        paddingBottom: 50,
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <div className="container">
        <style>{`
          .profile-bio-text {
            word-spacing: 2px;
            letter-spacing: 0.1px;
          }
          .section-title-accent {
            border-left: 5px solid #228756;
            padding-left: 15px;
          }
          .service-chip:hover {
            transform: translateY(-2px) scale(1.03);
            background: #dcfce7 !important;
            border-color: #228756 !important;
          }
          .expertise-chip:hover {
            transform: translateY(-2px) scale(1.03);
            background: #dbeafe !important;
            border-color: #3b82f6 !important;
          }
          @media (max-width: 768px) {
            .profile-bio-text {
              text-align: left !important;
              word-spacing: 1px;
              font-size: 15px !important;
              line-height: 1.7 !important;
            }
            .rbt-advance-tab-area {
              padding-top: 20px !important;
            }
            .glass-card-mobile {
              padding: 20px !important;
              margin-bottom: 20px !important;
              border-radius: 16px !important;
            }
            .service-chip, .expertise-chip {
              padding: 8px 16px !important;
              font-size: 13px !important;
              margin: 4px !important;
            }
            .rbt-title-style-3 {
              font-size: 18px !important;
            }
          }
        `}</style>
        <div className="row g-5">
          <div className="col-lg-10 offset-lg-1">
            {/* Tabs */}
            <div className="advance-tab-button mb-4">
              <ul className="nav nav-tabs tab-button-style-2" id="myTab-4" style={{ justifyContent: 'center' }}>
                <li>
                  <Link
                    className={tab === 1 ? "tab-button active" : "tab-button"}
                    id="home-tab-4"
                    aria-selected={tab === 1 ? "true" : "false"}
                    onClick={() => handleClick(1)}
                    href="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      Overview
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className={tab === 3 ? "tab-button active" : "tab-button"}
                    id="contact-tab-4"
                    aria-selected={tab === 3 ? "true" : "false"}
                    onClick={() => handleClick(3)}
                    href="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      Fees
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className={tab === 4 ? "tab-button active" : "tab-button"}
                    id="business-tab-4"
                    aria-selected={tab === 4 ? "true" : "false"}
                    onClick={() => handleClick(4)}
                    href="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      Availability
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tab Contents */}
            <div className="tab-content advance-tab-content-style-2">

              {/* Overview Tab */}
              <div
                className={tab === 1 ? "tab-pane fade active show" : "tab-pane fade"}
                id="home-4"
                role="tabpanel"
                aria-labelledby="home-tab-4"
              >
                {/* About Me */}
                <div style={glassCard} className="glass-card-mobile">
                  <h4 className="rbt-title-style-3 mb-3 section-title-accent" style={{ fontWeight: 800, color: '#1a202c' }}>About Me</h4>
                  <p className="profile-bio-text" style={bioTextStyle}>
                    {pageData.user.bio}
                  </p>
                </div>

                {/* Services */}
                <div style={glassCard} className="glass-card-mobile">
                  <h4 className="rbt-title-style-3 mb-3 section-title-accent" style={{ fontWeight: 800, color: '#1a202c' }}>Services</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {pageData.services.split(",").map((item) => (
                      <span key={item} className="service-chip" style={serviceChipStyle}>{item.trim()}</span>
                    ))}
                  </div>
                </div>

                {/* Expertise */}
                <div style={glassCard} className="glass-card-mobile">
                  <h4 className="rbt-title-style-3 mb-3 section-title-accent" style={{ fontWeight: 800, color: '#1a202c', borderLeftColor: '#3b82f6' }}>Expertise</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {pageData.experties.split(",").map((item) => (
                      <span key={item} className="expertise-chip" style={expertiseChipStyle}>{item.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fees Tab */}
              <div
                className={tab === 3 ? "tab-pane fade active show" : "tab-pane fade"}
                id="contact-4"
                role="tabpanel"
                aria-labelledby="contact-tab-4"
              >
                <div className="content">
                  {services && services.map((item) => (
                    <div key={item._id} style={glassCard}>
                      <h4 className="rbt-title-style-3 mb-2">{item.name}</h4>
                      <ul className="rbt-list-style-2" style={{ color: "#333" }}>
                        {item.formats.map((format) => (
                          <li key={format._id}>
                            <i className="feather-check text-success me-2"></i>
                            {format.type.charAt(0).toUpperCase() + format.type.slice(1)}: ₹{format.fee}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Tab */}
              <div
                className={tab === 4 ? "tab-pane fade active show" : "tab-pane fade"}
                id="business-4"
                role="tabpanel"
                aria-labelledby="business-tab-4"
              >
                <div className="content">
                  {pageData.availabilities &&
                    pageData.availabilities.map((item, index) => (
                      <div key={index} style={glassCard}>
                        <h4 className="rbt-title-style-3 mb-2">{item.day}</h4>
                        {item.times.map((time, idx) => (
                          <span style={{ marginRight: 40, fontSize: 16, color: "#333" }} key={idx}>
                            <WatchLaterIcon style={listStyleTime} />
                            &nbsp;{time.open}-{time.close}
                          </span>
                        ))}
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
