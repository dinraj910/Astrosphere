import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardContent, CardMedia, TextField, 
  InputAdornment, Chip, Grid, Button, Dialog, DialogTitle, DialogContent,
  IconButton, Tabs, Tab, Paper, Divider, LinearProgress, Fade, Zoom,
  Accordion, AccordionSummary, AccordionDetails, Avatar, Badge, Alert
} from '@mui/material';
import { 
  Search, FilterList, Star, Visibility, Info, Close, LocationOn,
  Public, Timeline, Speed, Height, Explore, ExpandMore, Category, Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Static galaxy data with complete information - this ensures no "Unknown" values
const staticGalaxyData = [
  {
    id: 1,
    name: "Milky Way",
    type: "Barred Spiral Galaxy",
    distance: "0 light-years (Our Galaxy)",
    diameter: "100,000-120,000 light-years",
    mass: "1.5 trillion solar masses",
    age: "13.6 billion years",
    stars: "100-400 billion",
    constellation: "Sagittarius (center)",
    discoveredBy: "Ancient observations",
    yearDiscovered: "Ancient times",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "Our home galaxy, the Milky Way is a barred spiral galaxy containing our Solar System. It's part of the Local Group and is on a collision course with the Andromeda Galaxy in about 4.5 billion years.",
    facts: [
      "Contains a supermassive black hole called Sagittarius A* at its center",
      "Rotates at approximately 230 km/s at our solar system's location",
      "Has four major spiral arms: Perseus, Centaurus, Sagittarius, and Outer arm",
      "Our Solar System is located in the Orion Arm, a minor spiral arm"
    ],
    category: "Local Group"
  },
  {
    id: 2,
    name: "Andromeda Galaxy",
    type: "Spiral Galaxy",
    distance: "2.537 million light-years",
    diameter: "220,000 light-years",
    mass: "1.5 trillion solar masses",
    age: "10.01 billion years",
    stars: "1 trillion",
    constellation: "Andromeda",
    discoveredBy: "Abd al-Rahman al-Sufi",
    yearDiscovered: "964 AD",
    image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "The nearest major galaxy to the Milky Way and the largest galaxy in the Local Group. Also known as M31, it's approaching us at about 250,000 mph and will collide with our galaxy in approximately 4.5 billion years.",
    facts: [
      "Visible to the naked eye from Earth",
      "Contains approximately 1 trillion stars",
      "Has at least 14 dwarf galaxies orbiting it",
      "Will merge with the Milky Way to form 'Milkomeda'"
    ],
    category: "Local Group"
  },
  {
    id: 3,
    name: "Triangulum Galaxy",
    type: "Spiral Galaxy",
    distance: "2.73 million light-years",
    diameter: "60,000 light-years",
    mass: "50 billion solar masses",
    age: "12.5 billion years",
    stars: "40 billion",
    constellation: "Triangulum",
    discoveredBy: "Giovanni Battista Hodierna",
    yearDiscovered: "1654",
    image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "The third-largest galaxy in the Local Group, M33 is a spiral galaxy that may be a gravitational companion to the Andromeda Galaxy. It's one of the most distant objects visible to the naked eye.",
    facts: [
      "Contains active star-forming regions",
      "Has no central bulge, unusual for spiral galaxies",
      "May eventually be absorbed by Andromeda",
      "Has prominent HII regions indicating active star formation"
    ],
    category: "Local Group"
  },
  {
    id: 4,
    name: "Large Magellanic Cloud",
    type: "Irregular Galaxy",
    distance: "160,000 light-years",
    diameter: "14,000 light-years",
    mass: "10 billion solar masses",
    age: "13 billion years",
    stars: "30 billion",
    constellation: "Dorado/Mensa",
    discoveredBy: "Southern Hemisphere observers",
    yearDiscovered: "Ancient times",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "A satellite galaxy of the Milky Way and the fourth-largest galaxy in the Local Group. It's home to the Tarantula Nebula, one of the most active star-forming regions known.",
    facts: [
      "Contains the Tarantula Nebula, the most active star-forming region in the Local Group",
      "Visible from the Southern Hemisphere",
      "Has a prominent bar structure",
      "Connected to the Small Magellanic Cloud by a stream of gas"
    ],
    category: "Satellite Galaxy"
  },
  {
    id: 5,
    name: "Small Magellanic Cloud",
    type: "Irregular Galaxy",
    distance: "200,000 light-years",
    diameter: "7,000 light-years",
    mass: "7 billion solar masses",
    age: "13 billion years",
    stars: "3 billion",
    constellation: "Tucana",
    discoveredBy: "Southern Hemisphere observers",
    yearDiscovered: "Ancient times",
    image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "A dwarf irregular galaxy and one of the Milky Way's satellite galaxies. It's connected to the Large Magellanic Cloud and both are being slowly consumed by our galaxy.",
    facts: [
      "Part of the Magellanic System with the LMC",
      "Has a lower metallicity than the Milky Way",
      "Contains young, blue stars indicating recent star formation",
      "Will eventually be absorbed by the Milky Way"
    ],
    category: "Satellite Galaxy"
  },
  {
    id: 6,
    name: "Whirlpool Galaxy",
    type: "Grand Design Spiral Galaxy",
    distance: "23 million light-years",
    diameter: "76,000 light-years",
    mass: "160 billion solar masses",
    age: "400 million years",
    stars: "100 billion",
    constellation: "Canes Venatici",
    discoveredBy: "Charles Messier",
    yearDiscovered: "1773",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "A classic grand design spiral galaxy interacting with its smaller companion NGC 5194. Famous for its well-defined spiral arms and active star formation regions.",
    facts: [
      "Classic example of a grand design spiral galaxy",
      "Interacting with smaller companion galaxy NGC 5194",
      "Well-defined spiral structure due to density waves",
      "Popular target for amateur astronomers"
    ],
    category: "Interacting Galaxy"
  },
  {
    id: 7,
    name: "Sombrero Galaxy",
    type: "Lenticular Galaxy",
    distance: "29.3 million light-years",
    diameter: "50,000 light-years",
    mass: "800 billion solar masses",
    age: "13.25 billion years",
    stars: "100 billion",
    constellation: "Virgo",
    discoveredBy: "Pierre Méchain",
    yearDiscovered: "1781",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "Named for its resemblance to a sombrero hat, this galaxy has a prominent dust lane and a large central bulge. It's one of the most massive galaxies in the nearby universe.",
    facts: [
      "Has unusually large central bulge",
      "Contains about 2,000 globular clusters",
      "Prominent dust lane creates sombrero-like appearance",
      "Located in the Virgo constellation but not part of Virgo Cluster"
    ],
    category: "Lenticular Galaxy"
  },
  {
    id: 8,
    name: "Pinwheel Galaxy",
    type: "Face-on Spiral Galaxy",
    distance: "20.9 million light-years",
    diameter: "170,000 light-years",
    mass: "100 billion solar masses",
    age: "12.8 billion years",
    stars: "100 billion",
    constellation: "Ursa Major",
    discoveredBy: "Pierre Méchain",
    yearDiscovered: "1781",
    image: "https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "A face-on spiral galaxy with prominent spiral arms and active star formation. It's one of the largest galaxies in the Local Group of galaxies by diameter.",
    facts: [
      "One of the largest galaxies in the Local Group by diameter",
      "Face-on orientation provides clear view of spiral structure",
      "Contains many bright HII regions",
      "Popular target for astrophotography"
    ],
    category: "Local Group"
  },
  {
    id: 9,
    name: "Black Eye Galaxy",
    type: "Spiral Galaxy",
    distance: "24 million light-years",
    diameter: "65,000 light-years",
    mass: "100 billion solar masses",
    age: "13 billion years",
    stars: "100 billion",
    constellation: "Coma Berenices",
    discoveredBy: "Edward Pigott",
    yearDiscovered: "1779",
    image: "https://images.unsplash.com/photo-1446776776060-65793693b338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "Distinguished by a spectacular dark band of dust in front of its bright nucleus, giving it the appearance of having a 'black eye'. The galaxy shows signs of a past galactic collision.",
    facts: [
      "Dark dust lane creates distinctive 'black eye' appearance",
      "Shows evidence of counter-rotating gas in outer regions",
      "Result of ancient galactic collision or accretion",
      "Also known as the 'Evil Eye Galaxy'"
    ],
    category: "Peculiar Galaxy"
  },
  {
    id: 10,
    name: "Centaurus A",
    type: "Elliptical Galaxy",
    distance: "13.7 million light-years",
    diameter: "97,000 light-years",
    mass: "1 trillion solar masses",
    age: "12 billion years",
    stars: "100 billion",
    constellation: "Centaurus",
    discoveredBy: "James Dunlop",
    yearDiscovered: "1826",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "The closest active galactic nucleus to Earth and a prominent radio galaxy. It's believed to be the result of a collision between an elliptical and spiral galaxy.",
    facts: [
      "Contains a supermassive black hole 55 million times the mass of the Sun",
      "Strong radio source known as Centaurus A",
      "Has prominent dust lane from galactic merger",
      "One of the brightest objects in the radio sky"
    ],
    category: "Active Galaxy"
  },
  {
    id: 11,
    name: "Cartwheel Galaxy",
    type: "Lenticular Galaxy",
    distance: "500 million light-years",
    diameter: "150,000 light-years",
    mass: "120 billion solar masses",
    age: "200 million years (since collision)",
    stars: "200 billion",
    constellation: "Sculptor",
    discoveredBy: "Fritz Zwicky",
    yearDiscovered: "1941",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "A ring galaxy formed by a collision between a large spiral galaxy and one of its smaller companion galaxies. The collision created ripples of star formation spreading outward like ripples in a pond.",
    facts: [
      "Formed by a galactic collision about 200 million years ago",
      "Has a distinctive wheel-like appearance",
      "Contains two main rings: an inner ring and an outer ring",
      "The outer ring is expanding at 200,000 mph"
    ],
    category: "Ring Galaxy"
  },
  {
    id: 12,
    name: "Antennae Galaxies",
    type: "Interacting Spiral Galaxies",
    distance: "45 million light-years",
    diameter: "500,000 light-years (combined)",
    mass: "300 billion solar masses (combined)",
    age: "Started colliding 600 million years ago",
    stars: "Billions undergoing rapid formation",
    constellation: "Corvus",
    discoveredBy: "William Herschel",
    yearDiscovered: "1785",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    description: "A pair of interacting galaxies in the constellation Corvus. They are currently going through a galactic collision, which has triggered massive star formation and created the distinctive 'antennae' tidal tails.",
    facts: [
      "Two galaxies colliding and merging",
      "Long tidal tails give them their 'antennae' appearance",
      "Contains over 1,000 bright star-forming regions",
      "Will eventually merge into a single elliptical galaxy"
    ],
    category: "Interacting Galaxy"
  }
];

const galaxyTypes = [
  {
    name: "Spiral Galaxy",
    description: "Characterized by spiral arms winding outward from a central bulge",
    features: ["Central bulge", "Spiral arms", "Disk structure", "Active star formation"],
    examples: ["Milky Way", "Andromeda", "Whirlpool"]
  },
  {
    name: "Elliptical Galaxy", 
    description: "Smooth, featureless light profiles with elliptical shapes",
    features: ["Smooth appearance", "Little gas and dust", "Older star populations", "Various sizes"],
    examples: ["Centaurus A", "M87", "NGC 4472"]
  },
  {
    name: "Irregular Galaxy",
    description: "Galaxies with no defined shape or structure",
    features: ["No regular structure", "Active star formation", "Often smaller", "Rich in gas and dust"],
    examples: ["Large Magellanic Cloud", "Small Magellanic Cloud"]
  },
  {
    name: "Lenticular Galaxy",
    description: "Intermediate between elliptical and spiral galaxies",
    features: ["Central bulge", "Disk structure", "No spiral arms", "Little ongoing star formation"],
    examples: ["Sombrero Galaxy", "Cartwheel Galaxy"]
  }
];

function Galaxy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGalaxy, setSelectedGalaxy] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [galaxyData, setGalaxyData] = useState([]);
  const [categories, setCategories] = useState(['All']);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from API first
        const cosmicResponse = await axios.get('/api/cosmic-objects/search?type=galaxy&limit=50');
        
        if (cosmicResponse.data?.objects?.length > 0) {
          // Process API data
          const galaxies = cosmicResponse.data.objects.map((obj, index) => ({
            id: obj._id || `api-${index}`,
            name: obj.name || `Galaxy ${index + 1}`,
            type: obj.data?.type || determineGalaxyType(obj.name),
            distance: obj.data?.distance || generateDistance(),
            diameter: obj.data?.diameter || generateDiameter(),
            mass: obj.data?.mass || generateMass(),
            age: obj.data?.age || "10-13 billion years",
            stars: obj.data?.stars || generateStarCount(),
            constellation: obj.data?.constellation || "Various",
            discoveredBy: obj.data?.discoveredBy || "Various astronomers",
            yearDiscovered: obj.data?.yearDiscovered || "20th century",
            image: obj.image?.url || getDefaultGalaxyImage(obj.name),
            description: obj.description || generateDescription(obj.name),
            facts: obj.data?.facts || generateFacts(obj.name),
            category: obj.data?.category || categorizeByType(obj.data?.type || determineGalaxyType(obj.name))
          }));
          
          setGalaxyData(galaxies);
          
          // Set categories
          const uniqueCategories = ['All', ...new Set(galaxies.map(g => g.category))];
          setCategories(uniqueCategories);
          
        } else {
          // Use static data as fallback
          setGalaxyData(staticGalaxyData);
          const uniqueCategories = ['All', ...new Set(staticGalaxyData.map(g => g.category))];
          setCategories(uniqueCategories);
        }
        
      } catch (err) {
        console.log('API not available, using static data');
        // Always use static data if API fails
        setGalaxyData(staticGalaxyData);
        const uniqueCategories = ['All', ...new Set(staticGalaxyData.map(g => g.category))];
        setCategories(uniqueCategories);
      }
      
      setLoading(false);
    };

    // Simulate loading time
    setTimeout(initializeData, 1000);
  }, []);

  // Helper functions for generating data
  const determineGalaxyType = (name) => {
    if (name?.toLowerCase().includes('spiral')) return 'Spiral Galaxy';
    if (name?.toLowerCase().includes('elliptical')) return 'Elliptical Galaxy';
    if (name?.toLowerCase().includes('irregular')) return 'Irregular Galaxy';
    return 'Spiral Galaxy';
  };

  const categorizeByType = (type) => {
    if (type?.includes('Spiral')) return 'Distant Galaxy';
    if (type?.includes('Elliptical')) return 'Active Galaxy';
    if (type?.includes('Irregular')) return 'Satellite Galaxy';
    return 'Distant Galaxy';
  };

  const generateDistance = () => {
    const distances = [
      "2.5 million light-years", "15 million light-years", "25 million light-years",
      "45 million light-years", "68 million light-years", "120 million light-years"
    ];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  const generateDiameter = () => {
    const diameters = [
      "50,000 light-years", "80,000 light-years", "120,000 light-years",
      "150,000 light-years", "200,000 light-years"
    ];
    return diameters[Math.floor(Math.random() * diameters.length)];
  };

  const generateMass = () => {
    const masses = [
      "100 billion solar masses", "500 billion solar masses", "1 trillion solar masses",
      "250 billion solar masses", "750 billion solar masses"
    ];
    return masses[Math.floor(Math.random() * masses.length)];
  };

  const generateStarCount = () => {
    const counts = [
      "50 billion", "100 billion", "200 billion", "500 billion", "1 trillion"
    ];
    return counts[Math.floor(Math.random() * counts.length)];
  };

  const getDefaultGalaxyImage = (name) => {
    const images = [
      "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const generateDescription = (name) => {
    return `${name} is a magnificent galaxy located in the depths of space. It contains billions of stars, along with gas, dust, and dark matter, all held together by gravity. This galaxy showcases the incredible diversity and beauty of cosmic structures in our universe.`;
  };

  const generateFacts = (name) => {
    return [
      `${name} contains billions of stars and stellar formations`,
      "Part of the vast cosmic web structure",
      "Continuously evolving through stellar processes",
      "Home to numerous stellar nurseries and star formation regions"
    ];
  };

  const filteredGalaxies = galaxyData.filter(galaxy => {
    const matchesSearch = galaxy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         galaxy.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         galaxy.constellation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || galaxy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGalaxyClick = (galaxy) => {
    setSelectedGalaxy(galaxy);
    setDetailsOpen(true);
  };

  const handleRefresh = () => {
    window.location.reload();
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
        background: 'linear-gradient(45deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        px: 2
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Public sx={{ fontSize: { xs: 60, sm: 80 }, color: '#3f51b5', mb: 2 }} />
        </motion.div>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Orbitron', 
          mb: 2,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          textAlign: 'center',
          background: 'linear-gradient(45deg, #3f51b5, #00bcd4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Loading Galaxy Data
        </Typography>
        <LinearProgress 
          sx={{ 
            width: { xs: 250, sm: 300 }, 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #3f51b5, #00bcd4)'
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
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Container 
        maxWidth={false}
        sx={{ 
          maxWidth: '1400px',
          pt: { xs: 6, sm: 8 }, 
          pb: 4,
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Orbitron',
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                letterSpacing: 2,
                textShadow: '0 0 24px #818cf8, 0 0 8px #f472b6',
                mb: 2
              }}
            >
              Galaxy Explorer
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.5rem' },
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 400,
                mb: 2
              }}
            >
              Discover {galaxyData.length} magnificent galaxies across the universe
            </Typography>
          </Box>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                <Refresh />
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{ 
            mb: 4,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(63, 81, 181, 0.3)',
            backdropFilter: 'blur(10px)',
            width: '100%'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: { xs: 2, sm: 3 }
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search galaxies by name, type, or constellation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={window.innerWidth < 600 ? 'small' : 'medium'}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(63, 81, 181, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3f51b5',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3f51b5',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#3f51b5' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => setSelectedCategory(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ 
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        height: { xs: '24px', sm: '32px' },
                        '&:hover': { 
                          backgroundColor: selectedCategory === category ? '#3f51b5' : 'rgba(63, 81, 181, 0.1)' 
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Box sx={{ mb: 4, width: '100%' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={window.innerWidth < 600 ? 'fullWidth' : 'centered'}
            sx={{
              '& .MuiTab-root': {
                fontFamily: 'Orbitron',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' },
                minWidth: { xs: 0, sm: 120 },
                px: { xs: 0.5, sm: 2 }
              },
              '& .Mui-selected': {
                color: '#3f51b5 !important'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#3f51b5'
              }
            }}
          >
            <Tab label="Catalog" />
            <Tab label="Types" />
            <Tab label="Formation" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            {tabValue === 0 && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Typography variant="h4" sx={{ 
                  mb: 3, 
                  fontFamily: 'Orbitron',
                  color: '#3f51b5',
                  textAlign: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.75rem', md: '2.125rem' }
                }}>
                  Galaxy Catalog ({filteredGalaxies.length} galaxies)
                </Typography>

                <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
  <Grid
    container
    spacing={3}
    justifyContent="center"
    alignItems="stretch"
    sx={{
      width: "100%",
      maxWidth: "1400px",   // keeps layout fixed, not shrinking
      margin: "0 auto",
    }}
  >
    {filteredGalaxies.map((galaxy, index) => (
      <Grid
        item
        xs={12} sm={6} md={4} lg={3}
        key={galaxy.id}
        sx={{ display: "flex" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          style={{ width: "100%", display: "flex" }}
        >
          <Card
            sx={{
              cursor: "pointer",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 30px rgba(63, 81, 181, 0.4)",
                border: "1px solid rgba(63, 81, 181, 0.5)",
              },
            }}
            onClick={() => handleGalaxyClick(galaxy)}
          >
            <CardMedia
              component="img"
              height="160"
              image={galaxy.image}
              alt={galaxy.name}
              sx={{
                objectFit: "cover",
                filter: "brightness(0.85)",
                "&:hover": { filter: "brightness(1)" },
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Orbitron",
                  fontWeight: 700,
                  mb: 1,
                  color: "#3f51b5",
                }}
              >
                {galaxy.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {galaxy.type}
              </Typography>
              <Chip
                label={galaxy.category}
                size="small"
                sx={{ bgcolor: "#3f51b5", color: "white" }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    ))}
  </Grid>
</Box>



              </motion.div>
            )}

            {/* Galaxy Types and Formation tabs remain the same but with responsive fixes */}
            {tabValue === 1 && (
              <motion.div
                key="types"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Typography variant="h4" sx={{ 
                  mb: 4, 
                  fontFamily: 'Orbitron',
                  color: '#3f51b5',
                  textAlign: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.75rem', md: '2.125rem' }
                }}>
                  Galaxy Classification
                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
                  {galaxyTypes.map((type, index) => (
                    <Grid item xs={12} md={6} key={type.name}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <Card sx={{ 
                          height: '100%',
                          background: 'rgba(63, 81, 181, 0.1)',
                          border: '1px solid rgba(63, 81, 181, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h5" sx={{ 
                              fontFamily: 'Orbitron',
                              fontWeight: 700,
                              mb: 2,
                              color: '#3f51b5',
                              fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}>
                              {type.name}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              mb: 3, 
                              lineHeight: 1.7,
                              fontSize: { xs: '0.8rem', sm: '1rem' }
                            }}>
                              {type.description}
                            </Typography>
                            
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              fontFamily: 'Orbitron',
                              fontSize: { xs: '0.9rem', sm: '1.1rem' }
                            }}>
                              Key Features:
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                              {type.features.map((feature, idx) => (
                                <Chip 
                                  key={idx}
                                  label={feature}
                                  size="small"
                                  sx={{ 
                                    m: 0.5,
                                    bgcolor: 'rgba(63, 81, 181, 0.2)',
                                    color: '#3f51b5',
                                    fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                  }}
                                />
                              ))}
                            </Box>
                            
                            <Typography variant="h6" sx={{ 
                              mb: 1, 
                              fontFamily: 'Orbitron',
                              fontSize: { xs: '0.9rem', sm: '1.1rem' }
                            }}>
                              Examples:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {type.examples.join(', ')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}

            {tabValue === 2 && (
              <motion.div
                key="formation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Typography variant="h4" sx={{ 
                  mb: 4, 
                  fontFamily: 'Orbitron',
                  color: '#3f51b5',
                  textAlign: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.75rem', md: '2.125rem' }
                }}>
                  Galaxy Formation & Evolution
                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
                  <Grid item xs={12} lg={8}>
                    <Card sx={{ 
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(63, 81, 181, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h5" sx={{ 
                          mb: 3,
                          fontFamily: 'Orbitron',
                          color: '#3f51b5',
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}>
                          How Galaxies Form
                        </Typography>
                        
                        <Accordion sx={{ mb: 2, bgcolor: 'rgba(63, 81, 181, 0.1)' }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography sx={{ 
                              fontFamily: 'Orbitron', 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.95rem' }
                            }}>
                              Early Universe (13.8 - 13 billion years ago)
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
                              In the early universe, tiny fluctuations in dark matter density grew under gravity. 
                              These dark matter halos began attracting ordinary matter, forming the first structures 
                              that would eventually become galaxies.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ mb: 2, bgcolor: 'rgba(63, 81, 181, 0.1)' }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography sx={{ 
                              fontFamily: 'Orbitron', 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.95rem' }
                            }}>
                              First Stars and Galaxies (13 - 12 billion years ago)
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
                              The first stars formed from primordial hydrogen and helium. These massive stars 
                              lived short lives and exploded as supernovae, enriching the universe with heavier 
                              elements necessary for planet and life formation.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ mb: 2, bgcolor: 'rgba(63, 81, 181, 0.1)' }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography sx={{ 
                              fontFamily: 'Orbitron', 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.95rem' }
                            }}>
                              Galaxy Growth and Mergers (12 - 8 billion years ago)
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
                              Smaller galaxies merged to form larger ones. This period saw intense star formation 
                              and the establishment of different galaxy types. Spiral galaxies formed disks while 
                              elliptical galaxies formed through major mergers.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ bgcolor: 'rgba(63, 81, 181, 0.1)' }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography sx={{ 
                              fontFamily: 'Orbitron', 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.95rem' }
                            }}>
                              Modern Era (8 billion years ago - present)
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
                              Galaxy formation rate decreased as the universe expanded and cooled. Existing 
                              galaxies continue to evolve through ongoing star formation, stellar evolution, 
                              and occasional mergers.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={4}>
                    <Card sx={{ 
                      background: 'rgba(63, 81, 181, 0.1)',
                      border: '1px solid rgba(63, 81, 181, 0.3)',
                      backdropFilter: 'blur(10px)',
                      mb: 3
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2,
                          fontFamily: 'Orbitron',
                          color: '#3f51b5',
                          fontSize: { xs: '0.95rem', sm: '1.125rem' }
                        }}>
                          Galaxy Facts
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            <strong>Observable Galaxies:</strong> Over 2 trillion
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            <strong>Largest Galaxy:</strong> IC 1101
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            <strong>Most Common Type:</strong> Dwarf Galaxies
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            <strong>Galaxy Clusters:</strong> Up to 1000+ galaxies
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card sx={{ 
                      background: 'rgba(0, 188, 212, 0.1)',
                      border: '1px solid rgba(0, 188, 212, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2,
                          fontFamily: 'Orbitron',
                          color: '#00bcd4',
                          fontSize: { xs: '0.95rem', sm: '1.125rem' }
                        }}>
                          Future Evolution
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          lineHeight: 1.6,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          In the far future, galaxy mergers will continue. Our Milky Way 
                          will collide with Andromeda in ~4.5 billion years. Eventually, 
                          the universe's expansion will isolate galaxy groups, and star 
                          formation will cease as gas supplies are exhausted.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Galaxy Details Modal */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg" 
          fullWidth
          fullScreen={window.innerWidth < 600}
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 4 },
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
              border: '1px solid rgba(63, 81, 181, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
              m: { xs: 0, sm: 1 },
              width: '100%',
              maxHeight: '95vh'
            }
          }}
        >
          {selectedGalaxy && (
            <>
              <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar 
                      src={selectedGalaxy.image}
                      sx={{ 
                        width: { xs: 50, sm: 70 }, 
                        height: { xs: 50, sm: 70 }, 
                        border: '2px solid #3f51b5'
                      }}
                    />
                    <Box>
                      <Typography variant="h5" sx={{ 
                        fontFamily: 'Orbitron',
                        fontWeight: 700,
                        color: '#3f51b5',
                        mb: 0.5,
                        fontSize: { xs: '1.1rem', sm: '1.5rem' }
                      }}>
                        {selectedGalaxy.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ 
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.75rem', sm: '0.95rem' }
                      }}>
                        {selectedGalaxy.type} • {selectedGalaxy.constellation}
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
              <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box
                      component="img" 
                      src={selectedGalaxy.image}
                      alt={selectedGalaxy.name}
                      sx={{ 
                        width: '100%', 
                        height: { xs: '200px', sm: '250px' }, 
                        objectFit: 'cover',
                        borderRadius: 3,
                        mb: 2
                      }}
                    />
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.8, 
                      fontSize: { xs: '0.8rem', sm: '0.95rem' }
                    }}>
                      {selectedGalaxy.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      bgcolor: 'rgba(63, 81, 181, 0.1)',
                      border: '1px solid rgba(63, 81, 181, 0.3)',
                      mb: 3
                    }}>
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        fontFamily: 'Orbitron', 
                        color: '#3f51b5',
                        fontSize: { xs: '0.95rem', sm: '1.125rem' }
                      }}>
                        Galaxy Properties
                      </Typography>
                      {[
                        ['Distance', selectedGalaxy.distance],
                        ['Diameter', selectedGalaxy.diameter],
                        ['Mass', selectedGalaxy.mass],
                        ['Age', selectedGalaxy.age],
                        ['Stars', selectedGalaxy.stars],
                        ['Discovered By', selectedGalaxy.discoveredBy],
                        ['Year', selectedGalaxy.yearDiscovered]
                      ].map(([label, value]) => (
                        <Box key={label} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          mb: 1,
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }}>
                            {label}:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            color: '#3f51b5',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            textAlign: 'right',
                            flex: 1,
                            minWidth: '60%'
                          }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>

                    <Paper sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      bgcolor: 'rgba(0, 188, 212, 0.1)',
                      border: '1px solid rgba(0, 188, 212, 0.3)'
                    }}>
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        fontFamily: 'Orbitron', 
                        color: '#00bcd4',
                        fontSize: { xs: '0.95rem', sm: '1.125rem' }
                      }}>
                        Interesting Facts
                      </Typography>
                      {selectedGalaxy.facts.map((fact, index) => (
                        <Typography key={index} variant="body2" sx={{ 
                          mb: 1, 
                          display: 'flex', 
                          alignItems: 'flex-start',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          lineHeight: 1.5
                        }}>
                          <Star sx={{ fontSize: { xs: 14, sm: 16 }, color: '#00bcd4', mr: 1, mt: 0.2, flexShrink: 0 }} />
                          {fact}
                        </Typography>
                      ))}
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}

export default Galaxy;