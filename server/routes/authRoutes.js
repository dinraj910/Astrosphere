const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Route to register a new user
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;

