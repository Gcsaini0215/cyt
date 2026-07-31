import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";

export default function LetterOfRecommendation({ guide }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .letter-container { box-shadow: none; border: none; }
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
          className="letter-container"
          sx={{
            background: "#fff",
            p: 5,
            border: "2px solid #228756",
            borderRadius: "8px",
            fontFamily: "Georgia, serif",
            lineHeight: 1.8,
            color: "#1a202c",
          }}
        >
          {/* Letterhead */}
          <Box sx={{ textAlign: "center", mb: 4, pb: 2, borderBottom: "2px solid #228756" }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#228756", mb: 0.5 }}>
              Choose Your Therapist
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>
              Professional Mental Health Support
            </Typography>
          </Box>

          {/* Date */}
          <Box sx={{ textAlign: "right", mb: 4, pr: 2 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b" }}>
              {formattedDate}
            </Typography>
          </Box>

          {/* Salutation */}
          <Typography sx={{ mb: 3, fontSize: 14 }}>
            To Whom It May Concern,
          </Typography>

          {/* Body */}
          <Typography sx={{ mb: 3, fontSize: 14, textAlign: "justify" }}>
            This letter is to certify that <strong>{guide?.name || "_______________"}</strong> has successfully completed a supervised internship program with Choose Your Therapist's Pro Bono Support Initiative. During this engagement, we have had the distinct privilege of working with a dedicated mental health professional who has demonstrated exceptional competence and integrity.
          </Typography>

          <Typography sx={{ mb: 3, fontSize: 14, textAlign: "justify" }}>
            Throughout their tenure, <strong>{guide?.name || "_______________"}</strong> has exhibited the following professional qualities:
          </Typography>

          {/* Qualities */}
          <Box sx={{ ml: 3, mb: 3 }}>
            <Typography component="div" sx={{ mb: 2, fontSize: 14 }}>
              <strong>1. Ethical Conduct & Professional Integrity</strong>
              <Typography sx={{ fontSize: 13, color: "#475569", mt: 0.5 }}>
                Consistently demonstrated adherence to professional ethical guidelines, maintaining client confidentiality, and upholding the highest standards of professional conduct. Shows genuine commitment to client welfare and respects professional boundaries at all times.
              </Typography>
            </Typography>

            <Typography component="div" sx={{ mb: 2, fontSize: 14 }}>
              <strong>2. Communication Skills</strong>
              <Typography sx={{ fontSize: 13, color: "#475569", mt: 0.5 }}>
                Exceptional ability to establish rapport with clients, listening with empathy and clarity. Communicates complex psychological concepts in an accessible manner, enabling clients to feel heard, understood, and supported.
              </Typography>
            </Typography>

            <Typography component="div" sx={{ mb: 2, fontSize: 14 }}>
              <strong>3. Clinical Competence</strong>
              <Typography sx={{ fontSize: 13, color: "#475569", mt: 0.5 }}>
                Demonstrates solid understanding of mental health principles and evidence-based therapeutic techniques. Applies knowledge effectively to support clients with diverse concerns including stress, anxiety, relationships, and personal growth.
              </Typography>
            </Typography>

            <Typography component="div" sx={{ mb: 2, fontSize: 14 }}>
              <strong>4. Responsiveness & Dedication</strong>
              <Typography sx={{ fontSize: 13, color: "#475569", mt: 0.5 }}>
                Shows genuine dedication to client care, consistently attending to sessions and providing thoughtful support. Demonstrates initiative in seeking feedback and continuous professional development.
              </Typography>
            </Typography>
          </Box>

          <Typography sx={{ mb: 3, fontSize: 14, textAlign: "justify" }}>
            <strong>{guide?.name || "_______________"}</strong> has worked under the direct supervision of licensed mental health professionals at Choose Your Therapist, receiving regular clinical guidance and support. This supervised experience has strengthened their clinical skills and professional judgment.
          </Typography>

          <Typography sx={{ mb: 4, fontSize: 14, textAlign: "justify" }}>
            We wholeheartedly recommend <strong>{guide?.name || "_______________"}</strong> for positions requiring psychological insight, professional integrity, and compassionate client care. They represent the highest standards of mental health support professionals.
          </Typography>

          {/* Closing */}
          <Typography sx={{ mb: 4, fontSize: 14 }}>
            Sincerely,
          </Typography>

          <Box sx={{ mb: 6, height: "80px" }} />

          {/* Signature Section */}
          <Box sx={{ borderTop: "2px solid #228756", pt: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#228756" }}>
              Choose Your Therapist
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#64748b", mt: 0.5 }}>
              Professional Mental Health Support Platform
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#64748b", mt: 2 }}>
              For verification of this letter, contact: support@chooseyourtherapist.in
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}
