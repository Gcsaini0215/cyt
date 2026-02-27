import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Avatar,
  Paper,
  Divider,
  Grid,
  Button,
  IconButton,
  TextField,
  useTheme,
  useMediaQuery,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Clock, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  Brain,
  MessageCircle,
  Share2,
  Bookmark,
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Hash,
  ArrowUp,
  Home
} from 'lucide-react';
import MyNavbar from '../components/navbar';
import Footer from '../components/footer';
import NewsLetter from '../components/home/newsletter';

// 2. Reading Progress Bar
const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '6px',
  zIndex: 9999,
  backgroundColor: 'rgba(34, 135, 86, 0.1)',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#228756',
    borderRadius: '0 4px 4px 0'
  }
}));

// 5. Sticky Social Share
const FloatingShare = styled(Box)(({ theme }) => ({
  position: 'fixed',
  left: '40px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  zIndex: 100,
  [theme.breakpoints.down('xl')]: {
    display: 'none'
  }
}));

const StyledSection = styled(Box)(({ theme }) => ({
  padding: '100px 0',
  backgroundColor: '#fff',
}));

const BlogHero = styled(Box)(({ theme, image }) => ({
  position: 'relative',
  padding: '160px 0 120px',
  textAlign: 'center',
  backgroundImage: `url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed', // Parallax Effect
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)',
    zIndex: 1,
  },
  [theme.breakpoints.down('md')]: {
    backgroundAttachment: 'scroll', // Disable parallax on mobile
    padding: '120px 0 80px',
  }
}));

const ArticleContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: '32px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9',
  marginTop: '40px',
  position: 'relative',
  zIndex: 10,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '20px',
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#228756',
  color: '#fff',
  fontWeight: 700,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '12px 4px',
  borderRadius: '8px',
  marginBottom: theme.spacing(3),
}));

export default function BlogView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(245);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const blogData = {
    title: "The Art of Mindful Living in a Digital Age",
    category: "Mental Health",
    date: "Feb 26, 2026",
    readTime: "10 min read",
    author: "Dr. Ananya Sharma",
    authorRole: "Clinical Psychologist",
    image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1200", // Darker professional abstract
    tags: ["Mindfulness", "Mental Well-being", "Self Care", "Digital Detox"],
    content: `
      <p id="introduction">Mindfulness is the basic human ability to be fully present, aware of where we are and what we’re doing, and not overly reactive or overwhelmed by what’s going on around us. While mindfulness is something we all naturally possess, it’s more readily available to us when we practice it on a daily basis.</p>
      
      <h2 id="section1">The Challenge of Digital Distraction</h2>
      <p>In today's hyper-connected world, our attention is constantly being pulled in multiple directions. Notifications, emails, and social media feeds are designed to capture our focus, often leading to a fragmented state of mind and increased stress levels.</p>
      
      <div style="margin: 40px 0; border-radius: 24px; overflow: hidden; height: 400px;">
        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200" alt="Workplace" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <blockquote>
        "The best way to capture moments is to pay attention. This is how we cultivate mindfulness."
      </blockquote>

      <h2 id="section2">Benefits of Daily Practice</h2>
      <p>When we practice mindfulness, we’re practicing the art of creating space for ourselves—space to think, space to breathe, space between ourselves and our reactions.</p>
      <ul>
        <li><strong>Reduced Stress:</strong> Lowering cortisol levels and calming the nervous system.</li>
        <li><strong>Enhanced Focus:</strong> Training the brain to return to the present moment.</li>
        <li><strong>Emotional Regulation:</strong> Better understanding and managing our feelings.</li>
      </ul>

      <h2 id="section3">Simple Steps to Start Today</h2>
      <p>You don't need a meditation cushion or hours of free time. You can practice mindfulness while eating, walking, or even washing the dishes.</p>
    `
  };

  const relatedBlogs = [
    {
      id: 1,
      title: "Mental Health in the Workplace",
      excerpt: "Learn how to manage stress and burnout at work effectively...",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Understanding Emotional Resilience",
      excerpt: "Discover how to bounce back from life's challenges with strength...",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Building Healthy Relationships",
      excerpt: "Key strategies for maintaining emotional connection and trust...",
      image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 4,
      title: "The Power of Daily Meditation",
      excerpt: "How 10 minutes of meditation can change your brain structure...",
      image: "https://images.unsplash.com/photo-1528319725582-ddc0b6a25718?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 5,
      title: "Overcoming Social Anxiety",
      excerpt: "Practical tips for navigating social situations with confidence...",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 6,
      title: "Sleep Hygiene for Better Mood",
      excerpt: "Why your sleep routine is the foundation of your mental health...",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#fff' }}>
      <Head>
        <title>Blog View | Choose Your Therapist</title>
        <meta name="description" content="Read our latest insights on mental health and emotional well-being." />
      </Head>

      {/* 2. Reading Progress Bar */}
      <ProgressBar variant="determinate" value={scrollProgress} />

      {/* 5. Floating Social Share */}
      <FloatingShare>
        <IconButton 
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
          sx={{ bgcolor: '#f8fafc', color: '#1877F2', '&:hover': { bgcolor: '#e2e8f0' } }}
        >
          <Facebook size={20} />
        </IconButton>
        <IconButton 
          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blogData.title}`, '_blank')}
          sx={{ bgcolor: '#f8fafc', color: '#1DA1F2', '&:hover': { bgcolor: '#e2e8f0' } }}
        >
          <Twitter size={20} />
        </IconButton>
        <IconButton 
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
          sx={{ bgcolor: '#f8fafc', color: '#0A66C2', '&:hover': { bgcolor: '#e2e8f0' } }}
        >
          <Linkedin size={20} />
        </IconButton>
        <IconButton 
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: blogData.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
          sx={{ bgcolor: '#f8fafc', color: '#64748b', '&:hover': { bgcolor: '#e2e8f0' } }}
        >
          <Share2 size={20} />
        </IconButton>
      </FloatingShare>

      <MyNavbar />

      <BlogHero image={blogData.image}>
        <Container maxWidth="xl">
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            {/* Breadcrumbs */}
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center" 
              justifyContent="center" 
              sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}
            >
              <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                <Home size={14} />
              </Link>
              <ChevronRight size={14} />
              <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                Blog
              </Link>
              <ChevronRight size={14} />
              <Typography sx={{ color: '#ffffff', fontSize: '13px', fontWeight: 700 }}>
                {blogData.category}
              </Typography>
            </Stack>

            <CategoryChip label={blogData.category} />
            <Typography variant="h1" sx={{ 
              fontWeight: 900, 
              fontSize: { xs: '28px', sm: '36px', md: '48px', lg: '52px' },
              lineHeight: 1.1,
              color: '#ffffff',
              mb: 4,
              letterSpacing: '-1px',
              maxWidth: '100%',
              margin: '0 auto 32px',
              display: 'block',
              whiteSpace: { lg: 'nowrap' },
              overflow: { lg: 'hidden' },
              textOverflow: { lg: 'ellipsis' }
            }}>
              {blogData.title}
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 2, sm: 4 }} 
              justifyContent="center" 
              alignItems="center"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#228756', width: 48, height: 48, boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)' }}>A</Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '16px', color: '#ffffff' }}>{blogData.author}</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>{blogData.authorRole}</Typography>
                </Box>
              </Stack>
              
              <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: '30px', bgcolor: 'rgba(255,255,255,0.2)' }} />
              
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#cbd5e1' }}>
                <Calendar size={18} />
                <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{blogData.date}</Typography>
              </Stack>

              <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: '30px', bgcolor: 'rgba(255,255,255,0.2)' }} />

              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#cbd5e1', display: { xs: 'none', md: 'flex' } }}>
                <Clock size={18} />
                <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{blogData.readTime}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </BlogHero>

      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Main Content Area */}
          <Grid item xs={12} lg={8.5}>
            <ArticleContainer elevation={0}>
              <Box sx={{ 
                borderRadius: '24px', 
                overflow: 'hidden', 
                mb: 6,
                height: { xs: '250px', md: '450px' }
              }}>
                <img 
                  src={blogData.image} 
                  alt={blogData.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              <Box sx={{ 
                '& p': { fontSize: '18px', lineHeight: 1.8, color: '#334155', mb: 4 },
                '& h2': { fontSize: '28px', fontWeight: 800, color: '#1e293b', mt: 6, mb: 3 },
                '& ul': { mb: 4, pl: 3 },
                '& li': { fontSize: '18px', mb: 2, color: '#334155' },
                '& blockquote': { 
                  borderLeft: '5px solid #228756', 
                  pl: 4, 
                  py: 1, 
                  my: 6, 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  fontStyle: 'italic',
                  color: '#1e293b',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '0 16px 16px 0'
                }
              }} dangerouslySetInnerHTML={{ __html: blogData.content }} />

              {/* 6. Tags Section */}
              <Box sx={{ mt: 6, mb: 4 }}>
                <Typography sx={{ fontWeight: 800, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Hash size={18} /> Tags
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {blogData.tags.map((tag) => (
                    <Link key={tag} href={`/blog?tag=${tag.toLowerCase().replace(' ', '-')}`} style={{ textDecoration: 'none' }}>
                      <Chip 
                        label={tag} 
                        sx={{ 
                          bgcolor: '#f1f5f9', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#e2e8f0', color: '#228756' } 
                        }} 
                      />
                    </Link>
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ my: 6 }} />

              {/* 3. Author Bio Section */}
              <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 6 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                  <Avatar sx={{ width: 100, height: 100, bgcolor: '#228756', fontSize: '40px' }}>A</Avatar>
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>About {blogData.author}</Typography>
                    <Typography sx={{ color: '#64748b', mb: 2, lineHeight: 1.6 }}>
                      Dr. Ananya is a dedicated Clinical Psychologist with over 10 years of experience helping individuals navigate emotional challenges and build resilience.
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                      <IconButton size="small"><Twitter size={18} /></IconButton>
                      <IconButton size="small"><Linkedin size={18} /></IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* 4. Comments Section */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MessageCircle /> 12 Comments
                </Typography>
                
                <Stack spacing={4}>
                  {/* Comment Input */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>U</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        placeholder="Write a comment..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                      />
                      <Button 
                        variant="contained" 
                        endIcon={<Send size={16} />}
                        sx={{ mt: 2, bgcolor: '#228756', borderRadius: '10px', textTransform: 'none', px: 4 }}
                      >
                        Post Comment
                      </Button>
                    </Box>
                  </Box>

                  {/* Sample Comment */}
                  <Stack direction="row" spacing={2}>
                    <Avatar sx={{ bgcolor: '#e2e8f0', color: '#64748b' }}>R</Avatar>
                    <Box>
                      <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: '0 20px 20px 20px', border: '1px solid #e2e8f0' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '14px', mb: 0.5 }}>Rohan Verma</Typography>
                        <Typography sx={{ color: '#334155', fontSize: '15px' }}>
                          This article was exactly what I needed today. The digital detox tips are very practical!
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '12px', color: '#94a3b8', mt: 1, ml: 1 }}>2 hours ago</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2}>
                  <Button 
                    onClick={handleLike}
                    startIcon={<Heart size={18} fill={isLiked ? "#ef4444" : "none"} />} 
                    sx={{ 
                      color: isLiked ? '#ef4444' : '#64748b', 
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: isLiked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(100, 116, 139, 0.05)' }
                    }}
                  >
                    {likesCount} Likes
                  </Button>
                  <Button 
                    startIcon={<MessageCircle size={18} />} 
                    sx={{ color: '#64748b', textTransform: 'none', fontWeight: 700 }}
                  >
                    12 Comments
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 size={20} /></IconButton>
                  <IconButton><Bookmark size={20} /></IconButton>
                </Stack>
              </Stack>
            </ArticleContainer>
          </Grid>

          {/* Sidebar Area */}
          <Grid item xs={12} lg={3.5}>
            <Stack spacing={4} sx={{ mt: { lg: '40px' }, position: 'sticky', top: '100px' }}>
              {/* 1. Table of Contents Sidebar */}
              <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <Typography sx={{ fontWeight: 800, mb: 3, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BookOpen size={20} /> Table of Contents
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { title: 'Introduction', id: 'introduction' },
                    { title: 'Digital Distraction', id: 'section1' },
                    { title: 'Daily Practice Benefits', id: 'section2' },
                    { title: 'Simple Steps to Start', id: 'section3' }
                  ].map((item) => (
                    <Typography 
                      key={item.id}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                      sx={{ 
                        fontSize: '16px', 
                        color: '#64748b', 
                        cursor: 'pointer',
                        transition: '0.2s',
                        '&:hover': { color: '#228756', pl: 1 }
                      }}
                    >
                      {item.title}
                    </Typography>
                  ))}
                </Stack>
              </Paper>

              {/* Search Sidebar */}
              <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <Typography sx={{ fontWeight: 800, mb: 2.5, color: '#1e293b', fontSize: '20px' }}>Search Articles</Typography>
                <TextField 
                  fullWidth 
                  placeholder="Search..." 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      fontSize: '16px'
                    } 
                  }}
                />
              </Paper>

              {/* Recent Posts Sidebar */}
              <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <Typography sx={{ fontWeight: 800, mb: 4, color: '#1e293b', fontSize: '20px' }}>Recent Posts</Typography>
                <Stack spacing={4}>
                  {relatedBlogs.map((item) => (
                    <Link key={item.id} href={`/blog-details/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Stack direction="row" spacing={2.5} sx={{ cursor: 'pointer', '&:hover h6': { color: '#228756' } }}>
                        <Box sx={{ width: 100, height: 75, borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" component="h6" sx={{ fontWeight: 800, lineHeight: 1.4, mb: 1, transition: '0.3s', fontSize: '17px' }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: '14px', color: '#64748b' }}>Feb 24, 2026</Typography>
                        </Box>
                      </Stack>
                    </Link>
                  ))}
                </Stack>
              </Paper>

              {/* Categories Sidebar */}
              <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <Typography sx={{ fontWeight: 800, mb: 3, color: '#1e293b', fontSize: '20px' }}>Categories</Typography>
                <Stack spacing={1.5}>
                  {['Mental Health', 'Therapy', 'Self Care', 'Psychology', 'Wellness'].map((cat) => (
                    <Link key={cat} href={`/blog?category=${cat.toLowerCase().replace(' ', '-')}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        fullWidth 
                        sx={{ 
                          justifyContent: 'space-between', 
                          color: '#475569', 
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '16px',
                          py: 1.5,
                          px: 2,
                          '&:hover': { color: '#228756', bgcolor: '#f0fdf4' }
                        }}
                      >
                        {cat}
                        <ChevronRight size={18} />
                      </Button>
                    </Link>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <StyledSection>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Explore More Articles</Typography>
            <Typography sx={{ color: '#64748b' }}>Discover insights to help you on your wellness journey.</Typography>
          </Box>
          <Grid container spacing={4}>
            {relatedBlogs.map((item) => (
              <Grid item xs={12} md={4} key={item.id}>
                <Link href={`/blog-details/${item.id}`} style={{ textDecoration: 'none' }}>
                  <Paper sx={{ 
                    p: 0, 
                    borderRadius: '28px', 
                    overflow: 'hidden',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-12px)', 
                      boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
                      borderColor: '#228756'
                    },
                    '&:hover img': { transform: 'scale(1.1)' }
                  }}>
                    <Box sx={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }} 
                      />
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 20, 
                        left: 20, 
                        bgcolor: '#228756', 
                        color: '#fff', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        Article
                      </Box>
                    </Box>
                    <Box sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 800, 
                        mb: 2, 
                        fontSize: '22px', 
                        lineHeight: 1.3, 
                        color: '#1e293b',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ 
                        color: '#64748b', 
                        fontSize: '15px', 
                        mb: 3,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.excerpt}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#228756', fontWeight: 800 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '15px' }}>Read More</Typography>
                        <ChevronRight size={18} />
                      </Stack>
                    </Box>
                  </Paper>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </StyledSection>

      <NewsLetter />
      <Footer />

      {/* Back to Top Button */}
      <Box
        onClick={scrollToTop}
        sx={{ 
          position: 'fixed', 
          bottom: '40px', 
          right: '40px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          zIndex: 1000,
          opacity: showBackToTop ? 1 : 0,
          visibility: showBackToTop ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
          '&:hover .top-icon': { bgcolor: '#1a6b44', transform: 'translateY(-5px)' },
          '&:hover .top-text': { color: '#228756' }
        }}
      >
        <IconButton 
          className="top-icon"
          sx={{ 
            bgcolor: '#228756', 
            color: '#fff',
            boxShadow: '0 10px 30px rgba(34, 135, 86, 0.3)',
            transition: 'all 0.3s ease',
            width: 50,
            height: 50
          }}
        >
          <ArrowUp size={24} />
        </IconButton>
        <Typography 
          className="top-text"
          sx={{ 
            fontSize: '11px', 
            fontWeight: 800, 
            color: '#64748b', 
            letterSpacing: '1px',
            transition: '0.3s'
          }}
        >
          TOP
        </Typography>
      </Box>
    </Box>
  );
}
