# 🌌 Astrosphere

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-5.0+-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Material_UI-7.2.0-007FFF?style=for-the-badge&logo=mui" alt="Material-UI">
  <img src="https://img.shields.io/badge/Express.js-4.21.2-000000?style=for-the-badge&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socket.io" alt="Socket.io">
</div>

<div align="center">
  <h3>🚀 A Hyper-Modern Space Encyclopedia with Interactive UI, Real-Time Data & AI Assistant</h3>
  <p><em>Explore the cosmos through cutting-edge web technology</em></p>
</div>

---

## 🌟 Overview

**Astrosphere** is a comprehensive, next-generation space exploration platform that combines stunning visuals, real-time space data, and AI-powered assistance to create an immersive astronomical learning experience. Built with the MERN stack and enhanced with modern UI frameworks, it offers users an interactive journey through our solar system and beyond.

### ✨ Key Highlights

- **🤖 AI-Powered Astronomy Assistant** - GROQ API integration with specialized space knowledge
- **🛰️ Real-Time Satellite Tracking** - Live ISS tracking with N2YO API integration
- **🪐 Complete Planetary Database** - Comprehensive information on all 8 planets + Sun
- **🌠 Interactive Animations** - Framer Motion powered smooth transitions
- **📱 Fully Responsive Design** - Optimized for all screen sizes
- **🎨 Space-Themed UI** - Dark, cosmic design with gradient animations

---

## 🎯 Features

### 🤖 **AI Chatbot System**
- **GROQ API Integration**: Advanced AI assistant specialized in astronomy
- **Dual Interface**: Floating chat widget + dedicated chat page
- **Smart Responses**: Context-aware answers to space-related questions
- **Error Handling**: Comprehensive fallback systems

### 🪐 **Planet Education System**
- **Complete Database**: All 9 celestial objects (8 planets + Sun)
- **Rich Content**: Formation history, physical properties, missions, galleries
- **Interactive Tabs**: 6 detailed sections per celestial body
  - Overview & Quick Stats
  - Formation & History Timeline
  - Physical Characteristics
  - Space Exploration Missions
  - Image Galleries
  - Fun Facts
- **Responsive Cards**: Beautiful stat cards with animated icons

### 🛰️ **Real-Time Space Data**
- **Satellite Tracking**: Live tracking of ISS and other important satellites
- **Orbital Predictions**: Advanced orbital mechanics calculations
- **N2YO API Integration**: Real-time satellite position data
- **Socket.io**: Live updates for connected clients

### 🌌 **Interactive Experiences**
- **Universe Story**: Interactive timeline of cosmic evolution
- **Universe Explorer**: Comprehensive celestial object catalog
- **Cosmic Events**: Space news and upcoming events
- **Gallery**: Curated space imagery and visualizations
- **APOD Integration**: NASA's Astronomy Picture of the Day

### 🎨 **Modern UI/UX**
- **Material-UI Framework**: Professional component library
- **Framer Motion**: Smooth animations and transitions
- **Dark Space Theme**: Immersive cosmic color scheme
- **Gradient Effects**: Beautiful space-themed gradients
- **Responsive Grid**: Mobile-first design approach

---

## 🛠️ Tech Stack

### **Frontend**
```
• React 19.1.0          • Material-UI 7.2.0
• Framer Motion 12.23.6 • React Router DOM 7.7.0
• Axios 1.10.0          • Socket.io Client 4.8.1
• Three.js 0.178.0      • React Three Fiber 9.2.0
• Leaflet 1.9.4         • React Leaflet 5.0.0
• Vite 7.0.4            • ESLint 9.30.1
```

### **Backend**
```
• Node.js 18+           • Express.js 4.21.2
• MongoDB 5.0+          • Mongoose 8.16.4
• Socket.io 4.8.1       • JWT 9.0.2
• bcryptjs 3.0.2        • CORS 2.8.5
• dotenv 17.2.0         • node-cron 4.2.1
• Axios 1.11.0          • Nodemon 3.1.10
```

### **APIs & Services**
```
• GROQ API              • N2YO Satellite API
• NASA APOD API         • MongoDB Atlas
• Socket.io Server      • JWT Authentication
```

---

