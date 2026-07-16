import { ShieldCheck, BadgeCheck, FileCheck2, Globe2 } from "lucide-react";

const points = [
  { icon: BadgeCheck, text: "Degree-verified psychologists" },
  { icon: FileCheck2, text: "RCI-registered Clinical Psychologists" },
  { icon: ShieldCheck, text: "Strict confidentiality standards" },
  { icon: Globe2, text: "Online & in-person delivery" },
];

export default function TrustStrip() {
  return (
    <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '28px 0' }}>
      <div className="container">
        <div className="row g-3 justify-content-center align-items-center">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="col-6 col-md-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <Icon size={18} color="#228756" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{p.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
