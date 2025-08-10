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

// Satellite data storage
let satelliteCache = new Map();
let connectedClients = new Set();

// Important satellites to track
const IMPORTANT_SATELLITES = [
  { noradId: 25544, name: 'ISS (ZARYA)', category: 'Space Stations', priority: 1 },
  { noradId: 43013, name: 'HUBBLE SPACE TELESCOPE', category: 'Scientific', priority: 1 },
  { noradId: 36411, name: 'ENVISAT', category: 'Earth Observation', priority: 2 },
  { noradId: 28654, name: 'GPS BIIR-2 (PRN 13)', category: 'Navigation', priority: 2 },
  { noradId: 39166, name: 'KEPLER', category: 'Scientific', priority: 1 },
  { noradId: 37348, name: 'SPITZER SPACE TELESCOPE', category: 'Scientific', priority: 1 },
  { noradId: 20580, name: 'HST', category: 'Scientific', priority: 1 },
  { noradId: 43435, name: 'GAIA', category: 'Scientific', priority: 1 },
  { noradId: 41765, name: 'JWST', category: 'Scientific', priority: 1 },
  { noradId: 40379, name: 'DRAGON CRS-1', category: 'Cargo', priority: 3 }
];

// N2YO API functions
const N2YO_API_KEY = 'KMHENH-54J4UC-QQK9J7-5JOW';
const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

async function fetchSatellitePosition(noradId) {
  try {
    // Default observer coordinates (can be made dynamic)
    const lat = 40.7589; // New York
    const lng = -73.9851;
    const alt = 0;
    const seconds = 2; // Just 2 positions (current + 1 prediction)

    // CORRECTED URL FORMAT - This was the main issue!
    const url = `${N2YO_BASE_URL}/positions/${noradId}/${lat}/${lng}/${alt}/${seconds}/?apiKey=${N2YO_API_KEY}`;
    console.log('Fetching from:', url); // Debug log
    
    const response = await axios.get(url);
    console.log('API Response for satellite', noradId, ':', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error(`Error fetching satellite ${noradId}:`, error.message);
    console.error('Full error:', error.response?.data); // More detailed error
    
    // Return mock data if API fails
    return {
      info: { satname: `Mock Satellite ${noradId}`, satid: noradId },
      positions: [{
        satlatitude: (Math.random() - 0.5) * 180,
        satlongitude: (Math.random() - 0.5) * 360,
        sataltitude: 400 + Math.random() * 200,
        azimuth: Math.random() * 360,
        elevation: Math.random() * 90,
        timestamp: Math.floor(Date.now() / 1000)
      }]
    };
  }
}

async function fetchSatelliteInfo(noradId) {
  try {
    // CORRECTED URL FORMAT
    const url = `${N2YO_BASE_URL}/tle/${noradId}/?apiKey=${N2YO_API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching satellite info ${noradId}:`, error.message);
    return null;
  }
}

