/* One-line statements for the "helps with" list on a therapist profile. Each keyword a therapist picks
   (utils/static-lists.js) gets a short line (fits one line on a phone) that contains the keyword itself — readable for clients, and
   the words people search for stay on the page. Wording: support, never a promise of a result.
   [before, keyword as shown, after] — the keyword is printed in bold between the two parts. */

const LINES = {
  // everyday wellbeing
  "stress management": ["", "Stress management", " at work and home"],
  "anxiety": ["Calm for ", "anxiety", " and overthinking"],
  "depression": ["Support for ", "depression", " and low mood"],
  "self esteem": ["Building ", "self-esteem", " and confidence"],
  "time management": ["Better ", "time management", " habits"],
  "work life balance": ["A healthier ", "work-life balance", ""],
  "burnout": ["Recovery from ", "burnout", " and exhaustion"],
  "life transitions": ["Coping with ", "life transitions", " and change"],
  "grief and loss": ["Space to heal from ", "grief and loss", ""],
  "anger management": ["", "Anger management", " and calmer responses"],
  "motivation": ["Rebuilding ", "motivation", " when stuck"],
  // mental health conditions — the full name is the line
  "generalized anxiety disorder (gad)": ["", "Generalized Anxiety Disorder (GAD)", ""],
  "major depressive disorder (mdd)": ["", "Major Depressive Disorder (MDD)", ""],
  "bipolar disorder": ["Therapy for ", "bipolar disorder", ""],
  "obsessive-compulsive disorder (ocd)": ["", "Obsessive-Compulsive Disorder (OCD)", ""],
  "post-traumatic stress disorder (ptsd)": ["", "Post-Traumatic Stress Disorder (PTSD)", ""],
  "attention deficit hyperactivity disorder (adhd)": ["", "ADHD", " — focus and planning support"],
  "autism spectrum disorder (asd)": ["", "Autism Spectrum Disorder (ASD)", ""],
  "schizophrenia": ["Supportive therapy for ", "schizophrenia", ""],
  "personality disorders": ["Therapy for ", "personality disorders", ""],
  "eating disorders": ["Support for ", "eating disorders", ""],
  // relationships
  "marital counselling": ["", "Marital counselling", " for couples"],
  "parent-child relationship": ["A closer ", "parent-child relationship", ""],
  "couples counselling": ["", "Couples counselling", " to reconnect"],
  "divorce and separation": ["Support through ", "divorce and separation", ""],
  "conflict resolution": ["Healthy ", "conflict resolution", " skills"],
  "communication issues": ["Working on ", "communication issues", ""],
  "trust issues": ["Healing ", "trust issues", " and betrayal"],
  "intimacy issues": ["A safe space for ", "intimacy issues", ""],
  "pre-marital counselling": ["", "Pre-marital counselling", " for couples"],
  "family therapy": ["", "Family therapy", " for a calmer home"],
};

const GROUPS = {
  wellbeing: ["stress management", "anxiety", "depression", "self esteem", "time management", "work life balance", "burnout", "life transitions", "grief and loss", "anger management", "motivation"],
  conditions: ["generalized anxiety disorder (gad)", "major depressive disorder (mdd)", "bipolar disorder", "obsessive-compulsive disorder (ocd)", "post-traumatic stress disorder (ptsd)", "attention deficit hyperactivity disorder (adhd)", "autism spectrum disorder (asd)", "schizophrenia", "personality disorders", "eating disorders"],
  relationships: ["marital counselling", "parent-child relationship", "couples counselling", "divorce and separation", "conflict resolution", "communication issues", "trust issues", "intimacy issues", "pre-marital counselling", "family therapy"],
};
const GROUP_OF = Object.fromEntries(Object.entries(GROUPS).flatMap(([g, keys]) => keys.map((k) => [k, g])));
export const GROUP_LABEL = { wellbeing: "Everyday wellbeing", conditions: "Mental health conditions", relationships: "Relationships & family", other: "Other areas" };

const keyOf = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

// a keyword typed by hand (not from the list) still gets a sentence with the keyword in it
export const concernLine = (keyword) => LINES[keyOf(keyword)] || ["Support with ", keyword, ""];

// [{ group, label, items: [{ keyword, line: [before, kw, after] }] }] in a fixed group order
export const groupConcerns = (keywords) => {
  const by = {};
  for (const k of keywords) {
    const g = GROUP_OF[keyOf(k)] || "other";
    (by[g] = by[g] || []).push({ keyword: k, line: concernLine(k) });
  }
  return ["wellbeing", "conditions", "relationships", "other"].filter((g) => by[g]).map((g) => ({ group: g, label: GROUP_LABEL[g], items: by[g] }));
};

/* Therapy approaches (static-lists therapyoptionlist) — same idea: a short line with the method's name in it.
   Long official names are the whole line. */
const APPROACH_LINES = {
  "cognitive behavioural therapy (cbt)": ["", "Cognitive Behavioural Therapy (CBT)", ""],
  "dialectical behavioural therapy (dbt)": ["", "Dialectical Behavioural Therapy (DBT)", ""],
  "psychodynamic therapy": ["", "Psychodynamic therapy", " for root causes"],
  "humanistic therapy": ["", "Humanistic therapy", ", person-centred"],
  "mindfulness-based therapy": ["", "Mindfulness-based therapy", " for calm"],
  "solution-focused brief therapy (sfbt)": ["", "Solution-Focused Brief Therapy (SFBT)", ""],
  "acceptance and commitment therapy (act)": ["", "Acceptance and Commitment Therapy (ACT)", ""],
  "eye movement desensitization and reprocessing (emdr)": ["", "EMDR", " for trauma and painful memories"],
  "art therapy": ["", "Art therapy", " to express what words can't"],
  "play therapy": ["", "Play therapy", " for children"],
  "group therapy": ["", "Group therapy", " with shared support"],
  "family therapy": ["", "Family therapy", " for a calmer home"],
  "narrative therapy": ["", "Narrative therapy", " to rewrite your story"],
  "interpersonal therapy (ipt)": ["", "Interpersonal Therapy (IPT)", ""],
};

// [{ group, label: null, items }] — one unlabelled group, in the therapist's order
export const approachLines = (keywords) => [{
  group: "approaches",
  label: null,
  items: keywords.map((k) => ({ keyword: k, line: APPROACH_LINES[keyOf(k)] || ["", k, ""] })),
}];
