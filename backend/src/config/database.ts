import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export const connectDB = (): Database.Database => {
  if (db) {
    return db;
  }

  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'steppal.db');
  
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables(db);
  
  console.log(`SQLite Connected: ${dbPath}`);
  return db;
};

const createTables = (database: Database.Database) => {
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Game states table
  database.exec(`
    CREATE TABLE IF NOT EXISTS game_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      pet_name TEXT DEFAULT 'Pet',
      pet_type TEXT DEFAULT 'phoenix',
      pet_stage TEXT DEFAULT 'egg',
      pet_level INTEGER DEFAULT 1,
      pet_experience INTEGER DEFAULT 0,
      pet_experience_to_next_level INTEGER DEFAULT 100,
      pet_mood TEXT DEFAULT 'neutral',
      pet_mood_points REAL DEFAULT 50,
      pet_total_steps_all_time INTEGER DEFAULT 0,
      pet_mining_efficiency REAL DEFAULT 0,
      pet_last_fed_time INTEGER DEFAULT 0,
      pet_last_played_time INTEGER DEFAULT 0,
      pet_hatched INTEGER DEFAULT 0,
      pet_evolution_animation INTEGER DEFAULT 0,
      pet_environment TEXT DEFAULT 'meadow',
      pet_hunger INTEGER DEFAULT 100,
      pet_energy INTEGER DEFAULT 100,
      pet_happiness INTEGER DEFAULT 50,
      pet_health INTEGER DEFAULT 100,
      pet_unlockables TEXT DEFAULT '[]',
      pet_cosmetics TEXT DEFAULT '{}',
      stats_steps_today INTEGER DEFAULT 0,
      stats_steps_this_week INTEGER DEFAULT 0,
      stats_steps_this_month INTEGER DEFAULT 0,
      stats_last_step_update TEXT DEFAULT '',
      stats_streak INTEGER DEFAULT 0,
      stats_longest_streak INTEGER DEFAULT 0,
      stats_last_active_date TEXT DEFAULT '',
      stats_daily_goal INTEGER DEFAULT 10000,
      stats_weekly_goal INTEGER DEFAULT 70000,
      stats_daily_history TEXT DEFAULT '[]',
      stats_weekly_history TEXT DEFAULT '[]',
      coins_balance REAL DEFAULT 0,
      coins_pending_reward REAL DEFAULT 0,
      coins_total_earned REAL DEFAULT 0,
      coins_last_claim_time INTEGER DEFAULT 0,
      coins_mining_rate REAL DEFAULT 10,
      coins_mining_history TEXT DEFAULT '[]',
      settings_notifications INTEGER DEFAULT 1,
      settings_sound_effects INTEGER DEFAULT 1,
      settings_haptics INTEGER DEFAULT 1,
      settings_theme TEXT DEFAULT 'dark',
      settings_step_source TEXT DEFAULT 'manual',
      settings_language TEXT DEFAULT 'en',
      initialized INTEGER DEFAULT 0,
      last_update_time INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Challenges table
  database.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT DEFAULT '🎯',
      target INTEGER NOT NULL,
      current INTEGER DEFAULT 0,
      reward INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      claimed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Achievements table
  database.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT DEFAULT '🏆',
      progress INTEGER DEFAULT 0,
      target INTEGER NOT NULL,
      unlocked_at INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, achievement_id)
    )
  `);

  // Step history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS step_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER DEFAULT 0,
      calories REAL DEFAULT 0,
      distance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
    CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
    CREATE INDEX IF NOT EXISTS idx_challenges_expires_at ON challenges(expires_at);
    CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_step_history_user_id ON step_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_step_history_date ON step_history(date);
  `);
};

export const getDB = (): Database.Database => {
  if (!db) {
    return connectDB();
  }
  return db;
};

export const closeDB = () => {
  if (db) {
    db.close();
    db = null;
  }
};
