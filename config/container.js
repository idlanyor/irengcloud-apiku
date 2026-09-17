import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../utils/logger.js';
import { createDatabaseConnection } from '../data/database.js';

// Services - Hadits & Islami & Aksara & NU & Wirid & Doa
import { createHaditsService } from '../services/hadits/haditsService.js';
import { createSholatService } from '../services/sholat/sholatService.js';
import { createQuranService } from '../services/quran/quranService.js';
import { createAksaraService } from '../services/aksara/aksaraService.js';
import { createKhutbahService } from '../services/khutbah/khutbahService.js';
import { createNuDownloadService } from '../services/nu/nuDownloadService.js';
import { createWiridService } from '../services/wirid/wiridService.js';
import { createDoaService } from '../services/doa/doaService.js';
import { createMaulidService } from '../services/maulid/maulidService.js';
import { createTahlilService } from '../services/tahlil/tahlilService.js';
import { createLirikService } from '../services/lirik/lirikService.js';
import { createBmkgService } from '../services/info/bmkgService.js';
import { createAnimasuService } from '../services/anime/animasuService.js';
import { createAnichinService } from '../services/anime/anichinService.js';
import { OtakudesuService } from '../services/anime/otakudesuService.js';
import { createKomikuService } from '../services/manga/komikuService.js';
import { createCheckHostService } from '../services/info/checkHostService.js';
import { createTvService } from '../services/info/tvService.js';
import { createKciService } from '../services/info/kciService.js';
import { createEnkaService } from '../services/info/enkaService.js';
import { createTempMailService } from '../services/tools/tempMailService.js';
import { createUploadService } from '../services/tools/uploadService.js';
import { createStatsService } from '../services/info/statsService.js';
import { resolveAdm4 } from '../services/info/wilayahResolver.js';
import { createPddiktiService } from '../services/pddiktiService.js';

// Services - Downloader
import { createInstagramService } from '../services/downloader/instagramService.js';
import { createFacebookService } from '../services/downloader/facebookService.js';
import { createThreadsService } from '../services/downloader/threadsService.js';
import { createYoutubeService } from '../services/downloader/youtubeService.js';
import { createYoutube2Service } from '../services/downloader/youtube2Service.js';
import { createYoutube3Service } from '../services/downloader/youtube3Service.js';
import { createTwitterService } from '../services/downloader/twitterService.js';
import { createTiktokService } from '../services/downloader/tiktokService.js';
import { createTiktok2Service } from '../services/downloader/tiktok2Service.js';
import { createMediafireService } from '../services/downloader/mediafireService.js';
import { createPinterestService } from '../services/downloader/pinterestService.js';

// Controllers - Hadits & Islami & Aksara & NU & Wirid & Doa
import { createHaditsController } from '../controllers/hadits/haditsController.js';
import { createSholatController } from '../controllers/sholat/sholatController.js';
import { createQuranController } from '../controllers/quran/quranController.js';
import { createAksaraController } from '../controllers/aksara/aksaraController.js';
import { createKhutbahController } from '../controllers/khutbah/khutbahController.js';
import { createNuDownloadController } from '../controllers/nu/nuDownloadController.js';
import { createWiridController } from '../controllers/wirid/wiridController.js';
import { createDoaController } from '../controllers/doa/doaController.js';
import { createMaulidController } from '../controllers/maulid/maulidController.js';
import { createTahlilController } from '../controllers/tahlil/tahlilController.js';
import { createLirikController } from '../controllers/lirik/lirikController.js';
import { createBmkgController } from '../controllers/info/bmkgController.js';
import { createAnimasuController } from '../controllers/anime/animasuController.js';
import { createAnichinController } from '../controllers/anime/anichinController.js';
import { OtakudesuController } from '../controllers/anime/otakudesuController.js';
import { createKomikuController } from '../controllers/manga/komikuController.js';
import { createCheckHostController } from '../controllers/info/checkHostController.js';
import { createTvController } from '../controllers/info/tvController.js';
import { createKciController } from '../controllers/info/kciController.js';
import { createEnkaController } from '../controllers/info/enkaController.js';
import { createTempMailController, createUploadController } from '../controllers/tools/toolsController.js';
import { createStatsController } from '../controllers/info/statsController.js';

