import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "../components/footer";
import Banner from "../components/home/banner";
import MyNavbar from "../components/navbar";

const Specializations = dynamic(() => import("../components/home/specializations"), { ssr: true });
const Blogs = dynamic(() => import("../components/home/blogs"), { ssr: false });
const Faqs = dynamic(() => import("../components/home/faqs"), { ssr: false });
const CallToAction = dynamic(() => import("../components/home/call-to-action"), { ssr: false });
const Counter = dynamic(() => import("../components/home/counter"), { ssr: false });
const NewsLetter = dynamic(() => import("../components/home/newsletter"), { ssr: false });
const ProfileCard = dynamic(() => import("../components/home/profile-card"), { ssr: false });
const HomeWorkshop = dynamic(() => import("../components/home/workshops"), { ssr: false });
const FreeResources = dynamic(() => import("../components/home/free-resources"), { ssr: false });
const Feedback = dynamic(() => import("../components/home/feedback"), { ssr: false });
const ProcessSteps = dynamic(() => import("../components/home/process-steps"), { ssr: false });
const Brands = dynamic(() => import("../components/about/brands"), { ssr: false });
const LocationConsent = dynamic(() => import("../components/home/location-consent"), { ssr: false });
const BookingPopup = dynamic(() => import("../components/global/booking-popup"), { ssr: false });

import { fetchData } from "../utils/actions";
import { getTherapistProfiles } from "../utils/url";


