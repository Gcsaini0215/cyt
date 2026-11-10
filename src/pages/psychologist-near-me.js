import IntentPage from "../components/seo/intent-page";
import { loadDirectory, statsFor, cards, placeLinks, isInPerson } from "../utils/intent-data";

// "psychologist near me" — the biggest rising search (Google Trends, Nov 2026). In-person
// psychologists with their ~1 km area, sortable by distance in the browser, + the Noida centre.
const PAGE = {
  path: "/psychologist-near-me",
  title: "Psychologist Near Me — In Person & Online",
  crumb: "Psychologist near me",
  schemaName: "Psychologists near you — in person and online",
  eyebrow: "Verified psychologists · in person near you & online",
  h1: ["Psychologist", "near me"],
  description: "Find a verified psychologist near you for in-person therapy — or talk online from anywhere in India. See fees, languages and reviews, then book in 2 minutes.",
  countLabel: "see clients in person",
  near: true,
  listTitle: "Psychologists who see clients in person",
  listIntro: "Tap “Use my location” to sort them by distance. Every psychologist on Choose Your Therapist also offers online video sessions, so distance never has to stop you.",
  moreHref: "/view-all-therapist",
  moreText: "See every psychologist",
  leadTag: "Near me",
  leadTitle: "Want us to find someone close to you?",
  waText: "Hi, I'm looking for a psychologist near me.",
  factsTitle: "Quick facts: psychologists near you",
  facts: (s) => [
    s.count ? `${s.count} verified psychologists on Choose Your Therapist see clients in person; all of them also offer online sessions.` : null,
    "In-person sessions at the CYT Therapy Centre in Sector 51, Noida — Monday to Sunday, 9 AM to 9 PM.",
    s.minFee ? `Sessions start from ₹${s.minFee.toLocaleString("en-IN")}; each psychologist's fee is on their profile before you book.` : null,
    s.rating ? `Average client rating ${s.rating.avg}/5 from ${s.rating.count} verified reviews.` : null,
    "For privacy, profiles show each psychologist's area (about 1 km); the exact clinic address comes with your booking.",
    "Every psychologist's qualifications and documents are checked by the CYT team before their profile goes live.",
  ],
  sections: [
    { h: "Near me or online — which is better?", p: [
      "Research on therapy for anxiety, depression and stress finds online video sessions work about as well as meeting in person for most people. In person can feel easier if you want a separate, private space away from home, or for children and couples; online saves travel and widens your choice to psychologists anywhere in India.",
      "If there's no psychologist close to you yet, start online with someone you like — you can always meet in person later.",
    ] },
    { h: "How to choose a psychologist near you", p: [
      "Check what they work with (anxiety, relationships, children…), the languages they speak, their fee and reviews. A counselling psychologist suits most everyday concerns; a clinical psychologist is often the choice for assessments, OCD, PTSD or long-standing depression. If you might need medicine, you'll also need a psychiatrist.",
    ] },
  ],
  related: [
    { href: "/psychologist-vs-psychiatrist-vs-counsellor", text: "Psychologist vs psychiatrist" },
    { href: "/online-vs-in-person-therapy", text: "Online or in person?" },
    { href: "/clinical-psychologist", text: "Clinical psychologists" },
  ],
  faqTitle: "Questions about finding a psychologist near you",
  faqs: [
    { q: "How do I find a good psychologist near me?", a: "Use “Use my location” on this page to see verified psychologists who meet clients in person, sorted by distance, or pick your city. Compare what they work with, languages, fees and reviews on each profile, then book a session online in about 2 minutes." },
    { q: "How much does a psychologist cost in India?", a: "On Choose Your Therapist, online sessions start from around ₹500 and go up to about ₹2,500 depending on experience; in-person sessions at our Noida centre start at ₹1,200. Each psychologist's fee is shown before you book." },
    { q: "Is there a psychiatrist near me on Choose Your Therapist?", a: "Choose Your Therapist lists psychologists, who give therapy and do not prescribe medicine. If you may need medicine — for example severe depression or symptoms like hearing voices — you'll need a psychiatrist (a medical doctor). A psychologist can help you decide and work alongside your psychiatrist." },
    { q: "What if there is no psychologist in my city?", a: "Every psychologist on Choose Your Therapist offers online video or audio sessions, so you can start therapy from anywhere in India today." },
    { q: "Mere paas koi psychologist kaise dhoondhein?", a: "Is page par “Use my location” dabaiye — aapke paas in-person milne wale verified psychologists doori ke hisaab se dikh jaayenge. Paas mein koi na ho to online session le sakte hain; sab psychologists online bhi milte hain." },
  ],
};

export async function getStaticProps() {
  const all = await loadDirectory();
  const list = all.filter(isInPerson);
  return {
    props: { therapists: cards(list, 40, true), stats: statsFor(list, all.length), updatedAt: new Date().toISOString(), places: placeLinks(all) },
    revalidate: 3600,
  };
}

export default function Page(props) {
  return <IntentPage {...props} page={PAGE} />;
}
