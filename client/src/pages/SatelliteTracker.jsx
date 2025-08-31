import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Container, Card, CardContent, Button, TextField, 
  InputAdornment, Chip, CircularProgress, Paper, IconButton, Tooltip,
  Avatar, LinearProgress, Dialog, DialogTitle, DialogContent, Badge,
  Fab, Zoom, Slide, Accordion, AccordionSummary, AccordionDetails,
  CardMedia, Divider, Alert, Snackbar
} from '@mui/material';
import { 
  Search, Satellite, LocationOn, Speed, Height, Visibility, 
  Schedule, Public, Info, Close, Launch, Timeline, MyLocation,
  Fullscreen, FullscreenExit, Settings, Star, StarBorder,
  ExpandMore, SignalCellularAlt, Battery90, Wifi, LiveTv, Explore
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Import leaflet marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Enhanced satellite icon with pulsing animation
const createSatelliteIcon = (category, isSelected = false) => {
  const colors = {
    'Space Stations': '#ff1744',
    'Scientific': '#3f51b5',
    'Earth Observation': '#4caf50',
    'Navigation': '#ff9800',
    'Communication': '#00bcd4',
    'Weather': '#8bc34a',
    'Military': '#f44336',
    'Cargo': '#9c27b0'
  };
  
  const color = colors[category] || '#757575';
  const size = isSelected ? 24 : 18;
  
  return new L.DivIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 20px ${color}aa, inset 0 0 10px rgba(255,255,255,0.3);
          animation: satellite-pulse 2s infinite;
          position: relative;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${size * 2}px;
          height: ${size * 2}px;
          border: 2px solid ${color}44;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: satellite-ring 3s infinite;
        "></div>
      </div>
      <style>
        @keyframes satellite-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes satellite-ring {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      </style>
    `,
    className: 'enhanced-satellite-icon',
    iconSize: [size + 20, size + 20],
    iconAnchor: [(size + 20) / 2, (size + 20) / 2]
  });
};

// Satellite images mapping
const satelliteImages = {
  25544: 'https://npr.brightspotcdn.com/88/34/911d670a44b4a5e7f40f11089d2c/iss-international-space-station.jpg',
  43013: 'https://science.nasa.gov/wp-content/uploads/2023/07/hubble-space-telescope-hst-6.jpg',
  20580: 'https://cdn.britannica.com/38/136038-050-6C12BD15/Artist-conception-Gaia.jpg',
  43435: 'https://cdn.esahubble.org/archives/images/screen/heic1719f.jpg',
  39166: 'https://astronomynow.com/wp-content/uploads/2016/04/Kepler_K2_640x480.jpg',
  default: 'https://media.istockphoto.com/id/182062885/photo/space-station-in-earth-orbit.jpg?s=612x612&w=0&k=20&c=F_P2YJ3QDbSW2n6dWkh6JNYeQGI1-2q-wOBk9-sw_Xo='
};

function SatelliteTracker() {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([40.7589, -73.9851]);
  const [trails, setTrails] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favoritesSats, setFavoritesSats] = useState(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [mapStyle, setMapStyle] = useState('dark');
  const [showOrbitalPaths, setShowOrbitalPaths] = useState(true);
  
  const socketRef = useRef();
  const mapRef = useRef();

  // Map style configurations
  const mapStyles = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  };

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to satellite tracker');
      setConnectionStatus('connected');
      showNotificationMessage('Connected to satellite network! 🛰️');
      
      // Request current API status on connect
      socketRef.current.emit('getApiStatus');
    });

    socketRef.current.on('disconnect', () => {
      setConnectionStatus('disconnected');
      showNotificationMessage('Disconnected from satellite network');
    });

    socketRef.current.on('initialSatelliteData', (data) => {
      console.log('Initial satellite data:', data);
      setSatellites(data);
      setLoading(false);
      
      if (data.length > 0 && !selectedSatellite) {
        const iss = data.find(sat => sat.noradId === 25544);
        if (iss) {
          setSelectedSatellite(iss);
          setMapCenter([iss.position?.satlatitude || 0, iss.position?.satlongitude || 0]);
        } else {
          setSelectedSatellite(data[0]);
        }
      }
    });

    socketRef.current.on('satelliteUpdate', (satelliteData) => {
      console.log('Satellite update received:', satelliteData.name, satelliteData.dataSource);
      
      setSatellites(prev => {
        const updated = prev.map(sat => 
          sat.noradId === satelliteData.noradId ? {
            ...satelliteData,
            position: satelliteData.position
          } : sat
        );
        
        // Update trails with smooth animation
        setTrails(prevTrails => {
          const newTrails = { ...prevTrails };
          if (!newTrails[satelliteData.noradId]) {
            newTrails[satelliteData.noradId] = [];
          }
          
          if (satelliteData.position) {
            newTrails[satelliteData.noradId].push([
              satelliteData.position.satlatitude,
              satelliteData.position.satlongitude
            ]);
            
            if (newTrails[satelliteData.noradId].length > 30) {
              newTrails[satelliteData.noradId] = newTrails[satelliteData.noradId].slice(-30);
            }
          }
          
          return newTrails;
        });
        
        return updated;
      });

      // Update selected satellite if it's the one being updated
      setSelectedSatellite(prev => {
        if (prev && prev.noradId === satelliteData.noradId) {
          return {
            ...satelliteData,
            position: satelliteData.position
          };
        }
        return prev;
      });
    });

    socketRef.current.on('searchResults', (results) => {
      setSearchResults(results);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedSatellite]);

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      socketRef.current?.emit('searchSatellites', term);
    } else {
      setSearchResults([]);
    }
  };

  const handleSatelliteSelect = (satellite) => {
    // Unselect previous satellite
    if (selectedSatellite && socketRef.current) {
      socketRef.current.emit('unselectSatellite', selectedSatellite.noradId);
    }
    
    setSelectedSatellite(satellite);
    if (satellite.position) {
      setMapCenter([satellite.position.satlatitude, satellite.position.satlongitude]);
    }
    setSearchResults([]);
    setSearchTerm('');
    showNotificationMessage(`Tracking ${satellite.name} 🎯`);
    
    // Select new satellite for real-time updates
    if (socketRef.current) {
      socketRef.current.emit('selectSatellite', satellite.noradId);
    }
  };

  const toggleFavorite = (satelliteId) => {
    setFavoritesSats(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(satelliteId)) {
        newFavs.delete(satelliteId);
        showNotificationMessage('Removed from favorites');
      } else {
        newFavs.add(satelliteId);
        showNotificationMessage('Added to favorites ⭐');
      }
      return newFavs;
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Space Stations': '#ff1744',
      'Scientific': '#3f51b5',
      'Earth Observation': '#4caf50',
      'Navigation': '#ff9800',
      'Communication': '#00bcd4',
      'Weather': '#8bc34a',
      'Military': '#f44336',
      'Cargo': '#9c27b0'
    };
    return colors[category] || '#757575';
  };

  const getSignalStrength = (altitude) => {
    if (altitude > 800) return 'Excellent';
    if (altitude > 500) return 'Good';
    if (altitude > 300) return 'Fair';
    return 'Weak';
  };

  const getOrbitalSpeed = (altitude) => {
    // Simplified orbital speed calculation
    const earthRadius = 6371; // km
    const mu = 398600; // km³/s²
    const r = earthRadius + altitude;
    return Math.sqrt(mu / r) * 3.6; // Convert to km/h
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: 'linear-gradient(45deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Satellite sx={{ fontSize: 80, color: '#00bcd4', mb: 2 }} />
        </motion.div>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Orbitron', 
          mb: 2,
          background: 'linear-gradient(45deg, #00bcd4, #3f51b5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Initializing Satellite Network
        </Typography>
        <LinearProgress 
          sx={{ 
            width: 300, 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #00bcd4, #3f51b5)'
            }
          }} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh', 
      pt: 8,
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)'
    }}>
      <Container maxWidth="xl">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Orbitron',
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 2,
                background: 'linear-gradient(45deg, #00bcd4, #3f51b5, #ff1744)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(0, 188, 212, 0.5)',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}
            >
              🛰️ ORBITAL COMMAND CENTER
            </Typography>
            <Typography variant="h5" sx={{ 
              color: '#00bcd4', 
              mb: 3,
              fontFamily: 'Orbitron',
              fontWeight: 300
            }}>
              Tracking {satellites.length} Active Satellites • Real-time Global Coverage
            </Typography>
            
            {/* Status Dashboard */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              flexWrap: 'wrap',
              mb: 3 
            }}>
              <Chip
                label={`${connectionStatus === 'connected' ? 'LIVE' : 'OFFLINE'}`}
                color={connectionStatus === 'connected' ? 'success' : 'error'}
                sx={{ 
                  fontSize: '1rem',
                  fontFamily: 'Orbitron',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
                icon={<LiveTv />}
              />
              <Chip 
                label={`${satellites.filter(s => s.priority === 1).length} Priority Targets`}
                color="error"
                variant="outlined"
              />
              <Chip 
                label={`Signal: ${getSignalStrength(selectedSatellite?.position?.sataltitude || 400)}`}
                color="info"
                variant="outlined"
                icon={<SignalCellularAlt />}
              />
            </Box>
          </Box>
        </motion.div>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3,
          width: '1330px'
        }}>
          {/* Enhanced Map Section */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ flex: 2, minHeight: '700px', width: '100%' }}
          >
            <Card sx={{ 
              height: '750px', 
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 188, 212, 0.2)',
              border: '1px solid rgba(0, 188, 212, 0.3)'
            }}>
              {/* Map Controls */}
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                <Tooltip title="Toggle Fullscreen">
                  <Fab 
                    size="small" 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    sx={{ bgcolor: 'rgba(0, 188, 212, 0.8)' }}
                  >
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </Fab>
                </Tooltip>
                <Tooltip title="Center on ISS">
                  <Fab 
                    size="small"
                    onClick={() => {
                      const iss = satellites.find(s => s.noradId === 25544);
                      if (iss) handleSatelliteSelect(iss);
                    }}
                    sx={{ bgcolor: 'rgba(255, 23, 68, 0.8)' }}
                  >
                    <MyLocation />
                  </Fab>
                </Tooltip>
              </Box>

              <CardContent sx={{ p: 0, height: '100%' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={3}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="enhanced-map"
                >
                  <TileLayer
                    url={mapStyles[mapStyle]}
                    attribution='&copy; Satellite Command Center'
                  />
                  
                  {/* Enhanced Satellite Markers */}
                  {satellites.map(satellite => {
                    if (!satellite.position) return null;
                    
                    const position = [satellite.position.satlatitude, satellite.position.satlongitude];
                    const isSelected = selectedSatellite?.noradId === satellite.noradId;
                    const icon = createSatelliteIcon(satellite.category, isSelected);
                    
                    return (
                      <React.Fragment key={satellite.noradId}>
                        <Marker 
                          position={position} 
                          icon={icon}
                          eventHandlers={{
                            click: () => handleSatelliteSelect(satellite)
                          }}
                        >
                          <Popup className="enhanced-popup">
                            <Box sx={{ 
                              textAlign: 'center', 
                              minWidth: 280,
                              p: 2
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  src={satelliteImages[satellite.noradId] || satelliteImages.default}
                                  sx={{ width: 60, height: 60, mr: 2 }}
                                />
                                <Box sx={{ textAlign: 'left' }}>
                                  <Typography variant="h6" sx={{ 
                                    fontFamily: 'Orbitron',
                                    fontSize: '1.1rem',
                                    fontWeight: 700
                                  }}>
                                    {satellite.name}
                                  </Typography>
                                  <Chip 
                                    label={satellite.category}
                                    size="small"
                                    sx={{ 
                                      bgcolor: getCategoryColor(satellite.category),
                                      color: 'white',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Box>
                              </Box>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Altitude:</strong> {Math.round(satellite.position.sataltitude)} km
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Speed:</strong> {getOrbitalSpeed(satellite.position.sataltitude).toFixed(0)} km/h
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Signal:</strong> {getSignalStrength(satellite.position.sataltitude)}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  onClick={() => setDetailsOpen(true)}
                                  sx={{ 
                                    background: 'linear-gradient(45deg, #00bcd4, #3f51b5)',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Full Details
                                </Button>
                                <IconButton 
                                  size="small"
                                  onClick={() => toggleFavorite(satellite.noradId)}
                                  sx={{ color: favoritesSats.has(satellite.noradId) ? '#ff1744' : '#ccc' }}
                                >
                                  {favoritesSats.has(satellite.noradId) ? <Star /> : <StarBorder />}
                                </IconButton>
                              </Box>
                            </Box>
                          </Popup>
                        </Marker>
                        
                        {/* Enhanced Orbital Trails */}
                        {showOrbitalPaths && trails[satellite.noradId] && trails[satellite.noradId].length > 1 && (
                          <>
                            <Polyline
                              positions={trails[satellite.noradId]}
                              color={getCategoryColor(satellite.category)}
                              weight={3}
                              opacity={0.7}
                              dashArray="5, 10"
                            />
                            {/* Coverage Circle */}
                            <Circle
                              center={position}
                              radius={2000000} // ~2000km coverage
                              pathOptions={{
                                color: getCategoryColor(satellite.category),
                                fillColor: getCategoryColor(satellite.category),
                                fillOpacity: 0.1,
                                weight: 2,
                                dashArray: "10, 20"
                              }}
                            />
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </MapContainer>

                {/* Enhanced Search Overlay */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 58, 
                  right: 100, 
                  zIndex: 1000 
                }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    placeholder="🔍 Search satellites (ISS, Hubble, Kepler...)"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      borderRadius: 3,
                      '& .MuiFilledInput-root': {
                        backgroundColor: 'transparent',
                        fontSize: '1.1rem',
                        fontFamily: 'Orbitron',
                        '&::before, &::after': { display: 'none' }
                      },
                      '& .MuiInputBase-input': { color: '#00bcd4' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#00bcd4' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Enhanced Search Results */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper sx={{ 
                          mt: 1, 
                          maxHeight: 300, 
                          overflow: 'auto',
                          background: 'rgba(0, 0, 0, 0.95)',
                          border: '1px solid rgba(0, 188, 212, 0.3)',
                          borderRadius: 2
                        }}>
                          {searchResults.map(result => (
                            <motion.div
                              key={result.noradId}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Box
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: 'rgba(0, 188, 212, 0.1)' },
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2
                                }}
                                onClick={() => handleSatelliteSelect(result)}
                              >
                                <Avatar 
                                  src={satelliteImages[result.noradId] || satelliteImages.default}
                                  sx={{ width: 40, height: 40 }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" sx={{ 
                                    fontWeight: 600,
                                    color: '#00bcd4',
                                    fontFamily: 'Orbitron'
                                  }}>
                                    {result.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {result.category} • ID: {result.noradId}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={`Priority ${result.priority}`}
                                  size="small"
                                  color={result.priority === 1 ? 'error' : 'warning'}
                                />
                              </Box>
                            </motion.div>
                          ))}
                        </Paper>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ flex: 1, width: '100%', minWidth: '400px' }}
          >
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Enhanced Selected Satellite Info */}
              {selectedSatellite && (
                <Card sx={{ 
                  mb: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%)',
                  border: '1px solid rgba(0, 188, 212, 0.3)',
                  boxShadow: '0 10px 30px rgba(0, 188, 212, 0.2)'
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={satelliteImages[selectedSatellite.noradId] || satelliteImages.default}
                    alt={selectedSatellite.name}
                    sx={{ 
                      filter: 'brightness(0.8)',
                      position: 'relative'
                    }}
                  />
                  <CardContent sx={{ pt: 0, mt: -2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: getCategoryColor(selectedSatellite.category),
                          width: 60,
                          height: 60,
                          mr: 2,
                          border: '3px solid white',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <Satellite sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: 'Orbitron',
                          fontWeight: 700,
                          mb: 1,
                          color: '#00bcd4'
                        }}>
                          {selectedSatellite.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={selectedSatellite.category}
                            size="small"
                            sx={{ 
                              bgcolor: getCategoryColor(selectedSatellite.category),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          <IconButton 
                            size="small"
                            onClick={() => toggleFavorite(selectedSatellite.noradId)}
                            sx={{ color: favoritesSats.has(selectedSatellite.noradId) ? '#ff1744' : '#ccc' }}
                          >
                            {favoritesSats.has(selectedSatellite.noradId) ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>

                    {/* Real-time Telemetry */}
                    {selectedSatellite.position && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          fontFamily: 'Orbitron',
                          color: '#00bcd4',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <LiveTv /> Live Telemetry
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: 2 
                        }}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            bgcolor: 'rgba(0, 188, 212, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(0, 188, 212, 0.3)'
                          }}>
                            <LocationOn color="primary" sx={{ fontSize: 30 }} />
                            <Typography variant="caption" color="text.secondary" display="block">
                              COORDINATES
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              {selectedSatellite.position.satlatitude.toFixed(4)}°
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              {selectedSatellite.position.satlongitude.toFixed(4)}°
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            bgcolor: 'rgba(63, 81, 181, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(63, 81, 181, 0.3)'
                          }}>
                            <Height color="secondary" sx={{ fontSize: 30 }} />
                            <Typography variant="caption" color="text.secondary" display="block">
                              ALTITUDE
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              {Math.round(selectedSatellite.position.sataltitude)}
                            </Typography>
                            <Typography variant="caption">KM</Typography>
                          </Box>
                          
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(76, 175, 80, 0.3)'
                          }}>
                            <Speed sx={{ color: '#4caf50', fontSize: 30 }} />
                            <Typography variant="caption" color="text.secondary" display="block">
                              VELOCITY
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              {getOrbitalSpeed(selectedSatellite.position.sataltitude).toFixed(0)}
                            </Typography>
                            <Typography variant="caption">KM/H</Typography>
                          </Box>
                          
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 152, 0, 0.3)'
                          }}>
                            <SignalCellularAlt sx={{ color: '#ff9800', fontSize: 30 }} />
                            <Typography variant="caption" color="text.secondary" display="block">
                              SIGNAL
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {getSignalStrength(selectedSatellite.position.sataltitude)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => setDetailsOpen(true)}
                      startIcon={<Info />}
                      sx={{
                        background: 'linear-gradient(45deg, #00bcd4, #3f51b5)',
                        borderRadius: 3,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #00acc1, #3949ab)',
                          boxShadow: '0 12px 35px rgba(0, 188, 212, 0.6)',
                        }
                      }}
                    >
                      DETAILED ANALYSIS
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Active Satellites List */}
              <Card sx={{ 
                borderRadius: 4,
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                right: '650px',
                width: '800px'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontFamily: 'Orbitron',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Badge badgeContent={satellites.length} color="primary">
                      <Satellite />
                    </Badge>
                    ACTIVE SATELLITES
                  </Typography>
                  
                  <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                    {satellites.map((satellite, index) => (
                      <motion.div
                        key={satellite.noradId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          sx={{
                            mb: 2,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: selectedSatellite?.noradId === satellite.noradId 
                              ? 'linear-gradient(135deg, rgba(0, 188, 212, 0.2), rgba(63, 81, 181, 0.2))'
                              : 'rgba(255, 255, 255, 0.05)',
                            border: `2px solid ${selectedSatellite?.noradId === satellite.noradId ? getCategoryColor(satellite.category) : 'transparent'}`,
                            borderRadius: 3,
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 12px 30px ${getCategoryColor(satellite.category)}40`,
                              background: `linear-gradient(135deg, ${getCategoryColor(satellite.category)}20, rgba(255, 255, 255, 0.1))`
                            }
                          }}
                          onClick={() => handleSatelliteSelect(satellite)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                src={satelliteImages[satellite.noradId] || satelliteImages.default}
                                sx={{ width: 50, height: 50, mr: 2 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ 
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  color: getCategoryColor(satellite.category),
                                  fontFamily: 'Orbitron'
                                }}>
                                  {satellite.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Chip 
                                    label={satellite.category}
                                    size="small"
                                    sx={{ 
                                      bgcolor: getCategoryColor(satellite.category),
                                      color: 'white',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  <Chip 
                                    label={`P${satellite.priority}`}
                                    size="small"
                                    color={satellite.priority === 1 ? 'error' : satellite.priority === 2 ? 'warning' : 'default'}
                                  />
                                  <Chip 
                                    label={satellite.dataSource?.toUpperCase() || 'LOADING'}
                                    size="small"
                                    sx={{
                                      bgcolor: 
                                        satellite.dataSource === 'api' ? '#4caf50' :
                                        satellite.dataSource === 'predicted' ? '#ff9800' :
                                        satellite.dataSource === 'mock' ? '#9c27b0' : '#757575',
                                      color: 'white',
                                      fontSize: '0.6rem'
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">
                                  ALTITUDE
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                  {satellite.position ? Math.round(satellite.position.sataltitude) : '---'} km
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Last Update: {satellite.lastUpdated ? new Date(satellite.lastUpdated).toLocaleTimeString() : 'Pending...'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: satellite.position ? '#4caf50' : '#ff9800',
                                    boxShadow: `0 0 12px ${satellite.position ? '#4caf50' : '#ff9800'}`,
                                    animation: satellite.position ? 'pulse 2s infinite' : 'none'
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {satellite.position ? 'ACTIVE' : 'STANDBY'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Mission Categories */}
              <Card sx={{ 
                mt: 3,
                borderRadius: 4,
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                right: '650px',
                width: '800px'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontFamily: 'Orbitron',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Explore sx={{ color: '#00bcd4' }} />
                    MISSION CATEGORIES
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: 2,
                    mb: 3
                  }}>
                    {Object.entries({
                      'Space Stations': { icon: '🏛️', color: '#ff1744', count: satellites.filter(s => s.category === 'Space Stations').length },
                      'Scientific': { icon: '🔬', color: '#3f51b5', count: satellites.filter(s => s.category === 'Scientific').length },
                      'Earth Observation': { icon: '🌍', color: '#4caf50', count: satellites.filter(s => s.category === 'Earth Observation').length },
                      'Communication': { icon: '📡', color: '#00bcd4', count: satellites.filter(s => s.category === 'Communication').length },
                      'Navigation': { icon: '🧭', color: '#ff9800', count: satellites.filter(s => s.category === 'Navigation').length },
                      'Weather': { icon: '⛈️', color: '#8bc34a', count: satellites.filter(s => s.category === 'Weather').length }
                    }).map(([category, data]) => (
                      <motion.div
                        key={category}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Box 
                          sx={{ 
                            p: 2.5, 
                            bgcolor: `${data.color}20`,
                            borderRadius: 3,
                            border: `1px solid ${data.color}40`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: `${data.color}30`,
                              border: `2px solid ${data.color}60`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${data.color}40`
                            }
                          }}
                          onClick={() => {
                            const categorySats = satellites.filter(s => s.category === category);
                            if (categorySats.length > 0) {
                              handleSatelliteSelect(categorySats[0]);
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                              {data.icon}
                            </Typography>
                            <Typography variant="h5" sx={{ 
                              color: data.color, 
                              fontFamily: 'Orbitron',
                              fontWeight: 700 
                            }}>
                              {data.count}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: 'white',
                            fontSize: '0.9rem',
                            lineHeight: 1.2
                          }}>
                            {category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Active Satellites
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>

                  {/* Quick Stats */}
                  <Box sx={{ 
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      fontFamily: 'Orbitron',
                      color: '#00bcd4',
                      textAlign: 'center'
                    }}>
                      📊 ORBITAL STATISTICS
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: 3 
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                          color: '#4caf50', 
                          fontFamily: 'Orbitron',
                          fontWeight: 700,
                          mb: 1
                        }}>
                          {satellites.filter(s => s.position && s.position.sataltitude > 400).length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          HIGH ORBIT
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          &gt;400km
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                          color: '#ff9800', 
                          fontFamily: 'Orbitron',
                          fontWeight: 700,
                          mb: 1
                        }}>
                          {satellites.filter(s => s.priority === 1).length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          PRIORITY
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          MISSIONS
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                          color: '#ff1744', 
                          fontFamily: 'Orbitron',
                          fontWeight: 700,
                          mb: 1
                        }}>
                          {connectionStatus === 'connected' ? satellites.filter(s => s.position).length : 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          LIVE TRACKING
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          ACTIVE NOW
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </motion.div>
        </Box>
      </Container>

      {/* Enhanced Detailed Information Modal */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
            border: '1px solid rgba(0, 188, 212, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={satelliteImages[selectedSatellite?.noradId] || satelliteImages.default}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 3,
                  border: '3px solid',
                  borderColor: getCategoryColor(selectedSatellite?.category)
                }}
              />
              <Box>
                <Typography variant="h4" sx={{ 
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  color: '#00bcd4',
                  mb: 1
                }}>
                  {selectedSatellite?.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  NORAD ID: {selectedSatellite?.noradId} • Classification: {selectedSatellite?.category}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => setDetailsOpen(false)}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedSatellite && (
            <>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 4,
                mb: 4
              }}>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontFamily: 'Orbitron', 
                    color: '#00bcd4',
                    mb: 3
                  }}>
                    🌐 Real-time Orbital Data
                  </Typography>
                  {selectedSatellite?.position ? (
                    <Box sx={{ 
                      bgcolor: 'rgba(0, 188, 212, 0.1)',
                      borderRadius: 3,
                      p: 3,
                      border: '1px solid rgba(0, 188, 212, 0.3)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>Latitude:</Typography>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#00bcd4' }}>
                          {selectedSatellite.position.satlatitude?.toFixed(6) || 'N/A'}°
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>Longitude:</Typography>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#00bcd4' }}>
                          {selectedSatellite.position.satlongitude?.toFixed(6) || 'N/A'}°
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>Altitude:</Typography>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#4caf50' }}>
                          {selectedSatellite.position.sataltitude ? Math.round(selectedSatellite.position.sataltitude) : 'N/A'} km
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 600 }}>Orbital Velocity:</Typography>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#ff9800' }}>
                          {selectedSatellite.position.sataltitude ? getOrbitalSpeed(selectedSatellite.position.sataltitude).toFixed(2) : 'N/A'} km/h
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Position data is currently being acquired...
                    </Alert>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontFamily: 'Orbitron', 
                    color: '#3f51b5',
                    mb: 3
                  }}>
                    📡 Satellite Information
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(63, 81, 181, 0.1)',
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid rgba(63, 81, 181, 0.3)'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600 }}>Category:</Typography>
                      <Chip 
                        label={selectedSatellite?.category || 'Unknown'}
                        sx={{ 
                          bgcolor: getCategoryColor(selectedSatellite?.category || 'Unknown'), 
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600 }}>Priority Level:</Typography>
                      <Chip 
                        label={`Level ${selectedSatellite?.priority || 'N/A'}`}
                        color={selectedSatellite?.priority === 1 ? 'error' : selectedSatellite?.priority === 2 ? 'warning' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ fontWeight: 600 }}>Signal Strength:</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {selectedSatellite?.position ? getSignalStrength(selectedSatellite.position.sataltitude) : 'N/A'}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 600 }}>Last Update:</Typography>
                      <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#00bcd4' }}>
                        {selectedSatellite?.lastUpdated ? new Date(selectedSatellite.lastUpdated).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Accordion sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                '&:before': { display: 'none' }
              }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" sx={{ fontFamily: 'Orbitron', color: '#00bcd4' }}>
                    🚀 Mission Details & Background
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {selectedSatellite?.name && selectedSatellite?.category 
                      ? getSatelliteDescription(selectedSatellite.name, selectedSatellite.category)
                      : 'Detailed mission information is being loaded from our database...'
                    }
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Notification System */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity="info"
          sx={{ 
            bgcolor: 'rgba(0, 188, 212, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 30px rgba(0, 188, 212, 0.5); }
          50% { text-shadow: 0 0 50px rgba(0, 188, 212, 0.8), 0 0 70px rgba(63, 81, 181, 0.6); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .enhanced-map {
          filter: contrast(1.1) brightness(1.05);
        }
        .enhanced-popup .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 1px solid rgba(0, 188, 212, 0.5) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px) !important;
        }
        .enhanced-popup .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.95) !important;
        }
      `}</style>
    </Box>
  );
}

// Enhanced satellite descriptions with more detail
function getSatelliteDescription(name, category) {
  const descriptions = {
    'ISS (ZARYA)': 'The International Space Station serves as humanity\'s permanent outpost in low Earth orbit, conducting cutting-edge microgravity research and serving as a stepping stone for future deep space missions. Operating at approximately 408 km altitude, it completes an orbit every 90 minutes.',
    'HUBBLE SPACE TELESCOPE': 'NASA\'s crown jewel of space observatories has revolutionized our understanding of the universe since 1990. From its perch 547 km above Earth, Hubble captures breathtaking images of distant galaxies, nebulae, and cosmic phenomena with unprecedented clarity.',
    'ENVISAT': 'The European Space Agency\'s environmental monitoring satellite was one of the largest Earth observation platforms ever built. Though no longer operational, it provided crucial climate and environmental data for over a decade.',
    'KEPLER': 'NASA\'s planet-hunting space telescope discovered thousands of exoplanets during its mission, fundamentally changing our understanding of planetary systems and the prevalence of Earth-like worlds in our galaxy.',
    'SPITZER SPACE TELESCOPE': 'This infrared observatory pierced through cosmic dust to reveal hidden star formation regions and cool brown dwarfs. Its sensitive instruments detected heat signatures from distant astronomical objects.',
    'GAIA': 'ESA\'s precision astrometry mission is creating the most accurate 3D map of our galaxy ever assembled, measuring positions and motions of over a billion stars with unprecedented accuracy.',
    'JWST': 'The James Webb Space Telescope represents the pinnacle of space-based astronomy, using its massive golden mirror and advanced instruments to observe the most distant objects in the universe.'
  };
  
  return descriptions[name] || `${name} is a ${category.toLowerCase()} satellite providing valuable services and data to support scientific research and human activities. This sophisticated orbital platform operates as part of our global space infrastructure network.`;
}

export default SatelliteTracker;