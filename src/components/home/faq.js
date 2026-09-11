import React from "react";
import { ChevronDown } from "lucide-react";

export default function Faq(props) {
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);

  return (
    <div className="faq-chat-item" style={{ marginBottom: "16px" }}>
      {/* Question — like an incoming chat message */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        {!props.hideIcon && (
          <span
            style={{
              width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
              background: "#eef2f0", color: "#64748b", fontSize: "12px", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px",
            }}
          >
            ?
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            textAlign: "left", background: isOpen ? "#e8efe9" : "#eef2f0",
            border: "none", borderRadius: "4px 14px 14px 14px",
            padding: "12px 14px", maxWidth: "88%", cursor: "pointer",
            transition: "background 0.2s ease",
          }}
        >
          <span style={{ fontSize: "14.5px", fontWeight: 700, lineHeight: 1.4, color: "#132a1c" }}>
            {props.q}
          </span>
          <ChevronDown
            size={16}
            style={{
              flexShrink: 0,
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
              color: "#166534",
            }}
          />
        </button>
      </div>

      {/* Answer — like a reply bubble, revealed on click */}
      <div
        style={{
          maxHeight: isOpen ? "700px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
          <div
            style={{
              background: "linear-gradient(135deg,#1a6f47,#166534)",
              borderRadius: "14px 4px 14px 14px",
              padding: "12px 14px", maxWidth: "88%",
              color: "#fff", fontSize: "13.5px", lineHeight: 1.7, textAlign: "left",
            }}
          >
            {props.a}
          </div>
          <span
            style={{
              width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
              background: "#d4af37", color: "#0f3d24", fontSize: "10px", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px",
            }}
          >
            CYT
          </span>
        </div>
      </div>
    </div>
  );
}
