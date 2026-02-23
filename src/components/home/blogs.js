import React from "react";
import BlogCardImg from "../../assets/img/bg-image-12dabd.jpg";
import BlogCardImg2 from "../../assets/img/blog2.png";
import BlogCardImg3 from "../../assets/img/blog3.png";
import BlogCardImg4 from "../../assets/img/blog5.png";
import ImageTag from "../../utils/image-tag";
import Link from "next/link";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Blogs() {
  const isMobile = useMediaQuery("(max-width:768px)");
  return (
    <div className="rbt-rbt-blog-area rbt-section-gap" style={{
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
        background: 'radial-gradient(circle at 25% 25%, rgba(34, 135, 86, 0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 127, 153, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row g-5 align-items-end" style={{ marginBottom: '50px' }}>
          <div className="col-lg-8 col-md-12 col-12">
            <div className="section-title text-start">
              <span className="subtitle" style={{ 
                background: '#228756', 
                color: '#ffffff', 
                padding: '8px 20px', 
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                boxShadow: '0 4px 10px rgba(34, 135, 86, 0.2)'
              }}>
                Mental Health Chronicles
              </span>
              <h2 className="title" style={{ 
                fontSize: isMobile ? "2.5rem" : "4.5rem", 
                fontWeight: "900", 
                color: "#000000",
                marginTop: '25px',
                lineHeight: isMobile ? '3rem' : '1.1'
              }}>
                Latest <span style={{ 
                  backgroundImage: "linear-gradient(135deg, #27ae60 0%, #10b981 50%, #007f99 100%)", 
                  WebkitBackgroundClip: "text", 
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent"
                }}>Articles</span>
              </h2>
              <p style={{ 
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                color: '#444', 
                maxWidth: '850px', 
                margin: '20px 0 0',
                lineHeight: '1.6',
                fontWeight: '500',
                padding: '0'
              }}>
                Explore insightful articles and practical advice to support your mental health journey.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-12 text-start text-lg-end">
            <div className="read-more-btn">
              <Link
                className="rbt-btn btn-gradient btn-sm hover-icon-reverse"
                href="/blogs"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">See All Articles</span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right"></i>
                  </span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right"></i>
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="row g-5">
          {/* Featured Editorial Story */}
          <div className="col-lg-12">
            <div 
              className="rbt-card variation-02 rbt-hover" 
              style={{ 
                height: isMobile ? '400px' : '500px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                border: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                padding: '0'
              }}
            >
              <div className="rbt-card-img" style={{ height: '100%', width: '100%' }}>
                <Link href="/blog-details/1" style={{ height: '100%', width: '100%', display: 'block' }}>
                  <ImageTag
                    alt="Featured Blog"
                    src={BlogCardImg}
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                    zIndex: 1
                  }}></div>
                </Link>
              </div>
              <div className="rbt-card-body" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: isMobile ? '20px' : '50px',
                zIndex: 2,
                textAlign: 'left'
              }}>
                <span style={{
                  background: '#ff5421',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginBottom: '15px',
                  display: 'inline-block'
                }}>
                  Must Read • Editor's Choice
                </span>
                <h2 className="rbt-card-title" style={{ color: '#fff', fontSize: isMobile ? '24px' : '42px', lineHeight: 1.2, fontWeight: 800, marginBottom: '15px' }}>
                  <Link href="/blog-details/1" style={{ color: '#fff' }}>
                    The Art of Setting Boundaries without Feeling Guilty
                  </Link>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', maxWidth: '700px', marginBottom: '25px', display: isMobile ? 'none' : 'block' }}>
                  Have you ever found yourself saying “yes” when deep down you wanted to scream “no”? Learn how to protect your peace of mind.
                </p>
                <Link className="rbt-btn btn-white btn-sm" href="/blog-details/1">
                  <span className="btn-text">Read Full Story</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Stories Grid */}
          <div className="col-lg-4 col-md-6 col-12 mt--30">
            <div className="rbt-card variation-02 rbt-hover" style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', padding: '0' }}>
              <div className="rbt-card-img">
                <Link href="/blog-details/2">
                  <ImageTag alt="Card" src={BlogCardImg2} style={{ height: '200px', width: '100%', objectFit: 'cover' }} />
                </Link>
              </div>
              <div className="rbt-card-body" style={{ padding: '20px' }}>
                <h5 className="rbt-card-title" style={{ fontSize: '18px', fontWeight: 700 }}>
                  <Link href="/blog-details/2">Is Your Relationship Missing the Intimacy?</Link>
                </h5>
                <Link className="transparent-button" href="/blog-details/2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Read Article <i className="feather-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 col-12 mt--30">
            <div className="rbt-card variation-02 rbt-hover" style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', padding: '0' }}>
              <div className="rbt-card-img">
                <Link href="/blog-details/3">
                  <ImageTag alt="Card" src={BlogCardImg3} style={{ height: '200px', width: '100%', objectFit: 'cover' }} />
                </Link>
              </div>
              <div className="rbt-card-body" style={{ padding: '20px' }}>
                <h5 className="rbt-card-title" style={{ fontSize: '18px', fontWeight: 700 }}>
                  <Link href="/blog-details/3">How to Help a Friend during a Panic Attack?</Link>
                </h5>
                <Link className="transparent-button" href="/blog-details/3" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Read Article <i className="feather-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 col-12 mt--30">
            <div className="rbt-card variation-02 rbt-hover" style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', padding: '0' }}>
              <div className="rbt-card-img">
                <Link href="/blog-details/4">
                  <ImageTag alt="Card" src={BlogCardImg4} style={{ height: '200px', width: '100%', objectFit: 'cover' }} />
                </Link>
              </div>
              <div className="rbt-card-body" style={{ padding: '20px' }}>
                <h5 className="rbt-card-title" style={{ fontSize: '18px', fontWeight: 700 }}>
                  <Link href="/blog-details/4">Effective Communication Strategies for Couples</Link>
                </h5>
                <Link className="transparent-button" href="/blog-details/4" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Read Article <i className="feather-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
