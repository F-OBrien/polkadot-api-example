#!/bin/bash

echo "🧪 Testing Polkadot.js API with Polymesh Example..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 To run the example: npm start"
    echo "📖 Check README.md for detailed information"
else
    echo "❌ Build failed!"
    exit 1
fi
