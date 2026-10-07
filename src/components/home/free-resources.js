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
  FiCheckCircle,
  FiShare2,
  FiSend
} from "react-icons/fi";
import { Dialog, DialogContent, Box, Typography, Stack, IconButton, Button, Grid, TextField } from "@mui/material";
import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";
import { BreathingTool, SosTool, SoundsTool, QT_CSS, HELPLINE } from "../wellness/quick-tools";

// Wellness Toolkit (/wellness-toolkit). Each tool has its own link (?tool=breathing …) for
// sharing; nothing pops up when a tool closes — the "talk to someone" options sit inside it.
const SITE = "https://www.chooseyourtherapist.in";
// after a mood check-in: what might help next
const MOOD_NEXT = {
  Happy: { text: "Lovely! Save one thing that made today good.", tool: "gratitude" },
  Sad: { text: "Sorry it's a low day. Writing down one small good thing can help a little.", tool: "gratitude", concern: "depression", label: "low mood" },
  Anxious: { text: "Try one minute of slow breathing — it calms the body's alarm.", tool: "breathing", concern: "anxiety", label: "anxiety" },
  Angry: { text: "Before you react, try a 4-7-8 breath to cool down.", tool: "breathing", concern: "anger", label: "anger" },
  Tired: { text: "Some calming sound might help you rest.", tool: "sounds", concern: "stress", label: "stress & sleep" },
  Calm: { text: "Nice. Notice what's helping — and keep doing it." },
};

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
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [sharedTool, setSharedTool] = useState(null);
  const [lastMood, setLastMood] = useState(null);

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

  useEffect(() => {
    if (!router.isReady || typeof router.query.tool !== "string") return;
    const t = tools.find((x) => x.id === router.query.tool);
    if (t) handleOpenModal(t);
  }, [router.isReady]);

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
    setLastMood(null);
  };
  const openTool = (id) => { const t = tools.find((x) => x.id === id); if (t) { setLastMood(null); setSelectedTool(t); } };

  const handleShare = (e, tool) => {
    e.stopPropagation();
    const url = `${SITE}/wellness-toolkit?tool=${tool.id}`;
    const text = `Try the "${tool.title}" tool on Choose Your Therapist — free mental health resources for everyone!`;
    if (navigator.share) {
      navigator.share({ title: tool.title, text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      setSharedTool(tool.title);
      setTimeout(() => setSharedTool(null), 2000);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadData.name.trim() || !leadData.phone.trim()) return;
    setLeadLoading(true);
    try {
      await postFormUrlEncoded(SubmitConsultationUrl, {
        name: leadData.name,
        phone: leadData.phone,
        subject: "Wellness Toolkit Lead",
        concern: "Came from Wellness Toolkit",
        source: "Wellness Toolkit"
      });
      setLeadSubmitted(true);
    } catch (e) {}
    setLeadLoading(false);
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

  const G = { color: "#1e7a4c", tagBg: "#eef6f1" };
  const tools = [
    { id: "panic",     title: "Panic Button",    desc: "A 30-second guided reset for a panic or anxiety attack.",      icon: <FiAlertCircle />, color: "#c2410c", tagBg: "#fff1e6", time: "30 sec" },
    { id: "breathing", title: "Breathing Guide", desc: "Box or 4-7-8 breathing with a timer — calm the body fast.",    icon: <FiWind />,        ...G, time: "1–5 min" },
    { id: "mood",      title: "Mood Tracker",    desc: "Check in with how you feel and spot patterns over time.",     icon: <FiBarChart2 />,   ...G, time: "30 sec" },
    { id: "coping",    title: "Coping Skills",   desc: "Quick grounding and calming techniques for hard moments.",    icon: <FiShield />,      ...G, time: "2 min" },
    { id: "journal",   title: "Daily Journal",   desc: "Gentle prompts to help you process your day.",                icon: <FiBookOpen />,    ...G, time: "5 min" },
    { id: "gratitude", title: "Gratitude Jar",   desc: "Collect small good moments and revisit them on hard days.",   icon: <FiHeart />,       ...G, time: "1 min" },
    { id: "sounds",    title: "Focus Sounds",    desc: "Rain, waves, wind or soft noise — with a sleep timer.",       icon: <FiMusic />,       ...G, time: "Any time" },
    { id: "couple",    title: "Couple Harmony",  desc: "Turn a fight into a calm \"I feel… I need…\" conversation.", icon: <FiUsers />,       ...G, time: "3 min" },
  ];

  return (
    <section style={{ background: "#fff", padding: "72px 0 80px", position: "relative", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* subtle bg pattern */
        .fr-blob { position:absolute; border-radius:50%; pointer-events:none; z-index:0; }

        /* header */
        .fr-tag {
          display:inline-flex; align-items:center; gap:8px;
          font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase;
          color:#166534; margin-bottom:12px;
        }
        .fr-tag-dot { width:20px; height:2px; background:#d4af37; display:inline-block; }
        .fr-title { font-size:clamp(1.5rem,3.4vw,2.1rem); font-weight:800; color:#132a1c; margin:0 0 8px; line-height:1.25; }
        .fr-title span { color:#166534; }
        .fr-sub { color:#64748b; font-size:14.5px; margin:0; line-height:1.6; }
        .fr-private { display:inline-flex; align-items:center; gap:6px; margin:8px 0 0; padding:0; font-size:12.5px; font-weight:600; color:#1e7a4c; }
        .fr-time { font-size:10.5px; font-weight:800; letter-spacing:.4px; text-transform:uppercase; padding:3px 8px; border-radius:6px; }
        .fr-card.sos { border-color:#fed7aa; background:#fffaf5; }
        .fr-foot { display:flex; flex-direction:column; gap:10px; padding:14px 24px 18px; border-top:1px solid #eef2f0; background:#f8faf9; }
        .fr-foot-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; }
        .fr-foot a, .fr-foot button { font-size:13.5px; font-weight:800; color:#1e7a4c; background:none; border:none; padding:0; cursor:pointer; text-decoration:none; }
        .fr-foot small { font-size:12px; color:#94a3b8; }
        .fr-next { margin-top:18px; padding:14px 16px; border-radius:14px; background:#eef6f1; border:1px solid #d5e8dc; text-align:left; }
        .fr-next p { margin:0 0 10px; padding:0; font-size:14px; color:#14532d; }
        .fr-next div { display:flex; flex-wrap:wrap; gap:8px; }
        .fr-next button, .fr-next a { height:38px; padding:0 14px; border-radius:10px; border:none; background:#1e7a4c; color:#fff; font-size:13.5px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; text-decoration:none; }
        .fr-next a { background:#fff; color:#14532d; border:1.5px solid #cfdcd4; }
        ${QT_CSS}

        /* grid */
        .fr-grid {
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap:16px;
          position:relative; z-index:1;
        }
        @media(min-width:768px) and (max-width:1024px){ .fr-grid { grid-template-columns: repeat(3,1fr); gap:14px; } }
        @media(max-width:767px){ .fr-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:480px){ .fr-grid { grid-template-columns: repeat(2,1fr); gap:10px; } }

        /* card */
        .fr-card {
          background:#fff;
          border:1px solid #dbe3df;
          border-top:3px solid transparent;
          border-radius:6px;
          padding:20px 16px 16px;
          display:flex; flex-direction:column; gap:10px;
          cursor:pointer;
          transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          position:relative; overflow:hidden;
        }
        .fr-card:hover {
          transform:translateY(-3px);
          box-shadow:0 14px 30px rgba(15,61,36,.1);
          border-top-color:var(--accent);
          border-color:#cfe4d7;
        }

        .fr-icon-wrap {
          width:42px; height:42px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          font-size:18px; flex-shrink:0;
          transition:transform .2s;
        }
        .fr-card:hover .fr-icon-wrap { transform:scale(1.06); }

        .fr-tag-pill {
          display:inline-block; font-size:10px; font-weight:800;
          padding:3px 9px; border-radius:4px;
          letter-spacing:.5px; text-transform:uppercase;
        }
        .fr-card-title {
          font-size:14.5px; font-weight:800; color:#132a1c; margin:0; line-height:1.3;
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
          .fr-card { padding:13px 11px 11px; gap:7px; border-radius:6px; }
          .fr-icon-wrap { width:36px; height:36px; font-size:15px; border-radius:6px; }
          .fr-card-title { font-size:12.5px; }
          .fr-card-desc { font-size:11px; }
        }
      ` }} />

      {/* Soft blobs */}
      <div className="fr-blob" style={{ width:400, height:400, background:"rgba(34,135,86,.04)", filter:"blur(100px)", top:"-60px", right:"0%" }}></div>
      <div className="fr-blob" style={{ width:300, height:300, background:"rgba(74,222,128,.03)", filter:"blur(80px)", bottom:"0px", left:"0%" }}></div>

      <div className="container" style={{ position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:40 }}>
          <div className="fr-tag">
            <span className="fr-tag-dot"></span>
            Free for Everyone
          </div>
          <h2 className="fr-title">Wellness <span>Toolkit</span></h2>
          <p className="fr-sub">Feeling overwhelmed right now? Try a 1-minute tool — free, no sign-up.</p>
          <p className="fr-private"><FiShield size={13} /> Your check-ins, notes and journal stay on this device — we never see them.</p>
        </div>

        {/* Grid */}
        <div className="fr-grid">
          {tools.map((tool, i) => (
            <div
              key={i}
              className={`fr-card${tool.id === "panic" ? " sos" : ""}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpenModal(tool); } }}
              style={{ "--accent": tool.color }}
              onClick={() => handleOpenModal(tool)}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="fr-icon-wrap" style={{ background: tool.tagBg, color: tool.color }}>
                  {tool.icon}
                </div>
                <span className="fr-time" style={{ background: tool.tagBg, color: tool.color }}>{tool.time}</span>
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
        sx={{ zIndex: 100003 }}
        PaperProps={{ sx: { borderRadius: "10px", overflow: "hidden" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{
            background: "linear-gradient(135deg,#0f3d24,#175c37)",
            borderBottom: "3px solid #d4af37",
            px: 3, py: 2.5, position: "relative",
            display: "flex", alignItems: "center", gap: 2,
          }}>
            <IconButton onClick={handleCloseModal} sx={{ position: "absolute", right: 12, top: 12, color: "rgba(255,255,255,.85)", bgcolor: "rgba(255,255,255,.12)", width: 30, height: 30, "&:hover": { bgcolor: "rgba(255,255,255,.22)" } }}>
              <FiX size={16} />
            </IconButton>
            <Box sx={{ width: "44px", height: "44px", borderRadius: "8px", bgcolor: "rgba(255,255,255,.14)", color: selectedTool?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              {selectedTool?.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", fontSize: "17px", lineHeight: 1.3 }}>{selectedTool?.title}</Typography>
              <Typography variant="body2" sx={{ color: "#d4af37", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Wellness Resource</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            {/* Panic Button */}
            {selectedTool?.title === "Panic Button" && <SosTool />}

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
                {lastMood && MOOD_NEXT[lastMood.l] && (
                  <div className="fr-next" aria-live="polite">
                    <p><b>Saved.</b> {MOOD_NEXT[lastMood.l].text}</p>
                    <div>
                      {MOOD_NEXT[lastMood.l].tool && <button type="button" onClick={() => openTool(MOOD_NEXT[lastMood.l].tool)}>Open {tools.find((x) => x.id === MOOD_NEXT[lastMood.l].tool)?.title}</button>}
                      {MOOD_NEXT[lastMood.l].concern && <Link href={`/therapy-for/${MOOD_NEXT[lastMood.l].concern}`}>Psychologists for {MOOD_NEXT[lastMood.l].label}</Link>}
                    </div>
                  </div>
                )}
                <Button fullWidth disabled={!selectedMood} onClick={() => {
                  const newEntry = { ...selectedMood, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString() };
                  const updatedHistory = [newEntry, ...moodHistory].slice(0, 10);
                  setMoodHistory(updatedHistory);
                  localStorage.setItem("cyt_mood_history", JSON.stringify(updatedHistory));
                  setSelectedMood(null);
                  setLastMood(newEntry);
                }} sx={{ mt: 4, py: 1.5, borderRadius: "12px", bgcolor: selectedMood ? selectedMood.color : "#f59e0b", color: "white", fontWeight: 800, transition: "all 0.3s", "&:hover": { opacity: 0.9 }, "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#94a3b8" } }}>
                  Save Check-in
                </Button>
              </Box>
            )}

            {/* Breathing Guide */}
            {selectedTool?.title === "Breathing Guide" && <BreathingTool />}

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
            {selectedTool?.title === "Focus Sounds" && <SoundsTool />}

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
                    handleCopy(text);
                  }} sx={{ mt: 2, bgcolor: "#8b5cf6", color: "white", borderRadius: "10px", fontWeight: 800, py: 1, boxShadow: "none", "&:hover": { bgcolor: "#7c3aed", boxShadow: "none" } }}>
                    {copied ? "Copied — share it with your partner" : "Copy & Share Statement"}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          <div className="fr-foot">
            <div className="fr-foot-row">
              <Link href="/view-all-therapist?help=1">Talk to a psychologist →</Link>
              <button type="button" onClick={() => setShowLeadPopup(true)}>Get a free callback</button>
              <button type="button" onClick={(e) => selectedTool && handleShare(e, selectedTool)}>{sharedTool === selectedTool?.title ? "Link copied" : "Share this tool"}</button>
            </div>
            <small>In a crisis? Call <a href={HELPLINE.tel}>{HELPLINE.name} {HELPLINE.number}</a> (free, 24×7).</small>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Lead Capture Popup ── */}
      <Dialog
        open={showLeadPopup}
        onClose={() => setShowLeadPopup(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100004 }}
        PaperProps={{ sx: { borderRadius: "10px", overflow: "hidden" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4, position: "relative" }}>
            <IconButton onClick={() => setShowLeadPopup(false)} sx={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }}>
              <FiX size={18} />
            </IconButton>

            {!leadSubmitted ? (
              <>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: "8px", bgcolor: "#eef5f1", border: "2px solid #d4af37", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 26, color: "#166534" }}>
                    💬
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 0.5 }}>
                    Want to talk to a therapist?
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                    Our team will connect you with a verified expert — free, no commitment.
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  <Box sx={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={leadData.name}
                      onChange={e => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" }}
                      onFocus={e => e.target.style.borderColor = "#228756"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </Box>
                  <Box sx={{ position: "relative" }}>
                    <input
                      type="tel"
                      placeholder="Phone number (WhatsApp)"
                      value={leadData.phone}
                      onChange={e => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" }}
                      onFocus={e => e.target.style.borderColor = "#228756"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  onClick={handleLeadSubmit}
                  disabled={leadLoading || !leadData.name.trim() || !leadData.phone.trim()}
                  sx={{ mt: 2.5, py: 1.5, borderRadius: "6px", background: "linear-gradient(135deg,#166534,#16a34a)", color: "white", fontWeight: 800, fontSize: 15, boxShadow: "0 4px 14px rgba(22,101,52,.25)", "&:hover": { opacity: 0.9 }, "&.Mui-disabled": { background: "#cbd5e1", color: "#94a3b8" } }}
                >
                  {leadLoading ? "Connecting..." : "Get Matched — Free"}
                </Button>
                <Typography sx={{ textAlign: "center", fontSize: 11, color: "#94a3b8", mt: 1 }}>
                  🔒 No spam · Confidential · Free
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>
                  ✅
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 1 }}>You're all set!</Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
                  Our team will reach out on WhatsApp within 24 hours. Keep using the tools in the meantime!
                </Typography>
                <Button onClick={() => setShowLeadPopup(false)} sx={{ mt: 3, bgcolor: "#f0fdf4", color: "#166534", fontWeight: 800, borderRadius: "6px", px: 4 }}>
                  Close
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(239,68,68,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes sound-wave {
          0%, 100% { height: 10px; opacity: 0.5; }
          50% { height: 20px; opacity: 1; }
        }
      ` }} />
    </section>
  );
}
