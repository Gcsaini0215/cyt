import React, { useState } from "react";
import { Box, Button, useMediaQuery, Typography, Dialog, DialogContent, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import coupleplan from "../../assets/img/coupleplan.jpg";
import coupletherapyplan from "../../assets/img/coupletherapyplan.jpg";
import coupleplantherapy from "../../assets/img/coupleplantherapy.jpg";
import therapyindividualcare from "../../assets/img/therapyindividualcare.jpg";
import therapycare from "../../assets/img/therapycare.jpg";
import indicare from "../../assets/img/indicare.jpg";
import individualcare from "../../assets/img/individualcare.jpg";
import theapyplancare from "../../assets/img/theapyplancare.jpg";

export default function PlansCards({ planType, setPlanType }) {
  const isMobile = useMediaQuery("(max-width:768px)");

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
    },
    {
      title: "Complete Transformation",
      sessions: "18 Sessions",
      price: "15,500",
      image: individualcare.src || individualcare,
      description: "Our most in-depth program for lasting change across every area of your mental well-being.",
      features: ["18 one-on-one sessions", "Choice to change therapist", "Comprehensive long-term care plan", "Holistic CBT, mindfulness & lifestyle approach", "Activities worksheet", "Free Follow-up through chat", "Priority scheduling support", "Dedicated progress reviews"],
      color: "color-primary",
      btnClass: "bg-primary-opacity"
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
    },
    {
      title: "Lifelong Partnership",
      sessions: "14 Sessions",
      price: "15,499",
      image: theapyplancare.src || theapyplancare,
      description: "An extensive journey for couples committed to deep, lasting transformation together.",
      features: ["Extensive joint sessions", "Deep trust rebuilding", "Long-term relationship coaching", "Homework assignments", "Priority scheduling support"],
      color: "color-primary",
      btnClass: "bg-primary-opacity"
    }
  ];

  const currentPlans = planType === "individual" ? individualPlans : couplePlans;

  const [openQr, setOpenQr] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openPlanDetail, setOpenPlanDetail] = useState(false);

  const handleOpenPlanDetail = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanDetail(true);
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
      <div className="rbt-pricing-area bg-color-white" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
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
          <div className="row g-3">
            {currentPlans.map((plan, index) => (
              <div key={index} className="col-xl-3 col-lg-3 col-md-3 col-6">
                <Box
                  onClick={() => handleOpenPlanDetail(plan)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    border: plan.popular ? '2px solid #228756' : '1px solid #eef1f4',
                    boxShadow: plan.popular
                      ? '0 8px 20px rgba(34, 135, 86, 0.12)'
                      : '0 2px 10px rgba(15, 23, 42, 0.05)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 16px 30px rgba(15, 23, 42, 0.1)',
                    },
                    '&:hover .plan-tile-img': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  {plan.popular && (
                    <Box sx={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 10,
                      backgroundColor: '#228756',
                      color: 'white',
                      px: 1,
                      py: 0.3,
                      borderRadius: '20px',
                      fontSize: '9px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 10px rgba(34, 135, 86, 0.3)'
                    }}>
                      ★ Popular
                    </Box>
                  )}

                  {/* Square Image */}
                  <Box sx={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}>
                    <Box
                      className="plan-tile-img"
                      component="img"
                      src={plan.image}
                      alt={plan.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      left: 0, right: 0, bottom: 0,
                      height: '45%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)'
                    }} />
                    <Typography sx={{
                      position: 'absolute',
                      left: 8,
                      bottom: 6,
                      color: 'white',
                      fontSize: { xs: '9px', sm: '10px' },
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 4px rgba(0,0,0,0.4)'
                    }}>
                      {plan.sessions}
                    </Typography>
                  </Box>

                  <Box sx={{ p: { xs: 1.2, sm: 1.5 }, textAlign: 'center' }}>
                    <Typography sx={{
                      fontWeight: 800,
                      color: '#1a1a1a',
                      fontSize: { xs: '12px', sm: '14px' },
                      lineHeight: 1.25,
                      mb: 0.5,
                      minHeight: { sm: '36px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {plan.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: { xs: '15px', sm: '18px' }, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>
                        ₹{plan.price}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: '#94a3b8', fontWeight: 600 }}>
                        /package
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </div>
            ))}
          </div>
        </div>
      </div>

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

    </div>
  );
}
