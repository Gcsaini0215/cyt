import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "../components/footer";
import Banner from "../components/home/banner";
import MyNavbar from "../components/navbar";

const Specializations = dynamic(() => import("../components/home/specializations"), { ssr: true });
const Blogs = dynamic(() => import("../components/home/blogs"), { ssr: false });
// server-rendered so the answers are in the page HTML (search engines and AI assistants read them)
import Faqs, { faqCategories } from "../components/home/faqs";
const CallToAction = dynamic(() => import("../components/home/call-to-action"), { ssr: false });
const Counter = dynamic(() => import("../components/home/counter"), { ssr: false });
import TopTherapists from "../components/home/top-therapists";
const HomeWorkshop = dynamic(() => import("../components/home/workshops"), { ssr: false });
import FeelBetter from "../components/home/feel-better";
const Feedback = dynamic(() => import("../components/home/feedback"), { ssr: false });
import FindByLocation from "../components/home/find-by-location";
import LeadCard from "../components/global/lead-card";
import MobileActionBar from "../components/global/mobile-action-bar";
const Brands = dynamic(() => import("../components/about/brands"), { ssr: false });
const LocationConsent = dynamic(() => import("../components/home/location-consent"), { ssr: false });
const BookingPopup = dynamic(() => import("../components/global/booking-popup"), { ssr: false });

import { fetchData } from "../utils/actions";
import { getTherapistProfiles } from "../utils/url";
import { getMinFee, split, sessionModes } from "../utils/therapist-directory";
import { placeStats } from "../utils/places";
import { concernStats } from "../utils/concerns";

// Banner wall + "top therapists": priority-1 therapists first, then the most-reviewed.
const isTop = (t) => t.priority === 1 || t.priority === "1";
function pickBanner(all) {
  const withReviews = all.filter((t) => (t.reviews?.length || 0) > 0 && !isTop(t))
    .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
  return [...all.filter(isTop), ...withReviews].slice(0, 10);
}
function pickTop(all, userState) {
  const rest = all.filter((t) => !isTop(t));
  rest.sort((a, b) => {
    const d = (b.reviews || []).length - (a.reviews || []).length;
    if (d) return d;
    // equal reviews: the visitor's own state first
    if (userState) {
      const u = userState.toLowerCase();
      const alias = { "up": "uttar pradesh", "uttar pradesh": "up", "delhi": "ncr", "ncr": "delhi" };
      const local = (t) => { const st = (t.state || "").toLowerCase(); return st.includes(u) || (alias[u] && st.includes(alias[u])); };
      if (local(a) && !local(b)) return -1;
      if (!local(a) && local(b)) return 1;
    }
    return 0;
  });
  return [...all.filter(isTop), ...rest].slice(0, 20);
}
// Banner wall + reviews only need these few fields. The full documents also carried schedules,
// fee tables, subscription/payment fields and every review — 136 KB of the page's HTML that no
// one saw (and payment ids have no business being public).
const homeSlim = (t, reviewText = false) => {
  const fee = getMinFee(t.fees);
  const reviews = t.reviews || [];
  return {
    _id: t._id,
    user: { name: t.user?.name || "", profile: t.user?.profile || "" },
    profile_type: t.profile_type || "", state: t.state || "", year_of_exp: t.year_of_exp || "",
    language_spoken: t.language_spoken || "", session_formats: t.session_formats || "",
    experties: t.experties || "", priority: t.priority ?? null,
    fees: fee ? [{ formats: [{ fee }] }] : [],
    reviews: reviewText
      // "What our clients say" shows each therapist's newest three written reviews
      ? reviews.filter((r) => String(r.description || "").trim())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3)
        .map((r) => ({ rating: r.rating, name: r.name || "", description: r.description || "", createdAt: r.createdAt || null }))
      : reviews.map((r) => ({ rating: r.rating })),
  };
};
const clean = (o) => JSON.parse(JSON.stringify(o));
// "Meet our psychologists" cards: just what a card shows (~0.4 KB per therapist)
const cardSlim = (t) => {
  const fee = getMinFee(t.fees);
  return {
    _id: t._id,
    user: { name: t.user?.name || "", profile: t.user?.profile || "" },
    profile_type: t.profile_type || "", state: t.state || "", year_of_exp: t.year_of_exp || "",
    language_spoken: t.language_spoken || "", session_formats: t.session_formats || "", priority: t.priority ?? null,
    fees: fee ? [{ formats: [{ fee }] }] : [],
    availabilities: (t.availabilities || []).map((a) => ({ day: a.day, times: (a.times || []).map((x) => ({ open: x.open })) })),
    reviews: (t.reviews || []).map((r) => ({ rating: r.rating })),
  };
};

