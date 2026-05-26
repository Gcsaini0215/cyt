import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiPlayCircle,
  FiBookOpen,
  FiBarChart2,
  FiWind,
  FiArrowRight,
  FiX,
  FiPlay,
  FiPause,
  FiCopy,
  FiCheck,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiActivity,
  FiHeart,
  FiMusic,
  FiCloudRain,
  FiZap,
  FiSun,
  FiVolume2,
  FiUsers,
  FiMessageSquare,
  FiCheckCircle
} from "react-icons/fi";
import { Dialog, DialogContent, Box, Typography, Stack, IconButton, Button, Grid, TextField } from "@mui/material";

export default function FreeResources() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [breathStage, setBreathStage] = useState("Inhale");
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [journalDraft, setJournalDraft] = useState("");
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [activeCopingCategory, setActiveCopingCategory] = useState("Grounding");
  const [panicActive, setPanicActive] = useState(false);
  const [panicTimer, setPanicTimer] = useState(30);
  const [gratitudeList, setGratitudeList] = useState([]);
  const [newGratitude, setNewGratitude] = useState("");
  const [activeSound, setActiveSound] = useState(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [coupleIStatement, setCoupleIStatement] = useState({ emotion: "", event: "", need: "" });
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);

  const journalPrompts = [
    "What are three things you are grateful for today?",
    "Describe a challenge you faced and how you handled it.",
    "What is one thing you want to let go of this week?",
    "How did you practice self-care today?",
    "What is a goal you're currently working towards?",
    "Who is someone who made you smile today and why?",
    "What's one thing you're looking forward to tomorrow?",
    "If you could give your younger self advice, what would it be?"
  ];

  const conflictScenarios = [
    "One partner feels overwhelmed with household chores.",
    "A disagreement about spending time with family.",
    "Feeling disconnected due to heavy work schedules.",
    "Differences in how to handle finances.",
    "Misunderstanding during a text conversation."
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('cyt_mood_history');
    if (savedHistory) setMoodHistory(JSON.parse(savedHistory));
    const savedDraft = localStorage.getItem('cyt_journal_draft');
    if (savedDraft) setJournalDraft(savedDraft);
    const savedGratitude = localStorage.getItem('cyt_gratitude_list');
    if (savedGratitude) setGratitudeList(JSON.parse(savedGratitude));
  }, []);

  useEffect(() => {
    if (selectedTool?.title === "Breathing Guide" && openModal) {
      const interval = setInterval(() => {
        setBreathStage(prev => prev === "Inhale" ? "Hold" : prev === "Hold" ? "Exhale" : "Inhale");
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedTool, openModal]);

  const handleOpenModal = (tool) => {
    if (tool.title === "Daily Journal") {
      router.push("/daily-journal");
      return;
    }
    setSelectedTool(tool);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsPlaying(false);
    setCopied(false);
    setSelectedMood(null);
    setPanicActive(false);
    setPanicTimer(30);
  };

  useEffect(() => {
    let interval;
    if (panicActive && panicTimer > 0) {
      interval = setInterval(() => setPanicTimer(prev => prev - 1), 1000);
    } else if (panicTimer === 0) {
      setPanicActive(false);
    }
    return () => clearInterval(interval);
  }, [panicActive, panicTimer]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    { title: "Panic Button",    desc: "Instant 30-second SOS grounding for acute anxiety.",              icon: <FiAlertCircle />, color: "#ef4444", tag: "SOS",         tagBg: "rgba(239,68,68,.15)" },
    { title: "Daily Journal",   desc: "Science-backed prompts to help you process your day.",            icon: <FiBookOpen />,    color: "#0ea5e9", tag: "Journal",     tagBg: "rgba(14,165,233,.15)" },
    { title: "Mood Tracker",    desc: "Visualise your emotions and identify patterns over time.",        icon: <FiBarChart2 />,   color: "#f59e0b", tag: "Tracker",     tagBg: "rgba(245,158,11,.15)" },
    { title: "Breathing Guide", desc: "Interactive exercises to manage anxiety in real-time.",           icon: <FiWind />,        color: "#6366f1", tag: "Interactive", tagBg: "rgba(99,102,241,.15)" },
    { title: "Coping Skills",   desc: "Instant grounding techniques for emotional regulation.",          icon: <FiShield />,      color: "#ec4899", tag: "Clinical",    tagBg: "rgba(236,72,153,.15)" },
    { title: "Gratitude Jar",   desc: "Collect and revisit your daily moments of joy and thanks.",      icon: <FiHeart />,       color: "#f59e0b", tag: "Positive",    tagBg: "rgba(245,158,11,.15)" },
    { title: "Focus Sounds",    desc: "Calming background loops for deep focus or better sleep.",       icon: <FiMusic />,       color: "#8b5cf6", tag: "Audio",       tagBg: "rgba(139,92,246,.15)" },
    { title: "Couple Harmony",  desc: "A healthy argument guide for resolving conflicts with love.",    icon: <FiUsers />,       color: "#10b981", tag: "Couple",      tagBg: "rgba(16,185,129,.15)" },
  ];

  return (
    <section style={{ background: "#f0fdf4", padding: "72px 0 80px", position: "relative", overflow: "hidden" }}>
      <style>{`
        /* subtle bg pattern */
        .fr-blob { position:absolute; border-radius:50%; pointer-events:none; z-index:0; }

        /* header */
        .fr-tag {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(34,135,86,.1); border:1px solid rgba(34,135,86,.25);
          color:#228756; font-size:11px; font-weight:700;
          padding:5px 14px; border-radius:50px;
          letter-spacing:.8px; text-transform:uppercase; margin-bottom:14px;
        }
        .fr-tag-dot { width:6px; height:6px; border-radius:50%; background:#228756; animation:fr-pulse 1.8s ease-in-out infinite; }
        @keyframes fr-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .fr-title { font-size:clamp(1.8rem,4vw,2.8rem); font-weight:900; color:#1e293b; margin:0 0 8px; line-height:1.15; }
        .fr-title span { color:#228756; }
        .fr-sub { color:#64748b; font-size:15px; margin:0; line-height:1.6; }

        /* grid */
        .fr-grid {
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap:20px;
          position:relative; z-index:1;
        }
        @media(max-width:1024px){ .fr-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:480px){ .fr-grid { grid-template-columns: repeat(2,1fr); gap:12px; } }

        /* card */
        .fr-card {
          background:#fff;
          border:1.5px solid #e8f5e9;
          border-radius:20px;
          padding:22px 18px 18px;
          display:flex; flex-direction:column; gap:11px;
          cursor:pointer;
          transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;
          position:relative; overflow:hidden;
        }
        .fr-card::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:3px;
          background:var(--accent); border-radius:0 0 20px 20px;
          opacity:0; transition:opacity .25s;
        }
        .fr-card:hover {
          transform:translateY(-5px);
          box-shadow:0 16px 40px rgba(34,135,86,.12);
          border-color:var(--accent);
        }
        .fr-card:hover::after { opacity:1; }

        .fr-icon-wrap {
          width:48px; height:48px; border-radius:13px;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; flex-shrink:0;
          transition:transform .25s;
        }
        .fr-card:hover .fr-icon-wrap { transform:scale(1.1); }

        .fr-tag-pill {
          display:inline-block; font-size:10px; font-weight:800;
          padding:3px 10px; border-radius:50px;
          letter-spacing:.5px; text-transform:uppercase;
        }
        .fr-card-title {
          font-size:14.5px; font-weight:800; color:#1e293b; margin:0; line-height:1.3;
          transition:color .2s;
        }
        .fr-card:hover .fr-card-title { color:var(--accent); }
        .fr-card-desc {
          font-size:12.5px; color:#64748b; margin:0; line-height:1.55;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .fr-card-cta {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12px; font-weight:700;
          color:var(--accent);
          margin-top:auto; padding-top:2px;
          transition:gap .2s;
        }
        .fr-card:hover .fr-card-cta { gap:8px; }

        @media(max-width:480px){
          .fr-card { padding:14px 12px 12px; gap:8px; border-radius:16px; }
          .fr-icon-wrap { width:40px; height:40px; font-size:17px; border-radius:11px; }
          .fr-card-title { font-size:13px; }
          .fr-card-desc { font-size:11.5px; }
        }
      `}</style>

      {/* Soft blobs */}
      <div className="fr-blob" style={{ width:400, height:400, background:"rgba(34,135,86,.06)", filter:"blur(100px)", top:"-60px", right:"0%" }}></div>
      <div className="fr-blob" style={{ width:300, height:300, background:"rgba(74,222,128,.05)", filter:"blur(80px)", bottom:"0px", left:"0%" }}></div>

      <div className="container" style={{ position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:40 }}>
          <div className="fr-tag">
            <span className="fr-tag-dot"></span>
            Free for Everyone
          </div>
          <h2 className="fr-title">Wellness <span>Toolkit</span></h2>
          <p className="fr-sub">Interactive tools to support your mental health — anytime, anywhere, for free.</p>
        </div>

        {/* Grid */}
        <div className="fr-grid">
          {tools.map((tool, i) => (
            <div
              key={i}
              className="fr-card"
              style={{ "--accent": tool.color }}
              onClick={() => handleOpenModal(tool)}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="fr-icon-wrap" style={{ background: tool.tagBg, color: tool.color }}>
                  {tool.icon}
                </div>
                <span className="fr-tag-pill" style={{ background: tool.tagBg, color: tool.color }}>
                  {tool.tag}
                </span>
              </div>
              <h4 className="fr-card-title">{tool.title}</h4>
              <p className="fr-card-desc">{tool.desc}</p>
              <span className="fr-card-cta">
                Open <FiArrowRight size={12} />
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Modal (unchanged logic) ── */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 9999 }}
        PaperProps={{ sx: { borderRadius: "28px", overflow: "hidden" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4, position: "relative" }}>
            <IconButton onClick={handleCloseModal} sx={{ position: "absolute", right: 16, top: 16, color: "#64748b" }}>
              <FiX />
            </IconButton>

            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: "48px", height: "48px", borderRadius: "12px", bgcolor: `${selectedTool?.color}15`, color: selectedTool?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                {selectedTool?.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#1e293b" }}>{selectedTool?.title}</Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>Wellness Resource</Typography>
              </Box>
            </Box>

            {/* Panic Button */}
            {selectedTool?.title === "Panic Button" && (
              <Box sx={{ textAlign: "center", py: panicActive ? 2 : 4 }}>
                {!panicActive ? (
                  <>
                    <Box sx={{ width: "100px", height: "100px", borderRadius: "50%", bgcolor: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px", color: "#ef4444", fontSize: "40px", animation: "pulse-red 2s infinite" }}>
                      <FiAlertCircle />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: "#1e293b" }}>Panic SOS Mode</Typography>
                    <Typography sx={{ color: "#64748b", mb: 4, px: 2 }}>Click below to start a 30-second intensive grounding sequence to stop a panic attack.</Typography>
                    <Button fullWidth onClick={() => { setPanicActive(true); setPanicTimer(30); }} sx={{ py: 2, borderRadius: "12px", bgcolor: "#ef4444", color: "white", fontWeight: 800, fontSize: "18px", "&:hover": { bgcolor: "#dc2626" } }}>
                      START SOS SEQUENCE
                    </Button>
                  </>
                ) : (
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: "#ef4444", mb: 1 }}>{panicTimer}s</Typography>
                    <Box sx={{ width: "100%", height: "8px", bgcolor: "#f1f5f9", borderRadius: "4px", mb: 4 }}>
                      <Box sx={{ width: `${(panicTimer / 30) * 100}%`, height: "100%", bgcolor: "#ef4444", borderRadius: "4px", transition: "width 1s linear" }} />
                    </Box>
                    <Box sx={{ p: 3, bgcolor: "#fef2f2", borderRadius: "24px", border: "1px solid #fee2e2" }}>
                      {panicTimer > 20 ? (
                        <><FiActivity size={40} color="#ef4444" style={{ marginBottom: "15px" }} /><Typography variant="h6" sx={{ fontWeight: 800, color: "#991b1b", mb: 1 }}>LOOK AROUND</Typography><Typography sx={{ color: "#b91c1c" }}>Name 3 blue objects you see right now.</Typography></>
                      ) : panicTimer > 10 ? (
                        <><FiWind size={40} color="#ef4444" style={{ marginBottom: "15px" }} /><Typography variant="h6" sx={{ fontWeight: 800, color: "#991b1b", mb: 1 }}>SLOW BREATH</Typography><Typography sx={{ color: "#b91c1c" }}>Inhale deeply... Exhale slowly through your mouth.</Typography></>
                      ) : (
                        <><FiShield size={40} color="#ef4444" style={{ marginBottom: "15px" }} /><Typography variant="h6" sx={{ fontWeight: 800, color: "#991b1b", mb: 1 }}>FEEL YOUR FEET</Typography><Typography sx={{ color: "#b91c1c" }}>Press your feet hard against the floor. You are safe.</Typography></>
                      )}
                    </Box>
                    <Button onClick={() => setPanicActive(false)} sx={{ mt: 3, color: "#94a3b8", fontWeight: 700 }}>Cancel SOS</Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Mood Tracker */}
            {selectedTool?.title === "Mood Tracker" && (
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#64748b", mb: 4 }}>How are you feeling right now?</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {[
                    { e: "😊", l: "Happy", color: "#228756" }, { e: "😔", l: "Sad", color: "#3b82f6" },
                    { e: "😰", l: "Anxious", color: "#6366f1" }, { e: "😤", l: "Angry", color: "#ef4444" },
                    { e: "😴", l: "Tired", color: "#64748b" }, { e: "🧘", l: "Calm", color: "#007f99" }
                  ].map((mood, i) => (
                    <Grid item xs={4} key={i}>
                      <Box onClick={() => setSelectedMood(mood)} sx={{ p: 2, borderRadius: "16px", border: "2px solid", borderColor: selectedMood?.l === mood.l ? mood.color : "#e2e8f0", bgcolor: selectedMood?.l === mood.l ? `${mood.color}10` : "transparent", cursor: "pointer", transition: "all 0.3s", "&:hover": { bgcolor: `${mood.color}15`, borderColor: mood.color, transform: "scale(1.08)" } }}>
                        <Typography sx={{ fontSize: "32px", mb: 1 }}>{mood.e}</Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: selectedMood?.l === mood.l ? mood.color : "#475569" }}>{mood.l}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {moodHistory.length > 0 && (
                  <Box sx={{ mt: 4, textAlign: "left" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>Recent Check-ins</Typography>
                      <Button size="small" onClick={() => { setMoodHistory([]); localStorage.removeItem("cyt_mood_history"); }} sx={{ fontSize: "10px", color: "#94a3b8" }}>Clear History</Button>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
                      {moodHistory.slice(0, 5).map((entry, idx) => (
                        <Box key={idx} sx={{ minWidth: "70px", p: 1.5, borderRadius: "12px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", textAlign: "center" }}>
                          <Typography sx={{ fontSize: "20px" }}>{entry.e}</Typography>
                          <Typography sx={{ fontSize: "9px", color: "#94a3b8", mt: 0.5 }}>{entry.time}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
                <Button fullWidth disabled={!selectedMood} onClick={() => {
                  const newEntry = { ...selectedMood, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString() };
                  const updatedHistory = [newEntry, ...moodHistory].slice(0, 10);
                  setMoodHistory(updatedHistory);
                  localStorage.setItem("cyt_mood_history", JSON.stringify(updatedHistory));
                  setSelectedMood(null);
                  setTimeout(handleCloseModal, 500);
                }} sx={{ mt: 4, py: 1.5, borderRadius: "12px", bgcolor: selectedMood ? selectedMood.color : "#f59e0b", color: "white", fontWeight: 800, transition: "all 0.3s", "&:hover": { opacity: 0.9 }, "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#94a3b8" } }}>
                  Save Check-in
                </Button>
              </Box>
            )}

            {/* Breathing Guide */}
            {selectedTool?.title === "Breathing Guide" && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Box sx={{ width: breathStage === "Inhale" ? "200px" : breathStage === "Hold" ? "200px" : "100px", height: breathStage === "Inhale" ? "200px" : breathStage === "Hold" ? "200px" : "100px", borderRadius: "50%", bgcolor: "rgba(99,102,241,0.1)", border: "2px solid #6366f1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 40px", transition: "all 4s ease-in-out" }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#6366f1" }}>{breathStage}</Typography>
                </Box>
                <Typography sx={{ color: "#64748b" }}>Follow the circle to regulate your nervous system.</Typography>
              </Box>
            )}

            {/* Coping Skills */}
            {selectedTool?.title === "Coping Skills" && (
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: "auto", pb: 1 }}>
                  {["Grounding", "Physical", "Mental"].map(cat => (
                    <Button key={cat} size="small" onClick={() => setActiveCopingCategory(cat)} sx={{ borderRadius: "50px", px: 3, bgcolor: activeCopingCategory === cat ? "#ec4899" : "#f1f5f9", color: activeCopingCategory === cat ? "white" : "#64748b", fontWeight: 700, whiteSpace: "nowrap", "&:hover": { bgcolor: activeCopingCategory === cat ? "#db2777" : "#e2e8f0" } }}>{cat}</Button>
                  ))}
                </Stack>
                <Box sx={{ minHeight: "240px" }}>
                  <Stack spacing={2}>
                    {[
                      { cat: "Grounding", t: "5-4-3-2-1 Technique", d: "Identify 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.", c: "#228756" },
                      { cat: "Grounding", t: "Object Focus", d: "Pick an object and describe every detail (color, texture, weight) out loud.", c: "#007f99" },
                      { cat: "Physical", t: "Cold Water Reset", d: "Splash cold water on your face to trigger the mammalian dive reflex and slow your heart.", c: "#3b82f6" },
                      { cat: "Physical", t: "PMR Technique", d: "Tense and release each muscle group starting from your toes up to your neck.", c: "#6366f1" },
                      { cat: "Mental", t: "Box Breathing", d: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat to regulate nervous system.", c: "#f59e0b" },
                      { cat: "Mental", t: "A-B-C Game", d: "Pick a category (e.g., Animals) and name one for every letter of the alphabet.", c: "#ec4899" }
                    ].filter(item => item.cat === activeCopingCategory).map((skill, i) => (
                      <Box key={i} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", borderLeft: `4px solid ${skill.c}` }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 800, color: skill.c, mb: 0.5 }}>{skill.t}</Typography>
                        <Typography sx={{ fontSize: "13px", color: "#475569", lineHeight: 1.4 }}>{skill.d}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Gratitude Jar */}
            {selectedTool?.title === "Gratitude Jar" && (
              <Box>
                <Typography sx={{ color: "#64748b", mb: 3 }}>What are you grateful for today? Drop a note in the jar.</Typography>
                <Box sx={{ position: "relative", mb: 4 }}>
                  <TextField fullWidth placeholder="I am grateful for..." value={newGratitude} onChange={e => setNewGratitude(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#fffef3", "& fieldset": { borderColor: "#fef08a" }, "&:hover fieldset": { borderColor: "#f59e0b" }, "&.Mui-focused fieldset": { borderColor: "#f59e0b" } } }} />
                  <Button onClick={() => {
                    if (newGratitude.trim()) {
                      const entry = { text: newGratitude, date: new Date().toLocaleDateString() };
                      const updated = [entry, ...gratitudeList].slice(0, 20);
                      setGratitudeList(updated);
                      localStorage.setItem("cyt_gratitude_list", JSON.stringify(updated));
                      setNewGratitude("");
                    }
                  }} sx={{ position: "absolute", right: 8, top: 8, bgcolor: "#f59e0b", color: "white", borderRadius: "10px", fontWeight: 800, "&:hover": { bgcolor: "#d97706" } }}>Add to Jar</Button>
                </Box>
                <Box sx={{ maxHeight: "300px", overflowY: "auto", pr: 1 }}>
                  {gratitudeList.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
                      <FiHeart size={40} style={{ opacity: 0.2, marginBottom: "10px" }} />
                      <Typography>Your jar is empty. Start adding small wins!</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {gratitudeList.map((item, idx) => (
                        <Box key={idx} sx={{ p: 2, bgcolor: "#fffef3", borderRadius: "16px", border: "1px solid #fef9c3" }}>
                          <Typography sx={{ fontSize: "15px", color: "#854d0e", fontStyle: "italic" }}>"{item.text}"</Typography>
                          <Typography sx={{ fontSize: "11px", color: "#a16207", mt: 1, fontWeight: 700 }}>{item.date}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
                {gratitudeList.length > 0 && (
                  <Button onClick={() => { if (confirm("Clear all your gratitude notes?")) { setGratitudeList([]); localStorage.removeItem("cyt_gratitude_list"); } }} sx={{ mt: 3, color: "#94a3b8", fontSize: "12px" }}>Clear All</Button>
                )}
              </Box>
            )}

            {/* Focus Sounds */}
            {selectedTool?.title === "Focus Sounds" && (
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#64748b", mb: 4 }}>Select a soundscape to help you focus or relax:</Typography>
                <Grid container spacing={2}>
                  {[
                    { l: "Gentle Rain", i: <FiCloudRain />, c: "#3b82f6" },
                    { l: "Deep White Noise", i: <FiZap />, c: "#64748b" },
                    { l: "Golden Sunlight", i: <FiSun />, c: "#f59e0b" },
                    { l: "Forest Calm", i: <FiWind />, c: "#228756" }
                  ].map((sound, i) => (
                    <Grid item xs={6} key={i}>
                      <Box onClick={() => { setActiveSound(sound); setIsSoundPlaying(true); }} sx={{ p: 3, borderRadius: "20px", border: "2px solid", borderColor: activeSound?.l === sound.l ? sound.c : "#f1f5f9", bgcolor: activeSound?.l === sound.l ? `${sound.c}10` : "#f8fafc", cursor: "pointer", transition: "all 0.3s", "&:hover": { borderColor: sound.c, transform: "scale(1.02)" } }}>
                        <Box sx={{ color: sound.c, fontSize: "32px", mb: 1 }}>{sound.i}</Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{sound.l}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {activeSound && (
                  <Box sx={{ mt: 5, p: 3, borderRadius: "24px", bgcolor: "#f1f5f9" }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <IconButton onClick={() => setIsSoundPlaying(!isSoundPlaying)} sx={{ bgcolor: "white", p: 2, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
                        {isSoundPlaying ? <FiPause color={activeSound.c} /> : <FiPlay color={activeSound.c} />}
                      </IconButton>
                      <Box sx={{ flexGrow: 1, textAlign: "left" }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: activeSound.c, textTransform: "uppercase", mb: 0.5 }}>Now Playing</Typography>
                        <Typography sx={{ fontWeight: 800, color: "#1e293b" }}>{activeSound.l}</Typography>
                      </Box>
                      <FiVolume2 color="#94a3b8" />
                    </Stack>
                    {isSoundPlaying && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: "center", height: "20px", alignItems: "flex-end" }}>
                        {[...Array(8)].map((_, i) => (
                          <Box key={i} sx={{ width: "4px", height: "100%", bgcolor: activeSound.c, borderRadius: "4px", animation: `sound-wave 1s infinite ${i * 0.1}s` }} />
                        ))}
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Couple Harmony */}
            {selectedTool?.title === "Couple Harmony" && (
              <Box>
                <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f3ff", borderRadius: "16px", border: "1px solid #ddd6fe", position: "relative" }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 800, color: "#8b5cf6", mb: 1, textTransform: "uppercase" }}>Practice Scenario:</Typography>
                  <Typography sx={{ fontSize: "14px", color: "#5b21b6", pr: 5 }}>{conflictScenarios[activeScenarioIndex]}</Typography>
                  <IconButton onClick={() => setActiveScenarioIndex(prev => (prev + 1) % conflictScenarios.length)} sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#8b5cf6" }}>
                    <FiPlayCircle style={{ transform: "rotate(90deg)" }} />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 3, p: 2, bgcolor: "#faf5ff", borderRadius: "20px", border: "2px dashed #ddd6fe" }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 800, color: "#8b5cf6", mb: 2, textTransform: "uppercase", textAlign: "center" }}>Dynamic I-Statement Builder</Typography>
                  <Stack spacing={1.5}>
                    <TextField size="small" placeholder="I feel... (e.g. hurt, lonely)" value={coupleIStatement.emotion} onChange={e => setCoupleIStatement({ ...coupleIStatement, emotion: e.target.value })} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white", fontSize: "13px" } }} />
                    <TextField size="small" placeholder="When... (the specific event)" value={coupleIStatement.event} onChange={e => setCoupleIStatement({ ...coupleIStatement, event: e.target.value })} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white", fontSize: "13px" } }} />
                    <TextField size="small" placeholder="And I need... (specific support)" value={coupleIStatement.need} onChange={e => setCoupleIStatement({ ...coupleIStatement, need: e.target.value })} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white", fontSize: "13px" } }} />
                  </Stack>
                  <Button fullWidth variant="contained" disabled={!coupleIStatement.emotion || !coupleIStatement.event || !coupleIStatement.need} onClick={() => {
                    const text = `I feel ${coupleIStatement.emotion} when ${coupleIStatement.event} and I need ${coupleIStatement.need}.`;
                    navigator.clipboard.writeText(text);
                    alert("I-Statement copied to clipboard! Share it with your partner.");
                  }} sx={{ mt: 2, bgcolor: "#8b5cf6", color: "white", borderRadius: "10px", fontWeight: 800, py: 1, boxShadow: "none", "&:hover": { bgcolor: "#7c3aed", boxShadow: "none" } }}>
                    Copy & Share Statement
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(239,68,68,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes sound-wave {
          0%, 100% { height: 10px; opacity: 0.5; }
          50% { height: 20px; opacity: 1; }
        }
      `}</style>
    </section>
  );
}
