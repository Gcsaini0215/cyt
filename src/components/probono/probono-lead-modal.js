import React, { useState } from "react";
import { Box, Typography, Button, Dialog, DialogContent, IconButton, Stack } from "@mui/material";
import { FiX } from "react-icons/fi";
import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

export default function ProbonoLeadModal({ open, onClose, selected }) {
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setLeadData({ name: "", phone: "" });
    setLeadSubmitted(false);
  };

  const handleLeadSubmit = async () => {
    if (!leadData.name.trim() || !leadData.phone.trim()) return;
    setLeadLoading(true);
    try {
      await postFormUrlEncoded(SubmitConsultationUrl, {
        name: leadData.name,
        phone: leadData.phone,
        subject: "Probono Therapy Request",
        concern: selected
          ? `Requesting probono therapy, preferred trainee: ${selected.name}`
          : "Requesting probono therapy — please match with an available trainee therapist",
        source: "Probono Therapist Page",
      });
      setLeadSubmitted(true);
    } catch (e) {}
    setLeadLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      sx={{ zIndex: 10000 }}
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4, position: "relative" }}>
          <IconButton onClick={handleClose} sx={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }}>
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
                  {selected ? `Connect with ${selected.name}` : "Request Probono Therapy"}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                  {selected
                    ? "Share your details and our team will reach out to set things up."
                    : "Share your details and we'll match you with an available trainee therapist, working under supervision."}
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
                {selected
                  ? `Our team will reach out on WhatsApp within 24 hours to connect you with ${selected.name}.`
                  : "Our team will reach out on WhatsApp within 24 hours and match you with an available trainee therapist."}
              </Typography>
              <Button
                onClick={handleClose}
                sx={{ mt: 3, bgcolor: "#f0fdf4", color: "#228756", fontWeight: 800, borderRadius: "12px", px: 4 }}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
