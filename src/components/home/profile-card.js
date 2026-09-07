import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchById, fetchData } from "../../utils/actions";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import ProfileCardHor from "./profile-card-hor";
import { getDecodedToken } from "../../utils/jwt";

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ProfileCard({ profiles }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);
  const [tab, setTab] = React.useState("");
  const [data, setData] = React.useState([]);
  const [favrioutes, setFavrioutes] = React.useState([]);

  // Use profiles prop if provided, otherwise fetch
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setData(profiles);
    }
  }, [profiles]);

  const getData = async (profileType = tab) => {
    if (profiles && profiles.length > 0) return; // Don't fetch if we have explicit profiles prop
    try {
      const res = await fetchData(getTherapistProfiles, {
        profile_type: profileType,
      });
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("getData error:", err);
    }
  };

  const handleClick = (id) => {
    setTab(id);
    getData(id);
  };

  const getFavrioutes = async () => {
    try {
      const res = await fetchById(GetFavriouteTherapistListUrl);
      if (res && res.data) {
        setFavrioutes(res.data.therapists || []);
      }
    } catch (err) {
      console.error("getFavrioutes error:", err);
    }
  };
  React.useEffect(() => {
    getData();
    const data = getDecodedToken();
    if (data) {
      if (data.role !== 1) {
        getFavrioutes();
      }
    }
  }, []);

  // random order each time the list loads (fresh page load or tab switch) —
  // not sorted by reviews/priority, so it's a different mix every visit
  const shuffledData = useMemo(() => shuffled(data), [data]);

  return (
    <div className="rbt-rbt-card-area rbt-section-gap" style={{
      background: '#071a10',
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 0 60px'
    }}>
      {/* Decorative Blur Blobs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '5%',
        width: '360px', height: '360px',
        background: 'rgba(34,135,86,.08)', filter: 'blur(90px)',
        borderRadius: '50%', pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '0', left: '3%',
        width: '260px', height: '260px',
        background: 'rgba(74,222,128,.05)', filter: 'blur(70px)',
        borderRadius: '50%', pointerEvents: 'none'
      }}></div>

      <style>{`
        .pc-hero-title {
          font-size: clamp(2rem, 5.2vw, 4.5rem);
          font-weight: 900;
          color: #f1f5f9;
          line-height: 1.15;
          text-align: left;
          margin: 0 0 15px;
          padding: 0;
          flex: 1 1 320px;
          min-width: 0;
        }
        @media (max-width: 600px) {
          .pc-hero-title { line-height: 1.25; }
        }

        /* ── full-bleed tile row, auto-sliding ── */
        .tile-strip-frame { overflow: hidden; position: relative; width: 100%; }
        .tile-strip-frame::before, .tile-strip-frame::after {
          content: ""; position: absolute; top: 0; bottom: 0; width: 60px; z-index: 3; pointer-events: none;
        }
        .tile-strip-frame::before { left: 0; background: linear-gradient(90deg, #071a10, transparent); }
        .tile-strip-frame::after { right: 0; background: linear-gradient(-90deg, #071a10, transparent); }
        .tile-track { display: flex; width: max-content; animation-name: cytTileMarquee; animation-timing-function: linear; animation-iteration-count: infinite; }
        .tile-strip-frame:hover .tile-track { animation-play-state: paused; }
        .tile-group { display: flex; gap: 14px; flex-shrink: 0; padding-right: 14px; }
        .tile-outer { width: 150px; flex-shrink: 0; }
        @keyframes cytTileMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (min-width: 601px) { .tile-group { gap: 18px; padding-right: 18px; } .tile-outer { width: 190px; } }
        @media (min-width: 1024px) { .tile-group { gap: 20px; padding-right: 20px; } .tile-outer { width: 230px; } }
        @media (prefers-reduced-motion: reduce) {
          .tile-track { animation: none; overflow-x: auto; }
        }
      `}</style>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title text-start" style={{ marginBottom: '30px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <h3 className="title pc-hero-title">
                  Meet India's <span style={{
                    backgroundImage: "linear-gradient(135deg, #4ade80 0%, #34d399 50%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent"
                  }}>Best Online Psychologists</span>
                </h3>
                <div className="view-all-btn-wrapper" style={{ marginTop: isMobile ? '10px' : '0', flexShrink: 0 }}>
                  <Link
                    className="rbt-btn btn-gradient btn-sm"
                    href={"/view-all-therapist"}
                    style={{ 
                      padding: isMobile ? '10px 18px' : '12px 30px', 
                      height: 'auto', 
                      lineHeight: '1.2',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '800',
                      minWidth: 'max-content',
                      borderRadius: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <span className="btn-text">{isMobile ? "View All" : "View All Experts"}</span>
                    {!isMobile && (
                      <span className="btn-icon" style={{ marginLeft: '10px' }}>
                        <i className="feather-arrow-right"></i>
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              <p style={{
                fontSize: isMobile ? '1.4rem' : '1.5rem',
                color: '#94a3b8',
                maxWidth: '850px',
                margin: '0',
                lineHeight: '1.6',
                fontWeight: '500',
                padding: 0,
                textAlign: 'left'
              }}>
                Connec with the top-rated therapists and mental health experts near you. Start your journey towards healing with professional counseling tailored to your needs.
              </p>
            </div>
          </div>
        </div>
        <div className="row row--15" style={{ margin: isMobile ? 5 : 0 }}>
          {data && data.length > 0 ? (
            <div className="tile-strip-frame">
              <div
                className="tile-track"
                style={{ animationDuration: `${Math.max(20, shuffledData.length * 3)}s` }}
              >
                <div className="tile-group">
                  {shuffledData.map((item) => (
                    <ProfileCardHor key={item._id} pageData={item} favrioutes={favrioutes} variant="tile" />
                  ))}
                </div>
                <div className="tile-group" aria-hidden="true" inert="">
                  {shuffledData.map((item) => (
                    <ProfileCardHor key={`dup-${item._id}`} pageData={item} favrioutes={favrioutes} variant="tile" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="col-lg-12 text-center" style={{ padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '15px' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>No therapists found for this category.</p>
            </div>
          )}
        </div>
        {/* Remove bottom load-more-btn if profiles prop exists or as requested since it's now at top */}
        {!profiles && (
          <div className="row">
            <div className="col-lg-12">
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
