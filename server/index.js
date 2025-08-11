const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const User = require('./models/User'); 
const path = require('path');
const cosmicObjectController = require('./controllers/cosmicObjectController');
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cron = require('node-cron');

dotenv.config();

// Connect to the database
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Enhanced satellite data storage with orbital prediction
let satelliteCache = new Map();
let connectedClients = new Set();
let apiCallCount = { daily: 0, hourly: 0, lastReset: Date.now() };
const API_LIMITS = { 
  daily: 1000,    // N2YO free tier limit
  hourly: 100     // Conservative hourly limit
};

// Important satellites to track
const IMPORTANT_SATELLITES = [
  { noradId: 25544, name: 'ISS (ZARYA)', category: 'Space Stations', priority: 1, updateFreq: 60 },
  { noradId: 43013, name: 'HUBBLE SPACE TELESCOPE', category: 'Scientific', priority: 1, updateFreq: 300 },
  { noradId: 36411, name: 'ENVISAT', category: 'Earth Observation', priority: 2, updateFreq: 600 },
  { noradId: 28654, name: 'GPS BIIR-2 (PRN 13)', category: 'Navigation', priority: 2, updateFreq: 900 },
  { noradId: 39166, name: 'KEPLER', category: 'Scientific', priority: 1, updateFreq: 1800 },
  { noradId: 37348, name: 'SPITZER SPACE TELESCOPE', category: 'Scientific', priority: 1, updateFreq: 1800 },
  { noradId: 20580, name: 'HST', category: 'Scientific', priority: 1, updateFreq: 300 },
  { noradId: 43435, name: 'GAIA', category: 'Scientific', priority: 1, updateFreq: 900 },
  { noradId: 41765, name: 'JWST', category: 'Scientific', priority: 1, updateFreq: 1800 },
  { noradId: 40379, name: 'DRAGON CRS-1', category: 'Cargo', priority: 3, updateFreq: 1800 }
];

// N2YO API functions with enhanced rate limiting
const N2YO_API_KEY = 'KMHENH-54J4UC-QQK9J7-5JOW';
const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

// API Rate Limiting and Monitoring
function checkApiLimits() {
  const now = Date.now();
  const hourPassed = (now - apiCallCount.lastReset) > 3600000; // 1 hour
  const dayPassed = (now - apiCallCount.lastReset) > 86400000; // 24 hours
  
  if (dayPassed) {
    apiCallCount = { daily: 0, hourly: 0, lastReset: now };
    console.log('🔄 API limits reset - Daily and Hourly counters cleared');
  } else if (hourPassed) {
    apiCallCount.hourly = 0;
    console.log('🔄 Hourly API limit reset');
  }
  
  const canMakeCall = apiCallCount.daily < API_LIMITS.daily && apiCallCount.hourly < API_LIMITS.hourly;
  
  if (!canMakeCall) {
    console.warn('⚠️  API LIMIT REACHED! Daily:', apiCallCount.daily, '/', API_LIMITS.daily, 
                'Hourly:', apiCallCount.hourly, '/', API_LIMITS.hourly);
  }
  
  return canMakeCall;
}

function incrementApiCall() {
  apiCallCount.daily++;
  apiCallCount.hourly++;
  console.log(`📡 API Call made. Daily: ${apiCallCount.daily}/${API_LIMITS.daily}, Hourly: ${apiCallCount.hourly}/${API_LIMITS.hourly}`);
}

// Orbital Mechanics Calculator for Position Prediction
class OrbitalCalculator {
  // Earth's constants
  static EARTH_RADIUS = 6371; // km
  static MU = 398600.4418; // km³/s² (Earth's standard gravitational parameter)
  
