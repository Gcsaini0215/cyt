const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/home/banner.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove unused React import
content = content.replace(
    'import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";',
    'import { useState, useEffect, useRef, useCallback, useMemo } from "react";'
);

// 2. Fix the icon imports - remove unused ones
const oldIcons = `  Thunderstorm, 
  Cloud, 
  Bolt, 
  Favorite, 
  Work, 
  Spa, 
  VolunteerActivism,
  SelfImprovement,
  SentimentDissatisfied,
  Search,
  Star,
  BusinessCenter,
  ArrowForward,
  Person,
  SupportAgent,
  CrisisAlert,
  Mic`;

const newIcons = `  Thunderstorm, 
  Cloud, 
  Bolt, 
  Favorite, 
  Work, 
  Spa, 
  VolunteerActivism,
  SelfImprovement,
  SentimentDissatisfied,
  Search,
  Star,
  ArrowForward,
  Mic`;

content = content.replace(oldIcons, newIcons);

// 3. Remove Psychology import and comment
content = content.replace(
    '// Explicit import for Psychology icon to avoid ReferenceError\nimport Psychology from "@mui/icons-material/Psychology";\n\n',
    ''
);

// 4. Fix Material-UI imports
const oldMaterial = `  Grid,
  Paper,
  InputBase,
  Avatar,
  Box,
  Typography,
  IconButton,
  Chip,
  Skeleton`;

const newMaterial = `  Avatar,
  Box,
  Typography,
  Skeleton`;

content = content.replace(oldMaterial, newMaterial);

// 5. Remove Swiper imports and CSS
content = content.replace(
    "import { Swiper, SwiperSlide } from 'swiper/react';\nimport { Pagination, Autoplay } from 'swiper/modules';\nimport 'swiper/css';\nimport 'swiper/css/pagination';\n\n",
    ''
);

// 6. Remove the entire BannerSlider component (it's not used anywhere)
// Find the component from "// Therapist Image Slider Component" to "^};"
const bannerSliderMatch = content.match(/\/\/ Therapist Image Slider Component[\s\S]*?^};[\s\S]*?^$/m);
if (bannerSliderMatch) {
    // Find the start
    const start = content.indexOf('// Therapist Image Slider Component');
    // Find the end - we need to find the closing }; of the component
    let braceCount = 0;
    let inComponent = false;
    let end = start;
    
    for (let i = start; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            inComponent = true;
        } else if (content[i] === '}') {
            braceCount--;
            if (inComponent && braceCount === 0) {
                // Found the closing brace, now skip to the semicolon
                end = i + 1;
                if (content[end] === ';') {
                    end++;
                }
                // Skip whitespace
                while (end < content.length && (content[end] === '\n' || content[end] === '\r')) {
                    end++;
                }
                break;
            }
        }
    }
    
    if (end > start) {
        content = content.substring(0, start) + content.substring(end);
        console.log('✓ Removed BannerSlider component');
    }
}

// 7. Remove unused state variables and related code
// Remove placeholderIndex state
content = content.replace(/  const \[placeholderIndex, setPlaceholderIndex\] = useState\(0\);\n/g, '');

// Remove dynamicFeelingCards state  
content = content.replace(/  const \[dynamicFeelingCards, setDynamicFeelingCards\] = useState\(\[\]\);\n/g, '');

// Remove placeholderTexts array
content = content.replace(/  \/\/ Animated placeholder texts\n  const placeholderTexts = \[\n    "Search by therapist name\.\.\.",\n    "Search by expertise\.\.\.",\n    "Search by state\.\.\."\n  \];\n\n/g, '');

// Remove animated placeholder cycling useEffect
content = content.replace(/  \/\/ Animated placeholder cycling.*?}, \[placeholderTexts\.length, isMobile\]\);\n\n/s, '');

// Remove expertise extraction logic
const expertiseStart = content.indexOf('        // --- LOGIC TO EXTRACT TOP EXPERTISE ---');
if (expertiseStart !== -1) {
    const expertiseEnd = content.indexOf('        setDynamicFeelingCards(sortedExpertise);', expertiseStart);
    if (expertiseEnd !== -1) {
        const lineEnd = content.indexOf('\n', expertiseEnd);
        // Also remove the comment line after
        let actualEnd = content.indexOf('\n', lineEnd + 1);
        if (content.substring(lineEnd + 1, actualEnd).includes('-----')) {
            actualEnd = content.indexOf('\n', actualEnd + 1);
        }
        content = content.substring(0, expertiseStart) + content.substring(actualEnd + 1);
        console.log('✓ Removed expertise extraction logic');
    }
}

// Remove the setDynamicFeelingCards([]) line from catch block
content = content.replace(/      setDynamicFeelingCards\(\[\]\);\n/g, '');

// Remove getStyleForExpertise function
const styleStart = content.indexOf('  // Helper to assign icons and colors based on expertise text');
if (styleStart !== -1) {
    // Find the function end
    let braceCount = 0;
    let inFunction = false;
    let end = styleStart;
    for (let i = styleStart; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            inFunction = true;
        } else if (content[i] === '}') {
            braceCount--;
            if (inFunction && braceCount === 0) {
                end = i + 2; // Include }; and newline
                break;
            }
        }
    }
    
    if (end > styleStart) {
        content = content.substring(0, styleStart) + content.substring(end);
        console.log('✓ Removed getStyleForExpertise function');
    }
}

fs.writeFileSync(filePath, content, 'utf-8');

console.log('✓ Cleaned up all unused imports and code');
