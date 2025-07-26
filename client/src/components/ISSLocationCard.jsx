import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';

// Custom satellite icon
const satelliteIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042820.png', // Place your image in public/satellite.png
  iconSize: [30, 30],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
});

function ISSMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return (
    <Marker position={position} icon={satelliteIcon}>
      <Popup>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          ISS Current Location
        </Typography>
        <Typography variant="body2">
          Lat: {position[0].toFixed(2)}, Lon: {position[1].toFixed(2)}
        </Typography>
      </Popup>
    </Marker>
  );
}

function ISSLocationCard() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    let interval;
    const fetchISS = async () => {
      try {
        const res = await fetch('http://api.open-notify.org/iss-now.json');
        const data = await res.json();
        setPosition([
          parseFloat(data.iss_position.latitude),
          parseFloat(data.iss_position.longitude),
        ]);
      } catch (e) {
        setPosition(null);
        console.error('Error fetching ISS location:', e); 
      }
    };
    fetchISS();
    interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 32px rgba(129,140,248,0.10)', p: 2 }}>
      <CardContent>
        <Typography variant="h5" align="center" sx={{ mb: 2, fontFamily: 'Orbitron', fontWeight: 700 }}>
          ISS Live Location
        </Typography>
        {position ? (
          <MapContainer
            center={position}
            zoom={2}
            scrollWheelZoom={true}
            style={{ height: 300, width: '100%', borderRadius: 12 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <ISSMarker position={position} />
          </MapContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ISSLocationCard;