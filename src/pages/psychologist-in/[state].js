import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import NotFoundPage from "../notfound";

const ProfileCard = dynamic(() => import("../../components/home/profile-card"), { ssr: false });
const NewsLetter = dynamic(() => import("../../components/home/newsletter"), { ssr: false });

// ─── State config ────────────────────────────────────────────────────────────
const STATE_CONFIG = {
  "uttar-pradesh": {
    name: "Uttar Pradesh",
    filterValues: ["uttar pradesh", "up"],
    cities: ["Noida", "Lucknow", "Agra", "Kanpur", "Varanasi", "Allahabad", "Ghaziabad", "Meerut"],
    slug: "uttar-pradesh",
    geo: { lat: 26.8467, lng: 80.9462, region: "IN-UP" },
    description: "Find verified counselling psychologists and clinical psychologists across Uttar Pradesh — in Noida, Lucknow, Agra, Kanpur, and online. Book sessions for anxiety, depression, OCD, relationship issues, and more.",
    localKeywords: "psychologist in Noida, therapist in Lucknow, counsellor in Agra, psychologist in Kanpur, mental health UP, online therapy Uttar Pradesh",
    faqs: [
      {
        q: "Which are the best psychologists in Uttar Pradesh?",
        a: "Choose Your Therapist has verified counselling psychologists and clinical psychologists across Uttar Pradesh, including Noida, Lucknow, Agra, and Kanpur. You can filter by specialization and book online or in-person sessions."
      },
      {
        q: "Can I get online therapy in Uttar Pradesh?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions in addition to in-person consultations. This means you can access quality mental health support from anywhere in UP — including smaller cities and rural areas."
      },
      {
        q: "Is there a psychologist in Noida available for anxiety?",
        a: "Yes. Choose Your Therapist has multiple verified psychologists in Noida who specialize in anxiety, panic attacks, social anxiety, and stress. You can view their profiles, read reviews, and book a session directly."
      },
      {
        q: "What is the cost of therapy in Uttar Pradesh?",
        a: "Therapy sessions with psychologists in Uttar Pradesh on Choose Your Therapist start from ₹500 per session. Fees vary by therapist experience and specialization. Online sessions are generally more affordable than in-person visits."
      }
    ]
  },
  "delhi": {
    name: "Delhi",
    filterValues: ["delhi", "new delhi", "ncr"],
    cities: ["New Delhi", "South Delhi", "North Delhi", "West Delhi", "Dwarka", "Rohini", "Saket", "Lajpat Nagar"],
    slug: "delhi",
    geo: { lat: 28.6139, lng: 77.2090, region: "IN-DL" },
    description: "Connect with verified psychologists in Delhi for anxiety, depression, OCD, trauma, and relationship counselling. Book online or in-person sessions with top-rated mental health professionals across Delhi.",
    localKeywords: "psychologist in Delhi, therapist in South Delhi, counsellor in Dwarka, psychologist in Saket, mental health Delhi, online therapy Delhi NCR",
    faqs: [
      {
        q: "Who are the best psychologists in Delhi?",
        a: "Choose Your Therapist has a curated network of verified counselling psychologists and clinical psychologists across Delhi. All professionals are degree-verified and experienced in evidence-based therapies like CBT, DBT, and ERP."
      },
      {
        q: "Can I find a clinical psychologist in Delhi for OCD?",
        a: "Yes. Clinical psychologists on Choose Your Therapist in Delhi are trained in Exposure and Response Prevention (ERP), the gold-standard treatment for OCD. You can filter therapists by specialization to find an OCD specialist in Delhi."
      },
      {
        q: "Is couples counselling available in Delhi?",
        a: "Yes. Multiple verified relationship counsellors and couples therapists are available in Delhi through Choose Your Therapist. Both online and in-person sessions are available for couples dealing with communication issues, trust problems, or relationship conflict."
      },
      {
        q: "What is the fee for a psychologist in Delhi?",
        a: "Therapy fees in Delhi range from ₹800 to ₹3000 per session depending on the psychologist's experience and specialization. Choose Your Therapist shows transparent pricing on every therapist profile so you can choose what fits your budget."
      }
    ]
  },
  "maharashtra": {
    name: "Maharashtra",
    filterValues: ["maharashtra"],
    cities: ["Mumbai", "Pune", "Nashik", "Nagpur", "Aurangabad", "Thane"],
    slug: "maharashtra",
    geo: { lat: 19.7515, lng: 75.7139, region: "IN-MH" },
    description: "Find verified psychologists in Maharashtra — Mumbai, Pune, Nagpur and beyond. Book online or in-person therapy sessions for anxiety, depression, relationship issues, OCD, and more.",
    localKeywords: "psychologist in Mumbai, therapist in Pune, counsellor in Nagpur, mental health Maharashtra, online therapy Mumbai, psychologist near me Mumbai",
    faqs: [
      {
        q: "Which are the best psychologists in Mumbai?",
        a: "Choose Your Therapist has verified counselling psychologists and clinical psychologists in Mumbai and across Maharashtra. Browse profiles by specialization — anxiety, depression, OCD, couples therapy — and book online or in-person sessions."
      },
      {
        q: "Is online therapy available in Pune?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions. If you are in Pune, you can book a session with any therapist on our platform — from Maharashtra or anywhere in India."
      },
      {
        q: "Can I find a child psychologist in Maharashtra?",
        a: "Yes. Choose Your Therapist has child psychologists and special educators in Maharashtra who work with children facing ADHD, anxiety, learning disabilities, autism spectrum disorder, and behavioural issues."
      },
      {
        q: "What does a therapy session cost in Mumbai?",
        a: "Therapy sessions in Mumbai on Choose Your Therapist range from ₹800 to ₹3000 per session. Online sessions are generally more affordable. All pricing is transparent and displayed on each therapist's profile."
      }
    ]
  },
  "rajasthan": {
    name: "Rajasthan",
    filterValues: ["rajasthan"],
    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    slug: "rajasthan",
    geo: { lat: 27.0238, lng: 74.2179, region: "IN-RJ" },
    description: "Find verified psychologists in Rajasthan — in Jaipur, Jodhpur, Udaipur, Kota, and online. Book therapy sessions for anxiety, depression, relationship counselling, stress management, and more.",
    localKeywords: "psychologist in Jaipur, therapist in Jodhpur, counsellor in Udaipur, mental health Rajasthan, online therapy Jaipur, best psychologist Kota",
    faqs: [
      {
        q: "Are there verified psychologists in Jaipur?",
        a: "Yes. Choose Your Therapist has verified counselling psychologists and therapists in Jaipur and across Rajasthan. You can browse profiles, check specializations, read reviews, and book sessions online or in-person."
      },
      {
        q: "Can students in Kota access mental health support?",
        a: "Absolutely. Choose Your Therapist provides online therapy sessions that students in Kota can access from their room. We have psychologists who specialize in academic stress, exam anxiety, burnout, and student mental health."
      },
      {
        q: "Is online counselling available across Rajasthan?",
        a: "Yes. Our online therapy sessions are accessible from any city in Rajasthan — Jaipur, Jodhpur, Udaipur, Kota, Ajmer, Bikaner, or any smaller town with internet access."
      },
      {
        q: "What is the cost of therapy in Rajasthan?",
        a: "Sessions with psychologists in Rajasthan start from ₹500 per session on Choose Your Therapist. Online sessions are affordable and flexible. All fees are clearly shown on each therapist's profile."
      }
    ]
  },
  "gujarat": {
    name: "Gujarat",
    filterValues: ["gujarat"],
    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
    slug: "gujarat",
    geo: { lat: 22.2587, lng: 71.1924, region: "IN-GJ" },
    description: "Find verified psychologists in Gujarat — in Ahmedabad, Surat, Vadodara, Rajkot, and online. Book therapy sessions for anxiety, depression, OCD, stress, relationship issues, and more.",
    localKeywords: "psychologist in Ahmedabad, therapist in Surat, counsellor in Vadodara, mental health Gujarat, online therapy Ahmedabad, best psychologist Gujarat",
    faqs: [
      {
        q: "Who are the best psychologists in Ahmedabad?",
        a: "Choose Your Therapist has verified counselling and clinical psychologists in Ahmedabad and across Gujarat. Browse therapist profiles, check their specializations and reviews, and book a session that fits your schedule."
      },
      {
        q: "Can I get therapy in Gujarati language?",
        a: "Some therapists on our platform are comfortable communicating in Gujarati. You can check the 'languages spoken' filter on our therapist directory to find a Gujarati-speaking psychologist."
      },
      {
        q: "Is online therapy available in Gujarat?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions — accessible from Ahmedabad, Surat, Vadodara, Rajkot, or any other city in Gujarat."
      },
      {
        q: "What does therapy cost in Gujarat?",
        a: "Therapy sessions with psychologists in Gujarat on Choose Your Therapist start from ₹500 per session. Fees vary by experience and specialization, and are transparently shown on each therapist's profile."
      }
    ]
  },
  "chandigarh": {
    name: "Chandigarh",
    filterValues: ["chandigarh"],
    cities: ["Chandigarh", "Mohali", "Panchkula"],
    slug: "chandigarh",
    geo: { lat: 30.7333, lng: 76.7794, region: "IN-CH" },
    description: "Find verified psychologists in Chandigarh, Mohali, and Panchkula. Book online or in-person therapy sessions for anxiety, depression, stress, relationship counselling, OCD, and more.",
    localKeywords: "psychologist in Chandigarh, therapist in Mohali, counsellor in Panchkula, mental health Chandigarh, online therapy Chandigarh, best psychologist Chandigarh",
    faqs: [
      {
        q: "Are there psychologists available in Chandigarh?",
        a: "Yes. Choose Your Therapist has verified counselling psychologists and clinical psychologists in Chandigarh and the tricity area (Mohali, Panchkula). Browse profiles and book online or in-person sessions."
      },
      {
        q: "Can I get couples therapy in Chandigarh?",
        a: "Yes. Relationship counsellors and couples therapists on Choose Your Therapist in Chandigarh are available for both online and in-person sessions to help with communication issues, trust, and relationship conflicts."
      },
      {
        q: "Is online therapy available in Chandigarh?",
        a: "Yes. All psychologists on Choose Your Therapist offer secure online video sessions accessible from Chandigarh, Mohali, Panchkula, or anywhere in the tricity area."
      },
      {
        q: "What is the therapy session cost in Chandigarh?",
        a: "Therapy sessions with psychologists in Chandigarh on Choose Your Therapist start from ₹600 per session. All pricing is transparent and shown on each therapist's profile before you book."
      }
    ]
  },
  "uttarakhand": {
    name: "Uttarakhand",
    filterValues: ["uttarakhand"],
    cities: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Roorkee", "Haldwani"],
    slug: "uttarakhand",
    geo: { lat: 30.0668, lng: 79.0193, region: "IN-UT" },
    description: "Find verified psychologists in Uttarakhand — Dehradun, Haridwar, Rishikesh, and online. Book therapy sessions for anxiety, depression, stress, OCD, and relationship counselling.",
    localKeywords: "psychologist in Dehradun, therapist in Haridwar, counsellor in Rishikesh, mental health Uttarakhand, online therapy Dehradun",
    faqs: [
      {
        q: "Are there psychologists available in Dehradun?",
        a: "Yes. Choose Your Therapist has verified psychologists in Dehradun and across Uttarakhand. You can book in-person or online sessions for anxiety, depression, stress, and other mental health concerns."
      },
      {
        q: "Can I access therapy from Rishikesh or Haridwar?",
        a: "Yes. Online therapy on Choose Your Therapist is accessible from anywhere in Uttarakhand — including Rishikesh, Haridwar, Nainital, and smaller towns. You only need a smartphone and internet connection."
      },
      {
        q: "Is online counselling available in Uttarakhand?",
        a: "Yes. All therapists on our platform offer online video sessions, making quality mental health support accessible across Uttarakhand regardless of your location."
      },
      {
        q: "What is the cost of therapy in Uttarakhand?",
        a: "Sessions with psychologists in Uttarakhand on Choose Your Therapist start from ₹500. Online sessions are flexible and affordable. Fees are displayed clearly on every therapist's profile."
      }
    ]
  },
  "west-bengal": {
    name: "West Bengal",
    filterValues: ["west bengal"],
    cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"],
    slug: "west-bengal",
    geo: { lat: 22.9868, lng: 87.8550, region: "IN-WB" },
    description: "Find verified psychologists in West Bengal — Kolkata, Howrah, Siliguri, and online. Book therapy sessions for anxiety, depression, OCD, relationship counselling, and stress management.",
    localKeywords: "psychologist in Kolkata, therapist in Howrah, counsellor in Siliguri, mental health West Bengal, online therapy Kolkata, best psychologist Kolkata",
    faqs: [
      {
        q: "Who are the best psychologists in Kolkata?",
        a: "Choose Your Therapist has verified counselling psychologists and clinical psychologists in Kolkata and across West Bengal. Browse their profiles, check specializations and reviews, and book a session."
      },
      {
        q: "Is Bengali-language therapy available?",
        a: "Some therapists on our platform are comfortable in Bengali. Use the 'languages spoken' filter on the therapist directory to find a Bengali-speaking psychologist for your sessions."
      },
      {
        q: "Can I get online therapy from Kolkata?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions — accessible from Kolkata, Howrah, Siliguri, or anywhere in West Bengal."
      },
      {
        q: "What does a therapy session cost in Kolkata?",
        a: "Therapy with psychologists in Kolkata on Choose Your Therapist starts from ₹500 per session. All fees are transparent and shown on each therapist's profile before booking."
      }
    ]
  },
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    filterValues: ["andhra pradesh"],
    cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
    slug: "andhra-pradesh",
    geo: { lat: 15.9129, lng: 79.7400, region: "IN-AP" },
    description: "Find verified psychologists in Andhra Pradesh — Visakhapatnam, Vijayawada, Tirupati, and online. Book therapy sessions for anxiety, depression, OCD, relationship counselling, and more.",
    localKeywords: "psychologist in Visakhapatnam, therapist in Vijayawada, counsellor in Tirupati, mental health Andhra Pradesh, online therapy Andhra Pradesh",
    faqs: [
      {
        q: "Are there verified psychologists in Andhra Pradesh?",
        a: "Yes. Choose Your Therapist has verified counselling psychologists and clinical psychologists in Andhra Pradesh. Browse profiles by specialization and book online or in-person sessions."
      },
      {
        q: "Is Telugu-language therapy available?",
        a: "Some therapists on our platform are comfortable communicating in Telugu. Use the 'languages spoken' filter on the therapist directory to find a Telugu-speaking psychologist."
      },
      {
        q: "Can I access online therapy from Andhra Pradesh?",
        a: "Yes. All therapists on Choose Your Therapist offer secure online video sessions accessible from Visakhapatnam, Vijayawada, Tirupati, Guntur, or anywhere in Andhra Pradesh."
      },
      {
        q: "What is the cost of therapy in Andhra Pradesh?",
        a: "Therapy sessions in Andhra Pradesh on Choose Your Therapist start from ₹500 per session. Fees vary by therapist and are displayed on their profiles."
      }
    ]
  }
};

