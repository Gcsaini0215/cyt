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




export default function Banner() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // State for top therapists section

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dynamicFeelingCards, setDynamicFeelingCards] = useState([]);
  const [topTherapists, setTopTherapists] = useState([]);

  const [topTherapistsLoading, setTopTherapistsLoading] = useState(true);
  const [topTherapistsError, setTopTherapistsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
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

  const handleOpenProfileModal = (therapist) => {
    setSelectedTherapist(therapist);
    setIsProfileModalOpen(true);
  };
  const handleCloseProfileModal = () => setIsProfileModalOpen(false);

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
                  mx: "auto",
                  mt: 0
                }}>
                  {/* Two-line Heading */}
                    <h1
                    className="title"
                    style={{
                      fontSize: isMobile ? "3.2rem" : isTablet ? "3.2rem" : "4.8rem",
                      lineHeight: isMobile ? "3.8rem" : isTablet ? "3.8rem" : "5.5rem",
                      marginTop: 0,
                      marginBottom: isMobile ? "12px" : "24px",
                      fontWeight: 900,
                      textAlign: "center",
                      width: "100%",
                      display: "block",
                      padding: isMobile ? "0 5px" : "0"
                    }}
                  >
                    <Box component="span" sx={{ display: "inline" }}>
                      Find <span style={{ 
                        backgroundImage: "linear-gradient(135deg, #27ae60 0%, #10b981 50%, #007f99 100%)", 
                        WebkitBackgroundClip: "text", 
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        display: "inline-block",
                        animation: "handDrawnWobble 0.5s ease-in-out infinite alternate"
                      }}>Best Therapist</span>
                    </Box>
                    {" "}
                    <Box component="span" sx={{ display: "inline" }}>
                      Across <span style={{
                        backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)", 
                        WebkitBackgroundClip: "text", 
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        display: "inline-block"
                      }}>India</span>
                    </Box>
                  </h1>

                  {/* Description */}
                  <Typography variant="h6" sx={{ 
                    color: "#444444", 
                    maxWidth: isMobile ? "320px" : "800px", 
                    margin: "0 auto", 
                    lineHeight: isMobile ? 1.5 : 1.6,
                    fontSize: isMobile ? "14px" : "22px",
                    mb: isMobile ? 1.5 : 2,
                    px: isMobile ? 1 : 0,
                    fontWeight: 500,
                    textAlign: "center",
                    display: "block"
                  }}>
                    Find a qualified psychologist anywhere in India for online or in-person therapy. 
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
                      mb: 2, 
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
                    maxWidth: isMobile ? "300px" : "none",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: isMobile ? "20px" : "30px"
                  }}>
                    <Link
                      className="rbt-btn btn-gradient btn-sm"
                      to="/view-all-therapist"
                      style={{ 
                        width: isMobile ? "100%" : "220px", 
                        textAlign: "center", 
                        padding: isMobile ? "0 10px" : "0 30px",
                        height: isMobile ? "45px" : "55px",
                        lineHeight: isMobile ? "45px" : "55px",
                        fontSize: isMobile ? "14px" : "16px",
                        fontWeight: 700
                      }}
                    >
                      <span className="btn-text">Find a Therapist</span>
                    </Link>
                    <Link
                      className="rbt-btn btn-white btn-sm"
                      to="/plans"
                      style={{ 
                        width: isMobile ? "100%" : "220px", 
                        textAlign: "center",
                        border: "2px solid #27ae60",
                        padding: isMobile ? "0 10px" : "0 30px",
                        height: isMobile ? "45px" : "55px",
                        lineHeight: isMobile ? "45px" : "55px",
                        fontSize: isMobile ? "14px" : "16px",
                        fontWeight: 700
                      }}
                    >
                      <span className="btn-text">Therapy Plans</span>
                    </Link>
                  </div>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <Box sx={{ 
          display: "flex", 
          width: "max-content",
          animation: "scrollRightToLeft 120s linear infinite",
          "&:hover": { animationPlayState: "paused" }
        }}>
          {[...topTherapists, ...topTherapists, ...topTherapists].map((therapist, i) => (
            <Box 
              key={i} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenProfileModal(therapist);
              }}
              sx={{ 
                display: "flex", 
                flexDirection: "column",
                bgcolor: "white",
                p: isMobile ? 2.5 : 3,
                mx: isMobile ? 2 : 3,
                borderRadius: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                border: "1px solid #f1f5f9",
                minWidth: isMobile ? "260px" : "320px",
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
                <Box sx={{ position: "relative" }}>
                  <Avatar 
                    src={`${imagePath}/${therapist.user?.profile || 'default-profile.png'}`}
                    alt={therapist.user?.name || "Therapist"}
                    sx={{ 
                      width: isMobile ? 70 : 80, 
                      height: isMobile ? 70 : 80, 
                      border: "3px solid #f0fdf4",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                    }} 
                  />
                  <Box sx={{ 
                    position: "absolute", 
                    bottom: 2, 
                    right: 2, 
                    width: isMobile ? 14 : 16, 
                    height: isMobile ? 14 : 16, 
                    bgcolor: "#22c55e", 
                    borderRadius: "50%", 
                    border: "2px solid white" 
                  }} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: isMobile ? "17px" : "19px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
                      {therapist.user?.name}
                    </Typography>
                    <CheckCircle sx={{ fontSize: isMobile ? 18 : 20, color: "#228756" }} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: isMobile ? "13px" : "14px", 
                    color: "#228756", 
                    fontWeight: 700, 
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {therapist.profile_type || "Verified Specialist"}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 0.5,
                  bgcolor: "#f8fafc",
                  px: 1.2,
                  py: 0.6,
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <LocationOn sx={{ fontSize: 14, color: "#228756" }} />
                  <Typography sx={{ fontSize: isMobile ? "11px" : "12px", color: "#64748b", fontWeight: 700 }}>
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

      {/* Therapist Profile Quick View Modal */}
      <Dialog 
        open={isProfileModalOpen} 
        onClose={handleCloseProfileModal}
        TransitionComponent={Zoom}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            p: 0,
            overflow: "hidden"
          }
        }}
      >
        <Box sx={{ position: "relative", pt: 6, pb: 4, px: 3, textAlign: "center", bgcolor: "#f8fafc" }}>
          <IconButton 
            onClick={handleCloseProfileModal} 
            sx={{ position: "absolute", top: 12, right: 12, color: "#94a3b8", bgcolor: "white", "&:hover": { bgcolor: "#f1f5f9" } }}
          >
            <Close />
          </IconButton>
          
          <Avatar 
            src={`${imagePath}/${selectedTherapist?.user?.profile || 'default-profile.png'}`}
            alt={selectedTherapist?.user?.name || "Therapist"}
            sx={{ 
              width: 120, 
              height: 120, 
              mx: "auto", 
              mb: 2, 
              border: "4px solid white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }} 
          />
          
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#1e293b", mb: 0.5 }}>
            {selectedTherapist?.user?.name}
          </Typography>
          <Typography sx={{ color: "#228756", fontWeight: 700, mb: 2, textTransform: "uppercase", fontSize: "14px", letterSpacing: 1 }}>
            {selectedTherapist?.profile_type}
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
            <Box sx={{ bgcolor: "white", px: 2, py: 0.5, borderRadius: "50px", border: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>
                {selectedTherapist?.state || "India"}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: "#f0fdf4", px: 2, py: 0.5, borderRadius: "50px", border: "1px solid #dcfce7" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#228756" }}>
                Verified
              </Typography>
            </Box>
          </Box>
          
          {selectedTherapist?.user?.bio && (
            <Box sx={{ mb: 3, px: 1 }}>
              <Typography sx={{ 
                fontSize: "14px", 
                color: "#64748b", 
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textAlign: "center"
              }}>
                {selectedTherapist.user.bio.replace(/<[^>]*>/g, '')}
              </Typography>
            </Box>
          )}
          
          <Button 
            component={Link}
            to={`/therapist-checkout/${selectedTherapist?.id}`}
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: "#228756", 
              color: "white", 
              py: 1.5, 
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "16px",
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(34, 135, 86, 0.2)",
              "&:hover": { bgcolor: "#1a6b44", transform: "translateY(-2px)" }
            }}
          >
            Book Appointment
          </Button>
        </Box>
      </Dialog>

      <style>{`
        @keyframes orbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulseCenter {
          0% { transform: scale(1); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          50% { transform: scale(1.05); box-shadow: 0 15px 45px rgba(39, 174, 96, 0.15); }
          100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        }
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
