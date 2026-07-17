import { ClipboardCheck, Users, Rocket, LineChart } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Discovery Call",
    desc: "Share your organization's size, goals, and mental health needs on a short call with our team.",
  },
  {
    icon: Users,
    step: "02",
    title: "Plan & Matching",
    desc: "We recommend a care mix — self-guided, therapy, or clinical — and match psychologists to your population.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Rollout",
    desc: "Your employees, students, or members get access credentials and can start booking within days.",
  },
  {
    icon: LineChart,
    step: "04",
    title: "Ongoing Reporting",
    desc: "Receive anonymized usage insights so you can track engagement without compromising confidentiality.",
  },
];

export default function OnboardingSteps() {
  return (
    <div style={{ padding: '90px 0', backgroundColor: '#f8fafc' }}>
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '56px' }}>
          <div className="col-lg-7 text-center">
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#1e293b', marginBottom: '14px' }}>
              How Onboarding Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7 }}>
              From first conversation to full rollout — most organizations are live within days, not months.
            </p>
          </div>
        </div>

        <div className="row g-4" style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '48px', left: '12%', right: '12%', height: '2px',
            background: 'repeating-linear-gradient(90deg, #cbd5e1 0, #cbd5e1 8px, transparent 8px, transparent 16px)',
            zIndex: 0
          }} className="d-none d-lg-block" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="col-lg-3 col-md-6" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '96px', height: '96px', borderRadius: '50%',
                    backgroundColor: '#fff', border: '2px solid #228756',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(34,135,86,0.12)'
                  }}>
                    <Icon size={34} color="#228756" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>
                    STEP {s.step}
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                    {s.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto' }}>
                    {s.desc}
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
