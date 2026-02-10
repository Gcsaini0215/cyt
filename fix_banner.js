const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/home/banner.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove unused React import
content = content.replace(
    'import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";',
    'import { useState, useEffect, useRef, useCallback, useMemo } from "react";'
);

// 2. Remove Psychology import and comment
content = content.replace(
    '// Explicit import for Psychology icon to avoid ReferenceError\nimport Psychology from "@mui/icons-material/Psychology";\n\n',
    ''
);

// 3. Fix the icon imports - remove BusinessCenter, Person, SupportAgent, CrisisAlert
const oldImports = `  Thunderstorm, 
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

const newImports = `  Thunderstorm, 
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

content = content.replace(oldImports, newImports);

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

// 5. Remove Swiper imports
content = content.replace(
    "import { Swiper, SwiperSlide } from 'swiper/react';\nimport { Pagination, Autoplay } from 'swiper/modules';\nimport 'swiper/css';\nimport 'swiper/css/pagination';\n\n",
    ''
);

fs.writeFileSync(filePath, content, 'utf-8');

console.log('✓ Removed unused React import');
console.log('✓ Removed unused Material-UI icon imports');
console.log('✓ Removed Psychology icon import');
console.log('✓ Removed unused Material-UI component imports');
console.log('✓ Removed Swiper imports');
