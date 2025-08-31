import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, Alert } from '@mui/material';

// Enhanced ISS satellite icon with pulsing animation
const createISSIcon = () => {
  return new L.DivIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <div style="
          width: 32px;
          height: 32px;
          background: #ff1744;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 20px #ff1744aa, inset 0 0 10px rgba(255,255,255,0.3);
          animation: iss-pulse 2s infinite;
          position: relative;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 64px;
          height: 64px;
          border: 2px solid #ff174444;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: iss-ring 3s infinite;
        "></div>
      </div>
      <style>
        @keyframes iss-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes iss-ring {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      </style>
    `,
    className: 'iss-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

function ISSMarker({ position, issData }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      // Smoothly move map to ISS position without jarring jumps
      map.setView(position, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker position={position} icon={createISSIcon()}>
      <Popup>
        <Box sx={{ minWidth: 220 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            mb: 1, 
            color: '#ff1744',
            fontFamily: 'Orbitron'
          }}>
            🛰️ International Space Station
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1.5, fontFamily: 'monospace' }}>
            <strong>Position:</strong><br />
            Lat: {position[0].toFixed(6)}°<br />
            Lon: {position[1].toFixed(6)}°
          </Typography>
          
          {issData?.altitude && (
            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
              <strong>Altitude:</strong> {Math.round(issData.altitude)} km
            </Typography>
          )}
          
          {issData?.velocity && (
            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
              <strong>Velocity:</strong> {issData.velocity.toFixed(2)} km/h
            </Typography>
          )}
          
          {issData?.timestamp && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Updated: {new Date(issData.timestamp * 1000).toLocaleTimeString()}
            </Typography>
          )}
          
          <Chip 
            label="LIVE TRACKING" 
            color="error" 
            size="small"
            sx={{ 
              fontWeight: 600,
              fontFamily: 'monospace',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 }
              }
            }}
          />
        </Box>
      </Popup>
    </Marker>
  );
}

function ISSLocationCard() {
  const [position, setPosition] = useState(null);
  const [issData, setIssData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const updateIntervalRef = useRef();

  useEffect(() => {
    // Multiple reliable ISS APIs for fallback
    const fetchFromWhereTheISS = async () => {
      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const data = await response.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        velocity: data.velocity,
        timestamp: data.timestamp,
        source: 'wheretheiss.at'
      };
    };

    const fetchFromOpenNotify = async () => {
      const response = await fetch('https://api.open-notify.org/iss-now.json');
      const data = await response.json();
      return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        altitude: 408, // Average ISS altitude
        velocity: 27600, // Average ISS velocity
        timestamp: data.timestamp,
        source: 'open-notify.org'
      };
    };

    const fetchISSData = async () => {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          let data;
          
          if (attempts === 0) {
            // Try the more accurate API first
            data = await fetchFromWhereTheISS();
          } else {
            // Fallback to the second API
            data = await fetchFromOpenNotify();
          }

          // Validate data
          if (data.latitude && data.longitude && 
              data.latitude >= -90 && data.latitude <= 90 && 
              data.longitude >= -180 && data.longitude <= 180) {
            
            setPosition([data.latitude, data.longitude]);
            setIssData(data);
            setConnectionStatus('connected');
            setError(null);
            
            console.log(`✅ ISS data fetched from ${data.source}:`, {
              lat: data.latitude.toFixed(6),
              lon: data.longitude.toFixed(6),
              alt: data.altitude,
              vel: data.velocity
            });
            
            return; // Success, exit the retry loop
          }
          
          throw new Error('Invalid ISS position data received');
          
        } catch (err) {
          attempts++;
          console.warn(`⚠️ ISS API attempt ${attempts} failed:`, err.message);
          
          if (attempts >= maxAttempts) {
            setConnectionStatus('error');
            setError(`Failed to fetch ISS data after ${maxAttempts} attempts`);
            console.error('❌ All ISS APIs failed');
          } else {
            // Wait a bit before next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };
    
    // Initial fetch
    fetchISSData();
    
    // Set up regular updates every 10 seconds (reasonable for ISS tracking)
    updateIntervalRef.current = setInterval(() => {
      fetchISSData();
    }, 10000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return issData?.source ? `LIVE - ${issData.source.toUpperCase()}` : 'LIVE DATA';
      case 'error': return 'CONNECTION ERROR';
      default: return 'CONNECTING...';
    }
  };

  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 4px 32px rgba(255, 23, 68, 0.15)', 
      p: 2,
      background: 'linear-gradient(135deg, rgba(255, 23, 68, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)',
      border: '1px solid rgba(255, 23, 68, 0.2)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ 
            fontFamily: 'Orbitron', 
            fontWeight: 700, 
            color: '#ff1744'
          }}>
            🛰️ ISS Live Tracker
          </Typography>
          <Chip 
            label={getStatusText()}
            color={getStatusColor()}
            size="small"
            sx={{ 
              fontWeight: 600,
              fontFamily: 'monospace',
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {connectionStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            <strong>Connection Error:</strong> {error || 'Unable to fetch ISS data from any source.'}
            <br />
            <Typography variant="body2" sx={{ mt: 1 }}>
              This may be due to network issues or API outages. The tracker will keep trying to reconnect.
            </Typography>
          </Alert>
        )}

        {position ? (
          <Box>
            <MapContainer
              center={position}
              zoom={3}
              scrollWheelZoom={true}
              style={{ 
                height: 380, 
                width: '100%', 
                borderRadius: 12,
                border: '2px solid rgba(255, 23, 68, 0.3)'
              }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri World Imagery"
              />
              <ISSMarker position={position} issData={issData} />
            </MapContainer>
            
            {/* Enhanced ISS Info Panel */}
            <Box sx={{ 
              mt: 2, 
              p: 2.5, 
              bgcolor: 'rgba(255, 23, 68, 0.1)', 
              borderRadius: 3,
              border: '1px solid rgba(255, 23, 68, 0.2)'
            }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Orbitron',
                color: '#ff1744',
                mb: 1.5,
                fontWeight: 600
              }}>
                🌍 Current Status
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 2 
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                    <strong>Coordinates:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00bcd4' }}>
                    {position[0].toFixed(6)}°N, {position[1].toFixed(6)}°E
                  </Typography>
                </Box>
                
                {issData?.altitude && (
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                      <strong>Altitude:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#4caf50' }}>
                      {Math.round(issData.altitude)} km above Earth
                    </Typography>
                  </Box>
                )}
                
                {issData?.velocity && (
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                      <strong>Velocity:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#ff9800' }}>
                      {issData.velocity.toFixed(0)} km/h
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                    <strong>Last Update:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#9c27b0' }}>
                    {issData?.timestamp ? 
                      new Date(issData.timestamp * 1000).toLocaleTimeString() : 
                      'Just now'
                    }
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block', 
                mt: 1.5, 
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                The ISS orbits Earth approximately every 90 minutes at an average altitude of 408 km
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 380,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 3,
            border: '2px dashed rgba(255, 23, 68, 0.3)'
          }}>
            <CircularProgress color="error" size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ 
              fontFamily: 'Orbitron', 
              color: '#ff1744',
              mb: 1
            }}>
              Acquiring ISS Position...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              textAlign: 'center',
              maxWidth: 300
            }}>
              Connecting to satellite tracking networks to get real-time ISS location data
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ISSLocationCard;