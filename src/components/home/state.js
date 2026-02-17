import React, { useState } from "react";
import { stateList } from "../../utils/static-lists";

import GujaratImg from "../../assets/img/Gujrat.png";
import UttarakhandImg from "../../assets/img/Uttarakhand.png";
import DelhiImg from "../../assets/img/Delhi.png";
import RajasthanImg from "../../assets/img/Rajasthan.png";
import AndhraPradeshImg from "../../assets/img/AndhraPradesh.jpg";
import arunachalpradeshImg from "../../assets/img/arunachalpradesh.jpg";
import assamImg from "../../assets/img/assam.jpg";
import biharImg from "../../assets/img/bihar.webp";
import haryanaImg from "../../assets/img/gurgaon.png";
import chattishgarhImg from "../../assets/img/chattishgarh.avif";
import goaImg from "../../assets/img/goa.webp";
const fallbackImage = GujaratImg;

const stateImages = {
  Gujarat: GujaratImg,
  Uttarakhand: UttarakhandImg,
  Delhi: DelhiImg,
  Rajasthan: RajasthanImg,
  "Andhra Pradesh": AndhraPradeshImg, 
  "Arunachal Pradesh": arunachalpradeshImg,// 
  "Assam": assamImg, 
   "Bihar": biharImg, 
   "Haryana": haryanaImg, 
   "Chhattisgarh": chattishgarhImg, 
    "Goa": goaImg, 
};

export default function State() {
  const [visibleCount, setVisibleCount] = useState(8);
  const filteredStates = stateList.filter((state) => state !== "Select");

  const handleLoadMore = () => setVisibleCount((prev) => prev + 8);

  return (
    <div className="state-section" style={{
      padding: '60px 20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(34, 135, 86, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0, 127, 153, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div className="state-container" style={{
        maxWidth: '1200px',
        margin: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div className="state-header" style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #228756 0%, #007f99 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '20px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            Explore Therapists Across India
          </h2>
          <div className="state-subtitle" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '16px'
          }}>
            <hr style={{
              flex: 1,
              height: '2px',
              border: 'none',
              background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)',
              borderRadius: '1px'
            }} />
            <span style={{
              fontSize: '1.1rem',
              color: '#64748b',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              Available in{" "}
              <span className="highlight" style={{
                color: '#228756',
                fontWeight: '700',
                fontSize: '1.2rem'
              }}>
                {filteredStates.length}
              </span>{" "}
              states
            </span>
            <hr style={{
              flex: 1,
              height: '2px',
              border: 'none',
              background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)',
              borderRadius: '1px'
            }} />
          </div>
        </div>

        {/* State Cards */}
        <div className="state-cards">
          {filteredStates.slice(0, visibleCount).map((state, index) => (
            <a key={index} href="#" className="state-card">
              <div
                className="state-image"
                style={{
                  backgroundImage: `url(${stateImages[state] || fallbackImage})`,
                }}
              ></div>
              <div className="state-name">{state}</div>
            </a>
          ))}
        </div>

        {/* Load More */}
        {visibleCount < filteredStates.length && (
          <div className="state-loadmore">
            <button onClick={handleLoadMore}>View More</button>
          </div>
        )}
      </div>

      {/* Premium CSS */}
      <style>{`
        .state-section {
          padding: 50px 20px;
          background: #f9f9f9;
        }
        .state-container {
          max-width: 1200px;
          margin: auto;
        }
        .state-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .state-header h2 {
          font-size: 2.9rem;
          font-weight: 700;
          color: #1b2124;
          margin-bottom: 10px;
        }
        .state-subtitle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .state-subtitle hr {
          flex: 1;
          height: 1px;
          border: none;
          background: #b7b7b7;
        }
        .state-subtitle .highlight {
          color: #5a4bda;
          font-weight: 600;
        }
        .state-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: flex-start;
        }
        .state-card {
          flex: 1 1 calc(25% - 20px); /* 4 per row on desktop */
          max-width: 280px;
          height: 120px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .state-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
        }
        .state-image {
          width: 80px;
          height: 80px;
          background-size: cover;
          background-position: center;
          margin: 0 20px;
          border-radius: 8px;
          transition: transform 0.3s;
        }
        .state-card:hover .state-image {
          transform: scale(1.15);
        }
        .state-name {
          font-weight: 700;
          font-size: 1.9rem;
          color: #000;
        }
        .state-loadmore {
          margin-top: 30px;
          text-align: center;
        }
        .state-loadmore button {
          background: linear-gradient(135deg, #5a4bda, #4437b8);
          color: #fff;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 14px 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .state-loadmore button:hover {
          background: linear-gradient(135deg, #4437b8, #5a4bda);
          transform: scale(1.05);
          box-shadow: 0 6px 18px rgba(68, 55, 184, 0.4);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .state-card {
            flex: 1 1 calc(33.33% - 20px); /* 3 per row on tablet */
            height: 110px;
          }
          .state-image {
            width: 70px;
            height: 70px;
          }
          .state-name {
            font-size: 1.5rem;
          }
        }
        @media (max-width: 768px) {
          .state-cards {
            gap: 12px;
          }
          .state-card {
            flex: 1 1 100%; /* full width on mobile */
            max-width: 100%; /* remove max-width restriction */
            height: 130px; /* taller for mobile */
          }
          .state-image {
            width: 90px; /* larger image */
            height: 90px;
            margin: 0 16px;
          }
          .state-name {
            font-size: 2rem; /* larger text */
          }
        }
      `}</style>
    </div>
  );
}
