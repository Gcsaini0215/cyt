import Link from "next/link";
import ImageTag from "../../utils/image-tag";
import { getMinMaxPrice } from "../../utils/helpers";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import React, { useState, useEffect } from "react";
import { postData } from "../../utils/actions";
import {
  imagePath,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import VerifiedIcon from "@mui/icons-material/Verified";

import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function ProfileCardVert(props) {
  const { data, favrioutes } = props;
  const [isMobile, setIsMobile] = useState(false);
  const [bookmark, setBookmark] = useState(favrioutes?.includes(data._id) || false);
  const [showBookmark, setShowBookmark] = useState(true);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);

  const handleBookmark = (id, value) => {
    setBookmark((prev) => !prev);
    if (!value) addFavrioute(id);
    else removeFavrioute(id);
  };

  const addFavrioute = async (id) => {
    try {
      const response = await postData(InsertFavriouteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch {
      return false;
    }
  };

  const removeFavrioute = async (id) => {
    try {
      const response = await postData(RemoveFavriouteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = getDecodedToken();
    if (token && token.role === 1) setShowBookmark(false);
    setBookmark(favrioutes?.includes(data._id) || false);
    setFees(data.fees || []);
  }, [data, favrioutes]);

  return (
    <div className="swiper-slide">
      <style>{`
        .therapist-premium-card:hover .therapist-img {
          transform: scale(1.08);
        }
      `}</style>
      <div
        className="rbt-card variation-01 therapist-premium-card"
        style={{
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #f1f5f9",
          overflow: "hidden",
          height: "100%",
          color: "#1e293b"
        }}
      >
        <div className="card-image-wrap" style={{ position: "relative", overflow: "hidden" }}>
          <Link href={`/view-profile/${data._id}`} style={{ display: "block" }}>
            <ImageTag
              alt={data.user?.name}
              className="therapist-img"
              style={{
                display: "block",
                width: "100%",
                height: isMobile ? "320px" : "260px",
                objectFit: "cover",
                objectPosition: "center",
                transition: "transform 0.5s ease"
              }}
              src={`${imagePath}/${data.user?.profile}`}
            />
            {/* Gradient Overlay for better badge visibility */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
              zIndex: 1,
              pointerEvents: "none"
            }}></div>

            <div
              className="badge-container"
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                zIndex: 2
              }}
            >
              {data.priority === 1 && (
                <span className="premium-badge recommended">
                  <ThumbUpIcon sx={{ fontSize: 14 }} /> Recommended
                </span>
              )}
              {data.priority === 2 && (
                <span className="premium-badge verified">
                  <VerifiedIcon sx={{ fontSize: 14 }} /> Verified
                </span>
              )}
            </div>
            
            <div className="price-overlay-badge">
              {getMinMaxPrice(fees)}
            </div>
          </Link>
        </div>

        <div className="card-body-content" style={{ padding: isMobile ? "16px" : "20px", display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1 }}>
          <div className="card-top-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="name-type-wrap" style={{ flexGrow: 1 }}>
              <h4 className="therapist-name" style={{ fontWeight: "800", fontSize: isMobile ? "18px" : "20px", margin: "0 0 2px 0", color: "inherit" }}>
                <Link href={`/view-profile/${data._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  {data.user?.name || "Therapist"}
                </Link>
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span className="profile-type-text" style={{ 
                  fontSize: "11px", 
                  color: "#228756", 
                  fontWeight: "700", 
                  background: "#e8f5e9", 
                  padding: "2px 6px", 
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px"
                }}>
                  <PersonIcon sx={{ fontSize: 13 }} /> {data.profile_type}
                </span>
                {data.state && (
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: "#228756" }} /> {data.state}
                  </span>
                )}
              </div>
            </div>

            {showBookmark && (
              <button
                className={`bookmark-btn ${bookmark ? 'active' : ''}`}
                onClick={() => handleBookmark(data._id, bookmark)}
                style={{
                  border: "none",
                  background: bookmark ? "#fff7ed" : "#f8fafc",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: bookmark ? "0 4px 10px rgba(245, 158, 11, 0.1)" : "none",
                  border: bookmark ? "1px solid #fde68a" : "1px solid #f1f5f9"
                }}
              >
                {bookmark ? <BookmarkAddedIcon sx={{ fontSize: 20, color: "#f59e0b" }} /> : <BookmarkBorderIcon sx={{ fontSize: 20, color: "#94a3b8" }} />}
              </button>
            )}
          </div>

          <div className="meta-info-grid" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <div className="meta-pill">
              <i className="feather-briefcase"></i> {data.year_of_exp} Exp.
            </div>
            <div className="meta-pill">
              <i className="feather-globe"></i> {data.language_spoken?.split(',')[0]}
            </div>
          </div>

          <div className="card-action-btns" style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "10px" }}>
            <Link
              href={`/view-profile/${data._id}`}
              className="btn-outline-premium"
              style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: "10px", border: "1.5px solid #e2e8f0", color: "#475569", fontWeight: "700", fontSize: "13px", textDecoration: "none", transition: "all 0.2s" }}
            >
              View Profile
            </Link>

            <Link
              href={`/therapist-checkout/${data._id}`}
              className="btn-fill-premium"
              style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: "10px", background: "#228756", color: "#fff", fontWeight: "700", fontSize: "13px", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(34, 135, 86, 0.2)" }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
