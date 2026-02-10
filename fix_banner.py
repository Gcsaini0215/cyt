import re

with open("src/components/home/banner.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove unused React import
content = content.replace(
    'import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";',
    'import { useState, useEffect, useRef, useCallback, useMemo } from "react";'
)

# 2. Remove Psychology import and comment
content = re.sub(
    r'// Explicit import for Psychology icon to avoid ReferenceError\nimport Psychology from "@mui/icons-material/Psychology";\n\n',
    '',
    content
)

# 3. Fix the icon imports - remove BusinessCenter, Person, SupportAgent, CrisisAlert
old_imports = '''  Thunderstorm, 
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
  Mic'''

new_imports = '''  Thunderstorm, 
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
  Mic'''

content = content.replace(old_imports, new_imports)

# 4. Fix Material-UI imports
old_material = '''  Grid,
  Paper,
  InputBase,
  Avatar,
  Box,
  Typography,
  IconButton,
  Chip,
  Skeleton'''

new_material = '''  Avatar,
  Box,
  Typography,
  Skeleton'''

content = content.replace(old_material, new_material)

# 5. Remove Swiper imports
content = re.sub(
    r"import { Swiper, SwiperSlide } from 'swiper/react';\nimport { Pagination, Autoplay } from 'swiper/modules';\nimport 'swiper/css';\nimport 'swiper/css/pagination';\n\n",
    '',
    content
)

with open("src/components/home/banner.js", "w", encoding="utf-8") as f:
    f.write(content)

print("✓ Removed unused React import")
print("✓ Removed unused Material-UI icon imports")
print("✓ Removed Psychology icon import")
print("✓ Removed unused Material-UI component imports")
print("✓ Removed Swiper imports")
