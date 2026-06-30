import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ImageTag from "../../utils/image-tag";
import { getDecodedToken } from "../../utils/jwt";
import { Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, Share2 } from "lucide-react";
import ConsultationForm from "../home/consultation-form";
import { getValidServices } from "../../utils/helpers";
import ChatBox from "./chat-box";

const BookingPopup = dynamic(() => import("../global/booking-popup"), { ssr: false });

import { imagePath, InsertFavoriteTherapistUrl, RemoveFavoriteTherapistUrl } from "../../utils/url";
import { postData } from "../../utils/actions";
import ShareModal from "../global/share-modal";

export default function ProfileHeader({ pageData, favrioutes }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = React.useState(false);
  const [profileUrl, setProfileUrl] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [waitlistDone, setWaitlistDone] = React.useState(false);

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

  const handleClick = () => router.push(`/book/${pageData._id}`);

  const addFavrioute = async (id) => {
    try {
      const response = await postData(InsertFavoriteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch (error) { return false; }
  };

  const removeFavrioute = async (id) => {
    try {
      const response = await postData(RemoveFavoriteTherapistUrl, { therapistId: id });
      return !!response.status;
    } catch (error) { return false; }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setSnackbarOpen(true);
  };

  const shareLinks = [
    { name: "WhatsApp", icon: <MessageCircle size={15} />, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(pageData.user.name)}%20${encodeURIComponent(profileUrl)}`, color: "#25D366" },
    { name: "LinkedIn", icon: <Linkedin size={15} />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, color: "#0A66C2" },
    { name: "Facebook", icon: <Facebook size={15} />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, color: "#1877F2" },
    { name: "Twitter", icon: <Twitter size={15} />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(pageData.user.name)}`, color: "#1DA1F2" },
  ];

  const reviews = pageData?.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviewCount
    : 0;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return [1, 2, 3, 4, 5].map((i) => {
      if (i <= fullStars) return <StarIcon key={i} style={{ color: "#f59e0b", fontSize: isMobile ? 15 : 18 }} />;
      if (i === fullStars + 1 && hasHalf) return <StarHalfIcon key={i} style={{ color: "#f59e0b", fontSize: isMobile ? 15 : 18 }} />;
      return <StarBorderIcon key={i} style={{ color: "#d1d5db", fontSize: isMobile ? 15 : 18 }} />;
    });
  };

  const shareRow = (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: isMobile ? "center" : "flex-start" }}>
      {shareLinks.map((link) => (
        <Tooltip key={link.name} title={`Share on ${link.name}`} arrow>
          <a href={link.url} target="_blank" rel="noopener noreferrer"
            style={{ width: 32, height: 32, borderRadius: 9, background: link.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: `0 3px 8px ${link.color}55`, transition: "transform 0.2s", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >{link.icon}</a>
        </Tooltip>
      ))}
      <Tooltip title="Copy Link" arrow>
        <div onClick={copyToClipboard} style={{ width: 32, height: 32, borderRadius: 9, background: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
          <LinkIcon size={15} />
        </div>
      </Tooltip>
      <Tooltip title="More" arrow>
        <div onClick={() => setIsShareModalOpen(true)} style={{ width: 32, height: 32, borderRadius: 9, background: "#228756", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
          <Share2 size={15} />
        </div>
      </Tooltip>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .ph-card { animation: fadeUp 0.45s ease forwards; }
        .book-btn { background: linear-gradient(135deg,#228756,#16a34a); transition: transform 0.2s, box-shadow 0.2s; }
        .book-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(34,135,86,0.38) !important; }
        .chat-btn { background: linear-gradient(135deg,#1d4ed8,#3b82f6); transition: transform 0.2s, box-shadow 0.2s; }
        .chat-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(59,130,246,0.38) !important; }
        .waitlist-btn { background: #fff; border: 1.5px solid #e2e8f0 !important; color: #475569 !important; transition: all 0.2s; }
        .waitlist-btn:hover { border-color: #228756 !important; color: #228756 !important; background: #f0fdf4 !important; }
      `}</style>

      {/* ── BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a2e1c 0%, #0f4c2f 55%, #1a5c3b 100%)",
        paddingTop: isMobile ? 28 : 52,
        paddingBottom: isMobile ? 130 : 110,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "35%", left: "28%", width: 160, height: 160, borderRadius: "50%", background: "rgba(46,204,113,0.05)", pointerEvents: "none" }} />
      </div>

      {/* ── FLOATING CARD ── */}
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: isMobile ? "0 14px" : "0 40px",
        marginTop: isMobile ? -118 : -82,
        position: "relative",
        zIndex: 10,
        paddingBottom: isMobile ? 16 : 32,
      }}>
        <div className="ph-card" style={{
          background: "#fff",
          borderRadius: isMobile ? 18 : 26,
          boxShadow: "0 6px 40px rgba(0,0,0,0.13)",
          border: "1px solid #e2e8f0",
          borderTop: "4px solid #228756",
          padding: isMobile ? "22px 16px 24px" : "40px 48px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
          gap: isMobile ? 16 : 36,
        }}>

          {/* ── PHOTO ── */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <div style={{ borderRadius: "50%", padding: 4, background: "linear-gradient(135deg,#228756,#86efac)", boxShadow: "0 6px 20px rgba(34,135,86,0.22)", position: "relative" }}>
              <ImageTag
                alt={pageData.user.name}
                src={`${imagePath}/${pageData.user.profile}`}
                style={{ objectFit: "cover", borderRadius: "50%", width: isMobile ? 96 : 158, height: isMobile ? 96 : 158, border: "3px solid #fff", display: "block" }}
              />
              {/* CYT watermark */}
              <div style={{ position: "absolute", bottom: isMobile ? 6 : 10, left: "50%", transform: "translateX(-50%)", background: "rgba(10,46,28,0.72)", backdropFilter: "blur(4px)", borderRadius: 20, padding: isMobile ? "2px 8px" : "3px 10px", pointerEvents: "none" }}>
                <span style={{ color: "#fff", fontSize: isMobile ? 9 : 11, fontWeight: 800, letterSpacing: "1px" }}>CYT</span>
              </div>
            </div>
          </div>

          {/* ── INFO ── */}
          <div style={{ flex: 1, textAlign: isMobile ? "center" : "left", minWidth: 0 }}>

            {/* Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap", marginBottom: 2 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 21 : 31, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>
                {pageData.user.name}
              </h1>
              <span title="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 21, height: 21, borderRadius: "50%", background: "#1d9bf0", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              </span>
            </div>

            {/* Specialty */}
            <p style={{ margin: "0 0 4px", fontSize: isMobile ? 12 : 15, color: "#228756", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px" }}>
              {pageData.profile_type || "Therapist"}
            </p>

            {/* Qualification */}
            {pageData.qualification && (
              <p style={{ margin: "0 0 10px", fontSize: isMobile ? 12 : 14, color: "#64748b", fontWeight: 500, lineHeight: 1.4 }}>
                {pageData.qualification}
              </p>
            )}

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex" }}>{renderStars(averageRating)}</div>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 700 }}>{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>({reviewCount} reviews)</span>
            </div>

            {/* Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: isMobile ? "center" : "flex-start", marginBottom: isMobile ? 18 : 0 }}>
              {pageData.year_of_exp && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 100 }}>
                  <i className="feather-briefcase" style={{ fontSize: 11 }} /> {pageData.year_of_exp}+ Yrs Exp
                </span>
              )}
              {pageData.language_spoken && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#faf5ff", border: "1px solid #e9d5ff", color: "#6b21a8", fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 100 }}>
                  <i className="feather-globe" style={{ fontSize: 11 }} /> {pageData.language_spoken}
                </span>
              )}
              {pageData.state && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 100 }}>
                  <i className="feather-map-pin" style={{ fontSize: 11 }} /> {pageData.state}
                </span>
              )}
            </div>

            {/* Mobile buttons */}
            {isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleClick} className="book-btn" style={{ flex: 1, padding: "13px 16px", borderRadius: 12, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 14, boxShadow: "0 6px 18px rgba(34,135,86,0.28)" }}>
                    Book Session
                  </button>
                  <button onClick={() => setChatOpen(true)} className="chat-btn" style={{ flex: 1, padding: "13px 16px", borderRadius: 12, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 14, boxShadow: "0 6px 18px rgba(59,130,246,0.28)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Chat
                  </button>
                </div>
                <button onClick={() => setWaitlistDone(true)} className="waitlist-btn" style={{ width:"100%", padding:"11px", borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  {waitlistDone ? "✓ Added to Waitlist" : <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Join Waitlist
                  </>}
                </button>
                <div style={{ display: "flex", justifyContent: "center" }}>{shareRow}</div>
              </div>
            )}
          </div>

          {/* ── DESKTOP ACTION COLUMN ── */}
          {!isMobile && (
            <div style={{ flexShrink: 0, width: 220, display: "flex", flexDirection: "column", gap: 10, alignSelf: "center" }}>
              <button onClick={handleClick} className="book-btn" style={{ width: "100%", padding: "14px 20px", borderRadius: 14, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 15, boxShadow: "0 6px 20px rgba(34,135,86,0.28)" }}>
                Book Session
              </button>
              <button onClick={() => setChatOpen(true)} className="chat-btn" style={{ width: "100%", padding: "13px 20px", borderRadius: 14, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 14, boxShadow: "0 6px 20px rgba(59,130,246,0.28)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat Now
              </button>
              <button onClick={() => setWaitlistDone(w => !w)} className="waitlist-btn" style={{ width: "100%", padding: "11px 20px", borderRadius: 14, fontWeight: 700, cursor: "pointer", fontSize: 14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {waitlistDone ? "✓ Added to Waitlist" : <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Join Waitlist
                </>}
              </button>
              <div style={{ paddingTop: 2 }}>{shareRow}</div>
            </div>
          )}
        </div>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>Profile link copied!</Alert>
      </Snackbar>

      <ShareModal open={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={profileUrl} title={`${pageData.user.name} - ${pageData.profile_type}`} description={`${pageData.user.name}, a ${pageData.profile_type} based in ${pageData.state}. Book a session today!`} />

      {chatOpen && (
        <ChatBox
          therapistId={pageData._id}
          therapistName={pageData.user.name}
          therapistPhoto={pageData.user.profile ? `https://api.chooseyourtherapist.in/uploads/images/${pageData.user.profile}` : null}
          onClose={() => setChatOpen(false)}
          isMobile={isMobile}
        />
      )}

      <Dialog open={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 24, padding: 0 } }}>
        <IconButton aria-label="close" onClick={() => setIsConsultationModalOpen(false)} sx={{ position: "absolute", right: 12, top: 12, color: "#1e293b", zIndex: 10, background: "rgba(255,255,255,0.8)", "&:hover": { background: "#fff" } }}>
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: isMobile ? 2 : 4, pt: isMobile ? 5 : 4 }}>
          <ConsultationForm showHeading={false} showLocation={false} showSource={false} />
        </DialogContent>
      </Dialog>
    </>
  );
}
