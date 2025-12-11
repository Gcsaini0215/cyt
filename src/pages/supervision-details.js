import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  School,
  People,
  Psychology,
  Assignment,
  CheckCircle,
  Star,
  Phone,
  Chat,
  GroupWork,
  Lightbulb,
  TrendingUp,
  Support,
  EmojiEvents,
  Gavel,
  Handshake,
  TrendingUpRounded,
  PersonalVideo,
  Assessment,
  Diversity3,
  Biotech,
  MenuBook,
  Groups,
  TableChart,
  Done
} from '@mui/icons-material';
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";

const SupervisionDetails = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandProgram, setExpandProgram] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobileNumber: '' });

  // Pastel color palette
  const colors = {
    primary: '#E8F5E8', // Light green
    secondary: '#F3E5F5', // Light purple
    accent: '#FFF3E0', // Light orange
    text: '#424242',
    lightText: '#757575'
  };

  const stats = [
    { icon: <People />, value: '50+', label: 'Students Supervised' },
    { icon: <Star />, value: '4.9', label: 'Average Rating' },
    { icon: <Assignment />, value: '200+', label: 'Case Studies' },
    { icon: <TrendingUp />, value: '95%', label: 'Success Rate' }
  ];

  // Animated counter state
  const [animatedStats, setAnimatedStats] = useState(stats.map(stat => ({ ...stat, currentValue: 0 })));

  // Animate counters on component mount
  useEffect(() => {
    let timers = [];

    const animateCounters = () => {
      stats.forEach((stat, index) => {
        const targetValue = parseInt(stat.value.replace(/[^\d]/g, ''));
        const duration = 2000; // 2 seconds
        const steps = duration / 50;
        const increment = targetValue / steps;
        let currentValue = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          currentValue = Math.min(targetValue, increment * step);

          setAnimatedStats(prevStats =>
            prevStats.map((prevStat, prevIndex) =>
              prevIndex === index
                ? { ...prevStat, currentValue: Math.floor(currentValue) }
                : prevStat
            )
          );

          if (step >= steps) {
            clearInterval(timer);
          }
        }, 50);

        timers.push(timer);
      });
    };

    // Start animation after a short delay
    const startTimer = setTimeout(animateCounters, 500);

    return () => {
      clearTimeout(startTimer);
      timers.forEach(timer => clearInterval(timer));
    };
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ name: '', mobileNumber: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = () => {
    console.log('Form submitted:', formData);
    handleCloseModal();
  };

  const packages = [
    {
      id: 1,
      title: 'Basic Supervision Package',
      subtitle: 'Perfect for students starting their journey',
      price: '₹2,500/month',
      icon: <School sx={{ fontSize: isMobile ? 40 : 50, color: '#66BB6A' }} />,
      bgColor: colors.primary,
      features: [
        'Weekly supervision sessions (1 hour)',
        'Case study discussions',
        'Theoretical guidance',
        'Professional development resources',
        'Email support between sessions',
        'Progress tracking reports'
      ],
      benefits: [
        'Build foundational counseling skills',
        'Learn ethical decision-making',
        'Develop case conceptualization',
        'Access to supervision notes and resources'
      ],
      popular: false
    },
    {
      id: 2,
      title: 'Advanced Supervision Package',
      subtitle: 'Includes client interaction experience',
      price: '₹4,500/month',
      icon: <Psychology sx={{ fontSize: isMobile ? 40 : 50, color: '#AB47BC' }} />,
      bgColor: colors.secondary,
      features: [
        'Weekly supervision sessions (1.5 hours)',
        'Live client interaction observation',
        'Co-therapy sessions with supervisor',
        'Case study discussions',
        'Theoretical and practical guidance',
        'Professional development resources',
        '24/7 WhatsApp support',
        'Monthly progress assessment',
        'Recording review sessions'
      ],
      benefits: [
        'Hands-on client interaction experience',
        'Real-time feedback on sessions',
        'Advanced therapeutic techniques',
        'Build confidence in clinical practice',
        'Professional portfolio development'
      ],
      popular: true
    }
  ];

  return (
    <div id="__next">
      <MyNavbar />

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.8)), url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          py: isMobile ? 6 : 8,
          position: 'relative',
          overflow: 'hidden',
          minHeight: isMobile ? '60vh' : '65vh',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(102, 187, 106, 0.1) 0%, rgba(171, 71, 188, 0.1) 100%)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                variant={isMobile ? "h3" : "h2"}
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 2,
                  fontSize: isMobile ? '2.5rem' : '4rem',
                  textShadow: '2px 2px 3px rgba(0,0,0,0.95)'
                }}
              >
                Guided Supervision to 
                <Typography
                  component="span"
                  sx={{
                    color: '#66BB6A',
                    fontWeight: 700,
                    display: 'block',
                    fontSize: isMobile ? '2.2rem' : '3.5rem',
                    textShadow: '2px 2px 3px rgba(0,0,0,0.95)'
                  }}
                >
                  Build Your Counselling Expertise
                </Typography>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  mb: 4,
                  fontSize: isMobile ? '1.4rem' : '1.6rem',
                  lineHeight: 1.6,
                  textShadow: '2px 2px 3px rgba(0,0,0,0.95)'
                }}
              >
                Get expert guidance and mentorship to grow your counseling career. Learn practical skills, follow ethical practices, and gain the 
                confidence to succeed in the field.
              </Typography>

              <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#66BB6A',
                    '&:hover': { bgcolor: '#4CAF50', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)' },
                    px: 6,
                    py: 2,
                    fontSize: '1.3rem',
                    borderRadius: 3,
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(102, 187, 106, 0.3)',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.7)'
                  }}
                  startIcon={<Phone sx={{ fontSize: '1.5rem' }} />}
                >
                  Talk with Mentor
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
                    },
                    px: 6,
                    py: 2,
                    fontSize: '1.3rem',
                    borderRadius: 3,
                    fontWeight: 600,
                    textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
                  }}
                  startIcon={<Chat sx={{ fontSize: '1.5rem' }} />}
                >
                  Learn More
                </Button>
              </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About the Program Section */}
      <Box sx={{ py: isMobile ? 6 : 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left Side - Content */}
            <Grid item xs={12} md={6}>
              <Box>
                <Chip
                  label="About Our Program"
                  sx={{
                    mb: 3,
                    bgcolor: colors.primary,
                    color: '#66BB6A',
                    fontWeight: 600,
                    fontSize: '1rem',
                    height: 'auto',
                    py: 2,
                    px: 2
                  }}
                />
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: colors.text,
                    mb: 3,
                    fontSize: isMobile ? '2.2rem' : '3.2rem',
                    lineHeight: 1.2
                  }}
                >
                  Develop Confidence and Competence in Counseling Practice
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: colors.lightText,
                    mb: 3,
                    fontSize: isMobile ? '1.15rem' : '1.35rem',
                    lineHeight: 1.8
                  }}
                >
                 Our supervision program is designed to help you grow into a skilled and confident counseling professional. Through expert-led guidance, practical training, and ethical mentoring, you will gain the hands-on experience necessary to navigate real-world counseling scenarios effectively.

