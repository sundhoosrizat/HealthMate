import * as SQLite from 'expo-sqlite';
import { auth } from '../firebase';

// Database name
const DATABASE_NAME = 'healthmate.db';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Open SQLite database
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db === null) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return db;
};

// Get logged-in user's Firebase UID
const getCurrentUserId = (): string => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('Please login to access health records.');
  }

  return userId;
};

// Initialize database and migrate old table
export const initDatabase = async (): Promise<void> => {
  try {
    const database = await getDatabase();

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        steps INTEGER NOT NULL DEFAULT 0,
        calories INTEGER NOT NULL DEFAULT 0,
        water INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Check whether user_id column already exists
    const columns = await database.getAllAsync<any>(
      `PRAGMA table_info(health_records);`
    );

    const hasUserId = columns.some(
      (column: any) => column.name === 'user_id'
    );

    // Add user_id without deleting existing records
    if (!hasUserId) {
      await database.execAsync(`
        ALTER TABLE health_records ADD COLUMN user_id TEXT;
      `);
    }

    console.log('HealthMate database initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Add health record
export const addHealthRecord = async (
  date: string,
  steps: number,
  calories: number,
  water: number
): Promise<number> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const result = await database.runAsync(
    `INSERT INTO health_records
     (date, steps, calories, water, user_id)
     VALUES (?, ?, ?, ?, ?);`,
    [date, steps, calories, water, userId]
  );

  console.log('Record added. ID:', result.lastInsertRowId);

  return result.lastInsertRowId;
};

// Get logged-in user's health records
export const getAllHealthRecords = async (): Promise<any[]> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const records = await database.getAllAsync(
    `SELECT * FROM health_records
     WHERE user_id = ?
     ORDER BY date DESC;`,
    [userId]
  );

  return records;
};

// Get health record by ID
export const getHealthRecordById = async (
  id: number
): Promise<any | null> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const record = await database.getFirstAsync(
    `SELECT * FROM health_records
     WHERE id = ? AND user_id = ?;`,
    [id, userId]
  );

  return record;
};

// Update health record
export const updateHealthRecord = async (
  id: number,
  date: string,
  steps: number,
  calories: number,
  water: number
): Promise<void> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const result = await database.runAsync(
    `UPDATE health_records
     SET date = ?, steps = ?, calories = ?, water = ?
     WHERE id = ? AND user_id = ?;`,
    [date, steps, calories, water, id, userId]
  );

  console.log('Record updated. ID:', id);
  console.log('Rows changed:', result.changes);
};

// Delete health record
export const deleteHealthRecord = async (
  id: number
): Promise<void> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const result = await database.runAsync(
    `DELETE FROM health_records
     WHERE id = ? AND user_id = ?;`,
    [id, userId]
  );

  console.log('Record deleted. ID:', id);
  console.log('Rows deleted:', result.changes);
};

// Search health records by date
export const searchHealthRecordsByDate = async (
  date: string
): Promise<any[]> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const records = await database.getAllAsync(
    `SELECT * FROM health_records
     WHERE date = ? AND user_id = ?
     ORDER BY date DESC;`,
    [date, userId]
  );

  return records;
};

// Get today's health summary
export const getTodayHealthSummary = async (
  date: string
): Promise<any> => {
  const database = await getDatabase();
  const userId = getCurrentUserId();

  const summary = await database.getFirstAsync(
    `SELECT
       COALESCE(SUM(steps), 0) AS totalSteps,
       COALESCE(SUM(calories), 0) AS totalCalories,
       COALESCE(SUM(water), 0) AS totalWater
     FROM health_records
     WHERE date = ? AND user_id = ?;`,
    [date, userId]
  );

  console.log('Dashboard date:', date);
  console.log('Dashboard summary:', summary);

  return summary;
};