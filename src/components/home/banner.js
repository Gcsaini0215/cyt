import React, { useState, useEffect, useRef } from "react";
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

  // Animated placeholder texts
  const placeholderTexts = [
    "Search by therapist name...",
    "Search by expertise...",
    "Search by state..."
  ];

  // Fetch top therapists data
  useEffect(() => {
    const getTopTherapists = async () => {
      try {
        const res = await fetchData(getTherapistProfiles);
        if (res.status && res.data) {
          // Get all therapists data
          const allTherapists = res.data || [];

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
                  <>
                    {/* Modern Therapist-Focused Mobile Banner */}
                    <div style={{
                      background: "linear-gradient(135deg, #228756 0%, #36b477 30%, #4ecdc4 60%, #ffffff 100%)",
                      borderRadius: "0 0 32px 32px",
                      padding: isMobile ? "16px 20px" : "24px",
                      margin: "0 -20px 0 -20px",
                      boxShadow: "none",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: isMobile ? "280px" : "320px"
                    }}>
                      {/* Soft Rounded Shapes Background */}
                      <div style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-30px",
                        width: "150px",
                        height: "150px",
                        borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                        background: "rgba(255, 255, 255, 0.08)",
                        filter: "blur(25px)",
                        animation: "float 6s ease-in-out infinite"
                      }}></div>
                      <div style={{
                        position: "absolute",
                        bottom: "-60px",
                        left: "-40px",
                        width: "180px",
                        height: "180px",
                        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                        background: "rgba(255, 255, 255, 0.1)",
                        filter: "blur(30px)",
                        animation: "float 8s ease-in-out infinite reverse"
                      }}></div>
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        right: "-60px",
                        width: "120px",
                        height: "120px",
                        borderRadius: "50% 40% 60% 30% / 60% 50% 30% 40%",
                        background: "rgba(255, 255, 255, 0.06)",
                        filter: "blur(20px)",
                        animation: "float 7s ease-in-out infinite"
                      }}></div>

                      {/* Main content */}
                      <div style={{
                        textAlign: "center",
                        marginBottom: "24px",
                        position: "relative",
                        zIndex: 2,
                        marginTop: "20px"
                      }}>
                        <h1 style={{
                          fontSize: isMobile ? "clamp(1.8rem, 10vw, 2.5rem)" : "clamp(2.8rem, 12vw, 3.5rem)",
                          fontWeight: "900",
                          color: "white",
                          marginBottom: "12px",
                          lineHeight: isMobile ? "1.1" : "1.05",
                          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          letterSpacing: "-0.03em",
                          animation: "fadeInUp 0.8s ease-out",
                          whiteSpace: isMobile ? "nowrap" : "normal",
                          overflow: isMobile ? "hidden" : "visible",
                          textOverflow: isMobile ? "ellipsis" : "clip"
                        }}>
                          Find Your Best Therapist
                        </h1>

                        <p style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: isMobile ? "12px" : "14px",
                          fontWeight: "400",
                          margin: isMobile ? "0 0 8px 0" : "0 0 16px 0",
                          lineHeight: "1.4",
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          animation: "fadeInUp 0.8s ease-out 0.15s both"
                        }}>
                          We provide affordable therapists<br />with a free follow-up session for added support.
                        </p>

                        <p style={{
                          color: "rgba(255,255,255,0.95)",
                          fontSize: isMobile ? "15px" : "18px",
                          fontWeight: "500",
                          margin: isMobile ? "0 0 12px 0" : "0 0 20px 0",
                          lineHeight: "1.3",
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          animation: "fadeInUp 0.8s ease-out 0.3s both"
                        }}>
                           <span style={{ fontWeight: "700", color: "#FFE259" }}>Starting from ₹500/session</span>
                        </p>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: isMobile ? "10px" : "16px",
                        marginBottom: isMobile ? "12px" : "20px",
                        position: "relative",
                        zIndex: 2
                      }}>
                        <div style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(225, 242, 251, 0.98) 100%)",
                          borderRadius: "24px",
                          padding: isMobile ? "12px 10px" : "20px 16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: isMobile ? "8px" : "12px",
                          boxShadow: "0 8px 32px rgba(52, 152, 219, 0.15), 0 2px 8px rgba(52, 152, 219, 0.1)",
                          transition: "all 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
                          border: "2px solid rgba(52, 152, 219, 0.2)",
                          backdropFilter: "blur(20px)",
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 16px 48px rgba(52, 152, 219, 0.25), 0 6px 20px rgba(52, 152, 219, 0.2)";
                          e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(52, 152, 219, 0.15), 0 2px 8px rgba(52, 152, 219, 0.1)";
                          e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.2)";
                        }}>
                          <div style={{
                            position: "absolute",
                            top: "-25px",
                            right: "-25px",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)",
                            filter: "blur(15px)"
                          }}></div>
                          <div style={{
                            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                            borderRadius: "20px",
                            width: "56px",
                            height: "56px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(52, 152, 219, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                            position: "relative",
                            zIndex: 1,
                            border: "2px solid rgba(255,255,255,0.3)"
                          }}>
                            <i className="feather-phone" style={{
                              color: "white",
                              fontSize: "24px",
                              fontWeight: "bold"
                            }}></i>
                          </div>
                          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                            <div style={{
                              fontSize: "13px",
                              fontWeight: "900",
                              color: "#1a1a1a",
                              marginBottom: "4px",
                              letterSpacing: "-0.5px"
                            }}>
                              Free Consultation
                            </div>
                            <div style={{
                              fontSize: "10px",
                              color: "#3498db",
                              fontWeight: "700",
                              background: "linear-gradient(135deg, rgba(52, 152, 219, 0.12) 0%, rgba(41, 128, 185, 0.08) 100%)",
                              borderRadius: "8px",
                              padding: "4px 8px",
                              display: "inline-block",
                              border: "1px solid rgba(52, 152, 219, 0.2)"
                            }}>
                              15 min call
                            </div>
                          </div>
                        </div>

                        <div style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240, 248, 245, 0.98) 100%)",
                          borderRadius: "24px",
                          padding: isMobile ? "12px 10px" : "20px 16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: isMobile ? "8px" : "12px",
                          boxShadow: "0 8px 32px rgba(30, 125, 78, 0.15), 0 2px 8px rgba(30, 125, 78, 0.1)",
                          transition: "all 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
                          border: "2px solid rgba(30, 125, 78, 0.2)",
                          backdropFilter: "blur(20px)",
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 16px 48px rgba(30, 125, 78, 0.25), 0 6px 20px rgba(30, 125, 78, 0.2)";
                          e.currentTarget.style.borderColor = "rgba(30, 125, 78, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(30, 125, 78, 0.15), 0 2px 8px rgba(30, 125, 78, 0.1)";
                          e.currentTarget.style.borderColor = "rgba(30, 125, 78, 0.2)";
                        }}>
                          <div style={{
                            position: "absolute",
                            top: "-25px",
                            right: "-25px",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(34, 135, 86, 0.1) 0%, transparent 70%)",
                            filter: "blur(15px)"
                          }}></div>
                          <div style={{
                            background: "linear-gradient(135deg, #1e7d4e 0%, #228756 100%)",
                            borderRadius: "20px",
                            width: "56px",
                            height: "56px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(30, 125, 78, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                            position: "relative",
                            zIndex: 1,
                            border: "2px solid rgba(255,255,255,0.3)"
                          }}>
                            <i className="feather-users" style={{
                              color: "white",
                              fontSize: "24px",
                              fontWeight: "bold"
                            }}></i>
                          </div>
                          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                            <div style={{
                              fontSize: "13px",
                              fontWeight: "900",
                              color: "#1a1a1a",
                              marginBottom: "4px",
                              letterSpacing: "-0.5px"
                            }}>
                              Therapists
                            </div>
                            <div style={{
                              fontSize: "10px",
                              color: "#1e7d4e",
                              fontWeight: "700",
                              background: "linear-gradient(135deg, rgba(30, 125, 78, 0.12) 0%, rgba(34, 135, 86, 0.08) 100%)",
                              borderRadius: "8px",
                              padding: "4px 8px",
                              display: "inline-block",
                              border: "1px solid rgba(30, 125, 78, 0.2)"
                            }}>
                              500+ verified
                            </div>
                          </div>
                        </div>

                        <div style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240, 248, 245, 0.98) 100%)",
                          borderRadius: "24px",
                          padding: isMobile ? "12px 10px" : "20px 16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: isMobile ? "8px" : "12px",
                          boxShadow: "0 8px 32px rgba(39, 174, 96, 0.15), 0 2px 8px rgba(39, 174, 96, 0.1)",
                          transition: "all 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
                          border: "2px solid rgba(39, 174, 96, 0.2)",
                          backdropFilter: "blur(20px)",
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 16px 48px rgba(39, 174, 96, 0.25), 0 6px 20px rgba(39, 174, 96, 0.2)";
                          e.currentTarget.style.borderColor = "rgba(39, 174, 96, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(39, 174, 96, 0.15), 0 2px 8px rgba(39, 174, 96, 0.1)";
                          e.currentTarget.style.borderColor = "rgba(39, 174, 96, 0.2)";
                        }}>
                          <div style={{
                            position: "absolute",
                            top: "-25px",
                            right: "-25px",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(39, 174, 96, 0.1) 0%, transparent 70%)",
                            filter: "blur(15px)"
                          }}></div>
                          <div style={{
                            background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                            borderRadius: "20px",
                            width: "56px",
                            height: "56px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(39, 174, 96, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                            position: "relative",
                            zIndex: 1,
                            border: "2px solid rgba(255,255,255,0.3)"
                          }}>
                            <i className="feather-heart" style={{
                              color: "white",
                              fontSize: "24px",
                              fontWeight: "bold"
                            }}></i>
                          </div>
                          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                            <div style={{
                              fontSize: "13px",
                              fontWeight: "900",
                              color: "#1a1a1a",
                              marginBottom: "4px",
                              letterSpacing: "-0.5px"
                            }}>
                              Community
                            </div>
                            <div style={{
                              fontSize: "10px",
                              color: "#27ae60",
                              fontWeight: "700",
                              background: "linear-gradient(135deg, rgba(39, 174, 96, 0.12) 0%, rgba(46, 204, 113, 0.08) 100%)",
                              borderRadius: "8px",
                              padding: "4px 8px",
                              display: "inline-block",
                              border: "1px solid rgba(39, 174, 96, 0.2)"
                            }}>
                              Connect & Share
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div style={{
                        backgroundColor: "rgba(255,255,255,0.98)",
                        borderRadius: "20px",
                        padding: "16px 20px",
                        marginBottom: "24px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(34, 135, 86, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        border: "2px solid rgba(34, 135, 86, 0.1)",
                        backdropFilter: "blur(15px)",
                        position: "relative",
                        zIndex: 2
                      }}>
                        <div style={{
                          backgroundColor: "#228756",
                          borderRadius: "12px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 3px 10px rgba(34, 135, 86, 0.3)",
                          flexShrink: 0
                        }}>
                          <i className="feather-search" style={{
                            color: "white",
                            fontSize: "16px"
                          }}></i>
                        </div>
                        <input
                          type="text"
                          placeholder={placeholderTexts[placeholderIndex]}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            border: "none",
                            outline: "none",
                            flex: 1,
                            fontSize: "16px",
                            color: "#333",
                            background: "transparent",
                            fontWeight: "500",
                            placeholder: "#888",
                            fontFamily: "inherit",
                            whiteSpace: "nowrap"
                          }}
                        />
                        <div style={{
                          background: "linear-gradient(135deg, #228756 0%, #36b477 100%)",
                          borderRadius: "14px",
                          padding: "10px 18px",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(34, 135, 86, 0.4)",
                          transition: "all 0.2s ease",
                          border: "1px solid rgba(255,255,255,0.2)",
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 6px 18px rgba(34, 135, 86, 0.5)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 4px 14px rgba(34, 135, 86, 0.4)";
                        }}>
                          Search
                        </div>
                      </div>






                     

                      {/* Horizontal Scrollable Therapist Cards */}
                      <div style={{
                        display: "flex",
                        gap: "12px",
                        overflowX: "auto",
                        paddingBottom: "8px",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                        marginTop: "8px",
                        marginBottom: "24px",
                        paddingLeft: "0",
                        paddingRight: "0"
                      }}
                      className="hide-scrollbar">
                        {/* Therapist Cards */}
                        {topTherapistsLoading ? (
                          // Loading skeleton
                          Array.from({ length: 10 }).map((_, index) => (
                            <div
                              key={index}
                              style={{
                                minWidth: "calc(50% - 6px)",
                                backgroundColor: "white",
                                borderRadius: "16px",
                                padding: "16px",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                border: "1px solid #f0f0f0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px"
                              }}
                            >
                              <div style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                backgroundColor: "#f0f0f0",
                                animation: "shimmer 1.5s infinite"
                              }} />
                              <div style={{ textAlign: "center", width: "100%" }}>
                                <div style={{
                                  height: "14px",
                                  backgroundColor: "#f0f0f0",
                                  marginBottom: "4px",
                                  borderRadius: "4px",
                                  animation: "shimmer 1.5s infinite"
                                }} />
                                <div style={{
                                  height: "12px",
                                  backgroundColor: "#f0f0f0",
                                  marginBottom: "4px",
                                  borderRadius: "4px",
                                  animation: "shimmer 1.5s infinite"
                                }} />
                              </div>
                            </div>
                          ))
                        ) : filteredTherapists.length > 0 ? (
                          filteredTherapists.map((therapist, index) => (
                            <Link
                              key={therapist._id}
                              to={`/therapist-checkout/${therapist._id}`}
                              style={{
                                minWidth: "calc(50% - 6px)",
                                backgroundColor: "rgba(255,255,255,0.98)",
                                borderRadius: "20px",
                                padding: "18px 16px",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.1), 0 2px 8px rgba(34, 135, 86, 0.08)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                textDecoration: "none",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                backdropFilter: "blur(10px)",
                                position: "relative",
                                overflow: "hidden",

                              }}

                            >
                              {/* Decorative background element */}
                              <div style={{
                                position: "absolute",
                                top: "-25px",
                                right: "-25px",
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, rgba(34, 135, 86, 0.08) 0%, rgba(54, 180, 119, 0.08) 100%)",
                                filter: "blur(12px)"
                              }}></div>
                              <div style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                boxShadow: "0 4px 16px rgba(34, 135, 86, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                                position: "relative",
                                zIndex: 1
                              }}>
                                {therapist.user?.profile ? (
                                  <ImageTag
                                    src={`${imagePath}/${therapist.user.profile}`}
                                    alt={therapist.user?.name || 'Therapist'}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover"
                                    }}
                                  />
                                ) : (
                                  <i className="feather-user" style={{
                                    color: "#228756",
                                    fontSize: "24px"
                                  }}></i>
                                )}
                              </div>
                              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                                <div style={{
                                  fontSize: "14px",
                                  fontWeight: "800",
                                  color: "#333",
                                  marginBottom: "4px",
                                  maxWidth: "130px",
                                  lineHeight: "1.2",
                                  wordBreak: "break-word",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                  cursor: "default",
                                  userSelect: "none"
                                }}>
                                  {therapist.user?.name || 'Therapist'}
                                </div>
                                <div style={{
                                  fontSize: "12px",
                                  color: "#228756",
                                  marginBottom: "4px",
                                  fontWeight: "600",
                                  cursor: "default",
                                  userSelect: "none",
                                  lineHeight: "1.3",
                                  wordBreak: "break-word",
                                  maxWidth: "130px"
                                }}>
                                  {therapist.profile_type || 'Counselor'}
                                </div>
                                <div style={{
                                  fontSize: "11px",
                                  color: "#666",
                                  fontWeight: "500",
                                  cursor: "default",
                                  userSelect: "none",
                                  lineHeight: "1.2",
                                  wordBreak: "break-word",
                                  maxWidth: "130px"
                                }}>
                                  ({therapist.state || 'Location not specified'})
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          // No therapists available
                          <div style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "white",
                            fontSize: "14px"
                          }}>
                            {searchQuery ? "No therapists found matching your search" : "No therapists available"}
                          </div>
                        )}
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

                  </>
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
                            <i className="feather-arrow-right"></i>
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
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
