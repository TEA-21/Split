import { useColorScheme } from 'react-native';
import { theme, AppTheme } from './tokens';
import { useAppStore, ThemePreference } from '../store/useAppStore';

export interface UseAppThemeResult {
  isDark: boolean;
  currentTheme: AppTheme;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

export function useAppTheme(): UseAppThemeResult {
  const systemScheme = useColorScheme();
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);

  const isDark =
    themePreference === 'system'
      ? systemScheme === 'dark'
      : themePreference === 'dark';

  const currentTheme = isDark ? theme.dark : theme.light;

  return {
    isDark,
    currentTheme,
    themePreference,
    setThemePreference,
  };
}
