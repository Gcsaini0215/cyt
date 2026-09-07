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

export default function ProfileCardHor({ pageData, favrioutes, showRecommended = false, showOnlyBookButton = false, variant = "row" }) {

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

  const outerClass = variant === "row" ? "col-12 sal-animate" : "sal-animate tile-outer";

  return (
    <div className={outerClass}>
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

        /* ── full-bleed tile variant (used for the directory grid) ──
           sized mobile-first for a ~150px tile; scales up to match
           the 190px / 230px tile widths set in profile-card.js ── */
        .rbt-card.tile { position: relative; aspect-ratio: 3 / 4; border-radius: 12px !important; }
        .rbt-card.tile .rbt-card-img { position: absolute !important; inset: 0; height: 100%; }
        .rbt-card.tile .card-profile-img { height: 100% !important; width: 100% !important; }
        .rbt-card.tile .pch-img-gradient { height: 78% !important; }

        .rbt-card.tile .rbt-badge-group { top: 0; bottom: auto !important; }
        .rbt-card.tile .rbt-badge-group .pch-badge {
          padding: 3px 8px 3px 10px !important; font-size: 7.5px !important; gap: 3px !important;
          letter-spacing: .1px !important; clip-path: none !important; border-radius: 0 0 0 12px !important;
        }
        .rbt-card.tile .rbt-badge-group .pch-badge svg { font-size: 9px !important; width: 9px !important; height: 9px !important; }

        .rbt-card.tile .rbt-card-body {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
          padding: 8px 8px 7px !important;
          background: linear-gradient(to top, rgba(4,15,9,.92), rgba(4,15,9,.45) 65%, transparent 100%);
        }
        .rbt-card.tile .pch-header { gap: 4px !important; margin-bottom: 2px !important; }
        .rbt-card.tile .pch-header > div:first-child { gap: 3px !important; }
        .rbt-card.tile .rbt-card-title,
        .rbt-card.tile .rbt-card-title a {
          color: #fff !important; font-size: 11px !important; letter-spacing: 0 !important; max-width: 100% !important;
        }
        .rbt-card.tile .pch-verified-icon svg { font-size: 11px !important; width: 11px !important; height: 11px !important; }
        .rbt-card.tile .pch-bookmark { width: 22px !important; height: 22px !important; border-radius: 7px !important; }
        .rbt-card.tile .pch-bookmark svg { font-size: 13px !important; }
        .rbt-card.tile .pch-bookmark {
          background: rgba(255,255,255,.18) !important; border-color: rgba(255,255,255,.3) !important; color: #fff !important;
        }
        .rbt-card.tile .pch-type {
          color: rgba(255,255,255,.82) !important; font-size: 9px !important;
          display: block !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
        }
        .rbt-card.tile .pch-rating { margin-top: 3px !important; gap: 0 !important; }
        .rbt-card.tile .pch-rating,
        .rbt-card.tile .pch-rating span { color: #fff !important; font-size: 9px !important; }
        .rbt-card.tile .pch-rating svg { font-size: 9px !important; width: 9px !important; height: 9px !important; }

        .rbt-card.tile .rbt-meta,
        .rbt-card.tile .pch-actions { display: none !important; }

        @media (min-width: 601px) {
          .rbt-card.tile .rbt-card-body { padding: 11px 11px 10px !important; }
          .rbt-card.tile .rbt-card-title, .rbt-card.tile .rbt-card-title a { font-size: 12.5px !important; }
          .rbt-card.tile .pch-type { font-size: 10px !important; }
          .rbt-card.tile .pch-rating, .rbt-card.tile .pch-rating span { font-size: 10px !important; }
          .rbt-card.tile .pch-rating svg { font-size: 10px !important; width: 10px !important; height: 10px !important; }
          .rbt-card.tile .pch-verified-icon svg { font-size: 12px !important; width: 12px !important; height: 12px !important; }
          .rbt-card.tile .pch-bookmark { width: 25px !important; height: 25px !important; }
          .rbt-card.tile .pch-bookmark svg { font-size: 14px !important; }
          .rbt-card.tile .rbt-badge-group .pch-badge { font-size: 9px !important; padding: 4px 10px 4px 12px !important; }
          .rbt-card.tile .rbt-badge-group .pch-badge svg { font-size: 11px !important; width: 11px !important; height: 11px !important; }
        }
        @media (min-width: 1024px) {
          .rbt-card.tile .rbt-card-body { padding: 13px 13px 12px !important; }
          .rbt-card.tile .rbt-card-title, .rbt-card.tile .rbt-card-title a { font-size: 13.5px !important; }
          .rbt-card.tile .pch-type { font-size: 11px !important; }
          .rbt-card.tile .pch-rating, .rbt-card.tile .pch-rating span { font-size: 11px !important; }
          .rbt-card.tile .pch-rating svg { font-size: 11px !important; width: 11px !important; height: 11px !important; }
          .rbt-card.tile .pch-verified-icon svg { font-size: 14px !important; width: 14px !important; height: 14px !important; }
          .rbt-card.tile .pch-bookmark { width: 28px !important; height: 28px !important; }
          .rbt-card.tile .pch-bookmark svg { font-size: 15px !important; }
        }
      `}</style>
      <div
        className={`rbt-card variation-01 rbt-hover card-list-2 ${variant !== "row" ? variant : ""}`}
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
            <div className="pch-img-gradient" style={{
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
                className="pch-badge"
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
            <div className="pch-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
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
                  <span className="pch-verified-icon">
                    {isRecommended ? (
                      <WorkspacePremiumIcon sx={{ fontSize: 18, color: "#27ae60", flexShrink: 0 }} />
                    ) : (
                      <VerifiedIcon sx={{ fontSize: 18, color: "#1976d2", flexShrink: 0 }} />
                    )}
                  </span>
                </div>
                <div style={{ marginTop: "3px" }}>
                  <span className="pch-type" style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                    {pageData.profile_type}
                  </span>
                </div>
                {/* Stars row below profile type */}
                {(() => {
                  const hasReviews = pageData.reviews && pageData.reviews.length > 0;
                  const avgRating = hasReviews
                    ? pageData.reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0) / pageData.reviews.length
                    : 5;
                  const filledStars = Math.round(avgRating);
                  return (
                    <div className="pch-rating" style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={star <= filledStars ? "star-filled" : "star-empty"}
                          sx={{
                            fontSize: 18,
                            animationDelay: `${(star - 1) * 0.1}s`,
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
                  className="pch-bookmark"
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
              className="pch-actions"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 15,
              }}
            >
              <Link
                className="rbt-btn btn-gradient book-btn"
                href={`/book/${pageData._id}`}
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
              className="pch-actions"
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
                href={`/book/${pageData._id}`}
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
