// src/components/banner/index.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  CalendarMonth
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Skeleton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Zoom,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useMediaQuery from "@mui/material/useMediaQuery";

import ImageTag from "../../utils/image-tag";

import ConsultationForm from "./consultation-form";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles, imagePath } from "../../utils/url";
// Therapist avatar images
import ClientImg from "../../assets/img/avatar-027dc8.png";
import Fabiha from "../../assets/img/psychologist.png";
import counselling1 from "../../assets/img/counselling.png";

// Therapist Image Slider Component
const BannerSlider = ({ isMobile }) => {
  const [therapists, setTherapists] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const imageStartTimes = useRef({});

  // Analytics tracking functions
  const trackEvent = (eventName, parameters = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'therapist_slider',
        event_label: 'banner_slider',
        ...parameters
      });
    }
  };

  const trackSliderView = () => {
    trackEvent('slider_view', {
      therapist_count: therapists.length,
      slide_count: Math.ceil(therapists.length / 3)
    });
  };

  const trackImageHover = (therapistId, therapistName) => {
    trackEvent('image_hover', {
      therapist_id: therapistId,
      therapist_name: therapistName
    });
  };

  const trackSlideChange = (newSlideIndex) => {
    trackEvent('slide_change', {
      slide_index: newSlideIndex,
      total_slides: Math.ceil(therapists.length / 3)
    });
  };

  const trackImageLoad = (therapistId, loadTime) => {
    trackEvent('image_load', {
      therapist_id: therapistId,
      load_time_ms: loadTime,
      performance: loadTime < 1000 ? 'fast' : loadTime < 3000 ? 'medium' : 'slow'
    });
  };

  // Fetch therapist data
  useEffect(() => {
    const getTherapists = async () => {
      try {
        const res = await fetchData(getTherapistProfiles);
        if (res && res.status && res.data) {
          // Filter to only show recommended therapists (priority === 1) and limit to 10
          const recommendedTherapists = (res.data || []).filter(therapist => therapist.priority === 1).slice(0, 10);
          setTherapists(recommendedTherapists);
        } else {
          setTherapists([]);
        }
      } catch (error) {
        console.log("Error fetching therapists:", error);
        // Fallback to empty array
        setTherapists([]);
      } finally {
        setLoading(false);
      }
    };

    getTherapists();
  }, []);

  // Auto-rotate slides with smooth animation
  useEffect(() => {
    if (therapists.length >= 3) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => {
          const newSlide = (prev + 1) % Math.ceil(therapists.length / 3);
          trackSlideChange(newSlide);
          return newSlide;
        });
      }, isMobile ? 4000 : 5000); // Faster rotation on mobile for better engagement

      return () => clearInterval(timer);
    }
  }, [therapists.length, isMobile]);

  // Track slider view when component mounts and data loads
  useEffect(() => {
    if (!loading && therapists.length >= 3) {
      trackSliderView();
    }
  }, [loading, therapists.length]);

  if (loading) {
    return (
      <div style={{
        borderRadius: isMobile ? "12px" : "10px",
        border: "2px solid #228756",
        height: isMobile ? "140px" : "130px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ color: "#228756", fontSize: "14px" }}>Loading...</div>
      </div>
    );
  }

  if (therapists.length === 0) {
    return null;
  }

  // Handle image loading states for progressive loading
  const handleImageLoadStart = (therapistId) => {
    imageStartTimes.current[therapistId] = Date.now();
  };

  const handleImageLoad = (therapistId) => {
    const startTime = imageStartTimes.current[therapistId];
    if (startTime) {
      const loadTime = Date.now() - startTime;
      trackImageLoad(therapistId, loadTime);
    }
    setImageLoadingStates(prev => ({
      ...prev,
      [therapistId]: true
    }));
  };

  const handleImageError = (therapistId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [therapistId]: false
    }));
    trackEvent('image_load_error', {
      therapist_id: therapistId
    });
  };

  // Get current 3 therapists for the slide
  const startIndex = currentSlide * 3;
  const currentTherapists = therapists.slice(startIndex, startIndex + 3);

  return (
    <div style={{
      position: "relative",
      borderRadius: isMobile ? "12px" : "15px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(34, 135, 86, 0.15)",
      border: "2px solid #228756",
      height: isMobile ? "140px" : "130px",
      backgroundColor: "white",
      animation: "slideInUp 0.6s ease-out"
    }}>
      {/* Recommended Therapists Ribbon */}
      <div style={{
        position: "absolute",
        top: isMobile ? "15px" : "20px",
        right: "0",
        zIndex: 10,
        background: "linear-gradient(135deg, #36b477ff 0%, #35c06fff 50%, #2c7754ff 100%)",
        color: "#fff",
        padding: isMobile ? "10px 6px" : "12px 8px",
        fontSize: isMobile ? "10px" : "11px",
        fontWeight: "700",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        borderRadius: "0 0 0 20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)",
        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(8px)",
        writingMode: "vertical-rl",
        textOrientation: "mixed"
      }}>
        Recommended
      </div>
      {/* Therapist Images Row with Enhanced Animation */}
      <div style={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        transition: "all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }}>
        {currentTherapists.map((therapist, index) => (
          <div
            key={`${therapist._id || index}-${currentSlide}`}
            style={{
              flex: 1,
              height: "100%",
              position: "relative",
              overflow: "hidden",
              cursor: isMobile ? "default" : "pointer",
              animation: `slideInFromDirection ${isMobile ? 0.6 : 0.8}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * (isMobile ? 0.1 : 0.15)}s both`,
              "--slide-direction": index === 0 ? "left" : index === 1 ? "bottom" : "right"
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {/* Progressive loading blur placeholder */}
              {!imageLoadingStates[therapist._id] && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  borderRadius: "8px",
                  filter: "blur(10px)"
                }} />
              )}

              <ImageTag
                src={`${imagePath}/${therapist.user?.profile || 'default-profile.png'}`}
                alt={therapist.user?.name || 'Therapist'}
                loading="lazy"
                onLoad={() => handleImageLoad(therapist._id)}
                onError={() => handleImageError(therapist._id)}
                onLoadStart={() => handleImageLoadStart(therapist._id)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  filter: imageLoadingStates[therapist._id] ? "brightness(1) contrast(1.05) saturate(1.1)" : "blur(10px) brightness(0.8)",
                  transform: "scale(1)",
                  imageRendering: "auto",
                  opacity: imageLoadingStates[therapist._id] ? 1 : 0.7
                }}
                onMouseOver={isMobile ? undefined : (e) => {
                  if (imageLoadingStates[therapist._id]) {
                    e.target.style.transform = "scale(1.08) rotate(1deg)";
                    e.target.style.filter = "brightness(1.1) contrast(1.1) saturate(1.2)";
                    e.target.style.boxShadow = "0 8px 25px rgba(34, 135, 86, 0.3)";
                    trackImageHover(therapist._id, therapist.user?.name || 'Unknown');
                  }
                }}
                onMouseOut={isMobile ? undefined : (e) => {
                  if (imageLoadingStates[therapist._id]) {
                    e.target.style.transform = "scale(1) rotate(0deg)";
                    e.target.style.filter = "brightness(1) contrast(1.05) saturate(1.1)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>

            {/* Subtle overlay gradient */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, rgba(34, 135, 86, 0.1) 0%, transparent 70%)",
              pointerEvents: "none"
            }}></div>
          </div>
        ))}
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes slideInFromDirection {
          from {
            opacity: 0;
            transform: translateX(var(--slide-direction-left, 0)) translateY(var(--slide-direction-bottom, 0)) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
          }
        }

        /* Direction-specific animations */
        [style*="--slide-direction: left"] {
          --slide-direction-left: -50px;
          --slide-direction-bottom: 0;
        }

        [style*="--slide-direction: bottom"] {
          --slide-direction-left: 0;
          --slide-direction-bottom: 50px;
        }

        [style*="--slide-direction: right"] {
          --slide-direction-left: 50px;
          --slide-direction-bottom: 0;
        }

        /* New mobile banner animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(5px) rotate(-1deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

      `}</style>
    </div>
  );
};

// Marketing Pipeline Component
const MarketingPipeline = ({ isMobile }) => {
  const steps = [
    { icon: <QuestionAnswer sx={{ fontSize: isMobile ? 24 : 30 }} />, title: "Inquiry", desc: "Share your needs" },
    { icon: <CalendarMonth sx={{ fontSize: isMobile ? 24 : 30 }} />, title: "Match", desc: "Find your therapist" },
    { icon: <CheckCircle sx={{ fontSize: isMobile ? 24 : 30 }} />, title: "Connect", desc: "Start your journey" }
  ];

  return (
    <Box sx={{ 
      display: "flex", 
      gap: isMobile ? 3 : 4, 
      mt: isMobile ? 4 : 6, 
      flexDirection: "row",
      justifyContent: isMobile ? "space-around" : "flex-start",
      alignItems: "flex-start",
      width: "100%",
      px: isMobile ? 1 : 0
    }}>
      {steps.map((step, index) => (
        <Box key={index} sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          maxWidth: isMobile ? "80px" : "120px",
          animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`
        }}>
          <Box sx={{ 
            width: isMobile ? 50 : 64, 
            height: isMobile ? 50 : 64, 
            borderRadius: "50%", 
            bgcolor: "white", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "#228756",
            mb: 1.5,
            boxShadow: "0 8px 24px rgba(34, 135, 86, 0.12)",
            border: "2px solid #e8f5e9",
            animation: `soothingFloat ${3 + index}s ease-in-out infinite`,
          }}>
            {step.icon}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#1a1a1a", fontSize: isMobile ? "12px" : "15px", mb: 0.5 }}>{step.title}</Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: isMobile ? "10px" : "12px", lineHeight: 1.2 }}>{step.desc}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default function Banner() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // State for top therapists section
  const [topTherapists, setTopTherapists] = useState([]);
  const [topTherapistsLoading, setTopTherapistsLoading] = useState(true);
  const [topTherapistsError, setTopTherapistsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dynamicFeelingCards, setDynamicFeelingCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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

  // Fetch top therapists data
  const getTopTherapists = useCallback(async () => {
    try {
      const res = await fetchData(getTherapistProfiles);
      if (res && res.status && res.data) {
        // Get all therapists data
        const allTherapists = res.data || [];

        // --- LOGIC TO EXTRACT TOP EXPERTISE ---
        const expertiseCounts = {};
        allTherapists.forEach(therapist => {
          if (therapist.experties) {
            // Split by comma, trim whitespace
            const tags = therapist.experties.split(',').map(t => t.trim());
            tags.forEach(tag => {
              if (tag) {
                expertiseCounts[tag] = (expertiseCounts[tag] || 0) + 1;
              }
            });
          }
        });

        // Sort by count and take top 8
        const sortedExpertise = Object.entries(expertiseCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([label]) => {
            const style = getStyleForExpertise(label);
            return { label, ...style };
          });

        setDynamicFeelingCards(sortedExpertise);
        // --------------------------------------

        // First, get all priority 1 therapists
        const priorityTherapists = allTherapists.filter(therapist => therapist.priority === 1);

        // If we have less than 10 priority therapists, fill with other therapists
        let recommendedTherapists = [...priorityTherapists];

        if (recommendedTherapists.length < 10) {
          const remainingNeeded = 10 - recommendedTherapists.length;
          const otherTherapists = allTherapists.filter(therapist => therapist.priority !== 1).slice(0, remainingNeeded);
          recommendedTherapists = [...recommendedTherapists, ...otherTherapists];
        }

        // Limit to 10 therapists for mobile view
        setTopTherapists(recommendedTherapists.slice(0, 10));
      } else {
        setTopTherapists([]);
      }
    } catch (error) {
      console.log("Error fetching top therapists:", error);
      // Set error state
      setTopTherapistsError(true);
      setTopTherapists([]);
      setDynamicFeelingCards([]);
    } finally {
      setTopTherapistsLoading(false);
    }
  }, []);

  // Retry function for failed data loads
  const retryFetchData = useCallback(() => {
    setTopTherapistsError(false);
    setTopTherapistsLoading(true);
    getTopTherapists();
  }, [getTopTherapists]);

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

  // Fetch top therapists data on mount
  useEffect(() => {
    getTopTherapists();
  }, [getTopTherapists]);

  // Animated placeholder cycling (reduced frequency on mobile for better performance)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, isMobile ? 5000 : 3000); // Slower on mobile

    return () => clearInterval(interval);
  }, [placeholderTexts.length, isMobile]);

  // Filter therapists based on search query
  const filteredTherapists = useMemo(() => {
    return topTherapists.filter((therapist) => {
      const name = therapist.user?.name || "";
      const profileType = therapist.profile_type || "";
      const state = therapist.state || "";
      const query = searchQuery.toLowerCase();
      return name.toLowerCase().includes(query) ||
             profileType.toLowerCase().includes(query) ||
             state.toLowerCase().includes(query);
    });
  }, [topTherapists, searchQuery]);

  return (
      <section
        className="rbt-banner-area rbt-banner-1"
        style={{
          paddingTop: isMobile ? "60px" : "40px",
          marginTop: "0px",
          paddingBottom: isMobile ? "40px" : "30px",
          marginBottom: isMobile ? "0px" : "20px",
          backgroundColor: "inherit",
          overflowX: "hidden",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >

      <Helmet>
        <title>
          India's Growing Network of Verified Therapists Connecting You to Trusted Counselling Support | Choose Your Therapist
        </title>
        <meta
          name="description"
          content="Connect with our trusted network of psychologists in Noida through Choose Your Therapist. Book affordable in-person or online therapy sessions, mental health counseling, and expert support from local psychologists near you."
        />
        <meta
          name="keywords"
          content="Affordable Psychologists, Network of Psychologists, Online Therapy, In-Person Therapy, Mental Health Counseling, Expert Psychologists, Choose Your Therapist, Psychologists in Noida, Local Therapy Noida"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://chooseyourtherapist.in/" />
      </Helmet>

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
                  py: isMobile ? 4 : 4,
                  px: 2,
                  width: "100%",
                  mx: "auto",
                  mt: 0
                }}>
                  {/* Two-line Heading with Split-Text Reveal Animation */}
                  <h1
                    className="title"
                    style={{
                      fontSize: isMobile ? "2.5rem" : isTablet ? "3.2rem" : "4.8rem",
                      lineHeight: isMobile ? "3.2rem" : isTablet ? "3.8rem" : "5.5rem",
                      marginTop: 0,
                      marginBottom: "24px",
                      fontWeight: 900,
                      textAlign: "center",
                      width: "100%",
                      display: "block"
                    }}
                  >
                    Find a <Box component="span" sx={{ 
                      position: 'relative',
                      display: 'inline-block',
                      px: 1
                    }}>
                      <span style={{ 
                        backgroundImage: "linear-gradient(to right, #005bea, #228756)", 
                        WebkitBackgroundClip: "text", 
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        display: "inline"
                      }}>Therapist</span>
                      <svg 
                        viewBox="0 0 100 20" 
                        preserveAspectRatio="none" 
                        style={{ 
                          position: 'absolute', 
                          bottom: isMobile ? '-8px' : '-12px', 
                          left: 0, 
                          width: '100%', 
                          height: '15px', 
                          zIndex: -1 
                        }}
                      >
                        <path 
                          d="M5 15 Q 30 5, 50 15 T 95 15" 
                          stroke="#004e92" 
                          strokeWidth="6" 
                          fill="none" 
                          strokeLinecap="round" 
                          style={{ opacity: 0.3 }}
                        />
                      </svg>
                    </Box> Across India.
                  </h1>

                  {/* Description */}
                  <Typography variant="h6" sx={{ 
                    color: "#000000", 
                    maxWidth: "800px", 
                    margin: "0 auto", 
                    lineHeight: 1.6,
                    fontSize: isMobile ? "18px" : "22px",
                    animation: "fadeInUp 1s ease-out",
                    mb: 4,
                    fontWeight: 500,
                    textAlign: "center"
                  }}>
                    Therapy works when you feel safe, heard, and understood.
                    <br />
                    Discover therapists across India who match your needs and values.
                  </Typography>

                  {/* Banner Buttons */}
                  <Box sx={{ 
                    display: "flex", 
                    gap: 2, 
                    flexWrap: "wrap", 
                    justifyContent: "center",
                    animation: "fadeInUp 1s ease-out 0.2s both",
                    mb: isMobile ? 8 : 10
                  }}>
                    <Button 
                      component={Link}
                      to="/therapists"
                      variant="contained" 
                      sx={{
                        bgcolor: "#228756",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        borderRadius: "50px",
                        fontWeight: 800,
                        textTransform: "none",
                        fontSize: "16px",
                        boxShadow: "0 10px 20px rgba(34, 135, 86, 0.2)",
                        "&:hover": {
                          bgcolor: "#1a6b44",
                          transform: "translateY(-2px)",
                          boxShadow: "0 15px 25px rgba(34, 135, 86, 0.3)"
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Find a Therapist
                    </Button>
                    <Button 
                      component={Link}
                      to="/plans"
                      variant="outlined" 
                      sx={{
                        borderColor: "#228756",
                        color: "#228756",
                        px: 4,
                        py: 1.5,
                        borderRadius: "50px",
                        fontWeight: 800,
                        textTransform: "none",
                        fontSize: "16px",
                        borderWidth: "2px",
                        "&:hover": {
                          borderColor: "#1a6b44",
                          bgcolor: "rgba(34, 135, 86, 0.05)",
                          borderWidth: "2px",
                          transform: "translateY(-2px)"
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Therapy Plans
                    </Button>
                  </Box>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Therapists Full-Width Strip */}
      <Box sx={{ 
        width: "100vw", 
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        bgcolor: "white", 
        py: 1, 
        borderTop: "1px solid #f1f5f9",
        borderBottom: "1px solid #f1f5f9",
        overflow: "hidden",
        zIndex: 2,
        mt: -4
      }}>
        <Box sx={{ 
          display: "flex", 
          width: "max-content",
          animation: "scrollRightToLeft 120s linear infinite",
          "&:hover": { animationPlayState: "paused" }
        }}>
          {[...topTherapists, ...topTherapists, ...topTherapists].map((therapist, i) => (
            <Box key={i} sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 2, 
              mx: 6,
              cursor: "pointer"
            }}>
              <Avatar 
                src={`${imagePath}/${therapist.user?.profile || 'default-profile.png'}`}
                sx={{ 
                  width: 55, 
                  height: 55, 
                  border: "2px solid #f8fafc",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }} 
              />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a", whiteSpace: "nowrap" }}>
                    {therapist.user?.name}
                  </Typography>
                  <CheckCircle sx={{ fontSize: 16, color: "#228756" }} />
                </Box>
                <Typography sx={{ fontSize: "12px", color: "#228756", fontWeight: 700, whiteSpace: "nowrap", textTransform: "capitalize" }}>
                  {therapist.profile_type || "Verified Specialist"}
                </Typography>
                {therapist.state && (
                  <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {therapist.state}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Soft Mist / Gradient Fade Bottom */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: isMobile ? "100px" : "200px",
        background: "linear-gradient(to bottom, rgba(240, 253, 244, 0) 0%, rgba(255, 255, 255, 0.8) 50%, #ffffff 100%)",
        zIndex: 1,
        pointerEvents: "none"
      }}></div>

      {/* Consultation Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        TransitionComponent={Zoom}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 1,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#228756", letterSpacing: "-0.5px" }}>
            Free Consultation
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: "#94a3b8" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <ConsultationForm showHeading={true} />
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes revealText {
          from { transform: translateY(110%); }
          to { transform: translateY(0); }
        }
        @keyframes gradientSwipe {
          0% { background-position: 0% 100%; }
          100% { background-position: 0% -100%; }
        }
        @keyframes soothingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollRightToLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
