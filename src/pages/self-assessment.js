import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import SelfAssessmentBanner from "../components/self-assessment/banner";
import AssessmentCards, { assessments } from "../components/self-assessment/assessment-cards";
import AssessmentForm from "../components/self-assessment/assessment-form";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import { isAuthenticated } from "../utils/jwt";

/* The cards are public (and indexed); taking a check needs an account, so the result can be
   saved to the client's history. A logged-out visitor is sent to /login and comes back to
   /self-assessment?start=<id>, which opens that check straight away. */

const SITE = "https://www.chooseyourtherapist.in";
const PAGE_URL = `${SITE}/self-assessment`;
const TITLE = "Free Mental Health Self Assessment — PHQ-9, GAD-7, PCL-5 | CYT";
const DESC = "Take free, standard mental-health self-checks used by psychologists — PHQ-9 (depression), GAD-7 (anxiety), sleep, PCL-5 (trauma) and a Big Five personality profile. Clear results, saved privately.";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

const SCHEMA = [
  {
    "@context": "https://schema.org", "@type": "WebPage", "@id": `${PAGE_URL}#page`, "url": PAGE_URL, "name": TITLE, "description": DESC, "inLanguage": "en-IN",
    "isPartOf": { "@type": "WebSite", "name": "Choose Your Therapist", "url": SITE },
    "about": [
      { "@type": "MedicalTest", "name": "PHQ-9 depression screening", "usedToDiagnose": { "@type": "MedicalCondition", "name": "Depression" } },
      { "@type": "MedicalTest", "name": "GAD-7 anxiety screening", "usedToDiagnose": { "@type": "MedicalCondition", "name": "Generalized anxiety disorder" } },
      { "@type": "MedicalTest", "name": "PCL-5 PTSD checklist", "usedToDiagnose": { "@type": "MedicalCondition", "name": "Post-traumatic stress disorder" } },
    ],
  },
  {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE },
      { "@type": "ListItem", "position": 2, "name": "Self Assessment", "item": PAGE_URL },
    ],
  },
];

export default function SelfAssessment() {
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [gate, setGate] = useState(null); // the check a logged-out visitor tried to start

  const open = (id) => {
    setSelectedAssessment(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSelectAssessment = (id) => {
    if (!isAuthenticated()) { setGate(id); return; }
    open(id);
  };

  // back from login with ?start=<id>: open that check (and tidy the URL)
  useEffect(() => {
    if (!router.isReady) return;
    const id = Number(router.query.start);
    if (!id || !assessments.some((a) => a.id === id)) return;
    router.replace("/self-assessment", undefined, { shallow: true, scroll: false });
    if (isAuthenticated()) open(id); else setGate(id);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!gate) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setGate(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gate]);

  const gated = assessments.find((a) => a.id === gate);
  const next = encodeURIComponent(`/self-assessment?start=${gate}`);

  return (
    <div id="__next">
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta name="keywords" content="mental health self assessment, PHQ-9 test online, GAD-7 anxiety test, depression test India, PCL-5 PTSD test, sleep check, Big Five personality test, psychologist India" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={PAGE_URL} />

        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="Free Mental Health Self Assessment — standard tools used by psychologists" />
        <meta property="og:description" content={DESC} />
        <meta property="og:image" content={OG_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Mental Health Self Assessment — standard tools used by psychologists" />
        <meta name="twitter:description" content={DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: GATE_CSS }} />
      <MyNavbar />
      <SelfAssessmentBanner />

      {selectedAssessment ? (
        <AssessmentForm assessmentId={selectedAssessment} onBack={() => setSelectedAssessment(null)} />
      ) : (
        <AssessmentCards onSelectAssessment={handleSelectAssessment} />
      )}

      {gated && (
        <div className="sag-wrap" onClick={(e) => { if (e.target === e.currentTarget) setGate(null); }}>
          <div className="sag" role="dialog" aria-modal="true" aria-labelledby="sag-h">
            <button type="button" className="sag-x" onClick={() => setGate(null)} aria-label="Close">×</button>
            <span className="sag-ic" aria-hidden="true">🔒</span>
            <h2 id="sag-h">Log in to take the {gated.title}</h2>
            <p>It takes a few seconds with just your email. We save your result privately so you can see how you&apos;re doing over time — and share it with your psychologist if you want to.</p>
            <ul>
              <li>✓ Only your score is saved, never your answers</li>
              <li>✓ Your history in <b>My therapy room → My check-ins</b></li>
              <li>✓ Free, no payment needed</li>
            </ul>
            <Link href={`/login?next=${next}`} className="sag-btn">Log in to continue</Link>
            <Link href={`/register?next=${next}`} className="sag-link">New here? Create a free account</Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const GATE_CSS = `
.sag-wrap { position: fixed; inset: 0; z-index: 2000; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; animation: sagFade .18s ease; }
@keyframes sagFade { from { opacity: 0; } to { opacity: 1; } }
.sag { position: relative; width: min(440px, 100%); background: #fff; border-radius: 20px; padding: 26px 22px 20px; text-align: center; box-shadow: 0 30px 70px -20px rgba(0,0,0,.4); }
.sag-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.sag-ic { width: 54px; height: 54px; border-radius: 16px; background: #e7f6ec; display: grid; place-items: center; margin: 0 auto 10px; font-size: 24px; }
.sag h2 { margin: 0; font-size: 20px; font-weight: 800; color: #173c2a; line-height: 1.3; font-family: inherit; }
.sag p { margin: 8px 0 0; font-size: 14px; line-height: 1.6; color: #4b5b53; }
.sag ul { list-style: none; margin: 14px 0 0; padding: 12px 14px; background: #f6faf7; border-radius: 12px; text-align: left; }
.sag li { font-size: 13px; color: #1f6b45; font-weight: 600; padding: 3px 0; }
.sag-btn { display: block; margin-top: 16px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; font-weight: 800; font-size: 15px; text-decoration: none !important; }
.sag-link { display: block; margin-top: 10px; font-size: 13.5px; font-weight: 700; color: #1f6b45 !important; }
@media (max-width: 560px) { .sag-wrap { place-items: end center; padding: 0; } .sag { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)); } }
`;