  // Calculate orbital period
  static getOrbitalPeriod(altitude) {
    const r = this.EARTH_RADIUS + altitude;
    return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / this.MU);
  }
  
  // Calculate orbital velocity
  static getOrbitalVelocity(altitude) {
    const r = this.EARTH_RADIUS + altitude;
    return Math.sqrt(this.MU / r);
  }
  
  // Predict satellite position based on last known position and time elapsed
  static predictPosition(lastPosition, timeElapsedSeconds) {
    const { satlatitude, satlongitude, sataltitude } = lastPosition;
    
    // Get orbital parameters
    const period = this.getOrbitalPeriod(sataltitude);
    const velocity = this.getOrbitalVelocity(sataltitude);
    
    // Calculate angular velocity (degrees per second)
    const angularVelocity = 360 / period;
    
    // Predict new longitude (satellites generally move west to east)
    const deltaLongitude = angularVelocity * timeElapsedSeconds;
    let newLongitude = satlongitude + deltaLongitude;
    
    // Handle longitude wrap-around
    if (newLongitude > 180) newLongitude -= 360;
    if (newLongitude < -180) newLongitude += 360;
    
    // For simplicity, assume latitude oscillates in a sine wave pattern
    // This is a simplified model - real satellites have more complex orbital mechanics
    const latitudeVariation = Math.sin((timeElapsedSeconds / period) * 2 * Math.PI) * 5;
    const newLatitude = Math.max(-90, Math.min(90, satlatitude + latitudeVariation));
    
    // Altitude variation (simplified)
    const altitudeVariation = Math.cos((timeElapsedSeconds / period) * 4 * Math.PI) * 20;
    const newAltitude = Math.max(200, sataltitude + altitudeVariation);
    
    return {
      satlatitude: newLatitude,
      satlongitude: newLongitude,
      sataltitude: newAltitude,
      azimuth: (lastPosition.azimuth || 0) + (angularVelocity * timeElapsedSeconds),
      elevation: Math.max(0, Math.min(90, lastPosition.elevation || 45)),
      timestamp: Math.floor(Date.now() / 1000),
      isPredicted: true
    };
  }
}

// Enhanced position fetching with smart caching
async function fetchSatellitePosition(noradId, forceUpdate = false) {
  try {
    // Check if we have recent data and don't need to make API call
    const cached = satelliteCache.get(noradId);
    const now = Date.now();
    
    if (!forceUpdate && cached && cached.position && cached.lastApiCall) {
      const timeSinceLastCall = now - cached.lastApiCall;
      const satellite = IMPORTANT_SATELLITES.find(s => s.noradId === noradId);
      const maxAge = (satellite?.updateFreq || 300) * 1000; // Convert to milliseconds
      
      if (timeSinceLastCall < maxAge) {
        // Use predicted position instead of API call
        const timeElapsed = (now - cached.lastApiCall) / 1000; // seconds
        const predictedPosition = OrbitalCalculator.predictPosition(cached.apiPosition, timeElapsed);
        
        console.log(`🔮 Using predicted position for ${cached.name} (${timeElapsed.toFixed(0)}s since last API call)`);
        return {
          info: cached.info,
          positions: [predictedPosition]
        };
      }
    }
    
    // Check API limits before making real call
    if (!checkApiLimits()) {
      // Use prediction if we hit limits
      if (cached && cached.apiPosition) {
        const timeElapsed = (now - cached.lastApiCall) / 1000;
        const predictedPosition = OrbitalCalculator.predictPosition(cached.apiPosition, timeElapsed);
        console.log(`⚠️  API limit reached, using prediction for ${noradId}`);
        return {
          info: cached.info,
          positions: [predictedPosition]
        };
      }
      
      // Return mock data as last resort
      return generateMockSatelliteData(noradId);
    }
    
    // Make actual API call
    const lat = 40.7589; // New York
    const lng = -73.9851;
    const alt = 0;
    const seconds = 10; // Get more positions for better prediction
    
    const url = `${N2YO_BASE_URL}/positions/${noradId}/${lat}/${lng}/${alt}/${seconds}/?apiKey=${N2YO_API_KEY}`;
    console.log('📡 Making API call for:', noradId);
    
    const response = await axios.get(url);
    incrementApiCall();
    
    // Store the real API data for future predictions
    if (response.data && response.data.positions && response.data.positions.length > 0) {
      const existingData = satelliteCache.get(noradId) || {};
      satelliteCache.set(noradId, {
        ...existingData,
        apiPosition: response.data.positions[0], // Store original API position
        lastApiCall: now,
        info: response.data.info
      });
    }
    
    console.log('✅ Fresh API data received for:', response.data.info?.satname);
    return response.data;
    
  } catch (error) {
    console.error(`❌ Error fetching satellite ${noradId}:`, error.message);
    
    // Try to use prediction if we have previous data
    const cached = satelliteCache.get(noradId);
    if (cached && cached.apiPosition) {
      const timeElapsed = (Date.now() - cached.lastApiCall) / 1000;
      const predictedPosition = OrbitalCalculator.predictPosition(cached.apiPosition, timeElapsed);
      console.log(`🔮 API error, using prediction for ${noradId}`);
      return {
        info: cached.info,
        positions: [predictedPosition]
      };
    }
    
    // Generate mock data as fallback
    return generateMockSatelliteData(noradId);
  }
}

