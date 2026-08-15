import React from "react";
import { ChevronDown } from "lucide-react";

export default function Faq(props) {
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);
  
  return (
    <div 
      className="faq-item" 
      style={{
        marginBottom: '10px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: `1px solid ${isOpen ? '#cfe4d7' : '#dbe3df'}`,
        backgroundColor: '#fff',
        transition: 'all 0.2s ease',
        boxShadow: isOpen ? '0 4px 16px rgba(15,61,36,.07)' : 'none'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 18px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          color: isOpen ? '#166534' : '#132a1c',
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '14.5px', fontWeight: 700, lineHeight: 1.4 }}>{props.q}</span>
        <ChevronDown
          size={17}
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            color: isOpen ? '#166534' : '#94a3b8'
          }}
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0, 1, 0, 1)',
          backgroundColor: '#f8faf9'
        }}
      >
        <div style={{ padding: '0 18px 18px', color: '#52667f', fontSize: '13.5px', lineHeight: 1.7, textAlign: 'justify' }}>
          {props.a}
        </div>
      </div>
    </div>
  );
}
