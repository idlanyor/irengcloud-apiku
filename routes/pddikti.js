import { Router } from 'express';

export function createPddiktiRouter({ pddiktiService }) {
  const router = Router();

  // GET /api/v1/pddikti — info endpoint
  router.get('/', (req, res) => {
    res.json({
      name: 'PDDIKTI Kemdiktisaintek',
      description: 'Data Mahasiswa, Perguruan Tinggi, Prodi & Dosen Indonesia (scraped dari api-pddikti.kemdiktisaintek.go.id)',
      endpoints: {
        search: '/api/v1/pddikti/search?q={query}&tipe={all|mhs|dosen|pt|prodi}',
        detail: '/api/v1/pddikti/detail/:tipe/:encrypted_id  (tipe: mhs|dosen|pt|prodi)',
        sub: '/api/v1/pddikti/sub/:tipe/:data_type/:encrypted_id',
      },
    });
  });

  // GET /api/v1/pddikti/search?q={query}&tipe={all|mhs|dosen|pt|prodi}
  router.get('/search', async (req, res, next) => {
    try {
      const { q, tipe = 'all' } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, error: 'Parameter q wajib diisi.' });
      }
      const data = await pddiktiService.search({ q, tipe });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/pddikti/mahasiswa/:id  (id = encrypted id hasil search)
  router.get('/mahasiswa/:id', async (req, res, next) => {
    try {
      const data = await pddiktiService.detailMhs(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/pddikti/detail/:tipe/:id  (tipe: mhs|dosen|pt|prodi)
  router.get('/detail/:tipe/:id', async (req, res, next) => {
    try {
      const { tipe, id } = req.params;
      const data = await pddiktiService.detail(tipe, id);
      if (data && data.error) return res.status(400).json({ success: false, ...data });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/pddikti/sub/:tipe/:data_type/:id
  router.get('/sub/:tipe/:data_type/:id', async (req, res, next) => {
    try {
      const { tipe, data_type, id } = req.params;
      const data = await pddiktiService.subData(tipe, data_type, id);
      if (data && data.error) return res.status(400).json({ success: false, ...data });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createPddiktiRouter;
