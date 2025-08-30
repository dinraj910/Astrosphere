import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, Grid, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowForward, RocketLaunch, Public, Newspaper } from '@mui/icons-material';
import FeaturedContent from '../components/FeaturedContent';
import APODCard from '../components/APODCard';
import PlanetsSection from '../components/PlanetsSection';
import FunFactCard from '../components/FunFactCard';
import ISSLocationCard from '../components/ISSLocationCard';
import SolarSystem3D from '../components/SolarSystem3D';
import Footer from '../components/Footer';
import AboutSection from '../components/AboutSection';
// Add this import with your other imports

// Import mobile-specific styles
import '../styles/mobile.css';

// --- UPGRADED Interactive Starfield Background Component ---
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

        // Create multiple layers for parallax effect
        const createStars = (count, radius, speed) => {
            return Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * radius + 0.5,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                alpha: 0.5 + Math.random() * 0.5,
                speed: speed
            }));
        };

        const createShootingStars = (count) => {
            return Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                len: Math.random() * 80 + 10,
                speed: Math.random() * 10 + 6,
                size: Math.random() * 1 + 0.5,
                active: false
            }));
        };

        const starsFar = createStars(300, 1.0, 0.1); // Distant, slow stars
        const starsMid = createStars(300, 1.5, 0.2); // Mid-distance stars
        const starsClose = createStars(100, 2.0, 0.4); // Closer, faster stars
        const shootingStars = createShootingStars(30);

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawLayer = (layer) => {
                layer.forEach(star => {
                    const dx = mousePos.current.x - canvas.width / 2;
                    const dy = mousePos.current.y - canvas.height / 2;
                    const parallaxX = dx * (star.speed * 0.1);
                    const parallaxY = dy * (star.speed * 0.1);

                    star.x += star.vx + parallaxX * 0.01;
                    star.y += star.vy + parallaxY * 0.01;

                    if (star.x < 0) star.x = canvas.width;
                    if (star.x > canvas.width) star.x = 0;
                    if (star.y < 0) star.y = canvas.height;
                    if (star.y > canvas.height) star.y = 0;

                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                    ctx.fill();
                });
            };
            
            drawLayer(starsFar);
            drawLayer(starsMid);
            drawLayer(starsClose);
            
            shootingStars.forEach(s => {
                if (s.active) {
                    s.x += s.speed;
                    s.y -= s.speed * 0.5; // Angled trajectory
                    if (s.x > canvas.width || s.y < 0) {
                        s.active = false;
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(s.x, s.y);
                        ctx.lineTo(s.x + s.len, s.y - s.len * 0.5);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
                        ctx.lineWidth = s.size;
                        ctx.stroke();
                    }
                } else if (Math.random() < 0.0005) { // Randomly activate a shooting star
                    s.active = true;
                    s.x = Math.random() * canvas.width / 2;
                    s.y = Math.random() * canvas.height / 2 + canvas.height / 2;
                }
            });

            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        const handleResize = () => {
            if (canvas) {
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const dateString = new Date().toISOString().split('T')[0];
        const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=qQsJqXKNsGAxJMpJeh5VOZnOh1HGkYZzts4JvuKp&date=${dateString}`);
        setApod(response.data);
      } catch (error) {
        console.error('Error fetching APOD: The backend endpoint might not be running or configured.', error);
        setApod({
            title: "The Pillars of Creation",
            url: "https://images-assets.nasa.gov/image/PIA20495/PIA20495~orig.jpg",
            explanation: "A classic image from the Hubble Space Telescope. This is fallback data as the API call failed.",
            date: new Date().toISOString().split('T')[0]
        });
      }
    };
    fetchAPOD();
  }, []);
  
  const planets = [
      { name: 'Earth', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/blue-marble-apollo-17-16x9-1.jpg?resize=1200,675', path: '/planets/earth', desc: 'Our home planet.' },
      { name: 'Mars', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/mars-full-globe-16x9-1.jpg?resize=1200,675', path: '/planets/mars', desc: 'The red planet.' },
      { name: 'Jupiter', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946-16x9-1.jpg?resize=1200,675', path: '/planets/jupiter', desc: 'The gas giant.', imageSx: { objectFit: 'contain', background: '#000', display: 'block', mx: 'auto' } },
      { name: 'Saturn', image: 'https://external-preview.redd.it/nhecArvQ9i2PxMLuPHN3WbfJcciUuBcilZmCXnh9QVM.jpg?auto=webp&s=93262463114e0b829e0253c73101953e948f1ccc', path: '/planets/saturn', desc: 'The ringed jewel.' },
      { name: 'Neptune', image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg', path: '/planets/neptune', desc: 'The ice giant.' },
      { name: 'Uranus', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/uranus-pia18182-16x9-1.jpg?resize=1200,675', path: '/planets/uranus', desc: 'The ice giant.' },
      { name: 'Mercury', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/pia15162-mercury-basins-messenger-16x9-1.jpg?resize=1200,675', path: '/planets/mercury', desc: 'The smallest planet.' },
      { name: 'Venus', image: 'https://science.nasa.gov/wp-content/uploads/2024/03/venus-mariner-10-pia23791-fig2-16x9-1.jpg?resize=1200,675', path: '/planets/venus', desc: 'The second smallest planet.' },
      { name: 'Sun', image: 'https://science.nasa.gov/wp-content/uploads/2023/05/sun-jpg.webp?w=628', path: '/planets/sun', desc: 'The star.' },
  ];

  return (
    <Box>
      <Starfield />
      {/* Hero Section - Updated with mobile-specific classes */}
      <Box 
        className="hero-section-mobile"
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center', 
          position: 'relative' 
        }}
      >
        <Container 
          maxWidth="md" 
          className="hero-container-mobile"
          sx={{ 
            position: 'relative', 
            zIndex: 1 
          }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Typography 
              variant="h1" 
              className="hero-heading-mobile hero-typography-mobile"
              sx={{ 
                color: 'white', 
                textShadow: '0 0 25px rgba(244, 114, 182, 0.7), 0 0 10px rgba(129, 140, 248, 0.7)', 
                mb: 2, 
                fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' }, 
                fontFamily: 'Orbitron' 
              }}
            >
              The Cosmos Awaits
            </Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
            <Typography 
              variant="h5" 
              component="p" 
              className="hero-typography-mobile"
              sx={{ 
                color: 'text.secondary', 
                maxWidth: '700px', 
                mx: 'auto', 
                mb: 4,
                px: { xs: 2, sm: 0 } // Add padding for mobile
              }}
            >
              An immersive, next-generation encyclopedia to explore the universe like never before.
            </Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              endIcon={<ArrowForward />} 
              onClick={() => navigate('/universe-story')}
              sx={{
                px: { xs: 3, sm: 4 }, // Responsive padding
                py: { xs: 1.5, sm: 2 }, // Responsive padding
                fontSize: { xs: '1rem', sm: '1.125rem' } // Responsive font size
              }}
            >
              Begin Exploration
            </Button>
          </motion.div>
        </Container>
      </Box>

      <Container 
  maxWidth={false}
  sx={{ 
    py: 8, 
    position: 'relative', 
    zIndex: 1, 
    bgcolor: 'background.default',
    width: '100%',
    px: { xs: 1, sm: 2, md: 3 },
    boxSizing: 'border-box'
  }}
>
        {/* Featured Content Section */}
        <FeaturedContent />
        
        {/* APOD Section */}
        <APODCard apod={apod} loading={!apod} />

        {/* Planets Section */}
        <PlanetsSection planets={planets} />
        <br /><br /><br />

        {/* ISS Location Card - Large and Centered */}
        <Box sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '850px', maxWidth: '100%' }}>
            <ISSLocationCard />
          </Box>
        </Box>

        {/* Fun Fact Card at the End */}
        <Box sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: 500 } }}>
            <FunFactCard />
          </Box>
        </Box>

        <AboutSection />

        {/* 3D Solar System Section <SolarSystem3D /> */}

         {/* Ending Section */}
        <Box 
          className="ending-section-container"
          sx={{ my: 10, textAlign: 'center', marginTop: '50px' }}
        >
          <Typography 
            variant="h4" 
            className="ending-section-title"
            sx={{ fontFamily: 'Orbitron', mb: 2 }}
          >
            Thank you for exploring Astrosphere!
          </Typography>
          <Typography 
            variant="h6" 
            className="ending-section-subtitle"
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            The universe is vast—keep looking up and stay curious.
          </Typography>
          <hr 
            className="ending-section-divider"
            style={{ maxWidth: 320, margin: '32px auto', border: '1px solid #444', opacity: 0.2 }} 
          />
        </Box>
      </Container>
      {/* Footer Section */}
      <Footer />
    </Box>
  );
}

export default Home;