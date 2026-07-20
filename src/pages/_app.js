import "@/App.css";
import "@/index.css";
import "@/components/bottom-navigation.css";
import Providers from "@/components/Providers";
import PremiumLoader from "@/components/global/PremiumLoader";
import dynamic from "next/dynamic";
const CallbackWidget = dynamic(() => import("@/components/global/callback-widget"), { ssr: false });
const ActiveBookingBanner = dynamic(() => import("@/components/global/active-booking-banner"), { ssr: false });
import CookieConsent from "@/components/global/cookie-consent";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../utils/actions";
import { subscribeToNotifications } from "../utils/push-notifications";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Global error handler to suppress external widget errors (like Tawk.to)
    const handleError = (event) => {
      if (event.filename && (event.filename.includes('tawk.to') || event.filename.includes('twk-chunk'))) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.stack && event.reason.stack.includes('tawk.to')) {
        event.preventDefault();
      }
    });

    // Register service worker and subscribe to notifications
    // Skipped in development to avoid stale-cache reload flicker during HMR
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
            // Auto-subscribe after registration
            subscribeToNotifications();
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      } else {
        // Clean up any service worker registered during a previous dev session
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    }

    const noLoaderRoutes = [
      "/therapist-dashboard", "/appointments", "/clinic-patients",
      "/case-history", "/create-report", "/workshops", "/coupons",
      "/settings", "/create-workshop", "/add-offline-client",
      "/therapist-blogs", "/therapist-ai-blog", "/therapists/",
      "/coupon/", "/update-workshop/",
    ];
    const handleStart = (url) => {
      const skip = noLoaderRoutes.some((r) => url.startsWith(r));
      if (!skip) setIsLoading(true);
    };
    const handleComplete = () => setIsLoading(false);

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const hideWidgetsOn = [
    "/therapist-dashboard",
    "/appointments",
    "/clinic-patients",
    "/case-history",
    "/create-report",
    "/workshops",
    "/coupons",
    "/settings",
    "/create-workshop",
    "/add-offline-client",
    "/therapist-blogs",
    "/therapist-ai-blog",
    "/therapists/",
    "/coupon/",
    "/update-workshop/",
    "/intern-login",
    "/trainee-psychologist",
  ];

  const clientDashboardRoutes = [
    "/my-dashboard",
    "/my-bookings",
    "/my-therapists",
    "/my-workshop-bookings",
    "/my-settings",
    "/my-change-password",
  ];

  const isClientDashboard = clientDashboardRoutes.some(route => router.pathname.startsWith(route));
  const shouldHideWidgets = hideWidgetsOn.some(route => router.pathname.startsWith(route)) || isClientDashboard;

  // Site-wide schema — relatable therapy conditions & services people actually search for
  const globalConditionsSchema = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-anxiety",
      "name": "Anxiety",
      "alternateName": ["Anxiety Disorder", "Generalised Anxiety", "Social Anxiety", "Panic Attacks", "Nervousness", "Overthinking"],
      "description": "Anxiety is one of the most common mental health concerns in India. Symptoms include constant worry, restlessness, racing thoughts, panic attacks, and difficulty sleeping. A counselling or clinical psychologist can help using CBT, relaxation techniques, and mindfulness.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Cognitive Behavioural Therapy (CBT)" },
        { "@type": "MedicalTherapy", "name": "Mindfulness-Based Stress Reduction (MBSR)" },
        { "@type": "MedicalTherapy", "name": "Exposure Therapy" }
      ],
      "associatedAnatomy": { "@type": "AnatomicalSystem", "name": "Nervous System" },
      "recognizingAuthority": { "@type": "Organization", "name": "American Psychological Association" },
      "relevantSpecialty": "Counselling Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-depression",
      "name": "Depression",
      "alternateName": ["Major Depressive Disorder", "Sadness", "Low Mood", "Feeling Hopeless", "Emotional Breakdown", "Clinical Depression"],
      "description": "Depression causes persistent sadness, loss of interest, fatigue, and feelings of worthlessness. It affects millions in India and is highly treatable with the right psychologist. CBT, interpersonal therapy, and behavioural activation are proven approaches.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Cognitive Behavioural Therapy (CBT)" },
        { "@type": "MedicalTherapy", "name": "Interpersonal Therapy (IPT)" },
        { "@type": "MedicalTherapy", "name": "Behavioural Activation Therapy" }
      ],
      "relevantSpecialty": "Clinical Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-stress",
      "name": "Stress",
      "alternateName": ["Work Stress", "Burnout", "Academic Stress", "Exam Stress", "Job Stress", "Chronic Stress", "Overwhelm"],
      "description": "Stress from work pressure, exams, family responsibilities, or financial worries can affect physical and mental health. A psychologist helps identify stress triggers and teaches coping strategies, time management, and emotional regulation skills.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Stress Management Counselling" },
        { "@type": "MedicalTherapy", "name": "Mindfulness-Based Cognitive Therapy (MBCT)" },
        { "@type": "MedicalTherapy", "name": "Relaxation Training" }
      ],
      "relevantSpecialty": "Counselling Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-ocd",
      "name": "OCD",
      "alternateName": ["Obsessive Compulsive Disorder", "Obsessive Thoughts", "Compulsive Behaviour", "Intrusive Thoughts", "Rituals and Compulsions"],
      "description": "OCD involves unwanted intrusive thoughts (obsessions) followed by repetitive actions (compulsions) to reduce anxiety. The gold-standard treatment is Exposure and Response Prevention (ERP), delivered by a trained clinical psychologist.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Exposure and Response Prevention (ERP)" },
        { "@type": "MedicalTherapy", "name": "Cognitive Behavioural Therapy (CBT) for OCD" },
        { "@type": "MedicalTherapy", "name": "Acceptance and Commitment Therapy (ACT)" }
      ],
      "relevantSpecialty": "Clinical Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-trauma",
      "name": "Trauma",
      "alternateName": ["PTSD", "Post Traumatic Stress Disorder", "Emotional Trauma", "Childhood Trauma", "Abuse Survivor", "Flashbacks", "Nightmares"],
      "description": "Trauma and PTSD result from distressing experiences that continue to impact daily life. Symptoms include flashbacks, nightmares, emotional numbness, and hypervigilance. Trauma-focused CBT and EMDR are evidence-based treatments available through verified psychologists.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Trauma-Focused Cognitive Behavioural Therapy (TF-CBT)" },
        { "@type": "MedicalTherapy", "name": "Eye Movement Desensitisation and Reprocessing (EMDR)" },
        { "@type": "MedicalTherapy", "name": "Somatic Experiencing" }
      ],
      "relevantSpecialty": "Clinical Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-relationship",
      "name": "Relationship Problems",
      "alternateName": ["Couples Issues", "Marriage Problems", "Relationship Conflict", "Divorce Counselling", "Infidelity", "Communication Issues", "Breakup", "Extramarital Affair"],
      "description": "Relationship difficulties including communication breakdown, trust issues, infidelity, or constant fighting can be addressed through couples counselling. A relationship psychologist helps both partners understand each other and rebuild a healthier bond.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Couples Therapy" },
        { "@type": "MedicalTherapy", "name": "Gottman Method Couples Therapy" },
        { "@type": "MedicalTherapy", "name": "Emotionally Focused Therapy (EFT)" }
      ],
      "relevantSpecialty": "Counselling Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-adhd",
      "name": "ADHD",
      "alternateName": ["Attention Deficit Hyperactivity Disorder", "Hyperactivity in Children", "Inattentive Child", "Focus Problems", "Child Behaviour Issues"],
      "description": "ADHD causes difficulty in paying attention, impulsivity, and hyperactivity. It commonly affects children but can persist into adulthood. Clinical psychologists offer psychometric assessments for ADHD diagnosis and behavioural therapy for management.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Behavioural Therapy for ADHD" },
        { "@type": "MedicalTherapy", "name": "Psychometric Assessment" },
        { "@type": "MedicalTherapy", "name": "Parent Training and Guidance" }
      ],
      "relevantSpecialty": "Child and Adolescent Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-grief",
      "name": "Grief and Loss",
      "alternateName": ["Bereavement", "Loss of a Loved One", "Death of Family Member", "Emotional Loss", "Complicated Grief"],
      "description": "Grief is a natural response to loss, but when it becomes prolonged or debilitating, a counsellor can help. Grief counselling provides a safe space to process emotions, find meaning, and move toward healing.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Grief Counselling" },
        { "@type": "MedicalTherapy", "name": "Narrative Therapy" },
        { "@type": "MedicalTherapy", "name": "Meaning-Centred Therapy" }
      ],
      "relevantSpecialty": "Counselling Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-selfesteem",
      "name": "Low Self-Esteem",
      "alternateName": ["Self-Confidence Issues", "Negative Self-Image", "Body Image Issues", "Feeling Worthless", "Imposter Syndrome", "Self-Doubt"],
      "description": "Low self-esteem affects how people see themselves and interact with the world. It often underlies anxiety and depression. Counselling psychologists help build self-compassion, challenge negative beliefs, and develop a healthier self-image.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Cognitive Behavioural Therapy (CBT)" },
        { "@type": "MedicalTherapy", "name": "Self-Compassion Training" },
        { "@type": "MedicalTherapy", "name": "Schema Therapy" }
      ],
      "relevantSpecialty": "Counselling Psychology"
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "@id": "https://www.chooseyourtherapist.in#condition-phobia",
      "name": "Phobia",
      "alternateName": ["Fear", "Social Phobia", "Specific Phobia", "Agoraphobia", "Fear of Crowds", "Fear of Heights", "Stage Fright", "Public Speaking Anxiety"],
      "description": "Phobias are intense, irrational fears of specific situations or objects that interfere with daily life. They respond well to exposure-based therapies conducted by a trained psychologist in a safe, gradual manner.",
      "possibleTreatment": [
        { "@type": "MedicalTherapy", "name": "Systematic Desensitisation" },
        { "@type": "MedicalTherapy", "name": "Exposure Therapy" },
        { "@type": "MedicalTherapy", "name": "Virtual Reality Exposure Therapy" }
      ],
      "relevantSpecialty": "Clinical Psychology"
    }
  ];

  return (
    <Providers>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#228756" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />
        {/* Global Geo Tags - Defaulting to Noida, India to prevent US-based Googlebot/VPN detection sync issues */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Sector 51, Noida, Uttar Pradesh, India" />
        <meta name="geo.position" content="28.5672;77.3650" />
        <meta name="ICBM" content="28.5672, 77.3650" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* Global Conditions Schema — relatable therapy terms for GEO/AI engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalConditionsSchema) }}
        />
      </Head>
      {isLoading && !shouldHideWidgets && <PremiumLoader />}
      {!shouldHideWidgets && (
        <>
          <CallbackWidget />
          <ActiveBookingBanner />
        </>
      )}
      <CookieConsent />
      <div className="offcanvas-overlay" suppressHydrationWarning></div>
      <div className="wrapper" suppressHydrationWarning>
        <div className="main-wrapper" suppressHydrationWarning>
          <Component {...pageProps} />
        </div>
      </div>
    </Providers>
  );
}

export default MyApp;
