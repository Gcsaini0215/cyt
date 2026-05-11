import React, { useState, useEffect } from "react";
import ImageTag from "../../utils/image-tag";
import Link from "next/link";
import dynamic from "next/dynamic";

import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PersonIcon from "@mui/icons-material/Person";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import StarIcon from "@mui/icons-material/Star";
import { getDecodedToken } from "../../utils/jwt";
import { postData } from "../../utils/actions";
import {
  imagePath,
  defaultProfile,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";

export default function ProfileCardHor({ pageData, favrioutes, showRecommended = false, showOnlyBookButton = false }) {

  const isRecommended = pageData.priority === 1 || (pageData.priority === undefined && showRecommended);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
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

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 600px)");
    const tabletQuery = window.matchMedia("(max-width: 960px)");
    
    setIsMobile(mobileQuery.matches);
    setIsTablet(tabletQuery.matches);

    const handleMobileChange = (e) => setIsMobile(e.matches);
    const handleTabletChange = (e) => setIsTablet(e.matches);

    mobileQuery.addListener(handleMobileChange);
    tabletQuery.addListener(handleTabletChange);

    return () => {
      mobileQuery.removeListener(handleMobileChange);
      tabletQuery.removeListener(handleTabletChange);
    };
  }, []);

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
      <style>{`
        .rbt-card:hover .card-profile-img {
          transform: scale(1.08);
        }
        @keyframes fillStar {
          0% { color: #e2e8f0; }
          100% { color: #fbc02d; }
        }
        .star-filled {
          animation: fillStar 0.4s ease forwards;
        }
        .star-empty {
          color: #e2e8f0;
        }
      `}</style>
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
              alt={`${pageData.user?.name || "Therapist"} - ${pageData.profile_type || "Best Psychologist in India"}`}
              src={pageData.user?.profile ? `${imagePath}/${pageData.user.profile}` : defaultProfile}
              loading="eager"
              style={{
                height: isMobile ? 210 : 235,
                width: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease"
              }}
              className="card-profile-img"
            />
            {/* Gradient Overlay for better badge visibility */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
              zIndex: 1,
              pointerEvents: "none"
            }}></div>
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
                style={{
                  background: isRecommended
                    ? "linear-gradient(135deg, #1a7a4a 0%, #2ecc71 50%, #27ae60 100%)"
                    : "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #0d47a1 100%)",
                  color: "#fff",
                  padding: "7px 16px 7px 20px",
                  fontSize: "12px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "0 4px 4px 0",
                  boxShadow: isRecommended
                    ? "0 4px 15px rgba(46,204,113,0.5)"
                    : "0 4px 15px rgba(25,118,210,0.4)",
                  clipPath: "polygon(10px 0%, 100% 0%, 100% 100%, 0% 100%)",
                  textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {isRecommended ? (
                  <>
                    <WorkspacePremiumIcon sx={{ fontSize: 15 }} /> Recommended
                  </>
                ) : (
                  <>
                    <VerifiedIcon sx={{ fontSize: 15 }} /> Verified
                  </>
                )}
              </span>
            </div>
          </Link>
        </div>

        {/* Card Body */}
        <div className="rbt-card-body" style={{ padding: "20px" }}>
            {/* Header row: name + icon + bookmark */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h4 className="rbt-card-title" style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "800",
                    letterSpacing: "-0.3px",
                    color: "#1e293b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%"
                  }}>
                    <Link href={`/view-profile/${pageData._id}`} style={{ color: "inherit" }}>
                      {pageData.user?.name || "Therapist"}
                    </Link>
                  </h4>
                  {isRecommended ? (
                    <WorkspacePremiumIcon sx={{ fontSize: 18, color: "#27ae60", flexShrink: 0 }} />
                  ) : (
                    <VerifiedIcon sx={{ fontSize: 18, color: "#1976d2", flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ marginTop: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                    {pageData.profile_type}
                  </span>
                </div>
                {/* Stars row below profile type */}
                {(() => {
                  const hasReviews = pageData.reviews && pageData.reviews.length > 0;
                  const avgRating = hasReviews
                    ? pageData.reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0) / pageData.reviews.length
                    : 0;
                  const filledStars = hasReviews ? Math.round(avgRating) : 0;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={hasReviews && star <= filledStars ? "star-filled" : "star-empty"}
                          sx={{
                            fontSize: 18,
                            animationDelay: hasReviews ? `${(star - 1) * 0.1}s` : "0s",
                          }}
                        />
                      ))}
                      {hasReviews && (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginLeft: "4px" }}>
                          {avgRating.toFixed(1)} ({pageData.reviews.length})
                        </span>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* Bookmark button top-right */}
              {showBookmark && (
                <button
                  style={{
                    cursor: "pointer",
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: bookmark ? "#228756" : "#94a3b8",
                    transition: "all 0.3s ease",
                    flexShrink: 0
                  }}
                  title="Bookmark"
                  onClick={() => handleBookmark(pageData._id, bookmark)}
                >
                  {bookmark ? (
                    <BookmarkAddedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <BookmarkBorderIcon sx={{ fontSize: 20 }} />
                  )}
                </button>
              )}
            </div>

          {/* Meta info */}
          <ul className="rbt-meta" style={{ marginTop: "6px", gap: "6px", display: "flex", flexWrap: "wrap", alignItems: "center", padding: 0, listStyle: "none" }}>
            {pageData.state && (
              <li style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                <LocationOnIcon sx={{ fontSize: 14, color: "#228756" }} /> {pageData.state}
              </li>
            )}
            {pageData.language_spoken && (
              <li style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b" }}>
                <LanguageIcon sx={{ fontSize: 14, color: "#94a3b8" }} /> {pageData.language_spoken}
              </li>
            )}
            {pageData.year_of_exp && (
              <li style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b" }}>
                <WorkIcon sx={{ fontSize: 14, color: "#94a3b8" }} /> {pageData.year_of_exp}
              </li>
            )}
          </ul>




          {/* Buttons */}
          {showOnlyBookButton ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 15,
              }}
            >
              <Link
                className="rbt-btn btn-gradient book-btn"
                href={`/therapist-checkout/${pageData._id}`}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: isMobile || isTablet ? "0 20px" : "0 40px",
                  width: "100%",
                  fontSize: isMobile ? "14px" : "15px",
                  height: isMobile ? "44px" : "50px",
                  lineHeight: isMobile ? "44px" : "50px",
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
                marginTop: 15,
                gap: isMobile ? "8px" : "12px"
              }}
            >
              <Link
                className="view-btn view-btn-border"
                href={`/view-profile/${pageData._id}`}
                style={{
                  padding: isMobile ? "0 12px" : "0 10px",
                  fontSize: isMobile ? "13px" : "14px",
                  height: isMobile ? "44px" : "50px",
                  lineHeight: isMobile ? "44px" : "50px",
                  whiteSpace: "nowrap",
                  flex: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
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
                  padding: isMobile ? "0 12px" : "0 16px",
                  fontSize: isMobile ? "13px" : "14px",
                  height: isMobile ? "44px" : "50px",
                  lineHeight: isMobile ? "44px" : "50px",
                  whiteSpace: "nowrap",
                  flex: 1
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
