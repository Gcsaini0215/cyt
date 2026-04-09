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

  const filteredBlogs = blogs.filter((blog) => {
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
        .search-container {
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          padding: 0 15px;
        }
        .category-filters {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 40px;
          padding: 0 15px;
        }
        .filter-btn {
          padding: 8px 20px;
          border-radius: 25px;
          border: 1px solid #f0f0f0;
          background: #fff;
          color: #666;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
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
          font-size: 20px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
          color: white !important;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
            font-size: 15px;
          }
          .blog-card-overlay {
            padding: 10px;
          }
        }
      `}</style>
      <div className="container">
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
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
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
