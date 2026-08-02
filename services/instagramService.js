import axios from 'axios';

/**
 * Scrape Instagram using Googlebot SEO Trick (No Cookie Required)
 */
export async function scrapeIG(url) {
    try {
        const res = await axios.get(url, {
            headers: {
                // Trik utama: Kita menyamar sebagai Googlebot agar IG merender HTML penuh 
                // beserta JSON data (untuk kebutuhan SEO Google), tanpa menahan datanya di balik login wall!
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });
        
        const html = res.data;
        
        // Cari semua block video_versions di HTML (bisa banyak kalau carousel)
        const videoMatches = [...html.matchAll(/"video_versions":\[(.*?)\]/g)];
        const imageMatches = [...html.matchAll(/"image_versions2":\{"candidates":\[(.*?)\]\}/g)];
        
        // Helper untuk membersihkan URL dari Unicode double-escape (seperti \\u0025)
        const cleanUrl = (url) => {
            if (!url) return url;
            return url.replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16))).replace(/\\\//g, '/');
        };

        let mediaArr = [];

        // Parsing Videos
        for (const match of videoMatches) {
            try {
                const videoData = JSON.parse('[' + match[1] + ']');
                if (videoData.length > 0) {
                    mediaArr.push({
                        type: 'video',
                        url: cleanUrl(videoData[0].url)
                    });
                }
            } catch (e) {
                const mp4 = match[1].match(/"url":"(.*?)"/);
                if (mp4) {
                    mediaArr.push({ type: 'video', url: cleanUrl(mp4[1]) });
                }
            }
        }

        // Jika tidak ada video sama sekali, ambil gambar pertama atau semua gambar
        if (mediaArr.length === 0) {
            for (const match of imageMatches) {
                try {
                    const imgData = JSON.parse('[' + match[1] + ']');
                    if (imgData.length > 0) {
                        mediaArr.push({
                            type: 'image',
                            url: cleanUrl(imgData[0].url)
                        });
                    }
                } catch (e) {
                    const jpg = match[1].match(/"url":"(.*?)"/);
                    if (jpg) {
                        mediaArr.push({ type: 'image', url: cleanUrl(jpg[1]) });
                    }
                }
            }
        }

        // Unik-kan URL agar tidak double (karena IG sering menulis object yang sama berulang kali di HTML)
        const uniqueMedia = [];
        const seenUrls = new Set();
        for (const m of mediaArr) {
            if (!seenUrls.has(m.url)) {
                seenUrls.add(m.url);
                uniqueMedia.push(m);
            }
        }

        if (uniqueMedia.length > 0) {
            return {
                success: true,
                data: {
                    media: uniqueMedia,
                    caption: "Scraped via SEO Trick (No Cookie)",
                    video_url: uniqueMedia[0].type === 'video' ? uniqueMedia[0].url : null,
                    thumbnail: uniqueMedia[0].type === 'image' ? uniqueMedia[0].url : null
                }
            };
        } else {
            return {
                success: false,
                error: 'Media URL tidak ditemukan di dalam HTML. Kemungkinan post diproteksi secara khusus.'
            };
        }

    } catch (e) {
        return {
            success: false,
            error: `Gagal scrape IG via SEO: ${e.message}`
        };
    }
}

// Alias untuk kompatibilitas
export const scrapeReel = scrapeIG;
