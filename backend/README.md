# StepPal Backend API

Backend API server for the StepPal fitness + virtual pet application.

## Features

- 🔐 User authentication (JWT)
- 🐣 Pet state management
- 👣 Step tracking and history
- 🪙 Coin mining and rewards
- 🎯 Challenges system
- 🏆 Achievements tracking
- 🔄 Real-time updates via WebSocket
- 📊 Activity analytics

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **Socket.io** - WebSocket support
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/steppal
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

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

### Health
- `GET /api/health` - Health check

## WebSocket Events

- `join-user` - Join user-specific room for updates
- Real-time game state updates (coming soon)

## Database Models

- **User** - User accounts
- **GameState** - Pet state, stats, coins, settings
- **Challenge** - Daily/weekly/special challenges
- **Achievement** - User achievements
- **StepHistory** - Daily step tracking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/steppal` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Development

The server uses TypeScript and runs with `ts-node` in development mode. Hot reload is enabled via `nodemon`.

## Production Deployment

1. Build the TypeScript code:
```bash
npm run build
```

2. Set production environment variables

3. Start the server:
```bash
npm start
```

## License

ISC

