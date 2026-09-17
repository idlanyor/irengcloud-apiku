import { Router } from 'express';
import { createContainer } from '../config/container.js';

export function createApiRouter(container = createContainer()) {
  const router = Router();
  const { routers } = container;

  // Kategori 1: Hadits Digital, Islami & Budaya (/api/v1/hadits/..., /api/v1/sholat/..., /api/v1/aksara/..., /api/v1/khutbah/..., /api/v1/nu-download, /api/v1/wirid, /api/v1/doa)
  router.use('/hadits', routers.hadits);
  router.use('/sholat', routers.sholat);
  router.use('/quran', routers.quran);
  router.use('/aksara', routers.aksara);
  router.use('/khutbah', routers.khutbah);
  router.use('/nu-download', routers.nuDownload);
  router.use('/wirid', routers.wirid);
  router.use('/doa', routers.doa);
  router.use('/maulid', routers.maulid);
  router.use('/tahlil', routers.tahlil);
  router.use('/lirik', routers.lirik);
  router.use('/bmkg', routers.bmkg);
  router.use('/animasu', routers.animasu);
  router.use('/anichin', routers.anichin);
  router.use('/otakudesu', routers.otakudesu);
  router.use('/komiku', routers.komiku);
  router.use('/checkhost', routers.checkhost);
  router.use('/tv', routers.tv);
  router.use('/kci', routers.kci);
  router.use('/krl', routers.kci);
  router.use('/enka', routers.enka);
  router.use('/tempmail', routers.tempmail);
  router.use('/upload', routers.upload);
  router.use('/stats', routers.stats);
  router.use('/pddikti', routers.pddikti);

  // Kategori 2: Media & File Downloader (/api/v1/...)
  router.use('/instagram', routers.downloader.instagramRouter);
  router.use('/fbdl', routers.downloader.fbdlRouter);
  router.use('/facebook', routers.downloader.fbdlRouter);
  router.use('/threads', routers.downloader.threadsRouter);
  router.use('/threadsdl', routers.downloader.threadsRouter);
  router.use('/ytdl', routers.downloader.ytdlRouter);
  router.use('/ytdl2', routers.downloader.ytdl2Router);
  router.use('/ytdl3', routers.downloader.ytdl3Router);
  router.use('/youtube', routers.downloader.ytdlRouter);
  router.use('/youtube2', routers.downloader.ytdl2Router);
  router.use('/youtube3', routers.downloader.ytdl3Router);
  router.use('/twitter', routers.downloader.twitterRouter);
  router.use('/xdl', routers.downloader.twitterRouter);
  router.use('/tiktok', routers.downloader.tiktokRouter);
  router.use('/tiktok2', routers.downloader.tiktok2Router);
  router.use('/ttdl', routers.downloader.tiktokRouter);
  router.use('/ttdl2', routers.downloader.tiktok2Router);
  router.use('/mediafire', routers.downloader.mediafireRouter);
  router.use('/mfdl', routers.downloader.mediafireRouter);
  router.use('/pinterest', routers.downloader.pinterestRouter);

  return router;
}

export default createApiRouter();
