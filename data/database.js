import Database from 'better-sqlite3';

export function createDatabaseConnection(dbPath = 'hadits.db') {
  return new Database(dbPath);
}
