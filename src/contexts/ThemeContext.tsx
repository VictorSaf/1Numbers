import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'twilight' | 'dawn' | 'midnight' | 'celestial' | 'custom';

export interface CustomTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface DisplaySettings {
  fontSize: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  animations: boolean;
  layout: 'compact' | 'comfortable' | 'spacious';
}

interface ThemeContextType {
  theme: ThemeName;
  customTheme: CustomTheme | null;
  displaySettings: DisplaySettings;
  setTheme: (theme: ThemeName) => void;
  setCustomTheme: (theme: CustomTheme | null) => void;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  saveThemePreference: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultDisplaySettings: DisplaySettings = {
  fontSize: 'medium',
  contrast: 'normal',
  animations: true,
  layout: 'comfortable',
};

const THEME_NAMES: ThemeName[] = ['twilight', 'dawn', 'midnight', 'celestial', 'custom'];

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
  // Read during the first render, not in an effect afterwards.
  //
  // The effect that used to do this ran after the first paint, so every load
  // showed the default theme for a frame and then swapped -- a visible flash on
  // every single page view for anyone whose theme was not 'twilight'.
  const [theme, setThemeState] = useState<ThemeName>(() =>
    read('theme', (raw) => (THEME_NAMES.includes(raw as ThemeName) ? (raw as ThemeName) : null), 'twilight'),
  );
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(() =>
    read<CustomTheme | null>('customTheme', (raw) => JSON.parse(raw) as CustomTheme, null),
  );
  const [displaySettings, setDisplaySettingsState] = useState<DisplaySettings>(() =>
    read('displaySettings', (raw) => ({ ...defaultDisplaySettings, ...JSON.parse(raw) }), defaultDisplaySettings),
  );

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-twilight', 'theme-dawn', 'theme-midnight', 'theme-celestial', 'theme-custom');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);

    // Apply custom theme if active
    if (theme === 'custom' && customTheme) {
      applyCustomTheme(customTheme);
    }
  }, [theme, customTheme]);

  // Apply display settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--font-size-multiplier', getFontSizeMultiplier(displaySettings.fontSize));
    
    // Contrast
    if (displaySettings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Animations
    if (!displaySettings.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Layout
    root.setAttribute('data-layout', displaySettings.layout);
  }, [displaySettings]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setCustomTheme = (theme: CustomTheme | null) => {
    setCustomThemeState(theme);
    if (theme) {
      localStorage.setItem('customTheme', JSON.stringify(theme));
      setThemeState('custom');
    } else {
      localStorage.removeItem('customTheme');
    }
  };

  const updateDisplaySettings = (settings: Partial<DisplaySettings>) => {
    setDisplaySettingsState(prev => ({ ...prev, ...settings }));
    localStorage.setItem('displaySettings', JSON.stringify({ ...displaySettings, ...settings }));
  };

  const saveThemePreference = () => {
    localStorage.setItem('theme', theme);
    if (customTheme) {
      localStorage.setItem('customTheme', JSON.stringify(customTheme));
    }
    localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        customTheme,
        displaySettings,
        setTheme,
        setCustomTheme,
        updateDisplaySettings,
        saveThemePreference,
      }}
    >
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

// Helper functions
const getFontSizeMultiplier = (size: DisplaySettings['fontSize']): string => {
  switch (size) {
    case 'small':
      return '0.875';
    case 'large':
      return '1.125';
    default:
      return '1';
  }
};

const applyCustomTheme = (theme: CustomTheme) => {
  const root = document.documentElement;
  
  // Parse HSL values from theme
  const parseHSL = (hsl: string) => {
    // Expected format: "hue saturation% lightness%"
    const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (match) {
      return `${match[1]} ${match[2]}% ${match[3]}%`;
    }
    return hsl;
  };

  root.style.setProperty('--primary', parseHSL(theme.primary));
  root.style.setProperty('--secondary', parseHSL(theme.secondary));
  root.style.setProperty('--accent', parseHSL(theme.accent));
  root.style.setProperty('--background', parseHSL(theme.background));
  root.style.setProperty('--foreground', parseHSL(theme.foreground));
};

