import IntentPage from "../components/seo/intent-page";
import { loadDirectory, statsFor, cards, isClinical } from "../utils/intent-data";

// "clinical psychologist" — the highest-interest psychologist search in India (Google Trends, Nov 2026).
const PAGE = {
  path: "/clinical-psychologist",
  title: "Clinical Psychologist Online & In Person",
  crumb: "Clinical psychologist",
  schemaName: "Clinical psychologists — online and in person in India",
  eyebrow: "Verified clinical psychologists · online & in person",
  h1: ["Clinical", "psychologist"],
  description: "Book a verified clinical psychologist online or in person — for anxiety, depression, OCD, trauma and psychological assessment. See qualifications, fees and reviews.",
  countLabel: "clinical psychologists",
  listTitle: "Clinical psychologists on Choose Your Therapist",
  listIntro: "Clinical psychologists in India complete RCI-recognised clinical training after a master's in psychology. Each profile shows their qualifications, what they work with, languages and fee.",
  moreHref: "/view-all-therapist",
  moreText: "See all psychologists",
  leadTag: "Clinical psychologist",
  leadTitle: "Not sure if you need a clinical psychologist?",
  waText: "Hi, I'm looking for a clinical psychologist.",
  factsTitle: "Quick facts: clinical psychologists",
  facts: (s) => [
    s.count ? `${s.count} verified clinical psychologists on Choose Your Therapist${s.inPerson ? `, ${s.inPerson} of them also in person` : ""}; all offer online sessions across India.` : null,
    "A clinical psychologist in India has a master's in psychology plus RCI-recognised clinical training (such as an M.Phil in Clinical Psychology) and is registered with the Rehabilitation Council of India.",
    "Clinical psychologists do psychological assessment, diagnosis and structured therapy (for example CBT); they do not prescribe medicine.",
    s.minFee ? `Sessions start from ₹${s.minFee.toLocaleString("en-IN")}; each psychologist's fee is shown before booking.` : null,
    s.languages?.length ? `Languages: ${s.languages.join(", ")}.` : null,
  ],
  sections: [
    { h: "When to see a clinical psychologist", p: [
      "A clinical psychologist is a good choice for concerns that have lasted a while or are affecting daily life — OCD, PTSD and trauma, panic attacks, long-standing depression or anxiety, eating concerns — and when you need a formal psychological assessment (for example for ADHD, learning difficulties or a diagnosis).",
      "For everyday stress, relationships or life changes, a counselling psychologist is often just as right. If medicine may be needed, a psychiatrist works alongside the psychologist.",
    ] },
  ],
  related: [
    { href: "/psychologist-vs-psychiatrist-vs-counsellor", text: "Psychologist vs psychiatrist vs counsellor" },
    { href: "/therapy-for/ocd", text: "Therapy for OCD" },
    { href: "/self-assessment", text: "Mental health tests" },
  ],
  faqTitle: "Questions about clinical psychologists",
  faqs: [
    { q: "What is a clinical psychologist?", a: "A clinical psychologist is a mental health professional trained to assess, diagnose and treat psychological problems with therapy. In India they hold a master's in psychology plus RCI-recognised clinical training and are licensed by the Rehabilitation Council of India." },
    { q: "What is the difference between a clinical psychologist and a psychiatrist?", a: "A psychiatrist is a medical doctor (MBBS + MD/DNB Psychiatry) who can prescribe medicine. A clinical psychologist is not a medical doctor; they do psychological testing and therapy, and don't prescribe. Many people see both." },
    { q: "Clinical psychologist vs counselling psychologist — which do I need?", a: "Counselling psychologists help with everyday and life concerns like stress, relationships and grief. Clinical psychologists are trained for more complex or long-standing conditions and for psychological assessment. If unsure, start with either — they'll refer you if needed." },
    { q: "Can I see a clinical psychologist online?", a: "Yes. Every clinical psychologist on Choose Your Therapist offers online video sessions, so you can start from anywhere in India; some also see clients in person." },
    { q: "Clinical psychologist kaun hota hai?", a: "Clinical psychologist wo hota hai jisne psychology me master's ke baad RCI se maanyata wali clinical training li ho. Wo test karke samasya samajhta hai aur therapy deta hai (jaise CBT), lekin dawa nahi likhta — dawa ke liye psychiatrist chahiye." },
  ],
};

export async function getStaticProps() {
  const all = await loadDirectory();
  const list = all.filter(isClinical);
  return {
    props: { therapists: cards(list, 30), stats: statsFor(list, all.length), updatedAt: new Date().toISOString() },
    revalidate: 3600,
  };
}

export default function Page(props) {
  return <IntentPage {...props} page={PAGE} />;
}
