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

// ...existing code...

// Enhanced Cosmic Events API with multiple real data sources
app.get('/api/cosmic-events', async (req, res) => {
  const { year, month } = req.query;
  try {
    console.log(`📡 Fetching cosmic events for ${year}-${month}`);
    
    // Try multiple APIs in parallel for comprehensive data
    const [inTheSkyEvents, nasaEvents, eclipseEvents] = await Promise.allSettled([
      fetchInTheSkyEvents(year, month),
      fetchNASAEvents(year, month),
      fetchEclipseEvents(year)
    ]);

    // Combine all successful API responses
    let allEvents = [];
    
    if (inTheSkyEvents.status === 'fulfilled') {
      allEvents = [...allEvents, ...inTheSkyEvents.value];
    }
    
    if (nasaEvents.status === 'fulfilled') {
      allEvents = [...allEvents, ...nasaEvents.value];
    }
    
    if (eclipseEvents.status === 'fulfilled') {
      allEvents = [...allEvents, ...eclipseEvents.value];
    }

    console.log(`✅ Combined ${allEvents.length} events from multiple APIs`);
    res.json({ events: allEvents, sources: ['in-the-sky', 'nasa', 'eclipse'] });
    
  } catch (err) {
    console.error('❌ Cosmic events API error:', err);
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
});

// NASA Events API (DONKI - Space Weather Database)
async function fetchNASAEvents(year, month) {
  try {
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12 ? `${year}-12-31` : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    
    // Multiple NASA APIs for different event types
    const [cmeEvents, solarFlares, geomagneticStorms] = await Promise.allSettled([
      axios.get(`https://api.nasa.gov/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`),
      axios.get(`https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`),
      axios.get(`https://api.nasa.gov/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`)
    ]);

    let events = [];

    // Process CME events
    if (cmeEvents.status === 'fulfilled' && cmeEvents.value.data) {
      events = [...events, ...cmeEvents.value.data.map(event => ({
        id: `nasa-cme-${event.activityID}`,
        title: 'Coronal Mass Ejection (CME)',
        date: new Date(event.startTime).toLocaleDateString(),
        description: `A coronal mass ejection with speed of ${event.cmeAnalyses?.[0]?.speed || 'unknown'} km/s detected by ${event.instruments?.[0]?.displayName || 'solar observatory'}.`,
        type: 'Solar Activity',
        image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: event.link || 'https://ccmc.gsfc.nasa.gov/donki/',
        source: 'NASA DONKI',
        major: true,
        year: parseInt(year),
        month: parseInt(month)
      }))];
    }

    // Process Solar Flares
    if (solarFlares.status === 'fulfilled' && solarFlares.value.data) {
      events = [...events, ...solarFlares.value.data.map(event => ({
        id: `nasa-flr-${event.flrID}`,
        title: `${event.classType} Class Solar Flare`,
        date: new Date(event.beginTime).toLocaleDateString(),
        description: `A ${event.classType} class solar flare peaked at ${new Date(event.peakTime).toLocaleTimeString()} UTC. Solar flares can affect radio communications and satellite operations.`,
        type: 'Solar Flare',
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: event.link || 'https://ccmc.gsfc.nasa.gov/donki/',
        source: 'NASA DONKI',
        major: event.classType.includes('X'), // X-class flares are major
        year: parseInt(year),
        month: parseInt(month)
      }))];
    }

    // Process Geomagnetic Storms
    if (geomagneticStorms.status === 'fulfilled' && geomagneticStorms.value.data) {
      events = [...events, ...geomagneticStorms.value.data.map(event => ({
        id: `nasa-gst-${event.gstID}`,
        title: 'Geomagnetic Storm',
        date: new Date(event.startTime).toLocaleDateString(),
        description: `Geomagnetic storm with Kp index reaching ${event.allKpIndex?.[0]?.kpIndex || 'high levels'}. May cause aurora displays and affect GPS systems.`,
        type: 'Space Weather',
        image: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: event.link || 'https://ccmc.gsfc.nasa.gov/donki/',
        source: 'NASA DONKI',
        major: false,
        year: parseInt(year),
        month: parseInt(month)
      }))];
    }

    return events;
  } catch (error) {
    console.error('NASA DONKI API error:', error.message);
    return [];
  }
}

// In-The-Sky.org Events API
async function fetchInTheSkyEvents(year, month) {
  try {
    const url = `https://in-the-sky.org/newscal.php?year=${year}&month=${month}&max=100&output=json`;
    const response = await axios.get(url);
    
    if (response.data && response.data.events) {
      return response.data.events.map(event => ({
        id: `sky-${event.id || Math.random()}`,
        title: event.title || 'Astronomical Event',
        date: event.date || `${year}-${month}`,
        description: event.description || event.desc || 'Astronomical event visible from Earth.',
        type: event.type || 'General',
        image: getEventImageByType(event.type, event.title),
        url: event.url || 'https://in-the-sky.org/',
        source: 'In-The-Sky.org',
        major: event.major || false,
        year: parseInt(year),
        month: parseInt(month)
      }));
    }
    return [];
  } catch (error) {
    console.error('In-The-Sky API error:', error.message);
    return [];
  }
}

// Eclipse Predictions API
async function fetchEclipseEvents(year) {
  try {
    // Use NASA Eclipse API for accurate eclipse data
    const [solarEclipses, lunarEclipses] = await Promise.allSettled([
      axios.get(`https://eclipse.gsfc.nasa.gov/JSEX/JSEX-AS.html`, { timeout: 5000 }),
      axios.get(`https://eclipse.gsfc.nasa.gov/JLEX/JLEX-AS.html`, { timeout: 5000 })
    ]);

    let events = [];

    // Since direct NASA eclipse API is complex, use known eclipse data for 2024-2026
    const knownEclipses = getKnownEclipses(year);
    events = [...events, ...knownEclipses];

    return events;
  } catch (error) {
    console.error('Eclipse API error:', error.message);
    return getKnownEclipses(year);
  }
}

// Known eclipse data from NASA Eclipse Predictions
function getKnownEclipses(year) {
  const eclipses = {
    2024: [
      {
        id: 'eclipse-2024-04-08',
        title: 'Total Solar Eclipse',
        date: 'April 8, 2024',
        description: 'Total solar eclipse visible from North America, crossing Mexico, United States, and Canada.',
        type: 'Solar Eclipse',
        image: 'https://images.unsplash.com/photo-1566207474742-de921626ad0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: 'https://eclipse.gsfc.nasa.gov/SEsearch/SEsearchmap.php?Ecl=20240408',
        source: 'NASA Eclipse Predictions',
        major: true,
        year: 2024,
        month: 4
      }
    ],
    2025: [
      {
        id: 'eclipse-2025-03-29',
        title: 'Total Solar Eclipse',
        date: 'March 29, 2025',
        description: 'Total solar eclipse visible from the Atlantic, Europe, Asia, Africa, North America, South America, Pacific, Arctic, and Antarctica.',
        type: 'Solar Eclipse',
        image: 'https://images.unsplash.com/photo-1566207474742-de921626ad0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: 'https://eclipse.gsfc.nasa.gov/SEsearch/SEsearchmap.php?Ecl=20250329',
        source: 'NASA Eclipse Predictions',
        major: true,
        year: 2025,
        month: 3
      },
      {
        id: 'eclipse-2025-09-07',
        title: 'Total Lunar Eclipse',
        date: 'September 7, 2025',
        description: 'Total lunar eclipse visible from Europe, Asia, Australia, Africa, West in North America, East in South America, Pacific, Atlantic, Indian Ocean, Arctic, Antarctica.',
        type: 'Lunar Eclipse',
        image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: 'https://eclipse.gsfc.nasa.gov/LEsearch/LEsearchmap.php?Ecl=20250907',
        source: 'NASA Eclipse Predictions',
        major: true,
        year: 2025,
        month: 9
      }
    ],
    2026: [
      {
        id: 'eclipse-2026-08-12',
        title: 'Total Solar Eclipse',
        date: 'August 12, 2026',
        description: 'Total solar eclipse visible from Arctic, Greenland, Iceland, Spain, Russia, and Portugal.',
        type: 'Solar Eclipse',
        image: 'https://images.unsplash.com/photo-1566207474742-de921626ad0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: 'https://eclipse.gsfc.nasa.gov/SEsearch/SEsearchmap.php?Ecl=20260812',
        source: 'NASA Eclipse Predictions',
        major: true,
        year: 2026,
        month: 8
      }
    ]
  };

  return eclipses[year] || [];
}

// Image selection based on event type
function getEventImageByType(type, title) {
  const typeStr = (type || '').toLowerCase();
  const titleStr = (title || '').toLowerCase();
  
  const images = {
    eclipse: 'https://images.unsplash.com/photo-1566207474742-de921626ad0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    meteor: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    planet: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    moon: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    conjunction: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    comet: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    solar: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    aurora: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    default: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  };

  if (titleStr.includes('eclipse') || typeStr.includes('eclipse')) return images.eclipse;
  if (titleStr.includes('meteor') || titleStr.includes('shower') || typeStr.includes('meteor')) return images.meteor;
  if (titleStr.includes('planet') || titleStr.includes('mars') || titleStr.includes('venus') || titleStr.includes('jupiter')) return images.planet;
  if (titleStr.includes('moon') || titleStr.includes('lunar') || typeStr.includes('moon')) return images.moon;
  if (titleStr.includes('conjunction') || titleStr.includes('opposition') || typeStr.includes('conjunction')) return images.conjunction;
  if (titleStr.includes('comet') || typeStr.includes('comet')) return images.comet;
  if (titleStr.includes('solar') || titleStr.includes('flare') || titleStr.includes('cme')) return images.solar;
  if (titleStr.includes('aurora') || titleStr.includes('storm') || titleStr.includes('magnetic')) return images.aurora;
  
  return images.default;
}

// NASA Image API for dynamic images
app.get('/api/nasa-image/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const response = await axios.get(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=5`
    );
    
    const items = response.data.collection.items;
    if (items.length > 0) {
      const images = items.map(item => ({
        url: item.links?.[0]?.href,
        title: item.data[0]?.title,
        description: item.data[0]?.description,
        date: item.data[0]?.date_created
      }));
      res.json({ images });
    } else {
      res.json({ images: [] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NASA images' });
  }
});

// ...existing code..
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