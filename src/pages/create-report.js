import React, { useState, useEffect } from "react";
import MainLayout from "../components/therapists/main-layout";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  MenuItem, 
  Divider,
  Breadcrumbs,
  InputAdornment,
  Avatar as MuiAvatar
} from "@mui/material";
import { 
  FaFileAlt, 
  FaUser, 
  FaNotesMedical, 
  FaSave, 
  FaDownload,
  FaChevronRight,
  FaClipboardList,
  FaPills,
  FaHistory,
  FaPrint,
  FaBriefcase
} from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useTherapistStore from "../store/therapistStore";

export default function CreateReport() {
  const { therapistInfo } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Demographic Details
    clientName: "",
    age: "",
    gender: "",
    occupation: "",
    maritalStatus: "",
    reportDate: dayjs(),
    
    // Clinical Details
    sessionType: "Therapy Session",
    primaryComplaint: "",
    clinicalSummary: "",
    mentalStateExamination: "",
    prognosis: "",
    
    // Prescription & Tasks
    tasksAssigned: "",
    prescription: "",
    recommendations: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const primaryColor = [34, 135, 86];
    const primaryDark = [21, 84, 54];
    const secondaryColor = [30, 41, 59];
    const lightBg = [248, 250, 252];
    const refId = `CYT-REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // --- Load logo as base64 ---
    const getBase64Image = (url) => new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
    const logoBase64 = await getBase64Image("/favicon.png");

    // 1. Header — dark green bar
    doc.setFillColor(...primaryDark);
    doc.rect(0, 0, 210, 34, 'F');

    // Logo — white circle background (perfectly centered around logo)
    const logoSize = 20;
    const logoX = 8;
    const logoY = 7;
    const cx = logoX + logoSize / 2;
    const cy = logoY + logoSize / 2;
    const radius = logoSize / 2 + 2;
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, radius, 'F');
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", logoX, logoY, logoSize, logoSize);
    }

    // Brand name
    const textX = logoX + logoSize + 6;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CHOOSE YOUR THERAPIST LLP", textX, 14);

    // Website — tight gap below name, no line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(167, 243, 208);
    doc.text("WWW.CHOOSEYOURTHERAPIST.IN", textX, 20);

    // Ref ID top right
    doc.setFontSize(7.5);
    doc.setTextColor(200, 240, 220);
    doc.text(refId, 202, 8, { align: "right" });

    // 2. Report Title — simple, white bg, centered
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 34, 210, 18, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...secondaryColor);
    doc.text("SESSION SUMMARY", 105, 42, { align: "center" });

    // Thin line below SESSION SUMMARY heading
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(60, 45, 150, 45);

    // Caption line below heading
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const captionText = `Prepared by: ${therapistInfo?.user?.name || "Certified Therapist"}  ·  ${therapistInfo?.profile_type || "Mental Health Professional"}  ·  Session Date: ${formData.reportDate.format('DD MMMM YYYY')}`;
    doc.text(captionText, 105, 51, { align: "center" });

    // 4. Demographic Section
    doc.setFillColor(...lightBg);
    doc.rect(10, 60, 190, 38, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, 60, 190, 38, 'S');

    // Green left accent bar
    doc.setFillColor(...primaryColor);
    doc.rect(10, 60, 3, 38, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT & SESSION INFORMATION", 17, 67);
    
    doc.setTextColor(50);
    doc.setFontSize(10);
    
    const drawField = (label, value, x, y) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, x, y);
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont("helvetica", "normal");
      doc.text(`${value || "N/A"}`, x + labelWidth, y);
    };

    // Row 1
    drawField("Name", formData.clientName, 17, 75);
    drawField("Age", formData.age, 87, 75);
    drawField("Gender", formData.gender, 147, 75);

    // Row 2
    drawField("Occupation", formData.occupation, 17, 83);
    drawField("Marital Status", formData.maritalStatus, 87, 83);
    drawField("Session Date", formData.reportDate.format('DD/MM/YYYY'), 147, 83);

    // Row 3
    drawField("Session Type", formData.sessionType, 17, 91);
    if (formData.prognosis) {
      drawField("Prognosis", formData.prognosis, 107, 91);
    }

    // 5. Assessment Sections
    let currentY = 105;

    const FOOTER_TOP = 275; // footer starts here, content must stay above
    const PAGE_BREAK_AT = FOOTER_TOP - 20; // safe threshold before footer

    const drawSection = (title, content) => {
      if (!content) return;
      const lines = doc.splitTextToSize(content, 190);
      const neededH = (lines.length * 5) + 16;
      if (currentY + neededH > PAGE_BREAK_AT) { doc.addPage(); currentY = 25; }

      // Caption label — green
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...primaryColor);
      doc.text(title.toUpperCase(), 10, currentY);


      // Content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(content, 10, currentY + 8, { maxWidth: 190, align: 'left' });

      const splitText = doc.splitTextToSize(content, 190);
      currentY += (splitText.length * 5) + 14;
    };

    drawSection("Primary Complaint", formData.primaryComplaint);
    drawSection("Mental State Examination (MSE)", formData.mentalStateExamination);
    drawSection("Observation", formData.clinicalSummary);

    // 6. Therapeutic Tasks Card — premium styled
    if (formData.tasksAssigned || formData.prescription) {
      // Count bullet lines for height calculation
      const countBulletH = (text) => {
        if (!text) return 0;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let h = 0;
        lines.forEach(line => {
          const wrapped = doc.splitTextToSize(line, 165);
          h += (wrapped.length * 5) + 2;
        });
        return h;
      };
      const tasksBlockH = formData.tasksAssigned ? countBulletH(formData.tasksAssigned) + 14 : 0;
      const rxBlockH = formData.prescription ? countBulletH(formData.prescription) + 14 : 0;
      const cardH = 14 + tasksBlockH + rxBlockH + 6;

      if (currentY + cardH > PAGE_BREAK_AT) { doc.addPage(); currentY = 25; }

      // Helper — draw bullet points from line-by-line text
      const drawBullets = (text, startX, startY) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let y = startY;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        lines.forEach(line => {
          const wrapped = doc.splitTextToSize(line, 175);
          doc.setTextColor(...primaryColor);
          doc.text("•", startX, y);
          doc.setTextColor(30, 41, 59);
          doc.text(wrapped, startX + 5, y, { maxWidth: 175 });
          y += (wrapped.length * 5) + 0.5;
        });
        return y;
      };

      let textY = currentY + 4;

      if (formData.tasksAssigned) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...primaryColor);
        doc.text("HOMEWORK ASSIGNED", 10, textY);
        textY += 6;
        textY = drawBullets(formData.tasksAssigned, 10, textY);
        textY += 6;
      }

      if (formData.prescription) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...primaryColor);
        doc.text("THERAPEUTIC SOLUTION", 10, textY);
        textY += 6;
        drawBullets(formData.prescription, 10, textY);
      }

      currentY += cardH + 8;
    }

    // 7. Watermark & Brand Footer for all pages
    const pageCount = doc.internal.getNumberOfPages();
    const disclaimer = "Note: This document is a digital summary intended for follow-up reference only. It has been generated based on information provided during consultations with your chosen practitioner on the Choose Your Therapist platform.";
    
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Watermark — favicon logo centered
      if (logoBase64) {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.06 }));
        doc.addImage(logoBase64, "PNG", 75, 110, 60, 60);
        doc.restoreGraphicsState();
      }

      // Green footer bar with disclaimer + page number
      doc.setFillColor(...primaryColor);
      doc.rect(0, 278, 210, 19, 'F');
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(255, 255, 255);
      doc.text("This document is a digital summary intended for follow-up reference only. It has been generated based on information provided during", 105, 284, { align: "center" });
      doc.text("consultations with your chosen practitioner on the Choose Your Therapist platform.", 105, 290, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(`Page ${i} of ${pageCount}`, 200, 295, { align: "right" });
    }

    // Signature — placed after content, before footer
    const sigY = Math.min(currentY + 6, PAGE_BREAK_AT - 18);
    doc.setDrawColor(200);
    doc.line(140, sigY, 200, sigY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(therapistInfo?.user?.name || "Authorised Signature", 170, sigY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(therapistInfo?.profile_type || "Mental Health Professional", 170, sigY + 10, { align: "center" });

    // Open in New Tab
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName) {
      toast.error("Client Name is required");
      return;
    }
    setLoading(true);
    
    // Simulate API call
    setTimeout(async () => {
      toast.success("Clinical Report Saved Successfully!");
      await generatePDF();
      setLoading(false);
    }, 1500);
  };

  return (
    <MainLayout>
      <Box sx={{ pb: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Breadcrumbs separator={<FaChevronRight size={10} />} sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { color: '#94a3b8' } }}>
              <Link href="/therapist-dashboard" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Dashboard</Link>
              <Typography sx={{ fontSize: '13px', color: '#228756', fontWeight: 700 }}>Mental Health Report</Typography>
            </Breadcrumbs>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
              New Clinical Assessment
            </Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
              Specialized mental health report with demographic and prescription details.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              variant="outlined" 
              startIcon={<FaDownload />}
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none', 
                fontWeight: 700, 
                borderColor: '#e2e8f0', 
                color: '#64748b',
                px: 3,
                '&:hover': { borderColor: '#cbd5e1', background: '#f8fafc' }
              }}
            >
              Export PDF
            </Button>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Left Column - Detailed Sections */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                
                {/* Section 1: Demographics */}
                <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb' }}>
                      <FaUser />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Demographic Details</Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>Basic client identification and background information</Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={labelStyle}>Client Full Name</Typography>
                      <TextField 
                        fullWidth 
                        name="clientName" 
                        value={formData.clientName} 
                        onChange={handleChange} 
                        sx={inputStyle}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><FaUser size={14} color="#94a3b8" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography sx={labelStyle}>Age</Typography>
                      <TextField 
                        fullWidth 
                        name="age" 
                        type="number" 
                        value={formData.age} 
                        onChange={handleChange} 
                        sx={inputStyle} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography sx={labelStyle}>Gender</Typography>
                      <TextField select fullWidth name="gender" value={formData.gender} onChange={handleChange} sx={inputStyle}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={labelStyle}>Occupation</Typography>
                      <TextField 
                        fullWidth 
                        name="occupation" 
                        value={formData.occupation} 
                        onChange={handleChange} 
                        sx={inputStyle}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><FaBriefcase size={14} color="#94a3b8" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={labelStyle}>Marital Status</Typography>
                      <TextField select fullWidth name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} sx={inputStyle}>
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="In a Relationship">In a Relationship</MenuItem>
                        <MenuItem value="Married">Married</MenuItem>
                        <MenuItem value="Separated">Separated</MenuItem>
                        <MenuItem value="Divorced">Divorced</MenuItem>
                        <MenuItem value="Widowed">Widowed</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Section 2: Clinical Assessment */}
                <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Avatar sx={{ bgcolor: '#f0fdf4', color: '#228756' }}>
                      <FaNotesMedical />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Clinical Assessment</Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography sx={labelStyle}>Primary Complaint / Reason for Visit</Typography>
                      <TextField fullWidth multiline rows={2} name="primaryComplaint" value={formData.primaryComplaint} onChange={handleChange} sx={textAreaStyle} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={labelStyle}>Mental State Examination (MSE)</Typography>
                      <TextField fullWidth multiline rows={3} placeholder="Appearance, Behavior, Mood, Affect, Thought Process..." name="mentalStateExamination" value={formData.mentalStateExamination} onChange={handleChange} sx={textAreaStyle} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={labelStyle}>Clinical Summary & Observations</Typography>
                      <TextField fullWidth multiline rows={4} name="clinicalSummary" value={formData.clinicalSummary} onChange={handleChange} sx={textAreaStyle} />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Section 3: Prescriptions & Tasks */}
                <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#fffcf5', borderColor: '#fef3c7' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c' }}>
                      <FaClipboardList />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Tasks & Prescriptions</Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography sx={labelStyle}>Therapeutic Tasks / Homework Assigned</Typography>
                      <TextField fullWidth multiline rows={3} placeholder="e.g. Daily Journaling, Guided Meditation 15min, Sleep Hygiene..." name="tasksAssigned" value={formData.tasksAssigned} onChange={handleChange} sx={textAreaStyle} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={labelStyle}>Suggested Remedies / Prescription</Typography>
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        name="prescription" 
                        value={formData.prescription} 
                        onChange={handleChange} 
                        sx={textAreaStyle} 
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1, mr: 1 }}><FaPills color="#cbd5e1" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>

            {/* Right Column - Status & Controls */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: { lg: 'sticky' }, top: '100px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>Report Settings</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography sx={labelStyle}>Session Date</Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={formData.reportDate}
                          onChange={(newDate) => setFormData({ ...formData, reportDate: newDate })}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: inputStyle
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>

                    <Box>
                      <Typography sx={labelStyle}>Session Type</Typography>
                      <TextField select fullWidth name="sessionType" value={formData.sessionType} onChange={handleChange} sx={inputStyle}>
                        <MenuItem value="Online">Online</MenuItem>
                        <MenuItem value="In-Person">In-Person</MenuItem>
                        <MenuItem value="Home Visit">Home Visit</MenuItem>
                        <MenuItem value="Therapy Session">Therapy Session</MenuItem>
                        <MenuItem value="Initial Consultation">Initial Consultation</MenuItem>
                        <MenuItem value="Diagnostic Interview">Diagnostic Interview</MenuItem>
                        <MenuItem value="Crisis Intervention">Crisis Intervention</MenuItem>
                      </TextField>
                    </Box>

                    <Box>
                      <Typography sx={labelStyle}>Prognosis <span style={{ color: '#cbd5e1', fontWeight: 500, textTransform: 'none' }}>(optional)</span></Typography>
                      <TextField select fullWidth name="prognosis" value={formData.prognosis} onChange={handleChange} sx={inputStyle}>
                        <MenuItem value="">— Not Specified —</MenuItem>
                        <MenuItem value="Excellent">Excellent</MenuItem>
                        <MenuItem value="Favorable">Favorable</MenuItem>
                        <MenuItem value="Guarded">Guarded</MenuItem>
                        <MenuItem value="Poor">Poor</MenuItem>
                      </TextField>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? null : <FaSave />}
                    sx={{ 
                      bgcolor: '#228756', 
                      '&:hover': { bgcolor: '#1b6843' }, 
                      py: 2, 
                      borderRadius: '16px', 
                      fontWeight: 900, 
                      textTransform: 'none', 
                      fontSize: '1.1rem',
                      boxShadow: '0 8px 20px rgba(34, 135, 86, 0.2)'
                    }}
                  >
                    {loading ? "Saving Report..." : "Complete & Save"}
                  </Button>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaFileAlt color="#94a3b8" /> Guidelines
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '12.5px', lineHeight: 1.5 }}>
                    Reports are encrypted and stored securely. Homework assigned will be visible to the client in their portal.
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </MainLayout>
  );
}

const labelStyle = { 
  fontSize: 12, 
  color: '#94a3b8', 
  fontWeight: 800, 
  mb: 0.8, 
  textTransform: 'uppercase', 
  letterSpacing: 0.5 
};

const inputStyle = { 
  '& .MuiOutlinedInput-root': { 
    borderRadius: '12px',
    background: '#ffffff',
    height: '56px',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { 
      borderColor: '#e2e8f0', 
      borderWidth: '1px',
      borderRadius: '12px', // Explicitly set for the border edge
      transition: 'all 0.2s ease-in-out' 
    },
    '&:hover fieldset': { 
      borderColor: '#cbd5e1',
      borderWidth: '1px'
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
    },
    '&.Mui-focused fieldset': { 
      borderColor: '#228756', 
      borderWidth: '2px !important',
      boxShadow: '0 0 0 4px rgba(34, 135, 86, 0.04)'
    },
    '& .MuiOutlinedInput-input': { 
      fontSize: '15px',
      fontWeight: 500,
      color: '#1e293b',
      height: '100%',
      boxSizing: 'border-box',
    },
    '& .MuiInputAdornment-root': {
      marginRight: '8px',
      marginLeft: '12px'
    }
  },
  '& .MuiSelect-select': {
    height: '56px !important',
    display: 'flex !important',
    alignItems: 'center !important',
    paddingLeft: '16px !important',
    boxSizing: 'border-box',
    borderRadius: '12px'
  }
};

const textAreaStyle = {
  ...inputStyle,
  '& .MuiOutlinedInput-root': {
    ...inputStyle['& .MuiOutlinedInput-root'],
    height: 'auto',
    minHeight: '100px',
    padding: '12px 4px',
    '& .MuiOutlinedInput-input': {
      padding: '4px 12px',
      height: 'auto',
      lineHeight: '1.6'
    }
  }
};

const Avatar = ({ children, sx }) => (
  <Box sx={{ 
    width: 44, 
    height: 44, 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontSize: '20px',
    ...sx 
  }}>
    {children}
  </Box>
);
