import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import FreeResources from "../components/home/free-resources";
import WellnessToolkitBanner from "../components/wellness-toolkit/banner";
import CrisisSupport from "../components/wellness-toolkit/crisis-support";
import AssessmentIntegration from "../components/wellness-toolkit/assessment-integration";
import DownloadableResources from "../components/wellness-toolkit/downloadable-resources";

export default function WellnessToolkit() {
  return (
    <div id="__next">
      <Head>
        <title>Wellness Toolkit | Free Mental Health Resources | Choose Your Therapist</title>
        <meta name="description" content="Access our free wellness toolkit featuring breathing guides, mood trackers, panic buttons, and journaling prompts for your mental well-being." />
        <meta name="keywords" content="Wellness Toolkit, Mental Health Resources, Free Therapy Tools, Breathing Exercises, Mood Tracker, Panic Button" />
        <link rel="canonical" href="https://chooseyourtherapist.in/wellness-toolkit" />
        
        <meta property="og:title" content="Wellness Toolkit | Free Mental Health Resources | Choose Your Therapist" />
        <meta property="og:description" content="Free mental health tools and resources to help you manage anxiety, track your mood, and practice mindfulness." />
        <meta property="og:url" content="https://chooseyourtherapist.in/wellness-toolkit" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Wellness Toolkit | Free Mental Health Resources | Choose Your Therapist" />
        <meta name="twitter:description" content="Free mental health tools and resources to help you manage anxiety and practice mindfulness." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
      </Head>
      <MyNavbar />
      
      <main>
        <WellnessToolkitBanner />
        
        <div id="resources-section">
          <FreeResources bgColor="#ffffff" textColor="#1a4d32" />
        </div>

        <DownloadableResources bgColor="#f1f8f5" />

        <AssessmentIntegration />

        <CrisisSupport />
      </main>

      <NewsLetter />
      <Footer />
    </div>
  );
}
