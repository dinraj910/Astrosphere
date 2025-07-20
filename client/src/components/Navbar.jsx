import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1a1a3d, #5c6bc0)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Orbitron' }}>
          Astrosphere
        </Typography>
        <Box>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              color="inherit"
              sx={{ mx: 1 }}
              component={motion.div}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;