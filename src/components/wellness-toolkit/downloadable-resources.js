import React, { useState } from "react";
import { Box, Typography, Container, Grid, Button, Card, Chip, Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DescriptionIcon from "@mui/icons-material/Description";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

export default function DownloadableResources({ bgColor = "#f8f9fa" }) {
  const [open, setOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const handleOpen = (resource) => {
    setSelectedResource(resource);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const resources = [
    {
      title: "CBT Thought Record",
      desc: "A clinical worksheet to help you catch, challenge, and change unhelpful thoughts.",
      icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
      color: "#228756",
      tag: "CLINICAL",
      level: "Intermediate",
      downloads: [
        { name: "Standard CBT Worksheet (PDF)", size: "1.2 MB" },
        { name: "Thought Diary Template (PDF)", size: "850 KB" },
        { name: "Instruction Guide (PDF)", size: "500 KB" }
      ]
    },
    {
      title: "30-Day Habit Tracker",
      desc: "Monitor your sleep, mood, and water intake to identify wellness patterns over time.",
      icon: <EventNoteIcon sx={{ fontSize: 32 }} />,
      color: "#3b82f6",
      tag: "LIFESTYLE",
      level: "Beginner",
      downloads: [
        { name: "Monthly Tracker Grid (PDF)", size: "1.5 MB" },
        { name: "Weekly Focus Sheet (PDF)", size: "900 KB" }
      ]
    },
    {
      title: "Anxiety SOS Guide",
      desc: "Pocket-sized grounding techniques to manage panic attacks and high-anxiety moments.",
      icon: <SelfImprovementIcon sx={{ fontSize: 32 }} />,
      color: "#ef4444",
      tag: "SOS HELP",
      level: "All Levels",
      downloads: [
        { name: "Grounding 5-4-3-2-1 Guide (PDF)", size: "2.1 MB" },
        { name: "Breathing Patterns Card (PDF)", size: "1.1 MB" }
      ]
    },
    {
      title: "Self-Love Prompts",
      desc: "A curated list of 30 journaling prompts to improve self-esteem and body positivity.",
      icon: <FavoriteIcon sx={{ fontSize: 32 }} />,
      color: "#ec4899",
      tag: "JOURNAL",
      level: "Beginner",
      downloads: [
        { name: "30-Day Journal Prompts (PDF)", size: "1.8 MB" },
        { name: "Daily Affirmation Cards (PDF)", size: "2.5 MB" }
      ]
    },
    {
      title: "Sleep Hygiene Check",
      desc: "A step-by-step checklist to optimize your evening routine for better rest.",
      icon: <NightlightRoundIcon sx={{ fontSize: 32 }} />,
      color: "#8b5cf6",
      tag: "WELLNESS",
      level: "Beginner",
      downloads: [
        { name: "Bedroom Environment Checklist (PDF)", size: "700 KB" },
        { name: "Night Routine Planner (PDF)", size: "1.2 MB" }
      ]
    },
    {
      title: "Emotion Wheel",
      desc: "A visual tool to help you precisely identify and name complex feelings.",
      icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
      color: "#f59e0b",
      tag: "EMOTIONAL",
      level: "Intermediate",
      downloads: [
        { name: "Primary Emotion Wheel (PDF)", size: "3.2 MB" },
        { name: "Feeling Descriptor List (PDF)", size: "1.4 MB" }
      ]
    }
  ];

  return (
    <section className="rbt-section-gap" style={{ background: bgColor, padding: '100px 0' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Chip 
            label="RESOURCES" 
            sx={{ 
              backgroundColor: 'rgba(34, 135, 86, 0.1)', 
              color: '#228756', 
              fontWeight: 800, 
              fontSize: '12px',
              mb: 2,
              px: 1
            }} 
          />
          <Typography 
            variant="h2" 
            sx={{ 
              color: '#1e293b', 
              fontWeight: 900, 
              fontSize: { xs: '32px', md: '48px' },
              mb: 2
            }}
          >
            Wellness <span style={{ color: '#228756' }}>Downloads</span>
          </Typography>
          <Typography 
            sx={{ 
              color: '#64748b', 
              fontSize: '18px', 
              maxWidth: '700px', 
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Take your mental health journey offline with our professionally 
            designed worksheets and trackers. Free to download, forever.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {resources.map((res, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  borderRadius: '24px',
                  p: 3,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    borderColor: res.color
                  }
                }}
              >
                {/* Decorative background element */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    right: '-20px', 
                    width: '100px', 
                    height: '100px', 
                    backgroundColor: `${res.color}08`, 
                    borderRadius: '50%',
                    zIndex: 0
                  }} 
                />

                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '16px', 
                        backgroundColor: `${res.color}15`,
                        color: res.color,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}
                    >
                      {res.icon}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>LEVEL</Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{res.level}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 900, 
                      color: res.color, 
                      letterSpacing: '0.5px',
                      border: `1px solid ${res.color}30`,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {res.tag}
                    </span>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: '#1e293b', fontSize: '20px' }}>
                    {res.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b', 
                      mb: 4, 
                      lineHeight: 1.6,
                      flexGrow: 1,
                      fontWeight: 500
                    }}
                  >
                    {res.desc}
                  </Typography>

                  <Button 
                    variant="contained" 
                    startIcon={<FileDownloadIcon />}
                    sx={{ 
                      backgroundColor: '#1e293b', 
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 1.5,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: res.color,
                        boxShadow: `0 8px 16px ${res.color}30`
                      }
                    }}
                    onClick={() => handleOpen(res)}
                  >
                    Get PDF
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Download Modal */}
        <Dialog 
          open={open} 
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '28px', p: 1, overflow: 'hidden' }
          }}
        >
          <Box 
            sx={{ 
              height: '8px', 
              backgroundColor: selectedResource?.color,
              width: '100%'
            }} 
          />
          <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '14px', 
                  backgroundColor: `${selectedResource?.color}15`,
                  color: selectedResource?.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {selectedResource?.icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1.2 }}>
                  Download Resources
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  {selectedResource?.title}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleClose} 
              size="small"
              sx={{ backgroundColor: '#f1f5f9', '&:hover': { backgroundColor: '#e2e8f0' } }}
            >
              <CloseIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Typography sx={{ color: '#64748b', mb: 3, fontSize: '15px', lineHeight: 1.5 }}>
              Choose a version to download. All files are in high-quality PDF format optimized for printing or digital use.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedResource?.downloads.map((file, idx) => (
                <Box 
                  key={idx}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: '16px',
                    border: '1.5px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: selectedResource?.color,
                      backgroundColor: `${selectedResource?.color}05`,
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: '28px' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
                        {file.name}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                        PDF • {file.size}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    onClick={() => {
                      alert(`Downloading ${file.name}...`);
                      handleClose();
                    }}
                    sx={{
                      minWidth: '40px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#1e293b',
                      color: 'white',
                      p: 0,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: selectedResource?.color,
                        boxShadow: `0 4px 12px ${selectedResource?.color}40`
                      }
                    }}
                  >
                    <FileDownloadIcon sx={{ fontSize: '20px' }} />
                  </Button>
                </Box>
              ))}
            </Box>

            <Box 
              sx={{ 
                mt: 4, 
                p: 2, 
                backgroundColor: '#f8fafc', 
                borderRadius: '16px', 
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ color: selectedResource?.color }}>
                <PsychologyIcon sx={{ fontSize: '24px' }} />
              </Box>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                <strong>Tip:</strong> These worksheets are best used alongside professional therapy sessions.
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
        
        {/* Suggestion block... */}
        <Box 
          sx={{ 
            mt: 8, 
            p: 4, 
            textAlign: 'center', 
            backgroundColor: '#ffffff', 
            borderRadius: '24px',
            border: '1px dashed #228756',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3
          }}
        >
          <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '18px' }}>
            Need something specific?
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ 
              borderColor: '#228756', 
              color: '#228756', 
              borderRadius: '50px',
              fontWeight: 800,
              px: 4,
              '&:hover': { borderColor: '#1a6b44', backgroundColor: 'rgba(34, 135, 86, 0.05)' }
            }}
            onClick={() => window.location.href = '/contact-us'}
          >
            Suggest a Worksheet
          </Button>
        </Box>
      </Container>
    </section>
  );
}
