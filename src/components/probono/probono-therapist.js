import React, { useState } from "react";
import Link from "next/link";
import { Box, Typography, Grid, Button, Stack } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ProbonoBanner from "./probono-banner";
import ProbonoLeadModal from "./probono-lead-modal";
import Faq from "../home/faq";
import { PROBONO_FAQS } from "./probono-data";

export default function ProbonoTherapist() {
  const [showLeadPopup, setShowLeadPopup] = useState(false);

  return (
    <>
      <ProbonoBanner />

      {/* What is Probono Therapy + Funnel */}
      <div className="rbt-section-gap" style={{ paddingTop: 56 }}>
        <div className="container">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 900, color: "#1e293b", mb: 1.5 }}>
                What is Probono Therapy?
              </Typography>
              <Typography sx={{ fontSize: 14.5, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                Probono therapy offers free or heavily subsidised sessions to people who can't otherwise afford
                mental health support. Sessions are conducted by supervised trainee therapists — psychology
                graduates completing their clinical practicum under the close guidance of a licensed, experienced
                supervisor — so you receive genuine, structured care while they gain hands-on experience.
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <SupervisorAccountIcon sx={{ color: "#228756", fontSize: 20, mt: 0.2 }} />
                  <Typography sx={{ fontSize: 13.5, color: "#475569" }}>
                    Every trainee works under the direct supervision of a licensed senior psychologist.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <VolunteerActivismIcon sx={{ color: "#228756", fontSize: 20, mt: 0.2 }} />
                  <Typography sx={{ fontSize: 13.5, color: "#475569" }}>
                    Sessions are free or low-cost, made possible by therapists volunteering their time.
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Link href="/probono-therapist/profiles" passHref legacyBehavior>
                  <Button
                    component="a"
                    sx={{
                      borderRadius: "12px",
                      py: 1.4,
                      px: 3.5,
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
                <Button
                  onClick={() => setShowLeadPopup(true)}
                  sx={{
                    borderRadius: "12px",
                    py: 1.4,
                    px: 3.5,
                    border: "1.5px solid #228756",
                    color: "#228756",
                    fontWeight: 800,
                    fontSize: 15,
                    textTransform: "none",
                    "&:hover": { background: "#f0fdf4" },
                  }}
                >
                  Request Probono Therapy
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #eef2f0",
                  background: "#f8faf9",
                  p: 3,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#228756", textTransform: "uppercase", letterSpacing: "0.5px", mb: 2 }}>
                  How it works
                </Typography>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HowToRegIcon sx={{ fontSize: 17, color: "#228756" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>1. Submit your request</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>Share your name and phone number — no cost, no commitment.</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <SupervisorAccountIcon sx={{ fontSize: 17, color: "#228756" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>2. We check availability</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>Our team checks which supervised trainee therapist is free.</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ConnectWithoutContactIcon sx={{ fontSize: 17, color: "#228756" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>3. You get connected</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>If a trainee is available, we connect you on WhatsApp within 24 hours.</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </div>
      </div>

      {/* FAQ */}
      <div className="rbt-section-gap" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faf9 100%)" }}>
        <div className="container">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.75}
              sx={{
                mx: "auto",
                width: "fit-content",
                px: 1.6,
                py: 0.5,
                mb: 2,
                borderRadius: "20px",
                background: "#e8f5ee",
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 15, color: "#228756" }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#228756", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Got Questions?
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: { xs: 20, md: 26 }, fontWeight: 900, color: "#1e293b" }}>
              Frequently Asked Questions
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 760, mx: "auto" }}>
            {PROBONO_FAQS.map((item, i) => (
              <Faq key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
            ))}
          </Box>
        </div>
      </div>

      <ProbonoLeadModal open={showLeadPopup} onClose={() => setShowLeadPopup(false)} selected={null} />
    </>
  );
}
