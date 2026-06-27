import React, { useState, useEffect } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <>
      <style>{`
        .sa-cards-section { background: #f8fafc; padding: ${isMobile ? "24px 0 40px" : "60px 0"}; }
        .sa-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; transition: box-shadow .2s, transform .2s; display: flex; flex-direction: column; height: 100%; }
        .sa-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.10); transform: translateY(-4px); }
        .sa-card-top { padding: 24px 22px 16px; flex: 1; }
        .sa-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
        .sa-card-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .sa-card-short { font-size: 11px; font-weight: 700; letter-spacing: .8px; margin: 0 0 10px; }
        .sa-card-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }
        .sa-card-meta { display: flex; gap: 6px; flex-wrap: wrap; padding: 12px 22px; border-top: 1px solid #f1f5f9; }
        .sa-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px; }
        .sa-card-btn { display: block; width: 100%; padding: 13px; text-align: center; font-size: 14px; font-weight: 700; color: #fff; border: none; cursor: pointer; transition: opacity .2s, transform .2s; }
        .sa-card-btn:hover { opacity: .88; transform: translateY(-1px); }
        @media (max-width: 767px) {
          .sa-cards-section { padding: 24px 0 40px; }
        }
      `}</style>

      <div className="sa-cards-section">
        <div className={isMobile ? "" : "container"} style={isMobile ? { padding: "0 12px" } : {}}>

          <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 40 }}>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 800, color: "#16a34a",
              letterSpacing: 1.4, textTransform: "uppercase", background: "#dcfce7",
              padding: "5px 14px", borderRadius: 50, marginBottom: 12,
            }}>Choose Your Assessment</span>
            <h2 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>
              What Would You Like to Explore?
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              Each assessment takes just a few minutes and gives you clinically-grounded insights.
            </p>
          </div>

          <div className="row g-3">
            {assessments.map((a) => (
              <div key={a.id} className="col-12 col-sm-6 col-lg-4">
                <div className="sa-card">
                  <div className="sa-card-top">
                    <div className="sa-card-icon" style={{ background: `${a.color}18`, color: a.color }}>
                      <i className={a.icon}></i>
                    </div>
                    <div className="sa-card-title">{a.title}</div>
                    <div className="sa-card-short" style={{ color: a.color }}>{a.short}</div>
                    <p className="sa-card-desc">{a.description}</p>
                  </div>

                  <div className="sa-card-meta">
                    <span className="sa-chip" style={{ background: `${a.color}14`, color: a.color }}>
                      {a.questions} Questions
                    </span>
                    <span className="sa-chip" style={{ background: "#f1f5f9", color: "#475569" }}>
                      {a.duration}
                    </span>
                    <span className="sa-chip" style={{ background: `${a.color}14`, color: a.color }}>
                      {a.age}
                    </span>
                  </div>

                  <button
                    className="sa-card-btn"
                    style={{ background: a.color }}
                    onClick={() => onSelectAssessment(a.id)}
                  >
                    Start Assessment →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
