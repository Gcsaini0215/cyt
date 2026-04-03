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

export default function Banner({ topTherapists = [] }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // State
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dynamicFeelingCards, setDynamicFeelingCards] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
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

  const rotatingWords = [
    { text: "Mental Wellness", gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }, // Violet to Purple for calm/peace
    { text: "Expert Guidance", gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }, // Deep Blue to Royal Blue
    { text: "Personal Growth", gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)" }, // Amber to Deep Orange for growth/energy
    { text: "Anxiety Support", gradient: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)" }, // Indigo to Slate Blue
    { text: "Better Living", gradient: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)" }   // Deep Sky Blue to Cyan
  ];

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(wordInterval);
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
          backgroundColor: "inherit",
          overflowX: "hidden",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
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
                      fontSize: isMobile ? "3.2rem" : isTablet ? "3.2rem" : "4.8rem",
                      lineHeight: isMobile ? "3.4rem" : isTablet ? "3.4rem" : "5.5rem",
                      marginTop: 0,
                      marginBottom: isMobile ? "12px" : "24px",
                      fontWeight: 900,
                      textAlign: "center",
                      width: "100%",
                      maxWidth: isMobile ? "100%" : "1200px",
                      margin: "0 auto",
                      display: "block",
                      padding: isMobile ? "0 5px" : "0",
                      color: "#0f172a"
                    }}
                  >
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline", flexWrap: "wrap", justifyContent: "center" }}>
                      Choose the <span style={{ 
                        color: "#228756", 
                        display: "inline-block",
                        margin: "0 10px",
                        fontWeight: isMobile ? 950 : 900,
                        lineHeight: 1.2
                      }}>Best Therapists</span>
                      Across <span style={{
                        backgroundImage: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", 
                        WebkitBackgroundClip: "text", 
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        display: "inline-block",
                        margin: "0 10px",
                        fontWeight: 800
                      }}>India</span> for
                      <Box component="span" sx={{ 
                        display: "inline-block", 
                        position: "relative",
                        verticalAlign: "bottom",
                        height: isMobile ? "3.2rem" : "6.5rem",
                        overflow: "hidden",
                        width: isMobile ? "240px" : "480px", 
                        textAlign: "center",
                        ml: isMobile ? 0 : 1
                      }}>
                        <span 
                          key={wordIndex}
                          className="flipping-word"
                          style={{ 
                            backgroundImage: rotatingWords[wordIndex].gradient, 
                            WebkitBackgroundClip: "text", 
                            backgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            color: "transparent",
                            fontSize: isMobile ? "0.9em" : "1em",
                            lineHeight: isMobile ? "3.2rem" : "6.5rem",
                            whiteSpace: "nowrap",
                            width: "100%",
                            display: "block"
                          }}
                        >
                          {rotatingWords[wordIndex].text}
                        </span>
                      </Box>
                    </Box>
                  </h1>

                  {/* Description */}
                  <Typography variant="h6" sx={{ 
                    color: "#333333", 
                    maxWidth: isMobile ? "100%" : "1000px", 
                    margin: "0 auto", 
                    lineHeight: isMobile ? 1.5 : 1.6,
                    fontSize: isMobile ? "13px" : "18px",
                    mb: isMobile ? 2 : 3,
                    px: isMobile ? 2 : 2,
                    fontWeight: 500,
                    textAlign: isMobile ? "justify" : "center",
                    display: "block",
                    fontFamily: "'Inter', 'Poppins', sans-serif",
                    letterSpacing: "-0.01em"
                  }}>
                    Discover qualified and experienced <span style={{ color: "#1a6d45", fontWeight: 700 }}>therapists</span> offering online and in-person therapy across India. 
                    Compare specializations, review detailed profiles, and book confidential sessions for 
                    <span style={{ color: "#1a6d45", fontWeight: 700 }}> anxiety</span>, 
                    <span style={{ color: "#1a6d45", fontWeight: 700 }}> stress</span>, 
                    <span style={{ color: "#1a6d45", fontWeight: 700 }}> relationship concerns</span>, 
                    <span style={{ color: "#1a6d45", fontWeight: 700 }}> depression</span>, and <span style={{ color: "#1a6d45", fontWeight: 700 }}>emotional well-being</span> — all in one secure platform.
                  </Typography>

                  {/* Google Reviews One-Liner Removed */}

                  {/* Interactive Action Cards */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: isMobile ? 1.5 : 3,
                    mt: isMobile ? 2 : 4,
                    mb: 4,
                    flexWrap: "wrap",
                    width: "100%",
                    px: isMobile ? 1 : 0
                  }}>
                    {[
                      { 
                        id: "find", 
                        label: "Find a Therapist", 
                        icon: <PersonSearchIcon />, 
                        href: "/view-all-therapist",
                        color: "#228756", // Darker Green
                        bg: "#228756" 
                      },
                      { 
                        id: "local", 
                        label: "Psychologist in Noida", 
                        icon: <LocationOn />, 
                        href: "/psychologist-in-noida-delhi",
                        color: "#0ea5e9", // Bright Blue
                        bg: "#0ea5e9"
                      },
                    ].map((card) => (
                      <Button
                        key={card.id}
                        component={card.href ? Link : "button"}
                        href={card.href}
                        onClick={card.onClick}
                        variant="contained"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.5,
                          px: 4,
                          py: 1.5,
                          borderRadius: "14px",
                          backgroundColor: card.bg,
                          textTransform: "none",
                          color: "#ffffff",
                          width: isMobile ? "100%" : "340px",
                          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          fontWeight: 500,
                          fontSize: isMobile ? "14px" : "16px",
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: `0 10px 20px -5px ${card.color}40`,
                          "& .icon-container": {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            color: "#ffffff"
                          },
                          "& svg": {
                            fontSize: 22
                          },
                          "&:hover": {
                            backgroundColor: card.bg,
                            transform: "translateY(-5px) scale(1.02)",
                            boxShadow: `0 20px 30px -10px ${card.color}60`,
                            "& .icon-container": {
                              transform: "scale(1.1)"
                            }
                          }
                        }}
                      >
                        <Box className="icon-container">
                          {card.icon}
                        </Box>
                        {card.label}
                      </Button>
                    ))}
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
        maxWidth="sm"
        fullWidth
        style={{ zIndex: 99999 }}
        PaperProps={{
          style: {
            borderRadius: "24px",
            padding: isMobile ? "15px" : "30px",
            margin: isMobile ? "10px" : "32px",
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto"
          }
        }}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton 
            onClick={() => setIsConsultationOpen(false)}
            sx={{ 
              position: "absolute", 
              right: -10, 
              top: -10, 
              zIndex: 10,
              backgroundColor: "white",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "#f8fafc" }
            }}
          >
            <Close />
          </IconButton>
          <ConsultationForm />
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
                        mb: 0.8,
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
                        letterSpacing: "0.5px"
                      }}>
                        {therapist.profile_type || "Specialist"}
                      </Typography>
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
