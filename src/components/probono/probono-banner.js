import React from "react";
import { Box, Container } from "@mui/material";

export default function ProbonoBanner() {
  return (
    <section className="probono-banner">
      <Container maxWidth="lg">
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <h1 className="probono-title">Meet Our Probono Psychologists</h1>

          <p className="probono-subtitle">
            Verified psychologists volunteering their time to make free and low-cost therapy accessible to everyone.
          </p>
        </Box>
      </Container>

      <style jsx>{`
        .probono-banner {
          position: relative;
          background-image: url("https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg");
          background-size: cover;
          background-position: center;
          background-attachment: scroll;
          padding: 46px 0 46px 0;
          overflow: hidden;
          margin-top: 0px;
        }

        .probono-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1;
        }

        .probono-title {
          font-size: 34px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.3;
          margin-bottom: 10px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .probono-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .probono-banner {
            padding: 26px 0 24px 0;
          }
          .probono-title {
            font-size: 17px;
            line-height: 1.4;
            margin-bottom: 6px;
          }
          .probono-subtitle {
            font-size: 12px;
            padding: 0 12px;
          }
        }
      `}</style>
    </section>
  );
}
