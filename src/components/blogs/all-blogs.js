import React, { useState, useEffect } from "react";
import LazyImage from "../../utils/lazy-image";
import BlogImg from "../../assets/img/blog-card-048b22.jpg";
import Link from "next/link";
import { fetchData } from "../../utils/actions";
import { getBlogsUrl, baseApi } from "../../utils/url";

export default function AllBlogs() {
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

  const getFullImagePath = (imageName) => {
    if (!imageName) return BlogImg;
    if (imageName.toString().startsWith("data:")) return imageName;
    if (imageName.toString().startsWith("http")) return imageName;
    return `${baseApi}/uploads/images/${imageName}`;
  };

  return (
    <div className="rbt-blog-area pt--50 rbt-section-gapBottom">
      <style jsx>{`
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
        <div className="row mt--15 mobile-grid-container d-flex flex-wrap">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                className="col-lg-3 col-md-4 col-sm-6 col-6 mobile-grid-item"
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
              <p className="text-center">No blogs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
