import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import { fetchData } from "../utils/actions";
import { getTherapistProfiles } from "../utils/url";
import Map from "../components/contact/map";
import LocalFaqs from "../components/home/local-faqs";

// Dynamic imports for performance
const Banner = dynamic(() => import("../components/home/banner"), { ssr: true });
const LocalPresence = dynamic(() => import("../components/home/local-presence"), { ssr: false });
const ProfileCard = dynamic(() => import("../components/home/profile-card"), { ssr: false });
const ProcessSteps = dynamic(() => import("../components/home/process-steps"), { ssr: false });
const ConsultationForm = dynamic(() => import("../components/home/consultation-form"), { ssr: false });

export default function LocalLandingPage() {
  const [topTherapists, setTopTherapists] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTopTherapists = useCallback(async () => {
    try {
      const res = await fetchData(getTherapistProfiles);
      const dataToProcess = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      
      if (dataToProcess && dataToProcess.length > 0) {
        // Filter therapists from Noida/Delhi (Uttar Pradesh & Delhi)
        const filtered = dataToProcess.filter(t => 
          (t.state && (t.state.toLowerCase() === "delhi" || t.state.toLowerCase() === "uttar pradesh" || t.state.toLowerCase() === "up"))
        );
        setTopTherapists(filtered.slice(0, 50));
      }
    } catch (error) {
      console.error("Error fetching therapists:", error);
    }
  }, []);

  useEffect(() => {
    getTopTherapists();
  }, [getTopTherapists]);

  return (
    <div style={{ overflowX: 'hidden', width: '100%' }}>
      <Head>
        <title>Best Psychologist in Noida & Delhi | Top Rated Therapists Near Me</title>
        <meta name="description" content="Connect with the best psychologists in Noida and Delhi at Choose Your Therapist. Verified mental health experts for anxiety, depression, and relationship therapy. Visit our Noida Studio or book online." />
        <meta name="keywords" content="Best Psychologist in Noida, Top Psychologist in Delhi, Mental Health Studio Noida, Anxiety Specialist Delhi NCR, Relationship Counseling Noida Sector 51, Psychologist near me Noida, Best Psychologist in Uttar Pradesh, clinical psychologist in Noida, therapist near me Delhi NCR, psychologist near Sector 50 Noida, therapy center near LPS Global School, counselor in Noida Sector 34" />
        
        {/* Local SEO Meta Tags */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Noida, Delhi" />
        <meta name="geo.position" content="28.5672;77.3650" />
        <meta name="ICBM" content="28.5672, 77.3650" />
        
        {/* OpenGraph / Social Media Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chooseyourtherapist.in/psychologist-in-noida-delhi" />
        <meta property="og:title" content="Best Psychologist in Noida & Delhi | Verified Experts" />
        <meta property="og:description" content="Professional therapy at our Noida Studio or online. Connect with top-rated psychologists in Delhi NCR." />
        <meta property="og:image" content="https://i.postimg.cc/jdcFhHKG/Whats-App-Image-2026-03-10-at-6-01-06-AM-1.jpg" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Psychologist in Noida & Delhi" />
        <meta name="twitter:description" content="Professional mental health support in Noida & Delhi. Book your session today." />
        <meta name="twitter:image" content="https://i.postimg.cc/jdcFhHKG/Whats-App-Image-2026-03-10-at-6-01-06-AM-1.jpg" />

        <link rel="canonical" href="https://chooseyourtherapist.in/psychologist-in-noida-delhi" />

        {/* Local Business & Medical WebPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              "name": "Psychologist Services in Noida & Delhi",
              "description": "Information about top-rated psychologists and mental health services in Noida and Delhi.",
              "lastReviewed": "2026-03-10",
              "reviewedBy": {
                "@type": "Organization",
                "name": "Choose Your Therapist LLP"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "HealthAndBeautyBusiness",
              "name": "Choose Your Therapist - Noida Studio",
              "image": "https://i.postimg.cc/jdcFhHKG/Whats-App-Image-2026-03-10-at-6-01-06-AM-1.jpg",
              "@id": "https://chooseyourtherapist.in/psychologist-in-noida-delhi",
              "url": "https://chooseyourtherapist.in/psychologist-in-noida-delhi",
              "telephone": "+918077757951",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "D-137, Sector 51",
                "addressLocality": "Noida",
                "addressRegion": "UP",
                "postalCode": "201301",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.5672,
                "longitude": 77.3650
              },
              "areaServed": ["Noida", "Delhi", "Gurgaon", "Ghaziabad"],
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://chooseyourtherapist.in"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Psychologist in Noida & Delhi",
                  "item": "https://chooseyourtherapist.in/psychologist-in-noida-delhi"
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Who is the best psychologist in Noida for anxiety and stress?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Choose Your Therapist connects you with top-rated psychologists in Noida specializing in anxiety and stress management. Our experts at the Noida Studio provide personalized evidence-based therapy."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you offer in-person therapy sessions in Noida Sector 51?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we offer professional in-person counseling at our Noida Studio located in Sector 51, near LPS Global School. Our center is easily accessible for residents of Noida Sector 50, Sector 34, Sector 72, and nearby locations."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I find a verified clinical psychologist in Delhi NCR?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our platform features a curated list of verified clinical psychologists across Delhi, Noida, and Gurgaon. You can review their profiles, specializations, and book sessions directly."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is the cost of a therapy session in Noida & Delhi?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Therapy costs vary based on the psychologist's experience and specialization. We offer transparent pricing with options for individual sessions, couple counseling, and student-friendly rates."
                  }
                }
              ]
            }
          ])}
        </script>
      </Head>

      <main className="rbt-main-wrapper">
        <MyNavbar />
        
        {/* Hero Section - Compact & SEO Optimized */}
        <div className="local-hero-bg" style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.55)), url("https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '40px 0',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="row align-items-center">
              <div className="col-lg-7" style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '4.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginBottom: '24px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  Best Psychologist in <br/> Noida & Delhi | Verified <br/> <span style={{ color: '#4ade80' }}>Mental Health Experts</span>
                </h1>
                <p style={{ fontSize: '1.8rem', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '40px', maxWidth: '800px', fontWeight: 500, lineHeight: 1.6 }}>
                  Professional therapy for anxiety, depression, and relationships. Connect with top-rated psychologists in Noida, Delhi NCR, or via Online sessions.
                </p>
                <div className="hero-btns-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                  <a href="#consultation" className="rbt-btn btn-gradient">Book Free Consultation</a>
                  <a href="/view-all-therapist" className="rbt-btn btn-white" style={{ border: 'none', background: '#ffffff', color: '#228756', fontWeight: '800' }}>Find Your Therapist</a>
                </div>
              </div>
              <div className="col-lg-5">
                <div id="consultation" style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  padding: '20px', 
                  borderRadius: '20px', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  transform: 'scale(0.9)',
                  transformOrigin: 'center'
                }}>
                  <ConsultationForm showHeading={false} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Clinic Section: Noida Center */}
        <div className="rbt-about-area bg-color-white rbt-section-gap">
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <div className="thumbnail" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}>
                  <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    loop={true}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    speed={1000}
                    className="clinic-image-slider"
                  >
                    {[
                      "https://i.postimg.cc/jdcFhHKG/Whats-App-Image-2026-03-10-at-6-01-06-AM-1.jpg",
                      "https://i.postimg.cc/zX7ckC8q/Whats-App-Image-2026-03-10-at-6-01-06-AM.jpg",
                    ].map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <img 
                          src={img} 
                          alt={`Best Psychologist Noida Center - Office View ${idx + 1}`} 
                          style={{ width: '100%', height: isMobile ? '350px' : '500px', objectFit: 'cover' }}
                        />
                      </SwiperSlide>
                    ))}
                    {/* 3rd Slide: Collage of all images */}
                    <SwiperSlide>
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '2px',
                        height: isMobile ? '350px' : '500px',
                        width: '100%',
                        background: '#f8fafc'
                      }}>
                        {[
                          "https://i.postimg.cc/jdcFhHKG/Whats-App-Image-2026-03-10-at-6-01-06-AM-1.jpg",
                          "https://i.postimg.cc/zX7ckC8q/Whats-App-Image-2026-03-10-at-6-01-06-AM.jpg",
                          "https://i.postimg.cc/VLgVFqmy/Whats-App-Image-2026-03-10-at-6-01-07-AM-1.jpg",
                          "https://i.postimg.cc/QxmyqQhx/Whats-App-Image-2026-03-10-at-6-01-07-AM.jpg",
                          "https://i.postimg.cc/02nBCYPb/Whats-App-Image-2026-03-10-at-6-01-12-AM.jpg",
                          "https://i.postimg.cc/5NgRmBby/Whats-App-Image-2026-03-10-at-6-01-08-AM.jpg",
                          "https://i.postimg.cc/ZKHML84W/Whats-App-Image-2026-03-10-at-6-01-13-AM.jpg",
                        ].map((img, idx) => (
                          <div key={idx} style={{ 
                            flex: '1 1 24%', // Show 4 items per row approximately
                            height: '49%',    // 2 rows approximately
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={img} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                filter: [1, 3, 5].includes(idx) ? 'grayscale(100%)' : 'none'
                              }} 
                              alt={`Mental Health Studio Noida - Therapy Room Collage ${idx}`} 
                            />
                          </div>
                        ))}
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="inner pl--50 pl_sm--0">
                  <div className="section-title text-start">
                    <span className="subtitle bg-primary-opacity">In-Person Therapy</span>
                    <h2 className="title" style={{ fontSize: '3rem', fontWeight: 800 }}>Visit Our <span className="theme-gradient">Noida Therapy Studio</span></h2>
                    <p className="description mt--20" style={{ fontSize: '1.2rem', lineHeight: 1.7, textAlign: 'left' }}>
                      Experience professional mental health support in a safe, confidential, and serene environment. Our Noida studio is designed to provide you with the comfort needed for deep healing and personal growth.
                    </p>
                    
                    <div className="clinic-details mt--30" style={{ background: '#f8fafc', padding: '25px', borderRadius: '15px', borderLeft: '5px solid #228756' }}>
                      <div className="d-flex align-items-start mb--15">
                        <i className="feather-map-pin mr--15" style={{ color: '#228756', fontSize: '20px', marginTop: '5px' }}></i>
                        <div>
                          <h5 style={{ marginBottom: '5px', fontWeight: 700 }}>Address</h5>
                          <p style={{ margin: 0 }}>D-137, Sector 51 (Near LPS Global School), Noida, Uttar Pradesh 201301. Serving Sector 50, 34, and nearby areas.</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-start">
                        <i className="feather-clock mr--15" style={{ color: '#228756', fontSize: '20px', marginTop: '5px' }}></i>
                        <div>
                          <h5 style={{ marginBottom: '5px', fontWeight: 700 }}>Working Hours</h5>
                          <p style={{ margin: 0 }}>Open 24/7 for Scheduled Appointments</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt--40">
                      <a href="#consultation" className="rbt-btn btn-gradient">Schedule In-Person Visit</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reusing shared sections but with local context provided by the page title/SEO */}
        <ProfileCard profiles={topTherapists} />

        {/* SEO Section: Localized Services Grid */}
        <div className="rbt-service-area bg-color-white rbt-section-gap">
          <div className="container">
            <div className="row mb--60">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <h2 className="title" style={{ fontSize: '3rem', fontWeight: 800 }}>Top Mental Health Services in <span className="theme-gradient">Noida & Delhi</span></h2>
                  <p className="description mt--20" style={{ fontSize: '1.2rem' }}>Comprehensive psychological support tailored for the Delhi-NCR community.</p>
                </div>
              </div>
            </div>
            <div className="row g-5">
              {[
                { 
                  title: "Anxiety & Stress Management", 
                  desc: "Specialized therapy for fast-paced urban lifestyles in Delhi and Noida. Overcome work-related stress and chronic anxiety.",
                  icon: "feather-wind",
                  color: "#228756"
                },
                { 
                  title: "Relationship & Couple Counseling", 
                  desc: "Helping couples in Noida and Delhi NCR navigate modern relationship challenges with expert guidance.",
                  icon: "feather-heart",
                  color: "#e11d48"
                },
                { 
                  title: "Depression & Mood Disorders", 
                  desc: "Compassionate care from the best psychologists in Delhi for those struggling with persistent sadness or low mood.",
                  icon: "feather-sun",
                  color: "#0ea5e9"
                },
                { 
                  title: "Child & Adolescent Therapy", 
                  desc: "Supporting the mental health of children and teens across top schools in Noida and Delhi.",
                  icon: "feather-user",
                  color: "#a855f7"
                }
              ].map((service, index) => (
                <div className="col-lg-3 col-md-6 col-sm-6 col-12" key={index}>
                  <div className="rbt-service-box style-1 text-center" style={{ 
                    padding: '40px 30px', 
                    height: '100%', 
                    border: '1px solid #f1f5f9', 
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                  }}>
                    <div className="icon" style={{ 
                      fontSize: '40px', 
                      color: service.color, 
                      marginBottom: '25px',
                      display: 'inline-block',
                      width: '80px',
                      height: '80px',
                      lineHeight: '80px',
                      background: `${service.color}10`,
                      borderRadius: '50%'
                    }}>
                      <i className={service.icon}></i>
                    </div>
                    <div className="content">
                      <h4 className="title" style={{ fontSize: isMobile ? '1.8rem' : '1.4rem', fontWeight: 700, marginBottom: '15px' }}>{service.title}</h4>
                      <p className="description" style={{ fontSize: isMobile ? '1.3rem' : '1rem', lineHeight: 1.6 }}>{service.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LocalFaqs />
        <Map />
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          h1 { font-size: 3.2rem !important; text-align: center; line-height: 1.1 !important; }
          p { text-align: center; margin: 0 auto 30px !important; font-size: 1.5rem !important; }
          .local-hero-bg { padding: 30px 0 !important; }
          .hero-btns-container { display: none !important; }
          .rbt-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