// Controllers - Downloader
import { createInstagramController } from '../controllers/downloader/instagramController.js';
import { createFacebookController } from '../controllers/downloader/facebookController.js';
import { createThreadsController } from '../controllers/downloader/threadsController.js';
import { createYoutubeController } from '../controllers/downloader/youtubeController.js';
import { createYoutube2Controller } from '../controllers/downloader/youtube2Controller.js';
import { createYoutube3Controller } from '../controllers/downloader/youtube3Controller.js';
import { createTwitterController } from '../controllers/downloader/twitterController.js';
import { createTiktokController } from '../controllers/downloader/tiktokController.js';
import { createTiktok2Controller } from '../controllers/downloader/tiktok2Controller.js';
import { createMediafireController } from '../controllers/downloader/mediafireController.js';
import { createPinterestController } from '../controllers/downloader/pinterestController.js';

// Router Factories - Hadits & Islami & Aksara & NU & Wirid & Doa
import { createHaditsRouter } from '../routes/hadits/haditsRouter.js';
import { createSholatRouter } from '../routes/sholat/sholatRouter.js';
import { createQuranRouter } from '../routes/quran/quranRouter.js';
import { createAksaraRouter } from '../routes/aksara/aksaraRouter.js';
import { createKhutbahRouter } from '../routes/khutbah/khutbahRouter.js';
import { createNuDownloadRouter } from '../routes/nu/nuDownloadRouter.js';
import { createWiridRouter } from '../routes/wirid/wiridRouter.js';
import { createDoaRouter } from '../routes/doa/doaRouter.js';
import { createMaulidRouter } from '../routes/maulid/maulidRouter.js';
import { createTahlilRouter } from '../routes/tahlil/tahlilRouter.js';
import { createLirikRouter } from '../routes/lirik/lirikRouter.js';
import { createBmkgRouter } from '../routes/info/bmkgRouter.js';
import { createAnimasuRouter } from '../routes/anime/animasuRouter.js';
import { createAnichinRouter } from '../routes/anime/anichinRouter.js';
import { createOtakudesuRouter } from '../routes/anime/otakudesuRouter.js';
import { createKomikuRouter } from '../routes/manga/komikuRouter.js';
import { createCheckHostRouter } from '../routes/info/checkHostRouter.js';
import { createTvRouter } from '../routes/info/tvRouter.js';
import { createKciRouter } from '../routes/info/kciRouter.js';
import { createEnkaRouter } from '../routes/info/enkaRouter.js';
import { createTempMailRouter, createUploadRouter } from '../routes/tools/toolsRouter.js';
import { createStatsRouter } from '../routes/info/statsRouter.js';
import { createPddiktiRouter } from '../routes/pddikti.js';

// Router Factories - Downloader
import { createInstagramRouter } from '../routes/downloader/instagramRouter.js';
import { createFbdlRouter } from '../routes/downloader/fbdlRouter.js';
import { createThreadsRouter } from '../routes/downloader/threadsRouter.js';
import { createYtdlRouter } from '../routes/downloader/ytdlRouter.js';
import { createYtdl2Router } from '../routes/downloader/ytdl2Router.js';
import { createYtdl3Router } from '../routes/downloader/ytdl3Router.js';
import { createTwitterRouter } from '../routes/downloader/twitterRouter.js';
import { createTiktokRouter } from '../routes/downloader/tiktokRouter.js';
import { createTiktok2Router } from '../routes/downloader/tiktok2Router.js';
import { createMediafireRouter } from '../routes/downloader/mediafireRouter.js';
import { createPinterestRouter } from '../routes/downloader/pinterestRouter.js';

