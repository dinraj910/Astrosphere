import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar'; // Assuming Navbar is in components folder
import Home from './pages/Home'; // Assuming Home is in pages folder
import theme from './styles/theme'; // Your custom theme

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add other routes here later, e.g.: */}
            {/* <Route path="/planets" element={<PlanetsPage />} /> */}
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
