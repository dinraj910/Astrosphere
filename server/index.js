const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const User = require('./models/User'); 
const authRoutes = require('./routes/authRoutes');
const apodRoutes = require('./routes/apodRoutes');

dotenv.config();

// Connect to the database
connectDB()

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));

app.use(express.json());

app.get('/',(req,res)=>{
    res.send('API is running... 🪐🌙✨');
})

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/nasa', apodRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT} 🚀🪐🌙`);
});