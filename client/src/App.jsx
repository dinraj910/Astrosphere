import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import theme from './styles/theme';
import { AuthProvider } from "./context/AuthContext";
import UniverseStory from './pages/UniverseStory';
import UniverseEventDetail from './pages/UniverseEventDetail';
import UniverseExplorer from './pages/UniverseExplorer';
import ObjectDetail from './pages/ObjectDetail';
import SatelliteTracker from './pages/SatelliteTracker';
import Galaxy from './pages/Galaxy';
import CosmicEvents from './pages/CosmicEvents';
//import './styles/responsive.css'; 

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          {/* This is where the CosmicBackground is integrated.
            It sits here, outside the main content Box, so it acts as a fixed background
            for the entire application.
          */}
          <Box sx={{ 
            color: 'text.primary', 
            minHeight: '100vh', 
            position: 'relative', // This makes sure the content appears on top of the background
            zIndex: 1 
          }}>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/universe-story" element={<UniverseStory />} />
                <Route path="/universe-story/:eventIndex" element={<UniverseEventDetail />} />
                <Route path="/universe-explorer" element={<UniverseExplorer />} />
                <Route path="/universe-explorer/:slug" element={<ObjectDetail />} />
                {/* Keep the old route for backwards compatibility */}
                <Route path="/universe" element={<UniverseExplorer />} />
                <Route path="/satellites" element={<SatelliteTracker />} />
                <Route path="/galaxy" element={<Galaxy />} />
                <Route path="/events" element={<CosmicEvents />} />
                {/* Add other routes here as needed */}
              </Routes>
            </main>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
