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
  '& p': {
    fontSize: '1.6rem',
    lineHeight: 1.85,
    color: '#334155',
    marginBottom: '2.5rem',
    fontFamily: '"Lora", serif',
  },
  '& p:first-of-type::first-letter': {
    float: 'left',
    fontSize: '5rem',
    lineHeight: '1',
    fontWeight: 900,
    paddingRight: '12px',
    color: '#0f172a',
    fontFamily: '"Lora", serif',
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
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-8px',
      left: 0,
      width: '60px',
      height: '4px',
      backgroundColor: '#228756',
      borderRadius: '2px',
    }
  },
  '& h3': {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '3rem',
    marginBottom: '1.5rem',
    fontFamily: '"Lora", serif',
  },
  '& blockquote': {
    borderLeft: 'none',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    padding: '3rem',
    margin: '4rem 0',
    borderRadius: '24px',
    position: 'relative',
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
      fontWeight: 600,
      fontStyle: 'italic',
      margin: 0,
      lineHeight: 1.6,
      position: 'relative',
      zIndex: 1,
    }
  },
  '& ul, & ol': {
    marginBottom: '3rem',
    paddingLeft: '1.8rem',
    '& li': {
      fontSize: '1.55rem',
      lineHeight: 1.8,
      color: '#475569',
      marginBottom: '1.2rem',
      fontFamily: '"Lora", serif',
      position: 'relative',
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
      setSanitizedContent(dompurify.sanitize(blog.content));
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
    if (id) {
      const getBlogData = async () => {
        try {
          if (!blog) {
            const res = await fetchData(`${getBlogUrl}/${id}`);
            if (res && res.status) setBlog(res.data);
          }
          
          // Fetch all blogs to calculate categories, tags, and trending
          const allBlogsRes = await fetchData(getBlogsUrl);
          if (allBlogsRes && allBlogsRes.status) {
            const allBlogs = allBlogsRes.data;
            
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
  const cleanDesc = (blog.metaDesc || blog.title || "").replace(/<[^>]*>/g, '').trim();
  const imageUrl = getFullBlogImagePath(blog.image) || "https://chooseyourtherapist.in/assets/img/og-image.jpg";
  const pageUrl = `${frontendUrl}/blog-details?id=${blog._id}`;

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      <Head>
        <title>{blog.title} | Choose Your Therapist</title>
        <meta name="description" content={cleanDesc} />
        <meta name="keywords" content={blog.tags || blog.category} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta property="og:description" content={cleanDesc} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta name="twitter:description" content={cleanDesc} />
        <meta name="twitter:image" content={imageUrl} />

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
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4} sx={{ position: 'sticky', top: '100px' }}>
              {/* Trending Articles Section */}
              <SidebarCard elevation={0}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.15rem' }}>
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
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#228756', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                            {tBlog.category}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontSize: '1.05rem', fontWeight: 700, mt: 0.5, lineHeight: 1.3, color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.15rem' }}>
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
                      <Typography className="cat-name" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b', transition: '0.2s' }}>
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
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.15rem' }}>
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
                        fontSize: '0.9rem', 
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
    </Box>
  );
}
  
export async function getServerSideProps(context) {
  const { id } = context.query;
  try {
    const res = await fetchData(`${getBlogUrl}/${id}`);
    if (res && res.status) {
      return {
        props: {
          initialBlog: res.data,
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
