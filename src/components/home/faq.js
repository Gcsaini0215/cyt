import React from "react";
import { ChevronDown } from "lucide-react";

export default function Faq(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div 
      className="faq-item" 
      style={{ 
        marginBottom: '16px', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: '1px solid #f1f5f9',
        backgroundColor: '#fff',
        transition: 'all 0.3s ease',
        boxShadow: isOpen ? '0 10px 30px rgba(34, 135, 86, 0.08)' : 'none'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          color: isOpen ? '#228756' : '#1e293b',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 700 }}>{props.q}</span>
        <ChevronDown 
          size={20} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            color: isOpen ? '#228756' : '#64748b'
          }} 
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0, 1, 0, 1)',
          backgroundColor: '#fdfdfd'
        }}
      >
        <div style={{ padding: '0 24px 24px', color: '#64748b', fontSize: '16px', lineHeight: 1.6 }}>
          {props.a}
        </div>
      </div>
    </div>
  );
}
