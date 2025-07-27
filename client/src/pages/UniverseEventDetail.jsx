import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Example: Add as much content and images as you want for each event!
const eventDetails = [
  {
    title: "The Big Bang",
    emoji: "",
    mainImage: "https://cdn.hswstatic.com/gif/before-big-bang-3.jpg",
    description: "13.8 billion years ago, the universe began as a singularity, exploding into existence and creating space, time, and all matter.",
    facts: [
      "The universe started from an infinitely hot, dense point.",
      "Cosmic microwave background is the afterglow of the Big Bang.",
      "All matter and energy originated from this event."
    ],
    gallery: [
      "https://www.science-sparks.com/wp-content/uploads/2022/06/Big-Bang-Diagram-scaled.jpg",
      "https://media.istockphoto.com/id/153086686/photo/space-warp-travel-trough-universe.jpg?s=612x612&w=0&k=20&c=Ftz1BmvhT-cXvRUyw_NCGOXQxVrVbhr35mp6XIQgH2Q=",
      "https://earthsky.org/upl/2021/06/Big-Bang-Concept.gif"
    ],
    quote: "“If you want to make an apple pie from scratch, you must first invent the universe.” – Carl Sagan"
  },
  // ...add similar objects for each event...
];

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7 }
  })
};

function UniverseEventDetail() {
  const { eventIndex } = useParams();
  const navigate = useNavigate();
  const event = eventDetails[eventIndex];

  if (!event) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4">Event not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 220, md: 400 }, overflow: 'hidden', mb: 4 }}>
        <motion.img
          src={event.mainImage}
          alt={event.title}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7) blur(0.5px)'
          }}
        />
        <Box sx={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Typography variant="h2" sx={{
              color: 'white', fontFamily: 'Orbitron', textShadow: '0 0 24px #000, 0 0 8px #f472b6', mb: 1, textAlign: 'center'
            }}>
              {event.emoji} {event.title}
            </Typography>
          </motion.div>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="contained"
          color="secondary"
          sx={{ position: 'absolute', top: 24, left: 24, zIndex: 2 }}
          onClick={() => navigate('/universe-story')}
        >
          Back
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ px: { xs: 2, md: 8 } }}>
        <Grid item xs={12} md={7}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={1}
          >
            <Typography variant="h4" sx={{ fontFamily: 'Orbitron', mb: 2 }}>
              About this Event
            </Typography>
            <Typography variant="body1" sx={{ fontSize: 18, mb: 3 }}>
              {event.description}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {event.facts.map((fact, i) => (
                <Chip
                  key={i}
                  label={fact}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1, fontWeight: 600, fontSize: 14 }}
                  component={motion.div}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                />
              ))}
            </Stack>
            <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 2 }}>
              {event.quote}
            </Typography>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={5}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={2}
          >
            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 2 }}>
              Gallery
            </Typography>
            <Grid container spacing={2}>
              {event.gallery.map((img, i) => (
                <Grid item xs={6} key={i}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 32px #818cf8' }}
                    sx={{ borderRadius: 3, overflow: 'hidden' }}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={`Gallery ${i + 1}`}
                      sx={{ height: 120, objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UniverseEventDetail;