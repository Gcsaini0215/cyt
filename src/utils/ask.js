// "Ask a psychologist" — shared bits for /client/ask, /ask-a-psychologist and the therapist page.
// Category keys must match the backend (cyt_backend_api AskController CATEGORIES).
export const ASK_CATEGORIES = [
  ["anxiety", "Anxiety & worry"],
  ["depression", "Low mood"],
  ["relationships", "Relationships"],
  ["stress", "Stress"],
  ["work", "Work & career"],
  ["sleep", "Sleep"],
  ["anger", "Anger"],
  ["self-esteem", "Self-esteem"],
  ["family", "Family"],
  ["parenting", "Parenting"],
  ["grief", "Grief & loss"],
  ["other", "Something else"],
];
export const ASK_LABEL = Object.fromEntries(ASK_CATEGORIES);
export const ASK_AGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
export const ASK_GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
export const ASK_PATH = "/ask-a-psychologist";

// India's free 24x7 lines — shown whenever a question sounds like someone may be in danger
export const HELPLINES = [
  ["Tele-MANAS (Govt. of India, 24x7, free)", "14416"],
  ["Emergency", "112"],
  ["KIRAN mental health helpline", "1800-599-0019"],
];

export const fmtAskDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
