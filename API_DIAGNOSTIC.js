// API Diagnostic Tool
// Copy and paste this into your browser's console on your deployed frontend

console.log('🔍 ASTROSPHERE API DIAGNOSTIC TOOL');
console.log('================================');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('');

// Test API endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('🌐 Testing API Endpoints from:', API_BASE);
console.log('');

// Test 1: Health Check
console.log('Test 1: Health Check');
fetch(`${API_BASE}/health`)
  .then(res => res.json())
  .then(data => console.log('✅ Health:', data))
  .catch(err => console.error('❌ Health Error:', err));

// Test 2: API Status
console.log('Test 2: API Status');
fetch(`${API_BASE}/api/status`)
  .then(res => res.json())
  .then(data => console.log('✅ API Status:', data))
  .catch(err => console.error('❌ API Status Error:', err));

// Test 3: Cosmic Events
console.log('Test 3: Cosmic Events');
fetch(`${API_BASE}/api/cosmic-events`)
  .then(res => res.json())
  .then(data => console.log('✅ Cosmic Events:', data))
  .catch(err => console.error('❌ Cosmic Events Error:', err));

// Test 4: Satellites
console.log('Test 4: Satellites');
fetch(`${API_BASE}/api/satellites`)
  .then(res => res.json())
  .then(data => console.log('✅ Satellites:', data))
  .catch(err => console.error('❌ Satellites Error:', err));

console.log('');
console.log('📝 Instructions:');
console.log('1. Check if VITE_API_URL shows your correct server URL');
console.log('2. Look for ✅ success or ❌ error messages above');
console.log('3. If you see CORS errors, update SERVER CLIENT_URL');
console.log('4. If you see 404 errors, check API endpoints');
console.log('5. Share the results with your developer');
