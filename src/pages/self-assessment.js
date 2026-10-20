import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SelfAssessmentBanner from "../components/self-assessment/banner";
import AssessmentCards from "../components/self-assessment/assessment-cards";
import { FREE_TESTS, testFromParam } from "../components/self-assessment/tests";
import { pathOf, SITE as SITE_URL } from "../components/self-assessment/seo";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import { fetchData } from "../utils/actions";
import { apiUrl } from "../utils/url";
import dynamic from "next/dynamic";
const BookingPopup = dynamic(() => import("../components/global/booking-popup"), { ssr: false });

/* Clinical assessments: the list. Each test has its own page (/self-assessment/<slug>) where it is
   taken on its own (instant report) or with a psychologist. Old ?start=<key> links go to that page. */

const SITE = SITE_URL;
const PAGE_URL = `${SITE}/self-assessment`;
const TITLE = "Mental Health Screening Tests Online — PHQ-9, GAD-7, DASS-21 & More | CYT";
const DESC = "Standard mental health screening tools — PHQ-9, GAD-7, DASS-21, K10, PCL-5, EPDS, AUDIT, adult ADHD (ASRS), burnout, self-esteem and Big Five. For screening only, not a diagnosis. Take one online for an instant scored report, or with a verified psychologist.";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

const SCHEMA = [
  {
    "@context": "https://schema.org", "@type": "WebPage", "@id": `${PAGE_URL}#page`, "url": PAGE_URL, "name": TITLE, "description": DESC, "inLanguage": "en-IN",
    "isPartOf": { "@type": "WebSite", "name": "Choose Your Therapist", "url": SITE },
    "about": FREE_TESTS.map((t) => ({ "@type": "MedicalTest", "name": t.full, "description": t.blurb, "citation": t.ref, "url": `${SITE}${pathOf(t.key)}` })),
  },
  {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE },
      { "@type": "ListItem", "position": 2, "name": "Screening tools", "item": PAGE_URL },
    ],
  },
];

export default function SelfAssessment() {
  const router = useRouter();
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    fetchData(`${apiUrl}/assessment-pricing`).then((r) => setPrices(r?.data?.tests || {})).catch(() => setPrices({}));
  }, []);

  // ?start=<key> (old links, client dashboard, report page): go to that test's page
  useEffect(() => {
    if (!router.isReady) return;
    const t = testFromParam(router.query.start);
    if (!t) return;
    router.replace(`${pathOf(t.key)}${router.query.mode === "with" ? "?mode=with" : ""}`);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="__next">
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta name="keywords" content="clinical assessment India, psychological assessment online, PHQ-9 assessment, GAD-7 anxiety assessment, DASS-21 test, adult ADHD assessment, postnatal depression assessment, burnout assessment, psychologist report" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={PAGE_URL} />

        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="Mental health screening tests — for screening, not diagnosis" />
        <meta property="og:description" content={DESC} />
        <meta property="og:image" content={OG_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mental health screening tests — for screening, not diagnosis" />
        <meta name="twitter:description" content={DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      </Head>
      <MyNavbar />
      <SelfAssessmentBanner />
      <AssessmentCards prices={prices} />
      <BookingPopup delay={20000} showHeading={false} showLocation={false} showSource={false}
        title="Want to discuss your results?" note="Share a few details and a psychologist from our team will reach out on WhatsApp." sourceTag="Popup · Self-assessment" />
      <Footer />
    </div>
  );
}