export function createContainer(customDeps = {}) {
  // 1. Singletons / Infra Dependencies
  const db = customDeps.db || createDatabaseConnection();
  const httpClient = customDeps.httpClient || axios;
  const appLogger = customDeps.logger || logger;
  const appCheerio = customDeps.cheerio || cheerio;

  // 2. Services Initialization (Categorized)
  const haditsService = createHaditsService({ db });
  const sholatService = createSholatService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const quranService = createQuranService({ httpClient, logger: appLogger });
  const aksaraService = createAksaraService({ logger: appLogger });
  const khutbahService = createKhutbahService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const nuDownloadService = createNuDownloadService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const wiridService = createWiridService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const doaService = createDoaService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const maulidService = createMaulidService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const tahlilService = createTahlilService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const lirikService = createLirikService({ httpClient, logger: appLogger });
  const bmkgService = createBmkgService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const animasuService = createAnimasuService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const anichinService = createAnichinService({ logger: appLogger });
  const otakudesuService = new OtakudesuService();
  const komikuService = createKomikuService({ logger: appLogger });
  const checkHostService = createCheckHostService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const tvService = createTvService({ httpClient, cheerio: appCheerio, logger: appLogger });
  const kciService = createKciService({ httpClient, logger: appLogger });
  const enkaService = createEnkaService({ httpClient, logger: appLogger });
  const tempMailService = createTempMailService({ httpClient, logger: appLogger });
  const uploadService = createUploadService({ logger: appLogger });
  const statsService = createStatsService();
  const pddiktiService = createPddiktiService({ httpClient, logger: appLogger });

  const downloaderServices = {
    instagramService: createInstagramService({ httpClient, logger: appLogger }),
    facebookService: createFacebookService({ httpClient, logger: appLogger }),
    threadsService: createThreadsService({ httpClient, logger: appLogger }),
    youtubeService: createYoutubeService({ httpClient, logger: appLogger }),
    youtube2Service: createYoutube2Service({ httpClient, logger: appLogger }),
    youtube3Service: createYoutube3Service({ httpClient, logger: appLogger }),
    twitterService: createTwitterService({ httpClient, logger: appLogger }),
    tiktokService: createTiktokService({ httpClient, cheerio: appCheerio, logger: appLogger }),
    tiktok2Service: createTiktok2Service({ httpClient, logger: appLogger }),
    mediafireService: createMediafireService({ httpClient, cheerio: appCheerio, logger: appLogger }),
    pinterestService: createPinterestService({ httpClient, cheerio: appCheerio, logger: appLogger }),
  };

  // 3. Controllers Initialization (Categorized)
  const haditsController = createHaditsController({ haditsService });
  const sholatController = createSholatController({ sholatService });
  const quranController = createQuranController({ quranService });
  const aksaraController = createAksaraController({ aksaraService });
  const khutbahController = createKhutbahController({ khutbahService });
  const nuDownloadController = createNuDownloadController({ nuDownloadService });
  const wiridController = createWiridController({ wiridService });
  const doaController = createDoaController({ doaService });
  const maulidController = createMaulidController({ maulidService });
  const tahlilController = createTahlilController({ tahlilService });
  const lirikController = createLirikController({ lirikService });
  const bmkgController = createBmkgController({ bmkgService, wilayahResolver: { resolveAdm4 } });
  const animasuController = createAnimasuController({ animasuService });
  const anichinController = createAnichinController({ anichinService });
  const otakudesuController = new OtakudesuController({ otakudesuService });
  const komikuController = createKomikuController({ komikuService, httpClient });
  const checkHostController = createCheckHostController({ checkHostService });
  const tvController = createTvController({ tvService });
  const kciController = createKciController({ kciService });
  const enkaController = createEnkaController({ enkaService });
  const tempMailController = createTempMailController({ tempMailService });
  const uploadController = createUploadController({ uploadService });
  const statsController = createStatsController({ statsService });

  const downloaderControllers = {
    instagramController: createInstagramController({ instagramService: downloaderServices.instagramService }),
    facebookController: createFacebookController({ facebookService: downloaderServices.facebookService }),
    threadsController: createThreadsController({ threadsService: downloaderServices.threadsService }),
    youtubeController: createYoutubeController({ youtubeService: downloaderServices.youtubeService }),
    youtube2Controller: createYoutube2Controller({ youtube2Service: downloaderServices.youtube2Service }),
    youtube3Controller: createYoutube3Controller({ youtube3Service: downloaderServices.youtube3Service }),
    twitterController: createTwitterController({ twitterService: downloaderServices.twitterService }),
    tiktokController: createTiktokController({ tiktokService: downloaderServices.tiktokService }),
    tiktok2Controller: createTiktok2Controller({ tiktok2Service: downloaderServices.tiktok2Service }),
    mediafireController: createMediafireController({ mediafireService: downloaderServices.mediafireService }),
    pinterestController: createPinterestController({ pinterestService: downloaderServices.pinterestService }),
  };

  // 4. Routers Wiring (Categorized)
  const haditsRouter = createHaditsRouter({ haditsController });
  const sholatRouter = createSholatRouter({ sholatController });
  const quranRouter = createQuranRouter({ quranController });
  const aksaraRouter = createAksaraRouter({ aksaraController });
  const khutbahRouter = createKhutbahRouter({ khutbahController });
  const nuDownloadRouter = createNuDownloadRouter({ nuDownloadController });
  const wiridRouter = createWiridRouter({ wiridController });
  const doaRouter = createDoaRouter({ doaController });
  const maulidRouter = createMaulidRouter({ maulidController });
  const tahlilRouter = createTahlilRouter({ tahlilController });
  const lirikRouter = createLirikRouter({ lirikController });
  const bmkgRouter = createBmkgRouter({ bmkgController });
  const animasuRouter = createAnimasuRouter({ animasuController });
  const anichinRouter = createAnichinRouter({ anichinController });
  const otakudesuRouter = createOtakudesuRouter(otakudesuController);
  const komikuRouter = createKomikuRouter({ komikuController });
  const checkHostRouter = createCheckHostRouter({ checkHostController });
  const tvRouter = createTvRouter({ tvController });
  const kciRouter = createKciRouter({ kciController });
  const enkaRouter = createEnkaRouter({ enkaController });
  const tempMailRouter = createTempMailRouter({ tempMailController });
  const uploadRouter = createUploadRouter({ uploadController });
  const statsRouter = createStatsRouter({ statsController });
  const pddiktiRouter = createPddiktiRouter({ pddiktiService });

  const downloaderRouters = {
    instagramRouter: createInstagramRouter({ instagramController: downloaderControllers.instagramController }),
    fbdlRouter: createFbdlRouter({ facebookController: downloaderControllers.facebookController }),
    threadsRouter: createThreadsRouter({ threadsController: downloaderControllers.threadsController }),
    ytdlRouter: createYtdlRouter({ youtubeController: downloaderControllers.youtubeController }),
    ytdl2Router: createYtdl2Router({ youtube2Controller: downloaderControllers.youtube2Controller }),
    ytdl3Router: createYtdl3Router({ youtube3Controller: downloaderControllers.youtube3Controller }),
    twitterRouter: createTwitterRouter({ twitterController: downloaderControllers.twitterController }),
    tiktokRouter: createTiktokRouter({ tiktokController: downloaderControllers.tiktokController }),
    tiktok2Router: createTiktok2Router({ tiktok2Controller: downloaderControllers.tiktok2Controller }),
    mediafireRouter: createMediafireRouter({ mediafireController: downloaderControllers.mediafireController }),
    pinterestRouter: createPinterestRouter({ pinterestController: downloaderControllers.pinterestController }),
  };

  return {
    db,
    httpClient,
    logger: appLogger,
    services: {
      hadits: haditsService,
      sholat: sholatService,
      quran: quranService,
      aksara: aksaraService,
      khutbah: khutbahService,
      nuDownload: nuDownloadService,
      wirid: wiridService,
      doa: doaService,
      maulid: maulidService,
      tahlil: tahlilService,
      lirik: lirikService,
      otakudesu: otakudesuService,
      tv: tvService,
      kci: kciService,
      enka: enkaService,
      tempMail: tempMailService,
      upload: uploadService,
      stats: statsService,
      pddikti: pddiktiService,
      downloader: downloaderServices,
    },
    controllers: {
      hadits: haditsController,
      sholat: sholatController,
      quran: quranController,
      aksara: aksaraController,
      khutbah: khutbahController,
      nuDownload: nuDownloadController,
      wirid: wiridController,
      doa: doaController,
      maulid: maulidController,
      tahlil: tahlilController,
      lirik: lirikController,
      otakudesu: otakudesuController,
      tv: tvController,
      kci: kciController,
      enka: enkaController,
      tempMail: tempMailController,
      upload: uploadController,
      stats: statsController,
      downloader: downloaderControllers,
    },
    routers: {
      hadits: haditsRouter,
      sholat: sholatRouter,
      quran: quranRouter,
      aksara: aksaraRouter,
      khutbah: khutbahRouter,
      nuDownload: nuDownloadRouter,
      wirid: wiridRouter,
      doa: doaRouter,
      maulid: maulidRouter,
      tahlil: tahlilRouter,
      lirik: lirikRouter,
      bmkg: bmkgRouter,
      animasu: animasuRouter,
      anichin: anichinRouter,
      otakudesu: otakudesuRouter,
      komiku: komikuRouter,
      checkhost: checkHostRouter,
      tv: tvRouter,
      kci: kciRouter,
      enka: enkaRouter,
      tempmail: tempMailRouter,
      upload: uploadRouter,
      stats: statsRouter,
      pddikti: pddiktiRouter,
      downloader: downloaderRouters,
    },
  };
}
