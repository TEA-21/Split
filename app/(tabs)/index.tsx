import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal, MapPin } from 'lucide-react-native';
import { theme } from '../../src/theme/tokens';
import { SplitLogo } from '../../src/components/brand/SplitLogo';
import { CardDeck } from '../../src/components/swipe/CardDeck';
import { LocationPickerModal } from '../../src/components/location/LocationPickerModal';
import { FilterModal } from '../../src/components/filters/FilterModal';
import { ReportUserModal } from '../../src/components/safety/ReportUserModal';
import { useAppStore } from '../../src/store/useAppStore';
import { RoommateProfile } from '../../src/types';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const {
    loadFeed,
    filters,
    setIsFilterModalVisible,
    setIsLocationModalVisible,
  } = useAppStore();

  const [reportingProfile, setReportingProfile] = useState<RoommateProfile | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={['top']}
    >
      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <SplitLogo size={24} isDark={isDark} />

        <View style={styles.headerControls}>
          {/* Location button */}
          <TouchableOpacity
            style={[
              styles.locationPill,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={() => setIsLocationModalVisible(true)}
            activeOpacity={0.7}
          >
            <MapPin size={13} color={currentTheme.accent} />
            <Text
              style={[styles.locationText, { color: currentTheme.textPrimary }]}
              numberOfLines={1}
            >
              {filters.referenceLocationName.split(',')[0]} • {filters.radiusMiles}mi
            </Text>
          </TouchableOpacity>

          {/* Filter button */}
          <TouchableOpacity
            style={[
              styles.filterIconButton,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={() => setIsFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={17} color={currentTheme.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tinder Deck */}
      <CardDeck onOpenReportModal={(profile) => setReportingProfile(profile)} />

      {/* Location Picker Dialog */}
      <LocationPickerModal />

      {/* Discovery Filters Dialog */}
      <FilterModal />

      {/* Safety Report / Block Modal */}
      <ReportUserModal
        targetProfile={reportingProfile}
        visible={reportingProfile !== null}
        onClose={() => setReportingProfile(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
    maxWidth: 130,
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
