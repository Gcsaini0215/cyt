import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const AnimatedNumber = ({ value, suffix = "", duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value);
      if (start === end) return;
      const incrementTime = duration / end;
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const stats = [
  { value: "50", suffix: "+", label: "Verified psychologists across specializations" },
  { value: "500", suffix: "+", label: "Therapy sessions delivered on the platform" },
  { value: "3", suffix: "", label: "Care tiers — self-guided, therapy, and clinical" },
  { value: "24", suffix: "hr", label: "Typical response time for business inquiries" },
];

export default function ImpactStats() {
  return (
    <div style={{
      padding: '80px 0',
      background: 'linear-gradient(135deg, #164e42 0%, #228756 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '48px' }}>
          <div className="col-lg-7 text-center">
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
              Why Organizations Choose Us
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.7 }}>
              Real outcomes for real teams — mental health support that shows up in the numbers that matter.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {stats.map((s, i) => (
            <div key={i} className="col-lg-3 col-md-6">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '10px' }}>
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
