import React, { useState } from "react";
import Link from "next/link";
import { Box, Typography, Avatar, Button, Stack, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import SendIcon from "@mui/icons-material/Send";
import GroupsIcon from "@mui/icons-material/Groups";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Share2 } from "lucide-react";
import ImageTag from "../../utils/image-tag";
import ProbonoLeadModal from "./probono-lead-modal";
import ShareModal from "../global/share-modal";

export default function ProbonoProfileDetail({ psychologist, pageUrl }) {
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9", minHeight: "60vh" }}>
        <div className="container">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Link href="/probono-therapist/profiles" passHref legacyBehavior>
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

            <Tooltip title="Share this profile" arrow>
              <Box
                onClick={() => setShowShareModal(true)}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "11px",
                  background: "#228756",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(34,135,86,0.25)",
                  "&:hover": { background: "#1a6b3a" },
                }}
              >
                <Share2 size={17} />
              </Box>
            </Tooltip>
          </Stack>

          <Box
            sx={{
              maxWidth: 640,
              mx: "auto",
              textAlign: "center",
              p: { xs: 3, md: 5 },
              borderRadius: "24px",
              background: "#ffffff",
              border: "1px solid #eef2f0",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <Box sx={{ position: "relative", mb: 2, display: "inline-block" }}>
              <Avatar sx={{ width: 140, height: 140, border: "4px solid #ffffff", boxShadow: "0 6px 18px rgba(0,0,0,0.15)" }}>
                <ImageTag src={psychologist.photo} alt={psychologist.name} width="140" height="140" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Avatar>
              <VerifiedIcon
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  fontSize: 30,
                  color: "#1d9bf0",
                  background: "#fff",
                  borderRadius: "50%",
                }}
              />
            </Box>

            <Typography sx={{ fontWeight: 900, fontSize: 24, color: "#1e293b", mb: 0.5 }}>
              {psychologist.name}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
              sx={{
                mb: 1.5,
                mx: "auto",
                width: "fit-content",
                px: 1.4,
                py: 0.4,
                borderRadius: "20px",
                background: "#e8f5ee",
              }}
            >
              <SupervisorAccountIcon sx={{ fontSize: 15, color: "#228756" }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#228756" }}>
                Trainee Psychologist
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 2.5 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} sx={{ fontSize: 18, color: s <= Math.round(psychologist.rating) ? "#fbc02d" : "#e2e8f0" }} />
              ))}
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#64748b", ml: 0.5 }}>
                {psychologist.rating}
              </Typography>
            </Stack>

            <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 3 }}>
              {psychologist.bio}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                mb: 3.5,
                p: "14px 16px",
                borderRadius: "14px",
                background: "#f8faf9",
                border: "1px solid #eef2f0",
              }}
            >
              <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <SendIcon sx={{ fontSize: 16, color: "#228756" }} />
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{psychologist.requestsSent}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600, mt: 0.25 }}>
                  Requests Sent
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <GroupsIcon sx={{ fontSize: 16, color: "#228756" }} />
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{psychologist.connected}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600, mt: 0.25 }}>
                  Connected
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              onClick={() => setShowLeadPopup(true)}
              sx={{
                borderRadius: "12px",
                py: 1.4,
                background: "linear-gradient(135deg,#166534,#16a34a)",
                color: "white",
                fontWeight: 800,
                fontSize: 15,
                textTransform: "none",
                boxShadow: "0 8px 18px rgba(22,101,52,0.25)",
                "&:hover": { opacity: 0.92 },
              }}
            >
              Connect Now
            </Button>
          </Box>
        </div>
      </div>

      <ProbonoLeadModal open={showLeadPopup} onClose={() => setShowLeadPopup(false)} selected={psychologist} />

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={pageUrl}
        title={`${psychologist.name} - Trainee Psychologist`}
        description={psychologist.intro}
      />
    </>
  );
}
