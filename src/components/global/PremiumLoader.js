import React from "react";

const PremiumLoader = () => {
  return (
    <div className="pl-wrap">
      <div className="pl-bar" />

      <div className="pl-center">
        <div className="pl-leaf-wrap">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="pl-leaf-svg">
            {/* stem */}
            <line x1="32" y1="58" x2="32" y2="36" stroke="#228756" strokeWidth="2.5" strokeLinecap="round" className="pl-stem" />
            {/* left curl */}
            <path d="M32 48 Q20 44 18 34" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" fill="none" className="pl-curl-l" />
            {/* right curl */}
            <path d="M32 44 Q44 40 46 30" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" fill="none" className="pl-curl-r" />
            {/* main leaf */}
            <path
              d="M32 36 C32 36 14 30 12 12 C12 12 30 10 38 22 C44 30 32 36 32 36Z"
              fill="#228756"
              className="pl-leaf"
            />
            {/* leaf shine */}
            <path
              d="M20 18 C22 16 28 14 32 18"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              className="pl-shine"
            />
          </svg>

          {/* ripple rings */}
          <div className="pl-ring pl-ring1" />
          <div className="pl-ring pl-ring2" />
        </div>

        <p className="pl-quote">Growing towards healing...</p>
      </div>

      <style>{`
        .pl-wrap {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* ── top progress bar ── */
        .pl-bar {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #166534, #228756, #4ade80, #228756, #166534);
          background-size: 300% 100%;
          animation: pl-slide 1.4s ease-in-out infinite;
          border-radius: 0 2px 2px 0;
          z-index: 100000;
        }
        @keyframes pl-slide {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        /* ── center content ── */
        .pl-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        /* ── leaf wrapper ── */
        .pl-leaf-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── svg ── */
        .pl-leaf-svg {
          width: 64px;
          height: 64px;
          position: relative;
          z-index: 2;
          animation: pl-grow 2s cubic-bezier(.34,1.56,.64,1) infinite;
          transform-origin: bottom center;
        }
        @keyframes pl-grow {
          0%   { transform: scale(0.7) translateY(6px); opacity: 0.5; }
          50%  { transform: scale(1.08) translateY(-2px); opacity: 1; }
          100% { transform: scale(0.7) translateY(6px); opacity: 0.5; }
        }

        /* leaf parts draw-on */
        .pl-leaf {
          transform-origin: 32px 56px;
          animation: pl-leaf-in 2s ease-in-out infinite;
        }
        @keyframes pl-leaf-in {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1; }
        }

        .pl-stem {
          animation: pl-stem-grow 2s ease-in-out infinite;
          transform-origin: 32px 58px;
        }
        @keyframes pl-stem-grow {
          0%,100% { stroke-dasharray: 0 30; opacity: 0.6; }
          50%     { stroke-dasharray: 30 0; opacity: 1; }
        }

        .pl-curl-l, .pl-curl-r {
          stroke-dasharray: 20;
          animation: pl-curl 2s ease-in-out infinite;
        }
        .pl-curl-r { animation-delay: 0.15s; }
        @keyframes pl-curl {
          0%,100% { stroke-dashoffset: 20; opacity: 0; }
          50%     { stroke-dashoffset: 0;  opacity: 1; }
        }

        /* ── ripple rings ── */
        .pl-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(34,135,86,0.25);
          animation: pl-ripple 2s ease-out infinite;
          pointer-events: none;
        }
        .pl-ring1 { width: 80px;  height: 80px;  animation-delay: 0s; }
        .pl-ring2 { width: 100px; height: 100px; animation-delay: 0.6s; }
        @keyframes pl-ripple {
          0%   { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        /* ── quote ── */
        .pl-quote {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          font-style: italic;
          letter-spacing: 0.3px;
          margin: 0;
          animation: pl-fade 2s ease-in-out infinite;
        }
        @keyframes pl-fade {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PremiumLoader;
