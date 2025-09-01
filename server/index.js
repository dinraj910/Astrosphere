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
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.CLIENT_URL, 'https://astrosphere.onrender.com'] 
        : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.CLIENT_URL, 'https://astrosphere.onrender.com'] 
        : 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'API is running',
    version: '1.0.0',
    endpoints: ['/api/satellites', '/api/cosmic-events', '/api/apod', '/api/chat'],
    apiCallCount: apiCallCount
  });
});

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
app.use('/api/apod', require('./routes/apodRoutes'));

// Add NASA Gallery route
app.get('/api/nasa-gallery', async (req, res) => {
  try {
    const { q = 'space', page = 1, page_size = 24, media_type = 'image' } = req.query;
    
    console.log(`🖼️ NASA Gallery API: query="${q}", page=${page}`);
    
    const response = await axios.get('https://images-api.nasa.gov/search', {
      params: { q, page, page_size, media_type },
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('NASA Gallery error:', error.message);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

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
    // Focus only on significant space events that affect Earth visibility
    // Skip technical space weather events that general public doesn't care about
    console.log(`⏭️ Skipping NASA DONKI space weather events for general astronomy calendar`);
    return []; // Return empty array to focus on popular astronomical events
  } catch (error) {
    console.error('NASA Events skipped:', error.message);
    return [];
  }
}

// In-The-Sky.org Events API - Enhanced for Popular Astronomical Events
async function fetchInTheSkyEvents(year, month) {
  try {
    // Define important event types that people care about
    const importantEventTypes = [
      'Full Moon', 'New Moon', 'Lunar Eclipse', 'Solar Eclipse',
      'Meteor Shower', 'Planetary Event', 'Conjunction', 'Occultation',
      'Comet', 'Asteroid', 'Opposition', 'Greatest Elongation',
      'Mercury Transit', 'Venus Transit', 'Jupiter', 'Saturn',
      'Mars', 'Venus', 'Mercury', 'Uranus', 'Neptune', 'Pluto'
    ];

    // Fetch events from In-The-Sky.org
    const url = `https://in-the-sky.org/newscal.php?year=${year}&month=${month}&max=100&output=json`;
    const response = await axios.get(url);
    
    let events = [];

    if (response.data && response.data.events) {
      // Filter and process events to focus on popular astronomical events
      events = response.data.events
        .filter(event => {
          const title = (event.title || '').toLowerCase();
          const type = (event.type || '').toLowerCase();
          
          // Check if event matches important types
          return importantEventTypes.some(importantType => 
            title.includes(importantType.toLowerCase()) || 
            type.includes(importantType.toLowerCase())
          ) ||
          // Also include events with keywords that indicate public interest
          title.includes('moon') || title.includes('eclipse') || 
          title.includes('meteor') || title.includes('shower') ||
          title.includes('conjunction') || title.includes('opposition') ||
          title.includes('planet') || title.includes('comet') ||
          title.includes('visible') || title.includes('brightest');
        })
        .map(event => ({
          id: `sky-${event.id || Math.random()}`,
          title: event.title || 'Astronomical Event',
          date: event.date || `${year}-${String(month).padStart(2, '0')}-01`,
          description: event.description || event.desc || getDefaultDescription(event.title),
          type: categorizeEventType(event.title, event.type),
          image: getEventImageByType(event.type, event.title),
          url: event.url || 'https://in-the-sky.org/',
          source: 'In-The-Sky.org',
          major: isMajorEvent(event.title, event.type),
          year: parseInt(year),
          month: parseInt(month),
          visibility: event.visibility || 'Visible from most locations'
        }));
    }

    // If no events from API, try alternative approach with TimeandDate.com-style events
    if (events.length === 0) {
      events = await fetchAlternativeAstronomicalEvents(year, month);
    }

    return events;
  } catch (error) {
    console.error('In-The-Sky API error:', error.message);
    // Return popular astronomical events as fallback
    return await fetchAlternativeAstronomicalEvents(year, month);
  }
}

//const GROQ_API_URL = 'https://your-groq-api-endpoint.com/v1/data/query/your-dataset';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Replace the existing /api/chat endpoint (around line 680-700) with this corrected version

// Chatbot API endpoint using GROQ API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Check if GROQ API key is available
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'AI service not configured',
        choices: [{
          message: {
            role: 'assistant',
            content: 'Sorry, the AI service is not configured. Please contact the administrator.'
          }
        }]
      });
    }

    const systemPrompt = {
      role: 'system',
      content: 'You are AstroBot, an AI assistant for the Astrosphere website specialized in astronomy. Only answer questions related to astronomy, space exploration, astrophysics, cosmology, planetary science, telescopes, celestial events, and related scientific fields. If the query is off-topic, politely say: "Sorry, I can only discuss astronomy-related topics." Keep all responses concise, under 200 words, and focused—no lengthy explanations unless requested.'
    };

    console.log('🤖 Sending request to GROQ API...');

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [systemPrompt, ...messages], // Fixed: 'messages' not 'message'
      temperature: 0.7,
      max_tokens: 300,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ GROQ API response received');
    res.json(response.data);

  } catch (error) {
    console.error('Chatbot API error:', error.response?.data || error.message);
    
    // Provide helpful error responses based on error type
    let errorMessage = 'Sorry, I encountered an error. Please try again!';
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Sorry, I\'m having trouble connecting to the AI service. Please check your internet connection and try again.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Sorry, there\'s an authentication issue with the AI service. Please contact support.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Sorry, I\'m currently experiencing high demand. Please wait a moment and try again.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Sorry, there was an issue with your request. Please try rephrasing your question.';
    }

    res.status(500).json({ 
      error: 'AI service error',
      choices: [{
        message: {
          role: 'assistant',
          content: errorMessage
        }
      }]
    });
  }
});

