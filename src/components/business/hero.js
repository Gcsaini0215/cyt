import { Shield, Lock, Building2 } from "lucide-react";

export default function BusinessHero() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f2027 0%, #164e42 50%, #228756 100%)',
      padding: '140px 0 100px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none'
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-lg-9 text-center">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff',
              padding: '8px 20px', borderRadius: '100px',
              fontSize: '13px', fontWeight: 700, marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Building2 size={16} />
              Choose Your Therapist for Business
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 900, color: '#fff',
              marginBottom: '20px', lineHeight: 1.15
            }}>
              Mental Health Support Built for Your Workforce
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 40px'
            }}>
              Give employees, students, or members access to verified psychologists and clinical
              psychologists — with measurable impact on productivity, retention, and wellbeing.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
              <a href="#request-demo" className="rbt-btn btn-gradient radius-round"
                style={{ padding: '16px 36px', fontWeight: 700, fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="btn-text">Request a Demo</span>
              </a>
              <a href="#care-model" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '16px 36px', borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
                fontWeight: 700, fontSize: '16px', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.25)'
              }}>
                See How It Works
              </a>
            </div>

            <div style={{ display: 'flex', gap: '28px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600 }}>
                <Shield size={16} /> RCI-Verified Clinical Psychologists
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600 }}>
                <Lock size={16} /> Confidential &amp; Secure by Design
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
