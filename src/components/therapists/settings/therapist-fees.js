import React, { useState, useEffect } from "react";
import useTherapistStore from "../../../store/therapistStore";
import { updateFeeDetailsUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import FormProgressBar from "../../global/form-progressbar";
import FormMessage from "../../global/form-message";
import { toast } from "react-toastify";
import { Box, Typography, Paper, Grid, Switch, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import PersonIcon from "@mui/icons-material/Person";

export default function Fees({ onSuccess }) {
  const { therapistInfo, setFee } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Local enabled state per format: { "0-0": true, "0-1": false, ... }
  const [enabledMap, setEnabledMap] = useState({});
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && therapistInfo?.fees?.length > 0) {
      const map = {};
      therapistInfo.fees.forEach((feeItem, si) => {
        feeItem.formats.forEach((format, fi) => {
          const key = `${si}-${fi}`;
          map[key] = format.fee !== null && format.fee !== "" && format.fee !== undefined;
        });
      });
      setEnabledMap(map);
      setHasInitialized(true);
    }
  }, [therapistInfo.fees, hasInitialized]);

  const handleToggle = (si, fi) => {
    const key = `${si}-${fi}`;
    const nowEnabled = !(enabledMap[key] ?? false);
    setEnabledMap((prev) => ({ ...prev, [key]: nowEnabled }));
    if (nowEnabled) {
      setFee(si, fi, therapistInfo.fees[si]?.formats[fi]?.fee || "500");
    } else {
      setFee(si, fi, "");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await postData(updateFeeDetailsUrl, { fees: therapistInfo.fees });
      if (response.status) {
        setSuccess(response.message);
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const getFormatConfig = (name, index) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("audio") || index === 0) return { label: "Audio Call", icon: <MicIcon sx={{ fontSize: 22 }} />, color: "#0ea5e9", bg: "#f0f9ff" };
    if (n.includes("video") || index === 1) return { label: "Video Call", icon: <VideocamIcon sx={{ fontSize: 22 }} />, color: "#8b5cf6", bg: "#f5f3ff" };
    if (n.includes("person") || index === 2) return { label: "In-Person", icon: <PersonIcon sx={{ fontSize: 22 }} />, color: "#ec4899", bg: "#fdf2f8" };
    return { label: name || "Session", icon: <InfoIcon sx={{ fontSize: 22 }} />, color: "#64748b", bg: "#f8fafc" };
  };

  return (
    <div className="rbt-dashboard-content-wrapper">
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <InfoIcon sx={{ color: "#1976d2", fontSize: 18 }} />
        <Typography sx={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
          Enable a format and set your fee (₹500 – ₹2500)
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {therapistInfo.fees.map((feeItem, si) => (
          <Paper
            key={si}
            elevation={0}
            sx={{ borderRadius: "18px", border: "1.5px solid #f1f5f9", p: 3, background: "#fff" }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: "18px", color: "#1e293b", mb: 2.5 }}>
              {feeItem.name}
            </Typography>

            <Grid container spacing={2}>
              {feeItem.formats.map((format, fi) => {
                const key = `${si}-${fi}`;
                const isEnabled = !!enabledMap[key];
                const cfg = getFormatConfig(format.type || format.name, fi);

                return (
                  <Grid item xs={12} md={4} key={fi}>
                    <Box
                      sx={{
                        borderRadius: "14px",
                        border: "1.5px solid",
                        borderColor: isEnabled ? cfg.color : "#f1f5f9",
                        background: isEnabled ? cfg.bg : "#f8fafc",
                        p: 2,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: "10px",
                            background: isEnabled ? cfg.color : "#e2e8f0",
                            color: isEnabled ? "#fff" : "#94a3b8",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s"
                          }}>
                            {cfg.icon}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: "14px", color: isEnabled ? "#1e293b" : "#94a3b8" }}>
                            {cfg.label}
                          </Typography>
                        </Box>
                        <Switch
                          size="small"
                          color="success"
                          checked={isEnabled}
                          onChange={() => handleToggle(si, fi)}
                        />
                      </Box>

                      {/* Fee input */}
                      {isEnabled ? (
                        <Box sx={{ position: "relative" }}>
                          <span style={{
                            position: "absolute", left: "14px", top: "50%",
                            transform: "translateY(-50%)", fontWeight: 800,
                            fontSize: "16px", color: "#1e293b", zIndex: 1
                          }}>₹</span>
                          <input
                            type="number"
                            placeholder="500"
                            style={{
                              width: "100%", height: "46px", borderRadius: "10px",
                              paddingLeft: "32px", border: `1.5px solid ${cfg.color}44`,
                              fontSize: "16px", fontWeight: "800",
                              background: "#fff", color: "#1e293b", outline: "none"
                            }}
                            value={format?.fee || ""}
                            onChange={(e) => setFee(si, fi, e.target.value)}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (e.target.value !== "" && (isNaN(val) || val < 500 || val > 2500)) {
                                setFee(si, fi, "");
                                toast.error("Fee must be between ₹500 and ₹2500");
                              }
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{
                          height: 46, display: "flex", alignItems: "center",
                          justifyContent: "center", borderRadius: "10px",
                          border: "1.5px dashed #e2e8f0", color: "#cbd5e1",
                          fontSize: "12px", fontWeight: 600
                        }}>
                          Disabled
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormMessage error={error} success={success} />
        {loading && <FormProgressBar />}
        <div className="rbt-form-group">
          <button
            className="rbt-btn btn-gradient submit-btn"
            onClick={handleSubmit}
            style={{ padding: "0 40px", height: "52px", borderRadius: "12px", fontWeight: "600" }}
          >
            Save Fees
          </button>
        </div>
      </Box>
    </div>
  );
}
