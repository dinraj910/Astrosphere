import React from 'react';
import { Box, Typography, Container, Grid, Paper, Stack, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Science, 
  Explore, 
  Psychology, 
  Code, 
  School,
  Star
} from '@mui/icons-material';
// Add this import with your other imports
import '../styles/aboutSection.css';

function AboutSection() {
  const features = [
    {
      icon: <Rocket sx={{ fontSize: 40, color: '#4c63d2' }} />,
      title: "Space Exploration",
      description: "Discover the wonders of our universe through real-time data and stunning visuals"
    },
    {
      icon: <Science sx={{ fontSize: 40, color: '#7c3aed' }} />,
      title: "Scientific Data",
      description: "Access authentic NASA APIs and real astronomical information"
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#ec4899' }} />,
      title: "Interactive Learning",
      description: "Engage with space through immersive experiences and educational content"
    },
    {
      icon: <Explore sx={{ fontSize: 40, color: '#ec4899' }} />,
      title: "Chasing dreams",
      description: "pursuing a career or achieving a dream within astronomy"
    }
  ];

  return (
    <Box
      component={motion.div}
      className="about-section-main"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      sx={{
        py: { xs: 6, md: 10 },
        background: 'linear-gradient(135deg, rgba(26,26,61,0.3) 0%, rgba(12,10,24,0.5) 100%)',
        borderRadius: { xs: 2, md: 4 },
        my: { xs: 4, md: 8 },
        mx: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(76, 99, 210, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Main About Section */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            className="about-title-mobile"
            component={motion.h2}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            sx={{
              fontFamily: 'Orbitron',
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            About Astrosphere
          </Typography>
          
          <Typography
            variant="h6"
            className="about-description-mobile"
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            sx={{
              color: 'text.secondary',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            Astrosphere is your gateway to the cosmos—a modern space exploration platform that brings the universe to your fingertips. 
            Built with cutting-edge technology and powered by authentic NASA data, we make astronomy accessible, interactive, and inspiring.
          </Typography>
        </Box>

        <Divider sx={{ my: 5, opacity: 0.3 }} />

        {/* Features Grid */}
        <Grid container spacing={4} className="about-features-grid-mobile" sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                component={motion.div}
                className="about-feature-card-mobile"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 3,
                  height: '100%',
                  width: '100%',
                  maxWidth: { xs: 340, sm: '100%' },
                  margin: '0 auto',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(76, 99, 210, 0.2)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 2, color: 'white' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Mission Statement */}
        <Box
          component={motion.div}
          className="about-mission-mobile"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          sx={{
            textAlign: 'center',
            p: 4,
            background: 'linear-gradient(135deg, rgba(76, 99, 210, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(76, 99, 210, 0.2)',
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 2, color: '#4c63d2' }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, maxWidth: 700, mx: 'auto' }}>
            To ignite curiosity about the cosmos and make space exploration accessible to everyone. 
            Whether you're tracking satellites, exploring planets, or discovering daily astronomy pictures, 
            Astrosphere connects you with the infinite wonders of our universe.
          </Typography>
        </Box>

        {/* Technology Section - Optional */}
        <Box className="about-tech-mobile" sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 4, color: '#4c63d2' }}>
            Our Technology
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, maxWidth: 700, mx: 'auto' }}>
            Astrosphere is built on a robust technological foundation, leveraging NASA's APIs and data repositories to deliver 
            real-time information and immersive experiences. Our platform is designed to inspire and educate, making 
            use of the latest advancements in web technologies and astronomical data visualization.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutSection;