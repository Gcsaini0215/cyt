import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Newsletter from "../components/home/newsletter";
import BusinessHero from "../components/business/hero";
import TrustStrip from "../components/business/trust-strip";
import BusinessAudiences from "../components/business/audiences";
import CareModel from "../components/business/care-model";
import OnboardingSteps from "../components/business/onboarding-steps";
import ImpactStats from "../components/business/impact-stats";
import PlansComparison from "../components/business/plans-comparison";
import DemoForm from "../components/business/demo-form";
import BusinessFaqs from "../components/business/faqs";

const PAGE_URL = "https://www.chooseyourtherapist.in/for-business";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
    { "@type": "ListItem", "position": 2, "name": "For Business", "item": PAGE_URL }
  ]
};

export default function ForBusiness() {
  return (
    <div id="__next">
      <Head>
        <title>Choose Your Therapist for Business | Corporate & Institutional Mental Health</title>
        <meta name="description" content="Bring verified psychologists and clinical psychologists to your employees, students, or members. Confidential mental health support for organizations across India." />
        <meta name="keywords" content="employee mental health benefit India, corporate therapy program, workplace mental health, EAP India, school counselling program, mental health for business" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:title" content="Choose Your Therapist for Business | Corporate Mental Health" />
        <meta property="og:description" content="Confidential, verified mental health support for employees, students, and members — delivered at scale." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:site_name" content="Choose Your Therapist" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Choose Your Therapist for Business" />
        <meta name="twitter:description" content="Bring verified mental health support to your organization." />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <MyNavbar />
      <BusinessHero />
      <TrustStrip />
      <BusinessAudiences />
      <CareModel />
      <OnboardingSteps />
      <ImpactStats />
      <PlansComparison />
      <DemoForm />
      <BusinessFaqs />
      <Newsletter />
      <Footer />
    </div>
  );
}
