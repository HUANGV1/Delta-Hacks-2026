import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

let db: Database;

export async function initDatabase(): Promise<Database> {
  const dbPath = process.env.DATABASE_PATH || 'data/steppal.db';
  const dbDir = path.dirname(dbPath);

  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log(`SQLite Loaded: ${dbPath}`);
  } else {
    db = new SQL.Database();
    console.log(`SQLite Created: ${dbPath}`);
  }

  // Create tables
  createTables();

  // Save to file
  saveDatabase();

  return db;
}

export function getDB(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function saveDatabase() {
  const dbPath = process.env.DATABASE_PATH || 'data/steppal.db';
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function createTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Game states table
  db.run(`
    CREATE TABLE IF NOT EXISTS game_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      
      pet_name TEXT DEFAULT '',
      pet_type TEXT DEFAULT 'phoenix',
      pet_stage TEXT DEFAULT 'egg',
      pet_level INTEGER DEFAULT 0,
      pet_experience INTEGER DEFAULT 0,
      pet_mood_points INTEGER DEFAULT 50,
      pet_hatched INTEGER DEFAULT 0,
      pet_environment TEXT DEFAULT 'meadow',
      pet_hunger INTEGER DEFAULT 80,
      pet_energy INTEGER DEFAULT 80,
      pet_happiness INTEGER DEFAULT 70,
      pet_health INTEGER DEFAULT 100,
      pet_last_fed_time INTEGER,
      pet_last_played_time INTEGER,
      pet_cosmetics TEXT DEFAULT '{}',
      
      steps_today INTEGER DEFAULT 0,
      steps_this_week INTEGER DEFAULT 0,
      steps_all_time INTEGER DEFAULT 0,
      last_step_update TEXT,
      streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      daily_goal INTEGER DEFAULT 8000,
      weekly_goal INTEGER DEFAULT 50000,
      last_active_date TEXT,
      daily_history TEXT DEFAULT '[]',
      
      coins_balance INTEGER DEFAULT 0,
      coins_pending REAL DEFAULT 0,
      coins_total_earned INTEGER DEFAULT 0,
      last_claim_time INTEGER,
      mining_history TEXT DEFAULT '[]',
      
      crates_available INTEGER DEFAULT 0,
      crates_opened INTEGER DEFAULT 0,
      steps_toward_next_crate INTEGER DEFAULT 0,
      
      settings TEXT DEFAULT '{"notifications":true,"soundEffects":true,"haptics":true,"theme":"dark","stepSource":"manual","language":"en"}',
      
      initialized INTEGER DEFAULT 0,
      last_update_time INTEGER,

      net_worth INTEGER DEFAULT 0,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migration for existing tables
  try {
    db.run('ALTER TABLE game_states ADD COLUMN net_worth INTEGER DEFAULT 0');
    console.log('Added net_worth column to game_states');
  } catch (e) {
    // Column likely already exists
    // console.log('net_worth column already exists or error adding it');
  }

  // Challenges table
  db.run(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🎯',
      target INTEGER NOT NULL,
      current INTEGER DEFAULT 0,
      reward INTEGER NOT NULL,
      expires_at INTEGER,
      completed INTEGER DEFAULT 0,
      claimed INTEGER DEFAULT 0,
      PRIMARY KEY (id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Achievements table
  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      unlocked_at INTEGER,
      PRIMARY KEY (id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables created');
}
