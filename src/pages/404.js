import React from "react";
import Link from "next/link";

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
.err-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.err-left {
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f2d1a 100%);
  display: flex; flex-direction: column; justify-content: center;
  padding: 60px 64px; position: relative; overflow: hidden;
}
.err-left::before {
  content: ''; position: absolute; top: -120px; right: -120px;
  width: 400px; height: 400px; border-radius: 50%;
  background: rgba(22,163,74,0.08); pointer-events: none;
}
.err-left::after {
  content: ''; position: absolute; bottom: -80px; left: -60px;
  width: 280px; height: 280px; border-radius: 50%;
  background: rgba(255,255,255,0.03); pointer-events: none;
}
.err-brand { display: flex; align-items: center; margin-bottom: 64px; position: relative; }
.err-brand-logo { background: #fff; border-radius: 8px; padding: 4px 12px; display: flex; align-items: center; }
.err-brand-logo img { height: 32px; width: auto; display: block; }
.err-code-big {
  font-size: clamp(100px, 14vw, 160px); font-weight: 900; line-height: 0.9;
  color: #fff; letter-spacing: -8px; position: relative; margin-bottom: 6px;
}
.err-code-big span { color: #16a34a; }
.err-headline {
  font-size: clamp(22px, 3vw, 32px); font-weight: 800; color: #fff;
  margin: 20px 0 14px; letter-spacing: -0.5px; line-height: 1.2; position: relative;
}
.err-desc { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 380px; position: relative; }
.err-right { background: #f8fafc; display: flex; flex-direction: column; justify-content: center; padding: 60px 64px; }
.err-right-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 28px; }
.err-btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: #0f172a; color: #fff; border: none; border-radius: 12px;
  padding: 15px 26px; font-size: 15px; font-weight: 700;
  cursor: pointer; text-decoration: none; transition: all 0.15s;
  width: 100%; margin-bottom: 10px;
}
.err-btn-primary:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,23,42,0.18); }
.err-btn-secondary {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: #fff; color: #475569; border: 1.5px solid #e2e8f0; border-radius: 12px;
  padding: 15px 26px; font-size: 15px; font-weight: 600;
  cursor: pointer; text-decoration: none; transition: all 0.15s; width: 100%;
}
.err-btn-secondary:hover { border-color: #16a34a; color: #16a34a; transform: translateY(-1px); }
@media (max-width: 768px) {
  .err-root { grid-template-columns: 1fr; }
  .err-left { padding: 48px 28px 40px; }
  .err-right { padding: 40px 28px 56px; }
  .err-brand { margin-bottom: 40px; }
  .err-code-big { font-size: 96px; letter-spacing: -5px; }
}
`;

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="err-root">

        {/* LEFT */}
        <div className="err-left">
          <div className="err-brand">
            <div className="err-brand-logo">
              <img src="/logo.png" alt="Choose Your Therapist" />
            </div>
          </div>
          <div className="err-code-big">4<span>0</span>4</div>
          <h1 className="err-headline">Page not found</h1>
          <p className="err-desc">
            The page you're looking for doesn't exist or may have been moved. Don't worry — we'll help you find what you need.
          </p>
        </div>

        {/* RIGHT */}
        <div className="err-right">
          <div className="err-right-label">What would you like to do?</div>
          <a href="javascript:history.back()" className="err-btn-primary">
            <i className="feather-arrow-left" style={{ fontSize: 16 }}></i>
            Go Back
          </a>
          <Link href="/" className="err-btn-secondary">
            <i className="feather-home" style={{ fontSize: 16 }}></i>
            Back to Home
          </Link>
        </div>

      </div>
    </>
  );
}
