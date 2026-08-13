import React, { useState } from "react";
import Link from "next/link";
import { Box, Typography, Grid, Avatar, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ImageTag from "../../utils/image-tag";
import ProbonoBanner from "./probono-banner";
import ProbonoLeadModal from "./probono-lead-modal";
import { PSYCHOLOGISTS } from "./probono-data";

export default function ProbonoProfiles({ interns = PSYCHOLOGISTS }) {
  const [selected, setSelected] = useState(null);
  const [showLeadPopup, setShowLeadPopup] = useState(false);

  const handleConnectNow = (psychologist) => {
    setSelected(psychologist);
    setShowLeadPopup(true);
  };

  const filteredList = interns;

  return (
    <>
      <ProbonoBanner />

      <div className="rbt-section-gap" style={{ paddingTop: 28, background: "#f8faf9" }}>
        <div className="container">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 3 }}
          >
            <Link href="/probono-therapist" passHref legacyBehavior>
              <Button
                component="a"
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: "#228756",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { background: "#f0fdf4" },
                }}
              >
                Back
              </Button>
            </Link>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>
              {filteredList.length} guide{filteredList.length === 1 ? "" : "s"} available
            </Typography>
          </Stack>

          <Grid container rowSpacing={5} columnSpacing={{ xs: 2, sm: 3, md: 4 }}>
            {filteredList.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <Box
                  sx={{
                    position: "relative",
                    textAlign: "center",
                    pt: 4,
                    pb: 3,
                    px: 3,
                    borderRadius: "6px",
                    background: "#ffffff",
                    border: "1px solid #dbe3df",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      borderColor: "#228756",
                      boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
                    },
                  }}
                >
                  <Link href={`/probono-therapist/profiles/${p.slug}`} passHref legacyBehavior>
                    <Box component="a" sx={{ textDecoration: "none", color: "inherit", width: "100%" }}>
                      <Box sx={{ position: "relative", mb: 2, display: "inline-block" }}>
                        <Avatar variant="rounded" sx={{ width: 100, height: 100, borderRadius: "8px", border: "3px solid #eef2f0" }}>
                          <ImageTag src={p.photo} alt={p.name} width="100" height="100" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </Avatar>
                        <VerifiedIcon
                          sx={{
                            position: "absolute",
                            bottom: -6,
                            right: -6,
                            fontSize: 22,
                            color: "#1d9bf0",
                            background: "#fff",
                            borderRadius: "50%",
                          }}
                        />
                      </Box>

                      <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#132a1c", mb: 0.5 }}>
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
                          borderRadius: "4px",
                          background: "transparent",
                          border: "1px solid transparent",
                        }}
                      >
                        <SupervisorAccountIcon sx={{ fontSize: 13, color: "#228756" }} />
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#228756", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {p.roleLabel || "Trainee Psychologist"}
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

                      <Typography sx={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, mb: p.availableDays?.length ? 1.5 : 2.5 }}>
                        {p.intro}
                      </Typography>

                      {!!p.availableDays?.length && (
                        <Box sx={{ width: "100%", mb: 2.5, p: "10px 12px", borderRadius: "6px", background: "#f8faf9", border: "1px solid #eef2f0" }}>
                          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 0.75 }}>
                            <EventAvailableRoundedIcon sx={{ fontSize: 13, color: "#228756" }} />
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#228756", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                              Available Days
                            </Typography>
                          </Stack>
                          <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.6}>
                            {p.availableDays.map((d) => (
                              <Box
                                key={d}
                                sx={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: "#228756",
                                  background: "#fff",
                                  border: "1px solid #cfe4d7",
                                  borderRadius: "4px",
                                  px: 0.9,
                                  py: 0.3,
                                }}
                              >
                                {d.slice(0, 3)}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Link>

                  <Button
                    fullWidth
                    onClick={() => handleConnectNow(p)}
                    sx={{
                      borderRadius: "6px",
                      py: 1.2,
                      background: "linear-gradient(135deg,#166534,#16a34a)",
                      color: "white",
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "0 8px 18px rgba(22,101,52,0.2)",
                      "&:hover": { opacity: 0.92 },
                    }}
                  >
                    Send Request
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
