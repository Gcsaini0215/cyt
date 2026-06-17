import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Button,
  Paper,
  Grid,
  useMediaQuery,
  useTheme,
  CircularProgress,
  LinearProgress,
  Breadcrumbs,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Clock, 
  Calendar, 
  ArrowLeft,
  Share2, 
  Bookmark,
  TrendingUp,
  Tag as TagIcon,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Eye,
  Users,
} from 'lucide-react';
import MyNavbar from '../components/navbar';
import Footer from '../components/footer';
import NewsLetter from '../components/home/newsletter';
import SocialShare from '../components/global/social-share';
import BookingPopup from '../components/global/booking-popup';
import { getBlogUrl, baseApi, getBlogsUrl, frontendUrl, getFullBlogImagePath } from '../utils/url';
import { fetchData } from '../utils/actions';
import dompurify from "dompurify";

// --- Styled Components for Premium Look ---

const ProgressWrapper = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 2000,
});

const BlogHero = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8), // Reduced padding
  background: '#064e3b', // Deep Forest Green
  textAlign: 'center',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(4), // Even less top padding on mobile
    paddingBottom: theme.spacing(8),
  },
}));

const EditorialTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Lora", serif',
  fontWeight: 800,
  color: '#0f172a', // Changed to dark for white background
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
  marginBottom: theme.spacing(3),
  fontSize: '3.5rem', // Slightly smaller for content area
  [theme.breakpoints.down('lg')]: {
    fontSize: '3rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2.2rem',
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
}));

const FeaturedImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 40px 80px -15px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '& img': {
    width: '100%',
    height: 'auto',
    maxHeight: '480px', // Slightly increased for better clarity
    objectFit: 'cover',
    display: 'block',
    imageRendering: 'auto', // Ensures high quality rendering
    transition: '0.3s ease-in-out',
  },
  [theme.breakpoints.down('md')]: {
    '& img': {
      maxHeight: '260px', // Increased from 220px
    },
  },
}));

const MetaItem = styled(Stack)(({ theme }) => ({
  color: '#64748b', // Darker gray for readability on white
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '0.75rem',
  fontWeight: 700,
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  fontWeight: 400,
  '& p, & div, & span, & li': {
    fontSize: '1.6rem',
    lineHeight: 1.85,
    color: '#334155',
    marginBottom: '2.5rem',
    fontFamily: '"Lora", serif',
    fontWeight: 400,
    [theme.breakpoints.down('md')]: {
      fontSize: '1.35rem',
      lineHeight: 2,
      marginBottom: '1.8rem',
      textAlign: 'left',
    },
  },
  '& > p:first-of-type::first-letter': {
    float: 'left',
    fontSize: '5rem',
    lineHeight: '1',
    fontWeight: 900,
    paddingRight: '12px',
    color: '#0f172a',
    fontFamily: '"Lora", serif',
    textTransform: 'uppercase',
    [theme.breakpoints.down('md')]: {
      fontSize: '4rem',
    },
  },
  '& h2': {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#0f172a',
    marginTop: '4rem',
    marginBottom: '2rem',
    fontFamily: '"Lora", serif',
    lineHeight: 1.2,
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      fontSize: '2rem',
      marginTop: '3rem',
      marginBottom: '1.5rem',
    },
  },
  '& h3': {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '3rem',
    marginBottom: '1.5rem',
    fontFamily: '"Lora", serif',
    [theme.breakpoints.down('md')]: {
      fontSize: '1.7rem',
      marginTop: '2.5rem',
      marginBottom: '1.2rem',
    },
  },
  '& blockquote': {
    borderLeft: 'none',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    padding: '3rem',
    margin: '4rem 0',
    borderRadius: '24px',
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      padding: '2rem',
      margin: '2.5rem 0',
      borderRadius: '16px',
    },
    '&::before': {
      content: '"\\201C"',
      position: 'absolute',
      top: '10px',
      left: '20px',
      fontSize: '6rem',
      color: '#228756',
      opacity: 0.15,
      fontFamily: 'serif',
    },
    '& p': {
      fontSize: '1.85rem',
      color: '#064e3b',
      fontWeight: 400,
      fontStyle: 'italic',
      margin: 0,
      lineHeight: 1.6,
      position: 'relative',
      zIndex: 1,
      [theme.breakpoints.down('md')]: {
        fontSize: '1.4rem',
        lineHeight: 1.7,
      },
    }
  },
  '& ul, & ol': {
    marginBottom: '3rem',
    paddingLeft: '1.8rem',
    fontWeight: 400,
    [theme.breakpoints.down('md')]: {
      marginBottom: '2rem',
      paddingLeft: '1.5rem',
    },
    '& li': {
      fontSize: '1.55rem',
      lineHeight: 1.8,
      color: '#475569',
      marginBottom: '1.2rem',
      fontFamily: '"Lora", serif',
      position: 'relative',
      fontWeight: 400,
      [theme.breakpoints.down('md')]: {
        fontSize: '1.3rem',
        lineHeight: 1.9,
        marginBottom: '1rem',
      },
      '&::marker': {
        color: '#228756',
        fontWeight: 'bold',
      }
    }
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: '16px',
    margin: '3rem 0',
    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
  },
  '& a': {
    color: '#228756',
    textDecoration: 'none',
    fontWeight: 700,
    borderBottom: '2px solid rgba(34, 135, 86, 0.2)',
    transition: '0.2s',
    '&:hover': {
      backgroundColor: 'rgba(34, 135, 86, 0.05)',
      borderBottomColor: '#228756',
    }
  }
}));

const SidebarCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
  }
}));

const TrendingItem = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  padding: '12px',
  borderRadius: '16px',
  transition: '0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    '& h6': { color: '#228756' },
    '& .img-box': { transform: 'scale(1.05)' }
  }
}));

// ─── Internal linking engine ─────────────────────────────────────────────────
// Maps blog category/tags → relevant therapist filter URLs, service labels, state pages
const TOPIC_MAP = [
  {
    keywords: ["anxiety", "panic", "overthinking", "nervousness", "worry", "stress"],
    service: "Anxiety",
    label: "Anxiety & Stress",
    icon: "🧠",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    desc: "Verified psychologists specialising in anxiety, panic attacks, and stress management.",
  },
  {
    keywords: ["depression", "sad", "hopeless", "low mood", "dysthymia", "burnout"],
    service: "Depression",
    label: "Depression",
    icon: "🌧️",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    desc: "Talk to a counsellor trained in depression, low mood, and emotional exhaustion.",
  },
  {
    keywords: ["ocd", "obsessive", "compulsive", "intrusive thought", "checking"],
    service: "OCD",
    label: "OCD",
    icon: "🔄",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Psychologists experienced in CBT-based treatment for OCD and intrusive thoughts.",
  },
  {
    keywords: ["relationship", "couple", "marriage", "divorce", "breakup", "partner", "family", "conflict", "attachment"],
    service: "Relationship Counselling",
    label: "Relationships & Couples",
    icon: "❤️",
    color: "#dc2626",
    bg: "#fff1f2",
    border: "#fecdd3",
    desc: "Couples counsellors and relationship therapists for individuals and partners.",
  },
  {
    keywords: ["trauma", "ptsd", "abuse", "grief", "loss", "bereavement", "accident"],
    service: "Trauma & PTSD",
    label: "Trauma & PTSD",
    icon: "🛡️",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    desc: "Trauma-informed therapists trained in EMDR, somatic therapy, and grief counselling.",
  },
  {
    keywords: ["child", "teen", "adolescent", "school", "adhd", "learning", "parenting", "kid"],
    service: "Child & Adolescent Therapy",
    label: "Child & Teen Therapy",
    icon: "👶",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Child psychologists and special educators for kids, teens, and parents.",
  },
  {
    keywords: ["self esteem", "confidence", "identity", "self worth", "body image", "eating"],
    service: "Self-Esteem & Identity",
    label: "Self-Esteem & Identity",
    icon: "✨",
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    desc: "Psychologists helping with self-esteem, confidence, and personal identity issues.",
  },
  {
    keywords: ["sleep", "insomnia", "fatigue", "mindfulness", "meditation", "wellbeing"],
    service: "Counselling Psychology",
    label: "General Counselling",
    icon: "🌱",
    color: "#228756",
    bg: "#f0fdf4",
    border: "#86efac",
    desc: "Counselling psychologists for everyday mental health, stress, and personal growth.",
  },
];

