import React, { useState } from 'react';
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
  TextField,
  Paper,
  LinearProgress,
  Breadcrumbs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Clock, 
  Calendar, 
  Share2, 
  BookOpen, 
  Brain,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  Search,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from 'lucide-react';
import MyNavbar from '../components/navbar';
import Footer from '../components/footer';
import { blogsData } from '../data/blogs-data';
import { ThemeProvider } from '@mui/material/styles';
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import blogTheme from '../theme/blogTheme';

const createEmotionCache = () => {
  return createCache({
    key: "mui",
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.background.paper} 100%)`,
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(8),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(https://pixabay.com/get/g6394bd5a17e344e5085c5470244dd5e69af0b4dd3017205ddbda3ee4315e9381c1c80d08df6d89c324340a47fe7dc51b.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.08,
    zIndex: 0,
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(4),
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '720px',
  margin: '0 auto',
  padding: theme.spacing(6, 3),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 2),
  },
}));

const FeaturedImage = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: theme.shadows[4],
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(6),
  '& img': {
    width: '100%',
    height: 'auto',
    maxHeight: '500px',
    objectFit: 'cover',
    display: 'block',
  },
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
  },
}));

const KeyInsightsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(6),
  backgroundColor: theme.palette.success.light + '20',
  border: `2px solid ${theme.palette.success.main}40`,
  borderRadius: theme.shape.borderRadius * 1.5,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
}));

const QuoteBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(6, 0),
  backgroundColor: theme.palette.info.light,
  borderLeft: `6px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  '&::before': {
    content: '"\\201C"',
    position: 'absolute',
    top: -10,
    left: 20,
    fontSize: '4rem',
    color: theme.palette.primary.main,
    opacity: 0.3,
    fontFamily: 'Georgia, serif',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(4, 0),
  },
}));

const SidebarWidget = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const RelatedPostCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  height: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const ShareButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  transition: 'all 0.3s ease',
}));

export default function BlogDetailsNew() {
  const router = useRouter();
  const { id  } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const blog = blogsData.find(b => b.id === parseInt(id));
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [comment, setComment] = useState({ name: '', email: '', message: '' });

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!blog) {
    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={blogTheme}>
          <MyNavbar />
          <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
            <Brain size={80} color={theme.palette.primary.main} style={{ marginBottom: 24 }} />
            <Typography variant="h3" gutterBottom>
              Blog Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The blog post you're looking for doesn't exist or has been moved.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/blogs')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Back to All Blogs
            </Button>
          </Container>
          <Footer />
        </ThemeProvider>
      </CacheProvider>
    );
  }

  const recentPosts = blogsData.filter(b => b.id !== blog.id).slice(0, 3);
  const categories = [...new Set(blogsData.map(b => b.category))];

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = blog.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${text}&body=${url}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={blogTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Head>
            <title>{blog.title} | Choose Your Therapist</title>
            <meta name="description" content={blog.description} />
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </Head>

          <ProgressBar variant="determinate" value={readingProgress} />
          <MyNavbar />

          {/* Hero Section */}
          <HeroSection>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
              <Stack spacing={3} alignItems="center">
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ color: 'text.secondary' }}>
                  <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Home
                  </Link>
                  <Link href="/blogs" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Blogs
                  </Link>
                  <Typography color="text.primary">{blog.title.slice(0, 30)}...</Typography>
                </Breadcrumbs>

                {/* Category & Reading Time */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={blog.category}
                    size="medium"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      px: 1,
                    }}
                  />
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Clock size={16} />
                    <Typography variant="body2">{blog.readingTime}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Calendar size={16} />
                    <Typography variant="body2">{blog.date}</Typography>
                  </Stack>
                </Stack>

                {/* Title */}
                <Typography
                  variant="h1"
                  sx={{
                    textAlign: 'center',
                    maxWidth: '900px',
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 3,
                  }}
                >
                  {blog.title}
                </Typography>

                {/* Author Info */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${blog.author}&background=7BA05B&color=fff`}
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {blog.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mental Health Expert
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              {/* Featured Image */}
              <FeaturedImage>
                <img src={blog.image} alt={blog.title} />
              </FeaturedImage>
            </Container>
          </HeroSection>

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6}>
              {/* Article Content */}
              <Box sx={{ flex: 1 }}>
                <ContentWrapper>
                  {/* Key Insights */}
                  {blog.keyInsights && blog.keyInsights.length > 0 && (
                    <KeyInsightsCard elevation={0}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Brain size={24} color={theme.palette.primary.main} />
                        <Typography variant="h5" fontWeight={700} color="primary">
                          Key Insights
                        </Typography>
                      </Stack>
                      <Stack spacing={2}>
                        {blog.keyInsights.map((insight, index) => (
                          <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                mt: 1,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body1" sx={{ flex: 1 }}>
                              {insight}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </KeyInsightsCard>
                  )}

                  {/* Introduction */}
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.125rem', mb: 4 }}>
                    {blog.description}
                  </Typography>

                  <Typography variant="body1" paragraph>
                    Mental health is an essential part of our overall well-being. At Choose Your Therapist, 
                    we believe that everyone deserves access to quality mental health support and resources. 
                    This article explores key aspects of {blog.category.toLowerCase()} and provides actionable 
                    insights for your journey toward better mental wellness.
                  </Typography>

                  {/* Quote */}
                  <QuoteBox elevation={0}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontStyle: 'italic',
                        color: 'text.primary',
                        fontFamily: '"Lora", serif',
                        lineHeight: 1.6,
                      }}
                    >
                      "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity."
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
                      — Choose Your Therapist
                    </Typography>
                  </QuoteBox>

                  {/* Main Content */}
                  <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
                    Understanding the Journey
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Taking the first step toward mental wellness can feel overwhelming, but you don't have to 
                    navigate this journey alone. Our team of experienced therapists understands that each person's 
                    path is unique, and we're here to support you with compassionate, personalized care.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    Whether you're dealing with stress, anxiety, relationship challenges, or simply seeking personal 
                    growth, therapy provides a safe space for exploration and healing. The therapeutic relationship 
                    is built on trust, understanding, and non-judgment—creating an environment where you can express 
                    yourself freely and work toward meaningful change.
                  </Typography>

                  <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
                    Practical Steps You Can Take Today
                  </Typography>
                  <Typography variant="body1" paragraph>
                    While professional support is invaluable, there are also daily practices that can enhance your 
                    mental well-being:
                  </Typography>

                  <Stack spacing={2} sx={{ my: 4, pl: 2 }}>
                    {[
                      'Practice mindfulness and meditation for even just 5-10 minutes daily',
                      'Maintain a consistent sleep schedule to support emotional regulation',
                      'Engage in regular physical activity that you enjoy',
                      'Connect with supportive friends and family members',
                      'Set healthy boundaries in your relationships and commitments',
                      'Journal your thoughts and feelings to process emotions',
                    ].map((item, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                        <Typography variant="h6" color="primary.main" sx={{ minWidth: 24 }}>
                          {index + 1}.
                        </Typography>
                        <Typography variant="body1">{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Typography variant="body1" paragraph>
                    Remember that seeking help is a sign of strength, not weakness. Our platform makes it easy to 
                    find the right therapist for your specific needs—whether you prefer online sessions or in-person 
                    meetings, we have qualified professionals ready to support your journey.
                  </Typography>

                  <Divider sx={{ my: 6 }} />

                  {/* Share Section */}
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ my: 4 }}>
                    <Typography variant="h6" sx={{ mr: 2 }}>
                      Share this article:
                    </Typography>
                    <ShareButton size="small" onClick={() => handleShare('facebook')}>
                      <Facebook size={20} />
                    </ShareButton>
                    <ShareButton size="small" onClick={() => handleShare('twitter')}>
                      <Twitter size={20} />
                    </ShareButton>
                    <ShareButton size="small" onClick={() => handleShare('linkedin')}>
                      <Linkedin size={20} />
                    </ShareButton>
                    <ShareButton size="small" onClick={() => handleShare('email')}>
                      <Mail size={20} />
                    </ShareButton>
                  </Stack>

                  {/* Comment Section */}
                  <Box sx={{ mt: 8 }}>
                    <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                      Leave a Comment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Your email address will not be published. Required fields are marked *
                    </Typography>
                    <Stack spacing={3}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Name *"
                          variant="outlined"
                          value={comment.name}
                          onChange={(e) => setComment({ ...comment, name: e.target.value })}
                        />
                        <TextField
                          fullWidth
                          label="Email *"
                          type="email"
                          variant="outlined"
                          value={comment.email}
                          onChange={(e) => setComment({ ...comment, email: e.target.value })}
                        />
                      </Stack>
                      <TextField
                        fullWidth
                        label="Your Comment *"
                        multiline
                        rows={6}
                        variant="outlined"
                        value={comment.message}
                        onChange={(e) => setComment({ ...comment, message: e.target.value })}
                      />
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          alignSelf: 'flex-start',
                          px: 4,
                          py: 1.5,
                          backgroundColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        Post Comment
                      </Button>
                    </Stack>
                  </Box>
                </ContentWrapper>
              </Box>

              {/* Sidebar */}
              <Box sx={{ width: { xs: '100%', lg: '360px' } }}>
                <Stack spacing={3} sx={{ position: 'sticky', top: 100 }}>
                  {/* Search Widget */}
                  <SidebarWidget>
                    <Typography variant="h6" gutterBottom fontWeight={700}>
                      Search Articles
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Search blogs..."
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <Search size={20} style={{ marginRight: 8, color: '#95A5A6' }} />,
                      }}
                    />
                  </SidebarWidget>

                  {/* Recent Posts */}
                  <SidebarWidget>
                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                      Recent Posts
                    </Typography>
                    <Stack spacing={2}>
                      {recentPosts.map((post) => (
                        <RelatedPostCard key={post.id} onClick={() => router.push(post.link)}>
                          <Box
                            component="img"
                            src={post.image}
                            alt={post.title}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, lineHeight: 1.4 }}>
                              {post.title}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Clock size={12} color="#95A5A6" />
                              <Typography variant="caption" color="text.secondary">
                                {post.date}
                              </Typography>
                            </Stack>
                          </Box>
                        </RelatedPostCard>
                      ))}
                    </Stack>
                  </SidebarWidget>

                  {/* Categories */}
                  <SidebarWidget>
                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                      Categories
                    </Typography>
                    <Stack spacing={1.5}>
                      {categories.map((category, index) => (
                        <Stack
                          key={index}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            cursor: 'pointer',
                            p: 1.5,
                            borderRadius: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'grey.50',
                            },
                          }}
                          onClick={() => router.push('/blogs')}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Tag size={16} color={theme.palette.primary.main} />
                            <Typography variant="body2">{category}</Typography>
                          </Stack>
                          <Chip
                            label={blogsData.filter(b => b.category === category).length}
                            size="small"
                            sx={{ minWidth: 32, height: 24 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </SidebarWidget>

                  {/* Popular Tags */}
                  <SidebarWidget>
                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                      Popular Tags
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {['Therapy', 'Mental Health', 'Well-being', 'Counselling', 'Self-care', 'Mindfulness'].map(
                        (tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onClick={() => router.push('/blogs')}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white',
                              },
                            }}
                          />
                        )
                      )}
                    </Stack>
                  </SidebarWidget>
                </Stack>
              </Box>
            </Stack>
          </Container>

          <Footer />
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
