import React, { useEffect, useState } from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TypeAnimation } from "react-type-animation";

export default function SelfAssessmentBanner() {
  const [isMobile, setIsMobile] = useState(false);
  const mediaQuery = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    setIsMobile(mediaQuery);
  }, [mediaQuery]);

  return (
    <div suppressHydrationWarning>
      <section className="assessment-banner" suppressHydrationWarning>
        <AssignmentIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <CheckCircleIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="assessment-badge">
              <AssignmentIcon sx={{ fontSize: 18 }} />
              <span>Know Yourself Better</span>
            </div>
            
            <h1 className="assessment-title">
              Mental Health <br />
              <span className="assessment-animated-text">
                <TypeAnimation
                  sequence={[
                    "Self Assessment",
                    2000,
                    "Understanding You",
                    2000,
                    "Your Journey",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            
            <p className="assessment-subtitle">
              Take our comprehensive self-assessment test to understand your mental health better. 
              Get personalized insights and recommendations from our expert psychologists based 
              on your responses. Your journey to better mental health starts here.
            </p>
          </Box>
        </Container>
      </section>
    </div>
  );
}
