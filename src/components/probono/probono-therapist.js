import React, { useState } from "react";
import { Box, Typography, Grid, Avatar, Button, Dialog, DialogContent, IconButton, Stack } from "@mui/material";
import { FiX } from "react-icons/fi";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import SendIcon from "@mui/icons-material/Send";
import GroupsIcon from "@mui/icons-material/Groups";
import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";
import ImageTag from "../../utils/image-tag";
import ProbonoBanner from "./probono-banner";

import photo1 from "../../assets/img/team-01a1b3.jpg";
import photo2 from "../../assets/img/team-028418.jpg";
import photo3 from "../../assets/img/team-033566.jpg";
import photo4 from "../../assets/img/team-042782.jpg";
import photo5 from "../../assets/img/team-05006a.jpg";
import photo6 from "../../assets/img/team-06076f.jpg";

const PSYCHOLOGISTS = [
  {
    id: 1,
    name: "Dr. Ananya Sharma",
    photo: photo1,
    intro: "Clinical psychologist with 6+ years helping clients manage anxiety, stress, and life transitions.",
    rating: 4.9,
    requestsSent: 132,
    connected: 118,
  },
  {
    id: 2,
    name: "Dr. Rohan Mehta",
    photo: photo2,
    intro: "Specialises in cognitive behavioural therapy for depression, OCD, and relationship concerns.",
    rating: 4.8,
    requestsSent: 97,
    connected: 84,
  },
  {
    id: 3,
    name: "Priya Nair",
    photo: photo3,
    intro: "Counselling psychologist focused on adolescent mental health and family counselling.",
    rating: 4.7,
    requestsSent: 76,
    connected: 65,
  },
  {
    id: 4,
    name: "Dr. Karan Kapoor",
    photo: photo4,
    intro: "Works with couples and individuals on trauma recovery and emotional wellbeing.",
    rating: 4.9,
    requestsSent: 154,
    connected: 141,
  },
  {
    id: 5,
    name: "Simran Kaur",
    photo: photo5,
    intro: "Passionate about supporting students and young professionals through stress and burnout.",
    rating: 4.6,
    requestsSent: 61,
    connected: 52,
  },
  {
    id: 6,
    name: "Dr. Arjun Verma",
    photo: photo6,
    intro: "Experienced in mindfulness-based therapy for anxiety, grief, and self-esteem issues.",
    rating: 4.8,
    requestsSent: 108,
    connected: 95,
  },
];

export default function ProbonoTherapist() {
  const [selected, setSelected] = useState(null);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const handleConnectNow = (psychologist) => {
    setSelected(psychologist);
    setLeadData({ name: "", phone: "" });
    setLeadSubmitted(false);
    setShowLeadPopup(true);
  };

  const handleLeadSubmit = async () => {
    if (!leadData.name.trim() || !leadData.phone.trim()) return;
    setLeadLoading(true);
    try {
      await postFormUrlEncoded(SubmitConsultationUrl, {
        name: leadData.name,
        phone: leadData.phone,
        subject: "Probono Therapist Lead",
        concern: `Interested in connecting with ${selected?.name || "a probono therapist"}`,
        source: "Probono Therapist Page",
      });
      setLeadSubmitted(true);
    } catch (e) {}
    setLeadLoading(false);
  };

  return (
    <>
      <ProbonoBanner />
      <div
        className="rbt-section-gap"
        style={{
          background: "linear-gradient(180deg, #f8faf9 0%, #ffffff 45%)",
        }}
      >
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <p className="description">
                  Connect with someone who fits your needs.
                </p>
              </div>
            </div>
          </div>

          <Grid container rowSpacing={5} columnSpacing={{ xs: 2, sm: 3, md: 4 }}>
            {PSYCHOLOGISTS.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Box
                  className="probono-card"
                  sx={{
                    position: "relative",
                    textAlign: "center",
                    pt: 6,
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
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "56px",
                      borderRadius: "20px 20px 0 0",
                      background: "linear-gradient(135deg, #166534, #22c55e)",
                    }}
                  />

                  <Box sx={{ position: "relative", mb: 2 }}>
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

                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 1.5 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} sx={{ fontSize: 15, color: s <= Math.round(p.rating) ? "#fbc02d" : "#e2e8f0" }} />
                    ))}
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#64748b", ml: 0.5 }}>
                      {p.rating}
                    </Typography>
                  </Stack>

                  <Typography sx={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, mb: 2.5, flexGrow: 1 }}>
                    {p.intro}
                  </Typography>

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

      {/* Connect Now — Lead Capture Modal */}
      <Dialog
        open={showLeadPopup}
        onClose={() => setShowLeadPopup(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 10000 }}
        PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4, position: "relative" }}>
            <IconButton onClick={() => setShowLeadPopup(false)} sx={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }}>
              <FiX size={18} />
            </IconButton>

            {!leadSubmitted ? (
              <>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: "rgba(34,135,86,.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                      fontSize: 26,
                      color: "#228756",
                    }}
                  >
                    💬
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 0.5 }}>
                    Connect with {selected?.name || "our psychologist"}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                    Share your details and our team will reach out to set things up.
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  <Box
                    component="input"
                    type="text"
                    placeholder="Your name"
                    value={leadData.name}
                    onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
                    sx={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      background: "#f8fafc",
                    }}
                  />
                  <Box
                    component="input"
                    type="tel"
                    placeholder="Phone number (WhatsApp)"
                    value={leadData.phone}
                    onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
                    sx={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      background: "#f8fafc",
                    }}
                  />
                </Stack>

                <Button
                  fullWidth
                  onClick={handleLeadSubmit}
                  disabled={leadLoading || !leadData.name.trim() || !leadData.phone.trim()}
                  sx={{
                    mt: 2.5,
                    py: 1.5,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg,#166534,#16a34a)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 15,
                    boxShadow: "0 4px 14px rgba(22,101,52,.25)",
                    "&:hover": { opacity: 0.9 },
                    "&.Mui-disabled": { background: "#cbd5e1", color: "#94a3b8" },
                  }}
                >
                  {leadLoading ? "Connecting..." : "Connect Now"}
                </Button>
                <Typography sx={{ textAlign: "center", fontSize: 11, color: "#94a3b8", mt: 1 }}>
                  🔒 No spam · Confidential · Free
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 32,
                  }}
                >
                  ✅
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 1 }}>
                  You're all set!
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
                  Our team will reach out on WhatsApp within 24 hours to connect you with {selected?.name || "your psychologist"}.
                </Typography>
                <Button
                  onClick={() => setShowLeadPopup(false)}
                  sx={{ mt: 3, bgcolor: "#f0fdf4", color: "#228756", fontWeight: 800, borderRadius: "12px", px: 4 }}
                >
                  Close
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
