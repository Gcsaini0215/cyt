import React, { useState, useEffect } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  IconButton, 
  Paper, 
  Tooltip,
  Chip,
  Fade,
  Divider,
  Grid
} from "@mui/material";
import { 
  FiBook, 
  FiSave, 
  FiTrash2, 
  FiChevronLeft, 
  FiChevronRight, 
  FiSmile, 
  FiFrown, 
  FiMeh,
  FiCalendar,
  FiClock,
  FiEdit3,
  FiShare2,
  FiDownload,
  FiPlus,
  FiZap,
  FiSearch
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import { 
  Drawer,
  InputBase,
  Collapse
} from "@mui/material";

const journalPrompts = [
  "What are three things you are grateful for today?",
  "Describe a challenge you faced and how you handled it.",
  "What is one thing you want to let go of this week?",
  "How did you practice self-care today?",
  "What is a goal you're currently working towards?",
  "Who is someone who made you smile today and why?",
  "What's one thing you're looking forward to tomorrow?",
  "If you could give your younger self advice, what would it be?",
  "What was the most peaceful moment of your day?",
  "What is a strength you used today?",
  "Describe a moment where you felt proud of yourself.",
  "What are you feeling right now? Explore it without judgment."
];

const moods = [
  { label: "Great", icon: <FiSmile />, color: "#22c55e", bg: "#f0fdf4" },
  { label: "Good", icon: <FiSmile />, color: "#84cc16", bg: "#f7fee7" },
  { label: "Okay", icon: <FiMeh />, color: "#f59e0b", bg: "#fffbeb" },
  { label: "Down", icon: <FiFrown />, color: "#f97316", bg: "#fff7ed" },
  { label: "Bad", icon: <FiFrown />, color: "#ef4444", bg: "#fef2f2" }
];

const penColors = [
  { name: "Midnight", value: "#2c3e50" },
  { name: "Ink Blue", value: "#1e3a8a" },
  { name: "Classic", value: "#1a1a1a" },
  { name: "Deep Red", value: "#991b1b" },
  { name: "Forest", value: "#065f46" }
];

const penFonts = [
  { name: "Elegant", family: "'Caveat', cursive" },
  { name: "Handwritten", family: "'Patrick Hand', cursive" },
  { name: "Artistic", family: "'Architects Daughter', cursive" },
  { name: "Playful", family: "'Indie Flower', cursive" }
];

const PenKit = ({ selectedColor, onColorChange, selectedFont, onFontChange }) => (
  <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid #e2e8f0", bgcolor: "#ffffff", position: "sticky", top: "100px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
    <Typography sx={{ fontWeight: 950, color: "#1e293b", mb: 4, display: "flex", alignItems: "center", gap: 2, fontSize: "24px", letterSpacing: "-0.5px" }}>
      <FiEdit3 style={{ color: "#228756", fontSize: "28px" }} /> Pen Tool Kit
    </Typography>
    
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", mb: 2, textTransform: "uppercase", letterSpacing: "1px" }}>Ink Color</Typography>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
        {penColors.map((color) => (
          <Tooltip key={color.name} title={color.name}>
            <Box 
              onClick={() => onColorChange(color.value)}
              sx={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                bgcolor: color.value, 
                cursor: "pointer", 
                border: selectedColor === color.value ? "2.5px solid #228756" : "2px solid #f1f5f9",
                transition: "all 0.2s",
                transform: selectedColor === color.value ? "scale(1.2)" : "scale(1)",
                boxShadow: selectedColor === color.value ? `0 4px 12px ${color.value}40` : "none",
                "&:hover": { transform: "scale(1.15)" }
              }} 
            />
          </Tooltip>
        ))}
      </Stack>
    </Box>

    <Box>
      <Typography sx={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", mb: 2, textTransform: "uppercase", letterSpacing: "1px" }}>Writing Style</Typography>
      <Stack spacing={1}>
        {penFonts.map((font) => (
          <Button
            key={font.name}
            onClick={() => onFontChange(font.family)}
            fullWidth
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontFamily: font.family,
              fontSize: "18px",
              color: selectedFont === font.family ? "#228756" : "#475569",
              bgcolor: selectedFont === font.family ? "#f0fdf4" : "transparent",
              px: 2,
              py: 1,
              borderRadius: "12px",
              border: selectedFont === font.family ? "1px solid #228756" : "1px solid #f1f5f9",
              "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
              transition: "all 0.2s"
            }}
          >
            {font.name} Pen
          </Button>
        ))}
      </Stack>
    </Box>
    
    <Box sx={{ mt: 4, pt: 3, borderTop: "1px dashed #e2e8f0" }}>
      <Typography sx={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", fontStyle: "italic", lineHeight: 1.5 }}>
        These settings are virtual. Real handwriting may vary.
      </Typography>
    </Box>
  </Paper>
);

