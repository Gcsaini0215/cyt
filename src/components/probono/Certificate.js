import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

export default function Certificate({ guide }) {
  const today = new Date();
  const year = today.getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .certificate-container { box-shadow: none; border: none; }
        }
      `}</style>

      <Box sx={{ p: 3, mb: 3 }} className="no-print">
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ background: "#228756", "&:hover": { background: "#1a6b42" } }}
        >
          Print / Download as PDF
        </Button>
      </Box>

      <Container maxWidth="md">
        <Box
          className="certificate-container"
          sx={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)",
            p: 6,
            border: "4px solid #228756",
            borderRadius: "12px",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            color: "#1a202c",
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Decorative Top */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: "60px",
                height: "60px",
                margin: "0 auto 16px",
                background: "linear-gradient(135deg, #228756, #16a34a)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
              }}
            >
              🎓
            </Box>
          </Box>

          {/* Title */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 800,
                color: "#228756",
                mb: 1,
                letterSpacing: "2px",
              }}
            >
              CERTIFICATE OF COMPLETION
            </Typography>
            <Box
              sx={{
                height: "3px",
                width: "120px",
                background: "linear-gradient(90deg, #228756, #16a34a)",
                margin: "0 auto",
              }}
            />
          </Box>

          {/* Body Text */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 16, mb: 3, color: "#475569" }}>
              This is to certify that
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                color: "#228756",
                mb: 3,
                borderBottom: "2px solid #228756",
                pb: 2,
                letterSpacing: "1px",
              }}
            >
              {guide?.name || "_______________"}
            </Typography>

            <Typography sx={{ fontSize: 15, color: "#475569", mb: 2, lineHeight: 1.8 }}>
              has successfully completed a supervised internship and training program
            </Typography>

            <Typography sx={{ fontSize: 15, color: "#475569", mb: 3, lineHeight: 1.8 }}>
              as a Mental Health Guide with
            </Typography>

            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: "#228756",
                mb: 3,
              }}
            >
              Choose Your Therapist
            </Typography>

            <Typography sx={{ fontSize: 14, color: "#64748b", mb: 4, fontStyle: "italic" }}>
              Professional Mental Health Support Platform
            </Typography>

            <Typography sx={{ fontSize: 14, color: "#475569", mb: 3, lineHeight: 1.8 }}>
              Demonstrating competence in ethical practice, clinical skills, and compassionate client care
            </Typography>

            <Typography sx={{ fontSize: 14, color: "#475569", mb: 2, lineHeight: 1.8 }}>
              under professional supervision of licensed mental health professionals
            </Typography>
          </Box>

          {/* Date & Signature */}
          <Box sx={{ mt: 4 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 4 }}>
              Awarded this {today.getDate()}{getOrdinalSuffix(today.getDate())} day of{" "}
              {today.toLocaleDateString("en-US", { month: "long" })}, {year}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-around", mt: 6 }}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ height: "60px", mb: 1 }} />
                <Box sx={{ borderTop: "2px solid #228756", pt: 1, width: "140px" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#228756" }}>
                    Director
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "#64748b", mt: 0.5 }}>
                    Choose Your Therapist
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: "80px",
                    height: "80px",
                    border: "2px dashed #228756",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                  }}
                >
                  ✓
                </Box>
                <Typography sx={{ fontSize: 11, color: "#64748b", mt: 1 }}>
                  Official Seal
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e2e8f0" }}>
            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
              This certificate recognizes professional achievement in mental health support delivery
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#cbd5e1", mt: 1 }}>
              chooseyourtherapist.in | support@chooseyourtherapist.in
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}
