import React, { useState, useEffect, useRef } from "react";
import { 
  Thunderstorm, 
  Cloud, 
  Bolt, 
  Favorite, 
  Work, 
  Spa, 
  Psychology, 
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
        if (res.status && res.data) {
          // Filter to only show recommended therapists (priority === 1) and limit to 10
          const recommendedTherapists = (res.data || []).filter(therapist => therapist.priority === 1).slice(0, 10);
          setTherapists(recommendedTherapists);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dynamicFeelingCards, setDynamicFeelingCards] = useState([]);

  // Animated placeholder texts
  const placeholderTexts = [
    "Search by therapist name...",
    "Search by expertise...",
    "Search by state..."
  ];

  // Helper to assign icons and colors based on expertise text
  const getStyleForExpertise = (text) => {
    const lowerText = text.toLowerCase();
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

  // Fetch top therapists data
  useEffect(() => {
    const getTopTherapists = async () => {
      try {
        const res = await fetchData(getTherapistProfiles);
        if (res.status && res.data) {
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
        }
      } catch (error) {
        console.log("Error fetching top therapists:", error);
        // Fallback to empty array
        setTopTherapists([]);
      } finally {
        setTopTherapistsLoading(false);
      }
    };

    getTopTherapists();
  }, []);

  // Animated placeholder cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [placeholderTexts.length]);

  // Filter therapists based on search query
  const filteredTherapists = topTherapists.filter((therapist) => {
    const name = therapist.user?.name || "";
    const profileType = therapist.profile_type || "";
    const state = therapist.state || "";
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) ||
           profileType.toLowerCase().includes(query) ||
           state.toLowerCase().includes(query);
  });

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
                  <div style={{ 
                    backgroundColor: "#f8f9fa", // Light grey background like Practo
                    paddingBottom: "20px",
                    marginBottom: "20px",
                    marginLeft: "-20px",
                    marginRight: "-20px",
                  }}>
                    
                    {/* 1. Top Section: Search Bar (Practo Style) */}
                    <div style={{ 
                      backgroundColor: "white", 
                      padding: "15px 20px 20px 20px",
                      borderBottomLeftRadius: "20px",
                      borderBottomRightRadius: "20px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                        <div>
                          <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                            <BusinessCenter sx={{ color: "#228756", fontSize: 14, marginRight: "5px", verticalAlign: "middle" }} />
                            Online / India
                          </div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a1a" }}>
                            Find your therapist
                          </div>
                        </div>
                        <div style={{ 
                          width: "35px", height: "35px", borderRadius: "50%", 
                          backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" 
                        }}>
                          <Person sx={{ color: "#228756", fontSize: 20 }} />
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: "#f8f9fa", // Input bg
                        borderRadius: "12px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        border: "1px solid #e9ecef"
                      }}>
                        <Search sx={{ color: "#666", fontSize: 22 }} />
                        <input
                          type="text"
                          placeholder="Search for anxiety, depression..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100%",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#333",
                            backgroundColor: "transparent"
                          }}
                        />
                      </div>
                    </div>
                    {/* 2. PROMOTIONAL BANNER SLIDER (Horizontal Scroll) */}
                    <div style={{ padding: "0 20px 20px 20px" }}>
                      <div className="hide-scrollbar" style={{ 
                        display: "flex", 
                        gap: "15px", 
                        overflowX: "auto", 
                        paddingBottom: "5px",
                        scrollSnapType: "x mandatory",
                        scrollPadding: "20px"
                      }}>
                        
                        {/* Banner 1 */}
                        <div style={{ 
                          minWidth: "280px", 
                          height: "140px", 
                          borderRadius: "20px", 
                          background: "linear-gradient(135deg, #228756 0%, #4ade80 100%)", 
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          padding: "20px",
                          boxShadow: "0 8px 20px rgba(34, 135, 86, 0.25)",
                          scrollSnapAlign: "start"
                        }}>
                          <div style={{ position: "relative", zIndex: 2, color: "white" }}>
                            <span style={{ fontSize: "10px", fontWeight: "700", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px" }}>NEW</span>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "8px 0 4px 0", color: "white" }}>15 Minute<br/>Free Consultation</h3>
                            <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>Get matched with the right expert.</p>
                          </div>
                          <div style={{ position: "absolute", right: "-30px", bottom: "-30px", width: "140px", height: "140px", color: "rgba(255,255,255,0.2)" }}>
                            <SupportAgent sx={{ fontSize: 140 }} />
                          </div>
                        </div>

                        {/* Banner 2 */}
                        <div style={{ 
                          minWidth: "280px", 
                          height: "140px", 
                          borderRadius: "20px", 
                          background: "linear-gradient(135deg, #3B82F6 0%, #93C5FD 100%)", 
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          padding: "20px",
                          boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
                          scrollSnapAlign: "start"
                        }}>
                          <div style={{ position: "relative", zIndex: 2, color: "white" }}>
                            <span style={{ fontSize: "10px", fontWeight: "700", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px" }}>POPULAR</span>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "8px 0 4px 0", color: "white" }}>Anxiety<br/>Support</h3>
                            <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>Talk to a verified specialist today.</p>
                          </div>
                          <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "120px", height: "120px", color: "rgba(255,255,255,0.2)" }}>
                            <SelfImprovement sx={{ fontSize: 120 }} />
                          </div>
                        </div>

                        {/* Banner 3 - Panic Attack */}
                        <div style={{ 
                          minWidth: "280px", 
                          height: "140px", 
                          borderRadius: "20px", 
                          background: "linear-gradient(135deg, #EF4444 0%, #FCA5A5 100%)", 
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          padding: "20px",
                          boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)",
                          scrollSnapAlign: "start"
                        }}>
                          <div style={{ position: "relative", zIndex: 2, color: "white" }}>
                            <span style={{ fontSize: "10px", fontWeight: "700", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px" }}>URGENT</span>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "8px 0 4px 0", color: "white" }}>Panic<br/>Attack?</h3>
                            <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>Get immediate help now.</p>
                          </div>
                          <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "120px", height: "120px", color: "rgba(255,255,255,0.2)" }}>
                            <CrisisAlert sx={{ fontSize: 120 }} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 3. CATEGORIES PILLS (Horizontal Scroll) */}
                    <div style={{ padding: "0 20px 20px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>What concerns you?</h3>
                      </div>

                      <div className="hide-scrollbar" style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "5px" }}>
                        {(dynamicFeelingCards.length > 0 ? dynamicFeelingCards : [
                          { icon: <Thunderstorm sx={{ fontSize: 18 }} />, label: "Anxiety", color: "#FFF", border: "#E5E7EB", iconColor: "#228756" }, 
                          { icon: <Cloud sx={{ fontSize: 18 }} />, label: "Depression", color: "#FFF", border: "#E5E7EB", iconColor: "#228756" }, 
                          { icon: <Bolt sx={{ fontSize: 18 }} />, label: "Stress", color: "#FFF", border: "#E5E7EB", iconColor: "#228756" }, 
                          { icon: <Favorite sx={{ fontSize: 18 }} />, label: "Relationships", color: "#FFF", border: "#E5E7EB", iconColor: "#228756" }, 
                          { icon: <Work sx={{ fontSize: 18 }} />, label: "Career", color: "#FFF", border: "#E5E7EB", iconColor: "#228756" }, 
                          { icon: <Spa sx={{ fontSize: 18 }} />, label: "More", color: "#FFF", border: "#E5E7EB", iconColor: "#228756" }
                        ]).map((item, i) => (
                          <div 
                            key={i}
                            onClick={() => setSearchQuery(item.label)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "10px 16px",
                              backgroundColor: searchQuery === item.label ? "#228756" : "white",
                              borderRadius: "30px", // PILL SHAPE
                              border: `1px solid ${searchQuery === item.label ? "#228756" : "#E5E7EB"}`,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ color: searchQuery === item.label ? "white" : item.iconColor, display: "flex" }}>
                              {item.icon}
                            </div>
                            <span style={{ 
                              fontSize: "13px", 
                              fontWeight: "600", 
                              color: searchQuery === item.label ? "white" : "#333"
                            }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>



                    {/* 3. Top Therapists (Horizontal List) */}
                    <div style={{ padding: "10px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>Top Therapists</h3>
                        <Link to="/view-all-therapist" style={{ fontSize: "12px", color: "#228756", fontWeight: "600" }}>View All</Link>
                      </div>

                      <div className="hide-scrollbar" style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "10px" }}>
                        {filteredTherapists.map((therapist) => (
                          <Link 
                            key={therapist._id} 
                            to={`/therapist-checkout/${therapist._id}`}
                            style={{
                              minWidth: "140px",
                              backgroundColor: "white",
                              borderRadius: "12px",
                              padding: "12px",
                              border: "1px solid #f0f0f0",
                              textDecoration: "none",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                            }}
                          >
                            <div style={{ marginBottom: "10px", textAlign: "center" }}>
                                {therapist.user?.profile ? (
                                  <ImageTag 
                                    src={`${imagePath}/${therapist.user.profile}`} 
                                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid #f8f9fa" }} 
                                    alt={therapist.user?.name || "Therapist"}
                                  />
                                ) : (
                                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", margin: "0 auto", border: "2px solid #f8f9fa" }}>
                                    <Person sx={{ color: "#999", fontSize: 30 }} />
                                  </div>
                                )}
                            </div>
                            
                            <div style={{ textAlign: "center" }}>
                              <div style={{ 
                                fontSize: "13px", 
                                fontWeight: "700", 
                                color: "#1a1a1a", 
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis" 
                              }}>
                                {therapist.user?.name ? therapist.user.name : "Therapist"}
                              </div>
                              <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>
                                {therapist.profile_type || 'Counselor'}
                              </div>
                              <div style={{ 
                                fontSize: "10px", 
                                color: "#228756", 
                                background: "#f0fdf4", 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                display: "inline-block",
                                fontWeight: "600",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "3px"
                              }}>
                                <Star sx={{ fontSize: 10, marginRight: "3px", verticalAlign: "middle" }} />
                                4.9 Rating
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <style jsx>{`
                      .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                      }
                      .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                      }
                    `}</style>
                  </div>
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
