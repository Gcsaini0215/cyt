import React from "react";
import { Box, Grid, Paper, Typography, Button, Card, CardContent, CardActions, Chip } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import FaceIcon from "@mui/icons-material/Face";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const assessments = [
  {
    id: 1,
    title: "Depression Screening",
    originalName: "Patient Health Questionnaire-9 (PHQ-9)",
    description: "Assess your mood and emotional well-being with this comprehensive screening tool",
    icon: <PsychologyIcon sx={{ fontSize: 50 }} />,
    color: "#1976d2",
    bgColor: "#e3f2fd",
    duration: "5-7 minutes",
    questions: 9,
    accuracy: 4.8,
    citation: "Developed by Pfizer",
    agePopulation: "Ages 13+",
    reference: "Kroenke K, et al. The PHQ-9: Validity of a brief depression severity measure."
  },
  {
    id: 2,
    title: "Anxiety Assessment",
    originalName: "Generalized Anxiety Disorder-7 (GAD-7)",
    description: "Evaluate your anxiety levels and worry patterns with a clinically validated tool",
    icon: <AssignmentIcon sx={{ fontSize: 50 }} />,
    color: "#f57c00",
    bgColor: "#fff3e0",
    duration: "5-7 minutes",
    questions: 7,
    accuracy: 4.8,
    citation: "Developed by Pfizer",
    agePopulation: "Ages 13+",
    reference: "Spitzer RL, et al. A brief measure for assessing generalized anxiety disorder."
  },
  {
    id: 3,
    title: "Sleep Quality Index",
    originalName: "Pittsburgh Sleep Quality Index (PSQI)",
    description: "Evaluate your sleep patterns and overall sleep quality comprehensively",
    icon: <SelfImprovementIcon sx={{ fontSize: 50 }} />,
    color: "#7c3aed",
    bgColor: "#f3e8ff",
    duration: "5-10 minutes",
    questions: 19,
    accuracy: 4.7,
    citation: "Developed by University of Pittsburgh",
    agePopulation: "Ages 18+",
    reference: "Buysse DJ, et al. The Pittsburgh Sleep Quality Index: A new instrument for psychiatric research."
  },
  {
    id: 4,
    title: "PTSD Checklist",
    originalName: "PTSD Checklist for DSM-5 (PCL-5)",
    description: "Screen for post-traumatic stress symptoms using evidence-based assessment",
    icon: <HealthAndSafetyIcon sx={{ fontSize: 50 }} />,
    color: "#dc2626",
    bgColor: "#fee2e2",
    duration: "7-10 minutes",
    questions: 20,
    accuracy: 4.8,
    citation: "Developed by U.S. Department of Veterans Affairs",
    agePopulation: "Ages 14+",
    reference: "Weathers FW, et al. The PTSD Checklist for DSM-5 (PCL-5) - Standard."
  },
  {
    id: 5,
    title: "Big Five Personality",
    originalName: "Big Five Personality Test (OCEAN)",
    description: "Discover your personality traits across 5 major dimensions with detailed insights",
    icon: <FaceIcon sx={{ fontSize: 50 }} />,
    color: "#16a34a",
    bgColor: "#f0fdf4",
    duration: "8-12 minutes",
    questions: 50,
    accuracy: 4.9,
    citation: "Developed by personality psychologists worldwide",
    agePopulation: "Ages 14+",
    reference: "Costa PT & McCrae RR. The Five-Factor Model of Personality Traits and Clinical Assessment."
  }
];

export default function AssessmentCards({ onSelectAssessment }) {
  return (
    <Box sx={{ py: { xs: 4, sm: 8 }, px: { xs: 1.5, sm: 4 }, width: '100%', overflow: 'hidden' }}>
      <Box sx={{ mb: { xs: 4, sm: 8 }, textAlign: 'center', px: { xs: 1, sm: 0 } }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 3, fontSize: { xs: '24px', sm: '36px' } }}>
          Choose Your Assessment
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '700px', mx: 'auto', fontSize: { xs: '14px', sm: '18px' }, fontWeight: 500 }}>
          Select a mental health assessment to get personalized insights about your well-being. 
          Each assessment takes just a few minutes to complete.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>
        {assessments.map((assessment) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={assessment.id}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: { xs: '12px', sm: '16px' },
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
                  borderColor: assessment.color
                }
              }}
            >
              <CardContent sx={{ pb: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Box
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: assessment.bgColor,
                      color: assessment.color,
                      mb: 1.5,
                      mx: 'auto'
                    }}
                  >
                    {assessment.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontSize: { xs: '16px', sm: '18px' }, textAlign: 'center' }}>
                    {assessment.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 700, fontSize: { xs: '10px', sm: '12px' }, display: 'block', textAlign: 'center', mb: 1 }}>
                    ({assessment.originalName})
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5, fontSize: { xs: '12px', sm: '14px' }, textAlign: 'center', lineHeight: 1.4 }}>
                    {assessment.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip
                    label={`${assessment.questions} Questions`}
                    size="small"
                    sx={{
                      bgcolor: `${assessment.color}15`,
                      color: assessment.color,
                      fontWeight: 800,
                      fontSize: { xs: '9px', sm: '11px' },
                      height: { xs: '24px', sm: '28px' }
                    }}
                  />
                  <Chip
                    label={assessment.duration}
                    size="small"
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 800,
                      fontSize: { xs: '9px', sm: '11px' },
                      height: { xs: '24px', sm: '28px' }
                    }}
                  />
                  <Chip
                    label={assessment.agePopulation}
                    size="small"
                    sx={{
                      bgcolor: `${assessment.color}15`,
                      color: assessment.color,
                      fontWeight: 800,
                      fontSize: { xs: '9px', sm: '11px' },
                      height: { xs: '24px', sm: '28px' }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: { xs: '10px', sm: '12px' }, display: 'block' }}>
                    {assessment.citation}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, fontSize: { xs: '9px', sm: '11px' }, display: 'block', mt: 0.3, fontStyle: 'italic' }}>
                    {assessment.reference}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ pt: { xs: 1, sm: 0 }, mt: 'auto', px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
                <Button
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => onSelectAssessment(assessment.id)}
                  sx={{
                    bgcolor: assessment.color,
                    color: '#fff',
                    fontWeight: 800,
                    py: { xs: 1.4, sm: 1.8 },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: { xs: '14px', sm: '16px' },
                    letterSpacing: '0.5px',
                    '&:hover': {
                      bgcolor: assessment.color,
                      opacity: 0.9,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${assessment.color}40`
                    }
                  }}
                >
                  Start Assessment
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
