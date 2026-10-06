// Shared helpers for the therapist directory (/view-all-therapist): fees, session modes,
// next available day, sorting, the "Help me choose" concerns, FAQ and the slimmed-down
// SSR payload. Used by the page (server) and the directory component (client).

export const split = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).trim()).filter(Boolean);
  return String(raw).split(",").map((v) => v.trim()).filter(Boolean);
};

export const getMinFee = (fees) => {
  if (!Array.isArray(fees)) return null;
  const all = fees
    .filter((f) => f && Array.isArray(f.formats))
    .flatMap((f) => f.formats.filter((x) => x && typeof x.fee === "number" && x.fee > 0).map((x) => x.fee));
  return all.length ? Math.min(...all) : null;
};

// "Video Call, Audio call, In-Person" -> { online: true, inPerson: true, video, audio }
export const sessionModes = (t) => {
  const f = String(t?.session_formats || "").toLowerCase();
  const video = f.includes("video");
  const audio = f.includes("audio");
  return { video, audio, online: video || audio, inPerson: f.includes("person") };
};

export const avgRating = (t) => {
  const r = (t?.reviews || []).filter((x) => typeof x.rating === "number");
  return r.length ? r.reduce((a, x) => a + x.rating, 0) / r.length : 0;
};

// "3-5 Years" -> 3, "21+ Years" -> 21
export const expYears = (t) => {
  const m = String(t?.year_of_exp || "").match(/\d+/);
  return m ? Number(m[0]) : 0;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMin = (s) => {
  const m = String(s || "").trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3] === "pm") h += 12;
  return h * 60 + Number(m[2] || 0);
};
const fmtMin = (min) => {
  const h = Math.floor(min / 60), mm = min % 60;
  return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

// Next day the therapist's weekly schedule has an opening (IST), at least an hour from now.
// It's the weekly schedule, not live bookings — so the card says "Available today", not a
// guaranteed slot. `now` is passed in (client only) so server and client HTML match.
export const nextAvailable = (t, now) => {
  if (!now || !Array.isArray(t?.availabilities)) return null;
  const ist = new Date(now + 330 * 60000);
  const nowMin = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  for (let d = 0; d < 7; d++) {
    const day = DAYS[(ist.getUTCDay() + d) % 7];
    const slot = t.availabilities.find((a) => a?.day === day);
    const opens = (slot?.times || []).map((x) => toMin(x.open)).filter((x) => x !== null)
      .filter((x) => d > 0 || x >= nowMin + 60).sort((a, b) => a - b);
    if (opens.length) {
      return {
        days: d,
        label: d === 0 ? "Today" : d === 1 ? "Tomorrow" : day.slice(0, 3),
        time: fmtMin(opens[0]),
        rank: d * 1440 + opens[0],
      };
    }
  }
  return null;
};

export const SORTS = [
  { value: "", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "fee", label: "Lowest fee" },
  { value: "exp", label: "Most experienced" },
  { value: "soon", label: "Available soonest" },
];

const prio = (t) => (t.priority === 1 ? 0 : t.priority === 2 ? 1 : 2);

export const sortTherapists = (list, sort, now) => {
  const arr = list.map((t, i) => ({ t, i }));
  const by = {
    rating: (a, b) => avgRating(b.t) - avgRating(a.t) || (b.t.reviews?.length || 0) - (a.t.reviews?.length || 0),
    fee: (a, b) => (getMinFee(a.t.fees) ?? 1e9) - (getMinFee(b.t.fees) ?? 1e9),
    exp: (a, b) => expYears(b.t) - expYears(a.t),
    soon: (a, b) => (nextAvailable(a.t, now)?.rank ?? 1e9) - (nextAvailable(b.t, now)?.rank ?? 1e9),
  }[sort];
  arr.sort((a, b) => (by ? by(a, b) : 0) || prio(a.t) - prio(b.t) || a.i - b.i);
  return arr.map((x) => x.t);
};

// "Help me choose" + the concern filter's quick picks: friendly label -> expertise value
export const CONCERNS = [
  { label: "Anxiety", value: "Anxiety" },
  { label: "Stress", value: "Stress Management" },
  { label: "Low mood / depression", value: "Depression" },
  { label: "Relationship / couple", value: "Couples Counselling" },
  { label: "Anger", value: "Anger Management" },
  { label: "Self-esteem", value: "Self Esteem" },
  { label: "Work burnout", value: "Burnout" },
  { label: "Grief & loss", value: "Grief And Loss" },
  { label: "Parenting / child", value: "Parent-Child Relationship" },
  { label: "OCD", value: "Obsessive-Compulsive Disorder (OCD)" },
  { label: "ADHD", value: "Attention Deficit Hyperactivity Disorder (ADHD)" },
  { label: "Trauma / PTSD", value: "Post-Traumatic Stress Disorder (PTSD)" },
];

export const MODES = [
  { value: "online", label: "Online (video / audio)" },
  { value: "in-person", label: "In-person" },
];

// /psychologist-in/<slug> landing pages (src/pages/psychologist-in/[state].js)
export const PLACE_LINKS = [
  ["delhi", "Delhi"], ["uttar-pradesh", "Uttar Pradesh"], ["lucknow", "Lucknow"], ["maharashtra", "Maharashtra"],
  ["mumbai", "Mumbai"], ["pune", "Pune"], ["bangalore", "Bangalore"], ["hyderabad", "Hyderabad"],
  ["chennai", "Chennai"], ["kolkata", "Kolkata"], ["west-bengal", "West Bengal"], ["rajasthan", "Rajasthan"],
  ["jaipur", "Jaipur"], ["gujarat", "Gujarat"], ["ahmedabad", "Ahmedabad"], ["chandigarh", "Chandigarh"],
  ["uttarakhand", "Uttarakhand"], ["andhra-pradesh", "Andhra Pradesh"],
];

// typical fee band (25th–75th percentile of each therapist's lowest fee), for the FAQ
export const feeBand = (list) => {
  const fees = list.map((t) => getMinFee(t.fees)).filter(Boolean).sort((a, b) => a - b);
  if (!fees.length) return null;
  const q = (p) => fees[Math.min(fees.length - 1, Math.floor(p * fees.length))];
  return { min: fees[0], lo: q(0.25), hi: q(0.75) };
};

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const directoryFaqs = (band) => [
  {
    q: "How do I choose the right therapist?",
    a: "Start with what you want help with — pick it under “Concern”, or use “Help me choose” and answer three quick questions. Then compare a few profiles: their areas of expertise, languages, experience and fees. If you're still unsure, book a 15-minute call with our team and we'll suggest a good fit.",
  },
  {
    q: "How much does a therapy session cost?",
    a: band
      ? `Fees are set by each therapist. On Choose Your Therapist sessions start from ${inr(band.min)}, and most therapists charge between ${inr(band.lo)} and ${inr(band.hi)} per session. Every profile shows its exact fees before you book.`
      : "Fees are set by each therapist and shown on every profile before you book.",
  },
  {
    q: "Can I have sessions online, or do I need to visit?",
    a: "Almost every therapist offers online sessions over video or audio call, so you can talk from home anywhere in India. Many also see clients in person — choose “In-person” under Session mode to see them.",
  },
  {
    q: "Are the therapists verified?",
    a: "Yes. Every therapist's qualifications and documents are checked by our team before their profile goes live, and profiles marked ★ Top Pick are handpicked by the CYT team.",
  },
  {
    q: "Is what I share kept confidential?",
    a: "Yes. Sessions are private between you and your therapist, and we never show your phone number or email on the site.",
  },
];

// The directory only needs a fraction of each therapist document — sending everything
// made the page's HTML ~250 KB heavier.
export const slimTherapist = (t) => ({
  _id: t._id,
  user: {
    name: t.user?.name || "",
    profile: t.user?.profile || "",
    gender: t.user?.gender || "",
    bio: String(t.user?.bio || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
  },
  profile_type: t.profile_type || "",
  state: t.state || "",
  office_address: t.office_address || "",
  year_of_exp: t.year_of_exp || "",
  language_spoken: t.language_spoken || "",
  session_formats: t.session_formats || "",
  services: t.services || "",
  experties: t.experties || "",
  priority: t.priority ?? null,
  fees: (t.fees || []).map((f) => ({ name: f.name, formats: (f.formats || []).map((x) => ({ type: x.type, fee: x.fee })) })),
  availabilities: (t.availabilities || []).map((a) => ({ day: a.day, times: (a.times || []).map((x) => ({ open: x.open })) })),
  reviews: (t.reviews || []).map((r) => ({ rating: r.rating })),
});
