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
import ShareModal from "../global/share-modal";

import bannerImg from "../../assets/img/choosetherapist.jpg";

export default function ProfileHeader({ pageData, favrioutes }) {
  const router = useRouter();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const [profileUrl, setProfileUrl] = React.useState("");

  React.useEffect(() => {
    setProfileUrl(`${window.location.origin}/view-profile/${pageData._id}`);
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



  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
      <style>{`
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .book-btn-shimmer {
          background: linear-gradient(90deg, #2ecc71, #27ae60, #2ecc71);
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        .glass-header {
          background: rgba(19, 61, 47, 0.85) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>
      {/* Banner wrapper */}
      <div
        className="rbt-page-banner-wrapper"
        style={{
          position: "relative",
          zIndex: 1,
          height: isMobile ? 300 : 380,
          background: `linear-gradient(180deg, #0a2417 0%, #138556 100%)`,
          overflow: 'hidden'
        }}
      >
        {/* Abstract Background Decor */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
      </div>

      {/* Floating header */}
      <div
        style={{
          position: "relative",
          marginTop: -(isMobile ? 200 : 220),
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          padding: isMobile ? "0 15px" : "0 20px",
        }}
      >
        <div
          className="glass-header"
          style={{
            borderRadius: 30,
            padding: isMobile ? "80px 20px 30px" : "35px 45px",
            maxWidth: 1200,
            width: "100%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            color: "#fff",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: isMobile ? 20 : 45,
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
              boxShadow: "0 15px 35px rgba(0,0,0,0.3), 0 0 20px rgba(46, 204, 113, 0.2)",
              marginTop: isMobile ? -80 : 0,
            }}
          >
            <ImageTag
              alt={`${pageData.user.name}`}
              src={`${imagePath}/${pageData.user.profile}`}
              style={{
                objectFit: "cover",
                borderRadius: "50%",
                width: isMobile ? 140 : 180,
                height: isMobile ? 140 : 180,
                background: "#fff",
                border: "4px solid rgba(255,255,255,0.9)"
              }}
            />
            {/* Verified Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "#2ecc71",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                border: "3px solid #fff",
                animation: "pulse-green 2s infinite"
              }}
            >
              <i className="feather-check" style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}></i>
            </div>
          </div>

          {/* Info Section */}
          <div
            style={{
              flex: 1,
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: 12 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: "rgba(46, 204, 113, 0.2)", padding: "4px 12px", borderRadius: 100 }}>
                 <div style={{ width: 8, height: 8, background: "#2ecc71", borderRadius: "50%" }}></div>
                 <span style={{ 
                   color: "#2ecc71", 
                   fontSize: 11, 
                   fontWeight: 800,
                   textTransform: 'uppercase',
                   letterSpacing: 1
                 }}>
                   Available Now
                 </span>
               </div>
               
               {pageData.year_of_exp && (
                 <span style={{ 
                   background: "linear-gradient(135deg, #f39c12, #d35400)", 
                   color: "#fff", 
                   padding: "4px 12px", 
                   borderRadius: 100, 
                   fontSize: 11, 
                   fontWeight: 700,
                   boxShadow: "0 4px 10px rgba(243, 156, 18, 0.2)"
                 }}>
                   {pageData.year_of_exp}+ Years Exp
                 </span>
               )}
            </div>

            <h1
              style={{
                color: "#fff",
                fontSize: isMobile ? 28 : 40,
                marginBottom: 6,
                fontWeight: 900,
                letterSpacing: '-1px',
                textShadow: "0 2px 10px rgba(0,0,0,0.2)"
              }}
            >
              {pageData.user.name}
            </h1>
            
            <p
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: isMobile ? 15 : 18,
                fontWeight: 600,
                marginBottom: 18,
                lineHeight: 1.2,
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {pageData.qualification}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                justifyContent: isMobile ? "center" : "flex-start",
                marginBottom: isMobile ? 15 : 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 8 }}>
                <i className="feather-globe" style={{ color: "#2ecc71", fontSize: 14 }}></i>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{pageData.language_spoken}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 8 }}>
                <i className="feather-map-pin" style={{ color: "#2ecc71", fontSize: 14 }}></i>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{pageData.state}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 15, 
            flexDirection: 'column',
            width: isMobile ? '100%' : '220px'
          }}>
            <button
              onClick={handleClick}
              className="book-btn-shimmer"
              style={{
                padding: "16px 25px",
                borderRadius: 14,
                color: "#fff",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(46, 204, 113, 0.3)",
                transition: "all 0.3s ease",
                fontSize: 16,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              Book Session
            </button>

            <button
              onClick={handleShare}
              style={{
                padding: "14px 25px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.08)",
                color: "#fff",
                fontWeight: 700,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              <i className="feather-share-2" style={{ fontSize: 16 }}></i>
              Share Profile
            </button>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: isMobile ? 40 : 60 }}></div>
      <ShareModal 
        open={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={profileUrl}
        title={`${pageData.user.name} - ${pageData.profile_type}`}
        description={`${pageData.user.name}, a ${pageData.profile_type} based in ${pageData.state}. Connect and book a session today!`}
      />
    </>
  );
}