## 📁 Project Structure

```
Astrosphere/
├── client/                     # React Frontend
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/         # Reusable Components
│   │   │   ├── CosmicBackground.jsx
│   │   │   ├── FeaturedContent.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   └── PlanetsSection.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Page Components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PlanetDetails.jsx
│   │   │   ├── ChatbotPage.jsx
│   │   │   ├── SatelliteTracker.jsx
│   │   │   ├── UniverseStory.jsx
│   │   │   ├── UniverseExplorer.jsx
│   │   │   ├── Gallery.jsx
│   │   │   └── CosmicEvents.jsx
│   │   ├── styles/            # Theme Configuration
│   │   │   └── theme.js
│   │   ├── App.jsx           # Main App Component
│   │   └── main.jsx          # Entry Point
│   ├── package.json          # Frontend Dependencies
│   ├── vite.config.js        # Vite Configuration
│   └── eslint.config.js      # ESLint Configuration
├── server/                    # Express Backend
│   ├── config/               # Database Configuration
│   │   └── db.js
│   ├── controllers/          # Route Controllers
│   │   └── authController.js
│   ├── models/               # MongoDB Models
│   │   └── User.js
│   ├── routes/               # API Routes
│   │   └── authRoutes.js
│   ├── index.js             # Server Entry Point
│   ├── package.json         # Backend Dependencies
│   └── .env                 # Environment Variables
├── package.json             # Root Package Configuration
└── README.md               # Project Documentation
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- GROQ API key
- N2YO API key

### **1. Clone Repository**
```bash
git clone https://github.com/dinraj910/Astrosphere.git
cd Astrosphere
```

### **2. Backend Setup**
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/astrosphere
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
N2YO_API_KEY=your_n2yo_api_key_here
CORS_ORIGIN=http://localhost:5173
```

### **3. Frontend Setup**
```bash
cd ../client
npm install
```

### **4. Start Development**

**Backend Server:**
```bash
cd server
npm run dev
```

**Frontend Development Server:**
```bash
cd client
npm run dev
```

### **5. Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🌐 API Endpoints

### **Authentication**
```
POST /api/auth/register    # User Registration
POST /api/auth/login       # User Login
GET  /api/auth/profile     # Get User Profile
```

### **Chatbot**
```
POST /api/chat            # AI Chat with GROQ API
```

### **Satellite Tracking**
```
GET  /api/satellites/iss           # ISS Position
GET  /api/satellites/positions     # Multiple Satellite Positions
GET  /api/satellites/predictions   # Orbital Predictions
```

### **Space Data**
```
GET  /api/apod            # NASA Astronomy Picture of the Day
GET  /api/cosmic-events   # Upcoming Space Events
```

---

## 📱 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with APOD and planet navigation |
| `/login` | Login | User authentication |
| `/register` | Register | User registration |
| `/planets/:planetName` | PlanetDetails | Comprehensive planet information |
| `/chatbot` | ChatbotPage | Full-screen AI chat interface |
| `/satellites` | SatelliteTracker | Real-time satellite tracking |
| `/universe-story` | UniverseStory | Interactive cosmic timeline |
| `/universe-explorer` | UniverseExplorer | Celestial object catalog |
| `/gallery` | Gallery | Space imagery collection |
| `/events` | CosmicEvents | Space news and events |

---

## 🎨 UI Components

### **Core Components**
- **Navbar**: Responsive navigation with space theme
- **Chatbot**: Floating AI assistant widget
- **CosmicBackground**: Animated starfield background
- **PlanetsSection**: Interactive planet grid
- **FeaturedContent**: Highlighted space content

### **Page-Specific Components**
- **StatCard**: Animated planet statistics cards
- **TimelineEvent**: Historical space events
- **SatelliteCard**: Real-time satellite information
- **APODCard**: NASA picture of the day display

---

## 🛰️ Real-Time Features

### **Satellite Tracking System**
- **Live ISS Tracking**: Real-time International Space Station position
- **Multiple Satellites**: Track Hubble, GPS, and scientific satellites
- **Orbital Predictions**: Advanced orbital mechanics calculations
- **Socket.io Integration**: Live updates for connected clients

