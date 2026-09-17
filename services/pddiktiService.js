/**
 * PDDIKTI Service — API PDDIKTI Kemdiktisaintek (Mahasiswa/PT/Prodi/Dosen)
 * Sniffing result: api-pddikti subdomain terbuka tanpa CF challenge,
 * cukup header Origin + Referer dari web domain. Response pencarian
 * terenkripsi AES-256-CBC (key/IV bocor di bundle JS frontend), detail plaintext.
 */
import crypto from 'crypto';
import defaultAxios from 'axios';
import defaultLogger from '../utils/logger.js';

const API_BASE = 'https://api-pddikti.kemdiktisaintek.go.id';
const WEB_ORIGIN = 'https://pddikti.kemdiktisaintek.go.id';

const AES_KEY = Buffer.from('ecHyOABV9jgO2/+dzE49cfexQpr/H4SiAYWrHLD7PQ0=', 'base64');
const AES_IV = Buffer.from('Gu3qsglYJhOOm0eXf6aN2w==', 'base64');
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// tipe pencarian di path API: all / mhs / dosen / pt / prodi
const SEARCH_TYPES = new Set(['all', 'mhs', 'dosen', 'pt', 'prodi']);

function decryptData(enc) {
  const cipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
  const buf = Buffer.concat([cipher.update(Buffer.from(enc, 'base64')), cipher.final()]);
  // Plaintext tanpa PKCS7 padding — parse langsung, fallback strip pad.
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    const pad = buf[buf.length - 1];
    if (pad < 1 || pad > 16) return null;
    return JSON.parse(buf.slice(0, buf.length - pad).toString('utf8'));
  }
}

export function createPddiktiService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const headers = {
    Accept: 'application/json, text/plain, */*',
    'User-Agent': USER_AGENT,
    Origin: WEB_ORIGIN,
    Referer: `${WEB_ORIGIN}/`,
  };

  async function apiGet(path) {
    const { data } = await httpClient.get(`${API_BASE}${path}`, { headers, timeout: 15000 });
    if (data && data.status === 'success' && typeof data.data === 'string' && data.data.length > 20) {
      const decrypted = decryptData(data.data);
      if (decrypted) return decrypted;
    }
    return data?.data ?? data;
  }

  /**
   * Cari di PDDIKTI. tipe: all | mhs | dosen | pt | prodi
   */
  async function search({ q, tipe = 'all' } = {}) {
    const key = SEARCH_TYPES.has(tipe) ? tipe : 'all';
    return apiGet(`/pencarian/enc/${key}/${encodeURIComponent(q)}`);
  }

  /**
   * Detail dari encrypted id hasil pencarian.
   * tipe: mhs | dosen | pt | prodi → path berbeda per tipe.
   */
  const DETAIL_PATHS = {
    mhs: (id) => `/detail/mhs/${id}`,
    dosen: (id) => `/dosen/profile/${id}`,
    pt: (id) => `/pt/detail/${id}`,
    prodi: (id) => `/prodi/detail/${id}`,
  };

  async function detail(tipe, id) {
    const build = DETAIL_PATHS[tipe];
    if (!build) return { error: `Tipe detail tidak valid: ${Object.keys(DETAIL_PATHS).join('|')}` };
    return apiGet(build(encodeURIComponent(id)));
  }

  // Sub-endpoint terverifikasi. data_type sesuai daftar tiap tipe.
  const SUB_PATHS = {
    pt: {
      'jumlah-mahasiswa': '/pt/jumlah-mahasiswa/',
      'jumlah-dosen': '/pt/jumlah-dosen/',
      'jumlah-prodi': '/pt/jumlah-prodi/',
      rasio: '/pt/rasio/',
      'waktu-studi': '/pt/waktu-studi/',
      'graduation-rate': '/pt/graduation-rate/',
      'cost-range': '/pt/cost-range/',
      'name-histories': '/pt/name-histories/',
    },
    prodi: {
      desc: '/prodi/desc/',
      'name-histories': '/prodi/name-histories/',
      'num-students-lecturers': '/prodi/num-students-lecturers/',
      'cost-range': '/prodi/cost-range/',
    },
    dosen: {
      'study-history': '/dosen/study-history/',
      'teaching-history': '/dosen/teaching-history/',
      'portofolio-penelitian': '/dosen/portofolio/penelitian/',
      'portofolio-pengabdian': '/dosen/portofolio/pengabdian/',
      'portofolio-karya': '/dosen/portofolio/karya/',
      'portofolio-paten': '/dosen/portofolio/paten/',
    },
  };

  async function subData(tipe, dataType, id) {
    const map = SUB_PATHS[tipe];
    const path = map && map[dataType];
    if (!path) {
      const valid = Object.keys(map || {}).join('|');
      return { error: `Data '${dataType}' tidak valid untuk ${tipe}${valid ? ` — pilihan: ${valid}` : ''}` };
    }
    return apiGet(`${path}${encodeURIComponent(id)}`);
  }

  return {
    search,
    detail,
    detailMhs: (id) => detail('mhs', id),
    subData,
    decryptData,
  };
}

export default createPddiktiService();
