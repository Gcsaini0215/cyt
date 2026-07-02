import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
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
import ChatBox from "./chat-box";
import { imagePath, InsertFavoriteTherapistUrl, RemoveFavoriteTherapistUrl } from "../../utils/url";
import { postData } from "../../utils/actions";
import ShareModal from "../global/share-modal";

const BookingPopup = dynamic(() => import("../global/booking-popup"), { ssr: false });

export default function ProfileHeader({ pageData, favrioutes }) {
  const router = useRouter();
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = React.useState(false);
  const [profileUrl, setProfileUrl] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [waitlistDone, setWaitlistDone] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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

  const handleClick = () => router.push(`/book/${pageData._id}`);

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
      if (i <= fullStars) return <StarIcon key={i} style={{ color: "#f59e0b", fontSize: 15 }} />;
      if (i === fullStars + 1 && hasHalf) return <StarHalfIcon key={i} style={{ color: "#f59e0b", fontSize: 15 }} />;
      return <StarBorderIcon key={i} style={{ color: "#94a3b8", fontSize: 15 }} />;
    });
  };

  const toggleBookmark = async () => {
    if (!bookmark) {
      const ok = await postData(InsertFavoriteTherapistUrl, { therapistId: pageData._id });
      if (ok) setBookmark(true);
    } else {
      const ok = await postData(RemoveFavoriteTherapistUrl, { therapistId: pageData._id });
      if (ok) setBookmark(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── Banner ── */
        .ph-banner {
          background: linear-gradient(145deg, #071c10 0%, #0d3320 45%, #0f3d25 100%);
          padding-top: 72px;
          position: relative;
          overflow: hidden;
        }
        .ph-banner-orb1 { position:absolute; top:-60px; right:-50px; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle, rgba(34,135,86,0.18) 0%, transparent 70%); pointer-events:none; }
        .ph-banner-orb2 { position:absolute; bottom:-80px; left:-60px; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%); pointer-events:none; }
        .ph-banner-orb3 { position:absolute; top:40%; left:38%; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle, rgba(46,204,113,0.07) 0%, transparent 70%); pointer-events:none; }

        /* ── Inner layout ── */
        .ph-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px 0;
          position: relative;
          z-index: 2;
        }

        /* ── Card ── */
        .ph-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.14);
          border: 1px solid #e2e8f0;
          margin-top: -56px;
          position: relative;
          z-index: 5;
          overflow: hidden;
        }
        .ph-card-inner {
          padding: 28px 28px 22px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        /* ── Photo ── */
        .ph-photo-wrap {
          flex-shrink: 0;
          position: relative;
        }
        .ph-photo-ring {
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #228756, #86efac);
          box-shadow: 0 6px 24px rgba(34,135,86,0.28);
          display: inline-block;
        }
        .ph-photo-ring img {
          border-radius: 50%;
          border: 3px solid #fff;
          display: block;
          object-fit: cover;
        }
        .ph-cyt-badge {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(7,28,16,0.78);
          backdrop-filter: blur(6px);
          border-radius: 20px;
          padding: 2px 9px;
          white-space: nowrap;
        }
        .ph-cyt-badge span { color:#fff; font-size:9px; font-weight:900; letter-spacing:1.5px; }

        /* ── Info ── */
        .ph-info { flex: 1; min-width: 0; }
        .ph-name-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:2px; }
        .ph-name { margin:0; font-size:26px; font-weight:900; color:#0f172a; letter-spacing:-0.5px; line-height:1.15; }
        .ph-verified { width:20px; height:20px; border-radius:50%; background:#1d9bf0; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ph-type { margin:0 0 2px; font-size:12px; color:#228756; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; }
        .ph-qual { margin:0 0 10px; font-size:13px; color:#64748b; font-weight:500; }
        .ph-stars-row { display:flex; align-items:center; gap:5px; margin-bottom:10px; }
        .ph-rating-val { font-size:13px; color:#0f172a; font-weight:800; }
        .ph-rating-count { font-size:12px; color:#94a3b8; }

        /* ── Chips ── */
        .ph-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:0; }
        .ph-chip {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11.5px; font-weight:700; padding:5px 12px;
          border-radius:100px; white-space:nowrap;
        }
        .ph-chip-blue  { background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; }
        .ph-chip-purp  { background:#faf5ff; border:1px solid #e9d5ff; color:#6b21a8; }
        .ph-chip-orange{ background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; }
        .ph-chip-teal  { background:#f0fdfa; border:1px solid #99f6e4; color:#0f766e; }

        /* ── Action column ── */
        .ph-actions {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
          width: 200px;
          padding-top: 4px;
        }
        .ph-btn-book {
          width:100%; padding:13px 18px; border-radius:12px;
          background:linear-gradient(135deg,#228756,#16a34a);
          color:#fff; font-weight:800; font-size:14px;
          border:none; cursor:pointer;
          box-shadow:0 4px 18px rgba(34,135,86,0.32);
          transition:transform 0.18s, box-shadow 0.18s;
          display:flex; align-items:center; justify-content:center; gap:7px;
        }
        .ph-btn-book:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(34,135,86,0.42); }
        .ph-btn-chat {
          width:100%; padding:11px 18px; border-radius:12px;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6);
          color:#fff; font-weight:700; font-size:13px;
          border:none; cursor:pointer;
          box-shadow:0 4px 14px rgba(59,130,246,0.28);
          transition:transform 0.18s, box-shadow 0.18s;
          display:flex; align-items:center; justify-content:center; gap:7px;
        }
        .ph-btn-chat:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(59,130,246,0.38); }
        .ph-btn-wait {
          width:100%; padding:10px 18px; border-radius:12px;
          background:#fff; border:1.5px solid #e2e8f0;
          color:#475569; font-weight:700; font-size:13px;
          cursor:pointer; transition:all 0.18s;
          display:flex; align-items:center; justify-content:center; gap:7px;
        }
        .ph-btn-wait:hover { border-color:#228756; color:#228756; background:#f0fdf4; }
        .ph-btn-wait.done { border-color:#228756; color:#228756; background:#f0fdf4; }

        /* ── Share row ── */
        .ph-share-row { display:flex; gap:7px; align-items:center; flex-wrap:wrap; padding-top:2px; }
        .ph-share-icon {
          width:30px; height:30px; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          color:#fff; transition:transform 0.18s; flex-shrink:0;
          text-decoration:none;
        }
        .ph-share-icon:hover { transform:translateY(-2px); }

        /* ── Bottom strip (fee + session type) ── */
        .ph-strip {
          border-top: 1px solid #f1f5f9;
          padding: 14px 28px;
          display: flex;
          gap: 28px;
          align-items: center;
          background: #fafbfc;
          border-radius: 0 0 20px 20px;
          flex-wrap: wrap;
        }
        .ph-strip-item { display:flex; align-items:center; gap:6px; }
        .ph-strip-dot { width:8px; height:8px; border-radius:50%; background:#10b981; flex-shrink:0; }
        .ph-strip-label { font-size:11.5px; color:#64748b; font-weight:500; }
        .ph-strip-val { font-size:13px; color:#0f172a; font-weight:700; }
        .ph-fee-val { font-size:18px; font-weight:900; color:#228756; }
        .ph-fee-label { font-size:11px; color:#94a3b8; font-weight:500; }

        /* ─────────────── MOBILE ─────────────── */
        @media (max-width: 767px) {
          .ph-banner { padding-top: 68px; padding-bottom: 60px; }
          .ph-inner { padding: 0 14px; }
          .ph-card { margin-top: -44px; border-radius:18px; }
          .ph-card-inner {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px 16px 16px;
            gap: 14px;
          }
          .ph-name { font-size: 21px; }
          .ph-chips { justify-content: center; }
          .ph-stars-row { justify-content: center; }
          .ph-actions { width: 100%; flex-direction: column; }
          .ph-btn-row-mob { display:flex; gap:9px; width:100%; }
          .ph-btn-row-mob .ph-btn-book,
          .ph-btn-row-mob .ph-btn-chat { flex:1; padding:13px 10px; font-size:13.5px; }
          .ph-btn-wait { display: none; }
          .ph-share-row { justify-content: center; margin-top: 4px; }
          .ph-strip { gap: 16px; padding: 12px 16px; justify-content: center; }
          .ph-strip-item { flex-direction: column; align-items: center; gap: 2px; }
          .ph-fee-val { font-size: 16px; }
        }
      `}</style>

      {/* ── BANNER ── */}
      <div className="ph-banner">
        <div className="ph-banner-orb1" />
        <div className="ph-banner-orb2" />
        <div className="ph-banner-orb3" />
        <div style={{ maxWidth:1100, margin:"0 auto", padding: isMobile ? "0 20px 60px" : "0 20px 72px", position:"relative", zIndex:2 }}>
          {/* Back button */}
          <button
            onClick={() => router.back()}
            style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, color:"#fff", padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, backdropFilter:"blur(8px)", marginBottom: isMobile ? 16 : 20 }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
        </div>
      </div>

      {/* ── FLOATING CARD ── */}
      <div className="ph-inner">
        <div className="ph-card">
          <div className="ph-card-inner">

            {/* Photo */}
            <div className="ph-photo-wrap">
              <div className="ph-photo-ring">
                <ImageTag
                  alt={pageData.user.name}
                  src={`${imagePath}/${pageData.user.profile}`}
                  style={{ width: isMobile ? 90 : 140, height: isMobile ? 90 : 140 }}
                />
              </div>
              <div className="ph-cyt-badge"><span>CYT ✓</span></div>
            </div>

            {/* Info */}
            <div className="ph-info">
              <div className="ph-name-row">
                <h1 className="ph-name">{pageData.user.name}</h1>
                <span className="ph-verified">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
              </div>
              <p className="ph-type">{pageData.profile_type || "Therapist"}</p>
              {pageData.qualification && <p className="ph-qual">{pageData.qualification}</p>}

              <div className="ph-stars-row">
                <div style={{ display:"flex" }}>{renderStars(averageRating)}</div>
                <span className="ph-rating-val">{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
                <span className="ph-rating-count">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
              </div>

              <div className="ph-chips">
                {pageData.year_of_exp && (
                  <span className="ph-chip ph-chip-blue">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    {pageData.year_of_exp}+ Yrs Exp
                  </span>
                )}
                {pageData.language_spoken && (
                  <span className="ph-chip ph-chip-purp">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    {pageData.language_spoken}
                  </span>
                )}
                {pageData.state && (
                  <span className="ph-chip ph-chip-orange">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {pageData.state}
                  </span>
                )}
                {pageData.session_type && (
                  <span className="ph-chip ph-chip-teal">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.882v6.236a1 1 0 0 1-1.447.894L15 14"/><rect x="1" y="6" width="14" height="12" rx="2"/></svg>
                    {pageData.session_type}
                  </span>
                )}
              </div>

              {/* Mobile buttons */}
              {isMobile && (
                <div style={{ marginTop: 16 }}>
                  <div className="ph-btn-row-mob">
                    <button onClick={handleClick} className="ph-btn-book">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Book Session
                    </button>
                    <button onClick={() => setChatOpen(true)} className="ph-btn-chat">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Chat
                    </button>
                  </div>
                  <div className="ph-share-row" style={{ marginTop: 12 }}>
                    {shareLinks.map(l => (
                      <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="ph-share-icon" style={{ background: l.color, boxShadow:`0 3px 10px ${l.color}55` }}>{l.icon}</a>
                    ))}
                    <div onClick={copyToClipboard} className="ph-share-icon" style={{ background:"#64748b", cursor:"pointer" }}><LinkIcon size={14} /></div>
                    <div onClick={() => setIsShareModalOpen(true)} className="ph-share-icon" style={{ background:"#228756", cursor:"pointer" }}><Share2 size={14} /></div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop action column */}
            {!isMobile && (
              <div className="ph-actions">
                <button onClick={handleClick} className="ph-btn-book">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Book Session
                </button>
                <button onClick={() => setChatOpen(true)} className="ph-btn-chat">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Chat Now
                </button>
                <button onClick={() => setWaitlistDone(w => !w)} className={`ph-btn-wait${waitlistDone ? " done" : ""}`}>
                  {waitlistDone
                    ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> On Waitlist</>
                    : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Join Waitlist</>
                  }
                </button>
                <div className="ph-share-row">
                  {shareLinks.map(l => (
                    <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="ph-share-icon" style={{ background: l.color, boxShadow:`0 3px 10px ${l.color}55` }}>{l.icon}</a>
                  ))}
                  <div onClick={copyToClipboard} className="ph-share-icon" style={{ background:"#64748b", cursor:"pointer" }}><LinkIcon size={14} /></div>
                  <div onClick={() => setIsShareModalOpen(true)} className="ph-share-icon" style={{ background:"#228756", cursor:"pointer" }}><Share2 size={14} /></div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom strip */}
          <div className="ph-strip">
            {pageData.fee_per_session && (
              <div className="ph-strip-item">
                <div>
                  <div className="ph-fee-val">₹{pageData.fee_per_session}</div>
                  <div className="ph-fee-label">per session</div>
                </div>
              </div>
            )}
            <div className="ph-strip-item">
              <div className="ph-strip-dot" />
              <div>
                <div className="ph-strip-val">Available</div>
                <div className="ph-strip-label">Online · In-Person</div>
              </div>
            </div>
            {pageData.rci_number && (
              <div className="ph-strip-item">
                <div className="ph-strip-dot" style={{ background:"#0ea5e9" }} />
                <div>
                  <div className="ph-strip-val">RCI Registered</div>
                  <div className="ph-strip-label">{pageData.rci_number}</div>
                </div>
              </div>
            )}
            {pageData.year_of_exp && (
              <div className="ph-strip-item">
                <div className="ph-strip-dot" style={{ background:"#f59e0b" }} />
                <div>
                  <div className="ph-strip-val">{pageData.year_of_exp}+ Years</div>
                  <div className="ph-strip-label">Experience</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width:"100%" }}>Profile link copied!</Alert>
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

      <Dialog open={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style:{ borderRadius:24, padding:0 } }}>
        <IconButton aria-label="close" onClick={() => setIsConsultationModalOpen(false)} sx={{ position:"absolute", right:12, top:12, color:"#1e293b", zIndex:10, background:"rgba(255,255,255,0.8)", "&:hover":{ background:"#fff" } }}>
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p:2, pt:5 }}>
          <ConsultationForm showHeading={false} showLocation={false} showSource={false} />
        </DialogContent>
      </Dialog>
    </>
  );
}
