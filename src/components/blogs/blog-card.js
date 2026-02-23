import React from "react";
import Link from "next/link";

export default function BlogCard() {
  return (
    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
      <div className="rbt-card variation-02 rbt-hover">
        <div className="rbt-card-img">
          <Link href="/blog-details/30">
            <img
              alt=""
              width="450"
              height="267"
              src="/assets/img/blog/blog-grid-02.jpg"
            />
          </Link>
        </div>
        <div className="rbt-card-body">
          <h5 className="rbt-card-title">
            <Link href="/blog-details/30">The Modern Rules Of Education.</Link>
          </h5>
          <p className="rbt-card-text">
            It is a long established fact that a reader.
          </p>
          <div className="rbt-card-bottom">
            <Link className="transparent-button" href="/blog-details/30">
              Learn More
              <i>
                <svg width="17" height="12" xmlns="http://www.w3.org/2000/svg">
                  <g stroke="#27374D" fill="none" fillRule="evenodd">
                    <path d="M10.614 0l5.629 5.629-5.63 5.629"></path>
                    <path strokeLinecap="square" d="M.663 5.572h14.594"></path>
                  </g>
                </svg>
              </i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
