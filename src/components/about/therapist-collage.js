import React from "react";

const DEFAULT_PIC =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

const styles = `
  @keyframes _tc_scrollUp   { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes _tc_scrollDown { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  .tc-col-up   { animation: _tc_scrollUp   55s linear infinite; }
  .tc-col-down { animation: _tc_scrollDown 65s linear infinite; }
  @media (max-width: 900px) { .tc-col-mobile-hide { display: none !important; } }
`;

export default function TherapistCollage({ pics = [] }) {
  if (pics.length === 0) return null;

  const TILE_COUNT = 84;
  const tiles = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    tiles.push(pics[i % pics.length]);
  }

  return (
    <>
      <style>{styles}</style>
      <section style={{ background: "#060f09", padding: "60px 0 0" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 40, padding: "0 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.25)",
            borderRadius: 50, padding: "6px 16px", marginBottom: 16,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Our Network
            </span>
          </div>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, color: "#fff",
            margin: "0 0 10px", fontFamily: "'Inter', sans-serif",
          }}>
            Meet Our Verified Therapists
          </h2>
          <p style={{
            fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 460,
            margin: "0 auto", lineHeight: 1.6, fontFamily: "'Inter', sans-serif",
          }}>
            Hundreds of certified psychologists across India — ready to support you.
          </p>
        </div>

        {/* Collage grid */}
        <div style={{
          position: "relative",
          height: 420,
          overflow: "hidden",
          display: "flex",
          gap: 0,
        }}>
          {[0, 1, 2, 3, 4, 5, 6].map((col) => {
            const hideMobile = col >= 4;
            const colTiles = tiles.filter((_, i) => i % 7 === col);
            const doubled = [...colTiles, ...colTiles];
            const isEven = col % 2 === 0;
            return (
              <div
                key={col}
                className={hideMobile ? "tc-col-mobile-hide" : ""}
                style={{ flex: 1, overflow: "hidden", minWidth: 0 }}
              >
                <div
                  className={isEven ? "tc-col-up" : "tc-col-down"}
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {doubled.map((src, idx) => (
                    <div
                      key={idx}
                      style={{ width: "100%", aspectRatio: "1 / 1", flexShrink: 0, overflow: "hidden" }}
                    >
                      <img
                        src={src}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                        onError={(e) => { e.target.src = DEFAULT_PIC; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Bottom fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
            background: "linear-gradient(to bottom, transparent, #060f09)",
            zIndex: 2, pointerEvents: "none",
          }} />
          {/* Top fade */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 60,
            background: "linear-gradient(to top, transparent, #060f09)",
            zIndex: 2, pointerEvents: "none",
          }} />
        </div>
      </section>
    </>
  );
}
