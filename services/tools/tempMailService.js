import defaultLogger from '../../utils/logger.js';
import crypto from 'crypto';

export function createTempMailService({ httpClient, logger = defaultLogger } = {}) {
  const BASE_URL = 'https://api.mail.tm';
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async function getFirstDomain() {
    const res = await httpClient.get(`${BASE_URL}/domains`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    const domains = res.data?.['hydra:member'] || [];
    if (domains.length === 0) {
      throw new Error('Tidak ada domain temp mail yang aktif.');
    }
    return domains[0].domain;
  }

  async function createAccount(address, password) {
    const res = await httpClient.post(
      `${BASE_URL}/accounts`,
      { address, password },
      { headers: { 'User-Agent': USER_AGENT } }
    );
    return res.data;
  }

  async function getToken(address, password) {
    const res = await httpClient.post(
      `${BASE_URL}/token`,
      { address, password },
      { headers: { 'User-Agent': USER_AGENT } }
    );
    return res.data?.token;
  }

  return {
    async createEmail() {
      logger.info('Creating new TempMail account', 'TEMPMAIL');
      const domain = await getFirstDomain();
      const randomName = crypto.randomBytes(4).toString('hex');
      const address = `kanata_${randomName}@${domain}`;
      const password = `pass_${randomName}`;

      await createAccount(address, password);

      return {
        email: address,
        password: password,
      };
    },

    async getMessages(email, password) {
      if (!email || !password) throw new Error('Email dan password tempmail wajib diisi.');
      logger.info(`Fetching TempMail messages for ${email}`, 'TEMPMAIL');
      const token = await getToken(email, password);

      const res = await httpClient.get(`${BASE_URL}/messages`, {
        headers: {
          'User-Agent': USER_AGENT,
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data?.['hydra:member'] || [];
    },

    async readMessage(email, password, messageId) {
      if (!email || !password || !messageId) throw new Error('Email, password, dan messageId wajib diisi.');
      logger.info(`Reading TempMail message ${messageId}`, 'TEMPMAIL');
      const token = await getToken(email, password);

      const res = await httpClient.get(`${BASE_URL}/messages/${messageId}`, {
        headers: {
          'User-Agent': USER_AGENT,
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    },
  };
}
