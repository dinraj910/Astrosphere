import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, Grid, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowForward, RocketLaunch, Public, Newspaper } from '@mui/icons-material';

// --- Interactive Starfield Background Component ---
const Starfield = () => {
    const canvasRef = useRef(null);
    const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMouseMove = useCallback(e => {
        mousePos.current = { x: e.clientX, y: e.clientY };
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars = Array.from({ length: 1000 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            originalX: 0,
            originalY: 0,
        }));
        stars.forEach(s => { s.originalX = s.x; s.originalY = s.y; });

        const render = () => {
            if(!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                const dx = mousePos.current.x - canvas.width / 2;
                const dy = mousePos.current.y - canvas.height / 2;
                const parallaxX = dx * (star.radius / 100);
                const parallaxY = dy * (star.radius / 100);

                star.x += star.vx - parallaxX * 0.01;
                star.y += star.vy - parallaxY * 0.01;

                if (star.x < 0 || star.x > canvas.width) star.x = star.originalX;
                if (star.y < 0 || star.y > canvas.height) star.y = star.originalY;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
                ctx.fill();
            });
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        const handleResize = () => {
            if(canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)' }} />;
};


function Home() {
  const [apod, setApod] = useState(null);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const dateString = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:5000/api/nasa/apod?date=${dateString}`);
        setApod(response.data);
      } catch (error) {
        console.error('Error fetching APOD:', error);
        setApod({
            title: "The Pillars of Creation",
            url: "https://images-assets.nasa.gov/image/PIA20495/PIA20495~orig.jpg",
            explanation: "A classic image from the Hubble Space Telescope showing towering columns of interstellar gas and dust in the Eagle Nebula. This is fallback data as the API call failed.",
            date: new Date().toISOString().split('T')[0]
        });
      }
    };
    fetchAPOD();
  }, []);

  const featuredContent = [
      { icon: <RocketLaunch />, title: "Upcoming Launches", description: "Track the next missions heading to the stars.", tag: "Live Data" },
      { icon: <Newspaper />, title: "Latest Discoveries", description: "Read about groundbreaking findings from JWST and more.", tag: "News" },
      { icon: <Public />, title: "Interactive Solar System", description: "Fly through a 3D model of our cosmic neighborhood.", tag: "3D Model" },
  ];
  
  // Jupiter image centered in its card
  const planets = [
      { name: 'Earth', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/blue-marble-apollo-17-16x9-1.jpg?resize=1200,675', path: '/planets/earth', desc: 'Our home planet.' },
      { name: 'Mars', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/mars-full-globe-16x9-1.jpg?resize=1200,675', path: '/planets/mars', desc: 'The red planet.' },
      { name: 'Saturn', image: 'https://external-preview.redd.it/nhecArvQ9i2PxMLuPHN3WbfJcciUuBcilZmCXnh9QVM.jpg?auto=webp&s=93262463114e0b829e0253c73101953e948f1ccc', path: '/planets/saturn', desc: 'The ringed jewel.' },
      { name: 'Neptune', image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg', path: '/planets/neptune', desc: 'The ice giant.' },
      { name: 'Uranus', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/uranus-pia18182-16x9-1.jpg?resize=1200,675', path: '/planets/uranus', desc: 'The ice giant.' },
      { name: 'Mercury', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/pia15162-mercury-basins-messenger-16x9-1.jpg?resize=1200,675', path: '/planets/mercury', desc: 'The smallest planet.' },
      { name: 'Venus', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/venus-mariner-10-pia23791-fig2-16x9-1.jpg?resize=1200,675', path: '/planets/venus', desc: 'The second smallest planet.' },
      { name: 'Jupiter', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946-16x9-1.jpg?resize=1200,675', path: '/planets/jupiter', desc: 'The gas giant.', imageSx: { objectFit: 'contain', background: '#000', display: 'block', mx: 'auto' } },
      { name: 'Moon', image: 'https://mymodernmet.com/wp/wp-content/uploads/2017/11/100-megapixel-moon.jpg', path: '/planets/Moon', desc: 'The Moon' },
      { name: 'Pluto', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1OwazV5_riZuMIaO7iStzT-zh4HOjecDwGQ&s', path: '/planets/pluto', desc: 'The dwarf planet.' },
      { name: 'Sun', image: 'https://science.nasa.gov/wp-content/uploads/2023/05/sun-jpg.webp?w=628', path: '/planets/sun', desc: 'The star.' },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <Box>
      {/* Hero Section with Starfield */}
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
        <Starfield />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}>
            <Typography variant="h1" sx={{ color: 'white', textShadow: '0 0 25px rgba(244, 114, 182, 0.7), 0 0 10px rgba(129, 140, 248, 0.7)', mb: 2 }}>
              The Cosmos Awaits
            </Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
            <Typography variant="h5" component="p" sx={{ color: 'text.secondary', maxWidth: '700px', mx: 'auto', mb: 4 }}>
              An immersive, next-generation encyclopedia to explore the universe like never before.
            </Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }}>
            <Button variant="contained" color="primary" size="large" endIcon={<ArrowForward />}>
              Begin Exploration
            </Button>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 1, bgcolor: 'background.default' }}>
        {/* Featured Content Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
            <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>Featured Content</Typography>
            <Grid container spacing={4} justifyContent="center">
                {featuredContent.map(item => (
                    <Grid item xs={12} md={4} key={item.title}>
                        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'primary.main', borderRadius: 4, height: '100%', background: 'linear-gradient(145deg, rgba(26, 26, 61, 0.3), rgba(12, 10, 24, 0.5))' }}>
                            <Box sx={{ color: 'primary.main', fontSize: 40, mb: 2 }}>{item.icon}</Box>
                            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 1 }}>{item.title}</Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>{item.description}</Typography>
                            <Chip label={item.tag} color="secondary" size="small" />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </motion.div>
        
        {/* APOD Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
          <Box sx={{ my: 12 }}>
            <Typography variant="h2" align="center" gutterBottom>Astronomy Picture of the Day</Typography>
            {apod ? (
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <CardMedia
                  component="img"
                  image={apod.url}
                  alt={apod.title}
                  sx={{ width: { xs: '100%', md: '55%' }, objectFit: 'cover', aspectRatio: '16/10' }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', p: 4, flex: 1 }}>
                  <Typography variant="h4" component="h3" sx={{ fontFamily: 'Orbitron' }}>{apod.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>{new Date(apod.date).toDateString()}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '250px', pr: 1 }}>
                    {apod.explanation}
                  </Typography>
                  <Button variant="text" color="secondary" sx={{ mt: 2, alignSelf: 'flex-start' }} href={apod.hdurl || apod.url} target="_blank">View High-Res</Button>
                </Box>
              </Card>
            ) : <Typography>Loading APOD...</Typography>}
          </Box>
        </motion.div>

        {/* Planets Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
            <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>Explore Our Solar System</Typography>
            <Grid container spacing={4}>
                {planets.map((planet) => (
                    <Grid item xs={12} sm={6} md={3} key={planet.name}>
                        <Card sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', '&:hover .planet-details': { bottom: 0 }, '&:hover img': { transform: 'scale(1.1)' } }}>
                            <CardMedia
                                component="img"
                                image={planet.image}
                                alt={planet.name}
                                sx={{
                                    height: 350,
                                    objectFit: 'cover', // Default style
                                    transition: 'transform 0.4s ease',
                                    ...planet.imageSx, // Apply planet-specific styles
                                }}
                            />
                            <Box className="planet-details" sx={{ position: 'absolute', bottom: '-100%', left: 0, width: '100%', p: 3, background: 'linear-gradient(to top, rgba(12, 10, 24, 0.95), transparent)', transition: 'bottom 0.4s ease' }}>
                                <Typography variant="h4" sx={{ fontFamily: 'Orbitron', color: 'white' }}>{planet.name}</Typography>
                                <Typography color="text.secondary">{planet.desc}</Typography>
                                <Button variant="contained" color="secondary" size="small" sx={{ mt: 1 }} component="a" href={planet.path}>
                                    Explore
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </motion.div>

        {/* Footer */}
        <Box sx={{ mt: 16, py: 6, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h4" sx={{ fontFamily: 'Orbitron', mb: 2 }}>Astrosphere</Typography>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} | Built for the explorers and the dreamers.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
