#!/bin/bash

echo "🎮 V-Games Platform Setup Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your database credentials:"
    echo "   - DATABASE_URL: Your Neon PostgreSQL connection string"
    echo "   - NEXTAUTH_SECRET: A secure random string"
    echo ""
    echo "🔗 Get your Neon database URL from: https://neon.tech"
    echo ""
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo ""
echo "1. Edit .env.local with your database credentials"
echo "2. Run: npm run db:push (to create database tables)"
echo "3. Run: npm run dev (to start development server)"
echo ""
echo "📚 Visit http://localhost:3000 to see your application"
echo "📖 Read README.md for detailed instructions"
echo ""
echo "Happy gaming! 🎮"
