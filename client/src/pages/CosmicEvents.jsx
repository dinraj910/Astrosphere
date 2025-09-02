import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardContent, CardMedia, Grid, 
  Chip, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails,
  Avatar, Stack, Paper, Fade, Zoom
} from '@mui/material';
import { 
  ExpandMore, Visibility, Schedule, LocationOn, Event, 
  Brightness7, Brightness3, Star, FlashOn, WbSunny, NightsStay,
  AutoAwesome, Flare, RocketLaunch
} from '@mui/icons-material';

// Enhanced image collection for cosmic events
const cosmicEventImages = {
  eclipse: [
    "https://c.tadst.com/gfx/600x337/eclipse-traditions.jpg?1",
    "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2017/08/a_partial_solar_eclipse_seen_from_space/17109542-1-eng-GB/A_partial_solar_eclipse_seen_from_space_pillars.png"
  ],
  moon: [
    "https://cdn.britannica.com/96/208796-050-47869FC7/full-moon.jpg",
    "https://cdn.britannica.com/96/208796-050-47869FC7/full-moon.jpg"
  ],
  meteor: [
    "https://science.nasa.gov/wp-content/uploads/2023/06/perseids-radiant-credit-preston-dyches-cc-by-nc-2-0.jpg",
    "https://science.nasa.gov/wp-content/uploads/2023/06/perseids-radiant-credit-preston-dyches-cc-by-nc-2-0.jpg"
  ],
  planet: [
    "https://bsmedia.business-standard.com/_media/bs/img/article/2017-10/27/full/1509117174-9225.jpg?im=FitAndFill=(826,465)",
    "https://bsmedia.business-standard.com/_media/bs/img/article/2017-10/27/full/1509117174-9225.jpg?im=FitAndFill=(826,465)"
  ],
  general: [
    "https://images.firstpost.com/wp-content/uploads/2018/12/geminids-meteor-shower-2018-1280-720.jpg",
    "https://images.firstpost.com/wp-content/uploads/2018/12/geminids-meteor-shower-2018-1280-720.jpg"
  ]
};

// Astronomy API configuration
const ASTRONOMY_API = {
  BASE_URL: 'https://api.astronomyapi.com/api/v2',
  // You need to create a free account at astronomyapi.com and get these credentials
  APP_ID: '77109180-da12-47c8-9dfe-559e92b04414', // Replace with your actual App ID
  APP_SECRET: 'fcf7a4f74cfd3a7377c5c64ceb1db6798a33c515f079b1a97de0f9fdb14b07926582eaf8f9c044cb576075b856ec81d2dcb9bfc9bb00b7ffa31dfb71416549867ea5ab3165103f1ffe95be726d5ba2ae8aefc0ff7136ae9f98351e25fdb7007157c1f42e7ae092ece055168a90f9bc1a'
};

// Get appropriate image based on event type and category
const getEventImage = (eventType, category = '') => {
  const type = eventType?.toLowerCase() || '';
  const cat = category?.toLowerCase() || '';
  
  if (type.includes('eclipse') || cat === 'eclipse') return cosmicEventImages.eclipse[Math.floor(Math.random() * 2)];
  if (type.includes('moon') || type.includes('lunar') || cat === 'moon') return cosmicEventImages.moon[Math.floor(Math.random() * 2)];
  if (type.includes('meteor') || type.includes('shower') || cat === 'meteors') return cosmicEventImages.meteor[Math.floor(Math.random() * 2)];
  if (type.includes('planet') || type.includes('conjunction') || type.includes('mars') || type.includes('venus') || cat === 'planet') return cosmicEventImages.planet[Math.floor(Math.random() * 2)];
  
  return cosmicEventImages.general[Math.floor(Math.random() * 2)];
};

// Get event icon based on type and category
const getEventIcon = (eventType, category = '') => {
  const type = eventType?.toLowerCase() || '';
  const cat = category?.toLowerCase() || '';
  
  if (type.includes('eclipse') || cat === 'eclipse') return <Brightness7 sx={{ color: '#ff9800' }} />;
  if (type.includes('moon') || type.includes('lunar') || cat === 'moon') return <Brightness3 sx={{ color: '#2196f3' }} />;
  if (type.includes('meteor') || type.includes('shower') || cat === 'meteors') return <Star sx={{ color: '#ffc107' }} />;
  if (type.includes('planet') || type.includes('conjunction') || cat === 'planet') return <FlashOn sx={{ color: '#9c27b0' }} />;
  if (type.includes('seasonal') || cat === 'seasonal') return <WbSunny sx={{ color: '#4caf50' }} />;
  if (cat === 'sun') return <Flare sx={{ color: '#ff5722' }} />;
  
  return <Event sx={{ color: '#607d8b' }} />;
};

