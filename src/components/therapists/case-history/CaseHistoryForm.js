import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Stack,
  MenuItem,
  Chip,
  OutlinedInput,
  Select,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";

const MSE_OPTIONS = {
  appearance: ["Neat & Clean", "Disheveled", "Inappropriate", "Poor Hygiene", "Bizarre", "Age Appropriate", "Malnourished"],
  behavior: ["Cooperative", "Guarded", "Hostile", "Withdrawn", "Hyperactive", "Eye Contact Good", "Avoidant Eye Contact", "Restless", "Agitated"],
  speech: ["Normal", "Pressured", "Slow", "Slurred", "Mute", "Loud", "Whispering", "Monotonous", "Stuttering"],
  mood: ["Euthymic", "Depressed", "Anxious", "Irritable", "Euphoric", "Labile", "Apathetic"],
  thoughtProcess: ["Coherent", "Flight of Ideas", "Loose Associations", "Tangential", "Circumstantial", "Word Salad", "Blocking"],
  perception: ["None", "Auditory Hallucinations", "Visual Hallucinations", "Illusions", "Depersonalization", "Derealization"],
  cognition: ["Alert", "Oriented x3", "Impaired Memory", "Poor Concentration", "Distractible", "Clouded Consciousness"],
  insight: ["Grade 1 (Complete Denial)", "Grade 2 (Slight Awareness)", "Grade 3 (Aware but blaming others)", "Grade 4 (Intellectual Insight)", "Grade 5 (True Emotional Insight)"],
  judgment: ["Good", "Fair", "Poor", "Impaired"],
};

const QUICK_COMPLAINTS = [
  "Sleep Disturbance", "Loss of Appetite", "Fatigue", "Hopelessness", "Excessive Worry", 
  "Panic Attacks", "Flashbacks", "Social Withdrawal", "Irritability", "Lack of Concentration",
  "Anxiety", "Sadness", "Mood Swings", "Low Self-Esteem", "Relationship Issues"
];

const QUICK_MEDICAL_HISTORY = [
  "No significant history", "Hypertension", "Diabetes", "Thyroid Issues", "Previous Counseling",
  "Family History of Mental Illness", "Chronic Pain", "Hospitalization History", "Under Medication"
];

