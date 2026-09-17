import { create } from 'zustand';
import { useCatalogStore } from './useCatalogStore';
import { defaultParamsFor } from '../lib/url';

/**
 * State endpoint aktif + params-nya.
 * Async-aware: selectedKey null sampai catalog ready (initSelection dipanggil
 * dari halaman saat status 'ready'). setParam → params → computedPath (pure).
 */
export const useEndpointStore = create((set, get) => ({
  selectedKey: null,
  params: {},

  /** Init dari deep-link / default pertama — panggil sekali saat catalog ready. */
  initSelection: (preferredKey = null) => {
    const { endpoints } = useCatalogStore.getState();
    if (!endpoints.length || get().selectedKey) return;
    const target = preferredKey && useCatalogStore.getState().getEndpoint(preferredKey)
      ? preferredKey
      : endpoints[0].key;
    set({ selectedKey: target, params: defaultParamsFor(useCatalogStore.getState().getEndpoint(target)) });
  },

  selectEndpoint: (key) => {
    const endpoint = useCatalogStore.getState().getEndpoint(key);
    if (!endpoint || key === get().selectedKey) return;
    set({ selectedKey: key, params: defaultParamsFor(endpoint) });
  },

  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),
}));
