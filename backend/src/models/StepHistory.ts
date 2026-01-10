import { getDB } from '../config/database';

export interface IStepHistory {
  id: number;
  user_id: number;
  date: string; // YYYY-MM-DD
  steps: number;
  calories: number;
  distance: number;
  created_at: string;
  updated_at: string;
}

export class StepHistory {
  static findByUserIdAndDate(userId: number, date: string): IStepHistory | null {
    const db = getDB();
    return db.prepare('SELECT * FROM step_history WHERE user_id = ? AND date = ?').get(userId, date) as IStepHistory | null;
  }

  static findByUserId(userId: number, limit?: number): IStepHistory[] {
    const db = getDB();
    if (limit) {
      return db.prepare('SELECT * FROM step_history WHERE user_id = ? ORDER BY date DESC LIMIT ?').all(userId, limit) as IStepHistory[];
    }
    return db.prepare('SELECT * FROM step_history WHERE user_id = ? ORDER BY date DESC').all(userId) as IStepHistory[];
  }

  static create(data: Omit<IStepHistory, 'id' | 'created_at' | 'updated_at'>): IStepHistory {
    const db = getDB();
    const result = db.prepare(`
      INSERT INTO step_history (user_id, date, steps, calories, distance)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      data.user_id,
      data.date,
      data.steps,
      data.calories,
      data.distance
    );
    
    return db.prepare('SELECT * FROM step_history WHERE id = ?').get(result.lastInsertRowid) as IStepHistory;
  }

  static upsert(data: Omit<IStepHistory, 'id' | 'created_at' | 'updated_at'>): IStepHistory {
    const existing = this.findByUserIdAndDate(data.user_id, data.date);
    
    if (existing) {
      return this.update(existing.id, {
        steps: data.steps,
        calories: data.calories,
        distance: data.distance,
      })!;
    }
    
    return this.create(data);
  }

  static update(id: number, updates: Partial<IStepHistory>): IStepHistory | null {
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
      return db.prepare('SELECT * FROM step_history WHERE id = ?').get(id) as IStepHistory | null;
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE step_history SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    return db.prepare('SELECT * FROM step_history WHERE id = ?').get(id) as IStepHistory | null;
  }
}

export default StepHistory;
