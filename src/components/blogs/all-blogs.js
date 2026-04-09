import React, { useState, useEffect } from "react";
import LazyImage from "../../utils/lazy-image";
import BlogImg from "../../assets/img/blog-card-048b22.jpg";
import Link from "next/link";
import { Search } from "lucide-react";
import { fetchData } from "../../utils/actions";
import { getBlogsUrl, baseApi } from "../../utils/url";

export default function AllBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Mental Health",
    "Relationships",
    "Self Care",
    "Therapy",
    "Anxiety",
    "Depression",
  ];

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

  const getFullImagePath = (imageName) => {
    if (!imageName) return BlogImg;
    if (imageName.toString().startsWith("data:")) return imageName;
    if (imageName.toString().startsWith("http")) return imageName;
    return `${baseApi}/uploads/images/${imageName}`;
  };

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const text = content ? content.replace(/<[^>]*>/g, "") : "";
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes < 1 ? 1 : minutes;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;

  const filteredBlogs = blogs.filter((blog, index) => {
    // Exclude featured blog from grid only if no filters are active
    if (!searchTerm && selectedCategory === "All" && index === 0) return false;

    const matchesSearch = blog.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="rbt-blog-area pt--50 rbt-section-gapBottom">
      <style jsx>{`
        .featured-section {
          margin-bottom: 50px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .featured-section:hover {
          transform: translateY(-5px);
        }
        .featured-banner {
          position: relative;
          width: 100%;
          height: 450px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .featured-img-wrapper {
          width: 100%;
          height: 100%;
        }
        .featured-img-wrapper :global(img) {
          width: 100%;
          height: 100% !important;
          object-fit: cover !important;
        }
        .featured-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 50px;
          color: white;
          z-index: 5;
        }
        .featured-badge {
          background: #228756;
          color: white;
          padding: 6px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
          margin-bottom: 20px;
          letter-spacing: 1.5px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .featured-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.1;
          max-width: 850px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          color: #ffffff !important;
        }
        .featured-desc {
          font-size: 18px;
          color: rgba(255,255,255,0.95);
          margin-bottom: 25px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 750px;
          line-height: 1.6;
          text-shadow: 0 1px 5px rgba(0,0,0,0.5);
        }
        .featured-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
        }
        @media (max-width: 768px) {
          .featured-banner {
            height: 350px;
          }
          .featured-title {
            font-size: 24px;
          }
          .featured-overlay {
            padding: 20px;
          }
          .featured-desc {
            font-size: 14px;
            -webkit-line-clamp: 3;
          }
        }
        .blogs-controls-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 30px;
          padding: 0 15px;
        }
        .search-container {
          margin-bottom: 0;
          flex: 0 0 350px;
          display: flex;
          justify-content: flex-end;
        }
        .category-filters {
          display: flex;
          justify-content: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 0;
          flex: 1;
        }
        .filter-btn {
          padding: 8px 18px;
          border-radius: 25px;
          border: 1px solid #f0f0f0;
          background: #fff;
          color: #666;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        @media (max-width: 991px) {
          .blogs-controls-wrapper {
            flex-direction: column;
            gap: 20px;
          }
          .search-container {
            flex: none;
            width: 100%;
            justify-content: center;
            order: 1;
          }
          .category-filters {
            flex: none;
            width: 100%;
            justify-content: center;
            order: 2;
          }
        }
        .filter-btn:hover {
          background: #f8f8f8;
          border-color: #228756;
          color: #228756;
        }
        .filter-btn.active {
          background: #228756;
          border-color: #228756;
          color: #fff;
          box-shadow: 0 4px 12px rgba(34, 135, 86, 0.2);
        }
        @media (max-width: 768px) {
          .category-filters {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 10px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .category-filters::-webkit-scrollbar {
            display: none;
          }
        }
        .search-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 600px;
          display: flex;
          align-items: center;
        }
        .search-input {
          width: 100%;
          padding: 15px 25px 15px 50px;
          border-radius: 50px;
          border: 2px solid #f0f0f0;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .search-input:focus {
          border-color: #228756;
          box-shadow: 0 4px 20px rgba(34, 135, 86, 0.15);
        }
        .search-icon-container {
          position: absolute;
          left: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          pointer-events: none;
          z-index: 10;
        }
        .blog-card-custom {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          aspect-ratio: 1 / 1;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .blog-card-custom:hover {
          transform: translateY(-5px);
        }
        .blog-card-img-wrapper {
          width: 100%;
          height: 100%;
        }
        .blog-card-img-wrapper :global(img) {
          width: 100%;
          height: 100% !important;
          object-fit: cover !important;
        }
        .blog-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 15px;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: background 0.3s ease;
        }
        .blog-card-footer-patti {
          position: absolute;
          top: 15px;
          right: -30px;
          background-color: #228756;
          color: white;
          font-size: 7px;
          font-weight: 700;
          padding: 3px 0;
          z-index: 5;
          width: 120px;
          transform: rotate(45deg);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          text-transform: uppercase;
          overflow: hidden;
          white-space: nowrap;
        }
        .scrolling-text {
          display: inline-block;
          animation: marquee 10s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .blog-card-title-custom {
          font-size: 18px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 8px 0;
          color: white !important;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-meta-custom {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .blog-meta-dot {
          width: 4px;
          height: 4px;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
        }
        @media (max-width: 575px) {
          .mobile-grid-item {
            width: 50% !important;
          }
          .mobile-grid-container {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .mobile-grid-item {
            padding-left: 5px !important;
            padding-right: 5px !important;
            margin-top: 10px !important;
          }
          .blog-card-title-custom {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .blog-meta-custom {
            font-size: 9px;
            gap: 5px;
          }
          .blog-card-overlay {
            padding: 10px;
          }
        }
      `}</style>
      <div className="container">
        {featuredBlog && !searchTerm && selectedCategory === "All" && (
          <div className="featured-section">
            <Link href={`/blog-details?id=${featuredBlog._id || featuredBlog.id}`}>
              <div className="featured-banner">
                <div className="featured-img-wrapper">
                  <LazyImage
                    alt={featuredBlog.title}
                    src={getFullImagePath(featuredBlog.image)}
                  />
                </div>
                <div className="featured-overlay">
                  <div className="featured-badge">Latest Blog</div>
                  <h2 className="featured-title">{featuredBlog.title}</h2>
                  <p className="featured-desc">{featuredBlog.short_desc}</p>
                  <div className="featured-meta">
                    <span>{formatDate(featuredBlog.createdAt || featuredBlog.date)}</span>
                    <div className="blog-meta-dot"></div>
                    <span>{calculateReadingTime(featuredBlog.content)} min read</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
        <div className="blogs-controls-wrapper">
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="search-container">
            <div className="search-input-wrapper">
              <div className="search-icon-container">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search blogs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="row mt--15 mobile-grid-container d-flex flex-wrap">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <div
                className="col-lg-2 col-md-4 col-sm-6 col-6 mobile-grid-item"
                key={blog._id || blog.id}
              >
                <Link href={`/blog-details?id=${blog._id || blog.id}`}>
                  <div className="blog-card-custom">
                    <div className="blog-card-img-wrapper">
                      <LazyImage
                        alt={blog.title}
                        src={getFullImagePath(blog.image)}
                      />
                    </div>
                    <div className="blog-card-overlay">
                      <h5 className="blog-card-title-custom">
                        {blog.title}
                      </h5>
                      <div className="blog-meta-custom">
                        <span>{formatDate(blog.createdAt || blog.date)}</span>
                        <div className="blog-meta-dot"></div>
                        <span>{calculateReadingTime(blog.content)} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-lg-12">
              <p className="text-center">
                {searchTerm || selectedCategory !== "All"
                  ? `No blogs found ${searchTerm ? `matching "${searchTerm}"` : ""} ${
                      selectedCategory !== "All"
                        ? `in category "${selectedCategory}"`
                        : ""
                    }`
                  : "No blogs found."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