// Helper: Categorize event types for better display
function categorizeEventType(title, originalType) {
  const titleLower = (title || '').toLowerCase();
  
  if (titleLower.includes('full moon')) return 'Full Moon';
  if (titleLower.includes('new moon')) return 'New Moon';
  if (titleLower.includes('lunar eclipse')) return 'Lunar Eclipse';
  if (titleLower.includes('solar eclipse')) return 'Solar Eclipse';
  if (titleLower.includes('meteor') || titleLower.includes('shower')) return 'Meteor Shower';
  if (titleLower.includes('conjunction')) return 'Conjunction';
  if (titleLower.includes('opposition')) return 'Opposition';
  if (titleLower.includes('comet')) return 'Comet';
  if (titleLower.includes('planet') || titleLower.includes('jupiter') || 
      titleLower.includes('saturn') || titleLower.includes('mars') || 
      titleLower.includes('venus') || titleLower.includes('mercury')) return 'Planetary Event';
  
  return originalType || 'Astronomy Event';
}

// Helper: Determine if event is major/important
function isMajorEvent(title, type) {
  const titleLower = (title || '').toLowerCase();
  
  return titleLower.includes('eclipse') ||
         titleLower.includes('meteor shower') ||
         titleLower.includes('full moon') ||
         titleLower.includes('conjunction') ||
         titleLower.includes('opposition') ||
         titleLower.includes('comet') ||
         titleLower.includes('brightest') ||
         titleLower.includes('closest');
}

// Helper: Get default descriptions for events
function getDefaultDescription(title) {
  const titleLower = (title || '').toLowerCase();
  
  if (titleLower.includes('full moon')) {
    return 'The Moon will be fully illuminated and appears brightest in the night sky. Perfect time for lunar observation and photography.';
  }
  if (titleLower.includes('new moon')) {
    return 'The Moon will be invisible tonight, making it an ideal time for deep-sky observation and stargazing.';
  }
  if (titleLower.includes('meteor shower')) {
    return 'A meteor shower will be visible tonight. Look for shooting stars radiating from a specific constellation. Best viewing after midnight.';
  }
  if (titleLower.includes('conjunction')) {
    return 'Two or more celestial objects will appear close together in the sky. A great opportunity for observation and photography.';
  }
  if (titleLower.includes('opposition')) {
    return 'A planet will be at its closest approach to Earth and fully illuminated by the Sun. Perfect time for telescopic observation.';
  }
  
  return 'An interesting astronomical event visible from Earth. Check local viewing conditions for best observation times.';
}

// Alternative astronomical events source (popular events that people expect)
async function fetchAlternativeAstronomicalEvents(year, month) {
  try {
    // Calculate popular astronomical events for the given month
    const events = [];
    
    // Moon phases (always popular)
    const moonPhases = calculateMoonPhases(year, month);
    events.push(...moonPhases);
    
    // Meteor showers (by month)
    const meteorShowers = getMeteorShowersByMonth(year, month);
    events.push(...meteorShowers);
    
    // Planetary events (simplified)
    const planetaryEvents = getPlanetaryEventsByMonth(year, month);
    events.push(...planetaryEvents);
    
    console.log(`📅 Generated ${events.length} popular astronomical events for ${year}-${month}`);
    return events;
    
  } catch (error) {
    console.error('Alternative events error:', error.message);
    return [];
  }
}

