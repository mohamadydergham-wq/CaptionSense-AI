import { createLogger } from '@/shared/logger';

const logger = createLogger('ThemeHook');

export type Theme = 'light' | 'dark' | 'auto';

export interface UseThemeReturn {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme(theme: Theme): void;
  toggleTheme(): void;
}

export function useTheme(): UseThemeReturn {
  let theme: Theme = 'auto';

  // Load initial theme
  chrome.storage.sync.get('theme', (result) => {
    if (result.theme) {
      theme = result.theme;
    }
  });

  function getEffectiveTheme(): 'light' | 'dark' {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme as 'light' | 'dark';
  }

  function setTheme(newTheme: Theme): void {
    theme = newTheme;
    chrome.storage.sync.set({ theme });
    applyTheme(getEffectiveTheme());
    logger.info(`Theme changed to: ${newTheme}`);
  }

  function toggleTheme(): void {
    const currentEffective = getEffectiveTheme();
    setTheme(currentEffective === 'dark' ? 'light' : 'dark');
  }

  function applyTheme(effectiveTheme: 'light' | 'dark'): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);
    if (effectiveTheme === 'dark') {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
  }

  // Apply initial theme
  applyTheme(getEffectiveTheme());

  return {
    theme,
    effectiveTheme: getEffectiveTheme(),
    setTheme,
    toggleTheme,
  };
}
