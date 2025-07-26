import React from 'react';
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
              maxHeight: 420,
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

export default APODCard;