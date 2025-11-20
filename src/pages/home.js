import { Helmet } from "react-helmet"; // SEO ke liye
import Footer from "../components/footer";
import Banner from "../components/home/banner";
import State from "../components/home/state";
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
import HorTherapistCards from "../components/home/HorTherapistCard";


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
        <meta property="og:image" content="https://chooseyourtherapist.in/og-image.jpg" />
        <meta property="og:url" content="https://chooseyourtherapist.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="India's Growing Network of Verified Therapists | Choose Your Therapist" />
        <meta name="twitter:description" content="Connect with trusted psychologists for affordable online and in-person therapy sessions. Expert mental health counseling and support." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/twitter-image.jpg" />
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

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Choose Your Therapist",
            "url": "https://chooseyourtherapist.in",
            "logo": "https://chooseyourtherapist.in/logo.png",
            "description": "India's growing network of verified therapists providing affordable online and in-person therapy sessions.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Noida",
              "addressRegion": "UP",
              "addressCountry": "IN"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-XXXXXXXXXX",
              "contactType": "customer service",
              "availableLanguage": "English"
            },
            "sameAs": [
              "https://www.facebook.com/chooseyourtherapist",
              "https://www.instagram.com/chooseyourtherapist",
              "https://www.linkedin.com/company/chooseyourtherapist"
            ],
            "serviceType": "Mental Health Counseling",
            "areaServed": "India",
            "priceRange": "₹500-₹2000"
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
      </Helmet>

      <main className="">
        {/* Navbar */}
        <MyNavbar />

        <main className="rbt-main-wrapper">
          {/* Homepage Sections */}
          <Banner />
          <HorTherapistCards/>
          <Services />
          <State />
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

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation />
      </main>
    </div>
  );
}