// ─── Services shown on every page ───────────────────────────────────────────
const SERVICES = [
  { title: "Anxiety & Stress", desc: "Evidence-based therapy for worry, panic attacks, and chronic stress.", icon: "feather-wind", color: "#228756" },
  { title: "Depression", desc: "Professional support to overcome persistent low mood and hopelessness.", icon: "feather-sun", color: "#0ea5e9" },
  { title: "OCD", desc: "ERP — the gold-standard treatment for obsessive-compulsive disorder.", icon: "feather-refresh-cw", color: "#7c3aed" },
  { title: "Trauma & PTSD", desc: "Trauma-focused CBT and EMDR for healing from past painful experiences.", icon: "feather-shield", color: "#dc2626" },
  { title: "Relationship Issues", desc: "Couples counselling and individual therapy for relationship challenges.", icon: "feather-heart", color: "#e11d48" },
  { title: "Child & Adolescent", desc: "Therapy for ADHD, autism, anxiety, and behavioural issues in children.", icon: "feather-user", color: "#b45309" },
];

// ─── Page component ──────────────────────────────────────────────────────────
export default function StatePsychologistPage() {
  const router = useRouter();
  const { state: stateSlug } = router.query;

  const config = stateSlug ? STATE_CONFIG[stateSlug] : null;

  const [therapists, setTherapists] = useState([]);

  const fetchTherapists = useCallback(async () => {
    if (!config) return;
    try {
      const res = await fetchData(getTherapistProfiles);
      const all = (res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const filtered = all.filter(t => {
        const s = (t.state || "").toLowerCase();
        return config.filterValues.some(v => s.includes(v));
      });
      setTherapists(filtered);
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  if (router.isFallback) return null;
  if (stateSlug && !config) return <NotFoundPage />;
  if (!config) return null;

  const PAGE_URL = `https://www.chooseyourtherapist.in/psychologist-in/${config.slug}`;
  const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

  // ── Schema ────────────────────────────────────────────────────────────────
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${PAGE_URL}#business`,
    "name": `Choose Your Therapist — Psychologists in ${config.name}`,
    "description": config.description,
    "url": PAGE_URL,
    "telephone": "+91-8077757951",
    "email": "hello@chooseyourtherapist.in",
    "medicalSpecialty": ["Counselling Psychology", "Clinical Psychology", "Child Psychology", "Relationship Counselling"],
    "areaServed": [
      { "@type": "State", "name": config.name },
      ...config.cities.map(c => ({ "@type": "City", "name": c }))
    ],
    "availableService": SERVICES.map(s => ({ "@type": "MedicalTherapy", "name": s.title, "description": s.desc })),
    "address": { "@type": "PostalAddress", "addressRegion": config.name, "addressCountry": "IN" },
    "geo": { "@type": "GeoCoordinates", "latitude": config.geo.lat, "longitude": config.geo.lng },
    "parentOrganization": {
      "@type": "MedicalOrganization",
      "@id": "https://www.chooseyourtherapist.in#organization",
      "name": "Choose Your Therapist"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
      { "@type": "ListItem", "position": 2, "name": "Find a Psychologist", "item": "https://www.chooseyourtherapist.in/view-all-therapist" },
      { "@type": "ListItem", "position": 3, "name": `Psychologist in ${config.name}`, "item": PAGE_URL }
    ]
  };

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      <Head>
        <title>Best Psychologist in {config.name} | Verified Therapists | Choose Your Therapist</title>
        <meta name="description" content={config.description} />
        <meta name="keywords" content={config.localKeywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />

        <meta name="geo.region" content={config.geo.region} />
        <meta name="geo.placename" content={config.name} />
        <meta name="geo.position" content={`${config.geo.lat};${config.geo.lng}`} />
        <meta name="ICBM" content={`${config.geo.lat}, ${config.geo.lng}`} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content={`Best Psychologist in ${config.name} | Choose Your Therapist`} />
        <meta property="og:description" content={config.description} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Best Psychologist in ${config.name} | Choose Your Therapist`} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:site" content="@CYT_India" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <MyNavbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        padding: "64px 0 72px", position: "relative", overflow: "hidden"
      }}>
        {/* decorative circle */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none"
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              {/* breadcrumb */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                <a href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", textDecoration: "none" }}>Home</a>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>›</span>
                <a href="/view-all-therapist" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", textDecoration: "none" }}>Find a Psychologist</a>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>›</span>
                <span style={{ color: "#4ade80", fontSize: "13px", fontWeight: 700 }}>{config.name}</span>
              </div>

              <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: "20px" }}>
                Best Psychologist in{" "}
                <span style={{ color: "#4ade80" }}>{config.name}</span>
              </h1>
              <p style={{ fontSize: "1.6rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "600px" }}>
                {config.description}
              </p>

              {/* city pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "36px" }}>
                {config.cities.map(city => (
                  <span key={city} style={{
                    padding: "6px 14px", borderRadius: "50px", fontSize: "13px", fontWeight: 600,
                    background: "rgba(255,255,255,0.12)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}>{city}</span>
                ))}
              </div>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <a href="/view-all-therapist" style={{
                  padding: "14px 28px", borderRadius: "50px",
                  background: "#4ade80", color: "#064e3b",
                  fontWeight: 800, fontSize: "15px", textDecoration: "none"
                }}>
                  Browse Psychologists
                </a>
                <a href="/view-all-therapist" style={{
                  padding: "14px 28px", borderRadius: "50px",
                  background: "rgba(255,255,255,0.12)", color: "#fff",
                  fontWeight: 700, fontSize: "15px", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.25)"
                }}>
                  Book Online Session
                </a>
              </div>
            </div>

            {/* Stats card */}
            <div className="col-lg-5">
              <div style={{
                background: "rgba(255,255,255,0.08)", borderRadius: "20px",
                padding: "32px", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)"
              }}>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "18px", marginBottom: "24px" }}>
                  Psychologists in {config.name}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {[
                    { label: "Verified Therapists", value: therapists.length || "10+" },
                    { label: "Avg. Rating", value: "4.8 ★" },
                    { label: "Session Types", value: "Online + In-Person" },
                    { label: "Starting From", value: "₹500/session" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.1)", borderRadius: "12px",
                      padding: "16px", textAlign: "center"
                    }}>
                      <div style={{ color: "#4ade80", fontWeight: 900, fontSize: "20px", marginBottom: "4px" }}>{s.value}</div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Services grid ─────────────────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", padding: "72px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1e293b", marginBottom: "12px" }}>
              Therapy Services Available in {config.name}
            </h2>
            <p style={{ color: "#64748b", fontSize: "17px" }}>
              All services available online — book from anywhere in {config.name}
            </p>
          </div>
          <div className="row g-4">
            {SERVICES.map((s, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div style={{
                  background: "#fff", borderRadius: "16px", padding: "28px",
                  border: "1px solid #f1f5f9", height: "100%",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.2s"
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: `${s.color}15`, display: "flex",
                    alignItems: "center", justifyContent: "center", marginBottom: "16px"
                  }}>
                    <i className={s.icon} style={{ color: s.color, fontSize: "20px" }} />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Therapist cards ───────────────────────────────────────────────── */}
      <div style={{ background: "#fff", padding: "72px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1e293b", marginBottom: "12px" }}>
              Verified Psychologists in {config.name}
            </h2>
            <p style={{ color: "#64748b", fontSize: "17px" }}>
              All therapists are degree-verified and experienced in evidence-based therapy
            </p>
          </div>
          {therapists.length > 0
            ? <ProfileCard profiles={therapists} />
            : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ color: "#64748b", fontSize: "17px", marginBottom: "24px" }}>
                  Online therapists available for {config.name} residents
                </p>
                <a href="/view-all-therapist" style={{
                  padding: "14px 32px", borderRadius: "50px",
                  background: "#228756", color: "#fff",
                  fontWeight: 700, fontSize: "15px", textDecoration: "none"
                }}>
                  View All Therapists
                </a>
              </div>
            )
          }
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", padding: "72px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1e293b", marginBottom: "12px" }}>
              Common Questions About Therapy in {config.name}
            </h2>
          </div>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {config.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>

      <NewsLetter />
      <Footer />
    </div>
  );
}

// Simple inline FAQ accordion
function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{
      marginBottom: "12px", borderRadius: "14px", overflow: "hidden",
      border: "1px solid #e2e8f0", background: "#fff",
      boxShadow: open ? "0 4px 20px rgba(34,135,86,0.08)" : "none"
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "20px 24px",
        background: "none", border: "none", textAlign: "left",
        cursor: "pointer", color: open ? "#228756" : "#1e293b"
      }}>
        <span style={{ fontSize: "16px", fontWeight: 700, paddingRight: "16px" }}>{q}</span>
        <span style={{
          fontSize: "20px", transform: open ? "rotate(45deg)" : "rotate(0)",
          transition: "transform 0.2s", flexShrink: 0, color: open ? "#228756" : "#94a3b8"
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 20px", color: "#64748b", fontSize: "15px", lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}
