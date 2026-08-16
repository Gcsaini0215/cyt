import React, { useEffect } from "react";
import Link from "next/link";
import { getValidServices } from "../../utils/helpers";

const TABS = [
  { id: 1, label: "Overview" },
  { id: 2, label: "Fees" },
  { id: 3, label: "Availability" },
];

export default function ProfileInfoTab({ pageData }) {
  const [tab, setTab] = React.useState(1);
  const [services, setServices] = React.useState();

  const handleClick = (id) => setTab(id);

  const setConfig = async (profile) => {
    const validServices = await getValidServices(profile.fees);
    setServices(validServices);
  };

  useEffect(() => {
    setConfig(pageData);
  }, [pageData]);

  const sectionCard = {
    background: "#fff",
    borderRadius: 6,
    padding: "28px 30px",
    marginBottom: 20,
    boxShadow: "0 4px 20px rgba(15,61,36,0.08)",
  };

  const bioTextStyle = {
    fontSize: 16,
    lineHeight: 1.85,
    color: "#374b40",
    fontFamily: "'Georgia', 'Inter', serif",
    whiteSpace: "pre-line",
  };

  const tagStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 13px",
    borderRadius: 4,
    margin: "0 6px 8px 0",
    fontWeight: 600,
    fontSize: 12.5,
    background: "#fbfaf7",
    color: "#374b40",
    border: "1px solid #dbe3df",
  };

  const expertiseTagStyle = { ...tagStyle, color: "#0f3d24", borderColor: "#c8ddd0" };

  return (
    <div className="rbt-advance-tab-area" style={{ paddingTop: 44, paddingBottom: 50, background: "#fff" }}>
      <div className="container">
        <style>{`
          .pit-tab-btn {
            background: none; border: none; cursor: pointer; padding: 12px 4px; margin-right: 30px;
            font-size: 13px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
            color: #8a978f; border-bottom: 2.5px solid transparent; transition: color 0.2s, border-color 0.2s;
            white-space: nowrap;
          }
          .pit-tab-btn:hover { color: #0f3d24; }
          .pit-tab-btn.active { color: #0f3d24; border-bottom-color: #c9962c; }
          .pit-tabbar { display: flex; overflow-x: auto; border-bottom: 1px solid #e3e8e4; margin-bottom: 28px; -ms-overflow-style: none; scrollbar-width: none; }
          .pit-tabbar::-webkit-scrollbar { display: none; }
          .pit-section-head {
            font-family: Playfair Display, Georgia, serif; font-weight: 700; color: #122019;
            font-size: 21px; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1.5px solid #ecefec;
          }
          .pit-table-wrap { border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,61,36,0.08); }
          .pit-table-wrap + .pit-table-wrap { margin-top: 18px; }
          .pit-table { width: 100%; border-collapse: collapse; }
          .pit-table th {
            text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.6px;
            color: #8a978f; font-weight: 700; padding: 12px 18px; background: #fbfaf7;
            border-bottom: 1.5px solid #e3e8e4; line-height: 1.4;
          }
          .pit-table td {
            padding: 15px 18px; font-size: 14px; color: #122019; line-height: 1.5;
            border-bottom: 1px solid #ecefec; vertical-align: middle; font-variant-numeric: tabular-nums;
          }
          .pit-table tr:last-child td { border-bottom: none; }
          .pit-table tbody tr:hover td { background: #fbfaf7; }
          @media (max-width: 991px) {
            .rbt-advance-tab-area { padding-top: 26px !important; }
          }
          @media (max-width: 768px) {
            .pit-section-card { padding: 20px 18px !important; }
            .pit-section-head { font-size: 18px !important; }
          }
        `}</style>

        <div className="row" style={{ gap: 0 }}>
          {/* ── MAIN COLUMN ── */}
          <div className="col-lg-10 offset-lg-1">
            <div className="pit-tabbar">
              {TABS.map(t => (
                <button key={t.id} className={`pit-tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => handleClick(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === 1 && (
              <div>
                <div style={sectionCard} className="pit-section-card">
                  <h4 className="pit-section-head">About</h4>
                  <p style={bioTextStyle}>{pageData.user.bio}</p>
                </div>

                <div style={sectionCard} className="pit-section-card">
                  <h4 className="pit-section-head">Services Offered</h4>
                  <div>
                    {(pageData.services || "").split(",").filter(s => s.trim()).map((item) => (
                      <span key={item} style={tagStyle}>{item.trim()}</span>
                    ))}
                  </div>
                </div>

                <div style={sectionCard} className="pit-section-card">
                  <h4 className="pit-section-head">Areas of Expertise</h4>
                  <div>
                    {(pageData.experties || "").split(",").filter(s => s.trim()).map((item) => (
                      <span key={item} style={expertiseTagStyle}>{item.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fees */}
            {tab === 2 && (
              <div>
                {services && services.map((item) => (
                  <div key={item._id} style={sectionCard} className="pit-section-card">
                    <h4 className="pit-section-head">{item.name}</h4>
                    <div className="pit-table-wrap">
                      <table className="pit-table">
                        <thead>
                          <tr><th>Format</th><th style={{ textAlign: "right" }}>Fee</th></tr>
                        </thead>
                        <tbody>
                          {item.formats.map((format) => (
                            <tr key={format._id}>
                              <td>{format.type.charAt(0).toUpperCase() + format.type.slice(1)}</td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>₹{format.fee}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {(!services || services.length === 0) && (
                  <div style={sectionCard} className="pit-section-card">
                    <p style={{ margin: 0, color: "#8a978f", fontSize: 14 }}>Fee details will be shared during booking.</p>
                  </div>
                )}
              </div>
            )}

            {/* Availability */}
            {tab === 3 && (
              <div style={sectionCard} className="pit-section-card">
                <h4 className="pit-section-head">Weekly Availability</h4>
                {pageData.availabilities && pageData.availabilities.length > 0 ? (
                  <div className="pit-table-wrap">
                    <table className="pit-table">
                      <thead>
                        <tr><th>Day</th><th style={{ textAlign: "right" }}>Hours</th></tr>
                      </thead>
                      <tbody>
                        {pageData.availabilities.map((item, index) => (
                          <tr key={index}>
                            <td style={{ fontWeight: 700 }}>{item.day}</td>
                            <td style={{ textAlign: "right" }}>
                              {item.times.map((time, idx) => (
                                <span key={idx} style={{ marginLeft: idx > 0 ? 14 : 0 }}>{time.open}–{time.close}</span>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#8a978f", fontSize: 14 }}>Please contact via chat to confirm current availability.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
