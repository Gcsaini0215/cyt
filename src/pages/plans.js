import React from "react";
import { Helmet } from "react-helmet";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import CallToAction from "../components/home/call-to-action";
import Newsletter from "../components/home/newsletter";
import PlansHeader from "../components/plans/header";
import PlansCards from "../components/plans/plan-cards";

export default function Plans() {
  return (
    <div id="__next">
      <Helmet>
        <title>Therapy Plans & Pricing | Affordable Counseling in India | Choose Your Therapist</title>
        <meta name="description" content="Explore affordable therapy plans and pricing at Choose Your Therapist. We offer flexible options for individual counseling, couples therapy, and specialized mental health support starting from ₹500." />
        <meta name="keywords" content="Therapy Plans, Counseling Pricing India, Affordable Therapy, Mental Health Packages, Choose Your Therapist Plans" />
        <link rel="canonical" href="https://chooseyourtherapist.in/plans" />
        
        <meta property="og:title" content="Therapy Plans & Pricing | Affordable Counseling in India" />
        <meta property="og:description" content="Explore affordable therapy plans and pricing. Flexible options for individual counseling and specialized mental health support." />
        <meta property="og:url" content="https://chooseyourtherapist.in/plans" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Therapy Plans & Pricing | Affordable Counseling in India" />
        <meta name="twitter:description" content="Explore affordable therapy plans and pricing at Choose Your Therapist." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Helmet>
      <MyNavbar />
      <PlansHeader />
      
      <PlansCards />
     
      <Newsletter />
      <Footer />
    </div>
  );
}