// Generate realistic mock data when API is unavailable
function generateMockSatelliteData(noradId) {
  const satellite = IMPORTANT_SATELLITES.find(s => s.noradId === noradId);
  const name = satellite ? satellite.name : `Satellite ${noradId}`;
  
  // Generate realistic orbital parameters
  const altitude = 400 + Math.random() * 300; // 400-700km typical LEO
  const inclination = Math.random() * 180; // 0-180 degrees
  
  return {
    info: { satname: name, satid: noradId },
    positions: [{
      satlatitude: (Math.random() - 0.5) * 2 * Math.min(90, inclination),
      satlongitude: (Math.random() - 0.5) * 360,
      sataltitude: altitude,
      azimuth: Math.random() * 360,
      elevation: Math.random() * 90,
      timestamp: Math.floor(Date.now() / 1000),
      isMockData: true
    }]
  };
}

async function fetchSatelliteInfo(noradId) {
  try {
    if (!checkApiLimits()) {
      console.log('⚠️  Skipping TLE fetch due to API limits');
      return null;
    }
    
    const url = `${N2YO_BASE_URL}/tle/${noradId}/?apiKey=${N2YO_API_KEY}`;
    const response = await axios.get(url);
    incrementApiCall();
    return response.data;
  } catch (error) {
    console.error(`Error fetching satellite info ${noradId}:`, error.message);
    return null;
  }
}

// Track currently selected satellite from clients
let selectedSatellites = new Set();

// Only update selected satellite - every 10 seconds
cron.schedule('*/10 * * * * *', async () => {
  if (connectedClients.size === 0 || selectedSatellites.size === 0) return;
  
  console.log('🔄 Updating selected satellites only...');
  console.log(`📊 Current API usage - Daily: ${apiCallCount.daily}/${API_LIMITS.daily}, Hourly: ${apiCallCount.hourly}/${API_LIMITS.hourly}`);
  
  // Update only selected satellites
  for (const noradId of selectedSatellites) {
    try {
      const satellite = IMPORTANT_SATELLITES.find(s => s.noradId === noradId);
      if (!satellite) continue;
      
      const position = await fetchSatellitePosition(noradId, true);
      if (position && position.positions && position.positions.length > 0) {
        const data = {
          ...satellite,
          ...position.info,
          position: position.positions[0],
          lastUpdated: new Date().toISOString(),
          dataSource: position.positions[0].isPredicted ? 'predicted' : 
                     position.positions[0].isMockData ? 'mock' : 'api'
        };
        
        satelliteCache.set(noradId, data);
        io.emit('satelliteUpdate', data);
        console.log(`✅ Updated selected satellite: ${satellite.name} (${data.dataSource})`);
      }
    } catch (error) {
      console.error(`Failed to update selected satellite ${noradId}:`, error);
    }
    
    // Small delay between updates
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`🔄 Selected satellite update completed`);
});

// Continuous prediction updates for selected satellites - every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
  if (connectedClients.size === 0 || selectedSatellites.size === 0) return;
  
  console.log(`🔮 Running prediction updates for ${selectedSatellites.size} selected satellites`);
  
  // Update selected satellites with predicted positions (no API calls)
  for (const noradId of selectedSatellites) {
    try {
      const cached = satelliteCache.get(noradId);
      if (cached && cached.apiPosition && cached.lastApiCall) {
        const timeElapsed = (Date.now() - cached.lastApiCall) / 1000;
        const predictedPosition = OrbitalCalculator.predictPosition(cached.apiPosition, timeElapsed);
        
        const satellite = IMPORTANT_SATELLITES.find(s => s.noradId === noradId);
        const data = {
          ...satellite,
          ...cached.info,
          position: predictedPosition,
          lastUpdated: new Date().toISOString(),
          dataSource: 'predicted'
        };
        
        satelliteCache.set(noradId, data);
        io.emit('satelliteUpdate', data);
        console.log(`🔮 Emitted prediction update for ${satellite.name} - Pos: ${predictedPosition.satlatitude.toFixed(4)}, ${predictedPosition.satlongitude.toFixed(4)}`);
      } else {
        console.log(`⚠️  No API position data for satellite ${noradId} - cannot predict`);
      }
    } catch (error) {
      console.error(`Failed to predict position for satellite ${noradId}:`, error);
    }
  }
});

