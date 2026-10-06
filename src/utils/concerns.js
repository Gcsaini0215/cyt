// Concerns people come to therapy for: the home "Explore Specializations" section and the
// /therapy-for/<slug> landing pages. `value` is the expertise name therapists pick on their
// profile (and the directory's ?concern= filter), so counts and links always line up.
// Content is general information, written to be accurate and non-alarming — not medical advice.

export const CONCERN_PAGES = [
  {
    slug: "anxiety", label: "Anxiety", value: "Anxiety", img: "anxiety", featured: true,
    short: "Constant worry, overthinking, panic or ghabrahat.",
    title: "Therapy for Anxiety",
    intro: "Everyone worries sometimes. Anxiety is when the worry doesn't switch off — racing thoughts, a tight chest, trouble sleeping, or avoiding things that used to feel easy. It is one of the most common reasons people start therapy, and one of the most treatable.",
    signs: [
      "Worrying most days, even when you know it's out of proportion",
      "Overthinking conversations, decisions or \"what ifs\"",
      "Racing heart, sweating, breathlessness or sudden panic",
      "Restlessness, irritability or trouble falling asleep",
      "Avoiding places, people or tasks because of fear",
    ],
    helps: [
      "Understand what sets your anxiety off and why",
      "Learn grounding and breathing skills that work in the moment",
      "Challenge anxious thoughts with techniques such as CBT",
      "Slowly face avoided situations, at a pace that feels safe",
    ],
    faqs: [
      { q: "Can anxiety be treated with therapy alone?", a: "For many people, yes. Talking therapies such as Cognitive Behavioural Therapy (CBT) are well studied for anxiety. If your anxiety is severe, a psychologist may also suggest seeing a psychiatrist about medication alongside therapy." },
      { q: "How many sessions will I need for anxiety?", a: "It varies. Many people notice a difference within 6–12 weekly sessions; your therapist will review progress with you along the way." },
      { q: "Is online therapy effective for anxiety?", a: "Yes — online video or audio sessions work well for anxiety, and many people find it easier to open up from home." },
    ],
  },
  {
    slug: "depression", label: "Depression", value: "Depression", img: "depression", featured: true,
    short: "Low mood, no energy, losing interest in things.",
    title: "Therapy for Depression",
    intro: "Depression is more than a bad week. It can feel like a heaviness that doesn't lift — losing interest in things you used to enjoy, feeling tired all the time, or feeling hopeless. With the right support, people do feel better.",
    signs: [
      "Feeling sad, empty or numb most of the day",
      "Losing interest in work, friends or hobbies",
      "Sleeping or eating much more or less than usual",
      "Feeling tired, slowed down or unable to focus",
      "Feeling worthless, guilty or hopeless",
    ],
    helps: [
      "A safe space to talk about what you're carrying",
      "Small, realistic steps to rebuild routine and energy",
      "Noticing and changing harsh self-talk",
      "A plan for difficult days, and knowing when to seek more help",
    ],
    faqs: [
      { q: "How do I know if it's depression or just sadness?", a: "Sadness usually passes. If low mood, low energy or loss of interest last most days for two weeks or more and affect daily life, it's worth speaking to a professional." },
      { q: "Do I need medication for depression?", a: "Not always. Mild to moderate depression often improves with therapy. For more severe depression a psychiatrist may recommend medication together with therapy." },
      { q: "What if I have thoughts of harming myself?", a: "Please reach out now: call Tele-MANAS on 1800-89-14416 (free, 24×7) or go to your nearest hospital. You don't have to handle this alone." },
    ],
  },
  {
    slug: "relationships", label: "Relationships", value: "Couples Counselling", img: "couple", featured: true,
    short: "Fights, distance, trust issues — for couples and individuals.",
    title: "Relationship & Couples Counselling",
    intro: "Relationships go through rough patches — frequent arguments, feeling unheard, trust breaking down, or simply drifting apart. Counselling helps couples, and individuals on their own, understand what's going wrong and how to repair it.",
    signs: [
      "The same arguments keep coming back",
      "You feel distant, lonely or unheard in the relationship",
      "Trust has been broken, or jealousy is hurting you both",
      "Big decisions — marriage, children, family — are causing conflict",
      "You're unsure whether to stay or move on",
    ],
    helps: [
      "Learn to talk and listen without it turning into a fight",
      "Understand each other's needs and patterns",
      "Work through trust, intimacy or family pressures",
      "Make clearer decisions about the relationship's future",
    ],
    faqs: [
      { q: "Can I go to relationship counselling alone?", a: "Yes. Many people start on their own — it still helps you understand patterns and communicate differently." },
      { q: "Do you offer pre-marital counselling?", a: "Yes, several therapists offer pre-marital counselling to talk through expectations, families, finances and conflict before marriage." },
      { q: "Is what we say kept confidential?", a: "Yes. Sessions are private between you and your therapist." },
    ],
  },
  {
    slug: "work-stress-burnout", label: "Work stress & burnout", value: "Burnout", img: "career", featured: true,
    short: "Exhausted, stuck at work, no work–life balance.",
    title: "Therapy for Work Stress & Burnout",
    intro: "Long hours, pressure to perform and no time to recover can leave you exhausted and detached. Burnout builds slowly — therapy helps you notice it, recover, and set limits that last.",
    signs: [
      "Feeling drained even after a weekend off",
      "Dreading work, or feeling cynical and detached about it",
      "Struggling to concentrate or getting less done",
      "Headaches, poor sleep or getting sick more often",
      "No time or energy left for yourself or family",
    ],
    helps: [
      "Recognise your early warning signs of burnout",
      "Set boundaries and say no without guilt",
      "Manage workload, perfectionism and pressure",
      "Rebuild rest, energy and a sense of purpose",
    ],
    faqs: [
      { q: "Is burnout a mental health problem?", a: "Burnout is a state of chronic work stress rather than a diagnosis, but it can lead to anxiety or depression if ignored. Therapy helps you recover early." },
      { q: "Can I have sessions outside office hours?", a: "Many therapists offer evening or weekend slots, online or in person — check each profile's availability." },
      { q: "Do you work with companies?", a: "Yes — see our Corporate page for workplace wellness programmes." },
    ],
  },
  {
    slug: "ocd", label: "OCD", value: "Obsessive-Compulsive Disorder (OCD)", img: "ocd", featured: true,
    short: "Unwanted thoughts and repeated checking or cleaning.",
    title: "Therapy for OCD",
    intro: "Obsessive-Compulsive Disorder (OCD) involves unwanted, distressing thoughts and the urge to repeat actions — checking, cleaning, counting or seeking reassurance — to make the anxiety go away. It can take up hours of the day, but it responds well to specialised therapy.",
    signs: [
      "Intrusive thoughts or images you can't push away",
      "Repeated checking, washing, arranging or counting",
      "Needing things to feel \"just right\"",
      "Constantly seeking reassurance",
      "Rituals taking up a lot of time or causing distress",
    ],
    helps: [
      "Exposure and Response Prevention (ERP), the main therapy for OCD",
      "Understanding the OCD cycle of thought, anxiety and ritual",
      "Reducing rituals step by step",
      "Support for family members on how to respond",
    ],
    faqs: [
      { q: "What is the best therapy for OCD?", a: "Exposure and Response Prevention (ERP), a form of CBT, has the strongest evidence. Look for a psychologist experienced in ERP." },
      { q: "Will I need medication for OCD?", a: "Some people benefit from medication prescribed by a psychiatrist alongside therapy, especially when symptoms are severe." },
      { q: "Can OCD be treated online?", a: "Yes, ERP can be done effectively over video sessions." },
    ],
  },
  {
    slug: "trauma-ptsd", label: "Trauma & PTSD", value: "Post-Traumatic Stress Disorder (PTSD)", img: "trauma", featured: true,
    short: "Past events, abuse or loss that still feel present.",
    title: "Therapy for Trauma & PTSD",
    intro: "After something frightening or painful — an accident, abuse, violence or sudden loss — it's natural to feel shaken. When memories, fear or numbness stay for months, trauma-focused therapy can help you feel safe again.",
    signs: [
      "Flashbacks, nightmares or upsetting memories",
      "Feeling on edge, easily startled or unsafe",
      "Avoiding reminders, places or conversations",
      "Feeling numb, detached or unable to trust",
      "Anger, guilt or shame linked to what happened",
    ],
    helps: [
      "Go at your own pace — you never have to share more than you're ready to",
      "Calm the body's alarm system with grounding skills",
      "Process memories with trauma-focused approaches",
      "Rebuild trust, safety and everyday routines",
    ],
    faqs: [
      { q: "Do I have to talk about the trauma in detail?", a: "No. A good trauma therapist goes at your pace and focuses first on safety and coping." },
      { q: "Can childhood trauma be treated as an adult?", a: "Yes. Many people work through childhood experiences in therapy as adults." },
      { q: "What if I'm in danger right now?", a: "If you're not safe, please contact the police (112) or Tele-MANAS on 1800-89-14416." },
    ],
  },
  {
    slug: "parenting", label: "Parenting & child", value: "Parent-Child Relationship", img: "parenting", featured: true,
    short: "Child behaviour, teens, family conflicts.",
    title: "Parenting & Child Counselling",
    intro: "Parenting is hard — tantrums, screen time, school stress, teenage distance or conflicts at home. Counselling supports parents and children to understand each other and build a calmer home.",
    signs: [
      "Frequent conflicts or power struggles with your child",
      "Changes in your child's mood, behaviour, sleep or school performance",
      "Worries about screen use, friendships or bullying",
      "A teenager who has withdrawn or seems unhappy",
      "Feeling overwhelmed or unsure as a parent",
    ],
    helps: [
      "Understand what your child's behaviour is telling you",
      "Practical, consistent strategies for home",
      "Better communication between parents and children",
      "Support for the child or teen in their own sessions",
    ],
    faqs: [
      { q: "From what age can a child see a therapist?", a: "Therapists work with children of all ages; for young children, sessions often involve parents too." },
      { q: "Will you tell me what my teenager says in therapy?", a: "Teen sessions are kept confidential so they can open up, but you'll be told if there's any risk to their safety." },
      { q: "Do you assess ADHD or learning difficulties?", a: "Some clinical psychologists offer assessments — use the Diagnosis filter in the directory or ask our team." },
    ],
  },
  {
    slug: "stress", label: "Stress", value: "Stress Management", img: "stress",
    short: "Always tense, overwhelmed, can't switch off.",
    title: "Therapy for Stress",
    intro: "Stress is the body's response to pressure. A little keeps us going; too much for too long affects sleep, health, mood and relationships. Therapy helps you manage the pressure and look after yourself.",
    signs: [
      "Feeling overwhelmed or always \"on\"",
      "Trouble sleeping or relaxing",
      "Headaches, tight shoulders or stomach upsets",
      "Snapping at people or feeling irritable",
      "Struggling to cope with everyday demands",
    ],
    helps: [
      "Spot your main sources of stress",
      "Practical relaxation and time-management skills",
      "Change thinking patterns that add pressure",
      "Build habits that protect your energy",
    ],
    faqs: [
      { q: "When should I get help for stress?", a: "When it affects your sleep, health, work or relationships for weeks at a time, talking to a professional can help." },
      { q: "How is stress different from anxiety?", a: "Stress is usually a response to a clear pressure; anxiety can continue even when the pressure is gone. Therapists help with both." },
    ],
  },
  {
    slug: "anger", label: "Anger", value: "Anger Management", img: null,
    short: "Losing your temper and regretting it later.",
    title: "Anger Management Counselling",
    intro: "Anger is a normal emotion, but when it comes out as shouting, breaking things or hurting relationships, it costs a lot. Anger management helps you understand what's underneath and respond differently.",
    signs: [
      "Losing your temper quickly or often",
      "Saying or doing things you later regret",
      "People around you feel they must be careful with you",
      "Anger affecting work, family or relationships",
    ],
    helps: [
      "Notice early warning signs before anger takes over",
      "Calm-down skills that work in the moment",
      "Understand the hurt, stress or fear underneath the anger",
      "Communicate needs without aggression",
    ],
    faqs: [
      { q: "Can anger issues really change?", a: "Yes. With practice, most people learn to recognise triggers and respond more calmly." },
      { q: "Is anger management only for violent people?", a: "No. It helps anyone whose anger is causing problems, even if they never become physical." },
    ],
  },
  {
    slug: "self-esteem", label: "Self-esteem", value: "Self Esteem", img: null,
    short: "Low confidence, self-doubt, people-pleasing.",
    title: "Therapy for Low Self-Esteem",
    intro: "Low self-esteem can sound like a harsh inner critic — never feeling good enough, comparing yourself to others, or struggling to say no. Therapy helps you build a kinder, steadier view of yourself.",
    signs: [
      "Constant self-criticism or feeling not good enough",
      "Comparing yourself to others, often on social media",
      "Difficulty saying no or asking for what you need",
      "Avoiding challenges for fear of failing",
    ],
    helps: [
      "Recognise and question your inner critic",
      "Build self-compassion and realistic confidence",
      "Practise assertiveness and healthy boundaries",
      "Understand where these beliefs began",
    ],
    faqs: [
      { q: "Can therapy really improve confidence?", a: "Yes — approaches like CBT help change the beliefs that keep self-esteem low, and confidence grows with practice." },
    ],
  },
  {
    slug: "grief", label: "Grief & loss", value: "Grief And Loss", img: null,
    short: "Coping with the death of a loved one or a big loss.",
    title: "Grief & Loss Counselling",
    intro: "Losing someone or something important — a loved one, a relationship, a pregnancy, a job — can turn life upside down. There is no right way to grieve; counselling gives you space to feel it and find a way forward.",
    signs: [
      "Waves of sadness, anger, guilt or numbness",
      "Finding it hard to accept the loss",
      "Difficulty sleeping, eating or concentrating",
      "Feeling stuck, months after the loss",
    ],
    helps: [
      "A space to talk about the person or what you've lost",
      "Understand that grief comes and goes in waves",
      "Cope with anniversaries, triggers and changes",
      "Find meaning and reconnect with life at your own pace",
    ],
    faqs: [
      { q: "How long does grief last?", a: "There's no fixed timeline. If grief stays overwhelming or stops you functioning for a long time, counselling can help." },
    ],
  },
  {
    slug: "adhd", label: "ADHD", value: "Attention Deficit Hyperactivity Disorder (ADHD)", img: null,
    short: "Focus, restlessness and impulsivity — kids and adults.",
    title: "ADHD Support & Therapy",
    intro: "ADHD affects attention, activity and impulse control in children and adults. It isn't about laziness — the right strategies and support make daily life, study and work much easier.",
    signs: [
      "Trouble focusing, finishing tasks or staying organised",
      "Restlessness or difficulty sitting still",
      "Acting or speaking without thinking",
      "Forgetting appointments, losing things, running late",
    ],
    helps: [
      "Practical systems for planning, time and focus",
      "Managing emotions, frustration and impulsivity",
      "Support for parents of children with ADHD",
      "Guidance on assessment and next steps",
    ],
    faqs: [
      { q: "Can adults have ADHD?", a: "Yes. Many adults are first recognised in their 20s or later." },
      { q: "Do you diagnose ADHD?", a: "Some clinical psychologists offer assessments; a psychiatrist may also be involved, especially if medication is considered." },
    ],
  },
];

