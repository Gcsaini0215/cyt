import React, { useState } from "react";
import { Box, Typography, Grid, Avatar, Button, Dialog, DialogContent, IconButton, Stack } from "@mui/material";
import { FiX } from "react-icons/fi";
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
  },
  {
    id: 2,
    name: "Dr. Rohan Mehta",
    photo: photo2,
    intro: "Specialises in cognitive behavioural therapy for depression, OCD, and relationship concerns.",
  },
  {
    id: 3,
    name: "Priya Nair",
    photo: photo3,
    intro: "Counselling psychologist focused on adolescent mental health and family counselling.",
  },
  {
    id: 4,
    name: "Dr. Karan Kapoor",
    photo: photo4,
    intro: "Works with couples and individuals on trauma recovery and emotional wellbeing.",
  },
  {
    id: 5,
    name: "Simran Kaur",
    photo: photo5,
    intro: "Passionate about supporting students and young professionals through stress and burnout.",
  },
  {
    id: 6,
    name: "Dr. Arjun Verma",
    photo: photo6,
    intro: "Experienced in mindfulness-based therapy for anxiety, grief, and self-esteem issues.",
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
      <div className="rbt-section-gap">
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

          <Grid container rowSpacing={4} columnSpacing={{ xs: 2, sm: 3, md: 3 }}>
            {PSYCHOLOGISTS.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ width: 96, height: 96, mb: 2, border: "2px solid #228756" }}>
                    <ImageTag src={p.photo} alt={p.name} width="96" height="96" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Avatar>
                  <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#1e293b", mb: 0.5 }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, mb: 2.5, flexGrow: 1 }}>
                    {p.intro}
                  </Typography>
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
                      "&:hover": { opacity: 0.9 },
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
