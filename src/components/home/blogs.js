import React, { useState, useEffect } from "react";
import BlogCardImg from "../../assets/img/bg-image-12dabd.jpg";
import BlogCardImg2 from "../../assets/img/blog2.png";
import BlogCardImg3 from "../../assets/img/blog3.png";
import BlogCardImg4 from "../../assets/img/blog5.png";
import ImageTag from "../../utils/image-tag";
import Link from "next/link";
import useMediaQuery from "@mui/material/useMediaQuery";
import { fetchData } from "../../utils/actions";
import { getBlogsUrl, baseApi } from "../../utils/url";

const FALLBACK_BLOGS = [
  {
    _id: "fallback-1",
    title: "The Art of Setting Boundaries without Feeling Guilty",
    category: "Self-Care",
    image: BlogCardImg,
    author: "Editor's Choice",
  },
  {
    _id: "fallback-2",
    title: "Is Your Relationship Missing the Intimacy?",
    category: "Relationships",
    image: BlogCardImg2,
  },
  {
    _id: "fallback-3",
    title: "How to Help a Friend during a Panic Attack?",
    category: "Anxiety",
    image: BlogCardImg3,
  },
  {
    _id: "fallback-4",
    title: "Self-Care: Why It Is Not Selfish",
    category: "Self-Care",
    image: BlogCardImg4,
  },
];

export default function Blogs() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetchData(getBlogsUrl);
        if (res) {
          if (res.status && Array.isArray(res.data)) {
            setBlogs(res.data);
          } else if (Array.isArray(res)) {
            setBlogs(res);
          } else if (res.blogs && Array.isArray(res.blogs)) {
            setBlogs(res.blogs);
          }
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const items = blogs.length > 0 ? blogs.slice(0, 4) : FALLBACK_BLOGS;

  const getFullImagePath = (image) => {
    if (!image) return BlogCardImg;
    if (typeof image !== "string") return image; // local imported fallback image
    if (image.startsWith("data:")) return image;
    if (image.startsWith("http")) return image;
    return `${baseApi}/uploads/images/${image}`;
  };

  return (
    <div className="rbt-rbt-blog-area rbt-section-gap" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
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

        {/* Full-bleed magazine grid — every story gets equal visual weight */}
        <div className="mhc-grid">
          {items.map((blog) => (
            <Link key={blog._id} href={`/blog-details?id=${blog._id}`} className="mhc-tile">
              <ImageTag alt={blog.title} src={getFullImagePath(blog.image)} className="mhc-img" />
              <span className="mhc-scrim"></span>
              <span className="mhc-cat">{blog.category || "Article"}</span>
              <span className="mhc-info">
                <span className="mhc-title">{blog.title}</span>
                {(blog.author || blog.author_name) && (
                  <span className="mhc-meta">By {blog.author || blog.author_name}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .mhc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .mhc-tile {
          position: relative;
          display: block;
          aspect-ratio: 4 / 3;
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none !important;
          box-shadow: 0 20px 44px -22px rgba(15, 47, 31, 0.4);
        }
        .mhc-tile .mhc-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .mhc-tile:hover .mhc-img { transform: scale(1.06); }
        .mhc-scrim {
          position: absolute; left: 0; right: 0; bottom: 0; height: 70%;
          background: linear-gradient(to top, rgba(4, 15, 9, 0.88), transparent);
        }
        .mhc-cat {
          position: absolute; top: 14px; left: 14px; z-index: 2;
          font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          color: #fff; background: linear-gradient(135deg, #2aa066, #1c6b45);
          padding: 5px 12px; border-radius: 999px;
        }
        .mhc-info {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
          padding: 18px; display: flex; flex-direction: column; gap: 4px;
        }
        .mhc-title {
          font-weight: 800; color: #fff; font-size: 18px; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .mhc-meta { font-size: 12px; color: rgba(255, 255, 255, 0.8); }

        @media (min-width: 601px) {
          .mhc-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .mhc-grid { grid-template-columns: repeat(4, 1fr); gap: 22px; }
          .mhc-title { font-size: 15px; }
        }
      `}</style>
    </div>
  );
}