// The home page used to fetch every therapist in the browser, so the banner wall and the
// therapist cards weren't in the HTML at all. Now they're rendered on the server and
// refreshed every 10 minutes; the browser only re-sorts once it knows the visitor's state.
export async function getStaticProps() {
  try {
    const res = await fetchData(getTherapistProfiles, { page: 1, pageSize: 1000 });
    const all = res?.data || [];
    const fees = all.map((t) => getMinFee(t.fees)).filter(Boolean);
    return {
      props: {
        initialBanner: clean(pickBanner(all).map((t) => homeSlim(t))),
        initialTop: clean(pickTop(all, null).map((t) => homeSlim(t, true))),
        stats: { count: all.length, minFee: fees.length ? Math.min(...fees) : null },
        concerns: clean(concernStats(all, getMinFee, split)),
        people: clean(all.map(cardSlim)),
        places: placeStats(all, getMinFee, sessionModes),
      },
      revalidate: 600,
    };
  } catch (err) {
    console.error("home getStaticProps:", err?.message);
    return { props: { initialBanner: [], initialTop: [], stats: null, concerns: null, people: [], places: {} }, revalidate: 60 };
  }
}


export default function HomePage({ initialBanner = [], initialTop = [], stats = null, concerns = null, people = [], places = {} }) {
  const [topTherapists, setTopTherapists] = useState(initialTop);
  const [bannerTherapists, setBannerTherapists] = useState(initialBanner);
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
      const all = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      if (all.length > 0) {
        setBannerTherapists(pickBanner(all));
        setTopTherapists(pickTop(all, userState));
      } else {
        console.warn("HomePage: No therapists found in response");
      }
    } catch (error) {
      console.error("Error fetching top therapists:", error);
    }
  }, [userState]);

  // the server already sent the lists; fetch again only to put the visitor's own state first
  // (or if the server couldn't reach the API)
  useEffect(() => {
    if (userState || initialTop.length === 0) getTopTherapists();
  }, [getTopTherapists]);

  // full brand name in the title: people searching for "choose your therapist" didn't recognise "CYT"
  const pageTitle = userCity
    ? `Best Psychologist in ${userCity} | Choose Your Therapist`
    : userState
      ? `Best Psychologist in ${userState} | Choose Your Therapist`
      : "Best Psychologists in India | Choose Your Therapist";

  const pageDescription = userCity 
    ? `Book online or in-person sessions with top-rated psychologists in ${userCity}, ${userState || ""}. Expert therapy for anxiety, depression, OCD, and relationship counseling.` 
    : userState 
      ? `Book online or in-person sessions with top-rated psychologists in ${userState}. Expert therapy for anxiety, depression, OCD, and relationship counseling.` 
      : "Talk to a verified psychologist online or at our Noida centre — for anxiety, stress, depression and relationships. Sessions from ₹500. Book in 2 minutes.";

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
        <meta key="og:locale" property="og:locale" content="en_IN" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta key="og:image" property="og:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={canonicalUrl} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <meta name="twitter:site" content="@CYT_India" />

        {/* Local SEO Meta Tags - Fixed defaulting to Noida, India for Google sync */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content={userCity && userState ? `${userCity}, ${userState}, India` : "Sector 51, Noida, Uttar Pradesh, India"} />
        <meta name="geo.position" content="28.5821626;77.3742084" />
        <meta name="ICBM" content="28.5821626, 77.3742084" />

        {/* Enhanced Schema.org Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Choose Your Therapist",
              "alternateName": ["CYT", "chooseyourtherapist.in"],
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
                "url": "https://www.chooseyourtherapist.in/icons/cyt-icon-512.png",
                "width": 512,
                "height": 512
              },
              "image": [
                "https://www.chooseyourtherapist.in/api/og/site.jpg?page=home",
                "https://www.chooseyourtherapist.in/images/centre/cyt-noida-centre-sector-51.jpg",
                "https://www.chooseyourtherapist.in/images/centre/cyt-noida-centre-team.jpg"
              ],
              "foundingDate": "2020",
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
                "https://www.instagram.com/choose.your.therapist",
                "https://www.facebook.com/chooseyourtherapist",
                "https://www.linkedin.com/company/chooseyourtherapist"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": "Choose Your Therapist",
              "image": [
                "https://www.chooseyourtherapist.in/images/centre/cyt-noida-centre-sector-51.jpg",
                "https://www.chooseyourtherapist.in/images/centre/cyt-noida-centre-counselling-room.jpg",
                "https://www.chooseyourtherapist.in/images/centre/cyt-noida-centre-team.jpg"
              ],
              "logo": "https://www.chooseyourtherapist.in/icons/cyt-icon-512.png",
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
                "latitude": 28.5821626,
                "longitude": 77.3742084
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "hasMap": "https://www.google.com/maps?cid=4421494166537850872",
              "areaServed": [
                { "@type": "City", "name": "Noida" },
                { "@type": "City", "name": "Greater Noida" },
                { "@type": "City", "name": "Delhi" },
                { "@type": "City", "name": "Ghaziabad" }
              ],
              "potentialAction": {
                "@type": "ReserveAction",
                "name": "Book a psychologist in Noida",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.chooseyourtherapist.in/noida-appointment",
                  "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
                },
                "result": { "@type": "Reservation", "name": "Psychologist appointment in Noida (Sector 51)" }
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": "https://www.chooseyourtherapist.in/#webpage",
              "url": "https://www.chooseyourtherapist.in/",
              "name": userCity
                ? `Best Psychologist in ${userCity} | Choose Your Therapist`
                : userState
                  ? `Best Psychologist in ${userState} | Choose Your Therapist`
                  : "Best Psychologists in India | Choose Your Therapist",
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
          ]) }} />

        {/* FAQPage — built from the same questions the FAQ section shows (components/home/faqs), so the
            markup always matches what's on the page; one FAQPage per page */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqCategories.flatMap((c) => c.faqs).map((f) => ({
              "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          }) }} />
      </Head>

      <main className="rbt-main-wrapper home-wide">
        <MyNavbar />
        {/* Homepage Sections */}
        <Banner topTherapists={bannerTherapists} stats={stats} />
        <Specializations stats={concerns} />
        <TopTherapists people={people} visitorState={userState} total={stats?.count || people.length} />
        <FeelBetter stats={concerns?.bySlug} />
        <section style={{ background: "#fff", padding: "8px 0 56px" }}>
          <div className="container">
            <LeadCard tag="Home" title="Not sure where to start? Talk to us" />
          </div>
        </section>
        <HomeWorkshop isWhite={false} />
        <FindByLocation stats={places} total={stats?.count || 0} visitorState={userState} />
        <Feedback therapists={topTherapists} />
        <Blogs />
        <Faqs />
      </main>
      
      {/* Footer */}
      <Footer />
      <LocationConsent onAccept={() => {
        // Refresh location-based sorting if user accepts
        getTopTherapists();
      }} />
      <BookingPopup showHeading={false} showLocation={false} showSource={false}
        title="Find the right psychologist" sourceTag="Popup · Home" />
      <MobileActionBar noida />
    </div>
  );
}
