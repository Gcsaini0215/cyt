import React, { useState } from "react";
import { Box, Button, ButtonGroup, useMediaQuery, Typography, Dialog, DialogContent, DialogTitle, IconButton, Container, Grid, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LazyImage from "../../utils/lazy-image";
import coupleplan from "../../assets/img/coupleplan.jpg";
import coupletherapyplan from "../../assets/img/coupletherapyplan.jpg";
import coupleplantherapy from "../../assets/img/coupleplantherapy.jpg";
import therapyindividualcare from "../../assets/img/therapyindividualcare.jpg";
import therapycare from "../../assets/img/therapycare.jpg";
import indicare from "../../assets/img/indicare.jpg";
import deepd from "../../assets/img/deepd.png";

export default function PlansCards({ planType, setPlanType }) {
  const isMobile = useMediaQuery("(max-width:768px)");
  // Remove local state since it's now coming from props
  // const [planType, setPlanType] = useState("individual");
  const defaultImage = "https://i.postimg.cc/FRMzw223/d405ea7b821eb5830b509ece3d126681.jpg";
  const essentialImage = "https://i.postimg.cc/cJV8Ng3Y/f342213ac4783b30476d36ce300c2641.jpg";

  const individualPlans = [
    {
      title: "Essential Care",
      sessions: "4 Session",
      price: "3,800",
      image: therapyindividualcare.src || therapyindividualcare,
      description: "Perfect for beginners starting their healing journey with foundational support.",
      features: ["4 One-on-one session", "Choice to change therapist", "Goal setting", "Practical coping tools", "Activities worksheet"],
      color: "color-primary",
      btnClass: "bg-primary-opacity"
    },
    {
      title: "Mindset Growth",
      sessions: " 8 Sessions",
      price: "6,800",
      image: therapycare.src || therapycare,
      popular: true,
      description: "Our most balanced plan for building deep emotional regulation and resilience.",
      features: ["8 one-on-one therapy sessions", "Choice to change therapist", "In-depth concern identification", "Emotional regulation practices", "Activities worksheet", "CBT based Approach", "Free Follow-up through chat", "Priority scheduling support"],
      color: "color-secondary",
      btnClass: "bg-secondary-opacity"
    },
    {
      title: "Holistic Wellness",
      sessions: "12 Sessions",
      price: "9,600",
      image: indicare.src || indicare,
      description: "A comprehensive long-term strategy for total mental and lifestyle transformation.",
      features: ["12 one-on-one sessions", "Choice to change therapist", "Personalized long-term wellness strategy", "Holistic CBT, mindfulness & lifestyle approach","Activities worksheet", "Free Follow-up through chat", "Priority scheduling support"],
      color: "color-pink",
      btnClass: "bg-pink-opacity"
    }
  ];

  const couplePlans = [
    {
      title: "Bridge Building",
      sessions: "1 Session",
      price: "1,499",
      image: coupleplan.src || coupleplan,
      description: "A single focused session to assess relationship health and open communication.",
      features: ["Joint consultation", "Relationship assessment", "Communication tools", "Safe dialogue space"],
      color: "color-primary",
      btnClass: "bg-primary-opacity"
    },
    {
      title: "Partnership Growth",
      sessions: "4 Sessions",
      price: "5,499",
      image: coupletherapyplan.src || coupletherapyplan,
      popular: true,
      description: "Build a stronger bond through active conflict resolution and emotional connection.",
      features: ["Conflict resolution", "Intimacy building", "Emotional bonding", "Homework assignments"],
      color: "color-secondary",
      btnClass: "bg-secondary-opacity"
    },
    {
      title: "Eternal Connection",
      sessions: "8 Sessions",
      price: "9,999",
      image: coupleplantherapy.src || coupleplantherapy,
      description: "Comprehensive support for couples navigating deep trust and life transitions.",
      features: ["Comprehensive support", "Trust rebuilding", "Life transition coaching", "Relationship health"],
      color: "color-pink",
      btnClass: "bg-pink-opacity"
    }
  ];

  const currentPlans = planType === "individual" ? individualPlans : couplePlans;

  const [openQr, setOpenQr] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openPlanDetail, setOpenPlanDetail] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [openConcernModal, setOpenConcernModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState(null);

  const concernDetails = {
    "Anxiety & Stress": {
      fullInfo: "Chronic anxiety and stress can manifest as constant worry, physical tension, and sleep disturbances. Our specialized approach focuses on Cognitive Behavioral Therapy (CBT) and Mindfulness to help you regain control of your calm.",
      benefits: ["Identify triggers", "Anxiety management techniques", "Breathwork & Grounding", "Panic attack prevention"],
      description: "Manage overwhelming thoughts",
      packages: [
        { title: "Calm Foundation", sessions: 4, price: "3,800" },
        { title: "Peace Recovery", sessions: 8, price: "6,800" },
        { title: "Mindful Mastery", sessions: 12, price: "9,600" }
      ]
    },
    "Depression": {
      fullInfo: "Depression is more than just feeling sad; it's a persistent weight that affects every part of life. We provide a supportive, non-judgmental space to explore root causes and build active steps toward hope and vitality.",
      benefits: ["Emotional processing", "Behavioral activation", "Negative thought reframing", "Relapse prevention"],
      description: "Find hope and emotional balance",
      packages: [
        { title: "Hope Path", sessions: 4, price: "3,800" },
        { title: "Vitality Core", sessions: 8, price: "6,800" },
        { title: "Luminous Life", sessions: 12, price: "9,600" }
      ]
    },
    "Relationships": {
      fullInfo: "Healthy relationships require effort, communication, and understanding. Whether you're navigating conflicts or seeking deeper connection, our therapy helps you build strong emotional foundations with your loved ones.",
      benefits: ["Communication skills", "Conflict resolution", "Trust rebuilding", "Intimacy enhancement"],
      description: "Build deeper, healthier bonds",
      packages: [
        { title: "Bonding Start", sessions: 4, price: "5,499" },
        { title: "Unity Core", sessions: 8, price: "9,999" },
        { title: "Connection Mastery", sessions: 12, price: "14,500" }
      ]
    },
    "Self Worth": {
      fullInfo: "Low self-esteem can hold you back from your true potential. Our 'Self Worth' program is designed to help you dismantle self-doubt, build authentic confidence, and recognize your inherent value.",
      benefits: ["Inner child healing", "Self-compassion practice", "Confidence building", "Boundary setting"],
      description: "Unlock your true potential",
      packages: [
        { title: "Self Seed", sessions: 4, price: "3,800" },
        { title: "Growth Core", sessions: 8, price: "6,800" },
        { title: "Radiant Self", sessions: 12, price: "9,600" }
      ]
    },
    "Social Anxiety": {
      fullInfo: "Fear of judgment in social situations can be paralyzing. We use exposure techniques and social skills training to help you navigate social settings with ease and authenticity.",
      benefits: ["Social skill building", "Cognitive restructuring", "Gradual exposure", "Public speaking confidence"],
      description: "Navigate social settings",
      packages: [
        { title: "Social Spark", sessions: 4, price: "3,800" },
        { title: "Interaction Core", sessions: 8, price: "6,800" },
        { title: "Authentic Bold", sessions: 12, price: "9,600" }
      ]
    },
    "Workplace Stress": {
      fullInfo: "Burnout and work-related pressure can spill over into your personal life. Learn how to manage high-pressure environments, set professional boundaries, and find your work-life harmony.",
      benefits: ["Burnout recovery", "Time management", "Corporate boundaries", "Leadership mindset"],
      description: "Balance career and wellness",
      packages: [
        { title: "Career Reset", sessions: 4, price: "3,800" },
        { title: "Balance Core", sessions: 8, price: "6,800" },
        { title: "High-Performance Zen", sessions: 12, price: "9,600" }
      ]
    },
    "Trauma & PTSD": {
      fullInfo: "Traumatic experiences can leave deep imprints on the mind and body. Our trauma-informed therapy provides a safe anchor to process memories and rebuild a sense of safety and empowerment.",
      benefits: ["Trauma processing", "Safe space creation", "Nervous system regulation", "Post-traumatic growth"],
      description: "Heal from past experiences",
      packages: [
        { title: "Healing Anchor", sessions: 4, price: "3,800" },
        { title: "Safety Core", sessions: 8, price: "6,800" },
        { title: "Resilience Mastery", sessions: 12, price: "9,600" }
      ]
    },
    "Sleep Disorders": {
      fullInfo: "Quality sleep is the foundation of mental health. We address the psychological root causes of insomnia and sleep disturbances to help you restore your natural rhythm and wake up refreshed.",
      benefits: ["Sleep hygiene training", "Insomnia CBT-I", "Nighttime anxiety reduction", "Natural rhythm restoration"],
      description: "Restore your natural rest",
      packages: [
        { title: "Restful Night", sessions: 4, price: "3,800" },
        { title: "Deep Slumber", sessions: 8, price: "6,800" },
        { title: "Vital rest", sessions: 12, price: "9,600" }
      ]
    }
  };

  const handleOpenPlanDetail = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanDetail(true);
  };

  const handleOpenConcern = (concern) => {
    setSelectedConcern({
      title: concern.title,
      image: concern.image,
      color: concern.color,
      ...concernDetails[concern.title]
    });
    setOpenConcernModal(true);
  };

  const handleOpenInfo = (concern) => {
    setSelectedConcern({
      title: concern.title,
      image: concern.image,
      color: concern.color,
      ...concernDetails[concern.title]
    });
    setOpenInfoModal(true);
  };

  const handleChoosePlan = (plan) => {
    const upiId = "chooseyourtherapist@okhdfcbank";
    const amount = plan.price.replace(/,/g, "");
    const planName = encodeURIComponent(plan.title);
    const payeeName = encodeURIComponent("Choose Your Therapist");
    
    const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${planName}%20Package`;
    
    if (isMobile) {
      window.location.href = upiLink;
    } else {
      setSelectedPlan({ ...plan, upiLink });
      setOpenQr(true);
    }
  };

  return (
    <div className="rbt-article-content-wrapper">
      {/* Meet Your Care Providers - Bento Grid */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ 
            fontWeight: 800, 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '2px',
            color: '#228756',
            mb: 2
          }}>
            Trusted Expertise
          </Typography>
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            color: '#1e293b',
            fontSize: { xs: '32px', md: '40px' },
            letterSpacing: '-1px'
          }}>
            Meet the Minds Behind <span style={{ color: '#228756' }}>CYT</span>
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Block: CYT Noida */}
          <Grid item xs={12} md={7}>
            <Box sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #228756 0%, #1a6b44 100%)',
              borderRadius: '32px',
              p: { xs: 4, md: 6 },
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(34, 135, 86, 0.15)'
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '24px', md: '32px' } }}>
                  Choose Your Therapist <br/> (CYT) Noida
                </Typography>
                <Typography sx={{ fontSize: '17px', lineHeight: 1.7, opacity: 0.9, mb: 4, fontWeight: 400 }}>
                  Founded in the heart of Noida, CYT is more than just a therapy platform. 
                  We are a premium clinical hub dedicated to bridging the gap between 
                  struggle and strength. Our Noida center serves as a sanctuary for 
                  evidence-based healing and deep emotional transformation.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
                  {["Premium Care", "Noida Based", "Clinical Hub"].map((tag, i) => (
                    <Box key={i} sx={{ px: 2, py: 0.5, borderRadius: '50px', bgcolor: 'rgba(255,255,255,0.15)', fontSize: '12px', fontWeight: 700 }}>
                      {tag}
                    </Box>
                  ))}
                </Box>

                {/* Single Lead Therapist Profile */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2.5, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  p: 2.5, 
                  borderRadius: '24px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  maxWidth: '500px'
                }}>
                  <Box sx={{ width: '70px', height: '70px', borderRadius: '18px', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                    <img src={deepd.src || deepd} alt="Deepak Kumar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>Deepak Kumar</Typography>
                    <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', mt: 0.5, fontWeight: 600 }}>
                      Director, Ph.D Researcher (NET)
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#228756', mt: 0.5, fontWeight: 800, bgcolor: 'white', display: 'inline-block', px: 1, borderRadius: '4px', textTransform: 'uppercase' }}>
                      Psychologist
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <i className="feather-map-pin" style={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '-20px', 
                fontSize: '180px', 
                color: 'rgba(255,255,255,0.05)',
                transform: 'rotate(-15deg)'
              }}></i>
            </Box>
          </Grid>

          {/* Right Column: Stacked Blocks */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              {/* Block 2: Verified Psychologists */}
              <Box sx={{
                flex: 1,
                background: '#ffffff',
                borderRadius: '32px',
                p: 4,
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ 
                  width: '48px', 
                  height: '48px', 
                  bgcolor: 'rgba(34, 135, 86, 0.1)', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2.5
                }}>
                  <i className="feather-user-check" style={{ color: '#228756', fontSize: '20px' }}></i>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1.5 }}>
                  Verified Psychologists
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Our team consists of RCI registered and highly experienced Clinical & Counselling 
                  Psychologists who specialize in handling complex mental health concerns with 
                  utmost empathy.
                </Typography>
              </Box>

              {/* Block 3: Clinical Excellence */}
              <Box sx={{
                flex: 1,
                background: '#ffffff',
                borderRadius: '32px',
                p: 4,
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
              }}>
                <Box sx={{ 
                  width: '48px', 
                  height: '48px', 
                  bgcolor: 'white', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2.5,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}>
                  <i className="feather-shield" style={{ color: '#228756', fontSize: '20px' }}></i>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1.5 }}>
                  Clinical Excellence
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6 }}>
                  We follow a rigorous evidence-based approach using CBT, DBT, and Mindfulness-based 
                  interventions tailored to your unique psychological profile.
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Your Journey to Healing Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Grid container spacing={4} sx={{ position: 'relative' }}>
          {/* Connection Line (Desktop only) */}
          {!isMobile && (
            <Box sx={{
              position: 'absolute',
              top: '40px',
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #228756, transparent)',
              opacity: 0.1,
              zIndex: 0
            }} />
          )}

          {[
            { 
              step: "01", 
              title: "Choose Your Plan", 
              desc: "Select a package that fits your needs and complete the secure payment.",
              icon: "feather-shopping-cart"
            },
            { 
              step: "02", 
              title: "Therapist Match", 
              desc: "We connect you with the most suitable expert based on your specific concerns.",
              icon: "feather-users"
            },
            { 
              step: "03", 
              title: "Discovery Session", 
              desc: "Begin your first session to build comfort and define your healing goals.",
              icon: "feather-target"
            },
            { 
              step: "04", 
              title: "Long-term Growth", 
              desc: "Consistent sessions lead to deep breakthroughs and emotional resilience.",
              icon: "feather-trending-up"
            }
          ].map((item, idx) => (
            <Grid item xs={12} md={3} key={idx} sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '24px', 
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9',
                  position: 'relative'
                }}>
                  <Typography sx={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    bgcolor: '#228756',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.step}
                  </Typography>
                  <i className={item.icon} style={{ color: '#228756', fontSize: '28px' }}></i>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#1e293b', fontSize: '18px' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, px: 2 }}>
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <div className="rbt-pricing-area bg-color-white" style={{ paddingTop: "20px", paddingBottom: "80px" }}>
        <div className="container">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{
              bgcolor: '#228756',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <i className="feather-list" style={{ fontSize: '18px' }}></i>
              Plans based on Therapy Session
            </Box>

            <Box
              sx={{
                display: 'inline-flex',
                borderRadius: '50px',
                backgroundColor: '#f8fafc',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                onClick={() => setPlanType("individual")}
                style={{
                  padding: isMobile ? '8px 20px' : '10px 32px',
                  borderRadius: '50px',
                  border: 'none',
                  backgroundColor: planType === "individual" ? '#228756' : 'transparent',
                  color: planType === "individual" ? 'white' : '#64748b',
                  fontWeight: 800,
                  fontSize: isMobile ? '13px' : '14px',
                  cursor: 'pointer',
                  boxShadow: planType === "individual" ? '0 4px 10px rgba(34, 135, 86, 0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                Individual
              </button>
              <button
                onClick={() => setPlanType("couple")}
                style={{
                  padding: isMobile ? '8px 20px' : '10px 32px',
                  borderRadius: '50px',
                  border: 'none',
                  backgroundColor: planType === "couple" ? '#228756' : 'transparent',
                  color: planType === "couple" ? 'white' : '#64748b',
                  fontWeight: 800,
                  fontSize: isMobile ? '13px' : '14px',
                  cursor: 'pointer',
                  boxShadow: planType === "couple" ? '0 4px 10px rgba(34, 135, 86, 0.2)' : 'none',
                  transition: 'all 0.3s ease',
                  marginLeft: '2px',
                }}
              >
                Couple
              </button>
            </Box>
          </Box>
          <div className="row g-5">
            {currentPlans.map((plan, index) => (
              <div key={index} className="col-xl-4 col-lg-4 col-md-6 col-12">
                <Box sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '24px',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  border: plan.popular ? '2px solid #228756' : '1px solid #f1f5f9',
                  boxShadow: plan.popular 
                    ? '0 20px 40px rgba(34, 135, 86, 0.15)' 
                    : '0 10px 30px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.12)',
                  }
                }}>
                  {plan.popular && (
                    <Box sx={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 10,
                      backgroundColor: '#228756',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 12px rgba(34, 135, 86, 0.3)'
                    }}>
                      Most Popular
                    </Box>
                  )}

                  {/* Top Image */}
                  <Box sx={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={plan.image} 
                      alt={plan.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease'
                      }} 
                    />
                  </Box>

                  <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header Info */}
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ 
                        color: plan.popular ? '#228756' : '#64748b', 
                        fontSize: '14px', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        mb: 1,
                        letterSpacing: '1px'
                      }}>
                        {plan.sessions}
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 900, 
                        color: '#1a1a1a', 
                        fontSize: '26px',
                        lineHeight: 1.2
                      }}>
                        {plan.title}
                      </Typography>
                    </Box>

                    {/* Pricing */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                      <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', mr: 0.5 }}>₹</Typography>
                      <Typography sx={{ fontSize: '42px', fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{plan.price}</Typography>
                      <Typography sx={{ color: '#64748b', ml: 1, fontSize: '15px' }}>/ package</Typography>
                    </Box>

                    {/* Description */}
                    <Typography sx={{ 
                      color: '#64748b', 
                      fontSize: '15px', 
                      lineHeight: 1.6, 
                      mb: 4,
                      flex: 1 
                    }}>
                      {plan.description}
                    </Typography>

                    {/* Action Button */}
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleOpenPlanDetail(plan)}
                      sx={{
                        py: 2,
                        borderRadius: '14px',
                        backgroundColor: plan.popular ? '#228756' : '#1a1a1a',
                        fontSize: '16px',
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease',
                        mt: 'auto', // Push to bottom
                        '&:hover': {
                          backgroundColor: plan.popular ? '#1a6b44' : '#334155',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Section: Plans Based on Concern */}
      <Container maxWidth="xl" sx={{ pb: 12 }}>
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            bgcolor: '#228756',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <AutoAwesomeIcon sx={{ fontSize: '18px' }} />
            Explore Plans Based on Concern
          </Box>
        </Box>

        <Grid container spacing={3}>
          {[
            { title: "Anxiety & Stress", image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=400", desc: "Manage overwhelming thoughts", color: "#228756" },
            { title: "Depression", image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=400", desc: "Find hope and emotional balance", color: "#007f99" },
            { title: "Relationships", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400", desc: "Build deeper, healthier bonds", color: "#6366f1" },
            { title: "Self Worth", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400", desc: "Unlock your true potential", color: "#f59e0b" },
            { title: "Social Anxiety", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400", desc: "Navigate social settings", color: "#ef4444" },
            { title: "Workplace Stress", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400", desc: "Balance career and wellness", color: "#64748b" },
            { title: "Trauma & PTSD", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400", desc: "Heal from past experiences", color: "#8b5cf6" },
            { title: "Sleep Disorders", image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&q=80&w=400", desc: "Restore your natural rest", color: "#3b82f6" }
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Box 
                onClick={() => handleOpenConcern(item)}
                sx={{
                  borderRadius: '24px',
                  bgcolor: '#fff',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
                    borderColor: item.color
                  },
                  '&:hover img': { transform: 'scale(1.1)' }
                }}
              >
                <Box sx={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} 
                  />
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '60%', 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' 
                  }} />
                </Box>
                
                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '18px', color: '#1a1a1a', mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, mb: 3 }}>
                    {item.desc}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                    <Typography 
                      onClick={(e) => { e.stopPropagation(); handleOpenInfo(item); }}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#64748b', 
                        fontWeight: 700, 
                        fontSize: '13px',
                        cursor: 'pointer',
                        '&:hover': { color: item.color }
                      }}
                    >
                      Read Info <i className="feather-info" style={{ marginLeft: '4px' }}></i>
                    </Typography>
                    <Typography 
                      onClick={(e) => { e.stopPropagation(); handleOpenConcern(item); }}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: item.color, 
                        fontWeight: 800, 
                        fontSize: '13px',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      View Plans <i className="feather-arrow-right" style={{ marginLeft: '4px' }}></i>
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Free Consultation CTA Section */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #334155 100%)',
          borderRadius: '32px',
          p: { xs: 4, md: 5 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
        }}>
          {/* Decorative Elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: '-60px', 
            right: '-60px', 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%', 
            background: 'rgba(34, 135, 86, 0.08)',
            filter: 'blur(40px)'
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 1.2, 
              bgcolor: 'rgba(34, 135, 86, 0.15)', 
              px: 2.5, 
              py: 0.8, 
              borderRadius: '50px',
              mb: 2.5,
              border: '1px solid rgba(34, 135, 86, 0.2)'
            }}>
              <i className="feather-phone-call" style={{ color: '#228756', fontSize: '12px' }}></i>
              <Typography sx={{ color: '#228756', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Need Guidance?
              </Typography>
            </Box>

            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontWeight: 900, 
              fontSize: { xs: '28px', md: '36px' },
              mb: 1.5,
              letterSpacing: '-0.5px'
            }}>
              Book a <span style={{ color: '#228756' }}>Free</span> 10-Minute Discovery Call
            </Typography>

            <Typography sx={{ 
              color: '#94a3b8', 
              fontSize: '16px', 
              maxWidth: '600px', 
              margin: '0 auto 30px',
              lineHeight: 1.6
            }}>
              Speak with our specialist to find the perfect plan for your specific needs.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                variant="contained"
                sx={{
                  bgcolor: '#228756',
                  color: 'white',
                  px: 5,
                  py: 1.8,
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: 800,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1a6b44' }
                }}
              >
                Schedule Free Call
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setOpenChat(true)}
                sx={{
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  px: 5,
                  py: 1.8,
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: 800,
                  textTransform: 'none',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                Chat with Us
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>

      <Dialog 
        open={openPlanDetail} 
        onClose={() => setOpenPlanDetail(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock
        sx={{ 
          zIndex: 9999,
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
        PaperProps={{
          sx: { 
            borderRadius: '24px', 
            overflow: 'hidden',
            margin: '20px' // Ensure space from edges on mobile
          }
        }}
      >
        {selectedPlan && (
          <Box sx={{ position: 'relative', p: 4, pt: 6 }}>
            <IconButton
              onClick={() => setOpenPlanDetail(false)}
              sx={{ 
                position: 'absolute', 
                right: 12, 
                top: 12, 
                color: '#64748b',
                zIndex: 10,
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              <CloseIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '20px', color: '#1a1a1a', mb: 3, textAlign: 'center' }}>
                What's included in this plan:
              </Typography>
              <Stack spacing={2}>
                {selectedPlan.features.map((feature, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(34, 135, 86, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: '2px'
                    }}>
                      <i className="feather-check" style={{ color: '#228756', fontSize: '12px', fontWeight: 900 }}></i>
                    </Box>
                    <Typography sx={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Button 
              variant="contained" 
              fullWidth
              onClick={() => {
                setOpenPlanDetail(false);
                handleChoosePlan(selectedPlan);
              }}
              sx={{
                py: 2,
                borderRadius: '16px',
                backgroundColor: '#228756',
                fontSize: '16px',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 10px 20px rgba(34, 135, 86, 0.2)',
                '&:hover': { 
                  backgroundColor: '#1a6b44',
                  boxShadow: '0 12px 25px rgba(34, 135, 86, 0.3)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Confirm & Choose Plan
            </Button>
            
            <Typography sx={{ mt: 3, fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              Secure & Confidential Payment via UPI
            </Typography>
          </Box>
        )}
      </Dialog>

      {/* Quick Message Chat Modal */}
      <Dialog 
        open={openChat} 
        onClose={() => setOpenChat(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock
        sx={{ 
          zIndex: 9999,
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
        PaperProps={{
          sx: { borderRadius: '24px', overflow: 'hidden' }
        }}
      >
        <Box sx={{ position: 'relative', p: 4 }}>
          <IconButton
            onClick={() => setOpenChat(false)}
            sx={{ 
              position: 'absolute', 
              right: 12, 
              top: 12, 
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <CloseIcon sx={{ fontSize: '20px' }} />
          </IconButton>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              width: '60px', 
              height: '60px', 
              bgcolor: 'rgba(34, 135, 86, 0.1)', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <i className="feather-message-square" style={{ color: '#228756', fontSize: '24px' }}></i>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1a1a1a', mb: 1 }}>
              Chat with Us
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
              Choose your preferred way to connect <br/>and we'll help you immediately.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {/* WhatsApp Option */}
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => window.open('https://wa.me/919999999999', '_blank')}
              sx={{
                py: 2,
                borderRadius: '16px',
                backgroundColor: '#25D366', // WhatsApp Green
                fontSize: '16px',
                fontWeight: 800,
                textTransform: 'none',
                gap: 1.5,
                boxShadow: '0 8px 20px rgba(37, 211, 102, 0.2)',
                '&:hover': { 
                  backgroundColor: '#128C7E',
                  boxShadow: '0 10px 25px rgba(37, 211, 102, 0.3)'
                }
              }}
            >
              <i className="feather-phone" style={{ fontSize: '18px' }}></i>
              Chat on WhatsApp
            </Button>

            <Box sx={{ position: 'relative', textAlign: 'center', my: 1 }}>
              <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: '#e2e8f0', zIndex: 0 }} />
              <Typography sx={{ position: 'relative', display: 'inline-block', px: 2, bgcolor: 'white', color: '#94a3b8', fontSize: '12px', fontWeight: 700, zIndex: 1 }}>
                OR DROP A MESSAGE
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', mb: 1, ml: 0.5 }}>
                Your Name
              </Typography>
              <input 
                type="text" 
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  '&:focus': { borderColor: '#228756' }
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', mb: 1, ml: 0.5 }}>
                Your Message
              </Typography>
              <textarea 
                placeholder="How can we help you?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 0.2s ease',
                  '&:focus': { borderColor: '#228756' }
                }}
              />
            </Box>

            <Button 
              variant="contained" 
              fullWidth
              sx={{
                py: 2,
                borderRadius: '16px',
                backgroundColor: '#228756',
                fontSize: '16px',
                fontWeight: 800,
                textTransform: 'none',
                mt: 1,
                boxShadow: '0 10px 20px rgba(34, 135, 86, 0.2)',
                '&:hover': { backgroundColor: '#1a6b44' }
              }}
            >
              Send Message
            </Button>
          </Stack>

          <Typography sx={{ mt: 3, fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
            We usually respond within 24 hours.
          </Typography>
        </Box>
      </Dialog>

      <Dialog 
        open={openQr} 
        onClose={() => setOpenQr(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock // Allow background scrolling
        sx={{
          zIndex: 9999,
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
        PaperProps={{
          sx: { 
            borderRadius: '24px', 
            p: 1, 
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={() => setOpenQr(false)}
          sx={{ 
            position: 'absolute', 
            right: 16, 
            top: 16, 
            color: '#1a1a1a',
            zIndex: 10,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ textAlign: 'center', p: 3, pt: 5, overflow: 'hidden' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '22px', mb: 1, color: '#1a1a1a' }}>
            Scan to Pay
          </Typography>
          
          <Typography sx={{ color: '#64748b', mb: 3, fontSize: '14px', px: 2 }}>
            Use any UPI app to subscribe to <br/><strong>{selectedPlan?.title}</strong>
          </Typography>
          
          <Box sx={{ 
            bgcolor: '#f8fafc', 
            p: 2, 
            borderRadius: '20px', 
            display: 'inline-flex',
            border: '2px dashed #e2e8f0',
            mb: 3
          }}>
            {selectedPlan && (
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedPlan.upiLink)}`}
                alt="UPI QR Code"
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            )}
          </Box>

          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(34, 135, 86, 0.05)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mx: 'auto'
          }}>
            <QrCodeScannerIcon sx={{ color: '#228756' }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontSize: '13px', color: '#228756', fontWeight: 800 }}>
                Amount: ₹{selectedPlan?.price}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#228756', opacity: 0.8 }}>
                VPA: chooseyourtherapist@okhdfcbank
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Concern Detail Modal */}
      <Dialog 
        open={openConcernModal} 
        onClose={() => setOpenConcernModal(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock
        sx={{ zIndex: 9998 }}
        PaperProps={{
          sx: { borderRadius: '24px', overflow: 'hidden' }
        }}
      >
        {selectedConcern && (
          <Box sx={{ position: 'relative', p: 3 }}>
            <IconButton
              onClick={() => setOpenConcernModal(false)}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8, 
                color: '#64748b'
              }}
            >
              <CloseIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#1a1a1a', fontWeight: 900, fontSize: '22px' }}>
                {selectedConcern.title}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '13px', mt: 0.5 }}>
                Choose a specialized package
              </Typography>
            </Box>

            <Stack spacing={2}>
              {selectedConcern.packages.map((pkg, pIdx) => (
                <Box 
                  key={pIdx}
                  onClick={() => {
                    setOpenConcernModal(false);
                    handleChoosePlan(pkg);
                  }}
                  sx={{ 
                    p: 2.5, 
                    bgcolor: '#f8fafc', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { 
                      borderColor: selectedConcern.color, 
                      bgcolor: `${selectedConcern.color}05`,
                      transform: 'scale(1.02)' 
                    }
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '15px', color: '#1a1a1a' }}>
                      {pkg.sessions} Sessions
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                      {pkg.title}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ color: selectedConcern.color, fontWeight: 900, fontSize: '20px' }}>
                      ₹{pkg.price}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: selectedConcern.color, fontWeight: 800 }}>
                      Choose Plan →
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Typography sx={{ mt: 3, fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              Secure & Confidential Payment
            </Typography>
          </Box>
        )}
      </Dialog>

      {/* Info Detail Modal */}
      <Dialog 
        open={openInfoModal} 
        onClose={() => setOpenInfoModal(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        sx={{ zIndex: 9998 }}
        PaperProps={{
          sx: { borderRadius: '24px', overflow: 'hidden' }
        }}
      >
        {selectedConcern && (
          <Box sx={{ position: 'relative', p: 4 }}>
            <IconButton
              onClick={() => setOpenInfoModal(false)}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8, 
                color: '#64748b'
              }}
            >
              <CloseIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: `${selectedConcern.color}10`, color: selectedConcern.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="feather-info" style={{ fontSize: '20px' }}></i>
                </Box>
                About {selectedConcern.title}
              </Typography>
              
              <Typography sx={{ color: '#475569', lineHeight: 1.8, fontSize: '16px', mb: 4 }}>
                {selectedConcern.fullInfo}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#1a1a1a' }}>Key Benefits of Therapy</Typography>
              <Grid container spacing={2}>
                {selectedConcern.benefits.map((benefit, bIdx) => (
                  <Grid item xs={12} sm={6} key={bIdx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: `${selectedConcern.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="feather-check" style={{ color: selectedConcern.color, fontSize: '12px' }}></i>
                      </Box>
                      <Typography sx={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>{benefit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => {
                setOpenInfoModal(false);
                setOpenConcernModal(true);
              }}
              sx={{ 
                py: 2, 
                borderRadius: '16px', 
                bgcolor: selectedConcern.color,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': { bgcolor: selectedConcern.color, opacity: 0.9 }
              }}
            >
              View Specialized Packages
            </Button>
          </Box>
        )}
      </Dialog>
    </div>
  );
}
