import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { APP_VERSION, SEMVER_INFO } from './config/version.js';
import { generateOpenApiSpec, jsonToYaml } from './config/swaggerSpec.js';
import { generateLlmsTxt, generateLlmsJson, generateAiMarkdown } from './config/aiDocs.js';
import { API_CATEGORIES, API_ENDPOINTS } from './config/apiCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8410;
const app = express();

// React build dir — dipakai hanya jika build sudah ada
const WEB_DIST = path.join(__dirname, 'web', 'dist');
const hasWebBuild = fs.existsSync(path.join(WEB_DIST, 'index.html'));

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static assets from public folder (SEO files: robots, sitemap, 404).
// index:false — biar route "/" yang handle HTML (React vs JSON negotiation),
// bukan static yang nyamber public/index.html.
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// OpenAPI / Swagger Documentation & Spec Endpoints
const openApiSpec = generateOpenApiSpec();
const swaggerUiOptions = {
  swaggerOptions: {
    url: '/swagger.json',
  },
};

// Swagger UI sebelumnya meng-embed spec ke swagger-ui-init.js. Jika file itu
// tersimpan di CDN, daftar endpoint lama tetap tampil meski swagger.json sudah
// berubah. Ambil spec secara dinamis dan cegah cache pada seluruh aset docs.
app.use(['/docs', '/swagger', '/swagger.json', '/swagger.yaml'], (_req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'CDN-Cache-Control': 'no-store',
    'Cloudflare-CDN-Cache-Control': 'no-store',
    Expires: '0',
  });
  next();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, swaggerUiOptions));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(null, swaggerUiOptions));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(openApiSpec);
});

app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="swagger.yaml"');
  res.send(jsonToYaml(openApiSpec));
});

// API Catalog — satu sumber kebenaran endpoint, dikonsumsi frontend
// (playground, home grid, halaman /endpoints). Under /api/v1 biar proxy
// Vite dev (/api) menangkapnya.
app.get('/api/v1/catalog', (req, res) => {
  res.json({
    name: 'IrengCloud Universal API',
    version: APP_VERSION,
    categories: API_CATEGORIES,
    endpoints: API_ENDPOINTS,
  });
});

// AI-Optimized Documentation (llms.txt standard + JSON manifest + dense markdown)
app.get(['/.well-known/llms.txt', '/llms.txt'], (req, res) => {
  res.type('text/plain; charset=utf-8');
  res.send(generateLlmsTxt());
});

app.get('/llms.json', (req, res) => {
  res.json(generateLlmsJson());
});

app.get('/ai/docs', (req, res) => {
  res.type('text/markdown; charset=utf-8');
  res.send(generateAiMarkdown());
});

// SemVer & Request Logger Middleware
app.use((req, res, next) => {
  res.setHeader('X-Api-Version', APP_VERSION);
  console.log(`[${new Date().toISOString()}] [v${APP_VERSION}] ${req.method} ${req.url}`);
  next();
});

