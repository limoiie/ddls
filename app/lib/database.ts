import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'notifications.db');

// Initialize database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;
  
  // Create notifications table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notification_times (
      conf_edition_id TEXT PRIMARY KEY,
      notification_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(createTableQuery);
}

export interface Notification {
  conf_edition_id: string;
  notification_time: string;
  created_at?: string;
  updated_at?: string;
}

export function getNotification(confEditionId: string): string | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT notification_time FROM notification_times WHERE conf_edition_id = ?');
  const result = stmt.get(confEditionId) as { notification_time: string } | undefined;
  return result?.notification_time || null;
}

export function setNotification(confEditionId: string, notification: string): void {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO notification_times (conf_edition_id, notification_time, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);
  stmt.run(confEditionId, notification);
}

export function deleteNotification(confEditionId: string): void {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM notification_times WHERE conf_edition_id = ?');
  stmt.run(confEditionId);
}

export function getAllNotifications(): Record<string, string> {
  const database = getDatabase();
  const stmt = database.prepare('SELECT conf_edition_id, notification_time FROM notification_times');
  const results = stmt.all() as { conf_edition_id: string; notification_time: string }[];
  
  return results.reduce((acc, row) => {
    acc[row.conf_edition_id] = row.notification_time;
    return acc;
  }, {} as Record<string, string>);
}

// Close database connection when process exits
process.on('exit', () => {
  if (db) {
    db.close();
  }
});

process.on('SIGINT', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});
