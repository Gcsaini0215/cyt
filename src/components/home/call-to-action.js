import React, { useState } from "react";
import Link from "next/link";
import { Box, Typography, Paper, useMediaQuery, Grid, Chip } from "@mui/material";
import {
  Search,
  SentimentDissatisfied,
  SentimentSatisfied,
  Favorite,
  NightsStay,
  Work,
  Psychology,
  School,
  Groups,
  TrendingUp
} from "@mui/icons-material";

export default function CallToAction() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedConcern, setSelectedConcern] = useState(null);

  const concerns = [
    {
      id: 1,
      Icon: SentimentDissatisfied,
      title: "Anxiety",
      description: "Panic attacks, social anxiety, generalized worry",
      color: "#8B5CF6",
      category: "mental-health",
      therapists: "2,340+",
      bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)"
    },
    {
      id: 2,
      Icon: SentimentSatisfied,
      title: "Depression",
      description: "Persistent sadness, low energy, loss of interest",
      color: "#0EA5E9",
      category: "mental-health",
      therapists: "2,120+",
      bgGradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
    },
    {
      id: 3,
      Icon: Favorite,
      title: "Relationships",
      description: "Couples therapy, communication, breakups",
      color: "#EC4899",
      category: "relationships",
      therapists: "1,890+",
      bgGradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)"
    },
    {
      id: 4,
      Icon: NightsStay,
      title: "Sleep Issues",
      description: "Insomnia, sleep disorders, rest patterns",
      color: "#6366F1",
      category: "wellness",
      therapists: "1,560+",
      bgGradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
    },
    {
      id: 5,
      Icon: Work,
      title: "Work Stress",
      description: "Burnout, career anxiety, workplace issues",
      color: "#F97316",
      category: "professional",
      therapists: "2,650+",
      bgGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
    },
    {
      id: 6,
      Icon: Psychology,
      title: "Trauma & PTSD",
      description: "Past trauma, PTSD recovery, emotional healing",
      color: "#D946EF",
      category: "mental-health",
      therapists: "1,340+",
      bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f5d0ff 100%)"
    },
    {
      id: 7,
      Icon: School,
      title: "Student Issues",
      description: "Academic stress, exam anxiety, peer pressure",
      color: "#06B6D4",
      category: "students",
      therapists: "1,720+",
      bgGradient: "linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)"
    },
    {
      id: 8,
      Icon: Groups,
      title: "Family Counseling",
      description: "Family dynamics, parenting, sibling issues",
      color: "#EF4444",
      category: "relationships",
      therapists: "1,480+",
      bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
    },
    {
      id: 9,
      Icon: TrendingUp,
      title: "Personal Growth",
      description: "Self-improvement, confidence, goal setting",
      color: "#10B981",
      category: "wellness",
      therapists: "2,010+",
      bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
    }
  ];

  const categories = [
    { id: "all", label: "All Concerns" },
    { id: "mental-health", label: "Mental Health" },
    { id: "relationships", label: "Relationships" },
    { id: "professional", label: "Professional" },
    { id: "students", label: "Students" },
    { id: "wellness", label: "Wellness" }
  ];

  const filteredConcerns = concerns.filter((concern) => {
    const matchesCategory = selectedCategory === "all" || concern.category === selectedCategory;
    const matchesSearch = concern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concern.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedConcernData = selectedConcern ? concerns.find(c => c.id === selectedConcern) : null;

  return (
    <div style={{ 
      padding: isMobile ? '60px 20px 80px' : '120px 40px 100px', 
      backgroundColor: '#f7fbf9',
      background: 'linear-gradient(180deg, #f7fbf9 0%, #f0fdf4 100%)',
      position: 'relative',
      overflow: 'hidden'
    }} suppressHydrationWarning>
      {/* Top Curved Diagonal Fade */}
      <svg 
        viewBox="0 0 1200 100" 
        preserveAspectRatio="none" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100px',
          pointerEvents: 'none'
        }}
      >
        <defs>
          <linearGradient id="topFadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(34, 135, 86, 0.15)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(34, 135, 86, 0)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path 
          d="M0,0 L1200,30 L1200,0 Z" 
          fill="url(#topFadeGradient)"
        />
        <path 
          d="M0,5 Q600,25 1200,35 L1200,0 L0,0 Z" 
          fill="rgba(34, 135, 86, 0.08)"
        />
      </svg>
      
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34, 135, 86, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34, 135, 86, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      
      {/* Bottom Curved Diagonal Fade */}
      <svg 
        viewBox="0 0 1200 100" 
        preserveAspectRatio="none" 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          pointerEvents: 'none',
          transform: 'scaleY(-1)'
        }}
      >
        <defs>
          <linearGradient id="bottomFadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(34, 135, 86, 0)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(34, 135, 86, 0.12)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path 
          d="M0,0 L1200,35 L1200,0 Z" 
          fill="url(#bottomFadeGradient)"
        />
        <path 
          d="M0,5 Q600,25 1200,30 L1200,0 L0,0 Z" 
          fill="rgba(34, 135, 86, 0.06)"
        />
      </svg>
      
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: isMobile ? 6 : 8 }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            sx={{
              fontWeight: 900,
              color: "#0f2f1f",
              mb: 2,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #0f2f1f 0%, #228756 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Find Support for Your Concerns
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#556b63",
              maxWidth: "700px",
              mx: "auto",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 500,
              lineHeight: 1.7
            }}
          >
            Browse through common concerns and connect with specialized therapists
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 6,
            px: 4,
            py: 3,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            border: "2px solid #228756",
            boxShadow: "0 8px 24px rgba(34, 135, 86, 0.12)",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "&:hover": {
              boxShadow: "0 12px 32px rgba(34, 135, 86, 0.18)",
              borderColor: "#1a6f47"
            },
            "&:focus-within": {
              boxShadow: "0 12px 32px rgba(34, 135, 86, 0.18)",
              borderColor: "#1a6f47"
            }
          }}
        >
          <Search sx={{ color: "#228756", fontSize: 28, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search concerns, symptoms, or therapy types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "16px",
              fontFamily: "inherit",
              color: "#1a3a32",
              background: "transparent",
              fontWeight: 500,
              letterSpacing: "0.3px"
            }}
          />
        </Box>

        {/* Category Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 6,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedConcern(null);
              }}
              sx={{
                fontSize: "13px",
                fontWeight: selectedCategory === cat.id ? 700 : 600,
                px: 1.5,
                height: "40px",
                backgroundColor: selectedCategory === cat.id ? "#228756" : "#f0fdf4",
                color: selectedCategory === cat.id ? "white" : "#228756",
                border: selectedCategory === cat.id ? "2px solid #228756" : "2px solid #e0e7ff",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  backgroundColor: selectedCategory === cat.id ? "#1a6f47" : "#dcfce7",
                  transform: "translateY(-2px)"
                }
              }}
            />
          ))}
        </Box>

        {/* Concerns Grid - Glassmorphism Design */}
        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          {filteredConcerns.map((concern) => (
            <Grid item xs={12} sm={6} md={4} key={concern.id}>
              <Box
                onClick={() => setSelectedConcern(concern.id)}
                sx={{
                  p: 3,
                  borderRadius: "24px",
                  background: selectedConcern === concern.id 
                    ? `linear-gradient(135deg, ${concern.color}12 0%, ${concern.color}03 100%)`
                    : "#ffffff",
                  border: `2px solid ${selectedConcern === concern.id ? concern.color : "#e5e7eb"}`,
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  transform: selectedConcern === concern.id ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: selectedConcern === concern.id 
                    ? `0 20px 40px ${concern.color}20`
                    : "0 4px 12px rgba(0, 0, 0, 0.06)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: selectedConcern === concern.id 
                      ? `radial-gradient(circle at 100% 0%, ${concern.color}08 0%, transparent 50%)`
                      : "transparent",
                    pointerEvents: "none"
                  },
                  "&:hover": {
                    transform: selectedConcern === concern.id ? "translateY(-8px)" : "translateY(-4px)",
                    boxShadow: selectedConcern === concern.id 
                      ? `0 24px 48px ${concern.color}20`
                      : "0 8px 20px rgba(0, 0, 0, 0.1)",
                    border: `2px solid ${selectedConcern === concern.id ? concern.color : concern.color}30`
                  }
                }}
              >
                <Box 
                  sx={{ 
                    position: "relative",
                    zIndex: 1,
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '18px',
                    background: selectedConcern === concern.id
                      ? `linear-gradient(135deg, ${concern.color}25 0%, ${concern.color}10 100%)`
                      : `linear-gradient(135deg, ${concern.color}12 0%, ${concern.color}03 100%)`,
                    border: `2px solid ${concern.color}25`,
                    boxShadow: `0 8px 16px ${concern.color}12`,
                  }}
                >
                  <concern.Icon 
                    sx={{ 
                      fontSize: 44,
                      background: `linear-gradient(135deg, ${concern.color} 0%, ${concern.color}dd 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }} 
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: concern.color,
                    mb: 1,
                    position: "relative",
                    zIndex: 1
                  }}
                >
                  {concern.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#556b63",
                    lineHeight: 1.6,
                    mb: 3,
                    flex: 1,
                    position: "relative",
                    zIndex: 1
                  }}
                >
                  {concern.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pt: 2.5,
                    borderTop: `1px solid ${concern.color}15`,
                    position: "relative",
                    zIndex: 1
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: concern.color,
                      letterSpacing: "0.5px"
                    }}
                  >
                    {concern.therapists}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: 600
                    }}
                  >
                    Specialists
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {filteredConcerns.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: "18px", color: "#64748b", mb: 2 }}>
              No concerns found matching your search.
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#94a3b8" }}>
              Try adjusting your search or exploring other categories.
            </Typography>
          </Box>
        )}

        {/* Selected Concern Details */}
        {selectedConcernData && (
          <Paper
            elevation={0}
            sx={{
              background: selectedConcernData.bgGradient,
              p: isMobile ? 4 : 6,
              borderRadius: "24px",
              border: `2px solid ${selectedConcernData.color}`,
              mb: 4,
              animation: "fadeInUp 0.4s ease-out"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 3 }}>
              <Box 
                sx={{ 
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${selectedConcernData.color}20 0%, ${selectedConcernData.color}05 100%)`,
                  border: `2px solid ${selectedConcernData.color}30`,
                  flexShrink: 0
                }}
              >
                <selectedConcernData.Icon 
                  sx={{ 
                    fontSize: 56,
                    background: `linear-gradient(135deg, ${selectedConcernData.color} 0%, ${selectedConcernData.color}cc 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }} 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: isMobile ? "24px" : "32px",
                    fontWeight: 800,
                    color: selectedConcernData.color,
                    mb: 1
                  }}
                >
                  {selectedConcernData.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                    color: "#475569",
                    fontWeight: 500
                  }}
                >
                  {selectedConcernData.description}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "space-between",
                alignItems: "center",
                pt: 3,
                borderTop: `2px solid ${selectedConcernData.color}20`,
                flexWrap: isMobile ? "wrap" : "nowrap"
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600, mb: 1 }}>
                  AVAILABLE THERAPISTS
                </Typography>
                <Typography
                  sx={{
                    fontSize: isMobile ? "24px" : "32px",
                    fontWeight: 800,
                    color: selectedConcernData.color
                  }}
                >
                  {selectedConcernData.therapists}
                </Typography>
              </Box>

              <Link href="/view-all-therapist" style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    px: isMobile ? 4 : 6,
                    py: 2,
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${selectedConcernData.color} 0%, ${selectedConcernData.color}dd 100%)`,
                    color: "white",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    boxShadow: `0 4px 15px ${selectedConcernData.color}30`,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: `0 12px 30px ${selectedConcernData.color}40`
                    }
                  }}
                >
                  Find Specialists
                </Box>
              </Link>
            </Box>
          </Paper>
        )}

        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: isMobile ? "14px" : "16px",
              color: "#556b63",
              fontStyle: "italic"
            }}
          >
            All our therapists are verified specialists in their areas of expertise
          </Typography>
        </Box>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
