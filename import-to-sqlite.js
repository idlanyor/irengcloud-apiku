import Database from 'better-sqlite3';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = 'hadits.db';
const DATA_DIR = './data';

// Inisialisasi Database SQLite
const db = new Database(DB_FILE);

// Enable WAL Mode untuk performa baca/tulis yang super cepat
db.pragma('journal_mode = WAL');

// 1. Buat Tabel Utama Hadits
db.exec(`
  CREATE TABLE IF NOT EXISTS hadits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imam TEXT NOT NULL,
    number INTEGER NOT NULL,
    kitab TEXT,
    bab TEXT,
    terjemahan TEXT NOT NULL,
    UNIQUE(imam, number)
  );
`);

// 2. Buat Tabel Virtual FTS5 untuk Full-Text Search Kilat
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS hadits_fts USING fts5(
    imam UNINDEXED,
    number UNINDEXED,
    kitab,
    bab,
    terjemahan,
    tokenize='unicode61'
  );
`);

console.log('✅ Database & Tabel FTS5 SQLite berhasil disiapkan!');

// Prepared Statements
const insertHadits = db.prepare(`
  INSERT INTO hadits (imam, number, kitab, bab, terjemahan)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(imam, number) DO UPDATE SET
    kitab = excluded.kitab,
    bab = excluded.bab,
    terjemahan = excluded.terjemahan;
`);

const insertFTS = db.prepare(`
  INSERT INTO hadits_fts (imam, number, kitab, bab, terjemahan)
  VALUES (?, ?, ?, ?, ?);
`);

async function importAllJsonToSqlite() {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('⚠️ Tidak ditemukan file JSON di folder ./data');
      return;
    }

    console.log(`🚀 Memulai impor ${jsonFiles.length} file JSON ke SQLite (${DB_FILE})...`);

    for (const file of jsonFiles) {
      const imamKey = path.basename(file, '.json');
      const filePath = path.join(DATA_DIR, file);
      const rawData = await fs.readFile(filePath, 'utf-8');
      const haditsList = JSON.parse(rawData);

      console.log(`📦 Mengimpor ${haditsList.length} hadits dari ${file}...`);

      // Gunakan Transaction agar proses insert ribuan data selesai dalam hitungan milidetik
      const importTransaction = db.transaction((items) => {
        for (const item of items) {
          insertHadits.run(imamKey, item.number, item.kitab || '', item.bab || '', item.id || '');
          insertFTS.run(imamKey, item.number, item.kitab || '', item.bab || '', item.id || '');
        }
      });

      importTransaction(haditsList);
      console.log(`✅ Selesai mengimpor ${imamKey}`);
    }

    // Tampilkan Total Data di DB
    const countStmt = db.prepare('SELECT COUNT(*) AS total FROM hadits');
    const { total } = countStmt.get();
    console.log(`\n🎉 Total Data di Database (${DB_FILE}): ${total} Hadits.`);

  } catch (err) {
    console.error('❌ Error saat mengimpor:', err.message);
  }
}

// Jalankan Impor
await importAllJsonToSqlite();

// -----------------------------------------------------------------
// DEMO CONTOH CARA MENCARI HADITS PAKAI FULL-TEXT SEARCH (FTS5)
// -----------------------------------------------------------------
console.log('\n🔎 --- DEMO PENCARIAN FTS5: Kata Kunci "niat" ---');
const searchStmt = db.prepare(`
  SELECT imam, number, kitab, bab, terjemahan 
  FROM hadits_fts 
  WHERE hadits_fts MATCH ? 
  LIMIT 3
`);

const searchResults = searchStmt.all('niat');
console.dir(searchResults, { depth: null });
