import React, { useState, useEffect } from "react";
import ConsultationForm from "../home/consultation-form";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Box } from "@mui/material";

const BookingPopup = ({ delay = 10000 }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("has_seen_booking_popup");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("has_seen_booking_popup", "true");
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(5px)",
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "600px",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={{
            position: "absolute",
            top: 15,
            right: 15,
            zIndex: 1,
            backgroundColor: "#f8fafc",
            "&:hover": { backgroundColor: "#f1f5f9" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <ConsultationForm showHeading={true} />
        </Box>
      </div>
    </div>
  );
};

export default BookingPopup;
