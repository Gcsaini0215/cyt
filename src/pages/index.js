import { Helmet } from "react-helmet-async"; // SEO ke liye
import Footer from "../components/footer";
import Banner from "../components/home/banner";
import Specializations from "../components/home/specializations";
import Blogs from "../components/home/blogs";
import CallToAction from "../components/home/call-to-action";
import Counter from "../components/home/counter";
import NewsLetter from "../components/home/newsletter";
import ProfileCard from "../components/home/profile-card";
import HomeWorkshop from "../components/home/workshops";
import FreeResources from "../components/home/free-resources";
import MyNavbar from "../components/navbar";
import BottomNavigation from "../components/bottom-navigation";

import Brands from "../components/about/brands";


export default function HomePage() {
  // const [showPopup, setShowPopup] = useState(false); // agar popup use karna ho

  return (
    <div style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Comprehensive SEO Meta Tags */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>Best Psychologist in India | Online & In-Person Therapy | Choose Your Therapist</title>
        <meta name="description" content="Connect with the best psychologists and therapists in India. Book online or in-person sessions with verified professionals for anxiety, stress, relationships, and emotional well-being." />
        <meta name="keywords" content="Best Psychologist India, Online Therapy India, In-Person Therapy, Mental Health Counseling, Verified Therapists, Anxiety Counseling, Stress Management, Relationship Therapy, Choose Your Therapist, Psychologists in Noida" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href="https://chooseyourtherapist.in/" />

        {/* Open Graph Meta Tags for Facebook / LinkedIn / WhatsApp */}
        <meta property="og:title" content="Best Psychologist in India | Online & In-Person Therapy" />
        <meta property="og:description" content="Connect with the best psychologists and therapists in India. Book online or in-person sessions with verified professionals." />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:url" content="https://chooseyourtherapist.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Psychologist in India | Online & In-Person Therapy" />
        <meta name="twitter:description" content="Connect with verified therapists in India for online or in-person support." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta name="twitter:site" content="@chooseyourtherapist" />

        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#228756" />
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
            "alternateName": "CYT - Best Psychologist in India",
            "url": "https://chooseyourtherapist.in",
            "logo": "https://i.postimg.cc/gj1yngrd/choose.png",
            "description": "Find a qualified psychologist anywhere in India. Book online or in-person therapy with verified professionals for anxiety, stress, relationships, and more.",
            "image": "https://i.postimg.cc/gj1yngrd/choose.png",
            "telephone": "+918077757951",
            "email": "support@chooseyourtherapist.in",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Sector 51",
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
              }
            ],
            "serviceType": ["Mental Health Counseling", "Online Therapy", "In-Person Therapy", "Psychological Support"],
            "priceRange": "₹500-₹2000"
          })}
        </script>
      </Helmet>

      <main className="">
        {/* Navbar */}
        <MyNavbar />

        <main className="rbt-main-wrapper">
          {/* Homepage Sections */}
          <Banner />
          <Specializations />
          <ProfileCard />
          <FreeResources />
          <HomeWorkshop isWhite={false} />
          <Counter />
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
