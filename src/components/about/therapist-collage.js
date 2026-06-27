import React, { useState, useEffect } from "react";

const DEFAULT_PIC =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

const styles = `
  @keyframes _tc_scrollUp   { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes _tc_scrollDown { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  .tc-col-up   { animation: _tc_scrollUp   55s linear infinite; }
  .tc-col-down { animation: _tc_scrollDown 65s linear infinite; }
  @media (max-width: 900px) { .tc-col-mobile-hide { display: none !important; } }
`;

export default function TherapistCollage({ pics: picsProp = [] }) {
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

  if (pics.length === 0) return null;

  const TILE_COUNT = 84;
  const tiles = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    tiles.push(pics[i % pics.length]);
  }

  return (
    <>
      <style>{styles}</style>
      <section style={{ background: "#060f09", padding: "0" }}>
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
