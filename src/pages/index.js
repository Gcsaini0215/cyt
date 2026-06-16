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
            setUserState(data.region);
          }
          if (data.city) {
            setUserCity(data.city);
          }
        } else {
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
      const dataToProcess = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      
      if (dataToProcess && dataToProcess.length > 0) {
        const allTherapists = dataToProcess;
        
        // Priority 1 therapists for Banner — fill remaining slots with high-review therapists
        const priorityTherapists = allTherapists.filter(therapist => therapist.priority === 1 || therapist.priority === "1");
        const withReviews = allTherapists
          .filter(t => (t.reviews?.length || 0) > 0 && t.priority !== 1 && t.priority !== "1")
          .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
        const bannerList = [...priorityTherapists, ...withReviews].slice(0, 10);
        setBannerTherapists(bannerList);

        // Final Sorted List for ProfileCard (Review & Location Based)
        const nonPriorityTherapists = allTherapists.filter(therapist => therapist.priority !== 1 && therapist.priority !== "1");

        let sortedNonPriority = [...nonPriorityTherapists];

        // Primary Sort: Most Reviews First
        sortedNonPriority.sort((a, b) => {
          const aReviews = (a.reviews || []).length;
          const bReviews = (b.reviews || []).length;
          if (aReviews !== bReviews) return bReviews - aReviews;
          
          // Secondary Sort: Location (if reviews are equal)
          if (userState) {
            const userStateLower = userState.toLowerCase();
            const stateAliases = { "up": "uttar pradesh", "uttar pradesh": "up", "delhi": "ncr", "ncr": "delhi" };
            const aState = (a.state || "").toLowerCase();
            const bState = (b.state || "").toLowerCase();
            const isALocal = aState.includes(userStateLower) || (stateAliases[userStateLower] && aState.includes(stateAliases[userStateLower]));
            const isBLocal = bState.includes(userStateLower) || (stateAliases[userStateLower] && bState.includes(stateAliases[userStateLower]));
            if (isALocal && !isBLocal) return -1;
            if (!isALocal && isBLocal) return 1;
          }
          return 0;
        });
        
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
              "@type": "WebSite",
              "name": "Choose Your Therapist",
              "url": "https://www.chooseyourtherapist.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.chooseyourtherapist.in/view-all-therapist?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              "name": userCity ? `Psychologist Services in ${userCity}` : userState ? `Psychologist Services in ${userState}` : "Psychologist Services in India",
              "description": userCity ? `Top-rated psychologists and mental health experts available in ${userCity}.` : userState ? `Top-rated psychologists and mental health experts available in ${userState}.` : "Top-rated psychologists and mental health experts available across India.",
              "specialty": "Mental Health",
              "about": {
                "@type": "MedicalCondition",
                "name": "Mental Health Disorders"
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.chooseyourtherapist.in/"
                  }
                ]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": ["Organization", "MedicalOrganization"],
              "@id": "https://www.chooseyourtherapist.in#organization",
              "name": "Choose Your Therapist",
              "alternateName": "CYT",
              "description": "India's trusted platform for verified counselling psychologists, clinical psychologists, and special educators offering online and in-person mental health therapy.",
              "url": "https://www.chooseyourtherapist.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.chooseyourtherapist.in/logo.png",
                "width": 250,
                "height": 60
              },
              "foundingDate": "2021",
              "areaServed": { "@type": "Country", "name": "India" },
              "medicalSpecialty": [
                "Counselling Psychology",
                "Clinical Psychology",
                "Child & Adolescent Psychology",
                "Trauma & PTSD Therapy",
                "Relationship Counselling",
                "Anxiety & Depression Treatment",
                "OCD Therapy",
                "Special Education"
              ],
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+91-8077757951",
                  "contactType": "customer service",
                  "areaServed": "IN",
                  "availableLanguage": ["English", "Hindi"]
                },
                {
                  "@type": "ContactPoint",
                  "email": "hello@chooseyourtherapist.in",
                  "contactType": "support",
                  "areaServed": "IN"
                }
              ],
              "sameAs": [
                "https://twitter.com/CYT_India",
                "https://www.instagram.com/chooseyourtherapist",
                "https://www.facebook.com/chooseyourtherapist",
                "https://www.linkedin.com/company/chooseyourtherapist"
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
              "priceRange": "₹₹",
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
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "hasMap": "https://maps.google.com/?q=28.5672,77.3650",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "500",
                "bestRating": "5"
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
                    "text": "Choose Your Therapist (CYT) provides a comprehensive range of mental health services across India, including online counseling, therapy for anxiety and depression, OCD, relationship counseling, corporate wellness programs, school mental health initiatives, and peer support groups."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much does an online therapy session cost on Choose Your Therapist?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Session fees on Choose Your Therapist vary by therapist experience and specialization. Sessions typically start from ₹500 and go up to ₹3000 per session. We also offer affordable subscription plans for regular therapy. Visit our Plans page for detailed pricing."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I choose the right therapist for my needs?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can filter therapists by specialization (anxiety, depression, OCD, relationship issues), language, location, and availability. Each therapist profile includes their qualifications, experience, approach, and patient reviews to help you make the right choice."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What should I expect during my first online therapy session?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "In your first session, the therapist will understand your concerns, background, and goals. They will help build a comfortable therapeutic relationship and create a personalized treatment plan. Sessions are typically 45-60 minutes long."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are therapy sessions on Choose Your Therapist confidential?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all counseling sessions are 100% confidential. We follow strict data protection standards to ensure your privacy and safety throughout your mental health journey."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I book an in-person therapy session as well?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Choose Your Therapist offers both online and in-person therapy options. Many therapists are available for in-person sessions in cities like Noida, Delhi, Mumbai, Bangalore, and other major Indian cities."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is the cancellation policy for therapy sessions?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sessions can be cancelled or rescheduled up to 24 hours before the appointment without any charge. Cancellations within 24 hours may incur a partial fee. Please refer to our cancellation policy page for complete details."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are the therapists on Choose Your Therapist verified?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all therapists on Choose Your Therapist are verified mental health professionals with valid licenses and qualifications. We verify their degrees, certifications, and registration with recognized psychological associations before onboarding."
                  }
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": "https://www.chooseyourtherapist.in/#webpage",
              "url": "https://www.chooseyourtherapist.in/",
              "name": userCity
                ? `Best Psychologist in ${userCity} | Online Therapy | CYT`
                : userState
                  ? `Best Psychologist in ${userState} | Online Therapy | CYT`
                  : "Best Psychologist in India | Online Therapy | CYT",
              "isPartOf": { "@id": "https://www.chooseyourtherapist.in#organization" },
              "about": { "@id": "https://www.chooseyourtherapist.in#organization" },
              "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "h2", ".therapist-card-name", ".specialization-title"]
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" }
                ]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Mental Health Services by Choose Your Therapist",
              "description": "Types of therapy and counselling services available on Choose Your Therapist",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "MedicalTherapy",
                    "name": "Counselling Psychology",
                    "description": "Talk therapy for stress, anxiety, relationship issues, and everyday emotional challenges with a verified Counselling Psychologist.",
                    "url": "https://www.chooseyourtherapist.in/view-all-therapist?profile_type=Counselling+Psychologist"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "MedicalTherapy",
                    "name": "Clinical Psychology",
                    "description": "Evidence-based assessment and treatment for depression, OCD, PTSD, anxiety disorders, and complex mental health conditions with a verified Clinical Psychologist.",
                    "url": "https://www.chooseyourtherapist.in/view-all-therapist?profile_type=Clinical+Psychologist"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "MedicalTherapy",
                    "name": "Special Education",
                    "description": "Specialized support for children and adults with learning disabilities, autism spectrum disorders, and developmental challenges.",
                    "url": "https://www.chooseyourtherapist.in/view-all-therapist?profile_type=Special+Educator"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "MedicalTherapy",
                    "name": "Couples & Relationship Counselling",
                    "description": "Professional couples therapy and relationship counselling to improve communication, resolve conflicts, and strengthen your bond.",
                    "url": "https://www.chooseyourtherapist.in/view-all-therapist?services=Couples+Therapy"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "item": {
                    "@type": "MedicalTherapy",
                    "name": "Online Therapy",
                    "description": "Secure, confidential online therapy sessions from the comfort of your home with verified mental health professionals across India.",
                    "url": "https://www.chooseyourtherapist.in/view-all-therapist"
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
        <Feedback therapists={topTherapists} />
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
