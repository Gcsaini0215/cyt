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
      <div className="container">
        <div className="row g-5 mt--15">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                className="col-lg-4 col-md-6 col-sm-12 col-12"
                key={blog._id || blog.id}
              >
                <div className="rbt-card variation-02 rbt-hover">
                  <div className="rbt-card-img">
                    <Link href={`/blog-details?id=${blog._id || blog.id}`}>
                      <LazyImage
                        alt={blog.title}
                        dim={"267-450"}
                        src={getFullImagePath(blog.image)}
                      />
                    </Link>
                  </div>
                  <div className="rbt-card-body">
                    <h5 className="rbt-card-title">
                      <Link href={`/blog-details?id=${blog._id || blog.id}`}>
                        {blog.title}
                      </Link>
                    </h5>
                    <p className="rbt-card-text">{blog.short_desc}</p>
                    <div className="rbt-card-bottom">
                      <Link
                        className="transparent-button"
                        href={`/blog-details?id=${blog._id || blog.id}`}
                      >
                        Learn More
                        <i>
                          <svg
                            width="17"
                            height="12"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g stroke="#27374D" fill="none" fillRule="evenodd">
                              <path d="M10.614 0l5.629 5.629-5.63 5.629"></path>
                              <path
                                strokeLinecap="square"
                                d="M.663 5.572h14.594"
                              ></path>
                            </g>
                          </svg>
                        </i>
                      </Link>
                    </div>
                  </div>
                </div>
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
