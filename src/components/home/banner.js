import { TypeAnimation } from 'react-type-animation';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Loader } from "@googlemaps/js-api-loader";
import { 
  Thunderstorm, 
  Cloud, 
  Bolt, 
  Favorite, 
  Work, 
  Spa, 
  VolunteerActivism,
  SelfImprovement,
  SentimentDissatisfied,
  Search,
  Star,
  ArrowForward,
  Close,
  CheckCircle,
  QuestionAnswer,
  CalendarMonth,
  LocationOn
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Skeleton,
  Dialog,
  Button,
  Zoom,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import Link from "next/link";

import useMediaQuery from "@mui/material/useMediaQuery";

import ImageTag from "../../utils/image-tag";

import { fetchData } from "../../utils/actions";
import { getTherapistProfiles, imagePath } from "../../utils/url";
// Therapist avatar images
const ClientImg = "/assets/img/avatar-027dc8.png";
const Fabiha = "/assets/img/psychologist.png";
const counselling1 = "/assets/img/counselling.png";

import ConsultationForm from "./consultation-form";
import { useRouter } from "next/router";

export default function Banner({ topTherapists = [], userCity = null }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Typewriter color state
  const [typewriterGradient, setTypewriterGradient] = useState("linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)");

  // State
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dynamicFeelingCards, setDynamicFeelingCards] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const mobileQuery = window.matchMedia("(max-width: 600px)");
    const tabletQuery = window.matchMedia("(max-width: 960px)");
    
    setIsMobile(mobileQuery.matches);
    setIsTablet(tabletQuery.matches);

    const handleMobileChange = (e) => setIsMobile(e.matches);
    const handleTabletChange = (e) => setIsTablet(e.matches);

    mobileQuery.addListener(handleMobileChange);
    tabletQuery.addListener(handleTabletChange);

    return () => {
      mobileQuery.removeListener(handleMobileChange);
      tabletQuery.removeListener(handleTabletChange);
    };
  }, []);

  // Animated placeholder texts
  const placeholderTexts = [
    "Search by therapist name...",
    "Search by expertise...",
    "Search by state..."
  ];

  // Debounced search function
  const debouncedSetSearchQuery = useCallback((value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, []);

  // Helper to assign icons and colors based on expertise text
  const getStyleForExpertise = (text) => {
    const lowerText = (text || "").toLowerCase();
    if (lowerText.includes("anxi")) return { icon: <Thunderstorm sx={{ fontSize: 24 }} />, color: "#F0FDF4", border: "#DCFCE7", iconColor: "#228756" }; // Anxiety
    if (lowerText.includes("depress")) return { icon: <Cloud sx={{ fontSize: 24 }} />, color: "#EFF6FF", border: "#DBEAFE", iconColor: "#3B82F6" }; // Depression
    if (lowerText.includes("stress")) return { icon: <Bolt sx={{ fontSize: 24 }} />, color: "#FFF7ED", border: "#FFEDD5", iconColor: "#F97316" }; // Stress
    if (lowerText.includes("relation") || lowerText.includes("couple")) return { icon: <Favorite sx={{ fontSize: 24 }} />, color: "#FEF2F2", border: "#FECACA", iconColor: "#EF4444" }; // Relationships
    if (lowerText.includes("child") || lowerText.includes("parent")) return { icon: <VolunteerActivism sx={{ fontSize: 24 }} />, color: "#F0F9FF", border: "#BAE6FD", iconColor: "#0EA5E9" }; // Parenting
    if (lowerText.includes("trauma") || lowerText.includes("ptsd")) return { icon: <SentimentDissatisfied sx={{ fontSize: 24 }} />, color: "#FAF5FF", border: "#E9D5FF", iconColor: "#A855F7" }; // Trauma
    if (lowerText.includes("career") || lowerText.includes("work")) return { icon: <Work sx={{ fontSize: 24 }} />, color: "#F8FAFC", border: "#E2E8F0", iconColor: "#64748B" }; // Career
    if (lowerText.includes("addiction")) return { icon: <SelfImprovement sx={{ fontSize: 24 }} />, color: "#FFF1F2", border: "#FECDD3", iconColor: "#E11D48" }; // Addiction
    return { icon: <Spa sx={{ fontSize: 24 }} />, color: "#F0FDF4", border: "#DCFCE7", iconColor: "#228756" }; // Default
  };

  useEffect(() => {
    if (topTherapists && topTherapists.length > 0) {
      const expertiseCounts = {};
      topTherapists.forEach(therapist => {
        if (therapist.experties) {
          const tags = therapist.experties.split(',').map(t => t.trim());
          tags.forEach(tag => {
            if (tag) {
              expertiseCounts[tag] = (expertiseCounts[tag] || 0) + 1;
            }
          });
        }
      });

      const sortedExpertise = Object.entries(expertiseCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([label]) => {
          const style = getStyleForExpertise(label);
          return { label, ...style };
        });

      setDynamicFeelingCards(sortedExpertise);
    }
  }, [topTherapists]);

  // Animated placeholder cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, isMobile ? 5000 : 3000);

    return () => clearInterval(interval);
  }, [placeholderTexts.length, isMobile]);

  return (
    <>
      <section
        className="rbt-banner-area rbt-banner-1 home-banner-with-img"
        style={{
          paddingTop: isMobile ? "20px" : "40px",
          marginTop: "0px",
          paddingBottom: isMobile ? "20px" : "30px",
          marginBottom: isMobile ? "0px" : "20px",
          background: "linear-gradient(145deg, #edfdf5 0%, #f8fffc 25%, #ffffff 55%, #f3f0ff 80%, #eef6ff 100%)",
          overflowX: "hidden",
          position: "relative",
        }}
      >
      {/* Aurora mesh background */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-30%", left: "-15%",  width: "70%", height: "80%", background: "radial-gradient(ellipse, rgba(34,197,94,0.32) 0%, transparent 60%)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "-20%", right: "-15%", width: "60%", height: "80%", background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 60%)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "20%", width: "60%", height: "70%", background: "radial-gradient(ellipse, rgba(56,189,248,0.20) 0%, transparent 60%)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "30%", left: "35%", width: "40%", height: "50%", background: "radial-gradient(ellipse, rgba(134,239,172,0.22) 0%, transparent 60%)", filter: "blur(50px)", borderRadius: "50%" }} />
      </div>
      <div className="container mt--20" style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div className="row justify-content-center text-center" style={{ width: '100%' }}>
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="content" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="inner" style={{ width: '100%' }}>
                {/* Unified Banner Content */}
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  textAlign: "center",
                  py: isMobile ? 1 : 4,
                  px: 2,
                  width: "100%",
                  maxWidth: isMobile ? "100%" : "1200px",
                  mx: "auto",
                  mt: 0
                }}>
                  {/* Two-line Heading */}
                    <h1
                    className="title"
                    style={{
                      fontFamily: "'Inter', 'Poppins', sans-serif",
                      fontSize: isMobile ? "2.2rem" : isTablet ? "2.8rem" : "4.8rem",
                      lineHeight: 1.2,
                      marginTop: 0,
                      marginBottom: isMobile ? "12px" : "24px",
                      fontWeight: 800,
                      textAlign: "center",
                      width: "100%",
                      maxWidth: isMobile ? "100%" : "1200px",
                      margin: "0 auto",
                      display: "block",
                      padding: "0",
                      color: "#0f172a",
                      letterSpacing: isMobile ? "-0.03em" : "-0.02em",
                      textShadow: "0 2px 4px rgba(0,0,0,0.02)"
                    }}
                  >
                    <Box component="span" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isMobile ? "4px" : "8px" }}>
                      {/* Line 1 — static */}
                      <span style={{
                        display: "block",
                        whiteSpace: "nowrap",
                        fontWeight: 800,
                        lineHeight: 1.2
                      }}>
                        <span style={{ color: "#1e293b" }}>Find the Best </span>
                        <span style={{
                          backgroundImage: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: 800
                        }}>Therapists</span>
                      </span>

                      {/* Line 2 — mobile: typewriter only | desktop: "across India" + typewriter */}
                      {isMobile ? (
                        <Box component="span" sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "2px",
                          lineHeight: 1.3,
                          "& .typewriter-text": {
                            backgroundImage: typewriterGradient,
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            color: "transparent",
                            fontWeight: 800,
                            display: "inline",
                            transition: "background-image 0.5s ease"
                          }
                        }}>
                          <span style={{ color: "#1e293b", fontWeight: 800, display: "block", whiteSpace: "nowrap" }}>across India for</span>
                          <TypeAnimation
                            sequence={[
                              'Mental Wellness',
                              () => setTypewriterGradient("linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)"),
                              2000,
                              'Expert Guidance',
                              () => setTypewriterGradient("linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)"),
                              2000,
                              'Personal Growth',
                              () => setTypewriterGradient("linear-gradient(135deg, #ea580c 0%, #f43f5e 100%)"),
                              2000,
                              'Anxiety Support',
                              () => setTypewriterGradient("linear-gradient(135deg, #0d9488 0%, #10b981 100%)"),
                              2000,
                              'Emotional Health',
                              () => setTypewriterGradient("linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)"),
                              2000,
                            ]}
                            wrapper="span"
                            speed={50}
                            className="typewriter-text"
                            repeat={Infinity}
                            cursor={true}
                          />
                        </Box>
                      ) : (
                        <Box component="span" sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "0.3em",
                          lineHeight: 1.3,
                          "& .typewriter-text": {
                            backgroundImage: typewriterGradient,
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            color: "transparent",
                            fontWeight: 800,
                            display: "inline",
                            transition: "background-image 0.5s ease"
                          }
                        }}>
                          <span style={{ color: "#475569", fontWeight: 800, whiteSpace: "nowrap" }}>across</span>
                          <span style={{
                            backgroundImage: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 800,
                            whiteSpace: "nowrap"
                          }}>India</span>
                          <span style={{ color: "#475569", fontWeight: 800, whiteSpace: "nowrap" }}>for</span>
                          <Box component="span" sx={{
                            display: "inline-block",
                            minWidth: "8em",
                            textAlign: "left",
                          }}>
                            <TypeAnimation
                              sequence={[
                                'Mental Wellness',
                                () => setTypewriterGradient("linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)"),
                                2000,
                                'Expert Guidance',
                                () => setTypewriterGradient("linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)"),
                                2000,
                                'Personal Growth',
                                () => setTypewriterGradient("linear-gradient(135deg, #ea580c 0%, #f43f5e 100%)"),
                                2000,
                                'Anxiety Support',
                                () => setTypewriterGradient("linear-gradient(135deg, #0d9488 0%, #10b981 100%)"),
                                2000,
                                'Emotional Health',
                                () => setTypewriterGradient("linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)"),
                                2000,
                              ]}
                              wrapper="span"
                              speed={50}
                              className="typewriter-text"
                              repeat={Infinity}
                              cursor={true}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </h1>

                  {/* Trust Stats Bar */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: isMobile ? 2 : 5,
                    flexWrap: "wrap",
                    mb: isMobile ? 3 : 4,
                    mt: isMobile ? 2 : 3,
                    px: isMobile ? 1 : 0,
                  }}>
                    {[
                      { value: "500+", label: "Verified Therapists", icon: <CheckCircle sx={{ fontSize: isMobile ? 18 : 20, color: "#228756" }} /> },
                      { value: "10,000+", label: "Sessions Completed", icon: <CalendarMonth sx={{ fontSize: isMobile ? 18 : 20, color: "#228756" }} /> },
                      { value: "4.9★", label: "Average Rating", icon: <Star sx={{ fontSize: isMobile ? 18 : 20, color: "#f59e0b" }} /> },
                      { value: "100%", label: "Confidential", icon: <Spa sx={{ fontSize: isMobile ? 18 : 20, color: "#228756" }} /> },
                    ].map((stat, i) => (
                      <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {stat.icon}
                          <Typography sx={{ fontWeight: 800, fontSize: isMobile ? "17px" : "22px", color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: isMobile ? "10px" : "12px", color: "#64748b", fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Description */}
                  <Typography variant="h6" sx={{
                    color: "#475569",
                    maxWidth: isMobile ? "100%" : "850px",
                    margin: "0 auto",
                    lineHeight: isMobile ? 1.6 : 1.8,
                    fontSize: isMobile ? "14px" : "19px",
                    mb: isMobile ? 3 : 5,
                    px: isMobile ? 2 : 0,
                    fontWeight: 400,
                    textAlign: isMobile ? "center" : "center",
                    display: "block",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.01em",
                    opacity: 0.9
                  }}>
                    Find qualified <span style={{ color: "#166534", fontWeight: 600 }}>therapists</span> for <span style={{ color: "#166534", fontWeight: 600 }}>anxiety</span>, <span style={{ color: "#166534", fontWeight: 600 }}>stress</span>, <span style={{ color: "#166534", fontWeight: 600 }}>depression</span>, and <span style={{ color: "#166534", fontWeight: 600 }}>relationship concerns</span>. Compare profiles and book confidential sessions <span style={{ color: "#166534", fontWeight: 600 }}>online or in-person</span> across India.
                  </Typography>

                  {/* Search Bar */}
                  <Box
                    component="form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (inputValue.trim()) {
                        router.push(`/view-all-therapist?search=${encodeURIComponent(inputValue.trim())}`);
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      maxWidth: isMobile ? "100%" : "700px",
                      mx: "auto",
                      mb: isMobile ? 3 : 4,
                      mt: isMobile ? 1 : 2,
                      bgcolor: "white",
                      borderRadius: "50px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
                      border: "1.5px solid #e2e8f0",
                      overflow: "hidden",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      "&:focus-within": {
                        boxShadow: "0 8px 30px rgba(34,135,86,0.18)",
                        borderColor: "#228756"
                      }
                    }}
                  >
                    <Search sx={{ fontSize: 22, color: "#94a3b8", ml: 2.5, flexShrink: 0 }} />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        debouncedSetSearchQuery(e.target.value);
                      }}
                      placeholder={placeholderTexts[placeholderIndex]}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#1e293b",
                        padding: isMobile ? "14px 12px" : "18px 16px",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                        border: "none",
                        borderRadius: "50px",
                        margin: "6px",
                        padding: isMobile ? "10px 18px" : "12px 28px",
                        color: "white",
                        fontWeight: 700,
                        fontSize: isMobile ? "13px" : "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.2s ease",
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      {isMobile
                        ? <Search sx={{ fontSize: 18 }} />
                        : <><span>Search</span><ArrowForward sx={{ fontSize: 16 }} /></>
                      }
                    </button>
                  </Box>

                  {/* CTA Buttons */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: isMobile ? 2 : 3,
                    mt: isMobile ? 1 : 2,
                    mb: 4,
                    flexWrap: "wrap",
                    width: "100%",
                    px: isMobile ? 1 : 0
                  }}>
                    {/* Primary Button */}
                    <Button
                      component={Link}
                      href="/view-all-therapist"
                      variant="contained"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: isMobile ? 4 : 6,
                        py: isMobile ? 1.8 : 2.2,
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                        textTransform: "none",
                        color: "#ffffff",
                        width: isMobile ? "100%" : "auto",
                        minWidth: isMobile ? "auto" : "240px",
                        fontWeight: 700,
                        fontSize: isMobile ? "15px" : "17px",
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "0.02em",
                        boxShadow: "0 10px 25px -5px rgba(22, 101, 52, 0.35)",
                        border: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
                          transform: "translateY(-3px)",
                          boxShadow: "0 18px 35px -8px rgba(22, 101, 52, 0.45)",
                        }
                      }}
                    >
                      Find a Therapist
                      <ArrowForward sx={{ fontSize: 20 }} />
                    </Button>

                    {/* Secondary Button */}
                    <Button
                      variant="outlined"
                      onClick={() => setIsConsultationOpen(true)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: isMobile ? 4 : 6,
                        py: isMobile ? 1.8 : 2.2,
                        borderRadius: "14px",
                        background: "white",
                        textTransform: "none",
                        color: "#166534",
                        width: isMobile ? "100%" : "auto",
                        minWidth: isMobile ? "auto" : "240px",
                        fontWeight: 700,
                        fontSize: isMobile ? "15px" : "17px",
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "0.02em",
                        border: "2px solid #166534",
                        boxShadow: "0 4px 15px rgba(22, 101, 52, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "#f0fdf4",
                          borderColor: "#15803d",
                          transform: "translateY(-3px)",
                          boxShadow: "0 10px 25px rgba(22, 101, 52, 0.15)",
                        }
                      }}
                    >
                      <QuestionAnswer sx={{ fontSize: 20 }} />
                      Get Free Consultation
                    </Button>
                  </Box>

                </Box>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <Dialog
        open={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        maxWidth="xs"
        fullWidth
        style={{ zIndex: 99999 }}
        PaperProps={{
          style: {
            borderRadius: "24px",
            padding: 0,
            margin: isMobile ? "12px" : "32px",
            maxHeight: "calc(100% - 48px)",
            overflow: "hidden",
            boxShadow: "0 32px 64px rgba(0,0,0,0.18)"
          }
        }}
      >
        {/* Premium gradient header */}
        <Box sx={{
          background: "linear-gradient(135deg, #166534 0%, #16a34a 60%, #22c55e 100%)",
          px: 3, pt: 3.5, pb: 4,
          position: "relative",
          textAlign: "center"
        }}>
          <IconButton
            onClick={() => setIsConsultationOpen(false)}
            size="small"
            sx={{
              position: "absolute", top: 12, right: 12,
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" }
            }}
          >
            <Close fontSize="small" />
          </IconButton>
          <Box sx={{
            width: 52, height: 52, borderRadius: "14px",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            backdropFilter: "blur(4px)"
          }}>
            <QuestionAnswer sx={{ fontSize: 26, color: "#fff" }} />
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "20px", lineHeight: 1.2, mb: 0.5 }}>
            Free Consultation
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.80)", fontSize: "13px", fontWeight: 400 }}>
            Talk to a therapist — no commitment needed
          </Typography>
        </Box>

        {/* Form body */}
        <Box sx={{ px: isMobile ? 2.5 : 3, py: 3, overflowY: "auto", maxHeight: isMobile ? "60vh" : "70vh" }}>
          <ConsultationForm showHeading={false} showLocation={false} showSource={false} />
        </Box>
      </Dialog>

      {/* Therapist Profile Quick View Modal */}
      <Dialog
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            overflow: "visible",
            m: isMobile ? 2 : 3,
            maxHeight: "90vh"
          }
        }}
      >
        <Box sx={{ position: "relative", p: isMobile ? 3 : 4 }}>
          <IconButton 
            onClick={() => setIsProfileOpen(false)}
            sx={{ 
              position: "absolute", 
              right: 8, 
              top: 8, 
              zIndex: 10,
              backgroundColor: "white",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "#f8fafc" }
            }}
          >
            <Close />
          </IconButton>

          {selectedTherapist && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Header: Avatar and Basic Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                <Avatar 
                  src={`${imagePath}/${selectedTherapist.user?.profile || 'default-profile.png'}`}
                  alt={selectedTherapist.user?.name || "Therapist"}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    border: "4px solid #f0fdf4",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
                  }} 
                />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5, fontSize: isMobile ? "24px" : "32px" }}>
                    {selectedTherapist.user?.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "#228756", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                    {selectedTherapist.profile_type || "Specialist"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, mt: 0.5 }}>
                    {selectedTherapist.qualification}
                  </Typography>
                </Box>
              </Box>

              {/* About Me Section */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                  About Me
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: "#475569", 
                  lineHeight: 1.6,
                  textAlign: "justify",
                  fontSize: isMobile ? "14px" : "16px",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {selectedTherapist.user?.bio || selectedTherapist.about_me || "No description available."}
                </Typography>
              </Box>

              {/* Languages and State */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#f1f5f9", px: 2, py: 1, borderRadius: "50px" }}>
                  <LocationOn sx={{ fontSize: 18, color: "#475569" }} />
                  <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{selectedTherapist.state || "India"}</Typography>
                </Box>
                {selectedTherapist.language_spoken && Array.isArray(selectedTherapist.language_spoken) && selectedTherapist.language_spoken.map((lang, idx) => (
                  <Box key={idx} sx={{ bgcolor: "#f1f5f9", px: 2, py: 1, borderRadius: "50px", fontSize: "14px", fontWeight: 600 }}>
                    {lang.label}
                  </Box>
                ))}
              </Box>

              {/* Book Appointment Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push(`/therapy-booking?therapist_id=${selectedTherapist.id}`);
                }}
                sx={{
                  mt: 2,
                  py: 2,
                  borderRadius: "16px",
                  backgroundColor: "#228756",
                  textTransform: "none",
                  fontSize: "18px",
                  fontWeight: 700,
                  boxShadow: "0 10px 20px rgba(34, 135, 86, 0.2)",
                  "&:hover": {
                    backgroundColor: "#1a6b44",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 30px rgba(34, 135, 86, 0.3)",
                  }
                }}
              >
                Book Appointment
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>

      {/* Blended Therapist Cards Section */}
      <Box sx={{ 
        width: "100vw", 
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        bgcolor: "transparent", 
        py: isMobile ? 2 : 6, 
        overflow: "hidden",
        zIndex: 2,
        mt: isMobile ? -2 : -12
      }}>
        <Swiper
          slidesPerView={"auto"}
          centeredSlides={false}
          spaceBetween={isMobile ? 15 : 30}
          loop={topTherapists.length > 3}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={800}
          modules={[Autoplay]}
          style={{ 
            width: "100%", 
            padding: isMobile ? "10px 0 20px" : "20px 0 40px",
            overflow: "visible" 
          }}
          grabCursor={true}
        >
          {topTherapists.map((therapist, i) => (
            <SwiperSlide key={i} style={{ width: "auto" }}>
              <Box 
                onClick={() => {
                  setSelectedTherapist(therapist);
                  setIsProfileOpen(true);
                }}
                sx={{ 
                  display: "flex", 
                  flexDirection: "column",
                  bgcolor: "white",
                  p: isMobile ? 2 : 3,
                  mx: isMobile ? 1 : 1.5,
                  borderRadius: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  border: "1px solid #f1f5f9",
                  minWidth: isMobile ? "200px" : "280px",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&:hover": {
                    transform: isMobile ? "none" : "translateY(-12px) scale(1.02)",
                    boxShadow: isMobile ? "0 10px 30px rgba(0,0,0,0.04)" : "0 25px 50px rgba(34, 135, 86, 0.15)",
                    borderColor: "#228756",
                    "& .view-profile-btn": {
                      backgroundColor: "#1a6b44",
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 20px rgba(34, 135, 86, 0.3)",
                    }
                  },
                  "&:active": {
                    transform: "scale(0.96)",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                  }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 2 : 2.5, mb: isMobile ? 2.5 : 3 }}>
                  <Box sx={{ position: "relative", p: 0.5 }}>
                    <Box sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: "50%",
                      padding: "2px",
                      background: "linear-gradient(45deg, #228756, #dcfce7, #228756)",
                      animation: "rotate-gradient 6s linear infinite",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }} />
                    <Avatar 
                      src={`${imagePath}/${therapist.user?.profile || 'default-profile.png'}`}
                      alt={therapist.user?.name || "Therapist"}
                      sx={{ 
                        width: isMobile ? 70 : 80, 
                        height: isMobile ? 70 : 80, 
                        border: "3px solid white",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                      }} 
                    />
                    <Box sx={{ 
                      position: "absolute", 
                      bottom: 6, 
                      right: 6, 
                      width: isMobile ? 14 : 16, 
                      height: isMobile ? 14 : 16, 
                      bgcolor: "#22c55e", 
                      borderRadius: "50%", 
                      border: "2px solid white",
                      zIndex: 2
                    }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <Typography sx={{ fontSize: isMobile ? "17px" : "19px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
                        {therapist.user?.name}
                      </Typography>
                      <CheckCircle sx={{ fontSize: isMobile ? 18 : 20, color: "#228756" }} />
                    </Box>
                    {therapist.qualification && (
                      <Typography sx={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "#64748b",
                        fontWeight: 500,
                        mb: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        maxWidth: "200px"
                      }}>
                        {therapist.qualification}
                      </Typography>
                    )}
                    <Typography sx={{
                        fontSize: isMobile ? "12px" : "13px",
                        color: "#228756",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 0.5
                      }}>
                        {therapist.profile_type || "Specialist"}
                      </Typography>
                    {/* Rating + Reviews + Exp */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      {therapist.reviews && therapist.reviews.length > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, bgcolor: "#fffbeb", px: 1, py: 0.3, borderRadius: "6px", border: "1px solid #fef08a" }}>
                          <Star sx={{ fontSize: 13, color: "#f59e0b" }} />
                          <Typography sx={{ fontSize: "11px", fontWeight: 800, color: "#d97706", lineHeight: 1 }}>
                            {(therapist.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / therapist.reviews.length).toFixed(1)}
                          </Typography>
                          <Typography sx={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500, lineHeight: 1 }}>
                            ({therapist.reviews.length})
                          </Typography>
                        </Box>
                      )}
                      {therapist.year_of_exp && (
                        <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                          {therapist.year_of_exp} exp
                        </Typography>
                      )}
                    </Box>
                    </Box>
                  </Box>

                {/* Dynamic Languages Spoken */}
                {therapist.language_spoken && Array.isArray(therapist.language_spoken) && therapist.language_spoken.length > 0 && (
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 0.5, 
                    mb: isMobile ? 2 : 2.5,
                    flexWrap: "wrap"
                  }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Speaks:
                    </Typography>
                    {therapist.language_spoken.map((lang, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          bgcolor: "white", 
                          color: "#475569", 
                          px: 1, 
                          py: 0.3, 
                          borderRadius: "4px", 
                          fontSize: "11px", 
                          fontWeight: 700,
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        {lang.label}
                      </Box>
                    ))}
                  </Box>
                )}
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 0.5,
                    bgcolor: "#f1f5f9",
                    px: 1.5,
                    py: 0.6,
                    borderRadius: "50px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <LocationOn sx={{ fontSize: 14, color: "#475569" }} />
                    <Typography sx={{ 
                      fontSize: isMobile ? "11px" : "12px", 
                      color: "#0f172a", 
                      fontWeight: 700,
                      textTransform: "capitalize"
                    }}>
                      {therapist.state || "India"}
                    </Typography>
                  </Box>
                  <Box
                    className="view-profile-btn"
                    sx={{ 
                      fontSize: isMobile ? "11px" : "12px", 
                      fontWeight: 800, 
                      color: "white", 
                      backgroundColor: "#228756",
                      px: isMobile ? 1.5 : 2,
                      py: isMobile ? 0.8 : 1,
                      borderRadius: "50px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(34, 135, 86, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#1a6b44",
                        transform: "scale(1.05)"
                      },
                      "&:active": {
                        transform: "scale(0.9)",
                      }
                    }}
                  >
                    View Profile
                    {!isMobile && <ArrowForward sx={{ fontSize: 14 }} />}
                  </Box>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Soft Mist / Gradient Fade Bottom */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: isMobile ? "100px" : "200px",
        background: "linear-gradient(to bottom, rgba(240, 253, 244, 0) 0%, rgba(255, 255, 255, 0.4) 50%, #ffffff 100%)",
        zIndex: 1,
        pointerEvents: "none"
      }}></div>

      {/* Therapist Profile Quick View Modal */}
      <style jsx global>{`
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
    </>
  );
}
