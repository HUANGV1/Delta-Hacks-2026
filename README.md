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
- 💾 **Persistent Storage**: SQLite database (works out of the box!)
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
- **SQLite** (`sql.js`) for zero-config database
- **JWT** for authentication
- **Socket.io** for WebSocket support
- **bcryptjs** for password hashing

## Project Structure

```
.
├── frontend/          # Frontend React application
├── backend/          # Backend API server
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- That's it! (No MongoDB required)

### Installation & Setup

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

Create a `.env` file (IMPORTANT!):
```bash
cp .env.example .env
```
*(The default configuration in `.env.example` works out of the box)*

Start the backend:
```bash
npm run dev
```
The API will run at `http://localhost:3000`

#### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

Open your browser to `http://localhost:5173`.

### Portability & Mobile Access
The app is configured to automatically work on your local network.
- To use on your phone: Connect to the same Wi-Fi, find your computer's IP, and visit `http://YOUR_LAN_IP:5173`.
- The API URL automatically adapts to your hostname.

## License

This project was created for Delta Hacks 2026.
