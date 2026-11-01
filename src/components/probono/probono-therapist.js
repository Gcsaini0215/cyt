import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import ProbonoBanner from "./probono-banner";
import FreeConsultationButton from "./free-consultation-button";

const STEPS = [
  ["Sign in", "Create your account, or sign in if you already have one."],
  ["Share your details", "Tell us briefly what's on your mind from your dashboard, and read the consent."],
  ["We arrange your session", "Our team chooses a guide and a time, and your Google Meet link appears in My Space."],
  ["Decide what's next", "If you'd like to continue, you get a limited-time coupon for your first paid session with any CYT therapist."],
];

export default function ProbonoTherapist() {
  return (
    <>
      <ProbonoBanner action={<FreeConsultationButton />} />

      <div className="rbt-section-gap" style={{ background: "#fff" }}>
        <div className="container">
          <Box sx={{ maxWidth: 720, mx: "auto", "& .MuiTypography-root, & .MuiButton-root": { fontFamily: "inherit" } }}>
            <Typography component="h2" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 900, color: "#1e293b", mb: 3, textAlign: "center" }}>
              How It Works
            </Typography>

            <Box component="ol" sx={{ listStyle: "none", m: 0, mb: 4, p: 0 }}>
              {STEPS.map(([title, text], i) => (
                <Stack key={title} component="li" direction="row" spacing={2} sx={{ py: 1.75, borderTop: i ? "1px solid #eef2f0" : "none" }}>
                  <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#166534", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14 }}>
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{title}</Typography>
                    <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.7 }}>{text}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>

            <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.9, mb: 2 }}>
              Our <strong>Pro Bono Support Program</strong> offers free, supervised emotional support for concerns such as
              stress, anxiety, relationships, academic pressure and work. Sessions are led by psychology interns working
              under professional supervision.
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.9, mb: 4 }}>
              This session is emotional support, not therapy or a diagnosis, and it isn&apos;t for emergencies. Each person
              can have one free session.
            </Typography>

            <Box sx={{ textAlign: "center" }}>
              <FreeConsultationButton />
            </Box>
          </Box>
        </div>
      </div>
    </>
  );
}
