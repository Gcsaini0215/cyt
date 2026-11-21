import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import ContactPage from "../components/contact/contact-page";

const SITE = "https://www.chooseyourtherapist.in";
const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Choose Your Therapist",
  "url": `${SITE}/contact-us`,
  "mainEntity": {
    "@type": "Organization",
    "name": "Choose Your Therapist",
    "url": SITE,
    "logo": `${SITE}/assets/img/logo.png`,
    "email": "chooseyourtherapist@gmail.com",
    "telephone": "+91-8077757951",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gate No-3, D-137, near LPS Global School, Block D, Sector 51",
      "addressLocality": "Noida",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "201301",
      "addressCountry": "IN",
    },
    "contactPoint": [{
      "@type": "ContactPoint",
      "telephone": "+91-8077757951",
      "email": "chooseyourtherapist@gmail.com",
      "contactType": "customer support",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"],
      "hoursAvailable": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "09:00", "closes": "21:00" },
    }],
  },
};

export default function ContactUs() {
  return (
    <div id="__next" style={{ overflowX: "clip" }}>
      <Head>
        <title>Contact Us | Get in Touch with Choose Your Therapist</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Have questions? Contact Choose Your Therapist for support, inquiries, or assistance with finding the right psychologist in India. We're here to help." />
        <meta name="keywords" content="Contact Choose Your Therapist, Therapy Support India, Mental Health Inquiries" />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/contact-us" />
        
        <meta property="og:title" content="Contact Us | Get in Touch with Choose Your Therapist" />
        <meta property="og:description" content="Have questions? Contact Choose Your Therapist for support, inquiries, or assistance." />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/contact-us" />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us | Get in Touch with Choose Your Therapist" />
        <meta name="twitter:description" content="Contact Choose Your Therapist for support or inquiries." />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      </Head>
      <MyNavbar />
      <ContactPage />
      <Footer />
    </div>
  );
}
