#!/bin/bash

# Setup script for PDF Service using html-pdf
# This script prepares the pdf-service for deployment

echo "🚀 Setting up PDF Service (html-pdf implementation)..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the pdf-service directory"
  exit 1
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed"
  exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi

echo "✅ Dependencies installed"

# Verify templates exist
echo ""
echo "🎨 Checking templates..."
if [ ! -d "templates" ] || [ ! -f "templates/page1.html" ]; then
  echo "⚠️  Warning: Templates not found. Copy from puppeteer-ms/templates"
  echo "   Command: cp -r ../puppeteer-ms/templates/* ./templates/"
fi

echo "✅ Templates directory verified"

# Check assets
if [ ! -d "templates/assets" ]; then
  echo "⚠️  Warning: Assets directory not found"
else
  ASSET_COUNT=$(find templates/assets -type f | wc -l)
  echo "✅ Found $ASSET_COUNT asset files"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 To start the service:"
echo "   npm start              # Production"
echo "   npm run dev            # Development with auto-reload"
echo ""
echo "🌐 Service will run on http://localhost:5100"
echo ""
echo "📄 API Endpoint:"
echo "   POST /generate-pdf     # Generate PDF from report data"
echo "   GET /health            # Health check"
echo ""
echo "📚 Documentation: README-HTMLPDF.md"