### **AI Chatbot System**
- **GROQ API**: Advanced language model for astronomy questions
- **Context Awareness**: Maintains conversation context
- **Error Handling**: Graceful fallbacks for API issues
- **Response Streaming**: Real-time message delivery

---

## 🎯 Key Features Deep Dive

### **🪐 Planet Details System**
Each planet page includes:
- **Overview Tab**: Basic statistics with animated icons
- **Formation & History**: Timeline of discovery and exploration
- **Physical Properties**: Detailed characteristics list
- **Space Missions**: Comprehensive mission history
- **Image Gallery**: High-quality space imagery
- **Fun Facts**: Engaging trivia and comparisons

### **🤖 AI Assistant Capabilities**
- Answers astronomy and space exploration questions
- Provides information about planets, stars, and galaxies
- Explains space missions and discoveries
- Discusses cosmic phenomena and events
- Maintains conversation context
- Filters non-space related queries

### **🛰️ Satellite Tracking Features**
- Real-time position updates
- Orbital prediction calculations
- Visual tracking maps
- Historical orbit data
- Multiple satellite support
- API rate limiting and caching

---

## 🔧 Configuration

### **Environment Variables**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/astrosphere

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# External APIs
GROQ_API_KEY=your_groq_api_key
N2YO_API_KEY=your_n2yo_api_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

### **Theme Customization**
The space theme can be customized in `client/src/styles/theme.js`:
```javascript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4c63d2' },
    secondary: { main: '#7c3aed' },
    background: {
      default: '#0f172a',
      paper: '#1e293b'
    }
  }
});
```

---

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```bash
cd client
npm run build
```

### **Backend (Railway/Heroku)**
```bash
cd server
npm start
```

### **Database (MongoDB Atlas)**
- Create cluster on MongoDB Atlas
- Update `MONGODB_URI` in environment variables
- Configure network access and database user

---

## 🧪 Testing

### **Frontend Testing**
```bash
cd client
npm run lint          # ESLint check
npm run build         # Build verification
```

### **Backend Testing**
```bash
cd server
npm test              # Run test suite
```

---

## 📈 Performance Optimizations

### **Frontend Optimizations**
- **Code Splitting**: Dynamic imports for pages
- **Image Optimization**: Compressed space imagery
- **Lazy Loading**: Components load on demand
- **Caching**: API responses cached locally

### **Backend Optimizations**
- **Rate Limiting**: API call management
- **Caching**: Satellite data caching
- **Connection Pooling**: MongoDB optimization
- **Compression**: Response compression

---

## 🤝 Contributing

We welcome contributions to make Astrosphere even better!

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### **Contribution Guidelines**
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure responsive design
- Test across different browsers

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### **APIs & Services**
- [GROQ](https://groq.com/) - AI language model API
- [N2YO](https://www.n2yo.com/) - Satellite tracking API
- [NASA APOD](https://apod.nasa.gov/apod/astropix.html) - Astronomy Picture of the Day
- [NASA](https://www.nasa.gov/) - Space imagery and data

### **Technologies**
- [React](https://reactjs.org/) - Frontend framework
- [Material-UI](https://mui.com/) - UI component library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Three.js](https://threejs.org/) - 3D graphics library
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Backend framework

---

## 📞 Support & Contact

### **Repository**
- **GitHub**: [https://github.com/dinraj910/Astrosphere](https://github.com/dinraj910/Astrosphere)
- **Issues**: [Report bugs or request features](https://github.com/dinraj910/Astrosphere/issues)

### **Documentation**
- **Wiki**: Detailed documentation and guides
- **API Docs**: Complete API reference
- **Contributing**: Development guidelines

---

<div align="center">
  <h3>🌌 Explore the Universe with Astrosphere 🚀</h3>
  <p><em>Where technology meets the cosmos</em></p>
  
  **[🚀 Live Demo](https://your-deployed-app.com)** | **[📖 Documentation](https://github.com/dinraj910/Astrosphere/wiki)** | **[🐛 Report Bug](https://github.com/dinraj910/Astrosphere/issues)**

  ---
  
  Made with ❤️ for space enthusiasts everywhere
  
  ⭐ **Star this repo if you found it helpful!** ⭐
</div>