import React from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import ImageTag from "../../utils/image-tag";
import { getDecodedToken } from "../../utils/jwt";
import {
  imagePath,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";
import { postData } from "../../utils/actions";

import bannerImg from "../../assets/img/choosetherapist.jpg";

export default function ProfileHeader({ pageData, favrioutes }) {
  const router = useRouter();
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

  const handleClick = () => router.push(`/therapist-checkout/${pageData._id}`);

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
          height: isMobile ? 280 : 350,
          background: `linear-gradient(135deg, #0a2417 0%, #0d2b1c 100%)`,
          overflow: 'hidden'
        }}
      >
      </div>

      {/* Floating header */}
      <div
        style={{
          position: "relative",
          marginTop: -(isMobile ? 180 : 200),
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          padding: isMobile ? "0 15px" : "0 20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #138556, #0f3d2f)",
            borderRadius: 30,
            padding: isMobile ? "80px 20px 25px" : "25px 40px",
            maxWidth: 1200,
            width: "100%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: isMobile ? 20 : 40,
            position: "relative",
          }}
        >
          {/* Subtle Glow Effect */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '10%',
            width: '100px',
            height: '100px',
            background: 'rgba(46, 204, 113, 0.15)',
            filter: 'blur(60px)',
            borderRadius: '50%',
            zIndex: -1
          }}></div>

          {/* Profile Picture Section */}
          <div
            style={{
              flexShrink: 0,
              borderRadius: "50%",
              position: "relative",
              padding: 5,
              background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              marginTop: isMobile ? -70 : 0,
            }}
          >
            <ImageTag
              alt={`${pageData.user.name}`}
              src={`${imagePath}/${pageData.user.profile}`}
              style={{
                objectFit: "cover",
                borderRadius: "50%",
                width: isMobile ? 130 : 160,
                height: isMobile ? 130 : 160,
                background: "#fff",
                border: "3px solid rgba(255,255,255,0.8)"
              }}
            />
            {/* Verified Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                background: "#2ecc71",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                border: "2px solid #fff"
              }}
            >
              <i className="feather-check" style={{ color: "#fff", fontSize: 14 }}></i>
            </div>
          </div>

          {/* Info Section */}
          <div
            style={{
              flex: 1,
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: 8 }}>
               <span style={{ 
                 background: "rgba(46, 204, 113, 0.2)", 
                 color: "#2ecc71", 
                 padding: "3px 10px", 
                 borderRadius: 100, 
                 fontSize: 11, 
                 fontWeight: 700,
                 textTransform: 'uppercase',
                 letterSpacing: 1
               }}>
                 {pageData.profile_type}
               </span>
               {pageData.year_of_exp && (
                 <span style={{ 
                   background: "rgba(255, 255, 255, 0.15)", 
                   color: "#fff", 
                   padding: "3px 10px", 
                   borderRadius: 100, 
                   fontSize: 11, 
                   fontWeight: 600 
                 }}>
                   {pageData.year_of_exp}+ Years Exp
                 </span>
               )}
            </div>

            <h1
              style={{
                color: "#fff",
                fontSize: isMobile ? 26 : 32,
                marginBottom: 4,
                fontWeight: 800,
                letterSpacing: '-0.5px'
              }}
            >
              {pageData.user.name}
            </h1>
            
            <p
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isMobile ? 14 : 16,
                fontWeight: 500,
                marginBottom: 15,
                lineHeight: 1.2
              }}
            >
              {pageData.qualification}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 15,
                justifyContent: isMobile ? "center" : "flex-start",
                marginBottom: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
                <i className="feather-globe" style={{ color: "#2ecc71", fontSize: 14 }}></i>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{pageData.language_spoken}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
                <i className="feather-map-pin" style={{ color: "#2ecc71", fontSize: 14 }}></i>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{pageData.state}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
                <i className="feather-user" style={{ color: "#2ecc71", fontSize: 14 }}></i>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{pageData.user?.gender || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto'
          }}>
            <button
              onClick={handleClick}
              style={{
                padding: "12px 25px",
                borderRadius: 12,
                background: "#2ecc71",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 15px rgba(46, 204, 113, 0.2)",
                transition: "all 0.3s ease",
                fontSize: 15,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              Book Session
            </button>

            <button
              onClick={handleShare}
              style={{
                padding: "12px 25px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.1)")}
            >
              <i className="feather-share-2" style={{ fontSize: 14 }}></i>
              Share
            </button>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: isMobile ? 40 : 60 }}></div>
    </>
  );
}
