import React from 'react';
import { Typography, Grid, Card, CardMedia, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import '../styles/planetsSection.css';

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
      <Typography className="planets-section-title" variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
        Explore Our Solar System
      </Typography>
      <Grid 
        container 
        spacing={4}
        justifyContent="center"
        className="planets-grid-container"
        sx={{ 
          maxWidth: 1200, 
          mx: 'auto',
          px: { xs: 2, sm: 0 }
        }}
      >
        {planets.map((planet) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            key={planet.name}
            className="planets-grid-item"
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch'
            }}
          >
            <Card
              component={motion.div}
              whileHover={{ scale: 1.04 }}
              className="planet-card-mobile"
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 4px 32px rgba(129,140,248,0.10)',
                transition: 'box-shadow 0.3s',
                width: '100%',
                maxWidth: { xs: 350, sm: 400 },
                margin: '0 auto',
                '&:hover': {
                  boxShadow: '0 12px 48px rgba(129,140,248,0.18)'
                }
              }}
            >
              <CardMedia
                component="img"
                image={planet.image}
                alt={planet.name}
                className="planet-image-mobile"
                sx={{
                  height: { xs: 200, sm: 280 },
                  objectFit: 'cover',
                  transition: 'transform 0.4s',
                  ...(planet.imageSx || {}),
                  '&:hover': { transform: 'scale(1.08)' }
                }}
              />
              <Box
                className="planet-details-mobile"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  p: { xs: 2, sm: 3 },
                  background: 'linear-gradient(to top, rgba(12,10,24,0.92) 80%, transparent)',
                  color: 'white',
                  transition: 'background 0.4s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Typography 
                  variant="h5" 
                  className="planet-name-mobile"
                  sx={{ 
                    fontFamily: 'Orbitron', 
                    mb: 0.5,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  {planet.name}
                </Typography>
                <Typography 
                  color="text.secondary" 
                  className="planet-desc-mobile"
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    lineHeight: 1.4,
                    mb: 1
                  }}
                >
                  {planet.desc}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  className="planet-button-mobile"
                  sx={{ 
                    mt: 1, 
                    borderRadius: 2, 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    px: { xs: 2, sm: 3 }
                  }}
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