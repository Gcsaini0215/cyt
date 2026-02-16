import { Link } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import ImageTag from "../../utils/image-tag";
import { getMinMaxPrice } from "../../utils/helpers";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import React from "react";
import { postData } from "../../utils/actions";
import {
  imagePath,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import VerifiedIcon from "@mui/icons-material/Verified";
import RecommendIcon from "@mui/icons-material/ThumbUpAlt";

export default function ProfileCardVert(props) {
  const { data, favrioutes } = props;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [bookmark, setBookmark] = React.useState(favrioutes.includes(data._id));
  const [showBookmark, setShowBookmark] = React.useState(true);
  const [fees, setFees] = React.useState([]);

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

  React.useEffect(() => {
    const token = getDecodedToken();
    if (token && token.role === 1) setShowBookmark(false);
    setBookmark(favrioutes.includes(data._id));
    setFees(data.fees);
  }, [data, favrioutes]);

  return (
    <div className="swiper-slide">
      <div
        className="rbt-card variation-01"
        style={{
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
          transition: "transform 0.3s ease",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Profile Image */}
        <div style={{ position: "relative", overflow: "hidden", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
          <Link to={`/view-profile/${data._id}`} style={{ display: "block" }}>
            <ImageTag
              alt="Profile-photo"
              style={{
                display: "block",
                width: "100%",
                height: "250px",
                objectFit: "cover",
              }}
              src={`${imagePath}/${data.user?.profile}`}
            />

            {/* Badge */}
            <div
              className="rbt-badge-group"
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                display: "flex",
                gap: "8px",
              }}
            >
              {data.priority === 1 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "linear-gradient(135deg, #34d399, #059669)",
                    color: "#fff",
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <RecommendIcon sx={{ fontSize: 16 }} />
                  Recommended
                </span>
              )}
              {data.priority === 2 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "linear-gradient(135deg, #60a5fa, #1d4ed8)",
                    color: "#fff",
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 16 }} />
                  Verified
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Card Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
          {/* Language & State */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                backgroundColor: "rgba(0,0,0,0.05)",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="fas fa-globe"></i> {data.language_spoken}
            </span>
            <span
              style={{
                backgroundColor: "rgba(0,0,0,0.05)",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="fas fa-map-marker-alt"></i> {data.state}
            </span>
          </div>

          {/* Name + Bookmark */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: "700",
                fontSize: "20px",
                margin: 0,
              }}
            >
              <Link to={`/view-profile/${data._id}`} style={{ textDecoration: "none", color: "#111" }}>
                {data.user?.name || "Therapist"}
              </Link>
              {data.priority === 1 && <RecommendIcon sx={{ fontSize: 18, color: "#34d399" }} />}
              {data.priority === 2 && <VerifiedIcon sx={{ fontSize: 18, color: "#60a5fa" }} />}
            </h4>

            {showBookmark && (
              <div>
                <a
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s",
                  }}
                  title="Bookmark"
                  onClick={() => handleBookmark(data._id, bookmark)}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {bookmark ? <BookmarkAddedIcon sx={{ fontSize: 24, color: "#f59e0b" }} /> : <BookmarkBorderIcon sx={{ fontSize: 24, color: "#888" }} />}
                </a>
              </div>
            )}
          </div>

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ color: "#fbbf24", display: "flex", gap: "2px" }}>
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
            </div>
            <span style={{ fontSize: "14px", color: "#555" }}>4.8/5</span>
          </div>

          {/* Profile Type & Fees */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "14px", color: "#555" }}>
              <i className="fas fa-user-md"></i> {data.profile_type}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "#111",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-credit-card"></i> {getMinMaxPrice(fees)} per session
            </span>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: isMobile ? "8px" : "10px",
              marginTop: "auto",
            }}
          >
            <Link
              to={`/view-profile/${data._id}`}
              style={{
                flex: 1,
                padding: isMobile ? "12px 0" : "8px 20px",
                borderRadius: "12px",
                border: "1px solid #1976d2",
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: isMobile ? "16px" : "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
            >
              View Profile
            </Link>

            <Link
              to={`/therapist-checkout/${data._id}`}
              style={{
                flex: 1,
                padding: isMobile ? "12px 0" : "8px 20px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #34d399, #059669)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: isMobile ? "16px" : "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s",
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
