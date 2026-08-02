import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

export const APP_VERSION = pkg.version;
export const API_PREFIX = '/api/v1';

export const SEMVER_INFO = {
  version: APP_VERSION,
  major: APP_VERSION.split('.')[0],
  minor: APP_VERSION.split('.')[1],
  patch: APP_VERSION.split('.')[2],
};
