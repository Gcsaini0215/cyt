import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Radio, 
  RadioGroup, 
  FormControlLabel,
  LinearProgress,
  Container,
  Paper,
  Chip,
  IconButton,
  Grid
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const assessmentQuestions = {
  1: {
    title: "Depression Screening (PHQ-9)",
    description: "Over the last two weeks, how often have you been bothered by any of the following problems?",
    color: "#1976d2",
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself or that you are a failure",
      "Trouble concentrating on things",
      "Moving or speaking slowly or being fidgety/restless",
      "Thoughts that you would be better off dead"
    ],
    options: [
      { label: "Not at all", value: 0 },
      { label: "Several days", value: 1 },
      { label: "More than half the days", value: 2 },
      { label: "Nearly every day", value: 3 }
    ]
  },
  2: {
    title: "Anxiety Assessment (GAD-7)",
    description: "Over the last two weeks, how often have you been bothered by anxiety or worry?",
    color: "#f57c00",
    questions: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it's hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen"
    ],
    options: [
      { label: "Not at all", value: 0 },
      { label: "Several days", value: 1 },
      { label: "More than half the days", value: 2 },
      { label: "Nearly every day", value: 3 }
    ]
  },
  3: {
    title: "Sleep Quality Index (PSQI)",
    description: "During the past month, how would you rate your sleep?",
    color: "#7c3aed",
    questions: [
      "What time have you usually gone to bed?",
      "How long (in minutes) has it usually taken you to fall asleep?",
      "What time have you usually gotten up in the morning?",
      "How many hours of actual sleep did you get?",
      "Cannot get to sleep within 30 minutes",
      "Wake up in the middle of the night or early morning",
      "Have to get up to use the bathroom",
      "Cannot breathe comfortably",
      "Cough or snore loudly",
      "Feel too cold or too hot",
      "Have bad dreams or nightmares",
      "Other reason(s)",
      "How would you rate your sleep quality overall?",
      "How often have you taken medicine to help you sleep?",
      "How often have you had trouble staying awake while driving, eating meals, or engaging in social activity?",
      "How much of a problem has this been?",
      "Do you have a regular bedtime routine?",
      "Do you exercise regularly?",
      "How would you describe your sleep problems?"
    ],
    options: [
      { label: "Very Poor", value: 0 },
      { label: "Fairly Poor", value: 1 },
      { label: "Fairly Good", value: 2 },
      { label: "Very Good", value: 3 }
    ]
  },
  4: {
    title: "PTSD Checklist (PCL-5)",
    description: "In the past month, how much have you been bothered by these problems?",
    color: "#dc2626",
    questions: [
      "Repeated, disturbing, and unwanted memories of the stressful experience",
      "Repeated, disturbing dreams related to the stressful experience",
      "Suddenly acting or feeling as if the stressful experience were happening again",
      "Feeling very upset when something reminded you of the stressful experience",
      "Having strong physical reactions when something reminded you of the stressful experience",
      "Avoiding memories, thoughts, or feelings related to the stressful experience",
      "Avoiding external reminders of the stressful experience",
      "Trouble remembering an important part of the stressful experience",
      "Having strong negative beliefs about yourself, other people, or the world",
      "Blaming yourself or someone else for the stressful experience",
      "Having strong negative emotions such as fear, anger, guilt, or shame",
      "Loss of interest in activities that you used to enjoy",
      "Feeling distant or cut off from other people",
      "Trouble experiencing positive emotions",
      "Irritable behavior, angry outbursts, or acting aggressively",
      "Taking too many risks or doing things that could cause you harm",
      "Being 'superalert' or watchful or on guard",
      "Feeling jumpy or easily startled",
      "Having difficulty concentrating",
      "Trouble falling or staying asleep"
    ],
    options: [
      { label: "Not at all", value: 0 },
      { label: "A little bit", value: 1 },
      { label: "Moderately", value: 2 },
      { label: "Quite a bit", value: 3 },
      { label: "Extremely", value: 4 }
    ]
  },
  5: {
    title: "Big Five Personality (OCEAN)",
    description: "Rate how much you agree with each statement on a scale of 1 to 5",
    color: "#16a34a",
    hasDimensions: true,
    dimensions: {
      openness: { 
        label: "Openness", 
        color: "#3b82f6", 
        items: [0, 5, 10, 15, 20],
        definition: "Curiosity about ideas, creativity, and willingness to try new experiences. Higher scores indicate imaginative and open-minded tendencies."
      },
      conscientiousness: { 
        label: "Conscientiousness", 
        color: "#f59e0b", 
        items: [1, 6, 11, 16, 21],
        definition: "Tendency to be organized, disciplined, and responsible. Higher scores reflect careful planning and goal-directed behavior."
      },
      extraversion: { 
        label: "Extraversion", 
        color: "#ec4899", 
        items: [2, 7, 12, 17, 22],
        definition: "Sociability, assertiveness, and tendency to seek stimulation. Higher scores indicate outgoing and energetic nature."
      },
      agreeableness: { 
        label: "Agreeableness", 
        color: "#10b981", 
        items: [3, 8, 13, 18, 23],
        definition: "Compassion, cooperativeness, and concern for others. Higher scores suggest empathy and collaborative approach."
      },
      neuroticism: { 
        label: "Neuroticism", 
        color: "#ef4444", 
        items: [4, 9, 14, 19, 24],
        definition: "Emotional stability and tendency to experience negative emotions. Higher scores indicate sensitivity to stress and anxiety."
      }
    },
    questions: [
      "I am interested in abstract ideas", // Openness (0)
      "I am always prepared", // Conscientiousness (1)
      "I am the life of the party", // Extraversion (2)
      "I am very cooperative", // Agreeableness (3)
      "I get stressed out easily", // Neuroticism (4)
      "I have a vivid imagination", // Openness (5)
      "I tend to be disorganized", // Conscientiousness (6)
      "I don't talk much", // Extraversion (7)
      "I am concerned about others", // Agreeableness (8)
      "I worry about things", // Neuroticism (9)
      "I like to reflect and play with ideas", // Openness (10)
      "I am careful and meticulous about details", // Conscientiousness (11)
      "I am outgoing and sociable", // Extraversion (12)
      "I sympathize with others' feelings", // Agreeableness (13)
      "I am easily disturbed", // Neuroticism (14)
      "I am original and come up with new ideas", // Openness (15)
      "I am efficient and effective at my work", // Conscientiousness (16)
      "I am talkative and assertive", // Extraversion (17)
      "I respect others and their opinions", // Agreeableness (18)
      "I am emotionally stable and calm", // Neuroticism (19)
      "I prefer work that is routine and familiar", // Openness (20)
      "I make a mess of things", // Conscientiousness (21) - reverse scored
      "I am quiet", // Extraversion (22) - reverse scored
      "I hold grudges", // Agreeableness (23) - reverse scored
      "I am anxious about things", // Neuroticism (24)
    ],
    options: [
      { label: "Strongly Disagree", value: 1 },
      { label: "Disagree", value: 2 },
      { label: "Neutral", value: 3 },
      { label: "Agree", value: 4 },
      { label: "Strongly Agree", value: 5 }
    ]
  }
};

