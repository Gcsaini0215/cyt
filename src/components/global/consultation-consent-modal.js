import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Schedule from "@mui/icons-material/Schedule";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Lock from "@mui/icons-material/Lock";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import SupervisorAccount from "@mui/icons-material/SupervisorAccount";
import ConsultPaymentForm from "./consult-payment-form";

const INFO_POINTS = [
  { icon: SupervisorAccount, text: "Call handled by a supervised trainee psychologist from our team" },
  { icon: Lock, text: "Confidential & judgment-free conversation" },
  { icon: FavoriteBorder, text: "Helps us match you with the right-fit therapist" },
  { icon: CheckCircle, text: "Just ₹99 for 15 minutes, no long-term commitment" },
];

export default function ConsultationConsentModal({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [step, setStep] = React.useState("info");
  const [agreed, setAgreed] = React.useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("info");
      setAgreed(false);
    }, 200);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Zoom}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(5,20,35,0.55)",
            backdropFilter: "blur(6px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "28px",
          p: 0,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <Box sx={{ position: "relative", px: isMobile ? 2 : 4, pt: isMobile ? 5 : 4, pb: 1 }}>
        {step === "form" && (
          <IconButton
            onClick={() => setStep("info")}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              color: "#94a3b8",
              bgcolor: "white",
              "&:hover": { bgcolor: "#f1f5f9" },
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <ArrowBack />
          </IconButton>
        )}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#94a3b8",
            bgcolor: "white",
            "&:hover": { bgcolor: "#f1f5f9" },
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {step === "info" ? (
        <DialogContent sx={{ px: isMobile ? 2 : 4, pb: isMobile ? 3 : 4, pt: 0 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#eaf6ff",
                border: "1px solid #bfe1f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Schedule sx={{ fontSize: 30, color: "#0f4c74" }} />
            </Box>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 900, color: "#1e293b" }}>
              15-Minute Consultation — ₹99
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 3 }}>
            {INFO_POINTS.map(({ icon: Icon, text }, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  px: 2,
                  py: 1.25,
                }}
              >
                <Icon sx={{ fontSize: 18, color: "#0f4c74", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>{text}</Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.25,
              mb: 2.5,
              px: 1.5,
              py: 1.25,
              bgcolor: "#eaf6ff",
              border: "1px solid #bfe1f5",
              borderRadius: "10px",
            }}
          >
            <input
              type="checkbox"
              id="ccm-consent"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0, accentColor: "#0f4c74", width: 15, height: 15, cursor: "pointer" }}
            />
            <label htmlFor="ccm-consent" style={{ fontSize: 12, color: "#475569", lineHeight: 1.55, cursor: "pointer" }}>
              I understand this is a paid (₹99), brief screening call and not a substitute for therapy, and I
              consent to being contacted by Choose Your Therapist regarding my request. See our{" "}
              <a href="/privacy-policy" style={{ color: "#0f4c74", fontWeight: 600, textDecoration: "none" }}>
                Privacy Policy
              </a>
              .
            </label>
          </Box>

          <Button
            onClick={() => setStep("form")}
            disabled={!agreed}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#0f4c74",
              color: "white",
              py: 1.5,
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "15px",
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(15, 76, 116, 0.25)",
              "&:hover": { bgcolor: "#0a3450" },
              "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
            }}
          >
            Continue
          </Button>
        </DialogContent>
      ) : (
        <DialogContent sx={{ px: isMobile ? 2 : 4, pb: isMobile ? 3 : 4, pt: 0 }}>
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 900, color: "#1e293b", mb: 0.5 }}>
              Book Your Consultation
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: "13px" }}>
              15 minutes · ₹99 · Pay securely to confirm your slot
            </Typography>
          </Box>
          <ConsultPaymentForm />
        </DialogContent>
      )}
    </Dialog>
  );
}
