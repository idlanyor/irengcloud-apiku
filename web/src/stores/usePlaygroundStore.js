import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { computedPath } from '../lib/url';
import { useCatalogStore } from './useCatalogStore';

/**
 * Status eksekusi playground. execute() fetch relative via store
 * sehingga URL bar, SDK, dan ResponsePanel sinkron dari satu sumber.
 * AbortController guard: request baru membatalkan request lama.
 */
export const usePlaygroundStore = create((set, get) => ({
  status: 'idle',
  httpStatus: null,
  latencyMs: null,
  response: null,
  errorMsg: null,

  execute: async (endpointKey, params) => {
    const controller = new AbortController();
    set({
      controller,
      status: 'pending',
      httpStatus: null,
      latencyMs: null,
      errorMsg: null,
    });

    const endpoint = useCatalogStore.getState().getEndpoint(endpointKey);
    if (!endpoint) return set({ status: 'error', httpStatus: 'ERR', errorMsg: 'Endpoint tidak ditemukan.' });
    const relativeUrl = computedPath(endpoint.path, params);
    const start = performance.now();

    try {
      const { res, data } = await apiRequest(relativeUrl, { signal: controller.signal });
      const latencyMs = Math.round(performance.now() - start);
      set({
        status: res.ok ? 'success' : 'error',
        httpStatus: `${res.status} ${res.statusText || 'OK'}`,
        latencyMs,
        response: data,
        errorMsg: res.ok ? null : `Request gagal (HTTP ${res.status})`,
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      set({
        status: 'error',
        httpStatus: 'ERR',
        latencyMs: null,
        errorMsg: err.message,
      });
    }
  },
}));
