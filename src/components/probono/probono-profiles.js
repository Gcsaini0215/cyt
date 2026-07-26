import React, { useState } from "react";
import Link from "next/link";
import { Box, Typography, Grid, Avatar, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import SendIcon from "@mui/icons-material/Send";
import GroupsIcon from "@mui/icons-material/Groups";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ImageTag from "../../utils/image-tag";
import ProbonoLeadModal from "./probono-lead-modal";
import { PSYCHOLOGISTS } from "./probono-data";

export default function ProbonoProfiles() {
  const [selected, setSelected] = useState(null);
  const [showLeadPopup, setShowLeadPopup] = useState(false);

  const handleConnectNow = (psychologist) => {
    setSelected(psychologist);
    setShowLeadPopup(true);
  };

  return (
    <>
      <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9" }}>
        <div className="container">
          <Link href="/probono-therapist" passHref legacyBehavior>
            <Button
              component="a"
              startIcon={<ArrowBackIcon />}
              sx={{
                mb: 3,
                color: "#228756",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { background: "#f0fdf4" },
              }}
            >
              Back
            </Button>
          </Link>

          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900, color: "#1e293b", mb: 1 }}>
                  Meet Our Psychology Interns
                </Typography>
                <p className="description">Connect with someone who fits your needs.</p>
              </div>
            </div>
          </div>

          <Grid container rowSpacing={5} columnSpacing={{ xs: 2, sm: 3, md: 4 }}>
            {PSYCHOLOGISTS.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Box
                  sx={{
                    position: "relative",
                    textAlign: "center",
                    pt: 4,
                    pb: 3,
                    px: 3,
                    borderRadius: "20px",
                    background: "#ffffff",
                    border: "1px solid #eef2f0",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
                    },
                  }}
                >
                  <Link href={`/probono-therapist/profiles/${p.slug}`} passHref legacyBehavior>
                    <Box component="a" sx={{ textDecoration: "none", color: "inherit", width: "100%" }}>
                      <Box sx={{ position: "relative", mb: 2, display: "inline-block" }}>
                        <Avatar sx={{ width: 100, height: 100, border: "4px solid #ffffff", boxShadow: "0 6px 18px rgba(0,0,0,0.15)" }}>
                          <ImageTag src={p.photo} alt={p.name} width="100" height="100" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </Avatar>
                        <VerifiedIcon
                          sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            fontSize: 24,
                            color: "#1d9bf0",
                            background: "#fff",
                            borderRadius: "50%",
                          }}
                        />
                      </Box>

                      <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#1e293b", mb: 0.5 }}>
                        {p.name}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={0.5}
                        sx={{
                          mb: 1,
                          mx: "auto",
                          width: "fit-content",
                          px: 1.2,
                          py: 0.3,
                          borderRadius: "20px",
                          background: "#e8f5ee",
                        }}
                      >
                        <SupervisorAccountIcon sx={{ fontSize: 13, color: "#228756" }} />
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#228756" }}>
                          Working under supervision
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 1.5 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon key={s} sx={{ fontSize: 15, color: s <= Math.round(p.rating) ? "#fbc02d" : "#e2e8f0" }} />
                        ))}
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#64748b", ml: 0.5 }}>
                          {p.rating}
                        </Typography>
                      </Stack>

                      <Typography sx={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, mb: 2.5 }}>
                        {p.intro}
                      </Typography>
                    </Box>
                  </Link>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      width: "100%",
                      mb: 2.5,
                      p: "10px 12px",
                      borderRadius: "12px",
                      background: "#f8faf9",
                      border: "1px solid #eef2f0",
                    }}
                  >
                    <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                        <SendIcon sx={{ fontSize: 14, color: "#228756" }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{p.requestsSent}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600, mt: 0.25 }}>
                        Requests Sent
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: "center" }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                        <GroupsIcon sx={{ fontSize: 14, color: "#228756" }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{p.connected}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600, mt: 0.25 }}>
                        Connected
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    fullWidth
                    onClick={() => handleConnectNow(p)}
                    sx={{
                      borderRadius: "12px",
                      py: 1.2,
                      background: "linear-gradient(135deg,#166534,#16a34a)",
                      color: "white",
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "0 8px 18px rgba(22,101,52,0.25)",
                      "&:hover": { opacity: 0.92, boxShadow: "0 10px 22px rgba(22,101,52,0.32)" },
                    }}
                  >
                    Connect Now
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>

      <ProbonoLeadModal open={showLeadPopup} onClose={() => setShowLeadPopup(false)} selected={selected} />
    </>
  );
}