export default function HomePage() {
  const [topTherapists, setTopTherapists] = useState([]);
  const [bannerTherapists, setBannerTherapists] = useState([]);
  const [userState, setUserState] = useState(null);
  const [userCity, setUserCity] = useState(null);
  const [canonicalUrl, setCanonicalUrl] = useState("https://www.chooseyourtherapist.in/");

  // Fetch user location based on IP
  useEffect(() => {
    // Set canonical URL dynamically
    if (typeof window !== "undefined") {
      setCanonicalUrl("https://www.chooseyourtherapist.in" + window.location.pathname);
    }

    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        // Only set location if it's within India to avoid US-based Googlebot/VPN detection issues
        if (data && data.country === "IN") {
          if (data.region) {
            console.log("User detected state:", data.region);
            setUserState(data.region);
          }
          if (data.city) {
            console.log("User detected city:", data.city);
            setUserCity(data.city);
          }
        } else {
          console.log("International location detected or detection failed, defaulting to Noida, India for SEO.");
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };
    fetchUserLocation();
  }, []);

  const getTopTherapists = useCallback(async () => {
    try {
      const res = await fetchData(getTherapistProfiles);
      console.log("HomePage: fetchData response:", res);
      
      const dataToProcess = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      
      if (dataToProcess && dataToProcess.length > 0) {
        const allTherapists = dataToProcess;
        
        // Priority 1 therapists for Banner (Fixed)
        const priorityTherapists = allTherapists.filter(therapist => therapist.priority === 1 || therapist.priority === "1");
        setBannerTherapists(priorityTherapists.slice(0, 10));

        // Final Sorted List for ProfileCard (Location Based)
        const nonPriorityTherapists = allTherapists.filter(therapist => therapist.priority !== 1 && therapist.priority !== "1");

        let sortedNonPriority = [...nonPriorityTherapists];
        if (userState) {
          const userStateLower = userState.toLowerCase();
          const stateAliases = { "up": "uttar pradesh", "uttar pradesh": "up", "delhi": "ncr", "ncr": "delhi" };
          
          sortedNonPriority.sort((a, b) => {
            const aState = (a.state || "").toLowerCase();
            const bState = (b.state || "").toLowerCase();
            const isALocal = aState.includes(userStateLower) || (stateAliases[userStateLower] && aState.includes(stateAliases[userStateLower]));
            const isBLocal = bState.includes(userStateLower) || (stateAliases[userStateLower] && bState.includes(stateAliases[userStateLower]));
            if (isALocal && !isBLocal) return -1;
            if (!isALocal && isBLocal) return 1;
            return 0;
          });
        }
        
        const combinedTherapists = [...priorityTherapists, ...sortedNonPriority];
        setTopTherapists(combinedTherapists.slice(0, 20));
      } else {
        console.warn("HomePage: No therapists found in response");
      }
    } catch (error) {
      console.error("Error fetching top therapists:", error);
    }
  }, [userState]);

  useEffect(() => {
    getTopTherapists();
  }, [getTopTherapists]);

  const pageTitle = userCity 
    ? `Best Psychologist in ${userCity}${userState ? `, ${userState}` : ""} | Online Therapy | CYT`
    : userState 
      ? `Best Psychologist in ${userState} | Online Therapy | CYT`
      : "Best Psychologist in India | Online Therapy | CYT";

  const pageDescription = userCity 
    ? `Book online or in-person sessions with top-rated psychologists in ${userCity}, ${userState || ""}. Expert therapy for anxiety, depression, OCD, and relationship counseling.` 
    : userState 
      ? `Book online or in-person sessions with top-rated psychologists in ${userState}. Expert therapy for anxiety, depression, OCD, and relationship counseling.` 
      : "Book online or in-person sessions with top-rated psychologists in India. Expert therapy for anxiety, depression, OCD, and relationship counseling.";

  return (
    <div style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Comprehensive SEO Meta Tags */}
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`psychologist in ${userCity || "India"}, therapist in ${userCity || "India"}, best psychologist in ${userCity || "India"}, counseling psychologist in ${userCity || "India"}, mental health therapist ${userCity || "India"}, psychologist near me, therapist near me, online therapy India, online psychologist India`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="copyright" content="Choose Your Therapist" />
        <meta name="language" content="en" />
        <meta httpEquiv="content-language" content="en" />
        <meta name="revisit-after" content="7 days" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Meta Tags */}
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta name="twitter:site" content="@CYT_India" />

        {/* Local SEO Meta Tags - Fixed defaulting to Noida, India for Google sync */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content={userCity && userState ? `${userCity}, ${userState}, India` : "Sector 51, Noida, Uttar Pradesh, India"} />
        <meta name="geo.position" content="28.5672;77.3650" />
        <meta name="ICBM" content="28.5672, 77.3650" />

        {/* Enhanced Schema.org Data */}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              "name": userCity ? `Psychologist Services in ${userCity}` : userState ? `Psychologist Services in ${userState}` : "Psychologist Services in India",
              "description": userCity ? `Top-rated psychologists and mental health experts available in ${userCity}.` : userState ? `Top-rated psychologists and mental health experts available in ${userState}.` : "Top-rated psychologists and mental health experts available across India.",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": canonicalUrl
                  }
                ]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Choose Your Therapist",
              "url": "https://www.chooseyourtherapist.in",
              "logo": "https://www.chooseyourtherapist.in/logo.png",
              "sameAs": [
                "https://twitter.com/CYT_India"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": "Choose Your Therapist",
              "image": "https://www.chooseyourtherapist.in/logo.png",
              "@id": "https://www.chooseyourtherapist.in",
              "url": "https://www.chooseyourtherapist.in",
              "telephone": "+91-8077757951",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Gate No-3, D-137, near LPS GLOBAL SCHOOL, Block D, Sector 51",
                "addressLocality": "Noida",
                "addressRegion": "UP",
                "postalCode": "201301",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.5672,
                "longitude": 77.365
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What mental health services does Choose Your Therapist offer in India?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Choose Your Therapist (CYT) provides a comprehensive range of mental health services across India, including online counseling, specialized therapy for anxiety and depression, corporate wellness programs, school mental health initiatives, and peer support groups."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What should I expect during my first online therapy session with a psychologist?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "In your first online therapy session, our expert psychologists will focus on understanding your specific concerns, building a comfortable therapeutic relationship, and developing a personalized mental health treatment plan tailored to your unique needs."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are the therapy sessions for anxiety and depression confidential?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all our counseling sessions, whether for anxiety, depression, or stress management, are 100% confidential. We follow strict international data protection standards to ensure your privacy and safety throughout your mental health journey."
                  }
                }
              ]
            }
          ])}
        </script>
      </Head>

      <main className="rbt-main-wrapper">
        <MyNavbar />
        {/* Homepage Sections */}
        <Banner topTherapists={bannerTherapists} userCity={userCity} />
        <Specializations />
        <ProfileCard profiles={topTherapists} detectedState={userState} detectedCity={userCity} />
        <FreeResources />
        <HomeWorkshop isWhite={false} />
        <ProcessSteps />
        <Feedback />
        <Blogs />
        <Faqs />
        <NewsLetter />
      </main>
      
      {/* Footer */}
      <Footer />
      <LocationConsent onAccept={() => {
        // Refresh location-based sorting if user accepts
        getTopTherapists();
      }} />
      <BookingPopup delay={5000} showHeading={false} showLocation={false} showSource={false} />
    </div>
  );
}
