#!/bin/bash
echo "StepPal Backend Setup"
echo "===================="
echo ""
echo "Choose MongoDB setup:"
echo "1. Use MongoDB Atlas (Cloud - Recommended)"
echo "2. Install MongoDB locally (macOS)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "MongoDB Atlas Setup:"
    echo "1. Go to https://www.mongodb.com/cloud/atlas/register"
    echo "2. Create a free cluster"
    echo "3. Get your connection string"
    echo "4. Update MONGODB_URI in backend/.env"
    echo ""
    read -p "Enter your MongoDB Atlas connection string: " mongo_uri
    if [ ! -z "$mongo_uri" ]; then
        sed -i '' "s|MONGODB_URI=.*|MONGODB_URI=$mongo_uri|" .env
        echo "✅ Updated .env file"
    fi
elif [ "$choice" = "2" ]; then
    echo ""
    echo "Installing MongoDB locally..."
    if command -v brew &> /dev/null; then
        brew tap mongodb/brew
        brew install mongodb-community
        brew services start mongodb-community
        echo "✅ MongoDB installed and started"
    else
        echo "❌ Homebrew not found. Install Homebrew first: https://brew.sh"
    fi
fi

echo ""
echo "Starting backend server..."
npm run dev