function getTopicMatch(blog) {
  const text = `${blog.title || ""} ${blog.category || ""} ${blog.tags || ""} ${
    (blog.content || "").replace(/<[^>]*>/g, " ").substring(0, 500)
  }`.toLowerCase();

  const matches = TOPIC_MAP.filter(({ keywords }) =>
    keywords.some((kw) => text.includes(kw))
  );

  // Return top 2 matches max
  return matches.slice(0, 2);
}

// ─── Content cleaner ─────────────────────────────────────────────────────────
// Strips legacy Word/font tags, fixes empty headings, normalises inline styles
function cleanBlogContent(html) {
  if (!html) return "";

  let c = html;

  // 1. Remove Word-paste mso- inline styles entirely from style attributes
  c = c.replace(/\s*style="[^"]*mso-[^"]*"/gi, "");
  // Remove remaining empty style attributes
  c = c.replace(/\s*style="\s*"/gi, "");

  // 2. Unwrap <font face="..." size="..."> tags — keep inner content
  c = c.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, "$1");

  // 3. Remove data-start / data-end / data-section-id attributes (AI noise)
  c = c.replace(/\s*data-start="[^"]*"/gi, "");
  c = c.replace(/\s*data-end="[^"]*"/gi, "");
  c = c.replace(/\s*data-section-id="[^"]*"/gi, "");

  // 4. Remove empty headings like <h2><br></h2> or <h2></h2>
  c = c.replace(/<h[1-6][^>]*>\s*(<br\s*\/?>)?\s*<\/h[1-6]>/gi, "");

  // 5. Remove empty paragraphs and empty divs
  c = c.replace(/<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>/gi, "");
  c = c.replace(/<div[^>]*>\s*(<br\s*\/?>)?\s*<\/div>/gi, "");

  // 6. Remove lang attributes (Word noise)
  c = c.replace(/\s*lang="[^"]*"/gi, "");

  // 7. Remove class attributes with mso or MsoNormal
  c = c.replace(/\s*class="[^"]*Mso[^"]*"/gi, "");
  c = c.replace(/\s*class="[^"]*mso[^"]*"/gi, "");

  // 8. Remove &nbsp; chains (more than 2 consecutive)
  c = c.replace(/(&nbsp;){3,}/gi, " ");

  // 9. Collapse multiple <br> into one
  c = c.replace(/(<br\s*\/?>){3,}/gi, "<br>");

  // 10. Add .blog-intro class to the first <p> for speakable schema targeting
  c = c.replace(/^(\s*<p)/, '$1 class="blog-intro"');

  return c.trim();
}

