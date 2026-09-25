import { Sparkles, MessageCircle, Stethoscope } from "lucide-react";

const tiers = [
  {
    icon: Sparkles,
    step: "01",
    title: "Workshops & Self-Care",
    desc: "Stress, burnout, and resilience workshops for teams, plus self-guided resources employees can use anytime — no appointment needed.",
    color: "#b45309",
    bg: "#fffbeb"
  },
  {
    icon: MessageCircle,
    step: "02",
    title: "1:1 Employee Therapy",
    desc: "Employees book private sessions with verified Counselling and Clinical Psychologists — for themselves, their partner, or family — online or in-person.",
    color: "#228756",
    bg: "#f0fdf4"
  },
  {
    icon: Stethoscope,
    step: "03",
    title: "Specialized & Clinical Care",
    desc: "Psychometric assessments, clinical care for complex conditions, and critical-incident support when your workplace needs it most.",
    color: "#0369a1",
    bg: "#f0f9ff"
  }
];

export default function CareModel() {
  return (
    <div id="care-model" style={{ padding: '90px 0', backgroundColor: '#f8fafc', scrollMarginTop: '140px' }}>
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '56px' }}>
          <div className="col-lg-7 text-center">
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#1e293b', marginBottom: '14px' }}>
              A Complete Care Model, In One Platform
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7 }}>
              From everyday work stress to complex clinical needs, your employees get the right level of
              support at every stage.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {tiers.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="col-lg-4">
                <div style={{
                  height: '100%', padding: '40px 32px', borderRadius: '24px',
                  backgroundColor: '#fff', border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.04)', position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute', top: '24px', right: '28px',
                    fontSize: '14px', fontWeight: 800, color: '#e2e8f0'
                  }}>
                    {t.step}
                  </span>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    backgroundColor: t.bg, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '22px'
                  }}>
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                    {t.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                    {t.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
