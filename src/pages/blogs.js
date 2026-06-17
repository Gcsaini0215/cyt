import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Container, Breadcrumbs, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";
import BlogHeader from "../components/blogs/header";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import Blogs from "../components/blogs/all-blogs";
import NewsLetter from "../components/home/newsletter";

const PAGE_URL = "https://www.chooseyourtherapist.in/blogs";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

const blogListingSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${PAGE_URL}#blog`,
  "name": "Choose Your Therapist — Mental Health & Psychology Blog",
  "description": "Expert articles on mental health, therapy, anxiety, depression, OCD, relationships, and psychological wellbeing — written and reviewed by verified psychologists in India.",
  "url": PAGE_URL,
  "inLanguage": "en-IN",
  "publisher": {
    "@type": "Organization",
    "@id": "https://www.chooseyourtherapist.in#organization",
    "name": "Choose Your Therapist"
  },
  "about": [
    { "@type": "MedicalCondition", "name": "Anxiety" },
    { "@type": "MedicalCondition", "name": "Depression" },
    { "@type": "MedicalCondition", "name": "OCD" },
    { "@type": "MedicalCondition", "name": "Trauma and PTSD" },
    { "@type": "MedicalCondition", "name": "Relationship Issues" },
    { "@type": "MedicalCondition", "name": "Mental Health Stigma" }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
    { "@type": "ListItem", "position": 2, "name": "Mental Health Blog", "item": PAGE_URL }
  ]
};

const blogsHeroSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  "name": "Mental Health & Psychology Blog — Choose Your Therapist",
  "description": "India's most trusted mental health blog. Expert articles on anxiety, depression, OCD, relationships, trauma, and therapy — written and reviewed by verified psychologists.",
  "url": PAGE_URL,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".blogs-hero-heading", ".blogs-hero-desc", ".blogs-why-text"]
  },
  "about": [
    { "@type": "MedicalCondition", "name": "Anxiety Disorder" },
    { "@type": "MedicalCondition", "name": "Depression" },
    { "@type": "MedicalCondition", "name": "OCD" },
    { "@type": "MedicalCondition", "name": "Relationship Issues" },
    { "@type": "MedicalCondition", "name": "Trauma and PTSD" }
  ]
};

