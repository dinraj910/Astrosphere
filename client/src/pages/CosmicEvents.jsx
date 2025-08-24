import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardContent, CardMedia, Grid, Tabs, Tab,
  Accordion, AccordionSummary, AccordionDetails, Button, Chip, CircularProgress, Alert, Badge
} from '@mui/material';
import { ExpandMore, Event, CalendarMonth, PlayCircle, Science, Flare } from '@mui/icons-material';
import axios from 'axios';

// Helper: fallback image for events
const fallbackImage = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

// Helper: get event image or fallback
const getEventImage = (event) => {
  if (event.image) return event.image;
  if (event.video) return event.video;
  return fallbackImage;
};

// Helper: get chip color based on event type
const getEventChipColor = (type, source) => {
  if (source === 'NASA DONKI') return 'error';
  if (type?.toLowerCase().includes('eclipse')) return 'warning';
  if (type?.toLowerCase().includes('meteor')) return 'info';
  if (type?.toLowerCase().includes('solar')) return 'error';
  return 'primary';
};

// Helper: get event icon
const getEventIcon = (type, source) => {
  if (source === 'NASA DONKI') return <Science />;
  if (type?.toLowerCase().includes('solar') || type?.toLowerCase().includes('flare')) return <Flare />;
  return <Event />;
};

// Fetch events from multiple APIs
const fetchEvents = async (year, month) => {
  try {
    console.log(`🔍 Fetching events for ${year}-${month}`);
    const url = `/api/cosmic-events?year=${year}&month=${month}`;
    const res = await axios.get(url);
    
    if (res.data && res.data.events && res.data.events.length > 0) {
      console.log(`✅ Received ${res.data.events.length} events from APIs: ${res.data.sources?.join(', ')}`);
      return res.data.events.map(ev => ({
        id: ev.id || `${year}-${month}-${Math.random()}`,
        title: ev.title || 'Astronomical Event',
        date: ev.date || `${year}-${month}`,
        description: ev.description || 'Astronomical event details.',
        type: ev.type || 'General',
        image: getEventImage(ev),
        video: ev.video || null,
        url: ev.url || '#',
        major: ev.major || false,
        source: ev.source || 'Unknown',
        month: month,
        year: year,
      }));
    }
    
    console.log(`⚠️ No events returned from API for ${year}-${month}`);
    return [];
    
  } catch (err) {
    console.error('❌ API error, no fallback data:', err);
    return [];
  }
};

