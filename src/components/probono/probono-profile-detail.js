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
import ProbonoProfileReview from "./probono-profile-review";

export default function ProbonoProfileDetail({ psychologist, pageUrl }) {
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [requestsSent, setRequestsSent] = useState(psychologist.requestsSent || 0);
  const [rating, setRating] = useState(psychologist.rating || 0);

  return (
    <>
      <style>{`
        .ppd-banner {
          position: relative;
          background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: scroll;
          padding: 60px 0 50px 0;
          overflow: hidden;
          margin-top: 0px;
        }
        .ppd-banner::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1;
        }
        .ppd-eyebrow {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 8px 20px; border-radius: 50px;
          font-weight: 700; font-size: 11.5px;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .ppd-banner-title {
          position: relative; z-index: 1;
          font-size: 30px; font-weight: 900; color: #ffffff;
          line-height: 1.3; margin: 0 0 10px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .ppd-banner-sub {
          position: relative; z-index: 1;
          font-size: 14px; color: rgba(255, 255, 255, 0.85);
          max-width: 560px; margin: 0 auto; line-height: 1.6;
        }
        @media (max-width: 768px) {
          .ppd-banner { padding: 30px 0 26px 0; }
          .ppd-banner-title { font-size: 19px; }
          .ppd-banner-sub { font-size: 12px; padding: 0 12px; }
        }
        .ppd-card { position:relative; border:1px solid #dbe3df; border-radius:6px; background:#fff; }
        .ppd-name { font-family:inherit; font-weight:800; font-size:26px; color:#132a1c; letter-spacing:-0.2px; }
        .ppd-role { font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#228756; }
        .ppd-bio { font-size:15px; color:#3f4d47; line-height:1.85; }
        .ppd-stat-label { font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:#94a3b8; }
      `}</style>

      <section className="ppd-banner">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="ppd-eyebrow">
            <SupervisorAccountIcon sx={{ fontSize: 15 }} /> Supervision cum Internship Program
          </div>
          <h1 className="ppd-banner-title">ProBono Therapist for a Day</h1>
          <p className="ppd-banner-sub">One free session, one day — connect with a verified, supervised trainee psychologist for genuine support, no long-term commitment required.</p>
        </div>
      </section>

      <div className="rbt-section-gap" style={{ paddingTop: 32, background: "#f8faf9", minHeight: "60vh" }}>
        <div className="container">
          <Link href="/probono-therapist/profiles" passHref legacyBehavior>
            <Button
              component="a"
              startIcon={<ArrowBackIcon />}
              sx={{
                mb: 3,
                color: "#228756",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "6px",
                "&:hover": { background: "#f0fdf4" },
              }}
            >
              Back to Directory
            </Button>
          </Link>

          <Box
            className="ppd-card"
            sx={{
              textAlign: "center",
              p: { xs: 3, md: 5 },
            }}
          >
            <Tooltip title="Share this profile" arrow>
              <Box
                onClick={() => setShowShareModal(true)}
                sx={{
                  position: "absolute",
                  top: { xs: 14, md: 20 },
                  right: { xs: 14, md: 20 },
                  width: 38,
                  height: 38,
                  borderRadius: "6px",
                  background: "#f8faf9",
                  border: "1px solid #dbe3df",
                  color: "#228756",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  "&:hover": { background: "#132a1c", color: "#fff" },
                }}
              >
                <Share2 size={17} />
              </Box>
            </Tooltip>

            <Box sx={{ position: "relative", mb: 2.5, display: "inline-block" }}>
              <Avatar sx={{ width: 132, height: 132, borderRadius: "8px", border: "3px solid #eef2f0" }} variant="rounded">
                <ImageTag src={psychologist.photo} alt={psychologist.name} width="132" height="132" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Avatar>
              <VerifiedIcon
                sx={{
                  position: "absolute",
                  bottom: -6,
                  right: -6,
                  fontSize: 26,
                  color: "#1d9bf0",
                  background: "#fff",
                  borderRadius: "50%",
                }}
              />
            </Box>

            <Typography className="ppd-name" component="h2">
              {psychologist.name}
            </Typography>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{ mt: 0.75, mb: 2 }}>
              <SupervisorAccountIcon sx={{ fontSize: 15, color: "#228756" }} />
              <Typography className="ppd-role">Trainee Psychologist</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 2.5 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} sx={{ fontSize: 17, color: s <= Math.round(rating) ? "#fbc02d" : "#e2e8f0" }} />
              ))}
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#64748b", ml: 0.5 }}>
                {rating}
              </Typography>
            </Stack>

            <Typography className="ppd-bio" sx={{ mb: 3, textAlign: "left" }}>
              {psychologist.bio}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                mb: 3.5,
                p: "14px 16px",
                borderRadius: "6px",
                background: "#f8faf9",
                border: "1px solid #eef2f0",
              }}
            >
              <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <SendIcon sx={{ fontSize: 15, color: "#228756" }} />
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{requestsSent}</Typography>
                </Stack>
                <Typography className="ppd-stat-label" sx={{ mt: 0.4 }}>
                  Requests Sent
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <GroupsIcon sx={{ fontSize: 15, color: "#228756" }} />
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{psychologist.connected}</Typography>
                </Stack>
                <Typography className="ppd-stat-label" sx={{ mt: 0.4 }}>
                  Connected
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              onClick={() => setShowLeadPopup(true)}
              sx={{
                borderRadius: "6px",
                py: 1.4,
                background: "linear-gradient(135deg,#166534,#16a34a)",
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                textTransform: "none",
                boxShadow: "0 8px 18px rgba(22,101,52,0.2)",
                "&:hover": { opacity: 0.92 },
              }}
            >
              Connect Now
            </Button>
          </Box>

          <ProbonoProfileReview probonoIntern={psychologist} onReviewSubmitted={(newRating) => setRating(newRating)} />
        </div>
      </div>

      <ProbonoLeadModal
        open={showLeadPopup}
        onClose={() => setShowLeadPopup(false)}
        selected={psychologist}
        onSuccess={() => setRequestsSent((n) => n + 1)}
      />

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
