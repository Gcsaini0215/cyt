import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

import useMediaQuery from "@mui/material/useMediaQuery";

import ImageTag from "../../utils/image-tag";

import ConsultationForm from "./consultation-form";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles, imagePath } from "../../utils/url";
// Therapist avatar images
const ClientImg = "/assets/img/avatar-027dc8.png";
const Fabiha = "/assets/img/psychologist.png";
const counselling1 = "/assets/img/counselling.png";

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
        if (res && res.data) {
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

  // Handle scroll to update active index for snap-to-center effect
  const containerRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth * (isMobile ? 0.75 : 0.4); // Adjust based on card flex
      const newIndex = Math.round(scrollPosition / cardWidth);
      if (newIndex !== currentSlide) {
        setCurrentSlide(newIndex);
        trackSlideChange(newIndex);
      }
    }
  }, [currentSlide, isMobile, trackSlideChange]);

  // Auto-rotate slides
  useEffect(() => {
    if (therapists.length > 0) {
      const timer = setInterval(() => {
        if (containerRef.current) {
          const container = containerRef.current;
          const cardWidth = container.offsetWidth * (isMobile ? 0.75 : 0.4);
          const nextIndex = (currentSlide + 1) % therapists.length;
          container.scrollTo({
            left: nextIndex * cardWidth,
            behavior: "smooth"
          });
        }
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [therapists.length, currentSlide, isMobile]);

  // Track slider view when component mounts and data loads
  useEffect(() => {
    if (!loading && therapists.length > 0) {
      trackSliderView();
    }
  }, [loading, therapists.length]);

  if (loading) {
    return (
      <div style={{
        borderRadius: isMobile ? "12px" : "10px",
        border: "2px solid #228756",
        height: isMobile ? "160px" : "180px",
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

  return (
    <div style={{
      position: "relative",
      borderRadius: isMobile ? "12px" : "15px",
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(34, 135, 86, 0.12)",
      border: "1.5px solid rgba(34, 135, 86, 0.2)",
      height: isMobile ? "165px" : "190px",
      background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
      animation: "slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      {/* Dynamic Background Circles */}
      <div style={{
        position: "absolute",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34, 135, 86, 0.05) 0%, transparent 70%)",
        top: "-50px",
        left: "-50px",
        zIndex: 0
      }} />

      {/* Recommended Therapists Ribbon */}
      <div style={{
        position: "absolute",
        top: "0",
        right: isMobile ? "10px" : "20px",
        zIndex: 20,
        background: "linear-gradient(180deg, #228756 0%, #10b981 100%)",
        color: "#fff",
        padding: "8px 4px",
        fontSize: "9px",
        fontWeight: "800",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0 0 6px 6px",
        boxShadow: "0 4px 10px rgba(34, 135, 86, 0.2)",
        writingMode: "vertical-rl",
        textOrientation: "mixed",
        textTransform: "uppercase",
        letterSpacing: "1px"
      }}>
        Recommended
      </div>

      {/* Therapist Images Row with Enhanced Animation */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="therapist-scroll-container"
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          padding: isMobile ? "0 15%" : "0 35%", 
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          gap: isMobile ? "12px" : "25px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          zIndex: 5,
          position: "relative"
        }}
      >
        <style>{`
          .therapist-scroll-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {therapists.map((therapist, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={`${therapist._id || index}`}
              style={{
                flex: isMobile ? "0 0 65%" : "0 0 22%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "center",
                transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: isActive ? "scale(1.1) translateY(-5px)" : "scale(0.85)",
                opacity: isActive ? 1 : 0.4,
                zIndex: isActive ? 10 : 1,
              }}
            >
              <div 
                style={{ 
                  position: "relative", 
                  width: isMobile ? "85px" : "105px", 
                  height: isMobile ? "85px" : "105px",
                  borderRadius: "50%",
                  padding: "3px",
                  background: isActive 
                    ? "linear-gradient(135deg, #228756 0%, #3b82f6 100%)" 
                    : "rgba(226, 232, 240, 0.8)",
                  boxShadow: isActive ? "0 8px 25px rgba(34, 135, 86, 0.25)" : "none",
                  transition: "all 0.5s ease"
                }}
              >
                <div style={{ 
                  width: "100%", 
                  height: "100%", 
                  borderRadius: "50%", 
                  overflow: "hidden",
                  backgroundColor: "white",
                  border: "2px solid white",
                  position: "relative"
                }}>
                  <ImageTag
                    src={`${imagePath}/${therapist.user?.profile || 'default-profile.png'}`}
                    alt={therapist.user?.name || 'Therapist'}
                    loading="lazy"
                    onLoad={() => handleImageLoad(therapist._id)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {!isActive && <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "grayscale(50%)"
                  }} />}
                </div>
                
                {/* Verified Pulse Badge */}
                {isActive && (
                  <div style={{
                    position: "absolute",
                    bottom: "5px",
                    right: "5px",
                    zIndex: 15,
                    background: "#228756",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    border: "2.5px solid white",
                    animation: "pulse 2s infinite"
                  }}>
                    <CheckCircle style={{ color: "white", fontSize: "12px" }} />
                  </div>
                )}
              </div>

              {/* Text Info Below Circle */}
              <div style={{ 
                marginTop: "12px", 
                textAlign: "center",
                width: "100%",
                padding: "0 8px",
                opacity: isActive ? 1 : 0.7
              }}>
                <Typography style={{ 
                  color: "#0f172a", 
                  fontSize: isMobile ? "12px" : "14px", 
                  fontWeight: 800,
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "-0.2px"
                }}>
                  {therapist.user?.name}
                </Typography>
                <Typography style={{ 
                  color: isActive ? "#228756" : "#64748b", 
                  fontSize: isMobile ? "9px" : "10px", 
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginTop: "2px"
                }}>
                  {therapist.profile_type?.split(" ")[0] || "Expert"}
                </Typography>
              </div>

              {/* View Profile Link - Only visible when active */}
              {isActive && (
                <Link 
                  to={`/view-profile/${therapist.user?._id}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 11,
                    textDecoration: "none"
                  }}
                >
                  <span className="sr-only">View Profile</span>
                </Link>
              )}
            </div>
          );
        })}
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

        .hover-btn-overlay:hover {
          opacity: 1 !important;
        }

        .therapist-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .therapist-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
  const [googleReviews, setGoogleReviews] = useState({ rating: 4.9, count: 500, loading: true });
  const searchTimeoutRef = useRef(null);

  // Fetch Google Reviews Data
  useEffect(() => {
    const fetchGoogleData = async () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setGoogleReviews(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"]
        });

        const google = await loader.load();
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        // Use the CID to find the place (Search by name + proximity is more reliable client-side)
        // For CID 12001203109189345391, we try to get details if we had a placeId.
        // Since we only have CID, we use a query that typically works for CID lookup
        const request = {
          query: 'Choose Your Therapist', // This should match your exact Google Business name
          fields: ['name', 'rating', 'user_ratings_total'],
        };

        service.findPlaceFromQuery(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            setGoogleReviews({
              rating: results[0].rating || 4.9,
              count: results[0].user_ratings_total || 532,
              loading: false
            });
          } else {
            // If API fails, we use the baseline from your profile
            setGoogleReviews({ rating: 4.9, count: 532, loading: false }); 
          }
        });
      } catch (error) {
        console.error("Error fetching Google Reviews:", error);
        setGoogleReviews(prev => ({ ...prev, loading: false }));
      }
    };

    fetchGoogleData();
  }, []);

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
                  {/* Two-line Heading */}
                    <h1
                    className="title"
                    style={{
                      fontSize: isMobile ? "2.2rem" : isTablet ? "3.2rem" : "4.8rem",
                      lineHeight: isMobile ? "2.4rem" : isTablet ? "3.8rem" : "5.5rem",
                      marginTop: 0,
                      marginBottom: isMobile ? "12px" : "24px",
                      fontWeight: 900,
                      textAlign: "center",
                      width: "100%",
                      display: "block",
                      padding: isMobile ? "0 5px" : "0"
                    }}
                  >
                    Find a <Box component="span" sx={{ 
                      position: 'relative',
                      display: 'inline-block',
                      px: isMobile ? 0.2 : 1,
                      zIndex: 1
                    }}>
                      <span style={{ 
                        backgroundImage: "linear-gradient(135deg, #27ae60 0%, #10b981 50%, #007f99 100%)", 
                        WebkitBackgroundClip: "text", 
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        display: "inline-block",
                        animation: "handDrawnWobble 0.5s ease-in-out infinite alternate"
                      }}>Therapist</span> Across <span style={{
                        backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)", 
                        WebkitBackgroundClip: "text", 
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        display: "inline-block"
                      }}>India</span>.
                    </Box>
                  </h1>

                  {/* Description */}
                  <Typography variant="h6" sx={{ 
                    color: "#444444", 
                    maxWidth: "800px", 
                    margin: "0 auto", 
                    lineHeight: isMobile ? 1.4 : 1.6,
                    fontSize: isMobile ? "15px" : "22px",
                    mb: 3,
                    px: isMobile ? 2 : 0,
                    fontWeight: 500,
                    textAlign: "center",
                    display: "block"
                  }}>
                    Find a qualified psychologist anywhere in India for online or in-person therapy. 
                    {!isMobile && <br />}
                     Explore verified professionals, compare specializations, and book confidential sessions for anxiety, stress, relationships, and emotional well-being.
                  </Typography>

                  {/* Google Reviews One-Liner */}
                  <Box 
                    component="a" 
                    href="https://share.google/oHqh7oihfysiPmGd1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: isMobile ? 1 : 1.5, 
                      mb: 4, 
                      textDecoration: "none",
                      background: "rgba(255, 255, 255, 0.8)",
                      padding: isMobile ? "6px 12px" : "8px 20px",
                      borderRadius: "50px",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.3s ease",
                      maxWidth: "100%",
                      width: "fit-content",
                      flexWrap: "nowrap",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                        borderColor: "#228756"
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                      <Box sx={{ 
                        width: isMobile ? 6 : 8, 
                        height: isMobile ? 6 : 8, 
                        bgcolor: "#228756", 
                        borderRadius: "50%", 
                        animation: "pulse 2s infinite" 
                      }} />
                      {!isMobile && <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#228756", textTransform: "uppercase", letterSpacing: 1 }}>Live</Typography>}
                    </Box>
                    <Box sx={{ width: "1px", height: "15px", bgcolor: "#cbd5e1", flexShrink: 0 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: isMobile ? "14px" : "16px" }}>{googleReviews.rating}/5</Typography>
                      <Box sx={{ display: "flex", color: "#f59e0b" }}>
                        {isMobile ? (
                          <Star sx={{ fontSize: 16 }} />
                        ) : (
                          [...Array(5)].map((_, i) => <Star key={i} sx={{ fontSize: 18 }} />)
                        )}
                      </Box>
                    </Box>
                    <Typography sx={{ color: "#64748b", fontSize: isMobile ? "12px" : "14px", fontWeight: 500, whiteSpace: "nowrap" }}>
                      ({googleReviews.count}+ Reviews)
                    </Typography>
                  </Box>

                  {/* Banner Buttons */}
                  <div className="rbt-button-group justify-content-center" style={{ 
                    display: "flex", 
                    gap: isMobile ? "6px" : "20px", 
                    flexDirection: isMobile ? "column" : "row",
                    width: isMobile ? "100%" : "auto",
                    maxWidth: isMobile ? "320px" : "none",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: isMobile ? "30px" : "60px"
                  }}>
                    <Link
                      className="rbt-btn btn-gradient btn-sm hover-icon-reverse"
                      to="/view-all-therapist"
                      style={{ width: isMobile ? "100%" : "auto", textAlign: "center" }}
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Find a Therapist</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                    <Link
                      className="rbt-btn btn-white btn-sm hover-icon-reverse"
                      to="/therapists"
                      style={{ 
                        width: isMobile ? "100%" : "auto", 
                        textAlign: "center",
                        border: "2px solid #27ae60"
                      }}
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Therapy Plans</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
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
        background: "linear-gradient(to bottom, rgba(240, 253, 244, 0) 0%, rgba(255, 255, 255, 0.4) 50%, #ffffff 100%)",
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
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollRightToLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes doodleScroll {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes growthBloom {
          0% { background-size: 100% 100%; background-position: center; }
          50% { background-size: 150% 150%; background-position: center; }
          100% { background-size: 100% 100%; background-position: center; }
        }
        @keyframes handDrawnWobble {
          0% { transform: rotate(-0.5deg) skewX(-0.5deg); }
          25% { transform: rotate(0.5deg) skewX(0.5deg); }
          50% { transform: rotate(-0.3deg) skewX(-0.3deg); }
          75% { transform: rotate(0.3deg) skewX(0.3deg); }
          100% { transform: rotate(-0.5deg) skewX(-0.5deg); }
        }
      `}</style>
    </section>
  );
}
