Astrosphere
A hyper-modern space encyclopedia with interactive UI, high-quality images, and real-time space data.
Setup Instructions
Prerequisites

Node.js (v18 or higher)
MongoDB Atlas account
NASA API key (api.nasa.gov)

Frontend Setup

Navigate to /client:cd client
npm install


Start the development server:npm run dev



Backend Setup

Navigate to /server:cd server
npm install


Create a .env file in /server:MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/AstrosphereDB
NASA_API_KEY=your_nasa_api_key
PORT=5000


Start the server:node server.js



Deployment

Frontend: Vercel
Backend: Render
Database: MongoDB Atlas
