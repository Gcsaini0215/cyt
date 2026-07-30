import React from "react";
import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";
import ProbonoBanner from "./probono-banner";

export default function ProbonoTherapist() {
  return (
    <>
      <ProbonoBanner />

      <div className="rbt-section-gap">
        <div className="container">
          <Box sx={{ maxWidth: 720, mx: "auto", textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 900, color: "#1e293b", mb: 3 }}>
              About Pro Bono Support
            </Typography>

            <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.9, mb: 2.5, textAlign: "left" }}>
              Welcome to our <strong>Pro Bono Support Program</strong>. This service is designed to provide{" "}
              <strong>free, supervised emotional support</strong> to individuals who may be experiencing stress,
              anxiety, emotional challenges, relationship concerns, academic pressure, work-related difficulties,
              or other personal issues.
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.9, mb: 2.5, textAlign: "left" }}>
              Our <strong>interns are trained psychology professionals</strong> working under the active supervision
              with <strong>certified mental health experts</strong>. Every session is directly overseen by a qualified
              therapist to ensure you receive <strong>safe, professional, and high-quality care</strong>.
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.9, mb: 4, textAlign: "left" }}>
              This program aims to make mental health support more accessible while helping psychology interns
              develop practical skills under professional supervision.
            </Typography>

            <Link href="/probono-therapist/consent" passHref legacyBehavior>
              <Button
                component="a"
                sx={{
                  borderRadius: "12px",
                  py: 1.4,
                  px: 4,
                  background: "linear-gradient(135deg,#166534,#16a34a)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 15,
                  textTransform: "none",
                  boxShadow: "0 8px 18px rgba(22,101,52,0.25)",
                  "&:hover": { opacity: 0.92 },
                }}
              >
                Continue
              </Button>
            </Link>
          </Box>
        </div>
      </div>
    </>
  );
}
