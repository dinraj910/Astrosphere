#!/bin/bash
set -e

echo "🚀 Starting Astrosphere Client Build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check if vite is available
echo "🔍 Checking Vite installation..."
npx vite --version

# Build the project
echo "🏗️ Building project..."
npx vite build

echo "✅ Build completed successfully!"
ls -la dist/
