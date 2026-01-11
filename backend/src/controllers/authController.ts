import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB, saveDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { ACHIEVEMENT_DEFINITIONS } from '../utils/gameLogic';

// Helper to run query and get results
function query(sql: string, params: any[] = []): any[] {
    const db = getDB();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function run(sql: string, params: any[] = []): void {
    const db = getDB();
    db.run(sql, params);
    saveDatabase();
}

function getOne(sql: string, params: any[] = []): any {
    const results = query(sql, params);
    return results[0] || null;
}

function getLastInsertId(): number {
    const db = getDB();
    const result = db.exec('SELECT last_insert_rowid() as id');
    if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0] as number;
    }
    return 0;
}

// Register new user
export async function register(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = getOne('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email or username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        // Get the created user ID
        const newUser = getOne('SELECT id FROM users WHERE email = ?', [email]);
        const userId = newUser?.id || 1;

        // Create initial game state
        const now = Date.now();
        run(`
      INSERT INTO game_states (user_id, pet_last_fed_time, pet_last_played_time, last_claim_time, last_update_time)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, now, now, now, now]);

        // Create initial achievements
        for (const achievement of ACHIEVEMENT_DEFINITIONS) {
            run('INSERT INTO achievements (id, user_id, progress) VALUES (?, ?, 0)', [achievement.id, userId]);
        }

        // Generate token
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign({ id: userId, email, username }, secret, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            token,
            user: { id: userId, username, email },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
}

// Login user
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = getOne('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, secret, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
}

// Get current user
export async function getMe(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = getOne('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export { query, run, getOne };
