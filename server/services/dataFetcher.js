const axios = require('axios');
const CosmicObject = require('../models/CosmicObject');

class ComprehensiveDataFetcher {
  constructor() {
    this.processedCount = 0;
    this.errors = [];
  }

  // Main orchestrator method
  async fetchAllData() {
    console.log('Starting comprehensive data fetch...');
    
    try {
      // 1. Solar System objects (planets, moons, asteroids, comets)
      await this.fetchSolarSystemData();
      
      // 2. Popular exoplanets (limit to save space)
      await this.fetchExoplanets(300); // Limit to 300 most interesting
      
      // 3. Famous astronomical objects from Wikipedia
      await this.fetchWikipediaObjects();
      
      // 4. Add NASA images to existing objects
      await this.enrichWithNASAImages();
      
      console.log(`Data fetch complete! Processed ${this.processedCount} objects`);
      if (this.errors.length > 0) {
        console.log(`Errors encountered: ${this.errors.length}`);
      }
      
    } catch (error) {
      console.error('Fatal error in data fetch:', error);
      throw error;
    }
  }

  // Fetch from NASA Solar System API
  async fetchSolarSystemData() {
    try {
      console.log('Fetching Solar System data...');
      const response = await axios.get('https://api.le-systeme-solaire.net/rest/bodies/');
      const bodies = response.data.bodies;
      
      for (const body of bodies) {
        try {
          await this.processSolarSystemBody(body);
          this.processedCount++;
        } catch (error) {
          this.errors.push(`Solar System ${body.englishName}: ${error.message}`);
        }
      }
      
      console.log(`Processed ${bodies.length} solar system objects`);
    } catch (error) {
      console.error('Error fetching solar system data:', error);
      throw error;
    }
  }

  // Process individual solar system body
  async processSolarSystemBody(body) {
    const type = this.determineSolarSystemType(body);
    const slug = this.createSlug(body.englishName);
    
    const objectData = {
      name: body.englishName,
      type: type,
      slug: slug,
      description: this.generateSolarSystemDescription(body),
      data: this.extractSolarSystemData(body),
      keywords: this.generateKeywords(body.englishName, type, body),
      links: {
        nasa: `https://solarsystem.nasa.gov/planets/${body.englishName.toLowerCase()}/`,
        wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(body.englishName)}`
      },
      sources: ['nasa_solar_system'],
      lastUpdated: new Date()
    };

    await CosmicObject.findOneAndUpdate(
      { slug: slug },
      objectData,
      { upsert: true, new: true }
    );
  }

  // Fetch popular exoplanets
  async fetchExoplanets(limit = 300) {
    try {
      console.log(`Fetching ${limit} exoplanets...`);
      
      const query = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_masse,pl_orbper,pl_eqt,sy_dist+from+ps+where+default_flag=1+order+by+disc_year+desc&format=json&limit=${limit}`;
      
      const response = await axios.get(query);
      const exoplanets = response.data;
      
      for (const planet of exoplanets) {
        try {
          await this.processExoplanet(planet);
          this.processedCount++;
        } catch (error) {
          this.errors.push(`Exoplanet ${planet.pl_name}: ${error.message}`);
        }
      }
      
      console.log(`Processed ${exoplanets.length} exoplanets`);
    } catch (error) {
      console.error('Error fetching exoplanets:', error);
      throw error;
    }
  }

