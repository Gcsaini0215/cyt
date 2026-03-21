import React from "react";
import Head from "next/head";
import AboutUsBanner from "../components/about/banner";
import ServiceQuality from "../components/about/service-quality";
import AboutCyt from "../components/about/about-cyt";
import CallToActionAbout from "../components/about/call-to-action";
import TeamBanner from "../components/about/team-banner";
import Footer from "../components/footer";
import Feedback from "../components/home/feedback";
import MyNavbar from "../components/navbar";
import NewsLetter from "../components/home/newsletter";


export default function AboutUs() {
  return (
    <div id="__next">
      <Head>
        <title>About Us | Our Story & Mission | Choose Your Therapist</title>
        <meta name="description" content="Discover the story behind Choose Your Therapist. We are dedicated to making mental health support accessible, professional, and personalized across India." />
        <meta name="keywords" content="About Choose Your Therapist, Mental Health Mission India, Therapy Story, Professional Psychologist Network, Mental Wellness Vision" />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/about-us" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/about-us" />
        <meta property="og:title" content="About Us | Our Story & Mission | Choose Your Therapist" />
        <meta property="og:description" content="Learn about our mission to make mental health support accessible across India and our commitment to verified professional care." />
        <meta property="og:image" content="https://www.chooseyourtherapist.in/images/about-preview.jpg" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.chooseyourtherapist.in/about-us" />
        <meta name="twitter:title" content="About Us | Our Story & Mission | Choose Your Therapist" />
        <meta name="twitter:description" content="Learn about Choose Your Therapist and our mission for mental health accessibility in India." />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/images/about-preview.jpg" />
      </Head>
      <MyNavbar />
      <AboutUsBanner />
      <AboutCyt />
      <ServiceQuality />
      
      <CallToActionAbout />
      <Feedback />


      <NewsLetter />
      <Footer />
    </div>
  );
}
