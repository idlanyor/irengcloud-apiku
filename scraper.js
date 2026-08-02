import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

// Daftar 9 Kitab Imam dan Estimasi Jumlah Hadits di hadits.in
const DAFTAR_KITAB = {
  bukhari: { nama: 'Shahih Bukhari', total: 7008 },
  muslim: { nama: 'Shahih Muslim', total: 5362 },
  abudaud: { nama: 'Sunan Abu Daud', total: 4590 },
  tirmidzi: { nama: 'Sunan Tirmidzi', total: 3956 },
  nasai: { nama: 'Sunan Nasa`i', total: 5662 },
  ibnumajah: { nama: 'Sunan Ibnu Majah', total: 4332 },
  marik: { nama: 'Muwatha Malik', total: 1594 }, // di hadits.in kodenya 'malik'
  ahmad: { nama: 'Musnad Ahmad', total: 26363 },
  darimi: { nama: 'Sunan Darimi', total: 3367 },
};

const DELAY_MS = 200; // Jeda antar request (ms) agar aman
const DATA_DIR = './data';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeSingleHadits(imam, noHadits, retry = 3) {
  const url = `https://hadits.in/${imam}/${noHadits}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP Error ${res.status}`);
    }

    const html = await res.text();
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

    return {
      number: noHadits,
      kitab,
      bab,
      id: terjemahan,
    };
  } catch (err) {
    if (retry > 0) {
      await sleep(1000);
      return scrapeSingleHadits(imam, noHadits, retry - 1);
    }
    console.error(`❌ Gagal mengambil ${imam} no ${noHadits}: ${err.message}`);
    return null;
  }
}

async function scrapeKitab(imamKey, startFrom = 1, limit = null) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${imamKey}.json`);
  
  let existingData = [];
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    existingData = JSON.parse(fileContent);
    console.log(`📁 Menemukan data existing ${imamKey}: ${existingData.length} hadits.`);
  } catch {
    console.log(`📁 Membuat file baru untuk ${imamKey}.json...`);
  }

  const scrapedNumbers = new Set(existingData.map((d) => d.number));
  const kitabInfo = DAFTAR_KITAB[imamKey] || { nama: imamKey, total: 1000 };
  const endNumber = limit ? Math.min(startFrom + limit - 1, kitabInfo.total) : kitabInfo.total;

  console.log(`🚀 Memulai scraping [${kitabInfo.nama}] (No ${startFrom} s/d ${endNumber})...`);

  for (let i = startFrom; i <= endNumber; i++) {
    if (scrapedNumbers.has(i)) {
      console.log(`⏩ [${imamKey}] Hadits No ${i} sudah ada, melewatinya...`);
      continue;
    }

    const item = await scrapeSingleHadits(imamKey, i);
    if (item) {
      existingData.push(item);
      console.log(`✅ [${imamKey}] No ${i} tersimpan: ${item.kitab} (${item.bab.substring(0, 30)}...)`);
    } else {
      console.log(`⚠️ [${imamKey}] No ${i} kosong / tidak ditemukan.`);
    }

    // Auto-save tiap 10 hadits agar data tidak hilang jika proses terhenti
    if (i % 10 === 0 || i === endNumber) {
      existingData.sort((a, b) => a.number - b.number);
      await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    }

    await sleep(DELAY_MS);
  }

  console.log(`🎉 Scraping [${kitabInfo.nama}] selesai! Total: ${existingData.length} hadits disimpan di ${filePath}`);
}

// ----------------------------------------------------
// PENGGUNAAN
// ----------------------------------------------------
// Contoh 1: Scraping 5 hadits Bukhari untuk tes awal
scrapeKitab('bukhari', 1, 5);

// Contoh 2: Scraping seluruh hadits Bukhari (buka komentar di bawah)
// scrapeKitab('bukhari');
