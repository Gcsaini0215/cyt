import { Check, Minus } from "lucide-react";

const plans = [
  {
    name: "Starter",
    desc: "Small teams getting started with mental health support.",
    highlight: false,
    features: {
      "Self-guided resources": true,
      "Individual therapy sessions": true,
      "Couples & family therapy": false,
      "Clinical psychology & assessments": false,
      "Dedicated account manager": false,
      "Usage analytics dashboard": false,
    }
  },
  {
    name: "Growth",
    desc: "Growing organizations that want a complete care model.",
    highlight: true,
    features: {
      "Self-guided resources": true,
      "Individual therapy sessions": true,
      "Couples & family therapy": true,
      "Clinical psychology & assessments": true,
      "Dedicated account manager": false,
      "Usage analytics dashboard": true,
    }
  },
  {
    name: "Enterprise",
    desc: "Large organizations and institutions needing full-scale support.",
    highlight: false,
    features: {
      "Self-guided resources": true,
      "Individual therapy sessions": true,
      "Couples & family therapy": true,
      "Clinical psychology & assessments": true,
      "Dedicated account manager": true,
      "Usage analytics dashboard": true,
    }
  },
];

const featureRows = Object.keys(plans[0].features);

export default function PlansComparison() {
  return (
    <div style={{ padding: '90px 0', backgroundColor: '#fff' }}>
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '56px' }}>
          <div className="col-lg-7 text-center">
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#1e293b', marginBottom: '14px' }}>
              Plans That Scale With Your Organization
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7 }}>
              Exact pricing depends on team size and usage — request a demo for a tailored quote.
            </p>
          </div>
        </div>

        {/* Desktop table */}
        <div className="d-none d-lg-block" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '20px', textAlign: 'left', width: '28%' }}></th>
                {plans.map((p, i) => (
                  <th key={i} style={{
                    padding: '24px 20px', textAlign: 'center',
                    backgroundColor: p.highlight ? '#f0fdf4' : 'transparent',
                    borderRadius: p.highlight ? '20px 20px 0 0' : 0,
                    border: p.highlight ? '2px solid #228756' : 'none',
                    borderBottom: 'none'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b' }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '6px', maxWidth: '220px', marginLeft: 'auto', marginRight: 'auto' }}>
                      {p.desc}
                    </div>
                    {p.highlight && (
                      <span style={{
                        display: 'inline-block', marginTop: '12px', fontSize: '11px', fontWeight: 800,
                        color: '#fff', backgroundColor: '#228756', padding: '4px 14px', borderRadius: '50px'
                      }}>
                        MOST POPULAR
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((feature, ri) => (
                <tr key={ri}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#334155', borderTop: '1px solid #f1f5f9' }}>
                    {feature}
                  </td>
                  {plans.map((p, pi) => (
                    <td key={pi} style={{
                      padding: '16px 20px', textAlign: 'center', borderTop: '1px solid #f1f5f9',
                      backgroundColor: p.highlight ? '#f0fdf4' : 'transparent',
                      borderLeft: p.highlight ? '2px solid #228756' : 'none',
                      borderRight: p.highlight ? '2px solid #228756' : 'none',
                    }}>
                      {p.features[feature]
                        ? <Check size={20} color="#228756" style={{ display: 'inline' }} />
                        : <Minus size={18} color="#cbd5e1" style={{ display: 'inline' }} />}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td style={{ padding: '20px' }}></td>
                {plans.map((p, i) => (
                  <td key={i} style={{
                    padding: '20px', textAlign: 'center',
                    backgroundColor: p.highlight ? '#f0fdf4' : 'transparent',
                    borderRadius: p.highlight ? '0 0 20px 20px' : 0,
                    border: p.highlight ? '2px solid #228756' : 'none',
                    borderTop: 'none'
                  }}>
                    <a href="#request-demo" className="rbt-btn btn-gradient radius-round btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 28px', fontWeight: 700 }}>
                      <span className="btn-text">Get Started</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="d-lg-none row g-4">
          {plans.map((p, i) => (
            <div key={i} className="col-12">
              <div style={{
                padding: '28px 24px', borderRadius: '20px',
                backgroundColor: p.highlight ? '#f0fdf4' : '#f8fafc',
                border: p.highlight ? '2px solid #228756' : '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0 }}>{p.name}</h3>
                  {p.highlight && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', backgroundColor: '#228756', padding: '4px 12px', borderRadius: '50px' }}>
                      POPULAR
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '18px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {featureRows.map((feature, ri) => (
                    <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.features[feature]
                        ? <Check size={18} color="#228756" style={{ flexShrink: 0 }} />
                        : <Minus size={18} color="#cbd5e1" style={{ flexShrink: 0 }} />}
                      <span style={{ fontSize: '14px', color: '#334155' }}>{feature}</span>
                    </div>
                  ))}
                </div>
                <a href="#request-demo" className="rbt-btn btn-gradient radius-round w-100"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', fontWeight: 700 }}>
                  <span className="btn-text">Get Started</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
