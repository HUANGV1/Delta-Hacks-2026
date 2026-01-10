# StepPal - Fitness + Virtual Pet App

A mobile fitness app inspired by Tamagotchi where real-world physical activity (step count) directly affects the growth and evolution of a virtual pet. Users earn digital coins ("mined" through activity) that are tightly linked to the pet system.

## Features

- 🐣 **Virtual Pet System**: 3D animated pet with multiple evolution stages (egg → baby → child → teen → adult → elder → legendary)
- 👣 **Step Tracking**: Real-time step logging with daily and weekly goals
- 🪙 **StepCoin Mining**: Earn coins through activity, with mining efficiency increasing as your pet evolves
- 🎯 **Challenges**: Daily, weekly, and special challenges with rewards
- 🏆 **Achievements**: Unlock achievements as you progress
- ❤️ **Pet Care**: Feed, play, heal, and boost your pet to keep it happy and healthy
- 📊 **Activity Analytics**: Detailed stats, charts, and progress tracking
- 🎨 **Modern UI**: Professional dark theme with smooth animations

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Three.js** with **React Three Fiber** for 3D pet rendering
- **Zustand** for state management
- **Framer Motion** for animations
- **date-fns** for date utilities

## Project Structure

```
.
├── frontend/          # All frontend application code
│   ├── src/          # React source files
│   ├── public/       # Static assets
│   ├── package.json   # Dependencies and scripts
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

## How It Works

1. **Start Walking**: Log your steps manually or use the simulation mode
2. **Pet Growth**: Steps convert to experience, leveling up your pet
3. **Evolution**: Reach level and step milestones to evolve your pet
4. **Mining**: As your pet evolves, mining efficiency increases (up to 6x)
5. **Rewards**: Claim StepCoins earned through activity
6. **Challenges**: Complete daily/weekly challenges for bonus rewards
7. **Care**: Spend coins to feed, play with, or heal your pet

## Game Mechanics

- **Experience**: Earned from steps (configurable rate)
- **Evolution**: Requires both level and total step milestones
- **Mining Power**: Multiplier based on pet stage (1x to 6x)
- **Pet Stats**: Hunger, Energy, Happiness, and Health affect pet mood
- **Streaks**: Daily activity streaks provide bonus rewards
- **Challenges**: Time-limited goals with coin rewards

## License

This project was created for Delta Hacks 2026.
