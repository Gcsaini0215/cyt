import React from "react";

const assessments = [
  {
    id: 1,
    icon: "feather-moon",
    title: "Depression Screening",
    short: "PHQ-9",
    description: "Assess your mood and emotional well-being with this clinically validated screening tool.",
    questions: 9,
    duration: "5–7 min",
    age: "Ages 13+",
    color: "#3b82f6",
  },
  {
    id: 2,
    icon: "feather-wind",
    title: "Anxiety Assessment",
    short: "GAD-7",
    description: "Evaluate your anxiety levels and worry patterns with a globally recognised scale.",
    questions: 7,
    duration: "5–7 min",
    age: "Ages 13+",
    color: "#f59e0b",
  },
  {
    id: 3,
    icon: "feather-sunset",
    title: "Sleep Quality Index",
    short: "PSQI",
    description: "Understand your sleep patterns and identify factors affecting your rest quality.",
    questions: 19,
    duration: "5–10 min",
    age: "Ages 18+",
    color: "#8b5cf6",
  },
  {
    id: 4,
    icon: "feather-shield",
    title: "PTSD Checklist",
    short: "PCL-5",
    description: "Screen for post-traumatic stress symptoms using a DSM-5 evidence-based tool.",
    questions: 20,
    duration: "7–10 min",
    age: "Ages 14+",
    color: "#ef4444",
  },
  {
    id: 5,
    icon: "feather-user",
    title: "Big Five Personality",
    short: "OCEAN",
    description: "Discover your personality across 5 major dimensions with deep personal insights.",
    questions: 50,
    duration: "8–12 min",
    age: "Ages 14+",
    color: "#16a34a",
  },
];

export default function AssessmentCards({ onSelectAssessment }) {
  return (
    <>
      <style>{`
        .sa-section { background: #f8fafc; padding: 52px 0; }
        .sa-row { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; display: flex; align-items: center; gap: 20px; padding: 20px 24px; transition: box-shadow .2s, border-color .2s; cursor: pointer; }
        .sa-row:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); border-color: #cbd5e1; }
        .sa-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .sa-info { flex: 1; min-width: 0; }
        .sa-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 3px; }
        .sa-desc { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
        .sa-meta { display: flex; gap: 6px; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .sa-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px; white-space: nowrap; }
        .sa-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #fff; border: none; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: opacity .2s; }
        .sa-btn:hover { opacity: .85; }
        @media (max-width: 767px) {
          .sa-section { padding: 32px 0; }
          .sa-row { flex-wrap: wrap; gap: 14px; padding: 16px; }
          .sa-meta { justify-content: flex-start; }
          .sa-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="sa-section">
        <div className="container">

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 800, color: "#16a34a",
              letterSpacing: 1.4, textTransform: "uppercase", background: "#dcfce7",
              padding: "5px 14px", borderRadius: 50, marginBottom: 12,
            }}>Choose Your Assessment</span>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>
              What Would You Like to Explore?
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              Each assessment takes a few minutes and gives you clinically-grounded insights.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assessments.map((a) => (
              <div key={a.id} className="sa-row" onClick={() => onSelectAssessment(a.id)}>

                {/* Icon */}
                <div className="sa-icon" style={{ background: `${a.color}18`, color: a.color }}>
                  <i className={a.icon}></i>
                </div>

                {/* Title + desc */}
                <div className="sa-info">
                  <div className="sa-title">
                    {a.title}
                    <span style={{ fontSize: 11, fontWeight: 700, color: a.color, marginLeft: 8 }}>{a.short}</span>
                  </div>
                  <p className="sa-desc">{a.description}</p>
                </div>

                {/* Chips */}
                <div className="sa-meta">
                  <span className="sa-chip" style={{ background: `${a.color}14`, color: a.color }}>{a.questions} Qs</span>
                  <span className="sa-chip" style={{ background: "#f1f5f9", color: "#475569" }}>{a.duration}</span>
                  <span className="sa-chip" style={{ background: "#f1f5f9", color: "#475569" }}>{a.age}</span>
                </div>

                {/* Button */}
                <button className="sa-btn" style={{ background: a.color }} onClick={(e) => { e.stopPropagation(); onSelectAssessment(a.id); }}>
                  Start <i className="feather-arrow-right" style={{ fontSize: 13 }}></i>
                </button>

              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
