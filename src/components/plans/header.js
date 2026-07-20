import React from "react";
import { Box, Container, useMediaQuery } from "@mui/material";

const styles = `
.plans-banner {
  position: relative;
  background: linear-gradient(120deg, #145c38 0%, #1a6b44 45%, #228756 100%);
  padding: 64px 0;
  overflow: hidden;
  margin-top: 0px;
}

.plans-title {
  font-size: 30px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.3;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.plans-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 1024px) and (min-width: 769px) {
  .plans-banner {
    padding: 48px 0;
  }
  .plans-title { font-size: 26px; }
}

@media (max-width: 768px) {
  .plans-banner {
    padding: 36px 0;
  }
  .plans-title { font-size: 20px; margin-bottom: 6px; }
  .plans-subtitle { font-size: 13px; }
}
`;

export default function PlansHeader({ planType, setPlanType }) {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="plans-banner">
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
            <h1 className="plans-title">Therapy Plans &amp; Pricing</h1>
            <p className="plans-subtitle">
              Simple, affordable packages designed to support your healing journey.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}
