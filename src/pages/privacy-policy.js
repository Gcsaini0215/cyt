import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Typography, Container } from "@mui/material";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";

/* The website's privacy policy (also the one linked on the Google OAuth consent screen). Section 8 covers the
   Google user data used when a therapist connects Google Calendar; section 9 keeps the Pro Bono programme terms. */

const UPDATED = "21 October 2026";
const EMAIL = "chooseyourtherapist@gmail.com";

const H = ({ id, n, children }) => (
  <Typography id={id} component="h2" sx={{ fontSize: { xs: 17, md: 19 }, fontWeight: 800, color: "#14532d", mb: 1.5, scrollMarginTop: "90px" }}>
    {n}. {children}
  </Typography>
);
const P = ({ children, sx }) => (
  <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8, mb: 1.5, ...sx }}>{children}</Typography>
);
const UL = ({ children }) => (
  <Box component="ul" sx={{ pl: 3, color: "#475569", fontSize: 14.5, lineHeight: 1.8, mb: 1.5, "& li": { mb: 0.5 } }}>{children}</Box>
);
const Section = ({ children, last }) => (
  <Box sx={{ mb: last ? 0 : 4, pb: last ? 0 : 3, borderBottom: last ? "none" : "1px solid #e2e8f0" }}>{children}</Box>
);

