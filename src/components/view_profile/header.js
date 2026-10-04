import React from "react";
import { createPortal } from "react-dom";
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
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import ImageTag from "../../utils/image-tag";
import { getDecodedToken } from "../../utils/jwt";
import { Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, Share2 } from "lucide-react";
import ConsultationForm from "../home/consultation-form";
import { getValidServices, getMinMaxPrice } from "../../utils/helpers";
import ChatBox from "./chat-box";

const BookingPopup = dynamic(() => import("../global/booking-popup"), { ssr: false });

import { imagePath, InsertFavoriteTherapistUrl, RemoveFavoriteTherapistUrl, BookedSlotsUrl, SubmitConsultationUrl } from "../../utils/url";
import { postData, fetchData } from "../../utils/actions";
import { nextOpenSlot } from "../../utils/next-slot";
import ShareModal from "../global/share-modal";
import { profilePath } from "../../utils/therapist-slug";

export default function ProfileHeader({ pageData, favrioutes }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("Profile link copied!");
  const [isConsultationModalOpen, setIsConsultationModalOpen] = React.useState(false);
  const [profileUrl, setProfileUrl] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [waitlistDone, setWaitlistDone] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [nextSlot, setNextSlot] = React.useState(null); // { date, label } | null
  const [waitlistOpen, setWaitlistOpen] = React.useState(false);
  const [wl, setWl] = React.useState({ name: "", phone: "", time: "Any time" });
  const [wlSending, setWlSending] = React.useState(false);
  const [wlError, setWlError] = React.useState("");
  const waitlistKey = `cyt_waitlist_${pageData._id}`;

  // Next open slot — same rules as the booking page (weekly hours minus booked + past slots)
  React.useEffect(() => {
    let alive = true;
    const avail = pageData.availabilities || [];
    if (!avail.length) { setNextSlot(null); return undefined; }
    setNextSlot(nextOpenSlot(avail));
    fetchData(BookedSlotsUrl + pageData._id)
      .then((r) => { if (alive && r?.status && Array.isArray(r.data)) setNextSlot(nextOpenSlot(avail, new Set(r.data))); })
      .catch(() => { /* keep the estimate from weekly hours */ });
    return () => { alive = false; };
  }, [pageData._id, pageData.availabilities]);

  // remember a waitlist request on this device so the button keeps saying so
  React.useEffect(() => {
    try { if (localStorage.getItem(waitlistKey)) setWaitlistDone(true); } catch { /* storage blocked */ }
  }, [waitlistKey]);

  const submitWaitlist = async (e) => {
    e.preventDefault();
    setWlError("");
    if (wl.name.trim().length < 2) return setWlError("Please enter your name.");
    if (!/^[0-9]{10}$/.test(wl.phone)) return setWlError("Please enter a valid 10-digit phone number.");
    setWlSending(true);
    try {
      await postData(SubmitConsultationUrl, {
        name: wl.name.trim(),
        phone: wl.phone,
        source: "Therapist Waitlist",
        concern: `Waitlist — ${pageData.user?.name || "Therapist"}`,
        message: `Wants a slot with ${pageData.user?.name || "this therapist"}${pageData.profile_code ? ` (${pageData.profile_code})` : ""}.\nPreferred time: ${wl.time}`,
        therapistId: pageData._id,
        therapistName: pageData.user?.name || "",
        preferredTime: wl.time,
      });
      try { localStorage.setItem(waitlistKey, "1"); } catch { /* storage blocked */ }
      setWaitlistDone(true);
      setWaitlistOpen(false);
      setSnackbarText("You're on the waitlist — we'll call you when a slot opens.");
      setSnackbarOpen(true);
    } catch {
      setWlError("Something went wrong. Please try again.");
    }
    setWlSending(false);
  };
  const [barLift, setBarLift] = React.useState(0); // height of the cookie / location bars pinned below ours

  React.useEffect(() => { setMounted(true); }, []);

  // Mobile: Book / Chat live in a bar pinned to the bottom of the screen. Keep it above the
  // site's cookie + location consent bars, and pad the page so nothing hides behind it.
  React.useEffect(() => {
    if (!isMobile) return undefined;
    document.body.classList.add("ph-has-sticky-cta");
    const read = () => {
      const h = ["cyt-cookie-consent-bar", "cyt-location-consent-bar"]
        .map((id) => document.getElementById(id)?.offsetHeight || 0)
        .reduce((a, b) => a + b, 0);
      setBarLift((prev) => (prev === h ? prev : h));
    };
    read();
    const iv = setInterval(read, 500);
    return () => { clearInterval(iv); document.body.classList.remove("ph-has-sticky-cta"); };
  }, [isMobile]);

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 599px)");
    setIsMobile(query.matches);
    const handleChange = (e) => setIsMobile(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileUrl(window.location.origin + profilePath(pageData));
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
    setSnackbarText("Profile link copied!");
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ph-card { animation: fadeUp 0.45s ease forwards; }
        .book-btn { background: #0f3d24; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; }
        .book-btn:hover { background: #16512f; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,61,36,0.35); }
        .book-btn:active { transform: translateY(0); box-shadow: 0 3px 10px rgba(15,61,36,0.3); }
        .chat-btn { background: #fff; border: 1.5px solid #0f3d24 !important; color: #0f3d24 !important; transition: all 0.2s; }
        .chat-btn:hover { background: #0f3d24 !important; color: #fff !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,61,36,0.22); }
        .chat-btn:active { transform: translateY(0); }
        .waitlist-btn { background: #fff; border: 1.5px solid #dbe3df !important; color: #5b6b62 !important; transition: all 0.2s; }
        .waitlist-btn:hover { border-color: #166534 !important; color: #166534 !important; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15,61,36,0.14); }
        .waitlist-btn:active { transform: translateY(0); }
        .ph-share-icon { transition: transform 0.15s, filter 0.15s; }
        .ph-share-icon:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .ph-fact-row + .ph-fact-row { border-top: 1px solid #ecefec; }
        .ph-next { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 12px; color: #166534; font-weight: 600; line-height: 1.3; }
        .ph-next b { display: block; font-size: 13px; color: #0f3d24; font-weight: 800; }
        .ph-next-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(34,197,94,.2); }
        .ph-sticky-next { color: #16a34a; font-weight: 700; }
        .waitlist-btn:disabled { cursor: default; color: #166534 !important; border-color: #bbf7d0 !important; background: #f0fdf4; transform: none !important; box-shadow: none !important; }
        .ph-wl-form label { display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin: 12px 0 6px; }
        .ph-wl-form input, .ph-wl-form select { width: 100%; height: 46px; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 12px; font-size: 14.5px; background: #f8fafc; outline: none; box-sizing: border-box; }
        .ph-wl-form input:focus, .ph-wl-form select:focus { border-color: #166534; background: #fff; }

        /* ── mobile sticky Book / Chat bar ── */
        body.ph-has-sticky-cta { padding-bottom: calc(78px + env(safe-area-inset-bottom, 0px)) !important; }
        .ph-sticky {
          position: fixed; left: 0; right: 0; z-index: 99990;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
          background: rgba(255,255,255,0.97); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          border-top: 1px solid #e3ebe6; box-shadow: 0 -8px 24px rgba(15,61,36,0.12);
          transition: bottom 0.25s ease; animation: phStickyIn 0.3s ease;
        }
        @keyframes phStickyIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .ph-sticky-fee { flex: 1; min-width: 0; line-height: 1.2; }
        .ph-sticky-fee b { display: block; font-size: 14.5px; font-weight: 800; color: #0f3d24; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ph-sticky-fee small { font-size: 11px; color: #64748b; font-weight: 600; }
        .ph-sticky-chat {
          flex-shrink: 0; height: 46px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #0f3d24; background: #fff;
          color: #0f3d24; font-weight: 700; font-size: 13.5px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
        }
        .ph-sticky-book {
          flex-shrink: 0; height: 46px; padding: 0 20px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #1a6b3a, #0f3d24); color: #fff; font-weight: 800; font-size: 14px;
          box-shadow: 0 6px 16px -6px rgba(15,61,36,0.55);
        }
        .ph-sticky-book:active, .ph-sticky-chat:active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { .ph-sticky { animation: none; transition: none; } }
      ` }} />

      {/* ── LETTERHEAD BANNER ── */}
      <div style={{
        background: "#111 url('/assets/img/profile-banner-calm-room.jpg') center 55% / cover no-repeat",
        paddingTop: isMobile ? 0 : 64,
        paddingBottom: isMobile ? 104 : 128,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* black wash over the photo */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.7) 100%)",
        }} />
      </div>

      {/* ── FLOATING CREDENTIAL CARD ── */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: isMobile ? "0 14px" : "0 32px",
        marginTop: isMobile ? -72 : -92,
        position: "relative",
        zIndex: 10,
        paddingBottom: isMobile ? 16 : 28,
      }}>
        {/* page background under the card (the site body is dark green) — starts where the banner ends */}
        <div aria-hidden="true" style={{ position: "absolute", left: "50%", width: "100vw", transform: "translateX(-50%)", top: isMobile ? 72 : 92, bottom: 0, background: "#fff", zIndex: -1 }} />
        <div className="ph-card" style={{
          background: "#fff",
          borderRadius: isMobile ? 14 : 16,
          border: "1px solid #e3ebe6",
          boxShadow: "0 14px 36px -12px rgba(15,61,36,0.22)",
          padding: isMobile ? "16px 14px 16px" : "36px 44px",
          display: "flex",
          flexDirection: "row",
          flexWrap: isMobile ? "wrap" : "nowrap",
          alignItems: "flex-start",
          gap: isMobile ? "12px 14px" : 34,
          position: "relative",
        }}>

          {/* mobile: one share button instead of the full icon row */}
          {isMobile && (
            <button type="button" onClick={() => setIsShareModalOpen(true)} aria-label="Share this profile"
              style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 8, border: "1px solid #e3e8e4", background: "#fff", color: "#0f3d24", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Share2 size={15} />
            </button>
          )}

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
                style={{ objectFit: "cover", borderRadius: 5, width: isMobile ? 76 : 148, height: isMobile ? 76 : 148, display: "block" }}
              />
            </div>
            {/* Registration code seal */}
            {pageData.profile_code && (
              <div style={{
                position: "absolute", bottom: isMobile ? -9 : -10, left: "50%", transform: "translateX(-50%)",
                background: "#0f3d24", borderRadius: 20, padding: isMobile ? "2px 7px" : "4px 11px",
                whiteSpace: "nowrap", boxShadow: "0 3px 8px rgba(15,61,36,0.3)",
              }}>
                <span style={{ color: "#fff", fontSize: isMobile ? 7.5 : 9.5, fontWeight: 800, letterSpacing: isMobile ? "0.4px" : "0.8px" }}>
                  {pageData.profile_code}
                </span>
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div style={{ flex: 1, textAlign: "left", minWidth: 0, paddingRight: isMobile ? 34 : 0 }}>

            {/* Name */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 9, justifyContent: "flex-start", flexWrap: "wrap", marginBottom: isMobile ? 2 : 4 }}>
              <h1 style={{
                margin: 0, fontSize: isMobile ? 19 : 32, fontWeight: 800, color: "#122019", lineHeight: 1.2,
                letterSpacing: "-0.3px", fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                {pageData.user.name}
              </h1>
              <VerifiedRounded titleAccess="Verified therapist" sx={{ fontSize: isMobile ? 19 : 24, color: "#1d9bf0", flexShrink: 0 }} />
            </div>

            {/* Specialty */}
            <p style={{ margin: isMobile ? "0 0 4px" : "0 0 6px", fontSize: isMobile ? 10.5 : 13.5, color: "#0f3d24", fontWeight: 700, textTransform: "uppercase", letterSpacing: isMobile ? "0.8px" : "1.2px" }}>
              {pageData.profile_type || "Therapist"}
            </p>

            {/* Qualification */}
            {pageData.qualification && (
              <p style={{ margin: isMobile ? "0 0 6px" : "0 0 12px", fontSize: isMobile ? 12 : 14.5, color: "#5b6b62", fontWeight: 500, lineHeight: 1.45, fontStyle: "italic",
                ...(isMobile ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>
                {pageData.qualification}
              </p>
            )}

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-start", marginBottom: isMobile ? 0 : 14 }}>
              <div style={{ display: "flex" }}>{renderStars(averageRating)}</div>
              <span style={{ fontSize: 12.5, color: "#374b40", fontWeight: 700 }}>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
              {reviewCount > 0 && <span style={{ fontSize: 11.5, color: "#8a978f" }}>({reviewCount} reviews)</span>}
            </div>

            {/* Quick facts line — academic byline style */}
            {credentialFacts.length > 0 && !isMobile && (
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

          </div>

          {/* mobile: experience · languages · location as one line under the photo row */}
          {isMobile && credentialFacts.length > 0 && (
            <div style={{ flexBasis: "100%", display: "flex", flexWrap: "wrap", gap: "4px 12px", paddingTop: 10, borderTop: "1px solid #ecefec", fontSize: 12, color: "#475569" }}>
              {credentialFacts.map((f) => (
                <span key={f.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className={f.label === "Experience" ? "feather-briefcase" : f.label === "Languages" ? "feather-globe" : "feather-map-pin"} style={{ color: "#16a34a", fontSize: 12 }} aria-hidden="true" />
                  <span className="na-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>{f.label}: </span>{f.value}
                </span>
              ))}
            </div>
          )}

          {/* ── DESKTOP ACTION COLUMN ── */}
          {!isMobile && (
            <div style={{ flexShrink: 0, width: 208, display: "flex", flexDirection: "column", gap: 9, alignSelf: "center" }}>
              {nextSlot && (
                <div className="ph-next">
                  <span className="ph-next-dot" aria-hidden="true" />
                  <span>Next available<b>{nextSlot.label}</b></span>
                </div>
              )}
              <button onClick={handleClick} className="book-btn" style={{ width: "100%", padding: "13px 18px", borderRadius: 4, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14, letterSpacing: "0.2px" }}>
                Book a Session
              </button>
              <button onClick={() => setChatOpen(true)} className="chat-btn" style={{ width: "100%", padding: "12px 18px", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: 13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat Now
              </button>
              <button onClick={() => { if (!waitlistDone) setWaitlistOpen(true); }} disabled={waitlistDone} className="waitlist-btn" style={{ width: "100%", padding: "10px 18px", borderRadius: 4, fontWeight: 600, cursor: "pointer", fontSize: 13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
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

      {mounted && isMobile && !chatOpen && createPortal(
        <div className="ph-sticky" style={{ bottom: barLift }} role="region" aria-label="Book this therapist">
          {(() => {
            const price = getMinMaxPrice(pageData.fees || []);
            return price && price !== "--" ? (
              <div className="ph-sticky-fee"><b>{price}</b><small>{nextSlot ? <>Next: <span className="ph-sticky-next">{nextSlot.label}</span></> : "per session"}</small></div>
            ) : (
              <div className="ph-sticky-fee"><b>{pageData.user?.name?.split(" ")[0] || "Therapist"}</b><small>{pageData.profile_type || "Therapist"}</small></div>
            );
          })()}
          <button type="button" className="ph-sticky-chat" onClick={() => setChatOpen(true)}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </button>
          <button type="button" className="ph-sticky-book" onClick={handleClick}>Book Session</button>
        </div>,
        document.body
      )}

      <Dialog open={waitlistOpen} onClose={() => setWaitlistOpen(false)} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 18 } }}>
        <IconButton aria-label="close" onClick={() => setWaitlistOpen(false)} sx={{ position: "absolute", right: 10, top: 10, color: "#64748b" }}>
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 3 }}>
          <h3 style={{ margin: "0 36px 4px 0", fontSize: 20, fontWeight: 800, color: "#122019" }}>Join {pageData.user?.name?.split(" ")[0] || "the"}&rsquo;s waitlist</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: "#64748b", lineHeight: 1.5 }}>We&rsquo;ll call you as soon as a slot that suits you opens up.</p>
          <form className="ph-wl-form" onSubmit={submitWaitlist} noValidate>
            <label htmlFor="ph-wl-name">Your name</label>
            <input id="ph-wl-name" autoComplete="name" value={wl.name} onChange={(e) => setWl((w) => ({ ...w, name: e.target.value }))} placeholder="Full name" />
            <label htmlFor="ph-wl-phone">Phone number</label>
            <input id="ph-wl-phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={wl.phone}
              onChange={(e) => setWl((w) => ({ ...w, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit mobile number" />
            <label htmlFor="ph-wl-time">Preferred time</label>
            <select id="ph-wl-time" value={wl.time} onChange={(e) => setWl((w) => ({ ...w, time: e.target.value }))}>
              {["Any time", "Morning", "Afternoon", "Evening", "Weekends"].map((t) => <option key={t}>{t}</option>)}
            </select>
            {wlError && <p role="alert" style={{ margin: "10px 0 0", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>{wlError}</p>}
            <button type="submit" className="book-btn" disabled={wlSending}
              style={{ width: "100%", marginTop: 16, padding: "13px 18px", borderRadius: 10, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 14.5, opacity: wlSending ? 0.7 : 1 }}>
              {wlSending ? "Adding…" : "Join Waitlist"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>{snackbarText}</Alert>
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
