import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Grid, Link as MuiLink } from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { apiConfig } from '../config/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(apiConfig.endpoints.auth.login, {
        email,
        password,
      });
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{
        minHeight: 'calc(100vh - 64px)', // Full height minus navbar
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
    }}>
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center',marginLeft:'500px' }}>
        <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            elevation={6}
            sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 4,
            background: 'rgba(26, 26, 61, 0.7)',
            backdropFilter: 'blur(10px)',
            }}
        >
            <Typography component="h1" variant="h5" sx={{ fontFamily: 'Orbitron' }}>
            Sign In
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
                </Typography>
            )}
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, textDecoration: 'none' ,fontFamily: 'Orbitron', fontSize: '16px' }} >
                Sign In
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                <MuiLink component={Link} to="/register" variant="body2" sx={{ color: 'white', textDecoration: 'none' ,fontFamily: 'Orbitron', fontSize: '16px',marginRight:'22px'}}>
                    {"Don't have an account? Sign Up"}
                </MuiLink>
                </Grid>
            </Grid>
            </Box>
        </Paper>
        </Container>
    </Box>
  );
}

export default LoginPage;
