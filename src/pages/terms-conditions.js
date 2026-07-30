import React from "react";
import Head from "next/head";
import { Box, Typography, Container } from "@mui/material";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";

export default function TermsCondition() {
  return (
    <>
      <Head>
        <title>Terms and Conditions | Pro Bono Support | Choose Your Therapist</title>
        <meta name="description" content="Terms and conditions for our Pro Bono Support Program - free emotional support conducted by trained psychology interns under professional supervision." />
      </Head>
      <MyNavbar />

      <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9" }}>
        <Container maxWidth={false}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, color: "#1e293b", mb: 2 }}>
              Terms and Conditions
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              Pro Bono Support Program
            </Typography>
          </Box>

          <Box sx={{ background: "white", p: { xs: 3, md: 4 }, borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Section 1 */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                1. Nature of the Service
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                This is a free emotional support and guidance session conducted by a psychology intern under professional supervision.
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                The purpose of this session is to:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8 }}>
                <li>Listen to your concerns without judgment.</li>
                <li>Provide a safe and supportive space for you to express yourself.</li>
                <li>Help you better understand your current emotional challenges.</li>
                <li>Offer general coping strategies and emotional support where appropriate.</li>
                <li>Help determine whether additional support from a licensed mental health professional may be beneficial.</li>
                <li>Guide you toward appropriate professional services if your needs extend beyond the scope of this program.</li>
              </Box>
            </Box>

            {/* Section 2 */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                2. What This Session Is Not
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                Please understand that this service does not replace professional mental health care.
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                This session is not:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Professional psychotherapy.</li>
                <li>Clinical psychological treatment.</li>
                <li>A psychiatric consultation.</li>
                <li>Medical advice.</li>
                <li>Psychological diagnosis.</li>
                <li>Crisis intervention.</li>
                <li>Emergency mental health care.</li>
                <li>Medication management.</li>
                <li>Legal advice.</li>
                <li>A substitute for ongoing counseling or therapy.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                If you require diagnosis, treatment, medication, or long-term therapy, you should schedule an appointment with a licensed psychologist, psychiatrist, or other qualified healthcare professional.
              </Typography>
            </Box>

            {/* Section 3 */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                3. Who Will Conduct Your Session?
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                Your session will be conducted by a psychology intern who:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Is currently enrolled in a recognized psychology training program.</li>
                <li>Is completing supervised practical experience.</li>
                <li>Has received academic education in psychology.</li>
                <li>Works under the direct supervision of a licensed mental health professional.</li>
                <li>Follows professional ethical guidelines and organizational policies.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                Although interns are trained, they are still developing their clinical skills and therefore work within defined limits under supervision.
              </Typography>
            </Box>

            {/* Section 4 */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                4. Professional Supervision
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                All psychology interns receive regular supervision from licensed professionals.
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                The supervising professional may:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Review case notes.</li>
                <li>Provide clinical guidance.</li>
                <li>Help ensure appropriate care.</li>
                <li>Support decision-making.</li>
                <li>Recommend referrals when necessary.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                Supervision helps maintain service quality and supports both participant safety and intern learning.
              </Typography>
            </Box>

            {/* Section 5 */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                5. Session Duration
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8 }}>
                <li>Each session lasts approximately 45 minutes.</li>
                <li>Sessions begin and end according to the scheduled appointment time.</li>
                <li>If additional support is needed, follow-up options or referrals may be discussed.</li>
              </Box>
            </Box>

            {/* Section 6 */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                6. Appropriate Use of This Service
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                This program is suitable for individuals seeking support with concerns such as:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Stress</li>
                <li>Anxiety</li>
                <li>Low mood</li>
                <li>Relationship difficulties</li>
                <li>Family concerns</li>
                <li>Academic pressure</li>
                <li>Workplace stress</li>
                <li>Emotional adjustment</li>
                <li>Self-esteem concerns</li>
                <li>Life transitions</li>
                <li>Grief and loss</li>
                <li>General emotional wellbeing</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                The intern may determine that your needs are beyond the scope of this service and recommend a referral to a licensed professional.
              </Typography>
            </Box>

            {/* Section 7 */}
            <Box sx={{ pb: 3 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                7. Respectful Conduct
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                To ensure a safe and respectful environment for everyone, participants are expected to:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Treat interns and staff with courtesy and respect.</li>
                <li>Avoid abusive, threatening, discriminatory, or inappropriate language or behavior.</li>
                <li>Provide truthful and accurate information to the best of their knowledge.</li>
                <li>Attend sessions at the scheduled time whenever possible.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                Sessions may be ended if inappropriate or unsafe behavior occurs.
              </Typography>
            </Box>
          </Box>
        </Container>
      </div>

      <NewsLetter />
      <Footer />
    </>
  );
}
