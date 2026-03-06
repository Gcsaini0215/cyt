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

  return (
    <div className="rbt-dashboard-content-wrapper">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Weekly Schedule</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Set your available time slots for each day</Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<ContentCopyIcon />}
          onClick={copyMondayToAll}
          sx={{ 
            borderRadius: '12px', 
            textTransform: 'none', 
            fontWeight: 700,
            borderColor: '#e2e8f0',
            color: '#1e293b',
            '&:hover': { borderColor: '#2ecc71', color: '#2ecc71', background: '#f0fdf4' }
          }}
        >
          Copy Monday to all
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Object.keys(times).map((day) => (
          <Paper 
            key={day} 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: '20px', 
              border: '1px solid',
              borderColor: activeDays[day] ? '#2ecc71' : '#f1f5f9',
              background: activeDays[day] ? '#fff' : '#f8fafc',
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: activeDays[day] ? 3 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: activeDays[day] ? '#2ecc71' : '#e2e8f0',
                  color: '#fff'
                }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '14px' }}>{day.charAt(0)}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '18px', color: activeDays[day] ? '#1e293b' : '#94a3b8' }}>
                  {day}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch 
                    checked={activeDays[day]} 
                    onChange={() => handleDayToggle(day)}
                    color="success"
                  />
                }
                label={activeDays[day] ? "Available" : "Unavailable"}
                sx={{ 
                  m: 0, 
                  '& .MuiTypography-root': { 
                    fontSize: '14px', 
                    fontWeight: 700,
                    color: activeDays[day] ? '#2ecc71' : '#94a3b8'
                  } 
                }}
              />
            </Box>

            {activeDays[day] && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {times[day].map((time, index) => (
                  <Box key={`${day}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: '140px' }}>
                      <Typography sx={{ fontWeight: 800, color: '#475569', mb: 1, display: 'block', fontSize: '16px' }}>Starts at</Typography>
                      <select
                        style={selectStyle}
                        value={time.open}
                        onChange={(e) => handleTimeChange(day, index, "open", e.target.value)}
                      >
                        <option value="">Select Time</option>
                        {allTimes.map((timeOption) => (
                          <option key={timeOption} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '140px' }}>
                      <Typography sx={{ fontWeight: 800, color: '#475569', mb: 1, display: 'block', fontSize: '16px' }}>Ends at</Typography>
                      <select
                        style={selectStyle}
                        value={time.close}
                        onChange={(e) => handleTimeChange(day, index, "close", e.target.value)}
                      >
                        <option value="">Select Time</option>
                        {allTimes.map((timeOption) => (
                          <option key={timeOption} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </Box>
                    <Box sx={{ pt: 3 }}>
                      {index === 0 ? (
                        <Tooltip title="Add Slot">
                          <IconButton 
                            onClick={() => addOvertime(day)}
                            sx={{ color: '#2ecc71', background: '#f0fdf4', '&:hover': { background: '#dcfce7' } }}
                          >
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Remove Slot">
                          <IconButton 
                            onClick={() => deleteOvertime(day, index)}
                            sx={{ color: '#ef4444', background: '#fef2f2', '&:hover': { background: '#fee2e2' } }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        ))}
      </Box>

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
};

export default Availability;
