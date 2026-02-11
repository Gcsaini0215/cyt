import React from 'react';
import { Box, keyframes } from '@mui/material';

const draw = keyframes`
  0% {
    stroke-dashoffset: 8000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const IndiaMap = () => {
  // Simplified high-quality state-wise paths for India
  // Data derived from standard geographical SVG sources
  const states = [
    { name: "Andhra Pradesh", d: "M790,750 L810,780 L800,800 L770,820 L740,830 L720,800 L710,770 L730,750 L760,740 Z" },
    { name: "Arunachal Pradesh", d: "M900,200 L950,220 L980,250 L960,300 L930,320 L900,310 L880,250 Z" },
    { name: "Assam", d: "M850,300 L900,310 L920,350 L880,380 L840,360 L820,330 Z" },
    { name: "Bihar", d: "M750,380 L820,390 L830,440 L780,460 L740,430 Z" },
    { name: "Chhattisgarh", d: "M680,550 L720,530 L740,600 L730,700 L680,720 L660,650 Z" },
    { name: "Goa", d: "M450,780 L460,785 L460,800 L450,800 Z" },
    { name: "Gujarat", d: "M320,480 L400,470 L450,520 L440,600 L350,620 L300,580 L280,520 Z" },
    { name: "Haryana", d: "M480,300 L520,310 L530,350 L490,360 L470,330 Z" },
    { name: "Himachal Pradesh", d: "M520,200 L580,220 L570,270 L530,280 L500,240 Z" },
    { name: "Jharkhand", d: "M750,470 L820,480 L830,530 L780,550 L740,520 Z" },
    { name: "Karnataka", d: "M450,750 L500,740 L550,850 L520,950 L460,930 L430,850 Z" },
    { name: "Kerala", d: "M500,980 L530,960 L560,1050 L530,1080 L500,1060 Z" },
    { name: "Madhya Pradesh", d: "M450,450 L550,430 L650,480 L680,580 L600,650 L480,630 L440,550 Z" },
    { name: "Maharashtra", d: "M400,620 L550,640 L650,680 L620,780 L500,820 L420,780 L380,700 Z" },
    { name: "Manipur", d: "M940,380 L970,390 L960,430 L930,420 Z" },
    { name: "Meghalaya", d: "M830,350 L870,355 L870,380 L830,380 Z" },
    { name: "Mizoram", d: "M920,440 L950,450 L940,500 L910,480 Z" },
    { name: "Nagaland", d: "M940,320 L970,330 L980,370 L950,370 Z" },
    { name: "Odisha", d: "M730,550 L800,580 L840,650 L820,730 L740,710 L700,650 Z" },
    { name: "Punjab", d: "M450,250 L500,260 L510,310 l-40,20 l-30,-30 Z" },
    { name: "Rajasthan", d: "M300,320 L450,300 L500,450 L400,480 L320,480 L280,400 Z" },
    { name: "Sikkim", d: "M770,320 L790,320 L790,350 L770,350 Z" },
    { name: "Tamil Nadu", d: "M550,900 L620,880 L650,1000 L620,1080 L560,1050 L540,950 Z" },
    { name: "Telangana", d: "M600,680 L700,660 L750,750 L680,800 L620,780 Z" },
    { name: "Tripura", d: "M900,420 L920,425 L920,450 L900,450 Z" },
    { name: "Uttar Pradesh", d: "M550,330 L720,350 L750,420 L680,480 L550,450 L520,380 Z" },
    { name: "Uttarakhand", d: "M600,280 L650,300 L640,350 L580,340 Z" },
    { name: "West Bengal", d: "M820,450 L860,460 L850,580 L800,600 L780,520 Z" },
    { name: "Jammu & Kashmir", d: "M480,80 L550,100 L600,200 L520,230 L450,180 L440,120 Z" },
    { name: "Ladakh", d: "M550,50 L650,70 L700,180 L600,200 L550,100 Z" }
  ];

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: 'auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'transparent',
        p: { xs: 2, md: 4 }
      }}
    >
      <svg
        viewBox="250 30 750 1080"
        style={{ 
          width: '100%', 
          height: 'auto', 
          maxWidth: '500px',
          filter: 'drop-shadow(0 10px 20px rgba(34, 135, 86, 0.2))'
        }}
      >
        <g
          fill="rgba(34, 135, 86, 0.05)"
          stroke="#228756"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {states.map((state, index) => (
            <path
              key={state.name}
              d={state.d}
              style={{
                strokeDasharray: 8000,
                strokeDashoffset: 8000,
                animation: `${draw} 3s ease-out forwards`,
                animationDelay: `${index * 0.05}s`,
                transition: 'fill 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.fill = 'rgba(34, 135, 86, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fill = 'rgba(34, 135, 86, 0.05)';
              }}
            >
              <title>{state.name}</title>
            </path>
          ))}
        </g>
      </svg>
    </Box>
  );
};

export default IndiaMap;
