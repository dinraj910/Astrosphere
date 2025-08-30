import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Paper, 
  TextField, 
  Typography, 
  CircularProgress,
  Fade,
  Grow,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Send as SendIcon, 
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Minimize as MinimizeIcon
} from '@mui/icons-material';
import axios from 'axios';
import '../styles/chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m AstroBot 🚀 Your personal astronomy assistant. Ask me anything about space, planets, stars, galaxies, or cosmic events!'
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { 
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
    "What's happening in space today?",
    "Tell me about Mars",
    "How do telescopes work?",
    "What are black holes?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <>
      {/* Chat Toggle Button - Space themed */}
      <Grow in timeout={1000}>
        <Box
          className="chatbot-toggle-button"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1001,
          }}
        >
          <IconButton
            onClick={toggleChat}
            sx={{
              background: 'linear-gradient(135deg, #4c63d2 0%, #6366f1 50%, #7c3aed 100%)',
              color: 'white',
              width: 64,
              height: 64,
              boxShadow: '0 8px 32px rgba(76, 99, 210, 0.5), 0 0 20px rgba(76, 99, 210, 0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 12px 40px rgba(76, 99, 210, 0.7), 0 0 30px rgba(76, 99, 210, 0.5)',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4c63d2 100%)',
              },
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                background: 'linear-gradient(45deg, #4c63d2, #6366f1, #7c3aed, #4c63d2)',
                borderRadius: '50%',
                zIndex: -1,
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 0.7,
              }
            }}
          >
            {isOpen ? <CloseIcon fontSize="large" /> : <BotIcon fontSize="large" />}
          </IconButton>
          
          {/* AI Badge */}
          {!isOpen && (
            <Box
              className="chatbot-ai-badge"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.9)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.15)', opacity: 0.8 },
                  '100%': { transform: 'scale(1)', opacity: 1 },
                }
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                AI
              </Typography>
            </Box>
          )}
        </Box>
      </Grow>

      {/* Chat Window - Dark Space Theme */}
      <Fade in={isOpen} timeout={400}>
        <Paper
          elevation={24}
          className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}
          sx={{
            position: 'fixed',
            bottom: isMinimized ? 24 : 100,
            right: 24,
            width: isMinimized ? 320 : 380,
            height: 460,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1000,
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(76, 99, 210, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        >
          {/* Chat Header - Dark Theme */}
          <Box className="chatbot-header" sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #4c63d2, #6366f1, #7c3aed)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 0 15px rgba(76, 99, 210, 0.4)',
                }}
              >
                <BotIcon sx={{ fontSize: '20px' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>
                  AstroBot
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  {loading ? 'Analyzing...' : '🟢 Online • AI Assistant'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                color="inherit" 
                onClick={toggleMinimize}
                size="small"
                sx={{ 
                  color: '#94a3b8',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton 
                color="inherit" 
                onClick={toggleChat}
                size="small"
                sx={{ 
                  color: '#94a3b8',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {!isMinimized && (
            <>
              {/* Quick Questions - Dark Theme */}
              <Box className="chatbot-quick-questions" sx={{ p: 1.5, bgcolor: 'rgba(51, 65, 85, 0.5)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', mb: 1, display: 'block', fontSize: '0.7rem' }}>
                  Quick questions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {quickQuestions.map((question, index) => (
                    <Chip
                      key={index}
                      label={question}
                      size="small"
                      onClick={() => handleQuickQuestion(question)}
                      sx={{
                        background: 'linear-gradient(45deg, rgba(76, 99, 210, 0.2), rgba(124, 58, 237, 0.2))',
                        border: '1px solid rgba(76, 99, 210, 0.3)',
                        color: '#e2e8f0',
                        fontSize: '0.65rem',
                        height: 22,
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(76, 99, 210, 0.4), rgba(124, 58, 237, 0.4))',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(76, 99, 210, 0.3)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Messages Area - Dark Theme */}
              <Box className="chatbot-messages" sx={{ 
                flex: 1, 
                p: 1.5, 
                overflowY: 'auto', 
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(148, 163, 184, 0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(180deg, #4c63d2, #7c3aed)',
                  borderRadius: '3px',
                },
              }}>
                {messages.map((msg, idx) => (
                  <Fade in key={idx} timeout={600} style={{ transitionDelay: `${idx * 100}ms` }}>
                    <Box className="chatbot-message-container" sx={{ 
                      mb: 2, 
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      gap: 1
                    }}>
                      {msg.role === 'assistant' && (
                        <Avatar
                          className="chatbot-message-avatar"
                          sx={{
                            width: 28,
                            height: 28,
                            background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                            fontSize: '0.8rem',
                            boxShadow: '0 0 10px rgba(76, 99, 210, 0.3)',
                          }}
                        >
                          <BotIcon sx={{ fontSize: '16px' }} />
                        </Avatar>
                      )}
                      
                      {msg.role === 'user' && (
                        <Avatar
                          className="chatbot-message-avatar"
                          sx={{
                            width: 28,
                            height: 28,
                            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                            fontSize: '0.8rem',
                            order: 1,
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <PersonIcon sx={{ fontSize: '16px' }} />
                        </Avatar>
                      )}

                      <Paper
                        elevation={msg.role === 'user' ? 4 : 2}
                        className={`chatbot-message-paper ${msg.role === 'user' ? 'user' : ''}`}
                        sx={{ 
                          p: 1.5,
                          maxWidth: '75%',
                          background: msg.role === 'user' 
                            ? 'linear-gradient(135deg, #4c63d2 0%, #6366f1 100%)'
                            : 'linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(71, 85, 105, 0.8) 100%)',
                          color: 'white',
                          borderRadius: msg.role === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                          boxShadow: msg.role === 'user' 
                            ? '0 4px 20px rgba(76, 99, 210, 0.3)' 
                            : '0 2px 10px rgba(0, 0, 0, 0.3)',
                          border: msg.role === 'assistant' 
                            ? '1px solid rgba(148, 163, 184, 0.2)' 
                            : 'none',
                          position: 'relative',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          className="chatbot-message-text"
                          sx={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.5,
                            fontSize: '0.85rem',
                            color: 'white',
                            fontWeight: msg.role === 'user' ? 500 : 400
                          }}
                        >
                          {msg.content}
                        </Typography>
                      </Paper>
                    </Box>
                  </Fade>
                ))}
                
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar
                      className="chatbot-message-avatar"
                      sx={{
                        width: 28,
                        height: 28,
                        background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                        boxShadow: '0 0 10px rgba(76, 99, 210, 0.3)',
                      }}
                    >
                      <BotIcon sx={{ fontSize: '16px' }} />
                    </Avatar>
                    <Paper 
                      elevation={2} 
                      className="chatbot-loading-paper"
                      sx={{ 
                        p: 1.5, 
                        borderRadius: '18px 18px 18px 6px',
                        background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(71, 85, 105, 0.8) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress className="chatbot-loading-spinner" size={14} sx={{ color: '#4c63d2' }} />
                        <Typography variant="body2" className="chatbot-loading-text" sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          AstroBot is thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area - Dark Theme */}
              <Box className="chatbot-input-area" sx={{ 
                p: 1.5, 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                display: 'flex', 
                gap: 1,
                alignItems: 'flex-end'
              }}>
                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about astronomy, space, or cosmic events..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  multiline
                  maxRows={3}
                  className="chatbot-input"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      fontSize: '0.85rem',
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
                  className="chatbot-send-button"
                  sx={{ 
                    background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #4c63d2 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 20px rgba(76, 99, 210, 0.5)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(76, 99, 210, 0.3)',
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      </Fade>
    </>
  );
};

export default Chatbot;