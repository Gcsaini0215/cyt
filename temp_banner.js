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
  BusinessCenter,
  ArrowForward,
  Person,
  SupportAgent,
  CrisisAlert
} from "@mui/icons-material";
// Explicit import for Psychology icon to avoid ReferenceError
import Psychology from "@mui/icons-material/Psychology";

import {
  Grid,
  Paper,
  InputBase,
  Avatar,
  Box,
  Typography,
  IconButton,
  Chip,
  Skeleton
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

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

  if (loading || therapists.length < 3) {
    return (
      <div style={{
        borderRadius: isMobile ? "12px" : "10px",
        border: "2px solid #228756",
        height: isMobile ? "120px" : "100px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ color: "#228756", fontSize: "14px" }}>Loading...</div>
      </div>
    );
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
  const searchTimeoutRef = useRef(null);

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
          paddingTop: isMobile ? "30px" : "40px",
          marginTop: isMobile ? "-50px" : "0px",
          paddingBottom: isMobile ? "0px" : "30px",
          marginBottom: isMobile ? "0px" : "20px",
          backgroundColor: isMobile ? "transparent" : "inherit",
          overflowX: "hidden"
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

      <div className="container mt--20">
        <div className="row justify-content-between align-items-center">
          {/* Banner Text */}
          <div
            className="col-lg-8 col-md-12 col-sm-12 col-12"
            style={{
              display: "flex",
              justifyContent: "flex-start", // left aligned
              textAlign: "left",
              flexDirection: "column",
            }}
          >
            <div className="content">
              <div className="inner">
                {!isMobile && (
                  <div
                    className="rbt-new-badge rbt-new-badge-one"
                    style={{ marginTop: isTablet ? 25 : 0 }}
                  >
                    <span className="rbt-new-badge-icon">
                      <PersonSearchIcon sx={{ color: "#228756", fontSize: 30 }} />
                    </span>{" "}
                    Trusted by People, Powered by Verified Therapists
                  </div>
                )}

                {/* H1 Banner */}
                {!isMobile && (
                  <h1
                    className="title"
                    aria-label="Bharat's Growing Network of Verified Therapists Connecting You to Trusted Counselling Support"
                    style={{
                      fontSize: "4rem",
                      lineHeight: "4.5rem",
                      marginTop: 0,
                      textAlign: "left",
                      wordBreak: "break-word",
                    }}
                  >
                    India's Growing Network of{" "}
                    <span
                      className="theme-gradient"
                      style={{
                        background: "linear-gradient(90deg, #228756, #56ab2f)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Verified Therapists
                    </span>{" "}
                    Connecting You to{" "}
                    <span
                      className="theme-gradient-alt"
                      style={{
                        background: "linear-gradient(90deg, #004e92, #005bea)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Trusted Counselling Support
                    </span>
                  </h1>
                )}

                {isMobile && (
                  <Box sx={{ backgroundColor: "#ffffff", minHeight: "100vh", paddingBottom: "80px" }}>
                    {/* Google-like Banner */}
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 6,
                      px: 2
                    }}>
                      {/* Logo/Brand Text - Smaller */}
                      <Typography sx={{
                        fontSize: "32px",
                        fontWeight: 750,
                        background: "linear-gradient(90deg, #228756 0%, #1d9b5f 40%, #0097ff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 4,
                        textAlign: "center",
                        letterSpacing: "-1px"
                      }}>
                        chooseyourtherapist.in
                      </Typography>

                      {/* Search Box */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                          borderRadius: '28px',
                          border: "1px solid #e8e8e8",
                          backgroundColor: "#fafafa",
                          boxShadow: "0 1px 6px rgba(32, 33, 36, 0.08), inset 0 1px 3px rgba(255, 255, 255, 0.5)",
                          width: "100%",
                          maxWidth: "420px",
                          px: 4,
                          py: 2,
                          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          mb: 1.5,
                          '&:hover': {
                            boxShadow: "0 2px 12px rgba(32, 33, 36, 0.12), inset 0 1px 3px rgba(255, 255, 255, 0.5)",
                            backgroundColor: "#fff"
                          },
                          '&:focus-within': {
                            boxShadow: "0 4px 16px rgba(14, 165, 233, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.5)",
                            border: "1px solid #0ea5e9",
                            backgroundColor: "#fff"
                          }
                        }}
                      >
                        <Search sx={{ color: "#9ca3af", fontSize: 18, flexShrink: 0 }} />
                        <input
                          type="text"
                          placeholder="Search therapists..."
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            debouncedSetSearchQuery(e.target.value);
                          }}
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#1a1a1a',
                            backgroundColor: 'transparent',
                            fontFamily: 'inherit'
                          }}
                          aria-label="Search for therapists"
                        />
                      </Box>

                      {/* Search Description Text */}
                      <Box sx={{ 
                        display: "flex", 
                        gap: 2, 
                        justifyContent: "center",
                        mt: 0.8,
                        mb: 0.5
                      }}>
                        <Typography sx={{ 
                          fontSize: "12px", 
                          color: "#5f5f5f",
                          cursor: "pointer",
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}>
                          Anxiety
                        </Typography>
                        <Typography sx={{ 
                          fontSize: "12px", 
                          color: "#5f5f5f",
                          cursor: "pointer",
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}>
                          Depression
                        </Typography>
                        <Typography sx={{ 
                          fontSize: "12px", 
                          color: "#5f5f5f",
                          cursor: "pointer",
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}>
                          Stress
                        </Typography>
                      </Box>
                    </Box>

                    {/* Top Rated Therapists Section */}
                    <Box sx={{ bgcolor: "white", py: 2, px: 2.5, mt: -0.5, borderRadius: "16px", mx: 2.5, mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", fontSize: "15px", display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Box sx={{ fontSize: "18px" }}>⭐</Box> Top Rated
                        </Typography>
                        <Link to="/view-all-therapist" style={{ color: "#0ea5e9", fontSize: "11px", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>View All <ArrowForward sx={{ fontSize: 13 }} /></Link>
                      </Box>

                      {topTherapistsError ? (
                        <Box sx={{ textAlign: "center", py: 3, px: 3 }}>
                          <Typography sx={{ color: "#666", mb: 1.5, fontSize: "13px" }}>
                            Unable to load therapists
                          </Typography>
                          <Box
                            onClick={retryFetchData}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 2,
                              py: 0.75,
                              bgcolor: "#0ea5e9",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              transition: "all 0.2s ease",
                              '&:hover': {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)"
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            Retry
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", paddingBottom: "4px" }}>
                          {topTherapistsLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                              <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Skeleton variant="circular" width={70} height={70} />
                                <Skeleton variant="text" width={60} height={14} sx={{ mt: 1.2 }} />
                                <Skeleton variant="text" width={50} height={12} sx={{ mt: 0.5 }} />
                              </Box>
                            ))
                          ) : filteredTherapists.length > 0 ? (
                            filteredTherapists.slice(0, 6).map((therapist) => (
                              <Link
                                key={therapist._id}
                                to={`/therapist-checkout/${therapist._id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                              >
                                <Box sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  gap: 0.8,
                                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                  "&:hover": {
                                    transform: "translateY(-6px) scale(1.05)"
                                  }
                                }}>
                                  <Box sx={{
                                    position: "relative",
                                    width: 70,
                                    height: 70
                                  }}>
                                    <Avatar
                                      src={therapist.user?.profile ? `${imagePath}/${therapist.user.profile}` : null}
                                      sx={{
                                        width: 70,
                                        height: 70,
                                        border: "3px solid #0ea5e9",
                                        boxShadow: "0 4px 16px rgba(14, 165, 233, 0.25)",
                                        transition: "all 0.3s ease"
                                      }}
                                    />
                                    <Box sx={{
                                      position: "absolute",
                                      bottom: -4,
                                      right: -4,
                                      bgcolor: "#fff3e0",
                                      border: "3px solid white",
                                      borderRadius: "50%",
                                      width: 26,
                                      height: 26,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "13px",
                                      fontWeight: 700,
                                      color: "#ff6b35",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                                    }}>
                                      <Star sx={{ fontSize: 13 }} />
                                    </Box>
                                  </Box>
                                  <Typography sx={{
                                    fontSize: "13px",
                                    color: "#1a1a1a",
                                    textAlign: "center",
                                    fontWeight: 700,
                                    maxWidth: "70px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}>
                                    {therapist.user?.name?.split(' ')[0] || 'Dr.'}
                                  </Typography>
                                  <Typography sx={{
                                    fontSize: "12px",
                                    color: "#ff6b35",
                                    fontWeight: 700,
                                    textAlign: "center"
                                  }}>
                                    ⭐ 4.9
                                  </Typography>
                                </Box>
                              </Link>
                            ))
                          ) : (
                            <Box sx={{ width: "100%", textAlign: "center", py: 3, gridColumn: "1 / -1" }}>
                              <Typography sx={{ color: "#999", fontSize: "13px" }}>
                                No therapists found matching your search
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <style jsx>{`
                      .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                      }
                      .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                      }
                    `}</style>
                  </Box>
                )}

                {!isMobile && (
                  <>
                    {/* Avatar Section */}
                    <div className="rbt-like-total">
                      <div className="profile-share" style={{ justifyContent: "flex-start" }}>
                        {[ClientImg, Fabiha, counselling1].map((img, i) => (
                          <Link
                            key={i}
                            to="#"
                            className="avatar"
                            data-tooltip={`Verified Psychologist ${i + 1}`}
                            tabIndex="0"
                          >
                            <ImageTag
                              src={img}
                              width={55}
                              height={55}
                              alt={`Certified Psychologist Avatar ${i + 1} - Choose Your Therapist`}
                            />
                          </Link>
                        ))}

                        <div className="more-author-text" style={{ textAlign: "left" }}>
                          <h5 className="total-join-students">
                            Over 5,245+ already on their wellness journey.
                          </h5>
                          <p className="subtitle">Your well-being awaits.</p>
                        </div>
                      </div>
                    </div>

                    {/* Get Started Button */}
                    <div
                      className="slider-btn"
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        marginTop: "20px",
                      }}
                    >
                      <Link
                        className="rbt-btn btn-gradient hover-icon-reverse"
                        to="/view-all-therapist"
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Check Therapist Directory</span>
                          <span className="btn-icon">
                            <ArrowForward />
                          </span>
                          <span className="btn-icon">
                            <ArrowForward />
                          </span>
                        </span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Consultation Form */}
          {!isMobile && (
            <div
              className="col-lg-4 col-md-12 col-sm-12 col-12"
              style={{ marginTop: 20, marginBottom: 30 }}
            >
              <div style={{
                backgroundColor: "white",
                padding: isMobile ? "20px" : "30px",
                borderRadius: "15px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                border: "2px solid #e8f5e8",
                marginBottom: "20px"
              }}>
                <ConsultationForm showHeading={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