  // Process individual exoplanet
  async processExoplanet(planet) {
    const slug = this.createSlug(planet.pl_name);
    
    const objectData = {
      name: planet.pl_name,
      type: 'exoplanet',
      slug: slug,
      description: this.generateExoplanetDescription(planet),
      data: {
        hostStar: planet.hostname,
        discoveryMethod: planet.discoverymethod,
        discoveryYear: planet.disc_year,
        radius: planet.pl_rade,
        mass: planet.pl_masse,
        orbitalPeriod: planet.pl_orbper,
        temperature: planet.pl_eqt,
        distance: planet.sy_dist
      },
      keywords: this.generateKeywords(planet.pl_name, 'exoplanet', planet),
      links: {
        nasa: `https://exoplanets.nasa.gov/exoplanet-catalog/`,
        wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(planet.pl_name)}`
      },
      sources: ['nasa_exoplanet'],
      lastUpdated: new Date()
    };

    await CosmicObject.findOneAndUpdate(
      { slug: slug },
      objectData,
      { upsert: true, new: true }
    );
  }

  // Fetch famous objects from Wikipedia
  async fetchWikipediaObjects() {
    console.log('Fetching Wikipedia objects...');
    
    const famousObjects = [
      // Galaxies
      'Milky Way', 'Andromeda Galaxy', 'Triangulum Galaxy', 'Large Magellanic Cloud', 
      'Small Magellanic Cloud', 'Whirlpool Galaxy', 'Sombrero Galaxy', 'Pinwheel Galaxy',
      
      // Nebulae
      'Orion Nebula', 'Eagle Nebula', 'Crab Nebula', 'Horsehead Nebula', 'Ring Nebula',
      'Cat\'s Eye Nebula', 'Helix Nebula', 'Rosette Nebula', 'Veil Nebula',
      
      // Stars
      'Betelgeuse', 'Rigel', 'Sirius', 'Vega', 'Polaris', 'Antares', 'Aldebaran',
      'Proxima Centauri', 'Alpha Centauri', 'Canopus', 'Arcturus',
      
      // Star Clusters
      'Pleiades', 'Hyades', 'Omega Centauri', 'Globular Cluster M13', 'Double Cluster',
      
      // Black Holes & Special Objects
      'Sagittarius A*', 'Cygnus X-1', 'Messier 87*', 'TON 618',
      
      // Spacecraft & Missions
      'Hubble Space Telescope', 'James Webb Space Telescope', 'Voyager 1', 'Voyager 2'
    ];

    for (const objectName of famousObjects) {
      try {
        await this.processWikipediaObject(objectName);
        this.processedCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.errors.push(`Wikipedia ${objectName}: ${error.message}`);
      }
    }
  }

  // Process Wikipedia object
  async processWikipediaObject(objectName) {
    try {
      // Get Wikipedia summary
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(objectName)}`;
      const response = await axios.get(summaryUrl);
      const data = response.data;
      
      if (data.type === 'disambiguation') return; // Skip disambiguation pages
      
      const type = this.determineObjectType(data.extract);
      const slug = this.createSlug(objectName);
      
      const objectData = {
        name: objectName,
        type: type,
        slug: slug,
        description: data.extract?.substring(0, 500) || `${objectName} is a ${type} object.`,
        image: data.thumbnail ? { url: data.thumbnail.source, alt: objectName } : null,
        data: this.extractWikipediaData(data.extract, type),
        keywords: this.generateKeywords(objectName, type, data),
        links: {
          wikipedia: data.content_urls?.desktop?.page,
          source: summaryUrl
        },
        sources: ['wikipedia'],
        lastUpdated: new Date()
      };

      await CosmicObject.findOneAndUpdate(
        { slug: slug },
        objectData,
        { upsert: true, new: true }
      );
      
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  }

  // Enrich existing objects with NASA images
  async enrichWithNASAImages() {
    console.log('Enriching objects with NASA images...');
    
    const objectsWithoutImages = await CosmicObject.find({ 
      'image.url': { $exists: false } 
    }).limit(50); // Limit to prevent API overuse
    
    for (const obj of objectsWithoutImages) {
      try {
        const image = await this.fetchNASAImage(obj.name);
        if (image) {
          await CosmicObject.findByIdAndUpdate(obj._id, { 
            image: image,
            $addToSet: { sources: 'nasa_images' }
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        this.errors.push(`NASA Image ${obj.name}: ${error.message}`);
      }
    }
  }

  // Fetch NASA image for object
  async fetchNASAImage(objectName) {
    try {
      const response = await axios.get(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(objectName)}&media_type=image`
      );
      
      const items = response.data.collection.items;
      if (items.length > 0) {
        return {
          url: items[0].links?.[0]?.href,
          alt: items[0].data[0]?.title || objectName
        };
      }
    } catch (error) {
      // Silently fail for images
    }
    return null;
  }

  // Helper methods
  determineSolarSystemType(body) {
    if (body.isPlanet) return 'planet';
    if (body.aroundPlanet) return 'moon';
    if (body.bodyType === 'Asteroid') return 'asteroid';
    if (body.bodyType === 'Comet') return 'comet';
    return 'other';
  }

  determineObjectType(description) {
    const text = (description || '').toLowerCase();
    
    if (text.includes('galaxy')) return 'galaxy';
    if (text.includes('nebula')) return 'nebula';
    if (text.includes('star cluster') || text.includes('cluster')) return 'cluster';
    if (text.includes('black hole')) return 'black_hole';
    if (text.includes('spacecraft') || text.includes('telescope') || text.includes('satellite')) return 'spacecraft';
    if (text.includes('exoplanet')) return 'exoplanet';
    if (text.includes('star') && !text.includes('cluster')) return 'star';
    if (text.includes('planet')) return 'planet';
    
    return 'other';
  }

  createSlug(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  generateKeywords(name, type, data) {
    const keywords = [name.toLowerCase(), type];
    
    // Add specific keywords based on data
    if (data.hostname) keywords.push(data.hostname.toLowerCase());
    if (data.discoverymethod) keywords.push(data.discoverymethod.toLowerCase());
    if (data.aroundPlanet) keywords.push(data.aroundPlanet.planet.toLowerCase());
    
    return [...new Set(keywords)];
  }

  generateSolarSystemDescription(body) {
    const type = this.determineSolarSystemType(body);
    let desc = `${body.englishName} is a ${type}`;
    
    if (body.aroundPlanet) {
      desc += ` orbiting ${body.aroundPlanet.planet}`;
    } else if (body.isPlanet) {
      desc += ` in our solar system`;
    }
    
    if (body.discoveredBy) {
      desc += `, discovered by ${body.discoveredBy}`;
    }
    
    return desc + '.';
  }

  generateExoplanetDescription(planet) {
    return `${planet.pl_name} is an exoplanet${planet.hostname ? ` orbiting ${planet.hostname}` : ''}${planet.disc_year ? `, discovered in ${planet.disc_year}` : ''}${planet.discoverymethod ? ` using ${planet.discoverymethod}` : ''}.`;
  }

  extractSolarSystemData(body) {
    return {
      mass: body.mass?.massValue,
      radius: body.meanRadius,
      distance: body.semimajorAxis,
      gravity: body.gravity,
      temperature: body.avgTemp,
      moons: body.moons?.length || 0,
      discoveredBy: body.discoveredBy,
      discoveryDate: body.discoveryDate
    };
  }

  extractWikipediaData(description, type) {
    // Extract basic data based on type and description
    const data = {};
    
    if (type === 'star') {
      // Extract constellation, magnitude, etc. from description if available
      const constellationMatch = description?.match(/constellation (\w+)/i);
      if (constellationMatch) data.constellation = constellationMatch[1];
    }
    
    return data;
  }
}

module.exports = new ComprehensiveDataFetcher();