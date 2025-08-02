import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button, 
  TextField, InputAdornment, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Chip, Pagination, Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { Search, OpenInNew, Language } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function UniverseExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [objects, setObjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, total: 0, pages: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Use initial data from SSR if available
    if (window.__INITIAL_DATA__) {
      const data = window.__INITIAL_DATA__;
      setObjects(data.objects || []);
      setPagination(data.pagination || { current: 1, total: 0, pages: 0 });
      setLoading(false);
      delete window.__INITIAL_DATA__;
    } else {
      // Get initial page from URL params
      const page = parseInt(searchParams.get('page')) || 1;
      handleSearch(page);
    }
    
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await axios.get('/api/cosmic-objects/types');
      setTypes(response.data);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('q', search);
      if (type !== 'all') params.append('type', type);
      params.append('page', page.toString());
      params.append('limit', '20');
      
      // Update URL for SEO
      setSearchParams(params);
      
      console.log('Fetching from:', `/api/cosmic-objects/search?${params}`);
      const response = await axios.get(`/api/cosmic-objects/search?${params}`);
      const data = response.data;
      
      console.log('API Response:', data);
      
      setObjects(data.objects || []);
      setPagination(data.pagination || { current: page, total: 0, pages: 0 });
    } catch (error) {
      console.error('Error searching objects:', error);
      setError(`Failed to load cosmic objects: ${error.message}`);
      setObjects([]);
      setPagination({ current: page, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, page) => {
    handleSearch(page);
  };

  if (loading && objects.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading cosmic objects...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        {/* SEO-friendly heading structure */}
        <Typography
          variant="h1"
          align="center"
          sx={{
            fontFamily: 'Orbitron',
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
            letterSpacing: 2,
            textShadow: '0 0 24px #818cf8, 0 0 8px #f472b6',
          }}
        >
          Universe Explorer
        </Typography>
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: 4,
            color: 'text.secondary',
            fontSize: { xs: '1rem', md: '1.5rem' },
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 400
          }}
        >
          Discover {pagination?.total || '10,000+'} cosmic objects from planets to galaxies
        </Typography>
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Search Controls */}
        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search planets, stars, galaxies, exoplanets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            sx={{ width: { xs: '100%', md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select 
              value={type} 
              onChange={e => setType(e.target.value)} 
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              {types.map(t => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            onClick={() => handleSearch()}
            variant="contained"
            color="secondary"
            sx={{ px: 4, fontWeight: 600, borderRadius: 2, height: 56 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>

        {/* Results Grid */}
        <Grid container spacing={4} justifyContent="center">
          {objects.map((obj, i) => (
            <Grid 
              key={obj._id || i}
              xs={12} 
              sm={6} 
              md={4} 
              lg={3}
              sx={{ display: 'flex' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.05, duration: 0.7, type: 'spring', bounce: 0.25 }}
                whileHover={{ scale: 1.03 }}
                style={{ height: '100%', width: '100%' }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 32px rgba(129,140,248,0.10)',
                    background: 'linear-gradient(120deg, rgba(26,26,61,0.7) 60%, rgba(12,10,24,0.9) 100%)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/universe-explorer/${obj.slug}`)}
                >
                  {obj.image && (
                    <CardMedia
                      component="img"
                      src={obj.image.url}
                      alt={obj.image.alt || obj.name}
                      sx={{
                        height: 180,
                        objectFit: 'cover',
                        filter: 'brightness(0.95) contrast(1.08)',
                      }}
                    />
                  )}
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'Orbitron', mb: 1 }}>
                        {obj.name}
                      </Typography>
                      <Chip 
                        label={obj.type?.replace('_', ' ') || 'Unknown'} 
                        color="primary" 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: 13 }}>
                        {obj.description?.slice(0, 120) || 'No description available'}...
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: 12,
                        alignSelf: 'flex-start'
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.current}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}

        {/* No results */}
        {!loading && objects.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No cosmic objects found matching your search.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => {
                setSearch('');
                setType('all');
                handleSearch();
              }}
            >
              Show All Objects
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default UniverseExplorer;