function CosmicEvents() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [events, setEvents] = useState([]);
  const [majorEvents, setMajorEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('');

  // Fetch events when year/month changes
  useEffect(() => {
    setLoading(true);
    setError('');
    setDataSource('');
    
    Promise.all([
      fetchEvents(year, 0), // Try to get yearly major events
      fetchEvents(year, month) // Get monthly events
    ]).then(([yearEvents, monthEvents]) => {
      // Filter major events (marked as major or from specific sources)
      const majors = yearEvents.filter(ev => 
        ev.major === true || 
        ev.source === 'NASA Eclipse Predictions' || 
        ev.type?.toLowerCase().includes('eclipse')
      );
      
      // If no major events, try to promote important events from monthly data
      if (majors.length === 0) {
        const importantMonthly = monthEvents.filter(ev => 
          ev.source === 'NASA DONKI' || 
          ev.type?.toLowerCase().includes('eclipse') ||
          ev.type?.toLowerCase().includes('meteor')
        ).slice(0, 6);
        setMajorEvents(importantMonthly);
      } else {
        setMajorEvents(majors);
      }
      
      setEvents(monthEvents);
      setDataSource(monthEvents.length > 0 ? `Live data from multiple APIs` : 'No current events');
      setLoading(false);
    }).catch((err) => {
      setError(`Failed to load events: ${err.message}`);
      setEvents([]);
      setMajorEvents([]);
      setLoading(false);
    });
  }, [year, month]);

  // Years to show (current year +/- 2)
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);
  // Months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Box sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, sm: 8 }, pb: 4 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontFamily: 'Orbitron',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: '#e7e7e7ff',
            textShadow: '0 0 24px #3586e8ff, 0 0 8px #1b2338ff',
          }}
        >
          Cosmic Events
        </Typography>
        <Typography
          align="center"
          sx={{
            mb: 2,
            color: 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 400
          }}
        >
          Real-time astronomical events from NASA, eclipse predictions, and space weather data.
        </Typography>
        
        {dataSource && (
          <Typography
            align="center"
            sx={{
              mb: 4,
              color: '#4caf50',
              fontSize: '0.9rem',
              fontStyle: 'italic'
            }}
          >
            📡 {dataSource}
          </Typography>
        )}

        {/* Year/Month Selectors */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Tabs
            value={years.indexOf(year)}
            onChange={(_, idx) => setYear(years[idx])}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': { fontSize: { xs: '0.9rem', sm: '1.1rem' }, px: 2 },
              '& .Mui-selected': { color: '#3f51b5 !important' }
            }}
          >
            {years.map(y => <Tab key={y} label={y} />)}
          </Tabs>
          <Tabs
            value={month - 1}
            onChange={(_, idx) => setMonth(idx + 1)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': { fontSize: { xs: '0.9rem', sm: '1.1rem' }, px: 2 },
              '& .Mui-selected': { color: '#00bcd4 !important' }
            }}
          >
            {months.map((m, i) => <Tab key={m} label={m} />)}
          </Tabs>
        </Box>

        {/* Tabs for Major/Month events */}
        <Tabs
          value={tab}
          onChange={(_, t) => setTab(t)}
          centered
          sx={{
            mb: 3,
            '& .MuiTab-root': { fontFamily: 'Orbitron', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } },
            '& .Mui-selected': { color: '#3f51b5 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#3f51b5' }
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={majorEvents.length} color="primary">
                Major Events (Year)
              </Badge>
            } 
            icon={<Event />} 
            iconPosition="start" 
          />
          <Tab 
            label={
              <Badge badgeContent={events.length} color="secondary">
                All Events (Month)
              </Badge>
            } 
            icon={<CalendarMonth />} 
            iconPosition="start" 
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <CircularProgress color="primary" />
            <Typography sx={{ ml: 2, color: 'text.secondary' }}>
              Fetching real-time astronomical data...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Major Events */}
            {tab === 0 && (
              <Box>
                {majorEvents.length === 0 ? (
                  <Alert severity="info" sx={{ textAlign: 'center' }}>
                    No major events found for {year}. Try selecting a different year or check the monthly events.
                  </Alert>
                ) : (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h5" sx={{ fontFamily: 'Orbitron', color: '#3f51b5' }}>
                        Major Astronomical Events in {year} ({majorEvents.length} events)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                        {majorEvents.map(event => (
                          <Grid item xs={12} sm={6} key={event.id} display="flex">
                            <Card sx={{
                              minHeight: 340,
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.3s',
                              '&:hover': {
                                boxShadow: '0 8px 32px rgba(129,140,248,0.18)'
                              }
                            }}>
                              <CardMedia
                                component="img"
                                height="180"
                                image={getEventImage(event)}
                                alt={event.title}
                                sx={{ objectFit: 'cover', filter: 'brightness(0.9)' }}
                              />
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Orbitron', color: '#3f51b5', mb: 1 }}>
                                  {getEventIcon(event.type, event.source)} {event.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  📅 {event.date}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                                  {event.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                  <Chip 
                                    label={event.type} 
                                    size="small" 
                                    color={getEventChipColor(event.type, event.source)}
                                  />
                                  <Chip 
                                    label={event.source} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                  {event.video && (
                                    <Chip
                                      icon={<PlayCircle />}
                                      label="Video"
                                      size="small"
                                      color="secondary"
                                      component="a"
                                      href={event.video}
                                      target="_blank"
                                    />
                                  )}
                                </Box>
                                <Button
                                  href={event.url}
                                  target="_blank"
                                  variant="outlined"
                                  color="secondary"
                                  fullWidth
                                  sx={{ borderRadius: 2, fontWeight: 600 }}
                                >
                                  More Details
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            )}

            {/* Detailed Month Events */}
            {tab === 1 && (
              <Box>
                {events.length === 0 ? (
                  <Alert severity="info" sx={{ textAlign: 'center' }}>
                    No events found for {months[month - 1]} {year}. This could mean:
                    <br />• No astronomical events this month
                    <br />• API temporarily unavailable
                    <br />• Try selecting a different month/year
                  </Alert>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                      {events.length} events for {months[month - 1]} {year}
                    </Typography>
                    <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                      {events.map(event => (
                        <Grid item xs={12} sm={6} key={event.id} display="flex">
                          <Card sx={{
                            minHeight: 340,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: '0 8px 32px rgba(129,140,248,0.18)'
                            }
                          }}>
                            <CardMedia
                              component="img"
                              height="180"
                              image={getEventImage(event)}
                              alt={event.title}
                              sx={{ objectFit: 'cover', filter: 'brightness(0.9)' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" sx={{ fontFamily: 'Orbitron', color: '#3f51b5', mb: 1 }}>
                                {getEventIcon(event.type, event.source)} {event.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                📅 {event.date}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                                {event.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Chip 
                                  label={event.type} 
                                  size="small" 
                                  color={getEventChipColor(event.type, event.source)}
                                />
                                <Chip 
                                  label={event.source} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                                {event.video && (
                                  <Chip
                                    icon={<PlayCircle />}
                                    label="Video"
                                    size="small"
                                    color="secondary"
                                    component="a"
                                    href={event.video}
                                    target="_blank"
                                  />
                                )}
                              </Box>
                              <Button
                                href={event.url}
                                target="_blank"
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                sx={{ borderRadius: 2, fontWeight: 600 }}
                              >
                                More Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default CosmicEvents;