export default function BlogDetails({ initialBlog }) {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [blog, setBlog] = useState(initialBlog);
  const [sanitizedContent, setSanitizedContent] = useState(initialBlog ? initialBlog.content : "");
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(!initialBlog);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (blog && blog.content) {
      setSanitizedContent(dompurify.sanitize(cleanBlogContent(blog.content)));
    }
  }, [blog]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}`;
      setScrollProgress(scroll);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (initialBlog) setBlog(initialBlog);
  }, [initialBlog]);

  useEffect(() => {
    if (id) {
      const getBlogData = async () => {
        try {
          if (!blog || blog._id !== id) {
            const res = await fetchData(`${getBlogUrl}/${id}`);
            if (res && (res.status === 200 || res.status === true || res.data)) {
              setBlog(res.data || res);
            }
          }
          
          // Fetch all blogs to calculate categories, tags, and trending
          const allBlogsRes = await fetchData(getBlogsUrl);
          if (allBlogsRes && (allBlogsRes.status || allBlogsRes.data || Array.isArray(allBlogsRes))) {
            const allBlogs = allBlogsRes.data || allBlogsRes;
            
            // Set trending blogs (excluding current)
            setTrendingBlogs(allBlogs.filter(b => b._id !== id).slice(0, 5));

            // Calculate category counts
            const catMap = {};
            const tagMap = {};

            allBlogs.forEach(b => {
              // Categories
              if (b.category) {
                catMap[b.category] = (catMap[b.category] || 0) + 1;
              }
              // Tags
              if (b.tags) {
                b.tags.split(',').forEach(tag => {
                  const t = tag.trim();
                  if (t) tagMap[t] = (tagMap[t] || 0) + 1;
                });
              }
            });
            
            const sortedCategories = Object.keys(catMap).map(name => ({
              name,
              count: catMap[name]
            })).sort((a, b) => b.count - a.count);
            
            setCategories(sortedCategories);

            const sortedTags = Object.keys(tagMap).map(name => ({
              name,
              count: tagMap[name]
            })).sort((a, b) => b.count - a.count).slice(0, 10);

            setPopularTags(sortedTags);
          }
        } catch (error) {
          console.error("Fetch Error:", error);
        } finally {
          setLoading(false);
        }
      };
      getBlogData();
    }
  }, [id]);

  const calculateReadingTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // strip html
    const noOfWords = text.split(/\s+/g).length;
    const minutes = Math.ceil(noOfWords / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getFullImagePath = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=100&w=2400"; // Upgraded to HD/4K placeholder
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    return `${baseApi}/uploads/images/${img}`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <CircularProgress thickness={5} size={60} sx={{ color: '#228756' }} />
    </Box>
  );

  if (!blog) return <Typography>Blog not found</Typography>;

  const tagsList = blog.tags ? blog.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "") : [];
  const topicMatches = getTopicMatch(blog);

  // Build a rich meta description: prefer metaDesc, fall back to first 160 chars of plain content
  const rawMetaDesc = (blog.metaDesc || "").replace(/<[^>]*>/g, '').trim();
  const plainContentDesc = blog.content
    ? blog.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)
    : "";
  const rawCleanDesc = rawMetaDesc.length > 40 ? rawMetaDesc : plainContentDesc;
  const cleanDesc = rawCleanDesc.length > 160 ? rawCleanDesc.substring(0, 157) + "..." : rawCleanDesc;

  const imageUrl = `${frontendUrl}/api/blog-og-image?id=${blog._id}`;
  const pageUrl = `${frontendUrl}/blog-details?id=${blog._id}`;

  // Plain text for wordCount
  const plainText = blog.content ? blog.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
  const wordCount = plainText.split(" ").filter(Boolean).length;

  // Is this a mental health / psychology article?
  const isMedical = ["mental health", "psychology", "therapy", "counselling", "relationship concern", "anxiety", "depression"].some(
    kw => (blog.category || "").toLowerCase().includes(kw)
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": isMedical ? ["Article", "MedicalWebPage"] : "Article",
    "headline": blog.title?.trim(),
    "name": blog.title?.trim(),
    "description": cleanDesc,
    "image": {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": 1200,
      "height": 630
    },
    "url": pageUrl,
    "wordCount": wordCount,
    "inLanguage": "en-IN",
    "articleSection": blog.category || "Mental Health",
    "keywords": tagsList.length > 0 ? tagsList.join(", ") : (blog.category || "mental health, psychology"),
    "author": {
      "@type": "Person",
      "name": blog.author || "Choose Your Therapist Editorial",
      "worksFor": {
        "@type": "Organization",
        "@id": "https://www.chooseyourtherapist.in#organization",
        "name": "Choose Your Therapist"
      }
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://www.chooseyourtherapist.in#organization",
      "name": "Choose Your Therapist",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.chooseyourtherapist.in/logo.png",
        "width": 250,
        "height": 60
      }
    },
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    ...(isMedical && {
      "about": {
        "@type": "MedicalCondition",
        "name": blog.category || "Mental Health"
      },
      "medicalAudience": {
        "@type": "MedicalAudience",
        "audienceType": "Patient"
      }
    }),
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".blog-intro"]
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": frontendUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blogs",
        "item": `${frontendUrl}/blogs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": pageUrl
      }
    ]
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', overflowX: 'hidden', maxWidth: '100%' }}>
      <Head>
        <title>{blog.title} | Choose Your Therapist</title>
        <meta name="description" content={cleanDesc} />
        <meta name="keywords" content={blog.tags || blog.category} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta property="og:description" content={cleanDesc} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={blog.title} />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="article:published_time" content={blog.createdAt} />
        <meta property="article:author" content={blog.author || 'Admin'} />
        <meta property="article:section" content={blog.category} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta name="twitter:description" content={cleanDesc} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={blog.title} />

        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <ProgressWrapper>
        <LinearProgress variant="determinate" value={scrollProgress} sx={{ height: 4, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: '#228756' } }} />
      </ProgressWrapper>

      <MyNavbar />
      
      {/* Secondary Header / Breadcrumb Bar - Dark Mode Version */}
      <Box sx={{ bgcolor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
        <Container maxWidth="lg">
          <Breadcrumbs 
            separator={<ChevronRight size={16} color="#ffffff" />} 
            aria-label="breadcrumb"
            sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 600 }}
          >
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              Home
            </Link>
            <Link href="/blogs" style={{ color: '#ffffff', textDecoration: 'none' }}>
              Blogs
            </Link>
            <Typography color="#ffffff" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 800 }}>
              ARTICLE INSIGHTS
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 12, pt: { xs: 1, md: 2 } }}>
        <Grid container spacing={8}>
          <Grid item xs={12} lg={8}>
            <Box component="article">
              {/* Journal-style Header Section */}
              <Box sx={{ mb: 3, textAlign: 'left' }}>
                
                <EditorialTitle variant="h1" sx={{ textAlign: 'left', mb: 1.5, fontSize: { xs: '2.5rem', md: '3.8rem' } }}>
                  {blog.title}
                </EditorialTitle>

                <Stack 
                  direction="row" 
                  spacing={{ xs: 1, md: 4 }} 
                  alignItems="center" 
                  justifyContent="flex-start"
                  flexWrap="wrap"
                  divider={<Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', borderColor: '#cbd5e1', display: { xs: 'none', md: 'block' } }} />}
                  sx={{ mb: 3, color: '#475569' }}
                >
                  <MetaItem sx={{ gap: { xs: '4px', md: '12px' } }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '0.75rem', md: '0.95rem' } }}>WRITTEN BY {blog.author || 'ADMIN'}</Typography>
                  </MetaItem>
                  <MetaItem sx={{ gap: { xs: '4px', md: '12px' } }}>
                    <Calendar size={isMobile ? 14 : 18} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.95rem' } }}>
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </MetaItem>
                  <MetaItem sx={{ gap: { xs: '4px', md: '12px' } }}>
                    <Clock size={isMobile ? 14 : 18} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.95rem' } }}>{calculateReadingTime(blog.content)}</Typography>
                  </MetaItem>
                </Stack>

                {/* Social Share below title/metadata */}
                <Box sx={{ mb: 3 }}>
                  <SocialShare 
                    url={pageUrl} 
                    title={blog.title} 
                  />
                </Box>

                <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />
              </Box>

              <FeaturedImageContainer sx={{ mt: 0, mb: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '4px', position: 'relative' }}>
                <img src={getFullImagePath(blog.image)} alt={blog.title} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    backgroundColor: '#228756',
                    color: '#ffffff',
                    fontWeight: 900, 
                    letterSpacing: '0.12em',
                    fontSize: { xs: '0.75rem', md: '0.85rem' },
                    px: 2,
                    py: 0.8,
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    zIndex: 2,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {blog.category} • ARTICLE
                </Typography>
                {/* Gradient overlay for better text readability */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '40%', 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                  zIndex: 1
                }} />
              </FeaturedImageContainer>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mb: 3,
                  color: '#94a3b8', 
                  fontStyle: 'italic',
                  textAlign: 'left',
                  fontWeight: 500,
                  fontSize: '0.85rem'
                }}
              >
                Source: Choose Your Therapist Editorial
              </Typography>
              <ContentWrapper
                className="blog-content-rich-text"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* ── Key Takeaways — GEO / AI citation signal ── */}
              {tagsList.length > 0 && (
                <Box sx={{
                  mt: 6, p: { xs: 3, md: 4 },
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '20px', border: '1px solid #bbf7d0'
                }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 900, color: '#064e3b', mb: 2,
                    fontSize: { xs: '1.4rem', md: '1.6rem' },
                    display: 'flex', alignItems: 'center', gap: 1
                  }}>
                    🔑 Key Topics in This Article
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tagsList.map((tag, i) => (
                      <Box key={i} sx={{
                        px: 2, py: 0.8, borderRadius: '50px',
                        background: '#fff', border: '1px solid #86efac',
                        fontSize: '1.2rem', fontWeight: 600, color: '#166534'
                      }}>
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* ── Advanced Internal Linking CTA ── */}
              <Box sx={{ mt: 6 }}>

                {/* Topic-matched specialisation cards */}
                {topicMatches.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0f172a', mb: 0.75 }}>
                      This article is related to:
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '1rem', mb: 3 }}>
                      Find verified psychologists who specialise in exactly what you just read about.
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      {topicMatches.map((topic) => (
                        <Box
                          key={topic.service}
                          component="a"
                          href={`/view-all-therapist?services=${encodeURIComponent(topic.service)}`}
                          sx={{
                            p: 2.5, borderRadius: '16px',
                            background: topic.bg,
                            border: `1.5px solid ${topic.border}`,
                            textDecoration: 'none',
                            display: 'flex', gap: 2, alignItems: 'flex-start',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                          }}
                        >
                          <Box sx={{ fontSize: '2rem', lineHeight: 1, mt: 0.25 }}>{topic.icon}</Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: topic.color, fontSize: '1rem', mb: 0.5 }}>
                              {topic.label} Specialists →
                            </Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                              {topic.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Main CTA banner */}
                <Box sx={{
                  p: { xs: 3, md: 5 },
                  background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
                  borderRadius: '24px',
                }}>
                  <Typography sx={{ fontWeight: 900, color: '#fff', mb: 1.5, fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.2 }}>
                    Ready to speak with a psychologist?
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 4, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.75, maxWidth: 520 }}>
                    Reading is a great first step. Our verified psychologists offer online and in-person sessions — confidential, judgment-free, and tailored to your needs.
                  </Typography>

                  {/* CTA buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                    <Box
                      component="a"
                      href={topicMatches[0] ? `/view-all-therapist?services=${encodeURIComponent(topicMatches[0].service)}` : '/view-all-therapist'}
                      sx={{
                        px: 3.5, py: 1.5, borderRadius: '50px',
                        background: '#4ade80', color: '#064e3b',
                        fontWeight: 800, fontSize: '1rem',
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 1
                      }}
                    >
                      🔍 {topicMatches[0] ? `Find ${topicMatches[0].label} Psychologist` : 'Browse Verified Psychologists'}
                    </Box>
                    <Box
                      component="a"
                      href="/faqs"
                      sx={{
                        px: 3.5, py: 1.5, borderRadius: '50px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1.5px solid rgba(255,255,255,0.25)',
                        color: '#fff', fontWeight: 700, fontSize: '1rem',
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 1
                      }}
                    >
                      💬 How does therapy work?
                    </Box>
                  </Box>

                  {/* Trust signals row */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 } }}>
                    {[
                      { icon: "✅", text: "RCI-verified psychologists" },
                      { icon: "🔒", text: "100% confidential sessions" },
                      { icon: "📱", text: "Online & in-person available" },
                      { icon: "🇮🇳", text: "Across India" },
                    ].map(({ icon, text }) => (
                      <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ fontSize: '1rem' }}>{icon}</Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>{text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* State-based quick links */}
                <Box sx={{ mt: 3, p: 3, borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
                    Find psychologists near you
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {[
                      { label: "Delhi", slug: "delhi" },
                      { label: "Uttar Pradesh", slug: "uttar-pradesh" },
                      { label: "Maharashtra", slug: "maharashtra" },
                      { label: "Rajasthan", slug: "rajasthan" },
                      { label: "Gujarat", slug: "gujarat" },
                      { label: "Chandigarh", slug: "chandigarh" },
                      { label: "Uttarakhand", slug: "uttarakhand" },
                    ].map(({ label, slug }) => (
                      <Box
                        key={slug}
                        component="a"
                        href={`/psychologist-in/${slug}`}
                        sx={{
                          px: 2, py: 0.75, borderRadius: '20px',
                          border: '1.5px solid #e2e8f0',
                          background: '#fff', color: '#475569',
                          fontSize: '0.85rem', fontWeight: 700,
                          textDecoration: 'none',
                          '&:hover': { borderColor: '#228756', color: '#228756', background: '#f0fdf4' }
                        }}
                      >
                        {label}
                      </Box>
                    ))}
                  </Box>
                </Box>

              </Box>

              {/* ── Disclaimer ── */}
              <Box sx={{
                mt: 4, p: 2.5,
                background: '#f8fafc', borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <Typography sx={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  <strong style={{ color: '#64748b' }}>Disclaimer:</strong> This article is for informational and educational purposes only. It is not a substitute for professional psychological advice, diagnosis, or treatment. If you are experiencing a mental health crisis, please contact a verified mental health professional or call a helpline immediately.
                </Typography>
              </Box>

            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4} sx={{ position: 'sticky', top: '100px' }}>
              {/* Trending Articles Section */}
              <SidebarCard elevation={0}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.3rem' }}>
                  <TrendingUp size={22} color="#228756" strokeWidth={3} /> Trending Now
                </Typography>
                <Stack spacing={1}>
                  {trendingBlogs.length > 0 ? trendingBlogs.map((tBlog, index) => (
                    <React.Fragment key={tBlog._id}>
                      <TrendingItem 
                        onClick={() => router.push(`/blog-details?id=${tBlog._id}`)}
                        sx={{ px: 0, py: 1.5 }}
                      >
                        <Box className="img-box" sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '12px', 
                          overflow: 'hidden', 
                          flexShrink: 0,
                          transition: 'transform 0.3s ease',
                          border: '1px solid #f1f5f9'
                        }}>
                          <img 
                            src={getFullImagePath(tBlog.image)} 
                            alt={tBlog.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#228756', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>
                            {tBlog.category}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontSize: '1.4rem', fontWeight: 700, mt: 0.5, lineHeight: 1.3, color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {tBlog.title}
                          </Typography>
                        </Box>
                      </TrendingItem>
                      {index < trendingBlogs.length - 1 && <Divider sx={{ opacity: 0.5, borderStyle: 'dashed' }} />}
                    </React.Fragment>
                  )) : (
                    <Typography color="text.secondary">Loading latest articles...</Typography>
                  )}
                </Stack>
              </SidebarCard>

              {/* Categories Section */}
              <SidebarCard elevation={0}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.3rem' }}>
                  <TagIcon size={22} color="#228756" strokeWidth={3} /> Categories
                </Typography>
                <Stack spacing={1.5}>
                  {categories.length > 0 ? categories.map((cat, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: '0.2s',
                        background: '#f8fafc',
                        border: '1px solid transparent',
                        '&:hover': {
                          bgcolor: '#ffffff',
                          borderColor: '#228756',
                          transform: 'translateX(5px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          '& .cat-name': { color: '#228756' }
                        }
                      }}
                      onClick={() => router.push(`/blogs?category=${cat.name}`)}
                    >
                      <Typography className="cat-name" sx={{ fontWeight: 700, fontSize: '1.45rem', color: '#1e293b', transition: '0.2s' }}>
                        {cat.name}
                      </Typography>
                      <Box sx={{ 
                        bgcolor: '#228756', 
                        color: '#ffffff', 
                        minWidth: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px', 
                        fontSize: '0.85rem',
                        fontWeight: 900
                      }}>
                        {cat.count}
                      </Box>
                    </Box>
                  )) : (
                    <Typography color="text.secondary">No categories found.</Typography>
                  )}
                </Stack>
              </SidebarCard>

              {/* Popular Tags Section */}
              <SidebarCard elevation={0} sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.3rem' }}>
                  <TrendingUp size={22} color="#228756" strokeWidth={3} /> Popular Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                  {popularTags.length > 0 ? popularTags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag.name} 
                      onClick={() => router.push(`/blogs?tag=${tag.name}`)}
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '1.05rem', 
                        bgcolor: '#ffffff', 
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: '0.3s',
                        px: 0.5,
                        py: 2.5,
                        '&:hover': { 
                          bgcolor: '#228756', 
                          color: '#ffffff',
                          borderColor: '#228756',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)'
                        }
                      }} 
                    />
                  )) : (
                    <Typography color="text.secondary">No tags found.</Typography>
                  )}
                </Box>
              </SidebarCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <NewsLetter />
      <Footer />
      <BookingPopup delay={5000} showHeading={false} showLocation={false} showSource={false} />
    </Box>
  );
}
  
export async function getServerSideProps(context) {
  const { id } = context.query;
  try {
    const res = await fetchData(`${getBlogUrl}/${id}`);
    if (res && (res.status === 200 || res.status === true || res.data)) {
      return {
        props: {
          initialBlog: res.data || res,
        },
      };
    }
  } catch (error) {
    console.error("Fetch Error in getServerSideProps:", error);
  }
  return {
    props: {
      initialBlog: null,
    },
  };
}
