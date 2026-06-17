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

      {/* GEO Hero — speakable, keyword-rich intro */}
      <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1a2e1a 100%)", py: { xs: 5, md: 8 }, px: 2 }}>
        <Container maxWidth="lg">
          <Typography
            className="blogs-hero-heading"
            component="h1"
            sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "2rem", md: "3rem" }, mb: 2, lineHeight: 1.2 }}
          >
            Mental Health Insights from<br />
            <Box component="span" sx={{ color: "#86efac" }}>Verified Psychologists</Box>
          </Typography>
          <Typography
            className="blogs-hero-desc"
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: { xs: "1rem", md: "1.15rem" }, maxWidth: 640, lineHeight: 1.75, mb: 4 }}
          >
            Evidence-based articles on anxiety, depression, OCD, relationships, trauma, and therapy — written and reviewed by RCI-verified psychologists and counsellors across India.
          </Typography>
          {/* Topic pills */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {[
              { label: "Anxiety", q: "Anxiety" },
              { label: "Depression", q: "Depression" },
              { label: "OCD", q: "OCD" },
              { label: "Relationships", q: "Relationships" },
              { label: "Self Care", q: "Self Care" },
              { label: "Trauma & PTSD", q: "Trauma" },
              { label: "Therapy Explained", q: "Therapy" },
            ].map(({ label }) => (
              <Box
                key={label}
                sx={{
                  px: 2, py: 0.75, borderRadius: "20px",
                  border: "1.5px solid rgba(134,239,172,0.4)",
                  color: "#86efac", fontSize: "0.85rem", fontWeight: 700,
                  cursor: "default"
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* GEO Why-read section — speakable, cited by AI */}
      <Box sx={{ bgcolor: "#f0fdf4", py: { xs: 4, md: 5 }, borderBottom: "1px solid #dcfce7" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 3, md: 6 }, alignItems: "flex-start" }}>
            {[
              {
                heading: "Why trust our articles?",
                text: "Every article on Choose Your Therapist is written or reviewed by a verified psychologist registered with the Rehabilitation Council of India (RCI). We do not publish generic wellness content — our focus is evidence-based mental health information relevant to India."
              },
              {
                heading: "Therapy information in Hindi & English",
                text: "Mental health mein abhi bhi bahut stigma hai — khaaskar India mein. Isliye humara content Hindi aur English dono mein hota hai, taaki har koi therapy ke baare mein khulke samajh sake aur madad le sake."
              },
              {
                heading: "From anxiety to OCD — find your topic",
                text: "Whether you're dealing with anxiety, depression, OCD, relationship issues, trauma, or just want to understand what therapy feels like — our blog covers it all with practical, India-specific advice."
              }
            ].map(({ heading, text }) => (
              <Box key={heading} sx={{ flex: "1 1 260px", minWidth: 220 }}>
                <Typography sx={{ fontWeight: 800, color: "#166534", fontSize: "1rem", mb: 1 }}>{heading}</Typography>
                <Typography className="blogs-why-text" sx={{ color: "#374151", fontSize: "0.92rem", lineHeight: 1.75 }}>{text}</Typography>
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
