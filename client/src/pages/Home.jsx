import { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Slider, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

function Home() {
  const [apod, setApod] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/nasa/apod?date=${date}`);
        setApod(response.data);
      } catch (error) {
        console.error('Error fetching APOD:', error);
      }
    };
    fetchAPOD();
  }, [date]);

  const handleDateChange = (event, newValue) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - newValue);
    setDate(newDate.toISOString().split('T')[0]);
  };

  const exploreItems = [
    { title: 'Planets', description: 'Discover our solar system.', path: '/planets' },
    { title: 'Satellites', description: 'Track real-time orbits.', path: '/satellites' },
    { title: 'Galaxy', description: 'Explore deep space wonders.', path: '/galaxy' },
    { title: 'Events', description: 'Catch upcoming cosmic events.', path: '/events' },
  ];

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: 'background.default', width: '100vw', overflowX: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'url(https://images-assets.nasa.gov/image/PIA12348/PIA12348~orig.jpg) no-repeat center/cover',
          opacity: 0.3,
        }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      />
      <Container maxWidth={false} disableGutters sx={{ position: 'relative', zIndex: 1, py: 8, px: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography variant="h1" align="center" gutterBottom>
            Welcome to Astrosphere
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" gutterBottom sx={{ mb: 6 }}>
            Explore the cosmos with stunning visuals and real-time data.
          </Typography>
        </motion.div>
        <Grid container spacing={4} justifyContent="center" sx={{ width: '100%' }}>
          {exploreItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  component="a"
                  href={item.path}
                  sx={{ width: '100%', py: 2, fontFamily: 'Orbitron' }}
                >
                  {item.title}
                </Button>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                  {item.description}
                </Typography>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {apod && (
          <Card sx={{ maxWidth: 800, mx: 'auto', mt: 8, width: '100%' }}>
            <CardMedia
              component={motion.img}
              image={apod.url}
              alt={apod.title}
              sx={{ height: 500, width: '100%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            />
            <CardContent>
              <Typography variant="h6">{apod.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {apod.explanation}
              </Typography>
              <Slider
                defaultValue={0}
                max={30}
                step={1}
                onChange={handleDateChange}
                sx={{ mt: 2 }}
                aria-label="APOD date slider"
              />
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

export default Home;