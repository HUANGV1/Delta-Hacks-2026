import { getDB } from '../config/database';

export interface IAchievement {
  id: number;
  user_id: number;
  achievement_id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked_at: number | null;
  created_at: string;
  updated_at: string;
}

export class Achievement {
  static findById(id: number): IAchievement | null {
    const db = getDB();
    return db.prepare('SELECT * FROM achievements WHERE id = ?').get(id) as IAchievement | null;
  }

  static findByUserId(userId: number): IAchievement[] {
    const db = getDB();
    return db.prepare('SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC, created_at').all(userId) as IAchievement[];
  }

  static findByUserIdAndAchievementId(userId: number, achievementId: string): IAchievement | null {
    const db = getDB();
    return db.prepare('SELECT * FROM achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievementId) as IAchievement | null;
  }

  static create(data: Omit<IAchievement, 'id' | 'created_at' | 'updated_at'>): IAchievement {
    const db = getDB();
    const result = db.prepare(`
      INSERT INTO achievements (user_id, achievement_id, name, description, icon, progress, target, unlocked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.user_id,
      data.achievement_id,
      data.name,
      data.description,
      data.icon,
      data.progress,
      data.target,
      data.unlocked_at
    );
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static upsert(data: Omit<IAchievement, 'id' | 'created_at' | 'updated_at'>): IAchievement {
    const existing = this.findByUserIdAndAchievementId(data.user_id, data.achievement_id);
    
    if (existing) {
      return this.update(existing.id, {
        name: data.name,
        description: data.description,
        icon: data.icon,
        progress: data.progress,
        target: data.target,
        unlocked_at: data.unlocked_at,
      })!;
    }
    
    return this.create(data);
  }

  static update(id: number, updates: Partial<IAchievement>): IAchievement | null {
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
    
    db.prepare(`UPDATE achievements SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static toAPIFormat(row: IAchievement): any {
    return {
      id: row.achievement_id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      progress: row.progress,
      target: row.target,
      unlockedAt: row.unlocked_at || undefined,
    };
  }
}

export default Achievement;
