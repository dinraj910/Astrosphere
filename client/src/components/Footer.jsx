import React from 'react';
import { Box, Typography, IconButton, Stack, Grid, Link, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import CodeIcon from '@mui/icons-material/Code';
import '../styles/footer.css';

function Footer() {
  return (
    <Box
      className="footer-container"
      sx={{
        py: 6,
        background: 'linear-gradient(135deg, #1b2735 0%, #090a0f 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        marginLeft: 0,
        marginRight: 0,
        left: 'auto',
        right: 'auto',
      }}
    >
      {/* Animated stars background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx="10%" cy="20%" r="1.5" fill="#fff" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="40%" r="1" fill="#fff" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="80%" r="1.2" fill="#fff" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="30%" cy="60%" r="1" fill="#fff" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="85%" cy="15%" r="1" fill="#fff" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="85%" r="1.3" fill="#fff" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.7s" repeatCount="indefinite" />
          </circle>
        </svg>
      </Box>

      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 4 } }}>
        {/* Main Brand Section */}
        <Grid item xs={12} md={4}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Orbitron', 
              mb: 2, 
              letterSpacing: 2,
              background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Astrosphere
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: 'rgba(255,255,255,0.8)', 
              lineHeight: 1.6,
              maxWidth: 400
            }}
          >
            Your gateway to the cosmos. Exploring the infinite wonders of our universe through 
            cutting-edge technology and authentic space data.
          </Typography>
          
          {/* Quick Links */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4c63d2' }}>
            Explore
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 3 }}>
            <Link href="chatbot" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#4c63d2' } }}>
              Chat Bot
            </Link>
            <Link href="satellites" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#4c63d2' } }}>
              Satellites
            </Link>
            <Link href="gallery" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#4c63d2' } }}>
              Gallery
            </Link>
            <Link href="universe" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#4c63d2' } }}>
              Universe
            </Link>
          </Stack>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 3, color: '#4c63d2' }}>
            Connect & Contact
          </Typography>
          
          {/* Developer Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
              Developed by <strong>DINRAJ K DINESH</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Full Stack Developer & Space Enthusiast
            </Typography>
            
            {/* Location */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LocationOnIcon sx={{ fontSize: 18, color: '#4c63d2' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Kottayam, Kerala, India
              </Typography>
            </Stack>
            
            {/* Portfolio Link */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LanguageIcon sx={{ fontSize: 18, color: '#4c63d2' }} />
              <Link 
                href="https://yourportfolio.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#4c63d2' } }}
              >
                yourportfolio.com
              </Link>
            </Stack>
          </Box>

          {/* Social Links */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <IconButton
              component="a"
              href="https://github.com/dinraj910"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'white', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                '&:hover': { 
                  color: '#4c63d2',
                  backgroundColor: 'rgba(76, 99, 210, 0.1)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              <GitHubIcon />
            </IconButton>
            
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/dinraj-k-dinesh-07956b254/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'white', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                '&:hover': { 
                  color: '#0077b5',
                  backgroundColor: 'rgba(0, 119, 181, 0.1)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              <LinkedInIcon />
            </IconButton>

            <IconButton
              component="a"
              href="#"
              sx={{ 
                color: 'white', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                '&:hover': { 
                  color: '#ffd54f',
                  backgroundColor: 'rgba(255, 213, 79, 0.1)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              <EmailIcon />
            </IconButton>

            <IconButton
              component="a"
              href="https://github.com/yourusername/astrosphere"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'white', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                '&:hover': { 
                  color: '#7c3aed',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              <CodeIcon />
            </IconButton>
          </Stack>

          {/* Business Inquiry */}
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            For collaborations and business inquiries:<br />
            <Link 
              href="dinrajdinesh564@gmail.com" 
              sx={{ color: '#4c63d2', textDecoration: 'none' }}
            >
              dinrajdinesh564@gmail.com
            </Link>
          </Typography>
        </Grid>

        {/* Earth Image Section - Third Column */}
        <Grid item xs={12} md={4} className="footer-earth-section">
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                maxWidth: '500px',
                bottom: 18,
                //background: 'linear-gradient(135deg, #1b2735 0%, #090a0f 100%)',
                p: 2,
                //border: '1px solid rgba(76, 99, 210, 0.2)',
              }}
            >
              <img
                src="https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvcm01MTMtZS0wMDdfMi1sMTRpYnhvbS5qcGc.jpg"
                alt="Earth"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  opacity: 0.9,
                  filter: 'brightness(0.95) contrast(1.1)',
                  transition: 'all 0.3s ease',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.opacity = '0.9';
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, opacity: 0.3 }} />

      {/* Bottom Section */}
      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
          © {new Date().getFullYear()} Astrosphere. Built with ❤️ for space explorers and dreamers.
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
          Powered by NASA APIs • Data sourced from official space agencies
        </Typography>
        
        {/* Back to Top Button */}
        <Box
          component="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            mt: 3,
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 25,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(76, 99, 210, 0.4)'
            }
          }}
        >
          Back to Stars ✨
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;