#!/bin/bash

# Fix React Duplication Build Error
# This script clears build artifacts and rebuilds the project

echo "🔧 Fixing React duplication build error..."

# 1. Clear all build artifacts
echo "📦 Clearing build artifacts..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vite

# 2. Clear service worker cache (if browser is open, user needs to do this manually)
echo "⚠️  IMPORTANT: You need to manually clear service worker in browser:"
echo "   1. Open DevTools (F12)"
echo "   2. Go to Application tab"
echo "   3. Click 'Service Workers' in left sidebar"
echo "   4. Click 'Unregister' for all service workers"
echo "   5. Click 'Clear site data' button"
echo ""

# 3. Rebuild the project
echo "🔨 Rebuilding project..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Clear your browser cache (Ctrl+Shift+Delete)"
echo "   2. Unregister service workers (see instructions above)"
echo "   3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   4. Test the application"
echo ""

