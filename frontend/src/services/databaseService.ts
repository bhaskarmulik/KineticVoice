import * as SQLite from 'expo-sqlite';
import { Activity } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('kinetic_voice.db');
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        name TEXT,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        duration INTEGER NOT NULL,
        distance REAL NOT NULL,
        avgPace REAL,
        locations TEXT NOT NULL,
        aiInsight TEXT,
        createdAt INTEGER NOT NULL
      );
    `);
  }

  async saveActivity(activity: Activity): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO activities 
         (id, type, status, name, startTime, endTime, duration, distance, avgPace, locations, aiInsight, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          activity.id,
          activity.type,
          activity.status,
          activity.name || null,
          activity.startTime,
          activity.endTime || null,
          activity.duration,
          activity.distance,
          activity.avgPace || null,
          JSON.stringify(activity.locations),
          activity.aiInsight || null,
          activity.createdAt,
        ]
      );
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  }

  async getActivities(): Promise<Activity[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM activities WHERE status = ? ORDER BY createdAt DESC',
        ['completed']
      );

      return result.map((row) => ({
        id: row.id,
        type: row.type,
        status: row.status,
        name: row.name,
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        distance: row.distance,
        avgPace: row.avgPace,
        locations: JSON.parse(row.locations),
        aiInsight: row.aiInsight,
        createdAt: row.createdAt,
      }));
    } catch (error) {
      console.error('Failed to get activities:', error);
      return [];
    }
  }

  async getActivity(id: string): Promise<Activity | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM activities WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return {
        id: result.id,
        type: result.type,
        status: result.status,
        name: result.name,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
        distance: result.distance,
        avgPace: result.avgPace,
        locations: JSON.parse(result.locations),
        aiInsight: result.aiInsight,
        createdAt: result.createdAt,
      };
    } catch (error) {
      console.error('Failed to get activity:', error);
      return null;
    }
  }

  async deleteActivity(id: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    try {
      await this.db.runAsync('DELETE FROM activities WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  }
}

export const databaseService = new DatabaseService();
