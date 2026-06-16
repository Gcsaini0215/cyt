import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ViewAllTherapist from "../components/View-All-Therapist/view-all-therapist";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";

const PAGE_URL = "https://www.chooseyourtherapist.in/view-all-therapist";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

// Schema: MedicalOrganization — the directory itself is a medical org listing
const medicalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "@id": "https://www.chooseyourtherapist.in#medicalorg",
  "name": "Choose Your Therapist — Verified Psychologist Directory",
  "description": "India's trusted directory of verified counselling psychologists, clinical psychologists, and special educators offering online and in-person therapy sessions.",
  "url": PAGE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.chooseyourtherapist.in/logo.png"
  },
  "medicalSpecialty": [
    "Counselling Psychology",
    "Clinical Psychology",
    "Child & Adolescent Psychology",
    "Relationship Counselling",
    "Trauma Therapy",
    "Anxiety & Depression Treatment",
    "OCD Therapy",
    "Special Education"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "availableService": [
    { "@type": "MedicalTherapy", "name": "Online Counselling" },
    { "@type": "MedicalTherapy", "name": "In-Person Therapy" },
    { "@type": "MedicalTherapy", "name": "Couples Counselling" },
    { "@type": "MedicalTherapy", "name": "Child Therapy" },
    { "@type": "MedicalTherapy", "name": "Anxiety & Depression Therapy" },
    { "@type": "MedicalTherapy", "name": "Trauma & PTSD Counselling" },
    { "@type": "MedicalTherapy", "name": "OCD Treatment" }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8077757951",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://www.instagram.com/chooseyourtherapist",
    "https://www.facebook.com/chooseyourtherapist",
    "https://twitter.com/CYT_India"
  ]
};

// Schema: CollectionPage — the directory page as a collection
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Find Verified Psychologists & Therapists in India",
  "description": "Browse our directory of verified psychologists, counselling psychologists, clinical psychologists, and special educators across India. Filter by specialty, state, language, and experience.",
  "url": PAGE_URL,
  "provider": { "@id": "https://www.chooseyourtherapist.in#medicalorg" },
  "about": {
    "@type": "MedicalCondition",
    "name": "Mental Health Disorders",
    "description": "Conditions including anxiety, depression, OCD, PTSD, relationship issues, and learning disabilities"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
      { "@type": "ListItem", "position": 2, "name": "Find a Psychologist", "item": PAGE_URL }
    ]
  }
};

// Schema: Service — searchable therapist directory as a service
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Therapist Matching & Directory Service",
  "description": "Search and book verified psychologists and therapists in India based on specialization, location, language, and experience.",
  "provider": { "@id": "https://www.chooseyourtherapist.in#medicalorg" },
  "serviceType": "Mental Health Therapist Directory",
  "areaServed": { "@type": "Country", "name": "India" },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Psychologist Specializations",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Counselling Psychology" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Clinical Psychology" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Special Education" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Child & Adolescent Therapy" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Couples & Relationship Counselling" } }
    ]
  }
};

const allSchemas = [medicalOrgSchema, collectionPageSchema, serviceSchema];

function getDynamicMeta(query) {
  const { profile_type, state, services } = query || {};
  if (profile_type && state) {
    return {
      title: `${profile_type}s in ${state} | Choose Your Therapist`,
      description: `Find verified ${profile_type}s in ${state}. Browse profiles, check specializations, and book online or in-person therapy sessions.`,
    };
  }
  if (profile_type) {
    return {
      title: `Find ${profile_type}s in India | Choose Your Therapist`,
      description: `Browse verified ${profile_type}s across India. Filter by location, language, and experience. Book online or in-person sessions today.`,
    };
  }
  if (state) {
    return {
      title: `Psychologists & Therapists in ${state} | Choose Your Therapist`,
      description: `Find verified psychologists and counsellors in ${state}. Book online or in-person therapy sessions for anxiety, depression, relationships, and more.`,
    };
  }
  if (services) {
    return {
      title: `${services} — Verified Therapists in India | Choose Your Therapist`,
      description: `Find therapists specialising in ${services} across India. Browse verified psychologists and book a session online or in-person.`,
    };
  }
  return {
    title: "Find Verified Psychologists & Therapists in India | Choose Your Therapist",
    description: "Browse India's largest directory of verified counselling psychologists, clinical psychologists, and therapists. Filter by specialty, city, language, and experience. Book online or in-person sessions.",
  };
}

export default function ViewAllTherapistPage() {
  const router = useRouter();
  const { title, description } = getDynamicMeta(router.query);

  return (
    <div id="__next">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="find psychologist India, verified therapists India, counselling psychologist near me, online therapy India, best psychologist India, therapist directory, clinical psychologist, mental health counseling, book therapist online" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:site" content="@CYT_India" />

        {/* Schema.org — MedicalOrganization + CollectionPage + Service */}
        {allSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          <ViewAllTherapist />
          <NewsLetter />
        </main>
        <Footer />
      </main>
    </div>
  );
}