export default function AssessmentForm({ assessmentId, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const assessment = assessmentQuestions[assessmentId];
  const totalQuestions = assessment.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
    setSubmitted(true);
  };

  const getResultInterpretation = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
    
    if (assessmentId === 5) {
      // Big Five Personality Test
      const dimensions = assessment.dimensions;
      const dimensionScores = {};
      
      Object.keys(dimensions).forEach(dim => {
        const itemIndices = dimensions[dim].items;
        const sum = itemIndices.reduce((acc, idx) => acc + (answers[idx] || 0), 0);
        const score = Math.round((sum / (itemIndices.length * 5)) * 100);
        dimensionScores[dim] = Math.max(0, Math.min(100, score));
      });
      
      return {
        isBigFive: true,
        dimensionScores,
        dimensions
      };
    } else if (assessmentId === 1) {
      if (totalScore >= 0 && totalScore <= 4) {
        return {
          level: "Minimal",
          color: "#16a34a",
          description: "Your responses indicate minimal depressive symptoms. Continue maintaining healthy habits and reach out if symptoms worsen."
        };
      } else if (totalScore <= 9) {
        return {
          level: "Mild",
          color: "#eab308",
          description: "You may be experiencing some mild depressive symptoms. Consider speaking with a mental health professional for support."
        };
      } else if (totalScore <= 14) {
        return {
          level: "Moderate",
          color: "#f97316",
          description: "You appear to have moderate depressive symptoms. It's recommended to consult with a therapist or counselor."
        };
      } else {
        return {
          level: "Severe",
          color: "#dc2626",
          description: "Your symptoms suggest moderate-severe depression. Please reach out to a mental health professional immediately."
        };
      }
    } else {
      if (totalScore >= 0 && totalScore <= 4) {
        return {
          level: "Minimal",
          color: "#16a34a",
          description: "Your responses indicate minimal anxiety symptoms. Great job managing your stress!"
        };
      } else if (totalScore <= 9) {
        return {
          level: "Mild",
          color: "#eab308",
          description: "You may be experiencing some mild anxiety. Consider relaxation techniques or speaking with a professional."
        };
      } else if (totalScore <= 14) {
        return {
          level: "Moderate",
          color: "#f97316",
          description: "You appear to have moderate anxiety symptoms. A therapist can provide helpful coping strategies."
        };
      } else {
        return {
          level: "Severe",
          color: "#dc2626",
          description: "Your symptoms suggest significant anxiety. Please consult with a mental health professional soon."
        };
      }
    }
  };

  if (submitted) {
    const result = getResultInterpretation();
    const totalScore = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <Box sx={{ mb: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#16a34a', mb: 1 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: { xs: '24px', sm: '32px' } }}>
              Assessment Complete!
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', mb: 2, fontSize: { xs: '14px', sm: '16px' }, fontWeight: 500 }}>
              Here are your assessment results
            </Typography>
          </Box>

          {result.isBigFive ? (
            <>
              <Typography variant="h5" sx={{ color: '#1e293b', mb: 2, fontSize: { xs: '20px', sm: '24px' }, fontWeight: 800, textAlign: 'left' }}>
                Your Personality Profile
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {Object.entries(result.dimensionScores).map(([key, score]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card elevation={0} sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '14px', flex: 1 }}>
                          {result.dimensions[key].label}
                        </Typography>
                        <Chip
                          label={`${score}%`}
                          sx={{
                            bgcolor: result.dimensions[key].color,
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '11px',
                            ml: 1,
                            flexShrink: 0,
                            height: 'auto',
                            py: 0.3
                          }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={score}
                        sx={{
                          height: 8,
                          borderRadius: '4px',
                          bgcolor: '#e2e8f0',
                          mb: 0.8,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: result.dimensions[key].color
                          }
                        }}
                      />
                      <Typography sx={{ mb: 0.8, fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                        {score < 33 && 'Low • '}
                        {score >= 33 && score < 67 && 'Moderate • '}
                        {score >= 67 && 'High • '}
                        {score}%
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
                        {result.dimensions[key].definition}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Card elevation={0} sx={{ bgcolor: `${result.color}10`, border: `2px solid ${result.color}`, mb: 2 }}>
              <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                <Chip
                  label={result.level}
                  sx={{
                    bgcolor: result.color,
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '16px',
                    height: 'auto',
                    py: 1,
                    px: 2.5,
                    mb: 1.5
                  }}
                />
                <Typography variant="h5" sx={{ color: '#1e293b', mb: 1, fontSize: { xs: '18px', sm: '22px' }, fontWeight: 800 }}>
                  Score: {totalScore} / {totalQuestions * 3}
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', mt: 1, fontSize: { xs: '13px', sm: '15px' }, lineHeight: 1.5 }}>
                  {result.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Typography variant="body1" sx={{ color: '#64748b', mb: 2, fontSize: { xs: '12px', sm: '13px' }, textAlign: 'center', lineHeight: 1.5 }}>
            💡 This assessment is for informational purposes only. For professional diagnosis, please consult a qualified mental health professional.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => window.location.href = '/therapy-booking'}
              sx={{
                bgcolor: '#228756',
                py: 1.2,
                fontWeight: 800,
                fontSize: { xs: '14px', sm: '15px' },
                '&:hover': { bgcolor: '#1b6843' }
              }}
            >
              Book a Therapist
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onBack}
              sx={{
                color: '#228756',
                borderColor: '#228756',
                py: 1.2,
                fontWeight: 800,
                fontSize: { xs: '14px', sm: '15px' },
                '&:hover': { borderColor: '#228756', bgcolor: '#f0fdf4' }
              }}
            >
              Back to Assessments
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={onBack} size="small" sx={{ color: '#64748b' }}>
            <ArrowBackIcon />
          </IconButton>
          <Chip 
            label={`Question ${currentQuestion + 1} of ${totalQuestions}`}
            sx={{
              bgcolor: `${assessment.color}15`,
              color: assessment.color,
              fontWeight: 800,
              fontSize: '14px',
              py: 2.5,
              px: 2
            }}
          />
          <Box sx={{ width: 40 }} />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress}
          sx={{
            height: 8,
            borderRadius: '4px',
            bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              bgcolor: assessment.color
            }
          }}
        />
      </Box>

      <Paper 
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', mb: 4, fontSize: '20px', lineHeight: 1.4 }}>
          {assessment.questions[currentQuestion]}
        </Typography>

        <RadioGroup
          value={answers[currentQuestion] ?? ""}
          onChange={(e) => handleAnswerChange(parseInt(e.target.value))}
        >
          {assessment.options.map((option, idx) => (
            <FormControlLabel
              key={idx}
              value={option.value}
              control={
                <Radio sx={{
                  color: '#cbd5e1',
                  '&.Mui-checked': {
                    color: assessment.color
                  }
                }}/>
              }
              label={option.label}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '& .MuiFormControlLabel-label': {
                  fontSize: '17px',
                  fontWeight: 600
                },
                '&:hover': {
                  bgcolor: `${assessment.color}08`,
                  borderColor: assessment.color
                }
              }}
            />
          ))}
        </RadioGroup>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            sx={{
              color: '#228756',
              borderColor: '#228756',
              py: 1.8,
              fontWeight: 800,
              fontSize: '16px',
              '&:hover': { borderColor: '#228756', bgcolor: '#f0fdf4' }
            }}
          >
            Previous
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleNext}
            disabled={!isAnswered}
            sx={{
              bgcolor: assessment.color,
              py: 1.8,
              fontWeight: 800,
              fontSize: '16px',
              '&:disabled': { bgcolor: '#cbd5e1' },
              '&:hover': { bgcolor: assessment.color, opacity: 0.9 }
            }}
          >
            {currentQuestion === totalQuestions - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
