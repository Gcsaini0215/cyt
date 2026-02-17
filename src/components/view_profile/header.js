import React from "react";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import ImageTag from "../../utils/image-tag";
import { getDecodedToken } from "../../utils/jwt";
import {
  imagePath,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";
import { postData } from "../../utils/actions";

export default function ProfileHeader({ pageData, favrioutes }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);

  const profileUrl = `${window.location.origin}/view-profile/${pageData._id}`;

  React.useEffect(() => {
    const data = getDecodedToken();
    if (!data) return;
    if (data.role === 1) {
      setShowBookmark(false);
    } else {
      setShowBookmark(true);
      setBookmark(favrioutes.includes(pageData._id));
    }
  }, [pageData, favrioutes]);

  const handleClick = () => navigate(`/therapist-checkout/${pageData._id}`);

  const addFavrioute = async (id) => {
    try {
      const response = await postData(InsertFavriouteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch (error) {
      return false;
    }
  };

  const removeFavrioute = async (id) => {
    try {
      const response = await postData(RemoveFavriouteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch (error) {
      return false;
    }
  };



  const handleShare = async () => {
    const shareText = `${pageData.user.name}, a ${pageData.profile_type} based in ${pageData.state}. Connect and book a session today!\n\n${profileUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${pageData.user.name} - ${pageData.profile_type}`,
          text: shareText,
          url: profileUrl,
        });
      } catch (error) {
        console.log("Sharing failed", error);
        alert("Sharing failed. You can copy the link manually below.");
        showCopyPrompt(shareText);
      }
    } else {
      showCopyPrompt(shareText);
    }
  };

  const showCopyPrompt = (text) => {
    const copied = window.prompt("Copy and share this profile:", text);
    if (copied !== null) {
      navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
    }
  };

  return (
    <>
      {/* Banner wrapper */}
      <div
        className="rbt-page-banner-wrapper"
        style={{
          position: "relative",
          zIndex: 1,
          height: isMobile ? 230 : 250,
        }}
      >
        <div
          className="rbt-banner-image"
          style={{
            height: "100%",
          }}
        ></div>
      </div>

      {/* Floating header */}
      <div
        style={{
          position: "relative",
          marginTop: -(isMobile ? 115 : 125),
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          padding: isMobile ? "0 10px" : 0,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0f3d2f, #138556)",
            borderRadius: 20,
            padding: isMobile ? "120px 15px 40px" : "140px 40px 50px",
            maxWidth: isMobile ? 500 : 1100,
            width: "100%",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            color: "#fff",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            gap: isMobile ? 20 : 60,
            position: "relative",
          }}
        >
          {/* Profile Picture with Premium Style */}
          <div
            style={{
              flexShrink: 0,
              borderRadius: "50%",
              overflow: "visible",
              position: "relative",
              padding: 5,
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
              boxShadow: "0px 6px 20px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: isMobile ? -60 : 0,
            }}
          >
            <ImageTag
              alt={`${pageData.user.name} - ${pageData.qualification}`}
              src={`${imagePath}/${pageData.user.profile}`}
              style={{
                objectFit: "cover",
                borderRadius: "50%",
                width: isMobile ? 160 : 200,
                height: isMobile ? 160 : 200,
                background: "#fff",
              }}
            />
            {/* Premium Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "#fff",
                borderRadius: "50%",
                padding: 5,
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              <i
                className="feather-star"
                style={{ color: "#f1c40f", fontSize: 20 }}
              ></i>
            </div>
          </div>

          {/* Info Section */}
          <div
            style={{
              flex: 1,
              textAlign: isMobile ? "center" : "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                color: "#fff",
                fontSize: isMobile ? 26 : 36,
                marginBottom: 5,
                fontWeight: 700,
              }}
            >
              {pageData.user.name}
            </h1>
            <h2
              style={{
                color: "#fff",
                fontSize: isMobile ? 18 : 24,
                fontWeight: 500,
                marginBottom: 5,
              }}
            >
              {pageData.profile_type}
            </h2>
            <h3
              style={{
                color: "#fff",
                fontSize: isMobile ? 14 : 18,
                fontWeight: 400,
                marginBottom: 10,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {pageData.qualification}
            </h3>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                gap: 15,
                justifyContent: isMobile ? "center" : "flex-start",
                fontSize: 14,
                marginBottom: 5,
              }}
            >
              <li style={{ display: "flex", alignItems: "center", gap: 5, color: "#fff" }}>
                <i className="feather-message-circle" style={{ color: "#fff" }}></i>
                <span>{pageData.language_spoken}</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 5, color: "#fff" }}>
                <i className="feather-map-pin" style={{ color: "#fff" }}></i>
                <span>{pageData.state}</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 5, color: "#fff" }}>
                <i className="feather-users" style={{ color: "#fff" }}></i>
                <span>{pageData.user?.gender || "-"}</span>
              </li>
            </ul>

            {/* Premium Experience Badge */}
            {pageData.year_of_exp && (
              <div
                style={{
                  marginTop: 8,
                  alignSelf: isMobile ? "center" : "flex-start",
                  background: "linear-gradient(135deg, #f39c12, #e74c3c)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: isMobile ? 12 : 14,
                  padding: "6px 12px",
                  borderRadius: 25,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  display: "inline-block",
                }}
              >
                {pageData.year_of_exp} years experience
              </div>
            )}
          </div>

          {/* Buttons for Laptop Right Vertical Stack */}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 15,
                position: "absolute",
                right: 40,
                top: 200, // adjusted a bit lower
              }}
            >
              <button
                onClick={handleClick}
                style={{
                  padding: "12px 25px",
                  borderRadius: 25,
                  background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "0.3s transform",
                  minWidth: 150,
                  textAlign: "center",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Book Now
              </button>

              <button
                onClick={handleShare}
                style={{
                  padding: "12px 25px",
                  borderRadius: 25,
                  background: "linear-gradient(90deg, #43e97b, #38f9d7)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "0.3s transform",
                  minWidth: 150,
                  textAlign: "center",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Share Profile
              </button>
            </div>
          )}

          {/* Mobile Buttons */}
          {isMobile && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 15,
                width: "100%",
              }}
            >
              <button
                onClick={handleClick}
                style={{
                  padding: "12px 25px",
                  borderRadius: 25,
                  background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "0.3s transform",
                  width: "100%",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Book Now
              </button>

              <button
                onClick={handleShare}
                style={{
                  padding: "12px 25px",
                  borderRadius: 25,
                  background: "linear-gradient(90deg, #43e97b, #38f9d7)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "0.3s transform",
                  width: "100%",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Share Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content below */}
      <div style={{ paddingTop: isMobile ? 60 : 80 }}></div>
    </>
  );
}
