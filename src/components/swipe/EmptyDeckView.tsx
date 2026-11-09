import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SlidersHorizontal, MapPin, RefreshCw } from 'lucide-react-native';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';
import { SplitLogo } from '../brand/SplitLogo';

interface EmptyDeckViewProps {
  onExpandRadius: () => void;
  onOpenFilters: () => void;
  onRefresh: () => void;
}

export const EmptyDeckView: React.FC<EmptyDeckViewProps> = ({
  onExpandRadius,
  onOpenFilters,
  onRefresh,
}) => {
  const { isDark, currentTheme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
      <View style={styles.iconContainer}>
        <SplitLogo size={36} showWordmark={false} isDark={isDark} />
      </View>

      <Text style={[styles.title, { color: currentTheme.textPrimary }]}>
        You're All Caught Up
      </Text>

      <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
        No more potential roommates found in this vicinity with your active filters. Try expanding your search radius or adjusting criteria.
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: currentTheme.accent }]}
          onPress={onExpandRadius}
          activeOpacity={0.8}
        >
          <MapPin size={16} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.primaryButtonText}>Expand Search to 50 Miles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: currentTheme.surfaceSubtle, borderColor: currentTheme.border },
          ]}
          onPress={onOpenFilters}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={16} color={currentTheme.textPrimary} strokeWidth={2} />
          <Text style={[styles.secondaryButtonText, { color: currentTheme.textPrimary }]}>
            Adjust Filter Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <RefreshCw size={14} color={currentTheme.textMuted} strokeWidth={2} />
          <Text style={[styles.refreshText, { color: currentTheme.textMuted }]}>
            Refresh Feed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontBody,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actions: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.radii.control,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 13,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
  },
});

