import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // default IrengCloud dark
};

/**
 * UI global: filter kategori, bahasa SDK, menu mobile, toast, dark/light theme.
 */
export const useUIStore = create((set, get) => ({
  activeCategory: 'all',
  sdkLang: 'curl',
  mobileMenuOpen: false,
  toast: null,
  theme: getInitialTheme(),

  setCategory: (key) => set({ activeCategory: key }),
  setSdkLang: (key) => set({ sdkLang: key }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    if (typeof document !== 'undefined') {
      if (next === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
    set({ theme: next });
  },

  showToast: (msg) => {
    if (get().toast === msg) return; // guard double-fire
    set({ toast: msg });
    setTimeout(() => {
      if (get().toast === msg) set({ toast: null });
    }, 2800);
  },
}));
