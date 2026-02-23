import useMediaQuery from "@mui/material/useMediaQuery";
import ImageTag from "../../utils/image-tag";
import Link from "next/link";

import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import VerifiedIcon from "@mui/icons-material/Verified"; // ✅ Badge + Name ke aage
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PersonIcon from "@mui/icons-material/Person";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import React from "react";
import { getDecodedToken } from "../../utils/jwt";
import { postData } from "../../utils/actions";
import {
  imagePath,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";

export default function ProfileCardHor({ pageData, favrioutes, showRecommended = false, showOnlyBookButton = false }) {
  console.log("ProfileCardHor rendering with pageData:", pageData, "showRecommended:", showRecommended, "showOnlyBookButton:", showOnlyBookButton);

  // Determine badge type based on data.priority or fallback to showRecommended prop
  const isRecommended = pageData.priority === 1 || (pageData.priority === undefined && showRecommended);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(true);

  const handleBookmark = (id, value) => {
    setBookmark((prevBookmark) => !prevBookmark);
    let isSuccess = true;
    if (value) {
      isSuccess = removeFavrioute(id);
    } else {
      isSuccess = addFavrioute(id);
    }
    if (!isSuccess) {
      setBookmark(false);
    }
  };

  const addFavrioute = async (id) => {
    try {
      const response = await postData(InsertFavriouteTherapistUrl, {
        therapistId: id,
      });
      return !!response.status;
    } catch (error) {
      return false;
    }
  };

  const removeFavrioute = async (id) => {
    try {
      const response = await postData(RemoveFavriouteTherapistUrl, {
        therapistId: id,
      });
      return !!response.status;
    } catch (error) {
      return false;
    }
  };

  React.useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) {
        setShowBookmark(false);
      }
    }
    setBookmark(favrioutes.includes(pageData._id));
  }, [pageData, favrioutes]);

  return (
    <div className="col-12 sal-animate">
      <div 
        className="rbt-card variation-01 rbt-hover card-list-2" 
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid #f1f5f9",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          background: "#fff",
          transition: "all 0.3s ease"
        }}
      >
        {/* Image + Badge */}
        <div className="rbt-card-img" style={{ position: "relative", overflow: "hidden" }}>
          <Link href={`/view-profile/${pageData._id}`}>
            <ImageTag
              alt="profile image"
              src={`${imagePath}/${pageData.user?.profile}`}
              style={{
                height: isMobile ? 255 : 235,
                width: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease"
              }}
              className="card-profile-img"
            />
            {/* Badge - Verified or Recommended based on prop */}
            <div
              className="rbt-badge-group"
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                zIndex: 2,
              }}
            >
              <span
                className="rbt-badge-6"
                style={{
                  background: isRecommended
                    ? "linear-gradient(135deg, #36b477ff 0%, #35c06fff 50%, #2c7754ff 100%)"
                    : "linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)",
                  color: "#fff",
                  padding: "10px 18px 10px 24px",
                  fontSize: "13px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  position: "relative",
                  borderRadius: "0 25px 25px 0",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
                  transform: "translateX(-12px) translateY(2px)",
                  clipPath: "polygon(12px 0%, 100% 0%, 88% 100%, 0% 100%)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {isRecommended ? (
                  <>
                    <ThumbUpIcon sx={{ fontSize: 16 }} /> Recommended
                  </>
                ) : (
                  <>
                    <VerifiedIcon sx={{ fontSize: 16 }} /> Verified
                  </>
                )}
              </span>
            </div>
          </Link>
        </div>

        {/* Card Body */}
        <div className="rbt-card-body" style={{ padding: "24px" }}>
          <div className="rbt-card-top" style={{ alignItems: "center" }}>
            <div className="rbt-review" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h4 className="rbt-card-title" style={{ 
                margin: 0, 
                fontSize: "22px", 
                fontWeight: "800",
                letterSpacing: "-0.5px",
                color: "#1e293b"
              }}>
                <Link href={`/view-profile/${pageData._id}`} style={{ color: "inherit" }}>
                  {pageData.user?.name || "Therapist"}
                </Link>
              </h4>
              {/* Icon next to name - Verified or Recommended */}
              {isRecommended ? (
                <ThumbUpIcon sx={{ fontSize: 20, color: "#228756" }} />
              ) : (
                <VerifiedIcon sx={{ fontSize: 20, color: "#1976d2" }} />
              )}
            </div>
            {showBookmark && (
              <div className="rbt-bookmark-btn">
                <button
                  style={{ 
                    cursor: "pointer", 
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: bookmark ? "#228756" : "#94a3b8",
                    transition: "all 0.3s ease"
                  }}
                  title="Bookmark"
                  onClick={() => handleBookmark(pageData._id, bookmark)}
                >
                  {bookmark ? (
                    <BookmarkAddedIcon sx={{ fontSize: 24 }} />
                  ) : (
                    <BookmarkBorderIcon sx={{ fontSize: 24 }} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Meta info with monochrome icons */}
          <ul className="rbt-meta" style={{ marginTop: "15px", gap: "12px", display: "flex", flexWrap: "wrap" }}>
            <li style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#228756",
              fontWeight: "700",
              fontSize: "14px",
              background: "#e8f5e9",
              padding: "4px 10px",
              borderRadius: "8px"
            }}>
              <PersonIcon sx={{ fontSize: 18, color: "#228756" }} /> {pageData.profile_type}
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#64748b" }}>
              <LanguageIcon sx={{ fontSize: 18, color: "#94a3b8" }} /> {pageData.language_spoken}
            </li>
            {pageData.state && (
              <li style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#64748b" }}>
                <LocationOnIcon sx={{ fontSize: 18, color: "#94a3b8" }} /> {pageData.state}
              </li>
            )}
            {pageData.year_of_exp && (
              <li style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#64748b" }}>
                <WorkIcon sx={{ fontSize: 18, color: "#94a3b8" }} /> {pageData.year_of_exp} experience
              </li>
            )}
          </ul>

          {/* Services - Show up to 3 services as tags */}
          {pageData.services_offered && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '4px'
              }}>
                Services
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pageData.services_offered.split(',').slice(0, 3).map((service, index) => (
                  <span key={index} style={{
                    display: 'inline-block',
                    backgroundColor: '#e8f5e9',
                    color: '#228756',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    border: '1px solid #c8e6c9'
                  }}>
                    {service.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          {showOnlyBookButton ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 5,
              }}
            >
              <Link
                className="rbt-btn btn-gradient book-btn"
                href={`/therapist-checkout/${pageData._id}`}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: isMobile || isTablet ? "0 30px" : "0 40px",
                  width: "100%",
                }}
              >
                <span>Book Now</span>
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <Link
                className="view-btn view-btn-border"
                href={`/view-profile/${pageData._id}`}
                style={{
                  padding: isMobile || isTablet ? "0 26px" : "0 10px",
                }}
              >
                View Profile
              </Link>
              <Link
                className="rbt-btn btn-gradient book-btn"
                href={`/therapist-checkout/${pageData._id}`}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: isMobile || isTablet ? "0 20px" : "0 16px",
                }}
              >
                <span>Book Now</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
