# StepPal - Fitness + Virtual Pet App

A full-stack mobile fitness app inspired by Tamagotchi where real-world physical activity (step count) directly affects the growth and evolution of a virtual pet. Users earn digital coins ("mined" through activity) that are tightly linked to the pet system.

## Features

- 🐣 **Virtual Pet System**: 3D animated pet with multiple evolution stages (egg → baby → child → teen → adult → elder → legendary)
- 👣 **Step Tracking**: Real-time step logging with daily and weekly goals
- 🪙 **StepCoin Mining**: Earn coins through activity, with mining efficiency increasing as your pet evolves
- 🎯 **Challenges**: Daily, weekly, and special challenges with rewards
- 🏆 **Achievements**: Unlock achievements as you progress
- ❤️ **Pet Care**: Feed, play, heal, and boost your pet to keep it happy and healthy
- 📊 **Activity Analytics**: Detailed stats, charts, and progress tracking
- 🎨 **Modern UI**: Professional dark theme with smooth animations
- 🔐 **User Authentication**: Secure JWT-based authentication
- 💾 **Persistent Storage**: MongoDB database for game state
- 🔄 **Real-time Updates**: WebSocket support for live updates

## Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite**
- **Three.js** with **React Three Fiber** for 3D pet rendering
- **Zustand** for state management
- **Framer Motion** for animations
- **date-fns** for date utilities

### Backend
- **Node.js** + **TypeScript** + **Express**
- **MongoDB** + **Mongoose** for database
- **JWT** for authentication
- **Socket.io** for WebSocket support
- **bcryptjs** for password hashing

## Project Structure

```
.
├── frontend/          # Frontend React application
│   ├── src/          # React source files
│   ├── public/       # Static assets
│   └── package.json
├── backend/          # Backend API server
│   ├── src/          # TypeScript source files
│   │   ├── models/   # Database models
│   │   ├── controllers/ # API controllers
│   │   ├── routes/   # API routes
│   │   └── middleware/ # Auth middleware
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas account)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/HUANGV1/Delta-Hacks-2026.git
cd Delta-Hacks-2026
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/steppal
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:3000/api
```

Start the development server:
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Game State
- `GET /api/gamestate` - Get game state (protected)
- `POST /api/gamestate/initialize` - Initialize game (protected)
- `POST /api/gamestate/steps` - Add steps (protected)
- `POST /api/gamestate/claim-coins` - Claim pending coins (protected)
- `POST /api/gamestate/care` - Pet care actions (protected)
- `POST /api/gamestate/hatch` - Hatch egg (protected)
- `PUT /api/gamestate/environment` - Update environment (protected)
- `PUT /api/gamestate/settings` - Update settings (protected)

### Challenges
- `GET /api/challenges` - Get all challenges (protected)
- `POST /api/challenges/:id/claim` - Claim challenge reward (protected)

### Achievements
- `GET /api/achievements` - Get all achievements (protected)

## Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

## Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Deploy the backend
4. Update `VITE_API_URL` in frontend `.env` to point to your backend URL

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the frontend: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variable `VITE_API_URL` to your backend URL

## How It Works

1. **Register/Login**: Create an account or sign in
2. **Initialize Pet**: Name your pet and choose its type
3. **Start Walking**: Log your steps manually or use the simulation mode
4. **Pet Growth**: Steps convert to experience, leveling up your pet
5. **Evolution**: Reach level and step milestones to evolve your pet
6. **Mining**: As your pet evolves, mining efficiency increases (up to 6x)
7. **Rewards**: Claim StepCoins earned through activity
8. **Challenges**: Complete daily/weekly challenges for bonus rewards
9. **Care**: Spend coins to feed, play with, or heal your pet

## Game Mechanics

- **Experience**: Earned from steps (10 steps = 1 XP)
- **Evolution**: Requires both level and total step milestones
- **Mining Power**: Multiplier based on pet stage (1x to 6x)
- **Pet Stats**: Hunger, Energy, Happiness, and Health affect pet mood
- **Streaks**: Daily activity streaks provide bonus rewards
- **Challenges**: Time-limited goals with coin rewards

## Database Schema

- **User**: User accounts with authentication
- **GameState**: Pet state, user stats, coins, settings
- **Challenge**: Daily/weekly/special challenges
- **Achievement**: User achievement progress
- **StepHistory**: Daily step tracking

## License

This project was created for Delta Hacks 2026.
