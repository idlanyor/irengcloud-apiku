export function createHaditsService({ db }) {
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

  return {
    getBooksSummary() {
      return stmtBooksSummary.all();
    },

    getHaditsByNumber(imam, number) {
      return stmtGetSingle.get(imam.toLowerCase(), parseInt(number));
    },

    getHaditsList(imam, page = 1, limit = 20) {
      const offset = (page - 1) * limit;
      const imamKey = imam.toLowerCase();
      const countRes = stmtCountImam.get(imamKey);
      const total = countRes ? countRes.total : 0;
      const data = stmtGetList.all(imamKey, limit, offset);

      return {
        pagination: {
          page,
          limit,
          total_items: total,
          total_pages: Math.ceil(total / limit),
        },
        data,
      };
    },

    searchHadits(query, page = 1, limit = 20) {
      const offset = (page - 1) * limit;
      const results = stmtSearchFTS.all(query, limit, offset);

      return {
        query,
        pagination: {
          page,
          limit,
          count: results.length,
        },
        data: results,
      };
    },
  };
}
