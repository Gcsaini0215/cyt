// Hinglish questions for the concern, city and Noida pages — people ask search and AI assistants
// like this ("Noida me achha psychologist kaun hai", "anxiety ke liye kab dikhana chahiye").
// Each page adds these to its own FAQ list, which feeds both the visible FAQ and the FAQPage schema.

const FEES = "Online session ₹500 se shuru hota hai aur psychologist ke experience ke hisaab se lagbhag ₹2,500 tak jata hai; Noida centre (Sector 51) par in-person session ₹1,200 se. Har psychologist ki fee booking se pehle unki profile par dikhti hai.";
const CRISIS = "Agar khud ko nuksaan pahunchane ke khayal aa rahe hain to turant Tele-MANAS 14416 (free, 24×7) par call kijiye.";

// /therapy-for/<slug>: c.label is "Anxiety", "Depression", "Work stress & burnout" …
export const concernHinglishFaqs = (c) => {
  const x = String(c?.label || "is samasya").toLowerCase();
  return [
    { q: `${c.label} ke liye psychologist ko kab dikhana chahiye?`, a: `Agar ${x} 2–3 hafte se zyada chal raha hai, aur neend, kaam, padhai ya rishton par asar daal raha hai, to psychologist se baat karna achha rahega. Jaldi madad lene se aksar cheezein jaldi sambhalti hain. ${CRISIS}` },
    { q: `Kya ${x} ke liye online therapy kaam karti hai?`, a: `Haan, bahut logon ke liye online session utna hi asardaar hota hai jitna aamne-saamne — aur ghar se, apne samay par ho jata hai. Pehle session me psychologist aapki baat samajh kar aage ka plan banate hain.` },
    { q: `${c.label} ki therapy ki fees kitni hai?`, a: FEES },
    { q: "Kya Hindi me session ho sakta hai?", a: "Haan. Zyadatar psychologists Hindi aur English dono me session lete hain, aur kai doosri Indian bhashayein bhi bolte hain — har profile par bhashayein likhi hoti hain, aur directory me bhasha se filter kar sakte hain." },
  ];
};

// /psychologist-in/<place>: config.name is "Delhi", "Uttar Pradesh" …; abroad places are left out
export const placeHinglishFaqs = (config) => {
  if (!config?.name || config.abroad) return [];
  const p = config.name;
  return [
    { q: `${p} me achha psychologist kaise dhoondhein?`, a: `Choose Your Therapist par ${p} ke verified psychologists ki list, unki fees, bhashayein aur expertise ek jagah dikhti hai. Concern (jaise anxiety, depression, relationship) aur bhasha se filter kijiye, ya WhatsApp par hamari team se pooch lijiye — wo aapke liye sahi psychologist suggest karegi.` },
    { q: `${p} me psychologist ki fees kitni hai?`, a: FEES },
    { q: `Kya ${p} se online session le sakte hain?`, a: `Haan. ${p} se aap kisi bhi verified psychologist ke saath video ya audio call par session le sakte hain — Hindi ya English me. Session lagbhag 50–60 minute ka hota hai.` },
  ];
};

// /noida-appointment: fee comes from the centre's live price list (individual, in person)
export const noidaHinglishFaqs = (inPersonFee) => [
  { q: "Noida me psychologist ka session kitne ka hai?", a: inPersonFee ? `CYT Noida centre (Sector 51) par in-person session ₹${Number(inPersonFee).toLocaleString("en-IN")} se shuru hota hai. Online aur home visit ki fees, aur aapke chune hue session ka poora total, booking se pehle isi page par dikhta hai.` : "Fees isi page par session chunte hi dikhti hain — booking se pehle poora total pata chal jata hai." },
  { q: "CYT Noida centre kahan hai aur kab khula rehta hai?", a: "Gate No-3, D-137, LPS Global School ke paas, Block D, Sector 51, Noida (UP) 201301. Centre roz subah 9 baje se raat 9 baje tak khula rehta hai. Phone / WhatsApp: +91 80777 57951." },
  { q: "Kya ghar par session (home visit) ya online session bhi milta hai?", a: "Haan. Booking karte waqt aap centre par in-person, online (video call) ya home visit — teeno me se chun sakte hain." },
];
