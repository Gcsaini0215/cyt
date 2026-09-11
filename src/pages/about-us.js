import React, { useEffect, useState } from "react";
import Head from "next/head";
import AboutUsBanner from "../components/about/banner";
import DirectorNote from "../components/about/director-note";
import ServiceQuality from "../components/about/service-quality";
import AboutFaqs, { aboutFaqData } from "../components/about/faqs";
import Footer from "../components/footer";
import Feedback from "../components/home/feedback";
import MyNavbar from "../components/navbar";
import { fetchData } from "../utils/actions";
import { getTherapistProfiles } from "../utils/url";

const PAGE_URL = "https://www.chooseyourtherapist.in/about-us";
// Self-hosted (not a third-party hotlink) so social/AI crawlers always get
// it; same photo as this page's own hero banner.
const OG_IMAGE = "https://www.chooseyourtherapist.in/images/bg5.jpg";

// Organization schema — the most trusted signal for AI engines
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "MedicalOrganization"],
  "@id": "https://www.chooseyourtherapist.in#organization",
  "name": "Choose Your Therapist",
  "alternateName": "CYT",
  "description": "Choose Your Therapist (CYT) is India's trusted mental health platform connecting individuals with verified counselling psychologists, clinical psychologists, and special educators for online and in-person therapy sessions.",
  "url": "https://www.chooseyourtherapist.in",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.chooseyourtherapist.in/logo.png",
    "width": 250,
    "height": 60
  },
  "image": OG_IMAGE,
  "foundingDate": "2021",
  "foundingLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gate No-3, D-137, near LPS GLOBAL SCHOOL, Block D, Sector 51",
      "addressLocality": "Noida",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "201301",
      "addressCountry": "IN"
    }
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Gate No-3, D-137, near LPS GLOBAL SCHOOL, Block D, Sector 51",
    "addressLocality": "Noida",
    "addressRegion": "Uttar Pradesh",
    "postalCode": "201301",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 28.5672,
    "longitude": 77.365
  },
  "telephone": "+91-8077757951",
  "email": "hello@chooseyourtherapist.in",
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "medicalSpecialty": [
    "Counselling Psychology",
    "Clinical Psychology",
    "Child & Adolescent Psychology",
    "Trauma & PTSD Therapy",
    "Relationship Counselling",
    "Anxiety & Depression Treatment",
    "OCD Therapy",
    "Special Education"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Mental Health Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Online Therapy Sessions" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "In-Person Counselling" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Couples & Relationship Therapy" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Child & Adolescent Therapy" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Corporate Wellness Programs" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "School Mental Health Programs" } }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "500",
    "bestRating": "5"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+91-8077757951",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    {
      "@type": "ContactPoint",
      "email": "hello@chooseyourtherapist.in",
      "contactType": "support",
      "areaServed": "IN"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/chooseyourtherapist",
    "https://www.facebook.com/chooseyourtherapist",
    "https://twitter.com/CYT_India",
    "https://www.linkedin.com/company/chooseyourtherapist"
  ]
};

// AboutPage schema
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Choose Your Therapist — India's Mental Health Platform",
  "description": "Learn about Choose Your Therapist's mission to make mental health support accessible, professional, and personalized across India through a network of verified psychologists.",
  "url": PAGE_URL,
  "about": { "@id": "https://www.chooseyourtherapist.in#organization" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
      { "@type": "ListItem", "position": 2, "name": "About Us", "item": PAGE_URL }
    ]
  }
};

// FAQPage schema — mirrors aboutFaqData in components/about/faqs.js word
// for word (platform/company questions, distinct from the general therapy
// FAQs on /faqs, so this doesn't duplicate that page's structured data).
const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": aboutFaqData.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a }
  }))
};

export default function AboutUs() {
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchData(getTherapistProfiles);
        const data = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        if (!cancelled) setTherapists(data || []);
      } catch (error) {
        console.error("Error fetching therapists for reviews:", error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div id="__next">
      <Head>
        <title>About Choose Your Therapist | India's Verified Psychologist Network</title>
        <meta name="description" content="Choose Your Therapist (CYT) is a MCA & MSME registered mental health platform connecting people across India — Noida, Delhi NCR, and online nationwide — with verified, licensed psychologists, counsellors and psychiatrists for confidential online and in-person therapy." />
        <meta name="keywords" content="about Choose Your Therapist, CYT India, mental health platform India, verified psychologist network India, online therapy India, therapist near me India, counselling psychologist India, clinical psychologist India, Noida psychologist, Delhi NCR therapist, pan India online counselling, MCA MSME registered mental health platform" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Choose Your Therapist LLP" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <link rel="canonical" href={PAGE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="About Choose Your Therapist | India's Verified Psychologist Network" />
        <meta property="og:description" content="Learn how Choose Your Therapist connects people across India with verified, licensed psychologists for confidential online and in-person therapy — our story, our founder, and how we work." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1440" />
        <meta property="og:image:height" content="960" />
        <meta property="og:image:alt" content="Choose Your Therapist — mental health support across India" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={PAGE_URL} />
        <meta name="twitter:title" content="About Choose Your Therapist | India's Verified Psychologist Network" />
        <meta name="twitter:description" content="Learn about Choose Your Therapist and our mission for mental health accessibility in India." />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="Choose Your Therapist — mental health support across India" />
        <meta name="twitter:site" content="@CYT_India" />

        {/* Schema.org — Organization + AboutPage */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }} />
      </Head>
      <MyNavbar />
      <AboutUsBanner />
      <DirectorNote />
      <ServiceQuality />
      <AboutFaqs />
      
      <Feedback therapists={therapists} />

      <Footer />
    </div>
  );
}
