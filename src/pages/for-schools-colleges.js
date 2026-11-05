import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import StudentWellbeingPage, { SWP_INCLUDES, faqData } from "../components/institutions/student-wellbeing";

const SITE = "https://www.chooseyourtherapist.in";
const PAGE_URL = `${SITE}/for-schools-colleges`;
const OG_IMAGE = `${SITE}/api/og/site.jpg?page=schools`;
const TITLE = "School & College Counselling Services India | Student Wellbeing | CYT";
const DESCRIPTION = "Student wellbeing program for schools, colleges and universities: confidential counselling with verified psychologists, campus visits, workshops, teacher training and a crisis pathway.";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/` },
    { "@type": "ListItem", "position": 2, "name": "Schools & Colleges", "item": PAGE_URL },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Student Wellbeing Program for Schools & Colleges",
  "serviceType": "School and college counselling services",
  "description": DESCRIPTION,
  "url": PAGE_URL,
  "image": OG_IMAGE,
  "areaServed": { "@type": "Country", "name": "India" },
  "audience": { "@type": "EducationalAudience", "educationalRole": "School and college administrators" },
  "provider": {
    "@type": "Organization",
    "name": "Choose Your Therapist",
    "url": SITE,
    "logo": `${SITE}/assets/img/logo.png`,
    "telephone": "+91-8077757951",
    "email": "chooseyourtherapist@gmail.com",
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Student mental health services",
    "itemListElement": SWP_INCLUDES.map((s) => ({ "@type": "Offer", "itemOffered": { "@type": "Service", "name": s.title, "description": s.desc } })),
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};

export default function ForSchoolsColleges() {
  return (
    <div id="__next" style={{ overflowX: "clip" }}>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content="school counselling services India, college counselling services, student mental health program, student wellbeing program, school counsellor Noida Delhi NCR, university counselling, coaching institute counselling, Supreme Court student mental health guidelines" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={PAGE_URL} />

        <meta key="og:title" property="og:title" content={TITLE} />
        <meta key="og:description" property="og:description" content="Counselling, campus visits, workshops and a crisis pathway for your students — by verified psychologists. Get a proposal for your school or college." />
        <meta key="og:url" property="og:url" content={PAGE_URL} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="Choose Your Therapist — Student Wellbeing Program for schools and colleges" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content="Counselling, campus visits, workshops and a crisis pathway for your students — by verified psychologists." />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <MyNavbar />
      <StudentWellbeingPage />
      <Footer />
    </div>
  );
}
