import { HeartHandshake, Flame, UsersRound, Building, ClipboardList, LifeBuoy } from "lucide-react";

export const corporateServices = [
  {
    icon: HeartHandshake,
    title: "Employee Assistance Program (EAP)",
    desc: "Confidential 1:1 counselling for employees and their families with verified psychologists — online across India or in person — for stress, anxiety, burnout, relationships, and grief.",
  },
  {
    icon: Flame,
    title: "Stress & Burnout Workshops",
    desc: "Interactive sessions on stress management, resilience, work-life balance, and emotional wellbeing — delivered on-site or virtually for teams of any size.",
  },
  {
    icon: UsersRound,
    title: "Manager & Leadership Training",
    desc: "Equip managers to spot early signs of burnout, hold supportive conversations, and guide team members toward professional help at the right time.",
  },
  {
    icon: Building,
    title: "On-site Counselling Days",
    desc: "A psychologist at your office on scheduled days, so employees can drop in for a private conversation without leaving work.",
  },
  {
    icon: ClipboardList,
    title: "Psychometric Assessments",
    desc: "Validated assessments for stress, wellbeing, and emotional health that help HR understand needs at a team level — reported only in anonymized form.",
  },
  {
    icon: LifeBuoy,
    title: "Critical Incident Support",
    desc: "Rapid psychological support for teams after a workplace accident, loss of a colleague, layoffs, or other distressing events.",
  },
];

export default function CorporateServices() {
  return (
    <section style={{ padding: '90px 0', backgroundColor: '#fff' }} aria-labelledby="corp-services-title">
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '52px' }}>
          <div className="col-lg-8 text-center">
            <h2 id="corp-services-title" style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#1e293b', marginBottom: '14px' }}>
              Corporate Mental Health Services for Indian Companies
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7, margin: 0 }}>
              Pick the services your workforce needs — or combine them into one employee wellness
              program. Every service is delivered by degree-verified psychologists and RCI-registered
              clinical psychologists.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {corporateServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="col-lg-4 col-md-6">
                <article style={{
                  height: '100%', padding: '30px 28px', borderRadius: '20px',
                  border: '1px solid #e7efe9', backgroundColor: '#fbfdfc'
                }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#f0fdf4', color: '#166534',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>{s.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </article>
              </div>
            );
          })}
        </div>

        <div className="row justify-content-center" style={{ marginTop: '56px' }}>
          <div className="col-lg-9">
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
              Why invest in employee mental health?
            </h3>
            <p style={{ color: '#475569', fontSize: '15.5px', lineHeight: 1.8, marginBottom: '12px' }}>
              Work stress, long hours, and burnout show up as absenteeism, lower productivity, and
              people leaving. A structured corporate wellness program gives employees a safe, confidential
              place to get help early — before a difficult phase turns into a crisis — and gives HR a
              simple benefit to offer without building it in-house.
            </p>
            <p style={{ color: '#475569', fontSize: '15.5px', lineHeight: 1.8, margin: 0 }}>
              Choose Your Therapist works with startups, SMEs, and large enterprises to run employee
              counselling, EAP, and workplace mental health programs — online across India, with on-site
              workshops and counselling days arranged on request. Browse our{' '}
              <a href="/view-all-therapist" style={{ color: '#166534', fontWeight: 700 }}>verified psychologists</a>{' '}
              or{' '}
              <a href="#request-demo" style={{ color: '#166534', fontWeight: 700 }}>send a corporate enquiry</a>{' '}
              to get a proposal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
