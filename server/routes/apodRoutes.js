//qQsJqXKNsGAxJMpJeh5VOZnOh1HGkYZzts4JvuKp
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/apod', async (req, res) => {
  const { date } = req.query;
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}${date ? `&date=${date}` : ''}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch APOD' });
  }
});

module.exports = router;