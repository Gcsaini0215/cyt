import React, { useState } from "react";
import { Box, Button, ButtonGroup, useMediaQuery, Typography, Dialog, DialogContent, DialogTitle, IconButton, Container } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LazyImage from "../../utils/lazy-image";
import Img from "../../assets/img/Individual.png";
import Img2 from "../../assets/img/couple.png";
import Img3 from "../../assets/img/teen.png";
import bgImg1 from "../../assets/img/individualbg.png";
import bgImg2 from "../../assets/img/couplebg.png";
import bgImg3 from "../../assets/img/teenbg.png";

export default function PlansCards() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [planType, setPlanType] = useState("individual");
  const defaultImage = "https://i.postimg.cc/FRMzw223/d405ea7b821eb5830b509ece3d126681.jpg";
  const essentialImage = "https://i.postimg.cc/cJV8Ng3Y/f342213ac4783b30476d36ce300c2641.jpg";

  const individualPlans = [
    {
      title: "Essential Care",
      sessions: "4 Session",
      price: "3,800",
      image: "https://i.postimg.cc/yNDCZnNp/a02f8d9b924efdf86d987e46612918d0.jpg",
      features: ["4 One-on-one session", "Choice to change therapist", "Goal setting", "Practical coping tools", "Activities worksheet"],
      color: "color-primary",
      btnClass: "bg-primary-opacity"
    },
    {
      title: "Mindset Growth",
      sessions: " 8 Sessions",
      price: "6,800",
      image: "https://i.postimg.cc/jjctHC6k/f192d772f46c1292adba703fbbf8e235.jpg",
      popular: true,
      features: ["8 one-on-one therapy sessions", "Choice to change therapist", "In-depth concern identification", "Emotional regulation practices", "Activities worksheet", "CBT based Approach", "Free Follow-up through chat", "Priority scheduling support"],
      color: "color-secondary",
      btnClass: "bg-secondary-opacity"
    },
    {
      title: "Holistic Wellness",
      sessions: "12 Sessions",
      price: "9,600",
      image: "https://i.postimg.cc/W1C2ptmw/e920841b0cd1bab7ad5ceee7ca4cf843.jpg",
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
      image: essentialImage,
      features: ["Joint consultation", "Relationship assessment", "Communication tools", "Safe dialogue space"],
      color: "color-primary",
      btnClass: "bg-primary-opacity"
    },
    {
      title: "Partnership Growth",
      sessions: "4 Sessions",
      price: "5,499",
      image: defaultImage,
      popular: true,
      features: ["Conflict resolution", "Intimacy building", "Emotional bonding", "Homework assignments"],
      color: "color-secondary",
      btnClass: "bg-secondary-opacity"
    },
    {
      title: "Eternal Connection",
      sessions: "8 Sessions",
      price: "9,999",
      image: defaultImage,
      features: ["Comprehensive support", "Trust rebuilding", "Life transition coaching", "Relationship health"],
      color: "color-pink",
      btnClass: "bg-pink-opacity"
    }
  ];

  const currentPlans = individualPlans;

  const [openQr, setOpenQr] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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
      <div className="rbt-pricing-area bg-color-white" style={{ paddingTop: "20px", paddingBottom: "80px" }}>
        <div className="container">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-start' }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 4 }}>
                      <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', mr: 0.5 }}>₹</Typography>
                      <Typography sx={{ fontSize: '42px', fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{plan.price}</Typography>
                      <Typography sx={{ color: '#64748b', ml: 1, fontSize: '15px' }}>/ package</Typography>
                    </Box>

                    {/* Features */}
                    <Box sx={{ mb: 4, flex: 1 }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {plan.features.map((feature, fIndex) => {
                          const isExcluded = plan.title === "Essential Care" && (feature === "Free Follow-up" || feature === "Scheduling Priority");
                          return (
                            <li key={fIndex} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px', 
                              marginBottom: '14px',
                              color: isExcluded ? '#94a3b8' : '#475569',
                              fontSize: '15px',
                              fontWeight: 500
                            }}>
                              <Box sx={{ 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%', 
                                backgroundColor: isExcluded ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 135, 86, 0.1)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <i className={isExcluded ? "feather-x" : "feather-check"} style={{ color: isExcluded ? '#ef4444' : '#228756', fontSize: '12px' }}></i>
                              </Box>
                              <span style={{ 
                                textDecoration: isExcluded ? 'line-through' : 'none',
                                textDecorationColor: isExcluded ? 'red' : 'transparent',
                                textDecorationThickness: '2px'
                              }}>
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </Box>

                    {/* Action Button */}
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleChoosePlan(plan)}
                      sx={{
                        py: 2,
                        borderRadius: '14px',
                        backgroundColor: plan.popular ? '#228756' : '#1a1a1a',
                        fontSize: '16px',
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: plan.popular ? '#1a6b44' : '#334155',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      Choose Plan
                    </Button>
                  </Box>
                </Box>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refined Soothing Reminder Section */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Box sx={{
          background: 'linear-gradient(to bottom, #ffffff, #f7fafc)',
          borderRadius: '40px',
          p: { xs: 5, md: 8 },
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography sx={{ 
              fontWeight: 800, 
              fontSize: '13px', 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              color: '#228756',
              mb: 2
            }}>
              A Note on Your Progress
            </Typography>

            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              mb: 4, 
              color: '#1e293b',
              fontSize: { xs: '28px', md: '40px' },
              letterSpacing: '-0.5px'
            }}>
              Transformation Takes <span style={{ color: '#228756' }}>Time</span>
            </Typography>

            <Typography sx={{ 
              color: '#64748b', 
              fontSize: '19px', 
              lineHeight: 1.8, 
              maxWidth: '800px', 
              margin: '0 auto',
              fontWeight: 400
            }}>
              Therapy is a gentle, layered process that addresses the <span style={{ color: '#228756', fontWeight: 700 }}>roots</span> of your experiences. 
              Real change happens through <span style={{ color: '#228756', fontWeight: 700 }}>consistency</span> and <span style={{ color: '#228756', fontWeight: 700 }}>patience</span>. 
              Our therapy packages act as a reliable <span style={{ color: '#228756', fontWeight: 700 }}>support system</span>, 
              providing the steady foundation you need for long-term emotional well-being.
            </Typography>

            <Box sx={{ 
              mt: 6, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: { xs: 3, md: 6 }, 
              flexWrap: 'wrap',
              opacity: 0.8
            }}>
              {[
                { icon: "feather-heart", text: "Rooted Healing" },
                { icon: "feather-repeat", text: "Consistent Care" },
                { icon: "feather-anchor", text: "Stable Support" }
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(34, 135, 86, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className={item.icon} style={{ color: '#228756', fontSize: '14px' }}></i>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '15px' }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

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