// Calculate moon phases for a given month
function calculateMoonPhases(year, month) {
  const phases = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Simplified moon phase calculation (approximate 29.5-day cycle)
  const lunarCycle = 29.53;
  const knownNewMoon = new Date('2024-01-11'); // Known new moon date
  
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const daysSinceKnownNew = (currentDate - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceKnownNew % lunarCycle) / lunarCycle;
    
    // Check for major phases (within 1 day tolerance)
    if (Math.abs(phase) < 0.03 || Math.abs(phase - 1) < 0.03) {
      phases.push({
        id: `moon-new-${year}-${month}-${day}`,
        title: 'New Moon',
        date: currentDate.toLocaleDateString(),
        description: 'The Moon will be invisible tonight, making it an ideal time for deep-sky observation and stargazing.',
        type: 'New Moon',
        image: 'https://images.unsplash.com/photo-1518066000-611a194d1ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: '#',
        source: 'Astronomical Calculation',
        major: true,
        year: parseInt(year),
        month: parseInt(month)
      });
    } else if (Math.abs(phase - 0.5) < 0.03) {
      phases.push({
        id: `moon-full-${year}-${month}-${day}`,
        title: 'Full Moon',
        date: currentDate.toLocaleDateString(),
        description: 'The Moon will be fully illuminated and appears brightest in the night sky. Perfect time for lunar observation and photography.',
        type: 'Full Moon',
        image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        url: '#',
        source: 'Astronomical Calculation',
        major: true,
        year: parseInt(year),
        month: parseInt(month)
      });
    }
  }
  
  return phases;
}

// Get meteor showers by month
function getMeteorShowersByMonth(year, month) {
  const meteorShowers = {
    1: ['Quadrantids (Peak Jan 3-4)'],
    4: ['Lyrids (Peak Apr 21-22)'],
    5: ['Eta Aquariids (Peak May 5-6)'],
    7: ['Delta Aquariids (Peak Jul 28-29)'],
    8: ['Perseids (Peak Aug 11-12)'],
    10: ['Orionids (Peak Oct 21-22)'],
    11: ['Leonids (Peak Nov 17-18)'],
    12: ['Geminids (Peak Dec 13-14)']
  };

  const showers = meteorShowers[month] || [];
  
  return showers.map((shower, index) => ({
    id: `meteor-${year}-${month}-${index}`,
    title: shower,
    date: `${getMonthName(month)} ${year}`,
    description: 'A meteor shower will be visible tonight. Look for shooting stars radiating from the constellation. Best viewing after midnight in dark skies.',
    type: 'Meteor Shower',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    url: '#',
    source: 'Meteor Shower Calendar',
    major: true,
    year: parseInt(year),
    month: parseInt(month)
  }));
}

// Get planetary events by month (simplified)
function getPlanetaryEventsByMonth(year, month) {
  const events = [];
  
  // Add some generic planetary visibility events
  if (month >= 3 && month <= 9) {
    events.push({
      id: `planet-${year}-${month}-jupiter`,
      title: 'Jupiter Visible After Sunset',
      date: `${getMonthName(month)} ${year}`,
      description: 'Jupiter will be well-positioned for evening observation. Look for the brightest star-like object after sunset.',
      type: 'Planetary Event',
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      url: '#',
      source: 'Planetary Visibility',
      major: false,
      year: parseInt(year),
      month: parseInt(month)
    });
  }
  
  if (month >= 6 && month <= 12) {
    events.push({
      id: `planet-${year}-${month}-saturn`,
      title: 'Saturn Visible in Evening Sky',
      date: `${getMonthName(month)} ${year}`,
      description: 'Saturn will be visible in the evening sky. Through a telescope, you can see its beautiful rings.',
      type: 'Planetary Event',
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      url: '#',
      source: 'Planetary Visibility',
      major: false,
      year: parseInt(year),
      month: parseInt(month)
    });
  }
  
  return events;
}

// Helper: Get month name
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