// Root Information Handler: Serve HTML landing page for browser, or JSON for API clients
app.get('/', (req, res) => {
  const acceptsHtml = req.accepts('html', 'json') === 'html';
  if (acceptsHtml && !req.xhr) {
    const indexFile = hasWebBuild
      ? path.join(WEB_DIST, 'index.html')
      : path.join(__dirname, 'public', 'index.html');
    return res.sendFile(indexFile);
  }

  res.json({
    name: 'IrengCloud Universal API',
    semver: SEMVER_INFO,
    status: 'online',
    documentation: 'https://apiku.irengcloud.com',
    swagger_ui: '/docs',
    swagger_yaml: '/swagger.yaml',
    swagger_json: '/swagger.json',
    api_catalog: '/api/v1/catalog',
    categories: {
      hadits_digital: {
        description: 'Modul Hadits Digital 9 Imam',
        endpoints: {
          books: '/api/v1/hadits/books',
          search: '/api/v1/hadits/search?q={query}',
          single: '/api/v1/hadits/{imam}/{number}',
          list: '/api/v1/hadits/{imam}?page=1&limit=20',
        },
      },
      layanan_islami: {
        description: 'Modul Jadwal Sholat Indonesia & Kumpulan Khutbah MUI',
        endpoints: {
          sholat_kota: '/api/v1/sholat/kota?q={nama_kota}',
          sholat_jadwal: '/api/v1/sholat/jadwal?kota={nama_kota}&bulan={bulan}&tahun={tahun}',
          quran_surat: '/api/v1/quran/surat',
          quran_detail: '/api/v1/quran/surat/{nomor}',
          quran_tafsir: '/api/v1/quran/tafsir/{nomor}',
          quran_search: '/api/v1/quran/search?q={kata_kunci}&page={page}&size={size}',
          khutbah_list: '/api/v1/khutbah?page=1&per_page=20',
          khutbah_detail: '/api/v1/khutbah/detail?url={link_khutbah_mui}',
          wirid_dzikir: '/api/v1/wirid?category={slug}',
          doa_pilihan: '/api/v1/doa?category={slug}',
          maulid: '/api/v1/maulid?category={slug}',
          tahlil: '/api/v1/tahlil',
          tahlil_detail: '/api/v1/tahlil/{nomor}',
        },
      },
      budaya_aksara: {
        description: 'Modul Transliterasi Budaya Aksara Jawa Native',
        endpoints: {
          aksara_latin_to_jawa: '/api/v1/aksara/latin-to-jawa?text={teks_latin}',
          aksara_jawa_to_latin: '/api/v1/aksara/jawa-to-latin?text={teks_jawa}',
        },
      },
      media_downloader: {
        description: 'Modul Downloader Media Social Network & File Hoster',
        endpoints: {
          instagram: '/api/v1/instagram?url={link_ig}',
          facebook: '/api/v1/fbdl?url={link_fb}',
          threads: '/api/v1/threads?url={link_threads}',
          youtube: '/api/v1/ytdl?url={link_yt}&quality=360',
          twitter: '/api/v1/twitter?url={link_tweet}',
          tiktok: '/api/v1/tiktok?url={link_tiktok}',
          tiktok2: '/api/v1/tiktok2?url={link_tiktok}',
          mediafire: '/api/v1/mediafire?url={link_mediafire}',
        },
      },
    },
  });
});

// Register All V1 API Routes
app.use('/api/v1', apiRouter);

// Compatibility fallback for legacy /api/hadits
app.use('/api/hadits', (req, res) => {
  res.redirect(301, `/api/v1/hadits${req.url}`);
});

// SPA fallback: serve React index.html untuk navigasi client-side.
// Ditaruh setelah routes docs/api/"/", sebelum 404 handler. Exclude paths
// yang sudah di-handle atau milik file statis.
if (hasWebBuild) {
  app.use(express.static(WEB_DIST, { index: false }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.xhr) return next();
    const p = req.path;
    if (
      p.startsWith('/api/') ||
      p === '/api' ||
      p.startsWith('/docs') ||
      p.startsWith('/swagger') ||
      p.startsWith('/llms') ||
      p.startsWith('/.well-known/llms.txt') ||
      p.startsWith('/ai/docs') ||
      p === '/robots.txt' ||
      p === '/sitemap.xml' ||
      p === '/google6d58d0aac2204bc2.html' ||
      p.includes('.')
    ) {
      return next();
    }
    res.sendFile(path.join(WEB_DIST, 'index.html'));
  });
}

// 404 Not Found Handler for Web Pages and API Endpoints
app.use((req, res) => {
  res.status(404);

  // If request is for an API endpoint
  if (req.originalUrl.startsWith('/api/')) {
    return res.json({
      success: false,
      error: 'Endpoint API tidak ditemukan.',
      requested_url: req.originalUrl,
      documentation: 'https://apiku.irengcloud.com',
    });
  }

  // Otherwise, serve static Notus Green 404 HTML Error Page
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Global Error Handler (500)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[INFO] IrengCloud Universal API (v${APP_VERSION}) berjalan di port ${PORT}`);
});
