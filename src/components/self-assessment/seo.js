import { FREE_TESTS, TEST_BY_KEY } from "./tests";
import { fitTitle, fitDesc } from "../../utils/seo-text";

/* SEO for each assessment's own page (/self-assessment/<slug>): the URL slug, the page heading, the
   <title> and search keywords. Descriptions and FAQs are built from the test itself (tests.js). */

export const SITE = "https://www.chooseyourtherapist.in";

export const ASSESSMENT_SEO = {
  phq9: { slug: "phq-9-depression-test", h1: "PHQ-9 Depression Test", kw: ["PHQ-9 test online", "depression test India", "PHQ-9 score", "depression screening test", "PHQ-9 questionnaire"] },
  gad7: { slug: "gad-7-anxiety-test", h1: "GAD-7 Anxiety Test", kw: ["GAD-7 test online", "anxiety test India", "GAD-7 score", "anxiety screening test", "generalised anxiety disorder test"] },
  dass21: { slug: "dass-21-depression-anxiety-stress-test", h1: "DASS-21 Depression, Anxiety & Stress Test", kw: ["DASS-21 test online", "depression anxiety stress scale", "DASS-21 score", "stress test India"] },
  k10: { slug: "k10-psychological-distress-test", h1: "K10 Psychological Distress Test", kw: ["K10 test online", "Kessler psychological distress scale", "K10 score", "mental distress test"] },
  pcl5: { slug: "pcl-5-ptsd-test", h1: "PCL-5 PTSD Test", kw: ["PCL-5 test online", "PTSD test India", "PTSD checklist DSM-5", "trauma test"] },
  phq15: { slug: "phq-15-somatic-symptom-test", h1: "PHQ-15 Somatic Symptom Test", kw: ["PHQ-15 test online", "somatic symptom test", "physical symptoms of stress test"] },
  audit: { slug: "audit-alcohol-use-test", h1: "AUDIT Alcohol Use Test", kw: ["AUDIT test online", "alcohol use disorder test", "alcohol addiction test India", "AUDIT score"] },
  asrs: { slug: "asrs-adult-adhd-test", h1: "Adult ADHD Test (ASRS v1.1)", kw: ["adult ADHD test online", "ASRS v1.1 screener", "ADHD test India", "ADHD self-report scale"] },
  epds: { slug: "epds-postnatal-depression-test", h1: "EPDS Postnatal Depression Test", kw: ["postnatal depression test", "postpartum depression test India", "Edinburgh postnatal depression scale", "EPDS score"] },
  cbi: { slug: "burnout-test-cbi", h1: "Burnout Test (Copenhagen Burnout Inventory)", kw: ["burnout test online", "work burnout test India", "Copenhagen Burnout Inventory", "job burnout assessment"] },
  rses: { slug: "rosenberg-self-esteem-test", h1: "Rosenberg Self-Esteem Test", kw: ["self-esteem test online", "Rosenberg self-esteem scale", "self-esteem assessment India"] },
  bigfive: { slug: "big-five-personality-test", h1: "Big Five Personality Test (IPIP-50)", kw: ["Big Five personality test", "IPIP-50 test online", "OCEAN personality test", "personality assessment India"] },
};

export const slugOf = (key) => ASSESSMENT_SEO[key]?.slug || key;
export const pathOf = (key) => `/self-assessment/${slugOf(key)}`;
export const testBySlug = (slug) => {
  const key = Object.keys(ASSESSMENT_SEO).find((k) => ASSESSMENT_SEO[k].slug === slug);
  return key ? TEST_BY_KEY[key] : null;
};
export const ASSESSMENT_SLUGS = FREE_TESTS.map((t) => slugOf(t.key));

const minutes = (t) => String(t.time || "").replace(/^~\s*/, "");

export function seoOf(test) {
  const s = ASSESSMENT_SEO[test.key] || { h1: test.full, kw: [] };
  const n = test.questions.length;
  return {
    h1: s.h1,
    title: fitTitle(`${s.h1} Online`),
    description: fitDesc(`Take the ${test.short} online: ${n} questions, about ${minutes(test)}. Instant scored report, or take it with a verified psychologist who adds clinical notes.`),
    keywords: [...s.kw, `${test.short} report`, "mental health screening online", "screening test India"].join(", "),
    url: `${SITE}${pathOf(test.key)}`,
    image: `${SITE}/api/og/site.jpg?page=assessment&concern=${encodeURIComponent(`${test.title} (${test.short})`)}`, // "Depression Screening (PHQ-9)"
  };
}

export function faqOf(test) {
  const n = test.questions.length;
  return [
    [`How long does the ${test.short} take?`, `It has ${n} questions and takes about ${minutes(test)}. You answer online, at your own pace.`],
    [`Is the ${test.short} a diagnosis?`, `No. The ${test.short} is a validated questionnaire that measures how strong your symptoms are. A diagnosis needs a clinical assessment by a qualified professional — which you can add by taking it with a psychologist.`],
    ["What do I get if I take it on my own?", "An instant automatic report: your score worked out with the published scoring, your severity level and what it means, and the reference ranges from the test manual. You can view and download it straight away."],
    ["What does a psychologist add to the report?", "After going through your result with you in a session, they add a summary in simple words, their clinical observations, recommendations and next steps, a follow-up plan, a referral if needed, and their signature with their RCI / registration number."],
    [`Who developed the ${test.short}?`, `${test.by}. ${test.ref}`],
    ["Are my answers private?", "Yes. If you take it on your own, your answers and report are private to you. If you take it with a psychologist, they are shared only with that psychologist."],
  ];
}
