/*import React from 'react';
import { Card, CardMedia, Box, Typography, Button, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { OpenInNew } from '@mui/icons-material';

function APODCard({ apod, loading }) {
  return (
    <Box sx={{ my: 10 }}>
      <Typography
        variant="h2"
        align="center"
        gutterBottom
        sx={{ mb: 5, fontWeight: 700, letterSpacing: 1, fontFamily: 'Orbitron' }}
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Astronomy Picture of the Day
      </Typography>
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow: '0 8px 40px 0 rgba(129,140,248,0.18)',
          background: 'linear-gradient(120deg, rgba(26,26,61,0.7) 60%, rgba(12,10,24,0.9) 100%)',
        }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={350} />
        ) : (
          <CardMedia
            component="img"
            image={apod?.url}
            alt={apod?.title}
            sx={{
              width: { xs: '100%', md: '55%' },
              objectFit: 'cover',
              aspectRatio: '16/10',
              minHeight: 320,
              maxHeight: 470,
              filter: 'brightness(0.95) contrast(1.08)',
              transition: 'transform 0.4s',
              '&:hover': { transform: 'scale(1.03)' },
            }}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 3, md: 5 },
            flex: 1,
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {loading ? (
            <>
              <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
              <Skeleton width="30%" height={20} sx={{ mb: 2 }} />
              <Skeleton width="100%" height={120} sx={{ mb: 2 }} />
              <Skeleton width="40%" height={36} />
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontFamily: 'Orbitron', mb: 1 }}>
                {apod?.title}
              </Typography>
              <Chip
                label={new Date(apod?.date).toDateString()}
                color="primary"
                size="small"
                sx={{ mb: 2, fontWeight: 600, letterSpacing: 1 }}
              />
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  maxHeight: { xs: 120, md: 200 },
                  pr: 1,
                  mb: 2,
                  fontSize: 16,
                }}
              >
                {apod?.explanation}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<OpenInNew />}
                href={apod?.hdurl || apod?.url}
                target="_blank"
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  boxShadow: '0 2px 8px rgba(129,140,248,0.10)',
                }}
              >
                View High-Res
              </Button>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default APODCard;*/

import React from 'react';
import { Card, CardMedia, Box, Typography, Button, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { OpenInNew } from '@mui/icons-material';

function APODCard({ apod, loading }) {
  // Helper to render media
  const renderMedia = () => {
    if (!apod) return null;
    if (apod.media_type === "image") {
      return (
        <CardMedia
          component="img"
          image={apod.url}
          alt={apod.title}
          sx={{
            width: { xs: '100%', md: '55%' },
            objectFit: 'cover',
            aspectRatio: '16/10',
            minHeight: 320,
            maxHeight: 470,
            filter: 'brightness(0.95) contrast(1.08)',
            transition: 'transform 0.4s',
            '&:hover': { transform: 'scale(1.03)' },
          }}
        />
      );
    }
    if (apod.media_type === "video") {
      const isEmbeddable = apod.url.includes("youtube.com") || apod.url.includes("youtu.be") || apod.url.includes("vimeo.com");
      let embedUrl = apod.url;
      if (apod.url.includes("youtube.com/watch")) {
        const videoId = apod.url.split("v=")[1]?.split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      if (apod.url.includes("youtu.be/")) {
        const videoId = apod.url.split("youtu.be/")[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      if (isEmbeddable) {
        return (
          <Box
            sx={{
              width: { xs: '100%', md: '55%' },
              minHeight: 320,
              maxHeight: 470,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
            }}
          >
            <iframe
              src={embedUrl}
              title={apod.title}
              width="100%"
              height="100%"
              style={{
                border: 0,
                minHeight: 320,
                maxHeight: 470,
                width: '100%',
                borderRadius: 8,
              }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );
      } else {
        return (
          <Box sx={{ width: { xs: '100%', md: '55%' }, minHeight: 320, maxHeight: 470, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<OpenInNew />}
              href={apod.url}
              target="_blank"
              sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
            >
              Watch Video
            </Button>
          </Box>
        );
      }
    }
    // Handle "other" and unknown media types
    return (
      <Box sx={{ width: { xs: '100%', md: '55%' }, minHeight: 320, maxHeight: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#222', p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          This APOD is interactive or uses a format not supported here.<br />
          <span style={{ fontSize: 12 }}>Type: {apod.media_type || "unknown"}</span>
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<OpenInNew />}
          href={apod.url}
          target="_blank"
          sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
        >
          View on NASA APOD
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ my: 10 }}>
      <Typography
        variant="h2"
        align="center"
        gutterBottom
        sx={{ mb: 5, fontWeight: 700, letterSpacing: 1, fontFamily: 'Orbitron' }}
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Astronomy Picture of the Day
      </Typography>
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow: '0 8px 40px 0 rgba(129,140,248,0.18)',
          background: 'linear-gradient(120deg, rgba(26,26,61,0.7) 60%, rgba(12,10,24,0.9) 100%)',
        }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={350} />
        ) : (
          renderMedia()
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 3, md: 5 },
            flex: 1,
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {loading ? (
            <>
              <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
              <Skeleton width="30%" height={20} sx={{ mb: 2 }} />
              <Skeleton width="100%" height={120} sx={{ mb: 2 }} />
              <Skeleton width="40%" height={36} />
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontFamily: 'Orbitron', mb: 1 }}>
                {apod?.title}
              </Typography>
              <Chip
                label={new Date(apod?.date).toDateString()}
                color="primary"
                size="small"
                sx={{ mb: 2, fontWeight: 600, letterSpacing: 1 }}
              />
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  maxHeight: { xs: 120, md: 200 },
                  pr: 1,
                  mb: 2,
                  fontSize: 16,
                }}
              >
                {apod?.explanation}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<OpenInNew />}
                href={apod?.hdurl || apod?.url}
                target="_blank"
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  boxShadow: '0 2px 8px rgba(129,140,248,0.10)',
                }}
              >
                View High-Res
              </Button>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default APODCard;