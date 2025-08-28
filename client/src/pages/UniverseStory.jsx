import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

// Add a color/glow for each event for more "feeling"
const eventStyles = [
  { bg: 'radial-gradient(ellipse at top, #2b1055 0%, #7597de 100%)', glow: '0 0 32px #f472b6, 0 0 64px #818cf8' },
  { bg: 'radial-gradient(ellipse at top, #1b2735 0%, #fbbf24 100%)', glow: '0 0 32px #fbbf24, 0 0 64px #f472b6' },
  { bg: 'radial-gradient(ellipse at top, #090a0f 0%, #818cf8 100%)', glow: '0 0 32px #818cf8, 0 0 64px #fbbf24' },
  { bg: 'radial-gradient(ellipse at top, #1b2735 0%, #34d399 100%)', glow: '0 0 32px #34d399, 0 0 64px #818cf8' },
  { bg: 'radial-gradient(ellipse at top, #090a0f 0%, #f472b6 100%)', glow: '0 0 32px #f472b6, 0 0 64px #fbbf24' },
  { bg: 'radial-gradient(ellipse at top, #1b2735 0%, #fbbf24 100%)', glow: '0 0 32px #fbbf24, 0 0 64px #34d399' },
  { bg: 'radial-gradient(ellipse at top, #090a0f 0%, #818cf8 100%)', glow: '0 0 32px #818cf8, 0 0 64px #f472b6' },
  { bg: 'radial-gradient(ellipse at top, #1b2735 0%, #34d399 100%)', glow: '0 0 32px #34d399, 0 0 64px #818cf8' },
];

const events = [
  {
    title: "The Big Bang",
    emoji: "💥",
    image: "https://cdn.hswstatic.com/gif/before-big-bang-3.jpg",
    text: "13.8 billion years ago, the universe began as a singularity, exploding into existence and creating space, time, and all matter.",
  },
  {
    title: "First Stars Ignite",
    emoji: "✨",
    image: "https://blogs-images.forbes.com/startswithabang/files/2016/07/1-8e14TrRcyqPiHf9Cvy8dnw.jpeg",
    text: "Hundreds of millions of years later, the first stars formed, lighting up the cosmos and forging the first elements.",
  },
  {
    title: "Galaxies Take Shape",
    emoji: "🌌",
    image: "https://i.natgeofe.com/n/c5100908-bad2-4738-bb76-cfd2977156d1/75153.jpg",
    text: "Gravity pulled stars together into vast galaxies, swirling with billions of suns and mysterious dark matter.",
  },
  {
    title: "Our Solar System Forms",
    emoji: "☀️🪐",
    image: "https://supernova.eso.org/static/archives/exhibitionimages/screen/0507_C_planet-formation.jpg",
    text: "4.6 billion years ago, our Sun and planets formed from a cloud of gas and dust, setting the stage for life.",
  },
  {
    title: "Birth of Earth",
    emoji: "🌍",
    image: "https://www.shutterstock.com/shutterstock/videos/1079639573/thumb/1.jpg?ip=x480",
    text: "Approximately 4.54 billion years ago, Earth formed from the accretion of gas and dust in the early solar system.",
  },
  {
    title: "Life on Earth",
    emoji: "🌍🦠",
    image: "https://naturalhistory.si.edu/sites/default/files/styles/resource_side/public/media/image/cambrian-depictionkaren-carrsmithsonianpd516x342.jpg.webp?itok=nXOqJn5h",
    text: "Earth cooled, oceans formed, and the first life appeared. Over billions of years, life evolved into incredible diversity.",
  },
  {
    title: "Humans Look Up",
    emoji: "👨‍🚀🔭",
    image: "https://imageio.forbes.com/blogs-images/startswithabang/files/2018/03/astardisturb.jpg?format=jpg&height=600&width=1200&fit=bounds",
    text: "Humans emerged, gazed at the stars, and began to wonder about our place in the universe.",
  },
  {
    title: "Exploring the Cosmos",
    emoji: "🚀🌠",
    image: "https://thumbs.dreamstime.com/b/men-space-exploring-cosmos-venture-vast-unknown-pushing-boundaries-human-exploration-310222912.jpg",
    text: "From telescopes to space probes, we explore the universe, seeking answers to the biggest questions.",
  },
];

function AnimatedEvent({ event, idx, onLearnMore }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const controls = useAnimation();

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);

  // Unique style for each event
  const style = eventStyles[idx % eventStyles.length];

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        mb: 8,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 3,
        background: style.bg,
        color: 'white',
        transition: 'background 0.8s',
        left: '70px',
      }}
    >
      {/* Cosmic background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.5 } : { opacity: 0 }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: style.bg,
          filter: 'blur(32px)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.9, type: 'spring', bounce: 0.3 }}
          style={{ flex: 1, marginBottom: 16, marginRight: 32 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Orbitron',
              mb: 1,
              textShadow: style.glow,
              letterSpacing: 2,
            }}
          >
            {event.emoji} {event.title}
          </Typography>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.85)' }}>
              {event.text}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 3, fontWeight: 600, borderRadius: 2, boxShadow: style.glow }}
              onClick={onLearnMore}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 1.1, y: 40 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 1.1, type: 'spring', bounce: 0.2 }}
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <motion.img
            src={event.image}
            alt={event.title}
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 16,
              boxShadow: style.glow,
              objectFit: 'cover',
            }}
            whileHover={{ scale: 1.04, boxShadow: style.glow + ', 0 0 64px #fff2' }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
        </motion.div>
      </Box>
    </Box>
  );
}

function UniverseStory() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8, marginLeft: '210px' }}>
      <Container maxWidth="md" sx={{ pt: 8 }}>
        <Typography variant="h2" align="center" sx={{ fontFamily: 'Orbitron', mb: 6, ml: '150px' }}>
          The Story of the Universe
        </Typography>
        {events.map((event, idx) => (
          <AnimatedEvent
            key={event.title}
            event={event}
            idx={idx}
            onLearnMore={() => navigate(`/universe-story/${idx}`)}
          />
        ))}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default UniverseStory;