Participants engage in case-based learning, reflective exercises, and personalized feedback, allowing you to strengthen your counselling skills, enhance decision-making, and approach your practice with assurance. By the end of the program, you’ll have the competence and confidence to handle complex situations and provide meaningful support to your clients, setting a strong foundation for a successful counseling career.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenModal}
                  sx={{
                    bgcolor: '#66BB6A',
                    '&:hover': { bgcolor: '#4CAF50', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)' },
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(102, 187, 106, 0.3)'
                  }}
                  startIcon={<Phone sx={{ fontSize: '1.3rem' }} />}
                >
                  Start Your Journey
                </Button>
              </Box>
            </Grid>

            {/* Right Side - Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: isMobile ? 300 : 450,
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(102, 187, 106, 0.15)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 50px rgba(102, 187, 106, 0.25)'
                  }
                }}
              >
                <img
                  src="https://i.postimg.cc/x1H4wt5N/d7f6ffb8c7d9c01d849918e1e29d9b97.jpg"
                  alt="Supervision Session"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Objectives & Benefits Section */}
      <Box sx={{ py: isMobile ? 6 : 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Objectives Column */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: colors.text,
                    mb: 4,
                    fontSize: isMobile ? '2.4rem' : '3.3rem',
                    lineHeight: 1.2
                  }}
                >
                  Our Program Objectives
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    {
                      title: 'Develop Clinical Competence',
                      description: 'Build strong foundational skills in counseling techniques, assessment, and case conceptualization',
                      icon: <EmojiEvents sx={{ fontSize: 35, color: '#66BB6A' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(102, 187, 106, 0.05) 100%)'
                    },
                    {
                      title: 'Ensure Ethical Practice',
                      description: 'Deep understanding of professional ethics, confidentiality, and ethical decision-making frameworks',
                      icon: <Gavel sx={{ fontSize: 35, color: '#FF9800' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)'
                    },
                    {
                      title: 'Facilitate Real-World Experience',
                      description: 'Gain hands-on experience working with actual clients under expert supervision and guidance',
                      icon: <Handshake sx={{ fontSize: 35, color: '#AB47BC' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(171, 71, 188, 0.1) 0%, rgba(171, 71, 188, 0.05) 100%)'
                    },
                    {
                      title: 'Accelerate Career Growth',
                      description: 'Prepare for professional licensure, career opportunities, and continuous professional development',
                      icon: <TrendingUpRounded sx={{ fontSize: 35, color: '#29B6F6' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(41, 182, 246, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%)'
                    },
                    {
                      title: 'Build Professional Identity',
                      description: 'Develop a strong sense of professional identity as a competent and ethical counseling psychologist',
                      icon: <PersonalVideo sx={{ fontSize: 35, color: '#EC407A' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(236, 64, 122, 0.1) 0%, rgba(236, 64, 122, 0.05) 100%)'
                    }
                  ].map((objective, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        background: objective.bgGradient,
                        border: '1px solid rgba(102, 187, 106, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(102, 187, 106, 0.4)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 65,
                          width: 65,
                          height: 65,
                          borderRadius: '12px',
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      >
                        {objective.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: colors.text,
                            mb: 1,
                            fontSize: isMobile ? '1.15rem' : '1.4rem'
                          }}
                        >
                          {objective.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: colors.lightText,
                            fontSize: isMobile ? '1rem' : '1.15rem',
                            lineHeight: 1.7
                          }}
                        >
                          {objective.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Core Areas & Modules Column */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: colors.text,
                    mb: 4,
                    fontSize: isMobile ? '2.4rem' : '3.3rem',
                    lineHeight: 1.2
                  }}
                >
                  Core Areas You'll Master
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    {
                      title: 'Assessment & Diagnosis',
                      description: 'Learn comprehensive psychological assessment techniques and diagnostic procedures for diverse client presentations',
                      icon: <Assessment sx={{ fontSize: 35, color: '#66BB6A' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(102, 187, 106, 0.05) 100%)'
                    },
                    {
                      title: 'Therapeutic Techniques',
                      description: 'Master evidence-based counseling modalities including CBT, humanistic, and integrative approaches',
                      icon: <Psychology sx={{ fontSize: 35, color: '#AB47BC' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(171, 71, 188, 0.1) 0%, rgba(171, 71, 188, 0.05) 100%)'
                    },
                    {
                      title: 'Diversity & Inclusion',
                      description: 'Develop cultural competence and skills for working with clients from diverse backgrounds and identities',
                      icon: <Diversity3 sx={{ fontSize: 35, color: '#FF9800' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)'
                    },
                    {
                      title: 'Crisis & Self-Care',
                      description: 'Handle crisis situations ethically and develop personal wellness strategies to prevent burnout',
                      icon: <Biotech sx={{ fontSize: 35, color: '#29B6F6' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(41, 182, 246, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%)'
                    },
                    {
                      title: 'Group Work & Facilitation',
                      description: 'Lead therapeutic groups effectively and facilitate peer supervision and collaborative learning',
                      icon: <Groups sx={{ fontSize: 35, color: '#EC407A' }} />,
                      bgGradient: 'linear-gradient(135deg, rgba(236, 64, 122, 0.1) 0%, rgba(236, 64, 122, 0.05) 100%)'
                    }
                  ].map((area, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        background: area.bgGradient,
                        border: '1px solid rgba(102, 187, 106, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(102, 187, 106, 0.4)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 65,
                          width: 65,
                          height: 65,
                          borderRadius: '12px',
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      >
                        {area.icon}
                      </Box>


                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: colors.text,
                            mb: 1,
                            fontSize: isMobile ? '1.15rem' : '1.4rem'
                          }}
                        >
                          {area.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: colors.lightText,
                            fontSize: isMobile ? '1rem' : '1.15rem',
                            lineHeight: 1.7
                          }}
                        >
                          {area.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
  {/* Supervision Modules Section */}
      <Box sx={{ py: isMobile ? 6 : 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="Supervision Program Structure"
              sx={{
                mb: 3,
                bgcolor: colors.primary,
                color: '#66BB6A',
                fontWeight: 600,
                fontSize: '1rem',
                height: 'auto',
                py: 2,
                px: 2
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: colors.text,
                mb: 3,
                fontSize: isMobile ? '2.5rem' : '3.5rem'
              }}
            >
              Supervision Curriculum
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: colors.lightText,
                maxWidth: 700,
                mx: 'auto',
                fontSize: isMobile ? '1.2rem' : '1.5rem',
                lineHeight: 1.8,
                fontWeight: 500
              }}
            >
              Structured learning programs with comprehensive modules for professional development
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* 2 Month - 8 Sessions Table */}
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 6px 24px rgba(102, 187, 106, 0.1)', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ bgcolor: '#66BB6A', p: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '2.5rem', mb: 0.5 }}>2-Month Program (60 Hours)</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(139, 57, 57, 0.95)', fontSize: '1.4rem' }}>8 Sessions</Typography>
                  <Typography sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.9)', fontSize: '1.8rem', mt: 1 }}>₹3,499</Typography>
                </Box>

                <TableContainer sx={{ flex: 1 }}>
                  <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(102, 187, 106, 0.1)' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#E8F5E8' }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#66BB6A', py: 2 }}>Module</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#66BB6A', py: 2 }}>Content</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#66BB6A', py: 2 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { module: '1', content: 'Foundation & Assessment Skills', desc: 'Introduction to supervision & psychometric tools' },
                        { module: '2', content: 'Case Conceptualization', desc: 'Developing case formulation frameworks' },
                        { module: '3', content: 'Therapeutic Techniques', desc: 'Core counseling modalities & interventions' },
                        { module: '4', content: 'Client Management', desc: 'Working with diverse presentations' },
                        { module: '5', content: 'Ethical Practice', desc: 'Professional ethics & boundary setting' },
                        { module: '6', content: 'Self-Care Strategies', desc: 'Managing clinician stress & burnout' },
                        { module: '7', content: 'Crisis Intervention', desc: 'Risk assessment & acute situations' },
                        { module: '8', content: 'Integration & Reflection', desc: 'Synthesizing learning & professional growth' }
                      ].map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { bgcolor: 'rgba(102, 187, 106, 0.08)' },
                            bgcolor: index % 2 === 0 ? '#FAFAFA' : 'white'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#66BB6A', py: 2 }}>
                            {row.module}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1.3rem', color: colors.text, py: 2 }}>
                            {row.content}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '1.2rem', color: colors.lightText, py: 2 }}>
                            {row.desc}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>

            {/* 4 Month - 12 Sessions Table */}
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 6px 24px rgba(0, 168, 232, 0.1)',
                  border: '3px solid #00A8E8',
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: '#FF9800',
                    color: 'white',
                    px: 2.5,
                    py: 0.8,
                    borderRadius: '0 0 0 8px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    zIndex: 10
                  }}
                >
                  POPULAR
                </Box>

                <Box sx={{ background: 'linear-gradient(135deg, #00A8E8 0%, #0084B4 100%)', p: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '2.3rem', mb: 0.5 }}>4-Month Program (160 Hours)</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontSize: '1.4rem' }}>12 Sessions</Typography>
                  <Typography sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.9)', fontSize: '1.8rem', mt: 1 }}>₹4,999</Typography>
                </Box>

                <TableContainer sx={{ flex: 1 }}>
                  <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(0, 168, 232, 0.1)' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#E0F7FF' }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#00A8E8', py: 2 }}>Module</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#00A8E8', py: 2 }}>Content</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#00A8E8', py: 2 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { module: '1', content: 'Foundations & Assessment', desc: 'Assessment frameworks & psychometric tools' },
                        { module: '2', content: 'Case Conceptualization', desc: 'In-depth case formulation & analysis' },
                        { module: '3', content: 'Counseling Theories', desc: 'Integrating therapeutic modalities' },
                        { module: '4', content: 'Client Interactions', desc: 'Live sessions with supervisor' },
                        { module: '5', content: 'Therapeutic Techniques', desc: 'Advanced intervention strategies' },
                        { module: '6', content: 'Ethical Practice', desc: 'Professional ethics & decision-making' },
                        { module: '7', content: 'Diversity & Inclusion', desc: 'Culturally sensitive counseling' },
                        { module: '8', content: 'Crisis Management', desc: 'Risk assessment & intervention' },
                        ...(expandProgram ? [
                          { module: '9', content: 'Group Work', desc: 'Facilitating therapeutic groups' },
                          { module: '10', content: 'Advanced Cases', desc: 'Complex client presentations' },
                          { module: '11', content: 'Professional Development', desc: 'Career planning & specializations' },
                          { module: '12', content: 'Integration & Mastery', desc: 'Synthesizing skills & readiness assessment' }
                        ] : [])
                      ].map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { bgcolor: 'rgba(0, 168, 232, 0.08)' },
                            bgcolor: index % 2 === 0 ? '#FAFAFA' : 'white'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#00A8E8', py: 2 }}>
                            {row.module}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1.3rem', color: colors.text, py: 2 }}>
                            {row.content}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '1.2rem', color: colors.lightText, py: 2 }}>
                            {row.desc}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ textAlign: 'center', py: 2.5, borderTop: '1px solid rgba(0, 168, 232, 0.1)', bgcolor: '#F0FBFF' }}>
                  <Button
                    onClick={() => setExpandProgram(!expandProgram)}
                    sx={{
                      color: '#00A8E8',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0, 168, 232, 0.1)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {expandProgram ? '← Show Less' : 'View All Modules →'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Counter Banner Section */}
      <Box
        sx={{
          py: isMobile ? 6 : 8,
          backgroundImage: `url('https://i.postimg.cc/fLL9DbG4/asdf.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} justifyContent="center">
            {animatedStats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography
                    variant="h2"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      mb: 1,
                      fontSize: isMobile ? '2.5rem' : '3.5rem',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    {stat.value.includes('+') ? `${stat.currentValue}+` :
                     stat.value.includes('%') ? `${stat.currentValue}%` :
                     stat.value.includes('.') ? stat.currentValue.toFixed(1) :
                     stat.currentValue}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: isMobile ? '1.1rem' : '1.25rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mentors Section */}
      <Box sx={{ py: isMobile ? 8 : 12, bgcolor: '#f8fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="Meet Our Expert Mentors"
              sx={{
                mb: 3,
                bgcolor: colors.primary,
                color: '#66BB6A',
                fontWeight: 600,
                fontSize: '1rem',
                height: 'auto',
                py: 2,
                px: 2
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: colors.text,
                mb: 3,
                fontSize: isMobile ? '2.5rem' : '3.5rem'
              }}
            >
              Your Professional Guides
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: colors.lightText,
                maxWidth: 700,
                mx: 'auto',
                fontSize: isMobile ? '1.1rem' : '1.4rem',
                lineHeight: 1.8
              }}
            >
              Learn from experienced counseling psychologists dedicated to your professional growth
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: 'Mr. Deepak Kumar',
                title: 'Senior Counseling Psychologist & Mentor',
                bio: 'Dedicated professional with extensive experience in clinical supervision and student mentorship. Specializes in evidence-based counseling practices and professional development.',
                image: 'https://i.postimg.cc/x1NsvBTg/picturedeepak.png',
                specialty: 'Clinical Supervision'
              },
              {
                name: 'Ms. Fabiha Sultana Shaik',
                title: 'Counseling Psychologist & Researcher',
                bio: 'Expert in trauma-informed therapy and psychological assessment. Passionate about creating safe, inclusive spaces for diverse client populations.',
                image: 'https://i.postimg.cc/5y8pZhXy/avatar-2.jpg',
                specialty: 'Trauma & Assessment'
              },
              {
                name: 'Ms. Ayushi Pandwal',
                title: 'Counseling Psychologist & Career Counselor',
                bio: 'Specializes in career guidance and professional development. Committed to helping students build practical counseling skills and professional identity.',
                image: 'https://i.postimg.cc/VsMHVmDX/avatar-3.jpg',
                specialty: 'Career Counseling'
              },
              {
                name: 'Ms. Anjali Kushwah',
                title: 'Counseling Psychologist & Ethicist',
                bio: 'Passionate educator focused on ethical practice and therapeutic ethics. Dedicated to training competent, ethical counseling psychologists for the field.',
                image: 'https://i.postimg.cc/zX6ChKf7/avatar-4.jpg',
                specialty: 'Ethics & Practice'
              }
            ].map((mentor, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 16px 40px rgba(102, 187, 106, 0.15)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '100%',
                      overflow: 'hidden',
                      bgcolor: colors.primary
                    }}
                  >
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Chip
                      label={mentor.specialty}
                      size="small"
                      sx={{
                        bgcolor: colors.primary,
                        color: '#66BB6A',
                        fontWeight: 600,
                        mb: 2,
                        alignSelf: 'flex-start',
                        fontSize: '0.75rem'
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: colors.text,
                        mb: 0.5,
                        fontSize: isMobile ? '1.2rem' : '1.35rem'
                      }}
                    >
                      {mentor.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#66BB6A',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        mb: 2,
                        lineHeight: 1.4
                      }}
                    >
                      {mentor.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.lightText,
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        flex: 1
                      }}
                    >
                      {mentor.bio}
                    </Typography>

                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        color: '#66BB6A',
                        fontWeight: 700,
                        mt: 2,
                        textTransform: 'uppercase',
                        fontSize: '0.85rem',
                        '&:hover': {
                          bgcolor: 'rgba(102, 187, 106, 0.08)'
                        }
                      }}
                    >
                      Learn More →
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    
      {/* CTA Section */}
      <Box
        sx={{
          py: isMobile ? 6 : 8,
          bgcolor: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text,
              mb: 2,
              fontSize: isMobile ? '2.2rem' : '3rem'
            }}
          >
            Ready to Begin Your Professional Journey?
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: colors.lightText,
              mb: 4,
              maxWidth: 500,
              mx: 'auto',
              fontSize: isMobile ? '1.3rem' : '1.5rem'
            }}
          >
            Take the first step towards becoming a confident and competent counseling psychologist.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#66BB6A',
              '&:hover': { bgcolor: '#4CAF50' },
              px: 8,
              py: 2.5,
              fontSize: '1.4rem',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(102, 187, 106, 0.3)',
              fontWeight: 600
            }}
            startIcon={<Phone sx={{ fontSize: '1.5rem' }} />}
          >
            Schedule Free Consultation
          </Button>
        </Container>
      </Box>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.8rem', color: '#66BB6A', pb: 1 }}>
          Start Your Journey
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ mb: 3, color: colors.lightText, fontSize: '1.1rem' }}>
            Fill in your details to get started with our supervision program
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              variant="outlined"
              placeholder="Enter your full name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#66BB6A' },
                  '&:hover fieldset': { borderColor: '#66BB6A' }
                },
                '& .MuiOutlinedInput-input': { fontSize: '1.1rem' }
              }}
            />
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleFormChange}
              variant="outlined"
              placeholder="Enter your mobile number"
              type="tel"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#66BB6A' },
                  '&:hover fieldset': { borderColor: '#66BB6A' }
                },
                '& .MuiOutlinedInput-input': { fontSize: '1.1rem' }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#757575', fontSize: '1rem' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            sx={{
              bgcolor: '#66BB6A',
              '&:hover': { bgcolor: '#4CAF50' },
              fontSize: '1rem',
              fontWeight: 600,
              px: 4
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SupervisionDetails;