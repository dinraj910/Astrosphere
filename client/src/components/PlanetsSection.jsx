import React from 'react';
import { Typography, Grid, Card, CardMedia, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';

function PlanetsSection({ planets }) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
        Explore Our Solar System
      </Typography>
      <Grid container spacing={4}>
        {planets.map((planet) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={planet.name}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.04 }}
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 4px 32px rgba(129,140,248,0.10)',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: '0 12px 48px rgba(129,140,248,0.18)'
                }
              }}
            >
              <CardMedia
                component="img"
                image={planet.image}
                alt={planet.name}
                sx={{
                  height: 260,
                  objectFit: 'cover',
                  transition: 'transform 0.4s',
                  ...(planet.imageSx || {}),
                  '&:hover': { transform: 'scale(1.08)' }
                }}
              />
              <Box
                className="planet-details"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  p: 3,
                  background: 'linear-gradient(to top, rgba(12,10,24,0.92) 80%, transparent)',
                  color: 'white',
                  transition: 'background 0.4s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 0.5 }}>
                  {planet.name}
                </Typography>
                <Typography color="text.secondary" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {planet.desc}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
                  component="a"
                  href={planet.path}
                >
                  Explore
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

export default PlanetsSection;