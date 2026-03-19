import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { WorkspaceBranding } from '../api/api';

const THEME_KEY = 'gambit-workspace-theme';

export const defaultTheme: WorkspaceBranding = {
  brandName: 'Gambit LLC',
  brandTagline: 'Operate every branch with precision.',
  primaryColor: '#a3be8c',
  accentColor: '#81a1c1',
  surfaceColor: '#2e3440',
  loginTitle: 'Every branch. Every table. One gambit ahead.',
  loginMessage:
    'Gambit unifies POS, ERP, administration, and owner controls inside one branded workspace.',
  heroPattern: 'nordic',
};

type ThemeContextValue = {
  theme: WorkspaceBranding;
  setTheme: (theme: WorkspaceBranding) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function hexToChannels(color: string) {
  const normalized = color.replace('#', '');
  const value = normalized.length === 6 ? normalized : 'a3be8c';
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `${red} ${green} ${blue}`;
}

function loadTheme() {
  const raw = localStorage.getItem(THEME_KEY);
  if (!raw) {
    return defaultTheme;
  }

  try {
    return {
      ...defaultTheme,
      ...(JSON.parse(raw) as Partial<WorkspaceBranding>),
    };
  } catch {
    localStorage.removeItem(THEME_KEY);
    return defaultTheme;
  }
}

function applyTheme(theme: WorkspaceBranding) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', hexToChannels(theme.primaryColor));
  root.style.setProperty('--color-accent', hexToChannels(theme.accentColor));
  root.style.setProperty('--color-surface', hexToChannels(theme.surfaceColor));
  root.style.setProperty('--tenant-primary', theme.primaryColor);
  root.style.setProperty('--tenant-accent', theme.accentColor);
  root.style.setProperty('--tenant-surface', theme.surfaceColor);
  root.dataset.heroPattern = theme.heroPattern;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<WorkspaceBranding>(loadTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(themeUpdate) {
        setThemeState(themeUpdate);
      },
      resetTheme() {
        setThemeState(defaultTheme);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
