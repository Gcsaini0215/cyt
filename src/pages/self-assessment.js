import { useState } from "react";
import Head from "next/head";
import SelfAssessmentBanner from "../components/self-assessment/banner";
import AssessmentCards from "../components/self-assessment/assessment-cards";
import AssessmentForm from "../components/self-assessment/assessment-form";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import NewsLetter from "../components/home/newsletter";

export default function SelfAssessment() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const handleSelectAssessment = (assessmentId) => {
    setSelectedAssessment(assessmentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCards = () => {
    setSelectedAssessment(null);
  };

  return (
    <div id="__next">
      <Head>
        <title>Mental Health Self Assessment | Professional Evaluation | Choose Your Therapist</title>
        <meta name="description" content="Evaluate your mental well-being with our expert-designed self-assessment tools. Get immediate insights into your emotional health and find the right support." />
        <meta name="keywords" content="Mental Health Self Assessment, Psychological Test India, Anxiety Test, Depression Screening, Emotional Well-being Check, Mental Health Evaluation" />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/self-assessment" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/self-assessment" />
        <meta property="og:title" content="Mental Health Self Assessment | Professional Evaluation" />
        <meta property="og:description" content="Take a step towards better mental health with our guided self-assessment tools." />
        <meta property="og:image" content="https://www.chooseyourtherapist.in/images/assessment-preview.jpg" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.chooseyourtherapist.in/self-assessment" />
        <meta name="twitter:title" content="Mental Health Self Assessment | Professional Evaluation" />
        <meta name="twitter:description" content="Take a step towards better mental health with our guided self-assessment tools." />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/images/assessment-preview.jpg" />
      </Head>
      <MyNavbar />
      <SelfAssessmentBanner />
      
      {selectedAssessment ? (
        <AssessmentForm assessmentId={selectedAssessment} onBack={handleBackToCards} />
      ) : (
        <AssessmentCards onSelectAssessment={handleSelectAssessment} />
      )}
      
      <NewsLetter />
      <Footer />
    </div>
  );
}
