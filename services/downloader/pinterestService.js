import defaultLogger from '../../utils/logger.js';

export function createPinterestService({ httpClient, cheerio, logger = defaultLogger } = {}) {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  function decodeJwt(tokenUrl) {
    if (!tokenUrl) return null;
    try {
      const urlObj = new URL(tokenUrl);
      const token = urlObj.searchParams.get('token');
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length < 2) return null;

      const payload = parts[1];
      const decodedStr = Buffer.from(payload, 'base64url').toString('utf8');
      return JSON.parse(decodedStr);
    } catch {
      return null;
    }
  }

  function tokenCdnUrl(tokenUrl) {
    const jwt = decodeJwt(tokenUrl);
    return jwt?.url || null;
  }

  function tokenImgUrl(tokenUrl) {
    const jwt = decodeJwt(tokenUrl);
    if (jwt?.url) {
      return jwt.url.replace('60x60_RS', '736x').replace('/60x60_RS/', '/736x/');
    }
    return null;
  }

  async function tryPinload(targetUrl) {
    const pinloadUrl = `https://pinload.net/download/?url=${encodeURIComponent(targetUrl)}`;
    const res = await httpClient.get(pinloadUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });

    const $ = cheerio.load(res.data);
    const videoUrl = $('a.download__item__info__actions__button').attr('href') || null;
    const thumbTokenUrl = $('.download__item__user_info img, .download__item__thumbnail, .download__item img').attr('src') || null;
    const thumbUrl = tokenImgUrl(thumbTokenUrl);

    if (!videoUrl && !thumbUrl) {
      throw new Error('Media tidak ditemukan via pinload.');
    }

    const cdnUrl = tokenCdnUrl(videoUrl);

    return {
      author: 'Pinterest User',
      description: 'Pinterest Media',
      thumbnail: thumbUrl,
      video: videoUrl,
      image: videoUrl ? null : thumbUrl,
      cdn_url: cdnUrl,
    };
  }

  function extractFromLdJson($, videoUrl, imageUrl) {
    let vAcc = videoUrl;
    let iAcc = imageUrl;

    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const json = JSON.parse($(script).text());
        if (json['@type'] === 'VideoObject') {
          vAcc = json.contentUrl || vAcc;
          iAcc = iAcc || json.thumbnailUrl;
        } else if (json.video && json.video.contentUrl) {
          vAcc = json.video.contentUrl || vAcc;
          iAcc = iAcc || json.thumbnailUrl;
        }
      } catch {
        // ignore JSON parse error
      }
    });

    return { videoUrl: vAcc, imageUrl: iAcc };
  }

  function extractFromPwsInitial($, videoUrl, imageUrl) {
    const scriptTag = $('#__PWS_INITIAL_PROPS__');
    if (scriptTag.length) {
      try {
        const json = JSON.parse(scriptTag.text());
        const redux = json?.initialReduxState || {};
        const pins = redux?.resources?.PinResource || redux?.pins || {};
        const pin = Object.values(pins)[0] || {};

        const newVideo =
          videoUrl ||
          pin?.videos?.video_list?.V_720P?.url ||
          pin?.videos?.video_list?.V_HLSV3?.url ||
          pin?.videos?.video_list?.v_720p?.url ||
          pin?.story_pin_data?.pages?.[0]?.blocks?.[0]?.video?.video_list?.V_720P?.url;

        const newImage = imageUrl || pin?.images?.orig?.url;
        return { videoUrl: newVideo, imageUrl: newImage };
      } catch {
        // ignore JSON error
      }
    }
    return { videoUrl, imageUrl };
  }

  async function tryDirect(targetUrl) {
    const res = await httpClient.get(targetUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    const $ = cheerio.load(res.data);

    let videoUrl =
      $('meta[property="og:video"]').attr('content') ||
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[name="twitter:player:stream"]').attr('content') ||
      null;

    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null;

    const title = $('meta[property="og:title"]').attr('content') || 'Pinterest Media';

    if (!videoUrl) {
      const ldRes = extractFromLdJson($, videoUrl, imageUrl);
      videoUrl = ldRes.videoUrl;
      imageUrl = ldRes.imageUrl;
    }

    const pwsRes = extractFromPwsInitial($, videoUrl, imageUrl);
    videoUrl = pwsRes.videoUrl;
    imageUrl = pwsRes.imageUrl;

    if (!imageUrl && !videoUrl) {
      throw new Error('Media Pinterest tidak ditemukan.');
    }

    return {
      author: 'Pinterest User',
      description: title,
      thumbnail: imageUrl,
      video: videoUrl,
      image: videoUrl ? null : imageUrl,
    };
  }

  return {
    async fetch(url) {
      if (!url) throw new Error('Parameter "url" Pinterest wajib diisi');
      logger.info(`Fetching Pinterest media for ${url}`, 'PINTEREST');

      try {
        return await tryPinload(url);
      } catch (err) {
        logger.warn(`Pinload failed, falling back to direct scrape: ${err.message}`, 'PINTEREST');
        return await tryDirect(url);
      }
    },
  };
}
