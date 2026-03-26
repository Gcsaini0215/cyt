import React from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  LocationOn,
  ArrowForward,
  Star,
  Language,
  Work,
} from "@mui/icons-material";
import Link from "next/link";
import { imagePath } from "../../utils/url";

export default function ProfilePopup({ open, onClose, therapist }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!therapist) return null;

  // Calculate rating
  const reviews = therapist.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1)
    : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "28px",
          p: 0,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <Box sx={{ position: "relative", pt: isMobile ? 4 : 6, pb: 4, px: isMobile ? 2 : 4, textAlign: "center", bgcolor: "#f8fafc" }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#94a3b8",
            bgcolor: "white",
            "&:hover": { bgcolor: "#f1f5f9" },
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
          <Avatar
            src={`${imagePath}/${therapist.user?.profile || "default-profile.png"}`}
            alt={therapist.user?.name || "Therapist"}
            sx={{
              width: isMobile ? 100 : 120,
              height: isMobile ? 100 : 120,
              mx: "auto",
              border: "4px solid white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: "#22c55e",
              borderRadius: "50%",
              border: "3px solid white",
              p: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
            }}
          >
            <CheckCircle sx={{ fontSize: 16, color: "white" }} />
          </Box>
        </Box>

        <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 900, color: "#1e293b", mb: 0.5 }}>
          {therapist.user?.name}
        </Typography>
        
        <Typography
          sx={{
            color: "#228756",
            fontWeight: 700,
            mb: 1.5,
            textTransform: "uppercase",
            fontSize: isMobile ? "12px" : "14px",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5
          }}
        >
          {therapist.profile_type}
        </Typography>

        {reviewCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 2 }}>
            <Box sx={{ display: "flex", color: "#ffb400" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} sx={{ fontSize: 16, color: i < Math.floor(averageRating) ? "#ffb400" : "#e2e8f0" }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", ml: 0.5 }}>
              {averageRating}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#64748b" }}>
              ({reviewCount} reviews)
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Box sx={{ bgcolor: "white", px: 1.5, py: 0.5, borderRadius: "50px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 14, color: "#64748b" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>
              {therapist.state || "India"}
            </Typography>
          </Box>
          {therapist.year_of_exp && (
            <Box sx={{ bgcolor: "white", px: 1.5, py: 0.5, borderRadius: "50px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 0.5 }}>
              <Work sx={{ fontSize: 14, color: "#64748b" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>
                {therapist.year_of_exp} Exp
              </Typography>
            </Box>
          )}
          <Box sx={{ bgcolor: "#f0fdf4", px: 1.5, py: 0.5, borderRadius: "50px", border: "1px solid #dcfce7", display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckCircle sx={{ fontSize: 14, color: "#228756" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#228756" }}>
              Verified
            </Typography>
          </Box>
        </Box>

        {therapist.language_spoken && (
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
            <Language sx={{ fontSize: 16, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
              Speaks: {therapist.language_spoken}
            </Typography>
          </Box>
        )}

        {therapist.user?.bio && (
          <Box sx={{ mb: 4, px: isMobile ? 1 : 2 }}>
            <Typography
              sx={{
                fontSize: "14px",
                color: "#475569",
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textAlign: "center",
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {therapist.user.bio.replace(/<[^>]*>/g, "")}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
          <Button
            component={Link}
            href={`/view-profile/${therapist._id}`}
            variant="outlined"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "15px",
              textTransform: "none",
              color: "#475569",
              borderColor: "#e2e8f0",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}
          >
            View Full Profile
          </Button>
          <Button
            component={Link}
            href={`/therapist-checkout/${therapist._id}`}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#228756",
              color: "white",
              py: 1.5,
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "15px",
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(34, 135, 86, 0.2)",
              "&:hover": { bgcolor: "#1a6b44", transform: "translateY(-2px)" },
            }}
          >
            Book Session
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