// Create authentication header for Astronomy API
const createAuthHeader = () => {
  const authString = btoa(`${ASTRONOMY_API.APP_ID}:${ASTRONOMY_API.APP_SECRET}`);
  return {
    'Authorization': `Basic ${authString}`,
    'Content-Type': 'application/json'
  };
};

// Fetch events from Astronomy API
const fetchAstronomyEvents = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const fromDate = `${currentYear}-01-01`;
    const toDate = `${currentYear}-12-31`;
    
    // Observer location (using New York as example - can be customized)
    const observer = {
      longitude: -74.006,
      latitude: 40.7128,
      elevation: 10
    };

    const allEvents = [];

    // Fetch Sun events
    try {
      const sunUrl = `${ASTRONOMY_API.BASE_URL}/bodies/events/sun?from=${fromDate}&to=${toDate}&observer_longitude=${observer.longitude}&observer_latitude=${observer.latitude}&observer_elevation=${observer.elevation}`;
      
      console.log('Fetching sun events from:', sunUrl);
      
      const sunResponse = await fetch(sunUrl, {
        method: 'GET',
        headers: createAuthHeader()
      });

      if (sunResponse.ok) {
        const sunData = await sunResponse.json();
        console.log('Sun data received:', sunData);
        
        if (sunData.data && sunData.data.rows) {
          sunData.data.rows.forEach(row => {
            if (row.events) {
              row.events.forEach(event => {
                allEvents.push({
                  id: `sun-${event.type}-${event.eventHighlights?.peak?.date || event.rise}`,
                  body: 'Sun',
                  type: formatEventType(event.type),
                  originalType: event.type,
                  eventHighlights: event.eventHighlights,
                  rise: event.rise,
                  set: event.set,
                  extraInfo: event.extraInfo
                });
              });
            }
          });
        }
      } else {
        const errorData = await sunResponse.text();
        console.error('Sun API error:', sunResponse.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching sun events:', error);
    }

    // Fetch Moon events
    try {
      const moonUrl = `${ASTRONOMY_API.BASE_URL}/bodies/events/moon?from=${fromDate}&to=${toDate}&observer_longitude=${observer.longitude}&observer_latitude=${observer.latitude}&observer_elevation=${observer.elevation}`;
      
      console.log('Fetching moon events from:', moonUrl);
      
      const moonResponse = await fetch(moonUrl, {
        method: 'GET',
        headers: createAuthHeader()
      });

      if (moonResponse.ok) {
        const moonData = await moonResponse.json();
        console.log('Moon data received:', moonData);
        
        if (moonData.data && moonData.data.rows) {
          moonData.data.rows.forEach(row => {
            if (row.events) {
              row.events.forEach(event => {
                allEvents.push({
                  id: `moon-${event.type}-${event.eventHighlights?.peak?.date || event.rise}`,
                  body: 'Moon',
                  type: formatEventType(event.type),
                  originalType: event.type,
                  eventHighlights: event.eventHighlights,
                  rise: event.rise,
                  set: event.set,
                  extraInfo: event.extraInfo
                });
              });
            }
          });
        }
      } else {
        const errorData = await moonResponse.text();
        console.error('Moon API error:', moonResponse.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching moon events:', error);
    }

    console.log('All events fetched:', allEvents);
    
    // If no events were fetched, use comprehensive 2025 data
    if (allEvents.length === 0) {
      console.log('No API events found, using comprehensive 2025 data');
      return getMajorEvents2025();
    }
    
    return processEventsData(allEvents);
  } catch (error) {
    console.error('Error fetching astronomy events:', error);
    throw error;
  }
};

// Major astronomical events for 2025 - hardcoded from TimeandDate.com
const getMajorEvents2025 = () => {
  return [
    // January 2025
    {
      id: 'jan-quadrantids',
      month: 'January',
      date: '2025-01-03',
      time: 'Peak: Night of Jan 3-4',
      title: 'Quadrantids Meteor Shower',
      type: 'Meteor Shower',
      description: 'The first major meteor shower of 2025, producing up to 40 meteors per hour at peak. Best viewed from northern latitudes.',
      visibility: 'Excellent',
      location: 'Northern Hemisphere',
      bestViewing: 'After midnight, away from city lights',
      magnitude: null,
      category: 'meteors'
    },
    {
      id: 'jan-wolf-moon',
      month: 'January',
      date: '2025-01-13',
      time: 'Full Moon',
      title: 'Wolf Moon',
      type: 'Moon Phase',
      description: 'The first Full Moon of 2025, traditionally called the Wolf Moon in northern cultures after wolves heard howling during winter.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, highest around midnight',
      magnitude: -12.6,
      category: 'moon'
    },
    {
      id: 'jan-mars-opposition',
      month: 'January',
      date: '2025-01-16',
      time: 'All night',
      title: 'Mars at Opposition',
      type: 'Planetary',
      description: 'Mars reaches opposition, appearing at its brightest and largest for the year. The red planet will be visible all night long.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'Best after sunset, visible all night',
      magnitude: -1.4,
      category: 'planet'
    },
    
    // February 2025
    {
      id: 'feb-snow-moon',
      month: 'February',
      date: '2025-02-12',
      time: 'Full Moon',
      title: 'Snow Moon',
      type: 'Moon Phase',
      description: 'February\'s Full Moon, called the Snow Moon due to heavy snowfall common in northern regions during this time.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, highest around midnight',
      magnitude: -12.6,
      category: 'moon'
    },
    {
      id: 'feb-venus-brightness',
      month: 'February',
      date: '2025-02-16',
      time: 'Evening',
      title: 'Venus at Greatest Brightness',
      type: 'Planetary',
      description: 'Venus reaches its maximum brightness in the evening sky, shining brilliantly as the "Evening Star".',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'After sunset, western sky',
      magnitude: -4.6,
      category: 'planet'
    },

    // March 2025
    {
      id: 'mar-total-lunar-eclipse',
      month: 'March',
      date: '2025-03-14',
      time: '06:58 UTC',
      title: 'Total Lunar Eclipse',
      type: 'Eclipse',
      description: 'A spectacular total lunar eclipse visible across North and South America, western Europe and Africa. The Moon will turn reddish during totality.',
      visibility: 'Excellent (weather permitting)',
      location: 'Americas, W. Europe, W. Africa',
      bestViewing: 'During totality, Moon appears red',
      magnitude: null,
      category: 'eclipse'
    },
    {
      id: 'mar-spring-equinox',
      month: 'March',
      date: '2025-03-20',
      time: '09:01 UTC',
      title: 'March Equinox (Spring)',
      type: 'Seasonal',
      description: 'The astronomical start of spring in the Northern Hemisphere. Day and night are approximately equal length worldwide.',
      visibility: 'Daylight event',
      location: 'Worldwide',
      bestViewing: 'Sunrise/sunset timing observation',
      magnitude: null,
      category: 'seasonal'
    },
    {
      id: 'mar-partial-solar-eclipse',
      month: 'March',
      date: '2025-03-29',
      time: 'Morning/Afternoon',
      title: 'Partial Solar Eclipse',
      type: 'Eclipse',
      description: 'A partial solar eclipse visible across Europe and northeastern North America. NEVER look directly at the Sun!',
      visibility: 'Good (with proper filters)',
      location: 'Europe, NE North America',
      bestViewing: 'Use proper solar filters only',
      magnitude: null,
      category: 'eclipse'
    },

    // April 2025
    {
      id: 'apr-pink-moon',
      month: 'April',
      date: '2025-04-13',
      time: 'Full Moon',
      title: 'Pink Moon (Micromoon)',
      type: 'Moon Phase',
      description: 'April\'s Full Moon, called Pink Moon after early spring flowers. This year it\'s a Micromoon - appearing smaller than usual.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, appears slightly smaller',
      magnitude: -12.3,
      category: 'moon'
    },
    {
      id: 'apr-lyrids',
      month: 'April',
      date: '2025-04-22',
      time: 'Peak: Night of Apr 22-23',
      title: 'Lyrid Meteor Shower',
      type: 'Meteor Shower',
      description: 'Annual meteor shower producing up to 18 meteors per hour. Debris from Comet Thatcher creates these fast, bright meteors.',
      visibility: 'Good',
      location: 'Northern Hemisphere',
      bestViewing: 'After midnight, look northeast',
      magnitude: null,
      category: 'meteors'
    },

    // May 2025
    {
      id: 'may-eta-aquariids',
      month: 'May',
      date: '2025-05-05',
      time: 'Peak: Night of May 5-6',
      title: 'Eta Aquariids Meteor Shower',
      type: 'Meteor Shower',
      description: 'Meteor shower from Halley\'s Comet debris. Best meteor shower for Southern Hemisphere, producing up to 30 meteors per hour.',
      visibility: 'Excellent',
      location: 'Best from Southern Hemisphere',
      bestViewing: 'Pre-dawn hours, eastern sky',
      magnitude: null,
      category: 'meteors'
    },
    {
      id: 'may-flower-moon',
      month: 'May',
      date: '2025-05-12',
      time: 'Full Moon',
      title: 'Flower Moon (Micromoon)',
      type: 'Moon Phase',
      description: 'May\'s Full Moon, called Flower Moon after abundant spring blooms. Another Micromoon appearing smaller than average.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, smaller appearance',
      magnitude: -12.3,
      category: 'moon'
    },

    // June 2025
    {
      id: 'jun-strawberry-moon',
      month: 'June',
      date: '2025-06-11',
      time: 'Full Moon',
      title: 'Strawberry Moon',
      type: 'Moon Phase',
      description: 'June\'s Full Moon, called Strawberry Moon after the strawberry harvesting season in North America.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, lowest full moon of year',
      magnitude: -12.6,
      category: 'moon'
    },
    {
      id: 'jun-summer-solstice',
      month: 'June',
      date: '2025-06-21',
      time: '02:42 UTC',
      title: 'Summer Solstice',
      type: 'Seasonal',
      description: 'Longest day in Northern Hemisphere, shortest in Southern Hemisphere. The Sun reaches its highest point in the sky.',
      visibility: 'Daylight event',
      location: 'Worldwide',
      bestViewing: 'Observe sun\'s highest path',
      magnitude: null,
      category: 'seasonal'
    },

    // July 2025
    {
      id: 'jul-buck-moon',
      month: 'July',
      date: '2025-07-10',
      time: 'Full Moon',
      title: 'Buck Moon',
      type: 'Moon Phase',
      description: 'July\'s Full Moon, named Buck Moon after male deer whose antlers are in full growth during this time.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, summer full moon',
      magnitude: -12.6,
      category: 'moon'
    },

    // August 2025
    {
      id: 'aug-perseids',
      month: 'August',
      date: '2025-08-12',
      time: 'Peak: Night of Aug 12-13',
      title: 'Perseid Meteor Shower',
      type: 'Meteor Shower',
      description: 'One of the most spectacular meteor showers, producing up to 60 meteors per hour. Swift and bright meteors from Comet Swift-Tuttle.',
      visibility: 'Good (bright moon reduces visibility)',
      location: 'Northern Hemisphere',
      bestViewing: 'After midnight, northeast sky',
      magnitude: null,
      category: 'meteors'
    },
    {
      id: 'aug-venus-jupiter',
      month: 'August',
      date: '2025-08-12',
      time: 'Morning',
      title: 'Venus-Jupiter Conjunction',
      type: 'Planetary',
      description: 'Venus and Jupiter appear extremely close together in the morning sky, separated by less than 1 degree.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'Before sunrise, eastern sky',
      magnitude: -4.2,
      category: 'planet'
    },
    {
      id: 'aug-sturgeon-moon',
      month: 'August',
      date: '2025-08-09',
      time: 'Full Moon',
      title: 'Sturgeon Moon',
      type: 'Moon Phase',
      description: 'August\'s Full Moon, named after the large sturgeon fish that were more easily caught during this time of year.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, warm summer moon',
      magnitude: -12.6,
      category: 'moon'
    },

    // September 2025
    {
      id: 'sep-total-lunar-eclipse',
      month: 'September',
      date: '2025-09-07',
      time: 'Evening/Night',
      title: 'Total Lunar Eclipse',
      type: 'Eclipse',
      description: 'Second total lunar eclipse of 2025, visible across Europe, Africa, Asia, Australia, and New Zealand. Moon will appear red during totality.',
      visibility: 'Excellent (weather permitting)',
      location: 'Europe, Africa, Asia, Australia',
      bestViewing: 'During totality, red moon',
      magnitude: null,
      category: 'eclipse'
    },
    {
      id: 'sep-autumn-equinox',
      month: 'September',
      date: '2025-09-22',
      time: '18:19 UTC',
      title: 'Autumn Equinox',
      type: 'Seasonal',
      description: 'Astronomical start of autumn in Northern Hemisphere. Equal day and night duration worldwide.',
      visibility: 'Daylight event',
      location: 'Worldwide',
      bestViewing: 'Sunrise/sunset timing',
      magnitude: null,
      category: 'seasonal'
    },

    // October 2025
    {
      id: 'oct-harvest-moon',
      month: 'October',
      date: '2025-10-07',
      time: 'Full Moon',
      title: 'Harvest Moon',
      type: 'Moon Phase',
      description: 'Full Moon closest to autumn equinox, traditionally called Harvest Moon. Provides extra light for evening harvest work.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, rises near sunset',
      magnitude: -12.6,
      category: 'moon'
    },
    {
      id: 'oct-orionids',
      month: 'October',
      date: '2025-10-21',
      time: 'Peak: Night of Oct 21-22',
      title: 'Orionid Meteor Shower',
      type: 'Meteor Shower',
      description: 'Fast meteors from Halley\'s Comet debris. Perfect timing with New Moon providing dark skies for optimal viewing.',
      visibility: 'Excellent (dark skies)',
      location: 'Both hemispheres',
      bestViewing: 'After midnight, Orion constellation',
      magnitude: null,
      category: 'meteors'
    },

    // November 2025
    {
      id: 'nov-beaver-moon',
      month: 'November',
      date: '2025-11-05',
      time: 'Full Moon',
      title: 'Super Beaver Moon',
      type: 'Moon Phase',
      description: 'November\'s Full Moon and the first Supermoon of the season. Appears larger and brighter than usual.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, appears 7% larger',
      magnitude: -12.9,
      category: 'moon'
    },
    {
      id: 'nov-leonids',
      month: 'November',
      date: '2025-11-17',
      time: 'Peak: Night of Nov 17-18',
      title: 'Leonid Meteor Shower',
      type: 'Meteor Shower',
      description: 'Fast meteors that occasionally produce spectacular meteor storms. Usually 15 meteors per hour, but can be much more.',
      visibility: 'Good',
      location: 'Both hemispheres',
      bestViewing: 'After midnight, Leo constellation',
      magnitude: null,
      category: 'meteors'
    },

    // December 2025
    {
      id: 'dec-cold-moon',
      month: 'December',
      date: '2025-12-04',
      time: 'Full Moon',
      title: 'Super Cold Moon',
      type: 'Moon Phase',
      description: 'Final Supermoon of 2025, appearing largest and brightest. Called Cold Moon due to winter\'s approach.',
      visibility: 'Excellent',
      location: 'Worldwide',
      bestViewing: 'All night, largest moon of year',
      magnitude: -13.0,
      category: 'moon'
    },
    {
      id: 'dec-geminids',
      month: 'December',
      date: '2025-12-13',
      time: 'Peak: Night of Dec 13-14',
      title: 'Geminid Meteor Shower',
      type: 'Meteor Shower',
      description: 'Often the best meteor shower of the year, producing up to 60 colorful meteors per hour from asteroid 3200 Phaethon.',
      visibility: 'Excellent',
      location: 'Northern Hemisphere best',
      bestViewing: 'After 9 PM, Gemini constellation',
      magnitude: null,
      category: 'meteors'
    },
    {
      id: 'dec-winter-solstice',
      month: 'December',
      date: '2025-12-21',
      time: '15:03 UTC',
      title: 'Winter Solstice',
      type: 'Seasonal',
      description: 'Shortest day in Northern Hemisphere, longest in Southern Hemisphere. Sun reaches its lowest point in northern sky.',
      visibility: 'Daylight event',
      location: 'Worldwide',
      bestViewing: 'Observe sun\'s lowest path',
      magnitude: null,
      category: 'seasonal'
    }
  ];
};

// Format event type for display
const formatEventType = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Process and organize events data
const processEventsData = (events) => {
  return events.map(event => {
    const peakDate = event.eventHighlights?.peak?.date || event.rise;
    const date = new Date(peakDate);
    
    return {
      id: event.id,
      month: date.toLocaleString('en-US', { month: 'long' }),
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' UTC',
      title: `${event.body} ${event.type}`,
      type: event.type,
      description: generateEventDescription(event),
      visibility: determineVisibility(event),
      location: 'Worldwide',
      bestViewing: generateViewingInfo(event),
      magnitude: event.extraInfo?.magnitude || null,
      eventData: event
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Generate event description
const generateEventDescription = (event) => {
  const type = event.originalType;
  
  switch (type) {
    case 'partial_solar_eclipse':
      return `A partial solar eclipse occurs when the Moon partially covers the Sun. Obscuration: ${((event.extraInfo?.obscuration || 0) * 100).toFixed(1)}%`;
    case 'total_solar_eclipse':
      return `A total solar eclipse occurs when the Moon completely covers the Sun, revealing the Sun's corona.`;
    case 'annular_solar_eclipse':
      return `An annular solar eclipse occurs when the Moon covers the Sun's center, leaving a ring of fire visible.`;
    case 'partial_lunar_eclipse':
      return `A partial lunar eclipse occurs when the Moon passes through part of Earth's shadow.`;
    case 'total_lunar_eclipse':
      return `A total lunar eclipse occurs when the Moon passes completely through Earth's shadow, often appearing reddish.`;
    case 'penumbral_lunar_eclipse':
      return `A penumbral lunar eclipse occurs when the Moon passes through Earth's penumbral shadow, causing a subtle dimming.`;
    default:
      return `${event.body} ${event.type} - A celestial event worth observing.`;
  }
};

// Determine event visibility
const determineVisibility = (event) => {
  const type = event.originalType;
  
  if (type.includes('solar_eclipse')) {
    return 'Location dependent';
  } else if (type.includes('lunar_eclipse')) {
    return 'Excellent (night side of Earth)';
  } else {
    return 'Good';
  }
};

// Generate viewing information
const generateViewingInfo = (event) => {
  const type = event.originalType;
  
  if (type.includes('solar_eclipse')) {
    return 'NEVER look directly at the Sun. Use proper solar filters.';
  } else if (type.includes('lunar_eclipse')) {
    return 'Best viewed after sunset when Moon is visible';
  } else {
    return 'Check local astronomical conditions';
  }
};

function CosmicEvents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupedEvents, setGroupedEvents] = useState({});

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError('');

        // Start with comprehensive hardcoded events
        const hardcodedEvents = getMajorEvents2025();
        
        let apiEvents = [];
        
        // Try to fetch API events if credentials are configured
        if (ASTRONOMY_API.APP_ID !== 'YOUR_APP_ID_HERE' && ASTRONOMY_API.APP_SECRET !== 'YOUR_APP_SECRET_HERE') {
          try {
            apiEvents = await fetchAstronomyEvents();
          } catch (apiError) {
            console.warn('API fetch failed, using hardcoded events:', apiError);
          }
        }

        // Combine API events with hardcoded events, prioritizing hardcoded for duplicates
        const combinedEvents = [...hardcodedEvents];
        
        // Add unique API events
        apiEvents.forEach(apiEvent => {
          const isDuplicate = hardcodedEvents.some(hardEvent => 
            hardEvent.date === apiEvent.date && 
            hardEvent.title.toLowerCase().includes(apiEvent.title.toLowerCase().substring(0, 10))
          );
          if (!isDuplicate) {
            combinedEvents.push(apiEvent);
          }
        });
        
        // Group events by month
        const grouped = combinedEvents.reduce((acc, event) => {
          const month = event.month;
          if (!acc[month]) {
            acc[month] = [];
          }
          acc[month].push(event);
          return acc;
        }, {});
        
        setGroupedEvents(grouped);
        setLoading(false);
      } catch (err) {
        console.error('Error loading events:', err);
        // Fallback to hardcoded events only
        const hardcodedEvents = getMajorEvents2025();
        const grouped = hardcodedEvents.reduce((acc, event) => {
          const month = event.month;
          if (!acc[month]) {
            acc[month] = [];
          }
          acc[month].push(event);
          return acc;
        }, {});
        
        setGroupedEvents(grouped);
        setError('Using offline event data - API unavailable');
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 220, 250, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 120, 200, 0.1) 0%, transparent 50%)',
            animation: 'rotate 20s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        />
        
        <Zoom in={true}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              zIndex: 1
            }}
          >
            <RocketLaunch 
              sx={{ 
                fontSize: 60, 
                color: '#64b5f6', 
                mb: 3,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' }
                }
              }} 
            />
            <CircularProgress 
              size={60} 
              sx={{ 
                mb: 3,
                '& .MuiCircularProgress-circle': {
                  stroke: 'url(#gradient)',
                }
              }} 
            />
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#64b5f6" />
                  <stop offset="100%" stopColor="#1976d2" />
                </linearGradient>
              </defs>
            </svg>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'white', 
                fontFamily: 'Orbitron',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              Exploring the Cosmos
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.1rem'
              }}
            >
              Loading astronomical events for {new Date().getFullYear()}...
            </Typography>
          </Paper>
        </Zoom>
      </Box>
    );
  }

  if (error && Object.keys(groupedEvents).length === 0) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Fade in={true}>
          <Alert 
            severity="warning" 
            sx={{ 
              maxWidth: 800,
              background: 'rgba(255,193,7,0.1)',
              border: '1px solid rgba(255,193,7,0.3)',
              borderRadius: 3,
              '& .MuiAlert-icon': {
                color: '#ffc107'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
              Using Offline Data
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
              {error}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Showing comprehensive astronomical events for 2025 with data from TimeandDate.com
            </Typography>
          </Alert>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative',
      py: { xs: 2, md: 4 }
    }}>
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 220, 250, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 120, 200, 0.05) 0%, transparent 50%)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #64b5f6 0%, #1976d2 50%, #0d47a1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                textShadow: '0 0 30px rgba(100, 181, 246, 0.3)',
                letterSpacing: '0.02em'
              }}
            >
              Astronomical Events {new Date().getFullYear()}
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 900,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                mb: 3,
                fontWeight: 300
              }}
            >
              Discover the cosmos through comprehensive astronomical events featuring eclipses, meteor showers, planetary conjunctions, and celestial phenomena
            </Typography>

            {/* Event Statistics */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Paper
                elevation={12}
                sx={{
                  px: 3,
                  py: 2,
                  background: 'rgba(100, 181, 246, 0.1)',
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h4" sx={{ color: '#64b5f6', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                  {Object.values(groupedEvents).flat().length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Events
                </Typography>
              </Paper>
              
              <Paper
                elevation={12}
                sx={{
                  px: 3,
                  py: 2,
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h4" sx={{ color: '#ffc107', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                  {Object.keys(groupedEvents).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Active Months
                </Typography>
              </Paper>

              <Paper
                elevation={12}
                sx={{
                  px: 3,
                  py: 2,
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h4" sx={{ color: '#4caf50', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                  {Object.values(groupedEvents).flat().filter(e => e.category === 'eclipse').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Eclipses
                </Typography>
              </Paper>
            </Stack>

            {error && (
              <Alert 
                severity="info" 
                sx={{ 
                  maxWidth: 600,
                  mx: 'auto',
                  background: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#2196f3'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {error} - Displaying comprehensive 2025 events from TimeandDate.com
                </Typography>
              </Alert>
            )}
          </Box>
        </Fade>

        {/* Monthly Events with Enhanced Design */}
        {months.map((month, index) => {
          const monthEvents = groupedEvents[month] || [];
          if (monthEvents.length === 0) return null;

          return (
            <Fade in={true} timeout={1200 + index * 100} key={month}>
              <Accordion
                defaultExpanded={month === new Date().toLocaleString('en-US', { month: 'long' })}
                sx={{
                  mb: 4,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  '&:before': { display: 'none' },
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  '&.Mui-expanded': {
                    boxShadow: '0 20px 60px rgba(100,181,246,0.2)',
                    border: '1px solid rgba(100,181,246,0.2)'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white', fontSize: '2rem' }} />}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.15) 0%, rgba(100,181,246,0.1) 100%)',
                    borderRadius: '16px 16px 0 0',
                    minHeight: { xs: 80, md: 100 },
                    px: { xs: 2, md: 4 },
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(25,118,210,0.2) 0%, rgba(100,181,246,0.15) 100%)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                        mr: { xs: 2, md: 3 },
                        width: { xs: 50, md: 70 },
                        height: { xs: 50, md: 70 },
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontFamily: 'Orbitron',
                          color: 'white',
                          fontWeight: 'bold',
                          //reduce font size for all screen
                          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                          mb: 0.5
                        }}
                      >
                        {month} {new Date().getFullYear()}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: { xs: '0.9rem', md: '1.1rem' }
                        }}
                      >
                        {monthEvents.length} astronomical event{monthEvents.length !== 1 ? 's' : ''} • 
                        <span style={{ marginLeft: 8 }}>
                          {monthEvents.filter(e => e.category === 'eclipse').length > 0 && '🌑 '}
                          {monthEvents.filter(e => e.category === 'meteors').length > 0 && '☄️ '}
                          {monthEvents.filter(e => e.category === 'moon').length > 0 && '🌙 '}
                          {monthEvents.filter(e => e.category === 'planet').length > 0 && '🪐 '}
                        </span>
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 0, background: 'rgba(0,0,0,0.1)' }}>
                  <Grid container spacing={{ xs: 2, md: 3 }} sx={{ p: { xs: 2, md: 4 } }}>
                    {monthEvents
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((event, eventIndex) => (
                      <Grid item xs={12} sm={6} lg={4} key={event.id}>
                        <Zoom in={true} timeout={1000 + eventIndex * 100}>
                          <Card
                            sx={{
                              background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 4,
                              overflow: 'hidden',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              height: '100%',
                              position: 'relative',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.02)',
                                boxShadow: '0 25px 50px rgba(100,181,246,0.4)',
                                border: '1px solid rgba(100,181,246,0.4)',
                                '& .event-image': {
                                  transform: 'scale(1.1)',
                                },
                                '& .event-overlay': {
                                  opacity: 0.9
                                }
                              }
                            }}
                          >
                            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                              <CardMedia
                                component="img"
                                height={240}
                                image={getEventImage(event.type, event.category)}
                                alt={event.title}
                                className="event-image"
                                sx={{ 
                                  objectFit: 'cover',
                                  transition: 'transform 0.4s ease'
                                }}
                              />
                              <Box
                                className="event-overlay"
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: `linear-gradient(135deg, ${
                                    event.category === 'eclipse' ? 'rgba(255,152,0,0.3)' :
                                    event.category === 'meteors' ? 'rgba(255,193,7,0.3)' :
                                    event.category === 'moon' ? 'rgba(33,150,243,0.3)' :
                                    event.category === 'planet' ? 'rgba(156,39,176,0.3)' :
                                    'rgba(96,125,139,0.3)'
                                  } 0%, transparent 70%)`,
                                  opacity: 0.7,
                                  transition: 'opacity 0.4s ease'
                                }}
                              />
                              
                              {/* Category Badge */}
                              <Chip
                                label={event.category || 'Event'}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  backdropFilter: 'blur(10px)',
                                  textTransform: 'capitalize'
                                }}
                              />
                            </Box>

                            <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                {getEventIcon(event.type, event.category)}
                                <Box sx={{ ml: 1.5, flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontFamily: 'Orbitron',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                                      lineHeight: 1.3,
                                      mb: 0.5
                                    }}
                                  >
                                    {event.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'rgba(255,255,255,0.6)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    {event.type}
                                  </Typography>
                                </Box>
                              </Box>

                              <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Schedule sx={{ color: '#64b5f6', mr: 1.5, fontSize: '1.2rem' }} />
                                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                                    {new Date(event.date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })} • {event.time}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationOn sx={{ color: '#4caf50', mr: 1.5, fontSize: '1.2rem' }} />
                                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                                    {event.location}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                  <Visibility sx={{ color: '#ff9800', mr: 1.5, mt: 0.2, fontSize: '1.2rem' }} />
                                  <Typography sx={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '0.9rem',
                                    lineHeight: 1.4
                                  }}>
                                    {event.bestViewing}
                                  </Typography>
                                </Box>

                                <Typography
                                  sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                    mt: 2
                                  }}
                                >
                                  {event.description}
                                </Typography>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                  <Chip
                                    label={event.visibility}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(76,175,80,0.2)',
                                      color: '#4caf50',
                                      border: '1px solid rgba(76,175,80,0.4)',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  {event.magnitude && (
                                    <Chip
                                      label={`Mag: ${event.magnitude}`}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(255,152,0,0.2)',
                                        color: '#ff9800',
                                        border: '1px solid rgba(255,152,0,0.4)',
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  )}
                                  <Chip
                                    label="2025 Event"
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(100,181,246,0.2)',
                                      color: '#64b5f6',
                                      border: '1px solid rgba(100,181,246,0.4)',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Fade>
          );
        })}

        {/* Enhanced Footer */}
        <Fade in={true} timeout={2000}>
          <Paper
            elevation={12}
            sx={{
              textAlign: 'center',
              mt: 8,
              p: 6,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              backdropFilter: 'blur(20px)'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <NightsStay sx={{ color: '#64b5f6', fontSize: '2rem' }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Orbitron',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  Astronomical Guide
                </Typography>
                <WbSunny sx={{ color: '#ffc107', fontSize: '2rem' }} />
              </Box>
              
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '1rem',
                  maxWidth: 700,
                  lineHeight: 1.7,
                  mb: 2
                }}
              >
                All times are in UTC. Convert to your local timezone for accurate viewing times. 
                Weather conditions and light pollution may affect visibility. For best results, 
                find dark skies away from city lights and check local weather forecasts.
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={4} 
                alignItems="center"
                sx={{ pt: 2 }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.9rem'
                  }}
                >
                  Data sources: 
                  <a 
                    href="https://astronomyapi.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#64b5f6', textDecoration: 'none', marginLeft: 4 }}
                  >
                    Astronomy API
                  </a>
                  {' • '}
                  <a 
                    href="https://www.timeanddate.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#64b5f6', textDecoration: 'none' }}
                  >
                    TimeandDate.com
                  </a>
                </Typography>
                
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.85rem'
                  }}
                >
                  © 2025 Astrosphere • Explore the Universe
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default CosmicEvents;