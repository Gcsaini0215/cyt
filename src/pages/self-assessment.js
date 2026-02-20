import { useState } from "react";
import { Helmet } from "react-helmet-async";
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
      <Helmet>
        <title>Mental Health Self Assessment | Choose Your Therapist</title>
        <meta name="description" content="Take our comprehensive mental health self-assessment test. Get personalized insights and recommendations from our expert psychologists." />
        <meta name="keywords" content="Self Assessment, Mental Health Test, Therapy Assessment, Psychological Evaluation, Mental Wellness Check" />
        <link rel="canonical" href="https://chooseyourtherapist.in/self-assessment" />
        
        <meta property="og:title" content="Mental Health Self Assessment | Choose Your Therapist" />
        <meta property="og:description" content="Take our comprehensive self-assessment test to understand your mental health better and get personalized insights." />
        <meta property="og:url" content="https://chooseyourtherapist.in/self-assessment" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mental Health Self Assessment | Choose Your Therapist" />
        <meta name="twitter:description" content="Take our comprehensive self-assessment test to understand your mental health better." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
      </Helmet>
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
