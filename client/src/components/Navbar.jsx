import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu as MenuIcon } from '@mui/icons-material';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Planets', path: '/planets' },
  { label: 'Satellites', path: '/satellites' },
  { label: 'Galaxy', path: '/galaxy' },
  { label: 'Events', path: '/events' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Chatroom', path: '/chatroom' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', background: (theme) => theme.palette.background.default, height: '100%' }}>
      <Typography variant="h6" sx={{ my: 2, fontFamily: 'Orbitron' }}>
        Astrosphere
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} component={Link} to={item.path}>
              <ListItemText primary={item.label} sx={{ fontFamily: 'Orbitron' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        component="nav"
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled ? 'rgba(12, 10, 24, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          transition: 'background 0.3s ease-in-out, border 0.3s ease-in-out',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Typography
            variant="h6"
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              fontFamily: 'Orbitron',
              color: 'text.primary',
              textShadow: '0 0 8px #818cf8, 0 0 16px #f472b6',
            }}
          >
            Astrosphere
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Orbitron',
                  fontWeight: 400,
                  borderRadius: '8px',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
             <Button variant="contained" color="primary" component={Link} to="/login" sx={{ ml: 2 }}>
              Login
            </Button>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Add a Toolbar component to offset the content below the fixed AppBar */}
      <Toolbar />
    </>
  );
}

export default Navbar;
