export const theme = {
  light: {
    background: '#FBF9F5',      // Warm Oat / Linen
    surface: '#F2EDE4',         // Elevated warm paper
    surfaceSubtle: '#EBE4D8',   // Card background alt
    border: 'rgba(38, 34, 31, 0.08)', // Quiet hairline border
    borderStrong: 'rgba(38, 34, 31, 0.16)',
    textPrimary: '#26221F',     // Deep ink espresso
    textSecondary: '#59524C',   // Roasted bean
    textMuted: '#8C827A',       // Warm stone
    accent: '#C25E36',          // Muted Terracotta
    accentMuted: '#EEDCD4',     // Terracotta tint for pills
    like: '#2E7D5B',            // Subdued sage
    likeBg: 'rgba(46, 125, 91, 0.1)',
    pass: '#A8443B',            // Muted brick
    passBg: 'rgba(168, 68, 59, 0.1)',
    rewind: '#59524C',          // Roasted bean neutral
    superlike: '#C25E36',       // Terracotta highlight
    superlikeBg: 'rgba(194, 94, 54, 0.1)',
    verified: '#2E7D5B',        // Subdued sage
    cardShadow: 'rgba(38, 34, 31, 0.06)',
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
export type AppTheme = typeof theme.light;
