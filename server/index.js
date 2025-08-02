const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const User = require('./models/User'); 
const path = require('path');
const cosmicObjectController = require('./controllers/cosmicObjectController');

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running... 🪐🌙✨');
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
          <img src="${obj.image.url}" alt="${obj.name}" style="max-width: 100%; height: auto;" />
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

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT} 🚀🪐🌙`);
});