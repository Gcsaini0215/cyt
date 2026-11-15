// How much of each session fee the therapist keeps — the levels in the backend's helper/achievements.js.
// One list for the registration page and /therapist-how-it-works, so both always show the same numbers.
export const SHARE_STEPS = [
  { you: 70, cyt: 30, when: "When you join", how: "Every session booked through CYT" },
  { you: 75, cyt: 25, when: "Level 1", how: "Rising Star (10 reviews of 4★+) + 25 sessions" },
  { you: 80, cyt: 20, when: "Level 2", how: "+ 100 sessions + Client Favourite (50 reviews of 4★+)" },
  { you: 85, cyt: 15, when: "Level 3", how: "All CYT achievements" },
  { you: 93, cyt: 7, when: "Top level", how: "+2% for every 100 sessions after that, up to 93%" },
];

export const SHARE_RULES =
  "Each session keeps the share it was completed at. If your average rating drops under 4★, CYT's share is 30% until it's back to 4★. CYT never keeps less than 7%.";
