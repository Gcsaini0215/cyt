import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  CloudRain, 
  Heart, 
  Zap, 
  Users, 
  Briefcase, 
  Stethoscope, 
  Activity,
  X,
  ArrowRight
} from 'lucide-react';
import Link from "next/link";
import { Dialog, Zoom, Box, Typography, Button, IconButton } from '@mui/material';

const specializations = [
  { 
    id: 1, 
    title: "Anxiety", 
    icon: <Brain size={32} />, 
    color: "#E3F2FD", 
    iconColor: "#1976D2", 
    link: "/view-all-therapist?specialization=Anxiety",
    shortDescription: "Manage stress, worry, and panic attacks with expert help.",
    description: "Get professional help for anxiety in India. Our expert psychologists specialize in treating generalized anxiety disorder (GAD), social anxiety, and panic attacks. Discover evidence-based therapy and proven coping strategies to manage stress, reduce persistent worry, and regain emotional control with the best anxiety therapists near you."
  },
  { 
    id: 2, 
    title: "Depression", 
    icon: <CloudRain size={32} />, 
    color: "#F3E5F5", 
    iconColor: "#7B1FA2", 
    link: "/view-all-therapist?specialization=Depression",
    shortDescription: "Overcome low mood and find hope with professional support.",
    description: "Connect with top depression counselors and clinical psychologists. We offer specialized treatment for clinical depression, persistent low mood, and emotional exhaustion. Access confidential online therapy sessions designed to help you overcome sadness, build resilience, and find renewed hope with expert mental health support in India."
  },
  { 
    id: 3, 
    title: "Relationships", 
    icon: <Heart size={32} />, 
    color: "#FFEBEE", 
    iconColor: "#D32F2F", 
    link: "/view-all-therapist?specialization=Relationship",
    shortDescription: "Build healthier connections and resolve conflicts.",
    description: "Improve your bond with expert relationship counseling and couples therapy. Our specialized therapists help resolve communication gaps, trust issues, and marital conflicts. Whether seeking pre-marital counseling or individual relationship support, find the best relationship experts in India to build healthier, lasting connections."
  },
  { 
    id: 4, 
    title: "Stress", 
    icon: <Activity size={32} />, 
    color: "#E8F5E9", 
    iconColor: "#388E3C", 
    link: "/view-all-therapist?specialization=Stress",
    shortDescription: "Tackle burnout and find balance in daily life.",
    description: "Professional stress management therapy to tackle workplace burnout and daily life pressures. Our mindfulness-based cognitive therapy helps you manage chronic stress, improve work-life balance, and enhance mental well-being. Book sessions with certified stress management experts for a calmer, more balanced lifestyle."
  },
  { 
    id: 5, 
    title: "OCD", 
    icon: <Zap size={32} />, 
    color: "#FFF3E0", 
    iconColor: "#F57C00", 
    link: "/view-all-therapist?specialization=OCD",
    shortDescription: "Break the cycle of obsessive thoughts and compulsions.",
    description: "Specialized OCD therapy using Exposure and Response Prevention (ERP) and CBT. Find experienced psychologists in India for managing obsessive thoughts and compulsions. Our evidence-based approach helps individuals break the cycle of OCD and lead a more fulfilling, unrestrained life with professional psychiatric support."
  },
  { 
    id: 6, 
    title: "Trauma", 
    icon: <Stethoscope size={32} />, 
    color: "#E0F2F1", 
    iconColor: "#00796B", 
    link: "/view-all-therapist?specialization=Trauma",
    shortDescription: "Heal from PTSD, emotional abuse, and past trauma.",
    description: "Heal with trauma-informed therapy and PTSD counseling. Our specialists provide a safe space to process past trauma, emotional abuse, and childhood experiences. Using advanced therapeutic techniques like EMDR and somatic experiencing, we help you overcome emotional scars and build a path toward long-term recovery and mental peace."
  },
  { 
    id: 7, 
    title: "Parenting", 
    icon: <Users size={32} />, 
    color: "#EFEBE9", 
    iconColor: "#5D4037", 
    link: "/view-all-therapist?specialization=Parenting",
    shortDescription: "Expert guidance on child behavior and family dynamics.",
    description: "Expert parenting consultation and child psychology support. Navigate the challenges of modern parenting with guidance on child behavior, adolescent mental health, and family dynamics. Connect with top parenting experts in India to foster a nurturing environment and improve your parent-child relationship with practical, expert advice."
  },
  { 
    id: 8, 
    title: "Career", 
    icon: <Briefcase size={32} />, 
    color: "#ECEFF1", 
    iconColor: "#455A64", 
    link: "/view-all-therapist?specialization=Career",
    shortDescription: "Support for career transitions and workplace mental health.",
    description: "Professional career counseling and workplace mental health support. Address career transitions, professional burnout, and workplace anxiety with certified career coaches and psychologists. Gain clarity in your professional life, improve productivity, and achieve long-term career satisfaction with expert guidance tailored to your goals."
  },
];

