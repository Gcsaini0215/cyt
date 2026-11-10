import IntentPage from "../components/seo/intent-page";
import { loadDirectory, statsFor, cards, isChild } from "../utils/intent-data";

// "child psychologist bangalore / near me" — breakout search (Google Trends, Nov 2026).
// Psychologists who work with children, teens and parents; online across India, some in person.
const PAGE = {
  path: "/child-psychologist",
  title: "Child Psychologist — Online & In Person",
  crumb: "Child psychologist",
  schemaName: "Child and adolescent psychologists — online and in person in India",
  eyebrow: "Psychologists for children, teens & parents",
  h1: ["Child", "psychologist"],
  description: "Verified psychologists who work with children, teenagers and parents — behaviour, anxiety, exam stress, ADHD and parenting. Online across India, some in person.",
  countLabel: "work with children & teens",
  listTitle: "Psychologists for children and teenagers",
  listIntro: "These psychologists list child, ADHD, autism, play therapy or parenting work in their expertise. All offer online sessions across India — including Bangalore, Delhi, Mumbai and Hyderabad — and some also see families in person.",
  moreHref: "/therapy-for/parenting",
  moreText: "Parenting & child counselling",
  leadTag: "Child psychologist",
  leadTitle: "Tell us about your child — we'll suggest who fits",
  waText: "Hi, I'm looking for a child psychologist.",
  factsTitle: "Quick facts: child psychologists",
  facts: (s) => [
    s.count ? `${s.count} verified psychologists on Choose Your Therapist work with children, teens or parents${s.inPerson ? `; ${s.inPerson} also see families in person` : ""}.` : null,
    "Online sessions work across India, including Bangalore, Delhi NCR, Mumbai, Hyderabad, Pune and Chennai.",
    "For young children, the first session is often with the parents; teenagers usually also get time on their own with the psychologist.",
    s.minFee ? `Sessions start from ₹${s.minFee.toLocaleString("en-IN")}; each psychologist's fee is shown before booking.` : null,
    "Formal assessments (for example for ADHD or learning difficulties) are done by clinical psychologists; medicine, if ever needed, only by a child psychiatrist or paediatrician.",
  ],
  sections: [
    { h: "When to see a child psychologist", p: [
      "Consider it when a change lasts more than a few weeks or affects school, sleep, eating or friendships: frequent tantrums or aggression, withdrawal or sadness, worry or school refusal, exam stress, screen or phone struggles, bullying, big changes like a move or separation, or concerns about attention and learning.",
      "You don't have to be sure something is “wrong” — many parents book one session just to understand what's going on and what helps at home.",
    ] },
  ],
  related: [
    { href: "/therapy-for/parenting", text: "Parenting & child counselling" },
    { href: "/clinical-psychologist", text: "Clinical psychologists" },
    { href: "/psychologist-vs-psychiatrist-vs-counsellor", text: "Psychologist vs psychiatrist" },
  ],
  faqTitle: "Questions about child psychologists",
  faqs: [
    { q: "How do I find a child psychologist near me in Bangalore?", a: "All psychologists on this page offer online sessions, so families in Bangalore can start right away from home. A few also see clients in person; their area is shown on the profile. Tell us your child's age and concern and our team will suggest who fits." },
    { q: "At what age can a child see a psychologist?", a: "Children of any age can be helped. For toddlers and young children the psychologist mostly works with the parents and through play; school-age children and teenagers usually have sessions of their own, with parents involved as needed." },
    { q: "Do child psychologists prescribe medicine?", a: "No. Psychologists give therapy and assessments. If medicine may be needed — rarely, for example for severe ADHD — a child psychiatrist or paediatrician decides that, and the psychologist works alongside them." },
    { q: "Can my child have therapy online?", a: "Yes. Teenagers often find video sessions easy and private; for younger children, online sessions are usually shorter and include a parent. The psychologist will suggest what works best." },
    { q: "Bachche ko psychologist ke paas kab le jaana chahiye?", a: "Agar bachche ke vyavhaar, neend, padhai ya dosti me kuch hafton se badlav dikh raha hai — gussa, chup rehna, darr, school na jaana, exam ka tension ya phone ki aadat — to ek baar psychologist se baat karna achha rehta hai. Pehla session aksar maa-baap ke saath hota hai." },
  ],
};

export async function getStaticProps() {
  const all = await loadDirectory();
  const list = all.filter(isChild);
  return {
    props: { therapists: cards(list, 30), stats: statsFor(list, all.length), updatedAt: new Date().toISOString() },
    revalidate: 3600,
  };
}

export default function Page(props) {
  return <IntentPage {...props} page={PAGE} />;
}
