import { Briefcase, GraduationCap, Users2 } from "lucide-react";

const audiences = [
  {
    icon: Briefcase,
    title: "Employers & HR Teams",
    desc: "Offer therapy as an employee benefit — reduce burnout, absenteeism, and attrition while supporting your team's mental health.",
    color: "#228756",
    bg: "#f0fdf4"
  },
  {
    icon: GraduationCap,
    title: "Schools & Institutions",
    desc: "Give students and staff confidential access to counselling psychologists and special educators for academic and emotional support.",
    color: "#0369a1",
    bg: "#f0f9ff"
  },
  {
    icon: Users2,
    title: "Hospitals & Wellness Partners",
    desc: "Extend your care network with on-demand clinical psychologists for referrals, co-managed care, and psychometric assessments.",
    color: "#7c3aed",
    bg: "#faf5ff"
  }
];

export default function BusinessAudiences() {
  return (
    <div style={{ padding: '90px 0', backgroundColor: '#fff' }}>
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '56px' }}>
          <div className="col-lg-7 text-center">
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#1e293b', marginBottom: '14px' }}>
              Built for Organizations That Care
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7 }}>
              Whether you're a company, a school, or a healthcare partner — we tailor mental health
              support to fit your people.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {audiences.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="col-lg-4 col-md-6">
                <div style={{
                  height: '100%', padding: '36px 30px', borderRadius: '24px',
                  border: '1px solid #f1f5f9', backgroundColor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    backgroundColor: a.bg, color: a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '22px'
                  }}>
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                    {a.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                    {a.desc}
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