export const concernBySlug = (slug) => CONCERN_PAGES.find((c) => c.slug === slug) || null;
export const concernPath = (c) => `/therapy-for/${c.slug}`;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMin = (s) => {
  const m = String(s || "").trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!m) return null;
  return ((Number(m[1]) % 12) + (m[3] === "pm" ? 12 : 0)) * 60 + Number(m[2] || 0);
};

// "Explore Specializations" stats, worked out on the server from the full directory:
// per concern -> count, lowest fee, 3 faces and which therapists (ids into `week`);
// `week` holds each therapist's weekly opening minutes once, compactly, for "available today".
export function concernStats(all, getMinFee, split) {
  const isTop = (t) => t.priority === 1 || t.priority === "1";
  const week = all.map((t) => DAYS.map((d) => {
    const slot = (t.availabilities || []).find((a) => a?.day === d);
    return (slot?.times || []).map((x) => toMin(x.open)).filter((x) => x !== null);
  }));
  const bySlug = {};
  const used = new Set(); // so neighbouring cards don't all show the same three faces
  for (const c of CONCERN_PAGES) {
    const ids = all.map((t, i) => i).filter((i) => split(all[i].experties).includes(c.value))
      .sort((a, b) => (isTop(all[b]) - isTop(all[a])) || ((all[b].reviews?.length || 0) - (all[a].reviews?.length || 0)));
    const fees = ids.map((i) => getMinFee(all[i].fees)).filter(Boolean);
    const withPhoto = ids.filter((i) => all[i].user?.profile);
    const faces = [...withPhoto.filter((i) => !used.has(i)), ...withPhoto.filter((i) => used.has(i))].slice(0, 3);
    faces.forEach((i) => used.add(i));
    bySlug[c.slug] = {
      count: ids.length,
      minFee: fees.length ? Math.min(...fees) : null,
      faces: faces.map((i) => ({ name: all[i].user.name || "", profile: all[i].user.profile })),
      ids,
    };
  }
  return { bySlug, week };
}

// how many of these therapists have an opening today at least an hour from now (IST)
export function availableToday(ids, week, now) {
  if (!now || !ids || !week) return 0;
  const ist = new Date(now + 330 * 60000);
  const day = ist.getUTCDay();
  const nowMin = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return ids.filter((i) => (week[i]?.[day] || []).some((m) => m >= nowMin + 60)).length;
}
