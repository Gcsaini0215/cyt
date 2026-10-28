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
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { useProfileOffers, OfferChip } from "./profile-offers";

export default function ProfileHeader({ pageData, favrioutes }) {
  const router = useRouter();
  // compact (phone-style) header up to 1023px — iPad portrait too; isTab bumps sizes on 600–1023px
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTab, setIsTab] = React.useState(false);
  const [bookmark, setBookmark] = React.useState(false);
  const [showBookmark, setShowBookmark] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("Profile link copied!");
  const [isConsultationModalOpen, setIsConsultationModalOpen] = React.useState(false);
  const [profileUrl, setProfileUrl] = React.useState(() => `https://www.chooseyourtherapist.in${profilePath(pageData)}`);
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
    const query = window.matchMedia("(max-width: 1023px)");
    const phone = window.matchMedia("(max-width: 599px)");
    const sync = () => { setIsMobile(query.matches); setIsTab(query.matches && !phone.matches); };
    sync();
    query.addEventListener("change", sync);
    phone.addEventListener("change", sync);
    return () => { query.removeEventListener("change", sync); phone.removeEventListener("change", sync); };
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

  const offers = useProfileOffers(pageData?._id);

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "book_now_click", therapist_id: pageData._id });
    }
    // a live coupon is applied on the booking page (the offer card says "auto-applied")
    const code = offers[0]?.code;
    router.push(code ? `${bookPath(pageData)}?coupon=${encodeURIComponent(code)}` : bookPath(pageData));
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
          <a href={link.url} target="_blank" rel="nofollow noopener noreferrer" className="ph-share-icon"
            style={{ width: 30, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: link.color, color: "#fff", flexShrink: 0 }}
          >{link.icon}<span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>Share on {link.name}</span></a>
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
        .ph-sticky-fee small { display: block; font-size: 11px; color: #64748b; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        @media (max-width: 400px) {
          .ph-sticky { gap: 8px; padding-left: 10px; padding-right: 10px; }
          .ph-sticky-fee b { font-size: 13.5px; }
          .ph-sticky-fee small { font-size: 10.5px; }
          .ph-sticky-chat { padding: 0 11px; font-size: 13px; }
          .ph-sticky-book { padding: 0 15px; font-size: 13.5px; }
        }
        @media (max-width: 350px) {
          .ph-sticky-chat { width: 46px; padding: 0; justify-content: center; }
          .ph-sticky-chat svg { width: 18px; height: 18px; }
          .ph-sticky-chat-t { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
        }
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
        /* letterhead banner: warm sunlit calm-room photo with a soft green-to-gold wash (separates it from the
           white navbar and keeps the white card readable) */
        .ph-banner { position: relative; overflow: hidden;
          background:
            linear-gradient(180deg, rgba(11,47,28,.55) 0%, rgba(11,47,28,.28) 45%, rgba(60,42,8,.35) 100%),
            #3b3324 url("/assets/img/hero/in-calm-room-1920.webp") center 58% / cover no-repeat; }
        .ph-banner::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(212,161,47,.6), transparent); }
        @media (max-width: 599px) {
          .ph-banner { background:
            linear-gradient(180deg, rgba(11,47,28,.5) 0%, rgba(11,47,28,.25) 50%, rgba(60,42,8,.35) 100%),
            #3b3324 url("/assets/img/hero/in-calm-room-900.webp") 65% 60% / cover no-repeat; }
        }
        @media (prefers-reduced-motion: reduce) { .ph-sticky { animation: none; transition: none; } }
      ` }} />

      {/* ── LETTERHEAD BANNER ── */}
      {/* warm calm-room photo (hero/in-calm-room) under a green-gold wash. Tried flat light pastel (melted into the white navbar) and flat dark green (too plain).
          The old dark photo was: #111 url('/assets/img/profile-banner-calm-room.jpg') center 55% / cover */}
      <div className="ph-banner" style={{
        paddingTop: isMobile ? 0 : 64,
        paddingBottom: isMobile ? 104 : 128,
      }} aria-hidden="true">
        
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
          padding: isMobile ? (isTab ? "22px 24px" : "16px 14px 16px") : "36px 44px",
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
                style={{ objectFit: "cover", borderRadius: 5, width: isMobile ? (isTab ? 112 : 76) : 148, height: isMobile ? (isTab ? 112 : 76) : 148, display: "block" }}
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
                margin: 0, fontSize: isMobile ? (isTab ? 26 : 19) : 32, fontWeight: 800, color: "#122019", lineHeight: 1.2,
                letterSpacing: "-0.3px", fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                {/* the blue tick sits with the last word, so a long name never leaves it alone on a new line. A plain SVG,
                    not an MUI icon: MUI puts a <style> tag inside the H1 and search engines read the CSS as part of the name */}
                {(() => {
                  const words = String(pageData.user.name || "").trim().split(/\s+/);
                  const last = words.pop() || "";
                  return <>{words.length ? `${words.join(" ")} ` : ""}<span style={{ whiteSpace: "nowrap" }}>{last}<svg viewBox="0 0 24 24" role="img" aria-label="Verified therapist" focusable="false" style={{ width: isMobile ? (isTab ? 22 : 18) : 24, height: isMobile ? (isTab ? 22 : 18) : 24, fill: "#1d9bf0", marginLeft: 6, verticalAlign: "-0.12em", display: "inline-block" }}><path d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z" /></svg></span></>;
                })()}
              </h1>
            </div>

            {/* Specialty */}
            <p style={{ margin: isMobile ? "0 0 4px" : "0 0 6px", fontSize: isMobile ? (isTab ? 12.5 : 10.5) : 13.5, color: "#0f3d24", fontWeight: 700, textTransform: "uppercase", letterSpacing: isMobile ? "0.8px" : "1.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {pageData.profile_type || "Therapist"}
              {/* earned badge (rating 4.5+, 3+ reviews, active) — inline so the header doesn't grow */}
              {pageData.top_therapist && <span title="CYT Top therapist — highly rated and active" style={{ display: "inline-block", marginLeft: 8, padding: "1px 8px", borderRadius: 999, background: "linear-gradient(135deg, #f0cf7a, #c48a1c)", color: "#3d2a00", fontSize: isMobile ? 9.5 : 11, letterSpacing: ".4px", verticalAlign: "1px" }}>★ Top therapist</span>}
            </p>

            {/* Qualification */}
            {pageData.qualification && (
              <p style={{ margin: isMobile ? "0 0 6px" : "0 0 12px", fontSize: isMobile ? (isTab ? 14 : 12) : 14.5, color: "#5b6b62", fontWeight: 500, lineHeight: 1.45, fontStyle: "italic",
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

            {/* Quick facts line — academic byline style, always one line (the last value gets "…") */}
            {credentialFacts.length > 0 && !isMobile && (
              <div style={{
                display: "flex", flexWrap: "nowrap", gap: 16, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap",
                fontSize: 12, color: "#5b6b62", borderTop: "1px solid #ecefec", paddingTop: 12,
              }}>
                {credentialFacts.map((f, i) => {
                  const last = i === credentialFacts.length - 1;
                  return (
                    <span key={f.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: last ? 1 : 0, minWidth: last ? 0 : "auto" }}>
                      {i > 0 && <span style={{ color: "#c9d1cb" }}>·</span>}
                      <strong style={{ color: "#122019", fontWeight: 700 }}>{f.label}:</strong>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.value}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Mobile buttons */}

          </div>

          {/* mobile: experience · languages · location as one line under the photo row */}
          {isMobile && credentialFacts.length > 0 && (
            <div style={{ flexBasis: "100%", minWidth: 0, display: "flex", flexWrap: "nowrap", gap: isTab ? 18 : 12, paddingTop: 10, borderTop: "1px solid #ecefec", fontSize: isTab ? 13.5 : 12, color: "#475569", whiteSpace: "nowrap", overflow: "hidden" }}>
              {credentialFacts.map((f, i) => {
                const last = i === credentialFacts.length - 1;
                return (
                  <span key={f.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: last ? 1 : 0, minWidth: last ? 0 : "auto" }}>
                    <i className={f.label === "Experience" ? "feather-briefcase" : f.label === "Languages" ? "feather-globe" : "feather-map-pin"} style={{ color: "#16a34a", fontSize: isTab ? 13.5 : 12, flexShrink: 0 }} aria-hidden="true" />
                    <span className="na-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>{f.label}: </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.value}</span>
                  </span>
                );
              })}
            </div>
          )}
          {isMobile && <OfferChip offers={offers} bookHref={bookPath(pageData)} compact />}

          {/* ── DESKTOP ACTION COLUMN ── */}
          {!isMobile && (
            <div style={{ flexShrink: 0, width: 208, display: "flex", flexDirection: "column", gap: 9, alignSelf: "center" }}>
              {offers.length > 0 ? (
                /* with a live coupon: the offer card carries the Book button (the code goes with it) */
                <OfferChip offers={offers} bookHref={bookPath(pageData)} onBook={handleClick} />
              ) : (
                <>
                  {nextSlot && (
                    <div className="ph-next">
                      <span className="ph-next-dot" aria-hidden="true" />
                      <span>Next available<b>{nextSlot.label}</b></span>
                    </div>
                  )}
                  <button onClick={handleClick} className="book-btn" style={{ width: "100%", padding: "13px 18px", borderRadius: 4, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14, letterSpacing: "0.2px" }}>
                    Book a Session
                  </button>
                </>
              )}
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
