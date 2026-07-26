import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Typography, Button, Stack, Checkbox, FormControlLabel, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ProbonoLeadModal from "./probono-lead-modal";
import { CONSENT_SECTIONS, CONSENT_STATEMENT } from "./probono-consent-data";

export default function ProbonoConsent() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [showLeadPopup, setShowLeadPopup] = useState(false);

  const handleContinue = () => {
    if (!agreed) return;
    router.push("/probono-therapist/profiles");
  };

  return (
    <>
      <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9" }}>
        <div className="container">
          <Box sx={{ maxWidth: 760, mx: "auto" }}>
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

            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, color: "#1e293b", mb: 1 }}>
                Before You Continue — Please Read Carefully
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
                Please read the following information before booking your session. By continuing, you acknowledge
                that you understand the nature and limitations of this service.
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: "20px",
                background: "#ffffff",
                border: "1px solid #eef2f0",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                p: { xs: 3, md: 5 },
              }}
            >
              {CONSENT_SECTIONS.map((section, i) => (
                <Box key={i} sx={{ mb: i === CONSENT_SECTIONS.length - 1 ? 0 : 4 }}>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: section.highlight ? "#b45309" : "#1e293b",
                      mb: 1.2,
                    }}
                  >
                    {section.title}
                  </Typography>

                  {section.intro && (
                    <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8, mb: 1.2 }}>
                      {section.intro}
                    </Typography>
                  )}

                  {section.lead && (
                    <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8, mb: 1 }}>
                      {section.lead}
                    </Typography>
                  )}

                  {section.items && (
                    <Box component="ul" sx={{ m: 0, mb: section.outro ? 1.2 : 0, pl: 3 }}>
                      {section.items.map((item, j) => (
                        <Typography key={j} component="li" sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {section.outro && (
                    <Typography sx={{ fontSize: 14, color: section.highlight ? "#92400e" : "#475569", lineHeight: 1.8, fontWeight: section.highlight ? 700 : 400 }}>
                      {section.outro}
                    </Typography>
                  )}

                  {i < CONSENT_SECTIONS.length - 1 && <Divider sx={{ mt: 4, borderColor: "#f1f5f9" }} />}
                </Box>
              ))}
            </Box>

            {/* Consent Statement */}
            <Box
              sx={{
                mt: 4,
                borderRadius: "20px",
                border: "1.5px solid #fde68a",
                background: "#fffbeb",
                p: { xs: 3, md: 4 },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <WarningAmberIcon sx={{ color: "#b45309", fontSize: 20 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Consent Statement
                </Typography>
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    sx={{ color: "#b45309", alignSelf: "flex-start", "&.Mui-checked": { color: "#228756" } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5, color: "#78350f", lineHeight: 1.7 }}>
                    {CONSENT_STATEMENT}
                  </Typography>
                }
                sx={{ alignItems: "flex-start", mb: 3 }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
                <Button
                  onClick={handleContinue}
                  disabled={!agreed}
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
                    "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
                  }}
                >
                  I Understand and Agree — Continue
                </Button>
                <Button
                  onClick={() => setShowLeadPopup(true)}
                  disabled={!agreed}
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
                    "&.Mui-disabled": { border: "1.5px solid #e2e8f0", color: "#94a3b8" },
                  }}
                >
                  Request Probono Support
                </Button>
              </Stack>
            </Box>
          </Box>
        </div>
      </div>

      <ProbonoLeadModal open={showLeadPopup} onClose={() => setShowLeadPopup(false)} selected={null} />
    </>
  );
}
