import React, { useEffect, useRef, useState } from "react";
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
import SuggestedTherapists from "./suggested-therapists";
import Link from "next/link";
import { postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";

// what each check is, who made it — shown under the result (and the key it is saved under)
export const TEST_META = {
  1: { key: "phq9", source: "PHQ-9 — Kroenke, Spitzer & Williams (2001), Journal of General Internal Medicine. Free to use." },
  2: { key: "gad7", source: "GAD-7 — Spitzer, Kroenke, Williams & Löwe (2006), Archives of Internal Medicine. Free to use." },
  3: { key: "sleep", source: "Built on the standard insomnia symptoms (trouble falling asleep, staying asleep, waking early, daytime impact) used in clinical sleep screening. A check-in, not a diagnostic scale." },
  4: { key: "pcl5", source: "PCL-5 — Weathers et al. (2013), US National Center for PTSD. Public domain." },
  5: { key: "bigfive", source: "Based on the Five-Factor (Big Five) model of personality — Costa & McCrae; Goldberg. A self-reflection tool, not a clinical test." },
};
// Big Five statements worded the other way round (agreeing means LESS of that trait)
const REVERSED = new Set([6, 7, 19, 20, 21, 22, 23]);

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
    title: "Sleep Check (insomnia symptoms)",
    description: "Over the last 2 weeks, how much has each of these been a problem for you?",
    color: "#7c3aed",
    questions: [
      "Difficulty falling asleep",
      "Difficulty staying asleep (waking up during the night)",
      "Waking up too early and not being able to get back to sleep",
      "Feeling dissatisfied with your current sleep",
      "Your sleep problem being noticeable to others (in how you look or act)",
      "Feeling worried or distressed about your sleep",
      "Sleep problems getting in the way of your day (energy, mood, focus, work)"
    ],
    options: [
      { label: "Not at all", value: 0 },
      { label: "A little", value: 1 },
      { label: "Somewhat", value: 2 },
      { label: "Quite a lot", value: 3 },
      { label: "Very much", value: 4 }
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
        items: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
        definition: "Curiosity about ideas, creativity, and willingness to try new experiences. Higher scores indicate imaginative and open-minded tendencies."
      },
      conscientiousness: { 
        label: "Conscientiousness", 
        color: "#f59e0b", 
        items: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46],
        definition: "Tendency to be organized, disciplined, and responsible. Higher scores reflect careful planning and goal-directed behavior."
      },
      extraversion: { 
        label: "Extraversion", 
        color: "#ec4899", 
        items: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47],
        definition: "Sociability, assertiveness, and tendency to seek stimulation. Higher scores indicate outgoing and energetic nature."
      },
      agreeableness: { 
        label: "Agreeableness", 
        color: "#10b981", 
        items: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48],
        definition: "Compassion, cooperativeness, and concern for others. Higher scores suggest empathy and collaborative approach."
      },
      neuroticism: { 
        label: "Neuroticism", 
        color: "#ef4444", 
        items: [4, 9, 14, 19, 24, 29, 34, 39, 44, 49],
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
      "I like to use new technologies and apps", // Openness (25)
      "I follow a schedule", // Conscientiousness (26)
      "I initiate conversations", // Extraversion (27)
      "I often help others without expecting anything in return", // Agreeableness (28)
      "I feel overwhelmed by emotions", // Neuroticism (29)
      "I enjoy exploring different philosophical concepts", // Openness (30)
      "I complete tasks with accuracy", // Conscientiousness (31)
      "I enjoy being the center of attention", // Extraversion (32)
      "I prefer cooperation over competition", // Agreeableness (33)
      "I become frustrated easily", // Neuroticism (34)
      "I enjoy artistic or creative activities", // Openness (35)
      "I keep my workspace organized and clean", // Conscientiousness (36)
      "I feel energized by social interactions", // Extraversion (37)
      "I find it easy to understand others' perspectives", // Agreeableness (38)
      "I often feel self-doubt", // Neuroticism (39)
      "I would describe myself as unconventional", // Openness (40)
      "I plan ahead and set goals", // Conscientiousness (41)
      "I prefer meeting new people", // Extraversion (42)
      "I am generous with my time and resources", // Agreeableness (43)
      "I experience mood swings", // Neuroticism (44)
      "I explore different cultures and ideas", // Openness (45)
      "I am detail-oriented in my work", // Conscientiousness (46)
      "I seek out social events and gatherings", // Extraversion (47)
      "I take others' feelings into consideration", // Agreeableness (48)
      "I feel nervous in uncertain situations", // Neuroticism (49)
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

  const advanceRef = useRef(null);
  const cardRef = useRef(null);
  const handleAnswerChange = (value) => {
    setAnswers((a) => ({ ...a, [currentQuestion]: value }));
    clearTimeout(advanceRef.current);
    if (currentQuestion < totalQuestions - 1) advanceRef.current = setTimeout(() => setCurrentQuestion((q) => Math.min(q + 1, totalQuestions - 1)), 320);
  };
  useEffect(() => () => clearTimeout(advanceRef.current), []);
  // keep the question in view on phones
  useEffect(() => {
    const el = cardRef.current;
    if (el && el.getBoundingClientRect().top < 70) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentQuestion]);

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    clearTimeout(advanceRef.current);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getResultInterpretation = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
    
    if (assessmentId === 5) {
      // Big Five Personality Test
      const dimensions = assessment.dimensions;
      const dimensionScores = {};
      
      Object.keys(dimensions).forEach(dim => {
        const itemIndices = dimensions[dim].items;
        const sum = itemIndices.reduce((acc, idx) => {
          const v = answers[idx] || 3;
          return acc + (REVERSED.has(idx) ? 6 - v : v);
        }, 0);
        const n = itemIndices.length;
        const score = Math.round(((sum - n) / (4 * n)) * 100);
        dimensionScores[dim] = Math.max(0, Math.min(100, score));
      });
      
      return {
        isBigFive: true,
        dimensionScores,
        dimensions
      };
    }
    const band = (b) => ({ ...b, score: totalScore });
    if (assessmentId === 1) { // PHQ-9, 0–27
      if (totalScore <= 4) return band({ level: "Minimal", color: "#16a34a", description: "Your answers suggest minimal depressive symptoms. Keep up what's helping, and check in again if things change." });
      if (totalScore <= 9) return band({ level: "Mild", color: "#eab308", description: "Your answers suggest mild depressive symptoms. Small routines, sleep and support help — and talking to a psychologist is worth considering if it lasts." });
      if (totalScore <= 14) return band({ level: "Moderate", color: "#f97316", description: "Your answers suggest moderate depressive symptoms. Speaking with a psychologist is recommended — therapy works well at this level." });
      if (totalScore <= 19) return band({ level: "Moderately severe", color: "#ea580c", description: "Your answers suggest moderately severe depressive symptoms. Please speak with a psychologist or doctor soon." });
      return band({ level: "Severe", color: "#dc2626", description: "Your answers suggest severe depressive symptoms. Please reach out to a mental-health professional as soon as you can." });
    }
    if (assessmentId === 2) { // GAD-7, 0–21
      if (totalScore <= 4) return band({ level: "Minimal", color: "#16a34a", description: "Your answers suggest minimal anxiety. Keep using what works for you." });
      if (totalScore <= 9) return band({ level: "Mild", color: "#eab308", description: "Your answers suggest mild anxiety. Breathing, grounding and regular routines help; a psychologist can teach more tools if it continues." });
      if (totalScore <= 14) return band({ level: "Moderate", color: "#f97316", description: "Your answers suggest moderate anxiety. Speaking with a psychologist is recommended." });
      return band({ level: "Severe", color: "#dc2626", description: "Your answers suggest severe anxiety. Please speak with a mental-health professional soon." });
    }
    if (assessmentId === 3) { // sleep, 0–28
      if (totalScore <= 7) return band({ level: "No significant sleep problem", color: "#16a34a", description: "Your sleep doesn't look like a major problem right now." });
      if (totalScore <= 14) return band({ level: "Some sleep difficulty", color: "#eab308", description: "Some sleep difficulty. A steady bedtime, less screen time at night and less caffeine late in the day often help." });
      if (totalScore <= 21) return band({ level: "Moderate sleep problem", color: "#f97316", description: "A moderate sleep problem. Therapy for insomnia (CBT-I) is very effective — a psychologist can help." });
      return band({ level: "Severe sleep problem", color: "#dc2626", description: "A severe sleep problem. Please speak with a doctor or psychologist about it." });
    }
    // PCL-5, 0–80 (33 or more suggests probable PTSD)
    if (totalScore < 20) return band({ level: "Few symptoms", color: "#16a34a", description: "Your answers show few trauma-related symptoms right now." });
    if (totalScore < 33) return band({ level: "Some symptoms", color: "#f97316", description: "Your answers show some trauma-related symptoms. Talking to a psychologist can help you process what happened." });
    return band({ level: "Probable PTSD", color: "#dc2626", description: "Your answers are in the range where PTSD is likely. Please speak with a trauma-informed psychologist — it is very treatable." });
  };

  // save the finished check to the client's history (score + band only — never the answers)
  const [saved, setSaved] = useState(""); // "" | saving | ok | err
  const savedRef = React.useRef(false);
  const saveResult = () => {
    const tok = getDecodedToken();
    if (!tok || tok.role !== 0) return; // only clients keep a history
    const r = getResultInterpretation();
    const meta = TEST_META[assessmentId];
    setSaved("saving");
    postData(`${apiUrl}/assessments`, {
      test: meta.key, title: assessment.title,
      ...(r.isBigFive ? { dims: r.dimensionScores, level: "Profile" } : { score: r.score, level: r.level }),
      flag: assessmentId === 1 && (answers[8] || 0) > 0,
    }).then((x) => setSaved(x?.status ? "ok" : "err")).catch(() => setSaved("err"));
  };
  React.useEffect(() => {
    if (!submitted || savedRef.current) return;
    savedRef.current = true;
    saveResult();
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (submitted) {
    const result = getResultInterpretation();
    const totalScore = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);

    return (
      <section className="saf saf-result">
      <style dangerouslySetInnerHTML={{ __html: SAF_CSS }} />
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 4 } }}>
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
                  Score: {totalScore} / {totalQuestions * Math.max(...assessment.options.map((o) => o.value))}
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', mt: 1, fontSize: { xs: '13px', sm: '15px' }, lineHeight: 1.5 }}>
                  {result.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* PHQ-9 item 9 (thoughts of being better off dead / self-harm): point to help right away */}
          {assessmentId === 1 && answers[8] > 0 && (
            <Box role="alert" sx={{ bgcolor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', p: 2, mb: 2 }}>
              <Typography sx={{ fontWeight: 800, color: '#b91c1c', fontSize: '15px' }}>You don&apos;t have to handle this alone</Typography>
              <Typography sx={{ color: '#7f1d1d', fontSize: '13.5px', mt: 0.5, lineHeight: 1.5 }}>
                If you are having thoughts of harming yourself, please talk to someone now — call Tele-MANAS on{' '}
                <a href="tel:14416" style={{ color: '#b91c1c', fontWeight: 800 }}>14416</a> or{' '}
                <a href="tel:18008914416" style={{ color: '#b91c1c', fontWeight: 800 }}>1800-89-14416</a> (free, 24×7), or go to your nearest hospital.
              </Typography>
            </Box>
          )}

          <Box sx={{ textAlign: 'left', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', p: 1.5, mb: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
              <b>About this check:</b> {TEST_META[assessmentId].source}
            </Typography>
            {saved === "saving" && <Typography sx={{ fontSize: '12.5px', color: '#64748b', fontWeight: 700, mt: 0.75 }}>Saving to your check-ins…</Typography>}
            {saved === "err" && (
              <Typography sx={{ fontSize: '12.5px', color: '#b91c1c', fontWeight: 700, mt: 0.75 }}>
                Couldn&apos;t save this result to your check-ins.{' '}
                <button type="button" onClick={saveResult} style={{ border: 0, background: 'none', color: '#166534', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}>Try again</button>
              </Typography>
            )}
            {saved === "ok" && (
              <Typography sx={{ fontSize: '12.5px', color: '#166534', fontWeight: 700, mt: 0.75 }}>
                ✓ Saved privately to your account — <Link href="/client/check-ins" style={{ color: '#166534', textDecoration: 'underline' }}>see all your check-ins</Link>
              </Typography>
            )}
          </Box>

          <SuggestedTherapists assessmentId={assessmentId} />

          <Typography variant="body1" sx={{ color: '#64748b', mb: 2, fontSize: { xs: '12px', sm: '13px' }, textAlign: 'center', lineHeight: 1.5 }}>
            💡 This assessment is for informational purposes only. For professional diagnosis, please consult a qualified mental health professional.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { window.location.href = '/view-all-therapist'; }}
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
      </section>
    );
  }

  const isAnswered = answers[currentQuestion] !== undefined;
  const answeredCount = Object.keys(answers).length;
  const isLast = currentQuestion === totalQuestions - 1;
  const c = assessment.color;

  return (
    <section className="saf" style={{ "--c": c }}>
      <style dangerouslySetInnerHTML={{ __html: SAF_CSS }} />
      <div className="saf-in">
        <div className="saf-top">
          <button type="button" className="saf-back" onClick={onBack} aria-label="Back to all checks"><ArrowBackIcon /></button>
          <div className="saf-tt">
            <b>{assessment.title}</b>
            <span>Question {currentQuestion + 1} of {totalQuestions} · {answeredCount} answered</span>
          </div>
        </div>
        <div className="saf-prog" role="progressbar" aria-valuemin={0} aria-valuemax={totalQuestions} aria-valuenow={currentQuestion + 1}>
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="saf-card" ref={cardRef}>
          <p className="saf-frame">{assessment.description}</p>
          <h2 className="saf-q" key={currentQuestion}>{assessment.questions[currentQuestion]}</h2>
          <div className="saf-opts" role="radiogroup" aria-label="Your answer">
            {assessment.options.map((option, idx) => {
              const on = answers[currentQuestion] === option.value;
              return (
                <button key={idx} type="button" role="radio" aria-checked={on} className={`saf-opt${on ? " on" : ""}`} onClick={() => handleAnswerChange(option.value)}>
                  <span className="saf-dot" aria-hidden="true" />
                  <span className="saf-lbl">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="saf-nav">
            <button type="button" className="saf-btn ghost" onClick={handlePrevious} disabled={currentQuestion === 0}>← Previous</button>
            {(isLast || isAnswered) && (
              <button type="button" className="saf-btn solid" onClick={handleNext} disabled={!isAnswered || (isLast && answeredCount < totalQuestions)}>
                {isLast ? "See my result" : "Next →"}
              </button>
            )}
          </div>
          {isLast && answeredCount < totalQuestions && <p className="saf-miss">Please answer every question to see your result — tap Previous to go back.</p>}
        </div>

        <p className="saf-priv">🔒 Answer honestly — there are no right or wrong answers. Only your score is saved, never your answers.</p>
      </div>
    </section>
  );
}

const SAF_CSS = `
.saf { background: #f4f7f5; padding: 26px 0 48px; }
.saf-in { max-width: 760px; margin: 0 auto; padding: 0 16px; }
.saf-top { display: flex; align-items: center; gap: 12px; }
.saf-back { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; color: #334155; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.saf-back:hover { border-color: var(--c); color: var(--c); }
.saf-tt { min-width: 0; }
.saf-tt b { display: block; font-size: 16px; color: #0f172a; line-height: 1.3; }
.saf-tt span { display: block; font-size: 12.5px; color: #64748b; font-weight: 600; margin-top: 1px; }
.saf-prog { height: 8px; border-radius: 8px; background: #e2e8f0; overflow: hidden; margin: 14px 0 16px; }
.saf-prog i { display: block; height: 100%; border-radius: 8px; background: var(--c); transition: width .3s ease; }
.saf-card { background: #fff; border: 1px solid #e5ebe7; border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px -22px rgba(15,23,42,.35); scroll-margin-top: 80px; }
.saf-frame { margin: 0 0 8px; font-size: 13px; color: #64748b; font-weight: 600; line-height: 1.5; }
.saf-q { margin: 0 0 18px; font-size: clamp(18px, 2.4vw, 22px); font-weight: 800; color: #0f172a; line-height: 1.4; font-family: inherit; animation: safIn .25s ease; }
@keyframes safIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
.saf-opts { display: flex; flex-direction: column; gap: 10px; }
.saf-opt { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 54px; padding: 12px 16px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; text-align: left; cursor: pointer; font-family: inherit; transition: border-color .15s, background .15s, transform .1s; }
.saf-opt:hover { border-color: var(--c); background: #fafcfb; }
.saf-opt:active { transform: scale(.99); }
.saf-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e1; flex-shrink: 0; display: grid; place-items: center; }
.saf-lbl { font-size: 15.5px; font-weight: 700; color: #1e293b; }
.saf-opt.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 8%, #fff); }
.saf-opt.on .saf-dot { border-color: var(--c); background: var(--c); box-shadow: inset 0 0 0 4px #fff; }
.saf-nav { display: flex; gap: 10px; margin-top: 20px; }
.saf-btn { flex: 1; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; border: 1.5px solid transparent; }
.saf-btn.ghost { background: #fff; border-color: #d5e3da; color: #166534; }
.saf-btn.solid { background: var(--c); color: #fff; }
.saf-btn:disabled { opacity: .45; cursor: not-allowed; }
.saf-miss { margin: 10px 0 0; font-size: 12.5px; color: #b45309; font-weight: 600; }
.saf-priv { margin: 14px 0 0; text-align: center; font-size: 12.5px; color: #64748b; }
.saf-result { padding: 0 0 24px; }
@media (max-width: 560px) {
  .saf { padding: 16px 0 32px; }
  .saf-card { padding: 16px; border-radius: 16px; }
  .saf-opt { min-height: 50px; padding: 10px 14px; }
  .saf-lbl { font-size: 15px; }
}
`;
