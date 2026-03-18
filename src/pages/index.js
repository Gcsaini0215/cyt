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

  // Fetch user location based on IP
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data && data.region) {
          console.log("User detected state:", data.region);
          setUserState(data.region);
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

  return (
    <div style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Comprehensive SEO Meta Tags */}
      <Head>
        {/* Basic Meta Tags */}
        <title>{userState ? `Best Psychologist in ${userState} | Top Rated Mental Health Studio` : "Best Psychologist in India | Choose Your Therapist"}</title>
        <meta name="description" content={userState ? `Connect with the best psychologists in ${userState}. Book online or in-person sessions with verified professionals for anxiety, stress, and emotional well-being.` : "Connect with the best psychologists in India. Book online or in-person sessions with verified professionals for anxiety, stress, and emotional well-being."} />
        <meta name="keywords" content={`Best Psychologist ${userState || "India"}, Mental Health Studio ${userState || ""}, Online Therapy India, In-Person Therapy, Verified Therapists, Anxiety Counseling, Choose Your Therapist`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href="https://chooseyourtherapist.in/" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={userState ? `Best Psychologist in ${userState} | Online & In-Person Therapy` : "Choose Best Therapist Across India | Online & In-Person Therapy"} />
        <meta property="og:description" content={userState ? `Find qualified psychologists in ${userState}. Explore verified professionals and book confidential sessions today.` : "Find a qualified psychologist anywhere in India. Explore verified professionals and book confidential sessions today."} />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:url" content="https://chooseyourtherapist.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Local SEO for detected region */}
        {userState && (
          <>
            <meta name="geo.region" content="IN" />
            <meta name="geo.placename" content={userState} />
          </>
        )}

        {/* Enhanced Schema.org Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": userState ? `Psychologist Services in ${userState}` : "Psychologist Services in India",
            "description": userState ? `Top-rated psychologists and mental health experts available in ${userState}.` : "Top-rated psychologists and mental health experts available across India.",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://chooseyourtherapist.in"
                }
              ]
            }
          })}
        </script>
      </Head>

      <main className="rbt-main-wrapper">
        <MyNavbar />
        {/* Homepage Sections */}
        <Banner topTherapists={bannerTherapists} />
        <Specializations />
        <ProfileCard profiles={topTherapists} detectedState={userState} />
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
      <BookingPopup delay={15000} />
    </div>
  );
}
