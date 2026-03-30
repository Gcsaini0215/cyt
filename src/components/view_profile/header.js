import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import useMediaQuery from "@mui/material/useMediaQuery";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ImageTag from "../../utils/image-tag";
import { getDecodedToken } from "../../utils/jwt";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon, 
  MessageCircle,
  Share2
} from "lucide-react";

const BookingPopup = dynamic(() => import("../global/booking-popup"), { ssr: false });

import {
  imagePath,
  InsertFavoriteTherapistUrl,
  RemoveFavoriteTherapistUrl,
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
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const [profileUrl, setProfileUrl] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileUrl(`${window.location.origin}/view-profile/${pageData._id}`);
    }
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
      const response = await postData(InsertFavoriteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch (error) {
      return false;
    }
  };

  const removeFavrioute = async (id) => {
    try {
      const response = await postData(RemoveFavoriteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch (error) {
      return false;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setSnackbarOpen(true);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={18} />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(pageData.user.name)}%20${encodeURIComponent(profileUrl)}`,
      color: "#25D366"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={18} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      color: "#0A66C2"
    },
    {
      name: "Facebook",
      icon: <Facebook size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      color: "#1877F2"
    },
    {
      name: "Twitter",
      icon: <Twitter size={18} />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(pageData.user.name)}`,
      color: "#1DA1F2"
    }
  ];

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const iconButtonStyle = {
    width: 38,
    height: 38,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    cursor: "pointer",
    transition: "all 0.3s ease",
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
          height: isMobile ? 260 : 380,
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
          marginTop: -(isMobile ? 180 : 220),
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
            padding: isMobile ? "25px 20px" : "35px 45px",
            maxWidth: 1200,
            width: "100%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            color: "#fff",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 25 : 45,
            position: "relative",
          }}
        >
          {/* Main Info Wrapper (Pic + Text) */}
          <div style={{ 
            display: 'flex', 
            flex: 1, 
            gap: isMobile ? 15 : 45, 
            alignItems: isMobile ? 'center' : 'flex-start',
            flexDirection: 'row' 
          }}>
            {/* Profile Picture Section */}
            <div
              style={{
                flexShrink: 0,
                borderRadius: "50%",
                position: "relative",
                padding: 5,
                background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
                boxShadow: "0 15px 35px rgba(0,0,0,0.3), 0 0 20px rgba(46, 204, 113, 0.2)",
              }}
            >
              <ImageTag
                alt={`${pageData.user.name}`}
                src={`${imagePath}/${pageData.user.profile}`}
                style={{
                  objectFit: "cover",
                  borderRadius: "50%",
                  width: isMobile ? 100 : 180,
                  height: isMobile ? 100 : 180,
                  background: "#fff",
                  border: isMobile ? "2px solid rgba(255,255,255,0.9)" : "4px solid rgba(255,255,255,0.9)"
                }}
              />
              {/* Verified Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: isMobile ? 4 : 12,
                  right: isMobile ? 4 : 12,
                  background: "#2ecc71",
                  borderRadius: "50%",
                  width: isMobile ? 24 : 36,
                  height: isMobile ? 24 : 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                  border: "2px solid #fff",
                  animation: "pulse-green 2s infinite"
                }}
              >
                <i className="feather-check" style={{ color: "#fff", fontSize: isMobile ? 10 : 16, fontWeight: 900 }}></i>
              </div>
            </div>

            {/* Info Section */}
            <div
              style={{
                flex: 1,
                textAlign: "left",
              }}
            >
              <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start', marginBottom: 12 }}>
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
                  fontSize: isMobile ? 20 : 40,
                  marginBottom: 2,
                  fontWeight: 900,
                  letterSpacing: isMobile ? '0px' : '-1px',
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                }}
              >
                {pageData.user.name}
              </h1>

              <div
                style={{
                  color: "#2ecc71",
                  fontSize: isMobile ? 12 : 16,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 6,
                }}
              >
                {pageData.profile_type || "Therapist"}
              </div>
              
              <p
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: isMobile ? 13 : 18,
                  fontWeight: 600,
                  marginBottom: isMobile ? 8 : 18,
                  lineHeight: 1.2,
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {pageData.qualification}
              </p>

              <div
                style={{
                  display: isMobile ? "none" : "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  justifyContent: "flex-start",
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
          </div>

          {/* Mobile Info Chips (Visible only on mobile, below the main row) */}
          {isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: "rgba(46, 204, 113, 0.2)", padding: "4px 10px", borderRadius: 100 }}>
                  <div style={{ width: 6, height: 6, background: "#2ecc71", borderRadius: "50%" }}></div>
                  <span style={{ color: "#2ecc71", fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Available</span>
                </div>
                {pageData.year_of_exp && (
                  <span style={{ background: "rgba(243, 156, 18, 0.2)", color: "#f39c12", padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 800 }}>
                    {pageData.year_of_exp}+ Yrs Exp
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 8 }}>
                  <i className="feather-globe" style={{ color: "#2ecc71", fontSize: 12 }}></i>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{pageData.language_spoken}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 8 }}>
                  <i className="feather-map-pin" style={{ color: "#2ecc71", fontSize: 12 }}></i>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{pageData.state}</span>
                </div>
               </div>
            </div>
          )}

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

            {/* Social Share Icons Row */}
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: isMobile ? 'center' : 'flex-start',
              alignItems: 'center',
              padding: '5px 0'
            }}>
              {shareLinks.map((link) => (
                <Tooltip key={link.name} title={`Share on ${link.name}`} arrow>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      ...iconButtonStyle,
                      background: link.color,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      boxShadow: `0 4px 10px ${link.color}44`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
                      e.currentTarget.style.boxShadow = `0 8px 16px ${link.color}66`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = `0 4px 10px ${link.color}44`;
                    }}
                  >
                    {link.icon}
                  </a>
                </Tooltip>
              ))}

              <Tooltip title="Copy Link" arrow>
                <div 
                  onClick={copyToClipboard}
                  style={{
                    ...iconButtonStyle,
                    background: "#475569",
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 10px rgba(71, 85, 105, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#334155";
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#475569";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  <LinkIcon size={18} />
                </div>
              </Tooltip>

              <Tooltip title="More Options" arrow>
                <div 
                  onClick={handleShare}
                  style={{
                    ...iconButtonStyle,
                    background: "#228756",
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 10px rgba(34, 135, 86, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a6b44";
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#228756";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  <Share2 size={18} />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Profile link copied to clipboard!
        </Alert>
      </Snackbar>

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
