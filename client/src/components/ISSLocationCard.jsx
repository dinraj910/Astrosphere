import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';

function ISSLocationCard() {
  const [iss, setIss] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchISS = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await res.json();
      setIss(data);
    } catch (e) {
      setIss(null);
      console.error('Error fetching ISS location:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ my: 8, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 420, borderRadius: 4, boxShadow: '0 4px 32px rgba(129,140,248,0.10)', p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PublicIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', fontWeight: 700 }}>
              ISS Live Location
            </Typography>
          </Box>
          {loading ? (
            <CircularProgress color="primary" />
          ) : iss && iss.iss_position ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Latitude:</strong> {iss.iss_position.latitude}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Longitude:</strong> {iss.iss_position.longitude}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                href={`https://www.google.com/maps?q=${iss.iss_position.latitude},${iss.iss_position.longitude}`}
                target="_blank"
                rel="noopener"
              >
                View on Map
              </Button>
            </>
          ) : (
            <Typography color="error">Could not fetch ISS location.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ISSLocationCard;