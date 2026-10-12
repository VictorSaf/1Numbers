import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Light, dark, or whatever the system says.
 *
 * There used to be four named themes and a fifth "custom" one. Three of the
 * four -- twilight, midnight, celestial -- were byte-identical across all
 * thirty-seven palette tokens and differed only in --accent and --accent-ink;
 * twilight was itself a verbatim copy of the dark block, dawn of the light one.
 * Four names for two palettes and a hue dial.
 *
 * The dial is gone with them. An accent that changes per theme is a logo that
 * changes per page, and the numbers this product is about are easier to read
 * against one identity than four.
 *
 * Gone with them too: customTheme, setCustomTheme and saveThemePreference, none
 * of which had a single caller anywhere in the application; and the display
 * settings, whose only screen had no importer -- see the note on Settings in
 * docs/remediere-2026-08-note.md.
 */
export type ThemeName = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_NAMES: ThemeName[] = ['light', 'dark', 'system'];

/** localStorage throws in some privacy modes, so every read is guarded. */
function read<T>(key: string, parse: (raw: string) => T | null, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return parse(raw) ?? fallback;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return fallback;
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Read during the first render, not in an effect afterwards. The effect that
  // used to do this ran after the first paint, so every load showed the default
  // for a frame and then swapped -- a visible flash on every page view.
  const [theme, setThemeState] = useState<ThemeName>(() =>
    read('theme', (raw) => (THEME_NAMES.includes(raw as ThemeName) ? (raw as ThemeName) : null), 'system'),
  );

  useEffect(() => {
    const root = document.documentElement;
    // 'system' means: say nothing, and let the prefers-color-scheme block in
    // index.css answer. The attribute is what the two explicit choices set.
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (next: ThemeName) => {
    setThemeState(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // A choice that cannot be stored still applies to this session.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
