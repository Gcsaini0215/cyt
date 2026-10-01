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
import { getTherapistProfiles, imagePath } from "../utils/url";

const PAGE_URL = "https://www.chooseyourtherapist.in/about-us";
// Self-hosted (not a third-party hotlink) so social/AI crawlers always get
// it; 1200x630 share card made for this page (Who We Are / What We Offer
// + registration logos). Bump the filename on redesign — social apps cache by URL.
const OG_IMAGE = "https://www.chooseyourtherapist.in/images/og-about-us-v2.jpg";

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
    "width": 1651,
    "height": 426
  },
  "image": OG_IMAGE,
  "foundingDate": "2020",
  "founder": { "@id": "https://www.chooseyourtherapist.in/about-us#deepak-kumar" },
  "employee": [{ "@id": "https://www.chooseyourtherapist.in/about-us#shubham-kumar" }],
  "identifier": [
    { "@type": "PropertyValue", "propertyID": "HFR ID (ABDM, National Health Authority)", "value": "IN0510005384" },
    { "@type": "PropertyValue", "propertyID": "MCA LLP registration (Ministry of Corporate Affairs)", "value": "AAX 8113" }
  ],
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

// Leadership — same people (and photos) as the notes slider on the page.
const peopleSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.chooseyourtherapist.in/about-us#deepak-kumar",
    "name": "Deepak Kumar",
    "jobTitle": "Founder & Director",
    "image": `${imagePath}/2bbed01e-4c05-4d99-aa6a-7c1f2053cfa5_profile-picture.jpg`,
    "worksFor": { "@id": "https://www.chooseyourtherapist.in#organization" }
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.chooseyourtherapist.in/about-us#shubham-kumar",
    "name": "Shubham Kumar",
    "jobTitle": "Associate Psychologist & Head of Operations",
    "image": "https://www.chooseyourtherapist.in/images/team/shubham-kumar.jpg",
    "worksFor": { "@id": "https://www.chooseyourtherapist.in#organization" }
  }
];

// AboutPage schema
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Choose Your Therapist — India's Mental Health Platform",
  "description": "Learn about Choose Your Therapist's mission to make mental health support accessible, professional, and personalized across India through a network of verified psychologists.",
  "url": PAGE_URL,
  "about": { "@id": "https://www.chooseyourtherapist.in#organization" },
  "mainEntity": { "@id": "https://www.chooseyourtherapist.in#organization" },
  "primaryImageOfPage": { "@type": "ImageObject", "url": OG_IMAGE, "width": 1200, "height": 630 },
  "inLanguage": "en-IN",
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
        <meta name="description" content="Find the right therapist in India — verified psychologists for online therapy or in-person sessions in Noida. HFR (ABDM) & MCA registered, since 2020." />
        <meta name="keywords" content="about Choose Your Therapist, CYT India, mental health platform India, verified psychologist network India, online therapy India, therapist near me India, counselling psychologist India, clinical psychologist India, Noida psychologist, Delhi NCR therapist, pan India online counselling, MCA MSME registered mental health platform" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Choose Your Therapist LLP" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <link rel="canonical" href={PAGE_URL} />

        {/* Open Graph */}
        <meta key="og:type" property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="About Choose Your Therapist | India's Verified Psychologist Network" />
        <meta property="og:description" content="Verified psychologists for online therapy across India and in-person sessions in Noida. HFR registered under ABDM (National Health Authority) and MCA registered, since 2020." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="What Choose Your Therapist stands for — HFR registered under ABDM (HFR ID IN0510005384), MCA, MSME, NHA and ABDM registrations" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={PAGE_URL} />
        <meta name="twitter:title" content="About Choose Your Therapist | India's Verified Psychologist Network" />
        <meta name="twitter:description" content="Verified psychologists for online therapy across India and in-person sessions in Noida. HFR (ABDM) & MCA registered, since 2020." />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="What Choose Your Therapist stands for — HFR registered under ABDM (HFR ID IN0510005384), MCA, MSME, NHA and ABDM registrations" />
        <meta name="twitter:site" content="@CYT_India" />

        {/* Schema.org — Organization + AboutPage */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(peopleSchema) }} />
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
