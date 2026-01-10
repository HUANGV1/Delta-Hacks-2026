import bcrypt from 'bcryptjs';
import { getDB } from '../config/database';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export class User {
  static async create(data: { username: string; email: string; password: string }): Promise<IUser> {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `).run(data.username, data.email, hashedPassword);
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): IUser | null {
    const db = getDB();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as IUser | null;
  }

  static findByEmail(email: string): IUser | null {
    const db = getDB();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as IUser | null;
  }

  static findByUsername(username: string): IUser | null {
    const db = getDB();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as IUser | null;
  }

  static findOne(condition: { email?: string; username?: string }): IUser | null {
    if (condition.email) {
      return this.findByEmail(condition.email);
    }
    if (condition.username) {
      return this.findByUsername(condition.username);
    }
    return null;
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default User;
