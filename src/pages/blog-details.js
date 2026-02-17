import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
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
  Card,
  CardMedia,
  CardContent,
  useMediaQuery,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Clock, 
  Calendar, 
  Share2, 
  BookOpen, 
  Brain,
  User,
  Tag,
  Search,
  ArrowUp,
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import MyNavbar from '../components/navbar';
import Footer from '../components/footer';
import { blogsData } from '../data/blogs-data';

// Modern Hero with Overlay
const ModernHero = styled(Box)(({ theme, image }) => ({
  position: 'relative',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary?.main || '#228756'} 0%, ${theme.palette.secondary?.main || '#1a5f42'} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.15,
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
    zIndex: 1,
  },
  [theme.breakpoints.down('md')]: {
    minHeight: '50vh',
  },
}));

const FloatingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '16px',
  },
}));

const BigTitle = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  fontWeight: 800,
  lineHeight: 1.2,
  color: '#fff',
  textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  maxWidth: '820px',
  margin: '0 auto',
  '& p': {
    fontSize: '1.25rem',
    lineHeight: 2,
    color: '#2C3E50',
    marginBottom: theme.spacing(3),
  },
  '& h2, & h3, & h4': {
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(3),
  },
  '& h2': {
    fontSize: '2.5rem',
  },
  '& h3': {
    fontSize: '2rem',
  },
  '& h4': {
    fontSize: '1.75rem',
  },
  [theme.breakpoints.down('md')]: {
    '& p': {
      fontSize: '1.125rem',
      lineHeight: 1.9,
    },
    '& h2': {
      fontSize: '2rem',
    },
    '& h3': {
      fontSize: '1.75rem',
    },
    '& h4': {
      fontSize: '1.5rem',
    },
  },
}));

const InsightBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(5),
  background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
  borderRadius: '20px',
  border: '2px solid #4CAF50',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const QuoteCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  margin: theme.spacing(6, 0),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '20px',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
  '&::before': {
    content: '"\\201C"',
    position: 'absolute',
    top: -20,
    left: 20,
    fontSize: '10rem',
    opacity: 0.2,
    fontFamily: 'Georgia, serif',
  },
}));

const SideCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const ScrollToTop = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 30,
  right: 30,
  backgroundColor: '#228756',
  color: '#fff',
  width: 56,
  height: 56,
  boxShadow: '0 8px 24px rgba(34, 135, 86, 0.4)',
  '&:hover': {
    backgroundColor: '#1a6842',
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(34, 135, 86, 0.5)',
  },
  transition: 'all 0.3s ease',
  zIndex: 1000,
}));

const CategoryTag = styled(Chip)(({ theme }) => ({
  backgroundColor: '#228756',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  padding: '8px 16px',
  height: 'auto',
  borderRadius: '12px',
  '& .MuiChip-label': {
    padding: '8px 12px',
  },
}));

const MetaItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#fff',
  fontSize: '1.1rem',
  fontWeight: 500,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: '8px 16px',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
}));

