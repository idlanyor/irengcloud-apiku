/**
 * Dynamic OpenAPI 3.0 (Swagger) Specification Generator
 * Serves OpenAPI spec in both JSON & YAML format.
 *
 * DERIVE dari config/apiCatalog.js (satu sumber kebenaran) — jangan edit
 * definisi endpoint di sini. Tambah/ubah endpoint hanya di apiCatalog.js.
 */
import { API_CATEGORIES, API_ENDPOINTS } from './apiCatalog.js';
import { APP_VERSION } from './version.js';

/** Map type param frontend → OpenAPI schema type. */
function mapType(type) {
  if (type === 'number') return 'integer';
  if (type === 'boolean') return 'boolean';
  return 'string';
}

/** Param catalog → OpenAPI parameter object. */
function toSwaggerParam(p) {
  const schema = {
    type: mapType(p.type),
    ...(p.default !== undefined ? { default: p.default } : {}),
    ...(p.options ? { enum: p.options } : {}),
  };
  return {
    name: p.key,
    in: p.in,
    ...(p.required ? { required: true } : {}),
    ...(p.description ? { description: p.description } : {}),
    schema,
  };
}

/** requestBody untuk method POST — derive dari param required pertama. */
function toRequestBody(params) {
  const required = (params || []).filter((p) => p.required && p.in === 'query').map((p) => p.key);
  if (!required.length) return undefined;
  const properties = {};
  for (const key of required) properties[key] = { type: mapType(params.find((p) => p.key === key).type) };
  return {
    required: true,
    content: {
      'application/json': {
        schema: { type: 'object', required, properties },
      },
    },
  };
}

