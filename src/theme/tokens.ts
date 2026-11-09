export const theme = {
  light: {
    background: '#E8E4DC',      // Dimmed warm matte canvas, zero white glare
    surface: '#F0ECE4',         // Soft archival warm paper card (no harsh #FFFFFF)
    surfaceSubtle: '#DDD8CE',   // Muted stone pill & input surface
    border: 'rgba(38, 34, 31, 0.11)', // Defined soft hairline border
    borderStrong: 'rgba(38, 34, 31, 0.20)',
    textPrimary: '#28231F',     // Deep ink espresso
    textSecondary: '#5C544C',   // Roasted bean
    textMuted: '#8A7E74',       // Warm stone
    accent: '#C25E36',          // Muted Terracotta
    accentMuted: '#EAD6CC',     // Muted terracotta tint for pills
    like: '#2E7D5B',            // Subdued sage
    likeBg: 'rgba(46, 125, 91, 0.12)',
    pass: '#A8443B',            // Muted brick
    passBg: 'rgba(168, 68, 59, 0.12)',
    rewind: '#5C544C',          // Roasted bean neutral
    superlike: '#C25E36',       // Terracotta highlight
    superlikeBg: 'rgba(194, 94, 54, 0.12)',
    verified: '#2E7D5B',        // Subdued sage
    cardShadow: 'rgba(38, 34, 31, 0.08)',
  },
  dark: {
    background: '#191614',      // Deep Roasted Espresso
    surface: '#231F1C',         // Dark stone surface
    surfaceSubtle: '#2E2925',   // Elevated card surface
    border: 'rgba(244, 240, 235, 0.08)', // Quiet light hairline
    borderStrong: 'rgba(244, 240, 235, 0.16)',
    textPrimary: '#F4F0EB',     // Bone white
    textSecondary: '#A39B92',   // Warm gray
    textMuted: '#6B635B',       // Muted slate
    accent: '#C25E36',          // Muted Terracotta
    accentMuted: '#38251E',     // Deep terracotta background
    like: '#3B9E74',            // Deep sage
    likeBg: 'rgba(59, 158, 116, 0.15)',
    pass: '#C25247',            // Muted brick
    passBg: 'rgba(194, 82, 71, 0.15)',
    rewind: '#A39B92',          // Neutral warm gray
    superlike: '#C25E36',       // Terracotta highlight
    superlikeBg: 'rgba(194, 94, 54, 0.2)',
    verified: '#3B9E74',        // Deep sage
    cardShadow: 'rgba(0, 0, 0, 0.25)',
  },
  typography: {
    fontHeading: 'PlusJakartaSans_600SemiBold',
    fontHeadingBold: 'PlusJakartaSans_700Bold',
    fontBody: 'Inter_400Regular',
    fontBodyMedium: 'Inter_500Medium',
    fontMono: 'monospace',
  },
  radii: {
    control: 8,
    card: 16,
    sheet: 24,
    pill: 9999,
  }
} as const;

export type ThemeMode = 'light' | 'dark';
export type AppTheme = typeof theme.light | typeof theme.dark;

