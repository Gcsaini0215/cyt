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

      <Blogs />
      <NewsLetter />
      <Footer />
    </div>
  );
}