export default function CaseHistoryForm() {
  const [formData, setFormData] = useState({
    // 1. Identifying Information
    clientName: "",
    age: "",
    gender: "",
    dob: "",
    maritalStatus: "",
    occupation: "",
    education: "",
    contactNumber: "",
    alternateContactNumber: "",
    email: "",
    address: "",
    referredBy: "",
    informant: "", // Who is giving info
    reliability: "", // Reliability of informant

    // 2. Clinical History
    presentingComplaints: "",
    medicalHistory: "",
    
    // 3. Detailed MSE (Selection based)
    mse: {
      appearance: "",
      behavior: "",
      speech: "",
      mood: "",
      thoughtProcess: "",
      perception: "",
      cognition: "",
      insight: "",
      judgment: "",
    },
    caseConceptualization: "",
  });

  const [savingStatus, setSavingStatus] = useState("idle"); // idle, saving, saved, error
  const [showSummary, setShowSummary] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("caseHistoryFormData");
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  const handleSave = useCallback(async (isAuto = false) => {
    if (!isAuto) setSavingStatus("saving");
    else setSavingStatus("autosaving");

    try {
      // Persist to local storage
      localStorage.setItem("caseHistoryFormData", JSON.stringify(formData));
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSavingStatus("saved");
      
      // Reset to idle after 3 seconds
      setTimeout(() => setSavingStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSavingStatus("error");
    }
  }, [formData]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (savingStatus !== "saving" && savingStatus !== "autosaving") {
        handleSave(true);
      }
    }, 3000); // 3 second debounce

    return () => clearTimeout(timer);
  }, [formData, handleSave, savingStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMseChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      mse: { ...prev.mse, [field]: value }
    }));
  };

  const toggleTag = (field, tag) => {
    const currentVal = formData[field] || "";
    const tags = currentVal.split(", ").filter(t => t.trim() !== "");
    
    let newVal;
    if (tags.includes(tag)) {
      newVal = tags.filter(t => t !== tag).join(", ");
    } else {
      newVal = tags.length > 0 ? `${currentVal}, ${tag}` : tag;
    }
    
    setFormData(prev => ({ ...prev, [field]: newVal }));
  };

  const toggleMseTag = (field, tag) => {
    const currentVal = formData.mse[field] || "";
    const tags = currentVal.split(", ").filter(t => t.trim() !== "");
    
    let newVal;
    if (tags.includes(tag)) {
      newVal = tags.filter(t => t !== tag).join(", ");
    } else {
      newVal = tags.length > 0 ? `${currentVal}, ${tag}` : tag;
    }
    
    setFormData(prev => ({
      ...prev,
      mse: { ...prev.mse, [field]: newVal }
    }));
  };

  const SectionTitle = ({ title, subtitle }) => (
    <Box sx={{ mb: 3, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a4d33', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 40, bgcolor: '#228756', borderRadius: 1 }} />
          {title}
        </Typography>
        {subtitle && <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>{subtitle}</Typography>}
      </Box>
      
      {title.includes("1.") && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '12px' }}>
          {savingStatus === "saving" || savingStatus === "autosaving" ? (
            <>
              <CircularProgress size={14} sx={{ color: '#228756' }} />
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Saving...</Typography>
            </>
          ) : savingStatus === "saved" ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 14, color: '#228756' }} />
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#228756' }}>Saved</Typography>
            </>
          ) : null}
        </Box>
      )}
    </Box>
  );

  const CaseSummaryPreview = ({ data }) => {
    const SummaryRow = ({ label, value }) => (
      <Box sx={{ mb: 2, display: 'flex', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
        <Typography sx={{ width: '180px', fontWeight: 700, color: '#64748b', fontSize: '14px' }}>{label}:</Typography>
        <Typography sx={{ flex: 1, fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>{value || 'Not provided'}</Typography>
      </Box>
    );

    const MSE_FIELDS = [
      { id: 'appearance', label: 'Appearance' },
      { id: 'behavior', label: 'Behavior' },
      { id: 'speech', label: 'Speech' },
      { id: 'mood', label: 'Mood' },
      { id: 'thoughtProcess', label: 'Thought' },
      { id: 'perception', label: 'Perception' },
      { id: 'cognition', label: 'Cognition' },
      { id: 'insight', label: 'Insight' },
      { id: 'judgment', label: 'Judgment' },
    ];

    return (
      <Box className="summary-print-container" sx={{ p: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a4d33', mb: 1 }}>CLINICAL CASE SUMMARY</Typography>
          <Typography variant="body2" color="text.secondary">Detailed Intake & Mental Status Record</Typography>
          <Divider sx={{ mt: 2, bgcolor: '#228756', height: 2 }} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#228756', fontWeight: 700, mb: 2, textTransform: 'uppercase', fontSize: '16px' }}>1. Personal Identification</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}><SummaryRow label="Patient Name" value={data.clientName} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Age / Gender" value={`${data.age} / ${data.gender}`} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Date of Birth" value={data.dob} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Marital Status" value={data.maritalStatus} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Occupation" value={data.occupation} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Education" value={data.education} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Contact" value={data.contactNumber} /></Grid>
            <Grid item xs={12} md={6}><SummaryRow label="Email" value={data.email} /></Grid>
            <Grid item xs={12}><SummaryRow label="Address" value={data.address} /></Grid>
            <Grid item xs={12}><SummaryRow label="Referred By" value={data.referredBy} /></Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#228756', fontWeight: 700, mb: 2, textTransform: 'uppercase', fontSize: '16px' }}>2. Clinical History</Typography>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '8px' }}>
            <Typography sx={{ fontWeight: 700, color: '#64748b', mb: 1, fontSize: '13px' }}>PRESENTING COMPLAINTS:</Typography>
            <Typography sx={{ color: '#1e293b', lineHeight: 1.6 }}>{data.presentingComplaints || 'None reported'}</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '8px' }}>
            <Typography sx={{ fontWeight: 700, color: '#64748b', mb: 1, fontSize: '13px' }}>MEDICAL HISTORY:</Typography>
            <Typography sx={{ color: '#1e293b', lineHeight: 1.6 }}>{data.medicalHistory || 'No significant history'}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#228756', fontWeight: 700, mb: 2, textTransform: 'uppercase', fontSize: '16px' }}>3. Mental Status Examination (MSE)</Typography>
          <Grid container spacing={2}>
            {MSE_FIELDS.map(field => (
              <Grid item xs={12} md={6} key={field.id}>
                <Box sx={{ p: 1.5, border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '12px', mb: 0.5 }}>{field.label.toUpperCase()}</Typography>
                  <Typography sx={{ color: '#1e293b', fontWeight: 500 }}>{data.mse[field.id] || 'Not recorded'}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#228756', fontWeight: 700, mb: 2, textTransform: 'uppercase', fontSize: '16px' }}>4. Case Conceptualization</Typography>
          <Box sx={{ p: 2.5, bgcolor: '#f0f9ff', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
            <Typography sx={{ color: '#0369a1', fontWeight: 500, lineHeight: 1.8, fontStyle: 'italic' }}>
              {data.caseConceptualization || 'No narrative conceptualization provided.'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 8, pt: 4, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Therapist Signature</Typography>
            <Box sx={{ mt: 4, width: 200, height: 1, bgcolor: '#000' }} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Date</Typography>
            <Typography sx={{ fontSize: '14px' }}>{new Date().toLocaleDateString()}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box component="form" className="clinical-case-history">
      <Stack spacing={4}>
        
        {/* 1. IDENTIFYING INFORMATION */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
          <SectionTitle title="1. Identifying Information" subtitle="Personal Identification & Background" />
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Name</Typography>
              <TextField 
                fullWidth 
                name="clientName" 
                value={formData.clientName} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="Name"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={6} md={1.5}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Age</Typography>
              <TextField 
                fullWidth 
                name="age" 
                type="number" 
                value={formData.age} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="00"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Date of Birth</Typography>
              <TextField 
                fullWidth 
                name="dob" 
                type="date" 
                value={formData.dob} 
                onChange={handleChange} 
                variant="standard" 
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FormControl component="fieldset" variant="standard">
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 1 }}>Gender</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {["Male", "Female", "Other"].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      onClick={() => setFormData(prev => ({ ...prev, gender: opt }))}
                      sx={{ 
                        fontSize: '14px', 
                        height: '40px', 
                        px: 2,
                        cursor: 'pointer',
                        bgcolor: formData.gender === opt ? '#eefdf5' : '#fff',
                        color: formData.gender === opt ? '#228756' : '#64748b',
                        border: `1px solid ${formData.gender === opt ? '#228756' : '#f1f5f9'}`,
                        fontWeight: formData.gender === opt ? 700 : 500,
                        transition: 'all 0.2s',
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#f8fafc' }
                      }}
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Occupation</Typography>
              <TextField 
                fullWidth 
                name="occupation" 
                value={formData.occupation} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="Occupation"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Education</Typography>
              <TextField 
                fullWidth 
                name="education" 
                value={formData.education} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="e.g. Post-Graduate"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <FormControl component="fieldset" variant="standard">
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 1 }}>Marital Status</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {["Single", "Married", "Divorced", "Widowed"].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      onClick={() => setFormData(prev => ({ ...prev, maritalStatus: opt }))}
                      sx={{ 
                        fontSize: '14px', 
                        height: '40px', 
                        px: 2,
                        cursor: 'pointer',
                        bgcolor: formData.maritalStatus === opt ? '#eefdf5' : '#fff',
                        color: formData.maritalStatus === opt ? '#228756' : '#64748b',
                        border: `1px solid ${formData.maritalStatus === opt ? '#228756' : '#f1f5f9'}`,
                        fontWeight: formData.maritalStatus === opt ? 700 : 500,
                        transition: 'all 0.2s',
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#f8fafc' }
                      }}
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Contact Details</Typography>
              <TextField 
                fullWidth 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="+91 XXXXX XXXXX"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Alternative Phone</Typography>
              <TextField 
                fullWidth 
                name="alternateContactNumber" 
                value={formData.alternateContactNumber} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="+91 XXXXX XXXXX"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Email ID</Typography>
              <TextField 
                fullWidth 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="example@email.com"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Referred By / Source</Typography>
              <TextField 
                fullWidth 
                name="referredBy" 
                value={formData.referredBy} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="Source of referral"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Address</Typography>
              <TextField 
                fullWidth 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="Enter complete address"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 2. CLINICAL PRESENTATION */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
          <SectionTitle title="2. Clinical Presentation" subtitle="Clinical Complaints & Medical History" />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 1 }}>Quick Select: Presenting Complaints</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {QUICK_COMPLAINTS.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => toggleTag('presentingComplaints', tag)}
                    sx={{ 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      bgcolor: formData.presentingComplaints.includes(tag) ? '#eefdf5' : '#f8fafc',
                      color: formData.presentingComplaints.includes(tag) ? '#228756' : '#64748b',
                      border: `1px solid ${formData.presentingComplaints.includes(tag) ? '#228756' : '#f1f5f9'}`,
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  />
                ))}
              </Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Presenting Complaints</Typography>
              <TextField 
                fullWidth 
                name="presentingComplaints" 
                multiline
                rows={2}
                value={formData.presentingComplaints} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="Enter presenting complaints"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 1 }}>Quick Select: Medical History</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {QUICK_MEDICAL_HISTORY.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => toggleTag('medicalHistory', tag)}
                    sx={{ 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      bgcolor: formData.medicalHistory.includes(tag) ? '#eefdf5' : '#f8fafc',
                      color: formData.medicalHistory.includes(tag) ? '#228756' : '#64748b',
                      border: `1px solid ${formData.medicalHistory.includes(tag) ? '#228756' : '#f1f5f9'}`,
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  />
                ))}
              </Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 0.5 }}>Medical History</Typography>
              <TextField 
                fullWidth 
                name="medicalHistory" 
                multiline
                rows={2}
                value={formData.medicalHistory} 
                onChange={handleChange} 
                variant="standard" 
                placeholder="Enter medical history"
                inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 3. MENTAL STATUS EXAMINATION (MSE) */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
          <SectionTitle title="3. Mental Status Examination" subtitle="Detailed behavioral & cognitive assessment" />
          
          <Grid container spacing={4}>
            {[
              { id: 'appearance', label: 'General Appearance' },
              { id: 'behavior', label: 'Behavior & Psychomotor Activity' },
              { id: 'speech', label: 'Speech' },
              { id: 'mood', label: 'Mood & Affect' },
              { id: 'thoughtProcess', label: 'Thought Process' },
              { id: 'perception', label: 'Perception' },
              { id: 'cognition', label: 'Cognition / Orientation' },
              { id: 'insight', label: 'Insight' },
              { id: 'judgment', label: 'Judgment' },
            ].map((mseField) => (
              <Grid item xs={12} md={6} key={mseField.id}>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 1 }}>{mseField.label}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  {MSE_OPTIONS[mseField.id].map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => toggleMseTag(mseField.id, tag)}
                      sx={{ 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        bgcolor: formData.mse[mseField.id].includes(tag) ? '#eefdf5' : '#fff',
                        color: formData.mse[mseField.id].includes(tag) ? '#228756' : '#64748b',
                        border: `1px solid ${formData.mse[mseField.id].includes(tag) ? '#228756' : '#f1f5f9'}`,
                      }}
                    />
                  ))}
                </Box>
                <TextField 
                  fullWidth 
                  variant="standard" 
                  placeholder={`Details about ${mseField.label.toLowerCase()}...`}
                  value={formData.mse[mseField.id]}
                  onChange={(e) => handleMseChange(mseField.id, e.target.value)}
                  inputProps={{ sx: { fontSize: '15px', py: 0.5, fontWeight: 500, color: '#1e293b' } }}
                  sx={{
                    '& .MuiInput-underline:before': { borderBottomColor: '#f1f5f9' },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#228756' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#228756' },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 4. CASE CONCEPTUALIZATION */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
          <SectionTitle title="4. Case Conceptualization" subtitle="Narrative understanding & formulation of the case" />
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#64748b', mb: 1.5 }}>Formulation (Narrative Sentence Form)</Typography>
            <TextField 
              fullWidth 
              multiline 
              rows={6} 
              placeholder="Describe the case conceptualization here... (e.g., 'The patient presents with symptoms of anxiety triggered by work-related stress, which appears to be rooted in early childhood experiences of high performance expectations...')" 
              name="caseConceptualization" 
              value={formData.caseConceptualization} 
              onChange={handleChange} 
              variant="outlined"
              inputProps={{ sx: { fontSize: '15px', py: 1, fontWeight: 500, color: '#1e293b', lineHeight: 1.6 } }}
              sx={{
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  bgcolor: '#fcfcfc',
                  '& fieldset': { borderColor: '#f1f5f9' },
                  '&:hover fieldset': { borderColor: '#228756' },
                  '&.Mui-focused fieldset': { borderColor: '#228756' },
                } 
              }}
            />
          </Box>
        </Paper>

      </Stack>

      <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowSummary(true)}
          startIcon={<VisibilityIcon />}
          sx={{
            bgcolor: '#f8fafc',
            color: '#1e293b',
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none',
            border: '1px solid #e2e8f0',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#f1f5f9',
              boxShadow: 'none',
              border: '1px solid #cbd5e1',
            },
          }}
        >
          View Case Summary
        </Button>

        <Button
          variant="contained"
          onClick={() => handleSave()}
          disabled={savingStatus === "saving"}
          startIcon={savingStatus === "saving" ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            bgcolor: '#228756',
            color: '#fff',
            borderRadius: '12px',
            px: 6,
            py: 1.5,
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 14px 0 rgba(34, 135, 86, 0.39)',
            '&:hover': {
              bgcolor: '#1b6843',
              boxShadow: '0 6px 20px rgba(34, 135, 86, 0.23)',
            },
          }}
        >
          {savingStatus === "saving" ? "Saving..." : "Save Case History"}
        </Button>
        
        {savingStatus === "saved" && (
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#228756', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>All changes saved</Typography>
          </Box>
        )}
      </Box>

      {/* Case Summary Dialog */}
      <Dialog 
        open={showSummary} 
        onClose={() => setShowSummary(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a4d33' }}>Case History Summary</Typography>
          <Box>
            <IconButton onClick={() => window.print()} sx={{ color: '#228756', mr: 1 }}>
              <PrintIcon />
            </IconButton>
            <IconButton onClick={() => setShowSummary(false)} sx={{ color: '#64748b' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: 'none' }}>
          <CaseSummaryPreview data={formData} />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowSummary(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', px: 4, py: 1, fontWeight: 700, color: '#64748b', borderColor: '#e2e8f0' }}
          >
            Close Preview
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ bgcolor: '#228756', borderRadius: '12px', px: 4, py: 1, fontWeight: 700, '&:hover': { bgcolor: '#1b6843' } }}
          >
            Print Summary
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .MuiDialog-root, .MuiDialog-root * { visibility: visible; }
          .MuiDialog-root { 
            position: absolute; 
            left: 0; 
            top: 0; 
            margin: 0; 
            padding: 0; 
            width: 100%;
          }
          .MuiDialogActions-root, .MuiIconButton-root { display: none !important; }
          .MuiPaper-root { 
            box-shadow: none !important; 
            border: none !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          .summary-print-container { padding: 0 !important; }
        }
      `}</style>
    </Box>
  );
}
