/* Clinical interpretation for the assessment report, worded as in each questionnaire's manual /
   validation paper: severity bands with their score ranges, the manual's recommended action and any
   scoring detail the manual defines (clusters, domains, cut-points). Used only on the report, so it
   also applies to reports created before this file existed. */

const sum = (a, idx) => idx.reduce((t, i) => t + (Number(a?.[i]) || 0), 0);
const bandOf = (bands, score) => bands.find((b) => score >= b[0] && score <= b[1]);
const tbl = (bands, score) => bands.map(([lo, hi, label]) => ({ range: lo === hi ? `${lo}` : `${lo}–${hi}`, label, current: score != null && score >= lo && score <= hi }));

const PHQ9 = [
  [0, 4, "None–minimal depression", "None."],
  [5, 9, "Mild depression", "Watchful waiting; repeat PHQ-9 at follow-up."],
  [10, 14, "Moderate depression", "Treatment plan, considering counselling, follow-up and/or pharmacotherapy."],
  [15, 19, "Moderately severe depression", "Active treatment with pharmacotherapy and/or psychotherapy."],
  [20, 27, "Severe depression", "Immediate initiation of pharmacotherapy and, if severe impairment or poor response to therapy, expedited referral to a mental-health specialist for psychotherapy and/or collaborative management."],
];
const GAD7 = [[0, 4, "Minimal anxiety"], [5, 9, "Mild anxiety"], [10, 14, "Moderate anxiety"], [15, 21, "Severe anxiety"]];
const K10 = [[10, 15, "Low psychological distress"], [16, 21, "Moderate psychological distress"], [22, 29, "High psychological distress"], [30, 50, "Very high psychological distress"]];
const PHQ15 = [[0, 4, "Minimal somatic symptom severity"], [5, 9, "Low somatic symptom severity"], [10, 14, "Medium somatic symptom severity"], [15, 30, "High somatic symptom severity"]];
const AUDIT = [
  [0, 7, "Zone I — low-risk drinking", "Alcohol education."],
  [8, 15, "Zone II — hazardous drinking", "Simple advice focused on the reduction of hazardous drinking."],
  [16, 19, "Zone III — harmful drinking", "Simple advice plus brief counselling and continued monitoring."],
  [20, 40, "Zone IV — possible alcohol dependence", "Referral to a specialist for diagnostic evaluation and treatment of alcohol dependence."],
];
const EPDS = [[0, 9, "Below the threshold for depression"], [10, 12, "Possible depression"], [13, 30, "Probable depression (depressive illness of varying severity)"]];
const RSES = [[0, 14, "Low self-esteem"], [15, 25, "Self-esteem within the normal range"], [26, 30, "High self-esteem"]];
const PCL5 = [[0, 30, "Below the provisional PTSD cut-point"], [31, 80, "At or above the cut-point (31–33) — probable PTSD"]];
const DASS = {
  depression: { label: "Depression", items: [2, 4, 9, 12, 15, 16, 20], bands: [[0, 9, "Normal"], [10, 13, "Mild"], [14, 20, "Moderate"], [21, 27, "Severe"], [28, 42, "Extremely severe"]] },
  anxiety: { label: "Anxiety", items: [1, 3, 6, 8, 14, 18, 19], bands: [[0, 7, "Normal"], [8, 9, "Mild"], [10, 14, "Moderate"], [15, 19, "Severe"], [20, 42, "Extremely severe"]] },
  stress: { label: "Stress", items: [0, 5, 7, 10, 11, 13, 17], bands: [[0, 14, "Normal"], [15, 18, "Mild"], [19, 25, "Moderate"], [26, 33, "Severe"], [34, 42, "Extremely severe"]] },
};
const CBI = [[0, 49, "Low / no burnout"], [50, 74, "Moderate burnout"], [75, 99, "High burnout"], [100, 100, "Severe burnout"]];

