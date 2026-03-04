import React, { useState, useRef } from "react";
import { Box, Typography, Container, TextField, Button, Paper, CircularProgress, Avatar, Fade } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SearchIcon from "@mui/icons-material/Search";

export default function AIRecommender() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  const toolsList = [
    "Panic Button (for SOS/Anxiety)",
    "Daily Journal (for Processing Thoughts)",
    "Mood Tracker (for Identifying Patterns)",
    "Breathing Guide (for Real-time Calm)",
    "Coping Skills (for Emotional Regulation)",
    "Gratitude Jar (for Positive Focus)",
    "Focus Sounds (for Deep Sleep/Focus)",
    "Couple Harmony (for Relationship Conflict)",
    "CBT Worksheets (for Challenging Thoughts)",
    "Habit Tracker (for Routine)",
    "Emotion Wheel (for Naming Feelings)"
  ];

  const getRecommendation = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const prompt = `You are a mental health assistant. A user is feeling: "${input}". 
      Based on this, recommend 1 or 2 specific tools from this toolkit: ${toolsList.join(", ")}. 
      Provide a very short, empathetic explanation (max 2 sentences) for why these tools will help.`;

      const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-90M", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: [],
            generated_responses: [],
            text: prompt
          }
        }),
      });

      const result = await response.json();
      
      if (result.error) throw new Error(result.error);
      
      // Handle the blenderbot response structure
      const reply = result.generated_text || result.conversation?.generated_responses?.[0] || "I recommend trying the Breathing Guide and Mood Tracker to help you feel more balanced right now.";
      
      setRecommendation(reply);
    } catch (err) {
      console.error("AI Error:", err);
      // Fallback recommendation if AI fails
      setRecommendation("I recommend starting with our Breathing Guide and Daily Journal to help process how you're feeling right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rbt-section-gap" style={{ padding: '80px 0', backgroundColor: '#f1f8f5' }}>
      <Container maxWidth="md">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: '32px', 
            border: '2px solid #228756',
            backgroundColor: '#ffffff',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(34, 135, 86, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative AI Icon */}
          <AutoAwesomeIcon 
            sx={{ 
              position: 'absolute', 
              top: 20, 
              right: 20, 
              color: 'rgba(34, 135, 86, 0.1)', 
              fontSize: '100px' 
            }} 
          />

          <Box sx={{ mb: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: '#228756', 
                width: 60, 
                height: 60, 
                margin: '0 auto 20px',
                boxShadow: '0 8px 16px rgba(34, 135, 86, 0.2)'
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 2, fontSize: { xs: '28px', md: '36px' } }}>
              AI Tool <span style={{ color: '#228756' }}>Recommender</span>
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              Tell me how you're feeling today, and I'll suggest the best tool from 
              our toolkit to help you through it.
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: 2, 
              maxWidth: '700px', 
              margin: '0 auto',
              mb: 4
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="e.g., I'm feeling a bit anxious about my presentation tomorrow..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && getRecommendation()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#228756' },
                  '&.Mui-focused fieldset': { borderColor: '#228756' },
                }
              }}
            />
            <Button
              variant="contained"
              disabled={loading || !input.trim()}
              onClick={getRecommendation}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{
                borderRadius: '16px',
                px: 4,
                py: { xs: 1.5, md: 0 },
                backgroundColor: '#228756',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '16px',
                boxShadow: '0 10px 20px rgba(34, 135, 86, 0.2)',
                '&:hover': { backgroundColor: '#1a6b44' }
              }}
            >
              Suggest Tool
            </Button>
          </Box>

          {recommendation && (
            <Fade in={true}>
              <Box 
                sx={{ 
                  p: 3, 
                  backgroundColor: '#f1f8f5', 
                  borderRadius: '20px', 
                  border: '1.5px dashed #228756',
                  maxWidth: '700px',
                  margin: '0 auto',
                  textAlign: 'left'
                }}
              >
                <Typography sx={{ fontWeight: 800, color: '#228756', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} /> AI RECOMMENDATION:
                </Typography>
                <Typography sx={{ color: '#1e293b', lineHeight: 1.6, fontSize: '16px', fontWeight: 500 }}>
                  {recommendation}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => {
                      const el = document.getElementById('resources-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{ color: '#228756', fontWeight: 800, textTransform: 'none', p: 0 }}
                  >
                    Go to Tools ↓
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </Paper>
      </Container>
    </section>
  );
}
