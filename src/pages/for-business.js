import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import BusinessHero from "../components/business/hero";
import TrustStrip from "../components/business/trust-strip";
import BusinessAudiences from "../components/business/audiences";
import CareModel from "../components/business/care-model";
import OnboardingSteps from "../components/business/onboarding-steps";
import ImpactStats from "../components/business/impact-stats";
import PlansComparison from "../components/business/plans-comparison";
import DemoForm from "../components/business/demo-form";
import BusinessFaqs, { faqData } from "../components/business/faqs";
import CorporateServices, { corporateServices } from "../components/business/corporate-services";

const SITE = "https://www.chooseyourtherapist.in";
const PAGE_URL = `${SITE}/for-business`;
const OG_IMAGE = `${SITE}/assets/img/gallery-banner-013639.jpg`;
const TITLE = "Corporate Wellness Program in India | Employee Mental Health & EAP";
const DESCRIPTION = "Corporate wellness program for Indian companies: confidential employee counselling (EAP), burnout workshops & manager training by verified psychologists.";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/` },
    { "@type": "ListItem", "position": 2, "name": "Corporate Wellness", "item": PAGE_URL }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Corporate Wellness Program",
  "serviceType": "Corporate mental health and Employee Assistance Program (EAP)",
  "description": DESCRIPTION,
  "url": PAGE_URL,
  "image": OG_IMAGE,
  "areaServed": { "@type": "Country", "name": "India" },
  "audience": { "@type": "BusinessAudience", "audienceType": "Employers, HR and People teams" },
  "provider": {
    "@type": "Organization",
    "name": "Choose Your Therapist",
    "url": SITE,
    "logo": `${SITE}/assets/img/logo.png`,
    "telephone": "+91-8077757951",
    "email": "chooseyourtherapist@gmail.com"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Corporate mental health services",
    "itemListElement": corporateServices.map((s) => ({
      "@type": "Offer",
      "itemOffered": { "@type": "Service", "name": s.title, "description": s.desc }
    }))
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

export default function ForBusiness() {
  return (
    <div id="__next">
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content="corporate wellness program India, employee mental health, EAP India, employee assistance program, corporate counselling services, workplace mental health, employee wellness program, stress management workshop for employees, corporate mental health services Noida Delhi NCR" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={PAGE_URL} />
        <link rel="preload" as="image" href="/assets/img/gallery-banner-013639.jpg" />

        <meta key="og:title" property="og:title" content={TITLE} />
        <meta key="og:description" property="og:description" content="Confidential employee counselling, workshops and manager training by verified psychologists. Get a corporate wellness proposal in 24 hours." />
        <meta key="og:url" property="og:url" content={PAGE_URL} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="Employees at a modern office supported by a corporate wellness program" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content="Confidential employee counselling, workshops and manager training by verified psychologists." />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <MyNavbar />
      <BusinessHero />
      <TrustStrip />
      <BusinessAudiences />
      <CorporateServices />
      <CareModel />
      <OnboardingSteps />
      <ImpactStats />
      <PlansComparison />
      <DemoForm />
      <BusinessFaqs />
      <Footer />
    </div>
  );
}
