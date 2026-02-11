import React from "react";

// Import images
import Ad1 from "../../assets/img/hi_15157.png";
import Ad2 from "../../assets/img/hi_2a809.png";

export default function AdBanner() {
  return (
    <div className="rbt-banner-area" style={{ padding: "10px 0", backgroundColor: "#fff" }}>
      <div className="container">
        <div className="row g-4">
          {/* Left Section */}
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              height: "100%",
              maxHeight: "200px"
            }}>
              <img 
                src={Ad1} 
                alt="Advertisement 1" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  display: "block"
                }} 
              />
            </div>
          </div>
          
          {/* Right Section */}
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              height: "100%",
              maxHeight: "200px"
            }}>
              <img 
                src={Ad2} 
                alt="Advertisement 2" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  display: "block"
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
