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
  Fade,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Clock, 
  Calendar, 
  ArrowLeft,
  Share2, 
  Bookmark,
  MessageCircle,
  TrendingUp,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import MyNavbar from '../components/navbar';
import Footer from '../components/footer';
import SocialShare from '../components/global/social-share';
import { getBlogUrl, baseApi } from '../utils/url';
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

const ModernHero = styled(Box)(({ theme, image }) => ({
  position: 'relative',
  padding: '120px 0 180px',
  background: '#0f172a',
  color: '#fff',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.4,
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '200px',
    background: 'linear-gradient(to top, #f8fafc 0%, transparent 100%)',
    zIndex: 1,
  }
}));

const StyledArticle = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: '32px',
  marginTop: '-100px',
  position: 'relative',
  zIndex: 5,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '24px',
    marginTop: '-60px',
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  '& p': {
    fontSize: '1.25rem',
    lineHeight: 1.9,
    color: '#334155',
    marginBottom: '1.8rem',
    fontFamily: '"Inter", sans-serif',
  },
  '& h2': {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#0f172a',
    marginTop: '3rem',
    marginBottom: '1.2rem',
    letterSpacing: '-0.02em',
  },
  '& blockquote': {
    borderLeft: '5px solid #228756',
    paddingLeft: '2rem',
    margin: '3rem 0',
    fontStyle: 'italic',
    '& p': {
      fontSize: '1.6rem',
      color: '#1e293b',
      lineHeight: 1.5,
    }
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: '20px',
    margin: '2.5rem 0',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  }
}));

const SidebarCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: '100px',
}));

export default function BlogDetails() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

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
      const getBlog = async () => {
        try {
          const res = await fetchData(getBlogUrl, { id });
          if (res && res.status) setBlog(res.data);
        } catch (error) {
          console.error("Fetch Error:", error);
        } finally {
          setLoading(false);
        }
      };
      getBlog();
    }
  }, [id]);

  const getFullImagePath = (img) => {
    if (!img) return "";
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    return `${baseApi}/uploads/images/${img}`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <CircularProgress thickness={5} size={60} sx={{ color: '#228756' }} />
    </Box>
  );

  if (!blog) return <Typography>Blog not found</Typography>;

  const sanitizedContent = typeof window !== 'undefined' ? dompurify.sanitize(blog.content) : blog.content;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Head>
        <title>{blog.title} | Choose Your Therapist</title>
        <meta name="description" content={blog.short_desc} />
      </Head>

      <ProgressWrapper>
        <LinearProgress variant="determinate" value={scrollProgress} sx={{ height: 4, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: '#228756' } }} />
      </ProgressWrapper>

      <MyNavbar />

      <ModernHero image={getFullImagePath(blog.image)}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Stack spacing={4} alignItems={isMobile ? 'center' : 'flex-start'} sx={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Button 
              startIcon={<ArrowLeft size={18} />} 
              onClick={() => router.back()}
              sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none', fontSize: '1rem' }}
            >
              Back to Articles
            </Button>
            
            <Box>
              <Chip 
                label={blog.category} 
                sx={{ bgcolor: '#228756', color: '#fff', fontWeight: 800, mb: 3, px: 1 }} 
              />
              <Typography variant="h1" sx={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 900, lineHeight: 1.1, maxWidth: '900px' }}>
                {blog.title}
              </Typography>
            </Box>

            <Stack direction="row" spacing={3} alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#228756', width: 48, height: 48 }}>{blog.author_name?.[0] || 'A'}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#fff' }}>{blog.author_name || 'Admin'}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Author & Expert</Typography>
                </Box>
              </Stack>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Clock size={18} />
                <Typography variant="body2">5 min read</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </ModernHero>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} lg={8}>
            <StyledArticle elevation={0}>
              <ContentWrapper 
                className="blog-content-rich-text"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
              />
              
              <Box sx={{ mt: 8, p: 4, bgcolor: '#f1f5f9', borderRadius: '24px', display: 'flex', gap: 3, alignItems: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#228756', fontSize: '2rem' }}>{blog.author_name?.[0] || 'A'}</Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Written by {blog.author_name || 'Admin'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mental Health contributor at Choose Your Therapist. Committed to providing expert insights and practical advice for emotional well-being.
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 6 }}>
                <Stack direction="row" spacing={1}>
                  <IconButton sx={{ border: '1px solid #e2e8f0' }}><Share2 size={20} /></IconButton>
                  <IconButton sx={{ border: '1px solid #e2e8f0' }}><Bookmark size={20} /></IconButton>
                </Stack>
                <SocialShare url={typeof window !== 'undefined' ? window.location.href : ''} title={blog.title} />
              </Stack>
            </StyledArticle>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4} sx={{ mt: isMobile ? 4 : 0 }}>
              <SidebarCard elevation={0} sx={{ bgcolor: '#0f172a', color: '#fff', border: 'none' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Ready to talk?</Typography>
                <Typography sx={{ mb: 4, opacity: 0.8, fontSize: '1.1rem' }}>
                  Connect with a verified therapist who understands your journey.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={() => router.push('/view-all-therapist')}
                  sx={{ 
                    bgcolor: '#228756', 
                    py: 2, 
                    borderRadius: '16px', 
                    fontWeight: 800,
                    '&:hover': { bgcolor: '#1a6842' }
                  }}
                >
                  Book a Consultation
                </Button>
              </SidebarCard>

              <SidebarCard elevation={0}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TrendingUp size={22} color="#228756" /> Trending Articles
                </Typography>
                <Stack spacing={3}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ cursor: 'pointer', '&:hover h6': { color: '#228756' } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{blog.category}</Typography>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, mt: 0.5, transition: '0.2s' }}>
                        Understanding Emotional Resilience in 2024
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </SidebarCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
