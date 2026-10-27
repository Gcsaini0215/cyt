import CompareGuide from "../components/guides/compare-guide";

// Guide: who to see in India — psychiatrist, clinical psychologist, counselling psychologist or counsellor.
const GUIDE = {
  path: "/psychologist-vs-psychiatrist-vs-counsellor",
  title: "Psychologist vs Psychiatrist vs Counsellor in India",
  cardTitle: "Psychologist vs Psychiatrist vs Counsellor",
  crumb: "Psychologist vs psychiatrist vs counsellor",
  h1: "Psychologist vs psychiatrist vs counsellor: who should you see in India?",
  description: "Who does what in India: psychiatrists prescribe medicine, psychologists give therapy and assessments, counsellors offer support. When to see whom, with costs.",
  published: "2026-10-27",
  updated: "2026-10-27",
  about: ["Psychologist", "Psychiatrist", "Counselling", "Mental health care in India"],
  answer: [
    "A psychiatrist is a medical doctor (MBBS + MD or DNB in Psychiatry) who can diagnose mental illness and prescribe medicine. A clinical psychologist (Psychology master's + M.Phil or another RCI-recognised clinical qualification, registered with the Rehabilitation Council of India) does psychological assessment and therapy but does not prescribe. A counselling psychologist (master's in psychology) gives talk therapy for stress, anxiety, relationships and life problems. \"Counsellor\" is a broader title in India and training varies, so check qualifications.",
    "Start with a psychologist for most everyday concerns — stress, anxiety, low mood, relationships, grief. See a psychiatrist when symptoms are severe, you may need medicine, or there are signs like hearing voices, extreme mood swings or thoughts of self-harm. Many people see both: a psychiatrist for medicine and a psychologist for therapy.",
  ],
  tableTitle: "Side by side",
  columns: ["Psychiatrist", "Clinical psychologist", "Counselling psychologist", "Counsellor"],
  rows: [
    ["Training in India", "MBBS + MD / DNB Psychiatry (a medical doctor)", "Master's in psychology + M.Phil Clinical Psychology or other RCI-recognised clinical training", "Master's in psychology (often counselling or applied psychology)", "Varies — from short diplomas to master's degrees"],
    ["Registration", "National / State Medical Council", "Rehabilitation Council of India (RCI) licence", "No national licence yet; check degree and supervised experience", "No protected title"],
    ["Prescribes medicine", "Yes", "No", "No", "No"],
    ["Main work", "Diagnosis, medicine, managing severe conditions", "Psychological testing, diagnosis, structured therapy (CBT, DBT and others)", "Talk therapy for everyday and life concerns", "Support, guidance and listening"],
    ["Best for", "Severe depression, bipolar disorder, psychosis, when medicine may help", "OCD, PTSD, persistent anxiety or depression, assessments", "Stress, anxiety, relationships, grief, self-esteem, life transitions", "Light support, guidance, school or career questions"],
    ["Session length", "Often 15–30 min follow-ups after a first longer visit", "50–60 min", "50–60 min", "Varies"],
  ],
  whenTitle: "Who to see first",
  when: [
    { title: "See a psychologist if…", points: ["Stress, worry or low mood has lasted 2–3 weeks or more", "Relationships, work or studies are being affected", "You want to understand patterns and learn ways to cope", "You'd like to talk it through rather than take medicine"], link: { href: "/view-all-therapist", text: "Find a verified psychologist" } },
    { title: "See a psychiatrist if…", points: ["Symptoms are severe or getting worse quickly", "You can't function — not sleeping, eating or leaving home", "Extreme mood swings, hearing or seeing things others don't", "A psychologist suggests medicine may help"] },
    { title: "Not sure?", points: ["Start with a psychologist — they will tell you if a psychiatrist should also be involved", "Many people need both, working together", "Answer three quick questions and we'll suggest who fits"], link: { href: "/view-all-therapist?help=1", text: "Help me choose" } },
  ],
  sections: [
    { h: "Can a psychologist and a psychiatrist work together?", p: ["Yes, and this is common. For conditions like moderate-to-severe depression or OCD, research and clinical guidelines often recommend therapy and medicine together. The psychiatrist manages medicine; the psychologist works with you every week or two on thoughts, behaviour and coping skills."] },
    { h: "What about cost?", p: ["On Choose Your Therapist, online sessions with verified counselling and clinical psychologists start at ₹500 and go up to about ₹2,500 depending on experience; in-person sessions at our Noida centre (Sector 51) start at ₹1,200. Every psychologist's fee is shown on their profile before you book."] },
  ],
  faqs: [
    { q: "Is a psychologist a doctor?", a: "Not a medical doctor. Psychologists in India have a master's degree (and clinical psychologists further RCI-recognised training) in psychology. Some have a PhD and use the title \"Dr\", but they do not prescribe medicine — only psychiatrists, who are medical doctors, can." },
    { q: "Can a psychologist prescribe medicine in India?", a: "No. Only a registered medical doctor — for mental health, usually a psychiatrist — can prescribe medicine. A psychologist can recommend that you see a psychiatrist if medicine may help." },
    { q: "Should I see a psychologist or a psychiatrist for anxiety?", a: "For most anxiety, start with a psychologist — therapy such as CBT works well for many people. If anxiety is severe, constant, or not improving with therapy, a psychiatrist can assess whether medicine would help alongside therapy." },
    { q: "What is RCI registration?", a: "The Rehabilitation Council of India (RCI) licenses clinical psychologists and some other rehabilitation professionals. An RCI-registered clinical psychologist has completed recognised clinical training and is allowed to do psychological assessment and diagnosis." },
    { q: "Psychologist aur psychiatrist me kya farak hai?", a: "Psychiatrist doctor hote hain (MBBS + MD) — wo dawa likh sakte hain aur gambhir mental bimariyon ka ilaaj karte hain. Psychologist baat-cheet wali therapy dete hain (jaise CBT) aur dawa nahi likhte. Zyadatar tension, anxiety, udaasi ya rishton ki pareshani ke liye pehle psychologist se shuru karna theek rehta hai." },
    { q: "Pehle kiske paas jaana chahiye — psychologist ya psychiatrist?", a: "Agar pareshani roz ki zindagi me hai — tension, ghabrahat, udaasi, rishte — to pehle psychologist se baat kijiye. Agar lakshan bahut gambhir hain, neend ya khana bilkul chhoot gaya hai, ya khud ko nuksaan pahunchane ke khayal aa rahe hain, to psychiatrist ko dikhaiye. Turant madad ke liye Tele-MANAS 14416 (free, 24×7)." },
  ],
  related: [
    { href: "/online-vs-in-person-therapy", text: "Online or in person — which suits you?" },
    { href: "/therapy-for/depression", text: "Therapy for depression" },
    { href: "/therapy-for/ocd", text: "Therapy for OCD" },
    { href: "/self-assessment", text: "Mental health tests" },
  ],
};

export default function Page() {
  return <CompareGuide g={GUIDE} />;
}
