import React, { useState } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button, TextField, InputAdornment, CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { Search, OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Helper to fetch from Wikipedia API
async function fetchWikiObjects(query) {
  // Search for pages
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
  );
  const searchData = await searchRes.json();
  const pages = searchData.query.search.slice(0, 12);

  // Get page details (summary and image) for each result
  const details = await Promise.all(
    pages.map(async (page) => {
      // Get summary and image
      const detailRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`
      );
      const detailData = await detailRes.json();
      return {
        title: detailData.title,
        description: detailData.extract,
        image: detailData.thumbnail?.source || "https://upload.wikimedia.org/wikipedia/commons/6/6e/Astronomy_picture.png",
        pageUrl: detailData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      };
    })
  );
  return details;
}

function UniverseExplorer() {
  const [search, setSearch] = useState('');
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await fetchWikiObjects(search);
      setObjects(results);
    } catch (err) {
      setObjects([]);
        console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontFamily: 'Orbitron',
            mb: 4,
            letterSpacing: 2,
            textShadow: '0 0 24px #818cf8, 0 0 8px #f472b6',
          }}
        >
          Universe Explorer
        </Typography>
        <Typography
          align="center"
          sx={{
            mb: 4,
            color: 'text.secondary',
            fontSize: { xs: 18, md: 22 },
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          Search and discover any celestial object in the universe! Powered by Wikipedia and NASA data.
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search for planets, stars, galaxies, exoplanets, black holes, etc..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 500 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              endAdornment: loading && <CircularProgress size={22} sx={{ mr: 1 }} />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ ml: 2, px: 4, fontWeight: 600, borderRadius: 2 }}
            disabled={loading}
          >
            Search
          </Button>
        </Box>
        <Grid container spacing={5} justifyContent="center">
          {objects.map((obj, i) => (
            <Grid item xs={12} sm={6} md={4} key={obj.title}>
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.12, duration: 0.7, type: 'spring', bounce: 0.25 }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px #818cf8' }}
                style={{ height: '100%' }}
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
                  }}
                  elevation={3}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component={motion.img}
                      src={obj.image}
                      alt={obj.title}
                      sx={{
                        height: 220,
                        objectFit: 'cover',
                        width: '100%',
                        filter: 'brightness(0.95) contrast(1.08)',
                        transition: 'transform 0.4s',
                      }}
                      whileHover={{ scale: 1.07 }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 1 }}>
                      {obj.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: 15 }}>
                      {obj.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<OpenInNew />}
                        href={obj.pageUrl}
                        target="_blank"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 2.5,
                          alignSelf: 'flex-start',
                          boxShadow: '0 2px 8px rgba(129,140,248,0.10)',
                        }}
                      >
                        View on Wikipedia
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 2.5,
                          alignSelf: 'flex-start',
                          boxShadow: '0 2px 8px rgba(129,140,248,0.10)',
                        }}
                        onClick={() => navigate(`/universe-explorer/${encodeURIComponent(obj.title)}`)}
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {searched && !loading && objects.length === 0 && (
          <Typography align="center" sx={{ mt: 6, color: 'text.secondary' }}>
            No results found. Try another search!
          </Typography>
        )}
      </Container>
    </Box>
  );
}

export default UniverseExplorer;