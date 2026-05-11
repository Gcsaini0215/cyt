import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {
  Star,
  ArrowForward,
  Close,
  CheckCircle,
  LocationOn,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Dialog,
  Button,
  Zoom,
} from "@mui/material";
import { useRouter } from "next/router";
import { imagePath } from "../../utils/url";

export default function TherapistSwiper({ topTherapists = [] }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mobileQuery.matches);
    const handleChange = (e) => setIsMobile(e.matches);
    mobileQuery.addListener(handleChange);
    return () => mobileQuery.removeListener(handleChange);
  }, []);

  if (!topTherapists || topTherapists.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Therapist Cards Swiper Section */}
      <Box sx={{
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        bgcolor: "transparent",
        py: isMobile ? 2 : 4,
        overflow: "hidden",
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

                {/* Languages Spoken */}
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
                  router.push(`/view-profile/${selectedTherapist._id}`);
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
    </>
  );
}
