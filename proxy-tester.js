import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs/promises';

const PROXIFLY_HTTPS_CDN = 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/https/data.json';
const PROXIFLY_HTTP_CDN = 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/http/data.json';
const OUTPUT_FILE = './data/working_proxies.json';

const TEST_URL = 'https://hadits.in/bukhari/1';  // Target akhir
const TIMEOUT_MS = 5000;
const CONCURRENCY = 30; // Cek 30 proxy secara bersamaan

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testProxy(proxyUrl) {
  try {
    const agent = new HttpsProxyAgent(proxyUrl);
    const res = await axios.get(TEST_URL, {
      httpsAgent: agent,
      httpAgent: agent,
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const ok = res.status === 200 && res.data.includes('terjemah_container');
    return ok ? proxyUrl : null;
  } catch {
    return null;
  }
}

async function runBatch(proxies) {
  return Promise.all(proxies.map((p) => testProxy(p)));
}

async function main() {
  console.log('🌐 Mengambil proxy dari Proxifly CDN...');

  let proxyList = [];
  try {
    const r1 = await axios.get(PROXIFLY_HTTPS_CDN, { timeout: 10000 });
    proxyList.push(...r1.data.map((p) => p.proxy));
    console.log(`  HTTPS: ${r1.data.length} proxy`);
  } catch (e) {
    console.warn('  HTTPS CDN gagal:', e.message);
  }

  try {
    const r2 = await axios.get(PROXIFLY_HTTP_CDN, { timeout: 10000 });
    proxyList.push(...r2.data.map((p) => p.proxy));
    console.log(`  HTTP: ${r2.data.length} proxy`);
  } catch (e) {
    console.warn('  HTTP CDN gagal:', e.message);
  }

  console.log(`\n📡 Total ${proxyList.length} proxy ditemukan. Mulai tes konektivitas ke ${TEST_URL}...`);
  console.log(`   Concurrency: ${CONCURRENCY} parallel | Timeout: ${TIMEOUT_MS}ms per proxy\n`);

  const workingProxies = [];
  let tested = 0;

  for (let i = 0; i < proxyList.length; i += CONCURRENCY) {
    const batch = proxyList.slice(i, i + CONCURRENCY);
    const results = await runBatch(batch);
    const alive = results.filter(Boolean);
    workingProxies.push(...alive);
    tested += batch.length;

    const pct = Math.round((tested / proxyList.length) * 100);
    process.stdout.write(`\r🔍 Progress: ${tested}/${proxyList.length} (${pct}%) | Hidup: ${workingProxies.length}`);
  }

  console.log(`\n\n✅ Selesai! ${workingProxies.length} dari ${proxyList.length} proxy bisa terhubung ke hadits.in`);

  await fs.mkdir('./data', { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(workingProxies, null, 2), 'utf-8');
  console.log(`💾 Daftar proxy hidup disimpan ke ${OUTPUT_FILE}`);

  if (workingProxies.length === 0) {
    console.log('⚠️  Tidak ada proxy yang hidup. Scraping tidak bisa berjalan 100% via proxy.');
  }
}

main();
