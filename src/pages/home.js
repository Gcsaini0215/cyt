import { Helmet } from "react-helmet"; // SEO ke liye
import Footer from "../components/footer";
import Banner from "../components/home/banner";
import ProcessSteps from "../components/home/process-steps";
import Blogs from "../components/home/blogs";
import CallToAction from "../components/home/call-to-action";
import Counter from "../components/home/counter";
import NewsLetter from "../components/home/newsletter";
import ProfileCard from "../components/home/profile-card";
import PromationalBanner from "../components/home/promational-banner";
import Services from "../components/home/services";
import HomeWorkshop from "../components/home/workshops";
import MyNavbar from "../components/navbar";
import BottomNavigation from "../components/bottom-navigation";

import Brands from "../components/about/brands";


export default function HomePage() {
  // const [showPopup, setShowPopup] = useState(false); // agar popup use karna ho

  return (
    <div id="__next" style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Comprehensive SEO Meta Tags */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>
          India's Growing Network of Verified Therapists Connecting You to Trusted Counselling Support | Choose Your Therapist
        </title>
        <meta
          name="description"
          content="Connect with our trusted network of psychologists through Choose Your Therapist. Book affordable in-person or online therapy sessions, mental health counseling, and expert support from local psychologists near you."
        />
        <meta
          name="keywords"
          content="Affordable Psychologists, Network of Psychologists, Online Therapy, In-Person Therapy, Mental Health Counseling, Expert Psychologists, Choose Your Therapist, Psychologists in Noida, Local Therapy Noida, Therapy Sessions, Counselling Support, Mental Health Professionals"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href="https://chooseyourtherapist.in/" />

        {/* Open Graph Meta Tags for Facebook */}
        <meta property="og:title" content="India's Growing Network of Verified Therapists | Choose Your Therapist" />
        <meta property="og:description" content="Connect with trusted psychologists for affordable online and in-person therapy sessions. Expert mental health counseling and support from verified professionals." />
        <meta property="og:image" content="https://chooseyourtherapist.in/images/banner-og-image.jpg" />
        <meta property="og:url" content="https://chooseyourtherapist.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="India's Growing Network of Verified Therapists | Choose Your Therapist" />
        <meta name="twitter:description" content="Connect with trusted psychologists for affordable online and in-person therapy sessions. Expert mental health counseling and support." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/images/banner-twitter-image.jpg" />
        <meta name="twitter:site" content="@chooseyourtherapist" />
        <meta name="twitter:creator" content="@chooseyourtherapist" />

        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#228756" />
        <meta name="msapplication-TileColor" content="#228756" />
        <meta name="application-name" content="Choose Your Therapist" />

        {/* Local SEO */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Noida, Uttar Pradesh, India" />
        <meta name="geo.position" content="28.5355;77.3910" />
        <meta name="ICBM" content="28.5355, 77.3910" />

        {/* Enhanced LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://chooseyourtherapist.in/#organization",
            "name": "Choose Your Therapist",
            "alternateName": "Choose Your Therapist - Mental Health Platform",
            "url": "https://chooseyourtherapist.in",
            "logo": "https://chooseyourtherapist.in/logo.png",
            "description": "India's growing network of verified therapists providing affordable online and in-person therapy sessions, mental health counseling, and expert psychological support.",
            "image": "https://chooseyourtherapist.in/images/banner-og-image.jpg",
            "telephone": "+91-XXXXXXXXXX",
            "email": "support@chooseyourtherapist.in",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Your Street Address",
              "addressLocality": "Noida",
              "addressRegion": "UP",
              "postalCode": "201301",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "28.5355",
              "longitude": "77.3910"
            },
            "areaServed": [
              {
                "@type": "Place",
                "name": "India"
              },
              {
                "@type": "Place",
                "name": "Noida"
              },
              {
                "@type": "Place",
                "name": "Delhi NCR"
              }
            ],
            "serviceType": ["Mental Health Counseling", "Online Therapy", "In-Person Therapy", "Psychological Support"],
            "priceRange": "₹500-₹2000",
            "paymentAccepted": ["Cash", "Credit Card", "UPI", "Net Banking"],
            "currenciesAccepted": "INR",
            "openingHours": "Mo-Su 09:00-21:00",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Anonymous Patient"
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": "Excellent platform for finding verified therapists. The booking process was smooth and I found great support."
              }
            ],
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+91-XXXXXXXXXX",
                "contactType": "customer service",
                "availableLanguage": ["English", "Hindi"],
                "hoursAvailable": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  "opens": "09:00",
                  "closes": "21:00"
                }
              }
            ],
            "sameAs": [
              "https://www.facebook.com/chooseyourtherapist",
              "https://www.instagram.com/chooseyourtherapist",
              "https://www.linkedin.com/company/chooseyourtherapist",
              "https://twitter.com/chooseyourtherapist"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Therapy Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Individual Therapy Session",
                    "description": "One-on-one therapy session with a verified psychologist"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "price": "500",
                    "priceCurrency": "INR"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Free Consultation",
                    "description": "15-minute free consultation to discuss your therapy needs"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "price": "0",
                    "priceCurrency": "INR"
                  }
                }
              ]
            }
          })}
        </script>

        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://chooseyourtherapist.in"
              }
            ]
          })}
        </script>

        {/* Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Online Therapy & Counseling",
            "description": "Professional mental health counseling and therapy services provided by verified psychologists and therapists.",
            "provider": {
              "@type": "LocalBusiness",
              "@id": "https://chooseyourtherapist.in/#organization"
            },
            "serviceType": "Mental Health Service",
            "areaServed": {
              "@type": "Country",
              "name": "India"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Therapy Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Individual Counseling Session",
                    "description": "45-minute one-on-one therapy session"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "price": "500",
                    "priceCurrency": "INR",
                    "valueAddedTaxIncluded": false
                  },
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Free Initial Consultation",
                    "description": "15-minute free consultation to assess therapy needs"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "price": "0",
                    "priceCurrency": "INR"
                  },
                  "availability": "https://schema.org/InStock"
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150",
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I book a therapy session?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Booking a therapy session is simple. Choose your preferred therapist from our verified network, select a convenient time slot, and complete the secure payment process. You'll receive confirmation and session details via email and SMS."
                }
              },
              {
                "@type": "Question",
                "name": "Are your therapists verified and qualified?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all therapists on our platform are thoroughly verified and hold valid qualifications in psychology, counseling, or psychiatry. We conduct background checks and verify credentials before onboarding any professional."
                }
              },
              {
                "@type": "Question",
                "name": "What types of therapy do you offer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer various types of therapy including Cognitive Behavioral Therapy (CBT), counseling for anxiety, depression, relationship issues, stress management, and more. Both online and in-person sessions are available."
                }
              },
              {
                "@type": "Question",
                "name": "How much does a therapy session cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Session prices start from ₹500 and vary based on the therapist's experience and specialization. We offer competitive pricing with a free initial consultation to help you choose the right therapist."
                }
              },
              {
                "@type": "Question",
                "name": "Is my information confidential?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. We maintain strict confidentiality standards. All communications between you and your therapist are private and protected. We comply with professional ethics and data protection regulations."
                }
              }
            ]
          })}
        </script>

        {/* Event Schema for Workshops */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Mental Health Workshop",
            "description": "Join our expert-led workshops on mental health awareness, stress management, and emotional well-being.",
            "startDate": "2024-12-01T10:00:00+05:30",
            "endDate": "2024-12-01T12:00:00+05:30",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
              "@type": "VirtualLocation",
              "url": "https://chooseyourtherapist.in/workshop-link"
            },
            "organizer": {
              "@type": "Organization",
              "@id": "https://chooseyourtherapist.in/#organization"
            },
            "performer": {
              "@type": "Person",
              "name": "Expert Psychologist"
            },
            "offers": {
              "@type": "Offer",
              "price": "299",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "validFrom": "2024-01-01"
            }
          })}
        </script>
      </Helmet>

      <main className="">
        {/* Navbar */}
        <MyNavbar />

        <main className="rbt-main-wrapper">
          {/* Homepage Sections */}
          <Banner />
          <ProcessSteps />
          <Services />
          <PromationalBanner />
          <ProfileCard />
          <Counter />
          <HomeWorkshop isWhite={false} />
          <Blogs />

          
         
          
          
          <CallToAction />
          <NewsLetter />

          {/* Payment Success Modal (Optional) */}
          {/* <PaymentSuccessModal open={showPopup} onClose={() => setShowPopup(false)} /> */}
        </main>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