// Socket.IO connection handling with enhanced search
io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);
  connectedClients.add(socket.id);
  
  // Send current satellite data to new client
  const currentData = Array.from(satelliteCache.values());
  socket.emit('initialSatelliteData', currentData);
  console.log(`📤 Sent ${currentData.length} satellites to new client`);
  
  // Enhanced search with local caching
  socket.on('searchSatellites', async (searchTerm) => {
    try {
      // Search through cached data first
      const cachedResults = IMPORTANT_SATELLITES.filter(sat => 
        sat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Get data from cache or generate predictions
      const resultsWithData = [];
      for (const satellite of cachedResults.slice(0, 5)) {
        const cached = satelliteCache.get(satellite.noradId);
        if (cached) {
          resultsWithData.push(cached);
        } else {
          // Only fetch if absolutely necessary and within limits
          if (checkApiLimits()) {
            try {
              const position = await fetchSatellitePosition(satellite.noradId);
              if (position && position.positions && position.positions.length > 0) {
                resultsWithData.push({
                  ...satellite,
                  ...position.info,
                  position: position.positions[0]
                });
              }
            } catch (error) {
              console.error(`Search error for ${satellite.noradId}:`, error);
            }
          }
        }
      }
      
      socket.emit('searchResults', resultsWithData);
    } catch (error) {
      socket.emit('searchError', error.message);
    }
  });
  
  // Handle specific satellite request
  socket.on('getSatelliteDetails', async (noradId) => {
    try {
      const cached = satelliteCache.get(noradId);
      if (cached) {
        socket.emit('satelliteDetails', {
          position: { positions: [cached.position] },
          info: cached.info || { satname: cached.name, satid: noradId },
          lastUpdated: cached.lastUpdated,
          dataSource: cached.dataSource
        });
      } else {
        const position = await fetchSatellitePosition(noradId);
        const info = await fetchSatelliteInfo(noradId);
        
        const satelliteDetails = {
          position: position,
          info: info,
          lastUpdated: new Date().toISOString(),
          dataSource: position.positions[0].isPredicted ? 'predicted' : 
                     position.positions[0].isMockData ? 'mock' : 'api'
        };
        
        socket.emit('satelliteDetails', satelliteDetails);
      }
    } catch (error) {
      socket.emit('satelliteError', error.message);
    }
  });
  
  // Send API status to client
  socket.on('getApiStatus', () => {
    socket.emit('apiStatus', {
      dailyUsage: apiCallCount.daily,
      dailyLimit: API_LIMITS.daily,
      hourlyUsage: apiCallCount.hourly,
      hourlyLimit: API_LIMITS.hourly,
      canMakeCalls: checkApiLimits()
    });
  });
  
  // Track satellite selection for focused updates
  socket.on('selectSatellite', (noradId) => {
    selectedSatellites.add(noradId);
    console.log(`📍 Client selected satellite: ${noradId}`);
    
    // Immediately fetch latest data for selected satellite
    setTimeout(async () => {
      try {
        const satellite = IMPORTANT_SATELLITES.find(s => s.noradId === noradId);
        if (satellite) {
          // Always try to get fresh API data when selecting
          const position = await fetchSatellitePosition(noradId, true);
          if (position && position.positions && position.positions.length > 0) {
            const data = {
              ...satellite,
              ...position.info,
              position: position.positions[0],
              lastUpdated: new Date().toISOString(),
              dataSource: position.positions[0].isPredicted ? 'predicted' : 
                         position.positions[0].isMockData ? 'mock' : 'api'
            };
            
            // Store the API position for future predictions
            if (!position.positions[0].isPredicted && !position.positions[0].isMockData) {
              data.apiPosition = position.positions[0];
              data.lastApiCall = Date.now();
            }
            
            satelliteCache.set(noradId, data);
            io.emit('satelliteUpdate', data);
            console.log(`✅ Selected satellite ${satellite.name} loaded with ${data.dataSource} data`);
          }
        }
      } catch (error) {
        console.error(`Error fetching selected satellite ${noradId}:`, error);
      }
    }, 500);
  });

  socket.on('unselectSatellite', (noradId) => {
    selectedSatellites.delete(noradId);
    console.log(`📍 Client unselected satellite: ${noradId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔗 Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

// Basic route
app.get('/', (req, res) => {
    res.send('API is running... 🪐🌙✨🛰️');
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// NASA APOD routes
app.use('/api/nasa', require('./routes/apodRoutes'));

// Cosmic Objects API routes
app.get('/api/cosmic-objects/search', cosmicObjectController.searchObjects);
app.get('/api/cosmic-objects/types', cosmicObjectController.getTypes);
app.get('/api/cosmic-objects/featured', cosmicObjectController.getFeaturedObjects);
app.get('/api/cosmic-objects/:slug', cosmicObjectController.getObjectBySlug);

// Enhanced Satellite API routes
app.get('/api/satellites', async (req, res) => {
  try {
    const satellites = Array.from(satelliteCache.values());
    res.json({
      satellites,
      apiStatus: {
        dailyUsage: apiCallCount.daily,
        dailyLimit: API_LIMITS.daily,
        hourlyUsage: apiCallCount.hourly,
        hourlyLimit: API_LIMITS.hourly
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/satellites/:id', async (req, res) => {
  try {
    const noradId = parseInt(req.params.id);
    const cached = satelliteCache.get(noradId);
    
    if (cached) {
      res.json({
        position: { positions: [cached.position] },
        info: cached.info || { satname: cached.name, satid: noradId },
        lastUpdated: cached.lastUpdated,
        dataSource: cached.dataSource
      });
    } else {
      const position = await fetchSatellitePosition(noradId);
      const info = await fetchSatelliteInfo(noradId);
      
      res.json({
        position: position,
        info: info,
        lastUpdated: new Date().toISOString(),
        dataSource: position.positions[0].isPredicted ? 'predicted' : 
                   position.positions[0].isMockData ? 'mock' : 'api'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Status endpoint
app.get('/api/satellite-status', (req, res) => {
  res.json({
    apiLimits: API_LIMITS,
    currentUsage: apiCallCount,
    canMakeCalls: checkApiLimits(),
    satelliteCount: satelliteCache.size,
    connectedClients: connectedClients.size,
    cacheStatus: Array.from(satelliteCache.entries()).map(([id, data]) => ({
      noradId: id,
      name: data.name,
      lastApiCall: data.lastApiCall,
      dataSource: data.dataSource,
      timeSinceUpdate: Date.now() - (data.lastApiCall || 0)
    }))
  });
});

// Enhanced initialization with staggered API calls
const initializeSatelliteData = async () => {
  console.log('🚀 Loading initial satellite positions (static)...');
  
  // Load only basic satellite info without real-time positions
  for (const satellite of IMPORTANT_SATELLITES) {
    try {
      // Use mock data for initial display - real data will load when selected
      const mockPosition = generateMockSatelliteData(satellite.noradId);
      const data = {
        ...satellite,
        ...mockPosition.info,
        position: mockPosition.positions[0],
        lastUpdated: new Date().toISOString(),
        dataSource: 'mock'
      };
      satelliteCache.set(satellite.noradId, data);
      console.log(`✅ Static position loaded for ${satellite.name}`);
    } catch (error) {
      console.error(`Failed initial load for ${satellite.noradId}:`, error);
    }
  }
  
  console.log(`🎉 Initial satellite cache loaded with ${satelliteCache.size} satellites (static positions)`);
  console.log(`📊 No API calls used during initialization`);
};

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port http://localhost:${PORT} 🚀🪐🌙🛰️`);
    console.log(`📊 API Limits - Daily: ${API_LIMITS.daily}, Hourly: ${API_LIMITS.hourly}`);
    
    // Initialize satellite data after server starts
    setTimeout(initializeSatelliteData, 3000);
});