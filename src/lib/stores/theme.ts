import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'quick-notes-theme';

function getSystemTheme(): 'dark' | 'light' {
  if (!browser) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return getSystemTheme();
  }

  return mode;
}

const initialMode: ThemeMode = browser
  ? ((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'system')
  : 'system';

export const themeMode = writable<ThemeMode>(initialMode);

if (browser) {
  const updateDocumentTheme = (mode: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', resolveTheme(mode));
  };

  updateDocumentTheme(initialMode);

  themeMode.subscribe((mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    updateDocumentTheme(mode);
  });

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemThemeChange = () => {
    if (themeModeState === 'system') {
      updateDocumentTheme('system');
    }
  };

  let themeModeState = initialMode;
  themeMode.subscribe((mode) => {
    themeModeState = mode;
  });

  mediaQuery.addEventListener('change', onSystemThemeChange);
}