// Update satellite positions every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  if (connectedClients.size === 0) return; // Don't fetch if no clients

  console.log('Updating satellite positions...');
  
  for (const satellite of IMPORTANT_SATELLITES) {
    try {
      const position = await fetchSatellitePosition(satellite.noradId);
      if (position && position.positions && position.positions.length > 0) {
        const data = {
          ...satellite,
          ...position.info,
          position: position.positions[0],
          lastUpdated: new Date().toISOString()
        };
        
        satelliteCache.set(satellite.noradId, data);
        
        // Emit to all connected clients
        io.emit('satelliteUpdate', data);
        console.log(`Updated satellite ${satellite.name}:`, data.position);
      }
    } catch (error) {
      console.error(`Failed to update satellite ${satellite.noradId}:`, error);
    }
    
    // Add delay between API calls to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.add(socket.id);
  
  // Send current satellite data to new client
  const currentData = Array.from(satelliteCache.values());
  socket.emit('initialSatelliteData', currentData);
  console.log(`Sent ${currentData.length} satellites to new client`);
  
  // Handle satellite search
  socket.on('searchSatellites', async (searchTerm) => {
    try {
      // Search through important satellites first
      const results = IMPORTANT_SATELLITES.filter(sat => 
        sat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Fetch real-time data for search results
      const resultsWithData = [];
      for (const satellite of results.slice(0, 5)) { // Limit to 5 results
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
      
      socket.emit('searchResults', resultsWithData);
    } catch (error) {
      socket.emit('searchError', error.message);
    }
  });
  
  // Handle specific satellite request
  socket.on('getSatelliteDetails', async (noradId) => {
    try {
      const position = await fetchSatellitePosition(noradId);
      const info = await fetchSatelliteInfo(noradId);
      
      const satelliteDetails = {
        position: position,
        info: info,
        lastUpdated: new Date().toISOString()
      };
      
      socket.emit('satelliteDetails', satelliteDetails);
    } catch (error) {
      socket.emit('satelliteError', error.message);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
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

// Satellite API routes
app.get('/api/satellites', async (req, res) => {
  try {
    const satellites = Array.from(satelliteCache.values());
    res.json(satellites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/satellites/:id', async (req, res) => {
  try {
    const noradId = parseInt(req.params.id);
    const position = await fetchSatellitePosition(noradId);
    const info = await fetchSatelliteInfo(noradId);
    
    res.json({
      position: position,
      info: info,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSR Routes for SEO
app.get('/universe-explorer', async (req, res) => {
  try {
    const searchResults = await cosmicObjectController.searchObjects({
      query: { ...req.query, format: 'ssr', limit: 12 }
    });
    
    const html = generateUniverseExplorerHTML(searchResults, req.query);
    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  }
});

app.get('/universe-explorer/:slug', async (req, res) => {
  try {
    const object = await cosmicObjectController.getObjectBySlug({
      params: req.params,
      query: { format: 'ssr' }
    });
    
    if (!object) {
      return res.status(404).sendFile(path.join(__dirname, '../client/build/index.html'));
    }
    
    const html = generateObjectDetailHTML(object);
    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  }
});

// Generate SEO-friendly HTML for Universe Explorer
function generateUniverseExplorerHTML(data, query) {
  const title = query.q ? `Search results for "${query.q}" | Universe Explorer` : 'Universe Explorer | Astrosphere';
  const description = 'Explore the universe with our comprehensive database of cosmic objects including planets, stars, galaxies, exoplanets, and more.';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://astrosphere.com/universe-explorer${query.q ? `?q=${encodeURIComponent(query.q)}` : ''}" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Astrosphere Universe Explorer",
    "description": "${description}",
    "url": "https://astrosphere.com/universe-explorer"
  }
  </script>
  
  <script>
    window.__INITIAL_DATA__ = ${JSON.stringify(data)};
  </script>
</head>
<body>
  <div id="root">
    <div style="padding: 20px; text-align: center;">
      <h1>Universe Explorer</h1>
      <p>Loading amazing cosmic objects...</p>
      ${data.objects ? data.objects.map(obj => `
        <div style="margin: 10px; padding: 10px; border: 1px solid #ccc;">
          <h3>${obj.name}</h3>
          <p>${obj.description}</p>
        </div>
      `).join('') : ''}
    </div>
  </div>
  <script src="/static/js/bundle.js"></script>
</body>
</html>`;
}

// Generate SEO-friendly HTML for object details
function generateObjectDetailHTML(object) {
  const title = `${object.name} | Universe Explorer`;
  const description = object.description || `Learn about ${object.name}, a ${object.type} in our universe.`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  ${object.image ? `<meta property="og:image" content="${object.image.url}" />` : ''}
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://astrosphere.com/universe-explorer/${object.slug}" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${object.name}",
    "description": "${description}",
    "image": "${object.image?.url || ''}",
    "author": {
      "@type": "Organization",
      "name": "Astrosphere"
    }
  }
  </script>
  
  <script>
    window.__INITIAL_DATA__ = ${JSON.stringify(object)};
  </script>
</head>
<body>
  <div id="root">
    <div style="padding: 20px;">
      <h1>${object.name}</h1>
      ${object.image ? `<img src="${object.image.url}" alt="${object.name}" style="max-width: 100%; height: auto;" />` : ''}
      <p><strong>Type:</strong> ${object.type}</p>
      <p>${description}</p>
      ${object.links?.wikipedia ? `<a href="${object.links.wikipedia}" target="_blank">Learn more on Wikipedia</a>` : ''}
    </div>
  </div>
  <script src="/static/js/bundle.js"></script>
</body>
</html>`;
}

// Initial satellite data fetch when server starts
const initializeSatelliteData = async () => {
  console.log('Performing initial satellite data fetch...');
  for (const satellite of IMPORTANT_SATELLITES) {
    try {
      const position = await fetchSatellitePosition(satellite.noradId);
      if (position && position.positions && position.positions.length > 0) {
        const data = {
          ...satellite,
          ...position.info,
          position: position.positions[0],
          lastUpdated: new Date().toISOString()
        };
        satelliteCache.set(satellite.noradId, data);
        console.log(`Initial data loaded for ${satellite.name}`);
      }
    } catch (error) {
      console.error(`Failed initial fetch for ${satellite.noradId}:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  console.log(`Initial satellite cache loaded with ${satelliteCache.size} satellites`);
};

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT} 🚀🪐🌙🛰️`);
    
    // Initialize satellite data after server starts
    setTimeout(initializeSatelliteData, 2000);
});