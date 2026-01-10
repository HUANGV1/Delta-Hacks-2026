import { getDB } from '../config/database';

export interface IChallenge {
  id: number;
  user_id: number;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  reward: number;
  expires_at: number;
  completed: number; // 0 or 1
  claimed: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export class Challenge {
  static findById(id: number): IChallenge | null {
    const db = getDB();
    return db.prepare('SELECT * FROM challenges WHERE id = ?').get(id) as IChallenge | null;
  }

  static findByUserId(userId: number): IChallenge[] {
    const db = getDB();
    return db.prepare('SELECT * FROM challenges WHERE user_id = ? ORDER BY created_at DESC').all(userId) as IChallenge[];
  }

  static findActiveByUserId(userId: number): IChallenge[] {
    const db = getDB();
    const now = Date.now();
    return db.prepare('SELECT * FROM challenges WHERE user_id = ? AND expires_at >= ? ORDER BY type, created_at').all(userId, now) as IChallenge[];
  }

  static create(data: Omit<IChallenge, 'id' | 'created_at' | 'updated_at'>): IChallenge {
    const db = getDB();
    const result = db.prepare(`
      INSERT INTO challenges (user_id, type, title, description, icon, target, current, reward, expires_at, completed, claimed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.user_id,
      data.type,
      data.title,
      data.description,
      data.icon,
      data.target,
      data.current,
      data.reward,
      data.expires_at,
      data.completed,
      data.claimed
    );
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static insertMany(challenges: Omit<IChallenge, 'id' | 'created_at' | 'updated_at'>[]): IChallenge[] {
    const db = getDB();
    const insert = db.prepare(`
      INSERT INTO challenges (user_id, type, title, description, icon, target, current, reward, expires_at, completed, claimed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((challenges: Omit<IChallenge, 'id' | 'created_at' | 'updated_at'>[]) => {
      return challenges.map((challenge: Omit<IChallenge, 'id' | 'created_at' | 'updated_at'>) => {
        const result = insert.run(
          challenge.user_id,
          challenge.type,
          challenge.title,
          challenge.description,
          challenge.icon,
          challenge.target,
          challenge.current,
          challenge.reward,
          challenge.expires_at,
          challenge.completed,
          challenge.claimed
        );
        return this.findById(result.lastInsertRowid as number)!;
      });
    });
    
    return insertMany(challenges);
  }

  static update(id: number, updates: Partial<IChallenge>): IChallenge | null {
    const db = getDB();
    const setClause: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (setClause.length === 0) {
      return this.findById(id);
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE challenges SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static toAPIFormat(row: IChallenge): any {
    return {
      id: row.id.toString(),
      type: row.type,
      title: row.title,
      description: row.description,
      icon: row.icon,
      target: row.target,
      current: row.current,
      reward: row.reward,
      expiresAt: row.expires_at,
      completed: row.completed === 1,
      claimed: row.claimed === 1,
    };
  }
}

export default Challenge;
