import CompareGuide from "../components/guides/compare-guide";

// Guide: online vs in-person therapy in India — what differs, cost, and who each suits.
const GUIDE = {
  path: "/online-vs-in-person-therapy",
  title: "Online vs In-Person Therapy in India: Which Is Better?",
  cardTitle: "Online vs in-person therapy",
  crumb: "Online vs in-person therapy",
  h1: "Online vs in-person therapy: which is right for you?",
  description: "Online therapy works as well as in-person for many common concerns and costs less. Compare cost, privacy and who each suits — online from ₹500, Noida from ₹1,200.",
  published: "2026-10-27",
  updated: "2026-10-27",
  about: ["Online therapy", "Psychotherapy", "Telepsychology", "Mental health care in India"],
  answer: [
    "For many common concerns — stress, anxiety, low mood, relationship problems — studies have found online therapy works about as well as meeting in person, and it saves travel time. In-person sessions can suit you better if you have no private space at home, find screens hard to open up on, or are booking for a young child.",
    "On Choose Your Therapist, online sessions with verified psychologists start at ₹500 from anywhere in India; in-person sessions at our Noida centre (D-137, Sector 51) start at ₹1,200, and home visits are available in Noida. You can switch between the two with the same psychologist where they offer both.",
  ],
  tableTitle: "Side by side",
  columns: ["Online therapy", "In-person therapy"],
  rows: [
    ["How it works", "Video or audio call from your phone or laptop, 50–60 min", "Face to face at the psychologist's clinic, 50–60 min"],
    ["Cost on CYT", "From ₹500 per session", "From ₹1,200 at the Noida centre (Sector 51)"],
    ["Choice of psychologist", "Anyone in India, filtered by concern, language and fee", "Psychologists near you"],
    ["Travel", "None — no commute or waiting room", "Travel time to and from the centre"],
    ["Privacy", "Needs a private room and headphones", "Private therapy room, away from home"],
    ["Works well for", "Stress, anxiety, low mood, relationships, busy schedules, small towns", "Children and teens, play or activity-based therapy, people without privacy at home"],
    ["What you need", "Stable internet, a quiet space, a phone or laptop", "Being able to get to the centre"],
  ],
  whenTitle: "Which to choose",
  when: [
    { title: "Online is a good fit if…", points: ["You have a private, quiet place to talk", "There's no psychologist you like near you", "Your schedule is tight or travel is hard", "You want a psychologist who speaks your language"], link: { href: "/view-all-therapist", text: "Browse online psychologists" } },
    { title: "In person is a good fit if…", points: ["Home doesn't feel private enough", "You open up more face to face", "It's for a child — play and activity-based therapy", "You live in or near Noida / Delhi NCR"], link: { href: "/noida-appointment", text: "Book at the Noida centre" } },
    { title: "Home visit", points: ["In Noida, a psychologist can come to you", "Useful for elderly family members or limited mobility", "Choose 'home visit' when booking"], link: { href: "/noida-appointment", text: "See home-visit fees" } },
  ],
  sections: [
    { h: "Is online therapy as effective?", p: ["For many common concerns, yes. Reviews of research comparing video therapy with face-to-face sessions have found similar results for conditions like anxiety and depression. What matters most is the fit between you and your psychologist, and coming regularly."] },
    { h: "Getting the most out of an online session", p: ["Find a room where you won't be overheard, use headphones, keep your phone charged and on a stand, and join a couple of minutes early. If the connection drops, your psychologist will call back or switch to audio."] },
  ],
  faqs: [
    { q: "Is online therapy cheaper than in-person therapy?", a: "Usually, yes. On Choose Your Therapist, online sessions start at ₹500 and in-person sessions at the Noida centre start at ₹1,200. Each psychologist's exact fee is shown on their profile before you book." },
    { q: "Is online therapy confidential?", a: "Yes. Sessions are private between you and your psychologist and are not recorded. Choose a private room and use headphones so no one at home can overhear." },
    { q: "Can I switch from online to in-person later?", a: "Yes, if your psychologist offers both. Many psychologists on Choose Your Therapist see clients online and in person; the profile shows which session types they offer." },
    { q: "Is online therapy suitable for children?", a: "For older children and teens it can work well. Younger children often do better in person, where play and activity-based therapy is possible — our Noida centre has a space for this." },
    { q: "Online therapy aur in-person therapy me kaunsi behtar hai?", a: "Tension, anxiety, udaasi ya rishton ki pareshani ke liye online therapy aksar utni hi asardaar hoti hai jitni aamne-saamne — aur sasti bhi (₹500 se). Agar ghar par baat karne ki privacy nahi hai, ya bachche ke liye therapy chahiye, to Noida centre par in-person session (₹1,200 se) behtar rahega." },
    { q: "Kya online session Hindi me ho sakta hai?", a: "Haan. Zyadatar psychologists Hindi aur English dono me session lete hain; directory me bhasha se filter karke apne hisaab se psychologist chun sakte hain." },
  ],
  related: [
    { href: "/psychologist-vs-psychiatrist-vs-counsellor", text: "Who to see: psychologist, psychiatrist or counsellor" },
    { href: "/noida-appointment", text: "Therapy centre in Noida, Sector 51" },
    { href: "/therapy-for/anxiety", text: "Therapy for anxiety" },
    { href: "/therapy-for/relationships", text: "Relationship counselling" },
  ],
};

export default function Page() {
  return <CompareGuide g={GUIDE} />;
}