// Eclipse Predictions API
async function fetchEclipseEvents(year) {
  try {
    // Use known eclipse data for accurate predictions
    const knownEclipses = getKnownEclipses(year);
    console.log(`📅 Retrieved ${knownEclipses.length} eclipse events for ${year}`);
    return knownEclipses;
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
        title: 'Partial Solar Eclipse',
        date: 'March 29, 2025',
        description: 'Partial solar eclipse visible from the Atlantic, Europe, Asia, Africa, North America, South America, Pacific, Arctic, and Antarctica.',
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

// NASA Image Gallery API - Enhanced with caching and fallback
app.get('/api/nasa-gallery', async (req, res) => {
  try {
    const { q = 'space', page = 1, page_size = 24, media_type = 'image' } = req.query;
    
    console.log(`🖼️ Fetching NASA gallery images: query="${q}", page=${page}`);
    
    // Try NASA Images API first
    const nasaResponse = await axios.get('https://images-api.nasa.gov/search', {
      params: {
        q: q,
        page: page,
        page_size: page_size,
        media_type: media_type
      },
      timeout: 10000
    });
    
    if (nasaResponse.data && nasaResponse.data.collection) {
      console.log(`✅ Retrieved ${nasaResponse.data.collection.items.length} images from NASA API`);
      res.json(nasaResponse.data);
      return;
    }
    
    throw new Error('No data from NASA API');
    
  } catch (error) {
    console.error('NASA Gallery API error:', error.message);
    
    // Fallback to curated image collection
    const fallbackImages = generateCuratedImageCollection(req.query.q, parseInt(req.query.page) || 1);
    
    res.json({
      collection: {
        version: "1.0",
        href: "fallback",
        items: fallbackImages,
        metadata: {
          total_hits: 1000
        }
      }
    });
  }
});

// Generate curated image collection with ultra high-quality space images
function generateCuratedImageCollection(query = 'space', page = 1) {
  const itemsPerPage = 24;
  const startIndex = (page - 1) * itemsPerPage;
  
  // Ultra high-quality space image URLs from various sources
  const imageCollections = {
    space: [
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06', // Moon
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78', // Galaxy
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3', // Nebula
      'https://images.unsplash.com/photo-1518066000-611a194d1ddc', // Stars
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45', // Space
      'https://images.unsplash.com/photo-1502781252888-9143ba7f074e', // Earth
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', // Cosmic
      'https://images.unsplash.com/photo-1614732414444-096e5f1122d5', // Mars
      'https://images.unsplash.com/photo-1566207474742-de921626ad0f', // Eclipse
      'https://images.unsplash.com/photo-1502781252888-9143ba7f074e', // Aurora
    ],
    planets: [
      'https://images.unsplash.com/photo-1614732414444-096e5f1122d5', // Mars
      'https://images.unsplash.com/photo-1502781252888-9143ba7f074e', // Earth
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45', // Jupiter
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06', // Moon
    ],
    missions: [
      'https://images.unsplash.com/photo-1518066000-611a194d1ddc', // Rockets
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78', // Satellites
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3', // Space Station
    ],
    astronomy: [
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78', // Deep Space
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3', // Telescope Views
      'https://images.unsplash.com/photo-1518066000-611a194d1ddc', // Star Fields
    ]
  };
  
  // Determine which collection to use based on query
  let baseImages = imageCollections.space;
  if (query.toLowerCase().includes('planet')) baseImages = imageCollections.planets;
  else if (query.toLowerCase().includes('mission')) baseImages = imageCollections.missions;
  else if (query.toLowerCase().includes('astronomy')) baseImages = imageCollections.astronomy;
  
  // Generate items for this page
  const items = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const index = (startIndex + i) % baseImages.length;
    const baseUrl = baseImages[index];
    const id = `curated-${page}-${i}`;
    
    items.push({
      href: `https://images-api.nasa.gov/asset/${id}`,
      data: [{
        nasa_id: id,
        title: generateImageTitle(query, i),
        description: generateImageDescription(query, i),
        date_created: generateRandomDate(),
        keywords: generateKeywords(query),
        photographer: 'NASA',
        center: getRandomCenter(),
        media_type: 'image'
      }],
      links: [{
        href: `${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=6000&q=100&sig=${id}`, // Ultra HD 6K resolution
        rel: 'preview',
        render: 'image'
      }]
    });
  }
  
  return items;
}

// Add a new endpoint for high-resolution image proxy
app.get('/api/nasa-gallery/download/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Image URL required' });
    }
    
    console.log(`📥 Proxying download request for image: ${imageId}`);
    
    // Fetch the image
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Set appropriate headers for download
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Content-Disposition': `attachment; filename="${imageId}.jpg"`,
      'Cache-Control': 'no-cache'
    });
    
    // Pipe the image data
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Image download proxy error:', error.message);
    res.status(500).json({ error: 'Failed to download image' });
  }
});

// Add this after the existing download endpoint (around line 1195)

// Simple image proxy endpoint for CORS issues
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Image URL required' });
    }
    
    console.log(`🖼️ Proxying image request for: ${url}`);
    
    // Fetch the image with proper headers
    const response = await axios({
      method: 'GET',
      url: decodeURIComponent(url),
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // 24 hours cache
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    // Pipe the image data directly
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
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

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT} 🚀🪐🌙🛰️`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 API Limits - Daily: ${API_LIMITS.daily}, Hourly: ${API_LIMITS.hourly}`);
    
    // Initialize satellite data after server starts
    setTimeout(initializeSatelliteData, 3000);
});