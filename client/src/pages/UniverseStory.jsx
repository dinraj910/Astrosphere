import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    text: "approximately 4.54 billion years ago from the accretion of gas and dust in the early solar system.",
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

function UniverseStory() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8,marginLeft: '210px' }}>
      <Container maxWidth="md" sx={{ pt: 8 }}>
        <Typography variant="h2" align="center" sx={{ fontFamily: 'Orbitron', mb: 6 }}>
          The Story of the Universe
        </Typography>
        {events.map((event, idx) => (
          <motion.div
            key={event.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
            style={{ marginBottom: 64 }}
          >
            <Box
              sx={{
                boxShadow: 3,
                borderRadius: 4,
                overflow: 'hidden',
                mb: 2,
                background: 'linear-gradient(120deg, #1b2735 60%, #090a0f 100%)',
                color: 'white',
              }}
            >
              <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
                <Box sx={{ flex: 1, mb: { xs: 2, md: 0 }, mr: { md: 4 } }}>
                  <Typography variant="h3" sx={{ fontFamily: 'Orbitron', mb: 1 }}>
                    {event.emoji} {event.title}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.85)' }}>
                    {event.text}
                  </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 3, fontWeight: 600, borderRadius: 2 }}
                      onClick={() => navigate(`/universe-story/${idx}`)}>
                      Learn More
                    </Button>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      maxWidth: 340,
                      borderRadius: 16,
                      boxShadow: '0 4px 32px rgba(129,140,248,0.18)',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </motion.div>
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