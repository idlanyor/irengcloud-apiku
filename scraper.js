import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import http from 'http';
import https from 'https';
import axios from 'axios';

// Daftar 9 Kitab Imam dan Estimasi Jumlah Hadits di hadits.in
const DAFTAR_KITAB = {
  bukhari: { nama: 'Shahih Bukhari', total: 7008 },
  muslim: { nama: 'Shahih Muslim', total: 5362 },
  abudaud: { nama: 'Sunan Abu Daud', total: 4590 },
  tirmidzi: { nama: 'Sunan Tirmidzi', total: 3956 },
  nasai: { nama: 'Sunan Nasa`i', total: 5662 },
  ibnumajah: { nama: 'Sunan Ibnu Majah', total: 4332 },
  malik: { nama: 'Muwatha Malik', total: 1594 },
  ahmad: { nama: 'Musnad Ahmad', total: 26363 },
  darimi: { nama: 'Sunan Darimi', total: 3367 },
};

const DELAY_MS = parseInt(process.env.DELAY_MS || '100');
const DATA_DIR = './data';

let requestCount = 0;

function localRoute(label, family) {
  return {
    label,
    httpAgent: new http.Agent({ family }),
    httpsAgent: new https.Agent({ family }),
    cookies: '',
  };
}

const PROXY_NODES = [
  localRoute('Lokal IPv4', 4),
  localRoute('Lokal IPv6', 6),
];

function nextProxy() {
  const proxy = PROXY_NODES[requestCount % PROXY_NODES.length];
  requestCount++;
  return proxy;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeSingleHadits(imam, noHadits, retry = 3) {
  const url = `https://hadits.in/${imam}/${noHadits}`;
  let lastProxy = null;

  for (let attempt = 0; attempt <= retry; attempt++) {
    const proxy = nextProxy();
    lastProxy = proxy;

    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
      };
      if (proxy.cookies) headers['Cookie'] = proxy.cookies;

      const res = await axios.get(url, {
        headers,
        timeout: 8000,
        httpAgent: proxy.httpAgent,
        httpsAgent: proxy.httpsAgent,
        proxy: false,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (res.status === 429) {
        console.warn(`\n⚠️  Rate limited! Jeda 15s...`);
        await sleep(15000);
        attempt--; // Jangan hitung sebagai attempt
        continue;
      }

      if (res.status === 404) return null;
      if (res.status >= 400) throw new Error(`HTTP ${res.status}`);

      const setCookie = res.headers['set-cookie'];
      if (setCookie) proxy.cookies = setCookie[0]?.split(';')[0] || '';

      const html = res.data;
      const $ = cheerio.load(html);

      const terjemahan = $('#terjemah_container').text().trim();
      if (!terjemahan) return null;

      let bab = '';
      let kitab = '';
      $('script').each((_, script) => {
        const content = $(script).html() || '';
        if (content.includes('window.data')) {
          const babMatch = content.match(/bab\s*:\s*'([^']+)'/);
          const kitabMatch = content.match(/kitab\s*:\s*'([^']+)'/);
          if (babMatch) bab = babMatch[1];
          if (kitabMatch) kitab = kitabMatch[1];
        }
      });

      return { number: noHadits, kitab, bab, id: terjemahan, _ip: proxy.label };
    } catch (error) {
      console.warn(`⚠️  ${proxy.label} gagal untuk ${imam} no ${noHadits}: ${error.message}`);
      if (attempt < retry) {
        await sleep(500 * (attempt + 1));
      }
    }
  }

  console.error(`❌ Gagal ${imam} no ${noHadits} setelah ${retry + 1} percobaan [terakhir: ${lastProxy?.label}]`);
  return null;
}

export async function scrapeKitab(imamKey, startFrom = 1, limit = null) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${imamKey}.json`);

  let existingData = [];
  try {
    existingData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  } catch { /* File belum ada */ }

  const scrapedNumbers = new Set(existingData.map((d) => d.number));
  const kitabInfo = DAFTAR_KITAB[imamKey] || { nama: imamKey, total: 1000 };
  const endNumber = limit ? Math.min(startFrom + limit - 1, kitabInfo.total) : kitabInfo.total;

  console.log(`🚀 [${kitabInfo.nama}] ${existingData.length}/${kitabInfo.total} tersimpan...`);

  for (let i = startFrom; i <= endNumber; i++) {
    if (scrapedNumbers.has(i)) continue;

    const item = await scrapeSingleHadits(imamKey, i);
    if (item) {
      const { _ip, ...data } = item;
      existingData.push(data);
      console.log(`[${_ip}] No ${i}/${kitabInfo.total} — ${item.kitab}`);
    }

    if (existingData.length % 20 === 0 || i === endNumber) {
      existingData.sort((a, b) => a.number - b.number);
      await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    }

    await sleep(DELAY_MS);
  }

  console.log(`🎉 [${kitabInfo.nama}] selesai! Total: ${existingData.length} hadits.`);
}

async function scrapeAllBooks() {
  console.log(`⚙️  Mode: IPv4/IPv6 Lokal | Delay: ${DELAY_MS}ms`);
  console.log(`   ${PROXY_NODES.map((node) => node.label).join('\n   ')}\n`);

  for (const imamKey of Object.keys(DAFTAR_KITAB)) {
    console.log(`\n========================================`);
    console.log(`📌 KITAB: ${imamKey.toUpperCase()}`);
    console.log(`========================================`);
    await scrapeKitab(imamKey);
  }
  console.log('\n🏆 SELURUH 9 KITAB HADITS BERHASIL DI-SCRAPE LENGKAP!');
}

scrapeAllBooks()
  .catch((error) => {
    console.error(`❌ Scraper berhenti: ${error.message}`);
    process.exitCode = 1;
  });
