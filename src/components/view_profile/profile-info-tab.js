import React, { useEffect } from "react";
import { Link } from "react-router-dom";
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
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
  };

  const chipStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    margin: "4px",
    background: "rgba(0,0,0,0.05)",
    color: "#333",
    fontWeight: 500,
    fontSize: 14,
    cursor: "default",
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
        <div className="row g-5">
          <div className="col-lg-10 offset-lg-1">
            {/* Tabs */}
            <div className="advance-tab-button mb-4">
              <ul className="nav nav-tabs tab-button-style-2" id="myTab-4">
                <li>
                  <Link
                    className={tab === 1 ? "tab-button active" : "tab-button"}
                    id="home-tab-4"
                    aria-selected={tab === 1 ? "true" : "false"}
                    onClick={() => handleClick(1)}
                    to="#"
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
                    to="#"
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
                    to="#"
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
                <div style={glassCard}>
                  <h4 className="rbt-title-style-3 mb-3">About Me</h4>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: "#333",  textAlign: "justify" }}>
                    {pageData.user.bio}
                  </p>
                </div>

                {/* Services */}
                <div style={glassCard}>
                  <h4 className="rbt-title-style-3 mb-3">Services</h4>
                  <div>
                    {pageData.services.split(",").map((item) => (
                      <span key={item} style={chipStyle}>{item}</span>
                    ))}
                  </div>
                </div>

                {/* Expertise */}
                <div style={glassCard}>
                  <h4 className="rbt-title-style-3 mb-3">Expertise</h4>
                  <div>
                    {pageData.experties.split(",").map((item) => (
                      <span key={item} style={chipStyle}>{item}</span>
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