export default function DailyJournalPage() {
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [promptIndex, setActivePromptIndex] = useState(0);
  const [savedEntries, setSavedEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Pen Settings
  const [penColor, setPenColor] = useState("#2c3e50");
  const [penFont, setPenFont] = useState("'Caveat', cursive");

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("cyt_journal_entries");
    if (saved) setSavedEntries(JSON.parse(saved));
    
    const draft = localStorage.getItem("cyt_journal_draft");
    if (draft) setContent(draft);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cyt_journal_draft", content);
    }
  }, [content, isClient]);

  const handleSave = () => {
    if (!content.trim()) {
      toast.warning("Please write something before saving.");
      return;
    }
    
    setIsSaving(true);
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      content: content,
      mood: selectedMood,
      prompt: showPrompt ? journalPrompts[promptIndex] : "Freestyle Entry"
    };

    const updatedEntries = [newEntry, ...savedEntries];
    setSavedEntries(updatedEntries);
    localStorage.setItem("cyt_journal_entries", JSON.stringify(updatedEntries));
    localStorage.removeItem("cyt_journal_draft");
    setContent("");
    setSelectedMood(null);
    setShowPrompt(false);
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Journal entry saved successfully!");
    }, 800);
  };

  const handleDelete = (id) => {
    const updated = savedEntries.filter(entry => entry.id !== id);
    setSavedEntries(updated);
    localStorage.setItem("cyt_journal_entries", JSON.stringify(updated));
    toast.info("Entry deleted.");
  };

  const nextPrompt = () => setActivePromptIndex((prev) => (prev + 1) % journalPrompts.length);
  const prevPrompt = () => setActivePromptIndex((prev) => (prev - 1 + journalPrompts.length) % journalPrompts.length);

  const generateEntryPDF = (entry) => {
    const doc = new jsPDF();
    const primaryColor = [34, 135, 86]; // #228756
    const secondaryColor = [30, 41, 59]; // #1e293b
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CHOOSE YOUR THERAPIST", 105, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Your Daily Journal Entry", 105, 18, { align: "center" });

    // Entry Info
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Date: ${entry.date}`, 15, 40);
    doc.text(`Time: ${entry.time}`, 150, 40);
    
    if (entry.mood) {
      doc.text(`Mood: ${entry.mood}`, 15, 50);
    }
    
    // Prompt
    if (entry.prompt && entry.prompt !== "Freestyle Entry") {
      doc.setFillColor(241, 248, 245);
      doc.rect(15, 60, 180, 20, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text("DAILY PROMPT:", 20, 67);
      doc.setTextColor(...secondaryColor);
      doc.setFont("helvetica", "italic");
      doc.text(`"${entry.prompt}"`, 20, 74, { maxWidth: 170 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      const splitContent = doc.splitTextToSize(entry.content, 180);
      doc.text(splitContent, 15, 95);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      const splitContent = doc.splitTextToSize(entry.content, 180);
      doc.text(splitContent, 15, 65);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated via chooseyourtherapist.in • Private & Confidential", 105, 285, { align: "center" });

    doc.save(`journal-${entry.id}.pdf`);
    toast.info("PDF Downloaded!");
  };

  return (
    <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh" }}>
      <Head>
        <title>Daily Journaling | Your Private Digital Diary | Choose Your Therapist</title>
        <meta name="description" content="Maintain your mental well-being with our secure, private digital journal. Track your moods, respond to guided prompts, and export your thoughts to PDF." />
        <meta name="keywords" content="digital journal, online diary, mental health tools, mood tracker, daily reflection, mindfulness journal, private journaling" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/daily-journal" />
        <meta property="og:title" content="Daily Journaling | Your Private Digital Diary" />
        <meta property="og:description" content="A safe, private space to express your thoughts and track your emotional journey." />
        <meta property="og:image" content="https://i.postimg.cc/XY3MvFhM/digitaljournal.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.chooseyourtherapist.in/daily-journal" />
        <meta name="twitter:title" content="Daily Journaling | Your Private Digital Diary" />
        <meta name="twitter:description" content="A safe, private space to express your thoughts and track your emotional journey." />
        <meta name="twitter:image" content="https://i.postimg.cc/XY3MvFhM/digitaljournal.jpg" />

        {/* Canonical Link */}
        <link rel="canonical" href="https://www.chooseyourtherapist.in/daily-journal" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Indie+Flower&family=Patrick+Hand&family=Architects+Daughter&display=swap" rel="stylesheet" />
      </Head>

      {isClient && (
        <>
          <MyNavbar />
          <ToastContainer position="bottom-right" theme="colored" />

      {/* Hero Section Simplified */}
      <Box sx={{ 
        background: "linear-gradient(135deg, #1a4d32 0%, #228756 100%)", 
        pt: { xs: 8, md: 10 }, 
        pb: { xs: 10, md: 12 },
        color: "#ffffff",
        textAlign: "center"
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ 
            fontWeight: 950, 
            mb: 1.5, 
            letterSpacing: "-2px", 
            fontSize: { xs: "40px", md: "64px" },
            color: "#ffffff",
            textShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "'Inter', sans-serif"
          }}>
            Digital Journaling
          </Typography>
          <Typography sx={{ 
            opacity: 0.9, 
            color: "#ffffff",
            fontWeight: 600, 
            fontSize: { xs: "16px", md: "20px" },
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6
          }}>
            A private space to write down your thoughts, emotions, and everything in between.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -10, pb: 10, position: "relative", zIndex: 2 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Main Journaling Area */}
          <Grid item xs={12} lg={8.5}>
            {/* DIARY CARD */}
            <Paper 
              elevation={0} 
              sx={{ 
                py: { xs: 4, md: 6 }, 
                px: 0,
                borderRadius: "4px 20px 20px 4px", 
                bgcolor: "#fffdf0", 
                backgroundImage: "radial-gradient(#fcf7e1 1px, transparent 1px)", 
                backgroundSize: "20px 20px",
                border: "1px solid #e5e1c5",
                boxShadow: "0 40px 80px -15px rgba(0,0,0,0.15), inset -20px 0 40px rgba(0,0,0,0.02)",
                position: "relative",
                overflow: "hidden",
              "&::before": { // Notebook red margin line
                content: '""',
                position: "absolute",
                left: { xs: "35px", md: "75px" },
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "#fecaca",
                zIndex: 1
              },
              "&::after": { // Binding shadow
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: { xs: "25px", md: "55px" },
                background: "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 40%, transparent 100%)",
                zIndex: 3,
                pointerEvents: "none"
              }
            }}
          >
            {/* Binding Holes & Spirals */}
            <Box sx={{ 
              position: "absolute", 
              left: { xs: "5px", md: "15px" }, 
              top: 0, 
              bottom: 0, 
              zIndex: 4, 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-around",
              py: 6,
              pointerEvents: "none"
            }}>
              {[...Array(14)].map((_, i) => (
                <Box key={i} sx={{ 
                  width: { xs: "12px", md: "18px" }, 
                  height: { xs: "8px", md: "12px" }, 
                  borderRadius: "4px", 
                  bgcolor: "#e2e8f0", 
                  boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), 1px 1px 0px white",
                  border: "1px solid #cbd5e1",
                  position: "relative",
                  "&::after": { // Spiral wire effect
                    content: '""',
                    position: "absolute",
                    left: "-15px",
                    top: "50%",
                    width: "25px",
                    height: "4px",
                    borderRadius: "10px",
                    background: "linear-gradient(to bottom, #94a3b8, #cbd5e1, #94a3b8)",
                    transform: "rotate(-10deg)"
                  }
                }} />
              ))}
            </Box>

            {/* Header Info */}
            <Stack direction="column" alignItems="flex-end" mb={4} spacing={1} sx={{ px: { xs: 3, md: 6 } }}>
              <Box sx={{ pr: { xs: 0, md: 0 }, zIndex: 2, textAlign: "right" }}>
                <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "18px" }}>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>
                  <FiClock style={{ verticalAlign: "middle", marginRight: "5px" }} />
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>

              <Box sx={{ zIndex: 2 }}>
                <Button 
                  onClick={() => setShowPrompt(!showPrompt)}
                  startIcon={<FiZap />}
                  sx={{ 
                    color: "#228756", 
                    bgcolor: "#f0fdf4", 
                    fontWeight: 700, 
                    borderRadius: "50px", 
                    textTransform: "none",
                    px: 3,
                    py: { xs: 1, md: 0.5 },
                    border: "1.5px solid #dcfce7",
                    "&:hover": { bgcolor: "#dcfce7" }
                  }}
                >
                  {showPrompt ? "Dismiss Prompt" : "Need Inspiration?"}
                </Button>
              </Box>
            </Stack>

            {/* Collapsible Prompt */}
            <Collapse in={showPrompt}>
              <Box sx={{ px: { xs: 3, md: 6 } }}>
                <Box sx={{ mb: 4, p: 3, bgcolor: "rgba(34, 135, 86, 0.05)", borderRadius: "12px", borderLeft: "4px solid #228756" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography sx={{ color: "#228756", fontWeight: 800, fontSize: "12px", textTransform: "uppercase" }}>
                      Today's Reflection Prompt
                    </Typography>
                    <Stack direction="row">
                      <IconButton size="small" onClick={prevPrompt} sx={{ color: "#228756" }}><FiChevronLeft /></IconButton>
                      <IconButton size="small" onClick={nextPrompt} sx={{ color: "#228756" }}><FiChevronRight /></IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="h5" sx={{ color: "#1e293b", fontWeight: 700, fontSize: { xs: "18px", md: "20px" } }}>
                    {journalPrompts[promptIndex]}
                  </Typography>
                </Box>
              </Box>
            </Collapse>

            {/* Lined Text Area */}
            <Box sx={{ 
              position: "relative", 
              px: { xs: 3, md: 6 },
              pl: { xs: 4, md: 10 }, // Extra left padding for the red margin
              zIndex: 2,
              background: "repeating-linear-gradient(#fffdf0, #fffdf0 34px, #e2e8f0 34px, #e2e8f0 35px)",
              backgroundAttachment: "local",
              paddingTop: "2px",
              cursor: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggMkwxMCAxMEw4IDE0TDEyIDEyTDIwIDRMMTggMlowIiBmaWxsPSIjMmMzZTUwIi8+PHBhdGggZD0iTTEyIDRMMjAgMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJjM2U1MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+"), auto'
            }}>
              <InputBase
                multiline
                fullWidth
                spellCheck={false}
                placeholder="Dear Diary, today I feel..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ 
                  fontSize: "26px", // Cursive fonts look smaller
                  lineHeight: "35px", 
                  color: penColor, // Pen ink color
                  fontFamily: penFont,
                  minHeight: "500px",
                  alignItems: "flex-start",
                  width: "100%",
                  pt: 0,
                  cursor: 'inherit',
                  "& textarea": {
                    paddingTop: "0 !important"
                  }
                }}
              />
            </Box>

            {/* Bottom Controls */}
            <Box sx={{ 
              mt: 6, 
              px: { xs: 3, md: 6 }, 
              py: 4,
              zIndex: 2,
              bgcolor: "rgba(255, 253, 240, 0.8)", // Semi-transparent paper color
              borderTop: "1px solid rgba(226, 232, 240, 0.6)",
              backdropFilter: "blur(4px)",
              position: "relative"
            }}>
              <Typography sx={{ color: "#64748b", fontWeight: 800, fontSize: "12px", mb: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>How's your mood?</Typography>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5, mb: 4 }}>
                {moods.map((m) => (
                  <Chip
                    key={m.label}
                    icon={m.icon}
                    label={m.label}
                    onClick={() => setSelectedMood(m.label)}
                    sx={{
                      height: "44px", // Reduced from 64px
                      px: 1.5,
                      fontSize: "15px", // Reduced from 22px
                      fontWeight: 800,
                      bgcolor: selectedMood === m.label ? m.color : m.bg,
                      color: selectedMood === m.label ? "white" : m.color,
                      border: `2px solid ${selectedMood === m.label ? m.color : m.color}30`,
                      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      "&:hover": { 
                        bgcolor: selectedMood === m.label ? m.color : `${m.color}15`,
                        transform: "translateY(-3px)",
                        boxShadow: `0 6px 15px ${m.color}20`
                      },
                      "& .MuiChip-icon": { 
                        color: "inherit",
                        fontSize: "20px", // Reduced from 28px
                        marginLeft: "10px"
                      },
                      "& .MuiChip-label": {
                        paddingLeft: "10px",
                        paddingRight: "15px"
                      }
                    }}
                  />
                ))}
              </Stack>

              <Divider sx={{ mb: 4 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>
                  {content.split(/\s+/).filter(x => x).length} words written
                </Typography>
                <Button
                  variant="contained"
                  disabled={isSaving || !content.trim()}
                  onClick={handleSave}
                  startIcon={isSaving ? null : <FiPlus />}
                  sx={{
                    bgcolor: "#1e293b",
                    color: "white",
                    borderRadius: "50px",
                    px: 5,
                    py: 1.8,
                    fontSize: "16px",
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    "&:hover": { bgcolor: "#0f172a" }
                  }}
                >
                  {isSaving ? "Saving Entry..." : "Close Diary & Save"}
                </Button>
              </Stack>
            </Box>
          </Paper>

          {/* HISTORY SECTION BELOW */}
          <Box sx={{ mt: 10 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: 2 }}>
                <FiClock /> Previous Entries
              </Typography>
              <Chip label={`${savedEntries.length} Saved`} sx={{ fontWeight: 700, bgcolor: "#e2e8f0" }} />
            </Box>
            
            {savedEntries.length === 0 ? (
              <Box sx={{ py: 10, textAlign: "center", bgcolor: "white", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
                <FiBook size={48} color="#cbd5e1" style={{ marginBottom: "20px" }} />
                <Typography sx={{ color: "#64748b", fontWeight: 500, fontSize: "18px" }}>
                  Your diary is empty. Start your journaling journey above.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {savedEntries.map((entry) => (
                  <Grid item xs={12} md={6} key={entry.id}>
                    <Fade in={true}>
                      <Paper sx={{ 
                        p: 4, 
                        borderRadius: "20px", 
                        border: "1px solid #e2e8f0", 
                        transition: "all 0.3s", 
                        "&:hover": { transform: "translateY(-5px)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", borderColor: "#228756" } 
                      }}>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "16px" }}>{entry.date}</Typography>
                            <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>{entry.time}</Typography>
                          </Box>
                          {entry.mood && (
                            <Chip 
                              label={entry.mood} 
                              size="small" 
                              sx={{ fontWeight: 800, fontSize: "11px", bgcolor: "#f1f5f9", color: "#475569" }} 
                            />
                          )}
                        </Stack>
                        
                        {entry.prompt && entry.prompt !== "Freestyle Entry" && (
                          <Typography sx={{ fontSize: "12px", color: "#228756", fontWeight: 700, mb: 1.5, fontStyle: "italic" }}>
                            Prompt: {entry.prompt}
                          </Typography>
                        )}

                        <Typography sx={{ 
                          color: "#2c3e50", 
                          fontSize: "20px", 
                          lineHeight: 1.4, 
                          fontFamily: "'Caveat', cursive",
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 3
                        }}>
                          {entry.content}
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Delete Permanently">
                            <IconButton onClick={() => handleDelete(entry.id)} sx={{ color: "#ef4444", bgcolor: "#fef2f2", "&:hover": { bgcolor: "#fee2e2" } }}>
                              <FiTrash2 size={18} />
                            </IconButton>
                          </Tooltip>
                          <Button
                            variant="outlined"
                            startIcon={<FiDownload />}
                            onClick={() => generateEntryPDF(entry)}
                            sx={{ 
                              borderRadius: "50px", 
                              color: "#1e293b", 
                              borderColor: "#e2e8f0",
                              textTransform: "none",
                              fontWeight: 700,
                              "&:hover": { borderColor: "#1e293b", bgcolor: "transparent" }
                            }}
                          >
                            Export PDF
                          </Button>
                        </Stack>
                      </Paper>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>

        {/* Sidebar for Pen Options */}
        <Grid item xs={12} lg={3.5}>
          <PenKit 
            selectedColor={penColor} 
            onColorChange={setPenColor}
            selectedFont={penFont}
            onFontChange={setPenFont}
          />
        </Grid>
      </Grid>
    </Container>

      <NewsLetter />
      <Footer />
    </>
    )}
    </Box>
  );
}
