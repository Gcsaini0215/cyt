import React, { useState, useEffect } from "react";

const DEFAULT_PIC =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

const bannerStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes _ab_fd      { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes _ab_pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
  @keyframes _ab_shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes _ab_scrollUp   { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes _ab_scrollDown { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  .ab-col-up   { animation: _ab_scrollUp   60s linear infinite; }
  .ab-col-down { animation: _ab_scrollDown 70s linear infinite; }
  @media (max-width: 900px) {
    .ab-col-mobile-hide { display: none !important; }
    .ab-badge { display: none !important; }
  }
`;

export default function AboutUsBanner({ pics: picsProp = [] }) {
  const [pics, setPics] = useState(picsProp);

  useEffect(() => {
    if (picsProp.length > 0) {
      setPics(picsProp);
      return;
    }
    fetch("https://api.chooseyourtherapist.in/api/get-therapists-profile?pageSize=60")
      .then((r) => r.json())
      .then((json) => {
        const loaded = (json.data || [])
          .map((t) => {
            const pic = t.profile || (t.user && t.user.profile) || "";
            if (!pic) return null;
            return `https://api.chooseyourtherapist.in/uploads/images/${pic}`;
          })
          .filter(Boolean);
        if (loaded.length > 0) setPics(loaded);
      })
      .catch(() => {});
  }, [picsProp]);

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
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
          background: "#000",
          fontFamily: "'Inter', sans-serif",
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
            background: "rgba(0,0,0,.84)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 640,
            margin: "0 auto",
            padding: "80px 24px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
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
              animation: "_ab_pulse 2.5s ease infinite",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Our Story &amp; Vision
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(32px, 4.5vw, 54px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-.8px",
              margin: "0 0 8px",
              animation: "_ab_fd .7s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            Making Mental Health Support{" "}
            <span style={{ color: "#4ade80" }}>
              Accessible to Every Indian
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,.72)",
              lineHeight: 1.7,
              margin: "0",
              fontWeight: 500,
              animation: "_ab_fd .7s cubic-bezier(.22,1,.36,1) .1s both",
            }}
          >
            At CYT, we believe mental health is a fundamental human right. We connect individuals with verified psychologists across India for online and in-person therapy.
          </p>
        </div>
      </section>
    </>
  );
}