export function generateOpenApiSpec() {
  // Build tags dari kategori — otomatis termasuk 'Informasi & Cuaca' yang dulu tertinggal.
  const tags = API_CATEGORIES.map((c) => ({ name: c.swaggerTag, description: c.description }));

  const paths = {
    '/api/v1/animasu/home': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Animasu Beranda Anime',
        description: 'Mengambil daftar anime sedang tayang (ongoing) dan baru ditambah dari Animasu.',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          '200': { description: 'Daftar Anime Beranda Animasu' },
        },
      },
    },
      '/api/v1/checkhost/ip-info': {
        get: {
          tags: ['Informasi & Cuaca'],
          summary: 'CheckHost IP & Host Info',
          description: 'Mengambil lokasi geografis, ASN, ISP, timezone, dan kordinat IP/Domain.',
          parameters: [
            { name: 'host', in: 'query', required: false, schema: { type: 'string', default: 'google.com' } },
          ],
          responses: {
            '200': { description: 'Detail Informasi IP/Host' },
          },
        },
      },
      '/api/v1/checkhost/ping': {
        get: {
          tags: ['Informasi & Cuaca'],
          summary: 'CheckHost Global Ping Test',
          description: 'Melakukan uji ping ke target dari puluhan server monitoring global.',
          parameters: [
            { name: 'host', in: 'query', required: false, schema: { type: 'string', default: 'google.com' } },
          ],
          responses: {
            '200': { description: 'Hasil Ping Server Global' },
          },
        },
      },
      '/api/v1/checkhost/whois': {
        get: {
          tags: ['Informasi & Cuaca'],
          summary: 'Domain & IP WHOIS Lookup',
          description: 'Mengambil catatan registrasi domain / IP dari database WHOIS resmi.',
          parameters: [
            { name: 'domain', in: 'query', required: false, schema: { type: 'string', default: 'google.com' } },
          ],
          responses: {
            '200': { description: 'Catatan Record WHOIS' },
          },
        },
      },
    '/api/v1/komiku/home': {
      get: {
        tags: ['Manga & Komik'],
        summary: 'Komiku Beranda Komik',
        description: 'Mengambil daftar komik rekomendasi/ranking dan terbitan terbaru dari Komiku.org.',
        responses: {
          '200': { description: 'Daftar Komik Rekomendasi & Terbaru' },
        },
      },
    },
    '/api/v1/komiku/detail': {
      get: {
        tags: ['Manga & Komik'],
        summary: 'Detail Komik & Manga Komiku',
        description: 'Mengambil metadata komik, pengarang, genre, sinopsis, dan 400+ daftar chapter.',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string', default: 'tomb-raider-king' } },
        ],
        responses: {
          '200': { description: 'Detail & Daftar Chapter Komik' },
        },
      },
    },
    '/api/v1/komiku/chapter': {
      get: {
        tags: ['Manga & Komik'],
        summary: 'Baca Chapter Komik Komiku',
        description: 'Mengambil seluruh URL gambar halaman chapter komik lengkap dengan URL proxy anti-403 hotlink.',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string', default: 'tomb-raider-king-chapter-411' } },
        ],
        responses: {
          '200': { description: 'Daftar Gambar Halaman Chapter' },
        },
      },
    },
    '/api/v1/komiku/proxy-image': {
      get: {
        tags: ['Manga & Komik'],
        summary: 'Image Anti-Hotlink Proxy (Bypass 403)',
        description: 'Streaming gambar halaman komik dari img.komiku.org secara langsung dengan injection Referer valid.',
        parameters: [
          { name: 'url', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Binary Image Data Stream' },
        },
      },
    },
    '/api/v1/anichin/home': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'AniChin Beranda Donghua',
        description: 'Mengambil daftar rilis Donghua terbaru dan serial ongoing dari AniChin.',
        responses: {
          '200': { description: 'Daftar Donghua Terbaru & Ongoing' },
        },
      },
    },
    '/api/v1/anichin/search': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Cari Donghua di AniChin',
        description: 'Mencari judul Donghua Subtitle Indonesia di catalog AniChin.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', default: 'soul land' } },
        ],
        responses: {
          '200': { description: 'Hasil Pencarian Donghua' },
        },
      },
    },
    '/api/v1/anichin/detail': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Detail Donghua AniChin',
        description: 'Mengambil metadata lengkap Donghua, sinopsis, genre, dan 100+ daftar episode.',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string', default: 'soul-land-2-the-unrivaled-tang-sect' } },
        ],
        responses: {
          '200': { description: 'Detail & Daftar Episode Donghua' },
        },
      },
    },
    '/api/v1/anichin/episode': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Stream Episode Donghua AniChin',
        description: 'Dekode otomatis iframe player streaming & mirror server (OK.ru, Premium, Drive, dll).',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string', default: 'soul-land-2-the-unrivaled-tang-sect-episode-164-subtitle-indonesia' } },
        ],
        responses: {
          '200': { description: 'Stream Player & Decoded Mirror Servers' },
        },
      },
    },
    '/api/v1/animasu/search': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Cari Anime di Animasu',
        description: 'Mencari judul anime di katalog Animasu.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', default: 'naruto' } },
        ],
        responses: {
          '200': { description: 'Hasil Pencarian Anime Animasu' },
        },
      },
    },
    '/api/v1/animasu/detail': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Detail Anime Animasu',
        description: 'Mengambil metadata lengkap anime, sinopsis, rating, dan daftar episode.',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string', default: 'one-piece-gyojin-tou-hen' } },
        ],
        responses: {
          '200': { description: 'Detail & Daftar Episode Anime' },
        },
      },
    },
    '/api/v1/animasu/episode': {
      get: {
        tags: ['Anime & Streaming'],
        summary: 'Stream Episode Anime Animasu',
        description: 'Mengambil iframe player streaming & mirror server episode anime.',
        parameters: [
          { name: 'slug', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Stream Player & Mirror Servers' },
        },
      },
    },
  };
  for (const ep of API_ENDPOINTS) {
    const swaggerTag = API_CATEGORIES.find((c) => c.key === ep.category)?.swaggerTag || 'Lainnya';
    const pathObj = {};

    for (const method of ep.methods) {
      const op = {
        tags: [swaggerTag],
        summary: ep.summary || ep.name,
        description: ep.description,
        ...(method === 'GET' && ep.params.length ? { parameters: ep.params.map(toSwaggerParam) } : {}),
        responses: {
          '200': { description: ep.summary || 'Sukses' },
          ...(ep.key === 'hadits-single' || ep.key === 'lirik-detail' ? { '404': { description: 'Data tidak ditemukan' } } : {}),
        },
      };

      if (method === 'POST') {
        const body = toRequestBody(ep.params);
        if (body) op.requestBody = body;
      }

      pathObj[method.toLowerCase()] = op;
    }
    paths[ep.path] = pathObj;
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'IrengCloud Universal API Suite',
      version: APP_VERSION,
      description: 'Platform REST API gratis & serbaguna yang mencakup Database Hadits Digital 9 Imam (dengan pencarian SQLite FTS5), Layanan Islami (Jadwal Sholat Indonesia, Khutbah MUI, Wirid/Ratib/Hizib, Doa Islami, & Arsip Dokumen NU), Transliterasi Aksara Jawa Native, serta Multi-Platform Media Extractor (Instagram, Facebook, Threads, YouTube, Twitter/X, TikTok, Mediafire).',
      contact: {
        name: 'IrengCloud API Engine',
        url: 'https://apiku.irengcloud.com',
      },
    },
    servers: [
      {
        url: 'https://apiku.irengcloud.com',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:8410',
        description: 'Local Development Server',
      },
    ],
    tags,
    paths,
    components: {
      schemas: {
        Hadits: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            imam: { type: 'string', example: 'bukhari' },
            number: { type: 'integer', example: 1 },
            kitab: { type: 'string', example: 'Permulaan Wahyu' },
            bab: { type: 'string', example: 'Bagaimana permulaan wahyu diturunkan' },
            terjemahan: {
              type: 'string',
              example: 'Telah menceritakan kepada kami Al Humaidi Abdullah bin Az Zubair dia berkata...',
            },
          },
        },
      },
    },
  };
}

/**
 * Convert JSON Object to YAML String generator
 * @param {Object} obj
 */
export function jsonToYaml(obj, indent = 0) {
  const spacing = ' '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${spacing}${key}: null\n`;
    } else if (Array.isArray(value)) {
      yaml += `${spacing}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          const itemYaml = jsonToYaml(item, indent + 4).trim();
          const firstLine = itemYaml.split('\n')[0];
          const restLines = itemYaml.split('\n').slice(1).map(l => `${spacing}  ${l}`).join('\n');
          yaml += `${spacing}- ${firstLine}\n`;
          if (restLines) yaml += `${restLines}\n`;
        } else {
          yaml += `${spacing}- ${JSON.stringify(item)}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${spacing}${key}:\n${jsonToYaml(value, indent + 2)}`;
    } else if (typeof value === 'string') {
      const formatted = value.includes('\n') || value.includes(':') || value.includes('#')
        ? JSON.stringify(value)
        : value;
      yaml += `${spacing}${key}: ${formatted}\n`;
    } else {
      yaml += `${spacing}${key}: ${value}\n`;
    }
  }

  return yaml;
}