/* Returns { headline, score, max, bands, bandTitle, interpretation[], action, details[], notes[], alerts[] } */
export function clinicalOf(tool, result = {}, answers = []) {
  const s = result?.score;
  switch (tool) {
    case "phq9": {
      const b = bandOf(PHQ9, s) || PHQ9[0];
      const item9 = Number(answers?.[8]) || 0;
      return {
        headline: b[2], score: s, max: 27, bandTitle: "PHQ-9 depression severity (Kroenke, Spitzer & Williams, 2001)",
        bands: tbl(PHQ9, s),
        interpretation: [`Total score ${s} of 27, in the ${b[2].toLowerCase()} range.`, s >= 10 ? "A score of 10 or more is the recommended cut-point for major depression (sensitivity 88%, specificity 88%)." : "The score is below the cut-point of 10 used to screen for major depression."],
        action: b[3],
        details: [`Item 9 (thoughts of being better off dead or of self-harm): ${["not at all", "several days", "more than half the days", "nearly every day"][item9] || "—"}.`],
        notes: [], alerts: item9 > 0 ? ["Item 9 endorsed — a suicide risk assessment is indicated, irrespective of the total score."] : [],
      };
    }
    case "gad7": {
      const b = bandOf(GAD7, s) || GAD7[0];
      return {
        headline: b[2], score: s, max: 21, bandTitle: "GAD-7 anxiety severity (Spitzer et al., 2006)", bands: tbl(GAD7, s),
        interpretation: [`Total score ${s} of 21, in the ${b[2].toLowerCase()} range.`, s >= 10 ? "A score of 10 or more is the recommended cut-point for identifying generalised anxiety disorder (sensitivity 89%, specificity 82%) and warrants further clinical evaluation." : "The score is below the cut-point of 10 used to identify probable generalised anxiety disorder."],
        action: s >= 10 ? "Further evaluation for an anxiety disorder; the GAD-7 also screens reasonably for panic, social anxiety and post-traumatic stress disorders." : "Monitor; repeat at follow-up if symptoms persist.",
        details: [], notes: [],
      };
    }
    case "dass21": {
      const dims = result?.dims || {};
      const rows = Object.entries(DASS).map(([k, d]) => {
        const v = dims[k] ?? sum(answers, d.items) * 2;
        const b = bandOf(d.bands, v) || d.bands[0];
        return `${d.label}: ${v} (${b[2].toLowerCase()}; normal ${d.bands[0][0]}–${d.bands[0][1]})`;
      });
      return {
        headline: "DASS-21 subscale profile", score: null, max: null, bandTitle: "DASS severity labels (Lovibond & Lovibond, 1995) — subscale scores × 2",
        bands: Object.values(DASS).map((d) => ({ range: d.label, label: d.bands.map(([lo, hi, l]) => `${l} ${lo}–${hi}`).join(" · "), current: false })),
        interpretation: rows,
        action: "Interpret each subscale separately; elevated subscales indicate the area for further clinical assessment.",
        details: [], notes: ["The DASS is a dimensional measure; severity labels describe a score's position relative to the population and do not imply a diagnosis."],
      };
    }
    case "k10": {
      const b = bandOf(K10, s) || K10[0];
      return {
        headline: b[2], score: s, max: 50, bandTitle: "K10 levels of psychological distress (Andrews & Slade, 2001)", bands: tbl(K10, s),
        interpretation: [`Total score ${s} (range 10–50), indicating ${b[2].toLowerCase()} over the past 30 days.`, s >= 30 ? "Very high scores are associated with a high likelihood of a current anxiety or depressive disorder." : s >= 22 ? "High scores indicate a likely current anxiety or depressive disorder that warrants clinical assessment." : ""].filter(Boolean),
        action: s >= 22 ? "Clinical assessment for anxiety and depressive disorders." : s >= 16 ? "Monitor and review at follow-up." : "No further action indicated on this measure.",
        details: [], notes: [],
      };
    }
    case "pcl5": {
      const sym = (idx, n) => idx.filter((i) => (Number(answers?.[i]) || 0) >= 2).length >= n;
      const B = sym([0, 1, 2, 3, 4], 1), C = sym([5, 6], 1), D = sym([7, 8, 9, 10, 11, 12, 13], 2), E = sym([14, 15, 16, 17, 18, 19], 2);
      const clusters = B && C && D && E;
      const b = bandOf(PCL5, s) || PCL5[0];
      const yn = (v) => (v ? "met" : "not met");
      return {
        headline: b[2], score: s, max: 80, bandTitle: "PCL-5 provisional PTSD cut-point (Weathers et al., 2013; NCPTSD)", bands: tbl(PCL5, s),
        interpretation: [`Total symptom severity ${s} of 80. A cut-point of 31–33 is indicative of probable PTSD.`, `DSM-5 symptom-cluster method (item rated 2 = "Moderately" or higher): ${clusters ? "criteria met for a provisional PTSD diagnosis" : "criteria not met"}.`],
        action: s >= 31 || clusters ? "Confirm with a structured clinical interview (e.g. CAPS-5); the PCL-5 alone does not establish a diagnosis." : "Monitor; re-administer to track change (a 5–10 point change represents reliable change; a 10–20 point change represents clinically significant change).",
        details: [`Cluster B intrusion (items 1–5, ≥1): ${yn(B)} · Cluster C avoidance (items 6–7, ≥1): ${yn(C)} · Cluster D negative alterations in cognition and mood (items 8–14, ≥2): ${yn(D)} · Cluster E alterations in arousal and reactivity (items 15–20, ≥2): ${yn(E)}.`],
        notes: [],
      };
    }
    case "phq15": {
      const b = bandOf(PHQ15, s) || PHQ15[0];
      return {
        headline: b[2], score: s, max: 30, bandTitle: "PHQ-15 somatic symptom severity (Kroenke, Spitzer & Williams, 2002)", bands: tbl(PHQ15, s),
        interpretation: [`Total score ${s} of 30, indicating ${b[2].toLowerCase()} over the past 4 weeks.`],
        action: s >= 10 ? "Evaluate for somatic symptom burden alongside medical assessment to exclude physical causes." : "No further action indicated on this measure.",
        details: [], notes: ["Somatic symptoms may have medical causes; interpret together with a medical evaluation."],
      };
    }
    case "audit": {
      const b = bandOf(AUDIT, s) || AUDIT[0];
      const cons = sum(answers, [0, 1, 2]), dep = sum(answers, [3, 4, 5]), harm = sum(answers, [6, 7, 8, 9]);
      return {
        headline: b[2], score: s, max: 40, bandTitle: "AUDIT risk levels (WHO; Babor et al., 2001)", bands: tbl(AUDIT, s),
        interpretation: [`Total score ${s} of 40 — ${b[2]}.`],
        action: b[3],
        details: [`Domain scores — consumption (items 1–3): ${cons}/12 · dependence symptoms (items 4–6): ${dep}/12 · alcohol-related harm (items 7–10): ${harm}/16.`],
        notes: [
          ...(dep > 0 ? ["Points scored above 0 on items 4–6 (especially weekly or daily symptoms) imply the presence or incipient presence of alcohol dependence."] : []),
          ...(harm > 0 ? ["Points scored on items 7–10 indicate that alcohol-related harm is already being experienced."] : []),
        ],
      };
    }
    case "asrs": {
      const pos = [0, 1, 2, 3, 4, 5].filter((i) => (Number(answers?.[i]) || 0) >= (i < 3 ? 2 : 3)).length;
      const hit = (s ?? pos) >= 4;
      return {
        headline: hit ? "Symptoms highly consistent with adult ADHD" : "Below the ASRS v1.1 Part A screening threshold",
        score: s ?? pos, max: 6, bandTitle: "ASRS v1.1 Screener — Part A (Kessler et al., 2005)",
        bands: [{ range: "0–3", label: "Below screening threshold", current: !hit }, { range: "4–6", label: "Highly consistent with adult ADHD", current: hit }],
        interpretation: [`${s ?? pos} of 6 responses fall in the darkly shaded boxes.`, "Four or more marks in the shaded boxes of Part A indicate symptoms highly consistent with ADHD in adults."],
        action: hit ? "Further investigation is warranted, including a full diagnostic assessment for adult ADHD." : "No further screening action indicated on this measure.",
        details: [], notes: ["The screener does not establish a diagnosis."],
      };
    }
    case "epds": {
      const b = bandOf(EPDS, s) || EPDS[0];
      const item10 = Number(answers?.[9]) || 0;
      return {
        headline: b[2], score: s, max: 30, bandTitle: "EPDS cut-offs (Cox, Holden & Sagovsky, 1987)", bands: tbl(EPDS, s),
        interpretation: [`Total score ${s} of 30 for the past 7 days — ${b[2].toLowerCase()}.`, "Scores of 13 or more indicate a likely depressive illness of varying severity; 10–12 indicates possible depression."],
        action: s >= 13 ? "Clinical assessment for perinatal depression." : s >= 10 ? "Repeat the EPDS in 2–4 weeks and review clinically." : "Routine monitoring.",
        details: [`Item 10 (thought of harming oneself): ${item10 > 0 ? "endorsed" : "not endorsed"}.`],
        notes: ["The EPDS does not detect anxiety neuroses, phobias or personality disorders; clinical judgement takes precedence over the score."],
        alerts: item10 > 0 ? ["Item 10 endorsed — immediate risk assessment is indicated, irrespective of the total score."] : [],
      };
    }
    case "cbi": {
      const dims = result?.dims || {};
      const row = (k, label) => { const v = dims[k]; const b = bandOf(CBI, v) || CBI[0]; return `${label}: ${v ?? "—"} of 100 (${b[2].toLowerCase()})`; };
      return {
        headline: result?.level || "CBI profile", score: null, max: null, bandTitle: "CBI burnout levels (Kristensen et al., 2005; Borritz et al., 2006) — mean scale score 0–100",
        bands: CBI.map(([lo, hi, l]) => ({ range: lo === hi ? `${lo}` : `${lo}–${hi}`, label: l, current: false })),
        interpretation: [row("personal", "Personal burnout"), row("work", "Work-related burnout")],
        action: "Scores of 50 or more indicate burnout requiring attention to workload, recovery and work-related stressors.",
        details: [], notes: [],
      };
    }
    case "rses": {
      const b = bandOf(RSES, s) || RSES[1];
      return {
        headline: b[2], score: s, max: 30, bandTitle: "Rosenberg Self-Esteem Scale (Rosenberg, 1965)", bands: tbl(RSES, s),
        interpretation: [`Total score ${s} of 30. Scores between 15 and 25 are within the normal range; scores below 15 suggest low self-esteem.`],
        action: s < 15 ? "Explore self-evaluation and core beliefs in therapy." : "No further action indicated on this measure.",
        details: [], notes: [],
      };
    }
    case "bigfive": {
      return {
        headline: "IPIP Big-Five factor profile", score: null, max: null, bandTitle: "IPIP-50 Big-Five Factor Markers (Goldberg, 1992)",
        bands: [],
        interpretation: ["Factor scores are expressed as the position within the possible scale range (0–100); 33 and below = low, 34–66 = average, 67 and above = high."],
        action: "Use descriptively to inform case formulation; the IPIP-50 has no clinical cut-offs.",
        details: [], notes: ["Scores are not compared with population norms."],
      };
    }
    default:
      return { headline: result?.level || "", score: s, max: result?.max ?? null, bandTitle: "", bands: [], interpretation: [], action: "", details: [], notes: [] };
  }
}
