import React from "react";
import MainLayout from "../components/therapists/main-layout";
import CreateBlog from "../components/therapists/blogs/create-blog";

export default function TherapistBlogsPage() {
  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Write a Blog</h4>
          </div>
          <CreateBlog />
        </div>
      </div>
    </MainLayout>
  );
}
