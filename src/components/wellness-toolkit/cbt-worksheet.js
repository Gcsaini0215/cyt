import React, { useState } from "react";
import { Box, Typography, Container, TextField, Button, Paper, Stepper, Step, StepLabel, Divider, IconButton } from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const steps = ["Situation", "Negative Thought", "Evidence For/Against", "Balanced Perspective"];

export default function CBTWorksheet() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    situation: "",
    thought: "",
    evidenceFor: "",
    evidenceAgainst: "",
    balancedThought: ""
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => {
    setActiveStep(0);
    setFormData({ situation: "", thought: "", evidenceFor: "", evidenceAgainst: "", balancedThought: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="rbt-section-gap bg-color-white" style={{ padding: '100px 0' }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography sx={{ color: '#228756', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px', mb: 2 }}>
            Interactive Therapy Tool
          </Typography>
          <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, fontSize: { xs: '32px', md: '48px' }, mb: 2 }}>
            CBT <span style={{ color: '#228756' }}>Thought Record</span>
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Use this tool to challenge negative thoughts and develop a more balanced perspective. 
            This is a private session - your data is not saved on our servers.
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '32px', 
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label} sx={{
                '& .MuiStepLabel-label.Mui-active': { color: '#228756', fontWeight: 700 },
                '& .MuiStepLabel-label.Mui-completed': { color: '#1e293b' },
                '& .MuiStepIcon-root.Mui-active': { color: '#228756' },
                '& .MuiStepIcon-root.Mui-completed': { color: '#228756' }
              }}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: '250px' }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon sx={{ color: '#228756' }} /> The Situation
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  What happened? Where were you? Who were you with? (e.g., "My boss didn't reply to my email for 4 hours")
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="situation"
                  value={formData.situation}
                  onChange={handleChange}
                  placeholder="Describe the triggering event..."
                  sx={{ backgroundColor: 'white', borderRadius: '12px', '& fieldset': { borderRadius: '12px' } }}
                />
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon sx={{ color: '#f59e0b' }} /> Automatic Negative Thought
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  What was going through your mind? (e.g., "They are going to fire me because I did something wrong")
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="thought"
                  value={formData.thought}
                  onChange={handleChange}
                  placeholder="What is that loud, nagging thought?"
                  sx={{ backgroundColor: 'white', borderRadius: '12px', '& fieldset': { borderRadius: '12px' } }}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Weighing the Evidence</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#ef4444' }}>Facts supporting the thought</Typography>
                    <TextField
                      fullWidth multiline rows={4}
                      name="evidenceFor"
                      value={formData.evidenceFor}
                      onChange={handleChange}
                      placeholder="What makes this thought feel true?"
                      sx={{ backgroundColor: 'white', borderRadius: '12px', '& fieldset': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#228756' }}>Facts contradicting the thought</Typography>
                    <TextField
                      fullWidth multiline rows={4}
                      name="evidenceAgainst"
                      value={formData.evidenceAgainst}
                      onChange={handleChange}
                      placeholder="What are the other possibilities?"
                      sx={{ backgroundColor: 'white', borderRadius: '12px', '& fieldset': { borderRadius: '12px' } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#228756' }} /> Balanced Perspective
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  Now, look at both sides. What is a more realistic way to see this?
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="balancedThought"
                  value={formData.balancedThought}
                  onChange={handleChange}
                  placeholder="A new, more balanced way of thinking..."
                  sx={{ backgroundColor: 'white', borderRadius: '12px', '& fieldset': { borderRadius: '12px' } }}
                />
              </Box>
            )}

            {activeStep === steps.length && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleIcon sx={{ fontSize: '80px', color: '#228756', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Great Work!</Typography>
                <Typography sx={{ mb: 4, color: '#64748b' }}>
                  You've successfully challenged a negative thought. How do you feel now?
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ borderColor: '#228756', color: '#228756', borderRadius: '50px', fontWeight: 700 }}
                >
                  Clear and Start New
                </Button>
              </Box>
            )}
          </Box>

          {activeStep < steps.length && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ color: '#64748b', fontWeight: 700 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ 
                  backgroundColor: '#228756', 
                  borderRadius: '12px', 
                  px: 4, 
                  fontWeight: 800,
                  '&:hover': { backgroundColor: '#1a6b44' }
                }}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </section>
  );
}
