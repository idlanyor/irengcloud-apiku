import defaultAxios from 'axios';

export function createKomikuController({ komikuService, httpClient = defaultAxios }) {
  return {
    async handleGetHome(req, res, next) {
      try {
        const data = await komikuService.getHome();
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil data beranda Komiku',
        });
      }
    },

    async handleSearch(req, res, next) {
      try {
        const query = req.query.q || req.query.query;
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "q" (kata kunci pencarian komik) wajib diisi. Contoh: ?q=one+piece',
          });
        }
        const data = await komikuService.search(query);
        return res.json({ success: true, count: data.length, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mencari komik di Komiku',
        });
      }
    },

    async handleGetDetail(req, res, next) {
      try {
        const slug = req.query.slug || req.params.slug;
        if (!slug) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "slug" komik wajib diisi. Contoh: ?slug=one-piece',
          });
        }
        const data = await komikuService.getDetail(slug);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil detail komik Komiku',
        });
      }
    },

    async handleGetChapter(req, res, next) {
      try {
        const slug = req.query.slug || req.params.slug;
        if (!slug) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "slug" chapter wajib diisi. Contoh: ?slug=one-piece-chapter-1120',
          });
        }
        const data = await komikuService.getChapter(slug);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil gambar chapter Komiku',
        });
      }
    },

    async handleProxyImage(req, res, next) {
      try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
          return res.status(400).send('Parameter "url" gambar wajib diisi');
        }

        const response = await httpClient.get(imageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://komiku.org/',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          responseType: 'stream',
          timeout: 10000,
        });

        if (response.headers['content-type']) {
          res.setHeader('Content-Type', response.headers['content-type']);
        }
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

        return response.data.pipe(res);
      } catch (err) {
        return res
          .status(err.response?.status || 500)
          .send(err.message || 'Gagal memuat gambar komik via proxy');
      }
    },
  };
}
