import React from "react";
import MainLayout from "../components/therapists/main-layout";
import AIBlog from "../components/therapists/blogs/ai-blog";

export default function TherapistAIBlogPage() {
  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Write Blog with AI</h4>
            <p className="description">Just type your topic and let AI draft a blog for you.</p>
          </div>
          <AIBlog />
        </div>
      </div>
    </MainLayout>
  );
}
