import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

const facts = [
  "Venus is the hottest planet in our solar system, even hotter than Mercury.",
  "A day on Jupiter is only about 10 hours long.",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "The footprints on the Moon will likely remain for millions of years.",
  "There are more trees on Earth than stars in the Milky Way.",
  "Olympus Mons on Mars is the tallest volcano in the solar system.",
  "The Sun accounts for 99.86% of the mass in the solar system.",
  "A spoonful of a neutron star would weigh about 6 billion tons on Earth."
];

function FunFactCard() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * facts.length));
  const nextFact = () => setIndex((i) => (i + 1) % facts.length);

  return (
    <Box sx={{ my: 10, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 500, borderRadius: 4, boxShadow: '0 4px 32px rgba(129,140,248,0.10)', p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Lightbulb color="warning" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', fontWeight: 700 }}>
              Did You Know?
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {facts[index]}
          </Typography>
          <Button variant="outlined" color="primary" onClick={nextFact}>
            Next Fact
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FunFactCard;