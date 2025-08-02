import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, Chip, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { OpenInNew, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ObjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [object, setObject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use initial data from SSR if available
    if (window.__INITIAL_DATA__) {
      setObject(window.__INITIAL_DATA__);
      setLoading(false);
      delete window.__INITIAL_DATA__;
    } else {
      fetchObject();
    }
  }, [slug]);

  const fetchObject = async () => {
    try {
      const response = await axios.get(`/api/cosmic-objects/${slug}`);
      setObject(response.data);
    } catch (error) {
      console.error('Error fetching object:', error);
      // Redirect to 404 or back to explorer
      navigate('/universe-explorer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!object) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4">Object not found</Typography>
        <Button variant="contained" onClick={() => navigate('/universe-explorer')} sx={{ mt: 2 }}>
          Back to Explorer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/universe-explorer')}
          sx={{ mb: 4 }}
        >
          Back to Explorer
        </Button>

        <Grid container spacing={6}>
          {/* Main Content */}
          <Grid xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Orbitron',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 0 24px #818cf8'
                }}
              >
                {object.name}
              </Typography>
              
              <Chip
                label={object.type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                color="primary"
                sx={{ mb: 3, fontWeight: 600 }}
              />

              <Typography
                variant="body1"
                sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, mb: 4 }}
              >
                {object.description || 'No description available.'}
              </Typography>

              {/* Object Data */}
              {object.data && Object.keys(object.data).length > 0 && (
                <Card sx={{ mb: 4, p: 3 }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 2 }}>
                    Key Facts
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(object.data).map(([key, value]) => {
                      if (value === null || value === undefined) return null;
                      return (
                        <Grid xs={12} sm={6} key={key}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {typeof value === 'number' ? value.toLocaleString() : value}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Card>
              )}

              {/* External Links */}
              {object.links && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Learn More
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {object.links.nasa && (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<OpenInNew />}
                        href={object.links.nasa}
                        target="_blank"
                      >
                        NASA
                      </Button>
                    )}
                    {object.links.wikipedia && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<OpenInNew />}
                        href={object.links.wikipedia}
                        target="_blank"
                      >
                        Wikipedia
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid xs={12} md={4}>
            {object.image && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card sx={{ mb: 4 }}>
                  <img
                    src={object.image.url}
                    alt={object.image.alt || object.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  />
                </Card>
              </motion.div>
            )}

            {/* Keywords */}
            {object.keywords && object.keywords.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Related Topics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {object.keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      variant="outlined"
                      size="small"
                      clickable
                      onClick={() => navigate(`/universe-explorer?q=${encodeURIComponent(keyword)}`)}
                    />
                  ))}
                </Box>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ObjectDetail;