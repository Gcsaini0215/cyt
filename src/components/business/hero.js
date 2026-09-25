import { Shield, Lock, Building2, EyeOff, BadgeCheck } from "lucide-react";

const HERO_IMG = "/assets/img/corporate-wellness-workshop.jpg";

export default function BusinessHero() {
  return (
    <section className="corp-hero" aria-labelledby="corp-hero-title">
      <div className="corp-hero-dots" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="corp-hero-badge">
              <Building2 size={16} />
              Corporate Wellness Program · India
            </div>
            <h1 id="corp-hero-title" className="corp-hero-title">
              Corporate Wellness Program for <span>Employee Mental Health</span>
            </h1>
            <p className="corp-hero-sub">
              Give your employees confidential access to verified psychologists — 1:1 counselling (EAP),
              stress &amp; burnout workshops, and manager support in one program that helps reduce
              burnout and attrition.
            </p>
            <div className="corp-hero-ctas">
              <a href="#request-demo" className="rbt-btn btn-gradient radius-round"
                style={{ padding: '16px 34px', fontWeight: 700, fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="btn-text">Get a Corporate Proposal</span>
              </a>
              <a href="#care-model" className="corp-hero-ghost">See the Program</a>
            </div>
            <div className="corp-hero-points">
              <span><Shield size={16} /> RCI-Verified Clinical Psychologists</span>
              <span><Lock size={16} /> Confidential &amp; Secure by Design</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="corp-hero-media">
              <img
                src={HERO_IMG}
                alt="Employees in a workplace wellbeing workshop as part of a corporate wellness program"
                width="1200"
                height="900"
                fetchpriority="high"
                decoding="async"
              />
              <div className="corp-hero-card corp-hero-card--top">
                <span className="corp-hero-card-icon"><EyeOff size={18} /></span>
                <div>
                  <strong>100% confidential</strong>
                  <small>A safe, private space every employee can trust</small>
                </div>
              </div>
              <div className="corp-hero-card corp-hero-card--bottom">
                <span className="corp-hero-card-icon"><BadgeCheck size={18} /></span>
                <div>
                  <strong>Verified psychologists</strong>
                  <small>Online across India &amp; on-site for teams</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .corp-hero {
          background: linear-gradient(135deg, #0f2027 0%, #164e42 50%, #228756 100%);
          padding: 140px 0 100px; position: relative; overflow: hidden;
        }
        .corp-hero-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .corp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.12); color: #fff;
          padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 700;
          margin-bottom: 22px; border: 1px solid rgba(255,255,255,0.2);
        }
        .corp-hero-title {
          font-size: clamp(30px, 4.4vw, 52px); font-weight: 900; color: #fff;
          line-height: 1.15; margin-bottom: 20px;
        }
        .corp-hero-title span { color: #f0cf6e; }
        .corp-hero-sub {
          color: rgba(255,255,255,0.85); font-size: clamp(16px, 1.6vw, 19px);
          line-height: 1.7; margin-bottom: 34px; max-width: 580px;
        }
        .corp-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 30px; }
        .corp-hero-ghost {
          display: inline-flex; align-items: center; padding: 16px 32px; border-radius: 50px;
          background: rgba(255,255,255,0.1); color: #fff !important; font-weight: 700; font-size: 16px;
          text-decoration: none; border: 1px solid rgba(255,255,255,0.25);
        }
        .corp-hero-ghost:hover { background: rgba(255,255,255,0.18); }
        .corp-hero-points { display: flex; gap: 24px; flex-wrap: wrap; }
        .corp-hero-points span {
          display: inline-flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 600;
        }
        .corp-hero-media { position: relative; padding: 18px 0 26px; }
        .corp-hero-media img {
          display: block; width: 100%; height: auto; aspect-ratio: 5 / 4; object-fit: cover; object-position: center;
          border-radius: 26px; border: 4px solid rgba(255,255,255,0.14);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.45);
        }
        .corp-hero-card {
          position: absolute; display: flex; align-items: center; gap: 12px;
          background: #fff; border-radius: 16px; padding: 12px 16px;
          box-shadow: 0 18px 40px -14px rgba(0,0,0,0.35); max-width: 270px;
        }
        .corp-hero-card strong { display: block; font-size: 14px; font-weight: 800; color: #132a1c; line-height: 1.3; }
        .corp-hero-card small { display: block; font-size: 12px; color: #64748b; line-height: 1.4; }
        .corp-hero-card-icon {
          flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #f0fdf4; color: #166534;
        }
        .corp-hero-card--top { top: 0; left: -22px; }
        .corp-hero-card--bottom { bottom: 0; right: -14px; }
        @media (max-width: 1199.98px) {
          .corp-hero-card--top { left: 10px; }
          .corp-hero-card--bottom { right: 10px; }
        }
        @media (max-width: 991.98px) {
          .corp-hero { padding: 110px 0 70px; }
          .corp-hero-media img { aspect-ratio: 16 / 11; }
        }
        @media (max-width: 575.98px) {
          .corp-hero { padding: 96px 0 56px; }
          .corp-hero-ctas a { width: 100%; justify-content: center; }
          .corp-hero-card { position: static; max-width: none; margin-top: 12px; }
          .corp-hero-media { padding: 0; }
        }
      ` }} />
    </section>
  );
}