export default function AllBlogs() {
  return (
    <div id="__next">
      <Head>
        <title>Mental Health & Psychology Blog | Expert Articles | Choose Your Therapist</title>
        <meta name="description" content="Read expert articles on anxiety, depression, OCD, relationships, trauma, and therapy — written by verified psychologists in India. Practical advice for real mental health challenges." />
        <meta name="keywords" content="mental health blog India, psychology articles, anxiety tips, depression help, OCD treatment India, relationship counselling, therapy blog, psychologist articles India" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:title" content="Mental Health & Psychology Blog | Choose Your Therapist" />
        <meta property="og:description" content="Expert articles on anxiety, depression, OCD, relationships, and therapy from verified psychologists in India." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mental Health & Psychology Blog | Choose Your Therapist" />
        <meta name="twitter:description" content="Expert articles on anxiety, depression, OCD, relationships, and therapy from verified psychologists in India." />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogsHeroSchema) }} />
      </Head>
      <MyNavbar />
      
      {/* Secondary Header / Breadcrumb Bar - Dark Mode Version */}
      <Box sx={{ bgcolor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
        <Container maxWidth="lg">
          <Breadcrumbs 
            separator={<ChevronRight size={16} color="#ffffff" />} 
            aria-label="breadcrumb"
            sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 600 }}
          >
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              Home
            </Link>
            <Typography color="#ffffff" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 800 }}>
              BLOGS
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* GEO Hero */}
      <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2818 100%)", py: { xs: 7, md: 11 }, px: 2 }}>
        <Container maxWidth="lg">
          <Typography
            className="blogs-hero-heading"
            component="h1"
            sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "2.4rem", md: "3.8rem", lg: "4.5rem" }, mb: 2.5, lineHeight: 1.12, letterSpacing: "-0.02em" }}
          >
            Mental Health Insights<br />
            <Box component="span" sx={{ color: "#86efac" }}>from Verified Psychologists</Box>
          </Typography>
          <Typography
            className="blogs-hero-desc"
            sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: "1.05rem", md: "1.3rem" }, maxWidth: 660, lineHeight: 1.8, mb: 5, fontWeight: 400 }}
          >
            Evidence-based articles on anxiety, depression, OCD, relationships, trauma, and therapy — written and reviewed by RCI-verified psychologists and counsellors across India.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {["Anxiety", "Depression", "OCD", "Relationships", "Self Care", "Trauma & PTSD", "Therapy Explained", "Grief & Loss"].map((label) => (
              <Box key={label} sx={{ px: 2.5, py: 1, borderRadius: "20px", border: "1.5px solid rgba(134,239,172,0.35)", color: "#86efac", fontSize: "0.9rem", fontWeight: 700 }}>
                {label}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* General Awareness Section */}
      <Box sx={{ bgcolor: "#ffffff", py: { xs: 5, md: 8 }, borderBottom: "1px solid #f1f5f9" }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", md: "2rem" }, color: "#0f172a", mb: 1.5, textAlign: "center" }}>
            Understanding Mental Health — A Starting Point
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: { xs: "0.95rem", md: "1.05rem" }, textAlign: "center", maxWidth: 620, mx: "auto", mb: 6, lineHeight: 1.8 }}>
            Therapy is not just for crises. These articles help you understand your emotions, relationships, and mental wellbeing — without any judgment, at your own pace.
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
            {[
              {
                icon: "🧠",
                heading: "Anxiety vs. everyday stress — what's the difference?",
                text: "Everyone feels nervous sometimes. But anxiety is different — it's persistent, often irrational, and can interfere with daily life. Understanding the difference is the first step to getting the right support."
              },
              {
                icon: "💬",
                heading: "Common myths about therapy — debunked",
                text: "Therapy is not just for people in crisis. It's a structured, confidential conversation with a trained psychologist that helps you understand yourself better and develop practical coping strategies."
              },
              {
                icon: "❤️",
                heading: "How relationships affect your mental health",
                text: "Toxic relationships, loneliness, and unresolved family conflict have a direct impact on mental wellbeing. Our articles provide honest, practical perspectives on navigating these challenges."
              },
              {
                icon: "😔",
                heading: "Depression is more than just sadness",
                text: "Depression is a medical condition — not a personality flaw or weakness. Its symptoms can be subtle: disturbed sleep, loss of motivation, emotional numbness. Recognising it is the first step toward healing."
              },
              {
                icon: "🔄",
                heading: "OCD is not just about cleanliness",
                text: "OCD involves intrusive thoughts, checking behaviours, and mental compulsions — not just handwashing. It is a treatable condition, and understanding it clearly helps reduce stigma and seek the right help."
              },
              {
                icon: "🌱",
                heading: "Self-care that actually works",
                text: "Real self-care is not about expensive routines. It means setting boundaries, recognising your own needs, and building sustainable habits. Our articles focus on practical, evidence-backed approaches."
              },
            ].map(({ icon, heading, text }) => (
              <Box
                key={heading}
                className="blogs-why-text"
                sx={{
                  p: 3, borderRadius: "16px", border: "1.5px solid #f1f5f9",
                  bgcolor: "#fafafa", transition: "border-color 0.2s",
                  "&:hover": { borderColor: "#86efac", bgcolor: "#f0fdf4" }
                }}
              >
                <Box sx={{ fontSize: "2.2rem", mb: 1.5 }}>{icon}</Box>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "1.05rem", md: "1.15rem" }, mb: 1.5, lineHeight: 1.4 }}>{heading}</Typography>
                <Typography sx={{ color: "#64748b", fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.85 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Blogs />
      <NewsLetter />
      <Footer />
    </div>
  );
}
