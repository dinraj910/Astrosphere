import React from 'react';
import { Typography, Box, Grid, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Public, RocketLaunch, Event, Collections, SmartToy } from '@mui/icons-material';

const features = [
  {
    icon: <Public sx={{ fontSize: 40 }} />,
    title: "Universe Explorer",
    description: "Journey through our universe with detailed data and stunning visuals for every celestial body.",
    path: "/universe",
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
    path: "/companion",
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
  return (
    <Box sx={{ my: 8 }}>
      <Typography variant="h2" align="center" gutterBottom sx={{ mb: 4 }}>
        Explore The Universe
        <br />
      </Typography>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((item) => (
          <Grid
            item
            xs={12}
            sm={6}
            key={item.title}
            component={motion.div}
            variants={itemVariants}
            sx={{ display: 'flex' }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 2,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: 3,
                width: '100%',
                minHeight: 220,
                background: 'linear-gradient(145deg, rgba(26,26,61,0.2), rgba(12,10,24,0.3))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: '0 8px 32px rgba(129,140,248,0.18)'
                }
              }}
            >
              <Box>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{item.icon}</Box>
                <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2, fontSize: 14, minHeight: 40 }}>
                  {item.description}
                </Typography>
              </Box>
              <Button
                component={Link}
                to={item.path}
                variant="outlined"
                color="secondary"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  letterSpacing: 1,
                  fontSize: 14,
                }}
              >
                Explore
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default FeaturedContent;