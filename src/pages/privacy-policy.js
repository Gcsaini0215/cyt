import React from "react";
import Head from "next/head";
import { Box, Typography, Container } from "@mui/material";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Pro Bono Support | Choose Your Therapist</title>
        <meta name="description" content="Privacy policy for our Pro Bono Support Program - how we protect your personal information and maintain confidentiality." />
      </Head>
      <MyNavbar />

      <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9" }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, color: "#1e293b", mb: 2 }}>
              Privacy Policy
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              Pro Bono Support Program
            </Typography>
          </Box>

          <Box sx={{ background: "white", p: { xs: 3, md: 4 }, borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Section 1 - Confidentiality */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                1. Confidentiality
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                Your privacy is important to us. Information shared during your session will be treated confidentially and used only for the purposes of providing support, supervision, and maintaining service quality.
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                However, confidentiality may be limited if:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>There is concern about immediate risk of harm to yourself.</li>
                <li>There is concern about immediate risk of harm to another person.</li>
                <li>Abuse or neglect of a child, older adult, or vulnerable person must legally be reported.</li>
                <li>Disclosure is required by applicable law or a court order.</li>
                <li>Information is shared with the supervising licensed professional as part of clinical supervision.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                Only individuals directly involved in your care and supervision will have access to relevant information.
              </Typography>
            </Box>

            {/* Section 2 - Emergency Situations */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                2. Emergency Situations
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                This service is not intended for emergencies.
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                Please do not use this service if you are experiencing:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Thoughts of suicide with immediate intent.</li>
                <li>Thoughts of seriously harming another person.</li>
                <li>A mental health crisis requiring urgent intervention.</li>
                <li>A medical emergency.</li>
                <li>Severe psychological distress requiring immediate care.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                If you are in immediate danger or believe someone else is, please contact your local emergency services or go to the nearest emergency department immediately.
              </Typography>
            </Box>

            {/* Section 3 - Voluntary Participation */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                3. Voluntary Participation
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                Participation in this program is completely voluntary.
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", mb: 1 }}>
                You may:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Decline to answer any question.</li>
                <li>End the session at any time.</li>
                <li>Request information about professional services.</li>
                <li>Decide whether or not to continue using the program.</li>
              </Box>
            </Box>

            {/* Section 4 - Referral to Professional Services */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                4. Referral to Professional Services
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                If the psychology intern or supervising professional believes you would benefit from additional care, they may recommend that you:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8, mb: 2 }}>
                <li>Schedule therapy with a licensed psychologist.</li>
                <li>Consult a psychiatrist.</li>
                <li>Seek medical evaluation.</li>
                <li>Access specialized mental health services.</li>
                <li>Contact emergency services when appropriate.</li>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                Recommendations are made to support your wellbeing and ensure you receive the most appropriate level of care.
              </Typography>
            </Box>

            {/* Section 5 - Informed Consent */}
            <Box sx={{ pb: 3 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mb: 2 }}>
                5. Informed Consent
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 2 }}>
                By consenting to participate in our Pro Bono Support Program, you confirm that:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14, lineHeight: 1.8 }}>
                <li>You have read and understood all of the information provided.</li>
                <li>You understand that your session will be conducted by a psychology intern under the supervision of a licensed mental health professional.</li>
                <li>You understand that this service provides emotional support and guidance but is not professional therapy or psychological treatment.</li>
                <li>You understand the limits of confidentiality.</li>
                <li>You understand that this service is not appropriate for emergencies.</li>
                <li>You agree to participate voluntarily.</li>
                <li>You consent to the use of your information for supervision and quality assurance purposes in accordance with applicable privacy policies.</li>
                <li>You understand that you may be referred to a licensed professional if your needs are beyond the scope of this service.</li>
              </Box>
            </Box>
          </Box>
        </Container>
      </div>

      <NewsLetter />
      <Footer />
    </>
  );
}
