import Head from "next/head";
import Link from "next/link";
import { Box, Typography, Container } from "@mui/material";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";

/* Cancellation & refund policy — same light layout as /privacy-policy (the old page sat on the dark site
   background with dark text). The terms themselves are unchanged. */

const UPDATED = "1 October 2024";
const EMAIL = "chooseyourtherapist@gmail.com";

const HIGHLIGHTS = [
  { k: "24 hrs+", v: "Cancel at least 24 hours before your session" },
  { k: "50%", v: "Charged if cancelled within 24 hours" },
  { k: "5–7 days", v: "Refunds reach you in 5–7 business days" },
];

const TERMS = [
  "Cancellations must be made at least 24 hours before the scheduled session.",
  "Sessions cancelled within 24 hours will incur a 50% charge.",
  "No-shows or same-day cancellations will be charged the full session fee.",
  "Clients can cancel through our platform or by directly contacting their therapist.",
  "Refunds are processed within 5–7 business days.",
  "Emergency cancellations (e.g., illness) may be considered for exceptions.",
  "Therapists reserve the right to cancel sessions if necessary.",
  "In the event of therapist cancellations, clients will be informed and offered rescheduling options.",
  "Repeated cancellations may result in service suspension or additional fees.",
  "Cancellations for package-based services adhere to specific terms outlined at the time of purchase.",
];

export default function CancellationPolicy() {
  return (
    <>
      <Head>
        <title>Cancellation &amp; Refund Policy | Choose Your Therapist</title>
        <meta name="description" content="Review our cancellation and refund policy. Understand the terms for rescheduling or canceling your therapy sessions with independent therapists." />
        <meta property="og:title" content="Cancellation Policy | Refund & Rescheduling | Choose Your Therapist" />
        <meta property="og:description" content="Our terms for canceling or rescheduling therapy sessions." />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/cancellation-policy" />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cancellation Policy | Refund & Rescheduling | Choose Your Therapist" />
        <meta name="twitter:description" content="Review our cancellation and refund terms." />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/cancellation-policy" />
      </Head>
      <MyNavbar />

      <Box sx={{ background: "#f8faf9", pb: { xs: 6, md: 9 } }}>
        {/* header */}
        <Box sx={{ background: "linear-gradient(135deg, #eef6f0 0%, #f7f3e8 100%)", borderBottom: "1px solid #e2ebe5", pt: { xs: 4, md: 6 }, pb: { xs: 9, md: 11 } }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 2 }}>
              <Link href="/" style={{ color: "#1b6b45", fontWeight: 600 }}>Home</Link>
              <span style={{ margin: "0 8px" }}>/</span>Cancellation policy
            </Typography>
            <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, mb: 1.5, borderRadius: 99, background: "#fff", border: "1px solid #d7e6dc", color: "#1b6b45", fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Refunds &amp; rescheduling
            </Box>
            <Typography component="h1" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, color: "#173c2a", lineHeight: 1.15, mb: 1.5 }}>
              Cancellation Policy
            </Typography>
            <Typography sx={{ fontSize: { xs: 15, md: 16.5 }, color: "#475569", maxWidth: 560, mx: "auto", lineHeight: 1.7 }}>
              We understand that plans can change. Here is how cancelling, rescheduling and refunds work for your sessions.
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748b", mt: 1.5 }}>Choose Your Therapist LLP · Last updated {UPDATED}</Typography>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ mt: { xs: -6, md: -7 } }}>
          {/* key points */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 3 }}>
            {HIGHLIGHTS.map((h) => (
              <Box key={h.k} sx={{ background: "#fff", borderRadius: 3, border: "1px solid #e2ebe5", boxShadow: "0 6px 20px rgba(23,60,42,.06)", p: 2.25, textAlign: { xs: "left", sm: "center" }, display: { xs: "flex", sm: "block" }, alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900, color: "#1b6b45", minWidth: { xs: 100, sm: 0 }, whiteSpace: "nowrap" }}>{h.k}</Typography>
                <Typography sx={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5, mt: { sm: 0.5 } }}>{h.v}</Typography>
              </Box>
            ))}
          </Box>

          {/* terms */}
          <Box sx={{ background: "#fff", borderRadius: 4, border: "1px solid #e2ebe5", boxShadow: "0 6px 24px rgba(23,60,42,.05)", p: { xs: 2.5, md: 4.5 } }}>
            <Typography component="h2" sx={{ fontSize: { xs: 18, md: 21 }, fontWeight: 800, color: "#14532d", mb: 2.5 }}>
              Cancellation terms
            </Typography>
            <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {TERMS.map((t, i) => (
                <Box component="li" key={i} sx={{ display: "flex", gap: 1.75, alignItems: "flex-start", py: 1.5, borderBottom: i === TERMS.length - 1 ? "none" : "1px solid #eef2ef" }}>
                  <Box sx={{ flex: "0 0 30px", height: 30, borderRadius: "50%", background: "#eef6f0", color: "#1b6b45", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</Box>
                  <Typography sx={{ fontSize: 15, color: "#334155", lineHeight: 1.7, pt: 0.25 }}>{t}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 3, p: 2.25, borderRadius: 3, background: "#fbf7ec", border: "1px solid #efe3c2" }}>
              <Typography sx={{ fontSize: 14, color: "#5b4a1f", lineHeight: 1.7 }}>
                <strong>Disclaimer:</strong> This cancellation policy may be updated at any time. Please review the terms before each session to stay informed.
              </Typography>
            </Box>

            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e2e8f0" }}>
              <Typography component="h2" sx={{ fontSize: { xs: 17, md: 19 }, fontWeight: 800, color: "#14532d", mb: 1 }}>Need to cancel or have a question?</Typography>
              <Typography sx={{ fontSize: 15, color: "#475569", lineHeight: 1.8 }}>
                Cancel from your dashboard, contact your therapist, or write to us at{" "}
                <a href={`mailto:${EMAIL}`} style={{ color: "#1b6b45", fontWeight: 700 }}>{EMAIL}</a>. See also our{" "}
                <Link href="/terms-conditions" style={{ color: "#1b6b45", fontWeight: 700 }}>Terms &amp; Conditions</Link> and{" "}
                <Link href="/privacy-policy" style={{ color: "#1b6b45", fontWeight: 700 }}>Privacy Policy</Link>.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
