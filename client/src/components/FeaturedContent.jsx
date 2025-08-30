import React, { useEffect, useRef, useState } from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Public, RocketLaunch, Event, Collections, SmartToy } from '@mui/icons-material';

// Import the CSS file
import '../styles/featuredContent.css';

const features = [
  {
    icon: <Public sx={{ fontSize: 40 }} />,
    title: "Universe Explorer",
    description: "Journey through our universe with detailed data and stunning visuals for every celestial body.",
    path: "/universe-explorer",
  },
  {
    icon: <RocketLaunch sx={{ fontSize: 40 }} />,
    title: "Satellite Tracker",
    description: "Track the International Space Station and other satellites in real-time as they orbit Earth.",
    path: "/satellites",
  },
  {
    icon: <Event sx={{ fontSize: 40 }} />,
    title: "Cosmic Events",
    description: "Stay updated on upcoming astronomical events like meteor showers, eclipses, and launches.",
    path: "/events",
  },
  {
    icon: <Collections sx={{ fontSize: 40 }} />,
    title: "NASA Image Gallery",
    description: "Browse a vast collection of breathtaking images from NASA's most famous missions.",
    path: "/gallery",
  },
  {
    icon: <SmartToy sx={{ fontSize: 40 }} />,
    title: "Cosmic Companion",
    description: "Ask our AI assistant anything about the universe, from black holes to the Big Bang.",
    path: "/chatbot",
  },
];

const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function FeaturedContent() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <Box 
      className="featured-content-container"
      ref={containerRef}
    >
      <Typography 
        variant="h2" 
        className={`featured-section-title featured-content-animate ${isVisible ? 'animate-visible' : ''}`}
        sx={{ 
          fontFamily: 'Orbitron',
          background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
        }}
      >
        Explore The Universe
      </Typography>

      <br />
      
      <div className={`featured-content-grid featured-content-animate ${isVisible ? 'animate-visible' : ''}`}>
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            className="featured-item"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1 }}
          >
            <Paper
              elevation={2}
              className="featured-paper"
              sx={{
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'secondary.main',
                }
              }}
            >
              <Box>
                <Box 
                  className="featured-icon" 
                  sx={{ color: 'primary.main' }}
                >
                  {item.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  className="featured-title"
                  sx={{ color: 'text.primary' }}
                >
                  {item.title}
                </Typography>
                <Typography 
                  className="featured-description"
                  sx={{ color: 'text.secondary' }}
                >
                  {item.description}
                </Typography>
              </Box>
              <Button
                component={Link}
                to={item.path}
                variant="outlined"
                color="secondary"
                className="featured-button"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderColor: 'secondary.main',
                    transform: 'scale(1.05)',
                  }
                }}
              >
                Explore
              </Button>
            </Paper>
          </motion.div>
        ))}
      </div>
    </Box>
  );
}

export default FeaturedContent;