export default function BlogDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const blog = blogsData.find(b => b.id === parseInt(id));
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [comment, setComment] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!blog) {
    return (
      <>
        <MyNavbar />
        <Container maxWidth="md" sx={{ py: 15, textAlign: 'center' }}>
          <Brain size={100} color="#228756" style={{ marginBottom: 24 }} />
          <Typography variant="h2" gutterBottom sx={{ fontSize: '3rem', fontWeight: 800 }}>
            Blog Not Found
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontSize: '1.25rem' }}>
            The article you're looking for doesn't exist or has been moved.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/blogs')}
            sx={{
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              borderRadius: '50px',
              backgroundColor: '#228756',
              '&:hover': { backgroundColor: '#1a6842' },
            }}
          >
            Explore All Blogs
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const recentPosts = blogsData.filter(b => b.id !== blog.id).slice(0, 4);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <Helmet>
        <title>{blog.title} | Choose Your Therapist</title>
        <meta name="description" content={blog.description} />
        <meta name="keywords" content={`${blog.category}, Mental Health Blog, Therapy Insights, ${blog.title}`} />
        <link rel="canonical" href={`https://chooseyourtherapist.in/blog-details/${id}`} />
        
        <meta property="og:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta property="og:description" content={blog.description} />
        <meta property="og:url" content={`https://chooseyourtherapist.in/blog-details/${id}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={blog.image || "https://chooseyourtherapist.in/assets/img/og-image.jpg"} />
        <meta property="article:published_time" content={blog.date} />
        <meta property="article:author" content={blog.author} />
        <meta property="article:section" content={blog.category} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta name="twitter:description" content={blog.description} />
        <meta name="twitter:image" content={blog.image || "https://chooseyourtherapist.in/assets/img/og-image.jpg"} />
        
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Helmet>

      <MyNavbar />

      {/* Modern Hero Section */}
      <ModernHero image={blog.image}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
          <Fade in timeout={800}>
            <Stack spacing={4} alignItems="center">
              {/* Meta Info */}
              <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                <CategoryTag label={blog.category} icon={<Sparkles size={18} />} />
                <MetaItem>
                  <Clock size={20} />
                  <span>{blog.readingTime}</span>
                </MetaItem>
                <MetaItem>
                  <Calendar size={20} />
                  <span>{blog.date}</span>
                </MetaItem>
              </Stack>

              {/* Big Title */}
              <BigTitle variant="h1" align="center">
                {blog.title}
              </BigTitle>

              {/* Author */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                px: 3,
                py: 2,
                borderRadius: '50px',
              }}>
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${blog.author}&background=228756&color=fff`}
                  sx={{ width: 56, height: 56, border: '3px solid #fff' }}
                />
                <Box>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>
                    {blog.author}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                    Mental Health Expert
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Fade>
        </Container>
      </ModernHero>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -15, position: 'relative', zIndex: 3, pb: 10 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6}>
          {/* Article Content */}
          <Box sx={{ flex: 1 }}>
            <FloatingCard elevation={0}>
              <ContentSection sx={{ py: 4 }}>
                {/* Key Insights */}
                {blog.keyInsights && blog.keyInsights.length > 0 && (
                  <Zoom in timeout={600}>
                    <InsightBox elevation={0}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                        <Brain size={32} color="#4CAF50" />
                        <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 800, color: '#2E7D32' }}>
                          Key Takeaways
                        </Typography>
                      </Stack>
                      <Stack spacing={3}>
                        {blog.keyInsights.map((insight, index) => (
                          <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                            <Box
                              sx={{
                                minWidth: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '1rem',
                              }}
                            >
                              {index + 1}
                            </Box>
                            <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 500, flex: 1, pt: 0.5 }}>
                              {insight}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </InsightBox>
                  </Zoom>
                )}

                {/* Content */}
                <Typography variant="body1" paragraph sx={{ fontSize: '1.3rem', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.9 }}>
                  {blog.description}
                </Typography>

                <Typography variant="body1" paragraph>
                  Mental health is an essential part of our overall well-being. At Choose Your Therapist, 
                  we believe that everyone deserves access to quality mental health support and resources. 
                  This article explores key aspects of {blog.category.toLowerCase()} and provides actionable 
                  insights for your journey toward better mental wellness.
                </Typography>

                {/* Quote */}
                <QuoteCard elevation={0}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontStyle: 'italic',
                      fontWeight: 600,
                      lineHeight: 1.6,
                      fontSize: '1.75rem',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity."
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 3, textAlign: 'right', opacity: 0.9, fontSize: '1.1rem' }}>
                    — Choose Your Therapist
                  </Typography>
                </QuoteCard>

                {/* Section 1 */}
                <Typography variant="h2" gutterBottom>
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

                {/* Featured Image */}
                <Box sx={{ my: 6, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>

                {/* Section 2 */}
                <Typography variant="h3" gutterBottom>
                  Practical Steps You Can Take Today
                </Typography>
                <Typography variant="body1" paragraph>
                  While professional support is invaluable, there are also daily practices that can enhance your 
                  mental well-being:
                </Typography>

                <Stack spacing={3} sx={{ my: 5 }}>
                  {[
                    'Practice mindfulness and meditation for even just 5-10 minutes daily',
                    'Maintain a consistent sleep schedule to support emotional regulation',
                    'Engage in regular physical activity that you enjoy',
                    'Connect with supportive friends and family members',
                    'Set healthy boundaries in your relationships and commitments',
                    'Journal your thoughts and feelings to process emotions',
                  ].map((item, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 3,
                        backgroundColor: '#F5F5F5',
                        borderLeft: '5px solid #228756',
                        borderRadius: '12px',
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Typography variant="h4" sx={{ color: '#228756', minWidth: 40, fontSize: '1.75rem' }}>
                          {index + 1}.
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem', pt: 0.5 }}>
                          {item}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                <Typography variant="body1" paragraph>
                  Remember that seeking help is a sign of strength, not weakness. Our platform makes it easy to 
                  find the right therapist for your specific needs—whether you prefer online sessions or in-person 
                  meetings, we have qualified professionals ready to support your journey.
                </Typography>

                <Divider sx={{ my: 8 }} />

                {/* Share & Actions */}
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" sx={{ my: 5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                    Share this article:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {['facebook', 'twitter', 'linkedin'].map((platform) => (
                      <IconButton
                        key={platform}
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: '#228756',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#1a6842',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Share2 size={24} />
                      </IconButton>
                    ))}
                  </Stack>
                </Stack>

                {/* Comment Section */}
                <Box sx={{ mt: 10 }}>
                  <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
                    Leave a Comment
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                    Your email address will not be published. Share your thoughts with us.
                  </Typography>
                  <Stack spacing={3}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        size="large"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            borderRadius: '12px',
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Your Email"
                        type="email"
                        variant="outlined"
                        size="large"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Your Comment"
                      multiline
                      rows={6}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.1rem',
                          borderRadius: '12px',
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        alignSelf: 'flex-start',
                        px: 6,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: '50px',
                        backgroundColor: '#228756',
                        '&:hover': {
                          backgroundColor: '#1a6842',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 24px rgba(34, 135, 86, 0.4)',
                        },
                      }}
                    >
                      Post Comment
                    </Button>
                  </Stack>
                </Box>
              </ContentSection>
            </FloatingCard>
          </Box>

          {/* Sidebar */}
          {!isMobile && (
            <Box sx={{ width: 400 }}>
              <Stack spacing={4} sx={{ position: 'sticky', top: 100 }}>
                {/* Search */}
                <SideCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 3 }}>
                      Search Articles
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Search blogs..."
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Search size={24} style={{ marginRight: 12 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '1.1rem',
                        },
                      }}
                    />
                  </CardContent>
                </SideCard>

                {/* Recent Posts */}
                <SideCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 3 }}>
                      Recent Articles
                    </Typography>
                    <Stack spacing={3}>
                      {recentPosts.map((post) => (
                        <Box
                          key={post.id}
                          onClick={() => navigate(post.link)}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            cursor: 'pointer',
                            p: 2,
                            borderRadius: '12px',
                            transition: 'background-color 0.3s',
                            '&:hover': { backgroundColor: '#F5F5F5' },
                          }}
                        >
                          <Box
                            component="img"
                            src={post.image}
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: '12px',
                              objectFit: 'cover',
                            }}
                          />
                          <Box>
                            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1, lineHeight: 1.4 }}>
                              {post.title.slice(0, 50)}...
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Clock size={14} />
                              <Typography variant="caption" sx={{ fontSize: '0.9rem' }}>
                                {post.date}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </SideCard>

                {/* CTA Card */}
                <Paper
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, #228756 0%, #1a6842 100%)',
                    color: '#fff',
                    borderRadius: '20px',
                    textAlign: 'center',
                  }}
                >
                  <Heart size={48} style={{ marginBottom: 16 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                    Need Support?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', opacity: 0.95 }}>
                    Connect with a qualified therapist today
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/view-all-therapist')}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '50px',
                      backgroundColor: '#fff',
                      color: '#228756',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    Find Your Therapist
                  </Button>
                </Paper>
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Scroll to Top Button */}
      <Fade in={showScrollTop}>
        <ScrollToTop onClick={scrollToTop}>
          <ArrowUp size={28} />
        </ScrollToTop>
      </Fade>

      <Footer />
    </Box>
  );
}
