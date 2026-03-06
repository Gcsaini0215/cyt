import React, { useState } from "react";
import useTherapistStore from "../../../store/therapistStore";
import { updateFeeDetailsUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import FormProgressBar from "../../global/form-progressbar";
import FormMessage from "../../global/form-message";
import { toast } from "react-toastify";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Switch, 
  FormControlLabel, 
  TextField, 
  InputAdornment,
  Divider,
  Tooltip
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';

export default function Fees({ onSuccess }) {
  const { therapistInfo, setFee } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await postData(updateFeeDetailsUrl, { fees: therapistInfo.fees });
      if (response.status) {
        setSuccess(response.message);
        setError("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const getFormatIcon = (name) => {
    if (!name) return <InfoIcon sx={{ fontSize: 24, color: '#94a3b8' }} />;
    const n = name.toLowerCase().trim();
    if (n.includes('audio') || n.includes('voice') || n.includes('call')) return <MicIcon sx={{ color: '#0ea5e9', fontSize: 24 }} />;
    if (n.includes('video') || n.includes('zoom') || n.includes('meet')) return <VideocamIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />;
    if (n.includes('person') || n.includes('offline') || n.includes('clinic') || n.includes('physical')) return <PersonIcon sx={{ color: '#ec4899', fontSize: 24 }} />;
    return <InfoIcon sx={{ fontSize: 24, color: '#94a3b8' }} />;
  };

  const getFormatBg = (name) => {
    const n = name?.toLowerCase() || "";
    if (n.includes('audio') || n.includes('voice') || n.includes('call')) return 'rgba(14, 165, 233, 0.1)';
    if (n.includes('video') || n.includes('zoom') || n.includes('meet')) return 'rgba(139, 92, 246, 0.1)';
    if (n.includes('person') || n.includes('offline') || n.includes('clinic') || n.includes('physical')) return 'rgba(236, 72, 153, 0.1)';
    return '#f1f5f9';
  };

  const handleToggleFormat = (serviceIndex, formatIndex, currentFee) => {
    // If turning off, set fee to empty
    if (currentFee) {
      setFee(serviceIndex, formatIndex, "");
    } else {
      // If turning on, set a default or focus the input
      setFee(serviceIndex, formatIndex, "1000"); // Default starting value
    }
  };

  if (pageLoading) return <FormProgressBar />;

  return (
    <div className="rbt-dashboard-content-wrapper">
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, fontSize: '15px', fontWeight: 500 }}>
          <InfoIcon sx={{ color: "#1976d2", fontSize: 18 }} />
          Set your fees for different consultation formats (₹500 - ₹2500)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {therapistInfo.fees.map((feeItem, serviceIndex) => (
          <Grid item xs={12} key={serviceIndex}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '24px', 
                border: '1px solid #f1f5f9',
                background: '#fff',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '22px', color: '#1e293b' }}>
                  {feeItem.name}
                </Typography>
                <Tooltip title={`Update pricing for ${feeItem.name}`}>
                  <Box sx={{ display: 'flex' }}>
                    <InfoIcon sx={{ fontSize: 16, color: '#94a3b8', cursor: 'help' }} />
                  </Box>
                </Tooltip>
              </Box>

              <Grid container spacing={3}>
                {feeItem.formats.map((format, formatIndex) => {
                  const isEnabled = format?.fee && format?.fee !== "";
                  
                  // Map internal names to display names with index fallback
                  const getDisplayName = (name, index) => {
                    const n = name?.toLowerCase() || "";
                    if (n.includes('audio')) return "Audio Session";
                    if (n.includes('video')) return "Video Session";
                    if (n.includes('person') || n.includes('offline') || n.includes('inperson')) return "In-Person Session";
                    
                    // Fallback to common order if name is generic or missing
                    if (index === 0) return "Audio Session";
                    if (index === 1) return "Video Session";
                    if (index === 2) return "In-Person Session";
                    return name || `Session ${index + 1}`;
                  };
                  
                  const displayName = getDisplayName(format.name, formatIndex);

                  return (
                    <Grid item xs={12} md={4} key={formatIndex}>
                      <Box 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: '20px', 
                          background: isEnabled ? '#f8fafc' : '#fcfcfc',
                          border: '1px solid',
                          borderColor: isEnabled ? '#e2e8f0' : '#f1f5f9',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              width: 46, 
                              height: 46, 
                              borderRadius: '14px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: getFormatBg(format.name),
                              transition: 'transform 0.2s ease',
                              '&:hover': { transform: 'scale(1.05)' }
                            }}>
                              {getFormatIcon(format.name)}
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '18px', color: isEnabled ? '#1e293b' : '#94a3b8' }}>
                              {displayName}
                            </Typography>
                          </Box>
                          <Switch 
                            size="small"
                            color="success"
                            checked={!!isEnabled}
                            onChange={() => handleToggleFormat(serviceIndex, formatIndex, format.fee)}
                          />
                        </Box>

                        {isEnabled ? (
                          <div className="rbt-form-group mb--0">
                            <div style={{ position: 'relative' }}>
                              <span style={{ 
                                position: 'absolute', 
                                left: '15px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: '#1e293b',
                                fontWeight: 800,
                                fontSize: '18px',
                                zIndex: 1
                              }}>₹</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                style={{ 
                                  height: 54, 
                                  borderRadius: 14, 
                                  paddingLeft: '36px',
                                  border: '2px solid #e2e8f0',
                                  fontSize: '18px',
                                  fontWeight: '800',
                                  background: '#fff',
                                  color: '#1e293b'
                                }}
                                value={format?.fee || ""}
                                onChange={(e) => setFee(serviceIndex, formatIndex, e.target.value)}
                                onBlur={(e) => {
                                  let value = parseInt(e.target.value);
                                  if (e.target.value !== "" && (isNaN(value) || value < 500 || value > 2500)) {
                                    setFee(serviceIndex, formatIndex, "");
                                    toast.error("Price must be between 500 and 2500");
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <Box sx={{ 
                            height: 50, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 12,
                            border: '2px dashed #e2e8f0',
                            color: '#94a3b8',
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            Format Disabled
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <FormMessage error={error} success={success} />
        <div className="rbt-form-group d-none">
          <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
            Update
          </button>
        </div>
        {loading && <FormProgressBar />}
      </Box>
    </div>
  );
}
