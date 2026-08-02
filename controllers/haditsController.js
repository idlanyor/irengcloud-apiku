import Database from 'better-sqlite3';

const db = new Database('hadits.db');

const stmtGetSingle = db.prepare(`
  SELECT id, imam, number, kitab, bab, terjemahan 
  FROM hadits 
  WHERE imam = ? AND number = ?
`);

const stmtGetList = db.prepare(`
  SELECT id, imam, number, kitab, bab, terjemahan 
  FROM hadits 
  WHERE imam = ? 
  ORDER BY number ASC 
  LIMIT ? OFFSET ?
`);

const stmtCountImam = db.prepare(`
  SELECT COUNT(*) as total FROM hadits WHERE imam = ?
`);

const stmtSearchFTS = db.prepare(`
  SELECT imam, number, kitab, bab, terjemahan 
  FROM hadits_fts 
  WHERE hadits_fts MATCH ? 
  LIMIT ? OFFSET ?
`);

const stmtBooksSummary = db.prepare(`
  SELECT imam, COUNT(*) as total_hadits 
  FROM hadits 
  GROUP BY imam
`);

export const getBooks = (req, res) => {
  const summary = stmtBooksSummary.all();
  res.json({ success: true, data: summary });
};

export const getHaditsByNumber = (req, res) => {
  const { imam, number } = req.params;
  const hadits = stmtGetSingle.get(imam.toLowerCase(), parseInt(number));

  if (!hadits) {
    return res.status(404).json({
      success: false,
      message: `Hadits ${imam} no ${number} tidak ditemukan.`,
    });
  }

  res.json({ success: true, data: hadits });
};

export const getHaditsList = (req, res) => {
  const { imam } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const imamKey = imam.toLowerCase();
  const { total } = stmtCountImam.get(imamKey);
  const data = stmtGetList.all(imamKey, limit, offset);

  res.json({
    success: true,
    pagination: {
      page,
      limit,
      total_items: total,
      total_pages: Math.ceil(total / limit),
    },
    data,
  });
};

export const searchHadits = (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Masukkan kata kunci pencarian pada parameter ?q=...',
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const results = stmtSearchFTS.all(query, limit, offset);

  res.json({
    success: true,
    query,
    pagination: {
      page,
      limit,
      count: results.length,
    },
    data: results,
  });
};
