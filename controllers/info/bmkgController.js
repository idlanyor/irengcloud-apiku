export function createBmkgController({ bmkgService, wilayahResolver }) {
  return {
    async handleGetEarthquake(req, res, next) {
      try {
        const data = await bmkgService.getEarthquake();
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil data gempa BMKG',
        });
      }
    },

    async handleGetFeltEarthquake(req, res, next) {
      try {
        const data = await bmkgService.getFeltEarthquake();
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil data gempa dirasakan BMKG',
        });
      }
    },

    async handleGetWeather(req, res, next) {
      try {
        const { adm4: adm4q, kode, desa } = req.query;
        const adm4 = adm4q || kode || req.params.adm4 || null;

        // Mode 1: nama lokasi "desa,kecamatan,kota,provinsi" → resolve adm4 via wilayah.id
        if (desa) {
          const resolved = await wilayahResolver.resolveAdm4(desa);
          if (!resolved) {
            return res.status(404).json({
              success: false,
              error: `Lokasi "${desa}" tidak ditemukan. Format: desa,kecamatan,kota,provinsi — contoh: Purbasari,Karangjambu,Purbalingga,Jawa Tengah (desa & kecamatan wajib)`,
            });
          }
          const data = await bmkgService.getWeatherByDesa(resolved.adm4);
          return res.json({ success: true, lokasi: resolved.lokasi, adm4: resolved.adm4, data });
        }

        // Mode 2: kode adm4 langsung (default 31.71.01.1001)
        const target = adm4 || '31.71.01.1001';
        // BMKG butuh kode desa/kelurahan 10 digit (xx.xx.xx.xxxx).
        if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(target)) {
          return res.status(400).json({
            success: false,
            error: 'Kode adm4 tidak valid. Gunakan kode desa/kelurahan 10 digit (contoh: 31.71.01.1001) atau pakai param desa=desa,kecamatan,kota,provinsi',
          });
        }
        const data = await bmkgService.getWeatherByDesa(target);
        return res.json({ success: true, adm4: target, data });
      } catch (err) {
        const status = err.response?.status === 404 ? 404 : 500;
        const message =
          status === 404
            ? `Kode adm4 tidak ditemukan di BMKG. Pakai param desa=desa,kecamatan,kota,provinsi (contoh: desa=Purbasari,Karangjambu,Purbalingga,Jawa Tengah)`
            : err.message || 'Gagal mengambil data cuaca BMKG';
        return res.status(status).json({ success: false, error: message });
      }
    },
  };
}