const TOC = [
  ["who-we-are", "Who we are"],
  ["what-we-collect", "Information we collect"],
  ["how-we-use", "How we use your information"],
  ["sharing", "Who we share it with"],
  ["health-info", "Session and health information"],
  ["storage", "Storage, security and retention"],
  ["your-rights", "Your choices and rights"],
  ["google-data", "Google user data (therapists)"],
  ["pro-bono", "Pro Bono Support Programme"],
  ["cookies", "Cookies and analytics"],
  ["children", "Children"],
  ["changes", "Changes to this policy"],
  ["contact", "Contact us"],
];

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Choose Your Therapist</title>
        <meta name="description" content="How Choose Your Therapist collects, uses and protects your personal data — for clients, therapists, the Noida centre, Pro Bono and Google Calendar." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/privacy-policy" />
      </Head>
      <MyNavbar />

      <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9" }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, color: "#173c2a", mb: 1 }}>
              Privacy Policy
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              Choose Your Therapist LLP · Last updated {UPDATED}
            </Typography>
          </Box>

          <Box sx={{ background: "white", p: { xs: 3, md: 5 }, borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <P>
              This policy explains what personal information Choose Your Therapist (&ldquo;CYT&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use
              www.chooseyourtherapist.in, book a session online or at our CYT Noida centre, join as a therapist, or take part in our Pro Bono
              Support Programme — and how we use, share and protect it. By using our services you agree to this policy.
            </P>

            <Box component="nav" aria-label="Contents" sx={{ my: 3, p: 2.5, borderRadius: "12px", background: "#f3f8f5", border: "1px solid #dcebe2" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#14532d", mb: 1, letterSpacing: ".4px", textTransform: "uppercase" }}>Contents</Typography>
              <Box component="ol" sx={{ m: 0, pl: 2.5, columns: { xs: 1, md: 2 }, fontSize: 14, lineHeight: 1.9 }}>
                {TOC.map(([id, label]) => <li key={id}><a href={`#${id}`} style={{ color: "#166534", fontWeight: 600 }}>{label}</a></li>)}
              </Box>
            </Box>

            <Section>
              <H id="who-we-are" n={1}>Who we are</H>
              <P>
                Choose Your Therapist LLP (LLPIN AAX-8113) runs an online platform that connects people with verified psychologists and
                counsellors across India, and an in-person therapy centre at Gate No-3, D-137, Block D, Sector 51, Noida, Uttar Pradesh 201301
                (registered on the Health Facility Registry, HFR ID IN0510005384). We are responsible for the personal information described here.
              </P>
            </Section>

            <Section>
              <H id="what-we-collect" n={2}>Information we collect</H>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Clients</P>
              <UL>
                <li>Name, email address, phone number, age and, if you choose, gender.</li>
                <li>Booking details — therapist, date and time, session type and format, and anything you tell us about your concern when booking.</li>
                <li>For bookings made for someone else: their name, age and your relationship to them.</li>
                <li>Payment records (amount, status, payment reference). Card, UPI and bank details are entered with our payment partner Razorpay — we do not receive or store them.</li>
                <li>Self-assessment answers and reports, reviews you write, and messages you send us.</li>
              </UL>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Therapists</P>
              <UL>
                <li>Profile and registration details — name, contact details, qualifications, experience, registration and identity documents, photo, fees and availability.</li>
                <li>Bank account or UPI details, used only to send your payouts.</li>
                <li>If you connect Google Calendar: the details in section 8.</li>
              </UL>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Everyone</P>
              <UL>
                <li>Basic technical information — device and browser type, pages visited and approximate location — collected through cookies and analytics (section 10).</li>
              </UL>
            </Section>

            <Section>
              <H id="how-we-use" n={3}>How we use your information</H>
              <UL>
                <li>To create and manage your account and let you sign in (one-time codes are sent to your email).</li>
                <li>To book, confirm, remind you about, reschedule and run sessions — including sharing the booking with the therapist you see and creating the session link for online sessions.</li>
                <li>To process payments, issue invoices and receipts, and pay therapists their share.</li>
                <li>To verify therapists and keep the platform safe, and to handle questions, complaints and support requests.</li>
                <li>To send service messages about your bookings and account. We send offers only if you agree, and you can opt out at any time.</li>
                <li>To understand how the website is used and improve it, and to meet legal, tax and regulatory obligations.</li>
              </UL>
            </Section>

            <Section>
              <H id="sharing" n={4}>Who we share it with</H>
              <P>We do not sell your personal information. We share it only as needed to provide our services:</P>
              <UL>
                <li><b>Your therapist</b> — the booking details and what you choose to tell us about your concern, so they can prepare for and run your session.</li>
                <li><b>Service providers</b> who work on our behalf under confidentiality obligations — payment processing (Razorpay), hosting and databases, email delivery, and analytics.</li>
                <li><b>Authorities</b>, when the law requires it, or to protect someone from serious harm.</li>
              </UL>
            </Section>

            <Section>
              <H id="health-info" n={5}>Session and health information</H>
              <P>
                What you share in therapy is confidential between you and your therapist. Session notes and reports written by therapists are
                visible to that therapist (and, for sessions at the CYT Noida centre, to the centre&apos;s clinical team) and are not shared
                with anyone else without your consent, except where the law requires it or there is a serious and immediate risk to you or
                someone else.
              </P>
            </Section>

            <Section>
              <H id="storage" n={6}>Storage, security and retention</H>
              <UL>
                <li>Your information is stored on secured servers and accessed only by people who need it to do their work.</li>
                <li>Connections to our website are encrypted (HTTPS), and sensitive credentials such as access tokens are stored encrypted.</li>
                <li>We keep information for as long as your account is active and afterwards only as long as needed for the purposes above or as required by law (for example tax and accounting records).</li>
              </UL>
            </Section>

            <Section>
              <H id="your-rights" n={7}>Your choices and rights</H>
              <P>
                In line with applicable Indian law, including the Digital Personal Data Protection Act, 2023, you can ask us to access,
                correct or delete your personal information, or withdraw a consent you gave. Write to{" "}
                <a href={`mailto:${EMAIL}`} style={{ color: "#166534", fontWeight: 700 }}>{EMAIL}</a> from the email on your account and we
                will respond within a reasonable time. Some records may need to be kept where the law requires it.
              </P>
            </Section>

            <Section>
              <H id="google-data" n={8}>Google user data (therapists who connect Google Calendar)</H>
              <P>
                Therapists can choose to connect their Google account so that each online session booked with them gets a Google Meet link
                automatically. This is optional — therapists who don&apos;t connect Google can still use the platform. When a therapist connects Google:
              </P>
              <UL>
                <li><b>What we access:</b> the email address of the connected Google account (the <i>openid</i> and <i>email</i> scopes) and permission to create, update and delete events on that therapist&apos;s Google Calendar (the <i>calendar.events</i> scope).</li>
                <li><b>How we use it:</b> only to create one calendar event, with a Google Meet link, for each online session booked with that therapist on Choose Your Therapist; to add the client as a guest so both receive the meeting link; to move the event if the session is rescheduled; and to remove it when the session is cancelled or its time has passed.</li>
                <li><b>What we don&apos;t do:</b> we do not read, copy or store the therapist&apos;s other calendar events; we do not use Google user data for advertising; we do not sell it or share it with anyone; and we do not use it to train AI or machine-learning models. No person at CYT reads it except where needed for security, to fix a problem the therapist reports, or where the law requires.</li>
                <li><b>Storage:</b> we store only the connected Google email address and a refresh token (encrypted with AES-256-GCM) needed to create these events. The Meet link is saved with the booking.</li>
                <li><b>Disconnecting and deletion:</b> therapists can disconnect at any time from Settings → Account; we then revoke our access and delete the stored token. Access can also be removed from the Google Account permissions page (myaccount.google.com/permissions). To have any related data deleted, email us.</li>
              </UL>
              <P sx={{ mb: 0 }}>
                Choose Your Therapist&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#166534", fontWeight: 700 }}>Google API Services User Data Policy</a>, including the Limited Use requirements.
              </P>
            </Section>

            <Section>
              <H id="pro-bono" n={9}>Pro Bono Support Programme</H>
              <P>
                In our Pro Bono Support Programme, sessions are offered by psychology interns under the supervision of a licensed mental health
                professional. These sessions provide emotional support and guidance; they are not professional therapy or psychological treatment.
              </P>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Confidentiality</P>
              <P>
                Information shared during a Pro Bono session is treated confidentially and used only to provide support, for supervision and to
                maintain service quality. Only people directly involved in your care and supervision can see it. Confidentiality may be limited if:
              </P>
              <UL>
                <li>There is concern about immediate risk of harm to yourself or to another person.</li>
                <li>Abuse or neglect of a child, older adult or vulnerable person must legally be reported.</li>
                <li>Disclosure is required by applicable law or a court order.</li>
                <li>Information is shared with the supervising licensed professional as part of clinical supervision.</li>
              </UL>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Not for emergencies</P>
              <P>
                The programme is not intended for emergencies — thoughts of suicide with immediate intent, thoughts of seriously harming someone,
                a mental-health crisis needing urgent care, a medical emergency, or severe distress needing immediate care. If you are in immediate
                danger, contact local emergency services, go to the nearest emergency department, or call Tele MANAS on 14416 / 1800-891-4416.
              </P>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Voluntary participation and referral</P>
              <P>
                Participation is voluntary — you may decline any question, end a session at any time, and decide whether to continue. If your
                intern or supervisor believes you would benefit from more care, they may recommend a licensed psychologist, a psychiatrist, a
                medical evaluation, specialised services, or emergency services when appropriate.
              </P>
              <P sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>Informed consent</P>
              <P sx={{ mb: 0 }}>
                By joining the programme you confirm that you have read and understood this information, including who conducts the sessions, the
                limits of confidentiality and that the service is not for emergencies; that you take part voluntarily; that your information may
                be used for supervision and quality assurance; and that you may be referred to a licensed professional if your needs are beyond
                the scope of the programme.
              </P>
            </Section>

            <Section>
              <H id="cookies" n={10}>Cookies and analytics</H>
              <P sx={{ mb: 0 }}>
                We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how our website is used
                (for example through Google Analytics / Google Tag Manager). You can manage cookies from the cookie banner on our website or in
                your browser settings; blocking some cookies may affect how the website works.
              </P>
            </Section>

            <Section>
              <H id="children" n={11}>Children</H>
              <P sx={{ mb: 0 }}>
                Sessions for a person under 18 must be booked by a parent or legal guardian, who provides the information and consent on their behalf.
              </P>
            </Section>

            <Section>
              <H id="changes" n={12}>Changes to this policy</H>
              <P sx={{ mb: 0 }}>
                We may update this policy from time to time. The date at the top shows when it last changed; for significant changes we will
                let you know on the website or by email.
              </P>
            </Section>

            <Section last>
              <H id="contact" n={13}>Contact us</H>
              <P sx={{ mb: 0 }}>
                Choose Your Therapist LLP, Gate No-3, D-137, Block D, Sector 51, Noida, Uttar Pradesh 201301, India ·{" "}
                <a href={`mailto:${EMAIL}`} style={{ color: "#166534", fontWeight: 700 }}>{EMAIL}</a> · +91 80777 57951. See also our{" "}
                <Link href="/terms-conditions" style={{ color: "#166534", fontWeight: 700 }}>Terms &amp; Conditions</Link>.
              </P>
            </Section>
          </Box>
        </Container>
      </div>

      <Footer />
    </>
  );
}
