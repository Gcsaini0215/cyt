import React from "react";
import { TypeAnimation } from "react-type-animation";

const DEFAULT_PIC =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

const bannerStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes _ab_scrollUp   { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes _ab_scrollDown { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes _ab_shimmer    { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes _ab_pulse      { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
  .ab-col-up   { animation: _ab_scrollUp   60s linear infinite; }
  .ab-col-down { animation: _ab_scrollDown 70s linear infinite; }
  @media (max-width: 900px) {
    .ab-col-mobile-hide { display: none !important; }
    .ab-badge { display: none !important; }
  }
  @media (max-width: 768px) {
    .ab-banner-mobile-strip {
      height: 4px;
      background: linear-gradient(90deg, #16a34a, #4ade80);
    }
  }
`;

export default function AboutUsBanner({ pics = [] }) {
  const TILE_COUNT = 84;
  const tiles = [];
  if (pics.length > 0) {
    for (let i = 0; i < TILE_COUNT; i++) {
      tiles.push(pics[i % pics.length]);
    }
  }

  return (
    <>
      <style>{bannerStyles}</style>

      <section
        style={{
          minHeight: "60vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* Background collage */}
        {tiles.length > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              gap: 0,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((col) => {
              const hideMobile = col >= 4;
              const colTiles = tiles.filter((_, i) => i % 7 === col);
              const doubled = [...colTiles, ...colTiles];
              const isEven = col % 2 === 0;
              return (
                <div
                  key={col}
                  className={hideMobile ? "ab-col-mobile-hide" : ""}
                  style={{ flex: 1, overflow: "hidden", minWidth: 0 }}
                >
                  <div
                    className={isEven ? "ab-col-up" : "ab-col-down"}
                    style={{ display: "flex", flexDirection: "column", gap: 0 }}
                  >
                    {doubled.map((src, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={src}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top center",
                            display: "block",
                          }}
                          onError={(e) => { e.target.src = DEFAULT_PIC; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.82)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 700,
            margin: "0 auto",
            padding: "80px 24px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Badge */}
          <div
            className="ab-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(74,222,128,.15)",
              border: "1px solid rgba(74,222,128,.3)",
              borderRadius: 50,
              padding: "7px 18px",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Our Story &amp; Vision
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-.6px",
              margin: "0 0 14px",
            }}
          >
            Empowering Minds,{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "_ab_shimmer 3s linear infinite",
                display: "inline-block",
              }}
            >
              <TypeAnimation
                sequence={["Transforming Lives", 2000, "Breaking Stigma", 2000, "Healing Together", 2000]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,.72)",
              lineHeight: 1.7,
              margin: "0",
              fontWeight: 500,
              maxWidth: 520,
            }}
          >
            At CYT, we believe mental health is a fundamental human right. We connect individuals with verified psychologists across India for online and in-person therapy.
          </p>
        </div>
      </section>
    </>
  );
}
