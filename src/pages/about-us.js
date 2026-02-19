import React from "react";
import { Helmet } from "react-helmet-async";
import AboutUsBanner from "../components/about/banner";
import ServiceQuality from "../components/about/service-quality";
import AboutCyt from "../components/about/about-cyt";
import CallToActionAbout from "../components/about/call-to-action";
import TeamBanner from "../components/about/team-banner";
import Footer from "../components/footer";
import Feedback from "../components/home/feedback";
import MyNavbar from "../components/navbar";
import NewsLetter from "../components/home/newsletter";
import InterSection from "../components/about/inter-section";

export default function AboutUs() {
  return (
    <div id="__next">
      <Helmet>
        <title>About Us | Our Story & Mission | Choose Your Therapist</title>
        <meta name="description" content="Learn about Choose Your Therapist, our mission to make mental health support accessible across India, and our commitment to connecting you with verified professionals." />
        <meta name="keywords" content="About Choose Your Therapist, Mental Health Mission, Therapy India Story, Verified Psychologists Mission" />
        <link rel="canonical" href="https://chooseyourtherapist.in/about-us" />
        
        <meta property="og:title" content="About Us | Our Story & Mission | Choose Your Therapist" />
        <meta property="og:description" content="Learn about our mission to make mental health support accessible across India and our commitment to verified professional care." />
        <meta property="og:url" content="https://chooseyourtherapist.in/about-us" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us | Our Story & Mission | Choose Your Therapist" />
        <meta name="twitter:description" content="Learn about Choose Your Therapist and our mission for mental health accessibility in India." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
      </Helmet>
      <MyNavbar />
      <AboutUsBanner />
      <AboutCyt />
      <ServiceQuality />
      
      <CallToActionAbout />
      <Feedback />
      <InterSection />

      <NewsLetter />
      <Footer />
    </div>
  );
}
