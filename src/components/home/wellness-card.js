import Link from "next/link";
import ImageTag from "../../utils/image-tag";
import { truncateString } from "../../utils/helpers";
import { imagePath } from "../../utils/url";
import { FaCalendarAlt, FaTag, FaArrowRight } from "react-icons/fa";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function WellnessCard({ data }) {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "16px 8px",
      }}
    >
      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          background: "#fff",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          cursor: "pointer",
          maxWidth: isMobile ? 320 : 650,
          width: "100%",
          border: "1px solid #e2e8f0",
          position: "relative",
        }}
        className="wellness-card"
      >
        {/* Badge */}
        <div style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "#228756",
          padding: "6px 14px",
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 4px 12px rgba(34, 135, 86, 0.3)"
        }}>
          <FaTag size={10} /> {data.category}
        </div>

        {/* Image Section - Horizontal Fit */}
        <Link 
          href={`/workshop-detail/${data._id}`} 
          style={{ 
            display: "block", 
            position: "relative",
            width: isMobile ? "100%" : "240px",
            flexShrink: 0
          }}
        >
          <div
            style={{
              padding: 0,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <ImageTag
              alt={truncateString(data.title, 20)}
              loading="lazy"
              style={{
                height: isMobile ? 220 : "100%",
                width: "100%",
                objectFit: "cover",
                transition: "transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              src={`${imagePath}/${data.workshop_image}`}
            />
          </div>
        </Link>

        {/* Card Content */}
        <div
          style={{
            padding: isMobile ? "24px" : "24px 32px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center"
          }}
        >
          {/* Title */}
          <h4
            style={{
              margin: "0 0 12px",
              fontSize: 20,
              fontWeight: 800,
              color: "#1e293b",
              lineHeight: 1.3,
            }}
          >
            <Link
              href={`/workshop-detail/${data._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {truncateString(data.title, 55)}
            </Link>
          </h4>

          {/* Date & Time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#64748b",
              marginBottom: 20,
              borderLeft: "3px solid #228756",
              paddingLeft: 12
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, color: "#1e293b" }}>{data.event_date}</span>
              <span style={{ fontSize: 12 }}>{data.event_time}</span>
            </div>
          </div>

          {/* Pricing & CTA Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Investment</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: 24, color: "#228756" }}>₹{data.price}</span>
                <span style={{ fontSize: 14, color: "#cbd5e1", textDecoration: "line-through" }}>₹{data.mrp}</span>
              </div>
            </div>

            <Link
              href={`/workshop-detail/${data._id}`}
              style={{
                padding: "12px 28px",
                background: "#228756",
                color: "#fff",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: "700",
                textDecoration: "none",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(34, 135, 86, 0.2)"
              }}
              className="cta-button"
            >
              Join Now <FaArrowRight size={12} />
            </Link>
          </div>
        </div>

        <style>
          {`
            .wellness-card:hover {
              transform: translateY(-10px);
              box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
              border-color: #228756;
            }
            .wellness-card:hover img {
              transform: scale(1.1);
            }
            .wellness-card:hover .cta-arrow {
              transform: scale(1.1) rotate(-45deg);
              background: #1a6b44;
            }
          `}
        </style>
      </div>
    </div>
  );
}
