import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActions,
  TextField, InputAdornment, Button, Dialog, DialogContent, DialogActions,
  IconButton, Chip, Pagination, CircularProgress, Alert, Fade, Zoom,
  FormControl, Select, MenuItem, InputLabel, Tooltip, Fab, Snackbar
} from '@mui/material';
import {
  Search, Download, Fullscreen, Close, FilterList, Category,
  PhotoCamera, Rocket, Public, Star, Science, Collections,
  ArrowUpward, GetApp, ZoomIn
} from '@mui/icons-material';
import axios from 'axios';
import { apiConfig } from '../config/api';

// Image categories for filtering
const categories = [
  { id: 'all', label: 'All Images', icon: <Collections /> },
  { id: 'space', label: 'Deep Space', icon: <Star /> },
  { id: 'planets', label: 'Planets', icon: <Public /> },
  { id: 'missions', label: 'Missions', icon: <Rocket /> },
  { id: 'astronomy', label: 'Astronomy', icon: <Science /> },
  { id: 'earth', label: 'Earth', icon: <Public /> }
];

// Sort options
const sortOptions = [
  { value: 'date_created', label: 'Newest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'popular', label: 'Most Popular' }
];

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_created');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const imagesPerPage = 24;

  // Helper function to process image URLs properly
  const processImageUrl = (url, type = 'original') => {
    if (!url) return null;
    
    // If it's already a high-quality URL, return as is
    if (url.includes('w=4000') || url.includes('w=6000')) {
      return url;
    }
    
    // For NASA API URLs, handle ~thumb and ~orig properly
    if (url.includes('~thumb')) {
      return type === 'thumbnail' ? url : url.replace('~thumb', '~orig');
    }
    
    // For other URLs (like Unsplash), add appropriate parameters
    if (url.includes('unsplash.com')) {
      const baseUrl = url.split('?')[0];
      if (type === 'thumbnail') {
        return `${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
      } else {
        return `${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95`;
      }
    }
    
    return url;
  };

  // Fetch images from NASA API
  const fetchImages = useCallback(async (searchQuery = '', category = 'all', sort = 'date_created', currentPage = 1) => {
    try {
      setLoading(true);
      setError('');

      // Build search query based on category
      let query = searchQuery || 'space';
      if (category !== 'all') {
        query = `${category} ${searchQuery}`.trim();
      }

      const response = await axios.get(`/api/nasa-gallery`, {
        params: {
          q: query,
          page: currentPage,
          page_size: imagesPerPage,
          media_type: 'image'
        }
      });

      if (response.data && response.data.collection && response.data.collection.items) {
        const items = response.data.collection.items;
        const processedImages = items
          .filter(item => item.links && item.links[0] && item.data && item.data[0])
          .map((item, index) => {
            const originalUrl = item.links[0].href;
            
            return {
              id: item.data[0].nasa_id || `img-${currentPage}-${index}`,
              title: item.data[0].title || 'Untitled',
              description: item.data[0].description || 'No description available',
              date: item.data[0].date_created || new Date().toISOString(),
              url: processImageUrl(originalUrl, 'original'), // High res for preview
              thumbnail: processImageUrl(originalUrl, 'thumbnail'), // Thumbnail for grid
              highRes: processImageUrl(originalUrl, 'original'), // High res for download
              keywords: item.data[0].keywords || [],
              photographer: item.data[0].photographer || 'NASA',
              center: item.data[0].center || 'NASA',
              category: category === 'all' ? getCategoryFromKeywords(item.data[0].keywords) : category
            };
          });

        setImages(processedImages);
        setTotalPages(Math.ceil(response.data.collection.metadata?.total_hits / imagesPerPage) || 10);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Gallery API error:', err);
      setError('Failed to load images. Please try again.');
      
      // Fallback to predefined images if API fails
      if (currentPage === 1) {
        setImages(getFallbackImages());
        setTotalPages(5);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Get category from keywords
  const getCategoryFromKeywords = (keywords = []) => {
    const keywordStr = keywords.join(' ').toLowerCase();
    if (keywordStr.includes('planet') || keywordStr.includes('mars') || keywordStr.includes('jupiter')) return 'planets';
    if (keywordStr.includes('mission') || keywordStr.includes('rover') || keywordStr.includes('spacecraft')) return 'missions';
    if (keywordStr.includes('galaxy') || keywordStr.includes('nebula') || keywordStr.includes('star')) return 'space';
    if (keywordStr.includes('earth') || keywordStr.includes('climate')) return 'earth';
    return 'astronomy';
  };

  // Fallback images for when API is unavailable
  const getFallbackImages = () => {
    const fallbackData = [
      {
        id: 'hubble-1',
        title: 'Hubble Deep Field Ultra High Resolution',
        description: 'The Hubble Space Telescope peers deep into space to reveal thousands of galaxies in unprecedented detail.',
        url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95',
        thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        highRes: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95',
        category: 'space',
        photographer: 'NASA/ESA',
        center: 'Hubble Space Telescope',
        keywords: ['galaxy', 'deep space', 'hubble'],
        date: '2024-01-15T00:00:00Z'
      },
      {
        id: 'mars-1',
        title: 'Mars Sunset 4K Resolution',
        description: 'A breathtaking sunset on Mars captured by the Perseverance rover in stunning high definition.',
        url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95',
        thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        highRes: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95',
        category: 'planets',
        photographer: 'NASA',
        center: 'Mars Perseverance Rover',
        keywords: ['mars', 'sunset', 'rover'],
        date: '2024-02-20T00:00:00Z'
      },
      {
        id: 'earth-1',
        title: 'Earth from Space Ultra HD',
        description: 'Our beautiful blue planet as seen from the International Space Station in crystal clear detail.',
        url: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95',
        thumbnail: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        highRes: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95',
        category: 'earth',
        photographer: 'NASA',
        center: 'International Space Station',
        keywords: ['earth', 'iss', 'space station'],
        date: '2024-03-10T00:00:00Z'
      }
    ];

    // Generate more fallback images
    const additionalImages = [];
    const baseImages = [
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3',
      'https://images.unsplash.com/photo-1518066000-611a194d1ddc',
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45'
    ];

    for (let i = 0; i < 50; i++) {
      const baseUrl = baseImages[i % baseImages.length];
      additionalImages.push({
        id: `fallback-${i}`,
        title: `Cosmic Wonder ${i + 1} - Ultra HD`,
        description: `A stunning view of our universe showcasing the beauty of space in high resolution.`,
        url: `${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95&sig=${i}`,
        thumbnail: `${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&sig=${i}`,
        highRes: `${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=95&sig=${i}`,
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id,
        photographer: 'NASA',
        center: 'Space Observatory',
        keywords: ['space', 'astronomy', 'cosmic'],
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return [...fallbackData, ...additionalImages];
  };

  // Handle image error
  const handleImageError = (event, imageId) => {
    console.log(`Image failed to load: ${imageId}`);
    // Set a fallback image
    event.target.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchImages(searchTerm, selectedCategory, sortBy, 1);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    fetchImages(searchTerm, category, sortBy, 1);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    setPage(1);
    fetchImages(searchTerm, selectedCategory, newSort, 1);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    fetchImages(searchTerm, selectedCategory, sortBy, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open image dialog
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  // Enhanced download function with backend proxy
  const handleDownload = async (image, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setDownloadLoading(true);
    try {
      const downloadUrl = image.highRes || image.url;
      
      // Use our backend proxy to handle CORS issues
      const proxyUrl = `${apiConfig.endpoints.nasaGallery}/download/${encodeURIComponent(image.nasa_id || image.title.replace(/[^a-z0-9]/gi, '_'))}?url=${encodeURIComponent(downloadUrl)}`;
      
      // Create a temporary link for download
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.target = '_blank';
      
      // Set filename
      const fileExtension = downloadUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)?.[1] || 'jpg';
      const sanitizedTitle = image.title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
      link.download = `${sanitizedTitle}_HD.${fileExtension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({
        open: true,
        message: 'Download started! Check your downloads folder.',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      setSnackbar({
        open: true,
        message: 'Download failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  // Scroll to top functionality
  const handleScroll = () => {
    setShowScrollTop(window.pageYOffset > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Initial load and scroll listener
  useEffect(() => {
    fetchImages();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchImages]);

  return (
    <Box sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
      overflowX: 'hidden'
    }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 4, sm: 8 }, pb: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Orbitron',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: '#e7e7e7ff',
              textShadow: '0 0 24px #3586e8ff, 0 0 8px #1b2338ff',
            }}
          >
            NASA Image Gallery
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Explore breathtaking high-resolution images from NASA's missions, deep space observations, and Earth science projects
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={handleSearch} variant="contained" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Category Filters */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {categories.map(category => (
            <Chip
              key={category.id}
              icon={category.icon}
              label={category.label}
              onClick={() => handleCategoryChange(category.id)}
              color={selectedCategory === category.id ? 'primary' : 'default'}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              sx={{
                '&:hover': { transform: 'translateY(-2px)' },
                transition: 'transform 0.2s'
              }}
            />
          ))}
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} />
            <Typography sx={{ ml: 2, color: 'text.secondary' }}>
              Loading stunning space images...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, backgroundColor: 'rgba(244,67,54,0.1)' }}>
            {error}
          </Alert>
        )}

        {/* Image Grid */}
        {!loading && images.length > 0 && (
          <Fade in={!loading}>
            <Box>
              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                    <Zoom in={true} timeout={300 + index * 50}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 12px 40px rgba(129,140,248,0.3)',
                            border: '1px solid rgba(129,140,248,0.5)'
                          }
                        }}
                        onClick={() => handleImageClick(image)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={image.thumbnail || image.url}
                          alt={image.title}
                          onError={(e) => handleImageError(e, image.id)}
                          sx={{
                            objectFit: 'cover',
                            filter: 'brightness(0.9)',
                            '&:hover': { filter: 'brightness(1.1)' }
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Orbitron',
                              fontSize: '1rem',
                              color: '#3f51b5',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {image.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {image.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={image.category}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                            <Chip
                              label="HD"
                              size="small"
                              color="primary"
                              variant="filled"
                            />
                          </Box>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                          <Button
                            size="small"
                            startIcon={<ZoomIn />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(image);
                            }}
                          >
                            View HD
                          </Button>
                          <Button
                            size="small"
                            startIcon={downloadLoading ? <CircularProgress size={16} /> : <GetApp />}
                            onClick={(e) => handleDownload(image, e)}
                            disabled={downloadLoading}
                            color="success"
                          >
                            Download
                          </Button>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  }}
                />
              </Box>
            </Box>
          </Fade>
        )}

        {/* No Images State */}
        {!loading && images.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PhotoCamera sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No images found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search terms or category filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                fetchImages('', 'all', sortBy, 1);
              }}
              sx={{ mt: 2 }}
            >
              Show All Images
            </Button>
          </Box>
        )}
      </Container>

      {/* Enhanced Image Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(10,10,26,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: 3,
            maxHeight: '95vh'
          }
        }}
      >
        {selectedImage && (
          <>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              <Box sx={{ position: 'relative', backgroundColor: '#000' }}>
                <img
                  src={selectedImage.highRes || selectedImage.url}
                  alt={selectedImage.title}
                  onError={(e) => {
                    e.target.src = selectedImage.thumbnail || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
                  }}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
                <IconButton
                  onClick={() => setDialogOpen(false)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { 
                      bgcolor: 'rgba(129,140,248,0.8)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Close />
                </IconButton>
                <Chip
                  label="Ultra HD"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(63,81,181,0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </Box>
              <Box sx={{ p: 4, background: 'linear-gradient(135deg, rgba(26,26,61,0.9), rgba(10,10,26,0.9))' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'Orbitron', 
                    mb: 2, 
                    color: '#3f51b5',
                    textShadow: '0 0 10px rgba(63,81,181,0.5)'
                  }}
                >
                  {selectedImage.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3, 
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.7,
                    fontSize: '1.1rem'
                  }}
                >
                  {selectedImage.description}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Photographer
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedImage.photographer}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Center
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedImage.center}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Date
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(selectedImage.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Category
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedImage.category}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                {selectedImage.keywords && selectedImage.keywords.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                      Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedImage.keywords.slice(0, 15).map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{
                            '&:hover': { bgcolor: 'rgba(63,81,181,0.1)' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: 'rgba(26,26,61,0.5)', backdropFilter: 'blur(10px)' }}>
              <Button
                onClick={(e) => handleDownload(selectedImage, e)}
                startIcon={downloadLoading ? <CircularProgress size={20} /> : <Download />}
                variant="contained"
                color="primary"
                disabled={downloadLoading}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {downloadLoading ? 'Downloading...' : 'Download Ultra HD'}
              </Button>
              <Button 
                onClick={() => setDialogOpen(false)} 
                color="secondary"
                sx={{ px: 3, py: 1, borderRadius: 3 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Scroll to Top Button */}
      <Fade in={showScrollTop}>
        <Fab
          onClick={scrollToTop}
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <ArrowUpward />
        </Fab>
      </Fade>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Gallery;