import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Initialize database connection
let db: SQLite.SQLiteDatabase | null = null;

if (Platform.OS !== 'web') {
  try {
    db = SQLite.openDatabaseSync('budgetwise.db');
  } catch (error) {
    console.warn('Error opening database:', error);
  }
}

export const initDatabase = () => {
  if (!db) {
    if (Platform.OS === 'web') {
      console.log('Local database skipped on web');
    }
    return;
  }

  try {
    // Create transactions table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        category TEXT,
        date TEXT,
        type TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create budgets table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY NOT NULL,
        category TEXT NOT NULL,
        limit_amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        synced INTEGER DEFAULT 0
      );
    `);

    // Create sync queue table for offline actions
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Local database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize local database:', error);
  }
};

// Transaction Operations
export const saveLocalTransaction = (transaction: any) => {
  if (!db) return;
  
  try {
    const { id, amount, description, category, date, type } = transaction;
    db.runSync(
      `INSERT OR REPLACE INTO transactions (id, amount, description, category, date, type, synced) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, amount, description, category, date, type]
    );
    
    // Add to sync queue
    addToSyncQueue('UPSERT', 'transactions', transaction);
  } catch (error) {
    console.error('Error saving local transaction:', error);
    throw error;
  }
};

export const getLocalTransactions = () => {
  if (!db) return [];
  try {
    return db.getAllSync('SELECT * FROM transactions ORDER BY date DESC');
  } catch (error) {
    console.error('Error fetching local transactions:', error);
    return [];
  }
};

export const deleteLocalTransaction = (id: string) => {
  if (!db) return;
  try {
    db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
    addToSyncQueue('DELETE', 'transactions', { id });
  } catch (error) {
    console.error('Error deleting local transaction:', error);
    throw error;
  }
};

// Sync Queue Operations
const addToSyncQueue = (action: string, tableName: string, data: any) => {
  if (!db) return;
  try {
    db.runSync(
      'INSERT INTO sync_queue (action, table_name, data) VALUES (?, ?, ?)',
      [action, tableName, JSON.stringify(data)]
    );
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

export const getPendingSyncItems = () => {
  if (!db) return [];
  try {
    return db.getAllSync('SELECT * FROM sync_queue ORDER BY created_at ASC');
  } catch (error) {
    console.error('Error getting pending sync items:', error);
    return [];
  }
};

export const clearSyncQueueItem = (id: number) => {
  if (!db) return;
  try {
    db.runSync('DELETE FROM sync_queue WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error clearing sync queue item:', error);
  }
};