const Specializations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);

  const handleOpenModal = (spec) => {
    setSelectedSpec(spec);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="specializations-area pt--60 pb--60 bg-color-white">
      <div className="container">
        <div className="row mb--40">
          <div className="col-lg-12">
            <div className="section-title text-center">
              <h2 className="title" style={{ 
                fontSize: isMobile ? "2rem" : "3.5rem", 
                fontWeight: "800", 
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? "10px" : "20px",
                whiteSpace: isMobile ? "nowrap" : "normal"
              }}>
                <span style={{ height: "3px", width: isMobile ? "30px" : "60px", backgroundColor: "#228756", borderRadius: "10px", display: "inline-block" }}></span>
                Explore Specializations
                <span style={{ height: "3px", width: isMobile ? "30px" : "60px", backgroundColor: "#228756", borderRadius: "10px", display: "inline-block" }}></span>
              </h2>
              <p className="description mt--10" style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", color: "#666", padding: isMobile ? "0 10px" : "0" }}>
                Find the right support for your specific needs
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {specializations.map((item) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-6" key={item.id}>
              <div onClick={() => handleOpenModal(item)} className="spec-card" style={{ cursor: 'pointer' }}>
                <div className="spec-inner" style={{ backgroundColor: item.color }}>
                  <div className="spec-icon" style={{ color: item.iconColor }}>
                    {item.icon}
                  </div>
                  <h3 className="spec-title">{item.title}</h3>
                  <p className="spec-short-desc">{item.shortDescription}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        TransitionComponent={Zoom}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "28px",
            padding: "0px",
            overflow: "hidden"
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Header Color Strip */}
          <Box sx={{ height: '80px', backgroundColor: selectedSpec?.color }} />
          
          {/* Close Button */}
          <IconButton 
            onClick={handleCloseModal}
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <X size={20} />
          </IconButton>

          {/* Icon Badge */}
          <Box sx={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '40px',
            left: '30px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            color: selectedSpec?.iconColor
          }}>
            {selectedSpec?.icon}
          </Box>

          <Box sx={{ p: '80px 30px 40px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
              {selectedSpec?.title}
            </Typography>
            
            <Typography sx={{ color: '#64748b', lineHeight: 1.7, fontSize: '15px', mb: 4 }}>
              {selectedSpec?.description}
            </Typography>

            <Button 
              component={Link}
              href={selectedSpec?.link || "#"}
              variant="contained"
              fullWidth
              endIcon={<ArrowRight size={20} />}
              sx={{
                bgcolor: '#228756',
                color: 'white',
                borderRadius: '16px',
                py: 2,
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 10px 20px rgba(34, 135, 86, 0.2)',
                '&:hover': {
                  bgcolor: '#1a6b44',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s'
              }}
            >
              View Specialized Therapists
            </Button>
          </Box>
        </Box>
      </Dialog>

      <style>{`
        .spec-card {
          display: block;
          text-decoration: none;
          transition: transform 0.3s ease;
        }
        .spec-card:hover {
          transform: translateY(-10px);
        }
        .spec-inner {
          padding: 30px 20px;
          border-radius: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          transition: box-shadow 0.3s ease;
        }
        .spec-card:hover .spec-inner {
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .spec-icon {
          background: #ffffff;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .spec-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }
        .spec-short-desc {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-align: center;
        }
        @media (max-width: 768px) {
          .spec-inner {
            padding: 20px 10px;
          }
          .spec-icon {
            width: 50px;
            height: 50px;
          }
          .spec-title {
            font-size: 1.1rem;
          }
          .spec-short-desc {
            font-size: 0.75rem;
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
    </section>
  );
};

export default Specializations;
