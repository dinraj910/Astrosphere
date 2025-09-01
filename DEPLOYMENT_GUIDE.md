# 🚀 Astrosphere Deployment Guide for Render

## 📋 Prerequisites
- MongoDB Atlas account and connection string
- Render account
- GitHub repository (push your code first)

## 🖥️ Step 1: Deploy Server (Backend)

### 1.1 Create Web Service on Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Choose `server` as the root directory

### 1.2 Server Configuration
- **Name**: `astrosphere-server` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free (or paid as needed)

### 1.3 Environment Variables (CRITICAL)
Add these environment variables in Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/astrosphere
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
CLIENT_URL=https://astrosphere.onrender.com
PORT=10000
```

**Important Notes:**
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (use a password generator)
- `PORT` is automatically set by Render but we include it for safety
- `CLIENT_URL` will be your frontend URL (update after client deployment)

### 1.4 MongoDB Atlas Setup
1. In MongoDB Atlas, go to Network Access
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. This allows Render to connect to your database

## 🌐 Step 2: Deploy Client (Frontend)

### 2.1 Create Static Site on Render
1. In Render dashboard, click "New" → "Static Site"
2. Connect the same GitHub repository
3. Choose `client` as the root directory

### 2.2 Client Configuration
- **Name**: `astrosphere` (or your preferred name)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### 2.3 Environment Variables for Client
Add these in Render dashboard:

```
NODE_ENV=production
VITE_API_URL=https://astrosphere-server.onrender.com
VITE_SOCKET_URL=https://astrosphere-server.onrender.com
```

**Important:** Replace `astrosphere-server.onrender.com` with your actual server URL from Step 1.

## 🔄 Step 3: Update Server with Client URL

After client deployment:
1. Go back to your server's environment variables
2. Update `CLIENT_URL` to your actual client URL (e.g., `https://astrosphere.onrender.com`)

## ⚙️ Step 4: Custom Domain (Optional)

### 4.1 For Client (Frontend)
1. In client settings, go to "Custom Domains"
2. Add your domain (e.g., `astrosphere.com`)
3. Follow DNS configuration instructions

### 4.2 For Server (Backend)  
1. In server settings, go to "Custom Domains"
2. Add your API domain (e.g., `api.astrosphere.com`)
3. Update client environment variable `VITE_API_URL`

## 🔍 Step 5: Verification & Testing

### 5.1 Server Health Check
Visit: `https://your-server-url.onrender.com/health`
Should return: `{"status":"OK","timestamp":"...","uptime":...}`

### 5.2 API Status Check
Visit: `https://your-server-url.onrender.com/api/status`
Should return API information and endpoints

### 5.3 Client Testing
1. Visit your client URL
2. Test all features:
   - Registration/Login
   - Satellite Tracker
   - Cosmic Events
   - Gallery
   - Chatbot

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure `CLIENT_URL` is set correctly in server environment
   - Check that both HTTP and HTTPS URLs are handled

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Ensure IP whitelist includes `0.0.0.0/0`
   - Check username/password in connection string

3. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

4. **API Not Working**
   - Check server logs for errors
   - Verify environment variables are set
   - Test API endpoints directly

### Deployment Commands (for reference):
```bash
# Server
npm install
npm start

# Client  
npm install
npm run build
```

## 📊 Monitoring

### Server Logs
- Go to your web service in Render
- Click on "Logs" tab to see real-time logs
- Monitor for errors and performance issues

### Performance Tips
- Use Render's paid tiers for better performance
- Monitor resource usage
- Consider CDN for client assets

## 🔄 Continuous Deployment

Render automatically deploys when you push to your connected GitHub branch:
1. Make changes to your code
2. Commit and push to GitHub
3. Render automatically rebuilds and deploys
4. Check deployment status in dashboard

## 🛡️ Security Checklist

- ✅ Strong JWT secret (32+ characters)
- ✅ MongoDB Atlas IP restrictions properly configured
- ✅ Environment variables properly set
- ✅ CORS configured for production domains
- ✅ No sensitive data in client-side code
- ✅ API endpoints properly secured

## 📝 Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-site-name.onrender.com`
- **Backend**: `https://your-server-name.onrender.com`
- **API**: `https://your-server-name.onrender.com/api`

**Remember to update these URLs in your documentation and any external references!**

---

🎉 **Congratulations!** Your Astrosphere website is now live and accessible worldwide! 🌌🚀
