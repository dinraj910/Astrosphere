import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container,
  Typography,
  Paper,
  TextField, 
  IconButton,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Fade,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { 
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  AutoAwesome as StarIcon,
  Rocket as RocketIcon,
  Public as PlanetIcon,
  Visibility as TelescopeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { apiConfig } from '../config/api';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to Cosmic Companion! 🌌 I\'m AstroBot, your personal astronomy assistant. I can help you explore the mysteries of the universe, from the tiniest particles to the largest galaxies. What cosmic question can I answer for you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(apiConfig.endpoints.chat, { 
        messages: [...messages, userMessage] 
      });
      
      if (response.data && response.data.choices && response.data.choices[0]) {
        const aiMessage = response.data.choices[0].message;
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please check your connection and try again! 🛰️' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { text: "What's happening in space today?", icon: <StarIcon /> },
    { text: "Tell me about Mars exploration", icon: <RocketIcon /> },
    { text: "How do black holes form?", icon: <PlanetIcon /> },
    { text: "What can we see with telescopes?", icon: <TelescopeIcon /> },
    { text: "Explain the Big Bang theory", icon: <StarIcon /> }
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        pt: { xs: 8, sm: 10, md: 12 },
        pb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2 }
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5, md: 6 } }}>
              <Avatar
                sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                  margin: '0 auto',
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  boxShadow: '0 0 30px rgba(76, 99, 210, 0.5)',
                }}
              >
                <BotIcon sx={{ fontSize: { xs: '30px', sm: '35px', md: '40px' } }} />
              </Avatar>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'Orbitron',
                  background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Cosmic Companion
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#94a3b8',
                  maxWidth: { xs: '100%', sm: 500, md: 600 },
                  mx: 'auto',
                  mb: { xs: 3, sm: 3.5, md: 4 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  px: { xs: 2, sm: 0 }
                }}
              >
                Your AI-powered astronomy assistant ready to explore the universe with you
              </Typography>
            </Box>
          </motion.div>

          {/* Quick Questions Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: { xs: 3, sm: 4, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  mb: 2,
                  textAlign: 'center',
                  fontFamily: 'Orbitron',
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }
                }}
              >
                Popular Questions
              </Typography>
              <Grid container spacing={{ xs: 1.5, sm: 2 }} justifyContent="center">
                {quickQuestions.map((question, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card
                      sx={{
                        background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                        border: '1px solid rgba(76, 99, 210, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        minHeight: { xs: '80px', sm: '90px' },
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(76, 99, 210, 0.3)',
                          border: '1px solid rgba(76, 99, 210, 0.5)',
                        }
                      }}
                      onClick={() => handleQuickQuestion(question.text)}
                    >
                      <CardContent sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ color: '#4c63d2', mb: 1 }}>
                          {question.icon}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'white',
                            fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            lineHeight: 1.4
                          }}
                        >
                          {question.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>

          {/* Chat Interface */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={24}
              sx={{
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: { xs: 2, sm: 3, md: 4 },
                overflow: 'hidden',
                height: { xs: '75vh', sm: '70vh', md: '600px' },
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(76, 99, 210, 0.2)',
                width: '100%',
                maxWidth: '100%',
                marginBottom: { xs: 5, sm: 5, md: 4 }
              }}
            >
              {/* Chat Header */}
              <Box sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 },
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                position: 'relative',
                flexShrink: 0,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #4c63d2, #6366f1, #7c3aed)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                  <Avatar
                    sx={{
                      width: { xs: 40, sm: 45, md: 50 },
                      height: { xs: 40, sm: 45, md: 50 },
                      background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                      boxShadow: '0 0 20px rgba(76, 99, 210, 0.4)',
                    }}
                  >
                    <BotIcon sx={{ fontSize: { xs: '20px', sm: '24px', md: '28px' } }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white', 
                        fontFamily: 'Orbitron',
                        fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                      }}
                    >
                      AstroBot
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8',
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.875rem' }
                      }}
                    >
                      {loading ? '🔄 Processing...' : '🟢 Online • AI Astronomy Expert'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ 
                flex: 1, 
                p: { xs: 1.5, sm: 2, md: 3 }, 
                overflowY: 'auto',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                width: '100%',
                '&::-webkit-scrollbar': {
                  width: { xs: '4px', sm: '6px', md: '8px' },
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(148, 163, 184, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(180deg, #4c63d2, #7c3aed)',
                  borderRadius: '4px',
                },
              }}>
                {messages.map((msg, idx) => (
                  <Fade in key={idx} timeout={600} style={{ transitionDelay: `${idx * 100}ms` }}>
                    <Box sx={{ 
                      mb: { xs: 2, sm: 2.5, md: 3 }, 
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      width: '100%'
                    }}>
                      {msg.role === 'assistant' && (
                        <Avatar
                          sx={{
                            width: { xs: 32, sm: 36, md: 40 },
                            height: { xs: 32, sm: 36, md: 40 },
                            background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                            boxShadow: '0 0 15px rgba(76, 99, 210, 0.4)',
                            flexShrink: 0
                          }}
                        >
                          <BotIcon sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' } }} />
                        </Avatar>
                      )}
                      
                      {msg.role === 'user' && (
                        <Avatar
                          sx={{
                            width: { xs: 32, sm: 36, md: 40 },
                            height: { xs: 32, sm: 36, md: 40 },
                            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                            order: 1,
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                            flexShrink: 0
                          }}
                        >
                          <PersonIcon sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' } }} />
                        </Avatar>
                      )}

                      <Paper
                        elevation={msg.role === 'user' ? 6 : 3}
                        sx={{ 
                          p: { xs: 1.5, sm: 2, md: 2.5 },
                          maxWidth: { xs: '85%', sm: '80%', md: '70%' },
                          width: 'fit-content',
                          background: msg.role === 'user' 
                            ? 'linear-gradient(135deg, #4c63d2 0%, #6366f1 100%)'
                            : 'linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(71, 85, 105, 0.8) 100%)',
                          color: 'white',
                          borderRadius: msg.role === 'user' ? '20px 20px 8px 20px' : '20px 20px 20px 8px',
                          boxShadow: msg.role === 'user' 
                            ? '0 8px 32px rgba(76, 99, 210, 0.4)' 
                            : '0 4px 20px rgba(0, 0, 0, 0.3)',
                          border: msg.role === 'assistant' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : 'none',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6,
                            color: 'white',
                            fontWeight: msg.role === 'user' ? 500 : 400,
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {msg.content}
                        </Typography>
                      </Paper>
                    </Box>
                  </Fade>
                ))}
                
                {loading && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    gap: { xs: 1, sm: 1.5, md: 2 }, 
                    mb: { xs: 2, sm: 2.5, md: 3 },
                    width: '100%'
                  }}>
                    <Avatar
                      sx={{
                        width: { xs: 32, sm: 36, md: 40 },
                        height: { xs: 32, sm: 36, md: 40 },
                        background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                        boxShadow: '0 0 15px rgba(76, 99, 210, 0.4)',
                        flexShrink: 0
                      }}
                    >
                      <BotIcon sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' } }} />
                    </Avatar>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: { xs: 1.5, sm: 2, md: 2.5 }, 
                        borderRadius: '20px 20px 20px 8px',
                        background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(71, 85, 105, 0.8) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        backdropFilter: 'blur(10px)',
                        maxWidth: { xs: '85%', sm: '80%', md: '70%' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 } }}>
                        <CircularProgress size={16} sx={{ color: '#4c63d2' }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#94a3b8', 
                            fontStyle: 'italic',
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                          }}
                        >
                          AstroBot is exploring the cosmos for answers...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ 
                p: { xs: 1.5, sm: 2, md: 3 }, 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                display: 'flex', 
                gap: { xs: 1, sm: 1.5, md: 2 },
                alignItems: 'flex-end',
                flexShrink: 0,
                width: '100%'
              }}>
                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about the universe, astronomy, or space exploration..."
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  multiline
                  maxRows={4}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(148, 163, 184, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(76, 99, 210, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4c63d2',
                        borderWidth: '2px',
                      },
                      '& input::placeholder, & textarea::placeholder': {
                        color: '#94a3b8',
                        opacity: 1,
                      }
                    }
                  }}
                />
                <IconButton 
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  sx={{ 
                    background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                    color: 'white',
                    width: { xs: 48, sm: 52, md: 56 },
                    height: { xs: 48, sm: 52, md: 56 },
                    flexShrink: 0,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #4c63d2 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 25px rgba(76, 99, 210, 0.6)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(76, 99, 210, 0.4)',
                  }}
                >
                  <SendIcon sx={{ fontSize: { xs: '20px', sm: '22px', md: '24px' } }} />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ChatbotPage;