import React from 'react';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';

function Footer() {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: 'center',
        background: 'linear-gradient(90deg, #1b2735 0%, #090a0f 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        boxSizing: 'border-box',
      }}
    >
      {/* Animated stars (optional, can remove if you want) */}
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
        </svg>
      </Box>

      <Typography variant="h4" sx={{ fontFamily: 'Orbitron', mb: 2, letterSpacing: 2, position: 'relative', zIndex: 1,marginTop: '10px' }}>
        Astrosphere
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
        © {new Date().getFullYear()} | Built for the explorers and the dreamers.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
        <IconButton
          component="a"
          href="https://github.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'white', transition: 'color 0.2s', '&:hover': { color: '#b3e5fc' } }}
        >
          <GitHubIcon fontSize="large" />
        </IconButton>
        <IconButton
          component="a"
          href="https://twitter.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'white', transition: 'color 0.2s', '&:hover': { color: '#29b6f6' } }}
        >
          <TwitterIcon fontSize="large" />
        </IconButton>
        <IconButton
          component="a"
          href="mailto:your@email.com"
          sx={{ color: 'white', transition: 'color 0.2s', '&:hover': { color: '#ffd54f' } }}
        >
          <EmailIcon fontSize="large" />
        </IconButton>
      </Stack>
      <Button
        variant="outlined"
        color="secondary"
        sx={{
          mt: 2,
          borderRadius: 2,
          fontWeight: 600,
          position: 'relative',
          zIndex: 1,
          borderColor: 'rgba(255,255,255,0.4)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255,255,255,0.08)',
            borderColor: 'white',
          },
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Back to Top
      </Button>
    </Box>
  );
}

export default Footer;