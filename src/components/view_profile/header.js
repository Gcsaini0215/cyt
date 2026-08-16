import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
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
  const [isMobile, setIsMobile] = React.useState(false);
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = React.useState(false);
  const [profileUrl, setProfileUrl] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [waitlistDone, setWaitlistDone] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 599px)");
    setIsMobile(query.matches);
    const handleChange = (e) => setIsMobile(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

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

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "book_now_click", therapist_id: pageData._id });
    }
    router.push(`/book/${pageData._id}`);
  };

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
    { name: "WhatsApp", icon: <MessageCircle size={14} />, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(pageData.user.name)}%20${encodeURIComponent(profileUrl)}`, color: "#25D366" },
    { name: "LinkedIn", icon: <Linkedin size={14} />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, color: "#0A66C2" },
    { name: "Facebook", icon: <Facebook size={14} />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, color: "#1877F2" },
    { name: "Twitter", icon: <Twitter size={14} />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(pageData.user.name)}`, color: "#1DA1F2" },
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
      if (i <= fullStars) return <StarIcon key={i} style={{ color: "#e8a824", fontSize: isMobile ? 15 : 17 }} />;
      if (i === fullStars + 1 && hasHalf) return <StarHalfIcon key={i} style={{ color: "#e8a824", fontSize: isMobile ? 15 : 17 }} />;
      return <StarBorderIcon key={i} style={{ color: "#d8ded9", fontSize: isMobile ? 15 : 17 }} />;
    });
  };

  const credentialFacts = [
    pageData.year_of_exp ? { label: "Experience", value: `${pageData.year_of_exp}` } : null,
    pageData.language_spoken ? { label: "Languages", value: pageData.language_spoken } : null,
    pageData.state ? { label: "Location", value: pageData.state } : null,
  ].filter(Boolean);

  const shareRow = (
    <div style={{ display: "flex", gap: 7, alignItems: "center", justifyContent: isMobile ? "center" : "flex-start" }}>
      {shareLinks.map((link) => (
        <Tooltip key={link.name} title={`Share on ${link.name}`} arrow>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="ph-share-icon"
            style={{ width: 30, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: link.color, color: "#fff", flexShrink: 0 }}
          >{link.icon}</a>
        </Tooltip>
      ))}
      <Tooltip title="Copy Link" arrow>
        <div onClick={copyToClipboard} className="ph-share-icon" style={{ width: 30, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: "#5b6b62", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
          <LinkIcon size={14} />
        </div>
      </Tooltip>
      <Tooltip title="More" arrow>
        <div onClick={() => setIsShareModalOpen(true)} className="ph-share-icon" style={{ width: 30, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f3d24", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
          <Share2 size={14} />
        </div>
      </Tooltip>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ph-card { animation: fadeUp 0.45s ease forwards; }
        .book-btn { background: #0f3d24; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; }
        .book-btn:hover { background: #16512f; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,61,36,0.35); }
        .book-btn:active { transform: translateY(0); box-shadow: 0 3px 10px rgba(15,61,36,0.3); }
        .chat-btn { background: #fff; border: 1.5px solid #0f3d24 !important; color: #0f3d24 !important; transition: all 0.2s; }
        .chat-btn:hover { background: #0f3d24 !important; color: #fff !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,61,36,0.22); }
        .chat-btn:active { transform: translateY(0); }
        .waitlist-btn { background: #fff; border: 1.5px solid #dbe3df !important; color: #5b6b62 !important; transition: all 0.2s; }
        .waitlist-btn:hover { border-color: #c9962c !important; color: #8a6d1f !important; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(201,150,44,0.18); }
        .waitlist-btn:active { transform: translateY(0); }
        .ph-share-icon { transition: transform 0.15s, filter 0.15s; }
        .ph-share-icon:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .ph-fact-row + .ph-fact-row { border-top: 1px solid #ecefec; }
      `}</style>

      {/* ── LETTERHEAD BANNER ── */}
      <div style={{
        background: "linear-gradient(160deg, #0a2e1c 0%, #0f3d24 60%, #123f27 100%)",
        paddingTop: isMobile ? 26 : 46,
        paddingBottom: isMobile ? 128 : 118,
        position: "relative",
        overflow: "hidden",
        borderBottom: "3px solid #c9962c",
      }}>
        {/* subtle academic grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }} />
        <div className="container" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: isMobile ? "center" : "flex-start" }}>
            <span style={{ height: 1, width: 26, background: "rgba(201,150,44,0.6)", display: isMobile ? "none" : "block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
              Verified Practitioner Profile
            </span>
          </div>
        </div>
      </div>

      {/* ── FLOATING CREDENTIAL CARD ── */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: isMobile ? "0 14px" : "0 32px",
        marginTop: isMobile ? -122 : -92,
        position: "relative",
        zIndex: 10,
        paddingBottom: isMobile ? 16 : 28,
      }}>
        <div className="ph-card" style={{
          background: "#fff",
          borderRadius: isMobile ? 10 : 6,
          boxShadow: "0 10px 34px rgba(15,61,36,0.14)",
          borderTop: "4px solid #c9962c",
          padding: isMobile ? "22px 16px 22px" : "36px 44px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
          gap: isMobile ? 16 : 34,
        }}>

          {/* ── PHOTO ── */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <div style={{
              borderRadius: 8, padding: 3, background: "#fff",
              border: "1px solid #e3e8e4", boxShadow: "0 4px 16px rgba(15,61,36,0.10)",
              position: "relative",
            }}>
              <ImageTag
                alt={pageData.user.name}
                src={`${imagePath}/${pageData.user.profile}`}
                style={{ objectFit: "cover", borderRadius: 5, width: isMobile ? 92 : 148, height: isMobile ? 92 : 148, display: "block" }}
              />
            </div>
            {/* Registration code seal */}
            {pageData.profile_code && (
              <div style={{
                position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                background: "#0f3d24", borderRadius: 20, padding: isMobile ? "3px 9px" : "4px 11px",
                whiteSpace: "nowrap", boxShadow: "0 3px 8px rgba(15,61,36,0.3)",
              }}>
                <span style={{ color: "#e9c869", fontSize: isMobile ? 8.5 : 9.5, fontWeight: 800, letterSpacing: "0.8px" }}>
                  {pageData.profile_code}
                </span>
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div style={{ flex: 1, textAlign: isMobile ? "center" : "left", minWidth: 0, paddingTop: isMobile ? 8 : 0 }}>

            {/* Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap", marginBottom: 4 }}>
              <h1 style={{
                margin: 0, fontSize: isMobile ? 22 : 32, fontWeight: 800, color: "#122019",
                letterSpacing: "-0.3px", fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                {pageData.user.name}
              </h1>
              <span title="Verified Practitioner" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#0f3d24", flexShrink: 0, border: "1.5px solid #c9962c" }}>
                <svg viewBox="0 0 24 24" width="10" height="10" fill="#e9c869"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              </span>
            </div>

            {/* Specialty */}
            <p style={{ margin: "0 0 6px", fontSize: isMobile ? 12 : 13.5, color: "#0f3d24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>
              {pageData.profile_type || "Therapist"}
            </p>

            {/* Qualification */}
            {pageData.qualification && (
              <p style={{ margin: "0 0 12px", fontSize: isMobile ? 12.5 : 14.5, color: "#5b6b62", fontWeight: 500, lineHeight: 1.5, fontStyle: "italic" }}>
                {pageData.qualification}
              </p>
            )}

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex" }}>{renderStars(averageRating)}</div>
              <span style={{ fontSize: 12.5, color: "#374b40", fontWeight: 700 }}>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
              {reviewCount > 0 && <span style={{ fontSize: 11.5, color: "#8a978f" }}>({reviewCount} reviews)</span>}
            </div>

            {/* Quick facts line — academic byline style */}
            {credentialFacts.length > 0 && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: isMobile ? "4px 10px" : "5px 16px",
                justifyContent: isMobile ? "center" : "flex-start", marginBottom: isMobile ? 18 : 0,
                fontSize: 12, color: "#5b6b62", borderTop: isMobile ? "none" : "1px solid #ecefec",
                paddingTop: isMobile ? 0 : 12,
              }}>
                {credentialFacts.map((f, i) => (
                  <span key={f.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {i > 0 && !isMobile && <span style={{ color: "#c9d1cb" }}>·</span>}
                    <strong style={{ color: "#122019", fontWeight: 700 }}>{f.label}:</strong> {f.value}
                  </span>
                ))}
              </div>
            )}

            {/* Mobile buttons */}
            {isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleClick} className="book-btn" style={{ flex: 1, padding: "13px 16px", borderRadius: 4, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13.5 }}>
                    Book Session
                  </button>
                  <button onClick={() => setChatOpen(true)} className="chat-btn" style={{ flex: 1, padding: "13px 16px", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: 13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Chat
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>{shareRow}</div>
              </div>
            )}
          </div>

          {/* ── DESKTOP ACTION COLUMN ── */}
          {!isMobile && (
            <div style={{ flexShrink: 0, width: 208, display: "flex", flexDirection: "column", gap: 9, alignSelf: "center" }}>
              <button onClick={handleClick} className="book-btn" style={{ width: "100%", padding: "13px 18px", borderRadius: 4, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14, letterSpacing: "0.2px" }}>
                Book a Session
              </button>
              <button onClick={() => setChatOpen(true)} className="chat-btn" style={{ width: "100%", padding: "12px 18px", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: 13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat Now
              </button>
              <button onClick={() => setWaitlistDone(w => !w)} className="waitlist-btn" style={{ width: "100%", padding: "10px 18px", borderRadius: 4, fontWeight: 600, cursor: "pointer", fontSize: 13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                {waitlistDone ? "✓ Added to Waitlist" : <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Join Waitlist
                </>}
              </button>
              <div style={{ paddingTop: 4, borderTop: "1px solid #ecefec", marginTop: 2 }}>{shareRow}</div>
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
