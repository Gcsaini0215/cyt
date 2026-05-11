import React, { useEffect, useState } from "react";

import { allTimes } from "../../../utils/static-lists";
import useTherapistStore from "../../../store/therapistStore";
import FormProgressBar from "../../global/form-progressbar";
import FormMessage from "../../global/form-message";
import { postData } from "../../../utils/actions";
import {
  updateAvailabilitiesUrl,
} from "../../../utils/url";
import { 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel, 
  IconButton, 
  Button, 
  Paper,
  Tooltip,
  Divider
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Availability = ({ onSuccess }) => {
  const { therapistInfo, times, setTimes, setTimesAll, addOvertime, deleteOvertime } =
    useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Track which days are "Active"
  const [activeDays, setActiveDays] = useState({
    Monday: false, Tuesday: false, Wednesday: false, Thursday: false,
    Friday: false, Saturday: false, Sunday: false
  });

  useEffect(() => {
    if (!hasInitialized && therapistInfo?.user?.email) {
      const transformedTimes = transformScheduleToTimes(therapistInfo.availabilities);
      if (therapistInfo.availabilities && therapistInfo.availabilities.length > 0) {
        setTimesAll(transformedTimes);
        
        // Mark days with at least one valid slot as active
        const active = {};
        Object.entries(transformedTimes).forEach(([day, slots]) => {
          active[day] = slots.some(slot => slot.open && slot.close);
        });
        setActiveDays(prev => ({ ...prev, ...active }));
      }
      setHasInitialized(true);
    }
  }, [therapistInfo?.user?.email, therapistInfo.availabilities, hasInitialized]);

  const handleDayToggle = (day) => {
    setActiveDays(prev => {
      const newState = !prev[day];
      // If turning off, we don't necessarily clear the times in the store, 
      // but they won't be sent on submit if not active
      return { ...prev, [day]: newState };
    });
  };

  const copyMondayToAll = () => {
    const mondayTimes = JSON.parse(JSON.stringify(times.Monday));
    const isMondayActive = activeDays.Monday;
    
    const newTimes = {};
    const newActiveDays = { ...activeDays };
    
    Object.keys(times).forEach(day => {
      newTimes[day] = JSON.parse(JSON.stringify(mondayTimes));
      newActiveDays[day] = isMondayActive;
    });
    
    setTimesAll(newTimes);
    setActiveDays(newActiveDays);
  };

  const handleTimeChange = (day, index, type, value) => {
    setTimes(day, index, type, value);
    if (value && !activeDays[day]) {
      setActiveDays(prev => ({ ...prev, [day]: true }));
    }
  };

  const validateTimes = () => {
    const activeEntries = Object.entries(times).filter(([day]) => activeDays[day]);
    if (activeEntries.length === 0) return false;
    
    return activeEntries.some(([day, dayTimes]) =>
      dayTimes.some((timeSlot) => timeSlot.open && timeSlot.close)
    );
  };

  const handleSubmit = async () => {
    if (validateTimes()) {
      setError("");
      // Only transform times for ACTIVE days
      const filteredTimes = {};
      Object.keys(times).forEach(day => {
        if (activeDays[day]) {
          filteredTimes[day] = times[day];
        }
      });
      
      const schedule = transformTimesToSchedule(filteredTimes);
      const data = { schedule: schedule };
      
      try {
        setLoading(true);
        const response = await postData(updateAvailabilitiesUrl, data);
        if (response.status) {
          setSuccess(response.message);
          setError("");
          if (onSuccess) onSuccess();
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    } else {
      setError("Please select at least one active day and fill its times");
    }
  };

  const transformTimesToSchedule = (timesToTransform) => {
    return Object.entries(timesToTransform).reduce((schedule, [day, daySlots]) => {
      const validTimes = daySlots.filter(
        (time) => time.open !== "" && time.close !== ""
      );
      if (validTimes.length > 0) {
        schedule.push({ day, times: validTimes });
      }
      return schedule;
    }, []);
  };

  const transformScheduleToTimes = (schedule) => {
    const initialTimes = {
      Monday: [{ open: "", close: "" }],
      Tuesday: [{ open: "", close: "" }],
      Wednesday: [{ open: "", close: "" }],
      Thursday: [{ open: "", close: "" }],
      Friday: [{ open: "", close: "" }],
      Saturday: [{ open: "", close: "" }],
      Sunday: [{ open: "", close: "" }],
    };

    if (schedule && Array.isArray(schedule)) {
      schedule.forEach(({ day, times }) => {
        if (initialTimes[day]) {
          initialTimes[day] = times.map((time) => ({
            open: time.open,
            close: time.close,
          }));
        }
      });
    }

    return initialTimes;
  };

  const selectStyle = { 
    lineHeight: "20px", 
    height: "50px", 
    borderRadius: "12px", 
    border: '1px solid #e2e8f0',
    padding: '0 15px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    width: '100%',
    cursor: 'pointer'
  };

  const slotSelect = {
    height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0',
    padding: '0 8px', fontSize: '13px', fontWeight: '600',
    color: '#1e293b', width: '130px', cursor: 'pointer', background: '#fff',
  };

  return (
    <div className="rbt-dashboard-content-wrapper">
      {/* Header */}
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Weekly Schedule</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.3 }}>Set your available hours for each day</Typography>
        </Box>
        <Button
          variant="outlined" size="small"
          startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />}
          onClick={copyMondayToAll}
          sx={{
            borderRadius: '8px', textTransform: 'none', fontWeight: 700,
            fontSize: '13px', borderColor: '#e2e8f0', color: '#475569',
            '&:hover': { borderColor: '#2ecc71', color: '#2ecc71', background: '#f0fdf4' }
          }}
        >
          Copy Monday to all
        </Button>
      </Box>

      {/* Table-style layout */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
        {Object.keys(times).map((day, dayIdx) => (
          <Box
            key={day}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              borderBottom: dayIdx < 6 ? '1px solid #f1f5f9' : 'none',
              background: activeDays[day] ? '#fff' : '#fafafa',
              transition: 'background 0.2s',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            {/* Left: Day info + toggle */}
            <Box sx={{
              width: { xs: '100%', md: '180px' },
              minWidth: { md: '180px' },
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2.5, py: 1.8,
              borderRight: { md: '1px solid #f1f5f9' },
              borderBottom: { xs: '1px solid #f1f5f9', md: 'none' },
              background: activeDays[day] ? '#f0fdf4' : '#f8fafc',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: '7px',
                  background: activeDays[day] ? '#2ecc71' : '#e2e8f0',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.2s'
                }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '12px' }}>{day.slice(0, 2)}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: activeDays[day] ? '#1e293b' : '#94a3b8' }}>
                  {day}
                </Typography>
              </Box>
              <Switch checked={activeDays[day]} onChange={() => handleDayToggle(day)} color="success" size="small" />
            </Box>

            {/* Right: Time slots */}
            <Box sx={{ flex: 1, px: 2.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {activeDays[day] ? (
                times[day].map((time, index) => (
                  <Box key={`${day}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                    <AccessTimeIcon sx={{ fontSize: 15, color: '#94a3b8', flexShrink: 0 }} />
                    <select style={slotSelect} value={time.open} onChange={(e) => handleTimeChange(day, index, "open", e.target.value)}>
                      <option value="">Start time</option>
                      {allTimes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Typography sx={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>—</Typography>
                    <select style={slotSelect} value={time.close} onChange={(e) => handleTimeChange(day, index, "close", e.target.value)}>
                      <option value="">End time</option>
                      {allTimes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {index === 0 ? (
                      <Tooltip title="Add slot">
                        <IconButton size="small" onClick={() => addOvertime(day)} sx={{ color: '#2ecc71', background: '#f0fdf4', width: 28, height: 28, '&:hover': { background: '#dcfce7' } }}>
                          <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => deleteOvertime(day, index)} sx={{ color: '#ef4444', background: '#fef2f2', width: 28, height: 28, '&:hover': { background: '#fee2e2' } }}>
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, py: 0.8 }}>Unavailable</Typography>
              )}
            </Box>
          </Box>
        ))}
      </Paper>

      <Box sx={{ mt: 3 }}>
        <FormMessage error={error} success={success} />
        {loading && <FormProgressBar />}
        <div className="rbt-form-group">
          <button
            className="rbt-btn btn-gradient submit-btn"
            onClick={handleSubmit}
            style={{ padding: "0 40px", height: "52px", borderRadius: "12px", fontWeight: "600" }}
          >
            Save Schedule
          </button>
        </div>
      </Box>
    </div>
  );
};

export default Availability;
