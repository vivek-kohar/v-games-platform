# V-Games Platform

A modern multi-game platform built with Next.js, featuring user authentication, progress saving, and multiple web games including a Minecraft-style game.

## 🎮 Features

- **User Authentication**: Secure login/signup with NextAuth.js
- **Multiple Games**: Minecraft Web, Snake, Tetris, and more
- **Progress Saving**: Automatic game state persistence with PostgreSQL
- **Achievements System**: Unlock achievements across games
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live game state synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Neon PostgreSQL
- **Authentication**: NextAuth.js with credentials and OAuth
- **Game Engine**: Phaser 3 for web games
- **Deployment**: Vercel-ready configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database account
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd v-games-platform
npm install
```

### 2. Database Setup

1. Create a [Neon PostgreSQL](https://neon.tech) database
2. Copy your connection string
3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Replace with your Neon PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Optional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed initial data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Game Features

### Minecraft Web Game

- **Block Building**: Place and break 5 different block types
- **Terrain Generation**: Procedurally generated worlds
- **Physics**: Realistic player movement and gravity
- **Save/Load**: Persistent world state across sessions
- **Inventory System**: Easy block selection with mouse/keyboard

**Controls:**
- WASD - Move player
- Space - Jump
- Left Click - Place blocks
- Right Click - Break blocks
- 1-5 Keys - Select block types

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── games/         # Game state management
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── games/             # Individual game pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### Game State Management
- `GET /api/games/[gameSlug]/save` - Load game state
- `POST /api/games/[gameSlug]/save` - Save game state

## 🎨 Adding New Games

1. Create a new game page in `src/app/games/[game-name]/page.tsx`
2. Implement game logic with Phaser 3 or your preferred engine
3. Add save/load functionality using the game state API
4. Update the dashboard to include your new game

Example game integration:
```typescript
// Save game state
const saveGame = async (gameData: any) => {
  await fetch(`/api/games/${gameSlug}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: gameData,
      score: currentScore,
      level: currentLevel
    })
  });
};

// Load game state
const loadGame = async () => {
  const response = await fetch(`/api/games/${gameSlug}/save`);
  const savedState = await response.json();
  return savedState;
};
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-neon-postgres-connection-string"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret-key"
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based session management
- CSRF protection with NextAuth.js
- SQL injection prevention with Prisma
- Environment variable protection

## 🎯 Future Enhancements

- [ ] Multiplayer game support
- [ ] Real-time leaderboards
- [ ] Social features (friends, chat)
- [ ] Mobile app with React Native
- [ ] Game tournaments and events
- [ ] Advanced analytics dashboard
- [ ] Custom game creation tools

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify your `DATABASE_URL` is correct
- Ensure your Neon database is active
- Check firewall settings

**Authentication Not Working:**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

**Games Not Loading:**
- Check browser console for JavaScript errors
- Ensure Phaser 3 CDN is accessible
- Verify game assets are loading correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

Built with ❤️ using Next.js, Prisma, and Phaser 3
