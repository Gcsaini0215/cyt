import React from "react";
import Link from "next/link";
export default function ErrorPage() {
  return (
    <div className="rbt-error-area bg-gradient-11 rbt-section-gap">
      <div className="error-area">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-10">
              <h1 className="title">500!</h1>
              <h3 className="sub-title">Something Went Wrong</h3>
              <p>Error to get data from the server, please try again!</p>
              <Link className="rbt-btn btn-gradient icon-hover" href="/">
                <span className="btn-text">Back To Home</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
