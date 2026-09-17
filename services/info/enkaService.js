import defaultLogger from '../../utils/logger.js';

export function createEnkaService({ httpClient, logger = defaultLogger } = {}) {
  const BASE_URL = 'https://enka.network/api';
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  return {
    async getProfile(uid) {
      if (!uid) throw new Error('Parameter "uid" Genshin Impact / Honkai Star Rail / ZZZ wajib diisi');
      const cleanUid = String(uid).trim();
      logger.info(`Fetching Enka Network profile for UID ${cleanUid}`, 'ENKA');

      try {
        const res = await httpClient.get(`${BASE_URL}/uid/${cleanUid}`, {
          headers: { 'User-Agent': USER_AGENT },
        });

        const data = res.data;
        const playerInfo = data?.playerInfo || {};

        // Helper icon URL resolver
        const getIconUrl = (iconName) => (iconName ? `https://enka.network/ui/${iconName}.png` : null);

        const avatarDetailList = (data?.avatarInfoList || []).map((av) => {
          const equipList = (av.equipList || []).map((eq) => {
            const flat = eq.flat || {};
            return {
              ...eq,
              flat: {
                ...flat,
                icon_url: getIconUrl(flat.icon),
              },
            };
          });

          return {
            ...av,
            equipList,
          };
        });

        return {
          uid: cleanUid,
          nickname: playerInfo.nickname || '',
          level: playerInfo.level || 0,
          signature: playerInfo.signature || '',
          worldLevel: playerInfo.worldLevel || 0,
          nameCardId: playerInfo.nameCardId || 0,
          finishAchievementNum: playerInfo.finishAchievementNum || 0,
          towerFloorIndex: playerInfo.towerFloorIndex || 0,
          towerLevelIndex: playerInfo.towerLevelIndex || 0,
          showAvatarInfoList: (playerInfo.showAvatarInfoList || []).map((item) => ({
            ...item,
            icon_url: getIconUrl(item.icon),
          })),
          showNameCardIdList: playerInfo.showNameCardIdList || [],
          profilePicture: {
            ...playerInfo.profilePicture,
            avatar_icon_url: getIconUrl(playerInfo.profilePicture?.avatarId ? `UI_AvatarIcon_${playerInfo.profilePicture.avatarId}` : null),
          },
          avatarDetailList,
          ttl: data?.ttl || 0,
        };
      } catch (err) {
        if (err.response && err.response.status === 404) {
          throw new Error(`UID "${cleanUid}" tidak ditemukan di Enka Network atau showcase disembunyikan.`);
        }
        if (err.response && err.response.status === 424) {
          throw new Error('Game maintenance atau server Enka sedang tidak merespon.');
        }
        throw err;
      }
    },
  };
}
